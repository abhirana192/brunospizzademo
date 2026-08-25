# Bruno's Deli & Pizza — Full-Stack Online Ordering Website

A production-style, full-stack online ordering system for **Bruno's Deli & Pizza**, a real late-night pizza, Chinese food, and diner restaurant (open Mon-Sat 10am-3am, Sun 10am-1am). Customers browse the full menu, customize pizzas, check out as pickup or delivery, and get a unique ticket number — no online payment, ever. Bruno's receives an email the moment a new order comes in, and staff manage everything from a secured admin dashboard.

## 1. Project Overview

- Customers order online and pay **at pickup or delivery** — there is no payment gateway anywhere in this codebase.
- Every order gets a unique, server-generated ticket number (`BP-10001`, `BP-10002`, ...).
- Bruno's inbox gets a "NEW ORDER" email for every order; the customer (if they gave an email) gets a confirmation email.
- Staff log into `/admin` to manage live orders (status board) and the menu (items, sizes, toppings, deals, categories).
- Prices are always calculated server-side from the database — the frontend can never influence what a customer is charged.
- The menu mirrors Bruno's real printed menu: Pizzas (build-your-own with 25 real toppings + 4 specialty pies), Snacks, Salads, Hot Sandwiches, Others (steaks/seafood/pasta), and a full Chinese Menu — plus Drinks and Desserts.

## 2. Features

- Original visual identity (burgundy/cream/charcoal/amber) built around Bruno's real brand — scrolling menu ticker, "open late" badge, and an editorial (not generic-grid) homepage layout. Fully responsive, mobile-first, with a sticky "Order Now" button.
- Homepage: hero, pickup/delivery quick-picker, cross-category "Fan Favorites" (one per category, not just pizzas), deals, "Why Bruno's", about, reviews, location/hours, footer.
- Full menu with 8 category tabs (icons per category), pizza customization (size, crust, toppings, special instructions), cart drawer with edit/remove.
- **Real per-size pizza topping pricing**: standard toppings are a flat per-size fee ($2 small/medium, $2.50 large); premium toppings (Chicken, BBQ Chicken, Donair Meat) are a flat $7 add-on regardless of size — configurable via env vars, computed server-side, never trusted from the client.
- Checkout with conditional pickup/delivery fields, ASAP or scheduled time (server-validated against real day-of-week business hours, including past-midnight wraparound), and an order review before submission.
- Ticket-number confirmation page with print support.
- Dual email notifications (customer confirmation + restaurant new-order alert), console-logged locally when SMTP isn't configured.
- Admin dashboard: status Kanban (NEW → CONFIRMED → PREPARING → READY → COMPLETED, or CANCELLED), search by ticket/name/phone/date, kitchen-ticket printing, full menu management (categories, items, sizes, toppings incl. premium flag, deals) with enable/disable toggles.
- JWT-in-httpOnly-cookie admin auth, bcrypt password hashing, rate limiting on login/orders, zod input validation everywhere, lightweight CSRF header check on admin mutations.

Demo menu photos are real food photography sourced from Wikimedia Commons under CC/public-domain licenses — see [`frontend/public/images/food/CREDITS.md`](frontend/public/images/food/CREDITS.md) for full attribution. Swap them for real restaurant photography before going live by replacing the files or updating the `image` path on each menu item/deal in the admin dashboard.

## 3. Technology Stack

| Layer      | Choice                                             |
|------------|-----------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite + Tailwind CSS + React Router |
| Backend    | Node.js + Express + TypeScript                     |
| Database   | PostgreSQL + Prisma ORM (schema + migrations)       |
| Auth       | JWT (httpOnly, SameSite=Strict cookie) + bcrypt      |
| Email      | Nodemailer (SMTP; console fallback in dev)          |

SPA note: since the frontend is a Vite SPA (not SSR), full crawler-rendered SEO is weaker than a framework like Next.js would give you. We mitigate with per-route `<title>`/meta via `react-helmet-async`, a Restaurant JSON-LD block, and static `robots.txt`/`sitemap.xml`. If SEO becomes a priority, migrating the frontend to Next.js is the natural next step.

## 4. Folder Structure

```
BrunoPizza/
  docker-compose.yml        # Postgres + Adminer for local dev
  backend/
    prisma/schema.prisma    # Data model
    prisma/seed.ts          # Demo data + admin user
    src/
      config/env.ts         # Typed env loader
      db/prisma.ts          # Prisma client singleton
      middleware/           # auth, error handling, rate limiting
      modules/
        auth/                # admin login/logout/me
        menu/                # public + admin menu CRUD
        orders/              # ticket generation, order creation, admin order mgmt
        email/               # emailService + HTML templates
      routes/index.ts       # API router aggregator
      scripts/createAdmin.ts
      app.ts / server.ts
  frontend/
    src/
      pages/                 # Home, Menu, Deals, About, Contact, Checkout, Order confirmation, Admin/*
      components/            # Header, Footer, CustomizationModal, CartDrawer, admin/*, home/*
      context/                # Cart, OrderType, Auth, MenuData, Toast
      api/                    # typed fetch wrappers
```

## 5. Installation

Prerequisites: Node.js 20+, npm 10+, and a running PostgreSQL 16 server (via Docker, a native install, or the portable binaries — see below).

```bash
git clone <this-repo>
cd BrunoPizza
npm install          # installs both workspaces (backend + frontend)
```

## 6. Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values. Every variable is documented inline in that file. Highlights:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Signs admin session cookies — generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeds the first admin account |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASSWORD` / `EMAIL_FROM` | SMTP credentials. **Leave `EMAIL_HOST` blank for local dev** — the email service logs full email content to the console instead of sending, so you can verify notifications without a real inbox. |
| `RESTAURANT_EMAIL` | Where "NEW ORDER" alerts are sent |
| `DELIVERY_FEE` / `FREE_DELIVERY_THRESHOLD` | Business rules used in server-side pricing |
| `OPEN_HOUR` / `CLOSE_HOUR_MON_TO_SAT` / `CLOSE_HOUR_SUN` | Real hours (10am-3am Mon-Sat, 10am-1am Sun) used to validate scheduled order times, including past-midnight wraparound |
| `PIZZA_TOPPING_FEE_SMALL` / `_MEDIUM` / `_LARGE` / `PIZZA_PREMIUM_TOPPING_FEE` | Per-size fee for standard pizza toppings, and the flat add-on for premium toppings (Chicken, BBQ Chicken, Donair Meat) |

Never commit `.env` — it's already in `.gitignore`.

## 7. Database Setup

**Option A — Docker (recommended when available):**
```bash
docker compose up -d
```

**Option B — Native/portable PostgreSQL** (what this project's own dev environment actually uses, since Docker Desktop requires WSL2/Hyper-V, which wasn't enabled on the machine this was built on): the "Windows x86-64 binaries (zip)" archive from https://www.enterprisedb.com/download-postgresql-binaries was extracted to `C:\Users\<you>\pgsql16\pgsql` (no installer, no admin rights needed), with a data directory at `C:\Users\<you>\pgsql16\data`, user `bruno`, password `bruno_dev_password`, port `5432` — matching `docker-compose.yml`'s credentials so `DATABASE_URL` doesn't need to change either way.

To start/stop this instance on a machine set up the same way:
```powershell
# start
C:\Users\<you>\pgsql16\pgsql\bin\pg_ctl.exe -D C:\Users\<you>\pgsql16\data -l C:\Users\<you>\pgsql16\logfile.log start
# stop
C:\Users\<you>\pgsql16\pgsql\bin\pg_ctl.exe -D C:\Users\<you>\pgsql16\data stop
```
It is **not** installed as a Windows service — it only runs while started this way, and stops if the machine restarts. Once Docker Desktop has WSL2 available, `docker compose up -d` is the lower-maintenance option.

## 8. Database Migrations

```bash
cd backend
npx prisma migrate dev     # creates the schema + runs migrations
npm run db:seed            # 9 pizzas, 5 sides, 5 drinks, 3 desserts, 10 toppings, 3 deals, 1 admin user
```

`npm run db:studio` (from `backend/`) opens Prisma Studio if you want to browse the data visually.

## 9. Running the App

From the repo root:
```bash
npm run dev
```
This starts the backend (`http://localhost:4000`) and frontend (`http://localhost:5173`, proxying `/api` to the backend) together. Or run them separately with `npm run dev:backend` / `npm run dev:frontend`.

## 10. Creating an Admin Account

The seed script creates one admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME` in `backend/.env`. To create or reset an admin account at any time:
```bash
cd backend
npm run create-admin -- --email=you@example.com --password=your_password --name="Your Name"
```

## 11. How Email Notifications Work

`backend/src/modules/email/emailService.ts` exposes two functions, called from `orders.service.ts` right after an order is committed to the database:

- `sendCustomerConfirmationEmail(order)` — only sent if the customer gave an email address.
- `sendRestaurantNewOrderEmail(order)` — always sent to `RESTAURANT_EMAIL`.

If `EMAIL_HOST` is unset, both functions log the full rendered email (subject + HTML) to the backend console instead of sending — this is the default for local development. Set `EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASSWORD` to any SMTP provider (Gmail SMTP, SendGrid SMTP relay, Mailtrap, etc.) to send real emails; no code changes are needed. If sending fails, the error is logged and the order is **not** rolled back or deleted — it stays in the database with `status: NEW` so it can be retried or handled manually.

## 12. How to Add/Edit Menu Items

Through the admin dashboard (`/admin/menu`) once logged in: Items / Categories / Toppings / Deals tabs let you add, edit, delete, and enable/disable everything, including changing prices and sizes. Under the hood this hits `POST/PUT/DELETE /api/admin/menu/*`, all protected by `requireAdmin` + a CSRF header check. Historical orders are unaffected by later menu edits — every `OrderItem` stores its own name/price snapshot at the time of purchase.

## 13. How to Deploy

- **Backend**: build with `npm run build -w backend`, run `npm run db:deploy -w backend` (applies migrations without prompting) against your production database, then `npm start -w backend`. Put it behind a process manager (pm2, systemd) or containerize it.
- **Frontend**: `npm run build -w frontend` produces a static `frontend/dist` bundle — serve it from any static host/CDN (Vercel, Netlify, Nginx, S3+CloudFront). Point it at the backend's public URL by adjusting the reverse proxy / API base path.
- Set all `backend/.env` variables in your hosting provider's secret/environment manager — never bake them into the image or repo.
- Use a real SMTP provider for `EMAIL_*` in production.
- Put the backend behind HTTPS so the `secure` cookie flag (auto-enabled when `NODE_ENV=production`) actually applies.

## 14. Production Security Considerations

- Rotate `JWT_SECRET` and all SMTP/DB credentials before going live; never reuse the dev values from `.env.example`.
- Terminate TLS in front of the backend (reverse proxy/load balancer) — cookies are `secure` in production and require HTTPS.
- Consider moving the lightweight header-based CSRF check to a full double-submit-token scheme if you add more state-changing surface area.
- Tune `express-rate-limit` windows (`backend/src/middleware/rateLimit.ts`) for your real traffic patterns.
- Review CORS (`FRONTEND_URL` in `.env`) to ensure only your real frontend origin is allowed.
- Set up log shipping/alerting on `[EMAIL:*] FAILED` log lines so failed notification emails get retried or handled manually.

## How a Real Order Flows Through the System

1. A customer lands on the homepage, picks **Pickup** or **Delivery**, and clicks **Order Now** (or browses straight to `/menu`).
2. They tap a pizza, choose size/crust/toppings/special instructions in the customization modal, and hit **Add to Cart**. The cart lives in `localStorage` via `CartContext` so it survives a refresh.
3. At `/checkout` they fill in contact info (+ address if delivery), choose ASAP or a scheduled time, and review the full order — items, customization, subtotal, delivery fee, total — with the "payment is handled separately" disclaimer directly on the page.
4. On **Place Order**, the frontend posts the cart to `POST /api/orders`. The backend (`orders.service.ts`):
   - Re-fetches every menu item/size/topping price from the database — client-sent prices are never trusted.
   - Validates the requested time against business hours and lead time.
   - Opens a database transaction, pulls the next value from the `ticket_number_seq` Postgres sequence to build a guaranteed-unique ticket number (`BP-10001`, ...), and writes the `Order` + `OrderItem` rows with full name/price snapshots.
   - Fires `sendCustomerConfirmationEmail()` and `sendRestaurantNewOrderEmail()`. Bruno Pizza's inbox (`RESTAURANT_EMAIL`) gets a "NEW ORDER" email with the ticket number, customer/phone, order type, items with customization, total, and special instructions — the moment the order lands. If email delivery fails, the order stays saved and the failure is logged, not swallowed.
5. The frontend receives the ticket number and redirects to `/order/:ticketNumber`, which shows the full confirmation — ticket number, customer info, items, customization, and total — with a **Print Order** button.
6. Staff see the new order appear in the **NEW** column of `/admin` within seconds (the board polls every 20s), and move it through **CONFIRMED → PREPARING → READY → COMPLETED** (or **CANCELLED**) as it's handled. They can search by ticket/name/phone/date and print a kitchen-ticket-formatted copy at any time.
7. The customer, if they gave an email, gets their own confirmation email with the same ticket number and order details, and pays **in person at pickup or delivery** — the site never asked for a card.
