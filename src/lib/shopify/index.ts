import "server-only";

import {
  addToCartMutation,
  createCartMutation,
  removeFromCartMutation,
  updateCartLinesMutation,
} from "./mutations";
import {
  getAllProductHandlesQuery,
  getCartQuery,
  getProductByHandleQuery,
  getProductsQuery,
} from "./queries";
import type { Cart, CartLine, Connection, Product, ProductListItem, ShopifyErrorLike } from "./types";

// Server-only Shopify Storefront API client.
//
// This file is guarded by `server-only`, so importing it from a Client
// Component fails at build time. All product data fetching happens in React
// Server Components, so the Storefront token never reaches the browser.

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2025-01";
const publicToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

if (!domain) {
  throw new Error("Missing SHOPIFY_STORE_DOMAIN environment variable");
}
if (!publicToken) {
  throw new Error("Missing SHOPIFY_STOREFRONT_PUBLIC_TOKEN environment variable");
}

const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function shopifyFetch<T>({
  query,
  variables,
  tags,
  cache = "force-cache",
}: {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  cache?: RequestCache;
}): Promise<T> {
  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": publicToken as string,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache,
      // Next.js: allow on-demand revalidation via tags, and a sane default
      // time-based revalidation so storefront data doesn't go stale forever.
      next: { tags, revalidate: 60 },
    });

    const body = (await result.json()) as GraphQLResponse<T>;

    if (body.errors?.length) {
      throw new Error(body.errors.map((e) => e.message).join("\n"));
    }
    if (!result.ok || !body.data) {
      throw new Error(`Shopify Storefront API request failed with status ${result.status}`);
    }

    return body.data;
  } catch (error) {
    const shopifyError = error as ShopifyErrorLike;
    throw new Error(
      `Error fetching from Shopify Storefront API: ${shopifyError.message ?? "unknown error"}`
    );
  }
}

function flattenConnection<T>(connection: Connection<T> | undefined | null): T[] {
  return connection?.edges?.map((edge) => edge.node) ?? [];
}

export async function getProducts({
  first = 24,
  sortKey = "BEST_SELLING",
  reverse = false,
}: {
  first?: number;
  sortKey?: "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE" | "RELEVANCE";
  reverse?: boolean;
} = {}): Promise<ProductListItem[]> {
  const data = await shopifyFetch<{ products: Connection<ProductListItem> }>({
    query: getProductsQuery,
    variables: { first, sortKey, reverse },
    tags: ["products"],
  });

  return flattenConnection(data.products);
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ product: RawProduct | null }>({
    query: getProductByHandleQuery,
    variables: { handle },
    tags: [`product-${handle}`],
  });

  if (!data.product) return null;

  return {
    ...data.product,
    images: flattenConnection(data.product.images),
    variants: flattenConnection(data.product.variants),
  };
}

export async function getAllProductHandles(): Promise<string[]> {
  const data = await shopifyFetch<{ products: Connection<{ handle: string }> }>({
    query: getAllProductHandlesQuery,
  });

  return flattenConnection(data.products).map((p) => p.handle);
}

// The raw shape returned by getProductByHandleQuery before flattening its
// nested connections (images, variants).
type RawProduct = Omit<Product, "images" | "variants"> & {
  images: Connection<Product["images"][number]>;
  variants: Connection<Product["variants"][number]>;
};

// --- Cart -------------------------------------------------------------

// Thrown by the cart mutation helpers below. `cartNotFound` is set when
// Shopify returned a null cart for a mutation against an existing cart ID —
// the strongest signal that the cart has expired or been deleted, as
// opposed to a business error (e.g. insufficient stock) where Shopify still
// returns the (unchanged) cart alongside the userError.
export class ShopifyCartError extends Error {
  cartNotFound: boolean;

  constructor(message: string, cartNotFound = false) {
    super(message);
    this.name = "ShopifyCartError";
    this.cartNotFound = cartNotFound;
  }
}

type RawCart = Omit<Cart, "lines"> & { lines: Connection<CartLine> };
type UserError = { field?: string[] | null; message: string };

function reshapeCart(cart: RawCart): Cart {
  return { ...cart, lines: flattenConnection(cart.lines) };
}

function unwrapCartMutation(
  cart: RawCart | null,
  userErrors: UserError[] | undefined
): Cart {
  if (!cart) {
    const message = userErrors?.map((e) => e.message).join("\n") || "Cart not found.";
    throw new ShopifyCartError(message, true);
  }
  if (userErrors?.length) {
    throw new ShopifyCartError(userErrors.map((e) => e.message).join("\n"));
  }
  return reshapeCart(cart);
}

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[] = []
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: createCartMutation,
    variables: { lines },
    cache: "no-store",
  });

  return unwrapCartMutation(data.cartCreate.cart, data.cartCreate.userErrors);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: addToCartMutation,
    variables: { cartId, lines },
    cache: "no-store",
  });

  return unwrapCartMutation(data.cartLinesAdd.cart, data.cartLinesAdd.userErrors);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: updateCartLinesMutation,
    variables: { cartId, lines },
    cache: "no-store",
  });

  return unwrapCartMutation(data.cartLinesUpdate.cart, data.cartLinesUpdate.userErrors);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: RawCart | null; userErrors: UserError[] };
  }>({
    query: removeFromCartMutation,
    variables: { cartId, lineIds },
    cache: "no-store",
  });

  return unwrapCartMutation(data.cartLinesRemove.cart, data.cartLinesRemove.userErrors);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: RawCart | null }>({
    query: getCartQuery,
    variables: { cartId },
    cache: "no-store",
  });

  if (!data.cart) return null;
  return reshapeCart(data.cart);
}
