# টোকেন রিফ্রেশ ও অথেনটিকেশন নিরাপত্তা সংশোধন

## সমস্যাটি কী ছিল

আগের বাস্তবায়নে ব্যবহারকারী কিছুদিন পর একই ব্রাউজার বা মোবাইল অ্যাপে ফিরলে সেশন ঠিকমতো চালু থাকার নিশ্চয়তা ছিল না। এর পাশাপাশি কয়েকটি নিরাপত্তা ও নির্ভরযোগ্যতার সমস্যা ছিল:

- সার্ভারের global cache-এ access token ও refresh চলাকালীন promise রাখা হতো। একাধিক ব্যবহারকারীর অনুরোধ একসঙ্গে এলে ভুল সেশনের token অন্য অনুরোধে ব্যবহৃত হওয়ার ঝুঁকি ছিল।
- `/api/me` এবং refresh endpoint-এর response-এ token JavaScript-এ পৌঁছে যেত, যদিও token HttpOnly cookie-তে রাখার উদ্দেশ্য ছিল।
- Google OAuth callback URL-এ access ও refresh token পাঠানো হতো। URL browser history বা লগে থেকে যেতে পারত; OAuth `state`-ও browser-এর সঙ্গে নিরাপদভাবে বাঁধা ছিল না।
- API ব্যবহারকারী বা session revoked/expired হয়েছে কি না এবং account active কি না, তা যথেষ্টভাবে যাচাই করত না।
- ওয়েব অ্যাপ নির্দিষ্ট বিরতিতে এবং tab focus/visibility বদলালে অকারণে refresh করত। এতে অতিরিক্ত অনুরোধ ও token rotation race হতে পারত।
- refresh race-এর একটি পরিস্থিতিতে নতুন refresh token স্থায়ীভাবে সংরক্ষণ না করেই ফেরত যেতে পারত।
- মোবাইল login তখন demo ছিল; সেশন restore বা refresh করা যেত না।

## কীভাবে ঠিক করা হয়েছে

### ওয়েব অ্যাপ

- সার্ভার-স্তরের shared token cache ও refresh promise সরানো হয়েছে। প্রতিটি অনুরোধ এখন তার নিজস্ব cookie থেকে token নেয়, ফলে ব্যবহারকারীর credential অন্য অনুরোধের সঙ্গে ভাগ হয় না।
- `/api/me` ও refresh endpoint-এর browser-facing response থেকে token বাদ দেওয়া হয়েছে। Token server-side/HttpOnly cookie-তেই থাকে।
- প্রতি কয়েক মিনিটে এবং focus/visibility event-এ অকারণে refresh করার ব্যবস্থা বাদ দেওয়া হয়েছে। Refresh প্রয়োজন হলে server-side API call ও proxy-র মাধ্যমে হয়।

### Google OAuth

- OAuth callback URL-এ token পাঠানো বন্ধ করা হয়েছে।
- Browser-এ HttpOnly, SameSite=Lax state cookie এবং Redis-এ অল্প সময়ের জন্য state যাচাইয়ের ব্যবস্থা যোগ হয়েছে।
- সফল callback-এর পর স্বল্পমেয়াদি, একবার ব্যবহারযোগ্য exchange code তৈরি হয়। ওয়েব সার্ভার backend-এর সঙ্গে code exchange করে cookie স্থাপন করে; browser-এ token ফেরত যায় না।
- Exchange code Redis-এ 60 সেকেন্ডের জন্য রাখা হয় এবং একবারই ব্যবহার করা যায়। এই ব্যবস্থার জন্য deployed Redis-এ `GETDEL` (Redis 6.2+) সমর্থন থাকা প্রয়োজন।

### API ও refresh rotation

- API অনুরোধে user account active কি না এবং সংশ্লিষ্ট session সঠিক user-এর, সক্রিয়, revoked নয় ও মেয়াদোত্তীর্ণ নয় কি না যাচাই করা হয়।
- refresh race-এ Redis-এ সংরক্ষিত হয়নি এমন token আর সফল response হিসেবে ফেরত যায় না; অনিরাপদ fallback-এর বদলে নিয়ন্ত্রিত `503` দেওয়া হয়।
- OAuth code/query তথ্য যেন সাধারণ request/error log-এ ফাঁস না হয়, সে জন্য logging sanitization যোগ হয়েছে।
- API token-এর default মেয়াদ আগের মতোই: access token 15 মিনিট এবং refresh token 30 দিন।

### মোবাইল অ্যাপ

- ইমেইল ও password দিয়ে API-ভিত্তিক login যুক্ত করা হয়েছে; আগের demo login সরানো হয়েছে।
- Refresh token Expo SecureStore-এ রাখা হয়; access token memory-তে থাকে।
- অ্যাপ চালুর সময় সেশন restore/refresh হয়। Authenticated request-এ `401` এলে refresh করে request পুনরায় চেষ্টা করা হয়।
- Profile থেকে sign out করা যায়।

## সেশন নীতি

নতুন login হলে আগের session revoke করার single-device আচরণটি অপরিবর্তিত রাখা হয়েছে। ফলে অন্য device-এ login করলে আগের device-এর session বন্ধ হতে পারে।

## যাচাই

- API: 4টি test file-এ 31টি test, TypeScript build/typecheck এবং Oxlint সফল।
- Next.js: TypeScript check, পরিবর্তিত অংশের lint এবং production build সফল।
- Expo: web export এবং mobile TypeScript check সফল।
- `git diff --check` সফল।

Production-সদৃশ backend ও credential না থাকায় সম্পূর্ণ login/OAuth/mobile refresh flow end-to-end যাচাই করা যায়নি। মোবাইল অ্যাপে API সংযোগের জন্য `EXPO_PUBLIC_API_URL` সেট করতে হবে।

## এখনো বাকি

- মোবাইলের Google/Apple sign-in এবং registration এখনও demo flow; এই পরিবর্তনে ইমেইল login-ই সংযুক্ত হয়েছে।
- API-র কিছু public GET route-এ DRAFT content প্রকাশ পাওয়ার সম্ভাবনা আগে চিহ্নিত হয়েছিল; সেটি এই auth remediation-এর অংশ ছিল না এবং এখনও আলাদা করে পর্যালোচনা করা প্রয়োজন।
- Full Next.js lint-এ পরিবর্তনের বাইরের কিছু pre-existing error রয়েছে; পরিবর্তিত অংশের targeted lint সফল।
