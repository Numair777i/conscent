import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.conscentfragrances.com";

  // Strips one or more trailing slashes at the end of the string
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

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
          "/thank-you",
          "/track",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
