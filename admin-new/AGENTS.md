<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Arabic Master CMS Engineering Rules

## Architecture

- Use React Server Components by default. Keep `page.tsx`, `layout.tsx`, data loaders, content views, and static UI as server components.
- Do not add `"use client"` unless the component needs client-only behavior.
- A component may be client-side only when it uses state, effects, browser APIs, event handlers, controlled form behavior, animations driven by client state, or an interactive library that requires a client boundary.
- Keep client boundaries as small as possible. Extract only the interactive control into a client component and keep its parent, data fetching, and surrounding layout on the server.
- Do not convert an entire page or feature tree to a client component just because one button, dialog, menu, selector, or input is interactive.
- Prefer server-side data fetching and mutations. Pass serializable data into client components instead of fetching the same data in the browser.
- Use server components for read-only buttons or links. A normal `Link` does not require `"use client"`; a button only needs a client component when it has client-side behavior such as click state, opening a dialog, toggling UI, or submitting through a client handler.
- Keep loading, error, and not-found states in the route segment that owns the behavior.

## Interactive Components

- Use a dedicated client component for menus, dialogs, dropdowns, tabs with client state, accordions with client state, audio controls, drag-and-drop, and form interactions.
- Keep the client component API small and pass callbacks or serializable values only when necessary.
- Prefer progressive enhancement and native form actions where they fit instead of adding client state by default.
- Every interactive control must have an accessible name, visible focus state, keyboard support, and an appropriate semantic element.
- Use `Link` for navigation and `button` for actions. Do not use clickable `div` elements.

## Tailwind and Design Tokens

- Use semantic Tailwind utilities from `app/globals.css` instead of arbitrary token classes.
- Do not write classes such as `text-[var(--color-text-muted)]`, `font-[var(--font-heading)]`, `rounded-[var(--radius-default)]`, or `bg-[var(--color-primary)]`.
- Use semantic utilities such as `text-text-muted`, `font-heading`, `rounded-default`, and `bg-primary`.
- If a design token is missing, add it to `@theme inline` in `app/globals.css` before using it.
- Use arbitrary values only for genuine one-off layout values that cannot be represented by a design token.
- Do not create self-referencing CSS variables such as `--color-primary: var(--color-primary)`.
- Keep design values in the token layer. Do not introduce random colors, font sizes, radius values, or shadows in component classes.

## Styling

- Follow `Design.md` as the source of truth for color, typography, spacing, RTL behavior, and accessibility.
- Preserve the existing visual language and component APIs unless the task requires a deliberate change.
- Use the configured font utilities: `font-sans`, `font-heading`, `font-arabic`, and `font-bengali`.
- Use logical CSS properties when adding direction-sensitive styles. Arabic content must use `dir="rtl"` and `lang="ar"` where appropriate.
- Keep responsive layouts usable on mobile and desktop. Do not allow text, buttons, or Arabic content to overlap or clip.

## Validation

- After code changes, run `npm run lint`.
- For route, layout, CSS, or shared component changes, also run `npm run build`.
- Before finishing, search changed component files for arbitrary token classes such as `-[var(` and replace them when a semantic utility exists.
- Do not change generated `.next` files or remove the generated Next.js agent block above.
