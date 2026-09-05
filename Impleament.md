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
User model design
15 hours ago
Production grade SaaS tech stack recommendation
20 hours ago
Senior software engineer career improvement
3 days ago
Instructions
Add instructions to tailor Claude’s responses

Memory
Only you
Purpose & context Azizul is a senior-level software engineer building a production-grade SaaS language learning mobile app ("Arabic Master") targeting Bengali and English-speaking learners, with a Duolingo-style UX and a Bangladeshi user base. The product is mobile-first, with monetization heavily shaped by the local payment landscape (bKash, Nagad dominance over credit cards or platform wallets). Key goals: ship a focused MVP without over-engineering, navigate app store commission structures legally, and design an architecture any new team member can follow independently. Current state Full product architecture and master implementation document produced, covering auth, content data models, gamification state, subscriptions, and a phase-by-phase build plan (16 MVP DB tables confirmed). Tech stack decided: Flutter (mobile), NestJS + PostgreSQL + Prisma (backend), Redis (session enforcement, gamification state), BullMQ (background jobs), RevenueCat (subscription management), SSLCommerz/ShurjoPay/AamarPay (local payment gateways), Next.js (admin/CMS), PostHog (analytics). Monetization strategy resolved: Android-first launch using SSLCommerz integrated into a WebView checkout flow to support bKash/Nagad without violating Play Store policy; iOS using standard Apple IAP at a higher price point given anti-steering constraints. One-active-device enforcement re-enabled (Azizul's explicit correction): implemented via Redis user:{id}:active_session key as fast-path pointer, with the Session table as source of truth; no token rotation complexity added. MVP scope deliberately narrowed: content workflow automation and role-based CMS features cut from initial launch. On the horizon Phase 2 content data model design is the confirmed next priority before auth complexity. iOS conversion strategy (passive in-app text + out-of-band email/push to drive web purchases) needs UX detailing. Admin/CMS panel scoping for post-MVP. Key learnings & principles RevenueCat does not bypass platform fees — it manages subscriptions only; commission avoidance requires an external web purchase flow. Manual/WhatsApp-based payment flows do not scale; proper gateway integration from day one is non-negotiable. Avoid over-engineering auth for the actual threat model: rotation, reuse detection, and token family revocation are disproportionate for this product; one-active-device enforcement is sufficient and simpler. Content data model design must precede auth complexity in build order. ArabicEntity table with normalizedText-based deduplication and findOrCreate pattern enables audio reuse across Word, WordVariant, Sentence, and ConversationTurn models — prevents redundant storage. Subscription access should derive from expiresAt + status, not an isPro boolean. Idempotency keys on all completion endpoints (backed by Redis TTL + DB unique constraints) are critical for progress integrity. XP and ad-reward verification must be server-authoritative; ad network server-to-server callbacks required. PRDs labeled "MVP Phase 1" often contain full-product scope — push back early and cut aggressively. Approach & patterns Azizul communicates in Banglish (Bengali-English mix); Claude should match this style in technical conversations. Prefers direct, no-fluff responses with honest trade-off analysis — pushes back when recommendations don't fit constraints. Will explicitly correct Claude's recommendations (e.g., re-enabling one-active-device enforcement) and expects clean integration of those corrections without residual complexity. Works iteratively: critique existing doc → revise → layer in specific changes → produce consolidated master document. Architecture documentation standard: comprehensive enough for any new team member to read and execute independently. Tools & resources Mobile: Flutter Backend: NestJS, PostgreSQL, Prisma, Redis, BullMQ Auth: google-auth-library (not Passport); AuthIdentity table for OAuth account linking Subscriptions: RevenueCat + SSLCommerz WebView flow (Android); Apple IAP (iOS) Analytics: PostHog Admin/CMS: Next.js Payment gateways: SSLCommerz, ShurjoPay, AamarPay

Last updated 3 hours ago

Context

tech stack
4.3kB

text

Project requirement
15.6kB

text

Project requirement
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
Rewarded Heart Ads| ✓| ✓| x
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

Ads, hearts, XP এবং streak গুরুত্বপূর্ণ হলেও এগুলো learning experience-এর supporting systems—মূল product নয়। মূল product হলো user-কে বাস্তব Arabic বলতে শেখানো।
