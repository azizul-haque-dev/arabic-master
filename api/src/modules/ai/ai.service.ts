import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { logger } from '../../common/http/logger.js';
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

const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
] as const;

function buildModelCandidates(): string[] {
  const configured =
    env.AI_MODEL_NAME === 'gemini-3.1-flash-lite' ||
    env.AI_MODEL_NAME === 'gemini-3.5-flash-lite'
      ? 'gemini-3.6-flash'
      : env.AI_MODEL_NAME;
  const candidates = [configured, ...FALLBACK_MODELS];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function createChatModel(modelName: string) {
  return new ChatGoogleGenerativeAI({
    temperature: 0,
    model: modelName,
    apiKey: env.GOOGLE_API_KEY,
    // Single attempt per model so a 503 spike immediately falls over to the next candidate model
    maxRetries: 0,
  });
}

function isServiceOrQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('404') ||
    msg.includes('Service Unavailable') ||
    msg.includes('high demand')
  );
}

export function createAiService() {
  const modelNames = buildModelCandidates();

  return {
    async generateContent(query: string): Promise<AiResponse> {
      const prompt = createSaudiTeacherPrompt(query);
      let lastError: unknown;

      for (const modelName of modelNames) {
        try {
          const generator =
            createChatModel(modelName).withStructuredOutput(AIResponseSchema);
          const result = await generator.invoke(prompt);
          return AIResponseSchema.parse(result);
        } catch (err) {
          lastError = err;
          logger.warn(
            { err, modelName, query },
            'AI generateContent failed on model; trying next candidate if available.',
          );
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error('AI content generation failed across all candidate models');
    },

    async translateToArabic(text: string): Promise<string> {
      const prompt = textToTranslateSaudiNativeArabic(text);
      let lastError: unknown;

      for (const modelName of modelNames) {
        const model = createChatModel(modelName);
        try {
          const translator = model.withStructuredOutput(
            SaudiArabicTranslationSchema,
          );
          const result = await translator.invoke(prompt);
          const parsed = SaudiArabicTranslationSchema.parse(result);
          if (parsed.translatedText.trim()) {
            return parsed.translatedText.trim();
          }
        } catch (err) {
          lastError = err;
          // If the model itself returned 503/429/404, skip directly to the next fallback model
          if (isServiceOrQuotaError(err)) {
            logger.warn(
              { err, modelName, text },
              'AI translateToArabic model unavailable; trying next candidate.',
            );
            continue;
          }
        }

        try {
          const rawResponse = await model.invoke(prompt);
          const rawContent =
            typeof rawResponse.content === 'string'
              ? rawResponse.content.trim()
              : '';
          if (rawContent) {
            return SaudiArabicTranslationSchema.parse({
              translatedText: rawContent,
            }).translatedText;
          }
        } catch (err) {
          lastError = err;
          logger.warn(
            { err, modelName, text },
            'AI translateToArabic failed on model; trying next candidate if available.',
          );
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error('AI translation failed across all candidate models');
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
