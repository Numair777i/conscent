import { MetadataRoute } from "next";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://conscent-psi.vercel.app";

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/parfums/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticUrls = [
    "",
    "/parfums",
    "/about",
    "/terms",
    "/privacy",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.6,
  }));

  return [...staticUrls, ...productUrls];
}
