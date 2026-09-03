# kentom.co.ke

Portfolio and business site for Steve Tom (kenTom): selected work, notes, a lab
of interface experiments, and the sponsorship, quoting and admin machinery
behind them.

SvelteKit 2 on Svelte 4, TypeScript, Prisma against Postgres (Neon), deployed
on Vercel. Email goes through Axene Mailer, payments through Paystack.

## Running it

```bash
npm install          # postinstall runs prisma generate
cp .env.example .env # then fill in the values below
npm run dev
```

## Environment

`.env.example` lists every variable. The ones without which something visibly
breaks:

| Variable | Needed for |
|---|---|
| `DATABASE_URL` | everything; the pooled Neon endpoint |
| `DATABASE_URL_UNPOOLED` | migrations only, see "Migrations" below |
| `PAYSTACK_SECRET_KEY` | donations, sponsorship, the payment webhook |
| `AXENE_MAILER_API_KEY` | sending any email at all |
| `AXENE_MAILER_WEBHOOK_SECRET` | recording delivery events; without it every inbound webhook is rejected with 401 |
| `ADMIN_PASSWORD` | signing in to `/admin` |
| `OTP_SECRET` | signing verification codes and unsubscribe links. Falls back to `AXENE_MAILER_API_KEY` if unset, which means rotating that key silently invalidates every unsubscribe link already sent |
| `CRON_SECRET` | the scheduled jobs; without it they refuse to run and answer 503 |

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | `prebuild` regenerates icons and image dimensions first |
| `npm run icons` | rebuild the bundled icon subset |
| `npm run images` | re-measure image dimensions for `og:image` tags |
| `npm run check` | svelte-check |
| `npm run db:seed` | seed script |

## Things that will catch you out

**Icons are a generated subset.** `src/lib/icons.generated.ts` contains only the
icons the source actually references, because globbing the whole pack inlined
about a thousand SVGs into a single 1.3 MB client chunk. After adding any
`<Icon name="..." />`, run `npm run icons` or it renders blank. `prebuild` also
does this, so a forgotten regeneration cannot reach production.

**Directional affordances use chevrons only.** `arrow-left4`, `arrow-right4`,
`arrow-up3`, `arrow-down4`. Never the tailed variants, never circled or squared
arrows for plain navigation. The `arrowLeft`/`arrowRight`/`arrowUp`/`arrowDown`
aliases all resolve to chevrons so the rule holds whichever name you reach for.

**`og:image` dimensions are measured, not hardcoded.**
`scripts/generate-image-dimensions.mjs` parses image headers directly, so a new
post's card dimensions are always right. Run `npm run images` after adding one.

**Migrations do not run during the build.** They used to, and every build took a
Postgres advisory lock, so two concurrent builds deadlocked on it. Apply schema
changes deliberately:

```bash
npx prisma migrate deploy
```

`directUrl` in `prisma/schema.prisma` points migrations at the unpooled Neon
endpoint, because advisory locks are unreliable through a transaction-mode
pooler. Deploy the migration before the code that depends on it.

## Sponsorship

A `Donation` is an immutable payment record. A `Sponsor` is the relationship:
who they are, what tier, and whether they consented to appear publicly. They are
separate so the partners wall is one indexed query rather than a fold over every
transaction.

`src/lib/server/sponsors.ts` holds the rules, and `listedSponsorWhere()` is the
single definition of who is currently on the wall. The public page, the admin
screens and the sitemap all use it, so they cannot disagree.

Tier thresholds are in USD while Paystack settles in KES, so the USD figure is
captured at charge time. Deriving it later from a moving exchange rate would
silently reclassify sponsors who paid months ago.

The Paystack webhook at `/api/paystack/webhook`, not the browser redirect, is
what confirms a payment. A donor who pays and closes the tab never returns
through the callback.

## Email

`src/lib/server/mailer.ts` sends through Axene and records each message so
inbound delivery events can be joined to it. Every send carries a purpose tag
from `src/lib/emailTags.ts`, which is what makes the breakdown in `/admin/email`
possible. Add a tag at the send site or the message lands as unclassified.

Delivery events arrive at `/api/webhooks/axene-mailer`, signed with
HMAC-SHA256. Two things about the registered URL: it must be the `www` host,
because the apex redirects and the sender does not follow redirects; and the
signing secret is shown once at creation.

## Deployment

Pushing to `main` deploys. `vercel.json` holds the build command and the cron
schedules. Vercel's Hobby plan allows two cron entries at daily granularity, so
the day-of-month dispatch lives in code behind a single daily tick rather than
in four cron expressions that would be rejected at deploy time.
