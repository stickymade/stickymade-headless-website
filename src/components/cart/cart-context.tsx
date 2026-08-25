"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { Cart } from "@/lib/shopify/types";

type CartContextValue = {
  cart: Cart | null;
  setCart: (cart: Cart | null) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Hydrate from the `cartId` cookie on mount, via an API route rather than
  // a server-fetched prop, so the pages this provider wraps can stay
  // statically generated.
  useEffect(() => {
    let cancelled = false;

    fetch("/api/cart")
      .then((res) => res.json())
      .then((data: { cart: Cart | null }) => {
        if (!cancelled) setCart(data.cart);
      })
      .catch(() => {
        // Leave the cart empty; the next successful mutation will populate it.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
