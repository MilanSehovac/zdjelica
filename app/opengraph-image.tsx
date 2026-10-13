import { ImageResponse } from "next/og";

export const alt = "Zdjelica, hrana za ljubimce";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#124845", color: "#fff", alignItems: "center", padding: 80 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 124, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>Zdjelica</div>
          <div style={{ fontSize: 44, marginTop: 28, color: "#d6ebe4" }}>Hrana za ljubimce</div>
          <div style={{ fontSize: 30, marginTop: 20, color: "#f7c948" }}>Dostava u cijeloj BiH</div>
        </div>
        <div style={{ display: "flex", position: "relative", width: 380, height: 380, alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: 40, left: 70, width: 70, height: 70, borderRadius: 40, background: "#f7c948" }} />
          <div style={{ position: "absolute", top: 5, left: 160, width: 70, height: 70, borderRadius: 40, background: "#f7c948" }} />
          <div style={{ position: "absolute", top: 50, left: 250, width: 70, height: 70, borderRadius: 40, background: "#f7c948" }} />
          <div style={{ width: 380, height: 190, background: "#d6ebe4", borderRadius: "0 0 190px 190px", display: "flex" }} />
        </div>
      </div>
    ),
    size,
  );
}
