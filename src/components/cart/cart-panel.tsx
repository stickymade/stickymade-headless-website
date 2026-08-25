"use client";

import { useState, useTransition } from "react";

import { formatPrice } from "@/lib/format-price";
import { checkout } from "@/lib/shopify/cart-actions";

import { CartLineItem } from "./cart-line-item";
import { useCart } from "./cart-context";

export function CartPanel() {
  const { cart, isOpen, closeCart } = useCart();
  const [isCheckingOut, startCheckout] = useTransition();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const lines = cart?.lines ?? [];

  function handleCheckout() {
    setCheckoutError(null);
    startCheckout(async () => {
      const result = await checkout();
      if ("url" in result) {
        window.location.href = result.url;
      } else {
        setCheckoutError(result.error);
      }
    });
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close cart"
          onClick={closeCart}
          className="fixed inset-0 z-40 bg-black/30"
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 dark:bg-black ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-white/10">
          <h2 className="text-base font-semibold">Cart</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="text-2xl leading-none text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 text-center">
            <p className="text-sm text-black/60 dark:text-white/60">Your cart is empty.</p>
            <button type="button" onClick={closeCart} className="text-sm underline">
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-black/10 overflow-y-auto px-5 dark:divide-white/10">
              {lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </ul>

            <div className="border-t border-black/10 px-5 py-4 dark:border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-black/60 dark:text-white/60">Subtotal</span>
                <span>{cart && formatPrice(cart.cost.subtotalAmount)}</span>
              </div>
              <div className="mt-1 flex justify-between text-base font-medium">
                <span>Total</span>
                <span>{cart && formatPrice(cart.cost.totalAmount)}</span>
              </div>

              <button
                type="button"
                disabled={isCheckingOut}
                onClick={handleCheckout}
                className="mt-4 w-full rounded-md bg-black py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
              >
                {isCheckingOut ? "Redirecting…" : "Checkout"}
              </button>
              {checkoutError && (
                <p className="mt-2 text-center text-xs text-red-600">{checkoutError}</p>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
