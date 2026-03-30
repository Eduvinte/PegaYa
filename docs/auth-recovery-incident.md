# Auth Issue: Signup Confirm vs Password Recovery

Date: 2026-03-25

## Symptoms

- Clicking **Confirm your email** sometimes sent users to the password reset flow.
- Clicking a password recovery link sometimes redirected to `/forgot-password` with "token expired/invalid".
- Signup and recovery looked unstable during local testing.

## Root Causes

1. Middleware treated any `/?code=...` as recovery
- Email confirmation and recovery can both include auth params.
- The middleware redirected root requests with `code` to `/reset-password`, so confirm-email links were misrouted.

2. Recovery link formats were not fully handled
- Supabase may send recovery data as:
  - `?code=...`
  - `?token_hash=...&type=recovery`
  - `#access_token=...&refresh_token=...&type=recovery`
- The reset page initially handled only one format.

3. Dev double-execution consumed one-time tokens
- In local dev (Strict Mode), `useEffect` can run twice.
- First call could consume the token; second call then failed and incorrectly showed "expired".

4. Local email rate limit too low
- `auth.rate_limit.email_sent = 2` caused quick lockout while testing signup/recovery repeatedly.

## Fixes Applied

1. Restricted middleware to private routes only
- File: `src/middleware.ts`
- Now protects `/jobs/:path*` only, no root auth-param routing.

2. Forced signup confirmation redirect to login
- File: `src/features/auth/signup/services/auth.ts`
- Added `options.emailRedirectTo = <origin>/login`.

3. Allowed login redirect URL in Supabase config
- File: `supabase/config.toml`
- Added `http://127.0.0.1:3000/login` to `additional_redirect_urls`.

4. Hardened reset-password session bootstrap
- File: `src/features/auth/reset-password/page/page.tsx`
- Handles all supported recovery formats (`code`, `token_hash`, hash tokens).
- Uses a `useRef` guard to avoid duplicate processing in dev.
- Confirms existing session before deciding token is invalid.

5. Increased local email rate limit for testing
- File: `supabase/config.toml`
- `auth.rate_limit.email_sent = 100`.

## Validation Steps

1. Run `supabase stop && supabase start`.
2. Run Next.js dev server on `127.0.0.1:3000`.
3. Signup with a fresh email.
4. Confirm email link should land on `/login`.
5. Request password reset and open the new link.
6. Reset password, then redirect to `/login?passwordReset=success` and show success toast.

## Notes

- Old emails can keep old/invalid links. Always test with freshly generated recovery/confirmation emails after config changes.
