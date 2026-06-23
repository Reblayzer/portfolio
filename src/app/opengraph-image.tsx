import { ImageResponse } from "next/og";
import { site } from "@content/site";

export const runtime = "edge";
export const alt = "Alexandro Bolfa, Software engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
        <div style={{ color: "#3b82f6", fontSize: 28, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          AB
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 88, fontWeight: 500, letterSpacing: "-0.04em" }}>
            Alexandro Bolfa
          </div>
          <div style={{ fontSize: 32, color: "#a1a1aa" }}>
            {site.pitch}
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#71717a" }}>alexandro-bolfa.com</div>
      </div>
    ),
    size,
  );
}
