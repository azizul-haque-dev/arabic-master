import { SafeUser } from '../../users/types/safe-user.type.js';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
}

export interface AuthResult {
    user: SafeUser;
    tokens: TokenPair & { sessionId: string };
}