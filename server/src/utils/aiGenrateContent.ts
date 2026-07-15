import { env } from "@/config/env.js";
import { GoogleGenAI } from "@google/genai";
import {
  aiInstruction,
  type AiResponse,
  aiResponseSchema,
} from "./ai.word.utils.js";
import { sleep } from "./utils.js";

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

export const generateContent = async (
  input: string,
  maxRetries: number = 5,
): Promise<AiResponse | undefined> => {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
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

      return JSON.parse(res.text) as AiResponse;
    } catch (error: any) {
      const statusCode = error?.status || error?.statusCode;
      const errorMessage = error?.message || "";

      const is503Error =
        statusCode === 503 ||
        errorMessage.includes("503") ||
        errorMessage.toLowerCase().includes("service unavailable") ||
        errorMessage.toLowerCase().includes("overloaded");

      if (!is503Error || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;

      console.warn(
        `Gemini API busy (503/Overloaded). Attempt ${attempt + 1} of ${maxRetries} failed. Retrying in ${Math.round(delay)}ms...`,
      );

      await sleep(delay);
      attempt++;
    }
  }

  // Fallback to satisfy TypeScript's compiler
  throw new Error("Failed to generate content after maximum retries.");
};
