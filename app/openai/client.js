import { OpenAI } from "openai";
import getAccountsByStatus from "../../functions/get_accounts_by_status.json";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function ask(messages) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        functions: [getAccountsByStatus],
        function_call: "auto", // OpenAI decides when to call
    });
}
