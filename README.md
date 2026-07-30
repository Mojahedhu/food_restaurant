# Food App

**A modern, premium‑quality restaurant ordering web application**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#) [![Next Version](https://img.shields.io/badge/next%20version-1.0.0-blue)](#) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](#) [![Package Manager: pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.6-blueviolet)](#)

---

## Overview & Features

Food App is a full‑stack, **React‑based** web experience that lets customers browse menus, place orders, and track delivery in real time. It is built with **Next.js 16 (App Router)**, **Tailwind‑CSS**, and **TypeScript**, delivering a fast, SEO‑friendly, and highly interactive UI.

**Key features**

- 📱 **Responsive, glass‑morphic UI** with vibrant gradients and smooth micro‑animations.
- 🍽️ **Dynamic menu & categorisation** powered by a RESTful API.
- 🛒 **Cart & checkout flow** with Stripe integration (placeholder).
- 📍 **Geolocation‑aware restaurant selection**.
- 🔐 **Secure auth** via NextAuth (email + OAuth).
- 🚀 **Instant loading** via Next.js Server Components & Edge caching.
- 📊 **Analytics hooks** ready for Google Analytics / Vercel Analytics.

---

## Architecture & Tech Stack

| Layer                | Technology                               | Reason for Choice                                                                                           |
| -------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Framework**        | **Next.js 16 (App Router)**              | File‑based routing, server‑side rendering, built‑in image optimisation, and excellent developer experience. |
| **Language**         | **TypeScript 5**                         | Strong typing improves maintainability and catches bugs at compile time.                                    |
| **Styling**          | **Tailwind‑CSS v4** + **CSS Modules**    | Utility‑first approach enables rapid UI iteration while keeping CSS size low.                               |
| **State Management** | **Zustand** (lightweight)                | Simple, performant global store for cart & user session.                                                    |
| **Authentication**   | **NextAuth.js**                          | Extensible, supports email magic links and OAuth providers out‑of‑the‑box.                                  |
| **Payments**         | **Stripe (test mode)**                   | Industry‑standard payment processing, easy to swap for real gateway later.                                  |
| **Testing**          | **Jest + React Testing Library**         | Unit & component testing with snapshot & DOM assertions.                                                    |
| **CI/CD**            | **GitHub Actions**                       | Automated lint, test, and build pipelines for every PR.                                                     |
| **Deployment**       | **Vercel** (or any Node‑compatible host) | Optimised for Next.js edge functions and zero‑config builds.                                                |

---

## Prerequisites

| Requirement                           | Minimum Version |
| ------------------------------------- | --------------- |
| **Node.js**                           | 20.x (LTS)      |
| **pnpm**                              | 8.6.x           |
| **Git**                               | 2.40.x          |
| **Docker** _(optional, for local DB)_ | 24.x            |

> **NOTE**  
> If you have `corepack` enabled, you can run `corepack enable && corepack prepare pnpm@latest --activate` to install the correct pnpm version automatically.

---

## Getting Started & Quick Start

```bash
# 1️⃣ Clone the repository
git clone https://github.com/your‑org/food‑app.git
cd food-app

# 2️⃣ Install dependencies via pnpm
pnpm install

# 3️⃣ Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Stripe / NextAuth keys

# 4️⃣ Run the development server
pnpm dev
```

Open **http://localhost:3000** in your browser – the app should load with hot‑module reloading.

### Running the Project

| Mode                 | Command                    | Description                                    |
| -------------------- | -------------------------- | ---------------------------------------------- |
| **Development**      | `pnpm dev`                 | Starts Next.js in watch mode (localhost 3000). |
| **Production Build** | `pnpm build && pnpm start` | Builds the app and runs the Node server.       |
| **Linting**          | `pnpm lint`                | Runs ESLint + Prettier checks.                 |
| **Testing**          | `pnpm test`                | Executes Jest test suite.                      |
| **Type‑checking**    | `pnpm tsc`                 | Runs the TypeScript compiler in `noEmit` mode. |

---

## Available Scripts

| Script         | pnpm Command                         | Purpose                                |
| -------------- | ------------------------------------ | -------------------------------------- |
| **dev**        | `pnpm dev`                           | Start dev server with hot‑reload.      |
| **build**      | `pnpm build`                         | Compile the app for production.        |
| **start**      | `pnpm start`                         | Run the compiled production server.    |
| **lint**       | `pnpm lint`                          | Lint source files (ESLint + Prettier). |
| **test**       | `pnpm test`                          | Run unit & integration tests.          |
| **type-check** | `pnpm tsc`                           | Validate TypeScript types only.        |
| **prepare**    | `pnpm install && pnpm husky install` | Set up Git hooks (husky).              |

---

## Project Folder Structure

```
food-app/
├─ .github/                # GitHub Actions workflows
├─ .husky/                 # Pre‑commit hooks
├─ public/                 # Static assets (favicons, images)
├─ src/
│  ├─ app/                 # Next.js App Router entry points
│  │   ├─ layout.tsx
│  │   └─ page.tsx
│  ├─ components/          # Re‑usable UI components
│  ├─ hooks/               # Custom React hooks
│  ├─ lib/                 # Utility libraries (api clients, helpers)
│  ├─ styles/              # Tailwind config & global CSS
│  └─ types/               # Shared TypeScript interfaces
├─ prisma/                 # (Optional) Prisma schema for DB
├─ tests/                  # Jest test files
├─ .env.example            # Sample environment file
├─ next.config.mjs         # Next.js configuration
├─ tailwind.config.cjs     # Tailwind configuration
├─ tsconfig.json           # TypeScript config
└─ package.json            # pnpm scripts & dependencies
```

---

## Contributing & License

> **IMPORTANT**  
> All contributions are welcomed! Please follow the steps below to ensure a smooth workflow.

### How to contribute

1. **Fork** the repository and **clone** your fork.
2. **Create a feature branch**: `git checkout -b feat/your‑feature`.
3. **Install dependencies** (see _Getting Started_).
4. **Make your changes** – keep the code style consistent (`pnpm lint`).
5. **Add tests** for new functionality.
6. **Run the full test suite**: `pnpm test && pnpm lint`.
7. **Commit** using the **Conventional Commits** format.
8. **Open a Pull Request** against the `main` branch.
9. The CI pipeline will automatically run checks; address any feedback.

### Code of Conduct

We adhere to the **Contributor Covenant v2.1**. By participating, you agree to uphold a respectful and inclusive environment.

### License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full terms.

---

_Happy coding! 🎉_
