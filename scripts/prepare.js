import { ChromaClient } from "chromadb";
import { embedder } from "../app/openai/embed.js";

const client = new ChromaClient({ path: "http://localhost:8000" });

const collection = await client.createCollection({
    name: "accounts",
    embeddingFunction: embedder,
});
