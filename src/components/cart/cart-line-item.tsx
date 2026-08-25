"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

import { formatPrice } from "@/lib/format-price";
import { removeItem, updateItemQuantity } from "@/lib/shopify/cart-actions";
import type { CartLine } from "@/lib/shopify/types";

import { useCart } from "./cart-context";

export function CartLineItem({ line }: { line: CartLine }) {
  const { setCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { merchandise, quantity, cost } = line;
  const variantTitle = merchandise.title !== "Default Title" ? merchandise.title : null;

  function changeQuantity(nextQuantity: number) {
    setError(null);
    startTransition(async () => {
      const result = await updateItemQuantity(line.id, nextQuantity);
      if ("cart" in result) {
        setCart(result.cart);
      } else {
        setError(result.error);
      }
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeItem(line.id);
      if ("cart" in result) {
        setCart(result.cart);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <li className={`flex gap-4 py-4 transition-opacity ${isPending ? "opacity-50" : ""}`}>
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
        {merchandise.product.featuredImage ? (
          <Image
            src={merchandise.product.featuredImage.url}
            alt={merchandise.product.featuredImage.altText ?? merchandise.product.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{merchandise.product.title}</p>
            {variantTitle && (
              <p className="text-xs text-black/50 dark:text-white/50">{variantTitle}</p>
            )}
          </div>
          <p className="whitespace-nowrap text-sm font-medium">{formatPrice(cost.totalAmount)}</p>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center rounded-md border border-black/15 dark:border-white/15">
            <button
              type="button"
              disabled={isPending}
              onClick={() => changeQuantity(quantity - 1)}
              className="px-2 py-1 text-sm disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => changeQuantity(quantity + 1)}
              className="px-2 py-1 text-sm disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handleRemove}
            className="text-xs text-black/50 underline hover:text-black disabled:opacity-40 dark:text-white/50 dark:hover:text-white"
          >
            Remove
          </button>
        </div>

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </li>
  );
}
