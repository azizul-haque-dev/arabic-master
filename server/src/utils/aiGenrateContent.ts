import { env } from "@/config/env.js";
import { GoogleGenAI } from "@google/genai";
import { aiInstruction, aiResponseSchema } from "./ai.word.utils.js";
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
export const generateContent = async (input: string) => {
  const res = await ai.models.generateContent({
    model: `${env.AI_MODEL_NAME}`,
    contents: `Arabic word: ${input}`,
    config: {
      systemInstruction: aiInstruction(),
      responseMimeType: "application/json",
      responseSchema: aiResponseSchema,
    },
  });

  if (!res.text) {
    throw new Error("Gemini returned an empty response.");
  }
  return res.text;
};
