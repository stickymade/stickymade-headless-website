"use server";

import { cookies } from "next/headers";

import {
  addToCart as shopifyAddToCart,
  createCart as shopifyCreateCart,
  getCart as shopifyGetCart,
  removeFromCart as shopifyRemoveFromCart,
  ShopifyCartError,
  updateCart as shopifyUpdateCart,
} from "./index";
import type { Cart } from "./types";

// Server Actions for the cart. These are the only places that read/write
// the `cartId` cookie and the only entry points Client Components call
// directly (via src/components/cart). All actual Storefront API calls stay
// in src/lib/shopify/index.ts.

const CART_COOKIE = "cartId";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function readCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value;
}

async function writeCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

async function clearCartId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await readCartId();
  if (!cartId) return null;

  const cart = await shopifyGetCart(cartId);
  if (!cart) {
    // Cart expired or was deleted on Shopify's side — stop pointing at it.
    await clearCartId();
    return null;
  }
  return cart;
}

export async function addItem(
  merchandiseId: string,
  quantity: number = 1
): Promise<{ cart: Cart } | { error: string }> {
  if (!merchandiseId) return { error: "Missing product variant." };

  try {
    const cartId = await readCartId();
    let cart: Cart | null = null;

    if (cartId) {
      try {
        cart = await shopifyAddToCart(cartId, [{ merchandiseId, quantity }]);
      } catch (err) {
        // Only recover by starting a new cart if the existing one is
        // actually gone. A real business error (e.g. out of stock) should
        // surface to the user, not be silently swallowed.
        if (!(err instanceof ShopifyCartError && err.cartNotFound)) throw err;
      }
    }

    if (!cart) {
      cart = await shopifyCreateCart([{ merchandiseId, quantity }]);
    }

    await writeCartId(cart.id);
    return { cart };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add item to cart." };
  }
}

export async function updateItemQuantity(
  lineId: string,
  quantity: number
): Promise<{ cart: Cart } | { error: string }> {
  try {
    const cartId = await readCartId();
    if (!cartId) return { error: "Your cart could not be found." };

    const cart =
      quantity <= 0
        ? await shopifyRemoveFromCart(cartId, [lineId])
        : await shopifyUpdateCart(cartId, [{ id: lineId, quantity }]);

    return { cart };
  } catch (err) {
    if (err instanceof ShopifyCartError && err.cartNotFound) {
      await clearCartId();
      return { error: "Your cart has expired. Please add items again." };
    }
    return { error: err instanceof Error ? err.message : "Could not update item." };
  }
}

export async function removeItem(lineId: string): Promise<{ cart: Cart } | { error: string }> {
  try {
    const cartId = await readCartId();
    if (!cartId) return { error: "Your cart could not be found." };

    const cart = await shopifyRemoveFromCart(cartId, [lineId]);
    return { cart };
  } catch (err) {
    if (err instanceof ShopifyCartError && err.cartNotFound) {
      await clearCartId();
      return { error: "Your cart has expired. Please add items again." };
    }
    return { error: err instanceof Error ? err.message : "Could not remove item." };
  }
}

// Returns Shopify's hosted checkout URL for the current cart rather than
// redirecting server-side: checkoutUrl points at an external domain
// (myshopify.com), and a plain client-side `window.location` navigation is
// the reliable way to send the browser there — no custom checkout/payment
// handling happens in this app.
export async function checkout(): Promise<{ url: string } | { error: string }> {
  const cartId = await readCartId();
  if (!cartId) return { error: "Your cart is empty." };

  const cart = await shopifyGetCart(cartId);
  if (!cart) {
    await clearCartId();
    return { error: "Your cart could not be found." };
  }
  if (cart.lines.length === 0) {
    return { error: "Your cart is empty." };
  }

  return { url: cart.checkoutUrl };
}
