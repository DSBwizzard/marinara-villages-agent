import { useEffect, useState, type ReactNode } from "react";

type Frame = { width: number; height: number; viewBox: string };

/** Fit the visible ink, retaining the resident's original image bytes and proportions. */
export function ResidentArtwork({ url, name, fallback }: { url: string; name: string; fallback: ReactNode }) {
  const [frame, setFrame] = useState<Frame | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth,
        height = image.naturalHeight;
      let viewBox = `0 0 ${width} ${height}`;
      try {
        const scale = Math.min(1, 512 / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(width * scale);
        canvas.height = Math.ceil(height * scale);
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (context) {
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let left = canvas.width,
            top = canvas.height,
            right = -1,
            bottom = -1;
          for (let y = 0; y < canvas.height; y++)
            for (let x = 0; x < canvas.width; x++) {
              if (pixels[(y * canvas.width + x) * 4 + 3]! <= 8) continue;
              left = Math.min(left, x);
              top = Math.min(top, y);
              right = Math.max(right, x);
              bottom = Math.max(bottom, y);
            }
          if (right >= left) {
            const x = Math.max(0, (left - 1) / scale),
              y = Math.max(0, (top - 1) / scale);
            viewBox = `${x} ${y} ${Math.min(width, (right + 2) / scale) - x} ${Math.min(height, (bottom + 2) / scale) - y}`;
          }
        }
      } catch {
        // Cross-origin artwork can still be displayed using its complete canvas.
      }
      if (active) setFrame({ width, height, viewBox });
    };
    image.onerror = () => {
      if (active) setFailed(true);
    };
    image.src = url;
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [url]);
  if (failed) return fallback;
  return (
    <svg
      className="marinara-capability-villages-dossier-sprite"
      viewBox={frame?.viewBox ?? "0 0 1024 1536"}
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label={`${name} — neutral sprite`}
      style={{ visibility: frame ? "visible" : "hidden" }}
    >
      {frame ? <image href={url} width={frame.width} height={frame.height} /> : null}
    </svg>
  );
}
