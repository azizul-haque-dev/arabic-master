import {
  BadRequestError,
  UnsupportedMediaTypeError,
} from '../errors/app-error.js';

export type SupportedAudioFormat = 'mp3' | 'wav' | 'ogg' | 'm4a' | 'webm';

export interface AudioValidationResult {
  format: SupportedAudioFormat;
  canonicalMime: string;
  extension: string;
}

interface FormatSpec {
  format: SupportedAudioFormat;
  canonicalMime: string;
  extension: string;
  allowedMimes: string[];
}

const SUPPORTED_FORMATS: Record<SupportedAudioFormat, FormatSpec> = {
  mp3: {
    format: 'mp3',
    canonicalMime: 'audio/mpeg',
    extension: 'mp3',
    allowedMimes: ['audio/mpeg', 'audio/mp3'],
  },
  wav: {
    format: 'wav',
    canonicalMime: 'audio/wav',
    extension: 'wav',
    allowedMimes: ['audio/wav', 'audio/x-wav', 'audio/wave'],
  },
  ogg: {
    format: 'ogg',
    canonicalMime: 'audio/ogg',
    extension: 'ogg',
    allowedMimes: ['audio/ogg', 'audio/opus', 'application/ogg'],
  },
  m4a: {
    format: 'm4a',
    canonicalMime: 'audio/mp4',
    extension: 'm4a',
    allowedMimes: ['audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/aac'],
  },
  webm: {
    format: 'webm',
    canonicalMime: 'audio/webm',
    extension: 'webm',
    allowedMimes: ['audio/webm'],
  },
};

/**
 * Detects audio format from magic bytes in header buffer.
 */
export function detectAudioFormat(buffer: Buffer): SupportedAudioFormat | null {
  if (!buffer || buffer.length < 4) {
    return null;
  }

  // 1. WAV / RIFF check: 0-3 = "RIFF", 8-11 = "WAVE"
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x41 && // A
    buffer[10] === 0x56 && // V
    buffer[11] === 0x45 // E
  ) {
    return 'wav';
  }

  // 2. OGG check: 0-3 = "OggS"
  if (
    buffer[0] === 0x4f && // O
    buffer[1] === 0x67 && // g
    buffer[2] === 0x67 && // g
    buffer[3] === 0x53 // S
  ) {
    return 'ogg';
  }

  // 3. MP3 ID3v2 container: 0-2 = "ID3"
  if (
    buffer[0] === 0x49 && // I
    buffer[1] === 0x44 && // D
    buffer[2] === 0x33 // 3
  ) {
    return 'mp3';
  }

  // 4. MP3 raw frame sync: 11 set bits (0xFF followed by top 3 bits set in second byte)
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    // Verify version is not reserved (bits 3-4 != 01) and layer is not reserved (bits 1-2 != 00)
    const versionBits = (buffer[1] >> 3) & 0x03;
    const layerBits = (buffer[1] >> 1) & 0x03;
    if (versionBits !== 0x01 && layerBits !== 0x00) {
      return 'mp3';
    }
  }

  // 5. M4A / AAC in MP4 container: bytes 4-7 = "ftyp"
  if (
    buffer.length >= 8 &&
    buffer[4] === 0x66 && // f
    buffer[5] === 0x74 && // t
    buffer[6] === 0x79 && // y
    buffer[7] === 0x70 // p
  ) {
    return 'm4a';
  }

  // 6. Raw AAC ADTS stream: 0xFFF sync word
  if (buffer[0] === 0xff && (buffer[1] & 0xf6) === 0xf0) {
    return 'm4a';
  }

  // 7. WebM / Matroska EBML: bytes 0-3 = 0x1A 0x45 0xDF 0xA3, with DocType "webm"
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    // Search first 128 bytes for 'webm'
    const searchSlice = buffer.subarray(0, Math.min(buffer.length, 128)).toString('binary');
    if (searchSlice.includes('webm')) {
      return 'webm';
    }
  }

  return null;
}

/**
 * Validates audio file header buffer and declared MIME type.
 * Enforces strict MIME allowlist and rejects format mismatches.
 */
export function validateAudioContent(
  headerBuffer: Buffer,
  declaredMimeType?: string,
): AudioValidationResult {
  if (!headerBuffer || headerBuffer.length === 0) {
    throw new BadRequestError('Uploaded audio file is empty.');
  }

  const detectedFormat = detectAudioFormat(headerBuffer);
  if (!detectedFormat) {
    throw new UnsupportedMediaTypeError(
      'Unsupported audio file signature. Only MP3, WAV, OGG, M4A, and WebM audio files are permitted.',
    );
  }

  const spec = SUPPORTED_FORMATS[detectedFormat];

  if (declaredMimeType) {
    const normalizedDeclared = declaredMimeType.toLowerCase().split(';')[0].trim();
    // Verify that the declared MIME is recognized in our global audio allowlist
    const allAllowedMimes = Object.values(SUPPORTED_FORMATS).flatMap((s) => s.allowedMimes);
    if (!allAllowedMimes.includes(normalizedDeclared)) {
      throw new UnsupportedMediaTypeError(
        `Declared MIME type "${declaredMimeType}" is not permitted. Only audio files are allowed.`,
      );
    }

    // Verify declared MIME matches the detected format
    if (!spec.allowedMimes.includes(normalizedDeclared)) {
      throw new UnsupportedMediaTypeError(
        `MIME type mismatch: declared as "${declaredMimeType}" but detected file signature is ${detectedFormat.toUpperCase()}.`,
      );
    }
  }

  return {
    format: spec.format,
    canonicalMime: spec.canonicalMime,
    extension: spec.extension,
  };
}
