// Multer stores files in memory (not on disk) since they're immediately
// streamed to S3. Limits keep the process from being overwhelmed by
// oversized uploads.
import multer from "multer";
import { ApiError } from "../utils/api-error.js";

const ALLOWED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
]);

export const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest("Only mp3/wav/ogg audio files are allowed"));
      return;
    }
    cb(null, true);
  },
});
