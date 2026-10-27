import type { Product, Variant } from "@/types";

import bottle1 from "@/assets/bottle-1.jpg";
import bottle2 from "@/assets/bottle-2.jpg";
import bottle3 from "@/assets/bottle-3.jpg";
import bottle4 from "@/assets/bottle-4.jpg";
import SA from "@/assets/secret-affair-single.webp";
import SAbox from "@/assets/secret-affair-box.webp";
import liar from "@/assets/Liar.webp";
import lumora from "@/assets/Lumora.webp";
import satester from "@/assets/Secret-Affair.webp";
import tester1 from "@/assets/Pack-of-3.webp";
import tester2 from "@/assets/Pack-of-3-lying.webp";

export const products: Product[] = [
  {
    id: "sa",
    slug: "secret-affair",
    name: "Secret Affair",
    tagline: "Shhhh.....",
    description:
      "A dense, opulent blend of dark plum and aromatic spices melting into a velvety, resinous base of oud, amber, and sandalwood",
    family: "FRUITY/WOODY",
    intensity: "MEDIUM",
    gender: "MASC",
    image: SA,
    images: [SA, SAbox],
    notes: [
      { layer: "top", name: "Sweet Plum" },
      { layer: "top", name: "Cardamom" },
      { layer: "top", name: "Citrus" },
      { layer: "heart", name: "Jasmine" },
      { layer: "heart", name: "Rose" },
      { layer: "base", name: "Creamy Sandalwood" },
      { layer: "base", name: "Dark Oud" },
      { layer: "base", name: "Amber" },
    ],
    variants: [
      { id: "sa-10", size: "8 ML", price: 199, inStock: true },
      { id: "sa-50", size: "50 ML", price: 899, inStock: true },
      { id: "sa-100", size: "100 ML", price: 1499, inStock: true },
    ],
  },
  {
    id: "",
    slug: "lumora",
    name: "Lumora",
    tagline: "Sweet heat with a mean streak.",
    description:
      "Crushed raspberry and saffron over a vanilla-amber base. Loud in the first hour, addictive for the next eight. Our highest repeat-purchase scent.",
    family: "AMBER / SPICY",
    intensity: "HEAVY",
    gender: "UNISEX",
    image: lumora,
    badge: "NEW DROP",
    notes: [
      { layer: "top", name: "Raspberry" },
      { layer: "top", name: "Saffron" },
      { layer: "heart", name: "Rose" },
      { layer: "heart", name: "Cinnamon" },
      { layer: "base", name: "Amber" },
      { layer: "base", name: "Vanilla" },
    ],
    variants: [
      { id: "p2-10", size: "8 ML", price: 199, inStock: true },
      { id: "p2-50", size: "50 ML", price: 899, inStock: true },
      { id: "p2-100", size: "100 ML", price: 1499, inStock: true },
    ],
  },
  {
    id: "p3",
    slug: "amber-riot",
    name: "AMBER RIOT",
    tagline: "Golden, warm, impossible to ignore.",
    description:
      "Liquid amber poured over tonka and dry woods. A cold-weather signature that reads expensive without trying.",
    family: "AMBER / WOODY",
    intensity: "MEDIUM",
    gender: "MASC",
    image: bottle3,
    notes: [
      { layer: "top", name: "Mandarin" },
      { layer: "top", name: "Cardamom" },
      { layer: "heart", name: "Labdanum" },
      { layer: "heart", name: "Cedar" },
      { layer: "base", name: "Tonka Bean" },
      { layer: "base", name: "Benzoin" },
    ],
    variants: [
      { id: "p3-10", size: "10 ML", price: 649, inStock: true },
      { id: "p3-50", size: "50 ML", price: 2299, inStock: true },
      { id: "p3-100", size: "100 ML", price: 3699, inStock: true },
    ],
  },
  {
    id: "p4",
    slug: "white-noise",
    name: "WHITE NOISE",
    tagline: "Clean skin, but louder.",
    description:
      "Musk, iris and cashmere wood. The everyday scent that makes people ask what you're wearing without knowing why.",
    family: "MUSK / FLORAL",
    intensity: "LIGHT",
    gender: "FEM",
    image: bottle4,
    notes: [
      { layer: "top", name: "Pear" },
      { layer: "top", name: "Aldehydes" },
      { layer: "heart", name: "Iris" },
      { layer: "heart", name: "Jasmine" },
      { layer: "base", name: "White Musk" },
      { layer: "base", name: "Cashmere Wood" },
    ],
    variants: [
      { id: "p4-10", size: "10 ML", price: 599, inStock: true },
      { id: "p4-50", size: "50 ML", price: 2099, inStock: true },
      { id: "p4-100", size: "100 ML", price: 3399, inStock: true },
    ],
  },

  {
    id: "p6",
    slug: "trial-set",
    badge: "STARTER_PACK",
    name: "TRIAL SET",
    tagline: "3 vials. Find your signature.",
    description:
      "All six CONSCENT house scents in 8ML travel vials. Credit the full amount against your first full-size bottle.",
    family: "Explore",
    intensity: "MEDIUM",
    gender: "UNISEX",
    image: tester1,
    images: [tester1, tester2, lumora, satester, liar],
    notes: [
      { layer: "top", name: "Mixed Citrus" },
      { layer: "heart", name: "Mixed Florals" },
      { layer: "base", name: "Mixed Woods" },
    ],
    variants: [
      {
        id: "p6-set",
        size: "6 x 2 ML",
        price: 1,
        compareAt: 1499,
        inStock: true,
      },
    ],
  },
];

/* ==========================================================================
   CATALOG QUERY HELPERS
   ========================================================================== */

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getAllProductSlugs(): string[] {
  return products.map((p) => p.slug);
}

export function getVariant(
  productId: string,
  variantId: string,
): Variant | undefined {
  const product = getProductById(productId);
  return product?.variants.find((v) => v.id === variantId);
}
