import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetailClient } from "@/components/ProductDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate Static Params for build-time SSR speed
export async function generateStaticParams() {
  return products.map((p) => ({
    slug: p.slug,
  }));
}

// Full Dynamic OpenGraph & Product Metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Parfum Not Found",
    };
  }

  const rawImage =
    typeof product.image === "string" ? product.image : product.image.src;

  return {
    title: `${product.name} — Extrait de Parfum`,
    description: product.description || product.tagline,
    openGraph: {
      title: `${product.name} | CONSCENT Fragrances`,
      description: product.tagline,
      type: "website",
      images: [
        {
          url: rawImage,
          width: 1008,
          height: 1200,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | CONSCENT`,
      description: product.tagline,
      images: [rawImage],
    },
  };
}

export default async function ParfumDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
