import {
  AUDIO_MAX_FILE_SIZE_BYTES,
  SUPPORTED_AUDIO_EXTENSIONS,
  SUPPORTED_AUDIO_MIMES,
} from "./constants";

export interface AudioValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAudioFile(file: File | null | undefined): AudioValidationResult {
  if (!file) {
    return { valid: false, error: "Please select an audio file." };
  }

  if (file.size === 0) {
    return { valid: false, error: "The selected audio file is empty (0 bytes)." };
  }

  if (file.size > AUDIO_MAX_FILE_SIZE_BYTES) {
    const maxMb = Math.round(AUDIO_MAX_FILE_SIZE_BYTES / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds the ${maxMb}MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB selected).`,
    };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = SUPPORTED_AUDIO_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: "Unsupported file extension. Only .mp3, .wav, .ogg, .m4a, and .webm are permitted.",
    };
  }

  // If browser provides a declared MIME type, check it against allowlist
  if (file.type) {
    const normalizedMime = file.type.toLowerCase().split(";")[0].trim();
    // Allow if in supported list or generic audio
    const isAllowedMime =
      (SUPPORTED_AUDIO_MIMES as readonly string[]).includes(normalizedMime) ||
      normalizedMime.startsWith("audio/");

    if (!isAllowedMime) {
      return {
        valid: false,
        error: `Declared MIME type "${file.type}" is not a recognized audio format.`,
      };
    }
  }

  return { valid: true };
}
