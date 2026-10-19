import { describe, expect, it } from 'vitest';
import {
  BadRequestError,
  UnsupportedMediaTypeError,
} from '../errors/app-error.js';
import {
  detectAudioFormat,
  validateAudioContent,
} from './audio-validator.util.js';

describe('audio-validator.util', () => {
  // Test samples with valid signatures
  const validMp3Id3 = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00]);
  const validMp3Sync = Buffer.from([0xff, 0xfb, 0x90, 0x64]);
  const validWav = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // length
    0x57, 0x41, 0x56, 0x45, // WAVE
    0x66, 0x6d, 0x74, 0x20, // fmt
  ]);
  const validOgg = Buffer.from([0x4f, 0x67, 0x67, 0x53, 0x00, 0x02]);
  const validM4a = Buffer.from([
    0x00, 0x00, 0x00, 0x20, // size
    0x66, 0x74, 0x79, 0x70, // ftyp
    0x4d, 0x34, 0x41, 0x20, // M4A
  ]);
  const validWebm = Buffer.from([
    0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00,
    0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d, // contains "webm"
  ]);

  describe('detectAudioFormat', () => {
    it('detects MP3 with ID3 header', () => {
      expect(detectAudioFormat(validMp3Id3)).toBe('mp3');
    });

    it('detects MP3 with raw sync word', () => {
      expect(detectAudioFormat(validMp3Sync)).toBe('mp3');
    });

    it('detects WAV RIFF/WAVE header', () => {
      expect(detectAudioFormat(validWav)).toBe('wav');
    });

    it('detects OGG header', () => {
      expect(detectAudioFormat(validOgg)).toBe('ogg');
    });

    it('detects M4A ftyp header', () => {
      expect(detectAudioFormat(validM4a)).toBe('m4a');
    });

    it('detects WebM EBML header', () => {
      expect(detectAudioFormat(validWebm)).toBe('webm');
    });

    it('returns null for non-audio or corrupted buffers', () => {
      expect(detectAudioFormat(Buffer.from('Hello world'))).toBeNull();
      expect(detectAudioFormat(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBeNull(); // PNG
      expect(detectAudioFormat(Buffer.from([]))).toBeNull();
    });
  });

  describe('validateAudioContent', () => {
    it('successfully validates MP3 with audio/mpeg', () => {
      const res = validateAudioContent(validMp3Id3, 'audio/mpeg');
      expect(res.format).toBe('mp3');
      expect(res.canonicalMime).toBe('audio/mpeg');
      expect(res.extension).toBe('mp3');
    });

    it('successfully validates WAV with audio/wav', () => {
      const res = validateAudioContent(validWav, 'audio/wav');
      expect(res.format).toBe('wav');
      expect(res.canonicalMime).toBe('audio/wav');
    });

    it('throws BadRequestError for empty buffer', () => {
      expect(() => validateAudioContent(Buffer.from([]))).toThrow(BadRequestError);
    });

    it('throws UnsupportedMediaTypeError for unsupported signature', () => {
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ executable
      expect(() => validateAudioContent(exeBuffer, 'audio/mpeg')).toThrow(
        UnsupportedMediaTypeError,
      );
    });

    it('throws UnsupportedMediaTypeError for MIME mismatch (e.g. WAV declared as MP3)', () => {
      expect(() => validateAudioContent(validWav, 'audio/mpeg')).toThrow(
        UnsupportedMediaTypeError,
      );
    });

    it('throws UnsupportedMediaTypeError for unpermitted declared MIME type', () => {
      expect(() => validateAudioContent(validMp3Id3, 'application/pdf')).toThrow(
        UnsupportedMediaTypeError,
      );
    });
  });
});
