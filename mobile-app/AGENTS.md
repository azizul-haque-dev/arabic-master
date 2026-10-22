# Project guidance

## 1. Project overview and verified architecture

- This is a private Expo React Native app using Expo SDK 56 (`expo` 56.0.21 installed), React Native 0.85.3, React 19.2.3, TypeScript, and Expo Router.
- The package entry is `expo-router/entry`. File-based routes live in `src/app/`; the current onboarding routes are `index.tsx`, `onboarding/language.tsx`, `onboarding/country.tsx`, `onboarding/goals.tsx`, `onboarding/practice-time.tsx`, and `onboarding/complete.tsx`. The root layout renders a Stack with headers hidden. Inspect the route tree before assuming other navigation patterns exist.
- NativeWind 4 with Tailwind CSS 3 is configured. React Compiler and Expo Router typed routes are enabled in `app.json`.
- Shared onboarding UI is under `src/components/onboarding/`; the onboarding answer store is under `src/features/onboarding/` and uses the installed Zustand package.
- `assets/` contains app and platform icons, splash assets, logos, and tab icon assets. Installed libraries include TanStack Query, Zustand, React Hook Form, AsyncStorage, SecureStore, Expo Image, and Lucide React Native; their presence alone does not establish an app pattern.

## 2. Sources of truth and directories

- Treat `package.json`, `bun.lock`, `app.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, and `global.css` as configuration sources of truth.
- `src/app/` is the verified route directory. `src/` is aliased as `@/*`; `assets/` is aliased as `@/assets/*` per `tsconfig.json`.
- Follow existing structure when adding code. `src/components/onboarding/` and `src/features/onboarding/` are established for the current onboarding feature; there is still no general API service convention.
- The repository currently has no root `GEMINI.md` or test directories. Recheck before relying on these observations in future work.

## 3. Expo SDK and React Native compatibility

- Keep Expo SDK 56, React Native 0.85.3, React 19.2.3, and Expo modules compatible. Check installed package versions and the SDK 56-compatible Expo documentation before using version-sensitive APIs or changing native configuration.
- Do not upgrade Expo, React Native, or Expo modules as an incidental part of feature work. Use Expo-compatible package versions and the repository's package manager.
- Prefer Expo APIs for device features where appropriate. Review platform support, permissions, config plugins, and native build requirements before implementing them. Do not assume Expo Go supports every native module.

## 4. Expo Router conventions

- Add screens and layouts under `src/app/`, not a root `app/`, `pages/`, or `navigation/` directory.
- Use Expo Router file-based routing and layouts. Keep route files focused on route composition and screen behavior; move reusable code only into a structure justified by existing or emerging code.
- `typedRoutes` is enabled. Preserve generated route type safety and use supported typed `Link`/router APIs; do not weaken route checking to silence errors.
- Keep navigation options in the relevant layout/screen and follow the current root Stack setup unless the requested navigation design requires a deliberate change.

## 5. TypeScript and React standards

- TypeScript is strict. Preserve strict checking; type props, API boundaries, and persisted data explicitly. Avoid `any`, unsafe casts, and non-null assertions unless a checked invariant justifies them.
- Use function components and existing React Native primitives. Import platform UI from `react-native` or the installed Expo library that owns the feature.
- Read the component and its callers before changing behavior. Keep changes focused and reuse an established pattern when one exists.

## 6. React Compiler

- `experiments.reactCompiler` is enabled. Write ordinary render-pure React code and avoid mutation or side effects during render.
- Do not add memoization (`useMemo`, `useCallback`, `memo`) by habit. Add it only when profiling or a concrete API/effect identity requirement supports it; verify compiler compatibility for unusual patterns.

## 7. NativeWind and styling

- NativeWind is wired through `babel.config.js`, `metro.config.js`, and `global.css`; Tailwind scans `./src/**/*.{js,jsx,ts,tsx}` and uses `nativewind/preset`.
- `global.css` is imported once by `src/app/_layout.tsx`. Keep the shared stylesheet there; avoid redundant per-screen imports. Confirm platform support before using web-only utilities.
- Prefer the existing theme tokens in `tailwind.config.js` for colors, spacing, typography, and radii. Font family keys correspond to Expo font names and may be placeholders until those fonts are loaded; inspect font setup before relying on them.
- Use `className` for supported NativeWind styling and `StyleSheet` or inline styles when dynamic/native properties are clearer or unsupported. Do not replace existing theme/config wholesale.

## 8. State management

- Use local React state for transient state owned by one screen/component.
- Use TanStack Query for remote/server state when data fetching, caching, refetching, or mutations justify it. Inspect whether a `QueryClientProvider` and query conventions exist before adding hooks; none are established in the current source tree.
- Use Zustand only for client state shared across distant components or screens. Avoid mirroring server data in Zustand.
- Do not add a global store or provider solely because the dependency is installed.

## 9. Forms and validation

- `react-hook-form` and `@hookform/resolvers` are installed, but no form pattern is present in current source. Inspect the installed API and nearby usage before choosing a form architecture.
- For nontrivial forms, use React Hook Form with explicit field types and a resolver/schema only when the project has an appropriate installed validation library; do not assume one is installed.
- Show accessible field labels, validation feedback, submission progress, and server errors. Prevent duplicate submissions and preserve user input on recoverable failures.

## 10. API, errors, loading, and environment

- Axios and TanStack Query are installed, but no endpoint, API client, service layer, or environment variable convention is established. Inspect repository configuration and ask for missing API contracts rather than inventing endpoints or names.
- Keep request/response types at network boundaries. Handle pending, empty, success, HTTP error, timeout, and offline cases appropriate to the feature; expose useful user feedback without leaking tokens or sensitive server details.
- Use `EXPO_PUBLIC_*` variables only for values safe to ship in the client. Never embed private credentials in app code or public environment variables. No `.env` convention is currently verified.
- Retry only safe/idempotent requests or operations with an explicit retry policy. Invalidate or update relevant query data after mutations when TanStack Query is in use.

## 11. Secure storage

- Use Expo SecureStore for small secrets such as authentication tokens when the app's lifecycle and platform requirements fit its documented behavior.
- Use AsyncStorage for non-sensitive preferences or cached client data, not credentials. Inspect data lifetime, backup, and logout requirements before persisting anything.
- Handle unavailable storage, serialization/version changes, and token removal on logout. Never log secret values.

## 12. Accessibility and responsive mobile UI

- Provide accessible labels/roles and state for controls, adequate touch targets, readable contrast, and screen-reader-friendly error/status feedback.
- Respect safe areas, notches, keyboard appearance, and scroll behavior. Test layouts at narrow and larger device sizes and account for platform differences.
- Preserve the app's current design tokens and product direction. Avoid a broad redesign when a focused change meets the request.

## 13. Performance and images

- Prefer `expo-image` for remote or performance-sensitive image rendering when its caching and loading features help. Set dimensions/aspect ratios and meaningful accessibility labels; provide placeholders/fallbacks for remote failures.
- Avoid unnecessary rerenders, large synchronous work on the JS thread, and unbounded lists. Use virtualized lists for genuinely long collections.
- Measure before optimizing. Keep bundled assets appropriately sized and use the existing `assets/` organization unless a clear need emerges.

## 14. Errors, debugging, and testing

- Reproduce the issue and inspect relevant code/config and logs before editing. Check whether a failure is platform-specific.
- Available package scripts are `start`, `android`, `ios`, `web`, `lint`, and `reset-project`. `reset-project` points to `scripts/reset-project.js`, which was not found during setup; verify before invoking it. `lint` runs `expo lint`, but no ESLint config was found in the root listing.
- No test directory or test script is currently defined. Do not claim tests ran or invent a test command. If tooling is added later, use its actual scripts and report results precisely.
- Use the smallest relevant check supported by available tools. Report skipped or failed checks and unresolved risks honestly.

## 15. Dependencies and Bun

- `bun.lock` is the checked-in lockfile and Bun is the established package manager. Do not use npm/yarn to mutate dependencies or generate another lockfile.
- Avoid adding dependencies when existing Expo/React Native APIs or installed packages suffice. Before adding one, verify Expo SDK compatibility and explain why it is needed.
- When a dependency change is requested and authorized, use Bun and keep `package.json` and `bun.lock` in sync. Do not install or upgrade packages without an explicit task need.

## 16. Safe editing workflow and completion checklist

1. Read relevant source, configuration, and applicable skills before editing; verify current package versions for version-sensitive APIs.
2. Confirm the requested behavior and inspect nearby patterns. Make focused changes and preserve unrelated user work.
3. Do not modify configuration blindly, invent project structure or environment variables, or add packages without need.
4. Review the diff for scope, types, accessibility, platform behavior, and accidental changes.
5. Run only checks supported by actual scripts and available tooling. Report files changed, checks actually run, failures, and unresolved issues; never imply a check passed if it was not run.
