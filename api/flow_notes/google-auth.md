Ran command: `npm i google-auth-library`
Used tool: manage_task
Used tool: manage_task

Waiting for `npm i google-auth-library` to finish installing...

Used tool: manage_task
Used tool: manage_task
Used tool: manage_task
Used tool: manage_task
Viewed app.ts:1-55
Viewed env.ts:24-37
Searched for "passport"
Edited env.ts
Viewed app.ts:1-20
Viewed app.ts:40-56
Edited app.ts
Ran command: `npm run typecheck`
Used tool: manage_task
Created google-auth.service.ts
Viewed auth.schemas.ts:1-24
Edited auth.schemas.ts
Viewed auth.service.ts:175-211
Viewed auth.service.ts:1-30
Edited auth.service.ts
Viewed auth.service.ts:178-212
Edited auth.service.ts
Viewed auth.service.ts:180-212
Edited auth.service.ts
Viewed auth.service.ts:180-190
Viewed auth.service.ts:190-209
Edited auth.service.ts
Edited auth.service.ts
Viewed auth.service.ts:175-205
Edited auth.service.ts
Viewed auth.service.ts:183-205
Edited auth.service.ts
Viewed auth.service.ts:184-188
Edited auth.service.ts
Viewed auth.service.ts:184-205
Edited auth.service.ts
Viewed auth.controller.ts:80-115
Viewed auth.controller.ts:1-20
Edited auth.controller.ts
Viewed auth.controller.ts:80-115
Edited auth.controller.ts
Viewed auth.controller.ts:84-94
Viewed auth.controller.ts:94-116
Edited auth.controller.ts
Viewed auth.controller.ts:91-118
Edited auth.controller.ts
Viewed auth.controller.ts:92-110
Edited auth.controller.ts
Viewed auth.routes.ts:1-51
Edited auth.routes.ts
Ran command: `npm run typecheck`
Used tool: manage_task
Ran command: `npm run lint`
Created google-auth.service.spec.ts
Ran command: `npm run test`
Used tool: manage_task
Viewed env.ts:35-48
Viewed vitest.config.ts:1-6
Edited vitest.config.ts
Ran command: `npm run test`
Used tool: manage_task
Edited google-auth.service.spec.ts
Ran command: `npm run test`
Edited google-auth.service.spec.ts
Ran command: `npm run test`
Ran command: `npm run typecheck`
Used tool: manage_task
Viewed auth.repository.ts:40-60
Edited auth.repository.ts
Ran command: `npm run typecheck`
Used tool: manage_task
Ran command: `npm run lint`
Ran command: `npm run test`
Ran command: `npm run build`
Used tool: manage_task
Ran command: `git status --short`

# Production-Grade Google Authentication Integration Report

Google Authentication has been integrated into the existing authentication system following the architectural patterns of the `auth` module, while strictly respecting your design requirement: **the Express backend does not set cookies for Google authentication; it returns the authentication payload directly in the JSON response, allowing Next.js to set its own session cookies on its own domain and Expo Android to store tokens in SecureStore.**

---

## 1. Existing Architecture Discovered

During codebase inspection, the following components were identified:
- **Architecture Pattern**: Direct singleton exports (`AuthService`, `AuthController`, `AuthRepository`, `SessionService`, `TokenService`, `UserService`).
- **Database Schema (`api/src/database/drizzle/schema/user.ts`)**:
  - `User`: Contains nullable `passwordHash` (supporting passwordless OAuth users), `emailVerified`, `emailVerifiedAt`, `role`, and `status`.
  - `AuthIdentity`: Already contains `provider: 'GOOGLE'`, `providerAccountId: text` (Google `sub`), unique index on `(provider, providerAccountId)`, and index on `userId`.
  - `Session` & `RefreshToken`: Full server-side session tracking with SHA-256 HMAC token hashing and rotation/reuse protection.
- **Previous Broken State**: `api/src/app.ts` contained broken references to Passport and a missing `google.strategy.js` (`error TS2307`), which was preventing compilation. This has been replaced with the official, modern `google-auth-library`.

---

## 2. Files Inspected & Modified

### Files Modified:
- [app.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/app.ts): Removed legacy Passport initialization and broken `google.strategy.js` reference.
- [env.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/config/env.ts): Added optional `GOOGLE_ANDROID_CLIENT_ID` for native Android token audience validation.
- [auth.schemas.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/modules/auth/auth.schemas.ts): Added `googleAuthSchema` supporting both `{ idToken }` and `{ code, codeVerifier?, redirectUri? }`.
- [auth.service.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/modules/auth/auth.service.ts): Added `loginWithGoogle` delegating directly to `GoogleAuthService`.
- [auth.controller.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/modules/auth/auth.controller.ts): Added `google` action returning the JSON payload directly (`ok(res, result)`), without setting backend cookies.
- [auth.routes.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/modules/auth/auth.routes.ts): Registered rate-limited `POST /google` endpoint.
- [auth.repository.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/modules/auth/auth.repository.ts): Added explicit return type to `findIdentity` to ensure strict nullability typing.
- [vitest.config.ts](file:///c:/Users/POS/Desktop/arabic-master/api/vitest.config.ts): Added standard mock environment variables for test execution.
- [package.json](file:///c:/Users/POS/Desktop/arabic-master/api/package.json): Added `google-auth-library`.

### New Files Created:
- [google-auth.service.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/modules/auth/google-auth.service.ts): Handles Google token cryptographic verification, code exchange, and atomic account provisioning.
- [google-auth.service.spec.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/modules/auth/google-auth.service.spec.ts): Vitest unit tests verifying Google identity verification, account creation, conflict prevention, and suspended account rejection.

---

## 3. Final Web and Android Authentication Flows

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              1. Next.js Web Flow (No Backend Cookies)                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
Next.js Client                 Next.js Route Handler / Server Action         Express Backend
     │                                      │                                       │
     │── 1. Sign in with Google ───────────>│                                       │
     │      (Google Code or ID Token)       │── 2. POST /api/v1/auth/google ───────>│
     │                                      │      Body: { idToken } or { code }    │
     │                                      │                                       │── Verify with Google
     │                                      │                                       │── Provision/find user
     │                                      │                                       │── Create session
     │                                      │<── 3. JSON: { user, accessToken, ─────│
     │                                      │       refreshToken, ... }             │
     │                                      │   (Express sets 0 cookies)            │
     │                                      │                                       │
     │                                      │── 4. Next.js sets HttpOnly cookies    │
     │                                      │      on app.example.com               │
     │<── 5. Redirect / Return to Client ───│                                       │
```

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         2. Expo Android Flow (Native Sign-In)                          │
└────────────────────────────────────────────────────────────────────────────────────────┘
Expo App (Android)                                                   Express Backend
     │                                                                      │
     │── 1. GoogleSignin.signIn() (Native Google Play Services)             │
     │── 2. Receives Google ID Token                                        │
     │                                                                      │
     │── 3. POST /api/v1/auth/google ──────────────────────────────────────>│
     │      Headers: { "x-client-type": "mobile" }                          │
     │      Body: { "idToken": "<google_id_token>" }                        │
     │                                                                      │── Cryptographic verification
     │                                                                      │── Verify audience & issuer
     │                                                                      │── Find or provision account
     │                                                                      │── Create session & tokens
     │<── 4. JSON: { success: true, data: { user, accessToken, ─────────────│
     │              refreshToken } }                                        │
     │                                                                      │
     │── 5. Store refreshToken in Expo SecureStore                          │
     │── 6. Hold accessToken in memory for API requests                     │
```

---

## 4. API Endpoint Specifications

### `POST /api/v1/auth/google`
- **Rate Limit**: 10 requests per minute per IP.
- **Request Body Options**:
  ```json
  // Option A (Android / Next.js ID Token)
  {
    "idToken": "eyJhbGciOiJSUzI1NiIs..."
  }

  // Option B (Next.js Authorization Code Flow)
  {
    "code": "4/0AeaYSH...",
    "codeVerifier": "optional-pkce-verifier",
    "redirectUri": "https://app.example.com/api/auth/callback/google"
  }
  ```
- **Response Format (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "01944e2b-7c51-7000-8000-000000000001",
        "email": "user@example.com",
        "fullName": "User Name",
        "role": "USER",
        "status": "ACTIVE",
        "emailVerifiedAt": "2026-10-14T10:30:00.000Z",
        "createdAt": "2026-10-14T10:30:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshTokenExpiresAt": "2026-11-13T10:30:00.000Z"
    },
    "message": "Success"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If neither `idToken` nor `code` is provided.
  - `401 Unauthorized`: Token invalid, expired, signature mismatch, unverified email, or account suspended (`{ success: false, message: "..." }`).
  - `409 Conflict`: If an existing email/password account exists with the same email address (`"An account with this email already exists. Log in with your password to link your Google account."`).

---

## 5. Security Decisions & Protections

1. **No Backend Cookie Leakage**:
   The backend does not set cookies on `POST /api/v1/auth/google`. This avoids cross-subdomain cookie issues (`app.example.com` vs. `api.example.com`) and gives Next.js full authority over its own cookies.
2. **Account Takeover Prevention**:
   If an existing user registered with email/password, a Google login with the same email will **not** silently attach to that account. It responds with `409 Conflict`, requiring explicit linking to prevent unauthorized account access.
3. **Atomic Account Provisioning**:
   First-time Google users have their `User` and `AuthIdentity` rows inserted within a single PostgreSQL transaction (`withTransaction`).
4. **Google Identity Verification**:
   Verifies:
   - Cryptographic signature via Google's public certs.
   - Expiration (`exp`).
   - Issuer matches `accounts.google.com` or `https://accounts.google.com`.
   - Audience matches `GOOGLE_CLIENT_ID` or `GOOGLE_ANDROID_CLIENT_ID`.
   - `email_verified === true`.
   - Google `sub` used as the immutable identity key.
5. **Suspended User Enforcement**:
   Accounts marked as `SUSPENDED` are immediately blocked from session generation and an `ACCOUNT_UNAVAILABLE_LOGIN_ATTEMPT` security log is emitted.

---

## 6. Database Changes & Migrations

**0 database migrations required.**
The existing Drizzle schema in [user.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/database/drizzle/schema/user.ts) already had:
- `AuthIdentity` table with `uniqueIndex` on `(provider, providerAccountId)`.
- `authProviderEnum` with `'GOOGLE'`.
- Nullable `passwordHash` on `User`.

---

## 7. Required Environment Variables

Ensure your `.env` contains:
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Optional: Add Android Client ID if different from Web Client ID
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

---

## 8. Verification Results

- **Unit & Integration Tests**:
  - `vitest run` executed: **2 test files passed, 15 tests passed** (including 10 new Google authentication tests in [google-auth.service.spec.ts](file:///c:/Users/POS/Desktop/arabic-master/api/src/modules/auth/google-auth.service.spec.ts)).
- **Typecheck**:
  - `npm run typecheck` (`tsc --noEmit`): **0 errors**.
- **Lint**:
  - `npm run lint` (`oxlint src/`): **0 errors**.
- **Production Build**:
  - `npm run build` (`tsc -p tsconfig.build.json`): **Build succeeded with 0 errors**.