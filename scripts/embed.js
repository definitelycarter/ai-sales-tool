import { ChromaClient } from "chromadb";
import { embedder } from "../app/openai/embed.js";
import { getAccounts } from "../app/db/accounts.js";

(async () => {
    const client = new ChromaClient({ path: "http://localhost:8000" });

    const collection = await client.getCollection({
        name: "accounts",
        embeddingFunction: embedder,
    });

    const items = await getAccounts();

    const ids = [];
    const docs = [];
    const metadatas = [];

    items.forEach(async (account) => {
        ids.push(String(account.id));
        const doc = mapAccountDocument(account);
        docs.push(doc);
        metadatas.push({
          status: account.next_best_action_status,
          product_classification: account.product_classification,
          product_recommendation1: account.product_recommendation1,
          product_recommendation2: account.product_recommendation2,
          triggers: account.triggers,
        })
    });

    // const docs = items.map(mapAccountDocument);

    // console.log(docs);

    // const docs = ["pears are great"];

    const embeddings = await embedder.generate(docs);

    console.log(metadatas);

    await collection.add({
        ids,
        documents: docs,
        embeddings: embeddings,
        metadatas,
    });

    // const results = await collection.query({
    //     queryTexts: ["tech"],
    //     nResults: 2,
    // });

    // console.log(results);
})();

function mapAccountDocument(account) {
    const value = `
      Account with id ${account.id} and name ${account.account_name} has a value priority of ${account.product_classification} and has a status of ${account.next_best_action_status}.

      This account was created on ${account.next_best_action_created_at}

      First Product Recommendation is ${account.product_recommendation1}
      Second Product Recommendation is ${account.product_recommendation2}

      The triggers that caused these product recommendations are:
      ${account.triggers.split(",").map((trigger) => `- ${getTriggerDescriptionFromTriggerName(trigger)}\n`)}
  `;

    return value;
}

function getTriggerDescriptionFromTriggerName(trigger) {
    switch (trigger) {
        case "eeCountActiveW2Hire30Days":
            return "New W2 employees added within 30 days.";
        case "eeCountTermedW2Hire30Days":
            return "New W2 employees terminated within 30 days.";
        case "garnishedEECount30Days":
            return "Employee had garnishment within 30 days";
        case "hasSpecialPayroll7Days":
            return "Special payroll changed within the last 7 days";
        case "payrollContactUpdated7Days":
            return "New contact added recently";
    }
}
