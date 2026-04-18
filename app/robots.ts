import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/employee/"],
      },
    ],
    sitemap: "https://rasko.org/sitemap.xml",
    host: "https://rasko.org",
  };
}
