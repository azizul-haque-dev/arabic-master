import { env } from "@/config/env.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: env.AI_API_KEY });

export async function generateText() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "translate 'what is your name in bangla'",
    });
    console.log(response.text);
  } catch (error) {
    console.log(error);
  }
}
