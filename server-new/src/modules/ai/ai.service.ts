import { Injectable, Logger } from '@nestjs/common';
import {
  createSaudiTeacherPrompt,
  textToTranslateSaudiNativeArabic,
} from './prompt/prompt.factory.js';
import { ModelProviderService } from './providers/providers.model.js';
import {
  AiResponse,
  AIResponseSchema,
  SaudiArabicTranslationSchema,
} from './schema/ai-response.schema.js';

const ARABIC_REGEX = /^[\u0600-\u06FF\s]+$/;
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly modelProvider: ModelProviderService) {}
  // Same idea as your old regex check, just living in a real service now
  // so any module can reuse it.
  isArabic(text: string): boolean {
    return ARABIC_REGEX.test(text);
  }

  async generateContent(query: string): Promise<AiResponse> {
    const { model } = this.modelProvider.createChatModel();
    const message = createSaudiTeacherPrompt(query);

    const structured = model.withStructuredOutput(AIResponseSchema);
    const result = await structured.invoke(message);

    return AIResponseSchema.parse(result);
  }

  async translateToArabic(text: string): Promise<string> {
    const { model } = this.modelProvider.createChatModel();
    const prompt = textToTranslateSaudiNativeArabic(text);

    const structured = model.withStructuredOutput(SaudiArabicTranslationSchema);
    const result = await structured.invoke(prompt);

    return result.translatedText;
  }
  private async callAiProvider(arabicText: string): Promise<unknown> {
    // TODO: plug in your real AI call here (this is your old
    // generateContent()). Left unimplemented since I don't have your
    // provider/API key details.
    throw new Error('callAiProvider() is not implemented yet.');
  }
}
