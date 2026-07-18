import { prisma } from "@/config/database.js";
import { SentenceStatus } from "@/generated/prisma/enums.js";

export const aiSententceService = {
  createPendingSentence: async (text: string) => {
    const arabic = await prisma.arabicText.create({ data: { text } });
    return prisma.sentence.create({
      data: { arabicId: arabic.id, status: SentenceStatus.PENDING },
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
