হ্যাঁ। আপনার **PRD + বর্তমান database model** দুটো মিলিয়ে দেখলে, এখন শুধু **regular USER / learner-এর mobile app** বানানোর জন্য screenগুলো আলাদা করলে অনেক পরিষ্কার হবে। Admin/Content Manager এখন বাদ রাখাই যায়—কারণ PRD-তেও CMS/Admin অংশ Phase 2 হিসেবে আছে। 

আমি এটাকে **MVP-first** ধরে সাজাচ্ছি।

## 1. পুরো User App-এর Screen Map

আমি মোটামুটি এভাবে ভাগ করব:

```text
Arabic Master
│
├── 01. Splash
├── 02. Onboarding
│   ├── Language
│   ├── Country
│   ├── Learning Goals
│   ├── Arabic Level
│   └── Daily Practice Time
│
├── 03. Authentication
│   ├── Welcome / Login
│   ├── Register
│   ├── Email Verification
│   ├── Forgot Password
│   ├── Reset Password
│   └── Google Login
│
├── 04. Home
│
├── 05. Learn
│   ├── Word
│   ├── Sentence
│   ├── Conversation
│   └── Course Details
│
├── 06. Lesson
│   ├── Word Learning
│   ├── Sentence Learning
│   ├── Conversation Learning
│   ├── Practice
│   └── Lesson Complete
│
├── 07. Progress
│   ├── Overall Progress
│   ├── XP
│   ├── Level
│   ├── Streak
│   └── Learning History
│
├── 08. Subscription
│   ├── Pro
│   ├── Plan Details
│   └── Payment
│
├── 09. Profile
│   ├── Profile
│   ├── Learning Preferences
│   ├── Account
│   ├── Subscription
│   └── Settings
│
└── 10. Supporting Screens
    ├── Hearts
    ├── Rewarded Ad
    ├── Locked Content
    ├── Signup Prompt
    ├── Session Conflict
    └── Error / Empty / Offline
```

---

# 2. Splash Screen

### Screen

**Splash**

UI:

* Arabic Master logo
* ছোট tagline
* subtle loading indicator

Example:

```text
       [Logo]

    Arabic Master

Learn the Arabic
you actually need to speak.

        ● ● ●
```

এটা খুব simple রাখবেন।

---

# 3. Onboarding — 5 Screens

PRD অনুযায়ী onboarding-এ **language, country, goal, level এবং daily practice time** collect করতে হবে। 

### 3.1 Language

```text
How do you want
to learn Arabic?

[ 🇧🇩 বাংলা ]

[ 🇬🇧 English ]

                 Continue →
```

UI দরকার:

* progress indicator
* question
* selectable cards
* Continue
* Back

---

### 3.2 Country

```text
Where do you live?

[ Saudi Arabia       ]
[ UAE                 ]
[ Qatar               ]
[ Kuwait              ]
[ Bahrain             ]
[ Oman                ]
[ Other               ]

                 Continue →
```

Country দিয়ে automatically dialect নির্ধারণ করবেন না—PRD-তে এটা explicitly বলা আছে। 

---

### 3.3 Learning Goals

এখানে **multi-select** দরকার।

```text
Why are you learning Arabic?

☐ Shopping
☐ Work
☐ Restaurant
☐ Transportation
☐ Daily Life
☐ Speaking with People
☐ General Learning

                 Continue →
```

কারণ selected goals অনুযায়ী Home recommendation হবে। 

---

### 3.4 Arabic Level

```text
How much Arabic
do you know?

┌─────────────────────┐
│ Beginner            │
│ I know almost       │
│ nothing.            │
└─────────────────────┘

┌─────────────────────┐
│ Basic               │
│ I know some words   │
│ and phrases.        │
└─────────────────────┘

┌─────────────────────┐
│ Intermediate        │
│ I can understand    │
│ simple Arabic.      │
└─────────────────────┘
```

---

### 3.5 Daily Practice Goal

```text
How much time can
you practice each day?

      ⏱

   5 minutes
   10 minutes
   15 minutes
   20+ minutes

        Continue
```

---

# 4. Authentication Screens

PRD অনুযায়ী Email/Password এবং Google দুটোই থাকবে। 

## 4.1 Welcome / Login

```text
Welcome back 👋

Continue learning Arabic

[ Continue with Google ]

──────── OR ────────

Email
[________________]

Password
[________________]

Forgot password?

[       Login       ]

Don't have an account?
Create account
```

---

## 4.2 Register

```text
Create your account

Full name
[____________]

Email
[____________]

Password
[____________]

Confirm password
[____________]

☐ I agree to Terms

[ Create Account ]

──────── OR ────────

[ Continue with Google ]
```

---

## 4.3 Email Verification

```text
Check your email 📩

We've sent a verification
link to your email.

[ Open Email ]

Didn't receive it?

Resend email

Change email
```

---

## 4.4 Forgot Password

```text
Forgot password?

Enter your email and
we'll send you a reset link.

Email
[________________]

[ Send Reset Link ]
```

---

## 4.5 Reset Password

```text
Create new password

New password
[________________]

Confirm password
[________________]

[ Reset Password ]
```

---

# 5. Home Screen — সবচেয়ে গুরুত্বপূর্ণ Screen

PRD-এর Home structure অনুযায়ী এখানে থাকবে:

* Greeting
* Streak
* XP
* Hearts
* Today's Goal
* Continue Learning
* Recommended
* Quick Practice 

আমি mobile UI-তে এটাকে এভাবে করতাম:

```text
Good evening, Aziz 👋

🔥 7 days     ⭐ 420 XP     ❤️ 4

────────────────────────

Today's Goal

        7 / 10 min
   ███████████░░░

────────────────────────

Continue Learning

┌─────────────────────────┐
│ Shopping                │
│ Lesson 4                │
│ ███████░░░ 70%          │
│                         │
│       Continue →        │
└─────────────────────────┘

────────────────────────

Quick Practice

[ 🧠 Words ]
[ 💬 Sentences ]
[ 🗣 Conversation ]

────────────────────────

Recommended for You

[ Shopping ]
[ Daily Life ]
[ Work ]

────────────────────────

Home    Learn    Progress    Profile
```

**Home screen-টাই app-এর main command center হবে।**

---

# 6. Learn Screen

এটা আপনার second major screen।

```text
Learn Arabic

[ Search lessons... ]

Continue Learning
─────────────────

[ Shopping
  Lesson 4 ]

Courses
─────────────────

Words
Learn practical Arabic words
[Explore →]

Sentences
Learn useful daily sentences
[Explore →]

Conversations
Practice real conversations
[Explore →]

Pro Curriculum 🔒
[Explore →]
```

---

# 7. Word Course Screen

Database অনুযায়ী:

```text
Course
 ↓
Section
 ↓
Lesson
 ↓
Words
```

এটাই UI-তেও maintain করা উচিত। 

### Screen

```text
Words

Shopping

Section 1

✓ Lesson 1
   5 / 5 completed

▶ Lesson 2
   2 / 5 completed

🔒 Lesson 3

🔒 Lesson 4
```

---

# 8. Sentence Course Screen

```text
Sentences

Daily Life

Section 1

✓ Greetings
✓ Introduction

▶ Shopping

🔒 Restaurant

🔒 Transportation
```

Sentence course-এর content shopping, restaurant, work, transportation, daily life ইত্যাদির practical spoken Arabic ভিত্তিক হবে। 

---

# 9. Conversation Screen

Free user-এর জন্য:

```text
Conversations

Beginner
──────────────

✓ Greetings
✓ At the Shop
▶ At the Restaurant

Elementary 🔒
Intermediate 🔒
Advanced 🔒
```

PRD অনুযায়ী Guest/Free users শুধু Beginner Conversation access করবে। 

---

# 10. Lesson Screen — Core Learning UI

এখানেই আপনার সবচেয়ে বেশি UI design effort দেওয়া উচিত।

## Word Learning

একটা word:

```text
Lesson 4

        2 / 5

       اشتري

       Ishtari

       কিনুন / কিনো

       🔊 Listen

────────────────

When to use

কেনাকাটা করার সময় কাউকে
কিছু কিনতে বলার ক্ষেত্রে...

Example

اشتري هذا

এইটা কিনুন

🔊

────────────────

        [ Next → ]
```

কারণ আপনার product principle হলো word শুধু meaning নয়; user-এর জানা উচিত **meaning + pronunciation + when to use + example sentence + audio**। 

---

# 11. Sentence Learning Screen

```text
3 / 5

كم السعر؟

Kam as-si'r?

দাম কত?

🔊 Listen

────────────────

When to use

দোকানে কোনো জিনিসের
দাম জানতে চাইলে।

Example Context

🛒 Shopping

────────────────

[ Listen Again ]

[ I Know ]

[ Next → ]
```

---

# 12. Conversation Learning Screen

এখানে UI একটু আলাদা হবে।

```text
At the Restaurant

────────────────

Ahmed
السلام عليكم

🔊

────────────────

Waiter
وعليكم السلام

🔊

────────────────

Ahmed
أبغى هذا

🔊

────────────────

Waiter
أكيد

🔊

────────────────

[ ▶ Play Conversation ]

[ Practice Conversation ]
```

Conversation curriculum topic-এর সাথে connected থাকবে এবং Words → Sentences → Conversation learning loop তৈরি করবে। 

---

# 13. Practice Screen

Lesson-এর ভিতরে আলাদা practice mode দরকার।

যেমন:

### Multiple Choice

```text
What does this mean?

كم السعر؟

○ Where is the shop?
○ How much is it?
○ I want this
○ Come here

                 [ Check ]
```

### Arabic → Bangla

```text
What does this mean?

اشتري

[______________]

                 [ Check ]
```

### Listening

```text
🔊

What did you hear?

○ اشتري
○ أشتري
○ اشرب
○ انتظر
```

---

# 14. Lesson Complete Screen

এটা খুব গুরুত্বপূর্ণ কারণ এখানেই **XP + Progress + Streak** reward loop হবে।

```text
🎉 Lesson Complete!

Shopping — Lesson 4

       ⭐ +20 XP

🔥 Streak
7 days

Words learned
5

Progress
70% → 80%

────────────────

Today's Goal
████████████████ 100%

────────────────

[ Continue Learning ]

[ Practice Again ]
```

XP এবং streak learning loop-এর গুরুত্বপূর্ণ অংশ। 

---

# 15. Hearts UI

Hearts-এর জন্য আলাদা full screen সবসময় দরকার নেই।

বরং global component:

```text
❤️ 4
```

Home header-এ।

Lesson-এর সময়:

```text
❤️ 3
```

Heart শেষ হলে modal:

```text
No Hearts 💔

You need a heart
to continue practicing.

[ Watch Ad +1 ❤️ ]

[ Get Pro ]

[ Come Back Later ]
```

কারণ rewarded ad দেখে +1 heart পাওয়ার flow PRD-তে আছে। 

---

# 16. Rewarded Ad Screen / Modal

Full screen না হলেও চলবে।

```text
Get 1 Free Heart ❤️

Watch a short video
and receive:

        +1 ❤️

[ Watch Video ]

Not now
```

**Important:** normal ad এবং rewarded ad আলাদা UI flow হবে। 

---

# 17. Interstitial Ad Flow

এটার জন্য আলাদা screen design না করে **ad system state** design করবেন।

Flow:

```text
Lesson Complete
      ↓
XP Reward
      ↓
Progress Update
      ↓
Continue
      ↓
Ad if eligible
```

Lesson complete হওয়ার আগে ad দেখানো যাবে না। 

---

# 18. Progress Screen

এটা bottom navigation-এর একটি major tab হতে পারে।

```text
Your Progress

🔥 7 Day Streak

⭐ 420 XP

Level 4
████████░░ 80%

────────────────

Learning Progress

Words
████████░░ 80 / 100

Sentences
██████░░░░ 60 / 100

Conversations
████░░░░░░ 20 / 50

────────────────

Courses

Shopping       70%
Daily Life     45%
Restaurant     20%

────────────────

Learning Activity

Mon   Tue   Wed   Thu   Fri   Sat   Sun
 ●     ●     ●     ●     ●     ●     ○
```

আপনার DB model-এ course/section/lesson progress, completed words/sentences/conversations, XP, level, streak, hearts এবং last activity track করার structure আছে। 

---

# 19. Streak Detail

Progress screen-এর ভিতর থেকেই open হতে পারে।

```text
🔥 Your Streak

7 Days

M T W T F S S
✓ ✓ ✓ ✓ ✓ ✓ ✓

Longest Streak
12 days

Keep learning tomorrow
to continue your streak.
```

---

# 20. XP / Level Detail

```text
Level 4

⭐ 420 XP

Next Level
500 XP

████████░░░

Recent XP

+20  Lesson completed
+5   Word completed
+30  Conversation completed
```

XP এবং Level আলাদা concept হিসেবে রাখা হয়েছে। 

---

# 21. Pro Screen

Free → Pro conversion-এর জন্য আলাদা screen অবশ্যই লাগবে।

```text
Unlock Arabic Master Pro ✨

Learn without limits.

✓ Full curriculum
✓ Advanced conversations
✓ Tense course
✓ No interstitial ads
✓ Better heart experience

────────────────

1 Year

৳ XXXX / year

[ Start Pro ]

────────────────

Already Pro?
View subscription
```

PRD অনুযায়ী initial product হলো **1 Year Access**। 

---

# 22. Locked Content Screen / Modal

User যখন Pro content click করবে:

```text
🔒 Premium Lesson

This lesson is available
with Arabic Master Pro.

Unlock:

✓ Full curriculum
✓ Advanced conversations
✓ Tense course
✓ Ad-free learning

[ Unlock Pro ]

Maybe later
```

Guest/Free বনাম Pro access এইভাবে visually পরিষ্কার করা দরকার। 

---

# 23. Profile Screen

```text
Profile

      [Avatar]

      Azizul Haque
      aziz@example.com

────────────────

🔥 7 Day Streak
⭐ 420 XP
❤️ 4 Hearts

────────────────

Learning Progress →

Learning Preferences →

Subscription →

Account Settings →

Help & Support →

Logout
```

---

# 24. Learning Preferences

Onboarding-এর data পরে change করার জন্য।

```text
Learning Preferences

Learning Language
বাংলা →

Country
Saudi Arabia →

Learning Goals
Shopping, Work →

Arabic Level
Beginner →

Daily Goal
10 minutes →
```

এটা রাখা ভালো, কারণ onboarding data শুধু প্রথমবার নেওয়া হলেও user-এর preference পরবর্তীতে পরিবর্তন করার দরকার হতে পারে।

---

# 25. Account Settings

```text
Account

Personal Information →

Change Email →

Change Password →

Email Verification →

Active Session →

Logout
```

---

# 26. Session Conflict Screen

আপনার backend model-এ single active session/device concept আছে।

তাই নতুন device login হলে:

```text
New device detected

You're already signed in
on another device.

Do you want to continue
on this device?

[ Continue Here ]

[ Cancel ]
```

তারপর old session revoke হবে। PRD-তে এই flow explicitly defined। 

---

# 27. Guest → Account Conversion Screen

এটা আপনার app-এর জন্য **খুব গুরুত্বপূর্ণ screen**।

ধরুন user:

```text
You've learned

       42 words 🎉
       8 lessons
       5 day streak 🔥
```

তারপর:

```text
Create an account
to keep your progress.

[ Continue with Google ]

[ Sign up with Email ]

Maybe later
```

কারণ guest user signup ছাড়াই শুরু করতে পারবে এবং meaningful progress হওয়ার পরে account creation prompt আসবে। 

---

# 28. Bottom Navigation

আমি MVP-তে **5টা tab** রাখতাম:

```text
┌────────────────────────────────────┐
│                                    │
│             Screen                 │
│                                    │
├────────────────────────────────────┤
│  Home   Learn   Practice   Progress Profile │
└────────────────────────────────────┘
```

তবে **Practice**-কে আলাদা tab করা optional।

আরও clean version:

```text
Home | Learn | Progress | Profile
```

আর Home/Learn-এর মধ্যে Quick Practice থাকবে।

**আমি দ্বিতীয়টাকেই recommend করছি UI simplicity-এর জন্য**, কারণ আপনার core learning architecture হচ্ছে:

```text
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
```

এটাই product-এর central learning loop। 

---

# 29. MVP-তে আসলে কতগুলো Screen বানাবেন?

সবকিছু আলাদা screen করলে unnecessary complexity হবে।

### 🔵 Must Have — Phase 1

| #  | Screen                | Priority     |
| -- | --------------------- | ------------ |
| 1  | Splash                | Must         |
| 2  | Language Onboarding   | Must         |
| 3  | Country Onboarding    | Must         |
| 4  | Goals Onboarding      | Must         |
| 5  | Level Onboarding      | Must         |
| 6  | Daily Goal Onboarding | Must         |
| 7  | Login                 | Must         |
| 8  | Register              | Must         |
| 9  | Email Verification    | Must         |
| 10 | Forgot Password       | Must         |
| 11 | Reset Password        | Must         |
| 12 | Home                  | **Critical** |
| 13 | Learn                 | **Critical** |
| 14 | Word Course           | Must         |
| 15 | Sentence Course       | Must         |
| 16 | Conversation Course   | Must         |
| 17 | Lesson                | **Critical** |
| 18 | Practice              | **Critical** |
| 19 | Lesson Complete       | **Critical** |
| 20 | Progress              | **Critical** |
| 21 | Profile               | Must         |
| 22 | Learning Preferences  | Must         |
| 23 | Account Settings      | Must         |
| 24 | Pro Subscription      | Must         |
| 25 | Locked Content        | Must         |
| 26 | Heart/Reward Modal    | Must         |
| 27 | Guest → Signup        | Must         |

এগুলোই আপনার **real MVP user app**-এর মূল UI।

PRD-এর MVP scope-ও Authentication, Onboarding, Guest Mode, Free Word/Sentence, Beginner Conversation, Progress, XP, Streak, Hearts, Ads এবং Pro Subscription-এর ওপর ভিত্তি করে। 

---

# 30. এখন যেগুলো একদম করবেন না

আপনি যেহেতু **Admin পরে করবেন**, তাই এখন UI-তে এগুলো বাদ:

```text
❌ Admin Dashboard
❌ User Management
❌ Content Manager Dashboard
❌ Content Create/Edit
❌ Content Review
❌ Content Publish
❌ Course CRUD
❌ Word CRUD
❌ Sentence CRUD
❌ Conversation CRUD
❌ Analytics Dashboard
❌ System Configuration
```

এগুলো PRD-এর Phase 2/CMS অংশের মধ্যে পড়ে। 

---

# 31. Phase 2-এর User Screens পরে করবেন

MVP শেষ হওয়ার পরে:

```text
Pro Curriculum
       ↓
Course
       ↓
Section
       ↓
Lesson
       ↓
Words
       ↓
Sentences
       ↓
Conversation
```

তারপর:

```text
Tense Course
Advanced Conversations
Grammar Variants
Personalized Recommendations
```

এগুলো PRD-তেও Phase 2 হিসেবে রাখা হয়েছে। 

---

## আমার মতে আপনার Mobile App-এর Core Navigation হবে

```text
                 ARABIC MASTER
                      │
          ┌───────────┴───────────┐
          │                       │
       Guest                    User
          │                       │
     Onboarding              Authentication
          │                       │
          └───────────┬───────────┘
                      ↓
                    HOME
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
     LEARN         PRACTICE       PROGRESS
       │              │              │
   Word/Sentence   Exercises      XP
   Conversation    Listening      Level
       │           Practice       Streak
       ↓                           Hearts
    LESSON
       │
       ↓
 COMPLETE
       │
   ┌───┴────┐
   ↓        ↓
 XP       Progress
   │
   ↓
 Streak
   │
   ↓
 Return Tomorrow
```

এভাবে করলে UI খুব পরিষ্কার থাকবে এবং আপনার backend-এর `Course → Section → Lesson → Content Item`, `LessonProgress`, `ContentCompletion`, subscription এবং user-progress model-এর সাথেও natural mapping হবে। আপনার schema-তে learning content এবং progress-এর জন্য এই entityগুলোই আছে। 

**সবচেয়ে গুরুত্বপূর্ণ কথা:** এখনই ৫০টা screen বানানোর দরকার নেই। প্রথমে **Onboarding → Home → Learn → Lesson → Practice → Complete → Progress → Profile → Pro** এই complete user journey-এর UI বানান। এতে পুরো product-এর UX flow একবারে দাঁড়িয়ে যাবে।
