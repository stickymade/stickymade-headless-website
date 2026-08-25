import Link from "next/link";

import { OpenCartButton } from "@/components/cart/open-cart-button";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Stickymade
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:opacity-70">
            Shop
          </Link>
          <OpenCartButton />
        </nav>
      </div>
    </header>
  );
}
