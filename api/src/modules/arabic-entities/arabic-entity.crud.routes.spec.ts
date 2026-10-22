import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { ContentStatus, Role } from '../../database/drizzle/enums.js';
import { TokenService } from '../auth/token.service.js';
import { UserService } from '../users/user.service.js';
import { ArabicEntityRepository } from './arabic-entity.repository.js';

describe('Arabic Entity CRUD Routes Integration', () => {
  let server: Server;
  let baseUrl: string;

  const mockEntity = {
    id: 'ae-uuid-1',
    entityKey: 'AE-1001',
    arabicText: 'كتاب',
    normalizedText: 'كتاب',
    audioUrl: null,
    meaningBangla: 'বই',
    meaningEnglish: 'Book',
    pronunciationBangla: 'কিতাব',
    pronunciationEnglish: 'Kitab',
    status: ContentStatus.DRAFT,
    rejectionReason: null,
    createdById: 'cm-user-1',
    createdBy: 'Content Manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordUsageCount: 1,
    sentenceUsageCount: 2,
    conversationUsageCount: 0,
    hasAudio: false,
  };

  let cmToken: string;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${addr.port}/api/v1/arabic-entities`;
        resolve();
      });
    });

    cmToken = TokenService.generateAccessToken('cm-user-1', 'session-1').token;
    adminToken = TokenService.generateAccessToken('admin-user-1', 'session-2').token;
    userToken = TokenService.generateAccessToken('regular-user-1', 'session-3').token;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(UserService, 'findById').mockImplementation(async (id: string) => {
      if (id === 'cm-user-1') {
        return { id: 'cm-user-1', role: Role.CONTENT_MANAGER } as any;
      }
      if (id === 'admin-user-1') {
        return { id: 'admin-user-1', role: Role.ADMIN } as any;
      }
      if (id === 'regular-user-1') {
        return { id: 'regular-user-1', role: Role.USER } as any;
      }
      return null;
    });

    vi.spyOn(ArabicEntityRepository, 'findById').mockResolvedValue(mockEntity as any);
    vi.spyOn(ArabicEntityRepository, 'findDetailedById').mockResolvedValue(mockEntity as any);
    vi.spyOn(ArabicEntityRepository, 'findByEntityKey').mockResolvedValue(null as any);
  });

  describe('GET /api/v1/arabic-entities', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await fetch(baseUrl);
      expect(res.status).toBe(401);
    });

    it('returns paginated entities for authenticated users', async () => {
      vi.spyOn(ArabicEntityRepository, 'list').mockResolvedValue({
        items: [mockEntity as any],
        total: 1,
      });

      const res = await fetch(`${baseUrl}?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].arabicText).toBe('كتاب');
      expect(body.data.meta.total).toBe(1);
    });
  });

  describe('GET /api/v1/arabic-entities/:id', () => {
    it('returns detailed entity by id', async () => {
      const res = await fetch(`${baseUrl}/ae-uuid-1`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.entityKey).toBe('AE-1001');
      expect(body.data.meaningEnglish).toBe('Book');
    });
  });

  describe('POST /api/v1/arabic-entities', () => {
    it('rejects regular users with 403', async () => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arabicText: 'قلم' }),
      });
      expect(res.status).toBe(403);
    });

    it('allows staff to create entity and returns 201', async () => {
      vi.spyOn(ArabicEntityRepository, 'create').mockResolvedValue({
        id: 'ae-uuid-new',
        entityKey: 'AE-1002',
        arabicText: 'قلم',
        normalizedText: 'قلم',
        meaningBangla: 'কলম',
        meaningEnglish: 'Pen',
        pronunciationBangla: 'ক্বালাম',
        pronunciationEnglish: 'Qalam',
        status: ContentStatus.DRAFT,
      } as any);

      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cmToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          arabicText: 'قلم',
          meaningEnglish: 'Pen',
          meaningBangla: 'কলম',
          pronunciationEnglish: 'Qalam',
          pronunciationBangla: 'ক্বালাম',
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.arabicText).toBe('قلم');
    });
  });

  describe('PATCH /api/v1/arabic-entities/:id', () => {
    it('updates entity details for staff', async () => {
      vi.spyOn(ArabicEntityRepository, 'update').mockResolvedValue({
        ...mockEntity,
        meaningEnglish: 'Notebook',
      } as any);

      const res = await fetch(`${baseUrl}/ae-uuid-1`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${cmToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meaningEnglish: 'Notebook' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.meaningEnglish).toBe('Notebook');
    });
  });

  describe('PATCH /api/v1/arabic-entities/:id/status', () => {
    it('allows moving DRAFT to IN_REVIEW', async () => {
      vi.spyOn(ArabicEntityRepository, 'update').mockResolvedValue({
        ...mockEntity,
        status: ContentStatus.IN_REVIEW,
      } as any);

      const res = await fetch(`${baseUrl}/ae-uuid-1/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${cmToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: ContentStatus.IN_REVIEW }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('IN_REVIEW');
    });
  });

  describe('DELETE /api/v1/arabic-entities/:id', () => {
    it('rejects content manager with 403', async () => {
      const res = await fetch(`${baseUrl}/ae-uuid-1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${cmToken}` },
      });
      expect(res.status).toBe(403);
    });

    it('allows admin to delete entity', async () => {
      vi.spyOn(ArabicEntityRepository, 'delete').mockResolvedValue(mockEntity as any);

      const res = await fetch(`${baseUrl}/ae-uuid-1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });
});
