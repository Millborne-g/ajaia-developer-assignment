# Architecture Overview

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| UI framework | React 19 + TypeScript 6 | Required by assessment |
| Build tool | Vite 8 | Fast HMR, bundler-mode TS |
| Routing | React Router v7 | SPA routing |
| Rich-text editor | Tiptap v3 (ProseMirror) | Extensible, outputs JSON |
| Backend / Auth | Supabase (PostgreSQL + GoTrue) | Required by assessment |
| Testing | Vitest + Testing Library | Vite-native, fast |
| Deployment | Vercel | Required by assessment |

## Feature-Sliced Design (FSD)

The codebase follows FSD. Layers are strictly ordered: higher layers may import from lower layers, never the reverse.

```
app/          ← BrowserRouter, AuthProvider, AppRouter
pages/        ← Route-level page composition
widgets/      ← DocumentSidebar, EditorLayout
features/     ← User action slices (create, rename, edit, share, import, auth)
entities/     ← Domain types, API helpers, reusable domain UI
shared/       ← Supabase client, UI primitives, lib utilities, shared types
```

### Key dependency paths

```
pages/EditorPage
  → widgets/EditorLayout          (toolbar + status header)
  → features/edit-document        (TiptapEditor, useEditDocument)
  → features/share-document       (ShareDialog)
  → entities/document             (fetchDocument, Document type)
  → shared/lib/tiptapExtensions   (shared extension list)
  → shared/api/supabase           (client)

widgets/DocumentSidebar
  → features/create-document
  → features/import-document
  → features/rename-document
  → features/share-document
  → entities/document             (documentApi, DocumentCard)
```

### FSD rules observed

- No cross-feature imports
- `shared` has no FSD-layer imports (only third-party and Node)
- `entities` imports only from `shared`
- All Supabase I/O is encapsulated in `entities/**/model/*Api.ts`

## Database Schema

```
profiles
  id         UUID PK (FK → auth.users)
  email      TEXT
  created_at TIMESTAMPTZ

documents
  id         UUID PK
  title      TEXT
  content    JSONB          ← Tiptap editor JSON
  owner_id   UUID FK → auth.users
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ    ← auto-updated by trigger

document_shares
  id          UUID PK
  document_id UUID FK → documents (CASCADE)
  user_id     UUID FK → auth.users (CASCADE)
  permission  TEXT CHECK IN ('view','edit')
  created_at  TIMESTAMPTZ
  UNIQUE (document_id, user_id)
```

## Authentication and Authorization Design

### Authentication

Supabase Auth (GoTrue) handles email/password sign-up and sign-in. The frontend uses `supabase.auth.onAuthStateChange` in the `AuthProvider` context to reactively track the session. `ProtectedRoute` in `app/router.tsx` redirects unauthenticated users to `/auth`.

### Authorization — Row Level Security

All document access control is enforced by PostgreSQL RLS policies, **not** by frontend checks. The anon key exposed to the frontend can only perform operations that pass RLS.

**`documents` policies:**

| Operation | Allowed when |
|---|---|
| SELECT | `owner_id = auth.uid()` OR user is in `document_shares` |
| INSERT | `owner_id = auth.uid()` |
| UPDATE | `owner_id = auth.uid()` OR in `document_shares` with `permission = 'edit'` |
| DELETE | `owner_id = auth.uid()` only |

**`document_shares` policies:**

| Operation | Allowed when |
|---|---|
| SELECT | Document owner OR `user_id = auth.uid()` |
| INSERT | Document owner only |
| DELETE | Document owner only |
| UPDATE | Denied (use delete + insert) |

**`profiles` policies:**

| Operation | Allowed when |
|---|---|
| SELECT | Any authenticated user (needed for share-by-email lookup) |
| INSERT | Denied from client (trigger-only) |

### Profiles and the sharing flow

`profiles` is populated automatically by a `SECURITY DEFINER` PostgreSQL trigger (`on_auth_user_created`) that fires after every new `auth.users` insert. This gives authenticated users a safe way to look up other users by email without exposing `auth.users` directly.

The sharing flow:
1. Owner enters a recipient email in `ShareDialog`
2. Frontend queries `profiles` by email (allowed by RLS)
3. If found, inserts a row into `document_shares`
4. RLS prevents inserting a share unless the inserter owns the document

## Content Persistence

Tiptap editor content is stored as **JSONB** in `documents.content`. The same extension list (`shared/lib/tiptapExtensions.ts`) is used by both the editor and the `markdownToTiptap` import converter to ensure consistent JSON structure.

Auto-save: `useEditDocument` debounces `onUpdate` events by 1.5 s, then calls `updateDocumentContent`. A `beforeunload` listener warns the user if there are pending unsaved changes.

## File Import

| File type | Conversion |
|---|---|
| `.md` | `marked` parses Markdown → HTML, `generateJSON` converts HTML → Tiptap JSON |
| `.txt` | Custom `txtToTiptap` splits lines into paragraph nodes |

Validation: type check (extension + MIME), size ≤ 5 MB, non-empty content.

## Trade-offs and Scope Decisions

- **Live sync + presence avatars, not CRDT collab** — Supabase Realtime Postgres Changes refresh the document list and apply remote content/title when the local editor is clean. Realtime Presence drives header avatars only (no remote carets). Concurrent body edits remain last-write-wins (no TipTap+Yjs).
- **Permission model defaults to `edit`** — The share dialog grants edit access. A permission selector could be added to `ShareDialog` with minimal effort.
- **Share dialog shows UUID-prefix** — Profiles store email only; the share list could join profiles to show email addresses with a single extra query.
- **`erasableSyntaxOnly` compliance** — TypeScript 6's `erasableSyntaxOnly` flag prohibits `enum` declarations. All enums are replaced with `const` string literals and union types throughout the codebase.
- **`baseUrl` / `paths` deprecation** — TypeScript 6 deprecated these options. They are retained with `"ignoreDeprecations": "6.0"` because Vite's bundler-mode resolver still handles the `@/` alias at runtime; the TS paths are for editor tooling only.
