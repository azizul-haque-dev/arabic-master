import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';
import { ServiceUnavailableError } from '../../common/errors/app-error.js';
import { r2StorageService } from '../../common/storage/r2.service.js';
import * as dbModule from '../../database/db.js';
import { ContentStatus, Role } from '../../database/drizzle/enums.js';
import { TokenService } from '../auth/token.service.js';
import { UserService } from '../users/user.service.js';
import { ArabicEntityAudioRepository } from './arabic-entity-audio.repository.js';
import { ArabicEntityRepository } from './arabic-entity.repository.js';

describe('Arabic Entity Audio Routes Integration', () => {
  let server: Server;
  let baseUrl: string;

  const validMp3Bytes = Buffer.from([
    0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0a,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);

  const mockEntity = {
    id: 'ae-uuid-1',
    entityKey: 'AE-1001',
    arabicText: 'كتاب',
    normalizedText: 'كتاب',
    audioUrl: null,
    pronunciationBangla: 'কিতাব',
    pronunciationEnglish: 'Kitab',
    status: ContentStatus.DRAFT,
    rejectionReason: null,
    createdById: 'cm-user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
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
    vi.spyOn(ArabicEntityRepository, 'findByEntityKey').mockResolvedValue(null as any);

    vi.spyOn(r2StorageService, 'uploadAudio').mockImplementation(async (opts) => {
      if (opts.body && typeof (opts.body as any).destroy === 'function') {
        (opts.body as any).destroy();
      }
      return {
        objectKey: 'arabic-entities/audio/ae-uuid-1/default-random.mp3',
        mimeType: 'audio/mpeg',
        fileSizeBytes: validMp3Bytes.length,
        playbackUrl: 'https://cdn.example.com/audio/default-random.mp3',
      };
    });
    vi.spyOn(r2StorageService, 'getPlaybackUrl').mockResolvedValue(
      'https://cdn.example.com/audio/default-random.mp3',
    );
    vi.spyOn(r2StorageService, 'deleteObject').mockResolvedValue(undefined);

    vi.spyOn(ArabicEntityAudioRepository, 'findByEntityIdAndVariant').mockResolvedValue(null as any);
    vi.spyOn(ArabicEntityAudioRepository, 'upsert').mockResolvedValue({
      id: 'audio-record-uuid',
      entityId: 'ae-uuid-1',
      objectKey: 'arabic-entities/audio/ae-uuid-1/default-random.mp3',
      mimeType: 'audio/mpeg',
      fileSizeBytes: validMp3Bytes.length,
      variant: 'DEFAULT',
      speaker: 'Sheikh Ahmad',
      createdById: 'cm-user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    vi.spyOn(ArabicEntityAudioRepository, 'updateEntityAudioUrl').mockResolvedValue(undefined);

    vi.spyOn(dbModule, 'withTransaction').mockImplementation(async (cb) => {
      return cb({} as any);
    });
  });

  describe('POST /api/v1/arabic-entities/:id/audio', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const res = await fetch(`${baseUrl}/ae-uuid-1/audio`, {
        method: 'POST',
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain('Authentication credentials missing');
    });

    it('returns 403 when authenticated user is not staff (Role.USER)', async () => {
      const formData = new FormData();
      formData.append(
        'audio',
        new Blob([validMp3Bytes], { type: 'audio/mpeg' }),
        'audio.mp3',
      );

      const res = await fetch(`${baseUrl}/ae-uuid-1/audio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
    });

    it('returns 404 when target Arabic entity does not exist', async () => {
      vi.spyOn(ArabicEntityRepository, 'findById').mockResolvedValueOnce(null as any);
      vi.spyOn(ArabicEntityRepository, 'findByEntityKey').mockResolvedValueOnce(null as any);

      const formData = new FormData();
      formData.append(
        'audio',
        new Blob([validMp3Bytes], { type: 'audio/mpeg' }),
        'audio.mp3',
      );

      const res = await fetch(`${baseUrl}/nonexistent-id/audio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cmToken}`,
        },
        body: formData,
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.message).toContain('Arabic entity not found');
    });

    it('returns 400 when no audio file is attached in multipart form', async () => {
      const formData = new FormData();
      formData.append('variant', 'DEFAULT');

      const res = await fetch(`${baseUrl}/ae-uuid-1/audio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cmToken}`,
        },
        body: formData,
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toContain('No audio file was uploaded');
    });

    it('returns 415 when file has non-audio signature (e.g. text disguised as audio)', async () => {
      const formData = new FormData();
      formData.append(
        'audio',
        new Blob([Buffer.from('Hello plain text disguised as mp3')], {
          type: 'audio/mpeg',
        }),
        'fake.mp3',
      );

      const res = await fetch(`${baseUrl}/ae-uuid-1/audio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cmToken}`,
        },
        body: formData,
      });

      expect(res.status).toBe(415);
      const body = await res.json();
      expect(body.message).toContain('Unsupported audio file signature');
    });

    it('returns 201 and audio resource when upload is valid and authenticated', async () => {
      const formData = new FormData();
      formData.append('variant', 'DEFAULT');
      formData.append('speaker', 'Sheikh Ahmad');
      formData.append(
        'audio',
        new Blob([validMp3Bytes], { type: 'audio/mpeg' }),
        'quran.mp3',
      );

      const res = await fetch(`${baseUrl}/ae-uuid-1/audio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cmToken}`,
        },
        body: formData,
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        id: 'audio-record-uuid',
        entityId: 'ae-uuid-1',
        entityKey: 'AE-1001',
        variant: 'DEFAULT',
        speaker: 'Sheikh Ahmad',
        mimeType: 'audio/mpeg',
        fileSizeBytes: validMp3Bytes.length,
        playbackUrl: 'https://cdn.example.com/audio/default-random.mp3',
      });
    });

    it('allows Admin user to upload audio successfully', async () => {
      const formData = new FormData();
      formData.append(
        'audio',
        new Blob([validMp3Bytes], { type: 'audio/mpeg' }),
        'admin-quran.mp3',
      );

      const res = await fetch(`${baseUrl}/ae-uuid-1/audio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('returns generic 503 error without leaking credentials when storage fails', async () => {
      vi.spyOn(r2StorageService, 'uploadAudio').mockImplementationOnce(async (opts) => {
        if (opts.body && typeof (opts.body as any).destroy === 'function') {
          (opts.body as any).destroy();
        }
        throw new ServiceUnavailableError('Failed to upload audio file to storage service.');
      });

      const formData = new FormData();
      formData.append(
        'audio',
        new Blob([validMp3Bytes], { type: 'audio/mpeg' }),
        'audio.mp3',
      );

      const res = await fetch(`${baseUrl}/ae-uuid-1/audio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cmToken}`,
        },
        body: formData,
      });

      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.success).toBe(false);
      // Ensure no internal AWS / R2 secrets or stack traces leaked
      expect(JSON.stringify(body)).not.toContain('test-r2-secret-access-key');
    });
  });

  describe('GET /api/v1/arabic-entities/:id/audio', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await fetch(`${baseUrl}/ae-uuid-1/audio`);
      expect(res.status).toBe(401);
    });

    it('returns 200 with audio metadata and playback URL for authorized user', async () => {
      const existing = {
        id: 'audio-record-uuid',
        entityId: 'ae-uuid-1',
        objectKey: 'arabic-entities/audio/ae-uuid-1/default.mp3',
        variant: 'DEFAULT',
        speaker: 'Sheikh Ahmad',
        mimeType: 'audio/mpeg',
        fileSizeBytes: 2048,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.spyOn(ArabicEntityAudioRepository, 'findByEntityIdAndVariant').mockResolvedValueOnce(
        existing as any,
      );

      const res = await fetch(`${baseUrl}/ae-uuid-1/audio?variant=DEFAULT`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        id: 'audio-record-uuid',
        variant: 'DEFAULT',
        playbackUrl: 'https://cdn.example.com/audio/default-random.mp3',
      });
    });
  });

  describe('DELETE /api/v1/arabic-entities/:id/audio', () => {
    it('returns 403 when regular user attempts deletion', async () => {
      const res = await fetch(`${baseUrl}/ae-uuid-1/audio?variant=DEFAULT`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      expect(res.status).toBe(403);
    });

    it('returns 200 and deletes audio variant when requested by Content Manager', async () => {
      vi.spyOn(ArabicEntityAudioRepository, 'deleteByEntityIdAndVariant').mockResolvedValueOnce({
        id: 'audio-record-uuid',
        entityId: 'ae-uuid-1',
        objectKey: 'arabic-entities/audio/ae-uuid-1/default.mp3',
        variant: 'DEFAULT',
      } as any);

      const res = await fetch(`${baseUrl}/ae-uuid-1/audio?variant=DEFAULT`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${cmToken}`,
        },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(r2StorageService.deleteObject).toHaveBeenCalledWith(
        'arabic-entities/audio/ae-uuid-1/default.mp3',
      );
    });
  });
});
