import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictError, UnauthorizedError } from '../../common/errors/app-error.js';
import { AuthProvider, Role, UserStatus } from '../../database/drizzle/enums.js';
import { AuthRepository } from './auth.repository.js';
import { GoogleAuthService } from './google-auth.service.js';
import { SessionService } from './session.service.js';
import { UserService } from '../users/user.service.js';

const { mockVerifyIdToken, mockGetToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
  mockGetToken: vi.fn(),
}));

vi.mock('google-auth-library', () => {

  class MockOAuth2Client {
    verifyIdToken = mockVerifyIdToken;
    getToken = mockGetToken;
    generateAuthUrl = vi.fn().mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?...');
  }
  return {
    OAuth2Client: MockOAuth2Client,
  };
});

// Mock database transaction runner to simply execute the callback
vi.mock('../../database/db.js', () => ({
  withTransaction: vi.fn().mockImplementation((cb: (tx: unknown) => unknown) => cb({})),
  db: {},
}));

describe('GoogleAuthService', () => {
  const meta = {
    requestId: 'req-123',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
  };

  const fakeSession = {
    sessionId: 'session-xyz',
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(SessionService, 'createSession').mockResolvedValue(fakeSession);
  });

  describe('verifyIdToken', () => {
    it('successfully extracts payload for valid ID token', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: 'google-sub-123',
          email: 'test@example.com',
          email_verified: true,
          name: 'Test User',
          iss: 'https://accounts.google.com',
        }),
      });

      const profile = await GoogleAuthService.verifyIdToken('valid-token');
      expect(profile).toEqual({
        sub: 'google-sub-123',
        email: 'test@example.com',
        emailVerified: true,
        fullName: 'Test User',
      });
    });

    it('throws UnauthorizedError if Google token verification fails', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Invalid signature'));

      await expect(GoogleAuthService.verifyIdToken('bad-token')).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it('throws UnauthorizedError if issuer is invalid', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: 'google-sub-123',
          email: 'test@example.com',
          email_verified: true,
          iss: 'https://untrusted-issuer.com',
        }),
      });

      await expect(GoogleAuthService.verifyIdToken('bad-issuer')).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it('throws UnauthorizedError if email is not verified by Google', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: 'google-sub-123',
          email: 'unverified@example.com',
          email_verified: false,
          iss: 'https://accounts.google.com',
        }),
      });

      await expect(GoogleAuthService.verifyIdToken('unverified-email')).rejects.toThrow(
        'Google account email is not verified',
      );
    });
  });

  describe('verifyAuthCode', () => {
    it('exchanges code for tokens and verifies returned id_token', async () => {
      mockGetToken.mockResolvedValueOnce({
        tokens: { id_token: 'returned-id-token' },
      });
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: 'google-sub-code',
          email: 'code@example.com',
          email_verified: true,
          name: 'Code User',
          iss: 'accounts.google.com',
        }),
      });

      const profile = await GoogleAuthService.verifyAuthCode('valid-code');
      expect(profile.sub).toBe('google-sub-code');
      expect(profile.email).toBe('code@example.com');
    });

    it('throws UnauthorizedError if Google response has no id_token', async () => {
      mockGetToken.mockResolvedValueOnce({ tokens: {} });

      await expect(GoogleAuthService.verifyAuthCode('code-no-id-token')).rejects.toThrow(
        'Google token response did not include an ID token',
      );
    });
  });

  describe('authenticateUser', () => {
    it('authenticates existing Google-linked user', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Existing User',
        passwordHash: null,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: Role.USER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(AuthRepository, 'findIdentity').mockResolvedValueOnce({
        id: 'identity-1',
        userId: 'user-1',
        provider: AuthProvider.GOOGLE,
        providerAccountId: 'sub-existing',
        createdAt: new Date(),
      });
      vi.spyOn(UserService, 'findById').mockResolvedValueOnce(existingUser);

      const result = await GoogleAuthService.authenticateUser(
        {
          sub: 'sub-existing',
          email: 'user@example.com',
          emailVerified: true,
          fullName: 'Existing User',
        },
        meta,
      );

      expect(result.user.id).toBe('user-1');
      expect(result.accessToken).toBe(fakeSession.accessToken);
      expect(result.refreshToken).toBe(fakeSession.refreshToken);
      expect(SessionService.createSession).toHaveBeenCalledWith({
        userId: 'user-1',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    });

    it('links Google identity if user already exists with same email', async () => {
      vi.spyOn(AuthRepository, 'findIdentity').mockResolvedValueOnce(null);
      vi.spyOn(UserService, 'findByEmail').mockResolvedValueOnce({
        id: 'user-2',
        email: 'password-user@example.com',
        fullName: 'Password User',
        passwordHash: 'argon2-hash',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: Role.USER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(AuthRepository, 'insertIdentity').mockResolvedValueOnce(undefined);

      const result = await GoogleAuthService.authenticateUser(
        {
          sub: 'sub-new',
          email: 'password-user@example.com',
          emailVerified: true,
          fullName: 'Password User',
        },
        meta,
      );

      expect(AuthRepository.insertIdentity).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: AuthProvider.GOOGLE,
          providerAccountId: 'sub-new',
          userId: 'user-2',
        }),
        expect.anything(),
      );
      expect(result.user.id).toBe('user-2');
    });

    it('registers a brand new Google user atomically with AuthIdentity', async () => {
      const newUser = {
        id: 'user-new',
        email: 'brandnew@example.com',
        fullName: 'Brand New',
        passwordHash: null,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: Role.USER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(AuthRepository, 'findIdentity').mockResolvedValueOnce(null);
      vi.spyOn(UserService, 'findByEmail').mockResolvedValueOnce(null);
      vi.spyOn(UserService, 'createFromOAuth').mockResolvedValueOnce(newUser);
      vi.spyOn(AuthRepository, 'insertIdentity').mockResolvedValueOnce(undefined);

      const result = await GoogleAuthService.authenticateUser(
        {
          sub: 'sub-brandnew',
          email: 'brandnew@example.com',
          emailVerified: true,
          fullName: 'Brand New',
        },
        meta,
      );

      expect(result.user.id).toBe('user-new');
      expect(UserService.createFromOAuth).toHaveBeenCalledWith(
        {
          email: 'brandnew@example.com',
          fullName: 'Brand New',
          emailVerifiedAt: expect.any(Date),
        },
        expect.anything(),
      );
      expect(AuthRepository.insertIdentity).toHaveBeenCalledWith(
        {
          provider: AuthProvider.GOOGLE,
          providerAccountId: 'sub-brandnew',
          userId: 'user-new',
        },
        expect.anything(),
      );
    });

    it('rejects suspended user', async () => {
      const suspendedUser = {
        id: 'user-suspended',
        email: 'suspended@example.com',
        fullName: 'Suspended User',
        passwordHash: null,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: Role.USER,
        status: UserStatus.SUSPENDED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(AuthRepository, 'findIdentity').mockResolvedValueOnce({
        id: 'identity-susp',
        userId: 'user-suspended',
        provider: AuthProvider.GOOGLE,
        providerAccountId: 'sub-susp',
        createdAt: new Date(),
      });
      vi.spyOn(UserService, 'findById').mockResolvedValueOnce(suspendedUser);

      await expect(
        GoogleAuthService.authenticateUser(
          {
            sub: 'sub-susp',
            email: 'suspended@example.com',
            emailVerified: true,
            fullName: 'Suspended User',
          },
          meta,
        ),
      ).rejects.toThrow('Account unavailable');
    });
  });
});
