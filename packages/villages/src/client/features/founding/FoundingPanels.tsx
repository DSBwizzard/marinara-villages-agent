import type {
  CatalogEntry,
  PersonaEntry,
  ScenarioImprint,
  SetupMapReceipt,
  VillageLorebookOption,
} from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type {
  IdentityChoice,
  IdentityPreview,
  PersonaPreview,
  Portrait,
  PortraitMap,
  SetupVenueDraft,
  TownMapOptions,
} from "../../shared/types.js";
import { AvatarFace, readAvatarCrop } from "../residents/ResidentPanels.js";
import { FOUNDING_SCENARIOS, type FoundingScenarioId } from "./scenarios.js";
import { useEffect, useState } from "react";

export const emptyScenarioImprint = (): ScenarioImprint => ({
  origin: "",
  worldFacts: [],
  openingConditions: [],
  visualCues: [],
});

export const LEGACY_FOUNDING_REASONS: Readonly<Record<string, string>> = {
  "fresh-start": "People founded this village for a fresh start.",
  refuge: "People founded this village as a refuge.",
  "shared-project": "People founded this village as a shared project.",
  discovery: "People founded this village to explore a discovery.",
  homecoming: "People founded this village as a homecoming.",
  "something-else": "People founded this village for another reason.",
};

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
  return {
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

/** Shared visual selection pattern; callers supply their own identity and status data. */
function IdentityChoiceStrip({
  label,
  choices,
  selectedId,
  onSelect,
  disabled,
  emptyMessage,
}: {
  label: string;
  choices: IdentityChoice[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
  emptyMessage: string;
}) {
  return choices.length ? (
    <div className={`${ELEMENT_TAG}-identity-strip`} role="group" aria-label={label}>
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          className={`${ELEMENT_TAG}-identity-card`}
          aria-pressed={selectedId === choice.id}
          disabled={disabled}
          onClick={() => onSelect(choice.id)}
        >
          <AvatarFace
            portrait={choice.portrait}
            name={choice.name}
            className={`${ELEMENT_TAG}-identity-card-face`}
            glyph="person"
          />
          <strong>{choice.name}</strong>
          {choice.hint ? <small>{choice.hint}</small> : null}
        </button>
      ))}
    </div>
  ) : (
    <p className={`${ELEMENT_TAG}-hint`}>{emptyMessage}</p>
  );
}

function IdentityChoicePreview({ value }: { value: IdentityPreview }) {
  return (
    <section className={`${ELEMENT_TAG}-identity-preview`} aria-label={`${value.name} overview`}>
      <AvatarFace
        portrait={value.portrait}
        name={value.name}
        className={`${ELEMENT_TAG}-identity-preview-face`}
        glyph="person"
      />
      <div className={`${ELEMENT_TAG}-identity-preview-copy`}>
        <h3>{value.name}</h3>
        {value.overview ? <p className={`${ELEMENT_TAG}-identity-overview`}>{value.overview}</p> : null}
        {value.details.length ? (
          <dl className={`${ELEMENT_TAG}-identity-details`}>
            {value.details.map(({ label, text }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p className={`${ELEMENT_TAG}-identity-context`}>{value.context}</p>
      </div>
    </section>
  );
}

/** Shorten authored text at a word boundary without rewriting the Persona. */
function identityExcerpt(value: string, limit: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= limit) return compact;
  const boundary = compact.lastIndexOf(" ", limit);
  const nextBoundary = compact.indexOf(" ", limit);
  return `${compact.slice(0, boundary > 0 ? boundary : nextBoundary > 0 ? nextBoundary : compact.length).trimEnd()}…`;
}

function personaChoicePortrait(persona: { avatarPath: string | null; avatarCrop: unknown }): Portrait | undefined {
  return persona.avatarPath ? { url: persona.avatarPath, crop: readAvatarCrop(persona.avatarCrop) } : undefined;
}

export function FoundingPersonaSelector({
  personas,
  draft,
  onDraft,
  disabled,
}: {
  personas: PersonaEntry[] | null;
  draft: string;
  onDraft: (personaId: string) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<PersonaPreview | null>(null);
  const [previewProblem, setPreviewProblem] = useState("");
  const selected = personas?.find((entry) => entry.id === draft);
  const selectedId = selected?.id;
  const normalized = query.trim().toLocaleLowerCase();
  const choices = (personas ?? [])
    .filter((entry) => !normalized || `${entry.name} ${entry.summary}`.toLocaleLowerCase().includes(normalized))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      portrait: personaChoicePortrait(entry),
      hint: entry.summary,
    }));

  useEffect(() => {
    setPreview(null);
    setPreviewProblem("");
    if (!draft || !selectedId) return;
    const controller = new AbortController();
    void request<{ persona: PersonaPreview }>(`/personas/${encodeURIComponent(draft)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!controller.signal.aborted) setPreview(response.persona);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setPreviewProblem(messageFrom(cause, "This Persona could not be read."));
      });
    return () => controller.abort();
  }, [draft, selectedId]);

  const adapted: IdentityPreview | null =
    preview && preview.id === draft
      ? {
          id: preview.id,
          name: preview.name,
          portrait: personaChoicePortrait(preview),
          overview: identityExcerpt(
            preview.description || preview.appearance || preview.personality || preview.backstory,
            180,
          ),
          details: (
            [
              ["Appearance", preview.appearance],
              ["Personality", preview.personality],
              ["Backstory", preview.backstory],
            ] as const
          )
            .filter(([, text]) => text.trim())
            .map(([label, text]) => ({ label, text: identityExcerpt(text, 120) })),
          context: "Villages uses this Persona's name and authored details as your identity in future interactions.",
        }
      : null;

  return (
    <div className={`${ELEMENT_TAG}-founding-persona`}>
      <div className={`${ELEMENT_TAG}-identity-picker-head`}>
        <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setup-persona-search`}>
          Persona
        </label>
        <input
          id={`${ELEMENT_TAG}-setup-persona-search`}
          className={`${ELEMENT_TAG}-search`}
          type="search"
          value={query}
          placeholder="Search Personas"
          onChange={(event) => setQuery(event.target.value)}
          disabled={disabled || personas === null}
        />
      </div>
      <IdentityChoiceStrip
        label="Choose a Persona"
        choices={choices}
        selectedId={draft}
        onSelect={onDraft}
        disabled={disabled}
        emptyMessage={
          personas === null
            ? "Reading Personas…"
            : personas.length === 0
              ? "Create a Persona in your library before founding a village."
              : "No Personas match your search."
        }
      />
      {draft && personas && !selected ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          The saved Persona is no longer in your library. Choose another Persona to continue.
        </p>
      ) : adapted ? (
        <details className="villages-persona-preview">
          <summary>View Persona details</summary>
          <IdentityChoicePreview value={adapted} />
        </details>
      ) : previewProblem ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {previewProblem}
        </p>
      ) : selected ? (
        <p className={`${ELEMENT_TAG}-hint`}>Reading {selected.name}…</p>
      ) : (
        <p className={`${ELEMENT_TAG}-hint`}>Choose a Persona to see how Villages will know you.</p>
      )}
    </div>
  );
}

export function FoundingVillagerPicker({
  catalog,
  portraits,
  selectedIds,
  onChange,
  disabled,
}: {
  catalog: CatalogEntry[] | null;
  portraits: PortraitMap;
  selectedIds: string[];
  onChange(ids: string[]): void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const choices = [
    ...(catalog ?? []),
    ...selectedIds
      .filter((id) => !catalog?.some((entry) => entry.id === id))
      .map((id) => ({
        id,
        name: "Unavailable character",
        summary: "Remove this selection and choose an available card.",
      })),
  ];
  const visible = choices
    .filter((entry) => entry.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <section className={`${ELEMENT_TAG}-founding-roster`} aria-label="Founding villagers">
      <div className={`${ELEMENT_TAG}-identity-picker-head`}>
        <span>Choose 1–3 villagers</span>
        <span role="status">{selectedIds.length} of 3 selected</span>
      </div>
      <p className={`${ELEMENT_TAG}-hint`}>
        {disabled ? "Your existing founding villagers are kept." : "Choose 1–3 villagers from your character cards."}
      </p>
      <input
        className={`${ELEMENT_TAG}-search`}
        type="search"
        aria-label="Search character cards by name"
        placeholder="Search character cards by name"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className={`${ELEMENT_TAG}-founding-roster-grid`} role="group" aria-label="Choose founding villagers">
        {visible.map((entry) => {
          const selected = selectedIds.includes(entry.id);
          return (
            <button
              key={entry.id}
              type="button"
              className={`${ELEMENT_TAG}-founding-roster-card`}
              aria-label={entry.name}
              aria-pressed={selected}
              disabled={disabled || (!selected && selectedIds.length >= 3)}
              onClick={() =>
                onChange(selected ? selectedIds.filter((id) => id !== entry.id) : [...selectedIds, entry.id])
              }
            >
              <AvatarFace
                portrait={portraits[entry.id]}
                name={entry.name}
                className={`${ELEMENT_TAG}-identity-card-face`}
                glyph="person"
              />
              <span>
                <strong>{entry.name}</strong>
                <small>{entry.summary}</small>
              </span>
              <span className={`${ELEMENT_TAG}-roster-check`} aria-hidden="true">
                {selected ? "✓" : ""}
              </span>
            </button>
          );
        })}
        {!visible.length ? (
          <p className={`${ELEMENT_TAG}-hint`}>
            {catalog === null
              ? "Reading your character cards…"
              : choices.length
                ? "No character cards match your search."
                : "Add character cards to your library before founding."}
          </p>
        ) : null}
      </div>
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
      <legend className={`${ELEMENT_TAG}-label`}>Village Lorebooks</legend>
      <p className={`${ELEMENT_TAG}-hint`}>
        Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated
        scenery. Villages never edits them.
      </p>
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
