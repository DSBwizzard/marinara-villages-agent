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
  return (
    <figure className="vp-drawing">
      {image ? (
        <img src={image.url} alt={caption} />
      ) : (
        <svg viewBox="0 0 600 380" role="img" aria-label="Illustrative building elevation">
          <g fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M55 145 300 45 545 145H505V320H95V145Z" />
            <path d="M245 320V215H355V320M135 175H200V220H135ZM400 175H465V220H400Z" />
            <path
              opacity=".5"
              strokeWidth=".7"
              d="M160 145V320M215 145V320M270 145V320M325 145V320M380 145V320M435 145V320"
            />
            <path
              opacity=".6"
              strokeWidth="1"
              d="M55 335H545M55 331V339M177 332V338M300 331V339M423 332V338M545 331V339"
            />
          </g>
        </svg>
      )}
      <figcaption>
        <span>{image ? "ARTWORK" : "DESIGN STUDY"}</span>
        {caption}
      </figcaption>
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
