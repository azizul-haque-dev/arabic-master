import { workerRedis } from "@/config/redis.js";
import { ApiError } from "@/lib/api-error.js";
import { Job, Worker } from "bullmq";
import { generateContent } from "../ai/generateContent.js";
import { AIResponseSchema } from "../ai/schema.js";
import { ARABIC_TEXT_QUEUE_NAME } from "./arabicText.queue.js";
import { ArabicTextRepository } from "./arabicText.repository.js";

const processArabicTextJob = async (job: Job<{ arabicTextId: string }>) => {
    const { arabicTextId } = job.data;
    console.log(`[ArabicText Worker] Job ${job.id} started processing.`);

    const arabicText = await ArabicTextRepository.findById(arabicTextId);
    if (!arabicText) {
        throw ApiError.badRequest(`Arabic text not found by id ${arabicTextId}`);
    }

    await ArabicTextRepository.updateAiResult(arabicTextId, {
        aiStatus: "PROCESSING",
    });

    try {
        // All expensive AI enrichment happens in this worker, never in the API.
        const aiResponse = await generateContent(arabicText.text);
        const parsed = AIResponseSchema.safeParse(aiResponse);
        if (!parsed.success) {
            throw ApiError.internal("AI failed to generate valid content.");
        }
        const aiData = parsed.data;

        // Note: aiData.categoryEn/categoryBn are part of the AI response schema
        // (required for Word/Sentence generation) but are intentionally not
        // persisted here - categories only apply to Word/Sentence, not to a
        // bare ArabicText row.
        await ArabicTextRepository.updateAiResult(arabicTextId, {
            aiStatus: "COMPLETED",
            meaningEn: aiData.meaningEn,
            meaningBn: aiData.meaningBn,
            whenToUseEn: aiData.whenToUseEn,
            whenToUseBn: aiData.whenToUseBn,
            pronunciationEn: aiData.pronunciationEn,
            pronunciationBn: aiData.pronunciationBn,
            feminineEn: aiData.feminineEn,
            feminineBn: aiData.feminineBn,
            errorMessage: null,
        });

        console.log(`[ArabicText Worker] Job ${job.id} finished.`);
    } catch (error: any) {
        console.log(`[ArabicText Worker] Error processing job ${job.id}:`, error);

        await ArabicTextRepository.updateAiResult(arabicTextId, {
            aiStatus: "FAILED",
            errorMessage: error.message || "Unknown error occurred during processing",
        });

        throw error;
    }
};

export const arabicTextWorker = new Worker(
    ARABIC_TEXT_QUEUE_NAME,
    processArabicTextJob,
    {
        connection: workerRedis,
        concurrency: 5,
    },
);

arabicTextWorker.on("failed", (job, error) => {
    console.log(
        `[ArabicText Worker] Job ${job?.id} failed. Attempt ${job?.attemptsMade}. Error: ${error.message}`,
    );
});