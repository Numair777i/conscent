import type { Product } from "@/types";

import bottle1 from "@/assets/bottle-1.jpg";
import bottle2 from "@/assets/bottle-2.jpg";
import bottle3 from "@/assets/bottle-3.jpg";
import bottle4 from "@/assets/bottle-4.jpg";
import bottle5 from "@/assets/bottle-5.jpg";
import trialSet from "@/assets/trial-set.jpg";

export const products: Product[] = [
  {
    id: "p1",
    slug: "blk-opium",
    name: "BLK OPIUM",
    tagline: "Smoke, leather, late nights.",
    description:
      "A dense, unapologetic extrait built on charred oud and black leather. Opens sharp, settles heavy, and stays on fabric for days. Made for people who walk into rooms.",
    family: "WOODY / SMOKY",
    intensity: "HEAVY",
    gender: "UNISEX",
    image: bottle1,
    badge: "BEST SELLER",
    notes: [
      { layer: "top", name: "Pink Pepper" },
      { layer: "top", name: "Bergamot" },
      { layer: "heart", name: "Black Leather" },
      { layer: "heart", name: "Incense" },
      { layer: "base", name: "Oud" },
      { layer: "base", name: "Vetiver" },
    ],
    variants: [
      { id: "p1-10", size: "10 ML", price: 699 },
      { id: "p1-50", size: "50 ML", price: 2499, compareAt: 2999 },
      { id: "p1-100", size: "100 ML", price: 3999, compareAt: 4799 },
    ],
  },
  {
    id: "p2",
    slug: "red-district",
    name: "RED DISTRICT",
    tagline: "Sweet heat with a mean streak.",
    description:
      "Crushed raspberry and saffron over a vanilla-amber base. Loud in the first hour, addictive for the next eight. Our highest repeat-purchase scent.",
    family: "AMBER / SPICY",
    intensity: "HEAVY",
    gender: "UNISEX",
    image: bottle2,
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
      { id: "p2-10", size: "10 ML", price: 699 },
      { id: "p2-50", size: "50 ML", price: 2699 },
      { id: "p2-100", size: "100 ML", price: 4299 },
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
      { id: "p3-10", size: "10 ML", price: 649 },
      { id: "p3-50", size: "50 ML", price: 2299 },
      { id: "p3-100", size: "100 ML", price: 3699 },
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
      { id: "p4-10", size: "10 ML", price: 599 },
      { id: "p4-50", size: "50 ML", price: 2099 },
      { id: "p4-100", size: "100 ML", price: 3399 },
    ],
  },
  {
    id: "p5",
    slug: "concrete-grey",
    name: "CONCRETE GREY",
    tagline: "Cold air, wet stone, salt.",
    description:
      "A mineral-fresh aromatic with vetiver and grapefruit. Sharp, urban and built for heat.",
    family: "FRESH / AROMATIC",
    intensity: "MEDIUM",
    gender: "MASC",
    image: bottle5,
    notes: [
      { layer: "top", name: "Grapefruit" },
      { layer: "top", name: "Sea Salt" },
      { layer: "heart", name: "Lavender" },
      { layer: "heart", name: "Geranium" },
      { layer: "base", name: "Vetiver" },
      { layer: "base", name: "Ambroxan" },
    ],
    variants: [
      { id: "p5-10", size: "10 ML", price: 599 },
      { id: "p5-50", size: "50 ML", price: 2199 },
      { id: "p5-100", size: "100 ML", price: 3499 },
    ],
  },
  {
    id: "p6",
    slug: "trial-set-06",
    name: "TRIAL SET / 06",
    tagline: "Six vials. Find your signature.",
    description:
      "All six CONSCENT house scents in 2ML travel vials. Credit the full amount against your first full-size bottle.",
    family: "DISCOVERY",
    intensity: "MEDIUM",
    gender: "UNISEX",
    image: trialSet,
    badge: "STARTER",
    notes: [
      { layer: "top", name: "Mixed Citrus" },
      { layer: "heart", name: "Mixed Florals" },
      { layer: "base", name: "Mixed Woods" },
    ],
    variants: [{ id: "p6-set", size: "6 x 2 ML", price: 999, compareAt: 1499 }],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const formatINR = (paise: number) => `₹${paise.toLocaleString("en-IN")}`;
