import type { MetadataRoute } from "next";
import { listFlagships } from "@/lib/mdx";
import { siteUrl } from "@/lib/site-metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const flagships = await listFlagships();
  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...flagships.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
