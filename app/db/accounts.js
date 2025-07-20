import { client } from "./sqlite3.js";

export function getAccounts() {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT
          a.*,
          COUNT(at.trigger) as "trigger_count",
          GROUP_CONCAT(at.trigger, ',') AS "triggers"
        FROM
          accounts a
        LEFT JOIN
          triggers at ON a.id = at.account_id
        GROUP BY
          a.id;
      `;

        client.all(query, (e, rows) => {
            if (e) return reject(e);
            return resolve(rows);
        });
    });
}

export function getAccountById({ id }) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT
          a.*,
          COUNT(at.trigger) as "trigger_count",
          GROUP_CONCAT(at.trigger, ',') AS "triggers"
        FROM
          accounts a
        LEFT JOIN
          triggers at ON a.id = at.account_id
        where a.id = ?
        GROUP BY
          a.id;
      `;

        client.all(query, [id], (e, rows) => {
            if (e) return reject(e);
            return resolve(rows);
        });
    });
}

export function rejectAccountById({ id, reason }) {
    return new Promise((resolve, reject) => {
        const query = `
        update accounts
        set next_best_action_status = 'rejected',
            rejected_on = DATE(),
            rejected_reason = ?
        where id = ?
      `;

        client.all(query, [reason, id], (e, rows) => {
            if (e) return reject(e);
            return resolve(rows);
        });
    });
}

export function snoozeAccountById({ id, reason }) {
    return new Promise((resolve, reject) => {
        const query = `
        update accounts
        set next_best_action_status = 'snoozed',
            snoozed_on = DATE(),
            snoozed_reason = ?
        where id = ?
      `;

        client.all(query, [reason, id], (e, rows) => {
            if (e) return reject(e);
            return resolve(rows);
        });
    });
}
