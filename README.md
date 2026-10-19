# Docsync — Collaborative Document Editor

A polished, lightweight collaborative document editor built for the Ajaia AI-Native Full Stack Developer Assessment. Inspired by Google Docs, it supports rich-text editing, document sharing, file import, and secure per-document permissions enforced by Supabase Row Level Security.

## Features

- **Rich-text editing** — Bold, italic, underline, H1–H3 headings, bullet and numbered lists via Tiptap
- **Auto-save** — Changes are debounced and saved to Supabase automatically (1.5 s idle); saving/saved/error states are visible in the header
- **Document management** — Create, rename, delete, and reopen documents; formatting survives page refresh
- **Document sharing** — Share any owned document with another user by email; choose View or Edit access; shared documents appear in their sidebar
- **File import** — Import `.txt` and `.md` files (up to 5 MB) as new editable documents
- **Export** — Download the open document as Markdown, or print/Save as PDF from the editor
- **Authentication** — Supabase email/password auth with a protected dashboard and editor
- **Security** — All access control enforced by PostgreSQL RLS policies, not only frontend checks

## Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier is sufficient)
- A [Vercel](https://vercel.com) account (for deployment)

## Installation

```bash
git clone <repo-url>
cd ajaia-developer-assignment
npm install
```

## Environment Configuration

Copy `.env.example` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are found in your Supabase project: **Settings → API**.

> **Never commit `.env` to source control.** It is in `.gitignore`.

## Supabase Setup

### 1. Create the database schema

Open your Supabase project → **SQL Editor** → paste and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates:
- `profiles` table (synced from `auth.users` via trigger)
- `documents` table with all RLS policies
- `document_shares` table with all RLS policies
- Triggers for `updated_at` and automatic profile creation on signup

### 2. Enable Realtime (list + content sync)

Run `supabase/migrations/002_realtime_publication.sql` in the Supabase SQL Editor to add `documents` and `document_shares` to the `supabase_realtime` publication.

### 3. Pin document ownership on UPDATE (recommended)

Run `supabase/migrations/003_owner_id_update_protection.sql` in the SQL Editor. This adds a `WITH CHECK` so `owner_id` cannot be reassigned via an edit-share update.

### 4. Configure authentication

In Supabase → **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:5173` (development) or your Vercel URL (production)
- **Redirect URLs**: Add both:
  - `http://localhost:5173/auth/callback`
  - `https://your-app.vercel.app/auth/callback`

### 5. (Optional) Backfill profiles for existing users

If your Supabase project already has users created before the migration, run this in the SQL Editor to backfill `profiles`:

```sql
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

## Local Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run all Vitest tests once |
| `npm run test:watch` | Watch mode for tests |
| `npm run lint` | Run ESLint |

## Testing

```bash
npm test
```

48 tests across 7 test files, including:
- **`markdownToTiptap`** — Markdown → Tiptap JSON conversion (headings, lists, bold, italic, edge cases)
- **`txtToTiptap`** — Plain text → Tiptap JSON conversion
- **`documentApi`** — Document CRUD with mocked Supabase client; verifies correct error propagation for unauthorized access scenarios

## Deployment to Vercel

1. Push the repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add environment variables in Vercel → **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. The `vercel.json` SPA rewrite rule handles client-side routing.

## Reviewer / Test Accounts

Create two accounts through the app's sign-up form at `/auth`:

1. **Account A** (owner): `reviewer-a@example.com` / `testpassword123`
2. **Account B** (collaborator): `reviewer-b@example.com` / `testpassword123`

Suggested test flow:
1. Sign in as Account A → create a document → edit it → refresh → verify content is preserved
2. Share the document with Account B's email
3. Sign out, sign in as Account B → the shared document appears under "Shared with me"
4. Attempt to navigate directly to a document URL owned by Account A while signed in as a third user (or signed out) → Supabase returns no rows (403-equivalent)

> **Email confirmation** may be required depending on your Supabase project settings. If testing locally, you can disable it under **Authentication → Settings → "Confirm email"**.

## Supported File Formats

| Format | Extension | Notes |
|---|---|---|
| Plain text | `.txt` | Each line becomes a paragraph |
| Markdown | `.md` | Headings, bold, italic, lists parsed |

Maximum file size: **5 MB**

## Known Limitations

- Sharing supports **View** and **Edit** permissions; the owner can change or revoke access from the Share dialog
- Share dialog shows collaborator emails (via `profiles`); display names are not stored
- Live list + remote content sync via Supabase Realtime Postgres Changes; editor presence avatars show who else is on a document — no remote carets / CRDT (concurrent body edits remain last-write-wins)
- Email confirmation flow depends on Supabase project settings; reviewers may need to check email or disable confirmation
- PDF export uses the browser print dialog (Save as PDF), not a server-generated binary
- No document version history or undo across sessions
