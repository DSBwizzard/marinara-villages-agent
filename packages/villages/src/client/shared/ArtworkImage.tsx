import { useLayoutEffect, useRef, useState } from "react";
import { galleryArtworkVariant } from "../../shared/helpers/gallery-artwork.js";

/** Keep the frame in place and reveal only the image belonging to this selection. */
export function ArtworkImage({
  src,
  alt,
  className,
  tile = false,
}: {
  src: string;
  alt: string;
  className?: string;
  tile?: boolean;
}) {
  const frame = useRef<HTMLImageElement>(null);
  const [small, setSmall] = useState<boolean>();
  const variant = galleryArtworkVariant(src, tile ? 320 : 1024);

  useLayoutEffect(() => {
    const parent = frame.current?.parentElement;
    if (tile || !parent) return;
    const measure = () => {
      const width = parent.clientWidth;
      if (width > 0) setSmall(width * Math.min(window.devicePixelRatio || 1, 2) <= 1280);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [tile]);

  const url = variant ? (tile || small ? variant : small === false ? src : undefined) : src;
  return (
    <DecodedArtwork key={url} imageRef={frame} url={url} original={src} alt={alt} className={className} tile={tile} />
  );
}

function DecodedArtwork({
  imageRef,
  url,
  original,
  alt,
  className,
  tile,
}: {
  imageRef: React.Ref<HTMLImageElement>;
  url?: string;
  original: string;
  alt: string;
  className?: string;
  tile: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  return (
    <img
      ref={imageRef}
      className={className}
      src={fallback ? original : url}
      alt={alt}
      loading={tile ? "lazy" : undefined}
      decoding="async"
      draggable={false}
      style={{ opacity: ready ? undefined : 0 }}
      onLoad={(event) => {
        const image = event.currentTarget;
        void image.decode().then(
          () => setReady(true),
          () => setFallback(true),
        );
      }}
      onError={() => setFallback(true)}
    />
  );
}
