# Operations Runbook

_Last updated: 2024-11-22_

This runbook documents how to deploy, configure, monitor, and troubleshoot Echo Journal in production-like environments.

## 1. Environments

| Environment | Hosting | Notes |
| --- | --- | --- |
| Local | `npm run dev` | Requires `.env.local` with Supabase credentials |
| Staging (optional) | Cloudflare Pages preview | Connect the GitHub branch and configure Supabase staging credentials |
| Production | Cloudflare Pages | Static export served from the `out/` directory |

## 2. Deployments

### 2.1 Build and release flow

1. Merge changes into the default branch.
2. Cloudflare Pages automatically builds using `npm run build` and serves the `out/` directory.
3. For manual deployments run:
   ```bash
   npm run build
   npx wrangler pages deploy out
   ```

### 2.2 Environment variables

Configure the following variables under **Pages → Settings → Environment variables** (or via `wrangler secret put`):

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key with RLS enabled |
| `GOOGLE_GENAI_API_KEY` | Optional – required only if an external worker executes Genkit flows |

Because the build is static, these values are embedded at build time. Rebuild the site whenever secrets change.

### 2.3 Supabase configuration checklist

- Enable Email/Password auth.
- Create `journal_entries` and `profiles` tables with the policies documented in the README.
- Add your Cloudflare Pages domain(s) under **Authentication → URL configuration** (site URL and redirect URLs).
- Monitor database usage quotas; journal entries store full text and optional sentiment summaries.

## 3. Monitoring & Logging

- **Client logging**: `console.error` statements exist in `src/app/page.tsx`, `src/components/AuthForm.tsx`, and `src/lib/journalService.ts`. Integrate a logging service (e.g., Sentry, LogRocket) to capture production errors; none is configured by default.
- **Supabase**: Use the Supabase dashboard query history and authentication logs to audit database and auth activity.
- **Cloudflare Pages**: Review build logs in the Pages dashboard for deploy failures. Runtime logs are minimal because the app is static.

## 4. Alerting

No automated alerting is configured. Recommended follow-up work:

- Configure Supabase usage alerts (auth failures, row limits).
- Add Cloudflare Pages webhook notifications for failed builds.
- Instrument client-side error tracking before GA release.

## 5. Troubleshooting

| Symptom | Likely Cause | Resolution |
| --- | --- | --- |
| Users cannot sign in | Incorrect Supabase URL/anon key or redirect URLs | Verify `.env` values and Supabase auth settings. Ensure the deployed domain is allowed. |
| Journal entries fail to load | Supabase credentials missing or RLS misconfigured | Confirm environment variables, check Supabase policies, and inspect console/network logs. |
| Sentiment summary always missing | `/api/sentiment` endpoint not implemented | Host Genkit flow or disable the call. Update `JournalService.createEntry` if you want to skip analysis. |
| Weekly reflection shows placeholder | Genkit flow unavailable | Deploy `analyzeWeeklyReflection` to a server runtime and update the page to call it. |
| Microphone access denied | Browser blocked permissions | Instruct users to enable microphone access; ensure the site runs over HTTPS. |

## 6. Scaling & Capacity

- The frontend is a static site; scaling is handled by Cloudflare's CDN.
- Supabase tier determines database throughput. Monitor `journal_entries` row growth and storage usage.
- AI workloads depend on the environment hosting Genkit flows; scale those independently (e.g., serverless functions).

## 7. Disaster Recovery

- **Source control**: Code is stored in Git; ensure branch protection and backups per organization policy.
- **Database**: Configure Supabase point-in-time recovery or scheduled backups (available on paid plans). Export the `journal_entries` table regularly if business-critical.
- **Secrets**: Store production credentials in your organization's secret manager; update Cloudflare Pages via automation to avoid drift.

## 8. Security Considerations

- All database access is protected by Supabase Row Level Security. Periodically review policies in `journal_entries` and `profiles`.
- Supabase anon key is embedded in the client; restrict service role keys to secure backends only.
- Ensure Google Genkit credentials are not shipped to the browser if you build server-side integrations—use server-side environment variables.
- Review dependencies in `package.json` for vulnerabilities and run `npm audit` as part of CI.

## 9. Change Management

- Document configuration changes (e.g., new environment variables) in the README and commit history.
- For substantial behavioral changes, update the [architecture overview](./architecture-overview.md) and create a change log entry if you maintain one.

## 10. Incident Response

1. Confirm the issue in production and capture relevant console/network logs.
2. Roll back to the last known good Cloudflare Pages deployment if necessary (Pages retains previous builds).
3. Investigate Supabase logs for auth/database anomalies.
4. Coordinate with the development team to patch the issue; follow normal release steps once fixed.

Maintain this runbook alongside major releases to ensure operational accuracy.
