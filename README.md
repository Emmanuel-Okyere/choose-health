# Natural Health Retreat — website

**Project codename:** `choose-health` · **Brand:** Natural Health Retreat · *Choose Health, Choose Life*

One-page shop + remedies journal for the Natural Health Retreat Reform Center (ND William Owusu), Awoshie, Accra.

- **Next.js 16** (App Router, Turbopack, Tailwind v4)
- **Postgres 16** via [`postgres`](https://github.com/porsager/postgres) — raw SQL, no ORM
- Cart in the browser (localStorage) → orders saved to Postgres through a server action, with prices always re-read from the DB
- Mobile Money / cash payment instructions, WhatsApp handoff at every step
- `/admin` dashboard (orders + team) with a sign-in page at `/admin/login` — see **Admin accounts** below

## Getting started

```bash
cp .env.example .env.local   # then edit ADMIN_PASSWORD
npm install
npm run db:up                # starts Postgres in Docker on localhost:5434
npm run db:setup             # applies db/schema.sql and seeds products + articles
npm run dev
```

## Admin accounts

| Role | Who | Can |
| --- | --- | --- |
| **Owner** (default super admin) | `ADMIN_USERNAME` (default `admin`) / `ADMIN_PASSWORD` env vars | Everything. Not stored in the DB, so it can never be deleted. |
| **Super admin** | Added on *Admin → Team* | Manage orders; add, promote/demote, reset passwords of and remove other members (not the owner, not themselves). |
| **Admin** | Added on *Admin → Team* | Manage orders and change their own password. Cannot add, edit or remove anyone. |

- Passwords are hashed with scrypt. Sessions are signed HttpOnly cookies valid for 12 hours.
- Removing a member or resetting their password signs them out immediately; role changes apply on their next click.
- Set `AUTH_SECRET` (e.g. `openssl rand -base64 32`) in production. Without it, sessions are signed with `ADMIN_PASSWORD`, so changing that password signs every admin out.

## Deploying to Vercel

1. **Create a database:** Vercel project → *Storage* → *Create Database* → **Neon (Postgres)**. This sets `DATABASE_URL` for you.
   (Any Postgres works, e.g. Supabase — paste its *pooled* connection string as `DATABASE_URL`.)
2. **Add `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `AUTH_SECRET`** under *Settings → Environment Variables* (use strong values).
3. **If the repo root is the parent folder**, set *Settings → Build & Deployment → Root Directory* to `choose-health`.
4. **Deploy.** No `.env` file is needed — Vercel injects the variables.

Every deploy runs `npm run vercel-build`, which:

- applies `db/schema.sql` (idempotent — `CREATE TABLE IF NOT EXISTS`, never drops data),
- seeds products and articles **only if those tables are empty** (`seed.ts --if-empty`), so live price edits are never overwritten,
- then runs `next build`.

Locally, `npm run db:seed` (without `--if-empty`) still resets the seed products to the values in `scripts/seed.ts`.

> Preview deployments use the same `DATABASE_URL` as production unless you enable Neon's per-branch databases.
> Schema changes to *existing* tables (new columns etc.) need an `ALTER TABLE … ADD COLUMN IF NOT EXISTS` added to `db/schema.sql`.

## Where things live

| What | Where |
| --- | --- |
| Phone numbers, address, hours, MoMo details | `src/lib/site.ts` |
| Products & articles (seed data) | `scripts/seed.ts` |
| Database schema | `db/schema.sql` |
| Home page sections | `src/app/page.tsx` |
| Checkout + order server action | `src/app/checkout/` |
| Orders list, filters & detail | `src/app/admin/(dashboard)/page.tsx`, `orders/[code]/`, queries in `src/lib/admin-orders.ts` |
| Products & photos (admin) | `src/app/admin/(dashboard)/products/` (photos are resized in the browser, stored in `product_images`, served from `/media/[id]`) |
| Product page | `src/app/products/[slug]/page.tsx` |
| Excel export | `src/app/admin/(dashboard)/orders/export/route.ts` (uses the same filters as the list) |
| Order dashboard & login | `src/app/admin/` (session logic in `src/lib/auth.ts`, redirects in `src/proxy.ts`) |
| Logo | `src/components/Logo.tsx`, `src/app/icon.svg` |

## Before launch — needs owner input

- Real product prices (seed prices are placeholders)
- High-resolution photos of ND William Owusu and each product (current images are cropped from the flyer)
- MoMo number, network and registered account name (`src/lib/site.ts`)
- Exact map pin for Awoshie Lane 14
