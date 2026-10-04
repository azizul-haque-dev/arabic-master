import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../../database/drizzle/db.service.js';
import { AuthProvider } from '../../../database/drizzle/enums.js';
import * as schema from '../../../database/drizzle/schema.js';
import { UsersService } from '../../users/users.service.js';

export interface GoogleProfilePayload {
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
}

@Injectable()
export class OAuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly usersService: UsersService,
  ) {}

  async findOrCreateGoogleUser(profile: GoogleProfilePayload) {
    if (!profile.emailVerified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    const existingAccountRows = await this.db.db
      .select()
      .from(schema.authIdentity)
      .where(
        and(
          eq(schema.authIdentity.provider, AuthProvider.GOOGLE),
          eq(schema.authIdentity.providerAccountId, profile.providerAccountId),
        ),
      )
      .limit(1);
    const existingAccount = existingAccountRows[0];

    if (existingAccount) {
      const userRows = await this.db.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, existingAccount.userId))
        .limit(1);
      return userRows[0] ?? null;
    }

    const existingUser = await this.usersService.findByEmail(profile.email);

    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists. Log in with your password and link Google from account settings.',
      );
    }

    return this.db.$transaction(async (tx) => {
      const user = await this.usersService.createFromOAuth(
        {
          email: profile.email,
          fullName: profile.fullName,
          emailVerifiedAt: new Date(),
        },
        tx,
      );

      await tx.insert(schema.authIdentity).values({
        id: randomUUID(),
        provider: AuthProvider.GOOGLE,
        providerAccountId: profile.providerAccountId,
        userId: user.id,
      });

      return user;
    });
  }
}
