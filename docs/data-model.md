# Data Model Reference

_Last updated: 2024-11-22_

Echo Journal stores data exclusively in Supabase Postgres. The client interacts with the database via the Supabase JavaScript SDK defined in [`src/lib/supabase.ts`](../src/lib/supabase.ts).

## Database Schema

### Table: `journal_entries`

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | No | Primary key, generated with `gen_random_uuid()` |
| `user_id` | `uuid` | No | References `auth.users(id)`; cascades on delete |
| `content` | `text` | No | Full journal entry body |
| `sentiment_score` | `numeric` | Yes | Optional numeric score for AI integrations |
| `sentiment_summary` | `text` | Yes | Short textual sentiment description |
| `title` | `text` | Yes | Auto-generated excerpt used for list displays |
| `created_at` | `timestamptz` | No | Defaults to `now()` |
| `updated_at` | `timestamptz` | No | Defaults to `now()`; updated in `journalOperations.updateEntry` |

**Row Level Security**

```sql
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);
```

### Table: `profiles`

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| `id` | `uuid` | No | Primary key referencing `auth.users(id)` |
| `email` | `text` | Yes | Cached email address for convenience |
| `created_at` | `timestamptz` | No | Defaults to `now()` |
| `updated_at` | `timestamptz` | No | Defaults to `now()`; refreshed on each upsert |

**Row Level Security**

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can upsert their profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id)
  TO authenticated;
CREATE POLICY "Users can update their profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  TO authenticated;
```

## Application Usage

- `journalOperations` (in `src/lib/supabase.ts`) provides CRUD helpers for `journal_entries`. The helpers return strongly typed `JournalEntry` objects consumed by the UI.
- `JournalService` converts Supabase rows into UI-friendly objects (`id`, `text`, `timestamp`, `sentimentSummary`). Timestamp formatting occurs client-side using `Date.prototype.toLocaleString()`.
- `profileOperations.upsertProfile` runs after successful authentication to ensure a corresponding profile exists.

## Indexing Recommendations

- Supabase automatically indexes primary keys. For large datasets, consider creating a composite index on `(user_id, created_at DESC)` to speed up user timeline queries used by `journalOperations.getEntries`.

## Data Retention & Privacy

- Journal content is stored in plain text. If encryption-at-rest requirements exist, enable Supabase's encryption or store entries via a service role API that performs encryption before insert.
- Voice recordings are not persisted; the client discards the audio blob after transcription.

Maintain this document as new tables or columns are introduced.
