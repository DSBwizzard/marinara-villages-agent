import { FoundingHelp } from "./FoundingField.js";
import { FoundingDialog } from "./FoundingDialog.js";
import type {
  CatalogEntry,
  PersonaEntry,
  ScenarioImprint,
  SetupMapReceipt,
  VillageLorebookOption,
} from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { Portrait, PortraitMap, SetupVenueDraft, TownMapOptions } from "../../shared/types.js";
import { AvatarFace, readAvatarCrop } from "../residents/ResidentPanels.js";
import { FOUNDING_SCENARIOS, type FoundingScenarioId } from "./scenarios.js";
import { startingZone } from "./founding-template.js";
import { type ReactNode, useEffect, useState } from "react";

export const emptyScenarioImprint = (): ScenarioImprint => ({
  origin: "",
  worldFacts: [],
  openingConditions: [],
  visualCues: [],
});

export const foundingScenario = (value: FoundingScenarioId) =>
  FOUNDING_SCENARIOS.find((scenario) => scenario.value === value)!;

export const DEFAULT_TOWN_MAP_OPTIONS: TownMapOptions = { roads: "auto", structures: "auto", water: "auto" };

/**
 * The founding wizard, in order. One list so the step strip and the screens it
 * labels cannot drift apart.
 */
export const SETUP_STEPS = ["People", "Place", "Venues", "Review"] as const;

export const SETUP_MIN_VILLAGER_COUNT = 1;

export const SETUP_MAX_VILLAGER_COUNT = 3;

export function newSetupVenue(
  id: string,
  venueClass: "residence" | "gathering",
  x: number,
  y: number,
  playerHome = false,
  index = 1,
): SetupVenueDraft {
  const name = venueClass === "gathering" ? "Gathering Place" : playerHome ? "Your residence" : `Residence ${index}`;
  const venue: SetupVenueDraft = {
    id,
    name,
    form: "",
    classes: [venueClass],
    layoutVersion: 1,
    spaces: [],
    residenceCapacity: 1,
    residentIds: [],
    improvements: [null, null],
    description: "",
    category: venueClass === "gathering" ? "public-center" : "",
    presentation: { image: null, x, y },
    occupancy: { playerHome, residentCharacterId: null, homeKind: null },
    capabilities: [],
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  };
  return {
    ...venue,
    layout: venueClass === "gathering" ? "common" : "both",
    spaces: [startingZone(venue, false)],
    privateSpaces: venueClass === "gathering" ? [] : [startingZone(venue, true)],
  };
}

export async function requestSetupMapReceipt(path: string, init?: RequestInit): Promise<SetupMapReceipt> {
  const controller = new AbortController();
  // Admission is small; a completed receipt can carry several MB over a phone connection.
  const timer = window.setTimeout(() => controller.abort(), init?.method === "POST" ? 30_000 : 120_000);
  try {
    return await request<SetupMapReceipt>(path, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function personaChoicePortrait(persona: { avatarPath: string | null; avatarCrop: unknown }): Portrait | undefined {
  return persona.avatarPath ? { url: persona.avatarPath, crop: readAvatarCrop(persona.avatarCrop) } : undefined;
}

/** One row geometry for both kinds of library identity. */
function FoundingIdentityRow({
  id,
  name,
  summary,
  portrait,
  selected,
  disabled,
  action,
  onClick,
}: {
  id: string;
  name: string;
  summary?: string;
  portrait?: Portrait;
  selected: boolean;
  disabled: boolean;
  action: string;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      className="villages-people-identity"
      data-identity={id}
      aria-label={name + " · " + action}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      <AvatarFace portrait={portrait} name={name} className={ELEMENT_TAG + "-identity-card-face"} glyph="person" />
      <span>
        <strong>{name}</strong>
        {summary ? <small>{summary}</small> : null}
      </span>
      <span className="villages-people-action" aria-hidden="true">
        {action}
      </span>
    </button>
  );
}

export function FoundingPersonaSelector({
  personas,
  draft,
  onDraft,
  disabled,
}: {
  personas: PersonaEntry[] | null;
  draft: string;
  onDraft(id: string): void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = personas?.find((person) => person.id === draft);
  const choices = (personas ?? [])
    .filter((person) =>
      (person.name + " " + person.summary).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className={ELEMENT_TAG + "-founding-persona"}>
      {selected ? (
        <FoundingIdentityRow
          id={selected.id}
          name={selected.name}
          summary={selected.summary}
          portrait={personaChoicePortrait(selected)}
          selected
          disabled={disabled}
          action="Change"
          onClick={() => {
            setQuery("");
            setOpen(true);
          }}
        />
      ) : (
        <button
          type="button"
          disabled={disabled || personas === null || personas.length === 0}
          onClick={() => {
            setQuery("");
            setOpen(true);
          }}
        >
          Choose Persona
        </button>
      )}
      {personas === null ? (
        <p role="status">Reading Personas…</p>
      ) : personas.length === 0 ? (
        <p>Create a Persona in your library before founding a village.</p>
      ) : draft && !selected ? (
        <p role="alert">The saved Persona is no longer in your library. Choose another Persona to continue.</p>
      ) : null}
      {open ? (
        <FoundingDialog title="Choose Persona" onClose={() => setOpen(false)}>
          <input
            type="search"
            aria-label="Search Personas"
            placeholder="Search Personas"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="villages-people-choices" role="group" aria-label="Choose a Persona">
            {choices.map((person) => (
              <FoundingIdentityRow
                key={person.id}
                id={person.id}
                name={person.name}
                summary={person.summary}
                portrait={personaChoicePortrait(person)}
                selected={person.id === draft}
                disabled={disabled}
                action={person.id === draft ? "Selected" : "Select"}
                onClick={() => {
                  onDraft(person.id);
                  setOpen(false);
                }}
              />
            ))}
            {!choices.length ? <p>No Personas match your search.</p> : null}
          </div>
        </FoundingDialog>
      ) : null}
    </div>
  );
}

export function FoundingVillagerPicker({
  catalog,
  portraits,
  selectedIds,
  onChange,
  disabled,
  renderBackstory,
}: {
  catalog: CatalogEntry[] | null;
  portraits: PortraitMap;
  selectedIds: string[];
  onChange(ids: string[]): void;
  disabled: boolean;
  renderBackstory?(id: string, name: string): ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = selectedIds.map(
    (id) =>
      catalog?.find((person) => person.id === id) ?? {
        id,
        name: "Unavailable character",
        summary: "Remove this selection and choose an available card.",
      },
  );
  const choices = (catalog ?? [])
    .filter((person) =>
      (person.name + " " + person.summary).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);
  return (
    <section className={ELEMENT_TAG + "-founding-roster"} aria-label="Founding villagers">
      <small role="status">{selectedIds.length} of 3 selected</small>
      <div className="villages-people-selected">
        {selected.map((person) => (
          <div className="villages-selected-villager" key={person.id}>
            <FoundingIdentityRow
              id={person.id}
              name={person.name}
              summary={person.summary}
              portrait={portraits[person.id]}
              selected
              disabled={disabled}
              action="Remove"
              onClick={() => toggle(person.id)}
            />
            {renderBackstory?.(person.id, person.name)}
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled || catalog === null || selectedIds.length >= 3}
        onClick={() => {
          setQuery("");
          setOpen(true);
        }}
      >
        + Add villager
      </button>
      {catalog === null ? (
        <p role="status">Reading character cards…</p>
      ) : !catalog?.length ? (
        <p>Add character cards to your library before founding.</p>
      ) : null}
      {open ? (
        <FoundingDialog title="Choose founding villagers" onClose={() => setOpen(false)}>
          <input
            type="search"
            aria-label="Search character cards by name"
            placeholder="Search characters"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="villages-people-choices" role="group" aria-label="Choose founding villagers">
            {choices.map((person) => (
              <FoundingIdentityRow
                key={person.id}
                id={person.id}
                name={person.name}
                summary={person.summary}
                portrait={portraits[person.id]}
                selected={selectedIds.includes(person.id)}
                disabled={disabled || (!selectedIds.includes(person.id) && selectedIds.length >= 3)}
                action={selectedIds.includes(person.id) ? "✓" : "Select"}
                onClick={() => toggle(person.id)}
              />
            ))}
            {!choices.length ? <p>No character cards match your search.</p> : null}
          </div>
          <footer>
            <button type="button" className="villages-forging-primary" onClick={() => setOpen(false)}>
              Done
            </button>
          </footer>
        </FoundingDialog>
      ) : null}
    </section>
  );
}

/** The compact Persona editor retained in village settings. */
export function PlayerIdentityEditor({
  idPrefix,
  personas,
  draft,
  onDraft,
  storedId,
  storedName,
  storedMissing,
  disabled,
}: {
  idPrefix: string;
  personas: PersonaEntry[] | null;
  /** The Persona being chosen, saved or not. */
  draft: string;
  onDraft: (personaId: string) => void;
  /** The link as the village has it stored. */
  storedId: string;
  storedName: string;
  storedMissing: boolean;
  disabled: boolean;
}) {
  const chosen = (personas ?? []).find((entry) => entry.id === draft) ?? null;
  // The snapshot only describes what is stored, so it may answer for the draft
  // only while the two are the same Persona.
  const chosenName = chosen?.name ?? (draft === storedId ? storedName : "");
  const missing = storedMissing && draft === storedId;
  const linked = draft.length > 0;
  return (
    <>
      <div className={`${ELEMENT_TAG}-field`}>
        <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-${idPrefix}-persona`}>
          Who are you?
        </label>
        <select
          id={`${ELEMENT_TAG}-${idPrefix}-persona`}
          className={`${ELEMENT_TAG}-select`}
          value={draft}
          disabled={disabled || personas === null || personas.length === 0}
          onChange={(event) => onDraft(event.target.value)}
        >
          <option value="" disabled>
            {personas === null ? "Reading Personas…" : "Choose a Persona"}
          </option>
          {(personas ?? []).map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.isActive ? `${persona.name} — your Persona` : persona.name}
            </option>
          ))}
        </select>
        <p className={`${ELEMENT_TAG}-macro-help`}>
          {personas === null
            ? "Reading your Personas…"
            : personas.length === 0
              ? "Create a Persona in your library before founding a village."
              : personas.some((persona) => persona.isActive)
                ? "Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you."
                : "The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."}
        </p>
      </div>

      {linked ? (
        <>
          <p className={`${ELEMENT_TAG}-empty`}>
            {missing
              ? "The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are."
              : chosenName.length > 0
                ? `The villagers know you as ${chosenName}.`
                : "The villagers know you as this Persona."}
          </p>
          {chosen && chosen.summary.length > 0 ? <p className={`${ELEMENT_TAG}-macro-help`}>{chosen.summary}</p> : null}
        </>
      ) : null}
    </>
  );
}

export function VillageLorebookPicker({
  books,
  error,
  selected,
  onChange,
  disabled,
}: {
  books: VillageLorebookOption[] | null;
  error: string;
  selected: string[];
  onChange(ids: string[]): void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const byId = new Map((books ?? []).map((book) => [book.id, book]));
  const visible = (books ?? []).filter((book) => !book.hiddenFromLibrary || selected.includes(book.id));
  const missing = selected.filter((id) => !byId.has(id));
  const options = [...visible, ...missing.map((id) => ({ id, name: id, enabled: false }))];
  const filtered = options.filter((book) => book.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const shown = filtered.slice(0, 50);
  return (
    <fieldset className={`${ELEMENT_TAG}-field ${ELEMENT_TAG}-lore-picker`}>
      <legend className={`${ELEMENT_TAG}-label`}>
        Village Lorebooks{" "}
        <FoundingHelp label="Village lorebooks">
          Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated
          scenery. Villages never edits them.
        </FoundingHelp>
      </legend>
      <div className={`${ELEMENT_TAG}-lore-selected`} aria-live="polite">
        {selected.length ? (
          selected.map((id) => (
            <span className={`${ELEMENT_TAG}-lore-chip`} key={id}>
              <span>
                {byId.get(id)?.name ?? id}
                {books === null
                  ? " (checking)"
                  : !byId.has(id)
                    ? " (missing)"
                    : !byId.get(id)?.enabled
                      ? " (disabled)"
                      : ""}
              </span>
              <button
                type="button"
                aria-label={`Remove ${byId.get(id)?.name ?? id}`}
                disabled={disabled}
                onClick={() => onChange(selected.filter((choice) => choice !== id))}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className={`${ELEMENT_TAG}-hint`}>No lorebooks selected.</span>
        )}
      </div>
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
      {books === null && !error ? <p className={`${ELEMENT_TAG}-hint`}>Loading lorebooks…</p> : null}
      {books === null && error && selected.length > 0 ? (
        <p className={`${ELEMENT_TAG}-hint`}>
          Selected books could not be checked. Lore generation will skip unavailable books.
        </p>
      ) : null}
      {books?.length === 0 ? <p className={`${ELEMENT_TAG}-hint`}>No lorebooks in the Engine library.</p> : null}
      <details className={`${ELEMENT_TAG}-lore-options`}>
        <summary className={`${ELEMENT_TAG}-button`}>Choose lorebooks ({selected.length}/24)</summary>
        <input
          type="search"
          className={`${ELEMENT_TAG}-search`}
          value={query}
          aria-label="Search lorebooks"
          placeholder="Search your lorebooks"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={`${ELEMENT_TAG}-lore-results`}>
          {shown.map((book) => {
            const checked = selected.includes(book.id);
            const status = missing.includes(book.id)
              ? books === null
                ? error
                  ? "Unavailable — skipped"
                  : "Checking status"
                : "Missing — skipped"
              : book.enabled
                ? ""
                : "Disabled — skipped";
            return (
              <label key={book.id} className={`${ELEMENT_TAG}-reason-option`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled || (!book.enabled && !checked) || (!checked && selected.length >= 24)}
                  onChange={() => onChange(checked ? selected.filter((id) => id !== book.id) : [...selected, book.id])}
                />
                {book.name}
                {status ? ` (${status})` : ""}
              </label>
            );
          })}
          {books !== null && filtered.length === 0 ? (
            <p className={`${ELEMENT_TAG}-hint`}>No matching lorebooks.</p>
          ) : null}
          {filtered.length > shown.length ? (
            <p className={`${ELEMENT_TAG}-hint`}>Showing the first 50 matches. Search to narrow the list.</p>
          ) : null}
        </div>
      </details>
    </fieldset>
  );
}
