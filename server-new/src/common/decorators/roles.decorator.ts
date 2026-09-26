import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums.js';

export const ROLES_KEY = 'roles';

// A sticky note we put on a controller method: "only these roles allowed in".
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
