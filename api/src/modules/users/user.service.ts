import type { Role, UserStatus } from '../../database/drizzle/enums.js';
import { User, UserRepository } from './user.repository.js';

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  emailVerifiedAt: Date | null;
  createdAt: Date;
}

export const UserService= {
  
    findByEmail: UserRepository.findByEmail,
    findById: UserRepository.findById,
    createWithPassword: UserRepository.createWithPassword,
    createFromOAuth: UserRepository.createFromOAuth,
    updatePassword: UserRepository.updatePassword,
    markEmailVerified: UserRepository.markEmailVerified,
    toSafeUser: (u: User): SafeUser => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      status: u.status,
      emailVerifiedAt: u.emailVerifiedAt,
      createdAt: u.createdAt,
    }),
  };
