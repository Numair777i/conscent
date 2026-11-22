import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Must be the SAME host your site actually serves (no "www" for you).
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://conscentfragrances.com";

  // Strips one or more trailing slashes at the end of the string
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /track removed so Google can read its title/description.
        // Private areas stay blocked.
        disallow: ["/api/", "/admin/", "/account/", "/checkout", "/thank-you"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
