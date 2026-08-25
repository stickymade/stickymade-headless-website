# Stickymade Storefront

A Next.js (App Router) storefront that pulls live product data from Shopify
via the [Storefront API](https://shopify.dev/docs/api/storefront).

- Homepage (`/`) — grid of products from the store, with images and prices.
- Product page (`/products/[handle]`) — gallery, description, price, and
  variant option selection, all statically generated per product at build
  time (`generateStaticParams`) and revalidated every 60 seconds.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Shopify credentials:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   | --- | --- |
   | `SHOPIFY_STORE_DOMAIN` | Your store's `*.myshopify.com` domain, no protocol. |
   | `SHOPIFY_STOREFRONT_API_VERSION` | Storefront API version, e.g. `2025-01`. |
   | `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | Storefront API public access token. |
   | `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Storefront API private (delegate) access token. Not used by default — reserved for server-only calls that need elevated access. |

   `.env.local` is gitignored and never committed. When deploying (Vercel,
   etc.), set the same variables in that platform's environment variable
   settings instead of committing them anywhere.

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## How the Shopify integration is structured

All Storefront API calls live in [`src/lib/shopify`](src/lib/shopify) and are
guarded with the [`server-only`](https://www.npmjs.com/package/server-only)
package, so that code can only run in Server Components / server contexts —
it will fail to build if ever imported into a Client Component. Combined with
data fetching happening exclusively in `async` Server Components
(`src/app/page.tsx`, `src/app/products/[handle]/page.tsx`), the Storefront
API tokens never reach the browser.

- `src/lib/shopify/index.ts` — `shopifyFetch`, `getProducts`,
  `getProductByHandle`, `getAllProductHandles`.
- `src/lib/shopify/queries.ts` / `fragments.ts` — the GraphQL documents.
- `src/lib/shopify/types.ts` — types for the fields this app queries.

### Public vs. private token

Shopify issues two kinds of Storefront API tokens:

- **Public token** — meant to be safe for client-side use. This app uses it
  for all product queries, sent from the server via the standard
  `X-Shopify-Storefront-Access-Token` header.
- **Private (delegate) token** — a server-only token for elevated,
  unauthenticated Storefront API access (e.g. reading unpublished content).
  It's wired up as an env var (`SHOPIFY_STOREFRONT_PRIVATE_TOKEN`) but not
  called anywhere yet. If you need it later, use it only from server code and
  never prefix it with `NEXT_PUBLIC_`.

Neither token is prefixed with `NEXT_PUBLIC_`, since every Shopify call in
this app happens server-side — there's no reason to expose either token to
the browser.

## Project structure

```
src/
  app/
    page.tsx                 Homepage — product grid
    products/[handle]/page.tsx  Product detail page
  components/
    header.tsx, footer.tsx
    product-card.tsx         Grid item on the homepage
    product-details.tsx      Gallery + variant selector (client component)
  lib/
    shopify/                 Storefront API client, queries, types
    format-price.ts          Intl currency formatting helper
```

## Build

```bash
npm run build
npm run start
```

`next build` statically generates a page for every product handle at build
time and revalidates in the background every 60 seconds (ISR), so new
products or price changes in Shopify show up without a full redeploy.
