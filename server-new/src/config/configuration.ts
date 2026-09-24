export interface AppConfig {
    env: string;
    port: number;
    apiPrefix: string;
    apiVersion: string;
    cors: { origin: string[] };
    swagger: { enabled: boolean; path: string };
    logLevel: string;
}

export interface AuthConfig {
    jwt: {
        accessSecret: string;
        accessExpiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    tokenHashSecret: string;
    passwordResetExpiresIn: string;
    google: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
    cookie: {
        name: string;
        secure: boolean;
        httpOnly: boolean;
        sameSite: 'lax' | 'strict' | 'none';
    };
    frontendUrl?: string;
}

export interface RootConfig {
    app: AppConfig;
    auth: AuthConfig;
    database: { url: string };
    redis: { url: string };
    ai: {
        googleApiKey: string;
        modelName: string;
    };
}

export default (): RootConfig => ({
    app: {
        env: process.env.NODE_ENV ?? 'development',
        port: parseInt(process.env.PORT ?? '5000', 10),
        apiPrefix: process.env.API_PREFIX ?? 'api',
        apiVersion: process.env.API_VERSION ?? 'v1',
        cors: {
            origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
                .split(',')
                .map((origin) => origin.trim()),
        },
        swagger: {
            enabled: (process.env.SWAGGER_ENABLED ?? 'true') === 'true',
            path: process.env.SWAGGER_PATH ?? 'docs',
        },
        logLevel: process.env.LOG_LEVEL ?? 'debug',
    },
    ai: {
        googleApiKey: process.env.GOOGLE_API_KEY as string,
        modelName: process.env.AI_MODEL_NAME as string,
    },
    auth: {
        jwt: {
            accessSecret: process.env.JWT_ACCESS_SECRET as string,
            accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
            refreshSecret: process.env.JWT_REFRESH_SECRET as string,
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
        },
        tokenHashSecret: process.env.TOKEN_HASH_SECRET as string,
        passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN ?? '15m',
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackUrl: process.env.GOOGLE_CALLBACK_URL as string,
        },
        cookie: {
            name: process.env.AUTH_COOKIE_NAME ?? 'refresh_token',
            secure: (process.env.AUTH_COOKIE_SECURE ?? 'true') === 'true',
            httpOnly: (process.env.AUTH_COOKIE_HTTP_ONLY ?? 'true') === 'true',
            sameSite: (process.env.AUTH_COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
        },
        frontendUrl: process.env.FRONTEND_URL,
    },
    database: {
        url: process.env.DATABASE_URL as string,
    },
    redis: {
        url: process.env.REDIS_URL as string,
    },
});