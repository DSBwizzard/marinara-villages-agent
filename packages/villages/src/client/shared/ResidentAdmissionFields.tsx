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
  return (
    <div className="villages-admission-fields">
      <label>
        Homeworld{" "}
        <input
          aria-label={name + " homeworld"}
          autoComplete="off"
          maxLength={WORLD_NAME_MAX_LENGTH}
          placeholder="Optional"
          disabled={disabled}
          value={value.homeworld}
          onChange={(event) => onChange({ ...value, homeworld: event.target.value })}
        />
      </label>
      <label>
        Starting situation{" "}
        <textarea
          aria-label={name + " starting situation"}
          autoComplete="off"
          rows={3}
          maxLength={STARTING_SITUATION_MAX_LENGTH}
          placeholder="Optional"
          disabled={disabled}
          value={value.startingSituation}
          onChange={(event) => onChange({ ...value, startingSituation: event.target.value })}
        />
      </label>
    </div>
  );
}
