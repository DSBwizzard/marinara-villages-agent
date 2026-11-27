import { useRef, useState, type ReactNode } from "react";
import { ModalDialog } from "./ModalDialog.js";
import { ELEMENT_TAG as P } from "./constants.js";

export type ZoneArtworkCommands = {
  drawPlaceImage(locationId: string, zoneId: string): Promise<void>;
  keepPlaceImage(locationId: string, zoneId: string, file: File | undefined): Promise<void>;
  dropPlaceImage(locationId: string, zoneId: string): Promise<void>;
  placeBusyId: string;
  problem?: string;
};

export function ZoneImageControls({
  name,
  imageUrl,
  disabled,
  canGenerate = true,
  editable = true,
  onGenerate,
  onUpload,
  onRemove,
  children,
}: {
  name: string;
  imageUrl?: string;
  disabled?: boolean;
  canGenerate?: boolean;
  editable?: boolean;
  onGenerate(): void;
  onUpload(file: File): void;
  onRemove(): void;
  children?: ReactNode;
}) {
  const upload = useRef<HTMLInputElement>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);
  return (
    <section className={`${P}-zone-artwork`} aria-label="Zone image">
      <h3>Image</h3>
      <div className={`${P}-zone-image-actions`}>
        {editable && (
          <>
            <button type="button" disabled={disabled || !canGenerate} onClick={onGenerate}>
              Generate Image
            </button>
            <button type="button" disabled={disabled} onClick={() => upload.current?.click()}>
              Upload image
            </button>
          </>
        )}
        <button type="button" disabled={!imageUrl} onClick={() => setFullImage(imageUrl ?? null)}>
          View fullsize
        </button>
        {editable && (
          <button type="button" disabled={disabled || !imageUrl} onClick={onRemove}>
            Remove image
          </button>
        )}
        <input
          autoComplete="off"
          ref={upload}
          hidden
          type="file"
          accept="image/*"
          aria-label={`Upload ${name} image`}
          disabled={disabled || !editable}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onUpload(file);
          }}
        />
      </div>
      {children}
      {fullImage && (
        <ModalDialog title={name} className={`${P}-zone-image-viewer`} onClose={() => setFullImage(null)}>
          <div className={`${P}-zone-image-viewer-art`}>
            <img src={fullImage} alt={name} />
          </div>
        </ModalDialog>
      )}
    </section>
  );
}
