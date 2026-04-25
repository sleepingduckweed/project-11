# 🍱 Kiyamaa's Kitchen — Admin Management System

> A WhatsApp-first tiffin management system for small-scale food businesses. Handles customer registrations, multi-bucket tiffin balances, order booking/dispatch, and WhatsApp-driven automation — all from a premium admin dashboard.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Getting Started](#getting-started)
6. [Data Models](#data-models)
7. [TypeScript Enums](#typescript-enums)
8. [API Reference](#api-reference)
9. [WhatsApp Integration](#whatsapp-integration)
10. [Admin Dashboard Pages](#admin-dashboard-pages)
11. [UI Component System](#ui-component-system)
12. [Authentication](#authentication)
13. [Scripts](#scripts)
14. [Architecture Decisions](#architecture-decisions)

---

## Overview

Kiyamaa's Kitchen Admin is a **Next.js 16** application that provides a complete back-of-house management system for a home-based tiffin service. The system works in two layers:

1. **WhatsApp Automation Layer** — Customers interact entirely via WhatsApp. The system processes their `YES/NO` responses for booking prompts, handles balance checks, and sends order confirmations automatically.

2. **Admin Dashboard Layer** — The kitchen owner manages everything via a premium web dashboard: registering customers, recharging per-meal balances, placing manual orders, dispatching tiffins, and broadcasting WhatsApp messages.

### Key Concept: Multi-Bucket Balance System

Each user has **three independent tiffin balance buckets**:
- 🌅 **Breakfast Balance** — deducted when breakfast is booked
- ☀️ **Lunch Balance** — deducted when lunch is booked
- 🌙 **Dinner Balance** — deducted when dinner is booked

This means recharging and deduction are always meal-type specific. A user can have 0 breakfast credits but 15 lunch credits — they're completely independent.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 4 |
| Database | MongoDB via Mongoose 9 |
| Auth | NextAuth.js v4 (credentials provider) |
| Messaging | WhatsApp Cloud API (Meta) |
| Icons | Lucide React |
| Runtime | Node.js |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── broadcast/          # Admin-triggered WhatsApp broadcasts
│   │   │   ├── orders/             # Order CRUD + bulk dispatch
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts    # PATCH: individual dispatch
│   │   │   │       └── cancel/     # POST: cancel + refund
│   │   │   ├── stats/              # Dashboard overview aggregations
│   │   │   ├── transactions/       # Tiffin ledger per user
│   │   │   └── users/              # User CRUD + per-bucket recharge
│   │   │       └── [id]/           # PUT: recharge, GET/DELETE: individual
│   │   ├── auth/                   # NextAuth.js [...nextauth] handler
│   │   ├── broadcast/
│   │   │   └── daily/              # Cron-triggerable daily broadcast
│   │   └── whatsapp/
│   │       └── webhook/            # WhatsApp Cloud API webhook handler
│   ├── dashboard/
│   │   ├── page.tsx                # Overview / Stats dashboard
│   │   ├── bookings/               # 7-day booking matrix (50-100 users)
│   │   ├── orders/                 # Daily dispatch hub + manual booking
│   │   └── users/                  # User roster + recharge + ledger
│   ├── login/                      # Admin authentication page
│   ├── layout.tsx                  # Root layout, wraps DialogProvider
│   └── globals.css                 # Global styles + design tokens
├── components/
│   └── ui/
│       └── Modal.tsx               # Reusable glassmorphic modal wrapper
├── constants/                      # Tiffin config, pricing, timings
├── lib/
│   ├── mongodb.ts                  # Singleton Mongoose connection
│   └── whatsapp.ts                 # sendWhatsAppMessage() helper
├── middleware.ts                   # Auth guard for /dashboard routes
├── models/
│   ├── User.ts                     # UserV2 schema (multi-bucket balances)
│   ├── Order.ts                    # OrderV2 schema (Enum-typed)
│   └── Transaction.ts              # TransactionV2 schema (ledger)
├── providers/
│   └── DialogProvider.tsx          # Global alert/confirm dialog context
└── types/
    └── enums.ts                    # All TypeScript Enums
```

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
# ── MongoDB ──────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

# ── NextAuth ─────────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your_random_secret>

# Admin Credentials (stored in env, not DB for simplicity)
ADMIN_USERNAME=admin@kiyamaa.com
ADMIN_PASSWORD=<your_admin_password>

# ── WhatsApp Cloud API ────────────────────────────────────────
WHATSAPP_TOKEN=<meta_system_user_access_token>
WHATSAPP_PHONE_NUMBER_ID=<your_phone_number_id>
WHATSAPP_VERIFY_TOKEN=naruto          # Must match what you set in Meta dashboard

# ── Cron Security ────────────────────────────────────────────
CRON_SECRET=<secret_for_daily_broadcast_cron>
```

> ⚠️ **Never commit `.env.local` to version control.**

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (or local instance)
- Meta Developer App with WhatsApp Business Cloud API enabled

### Installation

```bash
# Clone and install
git clone <repo-url>
cd aditya
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Seed the database with test data
npm run seed

# Seed the admin user
node scripts/seed-admin.js

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run start
```

---

## Data Models

### User (`UserV2` collection)

Represents a registered tiffin customer.

| Field | Type | Description |
|---|---|---|
| `name` | `String` | Customer's full name *(required)* |
| `phone` | `String` | WhatsApp phone number, unique *(required)* |
| `address` | `String` | Delivery address *(required)* |
| `breakfastBalance` | `Number` | Breakfast tiffin credits (default: 0) |
| `lunchBalance` | `Number` | Lunch tiffin credits (default: 0) |
| `dinnerBalance` | `Number` | Dinner tiffin credits (default: 0) |
| `isActive` | `Boolean` | Whether the user is active (default: true) |
| `foodPreference` | `'Veg' \| 'Non-Veg'` | Dietary preference (default: Veg) |
| `plan` | `String` | Subscription plan (default: Regular) |
| `pendingBroadcast` | `Object` | Stores pending YES/NO prompt context |
| `preferredReminderTime` | `String` | HH:MM for daily reminders |
| `createdAt` | `Date` | Registration timestamp |

### Order (`OrderV2` collection)

Represents a single meal booking.

| Field | Type | Description |
|---|---|---|
| `userId` | `ObjectId` | Reference to `UserV2` |
| `bookingDate` | `Date` | Date of the meal *(required)* |
| `mealType` | `MealType` | Enum: Breakfast / Lunch / Dinner / Both |
| `tiffinsDeducted` | `Number` | How many tiffins were deducted |
| `status` | `OrderStatus` | Enum: Booked / Dispatched / Delivered / Cancelled |
| `createdAt` | `Date` | Booking timestamp |

### Transaction (`TransactionV2` collection)

Immutable ledger record for every balance change.

| Field | Type | Description |
|---|---|---|
| `userId` | `ObjectId` | Reference to `UserV2` |
| `type` | `TransactionType` | Enum: Credit / Debit |
| `mealType` | `MealType?` | Which bucket was affected (optional) |
| `tiffinCount` | `Number` | Number of tiffins changed *(required)* |
| `reason` | `String` | Human-readable reason *(required)* |
| `createdAt` | `Date` | Timestamp |

---

## TypeScript Enums

All enums are defined in `src/types/enums.ts` and must be used everywhere instead of raw strings.

```ts
enum MealType {
  Breakfast = 'Breakfast',
  Lunch     = 'Lunch',
  Dinner    = 'Dinner',
  Both      = 'Both',     // Deducts 1 from lunchBalance + 1 from dinnerBalance
  None      = 'None'
}

enum FoodPreference {
  Veg    = 'Veg',
  NonVeg = 'Non-Veg'
}

enum PlanType {
  Regular   = 'Regular',
  Trial     = 'Trial',
  Monthly20 = 'Monthly 20',
  Daily     = 'Daily'
}

enum OrderStatus {
  Booked     = 'Booked',
  Dispatched = 'Dispatched',
  Delivered  = 'Delivered',
  Cancelled  = 'Cancelled'
}

enum TransactionType {
  Credit = 'Credit',
  Debit  = 'Debit'
}
```

---

## API Reference

All admin APIs require a valid session (NextAuth cookie). Returns 401 if unauthenticated.

### Users

#### `GET /api/admin/users`
Fetch paginated user list.

**Query params:** `query` (search string), `page`, `limit`

**Response:**
```json
{
  "users": [ { "_id": "...", "name": "...", "lunchBalance": 14, ... } ],
  "total": 87,
  "totalPages": 5,
  "page": 1
}
```

#### `POST /api/admin/users`
Register a new customer.

**Body:**
```json
{
  "name": "Priya Sharma",
  "phone": "919876543210",
  "address": "14 Rose Street, Pune",
  "foodPreference": "Veg",
  "plan": "Regular"
}
```

#### `PUT /api/admin/users/:id`
Recharge a user's specific meal bucket.

**Body:**
```json
{
  "tiffinCount": 20,
  "mealType": "Lunch"
}
```
Automatically creates a `Credit` Transaction record and sends a WhatsApp notification.

---

### Orders

#### `GET /api/admin/orders`
Returns all orders from today onwards (populated with user details).

#### `POST /api/admin/orders`

Two modes depending on the request body:

**Mode 1 — Bulk Dispatch:**
```json
{ "mealType": "Lunch", "notifyUser": true }
```
Marks all today's booked Lunch orders as `Dispatched` and optionally sends WhatsApp messages.

**Mode 2 — Manual Booking:**
```json
{
  "manualBooking": {
    "userId": "<id>",
    "bookingDate": "2026-04-25",
    "mealType": "Dinner",
    "notifyUser": true
  }
}
```
Checks balance in the correct bucket, deducts it, creates the Order and Transaction records.

#### `PATCH /api/admin/orders/:id`
Update a single order's status (e.g., dispatch individually).

**Body:**
```json
{ "status": "Dispatched", "notifyUser": true }
```
Sends a WhatsApp notification showing the updated per-bucket balances.

#### `POST /api/admin/orders/:id/cancel`
Cancel an order and refund the tiffin to the **correct meal bucket**.

**Body:**
```json
{ "notifyUser": true }
```
Creates a `Credit` Transaction. Returns `{ success: true, newBalance: { breakfast, lunch, dinner } }`.

---

### Stats

#### `GET /api/admin/stats`
Returns aggregated dashboard metrics:
- Total active users
- Today's order counts by meal type
- Low balance user counts (< 2 tiffins)
- Pending orders

---

### Transactions

#### `GET /api/admin/transactions?userId=<id>`
Fetches the complete sorted ledger for a given user.

---

### Broadcast

#### `POST /api/admin/broadcast`
Admin-triggered WhatsApp broadcast for an upcoming slot.

**Body:**
```json
{
  "slotLabel": "Tomorrow Lunch",
  "slotDate": "2026-04-26T00:00:00.000Z",
  "userIds": []           // Empty = broadcast to ALL active users with balance
}
```
Filters users who have balance in the relevant bucket, sends booking prompts, and stores `pendingBroadcast` state on each user for YES/NO webhook handling.

#### `POST /api/broadcast/daily`
Cron-triggered daily morning broadcast. Requires `Authorization: Bearer <CRON_SECRET>` header.

---

### WhatsApp Webhook

#### `GET /api/whatsapp/webhook`
Meta webhook verification endpoint. Compares `hub.verify_token` against `WHATSAPP_VERIFY_TOKEN`.

#### `POST /api/whatsapp/webhook`
Processes incoming WhatsApp messages.

**Command Routing:**

| Message | Action |
|---|---|
| `YES` / `Y` / `OK` | Confirm pending booking prompt |
| `NO` / `N` / `SKIP` | Decline pending booking prompt |
| `1` | Book Lunch for today |
| `2` | Book Dinner for today |
| `3` | Book Both (Lunch + Dinner) for today |
| `0` | No booking today |
| `BAL` / `BALANCE` | Show all three bucket balances |
| `HISTORY` | Last 5 order history |
| `HELP` | Show command menu |
| *(anything else)* | Show balance + active bookings + commands |

All balance operations target the correct per-bucket field. Balance messages always display all three buckets:
```
🌅 Breakfast: 5 | ☀️ Lunch: 12 | 🌙 Dinner: 8
```

---

## WhatsApp Integration

### Setup

1. Create a Meta Developer App at [developers.facebook.com](https://developers.facebook.com)
2. Add the **WhatsApp** product to your app
3. Under **WhatsApp > Configuration**, set your webhook URL:
   ```
   https://<your-domain>/api/whatsapp/webhook
   ```
4. Set the Verify Token to match `WHATSAPP_VERIFY_TOKEN` in your `.env.local`
5. Subscribe to the `messages` webhook field
6. Copy your **System User Access Token** and **Phone Number ID** to `.env.local`

### `sendWhatsAppMessage` Helper

Located at `src/lib/whatsapp.ts`. Usage:

```ts
import { sendWhatsAppMessage } from '@/lib/whatsapp';

await sendWhatsAppMessage(user.phone, `Your message here`);
```

Internally calls `POST https://graph.facebook.com/v21.0/<PHONE_NUMBER_ID>/messages` with a `text` type message.

---

## Admin Dashboard Pages

### `/dashboard` — Overview
- Live stats: active users, today's orders (Breakfast / Lunch / Dinner), pending vs dispatched
- Quick action cards
- Low-balance alerts

### `/dashboard/users` — User Management
- Paginated, searchable roster of all customers
- Desktop: table view with multi-bucket balance indicators (☕/☀️/🌙)
- Mobile: card view with the same balance breakdown
- **+ Recharge** button: opens a Modal to select meal type and enter tiffin count
- **History** button: opens a transaction ledger Modal per user

### `/dashboard/bookings` — Booking Matrix
- 7-day rolling calendar grid: users as rows, dates as columns
- Each cell shows existing bookings with colour-coded meal chips (click to cancel)
- Empty cells show a `+` button to open a Quick Booking Modal
- Aggregate stats bar at the top (Today's Breakfast/Lunch/Dinner/Total)
- Paginated (20 users per page) with search

### `/dashboard/orders` — Orders Dashboard
- **Manual Booking Panel** (collapsible): select user, date, meal type, and WhatsApp toggle
- **WhatsApp Trigger Hub**: 4 upcoming slot cards (time-aware: shows today + tomorrow based on current hour); clicking opens a Broadcast Modal
- **Today's Load** stat card: real-time Breakfast/Lunch/Dinner counts
- **Triple-column Distribution View**: one column per meal type
  - Dispatch All button per column (confirms via Dialog)
  - Per-order rows: individual dispatch (✓), notify toggle (💬), and cancel (✗) controls
  - Status badges: Booked (orange), Dispatched (blue), Cancelled (red)

---

## UI Component System

### `Modal` (`src/components/ui/Modal.tsx`)

A reusable, animated glassmorphic modal.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Controls visibility |
| `onClose` | `() => void` | Handler for backdrop click / close button |
| `title` | `string` | Modal header title |
| `children` | `ReactNode` | Modal body content |
| `footer` | `ReactNode?` | Optional footer section (for action buttons) |

**Usage:**
```tsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm Action">
  <p>Are you sure?</p>
</Modal>
```

---

### `DialogProvider` (`src/providers/DialogProvider.tsx`)

A global React context that replaces all native `window.alert()` and `window.confirm()` calls with premium glassmorphic dialogs.

**Wrap your app** (already done in `src/app/layout.tsx`):
```tsx
<DialogProvider>
  {children}
</DialogProvider>
```

**Consume in any client component:**
```tsx
import { useDialog } from '@/providers/DialogProvider';

const { alert, confirm } = useDialog();

// Alert (info / success / error)
alert('Success', 'Order dispatched successfully!', 'success');
alert('Error', 'Insufficient balance.', 'error');

// Confirm (shows Cancel + Confirm buttons)
confirm(
  'Delete Order',
  'This action cannot be undone.',
  async () => {
    await deleteOrder(id);
  }
);
```

**Dialog types and icons:**

| Type | Icon | Color |
|---|---|---|
| `info` (default) | ℹ️ Info | Blue |
| `success` | ✅ CheckCircle | Emerald |
| `error` | 🚨 AlertCircle | Red |
| `confirm` | ❓ HelpCircle | Orange |

---

## Authentication

- Uses **NextAuth.js v4** with a **Credentials Provider**
- Admin credentials are stored in environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`)
- Session strategy: **JWT**
- Route protection is handled in `src/middleware.ts`:
  - `/dashboard/**` — requires authenticated session
  - `/login` — redirects to dashboard if already authenticated
  - `/api/**` routes check session individually via `getServerSession()`

---

## Scripts

Located in `scripts/` directory, run via Node.js directly.

### `npm run seed`
Populates the database with 20 realistic test users across different plans and balance levels. Useful for UI testing.

```bash
npm run seed
```

### `node scripts/seed-admin.js`
Hashes and stores the admin credentials. Only needed if managing auth via DB instead of env vars.

### `node scripts/test-webhook.js`
Sends a simulated WhatsApp webhook POST to `localhost:3000/api/whatsapp/webhook` for local testing without needing a real WhatsApp message.

---

## Architecture Decisions

### Why Multi-Bucket Balances?

The original system used a single `tiffinBalance` counter. This was replaced because:
- A customer might subscribe only to Lunch + Dinner, not Breakfast
- Admin recharges should be meal-specific for accounting clarity
- WhatsApp booking confirmation should show granular per-meal balance

### Why Enums?

All meal types, order statuses, and plan types are enforced via TypeScript Enums. This:
- Prevents string typo bugs at the API and DB layer
- Makes the Mongoose schema self-documenting
- Enables type-safe switch statements and discriminated unions in handlers

### Why Custom Dialog System?

Native `window.alert()` and `window.confirm()` are synchronous, ugly, and impossible to style. The `DialogProvider` wraps the `Modal` component to provide:
- Non-blocking async confirmations via callbacks
- Consistent glassmorphic design matching the dashboard
- Clear iconography for different alert types

### Model Naming (`UserV2`, `OrderV2`, `TransactionV2`)

Mongoose caches model schemas in development. When schema fields are changed significantly (e.g., removing `tiffinBalance`, adding three new balance fields), the cache can serve the old schema. Using versioned model names (`UserV2` etc.) forces a clean re-registration and avoids `MissingSchemaError` or validation failures during hot reloads.

---

## Deployment Notes

- Deploy on **Vercel** (recommended) or any Node.js-compatible host
- Set all env vars in the deployment dashboard
- Configure the WhatsApp webhook URL to point to your production domain
- The `CRON_SECRET` is used to secure the daily broadcast endpoint — call it from a cron service (e.g., cron-job.org, GitHub Actions) with:
  ```
  POST https://<domain>/api/broadcast/daily
  Authorization: Bearer <CRON_SECRET>
  ```

---

*Built and maintained for Kiyamaa's Kitchen. For issues or contributions, open a pull request.*
