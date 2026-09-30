import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../../database/drizzle/db.service.js';
import { AuthProvider } from '../../../database/drizzle/enums.js';
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

    const existingAccount = await this.db.authIdentity.findUnique({
      where: {
        provider: AuthProvider.GOOGLE,
        providerAccountId: profile.providerAccountId,
      },
    });

    if (existingAccount) {
      return this.db.user.findUnique({ where: { id: existingAccount.userId } });
    }

    const existingUser = await this.usersService.findByEmail(profile.email);

    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists. Log in with your password and link Google from account settings.',
      );
    }

    return this.db.$transaction(async (tx: DatabaseService) => {
      const user = await this.usersService.createFromOAuth(
        {
          email: profile.email,
          fullName: profile.fullName,
          emailVerifiedAt: new Date(),
        },
        tx,
      );

      await tx.authIdentity.create({
        data: {
          provider: AuthProvider.GOOGLE,
          providerAccountId: profile.providerAccountId,
          userId: user.id,
        },
      });

      return user;
    });
  }
}
