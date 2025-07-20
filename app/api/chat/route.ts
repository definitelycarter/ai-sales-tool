// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import * as accounts from "../../../app/db/accounts.js";
import { getContactsByAccountId } from "../../../app/db/contacts.js";
import * as private_notes from "../../../app/db/private_notes.js";
import addPrivateNoteDefinition from "../../../functions/add_private_note.json" with { type: "json" };
import getAccountsByStatusDefnition from "../../../functions/find_accounts.json" with { type: "json" };
import getContactsByAccountIdDefinition from "../../../functions/find_contacts_by_account_id.json" with { type: "json" };
import findPrivateNotesDefinition from "../../../functions/find_private_notes.json" with { type: "json" };
import rejectAccountDefinition from "../../../functions/reject_account.json" with { type: "json" };
import snoozeAccountDefinition from "../../../functions/snooze_account.json" with { type: "json" };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const tools = [
    addPrivateNoteDefinition,
    rejectAccountDefinition,
    snoozeAccountDefinition,
    getAccountsByStatusDefnition,
    getContactsByAccountIdDefinition,
    findPrivateNotesDefinition,
];

const systemPrompt = {
    role: "system",
    content: `
    In this conversation, the term 'account' refers to a business client we work with — not a user login or financial account.
    - Your A superhero who is highly motivated to help the sales team sell accounts.
    - You can use rejected reason, snoozed reason or any private notes to help craft an email.
    - My name is Adam Carter and my role is Lead Sales Associate
    - Whenever you snooze or reject an account also add that reason as a private note.
    - My company name is Algoworks
    - Anytime you reference an account name form it into a link pointing to http://localhost:3000/account/:id (no hash) and make the name bold where the id is the account id
    - Anytime you craft a message for an email or introduction, you must reference the private notes by the account ID.
  `,
};

export async function POST(req) {
    const { messages } = await req.json();
    const conversation = [systemPrompt, ...messages];

    let isProcessing = true;
    let response;

    while (isProcessing) {
        response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: conversation,
            tools: tools.map((fn) => ({ type: "function", function: fn })),
        });

        const choice = response.choices[0];

        if (choice.finish_reason === "tool_calls") {
            const toolCalls = choice.message.tool_calls ?? [];
            conversation.push({
                role: "assistant",
                content: choice.message.content || null,
                tool_calls: toolCalls,
            });

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
                        console.log(args, output);
                        break;
                    default:
                        output = `Tool ${name} not implemented`;
                }

                conversation.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content:
                        typeof output === "string"
                            ? output
                            : JSON.stringify(output),
                });
            }
        } else {
            isProcessing = false;
            conversation.push(choice.message);
            return NextResponse.json(choice.message);
        }
    }
}

async function findAccounts({
    status,
    product_classification,
    product_recommendation,
}) {
    let items = await accounts.getAccounts();
    if (status)
        items = items.filter((i) => i.next_best_action_status === status);
    if (product_classification)
        items = items.filter(
            (i) => i.product_classification === product_classification,
        );
    if (product_recommendation) {
        items = items.filter(
            (i) =>
                i.product_recommendation1 === product_recommendation ||
                i.product_recommendation2 === product_recommendation,
        );
    }
    return items.map(mapAccountDocument).join("\n");
}

async function findPrivateNotes({ id }) {
    const items = await private_notes.findPrivateNotes({ id });
    return items.map((note) => `Note Content: ${note.content}`).join("\n");
}

async function findContactsByAccountId({ id }) {
    const contacts = await getContactsByAccountId(id);
    return contacts
        .map(
            (c) =>
                `Contact name ${c.contact_name} with phone ${c.phone_number} and email ${c.email}.`,
        )
        .join("\n");
}

async function addPrivateNote({ id, content }) {
    await private_notes.addPrivateNoteToAccount({ id, content });
    return { success: true };
}

async function snoozeAccount({ reason, snooze_until, id }) {
    await accounts.snoozeAccountById({ reason, snooze_until, id });
    await private_notes.addPrivateNoteToAccount({
        id,
        content: `Snoozed: ${reason}`,
    });
    return { success: true };
}

async function rejectAccount({ reason, id }) {
    await accounts.rejectAccountById({ reason, id });
    await private_notes.addPrivateNoteToAccount({
        id,
        content: `Rejected: ${reason}`,
    });
    return { success: true };
}

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
    const triggers = account.triggers
        .split(",")
        .map((t) => `- ${getTriggerDescriptionFromTriggerName(t)}`)
        .join("\n");

    return `Account with id ${account.id} and name ${account.account_name} has a value priority of ${account.product_classification}.
This has a status of ${account.next_best_action_status} with reason ${getStatusReason(account)}.
This account was created on ${account.next_best_action_created_at}
First Product Recommendation is ${account.product_recommendation1}
Second Product Recommendation is ${account.product_recommendation2}
The triggers that caused these product recommendations are:\n${triggers}`;
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
        default:
            return `Unknown trigger: ${trigger}`;
    }
}
