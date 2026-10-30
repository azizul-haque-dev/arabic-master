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
  const model = new ChatGoogleGenerativeAI({
    temperature: 0,
    model: env.AI_MODEL_NAME,
    apiKey: env.GOOGLE_API_KEY,
    maxRetries: AI_PROCESSING.MAX_INTERNAL_RETRIES,
  });

  const contentGenerator = model.withStructuredOutput(AIResponseSchema);
  const translator = model.withStructuredOutput(SaudiArabicTranslationSchema);

  return {
    async generateContent(query: string): Promise<AiResponse> {
      const result = await contentGenerator.invoke(
        createSaudiTeacherPrompt(query),
        { timeout: AI_PROCESSING.REQUEST_TIMEOUT_MS },
      );
      return AIResponseSchema.parse(result); // AI-ও external source, তাই আবার validate
    },
    async translateToArabic(text: string): Promise<string> {
      const result = await translator.invoke(
        textToTranslateSaudiNativeArabic(text),
        { timeout: AI_PROCESSING.TRANSLATE_TIMEOUT_MS },
      );
      return SaudiArabicTranslationSchema.parse(result).translatedText;
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
