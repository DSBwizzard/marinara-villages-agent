import { useRef, useState, type ReactNode } from "react";
import { FoundingField, FoundingHelp } from "./FoundingField.js";
import {
  DEFAULT_RESIDENT_FOUNDING_CONTEXT,
  RESIDENT_HISTORY_MODES,
  RESIDENT_STORY_ROLES,
  type ResidentFoundingContext,
  residentFoundingProblems,
} from "../../../shared/helpers/resident-founding-context.js";

export function ResidentFoundingEditors({
  people,
  contexts,
  onChange,
  avatar,
  disabled,
  embedded = false,
}: {
  people: { characterId: string; name: string }[];
  contexts: Record<string, ResidentFoundingContext>;
  onChange(id: string, context: ResidentFoundingContext): void;
  avatar(id: string, name: string): ReactNode;
  disabled: boolean;
  embedded?: boolean;
}) {
  const [editing, setEditing] = useState<{ id: string; value: ResidentFoundingContext } | null>(null);
  const [attempted, setAttempted] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const person = people.find((row) => row.characterId === editing?.id);
  const close = () => {
    setEditing(null);
    setAttempted(false);
    opener.current?.focus();
  };
  const problems = editing ? residentFoundingProblems(editing.value) : null;
  const open = (id: string, value: ResidentFoundingContext) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setEditing({ id, value: { ...value } });
    setAttempted(false);
  };
  return (
    <section
      className={embedded ? "villages-embedded-backstory" : "villages-forging-card villages-backstories"}
      aria-label="Backstories"
    >
      {!embedded ? <h3>Backstories</h3> : null}
      {people.map((row) => {
        const value = contexts[row.characterId] ?? DEFAULT_RESIDENT_FOUNDING_CONTEXT;
        const invalid = Object.values(residentFoundingProblems(value)).find(Boolean);
        const legacy =
          value.historyMode === "adapt" ||
          value.historyMode === "new" ||
          value.storyRole !== "unspecified" ||
          !!value.background ||
          !!value.customDescription;
        return (
          <div className="villages-backstory-row" key={row.characterId}>
            {embedded ? (
              <div className="villages-backstory-heading">
                <label htmlFor={"villages-backstory-" + row.characterId}>Backstory</label>
                <FoundingHelp label={row.name + " backstory"}>
                  Use the character card's original backstory, or write a custom past for this village. A custom
                  backstory replaces their personal history here while preserving their personality, appearance, skills,
                  and the original card.
                </FoundingHelp>
              </div>
            ) : (
              <span>
                {avatar(row.characterId, row.name)}
                <strong>{row.name}</strong>
              </span>
            )}
            <select
              id={"villages-backstory-" + row.characterId}
              aria-label={row.name + " backstory"}
              value={editing?.id === row.characterId ? editing.value.historyMode : value.historyMode}
              disabled={disabled}
              onChange={(event) => {
                if (event.target.value === "village") open(row.characterId, { ...value, historyMode: "village" });
                else {
                  setEditing(null);
                  setAttempted(false);
                  onChange(row.characterId, { ...value, historyMode: "continue" });
                }
              }}
            >
              <option value="continue">Use character card backstory</option>
              <option value="village">Write custom backstory</option>
              {value.historyMode === "adapt" || value.historyMode === "new" ? (
                <option value={value.historyMode}>{RESIDENT_HISTORY_MODES[value.historyMode]}</option>
              ) : null}
            </select>
            {(value.historyMode === "village" || legacy) && editing?.id !== row.characterId ? (
              <button
                type="button"
                aria-label={"Edit " + row.name + " backstory"}
                disabled={disabled}
                onClick={() => open(row.characterId, value)}
              >
                Edit
              </button>
            ) : null}
            {invalid ? (
              <button type="button" data-founding-problem onClick={() => open(row.characterId, value)}>
                {invalid}
              </button>
            ) : null}
          </div>
        );
      })}
      {editing && person ? (
        <section
          className="villages-inline-backstory"
          role="group"
          aria-label={person.name + " backstory editor"}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              close();
            }
          }}
        >
          {editing.value.historyMode === "village" ? (
            <FoundingField title="Backstory for this village" error={attempted ? problems?.villageBackstory : ""}>
              <textarea
                aria-label="Backstory for this village"
                rows={4}
                maxLength={1200}
                value={editing.value.villageBackstory ?? ""}
                onChange={(event) =>
                  setEditing({ ...editing, value: { ...editing.value, villageBackstory: event.target.value } })
                }
              />
            </FoundingField>
          ) : null}
          {editing.value.storyRole !== "unspecified" || editing.value.background || editing.value.customDescription ? (
            <div className="villages-legacy-background">
              <FoundingField title="Existing story position" error={attempted ? problems?.storyRole : ""}>
                <select
                  aria-label={person.name + " place in the Village's story"}
                  value={editing.value.storyRole}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      value: {
                        ...editing.value,
                        storyRole: event.target.value as ResidentFoundingContext["storyRole"],
                      },
                    })
                  }
                >
                  {Object.entries(RESIDENT_STORY_ROLES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </FoundingField>
              {editing.value.storyRole === "custom" ? (
                <FoundingField title="Describe their place here" error={attempted ? problems?.customDescription : ""}>
                  <textarea
                    aria-label={person.name + " custom place"}
                    rows={2}
                    maxLength={240}
                    value={editing.value.customDescription}
                    onChange={(event) =>
                      setEditing({ ...editing, value: { ...editing.value, customDescription: event.target.value } })
                    }
                  />
                </FoundingField>
              ) : null}
              {editing.value.background ? (
                <FoundingField title="Existing starting note" error={attempted ? problems?.background : ""}>
                  <textarea
                    aria-label={person.name + " starting background"}
                    rows={3}
                    maxLength={1200}
                    value={editing.value.background}
                    onChange={(event) =>
                      setEditing({ ...editing, value: { ...editing.value, background: event.target.value } })
                    }
                  />
                </FoundingField>
              ) : null}
            </div>
          ) : null}
          <footer>
            <button type="button" onClick={close}>
              Cancel
            </button>
            <button
              type="button"
              disabled={disabled}
              className="villages-forging-primary"
              onClick={() => {
                setAttempted(true);
                if (problems && Object.values(problems).some(Boolean)) return;
                onChange(editing.id, editing.value);
                close();
              }}
            >
              Use backstory
            </button>
          </footer>
        </section>
      ) : null}
    </section>
  );
}
