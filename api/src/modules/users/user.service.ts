import type { Role, UserStatus } from '../../database/drizzle/enums.js';
import type { User, UserRepository } from './user.repository.js';

export interface SafeUser {
  id: string; email: string; fullName: string; role: Role; status: UserStatus;
  emailVerifiedAt: Date | null; createdAt: Date;
}

export function createUserService(repo: UserRepository) {
  return {
    findByEmail: repo.findByEmail,
    findById: repo.findById,
    createWithPassword: repo.createWithPassword,
    createFromOAuth: repo.createFromOAuth,
    updatePassword: repo.updatePassword,
    toSafeUser: (u: User): SafeUser => ({
      id: u.id, email: u.email, fullName: u.fullName, role: u.role, status: u.status,
      emailVerifiedAt: u.emailVerifiedAt, createdAt: u.createdAt,
    }),
  };
}
export type UserService = ReturnType<typeof createUserService>;
