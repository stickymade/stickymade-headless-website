import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/format-price";
import type { ProductListItem } from "@/lib/shopify/types";

export function ProductCard({ product }: { product: ProductListItem }) {
  const { handle, title, featuredImage, priceRange, availableForSale } = product;

  return (
    <Link href={`/products/${handle}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.altText ?? title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-black/30 dark:text-white/30">
            No image
          </div>
        )}
        {!availableForSale && (
          <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-1 text-xs text-white dark:bg-white/80 dark:text-black">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-black/60 dark:text-white/60">
          {formatPrice(priceRange.minVariantPrice)}
        </p>
      </div>
    </Link>
  );
}
