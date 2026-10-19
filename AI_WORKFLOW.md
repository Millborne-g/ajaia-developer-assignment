# AI Workflow

Documentation of the AI-assisted development process for the Ajaia LLC Docsync assignment. Claims below are limited to what was actually done or inspected in this repository.

## AI Tools Used

- **Cursor** — primary environment for planning, implementation, debugging, and instruction-file setup (rules/skills).
- Work was driven by explicit plan → approve → implement cycles for substantial tasks (app scaffold, Tailwind migration, Cursor rules/skills).

## Project Rules and Skills

Project-specific Cursor instructions live under `.cursor/`. They **guide** future AI sessions; they do not guarantee correct or secure output by themselves.

### Rules (created)

| Rule | Scope |
|---|---|
| `project-architecture.mdc` | Always — FSD layers and import direction |
| `react-typescript.mdc` | `**/*.{ts,tsx}` — React 19 / TypeScript 6 conventions |
| `tailwind-design-system.mdc` | `**/*.{tsx,css}` — Tailwind v4 tokens and themes |
| `supabase-security.mdc` | Always — RLS, ownership/sharing, secrets |
| `testing-verification.mdc` | Test files — Vitest and verification reporting |
| `assignment-scope.mdc` | Always — assignment deliverables and workflow guardrails |

### Skills (created)

| Skill | When to use |
|---|---|
| `supabase-rls-security` | Policy/migration/authz work |
| `tailwind-theme-and-dark-mode` | Theme tokens, dark mode, styling |
| `fsd-feature-implementation` | New or changed product features |
| `assignment-completion-audit` | Submission/status audits (no fixes unless asked) |
| `pre-push-verification` | Before any git push |

**Status:** These rules and skills were **created** as part of the instruction-file setup. Ongoing development should follow them; prior feature work was completed before they existed.

## Planning and Implementation Workflow

1. **Inspect** the repo (structure, `package.json`, existing layers, migrations).
2. **Plan** substantial work in Cursor plan mode; wait for explicit approval before coding.
3. **Implement** in FSD order; keep diffs scoped to the task.
4. **Verify** with available scripts (`npm test`, `npm run lint`, `npm run build`).
5. **Human approval** required for commits, pushes, deploys, and destructive database changes.

## Security and Supabase

- Document access is intended to be enforced by PostgreSQL RLS on `profiles`, `documents`, and `document_shares` (see `supabase/migrations/001_initial_schema.sql`).
- Cross-table RLS initially caused **infinite recursion**; policies were corrected to use `SECURITY DEFINER` helpers (`is_document_owner`, `has_document_share`).
- Frontend tests mock Supabase; they do **not** prove live RLS behavior.
- **Not Verified in this document:** systematic two-user live authorization testing against a production Supabase project. Manual signup/login and document open were exercised during development, but a formal two-account permission matrix was not recorded here.

## Design System

- **Implemented:** Tailwind CSS v4 (`@tailwindcss/vite`), Sage Green + Warm White tokens in `src/app/index.css`, class-based dark mode, `ThemeProvider` / `ThemeToggle`, anti-flash script in `index.html`.
- CSS Modules were removed during the Tailwind migration; styling is utility-first with global CSS reserved for Tiptap (`.ProseMirror`, `.editor-canvas`).

## Verification and Quality Assurance

Commands used during development (when run, results were observed in-session):

| Check | Command | Notes |
|---|---|---|
| Unit tests | `npm test` | Vitest suite (import converters + mocked `documentApi` + related units); **62 tests / 8 files** — re-run before submission |
| Lint | `npm run lint` | ESLint; cleaned to zero errors after theme/hook lint fixes |
| Build / types | `npm run build` | `tsc -b && vite build` |

Do not treat this file as a live CI badge — re-run commands before submission or push (`pre-push-verification` skill).

## Human Review and Decisions

- Plans for major work (initial app, Tailwind migration, rules/skills) were approved before implementation.
- Destructive SQL / DB resets require explicit approval.
- Commit, push, and deploy only when explicitly requested.
- Environment secrets stay in local `.env` / `.env.local` (gitignored); only anon/publishable keys in Vite env vars.

## Corrections and Rejected AI Output

Examples that were actually corrected or rejected during this project:

- **`useEditor` inside `TiptapEditor` (rejected)** — Lifted to `EditorPage` and pass `editor` as a prop instead of ref-callback exposure.
- **`vi.mock` hoisting (fixed)** — Use `vi.hoisted()` for mocks referenced inside factories.
- **`__dirname` in Vite 8 (fixed)** — Replaced with `import.meta.dirname`.
- **Empty paragraph JSON (fixed)** — Omit `content` on empty paragraphs in `txtToTiptap` to match Tiptap canonical JSON.
- **RLS infinite recursion (fixed)** — Avoid mutual EXISTS between `documents` and `document_shares`; use `SECURITY DEFINER` helpers.
- **Invalid empty doc `content: {}` (fixed)** — TipTap requires `{ type: 'doc', content: [...] }`; normalize on load and create with `EMPTY_TIPTAP_DOC`.
- **Migration order (fixed)** — Create `document_shares` before policies that reference it.

## Limitations and Outstanding Work

- `LIVE_URL.txt` and `WALKTHROUGH_URL.txt` still contain placeholders pending Vercel deploy and walkthrough upload.
- Formal two-user RLS/sharing matrix: **Not Verified** in this workflow log.
- Live list + remote content sync via Realtime Postgres Changes; Realtime Presence avatars show co-editors; remote carets removed (unreliable); full CRDT collaboration still out of scope (last-write-wins on concurrent body edits).
- Share dialog resolves collaborator emails via a profiles batch lookup (`fetchProfilesByIds`).
- Sharing supports **View** (read-only editor) and **Edit** permissions; owners can change or revoke access from the Share dialog.
- Cursor rules/skills improve consistency; they do not replace human review of security-sensitive changes.
