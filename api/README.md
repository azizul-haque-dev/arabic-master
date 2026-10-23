# server-express

NestJS (`server-new`) থেকে রূপান্তরিত Express 5 + TypeScript (ESM) ব্যাকএন্ড।
**Function-based**: service, repository, ও controller regular factory function। App startup-এর wiring `src/app.setup.ts`-এ থাকে; NestJS বা DI container dependency নেই।

## চালানোর আগে

1. পুরনো প্রজেক্ট থেকে **`drizzle/` ফোল্ডার (migrations + `meta/`) এই ফোল্ডারে কপি করুন।** আমার কাছে `meta/` snapshot ছিল না, তাই বানাইনি।
2. `cp .env.example .env` এবং সব মান পূরণ করুন (`JWT_*`/`TOKEN_HASH_SECRET` ≥ ৩২ অক্ষর, আলাদা আলাদা)।
3. `bun install` (বা `npm i`), তারপর `bun run typecheck`। **এই কোড compile/চালিয়ে দেখা হয়নি**, ছোটখাটো type ঠিক করতে হতে পারে।
4. `bun run db:migrate` → `bun run dev`

নতুন dependency-র (express, pino, jsonwebtoken ইত্যাদি) version আমার আন্দাজে `package.json`-এ বসানো। চাইলে `bun add <pkg>` দিয়ে সর্বশেষটা নিন।

## স্ট্রাকচার

```
src/
  server.ts       bootstrap, worker চালু, graceful shutdown
  app.ts          middleware-এর ক্রম + route mount (/api/v1/...)
  app.setup.ts    service, repository, ও controller factory-গুলো জোড়া লাগায়
  config/         env.ts (zod), constants.ts, redis.ts
  common/         errors, http (logger, response), middleware, schemas, utils, constants
  database/       db.ts (pg + drizzle + withTransaction), redis.service.ts, drizzle/ (schema, enums)
  modules/<name>/ <name>.schemas.ts → .repository.ts → .service.ts → .controller.ts → .routes.ts
    auth · users · ai · arabic-entities · words · sentence · conversations · curriculum/{courses,sections,lessons}
```

Layer-এর নিয়ম: **route → controller → service → repository**। Controller-এ business logic নয়, repository-তে rule নয়। Repository-র প্রতিটি method শেষে ঐচ্ছিক `Executor` (db বা tx) নেয়, তাই service transaction খুলে ভেতরে পাঠায়।

## Endpoint

`/api/v1` এর অধীনে: `auth`, `words`, `sentences`, `conversations`, `courses`, `sections`, `lessons`, `health`।
অতিরিক্ত nested route: `PATCH /courses/:id/sections/reorder`, `PATCH /sections/:id/lessons/reorder`, `POST|PATCH|DELETE /lessons/:id/items...`।

`POST /api/v1/words/ai`-তে আগের `{ "query": "..." }` body দিয়ে একক শব্দ তৈরি হয়। একাধিক শব্দ queue করতে আলাদা `POST /api/v1/words/ai/word/list` endpoint-এ `{ "query": ["...", "..."] }` পাঠান (সর্বোচ্চ ২৫টি); response-এ প্রতি শব্দের `wordId`, `jobId` এবং enqueue সফলতার তথ্য থাকবে। job-এর অবস্থা/চূড়ান্ত ব্যর্থতা দেখতে staff token দিয়ে `GET /api/v1/words/ai/jobs/:id` কল করুন। `state: "failed"` হলে `failedReason`, `arabicText`, `attemptsMade`, এবং `maxAttempts` পাওয়া যাবে; worker log-এও সংশ্লিষ্ট শব্দের তথ্য থাকবে।

## পুরনো কোড থেকে আচরণের পার্থক্য (জেনে রাখুন)

| বিষয়                  | আগে                                                  | এখন                                                            |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| Response               | sentence/word-এ `data.data` দুইবার wrap              | একবারই: `{ success, data, message }` → **frontend যাচাই করুন** |
| `verifyDummy`          | hardcoded (সম্ভবত invalid) hash                      | startup-এ real hash                                            |
| JWT                    | algorithm pin ছিল না                                 | `HS256` pin                                                    |
| `register` race        | 500                                                  | 409                                                            |
| `sentence/word update` | `updatedAt` set হত না; `text/audioUrl` চুপচাপ ignore | `updatedAt` set; `text/audioUrl` এখনও ignore (TODO)            |
| env                    | `REDIS_HOST/PORT` বৈধ কিন্তু crash                   | `REDIS_URL` আবশ্যক                                             |
| `/health`              | শুধু memory                                          | DB + Redis ping + memory                                       |
| async job status       | 201                                                  | 202 (`/ai`, `/resync-words`)                                   |

## আগের মতোই রাখা ঝুঁকি (সিদ্ধান্ত আপনার)

- `GET /sentences`, `GET /sentences/:id`, `GET /words/:id` **public**, DRAFT content বাইরে যাচ্ছে।
- Google callback token **URL query-তে** পাঠায় (history/log-এ leak)। one-time code exchange ভালো।
- `createSession` সব পুরনো session বাতিল করে (single-device login)।
- Worker একই process-এ চলে, `concurrency: 1`। প্রতি sentence-এ প্রতি শব্দে একটা LLM call হয়। prod-এ আলাদা process ও rate-limit ভাবুন।
- Rate limit memory store; একাধিক instance হলে `rate-limit-redis` লাগবে।
- `ConsoleEmailService` শুধু dev-এর জন্য; prod-এ `EmailService` interface-এ আসল provider দিন।

## বাকি

- Swagger/OpenAPI বাদ (পরে `@asteasolutions/zod-to-openapi`)।
- Test: শুধু `content-workflow` util-এর ছোট spec আছে। auth/session-এর test নতুন করে লিখতে হবে (function-based হওয়ায় mock করা সহজ: factory-তে সাধারণ object পাস করলেই হয়)।
- Error class (`AppError` ও সন্তান) `class` রাখা হয়েছে, কারণ `Error` extend করে `instanceof` কাজ করানোর এটাই প্রচলিত উপায়।
