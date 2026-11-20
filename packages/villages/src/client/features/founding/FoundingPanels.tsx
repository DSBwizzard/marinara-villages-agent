import { FoundingHelp } from "./FoundingField.js";
import { LoreActivityButton } from "../../shared/LoreActivity.js";
import { FoundingDialog } from "./FoundingDialog.js";
import { FoundingPagination } from "./FoundingPagination.js";
import type {
  CatalogEntry,
  PersonaEntry,
  SetupMapReceipt,
  VillageLorebookOption,
} from "../../../shared/contracts/village.js";
import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { Portrait, PortraitMap, SetupVenueDraft } from "../../shared/types.js";
import { AvatarFace, readAvatarCrop } from "../residents/ResidentPanels.js";
import { startingZone } from "./founding-template.js";
import { useId, useRef, useState, type ReactNode } from "react";

/**
 * The founding wizard, in order. One list so the step strip and the screens it
 * labels cannot drift apart.
 */

export const SETUP_MIN_VILLAGER_COUNT = 1;

export const SETUP_MAX_VILLAGER_COUNT = 3;

export function newSetupVenue(
  id: string,
  venueClass: "residence" | "community" | "workplace" | "other",
  x: number,
  y: number,
  playerHome = false,
  index = 1,
): SetupVenueDraft {
  const name =
    venueClass === "community"
      ? index === 1
        ? "Meeting place"
        : `Shared space ${index}`
      : venueClass !== "residence"
        ? "New Venue"
        : playerHome
          ? "Your residence"
          : `Residence ${index}`;
  const venue: SetupVenueDraft = {
    id,
    name,
    form:
      venueClass === "residence" ? "Residence" : venueClass === "community" ? "Community place" : "Existing structure",
    classes: [venueClass],
    layoutVersion: 1,
    spaces: [],
    residenceCapacity: 1,
    ...(venueClass === "residence" ? { foundingCapacity: null } : {}),
    residentIds: [],

    description:
      venueClass === "residence"
        ? "A residence in the Village."
        : venueClass === "community"
          ? "A place where the community gathers."
          : "An existing place in the community.",
    category: venueClass === "community" ? "public-center" : "",
    presentation: { mapId: "", image: null, x, y },
    occupancy: { playerHome, residentCharacterId: null, homeKind: null },
    capabilities: [],
  };
  return {
    ...venue,
    layout: "common",
    spaces: [{ ...startingZone(venue, false), ...(venueClass === "residence" ? { access: undefined } : {}) }],
    privateSpaces: [],
  };
}

export async function requestSetupMapReceipt(path: string, init?: RequestInit): Promise<SetupMapReceipt> {
  const controller = new AbortController();
  // Admission is small; a completed receipt can carry several MB over a phone connection.
  const timer = window.setTimeout(() => controller.abort(), init?.method === "POST" ? 30_000 : 120_000);
  try {
    return await request<SetupMapReceipt>(path, {
      ...init,
      signal: init?.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal,
    });
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
  actionButton = false,
  onClick,
}: {
  id: string;
  name: string;
  summary?: string;
  portrait?: Portrait;
  selected: boolean;
  disabled: boolean;
  action: string;
  actionButton?: boolean;
  onClick(): void;
}) {
  const Row = actionButton ? "div" : "button";
  return (
    <Row
      type={actionButton ? undefined : "button"}
      className={"villages-people-identity" + (actionButton ? " villages-character-choice" : "")}
      data-identity={id}
      aria-label={actionButton ? undefined : name + " · " + action}
      aria-pressed={actionButton ? undefined : selected}
      disabled={actionButton ? undefined : disabled}
      onClick={actionButton ? undefined : onClick}
    >
      <AvatarFace portrait={portrait} name={name} className={ELEMENT_TAG + "-identity-card-face"} glyph="person" />
      <span>
        <strong>{name}</strong>
        {summary ? <small>{summary}</small> : null}
      </span>
      {actionButton ? (
        <button
          type="button"
          className="villages-character-add"
          aria-label={name + " · " + action}
          disabled={disabled}
          onClick={onClick}
        >
          {action}
        </button>
      ) : (
        <span className="villages-people-action" aria-hidden="true">
          {action}
        </span>
      )}
    </Row>
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
          summary={undefined}
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
            autoComplete="off"
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
  appearance,
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
  appearance?(id: string): ReactNode;
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
  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);
    if (!selectedIds.includes(id)) setOpen(false);
  };
  return (
    <section className={ELEMENT_TAG + "-founding-roster"} aria-label="Founding villagers">
      <div className="villages-people-selected">
        {selected.map((person) => (
          <div className="villages-selected-villager" key={person.id}>
            <div className="villages-selected-resident">
              <AvatarFace
                portrait={portraits[person.id]}
                name={person.name}
                className={ELEMENT_TAG + "-identity-card-face"}
                glyph="person"
              />
              <span className="villages-selected-labels">
                <strong className="villages-selected-name">{person.name}</strong>
                {appearance?.(person.id)}
              </span>
            </div>
            <button
              type="button"
              className="villages-remove-resident"
              disabled={disabled}
              aria-label={person.name + " · Remove"}
              onClick={() => toggle(person.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {selectedIds.length < 3 ? (
        <button
          type="button"
          disabled={disabled || catalog === null}
          onClick={() => {
            setQuery("");
            setOpen(true);
          }}
        >
          + Add villager
        </button>
      ) : null}
      {catalog === null ? (
        <p role="status">Reading character cards…</p>
      ) : !catalog?.length ? (
        <p>Add character cards to your library before founding.</p>
      ) : null}
      {open ? (
        <FoundingDialog
          title="Choose founding villagers"
          className="villages-founding-roster-dialog"
          scrollBody
          onClose={() => setOpen(false)}
        >
          <input
            autoComplete="off"
            type="search"
            aria-label="Search character cards by name"
            placeholder="Search character cards..."
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
                action={selectedIds.includes(person.id) ? "✓" : "Add"}
                actionButton
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

export function VillageLorebookPicker({
  books,
  error,
  selected,
  onChange,
  disabled,
  founding,
  budget,
}: {
  books: VillageLorebookOption[] | null;
  error: string;
  selected: string[];
  onChange(ids: string[]): void;
  disabled: boolean;
  founding?: { inline: boolean; onBack(): void; nextLabel: "Next" | "Done" };
  budget?: Parameters<typeof LoreTokenBudgetField>[0];
}) {
  const inline = founding?.inline ?? false;
  const [open, setOpen] = useState(!!founding);
  const [pending, setPending] = useState(selected);
  const [pendingBudget, setPendingBudget] = useState<number>();
  const [baseSelection, setBaseSelection] = useState(selected);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    if (inline) requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  };
  const active = open ? pending : selected;
  const stale =
    open && (baseSelection.length !== selected.length || baseSelection.some((id, index) => id !== selected[index]));
  const [query, setQuery] = useState("");
  const byId = new Map((books ?? []).map((book) => [book.id, book]));
  const visible = (books ?? []).filter(
    (book) => !book.hiddenFromLibrary || selected.includes(book.id) || active.includes(book.id),
  );
  const missing = [...new Set([...selected, ...active])].filter((id) => !byId.has(id));
  const options = [...visible, ...missing.map((id) => ({ id, name: id, enabled: false }))];
  const filtered = options.filter((book) => book.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const pageIndex = Math.min(page, pages - 1);
  const shown = filtered.slice(pageIndex * 12, (pageIndex + 1) * 12);
  const status = error ? (
    <p role="alert">{error}</p>
  ) : books === null ? (
    <p role="status">Loading lorebooks…</p>
  ) : options.length === 0 ? (
    <p>No lorebooks available.</p>
  ) : null;
  const choices = (
    <>
      <div className="villages-lorebook-search-row">
        <input
          autoComplete="off"
          autoFocus={inline}
          type="search"
          className="villages-lorebook-search"
          value={query}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              close();
            }
          }}
          aria-label="Search Lorebooks"
          placeholder="Search Lorebooks"
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
        />
        <FoundingPagination compact page={pageIndex} count={pages} onPage={setPage} label="Lorebooks" />
      </div>
      {status}
      {stale ? <p role="alert">Lorebooks changed. Close and reopen this picker.</p> : null}
      <div className="villages-lorebook-results" role="group" aria-label="Lorebooks">
        {shown.map((book) => {
          const checked = active.includes(book.id);
          const state = missing.includes(book.id)
            ? books === null
              ? error
                ? "Unavailable"
                : "Checking"
              : "Missing"
            : book.enabled
              ? ""
              : "Disabled";
          return (
            <label
              key={book.id}
              className="villages-lorebook-option"
              data-selected={checked}
              title={state ? `${book.name} · ${state}` : book.name}
            >
              <input
                autoComplete="off"
                type="checkbox"
                aria-label={state ? `${book.name} · ${state}` : book.name}
                checked={checked}
                disabled={
                  disabled ||
                  stale ||
                  (!book.enabled && !checked && !selected.includes(book.id)) ||
                  (!checked && active.length >= 24)
                }
                onChange={() => setPending(checked ? active.filter((id) => id !== book.id) : [...active, book.id])}
              />
              <span className="villages-lorebook-name">{book.name}</span>
              {state ? (
                <span className="villages-lorebook-state" aria-hidden="true" title={state}>
                  ⊘
                </span>
              ) : null}
            </label>
          );
        })}
        {books !== null && options.length > 0 && filtered.length === 0 ? <p>No matches</p> : null}
      </div>
    </>
  );
  const editor = (
    <>
      {choices}
      {budget && active.length ? (
        <LoreTokenBudgetField {...budget} value={pendingBudget ?? budget.value} onChange={setPendingBudget} />
      ) : null}
      <footer className="villages-lorebook-footer">
        <span aria-live="polite">{active.length} / 24</span>
        {founding ? (
          <button type="button" onClick={founding.onBack}>
            Back
          </button>
        ) : null}
        <button
          type="button"
          className="villages-forging-primary"
          disabled={disabled || stale}
          onClick={() => {
            if (disabled || stale) return;
            if (budget && pending.length && pendingBudget !== undefined) budget.onChange(pendingBudget);
            onChange(pending);
            close();
          }}
        >
          {founding?.nextLabel ?? "Done"}
        </button>
      </footer>
    </>
  );
  return (
    <section
      className={founding ? undefined : ELEMENT_TAG + "-field " + ELEMENT_TAG + "-lore-picker villages-lorebook-card"}
      aria-label="Village Lorebooks"
      data-picker-open={(!!founding && open) || undefined}
    >
      <div className="villages-lorebook-header" hidden={!!founding && open}>
        {founding ? null : (
          <>
            <div className="villages-lorebook-heading">
              <h3>Village Lorebooks</h3>
              <FoundingHelp label="Village Lorebooks">
                Selected lorebooks enrich your Village with information for places, stories, village life and image
                generation.
              </FoundingHelp>
            </div>
            <LoreActivityButton />
          </>
        )}
        <button
          type="button"
          ref={trigger}
          className={founding ? "villages-forging-primary" : "villages-lorebook-action"}
          aria-label={founding ? undefined : "Choose Village Lorebooks"}
          disabled={disabled}
          onClick={() => {
            setQuery("");
            setPage(0);
            setPendingBudget(undefined);
            setPending([...selected]);
            setBaseSelection([...selected]);
            setOpen(true);
          }}
        >
          {founding ? "Next" : "Choose..."}
        </button>
      </div>
      {founding ? null : (
        <div className={ELEMENT_TAG + "-lore-selected"} aria-live="polite">
          {selected.length ? (
            selected.map((id) => (
              <span className={ELEMENT_TAG + "-lore-chip"} key={id}>
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
                  aria-label={"Remove " + (byId.get(id)?.name ?? id)}
                  disabled={disabled}
                  onClick={() => onChange(selected.filter((choice) => choice !== id))}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className={ELEMENT_TAG + "-hint"}>None selected</span>
          )}
        </div>
      )}
      {!open && !founding ? status : null}
      {open ? (
        inline ? (
          <div className="villages-lorebook-inline">{editor}</div>
        ) : (
          <FoundingDialog title="Choose Lorebooks" className="villages-lorebook-dialog" onClose={close}>
            {editor}
          </FoundingDialog>
        )
      ) : null}
    </section>
  );
}

export function LoreTokenBudgetField({
  value,
  onChange,
  min = 0,
  max = 3200,
  disabled = false,
}: {
  value: number;
  onChange(value: number): void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  const id = useId();
  const [empty, setEmpty] = useState(false);
  const invalid = !Number.isInteger(value) || value < min || value > max;
  return (
    <div className="villages-lorebook-budget">
      <div className="villages-lorebook-budget-heading">
        <label htmlFor={id}>Lorebook Token Budget</label>
        <FoundingHelp label="Lorebook Token Budget">
          Estimated token allowance per prompt. Constant entries need no keyword match but still need space. Current and
          recent shared dialogue matches take priority. Primary keys, secondary conditions, case, whole-word matching
          and entry order are supported. Regex keys are unsupported.
        </FoundingHelp>
      </div>
      <input
        id={id}
        aria-label="Lorebook Token Budget"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        placeholder="1600"
        value={empty && value === 0 ? "" : String(value)}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(event) => {
          const raw = event.target.value.trim();
          if (!/^\d*$/.test(raw)) return;
          setEmpty(raw === "");
          onChange(raw === "" ? 0 : Number(raw));
        }}
      />
    </div>
  );
}
