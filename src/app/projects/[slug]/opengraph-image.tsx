import { ImageResponse } from "next/og";
import { getFlagshipBySlug } from "@/lib/mdx";

export const runtime = "nodejs";
export const alt = "Case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getFlagshipBySlug(slug);
  const title = project?.title ?? "Case study";
  const summary = project?.summary ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "monospace",
        }}
      >
        <div style={{ color: "#3b82f6", fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Case study
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 500, letterSpacing: "-0.04em" }}>{title}</div>
          {summary && (
            <div style={{ fontSize: 28, color: "#a1a1aa", lineHeight: 1.4 }}>{summary}</div>
          )}
        </div>
        <div style={{ fontSize: 22, color: "#71717a" }}>alexandro-bolfa.com</div>
      </div>
    ),
    size,
  );
}
