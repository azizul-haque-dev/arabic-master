import { Injectable, Logger } from '@nestjs/common';
import { ModelProviderService } from './providers/providers.model.js';
import { AiResponse, AIResponseSchema, SaudiArabicTranslationSchema } from './schema/ai-response.schema.js';
import { createSaudiTeacherPrompt, textToTranslateSaudiNativeArabic } from './prompt/prompt.factory.js';


@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(private readonly modelProvider: ModelProviderService) { }

    async generateContent(query: string): Promise<AiResponse> {
        const { model } = this.modelProvider.createChatModel();
        const message = createSaudiTeacherPrompt(query);

        const structured = model.withStructuredOutput(AIResponseSchema);
        const result = await structured.invoke(message);

        return AIResponseSchema.parse(result);
    }

    async translateWord(text: string): Promise<string> {
        const { model } = this.modelProvider.createChatModel();
        const prompt = textToTranslateSaudiNativeArabic(text);

        const structured = model.withStructuredOutput(SaudiArabicTranslationSchema);
        const result = await structured.invoke(prompt);

        return result.translatedText;
    }
}