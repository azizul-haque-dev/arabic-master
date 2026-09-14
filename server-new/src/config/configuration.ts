export interface AppConfig {
    env: string;
    port: number;
    apiPrefix: string;
    apiVersion: string;
    cors: {
        origin: string[];
    };
    swagger: {
        enabled: boolean;
        path: string;
    };
    logLevel: string;
}

export default (): { app: AppConfig } => ({
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
});