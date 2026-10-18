import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://conscentfragrances.com";
  const baseUrl = rawBaseUrl.replace(/\/+\$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/checkout",
          "/checkout/",
          "/track",
          "/track/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
