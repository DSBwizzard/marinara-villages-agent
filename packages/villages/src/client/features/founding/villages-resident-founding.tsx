import { useState, type ReactNode } from "react";
import {
  DEFAULT_RESIDENT_FOUNDING_CONTEXT,
  type ResidentFoundingContext,
} from "../../../shared/helpers/resident-founding-context.js";
import { ResidentBackgroundReview, type BackgroundSource } from "../../shared/ResidentBackgroundReview.js";
export function ResidentFoundingEditors({
  people,
  contexts,
  onChange,
  disabled,
  embedded = false,
  showErrors = false,
  source,
  autoOpen = false,
}: {
  people: { characterId: string; name: string }[];
  contexts: Record<string, ResidentFoundingContext>;
  onChange(id: string, context: ResidentFoundingContext): void;
  avatar(id: string, name: string): ReactNode;
  disabled: boolean;
  embedded?: boolean;
  showErrors?: boolean;
  source?: BackgroundSource;
  autoOpen?: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(autoOpen ? (people[0]?.characterId ?? null) : null);
  return (
    <section
      className={embedded ? "villages-embedded-backstory" : "villages-forging-card villages-backstories"}
      aria-label="Life here"
    >
      {people.map((person) => {
        const value = contexts[person.characterId] ?? DEFAULT_RESIDENT_FOUNDING_CONTEXT;
        const accepted = value.integration?.accepted;
        return (
          <div key={person.characterId} className="villages-background-row">
            <button type="button" disabled={disabled} onClick={() => setEditing(person.characterId)}>
              {accepted ? "Edit background" : "Review background"}
            </button>
            {accepted ? <p>{value.integration?.text}</p> : null}
            {showErrors && value.integration && !accepted ? (
              <p role="alert" data-founding-problem>
                Accept a background for {person.name}.
              </p>
            ) : null}
            {editing === person.characterId ? (
              <ResidentBackgroundReview
                key={person.characterId}
                name={person.name}
                characterId={person.characterId}
                context={value}
                source={source ?? { founding: true, setting: "", premise: "" }}
                initialRequest={autoOpen}
                onChange={(context) => onChange(person.characterId, context)}
                onAccept={(context) => {
                  onChange(person.characterId, context);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
                disabled={disabled}
              />
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
