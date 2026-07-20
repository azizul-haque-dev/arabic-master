import { createChatModel } from "./modelProvider.js";
import { createSaudiTeacherPrompt } from "./prompt.js";
import { AIResponseSchema, AiResponse } from "./schema.js";

export async function generateContent(query: string): Promise<AiResponse> {
  const { model } = createChatModel();
  const message = createSaudiTeacherPrompt(query);

  const structured = model.withStructuredOutput(AIResponseSchema);

  const result: AiResponse = await structured.invoke(message);

  return result;
}
