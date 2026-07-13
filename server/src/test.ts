import "dotenv/config";
import { prisma } from "./config/database.js";
import { createCategorySchema } from "./modules/category/category.validation.js";
import { WORD_INCLUDE } from "./modules/word/word.service.js";
import { AiResponse } from "./utils/ai.word.utils.js";
import { generateContent } from "./utils/aiGenrateContent.js";
import { ApiError } from "./utils/api-error.js";

export async function generateText(
  input: string,
): Promise<AiResponse | undefined> {
  try {
    const existingText = await prisma.arabicText.findUnique({
      where: { text: input },
    });
    if (existingText) {
      throw ApiError.conflict("This Arabic text already exists");
    }

    const response = await generateContent(input);

    const result = JSON.parse(response) as AiResponse;
    const normalizedCategoryEn = result.categoryEn.toLowerCase().trim();

    let existingCategory = await prisma.category.findUnique({
      where: { nameEn: normalizedCategoryEn },
    });

    if (!existingCategory) {
      const categoryData = {
        nameEn: normalizedCategoryEn,
        nameBn: result.categoryBn.trim(),
      };

      const validation = createCategorySchema.safeParse(categoryData);
      if (!validation.success) {
        throw ApiError.badRequest(
          "Validation failed",
          validation.error.flatten(),
        );
      }

      existingCategory = await prisma.category.create({
        data: validation.data,
      });
    }

    const word = await prisma.word.create({
      data: {
        meaningEn: result.meaningEn,
        meaningBn: result.meaningBn,
        whenToUseEn: result.whenToUseEn,
        whenToUseBn: result.whenToUseBn,
        pronunciationEn: result.pronunciationEn,
        pronunciationBn: result.pronunciationBn,
        status: "DRAFT",

        arabic: {
          create: { text: result.arabicText },
        },

        categories: {
          create: [
            {
              category: {
                connect: { id: existingCategory.id },
              },
            },
          ],
        },
      },
      include: WORD_INCLUDE,
    });

    return result;
  } catch (error) {
    console.error("Error in generateText:", error);
    throw error;
  }
}
