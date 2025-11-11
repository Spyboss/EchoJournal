# Echo Journal Architecture Overview

_Last updated: 2024-11-22_

## System Summary

Echo Journal is a Next.js App Router project that statically exports its UI to run on Cloudflare Pages while relying on Supabase for authentication and persistence. Optional Google Genkit flows provide AI-powered sentiment analysis and weekly reflections when the app is executed in an environment that supports server-side code.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Next.js)                        │
│                                                                 │
│  ┌──────────────┐    ┌────────────────┐    ┌──────────────────┐ │
│  │AuthProvider  │    │JournalService  │    │AI Integration    │ │
│  │src/contexts  │ →  │src/lib         │ →  │src/ai/flows      │ │
│  └──────────────┘    └────────────────┘    └──────────────────┘ │
│         │                         │                     │       │
│         ▼                         ▼                     ▼       │
│   UI Components            Supabase Client       Genkit Runtime │
└────────┬──────────────────────────┬──────────────────────────────┘
         │                          │
         ▼                          ▼
  Supabase Auth              Supabase Postgres
```

## Technology Stack

| Layer | Technology | Usage |
| --- | --- | --- |
| Frontend | Next.js 15 App Router | Static UI rendering and routing |
| UI | Tailwind CSS, Radix primitives, shadcn/ui | Design system and accessibility |
| State | React Context (`AuthContext`) | Exposes Supabase auth state to pages and components |
| Data | Supabase Postgres + Row Level Security | Stores `journal_entries` and `profiles` |
| AI | Google Genkit + Gemini 2.0 Flash | Sentiment and weekly reflection prompts (optional) |
| Hosting | Cloudflare Pages | Serves the static build from `out/` |

## Runtime Flow

1. **Authentication**
   - `AuthProvider` (`src/contexts/AuthContext.tsx`) boots on the client, reads the current Supabase session, and exposes `user`, `session`, and auth helpers via context.
   - On sign-in/up, the provider upserts the user's profile through `profileOperations.upsertProfile` to ensure metadata exists in Supabase.

2. **Journal CRUD**
   - `Home` page (`src/app/page.tsx`) calls `JournalService` methods to interact with the database.
   - `JournalService` delegates to `journalOperations` (`src/lib/supabase.ts`), which uses the Supabase JavaScript client to perform `select`, `insert`, `update`, and `delete` on the `journal_entries` table.
   - After each mutation the page refetches entries and stores them in component state.

3. **AI Integration**
   - Genkit is configured in `src/ai/ai-instance.ts` with the Gemini 2.0 Flash model and reads `GOOGLE_GENAI_API_KEY`.
   - `src/ai/flows/analyze-sentiment.ts` and `src/ai/flows/analyze-weekly-reflection.ts` define typed flows and prompts. They are not executed in the static build, but can be hosted in a separate server or Cloud Function.
   - `JournalService.analyzeSentiment` contains a placeholder fetch call to `/api/sentiment`; implement this route to proxy requests to the Genkit flow or another provider.

4. **Voice Notes**
   - The Home page manages voice recording through the Web MediaRecorder API. Recorded audio is kept client-side and transcribed to a placeholder string until an external transcription API is introduced.

5. **Weekly Reflection**
   - `src/app/weekly-reflection/page.tsx` displays generated summaries and prompts. Until Genkit is available, it renders placeholder text while keeping the UI interactions intact.

## Build and Deployment

- `next.config.ts` is configured with `output: 'export'`, `distDir: 'out'`, and disables TypeScript/ESLint build blocking to simplify static builds.
- `npm run build` generates a static bundle suitable for Cloudflare Pages. Server actions and API routes are currently not deployed as part of the static export.
- `wrangler.toml` sets the project name and build output directory for Cloudflare deployments.

## External Dependencies

| Integration | Location | Notes |
| --- | --- | --- |
| Supabase | `src/lib/supabase.ts` | Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Row Level Security policies must be enabled as documented in the README. |
| Google Genkit | `src/ai/ai-instance.ts` | Needs `GOOGLE_GENAI_API_KEY`. Only active when running `npm run genkit:dev` or a compatible server environment. |
| MediaRecorder | `src/app/page.tsx` | Browser-provided API for audio capture; ensure HTTPS origins for microphone permissions. |

## Data Flow Summary

1. User signs in via `AuthForm` → Supabase Auth → `AuthProvider` stores session and upserts profile.
2. User creates an entry → `JournalService.createEntry` → Supabase `journal_entries` insert → UI reloads entries via `JournalService.getEntries`.
3. (Optional) AI analysis triggered → Pending `/api/sentiment` endpoint proxies to Genkit → Entry updated with `sentiment_summary`.
4. Weekly reflection page fetches the latest data and, once enabled, will call `analyzeWeeklyReflection` to produce a summary and prompt.

## Future Considerations

- Host Genkit flows on a serverless runtime (e.g., Cloudflare Workers, Vercel Functions) and expose REST endpoints consumed by the static client.
- Add Supabase real-time channels if live updates are needed. The current architecture relies on refetching after mutations.
- Persist recorded audio files (currently discarded) to a storage bucket if long-term voice archives are required.
