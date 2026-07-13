// Minimal OpenAPI document served through swagger-ui-express at /api/docs.
// Route-level docs are kept short on purpose; this is a reference for
// consumers of the API, not a full spec generator.
import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Arabic App API",
    version: "1.0.0",
    description:
      "REST API for the Arabic learning platform (auth, words, sentences, categories).",
  },
  servers: [{ url: `http://localhost:${env.PORT}/api/v1` }],
  paths: {
    "/auth/register": {
      post: { summary: "Register a new user", tags: ["Auth"] },
    },
    "/auth/login": {
      post: { summary: "Login with email/password", tags: ["Auth"] },
    },
    "/auth/refresh": {
      post: {
        summary: "Rotate access token using refresh cookie",
        tags: ["Auth"],
      },
    },
    "/auth/logout": {
      post: {
        summary: "Revoke refresh token and clear cookie",
        tags: ["Auth"],
      },
    },
    "/auth/verify-email": {
      post: { summary: "Verify a user's email address", tags: ["Auth"] },
    },
    "/auth/forgot-password": {
      post: { summary: "Request a password reset email", tags: ["Auth"] },
    },
    "/auth/reset-password": {
      post: { summary: "Reset password with a valid token", tags: ["Auth"] },
    },
    "/auth/google": {
      get: { summary: "Start Google OAuth flow", tags: ["Auth"] },
    },
    "/users/me": {
      get: { summary: "Get current user profile", tags: ["User"] },
      patch: { summary: "Update current user profile", tags: ["User"] },
    },
    "/categories": {
      get: { summary: "List categories", tags: ["Category"] },
      post: { summary: "Create a category", tags: ["Category"] },
    },
    "/words": {
      get: { summary: "List words (paginated, filterable)", tags: ["Word"] },
      post: { summary: "Create a word", tags: ["Word"] },
    },
    "/sentences": {
      get: {
        summary: "List sentences (paginated, filterable)",
        tags: ["Sentence"],
      },
      post: { summary: "Create a sentence", tags: ["Sentence"] },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
