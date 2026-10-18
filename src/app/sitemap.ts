import type { MetadataRoute } from "next";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://conscentfragrances.com";
  const baseUrl = rawBaseUrl.replace(/\/+\$/, "");

  // Stable timestamp for static legal/content pages
  const staticLastModified = new Date("2026-01-01T00:00:00.000Z");

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/parfums/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticRoutes = [
    { route: "", priority: 1.0, changeFrequency: "daily" as const },
    { route: "/parfums", priority: 0.9, changeFrequency: "weekly" as const },
    {
      route: "/parfums/trial-set-06",
      priority: 0.9,
      changeFrequency: "weekly" as const,
    },
    { route: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { route: "/terms", priority: 0.5, changeFrequency: "monthly" as const },
    { route: "/privacy", priority: 0.5, changeFrequency: "monthly" as const },
    { route: "/shipping", priority: 0.5, changeFrequency: "monthly" as const },
    { route: "/refunds", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  const staticUrls: MetadataRoute.Sitemap = staticRoutes.map((item) => ({
    url: `${baseUrl}${item.route}`,
    lastModified: staticLastModified,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  return [...staticUrls, ...productUrls];
}
