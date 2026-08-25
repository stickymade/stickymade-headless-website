import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/shopify";

export default async function HomePage() {
  const products = await getProducts({ first: 24 });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Shop all</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No products found. Make sure your Shopify store has published products
          available to the Storefront API.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
