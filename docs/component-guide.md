# Component & Hook Reference

_Last updated: 2024-11-22_

This guide summarizes the primary React components and hooks in Echo Journal and explains how they collaborate to deliver the journaling experience.

## Layout & Navigation

| Component | Location | Responsibility | Notes |
| --- | --- | --- | --- |
| `RootLayout` | `src/app/layout.tsx` | Provides global HTML scaffold, font variables, `ThemeProvider`, `AuthProvider`, and shared UI like `Navigation` and `Toaster`. | Wraps every page; avoid adding client-only code here beyond providers. |
| `Navigation` | `src/components/Navigation.tsx` | Top navigation bar with theme toggle, links, and sign-out button. | Uses `useAuth()` to show the sign-out button when a user is logged in. |

## Pages

| Component | Location | Responsibility | Key Dependencies |
| --- | --- | --- | --- |
| `Home` (`default export`) | `src/app/page.tsx` | Main journaling interface: authentication gate, text editor, voice recording, entry list with filtering, and sentiment display. | `useAuth`, `JournalService`, `useAccessibility`, `SearchAndFilter`, `JournalEntryCard`, `toast` |
| `WeeklyReflectionPage` | `src/app/weekly-reflection/page.tsx` | Displays weekly progress, placeholder AI summaries, and prompts. | `useAuth`, `toast`, `useState` for UI state |

## Composite Components

| Component | Location | Purpose | Important Props |
| --- | --- | --- | --- |
| `AuthForm` | `src/components/AuthForm.tsx` | Handles email/password sign-in and sign-up using Supabase. | None (state managed internally). Emits toast notifications on success/failure. |
| `SearchAndFilter` | `src/components/SearchAndFilter.tsx` | Search bar, sentiment filter dropdown, and filter summary badges. | `searchTerm`, `setSearchTerm`, `sentimentFilter`, `setSentimentFilter`, `totalEntries`, `filteredCount` |
| `JournalEntryCard` | `src/components/JournalEntryCard.tsx` | Displays a single entry with sentiment badges, like/delete actions, and expandable text. | `entry`, `isLiked`, `isExpanded`, handlers for like/expand/delete, sentiment helper callbacks |

## Hooks

| Hook | Location | Description | Usage |
| --- | --- | --- | --- |
| `useAuth` | `src/contexts/AuthContext.tsx` | Accesses the current Supabase user/session and exposes auth helpers. | Wrap components in `AuthProvider` (done in `RootLayout`). |
| `useAccessibility` | `src/hooks/useAccessibility.tsx` | Provides screen-reader announcement region, keyboard navigation helpers, and skip link integration. | Used in `Home` to announce events (save/delete) and expose `<AnnouncementRegion />`. |
| `useSkipNavigation` | `src/hooks/useAccessibility.tsx` | Returns a `SkipLink` component and `skipToContent` helper to improve keyboard navigation. | `Home` renders `<SkipLink />` near the top-level page. |
| `useFocusTrap` | `src/hooks/useAccessibility.tsx` | Manages focus trapping for modal dialogs. | Available for modal components; currently not invoked directly but ready for future use. |
| `useToast` / `toast` | `src/hooks/use-toast.ts` | Global toast store and helper for ephemeral messages. | `toast({ title, description, variant })` is imported where needed (e.g., `Home`, `AuthForm`, `Navigation`). |

## State & Data Helpers

| Module | Location | Description |
| --- | --- | --- |
| `JournalService` | `src/lib/journalService.ts` | High-level CRUD wrapper around `journalOperations`. Converts Supabase rows into UI-friendly entries. |
| `supabase` client | `src/lib/supabase.ts` | Configures the Supabase JS client and exposes `journalOperations`/`profileOperations`. |
| `cn` utility | `src/lib/utils.ts` | Tailwind/clsx helper (`clsx` + `tailwind-merge`). |

## UI Patterns & Accessibility

- Toast notifications surface success/errors for async operations. Keep user feedback consistent by routing messages through `toast`.
- Voice recording controls in `Home` enforce accessibility practices by preventing event bubbling and announcing state changes via `useAccessibility`.
- Alert dialogs (Radix) confirm destructive actions in `JournalEntryCard` before deletion.

## Extending Components

- When introducing new Supabase interactions, add methods to `journalOperations` and wrap them in `JournalService` to keep data access centralized.
- Reuse `SearchAndFilter` logic for additional filters by expanding its props with new setter callbacks.
- Leverage `useAccessibility` helpers to maintain WCAG compliance in new interactive components.

Keep this guide updated as new components, hooks, or patterns are added.
