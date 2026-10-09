# AGENTS.md — Next.js 16.4 Project Rules

These rules apply to every task in this repository. Follow them by default. If a request conflicts with a rule, say so and ask before deviating.

## 0. Ground Rules

- **Stack:** Next.js 16.4 (App Router), React 19.3, TypeScript (strict), Turbopack.
- **Never guess APIs.** Next.js changes fast. If unsure about an API, config flag, or file convention, check the official docs (https://nextjs.org/docs) or the installed `node_modules/next` types before writing code. Do not invent flags.
- **Prefer small, reviewable changes.** Do not refactor unrelated code.
- **Run before finishing:** `npm run lint`, `npm run typecheck` (or `tsc --noEmit`), and `npm run build`. Report failures honestly; do not claim success without running them.
- **Package manager:** use the one already in the repo (check the lockfile). Do not switch.

## 1. Architecture

```
Request ─► static shell ('use cache', from cache/CDN)
        └► dynamic parts (inside <Suspense>, rendered at request time)
        = ONE streamed response
```

- **Server Components by default.** Add `'use client'` only when you need state, effects, event handlers, or browser APIs.
- **Push `'use client'` as far down the tree as possible.** Keep client components small and leaf-like. Never mark a whole page or layout as client unless unavoidable.
- **Never import server-only code into client components.** Use `import 'server-only'` in modules that touch the database, secrets, or server APIs.
- **Colocate** route-specific components, actions, and types near the route; share cross-route code in `src/` (or the project's existing shared folder).

## 2. Cache Components (mandatory model)

Caching is **opt-in and explicit**. Do not rely on implicit caching.

Required config for new work:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
```

If the repo has not enabled these yet, **do not enable them silently**. Propose it, then migrate incrementally on its own branch/PR.

Rules:

1. **Cache small, data-focused units** (a component or function), not whole pages that contain personalized data.
2. Use `'use cache'` with an explicit lifetime: `cacheLife('...')` (e.g. `'hours'`).
3. Tag cached data with `cacheTag('...')` so it can be invalidated precisely.
4. **Wrap every dynamic component in `<Suspense>`** with a meaningful fallback. A missing Suspense boundary is a bug.
5. **Never read `cookies()`, `headers()`, or other request-time APIs inside a `'use cache'` scope.** Read them outside and pass the values in as props.
6. Cached functions/components must receive everything they depend on as **arguments/props** (they become part of the cache key). No hidden dependencies on request state.
7. **Invalidate after mutations:**
   - `updateTag('tag')` — in Server Actions, for immediate read-your-writes.
   - `revalidateTag('tag', profile)` — for stale-while-revalidate style refresh.
8. Never use the old `experimental.ppr` or `experimental.dynamicIO` flags or `export const experimental_ppr`; they are replaced by Cache Components.

Pattern to follow:

```tsx
import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';

export default async function Page() {
  const user = await getCurrentUser(); // request-time, outside cache

  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <Projects userId={user.id} />
    </Suspense>
  );
}

async function Projects({ userId }: { userId: string }) {
  'use cache';
  cacheLife('hours');
  cacheTag(`projects:${userId}`);

  const projects = await getProjects(userId);
  return projects.map((p) => <ProjectCard key={p.id} project={p} />);
}
```

## 3. Static Guarantees and Prefetching (new in 16.4)

- **Use `ensureStatic`** on pages/layouts that must never render at request time (blogs, marketing, catalogs):
  ```tsx
  export const ensureStatic = 'navigation'; // or 'prefetch' | 'shell'
  ```
  Put it in a layout to cover all pages beneath it. Only relax it in nested layouts that truly need dynamic content. If a build fails because of it, **fix the dynamic component or move it; do not remove the guard** without asking.
- **Prefetching:** use `<Link prefetch>` on key navigation paths to remove loading states.
- **Keep prefetch payloads small:** for expensive data that most links never need, `await navigation()` (from `next/cache`) inside the component so it loads on real navigation only. Use `await prefetch()` to defer cached content from the route shell until an explicit prefetch.
- Always provide `loading` UI via `<Suspense>` fallbacks that match the final layout to avoid layout shift.

## 4. Async Request APIs and Proxy

- `cookies()`, `headers()`, `params`, and `searchParams` are **async**. Always `await` them (or use `use()` in client components where applicable).
- Use **`proxy.ts`** (not `middleware.ts`) for rewrites, redirects, and lightweight auth gating. Keep it fast and free of heavy logic or database calls.
- **Proxy is not your only security layer.** Authorize inside Server Actions, Route Handlers, and data-access functions too.

## 5. Data Fetching and Mutations

- Fetch data **on the server, in Server Components or data-access functions**, close to where it is used. Run independent requests in parallel with `Promise.all`; avoid waterfalls.
- Put database/API calls in a **data-access layer** (e.g. `src/lib/data/*.ts`) with `server-only`. Components call these functions; they do not query directly.
- **Mutations use Server Actions** (`'use server'`) or Route Handlers when an external client needs an HTTP API.
- **Every Server Action must:**
  1. Validate input (e.g. with Zod) — never trust client data.
  2. Check authentication and authorization.
  3. Invalidate the right cache tags (`updateTag` / `revalidateTag`).
  4. Return typed, serializable results (no thrown raw errors to the client for expected failures).
- Treat Server Actions as **public endpoints**.
- Do not fetch from your own Route Handlers inside Server Components; call the shared function directly.

## 6. Client Components

- Use client-side data libraries only for genuinely interactive/client-driven state (optimistic UI, polling, infinite scroll). Do not duplicate server-fetched data into client state without a reason.
- Do **not** add `useMemo` / `useCallback` / `memo` by default. The React Compiler (`reactCompiler: true`) handles memoization. Add them only with a measured reason.
- Use React 19.3 features where they fit: **View Transitions** for route/state animations, **Fragment Refs**, `useOptimistic`, `useActionState`, `use()`.
- Keep props serializable when passing from Server to Client Components.

## 7. Performance

- Use `next/image` for images (set `width`/`height` or `fill`, plus `sizes`; add `priority` only for above-the-fold LCP images).
- Use `next/font` for fonts (self-hosted, no layout shift).
- Use `next/dynamic` / `import()` for heavy, rarely used client code.
- Avoid importing large libraries into client components; prefer server-side use.
- **Check bundle impact** after adding dependencies. Use the Turbopack Bundle Analyzer and compare against the previous snapshot. If the `next-bundle-optimizer` skill is installed, use it for bundle work.
- Set explicit `metadata` / `generateMetadata` per route for SEO.

## 8. Turbopack and Config Hygiene

- Turbopack is the default bundler. Do not add webpack-only config unless required, and explain why.
- **Experimental flags are opt-in per task.** Do not enable any `experimental.*` flag (e.g. `turbopackRustReactCompiler`, `turbopackGc`, `turbopackLazyDynamicImports`, `turbopackPluginRuntimeStrategy`) without asking.
- Keep `next.config.ts` typed (`NextConfig`) and minimal.
- Do not remove or weaken lint, type, or build checks to make something pass.

## 9. Upgrading Next.js

- Use the official agent upgrade flow: `npx next@canary upgrade --agent=latest`, then follow the version-specific guidance it prints.
- Run the official codemods the upgrade suggests; review the diff.
- Keep `experimental.agentUpgrade` at `'security'` (default) unless told otherwise.
- Stay on the latest **patch** of the current minor version. Security releases follow a formal process; apply them promptly.
- For adopting Cache Components or Partial Prefetching in an existing app, use the dedicated Next.js agent Skills from the docs and migrate **route by route**, verifying each step with a build.

## 10. TypeScript and Code Quality

- `strict` mode on. **No `any`**; use `unknown` and narrow, or define types.
- Type route props with the generated Next.js types; remember `params`/`searchParams` are promises.
- Prefer named exports for utilities; default exports only where Next.js requires them (pages, layouts, route files).
- Keep components small and single-purpose. Extract hooks and helpers instead of long files.
- Handle errors with `error.tsx` / `not-found.tsx` / `global-error.tsx` boundaries and typed result objects for expected failures.
- Accessibility: semantic HTML, labelled controls, keyboard support, visible focus states.

## 11. Security Checklist (apply to every change)

- [ ] No secrets in client code; env vars exposed to the browser only with `NEXT_PUBLIC_` and only when truly public.
- [ ] All external input validated on the server.
- [ ] Authn/authz checked in every Server Action, Route Handler, and data function.
- [ ] No sensitive data placed in cached scopes that are shared across users.
- [ ] No user-specific data cached without the user id as part of the cache key (via props/args).
- [ ] Dependencies reviewed before adding; pin versions via the lockfile.

## 12. Definition of Done

Before reporting a task complete, confirm:

1. Lint, typecheck, and `next build` pass (state what you ran).
2. New dynamic components are inside `<Suspense>`.
3. Cached code uses `'use cache'` with `cacheLife` and `cacheTag`, and no request-time APIs inside it.
4. Mutations validate, authorize, and invalidate the right tags.
5. No unnecessary `'use client'`, no unnecessary experimental flags, no leftover debug code.
6. You summarized what changed, what you were unsure about, and anything you did not verify.

## 13. Project-Specific Notes (fill in)

<!-- Add details agents cannot infer from the code. Keep it short. -->
- Package manager: 
- Database / ORM: 
- Auth approach: 
- Deployment target: 
- Test commands: 
- Folder conventions: