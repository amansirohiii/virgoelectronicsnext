import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Virgo Electronics: coolers, fans and heaters made in Ghaziabad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The logo file is 720 × 276. Width and height below keep that ratio exactly.
const LOGO_W = 432;
const LOGO_H = Math.round((LOGO_W * 276) / 720);

const logo = `data:image/png;base64,${await readFile(
  join(process.cwd(), "public/brand/virgo-logo.png"),
  "base64",
)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 88px",
          color: "#16181b",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={logo} width={LOGO_W} height={LOGO_H} style={{ width: LOGO_W, height: LOGO_H }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: "100%", height: 3, background: "#16181b" }} />
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              maxWidth: 940,
            }}
          >
            Coolers, fans and heaters made in Ghaziabad
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 28, color: "#555b63" }}>
            virgoelectronics.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
