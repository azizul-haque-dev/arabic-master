import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';
import { SafeUser } from './types/safe-user.type.js';
import { Prisma, User } from '../../generated/prisma/client.js';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    createWithPassword(
        data: { email: string; passwordHash: string; firstName: string; lastName: string },
        tx?: Prisma.TransactionClient,
    ): Promise<User> {
        const client = tx ?? this.prisma;
        return client.user.create({ data });
    }

    createFromOAuth(
        data: { email: string; firstName: string; lastName: string; emailVerifiedAt: Date | null },
        tx: Prisma.TransactionClient,
    ): Promise<User> {
        return tx.user.create({ data: { ...data, passwordHash: null } });
    }

    toSafeUser(user: User): SafeUser {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            emailVerifiedAt: user.emailVerifiedAt,
            createdAt: user.createdAt,
        };
    }
}