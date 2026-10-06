import {
  DEFAULT_RESIDENT_FOUNDING_CONTEXT,
  RESIDENT_HISTORY_MODES,
  RESIDENT_STORY_ROLES,
  type ResidentFoundingContext,
  residentFoundingProblems,
} from "../../../engine/packages/shared/src/villages/resident-founding-context.js";
import { type ReactNode, useState } from "react";

export function ResidentFoundingEditors({
  people,
  contexts,
  onChange,
  avatar,
  disabled,
}: {
  people: { characterId: string; name: string }[];
  contexts: Record<string, ResidentFoundingContext>;
  onChange(id: string, context: ResidentFoundingContext): void;
  avatar(id: string, name: string): ReactNode;
  disabled: boolean;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <section className="villages-forging-card villages-resident-backgrounds" aria-label="Life in this Village">
      <h3>Life in this Village</h3>
      {people.map((person) => {
        const value = contexts[person.characterId] ?? DEFAULT_RESIDENT_FOUNDING_CONTEXT;
        const problems = residentFoundingProblems(value);
        const patch = (change: Partial<ResidentFoundingContext>) =>
          onChange(person.characterId, { ...value, ...change });
        const prefix = "resident-background-" + person.characterId;
        const error = (field: keyof typeof problems) =>
          problems[field] ? (
            <small role="alert" id={prefix + "-" + field + "-error"}>
              {problems[field]}
            </small>
          ) : null;
        const hasErrors = Object.values(problems).some(Boolean);
        const opened = expanded[person.characterId] || hasErrors;
        return (
          <section
            key={person.characterId}
            className="villages-resident-background"
            aria-label={person.name + " life in this Village"}
          >
            <div className="villages-resident-identity">
              {avatar(person.characterId, person.name)}
              <h4>{person.name}</h4>
            </div>
            <button
              type="button"
              className="villages-resident-toggle"
              aria-expanded={!!opened}
              aria-controls={prefix}
              onClick={() => setExpanded((current) => ({ ...current, [person.characterId]: !opened }))}
            >
              {avatar(person.characterId, person.name)}
              <span>
                <strong>{person.name}</strong>
                <small>
                  {RESIDENT_STORY_ROLES[value.storyRole]} · {RESIDENT_HISTORY_MODES[value.historyMode]}
                </small>
              </span>
              <span aria-hidden="true">{opened ? "⌃" : "⌄"}</span>
            </button>
            <div className="villages-resident-fields" id={prefix} data-expanded={!!opened}>
              <div className="villages-resident-choices">
                <label>
                  Character history
                  <select
                    aria-label={person.name + " character history"}
                    disabled={disabled}
                    value={value.historyMode}
                    onChange={(event) =>
                      patch({ historyMode: event.target.value as ResidentFoundingContext["historyMode"] })
                    }
                  >
                    {Object.entries(RESIDENT_HISTORY_MODES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {error("historyMode")}
                </label>
                <label>
                  Place in the Village’s story
                  <select
                    aria-label={person.name + " place in the Village's story"}
                    disabled={disabled}
                    value={value.storyRole}
                    onChange={(event) =>
                      patch({ storyRole: event.target.value as ResidentFoundingContext["storyRole"] })
                    }
                  >
                    {Object.entries(RESIDENT_STORY_ROLES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {error("storyRole")}
                </label>
                {value.storyRole === "custom" ? (
                  <label className="villages-resident-custom">
                    Describe their place here
                    <textarea
                      aria-label={person.name + " custom place"}
                      aria-invalid={!!problems.customDescription}
                      aria-describedby={problems.customDescription ? prefix + "-customDescription-error" : undefined}
                      rows={2}
                      maxLength={240}
                      disabled={disabled}
                      value={value.customDescription}
                      onChange={(event) => patch({ customDescription: event.target.value })}
                    />
                    {error("customDescription")}
                  </label>
                ) : null}
                {value.historyMode !== "continue" ? (
                  <p className="villages-resident-help villages-resident-custom">
                    {value.historyMode === "adapt"
                      ? "Keep their history except for changes you describe. A blank note keeps it unchanged."
                      : "Keep who they are. Their former personal history is reference material unless you retain it below; this does not imply amnesia."}
                  </p>
                ) : null}
              </div>
              <label>
                {value.storyRole === "lifelong" ? "Their life here before play" : "Why they’re here"}{" "}
                <small>Optional</small>
                <textarea
                  aria-label={person.name + " starting background"}
                  rows={3}
                  maxLength={1200}
                  aria-invalid={!!problems.background}
                  aria-describedby={problems.background ? prefix + "-background-error" : undefined}
                  disabled={disabled}
                  value={value.background}
                  onChange={(event) => patch({ background: event.target.value })}
                />
                <span className="villages-resident-help">
                  Why they’re here, how their past connects to this setting, or what differs from their card.
                </span>
                {error("background")}
              </label>
            </div>
          </section>
        );
      })}
    </section>
  );
}
