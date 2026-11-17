import type { AiResponse } from './schemas/ai-response.schema.js';

export type AiUsageContextOutput = Pick<
  AiResponse,
  'whenToUseBn' | 'whenToUseEn'
>;

const FORBIDDEN_LABEL_PATTERN =
  /\bsaudi(?:\s*[-–—]?\s*(?:arabia|arabian))?s?\b|সৌদি(?:\s*[-–—]?\s*আরব)?/iu;

const LEARNER_FACING_FIELDS = [
  'text',
  'meaningBn',
  'meaningEn',
  'pronunciationBn',
  'pronunciationEn',
  'feminineBn',
  'feminineEn',
  'whenToUseBn',
  'whenToUseEn',
  'noteEn',
  'noteBn',
] as const satisfies readonly (keyof AiResponse)[];

export function assertAiOutputLabelsAllowed(response: AiResponse): void {
  for (const field of LEARNER_FACING_FIELDS) {
    const value = response[field];
    if (typeof value === 'string' && FORBIDDEN_LABEL_PATTERN.test(value)) {
      throw new Error(
        `AI output field "${field}" contains a prohibited country or nationality label.`,
      );
    }
  }
}

export function assertUsageContextLabelsAllowed(
  response: AiUsageContextOutput,
): void {
  for (const field of ['whenToUseBn', 'whenToUseEn'] as const) {
    if (FORBIDDEN_LABEL_PATTERN.test(response[field])) {
      throw new Error(
        `AI output field "${field}" contains a prohibited country or nationality label.`,
      );
    }
  }
}
