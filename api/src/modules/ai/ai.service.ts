import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { env } from '../../config/env.js';
import { createSaudiTeacherPrompt, textToTranslateSaudiNativeArabic } from './prompts/prompt.factory.js';
import { AIResponseSchema, SaudiArabicTranslationSchema, type AiResponse } from './schemas/ai-response.schema.js';

export function createAiService() {
  const model = new ChatGoogleGenerativeAI({ temperature: 0, model: env.AI_MODEL_NAME, apiKey: env.GOOGLE_API_KEY });

  return {
    async generateContent(query: string): Promise<AiResponse> {
      const result = await model.withStructuredOutput(AIResponseSchema).invoke(createSaudiTeacherPrompt(query));
      return AIResponseSchema.parse(result); // AI-ও external source, তাই আবার validate
    },
    async translateToArabic(text: string): Promise<string> {
      const result = await model
        .withStructuredOutput(SaudiArabicTranslationSchema)
        .invoke(textToTranslateSaudiNativeArabic(text));
      return SaudiArabicTranslationSchema.parse(result).translatedText;
    },
  };
}
export type AiService = ReturnType<typeof createAiService>;
