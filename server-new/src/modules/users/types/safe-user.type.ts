import { AccountStatus, Role } from "../../../generated/prisma/enums.js";


export interface SafeUser {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    status: AccountStatus;
    emailVerifiedAt: Date | null;
    createdAt: Date;
}