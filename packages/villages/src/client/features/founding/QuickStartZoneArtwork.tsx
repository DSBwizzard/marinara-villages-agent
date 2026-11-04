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
  return (
    <section className="villages-quick-art" aria-label="Zone artwork">
      {image ? <img src={image.url} alt={`Artwork for ${name}`} /> : <div>No image yet</div>}
      <div className="villages-quick-art-actions">
        <label>
          Upload image
          <input
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
        </label>
        <button type="button" disabled={busy} onClick={onGenerate}>
          {image ? "Generate again" : "Generate image"}
        </button>
        {image ? (
          <button type="button" disabled={busy} onClick={onRemove}>
            Remove image
          </button>
        ) : null}
      </div>
    </section>
  );
}
