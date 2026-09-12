Arabic Master
অবশ্যই। আমি এটাকে শুধু feature list হিসেবে না রেখে development-ready Product Requirements Document (PRD) হিসেবে সাজাব, যাতে পরে database schema, API এবং UI flow বানানোর সময় contradiction না থাকে।

Arabic Master — Product Requirements Document

Product: Arabic Master
Purpose: বাংলা ও English-speaking users-এর জন্য practical spoken Arabic শেখার mobile application
Primary Use Case: বিশেষ করে দৈনন্দিন জীবনে ব্যবহারযোগ্য Arabic speaking, vocabulary, sentences এবং conversations শেখানো।

---

1. Product Goal

Arabic Master-এর লক্ষ্য হলো beginner থেকে advanced level পর্যন্ত users-কে practical spoken Arabic শেখানো।

Product-এর learning experience হবে:

Learn → Practice → Complete → Earn XP → Build Streak → Progress

Free users basic learning content ব্যবহার করতে পারবে এবং বিজ্ঞাপন দেখতে হবে। Pro users premium curriculum এবং ad-free experience পাবে।

---

2. Target Users

Primary Users

- Bangla-speaking Arabic learners
- English-speaking Arabic learners
- Saudi Arabia এবং Gulf countries-এ বসবাসকারী Arabic learners
- Beginner Arabic learners
- Daily-life Arabic speaking শিখতে চাওয়া users

Learning Goals

Users Arabic শিখতে পারে:

- Daily life
- Work
- Shopping
- Restaurant
- Transportation
- Conversation
- General communication

---

3. Onboarding

Onboarding-এর উদ্দেশ্য হলো user-এর language, location, learning goal, current level এবং available practice time জানা।

Step 1 — Select Language

Question:

How do you want to learn Arabic?

Options:

- বাংলা
- English

Selected language application-এর UI এবং learning explanation-এর language নির্ধারণ করবে।

---

Step 2 — Select Country

Question:

Where do you live?

Examples:

- Saudi Arabia
- UAE
- Qatar
- Kuwait
- Bahrain
- Oman
- Other

Country ব্যবহার হবে learning context এবং content personalization-এর জন্য।

Important: Country automatically dialect নির্ধারণ করবে না।

---

Step 3 — Learning Purpose

Question:

Why are you learning Arabic?

Multiple selections allowed.

Options:

- Shopping
- Work
- Restaurant
- Transportation
- Daily Life
- Speaking with People
- General Learning

Selected goals অনুযায়ী Home এবং recommended learning content personalize করা হবে।

---

Step 4 — Arabic Level

Question:

How much Arabic do you know?

Options:

Beginner

I know almost nothing.

Basic

I know some Arabic words and phrases.

Intermediate

I can understand and speak simple Arabic.

---

Step 5 — Daily Practice Time

Question:

How much time can you practice each day?

Options:

- 5 minutes
- 10 minutes
- 15 minutes
- 20+ minutes

Selected time daily learning goal হিসেবে ব্যবহার হবে।

---

4. Guest Experience

User account তৈরি না করেও application ব্যবহার করতে পারবে।

Guest users can:

- Complete onboarding
- Access free content
- Learn words
- Learn sentences
- Practice beginner conversations
- Earn XP
- Build streak
- Use hearts
- Watch rewarded ads for hearts

Guest users-এর premium content access থাকবে না।

Account Conversion

User-এর meaningful progress তৈরি হওয়ার পরে account creation prompt দেখানো হবে।

Example:

«You've learned 42 words.
Create an account to keep your progress.»

---

5. Authentication

Application-এ দুই ধরনের authentication থাকবে:

Social Authentication

- Google

Credential Authentication

- Email
- Password

---

Email Verification

Credential registration flow:

Register
↓
Enter email + password
↓
Verification email
↓
Verify email
↓
Account activated

Unverified users-এর জন্য appropriate verification reminder থাকবে।

---

6. Password Reset

User password ভুলে গেলে:

Forgot Password
↓
Enter email
↓
Receive reset email
↓
Reset password
↓
Login

Password reset token-এর expiry থাকবে।

---

7. Device / Session Management

এক user account একই সময়ে একটি active device/session ব্যবহার করতে পারবে।

New device login হলে previous active session revoke করা হবে।

Recommended flow:

New device login
↓
Existing session detected
↓
Confirm login
↓
Old session revoked
↓
New device active

এটি account sharing এবং unauthorized sessions কমাতে সাহায্য করবে।

---

8. User Roles

System-এ তিনটি role থাকবে:

USER
CONTENT_MANAGER
ADMIN

---

USER

Regular learner।

Permissions:

- View learning content
- Complete lessons
- Practice
- Earn XP
- Maintain streak
- Use hearts
- Manage own account
- Purchase Pro

---

CONTENT_MANAGER

Content creation এবং management-এর জন্য।

Can:

- Create content
- Generate content
- Edit draft content
- Reorder draft content
- Submit content for review

Cannot:

- Delete published content
- Publish content
- Manage users
- Manage subscriptions
- Change system settings

Content Manager-এর changes review/publishing-এর জন্য Admin approval প্রয়োজন হবে।

---

ADMIN

Full system access।

Can:

- Create
- Read
- Update
- Delete
- Reorder
- Publish
- Archive content
- Manage users
- Manage Content Managers
- Manage subscriptions
- Manage system configuration

---

9. Content Workflow

Content lifecycle:

DRAFT
↓
IN_REVIEW
↓
APPROVED
↓
PUBLISHED
↓
ARCHIVED

Content Manager সাধারণত Draft তৈরি ও edit করবে।

Admin review করে publish করবে।

AI-generated content সরাসরি production-এ publish করা যাবে না; review workflow থাকা উচিত।

---

10. Learning Content Architecture

Core hierarchy:

Course
↓
Section
↓
Lesson
↓
Content Items

Content Item হতে পারে:

- Word
- Sentence
- Conversation

---

11. Free Content

Free users তিনটি primary learning area access করবে:

Word
Sentence
Conversation

---

12. Free Word Course

Structure:

Word Course
↓
Section
↓
Lessons
↓
Words

একটি Section-এ সাধারণত:

20–30 words

একটি lesson-এ:

5 words

Example:

Section: Shopping

Lesson 1
├── Price
├── Money
├── Cheap
├── Expensive
└── Buy

Lesson 2
├── ...

---

13. Free Sentence Course

Structure:

Sentence Course
↓
Section
↓
Lesson
↓
Sentences

Sentence content practical spoken Arabic-এর উপর ভিত্তি করে হবে।

Examples:

- Shopping
- Restaurant
- Work
- Transportation
- Daily life

---

14. Free Conversation Course

Guest এবং Free users শুধুমাত্র:

Beginner Conversation

access করতে পারবে।

Higher-level conversation locked থাকবে।

Example:

Conversation
├── Beginner ✓
├── Elementary 🔒
├── Intermediate 🔒
└── Advanced 🔒

---

15. Pro Curriculum Course

Pro users-এর জন্য dedicated structured Arabic curriculum থাকবে।

Levels:

Beginner
↓
Elementary
↓
Intermediate
↓
Advanced

Curriculum learning sequence maintain করবে।

Example:

Beginner
│
├── Greetings
├── Introducing Yourself
├── Family
├── Numbers
├── Shopping
├── Restaurant
├── Transportation
└── Daily Life

প্রতিটি section-এর মধ্যে বিভিন্ন learning format থাকতে পারে:

Section
├── Words
├── Sentences
└── Conversation

---

16. Pro Word Lessons

Pro curriculum-এর word section-এ:

Maximum recommended: 10 words per lesson

যদি section-এ 30 words থাকে:

Lesson 1 → 10
Lesson 2 → 10
Lesson 3 → 10

Lesson size configurable হওয়া উচিত, hard-coded নয়।

---

17. Pro Sentence Lessons

Sentence lesson একই curriculum structure follow করবে।

Section
↓
Sentence Lessons
↓
Sentences

Lesson size configurable থাকবে।

---

18. Pro Conversation Lessons

Conversation lessons curriculum-এর নির্দিষ্ট topic-এর সাথে connected থাকবে।

Example:

Section: Restaurant

Words
↓
Sentences
↓
Conversation Practice

এতে একই topic-এর vocabulary → sentence → real conversation learning loop তৈরি হবে।

---

19. Tense Course

Pro users-এর জন্য আলাদা tense-based course থাকবে।

Primary categories:

Past
Present
Future

Tense course verb-focused হবে।

---

20. Arabic Grammar Variants

সব word-এর জন্য:

I
You Male
You Female
He
She
We
They

variant তৈরি করা যাবে না।

কারণ grammatical variation word type-এর উপর নির্ভর করে।

Verb

প্রয়োজন অনুযায়ী:

I
You Male
You Female
He
She
We
They

Noun

প্রয়োজনে:

Singular
Dual
Plural
Masculine
Feminine

Adjective

Gender এবং number অনুযায়ী variation থাকতে পারে।

Content model word type অনুযায়ী grammatical variants support করবে।

---

21. Hearts

Hearts learning/practice protection system হিসেবে কাজ করবে।

Example:

❤️ ❤️ ❤️

Heart এবং lesson unlock আলাদা system হবে।

Important Rule

Heart দিয়ে permanent lesson unlock করা হবে না।

Lesson unlock হবে:

- Curriculum progression
- Previous lesson completion
- Course access
- Free/Pro entitlement

এর ভিত্তিতে।

---

22. Daily Heart Bonus

প্রতিদিন user:

+2 Hearts

bonus পাবে।

Daily bonus একবারই claim করা যাবে।

---

23. Rewarded Advertisement

User-এর heart শেষ হয়ে গেলে rewarded ad দেখে heart পাওয়া যাবে।

Example:

No Hearts

Watch a short ad
↓
+1 Heart

Rewarded ad optional হবে।

---

24. Normal Advertisement

Free users-এর monetization-এর জন্য interstitial advertisement থাকবে।

Recommended initial rule:

প্রতি 2–3 completed lessons-এর পরে 1 interstitial ad।

Example:

Lesson 1
↓
Complete
↓
No Ad

Lesson 2
↓
Complete
↓
Show Ad

Lesson 3
↓
Complete
↓
No Ad

Lesson 4
↓
Complete
↓
Show Ad

Ad lesson completion-এর আগে দেখানো যাবে না।

User প্রথমে:

Lesson Complete
↓
XP Reward
↓
Progress
↓
Continue
↓
Ad (if eligible)

দেখবে।

Ad Frequency

Frequency backend/configuration থেকে পরিবর্তনযোগ্য হবে।

Example:

freeUserAdFrequency = 2

পরে:

2 → 3

করা যাবে app update ছাড়াই।

---

25. Pro Advertisement

Pro users:

- No interstitial ads
- No rewarded ads required for hearts

Pro users-এর hearts system significantly more generous হতে পারে বা unlimited hearts দেওয়া যেতে পারে।

---

26. XP System

XP learning activity-এর measure হিসেবে কাজ করবে।

Possible XP:

Complete Word → +5 XP
Complete Sentence → +5 XP
Complete Lesson → +20 XP
Complete Conversation → +30 XP

Exact values configurable হবে।

---

27. Level System

Level হলো overall learning progression।

Example:

Level 1
↓
Level 2
↓
Level 3
↓
Level 4
...

XP accumulated হলে level increase হবে।

XP এবং Level আলাদা concept হিসেবে maintain করতে হবে।

---

28. Streak System

Streak daily learning habit track করবে।

Example:

Day 1 🔥
Day 2 🔥
Day 3 🔥
Day 4 🔥
Day 5 🔥

User daily minimum learning activity complete করলে streak continue হবে।

Example requirement:

At least one qualifying learning activity per day.

---

29. Progress Tracking

System user-এর learning progress track করবে।

Trackable data:

- Course progress
- Section progress
- Lesson progress
- Completed words
- Completed sentences
- Completed conversations
- XP
- Level
- Streak
- Hearts
- Last learning activity

---

30. Free vs Pro Access

Feature| Guest| Free User| Pro
Onboarding| ✓| ✓| ✓
Free Words| ✓| ✓| ✓
Free Sentences| ✓| ✓| ✓
Beginner Conversation| ✓| ✓| ✓
Advanced Conversation| ✕| ✕| ✓
Pro Curriculum| ✕| ✕| ✓
Tense Course| ✕| ✕| ✓
Interstitial Ads| ✓| ✓| ✕
Rewarded Heart Ads| ✓| ✓| Optional
XP| ✓| ✓| ✓
Streak| ✓| ✓| ✓
Level| ✓| ✓| ✓

---

31. Pro Subscription

Pro subscription-এর initial product থাকবে:

1 Year Access

Subscription record-এ অন্তত:

user
plan
status
startedAt
expiresAt
provider
transactionId

থাকবে।

"isPro" boolean-এর উপর subscription system নির্ভর করা উচিত নয়।

Access entitlement "expiresAt" এবং subscription status থেকে determine করা হবে।

---

32. Home Experience

Home user-এর onboarding এবং learning progress অনুযায়ী personalized হবে।

Recommended structure:

Greeting

🔥 Streak
⭐ XP
❤️ Hearts

Today's Goal
0 / 10 min

Continue Learning
[Current Lesson]

Recommended
[Based on onboarding goals]

Quick Practice
Words
Sentences
Conversation

---

33. Learning Loop

Primary learning loop:

Discover
↓
Learn
↓
Listen
↓
Practice
↓
Complete
↓
Earn XP
↓
Progress
↓
Continue

Habit loop:

Daily Goal
↓
Learning
↓
XP
↓
Streak
↓
Return Tomorrow

---

34. Personalization

Onboarding data ব্যবহার করে recommendation তৈরি হবে।

Example:

User selects:

Country: Saudi Arabia
Goal: Shopping + Work
Level: Beginner
Daily Goal: 10 min

System recommended content:

Recommended

🛍 Shopping Arabic
💼 Arabic for Work

Continue:
Beginner Lesson 4

---

35. Core Product Principles

Principle 1 — Spoken Arabic First

Content practical spoken Arabic-এর উপর focus করবে।

Principle 2 — Context First

একটি word শুধু dictionary meaning হিসেবে শেখানো হবে না।

User ideally জানবে:

- Meaning
- Pronunciation
- When to use
- Example sentence
- Audio

Principle 3 — Progressive Difficulty

Beginner
→ Elementary
→ Intermediate
→ Advanced

Principle 4 — Small Lessons

Lessons short এবং repeatable হবে।

Principle 5 — Ads Should Not Break Learning

Ads monetization-এর জন্য থাকবে, কিন্তু learning completion-এর reward flow নষ্ট করবে না।

---

36. Important Product Rules

1. Guest users should be able to experience the product before signup.
1. Signup should not unnecessarily block learning.
1. Heart should not permanently unlock lessons.
1. Ads should not appear before lesson completion.
1. Interstitial ad frequency must be configurable.
1. Rewarded ads and normal ads are separate systems.
1. Pro users should receive a clearly better learning experience.
1. Content Manager works primarily with draft content.
1. Admin controls publishing and destructive operations.
1. AI-generated content must pass review before publishing.
1. Grammatical variants depend on word type.
1. Course → Section → Lesson → Content hierarchy should remain consistent.
1. Subscription access must be expiration-based, not only boolean-based.
1. Progress must survive device/session changes for registered users.
1. Content structure should support future curriculum expansion.

---

37. MVP Scope

প্রথম version-এ সব feature একসাথে build করা উচিত নয়।

MVP — Phase 1

Authentication
Onboarding
Guest Mode
Free Word Course
Free Sentence Course
Beginner Conversation
Lesson Progress
XP
Streak
Hearts
Basic Ads
Pro Subscription

Phase 2

Pro Curriculum
Advanced Conversations
Tense Course
Advanced Grammar Variants
Content Manager
Admin Review Workflow
Personalized Recommendations

Phase 3

Advanced personalization
More dialect support
Advanced analytics
Adaptive learning
AI-powered practice
Speaking evaluation

---

38. Success Metrics

Product-এর success শুধু number of registered users দিয়ে measure করা উচিত নয়।

Important metrics:

Activation

- Onboarding completion rate
- First lesson start rate
- First lesson completion rate

Learning

- Lessons completed/user
- Words learned/user
- Daily learning time
- Weekly active learners

Retention

- Day 1 retention
- Day 7 retention
- Day 30 retention
- Streak continuation

Monetization

- Free → Pro conversion
- Ad impressions/user
- Rewarded ad usage
- Pro renewal rate

Learning Quality

- Lesson completion rate
- Practice success rate
- Repeat lesson rate
- Conversation completion rate

---

39. Recommended Initial Product Strategy

Arabic Master-এর core differentiation হওয়া উচিত:

«Practical spoken Arabic for real-life situations.»

শুধু আরেকটি vocabulary app বানালে differentiation দুর্বল হবে।

Strong positioning:

Learn the Arabic you actually need to speak.

Learning architecture:

Real Situation
↓
Words
↓
Sentences
↓
Conversation
↓
Practice
↓
Progress

এটাই product-এর central learning loop হওয়া উচিত।

---

40. Final Recommended Architecture

ARABIC MASTER
│
├── Onboarding
│ ├── Language
│ ├── Country
│ ├── Goals
│ ├── Level
│ └── Daily Goal
│
├── Authentication
│ ├── Guest
│ ├── Email/Password
│ ├── Google
│ ├── Email Verification
│ ├── Password Reset
│ └── Device Session
│
├── Learning
│ ├── Word
│ ├── Sentence
│ ├── Conversation
│ ├── Free Courses
│ └── Pro Curriculum
│
├── Progress
│ ├── XP
│ ├── Level
│ ├── Streak
│ ├── Hearts
│ └── Lesson Progress
│
├── Monetization
│ ├── Free
│ ├── Ads
│ ├── Rewarded Ads
│ └── 1-Year Pro
│
└── CMS
├── Content Manager
├── Draft
├── Review
├── Publish
└── Admin

Product priority: Learning quality > retention mechanics > monetization.

Ads, hearts, XP এবং streak গুরুত্বপূর্ণ হলেও এগুলো learning experience-এর supporting systems—মূল product নয়। মূল product হলো user-কে বাস্তব Arabic বলতে শেখানো।পরের ধাপে আমি এই requirement অনুযায়ী complete Prisma/PostgreSQL database schema + proper relations + composite indexes + unique constraints তৈরি করব।

How can I help you today?

Recents
Untitled
36 minutes ago
Untitled
4 days ago
Home page generation from Design.md
Sep 5
User model design
Sep 5
Production grade SaaS tech stack recommendation
Sep 4
Senior software engineer career improvement
Sep 2
Instructions
Add instructions to tailor Claude’s responses

Memory
Only you
Purpose & context Azizul is a senior-level software engineer building "Arabic Master" — a mobile-first Arabic language learning app targeting Bengali-speaking (Bangladeshi) users, comparable in concept to Duolingo. The product spans a Flutter mobile app, a NestJS/PostgreSQL/Prisma backend, and a Next.js admin CMS panel. Azizul communicates naturally in a Banglish (Bengali-English mixed) style and prefers direct, no-fluff responses with honest trade-off analysis — future interactions should mirror this register. The project has a Bengali-speaking target audience, which drives key decisions around script support (Bengali fonts), local payment infrastructure (bKash, Nagad), and an Android-first launch strategy. Current state The CMS admin panel (Phase 3) is the most recently active workstream. Three content milestones have been delivered as a fully scaffolded Next.js app: Arabic Entities (canonical reusable Arabic text layer — the foundation) Words (vocabulary referencing entities) Sentences (practical phrases referencing entities) Each milestone includes: list views, detail views, create/edit dialogs with entity-first workflow, role-aware review action bars, loading skeletons, not-found states, and mock data files. The generic ContentDataTable component is proven reusable across all content types. Eight live routes exist; sidebar shows Courses, Sections, Lessons, and Conversations as "Soon." The final packaged output is a zip at /mnt/user-data/outputs/arabic-entities-cms.zip (excluding nodemodules and .next), verified with tsc --noEmit (zero errors), ESLint (zero warnings), and npm run build. On the horizon Conversations milestone (next CMS content type): built from Sentences, never directly from Arabic Entities Courses, Sections, Lessons CMS screens Completing the login page (Azizul previously completed this independently) Real API connection replacing mock data throughout the CMS Backend implementation phases per the master architecture document Key learnings & principles Design.md is the single source of truth for design tokens. A color conflict exists between the CMS spec (emerald #0F766E) and Design.md (#0e7a5d); Claude consistently defers to Design.md. This needs reconciliation before shipping. ArabicEntity is the canonical layer: all content types (Words, WordVariants, Sentences, ConversationTurns) reference it via normalizedText-based deduplication and a findOrCreate pattern, enabling audio reuse across the system. One-active-device enforcement is intentional: implemented via Redis (user:{id}:activesession key) as fast-path, with the Session table as source of truth — no token rotation complexity. Subscription access is derived from expiresAt and status, not an isPro boolean. Idempotency keys on all completion endpoints, backed by Redis TTL and DB unique constraints. Grammar variants (conjugation tables for Words) are intentionally deferred to Phase 2 per PRD. The topbar role switcher (Admin/Content Manager toggle) is dev-only, not for production. Android-first launch: SSLCommerz integrated via WebView checkout enables bKash/Nagad payments without Play Store policy violations. iOS uses standard Apple IAP at a higher price point. Manual/WhatsApp payment flows do not scale — proper gateway integration from day one is the right call. Azizul explicitly corrected an earlier recommendation to drop one-active-device enforcement; Claude complied cleanly. Azizul also flagged that font sizes should be in rem not px — Claude acknowledged this was an error of omission. Approach & patterns Azizul scopes milestones clearly upfront, then executes sequentially (entity layer first, then dependent content types). Mock data is used throughout the CMS until real API integration is ready — no premature backend coupling. Each deliverable is verified: tsc --noEmit, ESLint, and npm run build before delivery. Google Fonts are temporarily swapped for system fonts during sandbox builds, then restored. Architecture decisions are made via structured Q&A with explicit trade-off reasoning documented. Azizul pushes back on recommendations and expects Claude to comply cleanly when corrected, without over-explaining. Scope discipline is valued: Azizul has been advised (and agreed) to cut content workflow and RBAC CMS features from initial MVP launch. Tools & resources | Layer | Technology | |---|---| | Mobile app | Flutter | | Backend | NestJS, PostgreSQL, Prisma, Redis (BullMQ for jobs) | | Admin CMS | Next.js 16, TypeScript, Tailwind CSS v4, Express | | UI components | shadcn/ui, TanStack Table, react-hook-form, zod | | Package manager | Bun | | Auth (OAuth) | google-auth-library (not Passport) | | Subscriptions | RevenueCat + SSLCommerz/ShurjoPay/AamarPay | | Analytics | PostHog | | Arabic font | Noto Naskh Arabic | | Bengali fonts | Noto Sans Bengali (CMS/design system); Noto Serif Bengali + Hind Siliguri (auth screens) | | Design spec | Design.md (single source of truth for tokens) | DB schema (16 tables for MVP): User, OAuthAccount, Session, PasswordResetToken, EmailVerificationToken, UserProfile, UserProgress, GuestUser, ArabicEntity, plus content/gamification models. UserProgress uses optimistic locking via a version field; tokens are hashed for security; Guest→User conversion is transactional.

Last updated 6 hours ago

Context

Design.md
21.2kB

md

tech stack
4.3kB

text

Project requirement
15.6kB

text

Design.md

# Arabic Master — Design System

> **Purpose:** This document is the single source of truth for the visual design and UX implementation of the Arabic Master web application.
>
> **Rule:** Any new UI, redesigned UI, or generated component MUST follow this document unless a specific feature requirement explicitly overrides it.

---

# 1. Product Identity

**Product:** Arabic Master

**Category:** Language Learning / EdTech

**Design Direction:** Modern Corporate EdTech

Arabic Master should feel:

- Professional
- Educational
- Calm
- Trustworthy
- Modern
- Encouraging
- Structured
- Lightweight
- Easy to use
  The interface should communicate **learning, progress, mastery, and confidence** without looking like a traditional academic platform.

Avoid making the application feel:

- Overly academic
- Childish
- Gamified everywhere
- Overly decorative
- Luxury-focused
- Visually noisy
- Generic AI-generated
  The product should look like a **real production SaaS/EdTech application**.

---

# 2. Core Design Principles

Every screen should follow these principles.

## 2.1 Clarity First

Users should immediately understand:

1. Where they are
2. What they are learning
3. What they can do
4. What action is most important
5. What their current progress is
   Do not sacrifice usability for visual decoration.

---

## 2.2 Visual Hierarchy

Every page must have a clear hierarchy:

```text
Page
 ├── Page Header
 │    ├── Title
 │    └── Description / Actions
 │
 ├── Primary Content
 │
 ├── Secondary Content
 │
 └── Supporting Actions
```

Primary actions must visually dominate secondary actions.

---

## 2.3 Consistency

Do not introduce random:

- Colors
- Border radiuses
- Font sizes
- Shadows
- Button styles
- Spacing values
- Card styles
  Use the design tokens defined in this document.

---

## 2.4 Content Over Decoration

Arabic learning content is the hero.

UI decoration must never compete with:

- Arabic words
- Sentences
- Pronunciation
- Translation
- Examples
- Exercises
- Progress information

---

# 3. Color System

## Primary Brand

```css
--color-primary: #0e7a5d;
--color-primary-dark: #0a5c46;
--color-primary-light: #98f5d1;
```

Use primary green for:

- Primary CTA
- Active navigation
- Active tabs
- Progress indicators
- Selected states
- Important links
- Brand elements
  Do not use primary green as a background for large sections unless intentionally required.

---

## Secondary

```css
--color-secondary: #115e59;
--color-secondary-light: #a8ece5;
```

Use for:

- Secondary navigation
- Supporting interactive elements
- Audio controls
- Secondary highlights
- Learning modules

---

## Accent / Achievement

```css
--color-accent: #d97706;
--color-accent-light: #fef3c7;
```

Use sparingly.

Appropriate use:

- Streak
- Achievement
- Reward
- Review
- Milestones
- Special learning highlights
  Never use amber as the main brand color.

---

## Neutral

```css
--color-text: #0f172a;
--color-text-secondary: #475569;
--color-text-muted: #64748b;

--color-background: #f8fafc;
--color-surface: #ffffff;

--color-border: #e2e8f0;
--color-border-strong: #cbd5e1;
```

---

## Status Colors

### Success

```css
--color-success-bg: #ecfdf5;
--color-success-text: #065f46;
```

### Info

```css
--color-info-bg: #eff6ff;
--color-info-text: #1d4ed8;
```

### Warning / Review

```css
--color-warning-bg: #fef3c7;
--color-warning-text: #92400e;
```

### Error

```css
--color-error: #ba1a1a;
--color-error-bg: #ffdad6;
--color-error-text: #93000a;
```

---

# 4. Typography

## Font Families

### Headings

```text
Plus Jakarta Sans
```

Use for:

- Page titles
- Section titles
- Headings
- Navigation headings
- Large numbers

### Body

```text
Inter
```

Use for:

- Body text
- Metadata
- Buttons
- Labels
- Forms
- English text
- Bengali UI text

---

# 5. Typography Scale

## Display

```text
Font: Plus Jakarta Sans
Size: 48px
Weight: 700
Line Height: 56px
Letter Spacing: -0.02em
```

Mobile:

```text
Size: 36px
Line Height: 44px
```

---

## Heading Large

```text
Font: Plus Jakarta Sans
Size: 32px
Weight: 700
Line Height: 40px
Letter Spacing: -0.015em
```

Mobile:

```text
Size: 26px
Line Height: 34px
```

---

## Heading Medium

```text
Size: 24px
Weight: 600
Line Height: 32px
```

---

## Heading Small

```text
Size: 20px
Weight: 600
Line Height: 28px
```

---

## Body Large

```text
Font: Inter
Size: 18px
Weight: 400
Line Height: 28px
```

---

## Body Medium

```text
Font: Inter
Size: 16px
Weight: 400
Line Height: 24px
```

---

## Body Small

```text
Font: Inter
Size: 14px
Weight: 400
Line Height: 20px
```

---

## Labels

```text
Label Large:
14px / 600 / 20px

Label Medium:
12px / 600 / 16px

Label Small:
11px / 500 / 14px
```

---

# 6. Arabic Typography

Arabic is a primary content language and must receive special treatment.

Arabic text should:

- Support RTL correctly
- Never be unnecessarily truncated
- Have sufficient line height
- Have enough space for tashkeel
- Never vertically clip
- Remain visually dominant over translations
  Recommended learning-content sizing:

```text
Arabic word:
32–40px

Arabic sentence:
24–32px

Small Arabic:
20–24px
```

Arabic line-height:

```text
Minimum: 1.75
```

For important vocabulary or lesson content, prefer larger Arabic text rather than reducing it to fit.

---

# 7. Bengali Typography

Bengali text must remain readable and properly aligned.

Use:

```text
Noto Sans Bengali
```

or the project's configured Bengali-compatible font.

Recommended line-height:

```text
1.5
```

Never allow Bengali glyphs to become clipped.

---

# 8. RTL / LTR

The application supports:

```text
Arabic → RTL
English → LTR
Bengali → LTR
```

Arabic content containers should use:

```html
dir="rtl"
```

Do not manually position Arabic text using arbitrary margins.

Use logical CSS properties:

```css
margin-inline
padding-inline
inset-inline
text-align: start
```

instead of:

```css
margin-left
margin-right
padding-left
padding-right
```

when building direction-sensitive layouts.

---

# 9. Spacing System

Use an 8px base spacing system.

```text
2xs = 4px
xs  = 8px
sm  = 12px
md  = 16px
lg  = 24px
xl  = 32px
2xl = 48px
3xl = 64px
```

Use 4px only for micro adjustments.

Avoid arbitrary values such as:

```text
13px
17px
19px
27px
31px
```

unless there is a genuine visual requirement.

---

# 10. Layout

## Maximum Content Width

```text
Small: 640px
Medium: 768px
Large: 1024px
XL: 1280px
```

Most application pages should use:

```text
max-width: 1280px
```

Focused learning experiences should use:

```text
max-width: 768px
```

---

# 11. Responsive Breakpoints

## Mobile

```text
< 768px
```

Use:

```text
4-column fluid layout
16px horizontal padding
```

---

## Tablet

```text
768px – 1023px
```

Use:

```text
8-column layout
24px horizontal padding
16px grid gap
```

---

## Desktop

```text
1024px+
```

Use:

```text
12-column layout
24px grid gap
max-width: 1280px
```

---

# 12. Mobile-First Rule

Every component must be designed mobile-first.

Do not create desktop UI and simply shrink it for mobile.

On mobile:

- Stack content when appropriate
- Reduce unnecessary secondary information
- Make touch targets large
- Avoid horizontal overflow
- Convert complex tables into scrollable layouts/cards
- Keep primary actions visible
- Maintain readable Arabic text
- Avoid tiny controls
  Minimum recommended touch target:

```text
44 × 44px
```

Prefer:

```text
48 × 48px
```

for important mobile actions.

---

# 13. Border Radius

Use a consistent radius system.

```text
sm      = 4px
default = 8px
md      = 12px
lg      = 16px
xl      = 24px
full    = 9999px
```

### Usage

```text
8px
→ buttons
→ inputs
→ small interactive elements

12–16px
→ cards
→ dialogs
→ lesson modules

24px
→ major learning pods
→ promotional sections

9999px
→ badges
→ pills
→ avatars
→ streak indicators
```

Do not make every component excessively rounded.

---

# 14. Elevation

Prefer borders + subtle shadows over heavy shadows.

## Level 0

Flat surface.

```text
border: 1px solid #E2E8F0
```

Use for:

- Sections
- Unselected blocks
- Background containers

---

## Level 1

Standard card:

```css
box-shadow:
  0 1px 3px rgba(15, 23, 42, 0.06),
  0 1px 2px rgba(15, 23, 42, 0.04);
```

Use for:

- Lesson cards
- Auth cards
- Vocabulary cards
- Dashboard cards

---

## Level 2

Interactive/floating:

```css
box-shadow:
  0 4px 6px rgba(15, 23, 42, 0.08),
  0 2px 4px rgba(15, 23, 42, 0.04);
```

Use for:

- Hovered cards
- Flashcards
- Floating controls

---

## Level 3

Modal:

```css
box-shadow:
  0 20px 25px rgba(15, 23, 42, 0.1),
  0 8px 10px rgba(15, 23, 42, 0.04);
```

Use for:

- Dialogs
- Popovers
- Floating language selectors

---

# 15. Buttons

## Primary

```text
Background: #0E7A5D
Text: #FFFFFF
Radius: 8px
Height: 44px
Mobile height: 48px
```

Hover:

```text
#0A5C46
```

Use only for the primary action.

Example:

```text
Start Lesson
Continue
Save
Create Lesson
Submit Answer
```

---

## Secondary

```text
Background: #FFFFFF
Border: #0E7A5D
Text: #0E7A5D
Radius: 8px
```

---

## Ghost

```text
Transparent
No border
Text: #115E59
```

Hover:

```text
#F1F5F9
```

---

## Destructive

Use the error palette.

Do not use red for normal actions.

---

# 16. Button Hierarchy

A page should normally have:

```text
1 Primary action
0–2 Secondary actions
Optional Ghost actions
```

Do not make every button primary.

Bad:

```text
[Save] [Cancel] [Delete] [Preview] [Export]
```

with all buttons visually equal.

Good:

```text
[Save] [Preview]     Cancel
```

---

# 17. Forms

Inputs:

```text
Height: 44px
Mobile: 48px
Radius: 8px
Background: #FFFFFF
Border: #CBD5E1
```

Focus:

```text
Border: #0E7A5D
Ring: rgba(14, 122, 93, 0.10)
```

Every input should have:

1. Label
2. Input
3. Optional helper text
4. Error message when necessary
   Never rely only on placeholders as labels.

---

# 18. Cards

Cards should be used to create meaningful grouping.

Do not put every piece of content inside a card.

Standard card:

```text
Background: #FFFFFF
Border: 1px solid #E2E8F0
Radius: 16px
Padding desktop: 24px
Padding mobile: 16px
Elevation: 1
```

Use cards for:

- Lessons
- Vocabulary
- Progress
- Exercises
- User information
- Learning modules
  Avoid nested cards unless there is a clear hierarchy.

---

# 19. Vocabulary Card

Vocabulary is one of the core experiences.

Recommended structure:

```text
┌─────────────────────────────┐
│ Category / Status           │
│                             │
│          Arabic             │
│        العَرَبِيَّة         │
│                             │
│     Pronunciation            │
│     Translation              │
│                             │
│     🔊 Listen               │
└─────────────────────────────┘
```

Arabic should be visually dominant.

Recommended:

```text
Arabic: 32–40px
Translation: 16–18px
Pronunciation: 14–16px
```

---

# 20. Quiz / Exercise UI

Learning interactions must be obvious.

A quiz screen should have:

```text
Progress
↓
Instruction
↓
Question
↓
Answer area
↓
Primary action
```

Example:

```text
Question 4 of 10

What does this Arabic word mean?

       صديق

[ Friend ]
[ Teacher ]
[ Neighbor ]
[ Student ]

             [ Check Answer ]
```

Do not overload the screen with unrelated information.

---

# 21. Progress

Progress indicators should communicate:

```text
Current position
Completion
Remaining work
Achievement
```

Use primary green for normal progress.

Use amber only for:

- Streaks
- Achievements
- Milestones
  Progress must never depend only on color.

Include text or icons when necessary.

---

# 22. Status Badges

Use pill-shaped badges.

```text
Padding: 4px 12px
Radius: 9999px
```

### Completed

```text
Background: #ECFDF5
Text: #065F46
```

### In Progress

```text
Background: #EFF6FF
Text: #1D4ED8
```

### Review / Streak

```text
Background: #FEF3C7
Text: #92400E
```

---

# 23. Navigation

Navigation must remain simple.

Prioritize the user's primary tasks.

Example:

```text
Dashboard
Lessons
Vocabulary
Practice
Progress
```

Secondary items should be visually separated.

Active navigation:

```text
Primary green
```

Do not use multiple competing active colors.

---

# 24. Header

Desktop header should provide:

```text
Logo
Primary navigation
Search (if required)
Language switcher
User/account actions
```

Mobile header should prioritize:

```text
Menu
Logo
Important action
Profile
```

Avoid putting every desktop navigation item into the mobile header.

---

# 25. Language Switcher

The application supports:

```text
English
বাংলা
```

Use a compact segmented control.

Active state:

```text
#0E7A5D
```

Inactive state:

```text
transparent / neutral surface
```

The switcher must not visually compete with primary actions.

---

# 26. Audio Player

Language learning requires a simple audio experience.

Recommended floating/inline player:

```text
Play
Waveform
Progress
Speed
```

Supported speeds:

```text
0.75x
1x
1.25x
```

Primary waveform:

```text
#0E7A5D
```

Accent/scrubber:

```text
#D97706
```

The audio player should remain compact.

---

# 27. Icons

Use a single icon library consistently.

Preferred:

```text
Lucide Icons
```

Rules:

- Use icons to support meaning
- Do not use icons purely as decoration
- Keep icon sizes consistent
- Do not mix multiple icon styles
  Recommended sizes:

```text
16px → metadata
20px → standard UI
24px → primary controls
```

Icon-only buttons must have accessible labels.

---

# 28. Tables

Tables are appropriate for:

- Admin interfaces
- Vocabulary management
- Lesson management
- User management
- Analytics
  Desktop:

```text
Full table
```

Mobile:

```text
Horizontal scroll
```

or transform into:

```text
Stacked cards
```

Do not squeeze 8–10 columns into a tiny mobile screen.

---

# 29. Loading States

Never leave the UI blank while data is loading.

Use:

- Skeletons
- Inline spinners
- Button loading states
  Skeletons should preserve the final layout dimensions.

Avoid large loading spinners for entire pages when skeleton content can be shown.

---

# 30. Empty States

An empty state should explain:

```text
What is empty
Why it is empty
What the user can do
```

Example:

```text
No lessons yet

You haven't created any lessons.

[ Create Lesson ]
```

Do not show:

```text
No data
```

without context.

---

# 31. Error States

Errors should be:

- Clear
- Specific
- Actionable
- Non-threatening
  Example:

```text
Unable to load lessons

Something went wrong while loading your lessons.

[ Try Again ]
```

Do not expose technical errors to normal users.

---

# 32. Dialogs / Modals

Dialogs should:

- Have clear titles
- Have concise descriptions
- Have obvious primary action
- Support keyboard navigation
- Close predictably
- Avoid unnecessary nested dialogs
  Desktop:

```text
max-width: 480–640px
```

Mobile:

```text
Near full width
16px margin
```

---

# 33. Accessibility

Accessibility is a requirement, not an optional enhancement.

All interactive elements must support:

- Keyboard navigation
- Visible focus states
- Screen-reader labels
- Sufficient contrast
- Semantic HTML
  Do not remove focus outlines without replacing them.

Icon-only buttons require:

```text
aria-label
```

Images require meaningful:

```text
alt
```

---

# 34. Animation

Animations should be subtle.

Preferred duration:

```text
150ms – 250ms
```

Use animation for:

- Hover
- Focus
- Expand/collapse
- Modal entrance
- Progress transitions
- Flashcard interactions
  Avoid:

- Excessive bouncing
- Long transitions
- Decorative animation everywhere
- Animation that delays user actions
  Respect:

```css
prefers-reduced-motion
```

---

# 35. Shadows & Borders

Prefer:

```text
subtle border + subtle shadow
```

over:

```text
large dark shadow
```

Do not use heavy black shadows.

The UI should feel calm and lightweight.

---

# 36. Backgrounds

Primary application background:

```text
#F8FAFC
```

Cards:

```text
#FFFFFF
```

Large sections may use subtle tonal variations.

Avoid excessive gradients.

Gradients should only be used when they have a clear product/design purpose.

---

# 37. Dashboard Design

The dashboard should answer:

```text
What should I learn next?
How much have I completed?
What did I learn recently?
How is my progress?
```

Recommended structure:

```text
Greeting
↓
Current learning / Continue
↓
Progress summary
↓
Recommended lessons
↓
Recent activity
↓
Vocabulary / Practice
```

Do not overload the dashboard with statistics.

Prioritize actionable information.

---

# 38. Learning Page

A focused learning page should minimize distractions.

Recommended:

```text
Top:
Progress + Exit

Center:
Question / Arabic content

Bottom:
Answer / Action
```

Focused learning views should generally use:

```text
max-width: 768px
```

---

# 39. Admin UI

Admin interfaces may be denser than learner-facing pages.

Admin pages can use:

- Tables
- Filters
- Search
- Pagination
- Bulk actions
- Tabs
- Dense metadata
  However, they must still follow:

- Same color system
- Same typography
- Same spacing
- Same button hierarchy
- Same component language

---

# 40. Component Architecture

UI components should be reusable.

Prefer:

```text
components/
├── ui/
│   ├── button
│   ├── input
│   ├── dialog
│   ├── badge
│   ├── card
│   └── ...
│
├── shared/
│   ├── page-header
│   ├── empty-state
│   ├── loading-state
│   └── ...
│
└── features/
    ├── vocabulary/
    ├── lessons/
    ├── practice/
    └── progress/
```

Do not create a new button/card/input implementation for every feature.

---

# 41. Component Design Rules

A component should have one clear responsibility.

Avoid giant components containing:

```text
UI
API calls
business logic
form validation
data transformation
modal state
navigation
```

all in one file.

Separate concerns where appropriate.

---

# 42. Design Token Rule

Do not hardcode random values throughout components.

Bad:

```tsx
className = "bg-[#147d61] rounded-[13px] px-[19px]";
```

Prefer shared tokens / existing design-system utilities.

For Tailwind, use the project's configured theme tokens.

Example:

```tsx
className = "bg-primary rounded-md px-4";
```

---

# 43. Existing Functionality Rule

When redesigning an existing screen:

### MUST preserve

- Business logic
- API calls
- API endpoints
- Data models
- Existing functionality
- Validation rules
- Authentication behavior
- Permissions
- State management
- Routing

### MAY change

- Layout
- Styling
- Spacing
- Typography
- Visual hierarchy
- Component composition
- Responsive behavior
- UX presentation
  Never rewrite working business logic just to redesign the UI.

---

# 44. Code Generation Rules

When generating a new UI:

1. Read this document first.
2. Inspect existing components before creating new ones.
3. Reuse existing components whenever possible.
4. Follow existing project architecture.
5. Follow the design tokens.
6. Build mobile-first.
7. Support Arabic RTL.
8. Maintain accessibility.
9. Avoid unnecessary dependencies.
10. Avoid duplicate components.
11. Keep components reasonably small.
12. Do not modify business logic unless explicitly requested.
13. Do not invent new colors without a strong reason.
14. Do not introduce random border radiuses.
15. Do not use excessive shadows.
16. Do not overuse cards.
17. Do not add unnecessary animations.

---

# 45. Visual Quality Checklist

Before considering a UI complete, verify:

### Layout

- [ ] Proper alignment
- [ ] Consistent spacing
- [ ] Clear hierarchy
- [ ] No unnecessary nesting
- [ ] No horizontal overflow

### Typography

- [ ] Correct font
- [ ] Correct heading hierarchy
- [ ] Readable body text
- [ ] Arabic text is properly sized
- [ ] Bengali text is readable

### Components

- [ ] Buttons have clear hierarchy
- [ ] Inputs have labels
- [ ] Cards are consistent
- [ ] Badges use correct colors
- [ ] Icons are consistent

### Responsive

- [ ] Mobile works
- [ ] Tablet works
- [ ] Desktop works
- [ ] Touch targets are large enough
- [ ] Arabic does not break on small screens

### Accessibility

- [ ] Keyboard accessible
- [ ] Focus states visible
- [ ] Contrast acceptable
- [ ] Icon buttons have labels
- [ ] Semantic HTML used

### UX

- [ ] Loading state exists
- [ ] Empty state exists
- [ ] Error state exists
- [ ] Success feedback exists
- [ ] Primary action is obvious

---

# 46. Anti-Patterns

Never generate UI that looks like:

```text
❌ Generic AI dashboard
❌ Excessive glassmorphism
❌ Excessive gradients
❌ Huge rounded cards
❌ Excessive shadows
❌ Rainbow-colored statistics
❌ Every section inside a card
❌ Tiny Arabic text
❌ Tiny mobile buttons
❌ Desktop-only layouts
❌ Random spacing
❌ Random colors
❌ Multiple competing primary buttons
❌ Decorative icons everywhere
❌ Unnecessary animations
```

---

# 47. Final Design Goal

Arabic Master should feel like:

> **A modern, trustworthy language-learning platform designed by a professional product team.**

The visual language should combine:

```text
Modern SaaS
        +
EdTech
        +
Arabic learning
        +
Bilingual UX
        +
Calm visual hierarchy
```

The result should be **simple enough for beginners, powerful enough for serious learners, and polished enough to feel production-ready.**
