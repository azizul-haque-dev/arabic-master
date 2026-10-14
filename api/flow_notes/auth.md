

# 1. পুরো Auth System-এর Big Picture

সহজভাবে architecture-টা:

```text
Client
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
AuthService
  ↓
Password / Session / Token Service
  ↓
Repository
  ↓
PostgreSQL / Redis
  ↓
Controller
  ↓
Cookie + Response
  ↓
Client
```

এখানে প্রত্যেকটার আলাদা দায়িত্ব।

ধরুন একটা অফিস:

```text
Route       = Reception
Middleware  = Security Check
Controller  = Manager
AuthService = Main Decision Maker
Repository  = Database Clerk
Token       = ID Card Maker
Session     = Attendance / Device Manager
Redis       = Fast Security List
```

এই separation-টাই code-টাকে production-friendly করছে।

---

# 2. Register Flow

User request করল:

```http
POST /auth/register
```

Body:

```json
{
  "email": "arman@example.com",
  "fullName": "Arman Ahmed",
  "password": "12345678"
}
```

Flow:

```text
POST /register
     ↓
Rate Limit
     ↓
Zod Validation
     ↓
AuthController.register()
     ↓
AuthService.register()
     ↓
Email already exists?
     ↓
Password Hash
     ↓
User Create
     ↓
Session Create
     ↓
Access Token + Refresh Token
     ↓
Refresh Token DB-তে hash করে save
     ↓
Redis active session
     ↓
Cookie / Response
```

## Step 2.1 — Rate limit

Route-এ আছে:

```ts
authRoutes.post(
  '/register',
  limit(5),
  validate({ body: registerSchema }),
  AuthController.register,
);
```

অর্থাৎ সরাসরি controller-এ যাচ্ছে না।

প্রথমে:

```text
limit(5)
```

এটার উদ্দেশ্য abuse/brute-force কমানো।

তারপর validation।

---

# 3. Register Validation

আপনার `registerSchema`:

```ts
export const registerSchema = z.strictObject({
  email,
  fullName: z.string().min(2).max(50),
  password: z.string().min(8).max(128),
});
```

এখানে Zod check করবে:

```text
email valid?
fullName 2-50 character?
password 8-128 character?
extra property আছে?
```

কারণ `strictObject()` ব্যবহার করা হয়েছে।

সব ঠিক হলে controller পর্যন্ত request যাবে। Pasted text

---

# 4. Controller Register Receive করে

তারপর:

```ts
register: async (req, res) => {
  const r = await AuthService.register(
    bodyOf<RegisterInput>(req),
    meta(req)
  );

  ok(res, sessionBody(req, res, r.user, r.tokens), 201);
}
```

Controller নিজে password hash করছে না, DB query করছে না।

সে মূলত দুইটা জিনিস বানিয়ে service-এ পাঠাচ্ছে:

```text
dto
+
request metadata
```

`meta(req)` থেকে:

```ts
{
  requestId,
  ipAddress,
  userAgent
}
```

এগুলো security logging/session tracking-এর জন্য দরকার। Pasted text

---

# 5. AuthService.register()

এখন আসল business logic শুরু।

প্রথমে:

```ts
if (await UserService.findByEmail(dto.email))
  throw new ConflictError(
    'An account with this email already exists'
  );
```

মানে:

```text
এই email দিয়ে account আছে?
       ↓
   YES → 409 Conflict
       ↓
    NO → continue
```

এরপর password hash:

```ts
const passwordHash =
  await PasswordService.hash(dto.password);
```

Plain password DB-তে যাচ্ছে না।

---

# 6. Password Argon2 দিয়ে Hash হয়

আপনার `PasswordService` ব্যবহার করছে:

```ts
argon2.argon2id
```

options:

```ts
memoryCost: 65536
timeCost: 3
parallelism: 4
```

তারপর:

```ts
argon2.hash(password, opts)
```

ধরুন password:

```text
arman12345
```

DB-তে এটা রাখা হবে না।

বরং এমন কিছু থাকবে:

```text
$argon2id$v=19$...
```

তাই database leak হলেও plain password সরাসরি পাওয়া যাবে না। Pasted text

---

# 7. User DB-তে Create হয়

এরপর:

```ts
user = await withTransaction((tx) =>
  UserService.createWithPassword(...)
);
```

এখানে transaction ব্যবহার হচ্ছে।

আর একটা গুরুত্বপূর্ণ protection আছে।

আগে email existence check করা হলেও একই মুহূর্তে দুইটা register request আসতে পারে। তাই DB unique constraint error হলেও:

```ts
if (isUniqueViolation(err))
  throw new ConflictError(...)
```

অর্থাৎ duplicate account race condition-ও handle করা হয়েছে। Pasted text

---

# 8. Registration-এর পর Session তৈরি

User create হওয়ার পরে:

```ts
SessionService.createSession({
  userId: user.id,
  ipAddress: meta.ipAddress,
  userAgent: meta.userAgent,
});
```

এখানেই আপনার auth architecture-এর গুরুত্বপূর্ণ অংশ শুরু।

---

# 9. Single Device Login

`createSession()`-এর শুরুতেই:

```ts
await revokeAllSessionsForUser(p.userId);
```

মানে নতুন session বানানোর আগে আগের sessionগুলো invalidate হচ্ছে।

তাই আপনার system বর্তমানে:

> **Single-device/session login model**

ধরুন:

```text
Phone A → Login
       ↓
Session A active

তারপর

Phone B → Login
       ↓
Session A revoke ❌
Session B active ✅
```

এই behaviour আপনার code-এ সরাসরি implement করা হয়েছে। Pasted text

---

# 10. Session DB-তে তৈরি হয়

তারপর:

```ts
SessionRepository.insert({
  id,
  userId,
  deviceId,
  ipAddress,
  userAgent,
  expiresAt
});
```

অর্থাৎ JWT দিয়েই শুধু authentication করছেন না।

আপনার একটা server-side session-ও আছে।

এটা গুরুত্বপূর্ণ।

Architecture:

```text
JWT
 +
Database Session
 +
Refresh Token Record
 +
Redis
```

এটাকে pure stateless JWT auth বলা যাবে না; JWT-এর পাশাপাশি server-side session state আছে।

---

# 11. Access Token তৈরি

এরপর:

```ts
TokenService.generateAccessToken(
  userId,
  session.id
);
```

Payload:

```ts
{
  sub: userId,
  type: "access",
  sessionId,
  jwtId
}
```

তারপর sign:

```ts
jwt.sign(
  payload,
  JWT_ACCESS_SECRET,
  {
    algorithm: "HS256",
    expiresIn: ...
  }
);
```

`sub` হচ্ছে user identity।

`sessionId` বলে token কোন login session-এর।

`jwtId` হচ্ছে ওই নির্দিষ্ট JWT-এর unique ID। Pasted text

---

# 12. Refresh Token তৈরি

এরপর:

```ts
TokenService.generateRefreshToken(
  userId,
  session.id
);
```

Payload প্রায় একই:

```ts
{
  sub: userId,
  type: "refresh",
  sessionId,
  jwtId
}
```

কিন্তু secret আলাদা:

```text
Access Token
→ JWT_ACCESS_SECRET

Refresh Token
→ JWT_REFRESH_SECRET
```

এটা ভালো separation।

Refresh token সাধারণত access token-এর চেয়ে বেশি সময় valid থাকে। Pasted text

---

# 13. Refresh Token সরাসরি DB-তে রাখা হয় না

এই অংশ খুব গুরুত্বপূর্ণ।

Code:

```ts
tokenHash:
  TokenService.hashToken(refreshToken)
```

Hash হয়:

```ts
HMAC SHA-256
```

অর্থাৎ:

```text
Actual Refresh Token
        ↓
       HMAC
        ↓
Hashed Token
        ↓
Database
```

DB leak হলেও actual refresh token সরাসরি DB থেকে পাওয়া যাবে না। Pasted text

---

# 14. Redis-এ Active Session রাখা হয়

তারপর:

```ts
RedisService.setActiveSession(
  userId,
  session.id,
  ttl
);
```

তাই আপনার authentication-এ DB-এর পাশাপাশি Redis-ও session/security checking-এর কাজে আছে।

শেষে `createSession()` return করে:

```ts
{
  sessionId,
  accessToken,
  refreshToken,
  refreshTokenExpiresAt
}
```

পুরো session creation flow-টা এখানে দেখা যায়। Pasted text

---

# 15. Register Response Client-এ যায়

আবার controller-এ ফিরে আসি।

```ts
sessionBody(req, res, user, tokens)
```

এখানে system client type check করছে:

```ts
Boolean(req.headers['x-client-type'])
```

তার মানে আপনার backend **Web এবং non-cookie client/mobile-এর জন্য আলাদা token delivery strategy** রেখেছে।

### Web client

Refresh token cookie-তে:

```text
Response body:
{
  user,
  accessToken
}

Cookie:
refreshToken
csrf_token
```

### Mobile/non-cookie client

```text
{
  user,
  accessToken,
  refreshToken
}
```

এই branching controller-এর `sessionBody()`-তে আছে। Pasted text

---

# 16. Web Cookie Security

Web হলে:

```ts
setAuthCookies(...)
```

দুইটা cookie set হচ্ছে:

```text
Refresh Token Cookie
CSRF Token Cookie
```

Refresh cookie-তে:

```ts
httpOnly: env.AUTH_COOKIE_HTTP_ONLY
```

আর CSRF cookie ইচ্ছা করে:

```ts
httpOnly: false
```

কারণ client JS-কে CSRF token পড়তে হবে double-submit CSRF strategy-এর জন্য।

Cookie path-ও পুরো website নয়; auth path-এ scoped:

```ts
/${API_PREFIX}/v1/auth
```

Pasted text

---

# 17. Login Flow

এখন login।

```http
POST /auth/login
```

Flow:

```text
Login Request
   ↓
Rate Limit
   ↓
Zod Validation
   ↓
Controller
   ↓
AuthService.login()
   ↓
User find by email
   ↓
Password verify
   ↓
Account ACTIVE?
   ↓
Old session revoke
   ↓
New session
   ↓
Access Token
   ↓
Refresh Token
   ↓
Refresh hash DB
   ↓
Redis
   ↓
Cookie / Response
```

---

# 18. Email দিয়ে User খোঁজা হয়

```ts
const user =
  await UserService.findByEmail(dto.email);
```

তারপর:

```ts
const valid = user?.passwordHash
  ? await PasswordService.verify(
      user.passwordHash,
      dto.password
    )
  : await PasswordService.verifyDummy(dto.password);
```

এখানে `verifyDummy()` খুব interesting।

---

# 19. User না থাকলেও Dummy Password Verify কেন?

ধরুন attacker login API-তে email পাঠাচ্ছে।

যদি:

```text
existing email → Argon2 verify → slow
non-existing email → instantly error
```

তাহলে response time দেখে attacker আন্দাজ করতে পারে:

> “এই email-এর account আছে!”

এটা timing attack/user enumeration-এর একটা side channel হতে পারে।

তাই user না থাকলেও:

```ts
verifyDummy(password)
```

Argon2 operation চালানো হচ্ছে।

ফলে timing কাছাকাছি রাখার চেষ্টা করা হচ্ছে। Pasted text

---

# 20. Invalid Login

যদি:

```text
user নেই
OR
passwordHash নেই
OR
password wrong
```

তাহলে:

```ts
security.log({
  event: 'LOGIN_FAILED'
});
```

তারপর:

```ts
throw new UnauthorizedError(
  'Invalid credentials'
);
```

খেয়াল করুন backend বলছে না:

```text
"Email doesn't exist"
```

বা:

```text
"Password incorrect"
```

দুই ক্ষেত্রেই:

```text
Invalid credentials
```

এটাও account enumeration কমাতে সাহায্য করে।

---

# 21. Account ACTIVE কিনা Check

Password ঠিক হলেও:

```ts
if (user.status !== UserStatus.ACTIVE)
```

তাহলে login reject।

মানে:

```text
Correct email
+
Correct password
+
ACTIVE account
        ↓
Login allowed
```

এরপর নতুন session create হয়। Pasted text

---

# 22. Login Success-এর পর Register-এর মতোই Session Flow

এখন আবার:

```text
SessionService.createSession()
        ↓
Old sessions revoke
        ↓
New DB session
        ↓
Access Token
        ↓
Refresh Token
        ↓
Refresh hash DB
        ↓
Redis active session
        ↓
Return tokens
```

তাই **Register এবং Login-এর session অংশ একই infrastructure reuse করছে।**

---

# 23. Protected API কীভাবে কাজ করে?

ধরুন:

```http
GET /auth/me
```

Route:

```ts
authRoutes.get(
  '/me',
  authenticate,
  AuthController.me
);
```

এখানে সরাসরি controller call হয় না।

আগে:

```text
authenticate
```

তারপর:

```text
AuthController.me
```

Controller ধরে নিচ্ছে `authenticate` সফল হলে:

```ts
req.auth
```

available থাকবে।

তারপর:

```ts
const user =
  await UserService.findById(req.auth!.userId);
```

এবং safe user return করে। Pasted text

অর্থাৎ conceptually:

```text
Authorization: Bearer ACCESS_TOKEN
             ↓
authenticate middleware
             ↓
Access token verify
             ↓
req.auth তৈরি
             ↓
Controller
             ↓
req.auth.userId
             ↓
User fetch
```

তবে আপনার দেওয়া file-এ `authenticate.ts` implementation নেই, তাই ওই middleware-এর internal verification steps এই source থেকে নিশ্চিত করে বলা যাবে না।

---

# 24. Access Token Expire হলে কী হবে?

ধরুন access token short-lived।

একসময়:

```text
Access Token ❌ Expired
```

User-কে আবার password দিয়ে login করাতে চাই না।

এজন্যই Refresh Token।

Client call করবে:

```http
POST /auth/refresh
```

Route:

```ts
authRoutes.post(
  '/refresh',
  limit(20),
  csrfGuard,
  refreshGuard,
  AuthController.refresh
);
```

Order খুব গুরুত্বপূর্ণ:

```text
Request
 ↓
Rate Limit
 ↓
CSRF Guard
 ↓
Refresh Guard
 ↓
Controller
```

Pasted text

---

# 25. Refresh Guard-এর কাজ

Controller-এ:

```ts
AuthService.refresh(
  req.refreshToken!,
  meta(req)
);
```

এখানে `req.refreshToken` আসলে raw string না—service signature অনুযায়ী এটি `ValidatedRefreshToken` shape-এর data হিসেবে ব্যবহৃত হচ্ছে:

```ts
{
  sub,
  type: "refresh",
  sessionId,
  jwtId,
  rawToken
}
```

Type definition-এ সেটাই আছে। Pasted text

তাই `refreshGuard` আগে refresh token validate/prepare করছে—এটা code structure থেকে বোঝা যায়। তবে guard-এর actual source এখানে দেওয়া নেই, তাই ঠিক cookie/body থেকে কীভাবে নেয় বা কোন checks করে সেটা এই file থেকে পুরোপুরি verify করা যাচ্ছে না।

---

# 26. Refresh Token Rotation

এটাই আপনার system-এর সবচেয়ে গুরুত্বপূর্ণ security feature-গুলোর একটি।

Call:

```ts
SessionService.rotateRefreshToken(...)
```

ধরুন বর্তমানে:

```text
Access Token = A1
Refresh Token = R1
```

Access token expire হলো।

Client পাঠাল:

```text
R1
```

Server successful হলে দেয়:

```text
Access Token = A2
Refresh Token = R2
```

আর:

```text
R1 → revoked
```

এরপর next refresh:

```text
R2
 ↓
A3 + R3

R2 → revoked
```

এটাই **Refresh Token Rotation**।

---

# 27. প্রথমে Refresh Token-এর DB Record খোঁজা হয়

Token-এর `jwtId` দিয়ে:

```ts
const existing =
  await SessionRepository.findRefreshByJwtId(jwtId);
```

তারপর check:

```ts
if (!existing ||
    existing.sessionId !== sessionId)
  throw invalid();
```

মানে JWT-এর তথ্য আর database record মিলতে হবে।

---

# 28. Session-ও Valid হতে হবে

এরপর:

```ts
const session =
  await SessionRepository.findById(sessionId);
```

তারপর:

```text
session exists?
session revoked?
refresh expired?
```

কোনো সমস্যা হলে:

```text
401 Invalid or expired refresh token
```

Pasted text

---

# 29. Refresh Token Reuse Detection

এই অংশটা খুব গুরুত্বপূর্ণ।

```ts
const isReuse =
  existing.revokedAt !== null ||
  existing.tokenHash !==
    TokenService.hashToken(rawToken);
```

ধরুন:

```text
R1 legitimate user ব্যবহার করল
          ↓
R1 revoked
          ↓
R2 issued
```

কিন্তু attacker আগে R1 চুরি করেছিল।

সে পরে আবার:

```text
R1
```

ব্যবহার করল।

Server দেখবে:

```text
R1 already revoked
```

তাহলে:

```ts
await revokeSession(sessionId);
```

মানে শুধু request reject নয়—

> **পুরো session revoke করে দেওয়া হচ্ছে।**

Security log:

```text
REFRESH_TOKEN_REUSE_DETECTED
```

Pasted text

---

# 30. নতুন Access + Refresh Token বানানো হয়

সব ঠিক থাকলে:

```text
old R1
 ↓
generate A2
generate R2
```

তারপর transaction-এর মধ্যে old token claim করা হয়:

```ts
claimRefresh(existing.id, tx)
```

এটার উদ্দেশ্য concurrent refresh ঠেকানো।

---

# 31. Concurrent Refresh Race Protection

ধরুন একই refresh token দিয়ে একই সময়ে দুইটা request:

```text
             R1
          /      \
Request A          Request B
```

দুটোই যদি সফল হয়, security problem তৈরি হতে পারে।

তাই database atomic update:

```text
R1 revokedAt IS NULL
        ↓
set revokedAt
```

শুধু একজন claim করতে পারবে।

```text
Request A → claim success ✅
Request B → claim.length === 0 ❌
```

আর race detect হলে code পুরো session revoke করে এবং:

```text
CONCURRENT_REFRESH_RACE_DETECTED
```

log করে। Pasted text

---

# 32. Old Refresh → New Refresh Relation রাখা হয়

নতুন refresh token DB-তে insert করার পরে:

```ts
linkReplacement(
  existing.id,
  created.id
);
```

Conceptually:

```text
R1
 ↓ replacedBy
R2
 ↓ replacedBy
R3
```

এভাবে refresh token family/chain track করা যায়।

Repository-তে `replacedByTokenId` update করা হচ্ছে। Pasted text

---

# 33. Refresh শেষে Web বনাম Mobile

Controller আবার client type দেখে।

Mobile/non-cookie:

```json
{
  "accessToken": "A2",
  "refreshToken": "R2"
}
```

Web:

```json
{
  "accessToken": "A2"
}
```

এবং নতুন:

```text
R2 → HttpOnly cookie
```

পুরোনো cookie নতুন refresh token দিয়ে replace হয়ে যায়। Pasted text

---

# 34. Logout Flow

User:

```http
POST /auth/logout
Authorization: Bearer ACCESS_TOKEN
```

Route:

```ts
authenticate
↓
AuthController.logout
```

Controller:

```ts
AuthService.logout(
  req.auth!.sessionId,
  meta(req)
);
```

তারপর:

```ts
SessionService.revokeSession(sessionId);
```

---

# 35. Session Revoke করলে কী হয়?

একসাথে:

```ts
SessionRepository.revoke(sessionId)

SessionRepository.revokeRefreshBySession(sessionId)
```

অর্থাৎ:

```text
Session → revoked
Refresh tokens → revoked
```

তারপর:

```ts
cacheRevoked(sessionId)
```

Redis-এ revoked session cache করা হয় access token TTL পর্যন্ত। Pasted text

Web হলে cookies-ও clear:

```ts
clearAuthCookies(res);
```

শেষে:

```json
{
  "message": "Logged out"
}
```

---

# 36. Logout All

Endpoint:

```http
POST /auth/logout-all
```

এখানে:

```ts
SessionService.revokeAllSessionsForUser(userId)
```

প্রথমে user-এর open session IDs বের করে:

```ts
findOpenIdsByUser(userId)
```

তারপর:

```text
সব Session revoke
+
সব Refresh Token revoke
+
প্রত্যেক Session Redis-এ revoked cache
```

Pasted text

বর্তমানে single-device login হওয়ায় সাধারণত active session একটাই থাকবে, কিন্তু architecture multiple session revoke-ও support করার মতো লেখা।

---

# 37. Forgot Password Flow

Request:

```http
POST /auth/forgot-password
```

```json
{
  "email": "arman@example.com"
}
```

Flow:

```text
Request
 ↓
Rate limit
 ↓
Email validation
 ↓
Find user
 ↓
Old reset token invalidate
 ↓
New random reset token
 ↓
Hash token
 ↓
Hash DB-তে save
 ↓
Raw token email link-এ
 ↓
Generic response
```

---

# 38. User না থাকলে কেন Error দেয় না?

Code:

```ts
const user =
  await UserService.findByEmail(emailAddress);

if (!user?.passwordHash) return;
```

কিন্তু controller সবসময় response দেয়:

```text
If the account exists,
password reset instructions have been sent.
```

এটা intentional।

না হলে attacker পরীক্ষা করতে পারত:

```text
arman@gmail.com
→ "Email sent"

xyz@gmail.com
→ "User not found"
```

এবং registered email বের করতে পারত।

তাই response intentionally generic। Pasted text

---

# 39. Reset Token কীভাবে তৈরি হয়?

```ts
generateResetToken()
```

ভেতরে:

```ts
const rawToken =
  randomUUIDv7() + randomUUIDv7();

return {
  rawToken,
  hash: hashToken(rawToken)
};
```

তারপর DB-তে যায়:

```text
hash
```

Email-এ যায়:

```text
rawToken
```

অর্থাৎ password reset token-ও plaintext DB-তে রাখা হচ্ছে না। Pasted text

---

# 40. Reset Password

User email link click করল:

```text
/reset-password?token=ABC...
```

তারপর frontend backend-এ পাঠাবে:

```http
POST /auth/reset-password
```

```json
{
  "token": "ABC...",
  "newPassword": "new-password"
}
```

Backend raw token hash করে:

```ts
TokenService.hashToken(rawToken)
```

তারপর DB থেকে matching reset token বের করে।

Check:

```text
Token exists?
 ↓
Already used?
 ↓
Expired?
```

invalid হলে:

```text
Invalid or expired reset token
```

---

# 41. Password Change + Token Used

Valid হলে নতুন password:

```ts
PasswordService.hash(newPassword)
```

তারপর transaction:

```text
Update password
+
Mark reset token used
```

এরপর সবচেয়ে গুরুত্বপূর্ণ:

```ts
SessionService.revokeAllSessionsForUser(
  token.userId
);
```

অর্থাৎ password reset করলে আগের login/session আর valid থাকবে না।

এটা stolen session থেকে user-কে recover করতে সাহায্য করে। Pasted text

---

# 42. পুরো Login Lifecycle এক ছবিতে

এটা মাথায় রাখলে আপনার পুরো architecture অনেক সহজ লাগবে:

```text
┌───────────────┐
│ POST /login   │
└───────┬───────┘
        ↓
   Rate Limit
        ↓
   Zod Validate
        ↓
 AuthController
        ↓
  AuthService
        ↓
 Find User by Email
        ↓
 Argon2 Verify Password
        ↓
 Account ACTIVE?
        ↓
┌─────────────────────┐
│ SessionService      │
└─────────┬───────────┘
          ↓
 Revoke old sessions
          ↓
 Create DB Session
          ↓
     ┌────┴────┐
     ↓         ↓
 Access JWT   Refresh JWT
     │         │
     │         ↓
     │      Hash Token
     │         ↓
     │      Save DB
     │
     ↓
 Redis Active Session
          ↓
      Response
     /          \
    /            \
 Web            Mobile
 ↓                ↓
Access body      Access body
Refresh cookie  Refresh body
CSRF cookie     Refresh body
```

---

# 43. তারপর Normal API Usage

Login হয়ে যাওয়ার পর:

```text
Client
  │
  │ Access Token
  ↓
Protected API
  ↓
authenticate
  ↓
req.auth
  ↓
Controller
  ↓
Response
```

Access token expire হলে:

```text
Protected API
     ↓
Access expired ❌
     ↓
POST /refresh
     ↓
CSRF Guard (web)
     ↓
Refresh Guard
     ↓
R1 validate
     ↓
DB Session check
     ↓
Reuse check
     ↓
R1 revoke
     ↓
A2 + R2 generate
     ↓
R2 hash DB
     ↓
Return A2
+
Replace R1 cookie with R2
```

তারপর আবার:

```text
A2 → Protected API
```

---

# 44. আপনার Auth-এর সবচেয়ে গুরুত্বপূর্ণ Mental Model

এখানে চারটা জিনিসকে আলাদা করে বুঝবেন:

**Access Token** হলো অল্প সময়ের **ID Card**। Protected API call করার সময় দেখাবেন।

**Refresh Token** হলো নতুন ID Card বানানোর **special pass**। এটা দিয়ে normal API access করা উচিত না; access token expire হলে নতুন token pair নেওয়ার জন্য।

**Session** হলো server-এর record:

```text
"এই user-এর এই login/device এখনো allowed কি না?"
```

আর **Redis** হলো fast security/cache layer—active/revoked session information দ্রুত কাজে লাগানোর জন্য।

তাই architecture-টা হচ্ছে:

```text
              USER
                │
              LOGIN
                ↓
        ┌───────────────┐
        │    SESSION    │
        └───────┬───────┘
                │
        ┌───────┴────────┐
        ↓                ↓
 ACCESS TOKEN       REFRESH TOKEN
        │                │
        ↓                ↓
 Protected API      Token Rotation
                         │
                         ↓
                    New Access
                         +
                    New Refresh
```

সবচেয়ে গুরুত্বপূর্ণ chain:

```text
Register/Login
   ↓
Validate credentials
   ↓
Create Session
   ↓
Create Access + Refresh
   ↓
Refresh hash → Database
   ↓
Session → Database/Redis
   ↓
Access → API authorization
   ↓
Access expires
   ↓
Refresh Token
   ↓
Old Refresh revoke
   ↓
New Access + New Refresh
   ↓
Logout
   ↓
Session + Refresh revoke
```

