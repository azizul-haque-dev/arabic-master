export const AUDIO_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB default limit matching R2_MAX_AUDIO_SIZE_BYTES

export const SUPPORTED_AUDIO_FORMATS = ["mp3", "wav", "ogg", "m4a", "webm"] as const;

export type SupportedAudioFormat = (typeof SUPPORTED_AUDIO_FORMATS)[number];

export const SUPPORTED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".webm",
] as const;

export const SUPPORTED_AUDIO_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/opus",
  "application/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/webm",
] as const;

export const AUDIO_ACCEPT_ATTRIBUTE =
  ".mp3,.wav,.ogg,.m4a,.webm,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/webm,audio/x-m4a,audio/aac";

export const VARIANT_REGEX = /^[A-Za-z0-9_-]{1,32}$/;

export const DEFAULT_VARIANT = "DEFAULT";

export const SPEAKER_MAX_LENGTH = 64;
