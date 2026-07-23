// Handles standalone audio uploads (e.g. from an admin panel) that
// return a URL to be attached to a Word/Sentence's audioUrl field.

import { prisma } from "@/config/database.js";
import { sendSuccess } from "@/utils/api-response.js";
import { deleteFile, uploadFile, UploadFileResult } from "@/utils/s3.js";
import { Request, Response, Router } from "express";
import { uploadAudio } from "../../middlewares/upload.middleware.js";
import { ApiError } from "../../utils/api-error.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.post(
  "/audio",
  uploadAudio.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest("No file uploaded");
    }

    const { textId } = req.body;

    if (!textId) {
      throw ApiError.badRequest("No textId provided");
    }

    // Check if the Arabic text exists
    const existingText = await prisma.arabicText.findUnique({
      where: { id: textId },
      select: {
        id: true,
        audioKey: true,
      },
    });

    if (!existingText) {
      throw ApiError.notFound("Arabic text not found");
    }

    // Upload the new file
    const uploadedResult: UploadFileResult = await uploadFile(
      req.file,
      "audio",
    );

    if (!uploadedResult.key || !uploadedResult.publicUrl) {
      throw ApiError.internal("Failed to upload file");
    }

    try {
      // Update database
      await prisma.arabicText.update({
        where: { id: textId },
        data: {
          audioKey: uploadedResult.key,
          audioUrl: uploadedResult.publicUrl,
        },
      });
    } catch (error) {
      // Rollback uploaded file if DB update fails
      await deleteFile(uploadedResult.key).catch(() => {});
      throw error;
    }

    // Delete previous audio (don't fail request if deletion fails)
    if (existingText.audioKey) {
      await deleteFile(existingText.audioKey).catch((err) => {
        console.error("Failed to delete old audio:", err);
      });
    }

    sendSuccess(res, 201, "File uploaded successfully", null);
  }),
);

export default router;
