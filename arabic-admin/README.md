# Arabic App Admin

Admin panel for managing words, sentences and categories in the Arabic
learning platform. Talks to the `arabic-app-server` API.

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS v4** (CSS-first config via `@theme`, no `tailwind.config.js`)
- **shadcn-style components** — hand-built on Radix primitives (no CLI dependency)
- **TanStack Query** — server state, caching, pagination
- **React Hook Form + Zod** — forms and validation
- **Zustand** — in-memory auth state
- **Axios** — API client with an automatic refresh-token interceptor
- **React Router** — routing

## Folder structure

```
src/
  components/
    ui/        hand-built shadcn-style primitives (Button, Dialog, Table, Form…)
    layout/     Sidebar, Header, AppLayout, ProtectedRoute
  features/
    auth/       login page, silent-refresh bootstrap, auth API calls
    categories/ list page, create/edit dialog, API calls
    words/      list page (search/filter/pagination), create/edit dialog, API calls
    sentences/  list page, create/edit dialog (with ordered word picker), API calls
    dashboard/  landing page with content counts
  lib/          axios client, cn() helper
  stores/       zustand auth store
  types/        shared TypeScript types matching the API's response shapes
  routes/       react-router route tree
```

Each feature folder is self-contained: `api.ts` for requests, a page
component for the list view, and a dialog component for create/edit.

## Auth

The access token lives only in memory (Zustand, not persisted) to limit
XSS exposure. On page load, `AuthBootstrap` calls `POST /auth/refresh`
using the httpOnly cookie set by the API; if that succeeds, it fetches
the profile and the session resumes without a visible login screen. The
axios response interceptor also catches any 401 mid-session, retries a
silent refresh once, and only forces a logout if that fails too.

## Getting started

```bash
npm install
cp .env.example .env      # point VITE_API_URL at your running API
npm run dev
```

Requires the `arabic-app-server` API running and reachable at
`VITE_API_URL`, with `CLIENT_URL` in that server's `.env` matching this
app's origin (needed for the CORS + cookie setup to work).

## Design notes

Arabic content (word/sentence text) is rendered in Noto Naskh Arabic,
right-to-left, via the `.arabic-text` utility class — everywhere else
uses Inter. This is the one deliberate visual choice; the rest of the
UI stays quiet and functional since it's a working tool, not a
marketing surface.
