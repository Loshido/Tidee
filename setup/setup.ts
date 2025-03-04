import Surreal from "surrealdb";
import fs from "fs"

const URL = 'ws://localhost:8000';
const NS = 'tidee';
const DB = 'data';

const db = new Surreal();

await db.connect(URL, {
    auth: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root'
    }
});

await db.query(`
DEFINE NAMESPACE IF NOT EXISTS ${NS};
USE NS ${NS};

DEFINE DATABASE IF NOT EXISTS ${DB};
USE NS ${NS} DB ${DB};
`);

const request = fs.readFileSync('./setup/tidee.surql', {
    encoding: "utf-8"
})
await db.query(
`BEGIN TRANSACTION;`
+ request +
`COMMIT TRANSACTION;`);
