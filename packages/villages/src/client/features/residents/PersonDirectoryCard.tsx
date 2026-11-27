import type { ComponentProps, ReactNode } from "react";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { AvatarFace } from "./ResidentPanels.js";

export function PersonDirectoryCard({
  name,
  portrait,
  selected,
  disabled,
  label,
  detail,
  onOpen,
}: {
  name: string;
  portrait: ComponentProps<typeof AvatarFace>["portrait"];
  selected?: boolean;
  disabled?: boolean;
  label: string;
  detail?: ReactNode;
  onOpen(): void;
}) {
  return (
    <button
      type="button"
      className={`${P}-directory-card`}
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onOpen}
    >
      <AvatarFace portrait={portrait} name={name} className={`${P}-avatar`} fullResolution />
      <span className={`${P}-directory-text`}>
        <strong>{name}</strong>
        {detail}
      </span>
    </button>
  );
}
