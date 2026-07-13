# Core Developer Rules & Safeguards

You must follow these strict guidelines for every single code generation task in this project to ensure safety, eliminate runtime crashes, enforce bulletproof security, and maintain a beginner-friendly developer experience.

## 1. Zero-Trust Server-Side Architecture & Security

- **Absolute Backend Enforcement:** Handle all database operations, write actions, access permissions, and core business logic strictly on the server (e.g., Next.js Server Actions, Route Handlers, or database-level access policies).
- **The Client Is Untrusted:** Never rely on the client frontend to validate data, enforce pricing tiers, or verify permissions. Client-side visibility flags (e.g., hiding a button based on a user role) are strictly for UX, never for security.
- **Database Write & API Token Isolation:** Keep all private API secrets, database write tokens, and client configurations securely on the server. All database mutations (inserts, updates, deletes) must execute in secure server-side scopes (like Server Actions or Route Handlers) and must always authenticate the user's session and verify permissions before execution.
- **Database-Level Row Security (RLS):** If using SQL/Relational databases (such as Supabase), always enable Row-Level Security (RLS) on every table. Never expose high-privileged credentials (like the `service_role` key) to client-facing environments.
- **Environment Variable & Secret Hygiene:** Strictly segregate client-exposed variables from private server secrets. Never prefix database write credentials, private gateway tokens, or encryption keys with `NEXT_PUBLIC_` to guarantee they are never bundled into the client-side JavaScript payload.
- **Payment & Checkout Price Integrity:** Never trust client-side calculations, prices, or basket totals when creating checkout sessions for payment providers (like Stripe). Always fetch the latest pricing directly from the database of record on the server, calculate the true total on the server, and pass that total to the payment processor to prevent user-tampered pricing attacks.

## 2. Strict Input Validation & Data Sanitization

- **Compile-Time & Runtime Safety with Zod:** Every Server Action or API endpoint must explicitly validate its incoming payload using a strict **Zod schema** before executing any logic.
- **Type Coercion Prevention:** Parse inputs completely via `.safeParse()` rather than using `.parse()` to prevent unhandled runtime parsing crashes.
- **Cross-Site Scripting (XSS) Mitigation:** Sanitize text inputs containing rich HTML strings before rendering them or saving them to the database. For pure text strings, enforce strict character escaping or structural matching inside your Zod schemas.

## 3. Defense-in-Depth: Error Handling & Security Obfuscation

- **Isolate Technical Logs:** Every backend utility, wrapper function, or Server Action must be protected by a `try/catch` block. Log raw, granular technical errors (`error.message`, stack traces) exclusively to the secure server console via `console.error()`.
- **Data Leak Isolation:** Return a standard, production-safe error contract to the frontend interface. Never leak raw database queries, schema configurations, or dependency exceptions to the client interface.

## 4. Frontend Resilience & Crash Elimination

- **Total Optional Chaining:** Protect components handling dynamic database results or real-time webhooks using strict optional chaining (`?.`) on all deep object hierarchies (e.g., `invoice?.client?.profile?.email`).
- **Default State Assurances:** Always pair optional chains with logical fallback defaults (`||` or `??`) to maintain clean layouts under `null` or `undefined` conditions.
- **Map Safety:** Never invoke arrays or listing operations without a fallback. Protect loops using inline array guarantees or clear conditional guards:
  ```tsx
  {
    (items || []).map((item) => <Card key={item.id} />);
  }
  ```

## 5. UI/UX Excellence & State Synchronization

- **Optimistic UI Updates:** Use React hooks like `useOptimistic` to immediately mirror mutation successes on high-frequency UI items (e.g., toggling a checkbox, adding a task comment) to make the app feel instantaneous.
- **Explicit Loading & Empty States:** Every interactive component or data-table container must supply an explicit skeleton screen or loading state. If a dataset returns empty, display an instructive, accessible empty-state layout with a primary Call-to-Action (CTA) rather than leaving a blank screen.
- **Debounced High-Frequency Actions:** Debounce search inputs, auto-save textareas, or live filters to reduce server burden and minimize erratic layout flickering during fast typing.
- **Polished Form UX:** Disable submit buttons instantly upon form submission to prevent accidental double-posts, and map Zod validation errors directly to their respective input fields inline using readable typography.
- **Fluid Route & Component Transitions:** Apply Tailwind CSS transition and transform utilities (transition-all duration-300 ease-in-out) alongside entry/exit states (e.g., shifting from opacity-0 translate-x-4 to opacity-100 translate-x-0) to eliminate abrupt layout snaps. For view-level navigation, ensure components gracefully animate out before new content animates in to maintain visual continuity and spatial awareness for the user.
- **Layout Shift Prevention:** Apply fixed aspect ratios, explicit min-height values, or layout-stability CSS properties (e.g., font-size-adjust, aspect-ratio) to critical elements like images, ads, and dynamic content containers to prevent layout shifts that disrupt the user's visual flow.
- **List Pagination & Scrolling Strategy:** Prioritize URL-driven, numbered pagination (using the `usePagination` hook blueprint in [pagination_strategy.md](file:///C:/Users/user/.gemini/antigravity/brain/bae65924-ba20-4d0c-883d-6ed291dca26f/pagination_strategy.md)) for admin tables, search result lists, and item managers. For endless feeds or continuous consumer catalog browsing, performant infinite scrolling is permitted.
  - **Numbered Pagination Baseline:** Synchronize page states with URL search parameters (`?page=`) to ensure shareable links, reliable browser history back-navigation, and Zero-CLS render behavior.
  - **Infinite Scroll Exception Guard:** When infinite lists are explicitly required, use Intersection Observer on a bottom sentinel element with a loading lock (`isFetchingNextPage`).
  - **DOM Virtualization:** For lists projecting more than 100 concurrent items, implement row/grid virtualization (e.g., TanStack Virtual) to mount only viewport-visible elements, keeping the DOM node count stable.
- **SEO, Accessibility (a11y) & Semantic HTML:** Every page route must export a descriptive Next.js metadata configuration (descriptive title and description). Use semantic HTML5 layout tags (`<main>`, `<header>`, `<footer>`, `<aside>`, `<section>`) and maintain a strict heading hierarchy (exactly one `<h1>` per page). Ensure interactive controls have readable labels and unique element `id` parameters to facilitate automated end-to-end browser testing and accessibility compliance.

## 6. Type Cleanliness & Code Simplicity

- **Zero Implicit `any` Allowances:** Keep the TypeScript compiler flags strict (`noImplicitAny: true`). If a variable structure is unpredictable or dynamic, explicitly assign it an `unknown` or record structure and narrow the type before processing (dont use `any` at all).
- **Keep Component Complexity Low:** Avoid deep, nested utility architectures. Keep UI files modular, atomic, and focused on rendering single concepts so that onboarding developers can easily read, modify, and manage features without battling state entanglement.
- **Official Third-Party Types Only:** Always use official types from external libraries for type definitions. Do not define or duplicate third-party library types locally. Import them directly from the official dependency module package to ensure total cross-version synchronization. _Exception Guard:_ If a library has missing, broken, or unexported types, declare a clean, scoped type definition locally or use safe type narrowing (`unknown` paired with assertions) instead of blocking compilation or resorting to raw `any` tags.

## 7. Architecture & Code Cleanliness (React/Next.js Optimized)

- **Strict Separation of Concerns & Modular Architecture:** Enforce a strict decoupling of UI, logic, data, and types. A single component file must only manage layout and presentation.
  - **UI/Presentation:** Keep JSX/TSX lean; delegate all complex state, side effects, and event handlers to dedicated **Custom Hooks** (e.g., `useTaskManager`). _Boilerplate Guard:_ Progressive abstraction is preferred. For simple UI components (under 50 lines with basic local toggles), keeping state inline is allowed. Abstract into a custom hook only when the component handles asynchronous fetches, side-effects, or complex business logic.
  - **Data Layer & Utils:** Isolate API fetching, data mutations, and heavy business logic into separate service modules, server actions, or utility files.
  - **Type Definitions:** Extract TypeScript interfaces and types into localized or global `.types.ts` files rather than inlining them.
  - **Helper Function Classification:** Classify and separate helpers based on side-effects:
    - **Pure Helper Functions (Calculations, Formatting):** Place in `src/lib/utils/` (e.g., `src/lib/utils/review-helpers.ts` for feature-specific or `helpers.ts` for global). They must have zero side-effects and be easily unit-tested.
    - **Outer Effect Helpers (Reads/API Queries):** Place in `src/lib/data/` (e.g., `src/lib/data/review.ts` for GROQ read fetches).
    - **Outer Effect Write Actions (Mutations/Transactions):** Place in `src/actions/` (e.g., `src/actions/client-reviews.ts` for Server Actions).
  - **Maximized Reusability:** Break down large component trees into highly atomized, pure, and reusable UI components. If a logic block or utility function is used more than once (or exceeds 20 lines), abstract it.
  - **Do not put everything in one file:** create clean code and well-organized files structure. keep files small and focused on a single responsibility.split large components into smaller, reusable components. Keep components small, focused, and easy to reason about. Avoid deep nesting and unnecessary abstractions.
  - **Prop Drilling Elimination (The Next.js Way):** Absolutely minimize passing state setters, modal visibility flags, and mutation functions down the component tree (prop drilling).
    - **URL-Driven UI State:** For shared UI states (like opening an edit modal), avoid using `useState` in a parent component. Instead, push parameters to the URL (e.g., `?editReview=123`). Modals and components should independently read the URL search parameters to derive their visibility, preserving browser history and refresh-resilience.
    - **Self-Sufficient Mutations:** Do not pass mutation functions (like `onDelete`) down from parent lists to children. Child components (or their custom hooks) should independently invoke their own mutation hooks to remain highly cohesive and decoupled.
  - **No Module Contamination (Server/Client Boundary Isolation):** Never import runtime values, constants, or functions from a Server-only file (like `src/lib/data/` or files using backend-only utilities) into a Client Component or Hook. Doing so forces Next.js to bundle and evaluate the server module in the browser, causing immediate runtime crashes (e.g., exposing Node.js APIs or crashing on server-side functions like `defineLive()`). 
    - **Type-Only Imports:** If you must share a TypeScript type or interface from a Server file to a Client file, you must strictly use `import type { ... }` so the import is safely erased during compilation.
    - **Shared Constants:** If you need to share hardcoded values (like pagination limits) between Server and Client, extract them into a separate, isolated `constants.ts` file that contains absolutely zero server-side dependencies or database imports.

## 8. Caching & Data Consistency (Next.js Revalidation)

- **Explicit Cache Revalidation:** Always pair backend mutations (like creating an order, updating a product, or submitting a review) with explicit server-side revalidation triggers (`revalidateTag()` or `revalidatePath()`). This ensures Next.js cache layers are immediately invalidated and fresh data is served, preventing stale state synchronization issues across the client and admin views.

## 9. Design System Adherence (CSS Variable Alignment)

- **Consistent Design Token Usage:** Always leverage the design tokens, colors (oklch/hsl variables), sizing parameters, radii, and utility classes defined in the global stylesheet ([globals.css](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/globals.css)). Do not introduce ad-hoc values, hardcoded hexadecimal colors, or raw spacing variables directly inside UI components. If a style or theme constant is missing from the global token system, extend [globals.css](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/globals.css) within the `@theme` block rather than writing local overrides.

## 10. Dependency Version Alignment & Deprecation Safeguards

- **Strict Dependency Mapping:** Always write code, hooks, and API integrations that match the exact version of the active dependencies listed in `package.json` (such as Next.js 16.x, React 19.x, Sanity v5, Recharts v3, etc.). Do not use deprecated methods, obsolete properties, or outdated lifecycle adapters. Prior to writing code, inspect the official library typings and documentation to verify that our solutions conform to current, supported APIs, preventing future warning spam and deprecation failures.
