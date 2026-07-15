import { prisma } from "@/config/database.js";
import { SentenceStatus } from "@/generated/prisma/enums.js";
import { getOrCreateCategory } from "@/modules/category/category.service.js";
import { AiResponse } from "@/utils/ai.word.utils.js";

export const aiSententceService = {
  createPendingSentence: async (aiData: AiResponse) => {
    const categoryData = {
      categoryEn: aiData.categoryEn.trim(),
      categoryBn: aiData.categoryBn.trim(),
    };
    const categoryId = await getOrCreateCategory(categoryData);
    return prisma.$transaction(async (trx) => {
      // find or create arabic record
      const arabicText = await trx.arabicText.upsert({
        where: { text: aiData.arabicText },
        update: {},
        create: { text: aiData.arabicText },
      });

      // create sentence
      const sentence = await trx.sentence.create({
        data: {
          arabicId: arabicText.id,
          meaningEn: aiData.meaningEn,
          meaningBn: aiData.meaningBn,
          whenToUseEn: aiData.whenToUseEn,
          whenToUseBn: aiData.whenToUseBn,
          pronunciationEn: aiData.pronunciationEn,
          pronunciationBn: aiData.pronunciationBn,
          status: SentenceStatus.PENDING,
        },
      });

      await trx.sentenceCategory.create({
        data: {
          sentenceId: sentence.id,
          categoryId,
        },
      });
      return sentence;
    });
  },
  updateSentenceStatus: async (
    id: string,
    status: SentenceStatus,
    errorMessage?: string,
  ) => {
    return await prisma.sentence.update({
      where: {
        id,
      },
      data: { status, errorMessage },
    });
  },
  findSentenceById: async (id: string) => {
    return await prisma.sentence.findUnique({
      where: { id },
      include: { arabic: true },
    });
  },
};
