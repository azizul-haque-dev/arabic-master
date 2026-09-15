export interface AccessTokenPayload {
    sub: string;
    type: 'access';
    sid: string;
    jti: string;
}

export interface RefreshTokenPayload {
    sub: string;
    type: 'refresh';
    sid: string;
    jti: string;
}

export interface ValidatedRefreshToken extends RefreshTokenPayload {
    rawToken: string;
}

export interface RequestUser {
    userId: string;
    sessionId: string;
    jti: string;
}