import { Status } from "@/generated/prisma/enums.js";
import { enqueueWordProcessing } from "./word.queue.js";
import { create } from "./word.service.js";

// Used by sentence processing: persist the raw token now, then let a worker
// enrich it later. It intentionally performs no AI request in the API process.
export async function createPendingWord(text: string) {
  const word = await create({ text, status: Status.DRAFT });
  await enqueueWordProcessing(word.id);
  return word;
}

export async function processNewWord(input: string) {
  return createPendingWord(input);
}
