import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AI_PROCESSING } from '../../config/constants.js';
import { env } from '../../config/env.js';
import {
  createSaudiTeacherPrompt,
  textToTranslateSaudiNativeArabic,
} from './prompts/prompt.factory.js';
import {
  AIResponseSchema,
  SaudiArabicTranslationSchema,
  type AiResponse,
} from './schemas/ai-response.schema.js';

export function createAiService() {
  const contentModel = new ChatGoogleGenerativeAI({
    temperature: 0,
    model: env.AI_MODEL_NAME,
    apiKey: env.GOOGLE_API_KEY,
    maxRetries: AI_PROCESSING.MAX_INTERNAL_RETRIES,
  });

  // Dedicated instance so fast inline translations never wait behind background worker queues
  const translatorModel = new ChatGoogleGenerativeAI({
    temperature: 0,
    model: env.AI_MODEL_NAME,
    apiKey: env.GOOGLE_API_KEY,
    maxRetries: AI_PROCESSING.MAX_INTERNAL_RETRIES,
  });

  const contentGenerator = contentModel.withStructuredOutput(AIResponseSchema);
  const translator = translatorModel.withStructuredOutput(
    SaudiArabicTranslationSchema,
  );

  return {
    async generateContent(query: string): Promise<AiResponse> {
      const result = await contentGenerator.invoke(
        createSaudiTeacherPrompt(query),
      );
      return AIResponseSchema.parse(result); // AI-ও external source, তাই আবার validate
    },
    async translateToArabic(text: string): Promise<string> {
      const prompt = textToTranslateSaudiNativeArabic(text);
      try {
        const result = await translator.invoke(prompt);
        const parsed = SaudiArabicTranslationSchema.parse(result);
        if (parsed.translatedText.trim()) {
          return parsed.translatedText.trim();
        }
      } catch {
        // Fallback to direct text invocation if structured output parsing/calling hiccups
      }

      const rawResponse = await translatorModel.invoke(prompt);
      const rawContent =
        typeof rawResponse.content === 'string'
          ? rawResponse.content.trim()
          : '';
      return SaudiArabicTranslationSchema.parse({
        translatedText: rawContent,
      }).translatedText;
    },
  };
}

let defaultAiService: ReturnType<typeof createAiService> | undefined;

function getAiService() {
  defaultAiService ??= createAiService();
  return defaultAiService;
}

export const AiService = {
  generateContent: (query: string): Promise<AiResponse> =>
    getAiService().generateContent(query),
  translateToArabic: (text: string): Promise<string> =>
    getAiService().translateToArabic(text),
};

export type AiService = typeof AiService;
