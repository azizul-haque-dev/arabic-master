/**
 * Sentence AI Service
 * AI-powered sentence creation and processing
 */

import { prisma } from "@/config/database.js";
import { SentenceStatus } from "@/generated/prisma/enums.js";
import { SentenceRepository } from "./sentence.repository.js";

/**
 * Create a new pending sentence for AI processing
 * Stores the Arabic text and creates a PENDING sentence record
 */
export async function createPendingSentence(text: string) {
  const arabic = await prisma.arabicText.create({ data: { text } });
  return prisma.sentence.create({
    data: { arabicId: arabic.id, status: SentenceStatus.PENDING },
  });
}

/**
 * Update the status of a sentence
 * Used after AI processing is complete
 */
export async function updateSentenceStatus(
  id: string,
  status: SentenceStatus,
  errorMessage?: string,
) {
  return await SentenceRepository.updateStatus(id, status, errorMessage);
}

/**
 * Find a sentence by ID with its Arabic text
 */
export async function findSentenceById(id: string) {
  return await SentenceRepository.findById(id);
}
