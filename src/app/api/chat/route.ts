import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const runtime = "edge";

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!, // <-- reads your .env.local
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: openai("gpt-5-nano"),
        messages,
    });

    return result.toTextStreamResponse();
}
