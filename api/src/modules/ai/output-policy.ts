import type { AiResponse } from './schemas/ai-response.schema.js';

export type AiUsageContextOutput = Pick<
  AiResponse,
  'whenToUseBn' | 'whenToUseEn'
>;

const FORBIDDEN_LABEL_PATTERN =
  /\bsaudi(?:\s*[-–—]?\s*(?:arabia|arabian))?s?\b|সৌদি(?:\s*[-–—]?\s*আরব)?/iu;
const FORBIDDEN_DIALECT_REFERENCE_PATTERN =
  /\b(?:dialects?|najdi|hijazi|najd|hijaz|gulf|egyptian|levantine|maghrebi|msa)\b|নাজদি|নাজদী|হিজাজি|হিজাজী|نجدي|حجازي|نجد|حجاز|لهجة|لهجات|উপভাষা/iu;

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
  for (const [index, reply] of response.replyOptions.entries()) {
    for (const field of [
      'arabicText',
      'pronunciationBn',
      'pronunciationEn',
      'meaningBn',
      'meaningEn',
    ] as const) {
      if (FORBIDDEN_LABEL_PATTERN.test(reply[field])) {
        throw new Error(
          `AI output field "replyOptions[${index}].${field}" contains a prohibited country or nationality label.`,
        );
      }
    }
  }
  assertUsageContextDialectReferencesOmitted(response);
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
  assertUsageContextDialectReferencesOmitted(response);
}

function assertUsageContextDialectReferencesOmitted(
  response: AiUsageContextOutput,
): void {
  for (const field of ['whenToUseBn', 'whenToUseEn'] as const) {
    if (FORBIDDEN_DIALECT_REFERENCE_PATTERN.test(response[field])) {
      throw new Error(
        `AI output field "${field}" contains a prohibited dialect or regional reference.`,
      );
    }
  }
}
