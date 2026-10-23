# Arabic Master — UI-First Implementation Plan

**Scope:** Frontend screens, navigation, reusable UI, local mock content/state, accessibility, and visual verification only.  
**Status:** UI Phases 1–10 complete. Any follow-up work requires a separately scoped approval.  
**Approval gate:** Work proceeds one explicitly approved UI phase at a time.

## 1. Scope and project baseline

This plan follows [`INSTRUCTION.md`](./INSTRUCTION.md) for the intended learning products and the mobile project conventions in [`AGENTS.md`](./AGENTS.md), `.agents/rules/expo.md`, and the Expo React Native, UI/UX, and debugging/testing skills. The separate API and database were inspected only to understand the existing content vocabulary and future UI integration boundary.

### Existing mobile architecture and reusable UI

- Expo SDK 56, React Native 0.85, TypeScript, Expo Router, NativeWind 4, and Tailwind CSS 3. Routes live under `src/app/`; typed routes and the React Compiler are enabled.
- The `(tabs)` group already contains **Home**, **Learn**, and **Progress** screens, a custom floating tab bar, and hidden legacy `words`, `sentences`, and `conversations` routes that redirect into Learn. Do not add parallel routes before evaluating whether these screens can be extended.
- `src/app/(tabs)/home.tsx` is an existing learner dashboard with streak/goal, continue-learning, quick-practice, word-of-the-day, and recommendations. It currently surfaces three products, not four. Extend this screen deliberately so its working dashboard features are preserved.
- `src/app/(tabs)/learn.tsx` already has a three-product selector, search, lesson rows, phrase cards, locked/Pro presentation, and a placeholder lesson alert. It is a useful starting point for a product explorer, but currently has no separate section, section-detail, level, lesson-player, conversation, or curriculum flows.
- `src/app/(tabs)/progress.tsx` presents a progress dashboard with illustrative sample values. Progress is not currently connected to a learning flow.
- `src/features/learning/data.ts` is explicitly documented mock data and is the existing frontend learning fixture/type location. Extend/reorganize it for the UI rather than creating a duplicate data layer. Keep demo/sample values clearly marked as mock in code and avoid presenting interactions as server-confirmed.
- `src/components/learning/primitives.tsx` provides `TabScreen`, `SectionHeader`, `ProgressBar`, `ProgressRing`, `StatStrip`, and tap feedback. `src/components/navigation/FloatingTabBar.tsx` already handles safe-area spacing, tab accessibility, keyboard hiding, and platform-specific glass styling.
- The design tokens are defined in `tailwind.config.js` and documented in `DESIGN.md`; NativeWind is set up by `global.css`, Babel, and Metro. Tailwind’s font names include Arabic and Latin font families that are not confirmed as loaded. Check actual installed fonts/assets before relying on them; Bengali and Arabic glyph coverage must be verified on-device or in a rendered UI.
- Relevant dependencies are already installed (Lucide icons, Expo Linear Gradient, Expo Image, Expo Haptics, safe-area context, SVG, Zustand, AsyncStorage, and SecureStore). Their presence alone does not justify new providers or dependencies. There is no UI test script or test directory in the mobile app.
- Auth and onboarding routes exist. A profile tab is declared but a corresponding profile route was not present in the inspected route list; verify current route generation before adding profile/settings scope. Avoid unrelated changes to auth/onboarding.

### Data model reference only

The API schema provides the terms `Course`, `Section`, `Lesson`, `LessonContentItem`, `Word`, `Sentence`, `Conversation`, and progress entities. The existing learning fixture already uses course/lesson/phrase concepts. These are references for mock TypeScript types and labels only during this plan. No API calls, schema edits, migrations, seed changes, auth, subscriptions, ads, or server-persisted progress are part of UI-first implementation.

## 2. UI principles and frontend-only behavior

- Keep the product distinctions visible: **Words — Free**, **Sentences — Free**, **Conversations — Free + Premium**, and **Premium Curriculum — Paid**. “Free”, “Premium”, locked, and progress states shown during this work are presentation-only mock states, not verified entitlements.
- Present the hierarchy as **Learning Product → Section → optional Level → Lesson → Content Items**. Only show a level-selection step when it makes sense for the fixture/content; do not add empty navigation levels.
- Use existing local fixtures for realistic, concise Arabic text, transliteration, Bengali meanings, lesson grouping, conversation turns, and visual progress. Do not call the API or claim mock content is live production content.
- Use screen-local React state for temporary interactions such as selecting a filter, expanding a level, stepping through lesson items, marking a demo item complete, or showing a locked-content preview. Do not add persistent unlock/progress behavior in this scope.
- Keep Arabic text direction local to Arabic elements and Bengali text readable in the app’s overall left-to-right layout. Do not flip the complete screen for RTL.
- Reuse theme tokens and accessible React Native primitives. Preserve existing Home dashboard content, tab navigation, legacy redirects, and unrelated onboarding/auth behavior.

## 3. Phased UI implementation

Every implementation phase requires explicit approval before work begins. If work reveals a need to change backend behavior, database structure, native configuration, or dependencies, stop and request a separate decision rather than expanding scope.

### Phase 0 — Project and UI audit (complete)

1. **Goal:** verify the current mobile routes, UI/data patterns, design setup, assets/dependencies, and backend content vocabulary without changing code.
2. **Screens/components:** Home, Learn, Progress, tab layout/bar, legacy product redirects, and shared learning primitives.
3. **Existing files to reuse:** `src/app/(tabs)/home.tsx`, `learn.tsx`, `progress.tsx`, `(tabs)/_layout.tsx`; `src/features/learning/data.ts`; `src/components/learning/primitives.tsx` and `navigation/FloatingTabBar.tsx`; `tailwind.config.js`, `global.css`, `DESIGN.md`, `app.json`, `package.json`.
4. **Frontend deliverables:** this audit and phased plan. No app files changed.
5. **Mock/temporary state:** identify existing mock data and distinguish it from app behavior.
6. **Validation:** inspect routes/config and verify worktree scope; no build or UI test claimed.
7. **Dependencies:** none.
8. **Exclusions:** no implementation or backend edits.

### Phase 1 — UI architecture, design conventions, and mock-data strategy (complete)

1. **Goal:** agree on the screen map and extend the existing mock fixture/types to represent all four products without a competing data model.
2. **Screens/components:** Home and Learn information architecture; product/section/level/lesson/item mock types; selected-product/section navigation state.
3. **Existing files to reuse:** `src/features/learning/data.ts`, `src/app/(tabs)/home.tsx`, `src/app/(tabs)/learn.tsx`, `src/app/(tabs)/_layout.tsx`, `src/components/learning/primitives.tsx`.
4. **Frontend deliverables:** complete. `src/features/learning/data.ts` now exports typed mock product/section/optional-level/lesson/content-item fixtures for Words, Sentences, Conversations, and Premium Curriculum; multiple sections and lesson states support browsing/filtering UI; sample Arabic, Bengali, transliteration, speaker, and audio-availability fields support future screen design. The same module exports an explicit screen map that distinguishes current tabs from planned Learn-tab selection states. Existing `courses` exports remain available for current callers. Incorrect mock Pro flags were removed from Words and Sentences.
5. **Mock/temporary state:** all new catalog data is explicitly marked as mock; sample item references are presentation fixtures, not complete production lessons. Access and progress are visual fixture values only and are not persisted.
6. **Validation:** fixture assertions passed for all four products, 15 sections, 12 sample items, valid sample-item references, free Words/Sentences, and an available free conversation sample in every conversation section. Prettier check passed for `src/features/learning/data.ts`; focused ESLint passed for that file. Full mobile TypeScript check reports the pre-existing typed-route error for `router.navigate("/profile")` in `src/app/(tabs)/home.tsx` and no diagnostic in the changed fixture. Full Expo lint still reports existing errors in Home, Learn, Forgot Password, Login, Register, and onboarding files; its auto-generated `eslint.config.js` was removed after the check. No mobile automated test suite exists.
7. **Dependencies:** Phase 0.
8. **Exclusions:** no API contracts/client, schema/entity changes, backend seed edits, auth integration, or product-entitlement logic.

### Phase 2 — Shared components and visual foundations (complete)

1. **Goal:** refine or add only reusable pieces needed by multiple learning screens while preserving the established design system.
2. **Screens/components:** product/access badges, section/lesson cards, Arabic/transliteration/translation content presentation, progress/step indicators, buttons, and reusable loading/empty/error/locked/completed visual states as required by approved screens.
3. **Existing files to reuse:** `src/components/learning/primitives.tsx`, `src/components/home/LearningLibraryScreen.tsx` where appropriate, `src/components/navigation/FloatingTabBar.tsx`, `tailwind.config.js`, `DESIGN.md`, and existing Lucide/NativeWind conventions.
4. **Frontend deliverables:** complete. `src/components/learning/LearningUI.tsx` provides typed access/status badges, a reusable learning card with optional progress, and an Arabic/transliteration/Bengali content card. The components reuse the existing `ProgressBar`, theme tokens, Lucide icons, and NativeWind patterns; card and content accessibility labels are provided. Loading, empty, and error states remain in Phase 8 because they are screen/data-state presentations rather than shared foundations required by current routes.
5. **Mock/temporary state:** components receive presentation values/labels via props; they do not infer real entitlements or persist progress.
6. **Validation:** Prettier check passed for `LearningUI.tsx`; `git diff --check` passed. Component props and visual states were reviewed; interactive cards have a 76px minimum height, and display-only badges have explicit accessible labels. The full TypeScript check still fails on the pre-existing `router.navigate("/profile")` typed-route error in `src/app/(tabs)/home.tsx`; it reports no diagnostic in the new component. No route currently renders these new components, so narrow/large-device and screen-reader rendering checks are deferred until screen implementation. No automated component test infrastructure exists.
7. **Dependencies:** Phase 1 design/data agreement.
8. **Exclusions:** no new UI library, global store/provider, backend service, theme replacement, or unrelated redesign.

### Phase 3 — Learning Home and primary product navigation (complete)

1. **Goal:** make four learning products easy to discover from the existing Home experience without discarding its current learner dashboard.
2. **Screens/components:** `HomeScreen`, existing Learn navigation, product cards/tiles, descriptive free/premium badges, and product-selection route parameters.
3. **Existing files to reuse:** `src/app/(tabs)/home.tsx`, `src/app/(tabs)/learn.tsx`, `src/app/(tabs)/_layout.tsx`, `src/components/learning/primitives.tsx`, `src/components/navigation/FloatingTabBar.tsx`, and current product icon/data definitions.
4. **Frontend deliverables:** complete. Home now presents four distinct product cards using `learningProducts`, with free, mixed, or premium labels and fixture descriptions. Words, Sentences, and Conversations navigate to the existing Learn tab with the selected section. The Premium Curriculum entry opens an inline mock preview; existing dashboard, continue-learning, goal, recommendation, and tab behavior remain.
5. **Mock/temporary state:** the Premium Curriculum preview is in-memory and dismissible, explicitly grants no purchase or access, and does not implement the curriculum screens planned for Phase 7.
6. **Validation:** Prettier and `git diff --check` passed. Expo web rendering was checked at a 375px viewport: the four cards formed a two-column layout without horizontal overlap and remained reachable by scrolling. Browser interactions verified routes `/learn?section=words`, `/learn?section=sentences`, and `/learn?section=conversations`; the curriculum preview appeared and closed. The full TypeScript check reports only the existing typed-route error from `router.navigate("/profile")` in `src/app/(tabs)/home.tsx`; no new navigation errors were reported. No mobile automated test suite exists, and native iOS/Android rendering was not tested.
7. **Dependencies:** Phases 1–2.
8. **Exclusions:** no real subscription screen/checkout, entitlement checks, rewarded ads, or account state.

### Phase 4 — Section Explorer, section details, levels, and lesson lists

1. **Goal:** let users browse product sections and see lessons in a clear hierarchy without adding empty intermediate screens.
2. **Screens/components:** product-specific section explorer presentation, section details, optional level grouping/selection, and reusable lesson list/card. Extend existing Learn only if it supports the flow cleanly; add Expo Router routes only after confirming the existing typed route pattern.
3. **Existing files to reuse:** `src/app/(tabs)/learn.tsx`, `src/app/(tabs)/words.tsx`, `sentences.tsx`, `conversations.tsx`, `src/features/learning/data.ts`, and shared learning primitives.
4. **Frontend deliverables:** complete. The existing Learn route now presents Words, Sentences, and Conversations product tabs, fixture-backed section cards, selected-section details, optional level tabs, and lesson cards. Sections without levels lead directly to their lessons. The existing `?section=` route parameter remains compatible with Home and legacy product routes. Search covers sections, lessons, and the existing phrase content; lesson selection presents a local preview and does not unlock content.
5. **Mock/temporary state:** product, section, level, search, and lesson-preview selections are local UI state. Fixture progress/status remain illustrative and are not persisted. Locked lesson copy explicitly avoids implying account access was changed.
6. **Validation:** targeted Expo lint passed for `src/app/(tabs)/learn.tsx`; Prettier checks for Learn, Home, and `LearningUI.tsx` passed; `git diff --check` passed. Expo web review at 375px verified product switching (5 Words, 5 Sentences, and 4 Conversation sections), section selection/details, level and no-level paths, empty search and clear action, and a locked lesson preview. `bun x tsc --noEmit` still reports only the existing typed-route error for `router.navigate("/profile")` in Home. No mobile automated test suite exists, and native iOS/Android rendering was not tested.
7. **Dependencies:** Phases 1–3.
8. **Exclusions:** no API-backed catalog, real unlock policy, or database-derived count/progress.

### Phase 5 — Word and Sentence learning experiences

1. **Goal:** create a coherent, reusable demo learning flow for vocabulary and sentences.
2. **Screens/components:** word item/player, sentence item/player, item card, audio affordance, previous/next controls, lesson progress indicator, and demo completion summary.
3. **Existing files to reuse:** existing phrase presentation and lesson action in `src/app/(tabs)/learn.tsx`, `src/components/home/LearningLibraryScreen.tsx`, `src/components/learning/primitives.tsx`, and typed mock fixtures in `src/features/learning/data.ts`.
4. **Frontend deliverables:** complete. The existing Learn route now launches a fixture-backed player for available Words and Sentences lessons. It presents Arabic, transliteration, Bengali meaning, English gloss, item position/progress, previous/next controls, and a local completion summary with restart/back actions. The same content card is reused while the item label distinguishes vocabulary from sentences. Invalid/missing mock items display an explicit unavailable state.
5. **Mock/temporary state:** item position and completion are screen-local and reset when opening/restarting a demo lesson. Audio status is informational only; even where fixtures list audio, the UI explicitly says playback is not connected. There is no server completion, scoring, or persistence.
6. **Validation:** targeted Expo lint for `src/app/(tabs)/learn.tsx`, Prettier check, and `git diff --check` passed. Expo web review at a 375×812 viewport verified a two-item word lesson’s previous/next bounds, Arabic and transliteration presentation, Bengali text and audio notice, completion, restart, and return to lessons. A sentence lesson displayed the sentence-specific label and Bengali translation, then completed and restarted. Screenshots confirmed Arabic remains right-aligned/RTL and Bengali remains readable in the screen’s LTR layout. Full TypeScript check still reports only the pre-existing typed-route error for `router.navigate("/profile")` in Home. No automated mobile tests or native iOS/Android rendering were run.
7. **Dependencies:** Phases 1–4.
8. **Exclusions:** no progress API, persistence, real audio integration, server completion, or quiz scoring/business rules.

### Phase 6 — Conversation browsing and learning experience

1. **Goal:** demonstrate conversation sections, dialogue lists/turns, and visually distinct free and premium examples.
2. **Screens/components:** conversation list/detail/player, speaker-labelled turns, conversation item cards, and locked-content presentation.
3. **Existing files to reuse:** `src/app/(tabs)/conversations.tsx` redirect (preserve compatible route behavior), existing Learn screen, `src/features/learning/data.ts`, and shared learning primitives.
4. **Frontend deliverables:** complete. The existing Learn route presents free conversation samples as ordered, speaker-labelled dialogue turns using the shared Arabic/transliteration/Bengali content card. Audio availability is informational and does not imply playback. Premium lessons show a locked mock preview with a local-only access-details action; no protected dialogue is rendered.
5. **Mock/temporary state:** conversation lists, labels, dialogue, and access states use existing local fixtures. The premium preview action only reveals explanatory copy; it does not navigate to checkout or grant access. No server content security or entitlement behavior is implemented.
6. **Validation:** targeted Expo lint, Prettier, and `git diff --check` passed. Expo web review at 375×812 verified four sections, a free two-turn conversation with speaker labels and ordered Arabic/Bengali text, audio-availability notes, and return-to-lessons navigation. The premium lesson showed its locked mock preview, kept its Arabic dialogue hidden, and displayed an explicit notice that checkout/entitlement checks are not connected and no access is granted. Full TypeScript check still reports only the pre-existing typed-route error for `router.navigate("/profile")` in Home. No automated mobile tests or native iOS/Android rendering were run.
7. **Dependencies:** Phases 1–5, including the shared language-item presentation from Phase 5.
8. **Exclusions:** no backend filtering, entitlement validation, subscription checkout, or protected-content guarantees.

### Phase 7 — Premium Curriculum overview and day/lesson selection

1. **Goal:** present Curriculum as a separate structured product, not as a paid Words/Sentences wall.
2. **Screens/components:** curriculum overview, sequence/day selector, curriculum lesson list, mock objective/exercise preview, and locked/premium presentation.
3. **Existing files to reuse:** Home product entry, Learn/product navigation, shared section/lesson/progress components, and fixture data.
4. **Frontend deliverables:** complete. Home now opens a dedicated `/curriculum` screen. The screen uses the existing seven-day mock sequence, marks the current day by default, presents demo progress and objectives, and allows local day selection. Completed/current days can show one clearly labelled illustrative content item; locked days show their objective and locked copy without rendering their sample content. The curriculum overview and product badge distinguish this paid product from free libraries.
5. **Mock/temporary state:** selected day is screen-local. Progress/status are fixture-only. Previewed learning content is illustrative and does not start a lesson; locked days do not reveal their sample items. Copy states that no purchase, enrollment, or access change is performed.
6. **Validation:** Expo web at 375×812 verified Home-to-Curriculum navigation, the seven-day sequence, default current-day preview, selecting a completed day and its Arabic sample, selecting a locked day without exposing its sample item, and return to Home. Targeted Expo lint passed for the new curriculum route, tab layout, shared UI component, and fixture map. A broader targeted lint that included Home reported its pre-existing unescaped apostrophe at `src/app/(tabs)/home.tsx:164`; that unrelated copy was not changed. Prettier and `git diff --check` passed. Full TypeScript check reports only the pre-existing typed-route error for `router.navigate("/profile")` in Home. No automated mobile tests or native iOS/Android rendering were run.
7. **Dependencies:** Phases 1–6 and shared components from Phase 2.
8. **Exclusions:** no payment UI that collects payment, purchase SDK, subscription verification, or entitlement service.

### Phase 8 — Progress, completion, loading, empty, and error states

1. **Goal:** make the visual experience credible across routine, terminal, and unavailable states while keeping data clearly local.
2. **Screens/components:** existing Progress dashboard, lesson completion summary, product/section/list empty states, loading skeletons/spinners where justified, retry/error presentation, locked state, and completed/current state.
3. **Existing files to reuse:** `src/app/(tabs)/progress.tsx`, `src/app/(tabs)/home.tsx`, `src/components/learning/primitives.tsx`, and fixture data.
4. **Frontend deliverables:** complete. Progress now uses the shared safe-area/tab-bar scroll shell and derives its sample minutes, streak, XP, and daily goal from existing fixtures and onboarding preferences. A clearly labelled local preview selector exposes Sample, Loading, Empty, and Error states. Existing Learn UI supplies empty-search and missing-content error states, locked previews, and the Word/Sentence completion summary; Conversation and Curriculum locked states remain explicit mock previews. The learning screen map now marks implemented screens as existing.
5. **Mock/temporary state:** all dashboard values are sample fixtures. Loading is a visual preview only; Empty and Error are local presentation examples, not server responses. The error-state action returns to sample progress instead of simulating a retry. No data is saved or synchronized.
6. **Validation:** targeted Expo lint for Progress and the fixture screen map passed. Prettier and `git diff --check` passed. Expo web review at 375×812 exercised all four Progress states, returned from the Error state to sample metrics, and visually confirmed the weekly chart bars and floating-tab-bar clearance. Word/Sentence completion and restart, Learn search-empty/error states, and locked mock previews were verified in their respective phases. Full TypeScript check still reports only the pre-existing typed-route error for `router.navigate("/profile")` in Home. No automated mobile tests or native iOS/Android rendering were run.
7. **Dependencies:** Phases 2–7; relevant screens must exist before their state variants are polished.
8. **Exclusions:** no backend retry, offline cache, persistent progress, analytics, or network-state management.

### Phase 9 — RTL, Bengali typography, responsiveness, accessibility, and polish (**Completed**)

1. **Goal:** validate and refine language rendering and usability across the implemented learning screens.
2. **Screens/components:** Home, Learn, Curriculum, Progress, shared Arabic/Bengali content, tab navigation, and auth-mode tabs.
3. **Existing files reused:** `DESIGN.md`, `tailwind.config.js`, `src/components/learning/LearningUI.tsx`, `src/components/learning/primitives.tsx`, `FloatingTabBar.tsx`, and existing safe-area/scroll patterns.
4. **Frontend deliverables:** preserved Arabic RTL/right alignment and Bengali LTR rendering; increased previously 40–44 pt lesson navigation, product/level/state selector, Curriculum back, and Progress state controls to 48 pt. Existing small icon controls retain their tested `hitSlop`. Added explicit `aria-selected` to tab controls and `aria-pressed` to the Home bookmark toggle so selected/pressed state is exposed on web as well as native. No font assets or font-loading code exist, so the configured system sans-serif fallback remains in use; no font, dependency, or configuration changes were made.
5. **Mock/temporary state:** all sample content, progress, and access indicators remain local UI examples. The bookmark remains temporary component state.
6. **Validation:** Expo web at 320, 360, 390, and 768 pt widths showed no document/body horizontal overflow on Home, Learn, or Curriculum; Progress states were exercised at 320 pt. Arabic and Bengali sample cards were visually checked; computed styles showed Arabic `rtl`/right aligned at 26 px with 42 px line height, and Bengali `ltr` at 14 px with 20 px line height. Browser checks confirmed 48 pt lesson navigation, product/level/progress tabs, Curriculum back, and Progress error return controls; selected tab and pressed bookmark ARIA states updated correctly. Targeted Expo lint passed for the changed files excluding Home. Lint including Home reports its pre-existing unescaped apostrophe at `home.tsx:164`. Prettier and `git diff --check` passed. `bunx tsc --noEmit` still reports the pre-existing typed-route mismatch for `router.navigate("/profile")` in Home. Web review does not verify native iOS/Android rendering, dynamic text scaling, or assistive technology behavior.
7. **Dependencies:** Phases 2–8.
8. **Exclusions:** no app-wide RTL mirroring, unsupported font installation, native configuration changes, or unrelated redesign.

### Phase 10 — UI-focused validation and regression review

1. **Goal:** ensure the approved UI phases compile, navigate, and preserve existing app surfaces.
2. **Screens/components:** changed routes/components and regression paths through onboarding, Home, Learn, Progress, auth routes, and legacy product redirects.
3. **Existing files to reuse:** package scripts and the project’s Expo/TypeScript setup; no test infrastructure currently exists in the mobile app.
4. **Frontend deliverables:** reviewed diff, recorded commands/results, screenshots or manual visual notes when available, and updated plan status for the approved phase only.
5. **Mock/temporary state:** verify reset/revisit behavior for in-memory demo state; confirm no copy suggests API synchronization or purchase/ad completion.
6. **Validation:** run the supported mobile lint script (`bun run lint`) and TypeScript check (`bun x tsc --noEmit`) from `mobile-app`; use UI/browser/device verification when the environment supports it. There is no existing mobile test script, so do not claim automated tests ran. Run only focused checks for the changed phase.
7. **Dependencies:** each approved UI phase; use relevant validation immediately after that phase and regression review at the end.
8. **Exclusions:** no API test/build/migration/deployment, payment/ad sandbox, or database operation.

**Completion record**

- **Status:** Complete. Regression review confirmed the legacy Words, Sentences, and Conversations paths reach the unified Learn screen with the expected selected product.
- **Browser checks:** Verified the Home onboarding CTA, the onboarding route sequence and selected-option accessibility state, preview-only auth/reset copy, and Progress sample/loading/empty/error states. Progress preview state returns to the sample when leaving and reopening the screen. The password-reset preview states that no email is sent and that no password change is connected.
- **Accessibility correction:** The password-form preview shortcut is exposed as a button with an explicit label and hint and a 48-point minimum touch target.
- **Formatting:** `bun x prettier --write` was run on the Phase 10-edited source files; `bun x prettier --check` passed for those files and this plan.
- **Whitespace:** `git diff --check` passed.
- **Lint:** `bun run lint` remains blocked by existing diagnostics: unescaped apostrophes in `src/app/(tabs)/home.tsx:164` and `src/app/auth/login.tsx:461`; `set-state-in-effect` in `src/app/auth/forgot-password.tsx:47`; and unused `Eye` (`forgot-password.tsx:7`), `CheckCircle2` (`register.tsx:6`), and `country` (`onboarding/complete.tsx:46`). No Phase 10 copy/accessibility change introduced these diagnostics.
- **TypeScript:** `bun x tsc --noEmit` reports the existing typed-route mismatch for `router.navigate("/profile")` in `src/app/(tabs)/home.tsx:89`; the declared profile tab has no matching route.
- **Automated/native testing:** No mobile test suite or registered VS Code test controller is available. Browser checks cover web only; native iOS/Android rendering and interaction were not verified.
- **Remaining runtime notices:** Expo web reports the missing profile route plus deprecated `pointerEvents` and shadow style props. These were left unchanged as unrelated to this phase.

## 4. UI implementation order and approval

All planned UI phases are complete. Any additional frontend work should be separately scoped and explicitly approved before implementation.

## 5. Explicitly deferred work

Throughout this UI-first plan, do **not** modify or implement:

- API endpoints/contracts, mobile API clients, controllers, services, repositories, authentication, authorization, or backend business logic.
- Database schemas, tables, enums, relations, migrations, seeds, or production content.
- Payments, subscriptions, purchase verification, or real premium entitlements.
- AdMob, rewarded ads, interstitial ads, real lesson unlocks, or ad-reward behavior.
- Backend-based progress/completion, account synchronization, or persistent unlock storage.
- New backend, database, state-management, navigation, or UI libraries; dependency/config/native changes are out of scope absent a separately approved, justified need.

Use API/database code only as a reference to keep UI fixture concepts compatible with the existing `Course`, `Section`, `Lesson`, `LessonContentItem`, `Word`, `Sentence`, and `Conversation` vocabulary. Any future backend integration is a separate task/plan.

## 6. UI constraints and known risks

1. **Existing Home is a dashboard:** preserve useful goal, streak, continue-learning, and recommendation features while adding a clear four-product entry point; do not replace the screen wholesale without approval.
2. **Learn already contains overlapping content:** reuse its selector, search, lesson rows, and phrase presentation as appropriate; do not create duplicate product libraries or routes unnecessarily.
3. **Fixture content is illustrative:** current lesson counts/status/progress are hard-coded. Every demo metric and temporary state must be visibly or structurally identified as mock, not real account data.
4. **Fonts are uncertain:** Tailwind font keys are configured but actual font loading/coverage is not verified. Arabic shaping and Bengali glyph coverage need rendered validation before typography decisions.
5. **Routes are typed:** preserve Expo Router typed routes and inspect generated route types before adding route files. A `profile` tab declaration exists without a corresponding route in the inspected tree.
6. **Testing is limited:** no mobile test suite is configured. TypeScript/lint plus targeted manual/browser/device review are the supported baseline; never report unrun visual checks as passed.
7. **Native behavior varies:** the floating bar already handles safe areas and Android keyboard hiding; avoid regressing it and identify platform coverage precisely.
