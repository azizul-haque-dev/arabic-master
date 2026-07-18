import { prisma } from "@/config/database.js";
import { env } from "@/config/env.js";
import { getOrCreateCategory } from "@/modules/category/category.service.js";
import { WORD_INCLUDE } from "@/modules/word/word.service.js";
import { GoogleGenAI } from "@google/genai";
import {
  aiInstruction,
  type AiResponse,
  aiResponseSchema,
} from "./ai.utils.js";
import { sleep } from "./utils.js";

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

export const generateContent = async (
  input: string,
  maxRetries: number = 5,
  contentType: "word" | "sentence" = "word",
): Promise<AiResponse | undefined> => {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const res = await ai.models.generateContent({
        model: `${env.AI_MODEL_NAME}`,
        contents: `Arabic ${contentType}: ${input}`,
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

export async function createWordViaAi(input: string) {
  try {
    const result = (await generateContent(input)) as AiResponse;
    const catetoryData = {
      categoryBn: result.categoryBn,
      categoryEn: result.categoryEn,
    };
    const catetoryId = await getOrCreateCategory(catetoryData);

    const word = await prisma.word.create({
      data: {
        meaningEn: result.meaningEn,
        meaningBn: result.meaningBn,
        whenToUseEn: result.whenToUseEn,
        whenToUseBn: result.whenToUseBn,
        pronunciationEn: result.pronunciationEn,
        pronunciationBn: result.pronunciationBn,
        status: "DRAFT",

        arabic: {
          create: { text: result.arabicText },
        },

        categories: {
          create: [
            {
              category: {
                connect: { id: catetoryId },
              },
            },
          ],
        },
      },
      include: WORD_INCLUDE,
    });

    return word;
  } catch (error) {
    console.error("Error in generateText:", error);
    throw error;
  }
}
