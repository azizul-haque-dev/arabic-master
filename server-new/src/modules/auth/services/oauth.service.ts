import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, OAuthProvider } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { UsersService } from '../../users/users.service.js';

export interface GoogleProfilePayload {
    providerAccountId: string;
    email: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
}

@Injectable()
export class OAuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
    ) { }

    async findOrCreateGoogleUser(profile: GoogleProfilePayload) {
        if (!profile.emailVerified) {
            throw new UnauthorizedException('Google account email is not verified');
        }

        const existingAccount = await this.prisma.oAuthAccount.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: OAuthProvider.GOOGLE,
                    providerAccountId: profile.providerAccountId,
                },
            },
            include: { user: true },
        });

        if (existingAccount) {
            return existingAccount.user;
        }

        const existingUser = await this.usersService.findByEmail(profile.email);

        if (existingUser) {
            // Deliberately NOT auto-linked — see the architecture notes at the top
            // of this document for why that would be an account-takeover vector.
            throw new ConflictException(
                'An account with this email already exists. Log in with your password and link Google from account settings.',
            );
        }

        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await this.usersService.createFromOAuth(
                {
                    email: profile.email,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    emailVerifiedAt: new Date(),
                },
                tx,
            );

            await tx.oAuthAccount.create({
                data: {
                    provider: OAuthProvider.GOOGLE,
                    providerAccountId: profile.providerAccountId,
                    userId: user.id,
                },
            });

            return user;
        });
    }
}