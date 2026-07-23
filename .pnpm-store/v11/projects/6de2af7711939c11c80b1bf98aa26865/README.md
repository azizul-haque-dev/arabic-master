# Arabic App Server

Backend API for the Arabic learning platform. Express 5 + TypeScript + Prisma 7 (Postgres).

## Stack

- **Express 5** – HTTP layer
- **Prisma 7** (`@prisma/adapter-pg`) – database access
- **Zod** – request validation and env validation
- **argon2** – password hashing
- **JWT access token + rotating opaque refresh token** – auth
- **Passport (Google OAuth2)** – social login
- **Multer + S3** – audio file uploads
- **Pino** – structured logging
- **Helmet, CORS, express-rate-limit, compression** – security/perf baseline
- **swagger-ui-express** – API docs at `/api/docs`

## Folder structure

```
src/
  config/        env, logger, database, swagger
  middlewares/   auth, validation, error handling, rate limiting, uploads
  modules/       one folder per domain: auth, user, category, word, sentence, media
    <module>/
      *.routes.ts       route definitions
      *.controller.ts   HTTP request/response glue
      *.service.ts      business logic + Prisma calls
      *.validation.ts   Zod schemas
  routes/        combines all module routers under /api/v1
  utils/         ApiError, ApiResponse, JWT helpers, email, S3
  app.ts         Express app construction (no listen())
  server.ts      boot, graceful shutdown, process-level error handling
```

Each domain module is self-contained (routes/controller/service/validation),
so new features can be added without touching unrelated code.

## Getting started

```bash
pnpm install
cp .env.example .env        # fill in real values
pnpm prisma:migrate         # creates tables + generates the Prisma client
pnpm dev                    # starts the API with hot reload
pnpm worker:dev             # starts the background worker with hot reload
```

Production:

```bash
pnpm build
pnpm prisma:deploy          # applies pending migrations, no prompts
pnpm start
pnpm worker                 # run in a separate process/container
```

Or via Docker:

```bash
docker compose up --build
```

The API process only enqueues background jobs. Run `pnpm worker` (or the
`worker` Compose service) separately; this prevents scaling API replicas from
starting duplicate workers.

## Auth flow

- `POST /api/v1/auth/register` – creates a user, sends a verification email, returns an
  access token in the body and sets a refresh token as an httpOnly cookie.
- `POST /api/v1/auth/login` – same token pair on successful credential check.
- `POST /api/v1/auth/refresh` – reads the refresh cookie, rotates it, returns a new access token.
- `POST /api/v1/auth/logout` – revokes the current refresh token.
- `POST /api/v1/auth/forgot-password` / `reset-password` – token-based password reset flow.
- `GET /api/v1/auth/google` → `GET /api/v1/auth/google/callback` – Google OAuth2 login.

Protected routes read the access token from `Authorization: Bearer <token>`.

## Content model

`ArabicText` is the shared parent row for both `Word` and `Sentence` (1:1),
holding the Arabic text and optional audio URL. Words and sentences can be
tagged with multiple `Category` rows through join tables, and a `Sentence`
can reference an ordered list of `Word`s via `SentenceWord.position`.

## API docs

Once running, Swagger UI is available at `http://localhost:4000/api/docs`.
