import { prisma } from "@/config/database.js";

export const aiSententceService = {
  creaatePendingSentence: async (text: string) => {
    return prisma.$transaction(async (trx) => {
      // find or create arabic record
      const arabicText = await trx.arabicText.upsert({
        where: { text },
        update: {},
        create: { text },
      });
      // create sentence
      const sentence = await trx.sentence.create({ data: {} });
    });
  },
};
