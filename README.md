This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
food_app
├─ .npmrc
├─ auth.ts
├─ backup.tar.gz
├─ components.json
├─ dist
├─ eslint.config.mjs
├─ info.md
├─ netlify.toml
├─ next-auth.d.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ pnpm-lock.yaml
├─ postcss.config.mjs
├─ proxy.ts
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ grid.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ sanity.cli.ts
├─ sanity.config.ts
├─ sanity.types.ts
├─ schema.json
├─ scripts
│  └─ generate.ts
├─ src
│  ├─ app
│  │  ├─ (client)
│  │  │  ├─ cart
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ menu
│  │  │  │  ├─ menu-client.tsx
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  ├─ (dashboard)
│  │  ├─ actions
│  │  │  └─ address.ts
│  │  ├─ admin
│  │  │  └─ page.tsx
│  │  ├─ api
│  │  │  └─ auth
│  │  │     ├─ signup
│  │  │     │  └─ route.ts
│  │  │     └─ [...nextauth]
│  │  │        └─ route.ts
│  │  ├─ auth
│  │  │  ├─ error
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ signin
│  │  │  │  └─ page.tsx
│  │  │  └─ signup
│  │  │     └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ not-found.tsx
│  │  └─ studio-quick-food
│  │     └─ [[...tool]]
│  │        └─ page.tsx
│  ├─ components
│  │  ├─ cart
│  │  │  ├─ cartItems.tsx
│  │  │  ├─ cartLayout.tsx
│  │  │  ├─ cartSummaryWrapper.tsx
│  │  │  └─ clearAlertDialog.tsx
│  │  ├─ common
│  │  │  ├─ animatedButton.tsx
│  │  │  ├─ breadcrumb.tsx
│  │  │  ├─ container.tsx
│  │  │  ├─ foodCardSkeleton.tsx
│  │  │  ├─ header.tsx
│  │  │  ├─ logo.tsx
│  │  │  ├─ searchModel.tsx
│  │  │  └─ UserMenu.tsx
│  │  ├─ featuredPost
│  │  │  ├─ blogCard.tsx
│  │  │  └─ featuredPost.tsx
│  │  ├─ foods
│  │  │  ├─ addToCart.tsx
│  │  │  ├─ categories.tsx
│  │  │  ├─ foodCards.tsx
│  │  │  ├─ priceFormatter.tsx
│  │  │  └─ starRating.tsx
│  │  ├─ hero
│  │  │  └─ heroUi.tsx
│  │  ├─ home
│  │  │  ├─ featuredFoods.tsx
│  │  │  ├─ featuredRestaurants.tsx
│  │  │  ├─ footer.tsx
│  │  │  ├─ hero.tsx
│  │  │  └─ howItWorks.tsx
│  │  ├─ products
│  │  └─ ui
│  │     ├─ alert-dialog.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ carousel.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ dialog.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ select.tsx
│  │     ├─ separator.tsx
│  │     ├─ sheet.tsx
│  │     ├─ sonner.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     └─ textarea.tsx
│  ├─ constants
│  │  └─ statics.ts
│  ├─ features
│  │  └─ address
│  │     ├─ components
│  │     │  └─ addressSheet.tsx
│  │     ├─ hook
│  │     │  └─ useAddress.ts
│  │     ├─ store
│  │     │  └─ addressStore.ts
│  │     └─ types
│  │        └─ type.ts
│  ├─ images
│  │  └─ logo.png
│  ├─ lib
│  │  ├─ handleError.ts
│  │  ├─ query.ts
│  │  ├─ sanityFunctions.ts
│  │  └─ utils.ts
│  ├─ provider
│  │  └─ auth-provider.tsx
│  └─ sanity
│     ├─ env.ts
│     ├─ lib
│     │  ├─ client.ts
│     │  ├─ image.ts
│     │  └─ live.ts
│     ├─ schemaTypes
│     │  ├─ address.ts
│     │  ├─ author.ts
│     │  ├─ authorType.ts
│     │  ├─ banner.ts
│     │  ├─ blockContentType.ts
│     │  ├─ blogCategory.ts
│     │  ├─ category.ts
│     │  ├─ categoryType.ts
│     │  ├─ food.ts
│     │  ├─ foodVariety.ts
│     │  ├─ index.ts
│     │  ├─ ingredient.ts
│     │  ├─ menu.ts
│     │  ├─ openingHours.ts
│     │  ├─ order.ts
│     │  ├─ orderStatus.ts
│     │  ├─ post.ts
│     │  ├─ postType.ts
│     │  ├─ restaurant.ts
│     │  ├─ review.ts
│     │  ├─ size.ts
│     │  ├─ user.ts
│     │  └─ userRole.ts
│     └─ structure.ts
├─ stores
│  └─ cartStore.ts
├─ tsconfig.json
└─ types
   └─ sanityTypes.ts

```