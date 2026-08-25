"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format-price";
import { addItem } from "@/lib/shopify/cart-actions";
import type { Product, ProductVariant } from "@/lib/shopify/types";

function findVariant(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>
): ProductVariant | undefined {
  return variants.find((variant) =>
    variant.selectedOptions.every((option) => selectedOptions[option.name] === option.value)
  );
}

export function ProductDetails({ product }: { product: Product }) {
  const { title, descriptionHtml, images, options, variants } = product;

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial = variants[0];
    return Object.fromEntries(
      (initial?.selectedOptions ?? []).map((option) => [option.name, option.value])
    );
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, startAdding] = useTransition();
  const { setCart, openCart } = useCart();

  const selectedVariant = useMemo(
    () => findVariant(variants, selectedOptions),
    [variants, selectedOptions]
  );

  const hasRealOptions = options.length > 0 && options.some((o) => o.name !== "Title");
  const activeImage = images[activeImageIndex] ?? images[0];

  function handleAddToCart() {
    if (!selectedVariant) return;
    setAddError(null);
    startAdding(async () => {
      const result = await addItem(selectedVariant.id, quantity);
      if ("cart" in result) {
        setCart(result.cart);
        openCart();
      } else {
        setAddError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-2">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText ?? title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/30 dark:text-white/30">
              No image
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-3">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-md bg-black/5 ring-1 dark:bg-white/5 ${
                  index === activeImageIndex
                    ? "ring-black dark:ring-white"
                    : "ring-transparent hover:ring-black/20 dark:hover:ring-white/20"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText ?? title}
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

        <div className="mt-2 text-lg">
          {selectedVariant ? (
            <div className="flex items-center gap-2">
              <span>{formatPrice(selectedVariant.price)}</span>
              {selectedVariant.compareAtPrice && (
                <span className="text-black/40 line-through dark:text-white/40">
                  {formatPrice(selectedVariant.compareAtPrice)}
                </span>
              )}
            </div>
          ) : (
            formatPrice(product.priceRange.minVariantPrice)
          )}
        </div>

        {hasRealOptions && (
          <div className="mt-6 space-y-5">
            {options.map((option) => (
              <div key={option.id}>
                <p className="mb-2 text-sm font-medium">{option.name}</p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const isSelected = selectedOptions[option.name] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))
                        }
                        className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                          isSelected
                            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-black/15 hover:border-black/40 dark:border-white/15 dark:hover:border-white/40"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 text-sm">
          {selectedVariant
            ? selectedVariant.availableForSale
              ? "In stock"
              : "Sold out"
            : "Select options"}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center rounded-md border border-black/15 dark:border-white/15">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-sm"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedVariant || !selectedVariant.availableForSale || isAdding}
            className="flex-1 rounded-md bg-black py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {isAdding
              ? "Adding…"
              : selectedVariant && !selectedVariant.availableForSale
                ? "Sold out"
                : "Add to cart"}
          </button>
        </div>
        {addError && <p className="mt-2 text-sm text-red-600">{addError}</p>}

        {descriptionHtml && (
          <div
            className="prose prose-sm mt-8 max-w-none prose-neutral dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}
      </div>
    </div>
  );
}
