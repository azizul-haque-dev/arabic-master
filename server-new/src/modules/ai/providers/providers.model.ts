import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type Provider = 'gemini';

export interface StructuredChatModel {
  withStructuredOutput<TOutput>(schema: unknown): {
    invoke(input: unknown): Promise<TOutput>;
  };
}

export interface ChatModelResult {
  provider: Provider;
  model: StructuredChatModel;
}

@Injectable()
export class ModelProviderService {
  constructor(private readonly config: ConfigService) {}

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
