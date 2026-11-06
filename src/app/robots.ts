import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://conscentfragrances.com";

  // Remove any trailing slashes
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only block what must never be crawled. Pages that use "noindex"
        // (account, checkout, thank-you) must stay crawlable, otherwise
        // Google can never see the noindex tag.
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
