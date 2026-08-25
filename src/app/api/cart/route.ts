import { NextResponse } from "next/server";

import { getCart } from "@/lib/shopify/cart-actions";

// Reads the cart via the `cartId` cookie. Kept as its own route (rather than
// fetching the cart in the root layout) so product/home pages can stay
// statically generated — only this endpoint, and the cart mutation actions,
// touch cookies and run dynamically per-request.
export async function GET() {
  const cart = await getCart();
  return NextResponse.json({ cart });
}
