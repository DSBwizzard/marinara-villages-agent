import { useEffect, useRef } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";

export function QuickStartZoneArtwork({
  image,
  name,
  busy,
  onClose,
  onUpload,
  onGenerate,
  onRemove,
}: {
  image: VillageVenue["presentation"]["image"];
  name: string;
  busy: boolean;
  onClose(): void;
  onUpload(file: File): void;
  onGenerate(): void;
  onRemove(): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    const opener = document.activeElement;
    node.showModal();
    return () => {
      node.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="villages-founding-dialog villages-quick-art-dialog"
      data-compact="true"
      aria-label={`Artwork for ${name}`}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header>
        <h3>{name} artwork</h3>
        <button type="button" aria-label="Close artwork" onClick={onClose}>
          ×
        </button>
      </header>
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
      <footer>
        <button type="button" className="villages-forging-primary" onClick={onClose}>
          Done
        </button>
      </footer>
    </dialog>
  );
}
