import type { CSSProperties } from "react";

const P = "marinara-capability-villages";
/** Shared public Venue photograph, including the deliberately plain empty state. */
export function VenuePolaroid({
  image,
  name,
  className = "",
  style,
}: {
  image?: string | null;
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={P + "-pin-photo-card " + className} style={style}>
      <span className={P + "-pin-photo"} aria-hidden="true">
        {image ? (
          <img src={image} alt="" loading="lazy" draggable={false} />
        ) : (
          <span className={P + "-pin-photo-empty"} />
        )}
      </span>
      <span className={P + "-pin-name"}>{name}</span>
    </span>
  );
}
