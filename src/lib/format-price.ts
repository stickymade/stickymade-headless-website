import type { Money } from "@/lib/shopify/types";

export function formatPrice({ amount, currencyCode }: Money): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(Number(amount));
}
