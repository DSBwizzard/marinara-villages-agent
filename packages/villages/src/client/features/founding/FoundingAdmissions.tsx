import { EMPTY_RESIDENT_ADMISSION, type ResidentAdmission } from "../../../shared/helpers/resident-admission.js";
import { ResidentAdmissionFields } from "../../shared/ResidentAdmissionFields.js";
import { PlayerBackgroundFields } from "./villages-player-background.js";
export function FoundingAdmissions(props: {
  people: { id: string; name: string }[];
  playerBackground: string;
  admissions: Record<string, ResidentAdmission>;
  disabled: boolean;
  onPlayer(value: string): void;
  onAdmissions(value: Record<string, ResidentAdmission>): void;
}) {
  return (
    <section className="villages-forging-card villages-cast-backgrounds" aria-label="Starting notes">
      <PlayerBackgroundFields background={props.playerBackground} onChange={props.onPlayer} disabled={props.disabled} />
      {props.people.map((person) => (
        <div key={person.id}>
          <h3>{person.name}</h3>
          <ResidentAdmissionFields
            name={person.name}
            value={props.admissions[person.id] ?? EMPTY_RESIDENT_ADMISSION}
            disabled={props.disabled}
            onChange={(value) => props.onAdmissions({ ...props.admissions, [person.id]: value })}
          />
        </div>
      ))}
    </section>
  );
}
