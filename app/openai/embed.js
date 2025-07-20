import { OpenAIEmbeddingFunction } from "@chroma-core/openai";

export const embedder = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-large",
});
