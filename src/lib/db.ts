import { NoSerialize } from "@builder.io/qwik";
import Surreal from "surrealdb";

const URL = 'ws://cav:8000';
const NS = 'tidee';
const DB = 'data';

export type Connection = NoSerialize<Surreal>;

export default async (): Promise<Surreal> => {
    const db = new Surreal();

    try {
        await db.connect(URL, {
            namespace: NS,
            database: DB
        });
        return db;
    } catch (err) {
        console.error("Failed to connect to SurrealDB:", err instanceof Error 
            ? err.message 
            : String(err));
        await db.close();
        throw err;
    }
}