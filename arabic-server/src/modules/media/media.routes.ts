// Handles standalone audio uploads (e.g. from an admin panel) that
// return a URL to be attached to a Word/Sentence's audioUrl field.
import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { uploadAudio } from "../../middlewares/upload.middleware.js";
import { ApiError } from "../../utils/api-error.js";
import { sendSuccess } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { uploadToS3 } from "../../utils/s3.js";

const router = Router();

router.post(
  "/audio",
  requireAuth,
  uploadAudio.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest("No file uploaded");

    const url = await uploadToS3(req.file, "audio");
    sendSuccess(res, 201, "File uploaded", { url });
  }),
);

export default router;
