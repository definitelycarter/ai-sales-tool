import { client } from './sqlite3.js';

export function getContactsByAccountId(id) {
    return new Promise((resolve, reject) => {
        const query = `
          select * from contacts where account_id = ?
      `;

        client.all(query, [id], (e, rows) => {
            if (e) return reject(e);
            return resolve(rows);
        });
    });
}
