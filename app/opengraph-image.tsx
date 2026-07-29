import { ImageResponse } from "next/og";

export const alt = "Cache — Your personal code library, on your machine";
export const size = {
  height: 630,
  width: 1200,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#09090a",
          color: "#f5f5f4",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "radial-gradient(circle, rgba(244,120,52,.22), transparent 64%)",
            height: 700,
            position: "absolute",
            right: -180,
            top: -300,
            width: 700,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", width: 980 }}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              gap: 16,
              letterSpacing: "-0.02em",
            }}
          >
            <div
              style={{
                border: "2px solid #f47834",
                display: "flex",
                height: 34,
                transform: "rotate(30deg)",
                width: 34,
              }}
            />
            CACHE
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: "-0.055em",
              lineHeight: 1.02,
              marginTop: 70,
              maxWidth: 900,
            }}
          >
            <span>Your personal code library,</span>
            <span style={{ color: "#f47834" }}>on your machine.</span>
          </div>
          <div
            style={{
              color: "#a3a3a3",
              display: "flex",
              fontSize: 24,
              marginTop: 36,
            }}
          >
            Open source · Local first · SQLite
          </div>
        </div>
      </div>
    ),
    size
  );
}
