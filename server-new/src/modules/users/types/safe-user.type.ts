import { AccountStatus, Role } from "../../../generated/prisma/enums.js";


export interface SafeUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    status: AccountStatus;
    emailVerifiedAt: Date | null;
    createdAt: Date;
}