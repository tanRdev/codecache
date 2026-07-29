import type { MetadataRoute } from "next";
import { isMarketingDeployment } from "@/lib/deployment-mode";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: isMarketingDeployment()
      ? {
          userAgent: "*",
          allow: ["/", "/docs/"],
          disallow: ["/api/", "/auth/", "/dashboard", "/setup", "/sign-in", "/snippets/"],
        }
      : {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/auth/", "/dashboard", "/snippets/"],
        },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
