import type { VillageVenueImage, VenueClass } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";

export const projectClasses: VenueClass[] = ["residence", "workplace", "community", "other"];
export const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function ClassChoices({
  value,
  onChange,
  choices = projectClasses,
  multiple = true,
}: {
  value: VenueClass[];
  choices?: VenueClass[];
  multiple?: boolean;
  onChange(value: VenueClass[]): void;
}) {
  return (
    <div className="vp-choices" role="group" aria-label={multiple ? "Classes" : "Zone Class"}>
      {choices.map((role) => (
        <button
          type="button"
          key={role}
          aria-pressed={value.includes(role)}
          disabled={multiple && !value.includes(role) && value.length >= 2}
          onClick={() => {
            if (multiple && value.includes(role) && value.length === 1) return;
            onChange(
              multiple ? (value.includes(role) ? value.filter((item) => item !== role) : [...value, role]) : [role],
            );
          }}
        >
          {titleCase(role)}
        </button>
      ))}
    </div>
  );
}

export function ProjectDrawing({ image, caption }: { image?: VillageVenueImage | null; caption: string }) {
  if (!image) return null;
  return (
    <figure className="vp-drawing">
      <img src={image.url} alt={caption} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function ArtworkUpload({ busy, onUpload }: { busy: boolean; onUpload(file?: File): void }) {
  return (
    <label className={P + "-artwork-upload"}>
      <span>Upload artwork</span>
      <input
        autoComplete="off"
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(event) => onUpload(event.target.files?.[0])}
      />
    </label>
  );
}
