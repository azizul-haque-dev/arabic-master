// Multer stores files in memory (not on disk) since they're immediately
// streamed to S3. Limits keep the process from being overwhelmed by
// oversized uploads.
import multer from "multer";
import { ApiError } from "@/lib/api-error.js";
import { UPLOAD_LIMITS } from "@/shared/constants.js";

const ALLOWED_MIME_TYPES = new Set(UPLOAD_LIMITS.ALLOWED_AUDIO_TYPES);

export const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest("Only mp3/wav/ogg audio files are allowed"));
      return;
    }
    cb(null, true);
  },
});
