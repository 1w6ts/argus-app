# Argus — Resend.com Alternative on Amazon SES
## Product Plan

---

## What We're Building

Argus is a developer-facing transactional email API platform — the same category as Resend, Postmark, and SendGrid. Users sign up, verify their sending domains, create API keys, and call `POST /api/v1/emails` to send transactional email. We handle Amazon SES identity management, event routing via SNS, delivery status tracking, and fan-out to user-configured webhooks.

**The model**: One shared AWS account (ours). Users verify their own domains as SES identities. We send on their behalf.

---

## Current State

| Thing | Status |
|---|---|
| Auth (email/password) | ✅ Done — Better Auth |
| DB connection + migrations | ✅ Done — Drizzle + PostgreSQL |
| Dashboard UI shell | ✅ Done — sidebar, topbar, all page routes exist |
| Marketing site | ✅ Done |
| DB tables | ⚠️ Auth tables only (`user`, `session`, `account`, `verification`) |
| API routes | ❌ None (only `/api/auth/[...all]`) |
| Dashboard pages | ❌ All empty shells |
| Email sending | ❌ Not started |
| Domain management | ❌ Not started |
| API keys | ❌ Not started |
| Webhooks | ❌ Not started |

---

## New Packages to Install

```bash
bun add @aws-sdk/client-sesv2 nanoid
```

Node's built-in `crypto` module handles all hashing — no extra package needed.

---

## Database Schema — New Tables

All added to `src/db/schema.ts`. Also add `integer` and `jsonb` to the drizzle-orm/pg-core import.

---

### `api_key`

Stores API keys for authenticating REST API requests. The raw key is **never stored** — only a SHA-256 hash.

| Column | Type | Notes |
|---|---|---|
| id | text PK | `nanoid(16)` |
| user_id | text FK → user | cascade delete |
| name | text | human label e.g. "Production" |
| key_hash | text unique | SHA-256 hex of the raw key |
| key_prefix | text | first 16 chars e.g. `arg_live_XXXXXXXX` — shown in UI |
| last_used_at | timestamp | nullable |
| expires_at | timestamp | nullable = never expires |
| created_at | timestamp | defaultNow |
| revoked_at | timestamp | nullable — soft delete |

---

### `domain`

Tracks sending domains. Each domain is registered as an SES Identity in our AWS account.

| Column | Type | Notes |
|---|---|---|
| id | text PK | `nanoid(16)` |
| user_id | text FK → user | cascade delete |
| domain | text | e.g. `mail.acme.com` |
| region | text | default `us-east-1` |
| status | text | `pending \| verified \| failed` |
| ses_identity_arn | text | nullable — from SES CreateEmailIdentity response |
| dkim_status | text | `pending \| success \| failed \| temporary_failure` |
| dkim_tokens | jsonb | `string[]` — the 3 CNAME token values SES gives us |
| dkim_signing_enabled | boolean | default false |
| created_at | timestamp | defaultNow |
| updated_at | timestamp | auto-updated |

---

### `email`

One row per send attempt. The audit log for everything that goes through the API.

| Column | Type | Notes |
|---|---|---|
| id | text PK | `em_` + `nanoid(22)` |
| user_id | text FK → user | cascade delete |
| api_key_id | text FK → api_key | set null on delete |
| from | text | full from address e.g. `Acme <hello@mail.acme.com>` |
| to | jsonb | `string[]` |
| cc | jsonb | nullable |
| bcc | jsonb | nullable |
| reply_to | jsonb | nullable |
| subject | text | |
| html | text | nullable |
| text | text | nullable |
| headers | jsonb | nullable — `Record<string, string>` |
| tags | jsonb | nullable — user metadata `Record<string, string>` |
| status | text | `queued \| sent \| delivered \| bounced \| complained \| failed` |
| ses_message_id | text | nullable — SES MessageId returned on send |
| error_message | text | nullable — populated on `failed` |
| sent_at | timestamp | nullable |
| delivered_at | timestamp | nullable |
| bounced_at | timestamp | nullable |
| complained_at | timestamp | nullable |
| created_at | timestamp | defaultNow |

> **Important**: The email row is inserted BEFORE calling SES (status = `queued`). If SES throws, we update to `failed`. This ensures every attempted send is logged.

---

### `webhook`

User-configured endpoints that receive email delivery events.

| Column | Type | Notes |
|---|---|---|
| id | text PK | `nanoid(16)` |
| user_id | text FK → user | cascade delete |
| url | text | must be HTTPS |
| name | text | nullable label |
| secret | text | plaintext 32-byte hex — shown once at creation, used to sign payloads |
| events | jsonb | `string[]` — empty array = receive all events |
| enabled | boolean | default true |
| created_at | timestamp | defaultNow |
| updated_at | timestamp | auto-updated |

---

### `webhook_delivery`

One row per delivery attempt per webhook per email event.

| Column | Type | Notes |
|---|---|---|
| id | text PK | `nanoid(16)` |
| webhook_id | text FK → webhook | cascade delete |
| email_id | text FK → email | set null on delete |
| event | text | e.g. `email.delivered` |
| payload | jsonb | full JSON body we sent |
| status | text | `pending \| success \| failed` |
| response_status | integer | nullable — HTTP status received |
| response_body | text | nullable — first 1000 chars of response |
| attempt | integer | default 1 |
| next_retry_at | timestamp | nullable |
| delivered_at | timestamp | nullable |
| created_at | timestamp | defaultNow |

---

## New File Structure

```
src/
├── lib/
│   ├── ses.ts                  SES client + sendEmail + domain identity ops
│   ├── api-auth.ts             validateApiKey(req) → { userId, keyId } | null
│   ├── webhook-dispatch.ts     fan-out events to user webhooks + simple retry
│   └── sns-verify.ts           SNS message signature verification
│
├── app/
│   ├── (server)/api/
│   │   ├── v1/
│   │   │   ├── emails/
│   │   │   │   ├── route.ts            POST (send), GET (list)
│   │   │   │   └── [id]/route.ts       GET (detail)
│   │   │   ├── domains/
│   │   │   │   ├── route.ts            GET (list), POST (add)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        GET (detail + live SES sync), DELETE
│   │   │   │       └── verify/route.ts POST (re-check DKIM status)
│   │   │   ├── api-keys/
│   │   │   │   ├── route.ts            GET (list), POST (create)
│   │   │   │   └── [id]/route.ts       DELETE (revoke)
│   │   │   └── webhooks/
│   │   │       ├── route.ts            GET (list), POST (create)
│   │   │       └── [id]/
│   │   │           ├── route.ts        GET, PATCH, DELETE
│   │   │           └── test/route.ts   POST (fire test event)
│   │   └── webhooks/
│   │       └── ses/route.ts    SNS event receiver — public, signature-verified
│   │
│   └── dashboard/
│       ├── emails/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── domains/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── api-keys/
│       │   └── page.tsx
│       ├── webhooks/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx   delivery log
│       └── settings/
│           └── page.tsx
│
└── components/dashboard/
    ├── emails/
    │   ├── email-table.tsx         client — sortable/filterable table
    │   └── email-status-badge.tsx  color-coded status badge
    ├── domains/
    │   ├── add-domain-dialog.tsx   client — domain input form
    │   └── dns-records-table.tsx   CNAME records display + copy buttons
    ├── api-keys/
    │   ├── api-key-list.tsx
    │   ├── create-key-dialog.tsx   client — reveals key once on creation
    │   └── reveal-key-card.tsx     client — copy-to-clipboard, "shown once" warning
    └── webhooks/
        ├── webhook-list.tsx
        ├── create-webhook-dialog.tsx  client — reveals secret once
        └── delivery-log-table.tsx
```

---

## REST API Reference

### Authentication

- **Public API** (`/api/v1/*`): `Authorization: Bearer arg_live_<key>` header
- **Dashboard operations** (key/webhook CRUD): session cookie from Better Auth
- **SNS receiver** (`/api/webhooks/ses`): no auth header — verified via SNS signature

### Error shape

```json
{ "error": { "code": "DOMAIN_NOT_VERIFIED", "message": "The from domain has not been verified." } }
```

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/emails` | API key | Send an email |
| `GET` | `/api/v1/emails` | API key | List emails (paginated) |
| `GET` | `/api/v1/emails/:id` | API key | Email detail + all timestamps |
| `POST` | `/api/v1/domains` | API key | Add domain → creates SES identity |
| `GET` | `/api/v1/domains` | API key | List domains |
| `GET` | `/api/v1/domains/:id` | API key | Detail + live SES status sync |
| `DELETE` | `/api/v1/domains/:id` | API key | Remove domain + deletes SES identity |
| `POST` | `/api/v1/domains/:id/verify` | API key | Re-check DKIM/verification status |
| `GET` | `/api/v1/api-keys` | session | List keys (raw key never returned) |
| `POST` | `/api/v1/api-keys` | session | Create key — raw key returned once |
| `DELETE` | `/api/v1/api-keys/:id` | session | Revoke key |
| `GET` | `/api/v1/webhooks` | session | List webhooks |
| `POST` | `/api/v1/webhooks` | session | Create webhook — secret returned once |
| `PATCH` | `/api/v1/webhooks/:id` | session | Update (enable/disable/events) |
| `DELETE` | `/api/v1/webhooks/:id` | session | Delete |
| `POST` | `/api/v1/webhooks/:id/test` | session | Fire a test event |
| `POST` | `/api/webhooks/ses` | none | SNS event receiver |

### Key request/response shapes

**`POST /api/v1/emails`**

Request:
```json
{
  "from": "Acme <hello@mail.acme.com>",
  "to": ["user@example.com"],
  "subject": "Welcome to Acme",
  "html": "<h1>Hello!</h1>",
  "text": "Hello!",
  "cc": [],
  "bcc": [],
  "reply_to": [],
  "headers": { "X-Custom": "value" },
  "tags": { "campaign": "welcome" }
}
```

Response `201`:
```json
{
  "id": "em_aB3kLmNpQr8tUvWxYz1234",
  "from": "Acme <hello@mail.acme.com>",
  "to": ["user@example.com"],
  "subject": "Welcome to Acme",
  "status": "sent",
  "created_at": "2026-04-08T12:00:00.000Z"
}
```

Errors: `422 DOMAIN_NOT_VERIFIED`, `422 INVALID_FROM_ADDRESS`, `500 SES_ERROR`

---

**`POST /api/v1/api-keys`**

Request: `{ "name": "Production" }`

Response `201`:
```json
{
  "id": "kY9mZx2pNqR4",
  "name": "Production",
  "key": "arg_live_V8kX2mNpQrStUvWxYzAbCdEfGhIjKlMn",
  "key_prefix": "arg_live_V8kX2mNp",
  "created_at": "2026-04-08T12:00:00.000Z"
}
```

> The `key` field is **returned exactly once** and never again. Only `key_prefix` is shown in subsequent GET requests.

---

**`POST /api/v1/domains`**

Request: `{ "domain": "mail.acme.com" }`

Response `201`:
```json
{
  "id": "dF7gHiJkLm",
  "domain": "mail.acme.com",
  "status": "pending",
  "dkim_status": "pending",
  "dns_records": [
    { "type": "CNAME", "name": "abc123._domainkey.mail.acme.com", "value": "abc123.dkim.amazonses.com" },
    { "type": "CNAME", "name": "def456._domainkey.mail.acme.com", "value": "def456.dkim.amazonses.com" },
    { "type": "CNAME", "name": "ghi789._domainkey.mail.acme.com", "value": "ghi789.dkim.amazonses.com" }
  ]
}
```

---

## SES Integration

### Client setup (`src/lib/ses.ts`)

```typescript
const ses = new SESv2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

### Exported functions

| Function | SES command | Purpose |
|---|---|---|
| `createSesIdentity(domain)` | `CreateEmailIdentityCommand` | Registers domain, returns DKIM tokens |
| `getSesIdentityStatus(domain)` | `GetEmailIdentityCommand` | Checks verification status |
| `deleteSesIdentity(domain)` | `DeleteEmailIdentityCommand` | Removes identity |
| `sendEmail(params, emailId)` | `SendEmailCommand` | Sends email, tags with our DB row ID |

### Critical sending detail

Every `sendEmail` call must include:
- `ConfigurationSetName: process.env.AWS_SES_CONFIGURATION_SET` — this routes SES events (bounce, delivery, etc.) to our SNS topic
- `EmailTags: [{ Name: "argus_email_id", Value: emailId }]` — this lets us look up the DB row when events arrive via SNS

### SES event → DB status mapping

When SNS delivers an SES event to `/api/webhooks/ses`:

| SES `eventType` | DB `status` | Timestamp column set |
|---|---|---|
| `Send` | `sent` | `sent_at` |
| `Delivery` | `delivered` | `delivered_at` |
| `Bounce` | `bounced` | `bounced_at` |
| `Complaint` | `complained` | `complained_at` |

The email row is looked up using `mail.tags.argus_email_id[0]` from the SNS notification body.

### One-time AWS setup (manual)

1. Create an SES **Configuration Set** named `argus-events`
2. Add an SNS event destination for: `SEND`, `DELIVERY`, `BOUNCE`, `COMPLAINT`
3. Create an SNS **Topic** named `argus-ses-events`
4. Add an **HTTPS subscription** pointing to `https://yourdomain.com/api/webhooks/ses`
5. Your handler auto-confirms the subscription by GET-ing the `SubscribeURL` in the first `SubscriptionConfirmation` message

For local dev: use `ngrok http 3000` to get a public URL for the SNS subscription.

---

## API Key Security Pattern

```
Key format:  arg_live_<nanoid(32)>
Stored:      SHA-256 hash of the full key  ← never the raw key
Displayed:   First 16 chars only (arg_live_XXXXXXXX)
```

On every API request:
1. Extract key from `Authorization: Bearer` header
2. SHA-256 hash it
3. Look up hash in `api_key` table — check `revoked_at IS NULL` and expiry
4. Fire-and-forget `UPDATE last_used_at = now()`
5. Return `{ userId, keyId }` or `null`

---

## Webhook Delivery Pattern

**Signature header** (Stripe-style): `Argus-Signature: t=<unix_timestamp>,v1=<hmac-sha256>`

The HMAC is computed over `"<timestamp>.<body>"` using the webhook's `secret`.

**Event payload shape**:
```json
{
  "type": "email.delivered",
  "created_at": "2026-04-08T12:00:00.000Z",
  "data": {
    "email_id": "em_aB3kLmNp...",
    "to": ["user@example.com"],
    "status": "delivered",
    "delivered_at": "2026-04-08T12:00:01.200Z"
  }
}
```

**Event types**: `email.sent`, `email.delivered`, `email.bounced`, `email.complained`

**Retry**: On failure, set `next_retry_at = now() + 60s`. Retried on the next SNS event cycle. Max 5 attempts (V1 — no job queue needed yet).

---

## Dashboard Pages

### `/dashboard` — Overview
Real stats from DB (30-day window): sent count, delivery rate, failure count, avg delivery time. Recent emails table (last 10). API key callout showing `key_prefix`.

### `/dashboard/emails` — Email List
Paginated table: To, Subject, Status badge, From domain, Sent time. Filters: status, date range, domain. Click row → detail.

### `/dashboard/emails/:id` — Email Detail
Delivery timeline stepper (Queued → Sent → Delivered/Bounced). Full metadata. HTML preview.

### `/dashboard/domains` — Domain List
List with status badges. "Add domain" button opens dialog. Each row has Verify / Delete actions.

### `/dashboard/domains/:id` — Domain Detail
DNS records table with 3 CNAME rows (copy buttons). "Re-check status" button. Delete domain.

### `/dashboard/api-keys` — API Keys
List with masked keys (`arg_live_XXXXXXXX••••`), last used time. "Create key" → reveal-once dialog. Revoke button.

### `/dashboard/webhooks` — Webhooks
List with URL, enabled toggle, event tags. "Add webhook" → reveal-once secret dialog. "Send test" button. Click → delivery log.

### `/dashboard/webhooks/:id` — Delivery Log
Table of delivery attempts: event type, status badge, HTTP status, timestamp. Expandable rows show full payload JSON.

### `/dashboard/settings` — Settings
Change name, change password (via Better Auth). Danger zone: delete account.

---

## UI Patterns (Already in Codebase)

- **Cards**: `Card` with `shadow-none ring-0 border border-border` (flat, no shadow)
- **Status badges**: `Badge` component with color variants
- **Dialogs**: shadcn `Dialog` component for create flows
- **Toasts**: `sonner` — `toast.success()` / `toast.error()`
- **Loading**: `Skeleton` components in `loading.tsx` at each route
- **Tables**: shadcn `Table` component
- **"Reveal once" pattern**: Dialog transitions to a `<RevealKeyCard>` state after creation — shows raw secret with copy button and "will not be shown again" warning

---

## Environment Variables

Add these to `.env`:

```bash
# AWS SES
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_SES_CONFIGURATION_SET=argus-events
AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:<account-id>:argus-ses-events

# App URL (for SNS subscription confirmation)
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Minimum IAM permissions for the AWS user**:
- `sesv2:SendEmail`
- `sesv2:CreateEmailIdentity`
- `sesv2:DeleteEmailIdentity`
- `sesv2:GetEmailIdentity`
- `sesv2:ListEmailIdentities`

---

## Implementation Phases

### Phase 1 — Schema & Dependencies
- Install `@aws-sdk/client-sesv2` and `nanoid`
- Add 5 new tables to `src/db/schema.ts` with all relations
- Run `bunx drizzle-kit generate && bunx drizzle-kit migrate`
- Add new env vars

### Phase 2 — API Key Infrastructure
- `src/lib/api-auth.ts` — key generation + validation
- API routes: `GET/POST /api/v1/api-keys`, `DELETE /api/v1/api-keys/:id`
- Dashboard: `/dashboard/api-keys` page + components

### Phase 3 — Domain Management
- `src/lib/ses.ts` — domain identity functions
- API routes: `/api/v1/domains/**`
- Dashboard: `/dashboard/domains/` pages + DNS records display

### Phase 4 — Email Sending
- Add `sendEmail` to `src/lib/ses.ts`
- API routes: `POST/GET /api/v1/emails`, `GET /api/v1/emails/:id`
- Dashboard: `/dashboard/emails/` pages
- Wire overview page stats to real DB data

### Phase 5 — SES Event Processing
- `src/lib/sns-verify.ts` — SNS signature verification
- `POST /api/webhooks/ses` — SNS notification handler
- Configure AWS: Config Set → SNS Topic → HTTPS subscription
- Test with SES simulator addresses (`bounce@simulator.amazonses.com`, etc.)

### Phase 6 — Webhook Fan-out
- `src/lib/webhook-dispatch.ts` — HMAC-signed delivery + retry
- Call dispatch from the SNS handler after each status update
- API routes: `/api/v1/webhooks/**`
- Dashboard: `/dashboard/webhooks/` pages + delivery log

### Phase 7 — Polish
- `/dashboard/settings` page
- `loading.tsx` + `error.tsx` at each dashboard route
- Rate limiting stub in `validateApiKey`
- End-to-end smoke test

---

## Verification Checklist

- [ ] `psql \dt` shows all 5 new tables with correct columns
- [ ] Create API key → returned key hashes to the stored `key_hash` in DB
- [ ] Revoked key immediately returns `401`
- [ ] Add domain → SES identity created, 3 CNAME records returned
- [ ] Add DNS records, run verify → status becomes `verified`
- [ ] `POST /api/v1/emails` → `email` row in DB, real email arrives in inbox
- [ ] Send to `bounce@simulator.amazonses.com` → SNS fires → `email.status = "bounced"` in DB
- [ ] Webhook configured pointing to webhook.site → receives `email.delivered` event within 2s
- [ ] Delivery log in dashboard shows success row
- [ ] Full new-user journey: sign up → domain → verify → API key → send → view in dashboard → webhook fires
- [ ] All dashboard pages show clean empty states with zero data

---

## Critical Files

| File | Status | Notes |
|---|---|---|
| `src/db/schema.ts` | Extend | Add 5 tables + relations |
| `src/lib/ses.ts` | Create | SES client + all SES operations |
| `src/lib/api-auth.ts` | Create | Key gen + per-request validation |
| `src/lib/webhook-dispatch.ts` | Create | Fan-out + HMAC signing + retry |
| `src/lib/sns-verify.ts` | Create | SNS message signature check |
| `src/app/(server)/api/v1/emails/route.ts` | Create | Core product endpoint |
| `src/app/(server)/api/v1/domains/route.ts` | Create | |
| `src/app/(server)/api/v1/api-keys/route.ts` | Create | |
| `src/app/(server)/api/v1/webhooks/route.ts` | Create | |
| `src/app/(server)/api/webhooks/ses/route.ts` | Create | SNS receiver |
| `src/app/dashboard/emails/page.tsx` | Create | |
| `src/app/dashboard/domains/page.tsx` | Create | |
| `src/app/dashboard/api-keys/page.tsx` | Create | |
| `src/app/dashboard/webhooks/page.tsx` | Create | |
| `src/app/dashboard/settings/page.tsx` | Create | |
| `src/app/dashboard/page.tsx` | Modify | Wire to real DB queries |
