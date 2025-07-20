import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import { OpenAI } from "openai";
import * as accounts from "../app/db/accounts.js";
import { getContactsByAccountId } from "../app/db/contacts.js";
import * as private_notes from "../app/db/private_notes.js";
import addPrivateNoteDefinition from "../functions/add_private_note.json" with { type: "json" };
import getAccountsByStatusDefnition from "../functions/find_accounts.json" with { type: "json" };
import getContactsByAccountIdDefinition from "../functions/find_contacts_by_account_id.json" with { type: "json" };
import findPrivateNotesDefinition from "../functions/find_private_notes.json" with { type: "json" };
import rejectAccountDefinition from "../functions/reject_account.json" with { type: "json" };
import snoozeAccountDefinition from "../functions/snooze_account.json" with { type: "json" };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define the tools remaining the same
const functions = [
    addPrivateNoteDefinition,
    rejectAccountDefinition,
    snoozeAccountDefinition,
    getAccountsByStatusDefnition,
    getContactsByAccountIdDefinition,
    findPrivateNotesDefinition,
];

const tools = functions.map((func) => {
    return {
        type: "function",
        function: func,
    };
});

async function findAccounts({
    status,
    product_classification,
    product_recommendation,
}) {
    let items = await accounts.getAccounts();

    if (status) {
        items = items.filter((i) => i.next_best_action_status === status);
    }

    if (product_classification)
        items = items.filter(
            (i) => i.product_classification === product_classification,
        );

    if (product_recommendation)
        items = items.filter(
            (i) =>
                i.product_recommendation1 === product_recommendation ||
                i.product_recommendation2 === product_recommendation,
        );

    return items.map(mapAccountDocument).join("\n");
}

async function findPrivateNotes({ id }) {
    const items = await private_notes.findPrivateNotes({ id });
    return items.map((note) => `Note Content: ${note.content}`);
}

async function findContactsByAccountId({ id }) {
    const contacts = await getContactsByAccountId(id);
    return contacts.map(
        (contact) => `
      Contact name ${contact.contact_name} with phone ${contact.phone_number} and email ${contact.email}.
    `,
    );
}

async function addPrivateNote({ id, content }) {
    await private_notes.addPrivateNoteToAccount({ id, content });
    return { sucess: true };
}

async function snoozeAccount({ reason, snooze_until, id }) {
    await accounts.snoozeAccountById({ reason, snooze_until, id });
    return { success: true };
}

async function rejectAccount({ reason, id }) {
    await accounts.rejectAccountById({ reason, id });
    return { success: true };
}

const rl = readline.createInterface({ input, output, prompt: "> You: " });
let conversation = [
    {
        role: "system",
        content: `
          In this conversation, the term 'account' refers to a business client we work with — not a user login or financial account. It is safe to discuss them.
          - Your name is Zone Man: A superhero who is highly motivated to help the sales team sell accounts.
          - you can use rejected reason, snoozed reason or any private notes to help craft an email.
          - My name is Adam Carter
          - Whenever you snooze or reject an account also add that reason as a private note.
          - My company name is ADP (Automatic Data Processing)
  `,
    },
];

console.log("Responses API Chat (type exit to quit)");
rl.prompt();

rl.on("line", async (line) => {
    const inputText = line.trim();
    if (inputText.toLowerCase() === "exit") {
        rl.close();
        return;
    }

    conversation.push({ role: "user", content: inputText });

    let isProcessing = true;
    while (isProcessing) {
        const resp = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: conversation,
            tools: tools,
        });

        const choice = resp.choices[0];

        // Check for tool_calls
        if (choice.finish_reason === "tool_calls") {
            const toolCalls = choice.message.tool_calls ?? [];

            // Add the assistant message that includes the tool_calls
            conversation.push({
                role: "assistant",
                content: choice.message.content || null,
                tool_calls: toolCalls,
            });

            // Now handle each tool call and append the corresponding tool responses
            for (const toolCall of toolCalls) {
                const { name, arguments: argsRaw } = toolCall.function;
                const args = JSON.parse(argsRaw);
                let output;

                switch (name) {
                    case "find_accounts":
                        output = await findAccounts(args);
                        break;
                    case "find_contacts_by_account_id":
                        output = await findContactsByAccountId(args);
                        break;
                    case "reject_account":
                        output = await rejectAccount(args);
                        break;
                    case "snooze_account":
                        output = await snoozeAccount(args);
                        break;
                    case "add_private_note":
                        output = await addPrivateNote(args);
                        break;
                    case "find_private_notes":
                        output = await findPrivateNotes(args);
                        break;
                    default:
                        output = `Tool ${name} not implemented`;
                }

                // ✅ Correctly add the tool response *after* assistant's tool_calls
                conversation.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content:
                        typeof output === "string"
                            ? output
                            : JSON.stringify(output),
                });
            }

            // Continue the loop to let the model respond to tool output
            isProcessing = true;
        } else {
            // No tools used, just regular assistant message
            conversation.push(choice.message);
            console.log(`> Assistant: ${choice.message.content}`);
            isProcessing = false;
        }
    }
    // while (isProcessing) {
    //     const resp = await openai.chat.completions.create({
    //         model: "gpt-4o",
    //         messages: conversation,
    //         tools: tools,
    //     });

    //     isProcessing = false;

    //     for (const choice of resp.choices) {
    //         if (choice.finish_reason === "tool_calls") {
    //             const toolCall = choice.message.tool_calls?.[0];
    //             if (!toolCall)
    //                 return Response.json({ error: "Missing tool call" });

    //             const { name, arguments: argsRaw } = toolCall.function;
    //             const args = JSON.parse(argsRaw);
    //             let output;
    //             switch (name) {
    //                 case "find_accounts":
    //                     output = await findAccounts(args);
    //                     break;
    //                 case "find_contacts_by_account_id":
    //                     output = await findContactsByAccountId(args);
    //                     break;
    //                 case "reject_account":
    //                     output = await rejectAccount(args);
    //                     break;
    //                 case "snooze_account":
    //                     output = await snoozeAccount(args);
    //                     break;
    //                 case "add_private_note":
    //                     output = await addPrivateNote(args);
    //                     break;
    //                 case "find_private_notes":
    //                     output = await findPrivateNotes(args);
    //                     break;
    //             }

    //             // 3. Append tool result to messages
    //             conversation.push({
    //                 role: "tool",
    //                 tool_call_id: toolCall.id,
    //                 content: output,
    //             });
    //             isProcessing = true;
    //         } else {
    //             conversation.push(choice.message);
    //             console.log(`> Assistant: ${choice.message.content}`);
    //         }
    //     }
    // }

    rl.prompt();
});

function getStatusReason(account) {
    switch (account.next_best_action_status) {
        case "active":
            return "";
        case "snoozed":
            return account.snoozed_reason;
        case "rejected":
            return account.rejected_reason;
    }
}

function mapAccountDocument(account) {
    const value = `
      Account with id ${account.id} and name ${account.account_name} has a value priority of ${account.product_classification}.

      This has a status of ${account.next_best_action_status} with reason ${getStatusReason(account)}.

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

// 06-01-25 mr torress stresses that he wants to speak next week.
// 06-15-25 mr torress is on the fence with decing whether H&B or TLM would be more preferrable.
// 06-30-25 mr torress does approve purdhasing H&B but needs final aproval from mr franklin.
// 06-30-25 client wants to go golfing next week.
