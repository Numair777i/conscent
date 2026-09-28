import type { StaticImageData } from "next/image";

export type NoteLayer = "top" | "heart" | "base";

export interface Note {
  layer: NoteLayer;
  name: string;
}

export interface Variant {
  id: string;
  size: string;
  price: number;
  compareAt?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  family: string;
  intensity: "LIGHT" | "MEDIUM" | "HEAVY";
  gender: "MASC" | "FEM" | "UNISEX";
  image: string | StaticImageData;
  badge?: string;
  notes: Note[];
  variants: Variant[];
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  image: string | StaticImageData;
  qty: number;
}
