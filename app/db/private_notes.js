import { client } from "./sqlite3.js";

export function addPrivateNoteToAccount({ id, content }) {
    return new Promise((resolve, reject) => {
        const query = `
          insert into private_notes
            (account_id, created_at, content)
          values
            (?, DATE(), ?);
    `;

        client.all(query, [id, content], (e, rows) => {
            if (e) return reject(e);
            return resolve(rows);
        });
    });
}

export function findPrivateNotes({ id }) {
    return new Promise((resolve, reject) => {
        const query = `
          select * from private_notes where account_id = ?
      `;

        client.all(query, [id], (e, rows) => {
            if (e) return reject(e);
            return resolve(rows);
        });
    });
}
