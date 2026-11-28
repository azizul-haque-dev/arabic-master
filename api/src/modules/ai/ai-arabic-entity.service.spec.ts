import { describe, expect, it, vi } from 'vitest';
import type { AiService } from './ai.service.js';
import type { ArabicEntityRepository } from '../arabic-entities/arabic-entity.repository.js';
import { Role } from '../../database/drizzle/enums.js';
import type { RequestUser } from '../auth/auth.types.js';
import { createAiArabicEntityService } from './ai-arabic-entity.service.js';

describe('AiArabicEntityService', () => {
  const admin: RequestUser = {
    userId: 'user-1',
    sessionId: 'session-1',
    jwtId: 'jwt-1',
    role: Role.ADMIN,
  };

  it('creates an entity with AI-generated meanings and pronunciations', async () => {
    const entity = { id: 'entity-1', arabicText: 'مرحبا' };
    const entities = {
      findByNormalizedText: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(entity),
    } as unknown as ArabicEntityRepository;
    const ai = {
      translateToArabic: vi.fn(),
      generateContent: vi.fn().mockResolvedValue({
        meaningBn: 'হ্যালো',
        meaningEn: 'Hello',
        pronunciationBn: 'মারহাবা',
        pronunciationEn: 'marhaban',
      }),
    } as unknown as AiService;
    const service = createAiArabicEntityService({ ai, entities });

    const result = await service.generateWithAi('مرحبا', admin);

    expect(ai.generateContent).toHaveBeenCalledWith('مرحبا');
    expect(entities.create).toHaveBeenCalledWith({
      arabicText: 'مرحبا',
      meaningBangla: 'হ্যালো',
      meaningEnglish: 'Hello',
      pronunciationBangla: 'মারহাবা',
      pronunciationEnglish: 'marhaban',
      status: 'APPROVED',
      createdById: admin.userId,
    });
    expect(result).toEqual({ entity, created: true });
  });

  it('returns an existing normalized entity without creating a duplicate', async () => {
    const entity = { id: 'entity-1', arabicText: 'مرحبا' };
    const entities = {
      findByNormalizedText: vi.fn().mockResolvedValue(entity),
      create: vi.fn(),
    } as unknown as ArabicEntityRepository;
    const ai = {
      translateToArabic: vi.fn(),
      generateContent: vi.fn(),
    } as unknown as AiService;
    const service = createAiArabicEntityService({ ai, entities });

    const result = await service.generateWithAi('مرحبا', admin);

    expect(result).toEqual({ entity, created: false });
    expect(ai.generateContent).not.toHaveBeenCalled();
    expect(entities.create).not.toHaveBeenCalled();
  });
});
