import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetails } from "@/components/product-details";
import { getAllProductHandles, getProductByHandle } from "@/lib/shopify";

export async function generateStaticParams() {
  const handles = await getAllProductHandles();
  return handles.map((handle) => ({ handle }));
}

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) return {};

  return {
    title: `${product.title} | Stickymade`,
    description: product.description,
    openGraph: product.featuredImage
      ? {
          images: [
            {
              url: product.featuredImage.url,
              width: product.featuredImage.width,
              height: product.featuredImage.height,
              alt: product.featuredImage.altText ?? product.title,
            },
          ],
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  return <ProductDetails product={product} />;
}
