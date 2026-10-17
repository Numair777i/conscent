import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conscent-psi.vercel.app";
  return {
    rules: {
      userAgent: "*", //all crawling bots
      allow: "/", //pages that are allowed to bots
      disallow: ["/admin", "/api/"], //pages not to be crawled by bots
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
