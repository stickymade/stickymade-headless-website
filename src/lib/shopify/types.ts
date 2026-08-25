// Minimal types covering the fields this app actually queries from the
// Shopify Storefront API. Not a full schema mirror.

export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
};

export type ProductListItem = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
};

export type Product = ProductListItem & {
  descriptionHtml: string;
  images: ShopifyImage[];
  variants: ProductVariant[];
  options: { id: string; name: string; values: string[] }[];
};

export type Edge<T> = { node: T };
export type Connection<T> = { edges: Edge<T>[] };

export type ShopifyErrorLike = {
  status?: number;
  message?: string;
};

export type CartMerchandise = {
  id: string;
  title: string;
  price: Money;
  selectedOptions: { name: string; value: string }[];
  product: {
    title: string;
    handle: string;
    featuredImage: ShopifyImage | null;
  };
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: CartMerchandise;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: CartLine[];
};
