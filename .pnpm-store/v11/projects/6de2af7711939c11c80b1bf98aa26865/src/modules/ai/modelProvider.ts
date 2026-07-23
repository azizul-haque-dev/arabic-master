import { env } from "@/config/env.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// type
export type Provider = "openai" | "gemini" | "groq";

// create chat model

export function createChatModel(): { provider: Provider; model: any } {
  const forced = (env.PROVIDER || "").toLowerCase();
  const hasGemini = !!env.GOOGLE_API_KEY;
  //   const hasGroq = !!env.GROQ_API_KEY;
  const base = { temperature: 0 as const };
  if (forced === "gemini" || (!forced && hasGemini)) {
    return {
      provider: "gemini",
      model: new ChatGoogleGenerativeAI({
        ...base,
        model: env.AI_MODEL_NAME,
      }),
    };
  }
  //   if (forced === "groq" || (!forced && hasGroq)) {
  //     return {
  //       provider: "groq",
  //       model: new ChatGroq({
  //         ...base,
  //         model: env.GROQ_MODEL,
  //       }),
  //     };
  //   }
  return {
    provider: "gemini",
    model: new ChatGoogleGenerativeAI({
      ...base,
      model: env.AI_MODEL_NAME,
    }),
  };
}
