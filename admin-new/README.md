# Arabic Master Admin — Content Management (Phase 3, Milestone 2)

Scope: **Arabic Entities** (list + detail + create/edit with duplicate-check
+ reusable `EntitySelector`) and **Words** (list + detail + entity-first
create/edit), from the Phase 3 Content Management spec.
Courses/Sections/Lessons/Sentences/Conversations are intentionally **not**
built yet — the sidebar shows them as "Soon" so the navigation shape is
visible without pretending those screens exist.

Words demonstrate the entity-reuse workflow end to end: creating a word
opens `EntitySelector` first, reuses `EntityFormDialog`'s duplicate-check UI
if you choose "create new entity" from inside the word flow, then collects
word-specific fields (meaning, pronunciation, when-to-use, word type,
category). The Word detail page links back to its source Arabic Entity.

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 (CSS-first
`@theme`) · Radix UI primitives (Dialog/Tabs/Dropdown) hand-wrapped in
shadcn style · Lucide icons · React 19.

**Note on package manager:** built with npm inside this sandbox because Bun
isn't installed here. Nothing in the code is npm-specific — drop it into
your Bun-based project and `bun install` will work the same way.

## Data

Everything runs on **mock data** (`lib/mock-data/arabic-entities.ts`,
`lib/mock-data/words.ts`), as agreed. All mutations
(create/edit/approve/publish/reject/delete) are local React state — nothing
persists on reload. When your Express API is ready, the only files that
need to change are:

- `lib/mock-data/arabic-entities.ts`, `lib/mock-data/words.ts` → replace with
  a fetch/query layer
- `entity-list-view.tsx` / `entity-detail-view.tsx` / `word-list-view.tsx` /
  `word-detail-view.tsx` → swap local `useState` mutations for API calls
  (component structure/props were kept deliberately thin for this)

`mockWords` entries reference `mockArabicEntities` ids directly and throw at
import time if an id doesn't exist — a small guardrail so mock data itself
can't silently violate the Word→Entity relationship rule.

## Decisions you should sanity-check

1. **Color token conflict.** Your Phase 3 prompt specified `#0F766E` /
   `#115E59` / `#CCFBF1` / `#F59E0B`. `Design.md` (your stated single
   source of truth) specifies `#0e7a5d` / `#0a5c46` / `#98f5d1` /
   `#d97706`. I used **Design.md's values** in `app/globals.css` for
   consistency with the rest of the app. If you actually want the newer
   emerald palette from this prompt, say so and I'll repoint the tokens —
   it's a one-file change.
2. **Arabic display font.** Neither doc pins one down. I used **Noto Naskh
   Arabic** (calm, well-supported tashkeel, no licensing issues) — not
   verified against your brand eye, worth a visual check.
3. **Bengali font.** Design.md says "Noto Sans Bengali"; your memory notes
   say the admin auth screens used "Noto Serif Bengali + Hind Siliguri".
   I went with Design.md's Noto Sans Bengali here since Design.md governs
   the whole app per its own text. Flag if you want the other pairing for
   consistency with the auth screens.
4. **Role switching** in the topbar ("Preview as: Admin / Content
   Manager") is a **dev-only UI toggle** so you can see both permission
   states without a backend. In production this must come from the JWT
   session — the toggle itself is not something to ship.
5. **Bulk actions** from the spec (assign category, bulk publish, etc.)
   were **not built** — only single-row delete, since there's no category
   taxonomy defined yet for Arabic Entities and building bulk UI against
   nothing to bulk-act-on would be guesswork. Selection checkboxes are
   wired and ready for whenever that's scoped.
6. **`ContentDataTable`** is written as a real generic component (columns
   + row key + mobile card renderer) — now proven reusable since Words
   uses the exact same component as Arabic Entities with different columns.
7. **Grammar variants are NOT built.** `Word.wordType` (Noun/Verb/Adjective)
   exists, but the I/You-M/You-F/He/She/We/They (verb) and
   Singular/Dual/Plural/Masculine/Feminine (noun) variant tables from PRD
   §20 are not — your own PRD lists "Advanced Grammar Variants" under
   Phase 2, so building that editor now, ahead of the data model for it,
   would be scope creep. `wordType` is there so variants have somewhere to
   attach later without a schema migration.
8. **Lesson assignment** is a read-only `lessonName` string on `Word`, not
   a real picker — Lessons don't exist as a screen yet, so there's nothing
   to assign against.

## What was verified

- `npx tsc --noEmit` — zero errors.
- `npm run build` — succeeds. (The Google Fonts fetch itself is blocked by
  this sandbox's network allowlist, so I verified the build with fonts
  temporarily stripped, then restored the real `next/font/google` imports
  for delivery. This will build fine in your real environment where
  fonts.googleapis.com is reachable — nothing else about the build path
  changes.)
- `npx eslint .` — zero warnings/errors.

## What was NOT verified (be aware)

- No visual/browser render — I have not screenshotted this, so spacing,
  RTL edge cases, and the duplicate-check dialog's real look are unverified.
- No accessibility audit beyond what's structurally built in (labels,
  focus rings, `aria-label`s) — no screen reader pass was done.
- Audio playback is wired to real `<audio>` behavior but the mock
  `audioUrl` paths (`/audio/ae-1024.mp3`) don't point to real files.

## Running it

```bash
bun install   # or npm install
bun dev       # or npm run dev
```

Visits to `/` redirect to `/admin/arabic-entities`. `/admin/words` and `/admin/words/[id]` are
also live.
