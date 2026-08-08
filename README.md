# Quick Food 🍔

**A modern, full-stack food delivery web application built with Next.js, Sanity CMS, and Stripe.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#) [![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)](#) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#) [![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.6-blueviolet?logo=pnpm)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue?logo=typescript)](#)

---

## Overview

**Quick Food** is a full-stack restaurant ordering web application. Customers can browse menus, manage a cart, checkout with Stripe, and track their order status. The project also ships an embedded **Sanity Studio** (mounted at `/studio-quick-food`) for content management, and a role-gated **Admin Dashboard** for managing orders, products, users, and reviews — all inside the same Next.js application.

### Key Features

- 🍽️ **Menu browsing** by category, restaurant, and individual food items.
- 🛒 **Cart & Checkout** — persistent cart via Zustand, Stripe-powered payments.
- 👤 **Authentication** via **Auth.js v5** — Google OAuth + email/password (credentials stored in Sanity, passwords hashed with bcryptjs).
- 🧑‍💼 **Role-based access** — `user` and `admin` roles, enforced via JWT session strategy.
- 📊 **Admin Dashboard** — analytics, order management, product management, user management, and review moderation.
- 📝 **Embedded Sanity Studio** — headless CMS at `/studio-quick-food` with a custom dashboard view and GROQ Vision tool.
- 🔴 **Sanity Live** — real-time content updates streamed to the client.
- 📱 **Responsive UI** built with **Tailwind CSS v4**, **shadcn/ui** (Radix primitives), and **Lucide** icons.
- 🔔 **Toast notifications** via **Sonner**.
- 📸 **Carousel** components powered by **Embla Carousel**.
- 📈 **Charts** via **Recharts**.
- 🧪 **End-to-end testing** with **Playwright** (Chromium, Firefox, WebKit).

---

## Architecture & Tech Stack

| Layer | Technology | Version | Reason |
|---|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) | 16.2.6 | App Router, Server Components, Turbopack, React Compiler |
| **Language** | TypeScript | 5.5.4 | Type safety across the entire codebase |
| **UI Library** | React | 19.x | Latest concurrent features |
| **Styling** | Tailwind CSS | 4.3.x | Utility-first, CSS variables, zero dead CSS |
| **Component Primitives** | shadcn/ui + Radix UI | Latest | Accessible, unstyled, composable components |
| **Icons** | Lucide React | 0.577.x | Consistent, tree-shakeable icon set |
| **CMS / Database** | [Sanity](https://www.sanity.io/) | 5.31.x | Headless CMS with GROQ queries, real-time live content, and a Studio embedded inside the app |
| **Authentication** | Auth.js (NextAuth) v5 | 5.0.0-beta.31 | Google OAuth + Credentials provider; JWT session strategy |
| **Password Hashing** | bcryptjs | 3.x | Secure credential hashing |
| **Payments** | Stripe | 22.x | Full payment processing via `@stripe/stripe-js` (client) and `stripe` (server) |
| **State Management** | Zustand | 5.x | Lightweight global store for cart and review state |
| **Notifications** | Sonner | 2.x | Toast notification system |
| **Carousels** | Embla Carousel | 8.x | Hero & product carousels with autoplay |
| **Charts** | Recharts | 3.x | Admin analytics dashboard |
| **Portable Text** | `@portabletext/react` | 6.x | Rich-text rendering from Sanity |
| **Validation** | Zod | 4.x | Runtime schema validation |
| **E2E Testing** | Playwright | 1.61.x | Cross-browser automated tests |
| **Deployment** | Netlify | — | `@netlify/plugin-nextjs`; build config in `netlify.toml` |
| **Fonts** | Google Fonts (Geist, Inter, Montserrat) | — | Loaded via `next/font` |

---

## Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| **Node.js** | 22.x (LTS) | Matches Netlify `NODE_VERSION = "22"` |
| **pnpm** | 8.6.x | Lockfile is `pnpm-lock.yaml`; `.npmrc` enforces pnpm |
| **Sanity account** | — | Required to connect to the Sanity project |
| **Stripe account** | — | Required for payment processing |
| **Google OAuth credentials** | — | Required for Google sign-in |

> **Tip** — Enable corepack for automatic pnpm version management:
> ```bash
> corepack enable && corepack prepare pnpm@latest --activate
> ```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/quick-food.git
cd quick-food
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root and fill in the required values:

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Auth.js
AUTH_SECRET=your_random_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# App settings
APP_NAME="Quick Food"
DELIVERY_FEE=5.00
DELIVERY_FEE_THRESHOLD=500.00
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The embedded Sanity Studio is available at [http://localhost:3000/studio-quick-food](http://localhost:3000/studio-quick-food).

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **dev** | `pnpm dev` | Start the Next.js dev server with Turbopack and hot-reload |
| **build** | `pnpm build` | Compile the app for production |
| **start** | `pnpm start` | Run the compiled production server |
| **lint** | `pnpm lint` | Run ESLint across the project |
| **typegen** | `pnpm typegen` | Extract the Sanity schema and regenerate TypeScript types (`sanity.types.ts`) |
| **generate** | `pnpm g` | Run the custom data generation script (`scripts/generate.ts`) via tsx |
| **test (E2E)** | `pnpm playwright test` | Run the full Playwright end-to-end test suite |
| **test (UI)** | `pnpm playwright test --ui` | Open the Playwright interactive UI runner |
| **test report** | `pnpm playwright show-report` | View the last HTML test report |

---

## Project Structure

```
quick-food/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (client)/               # Customer-facing route group
│   │   │   ├── @authModal/         # Parallel route — auth modal
│   │   │   ├── menu/               # Menu listing page
│   │   │   ├── food/               # Individual food item page
│   │   │   ├── category/           # Category filtering page
│   │   │   ├── categories/         # All categories page
│   │   │   ├── restaurants/        # Restaurant listing page
│   │   │   ├── cart/               # Cart page
│   │   │   ├── checkout/           # Checkout page
│   │   │   ├── order-success/      # Post-payment confirmation
│   │   │   ├── user/               # User profile & orders
│   │   │   ├── about/              # About page
│   │   │   ├── blog/               # Blog / featured posts
│   │   │   ├── contact/            # Contact page
│   │   │   └── layout.tsx          # Shared client layout (navbar, etc.)
│   │   ├── admin/                  # Role-gated Admin Dashboard
│   │   │   ├── analytics/          # Revenue & traffic charts
│   │   │   ├── orders/             # Order management
│   │   │   ├── products/           # Product management
│   │   │   ├── users/              # User management
│   │   │   ├── reviews/            # Review moderation
│   │   │   └── settings/           # App settings
│   │   ├── api/                    # Next.js API Route Handlers
│   │   ├── auth/                   # Auth.js route handlers
│   │   ├── studio-quick-food/      # Embedded Sanity Studio
│   │   ├── layout.tsx              # Root layout (fonts, providers, Sonner)
│   │   └── globals.css             # Global CSS & Tailwind v4 tokens
│   ├── components/                 # Reusable UI components
│   │   ├── admin/                  # Admin-specific UI
│   │   ├── cart/                   # Cart UI components
│   │   ├── foods/                  # Food card & list components
│   │   ├── hero/                   # Hero / banner components
│   │   ├── restaurants/            # Restaurant card components
│   │   ├── common/                 # Shared components (navbar, footer…)
│   │   └── ui/                     # shadcn/ui primitives
│   ├── features/                   # Vertical feature slices
│   │   ├── auth/                   # Auth forms & logic
│   │   ├── checkout/               # Checkout state & helpers
│   │   ├── user/                   # User profile logic
│   │   └── address/                # Address management
│   ├── stores/                     # Zustand global stores
│   │   ├── cart/                   # Cart store
│   │   └── review/                 # Review store
│   ├── sanity/                     # Sanity CMS integration
│   │   ├── schemaTypes/            # Content schemas (food, restaurant, user…)
│   │   ├── lib/                    # Sanity client, live, image URL helpers
│   │   ├── hooks/                  # useSanityLive, etc.
│   │   ├── components/             # Studio UI components (DashboardView)
│   │   └── structure.ts            # Custom Studio desk structure
│   ├── actions/                    # Next.js Server Actions
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility functions (cn, stripe client…)
│   ├── constants/                  # App-wide constants
│   ├── provider/                   # React context providers (AuthProvider)
│   └── types/                      # Shared TypeScript types
├── tests/                          # Playwright E2E test specs
├── playwright/                     # Playwright auth state storage
├── scripts/                        # Data generation scripts (tsx)
├── public/                         # Static assets
├── auth.ts                         # Auth.js configuration (root)
├── sanity.config.ts                # Sanity Studio configuration
├── sanity.types.ts                 # Auto-generated Sanity TypeScript types
├── next.config.ts                  # Next.js config (Turbopack, React Compiler, image domains)
├── postcss.config.mjs              # PostCSS / Tailwind v4
├── playwright.config.ts            # Playwright configuration
├── netlify.toml                    # Netlify deployment & cache config
├── components.json                 # shadcn/ui CLI configuration
├── tsconfig.json                   # TypeScript compiler options
├── .env                            # Local environment variables (do not commit)
└── package.json                    # Dependencies & pnpm scripts
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ | Sanity dataset (e.g. `production`) |
| `AUTH_SECRET` | ✅ | Random secret for Auth.js JWT signing |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `NEXTAUTH_URL` | ✅ | Canonical URL of the app |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key (client) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key (server) |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Base URL used for Stripe redirect |
| `DELIVERY_FEE` | ✅ | Fixed delivery fee amount |
| `DELIVERY_FEE_THRESHOLD` | ✅ | Order total threshold for free delivery |

---

## Contributing

1. **Fork** the repository and **clone** your fork.

_Happy coding! 🎉_
