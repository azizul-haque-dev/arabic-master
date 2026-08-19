import { createChatModel } from "./modelProvider.js";
import {
  createSaudiTeacherPrompt,
  textToTranslateSaudiNativeArabic,
} from "./prompt.js";
import {
  AIResponseSchema,
  AiResponse,
  GenerateContentInputSchema,
  SaudiArabicTranslationSchema,
  TrasnlateTextType,
} from "./schema.js";

export async function generateContent(query: string): Promise<AiResponse> {
  const validatedQuery = GenerateContentInputSchema.parse(query);

  const { model } = createChatModel();

  const message = createSaudiTeacherPrompt(validatedQuery);

  const structured = model.withStructuredOutput(AIResponseSchema);

  const result = await structured.invoke(message);

  return AIResponseSchema.parse(result);
}
export async function translateWord(text: string) {
  const { model } = createChatModel();
  const prompt = textToTranslateSaudiNativeArabic(text);
  const structured = model.withStructuredOutput(SaudiArabicTranslationSchema);
  const result: TrasnlateTextType = await structured.invoke(prompt);
  return result.traslatedText;
}
