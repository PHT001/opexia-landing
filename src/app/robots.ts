import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: "https://opexia-agency.com/sitemap.xml",
    host: "https://opexia-agency.com",
  };
}
