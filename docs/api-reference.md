# API & Integration Reference

_Last updated: 2024-11-22_

The Echo Journal frontend interacts with Supabase and optional AI services through a thin set of client-side abstractions. This document catalogs the available APIs, expected payloads, and extension points.

## 1. Authentication (Supabase)

Supabase Auth is used directly through the JS client. `AuthProvider` (`src/contexts/AuthContext.tsx`) exposes the following helpers:

| Method | Signature | Description |
| --- | --- | --- |
| `signUp` | `(email: string, password: string) => Promise<{ user: User \| null; error: AuthError \| null }>` | Creates a new user. Email confirmation must be enabled in Supabase for production. |
| `signIn` | `(email: string, password: string) => Promise<{ user: User \| null; error: AuthError \| null }>` | Signs in an existing user. |
| `signOut` | `() => Promise<void>` | Clears the current session. |

`AuthProvider` listens to `supabase.auth.onAuthStateChange` and automatically upserts a profile record via `profileOperations.upsertProfile`.

## 2. Journal Service

`src/lib/journalService.ts` wraps Supabase operations and should be the primary interface for components.

### 2.1 Methods

| Method | Signature | Behavior |
| --- | --- | --- |
| `createEntry` | `(userId: string, entryText: string) => Promise<void>` | Inserts a new row into `journal_entries`. Generates a `title` from the first 50 characters. |
| `getEntries` | `(userId: string) => Promise<Array<{ id: string; text: string; timestamp: string; sentimentSummary?: string }>>` | Fetches entries for a user ordered by `created_at` DESC and formats timestamps. |
| `updateEntry` | `(entryId: string, updates: { content?: string; sentiment_summary?: string }) => Promise<void>` | Updates content and/or sentiment summary. Recomputes `title` when content changes. |
| `deleteEntry` | `(entryId: string, userId: string) => Promise<void>` | Deletes an entry. The `userId` parameter is unused but kept for parity with higher-level calls. |
| `analyzeSentiment` | `(entryText: string) => Promise<{ sentiment: string; summary: string }>` | Placeholder; POSTs to `/api/sentiment` and expects `{ sentiment, summary }`. Returns a default neutral response on failure. |

### 2.2 Error Handling

Errors are caught and re-thrown with user-friendly messages. Components should surface failures via the toast system (`src/hooks/use-toast.ts`).

## 3. AI Flows (Genkit)

Genkit flows are defined as server-side functions but are not invoked in the static build. They can be executed via the Genkit CLI or by deploying them to a runtime that supports Genkit adapters.

### 3.1 `analyzeSentiment`

- **File**: `src/ai/flows/analyze-sentiment.ts`
- **Input schema**: `{ journalEntry: string }`
- **Output schema**: `{ sentiment: string; summary: string }`
- **Prompt behavior**: Instructs Gemini 2.0 Flash to classify the sentiment and produce a summary.

### 3.2 `analyzeWeeklyReflection`

- **File**: `src/ai/flows/analyze-weekly-reflection.ts`
- **Input schema**: `{ journalEntries: string }`
- **Output schema**: `{ summary: string; prompt: string }`
- **Prompt behavior**: Requests a thematic summary and a journaling prompt for the upcoming week.

### 3.3 Local Testing

Run `npm run genkit:dev` and send flow invocations using the Genkit dashboard or `curl` against the dev server. Ensure `GOOGLE_GENAI_API_KEY` is set.

## 4. Placeholder / Missing Endpoints

- `/api/sentiment`: Referenced in `JournalService.analyzeSentiment`. Implement this as a Next.js API route or external endpoint that forwards to `analyzeSentiment` and returns `{ sentiment, summary }`.
- Weekly reflection API: The weekly reflection page currently uses placeholder data. Create an endpoint (e.g., `/api/weekly-reflection`) that aggregates the user's recent entries, calls `analyzeWeeklyReflection`, and returns the formatted summary/prompt.

## 5. Supabase Client Helpers

`src/lib/supabase.ts` exports the raw Supabase client. In rare cases where direct queries are required, ensure they run client-side and respect RLS policies.

- `journalOperations` provides low-level CRUD operations.
- `profileOperations` offers `getProfile` and `upsertProfile`. `getProfile` tolerates `PGRST116` (no rows) and returns `null` accordingly.

## 6. Toast & Feedback APIs

The toast system (`src/hooks/use-toast.ts` and `src/components/ui/toast.tsx`) exposes a global `toast({ title, description, variant })` helper used throughout the UI. This is the preferred mechanism for surfacing API success/failure states to the user.

Maintain this reference as new endpoints or integrations are added.
