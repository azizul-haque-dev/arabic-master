import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export type Provider = 'gemini';

export interface ChatModelResult {
    provider: Provider;
    model: BaseChatModel;
}

@Injectable()
export class ModelProviderService {
    constructor(private readonly config: ConfigService) { }

    createChatModel(): ChatModelResult {
        const modelName = this.config.getOrThrow<string>('AI_MODEL_NAME');

        return {
            provider: 'gemini',
            model: new ChatGoogleGenerativeAI({
                temperature: 0,
                model: modelName,
            }),
        };
    }
}