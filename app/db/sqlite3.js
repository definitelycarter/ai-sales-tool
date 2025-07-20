import sqlite3 from "sqlite3";
import path from "path";

export const client = new sqlite3.Database(
    path.resolve(".db/sqlite.db"),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) throw e;
    },
);
