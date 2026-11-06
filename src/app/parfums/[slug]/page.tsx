import type { Metadata } from "next";
import type { StaticImageData } from "next/image";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetailClient } from "@/components/ProductDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TRIAL_SLUG = "trial-set";

// Build every product page at build time
export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

// "AMBER RIOT" -> "Amber Riot" (reads better in Google results)
function cleanName(name: string): string {
  return name.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

// Cut text to a max length on a word boundary
function shorten(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

// Works for both string URLs and imported images
function getImage(image: string | StaticImageData, alt: string) {
  if (typeof image === "string") return { url: image, alt };
  return { url: image.src, width: image.width, height: image.height, alt };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Parfum Not Found",
      robots: { index: false, follow: false },
    };
  }

  const name = cleanName(product.name);
  const path = `/parfums/${product.slug}`;
  const isTrial = product.slug === TRIAL_SLUG;

  // Trial Set has hand-written copy; every other product is auto-built
  const title = isTrial
    ? "Trial Set — 3×8ml Extrait Discovery Set"
    : `${name} Extrait de Parfum`;

  const notes = Array.from(new Set(product.notes.map((n) => n.name)))
    .slice(0, 4)
    .join(", ");

  const description = isTrial
    ? "Try three CONSCENT extraits in 8ml vials, then use the full set price as credit toward your first full-size bottle. Find your signature, risk-free."
    : shorten(
        `${name}: ${product.tagline.replace(/[.\s]+$/, "")}. Notes of ${notes}. Handcrafted extrait de parfum by CONSCENT, made for long-lasting wear.`,
      );

  const image = getImage(
    product.image,
    `${name} extrait de parfum by CONSCENT`,
  );

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "CONSCENT",
      url: path,
      title: `${title} | CONSCENT`,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CONSCENT`,
      description,
      images: [image.url],
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
