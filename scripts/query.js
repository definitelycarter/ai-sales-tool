import { ChromaClient } from "chromadb";
import { embedder } from "../app/openai/embed.js";

const client = new ChromaClient({ path: "http://localhost:8000" });

const collection = await client.getCollection({
    name: "accounts",
    embeddingFunction: embedder,
});

const results = await collection.query({
  ids: ['1']
});

console.log(results);
