import { api } from "@/lib/axios";

export type AiContentType = "word" | "sentence";

export async function generateAiContent(type: AiContentType, text: string) {
  const { data } = await api.post(`/${type}s/ai`, { text });
  return data;
}
