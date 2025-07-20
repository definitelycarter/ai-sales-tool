import React from "react";
import * as accounts from "../../db/accounts.js";
import * as contacts from "../../db/contacts.js";
import * as private_notes from "../../db/private_notes.js";
import { ChatBadge } from "../../components/chat/chat.js";
const AccountPage = async ({ params }) => {
    const { id } = await params;

    // Query the account information
    const [account] = await accounts.getAccountById({ id });
    // Query the contacts related to the account
    const account_contacts = await contacts.getContactsByAccountId(id);
    // Query the private notes related to the account
    const account_private_notes = await private_notes.findPrivateNotes({ id });

    const [f] = await accounts.getAccountById({ id });

    if (!account) {
        return <div>Account not found</div>;
    }

    function nbaStatusReason() {
        if (account.next_best_action_status === "snoozed") {
            return account.snoozed_reason;
        }
        if (account.next_best_action_status === "rejected") {
            return account.rejected_reason;
        }
        return "active";
    }

    return (
        <div className="p-8">
            <h1>Account Page for ID: {id}</h1>

            <div className="p-4 border rounded-md mb-4">
                <p>Account Name: {account.account_name}</p>
                <p>
                    Next Best Action Status: {account.next_best_action_status}
                </p>
                <p>Reason: {nbaStatusReason()}</p>
            </div>

            <div className="p-4 border rounded-md mb-4">
                <h2>Contacts</h2>
                <ul>
                    {account_contacts.map((contact) => (
                        <li key={contact.id}>
                            {contact.contact_name} - {contact.phone_number} (
                            {contact.email})
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-4 border rounded-md mb-4">
                <h2>Triggers</h2>
                <ul>
                    {account.triggers.split(",").map((trigger, i) => {
                        return <li key={i}>{trigger}</li>;
                    })}
                </ul>
            </div>

            <div className="p-4 border rounded-md mb-4">
                <h2>Private Notes</h2>
                <ul>
                    {account_private_notes.map((note) => (
                        <li key={note.id}>
                            {note.content} (Created at: {note.created_at})
                        </li>
                    ))}
                </ul>
            </div>
            <ChatBadge />
        </div>
    );
};

export default AccountPage;
