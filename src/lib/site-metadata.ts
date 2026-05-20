import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "Alexandro Bolfa";

export const siteUrl = SITE_URL;

export function buildMetadata(input: {
  title?: string;
  description: string;
  path?: string;
  ogImage?: string;
}): Metadata {
  const url = new URL(input.path ?? "/", SITE_URL).toString();
  const ogImage = input.ogImage ?? "/opengraph-image";
  return {
    metadataBase: new URL(SITE_URL),
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: input.title ?? SITE_NAME,
      description: input.description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title ?? SITE_NAME,
      description: input.description,
      images: [ogImage],
    },
  };
}
