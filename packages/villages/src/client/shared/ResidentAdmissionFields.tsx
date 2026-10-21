import { useId, useState } from "react";
import { FieldHelp } from "./FieldHelp.js";
import {
  WORLD_NAME_MAX_LENGTH,
  STARTING_SITUATION_MAX_LENGTH,
  type ResidentAdmission,
} from "../../shared/helpers/resident-admission.js";
export function ResidentAdmissionFields({
  name,
  value,
  onChange,
  disabled = false,
}: {
  name: string;
  value: ResidentAdmission;
  onChange(value: ResidentAdmission): void;
  disabled?: boolean;
}) {
  const homeworldId = useId(),
    noteId = useId();
  const [noteOpen, setNoteOpen] = useState(false);
  const showNote = noteOpen || !!value.startingSituation;
  return (
    <div className="villages-admission-fields">
      <div className="villages-founding-field">
        <div className="villages-admission-heading">
          <label htmlFor={homeworldId}>Homeworld</label>
          <FieldHelp label={name + " homeworld"}>
            Optionally name this character’s homeworld. Matching world names identify the same world, without assuming
            the characters know each other. Leave blank if unspecified; their card and lore still apply, including
            knowledge of other worlds.
          </FieldHelp>
        </div>
        <input
          id={homeworldId}
          aria-label={name + " homeworld"}
          autoComplete="off"
          maxLength={WORLD_NAME_MAX_LENGTH}
          placeholder="Optional"
          disabled={disabled}
          value={value.homeworld}
          onChange={(event) => onChange({ ...value, homeworld: event.target.value })}
        />
      </div>
      {showNote ? (
        <div className="villages-founding-field">
          <div className="villages-admission-heading">
            <label htmlFor={noteId}>Starting note (optional)</label>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange({ ...value, startingSituation: "" });
                setNoteOpen(false);
              }}
            >
              Remove note
            </button>
          </div>
          <textarea
            id={noteId}
            aria-label={name + " starting note"}
            autoComplete="off"
            rows={3}
            maxLength={STARTING_SITUATION_MAX_LENGTH}
            disabled={disabled}
            value={value.startingSituation}
            onChange={(event) => onChange({ ...value, startingSituation: event.target.value })}
          />
        </div>
      ) : (
        <button
          type="button"
          className="villages-admission-add-note"
          disabled={disabled}
          onClick={() => setNoteOpen(true)}
        >
          + Add starting note
        </button>
      )}
    </div>
  );
}
