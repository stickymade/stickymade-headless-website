"use client";

import { useCart } from "./cart-context";

export function OpenCartButton() {
  const { cart, openCart } = useCart();
  const quantity = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart${quantity > 0 ? `, ${quantity} item${quantity === 1 ? "" : "s"}` : ""}`}
      className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.98-4.706 2.545-7.187.075-.332-.174-.646-.517-.646H5.106M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        />
      </svg>
      {quantity > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white dark:bg-white dark:text-black">
          {quantity}
        </span>
      )}
    </button>
  );
}
