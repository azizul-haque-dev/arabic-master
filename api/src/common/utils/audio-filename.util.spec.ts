import { describe, expect, it } from 'vitest';
import { buildAudioDownloadFilename } from './audio-filename.util.js';

describe('buildAudioDownloadFilename', () => {
  it('uses the pronunciation for a single-word DEFAULT audio', () => {
    expect(buildAudioDownloadFilename('Ana', 'entity-1', 'DEFAULT', 'mp3')).toBe(
      'ana.mp3',
    );
  });

  it('joins phrase words with underscores and removes punctuation', () => {
    expect(
      buildAudioDownloadFilename(
        "Kam as-si'r? haluk",
        'entity-1',
        'DEFAULT',
        'mp3',
      ),
    ).toBe('kam_assir_haluk.mp3');
  });

  it('uses the entity ID when pronunciation is missing or unusable', () => {
    expect(buildAudioDownloadFilename('', 'AE-1042', 'DEFAULT', 'mp3')).toBe(
      'ae_1042.mp3',
    );
    expect(
      buildAudioDownloadFilename('مرحبا', 'AE-1042', 'DEFAULT', 'mp3'),
    ).toBe('ae_1042.mp3');
  });

  it('includes non-default variants and preserves the detected extension', () => {
    expect(
      buildAudioDownloadFilename('Kayfa haluk', 'entity-1', 'SLOW', 'm4a'),
    ).toBe('kayfa_haluk_slow.m4a');
  });

  it('rejects unsafe extensions', () => {
    expect(() =>
      buildAudioDownloadFilename('ana', 'entity-1', 'DEFAULT', '../mp3'),
    ).toThrow('Unsupported audio filename extension.');
  });
});
