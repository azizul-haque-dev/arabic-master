import { OAuth2Client } from 'google-auth-library';
import { UnauthorizedError } from '../../common/errors/app-error.js';
import { env } from '../../config/env.js';
import { withTransaction } from '../../database/db.js';
import { AuthProvider, UserStatus } from '../../database/drizzle/enums.js';
import { UserService, type SafeUser } from '../users/user.service.js';
import { AuthRepository } from './auth.repository.js';
import type { RequestMeta } from './auth.types.js';
import { SecurityLoggerService } from './security-logger.service.js';
import { SessionService } from './session.service.js';

export interface VerifiedGoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
}

export interface GoogleAuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

const client = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_CALLBACK_URL,
});

const allowedAudiences: string[] = [
  env.GOOGLE_CLIENT_ID,
  ...(env.GOOGLE_ANDROID_CLIENT_ID ? [env.GOOGLE_ANDROID_CLIENT_ID] : []),
];

const VALID_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

export const GoogleAuthService = {
  getAuthorizationUrl(redirectUri?: string, state?: string): string {
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      redirect_uri: redirectUri ?? env.GOOGLE_CALLBACK_URL,
      ...(state ? { state } : {}),
      prompt: 'consent',
    });
  },

  async verifyIdToken(idToken: string): Promise<VerifiedGoogleProfile> {
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: allowedAudiences,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid token';
      throw new UnauthorizedError(`Google token verification failed: ${msg}`);
    }

    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedError('Google token verification failed: missing payload');
    }

    if (!payload.iss || !VALID_ISSUERS.includes(payload.iss)) {
      throw new UnauthorizedError('Google token verification failed: invalid issuer');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedError('Google account email is not verified');
    }

    if (!payload.email) {
      throw new UnauthorizedError('Google token does not contain an email address');
    }

    return {
      sub: payload.sub,
      email: payload.email.toLowerCase(),
      emailVerified: true,
      fullName: payload.name || payload.email.split('@')[0] || 'Google User',
    };
  },

  async verifyAuthCode(
    code: string,
    codeVerifier?: string,
    redirectUri?: string,
  ): Promise<VerifiedGoogleProfile> {
    try {
      const { tokens } = await client.getToken({
        code,
        codeVerifier,
        redirect_uri: redirectUri ?? env.GOOGLE_CALLBACK_URL,
      });

      if (!tokens.id_token) {
        throw new UnauthorizedError('Google token response did not include an ID token');
      }

      return await GoogleAuthService.verifyIdToken(tokens.id_token);
    } catch (err: unknown) {
      if (err instanceof UnauthorizedError) throw err;
      const msg = err instanceof Error ? err.message : 'Code exchange failed';
      throw new UnauthorizedError(`Google authorization code exchange failed: ${msg}`);
    }
  },

  async authenticateUser(
    profile: VerifiedGoogleProfile,
    meta: RequestMeta,
  ): Promise<GoogleAuthResponse> {
    // 1. Check if an AuthIdentity already exists for Google + sub
    const identity = await AuthRepository.findIdentity(
      AuthProvider.GOOGLE,
      profile.sub,
    );

    let user;

    if (identity) {
      user = await UserService.findById(identity.userId);
      if (!user) {
        throw new UnauthorizedError('Account unavailable');
      }
    } else {
      const existingUser = await UserService.findByEmail(profile.email);
      if (existingUser) {
        // Link Google identity to existing user
        await withTransaction(async (tx) => {
          await AuthRepository.insertIdentity(
            {
              provider: AuthProvider.GOOGLE,
              providerAccountId: profile.sub,
              userId: existingUser.id,
            },
            tx,
          );

          if (!existingUser.emailVerified) {
            await UserService.markEmailVerified(existingUser.id, tx);
          }
        });

        user = existingUser;
      } else {
        // Atomically create user and AuthIdentity in a single transaction
        user = await withTransaction(async (tx) => {
          const newUser = await UserService.createFromOAuth(
            {
              email: profile.email,
              fullName: profile.fullName,
              emailVerifiedAt: new Date(),
            },
            tx,
          );

          await AuthRepository.insertIdentity(
            {
              provider: AuthProvider.GOOGLE,
              providerAccountId: profile.sub,
              userId: newUser.id,
            },
            tx,
          );

          return newUser;
        });
      }
    }

    // 4. Validate user status
    if (user.status !== UserStatus.ACTIVE) {
      SecurityLoggerService.log({
        event: 'ACCOUNT_UNAVAILABLE_LOGIN_ATTEMPT',
        ...meta,
        userId: user.id,
      });
      throw new UnauthorizedError('Account unavailable');
    }

    // 5. Create session & tokens
    const session = await SessionService.createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    SecurityLoggerService.log({
      event: 'OAUTH_LOGIN',
      ...meta,
      userId: user.id,
      sessionId: session.sessionId,
    });

    // 6. Return response payload (Backend does not set cookies; Next.js sets its own cookie)
    return {
      user: UserService.toSafeUser(user),
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      refreshTokenExpiresAt: session.refreshTokenExpiresAt,
    };
  },

  async login(
    input: {
      idToken?: string;
      code?: string;
      codeVerifier?: string;
      redirectUri?: string;
    },
    meta: RequestMeta,
  ): Promise<GoogleAuthResponse> {
    let profile: VerifiedGoogleProfile;

    if (input.idToken) {
      profile = await GoogleAuthService.verifyIdToken(input.idToken);
    } else if (input.code) {
      profile = await GoogleAuthService.verifyAuthCode(
        input.code,
        input.codeVerifier,
        input.redirectUri,
      );
    } else {
      throw new UnauthorizedError('Either idToken or code must be provided');
    }

    return GoogleAuthService.authenticateUser(profile, meta);
  },
};

export type GoogleAuthService = typeof GoogleAuthService;
