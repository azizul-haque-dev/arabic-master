import { createChatModel } from "./modelProvider.js";
import {
  createSaudiTeacherPrompt,
  textToTranslateSaudiNativeArabic,
} from "./prompt.js";
import {
  AIResponseSchema,
  AiResponse,
  SaudiArabicTranslationSchema,
  TrasnlateTextType,
} from "./schema.js";

export async function generateContent(query: string): Promise<AiResponse> {
  const { model } = createChatModel();
  const message = createSaudiTeacherPrompt(query);

  const structured = model.withStructuredOutput(AIResponseSchema);

  const result: AiResponse = await structured.invoke(message);

  return result;
}
export async function translateWord(text: string) {
  const { model } = createChatModel();
  const prompt = textToTranslateSaudiNativeArabic(text);
  const structured = model.withStructuredOutput(SaudiArabicTranslationSchema);
  const result: TrasnlateTextType = await structured.invoke(prompt);
  return result.traslatedText;
}
