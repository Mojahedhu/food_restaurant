# Summary of the Refactoring Roadmap (6 sequential plans):

## Feature Plan 1: Menu Catalog (/menu):

Decouple client-side Sanity fetches and manual DOM observers into a Server Action (client-menu.ts) and a clean custom hook (useMenuCatalog.ts), leaving the component strictly presentational.

## Feature Plan 2: Food Detail & Reviews (/food/[slug]):

Migrate review additions, reactions, and metrics to secure server actions with optimistic UI state updates.

## Feature Plan 3:

Shopping Cart (/cart):
Separate state sync hooks (Zustand) from the card display components.

## Feature Plan 4:

Checkout Pipeline (/checkout):
Secure price integrity by retrieving product pricing strictly from the server-side database.

## Feature Plan 5:

User Dashboards (/user/\*):
Decouple profiles, address CRUD forms, and tracking status logic.

## Feature Plan 6:

Blog & Static Routes (/blog, /about):
Refactor layouts to ensure total visual stability and optimize route transitions.
