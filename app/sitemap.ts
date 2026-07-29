import type { MetadataRoute } from "next";
import { docNavigation } from "@/lib/docs";
import { isMarketingDeployment } from "@/lib/deployment-mode";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const lastModified = new Date();
  const docsUrls = [
    `${siteUrl}/docs`,
    ...docNavigation.flatMap((section) => [
      `${siteUrl}/docs/${section.slug}`,
      ...(section.items?.map((item) => `${siteUrl}/docs/${item.slug}`) ?? []),
    ]),
  ];

  const publicEntries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
    },
    ...docsUrls.map((url) => ({
      url,
      lastModified,
    })),
  ];

  if (isMarketingDeployment()) {
    return publicEntries;
  }

  return [
    ...publicEntries,
    {
      url: `${siteUrl}/sign-in`,
      lastModified,
    },
    {
      url: `${siteUrl}/setup`,
      lastModified,
    },
  ];
}
