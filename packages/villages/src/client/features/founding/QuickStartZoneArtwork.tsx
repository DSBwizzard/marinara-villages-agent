import { useRef } from "react";
import { LoreChip } from "../../shared/LoreChip.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";

export function QuickStartZoneArtwork({
  image,
  name,
  busy,
  onUpload,
  onGenerate,
  onRemove,
}: {
  image: VillageVenue["presentation"]["image"];
  name: string;
  busy: boolean;
  onUpload(file: File): void;
  onGenerate(): void;
  onRemove(): void;
}) {
  const upload = useRef<HTMLInputElement>(null);
  return (
    <section className="villages-quick-art" aria-label="Zone artwork">
      <header className="villages-quick-art-header">
        <h4>Artwork</h4>
        <div className="villages-quick-art-actions">
          <LoreChip entries={image?.lore} label={name} />
          <button type="button" disabled={busy} onClick={onGenerate}>
            Generate artwork
          </button>
          <button type="button" disabled={busy} onClick={() => upload.current?.click()}>
            Upload image
          </button>
          <input
            ref={upload}
            hidden
            autoComplete="off"
            type="file"
            accept="image/*"
            aria-label="Upload Zone image"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onUpload(file);
            }}
          />
        </div>
      </header>
      {image ? (
        <img src={image.url} alt={`Artwork for ${name}`} />
      ) : (
        <div className="villages-quick-art-empty">No image yet</div>
      )}
      {image ? (
        <button type="button" disabled={busy} className="villages-quick-remove-art" onClick={onRemove}>
          Remove image
        </button>
      ) : null}
    </section>
  );
}
