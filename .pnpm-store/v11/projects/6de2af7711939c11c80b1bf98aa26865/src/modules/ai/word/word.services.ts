import { prisma } from "@/config/database.js";
import { getOrCreateCategory } from "@/modules/category/category.service.js";
import { WORD_INCLUDE } from "@/modules/word/word.service.js";
import { generateContent } from "../generateContent.js";
import { AiResponse } from "../schema.js";

export async function createWordViaAi(input: string) {
  try {
    const result = (await generateContent(input)) as AiResponse;
    const catetoryData = {
      categoryBn: result.categoryBn,
      categoryEn: result.categoryEn,
    };
    const catetoryId = await getOrCreateCategory(catetoryData);

    const word = await prisma.word.create({
      data: {
        meaningEn: result.meaningEn,
        meaningBn: result.meaningBn,
        whenToUseEn: result.whenToUseEn,
        whenToUseBn: result.whenToUseBn,
        pronunciationEn: result.pronunciationEn,
        pronunciationBn: result.pronunciationBn,
        feminineEn: result.feminineEn,
        feminineBn: result.feminineBn,
        status: "DRAFT",

        arabic: {
          create: { text: result.text },
        },

        categories: {
          create: [
            {
              category: {
                connect: { id: catetoryId },
              },
            },
          ],
        },
      },
      include: WORD_INCLUDE,
    });

    return word;
  } catch (error) {
    console.error("Error in generateText:", error);
    throw error;
  }
}
