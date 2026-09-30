import { Role, UserStatus } from '../../../database/drizzle/enums.js';

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  emailVerifiedAt: Date | null;
  createdAt: Date;
}
