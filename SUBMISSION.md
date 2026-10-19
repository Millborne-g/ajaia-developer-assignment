# Submission

## Deliverables Included

- [x] Full source code with Feature-Sliced Design architecture
- [x] Supabase migration SQL (`supabase/migrations/001_initial_schema.sql`, `002_realtime_publication.sql`, `003_owner_id_update_protection.sql`)
- [x] Vitest test suite — 48 tests across 7 files, all passing
- [x] Production build verified (`npm run build` — zero errors)
- [x] `vercel.json` SPA routing configuration
- [x] `.env.example` with placeholder values
- [x] `README.md` with full setup, migration, and reviewer instructions
- [x] `ARCHITECTURE.md` with FSD structure, schema, and RLS design
- [x] `AI_WORKFLOW.md` documenting AI tool usage and verification
- [x] `SUBMISSION.md` (this file)
- [ ] `LIVE_URL.txt` — placeholder until Vercel deployment
- [ ] `WALKTHROUGH_URL.txt` — placeholder until walkthrough is recorded

## Source Repository

GitHub repository URL: _[to be added after push]_

## Live Deployment URL

See `LIVE_URL.txt` — placeholder until Vercel deployment.

## Reviewer Access Instructions

1. Clone the repository and follow the setup instructions in `README.md`
2. Create a Supabase project and run migrations in the SQL Editor, in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_realtime_publication.sql` (Realtime list + content sync)
   - `supabase/migrations/003_owner_id_update_protection.sql` (pins `owner_id` on UPDATE)
3. Create a `.env` file with the project credentials
4. Run `npm run dev` to start the local development server

**Test accounts** — create two accounts via the app's sign-up form:
- `reviewer-a@example.com` / `testpassword123` (owner)
- `reviewer-b@example.com` / `testpassword123` (collaborator)

**Suggested verification steps:**
1. Sign in as `reviewer-a`, create a document, add formatted content (headings, bold, lists)
2. Refresh the page — verify content and formatting are preserved
3. Import a `.md` or `.txt` file using the "Import file" button
4. Share the document with `reviewer-b@example.com`
5. Sign out, sign in as `reviewer-b` — the shared document appears under "Shared with me"
6. To verify RLS: open Supabase → Table Editor → `documents` → confirm no rows visible to the `anon` role

## Known Limitations

- Realtime Postgres Changes for list + editor sync; Supabase Presence avatars show co-editors; last-write-wins on concurrent body edits (no CRDT)
- Sharing supports **View** (read-only editor) and **Edit** permissions; owners can change or revoke access from the Share dialog
- Share dialog resolves collaborator emails via the `profiles` table
- Email confirmation depends on Supabase project settings — may need to be disabled for testing
- No document version history or comments
- Editor Export menu supports Markdown (.md download) and PDF via the browser print dialog (Save as PDF)
- `WALKTHROUGH_URL.txt` and `LIVE_URL.txt` are placeholders until deployment and recording are complete
