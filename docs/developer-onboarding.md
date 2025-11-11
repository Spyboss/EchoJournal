# Developer Onboarding Guide

_Last updated: 2024-11-22_

Welcome to Echo Journal! This guide will get you productive quickly by covering prerequisites, environment setup, local workflows, and coding conventions drawn from the current codebase.

## 1. Prerequisites

- Node.js 18+
- npm 9+ (or compatible package manager)
- Supabase project with Email/Password auth enabled
- Optional: Google Genkit CLI (`npm install -g @genkit-ai/cli`) if you plan to work on AI flows

## 2. Repository Setup

```bash
git clone <repository-url>
cd EchoJournal
npm install
cp .env.example .env.local
```

Populate `.env.local` with the values described in the [README](../README.md#-quick-start). Without valid Supabase credentials authentication and storage will fall back to placeholders and fail.

## 3. Local Development

### 3.1 Start the web client

```bash
npm run dev
```

- The app runs at http://localhost:9002 (see `package.json` script `dev`).
- Authentication depends on Supabase redirect URLs. Add `http://localhost:9002` to **Authentication → URL configuration** in Supabase.

### 3.2 Start Genkit flows (optional)

```bash
npm run genkit:dev
```

This command registers the flows in `src/ai/flows/*.ts`. Provide `GOOGLE_GENAI_API_KEY` in `.env.local` to access Gemini 2.0 Flash. The static client does not invoke these flows automatically; wire them through API routes when testing locally.

## 4. Database Setup

Run the SQL statements in the README to provision the `journal_entries` and `profiles` tables. Verify Row Level Security policies allow authenticated users to insert and update their own rows. The application reads and writes using the Supabase JS client in [`src/lib/supabase.ts`](../src/lib/supabase.ts).

## 5. Development Workflow

| Task | Command | Notes |
| --- | --- | --- |
| Start client | `npm run dev` | Uses Next.js Turbopack |
| Type checking | `npm run typecheck` | Uses strict TS config but build ignores errors (`next.config.ts`) |
| Linting | `npm run lint` | ESLint is optional during build; run locally to catch issues |
| Static export | `npm run build` | Writes to `out/` for Cloudflare Pages |
| Jest (if tests exist) | `npm run test` | No suites checked into the repo yet |

## 6. Code Organization

- **App Router**: UI entry points live in `src/app`. The home journal page (`page.tsx`) contains most interaction logic; the weekly reflection page (`weekly-reflection/page.tsx`) focuses on AI summaries.
- **Context**: `AuthProvider` in `src/contexts/AuthContext.tsx` exposes Supabase user state.
- **Data Access**: `src/lib/supabase.ts` centralizes Supabase client configuration and CRUD helpers. `src/lib/journalService.ts` adapts database rows to UI-friendly objects.
- **Components**: Shared UI lives under `src/components`. Key composites include `Navigation`, `AuthForm`, `SearchAndFilter`, and `JournalEntryCard`.
- **Hooks**: Accessibility helpers (screen-reader announcements, skip links, focus trap) are provided in `src/hooks/useAccessibility.tsx` and reused on the journal page.
- **AI Flows**: Genkit flows live in `src/ai/flows`. Each flow defines Zod schemas for type-safe prompts and responses.

## 7. Coding Conventions

- Prefer functional React components with hooks.
- Keep API interactions within the `JournalService` layer to avoid duplicating Supabase calls.
- Maintain accessibility helpers (skip links, `aria-live` regions) when modifying the main journal page.
- When adding new environment variables, document them in both `.env.example` and the README table.
- Follow existing TypeScript strictness; ensure new modules export explicit types/interfaces where appropriate.

## 8. Testing Expectations

The repository includes Jest configuration (`jest.config.js`) but no suites. When introducing new features, add colocated `*.test.ts(x)` files and update the relevant scripts. Run `npm run test:ci` before submitting changes to ensure type checking, linting, and build succeed.

## 9. Common Tasks

### 9.1 Creating a new journal entry programmatically

Use `JournalService.createEntry(userId, content)` from within a component after validating `useAuth().user`. The service auto-generates a title and handles Supabase insertion.

### 9.2 Updating sentiment summaries

Once the `/api/sentiment` endpoint is implemented, call `JournalService.updateEntry(id, { sentiment_summary })` to persist AI output.

### 9.3 Extending the weekly reflection page

The page expects a summary string and prompt string. After connecting `analyzeWeeklyReflection`, set `reflectionSummary` and `writingPrompt` state values with the returned payload.

## 10. Getting Help

- Review the [architecture overview](./architecture-overview.md) for system context.
- Explore `src/app/page.tsx` to understand the journal experience end-to-end.
- Reach out to the team via your standard communication channel if Supabase policies or credentials need adjustment.
