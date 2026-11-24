import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const ogSize = { width: 1200, height: 630 };

/** Shared Open Graph card: dark, grid, the title big, the author small. */
export function ogImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string | null }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#09090b",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          color: "#ececef",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#a1a1aa" }}>
          <div style={{ width: 12, height: 12, borderRadius: 99, background: "#c5f06b" }} />
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: title.length > 60 ? 58 : 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 30, color: "#a1a1aa", lineHeight: 1.4 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#7c7c86" }}>
          <span style={{ color: "#ececef" }}>{site.name}</span>
          <span>{new URL(site.url).host}</span>
        </div>
      </div>
    ),
    ogSize,
  );
}
