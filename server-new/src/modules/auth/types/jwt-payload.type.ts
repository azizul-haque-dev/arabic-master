


export interface AccessTokenPayload {
    sub: string;
    type: 'access';
    sessionId: string;
    jwtId: string;
}

export interface RefreshTokenPayload {
    sub: string;
    type: 'refresh';
    sessionId: string;
    jwtId: string;
}

export interface ValidatedRefreshToken extends RefreshTokenPayload {
    rawToken: string;
}

export interface RequestUser {
    userId: string;
    sessionId: string;
    jwtId: string;
}