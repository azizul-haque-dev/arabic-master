import { ConflictError, UnauthorizedError } from '../../common/errors/app-error.js';
import { withTransaction } from '../../database/db.js';
import { AuthProvider } from '../../database/drizzle/enums.js';
import type { UserService } from '../users/user.service.js';
import type { AuthRepository } from './auth.repository.js';

export interface GoogleProfilePayload {
  providerAccountId: string; email: string; emailVerified: boolean; fullName: string;
}

export function createOAuthService(d: { authRepo: AuthRepository; users: UserService }) {
  const { authRepo, users } = d;

  return {
    async findOrCreateGoogleUser(profile: GoogleProfilePayload) {
      if (!profile.emailVerified) throw new UnauthorizedError('Google account email is not verified');

      const identity = await authRepo.findIdentity(AuthProvider.GOOGLE, profile.providerAccountId);
      if (identity) {
        const user = await users.findById(identity.userId);
        if (!user) throw new UnauthorizedError('Account unavailable');
        return user;
      }

      if (await users.findByEmail(profile.email)) {
        throw new ConflictError(
          'An account with this email already exists. Log in with your password and link Google from account settings.',
        );
      }

      return withTransaction(async (tx) => {
        const user = await users.createFromOAuth(
          { email: profile.email, fullName: profile.fullName, emailVerifiedAt: new Date() },
          tx,
        );
        await authRepo.insertIdentity(
          { provider: AuthProvider.GOOGLE, providerAccountId: profile.providerAccountId, userId: user.id },
          tx,
        );
        return user;
      });
    },
  };
}
export type OAuthService = ReturnType<typeof createOAuthService>;
