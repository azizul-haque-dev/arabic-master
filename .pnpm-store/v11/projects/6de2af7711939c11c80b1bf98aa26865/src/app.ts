// Builds and configures the Express application. Kept separate from
// server.ts so the app can be imported directly in tests without
// binding to a real port.
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import passport from "passport";
import { env } from "./config/env.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { generalLimiter } from "./middlewares/rate-limit.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { configureGoogleStrategy } from "./modules/auth/google-strategy.js";
import apiRoutes from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  // Trust the first proxy hop (load balancer/reverse proxy) so req.ip
  // and rate limiting see the real client IP instead of the proxy's.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true, // required so the refresh-token cookie is sent/received
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());
  app.use(requestLogger);

  app.use(passport.initialize());
  configureGoogleStrategy();

  app.use("/api/v1", generalLimiter, apiRoutes);
  setupSwagger(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
