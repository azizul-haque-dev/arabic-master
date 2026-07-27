import { workerRedis } from "@/config/redis.js";
import { getOrCreateCategory } from "@/modules/category/category.service.js";

import { ApiError } from "@/utils/api-error.js";
import { Job, Worker } from "bullmq";

import { generateContent } from "../ai/generateContent.js";
import { AIResponseSchema } from "../ai/schema.js";
import { WORD_QUEUE_NAME } from "./word.queue.js";

export const wordWorker = new Worker(
  WORD_QUEUE_NAME,
  async (job: Job<{ wordId: string }>) => {
    const word = await (
      await import("@/config/database.js")
    ).prisma.word.findUnique({
      where: { id: job.data.wordId },
      include: { arabic: true },
    });
    if (!word) throw ApiError.notFound(`Word ${job.data.wordId} not found`);

    const aiResponse = await generateContent(word.arabic.text);
    const parsedResponse = AIResponseSchema.safeParse(aiResponse);
    if (!parsedResponse.success)
      throw ApiError.internal("AI failed to generate valid word content.");
    const aiData = parsedResponse.data;
    const categoryId = await getOrCreateCategory({
      categoryEn: aiData.categoryEn,
      categoryBn: aiData.categoryBn,
    });
    const { prisma } = await import("@/config/database.js");

    const update = await prisma.arabicText.update({
      where: { id: word.arabicId },
      data: { text: aiData.text },
    });
    await prisma.$transaction([
      prisma.wordCategory.deleteMany({ where: { wordId: word.id } }),
      prisma.wordCategory.create({ data: { wordId: word.id, categoryId } }),

      prisma.word.update({
        where: { id: word.id },
        data: {
          meaningEn: aiData.meaningEn,
          meaningBn: aiData.meaningBn,
          pronunciationEn: aiData.pronunciationEn,
          pronunciationBn: aiData.pronunciationBn,
          whenToUseEn: aiData.whenToUseEn,
          whenToUseBn: aiData.whenToUseBn,
        },
      }),
    ]);
  },
  { connection: workerRedis, concurrency: 5 },
);
