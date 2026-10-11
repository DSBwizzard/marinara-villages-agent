import { FoundingField, FoundingHelp } from "./FoundingField.js";
import type { VillageVenue, VillageVenueImage } from "../../../shared/contracts/village.js";
import { includeFoundingZone } from "./founding-template.js";
import type { FoundingIssue, FoundingWorkspaceState } from "./villages-founding-workspace-state.js";
import { FoundingZoneFields } from "./villages-founding-zones.js";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

type Area = "exterior" | "interior" | "private";
export function FoundingWorkspace({
  venues,
  people,
  selectedId,
  placementId,
  state,
  map,
  existing,
  mapReady,
  issues,
  focusIssue,
  imageTarget,
  imageBusy,
  suggestionsBusy,
  suggestionsChanged,
  usagePreview,
  saveError,
  onState,
  onMove,
  onSelect,
  onContinue,
  onArrange,
  onPatch,
  onDraft,
  onGenerate,
  onUpload,
}: {
  venues: VillageVenue[];
  people: { id: string; name: string }[];
  selectedId: string | null;
  placementId: string | null;
  state: FoundingWorkspaceState;
  map: ReactNode;
  existing: boolean;
  mapReady: boolean;
  issues: FoundingIssue[];
  focusIssue: FoundingIssue | null;
  imageTarget: { venueId: string; zoneId: string } | null;
  imageBusy: boolean;
  suggestionsBusy: boolean;
  suggestionsChanged: boolean;
  usagePreview: ReactNode;
  saveError?: string;
  onState(state: FoundingWorkspaceState): void;
  onMove(venue: VillageVenue): void;
  onSelect(venue: VillageVenue): void;
  onContinue(): void;
  onArrange?: () => void;
  onPatch(venue: VillageVenue): void;
  onDraft(): void;
  onGenerate(venue: VillageVenue, area: Area, zoneId?: string): void;
  onUpload(venue: VillageVenue, area: Area, file: File, zoneId?: string): void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const inspector = useRef<HTMLDialogElement>(null);
  const tabId = useId();
  const [narrow, setNarrow] = useState(false);
  const [inclusionProblem, setInclusionProblem] = useState("");
  const selected = venues.find((venue) => venue.id === selectedId);
  const placement = venues.find((venue) => venue.id === placementId);
  const placed = venues.filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null).length;
  const incomplete = new Set(issues.filter((issue) => issue.field !== "placement").map((issue) => issue.venueId)).size;
  const section = selected ? (state.sections[selected.id] ?? "venue") : "venue";
  const selectedZone = selected ? (state.zones[selected.id] ?? "exterior") : "exterior";
  const existingZoneId =
    selectedZone === "common"
      ? (selected?.spaces?.[0]?.id ?? "exterior")
      : selectedZone === "private"
        ? (selected?.privateSpaces?.[0]?.id ?? "exterior")
        : selectedZone === "exterior" ||
            [...(selected?.spaces ?? []), ...(selected?.privateSpaces ?? [])].some((zone) => zone.id === selectedZone)
          ? selectedZone
          : "exterior";
  const personal =
    selectedZone === "private" ||
    !!selected?.privateSpaces?.some((zone) => zone.id === selectedZone) ||
    !!(selected && state.inactive?.[selected.id]?.private?.some((zone) => zone.id === selectedZone));
  const zoneTab = selectedZone === "exterior" ? "exterior" : personal ? "private" : "common";
  const activeTab = section === "venue" ? "exterior" : zoneTab;
  const locked = !!selected && imageTarget?.venueId === selected.id;
  const sheet = state.view === "details" && !!selected;
  const dismiss = () => onState({ ...state, paused: false, view: "map" });
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setNarrow(element.getBoundingClientRect().width < 704));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = inspector.current;
    if (!sheet || !node) return;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    node.querySelector<HTMLElement>("[data-close-sheet]")?.focus();
    return () => {
      node.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected && opener !== document.body)
        opener.focus({ preventScroll: true });
      else
        [...(root.current?.querySelectorAll<HTMLElement>("[data-venue-id], [data-pin-id]") ?? [])]
          .find((element) => (element.dataset.venueId ?? element.dataset.pinId) === selectedId)
          ?.focus({ preventScroll: true });
    };
  }, [sheet, selectedId]);
  useEffect(() => {
    if (!focusIssue || focusIssue.venueId !== selectedId) return;
    const labels: Record<FoundingIssue["field"], string> = {
      placement: "",
      name: "Venue name",
      form: "Physical form",
      description: "Exterior description",
      layout: "Include Common Space",
      assignment: "",
      "zone-name": "Zone name",
      "zone-purpose": "Zone used for",
      "zone-appearance": "Zone appearance",
      controller: "Zone controllers",
    };
    const zone = [...(root.current?.querySelectorAll<HTMLElement>("[data-zone-id]") ?? [])].find(
      (element) => element.dataset.zoneId === focusIssue.zoneId,
    );
    if (focusIssue.zoneId && !zone) return;
    const field = (zone ?? root.current)?.querySelector<HTMLElement>(`[aria-label="${labels[focusIssue.field]}"]`);
    field?.focus();
    field?.scrollIntoView({ block: "nearest" });
  }, [focusIssue, selectedId, section, zoneTab, sheet]);
  const changeZone = (next: string) =>
    selected &&
    onState({
      ...state,
      sections: { ...state.sections, [selected.id]: next === "exterior" ? "venue" : "zones" },
      zones: { ...state.zones, [selected.id]: next },
    });
  const imageFields = (area: Area, image: VillageVenueImage | null | undefined, id?: string) =>
    selected && (
      <section className="villages-workspace-artwork" aria-label={`${area} image`}>
        {image ? (
          <a href={image.url} target="_blank" rel="noreferrer" aria-label="View image">
            <img src={image.url} alt={`${area} of ${selected.name}`} />
          </a>
        ) : null}
        <details className="villages-workspace-image-options">
          <summary>
            {image ? "Change image" : area === "exterior" ? "Add exterior image" : "Add space image"}{" "}
            <small>Optional</small>
          </summary>
          <button type="button" disabled={imageBusy} onClick={() => onGenerate(selected, area, id)}>
            {image ? "Generate again" : "Generate image"}
          </button>
          {usagePreview}
          <label>
            Upload image
            <input
              aria-label={`Upload ${area} image`}
              type="file"
              accept="image/*"
              disabled={imageBusy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onUpload(selected, area, file, id);
              }}
            />
          </label>
          {image ? (
            <button
              type="button"
              disabled={imageBusy}
              onClick={() =>
                onPatch(
                  area === "exterior"
                    ? { ...selected, presentation: { ...selected.presentation, image: null } }
                    : area === "private"
                      ? {
                          ...selected,
                          privateSpaces: selected.privateSpaces?.map((zone) =>
                            zone.id === id ? { ...zone, image: null } : zone,
                          ),
                        }
                      : {
                          ...selected,
                          spaces: selected.spaces?.map((zone) => (zone.id === id ? { ...zone, image: null } : zone)),
                        },
                )
              }
            >
              Remove image
            </button>
          ) : null}
          <details>
            <summary>Artwork context</summary>
            <FoundingHelp label="Artwork context">
              Form, the selected Zone’s purpose and description, and shared scenery style inform this artwork.
            </FoundingHelp>
            {(
              [
                ["useAssignedVillagerContext", "Use assigned resident’s personality"],
                ["useVisualLore", "Use selected Village lorebooks"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  disabled={locked}
                  checked={selected.imageContext?.[key] ?? true}
                  onChange={(event) =>
                    onPatch({
                      ...selected,
                      imageContext: {
                        useAssignedVillagerContext: selected.imageContext?.useAssignedVillagerContext ?? true,
                        useVisualLore: selected.imageContext?.useVisualLore ?? true,
                        [key]: event.target.checked,
                      },
                    })
                  }
                />
                {label}
              </label>
            ))}
          </details>
        </details>
      </section>
    );
  const fieldProblem = (field: FoundingIssue["field"], zoneId?: string) =>
    focusIssue
      ? issues.find((issue) => issue.venueId === selectedId && issue.field === field && issue.zoneId === zoneId)
          ?.message
      : undefined;
  const inlineField = (
    label: string,
    value: string,
    patch: (value: string) => void,
    max: number,
    placeholder: string,
    problem?: string,
  ) => (
    <div className="villages-workspace-inline">
      <input
        aria-label={label}
        value={value}
        placeholder={placeholder}
        maxLength={max}
        disabled={locked}
        aria-invalid={!!problem}
        onChange={(event) => patch(event.target.value)}
      />
      <button
        type="button"
        disabled={locked}
        aria-label={"Edit " + label}
        onClick={(event) => event.currentTarget.parentElement?.querySelector<HTMLInputElement>("input")?.focus()}
      >
        ✎
      </button>
      {problem ? <p role="alert">{problem}</p> : null}
    </div>
  );
  const gathering = selected?.category === "public-center";
  const initialZones = (personal: boolean) => {
    const included = personal ? !!selected?.privateSpaces?.length : !!selected?.spaces?.length;
    return (
      selected && (
        <>
          <div className="villages-workspace-inclusion">
            <label className="villages-workspace-included">
              <input
                aria-label={`Include ${personal ? "Private" : "Common"} Space`}
                type="checkbox"
                disabled={locked || gathering}
                checked={included}
                onChange={(event) => {
                  const result = includeFoundingZone(
                    selected,
                    state.inactive?.[selected.id] ?? {},
                    personal,
                    event.target.checked,
                  );
                  setInclusionProblem(result.problem);
                  if (!result.problem) {
                    onState({
                      ...state,
                      zones: { ...state.zones, [selected.id]: personal ? "private" : "common" },
                      inactive: { ...state.inactive, [selected.id]: result.inactive },
                    });
                    onPatch(result.venue);
                  }
                }}
              />
              Included
            </label>
            <FoundingHelp label="Included spaces">
              {gathering
                ? personal
                  ? "The starting Gathering Place has no Private Space. It is a neutral meeting spot everyone can enter."
                  : "Required for the starting Gathering Place. Open to everyone · No owner."
                : "At least one Common or Private Space is required."}
            </FoundingHelp>
          </div>
          {fieldProblem("layout", "common") ? <p role="alert">{fieldProblem("layout", "common")}</p> : null}
          {inclusionProblem ? <p role="alert">{inclusionProblem}</p> : null}
          {!included ? (
            <p>
              {personal ? "Private" : "Common"} Space is not included.{" "}
              {state.inactive?.[selected.id]?.[personal ? "private" : "common"]?.length
                ? "Its previous draft and images are kept."
                : "Enable it to describe the space."}
            </p>
          ) : (
            (personal ? (selected.privateSpaces ?? []) : (selected.spaces ?? [])).map((zone) => {
              const hidden = personal && zone.ownerId !== "player";
              const patch = (next: Partial<typeof zone>) =>
                onPatch(
                  personal
                    ? {
                        ...selected,
                        privateSpaces: selected.privateSpaces?.map((row) =>
                          row.id === zone.id ? { ...row, ...next } : row,
                        ),
                      }
                    : {
                        ...selected,
                        spaces: selected.spaces?.map((row) => (row.id === zone.id ? { ...row, ...next } : row)),
                      },
                );
              return (
                <section key={zone.id} data-zone-id={zone.id}>
                  {inlineField(
                    "Zone name",
                    zone.name ?? "",
                    (value) => patch({ name: value }),
                    100,
                    "Space name",
                    fieldProblem("zone-name", zone.id),
                  )}
                  {inlineField(
                    "Zone used for",
                    zone.purpose ?? "",
                    (value) => patch({ purpose: value }),
                    240,
                    "What is this space for?",
                    fieldProblem("zone-purpose", zone.id),
                  )}
                  {hidden ? (
                    <FoundingHelp label="Private interior">
                      The private interior is prepared for this resident after founding and stays hidden until invited.
                    </FoundingHelp>
                  ) : (
                    <FoundingField
                      title="Description"
                      help="Describe the visible interior of this space."
                      error={fieldProblem("zone-appearance", zone.id)}
                    >
                      <textarea
                        aria-label="Zone appearance"
                        rows={3}
                        maxLength={1000}
                        disabled={locked}
                        value={zone.description}
                        onChange={(event) => patch({ description: event.target.value })}
                      />
                    </FoundingField>
                  )}
                  <div className="villages-founding-field-heading">
                    Access{" "}
                    <FoundingHelp label="Zone access">
                      {gathering
                        ? "Open to everyone."
                        : personal
                          ? "Entry follows this personal space’s invitation rules."
                          : "Entry follows this home’s invitation rules."}
                    </FoundingHelp>
                  </div>
                  {!hidden ? imageFields(personal ? "private" : "interior", zone.image, zone.id) : null}
                </section>
              );
            })
          )}
        </>
      )
    );
  };
  return (
    <div
      ref={root}
      className="villages-workspace villages-map-panel"
      data-view={state.view}
      data-sheet={sheet}
      data-narrow={narrow}
    >
      <div className="villages-workspace-overview villages-forging-card">
        <section className="villages-workspace-map" aria-label="Place Venues">
          <div className="villages-founding-field-heading villages-workspace-toolbar">
            <strong role="status">
              <h3>
                {placement
                  ? `${placement.presentation.x === null ? "Place" : "Move"} ${placement.name || "Venue"}`
                  : "Venues"}
              </h3>
              <small>
                {placed} of {venues.length} placed
              </small>
            </strong>
            <FoundingHelp label="Venue placement">
              Tap the map to place the selected Venue. Select a photograph or Edit to change its details. Move chooses a
              new spot; arrow keys and Enter also place it.
            </FoundingHelp>
          </div>
          {map}
          <p>
            {placement
              ? `Tap the map to ${placement.presentation.x === null ? "place" : "move"} ${placement.name || "this Venue"}.`
              : "Tap a photograph to edit or move."}
          </p>
          {onArrange ? (
            <button type="button" aria-label="Arrange automatically" onClick={onArrange}>
              Arrange
            </button>
          ) : null}
          {!existing && placed < venues.length && !placement ? (
            <button type="button" disabled={!mapReady} onClick={onContinue}>
              Continue placing
            </button>
          ) : null}
        </section>
        <section className="villages-workspace-list" aria-label="Starting Venues">
          {!existing ? (
            <button type="button" className="villages-workspace-draft" disabled={suggestionsBusy} onClick={onDraft}>
              {suggestionsBusy ? "Drafting…" : "Suggest names & descriptions"}
            </button>
          ) : null}
          {suggestionsChanged ? (
            <p>People or setting changed. Your edits are kept; review these drafts or request fresh suggestions.</p>
          ) : null}
          {!existing && placed < venues.length ? (
            <div className="villages-workspace-tray" aria-label="Unplaced Venue photographs">
              {venues
                .filter((venue) => venue.presentation.x === null || venue.presentation.y === null)
                .map((venue) => (
                  <button
                    key={venue.id}
                    type="button"
                    data-venue-id={venue.id}
                    aria-label={"Edit " + (venue.name || "Venue")}
                    onClick={() => onSelect(venue)}
                  >
                    <span className="villages-workspace-photo" aria-hidden="true">
                      {venue.presentation.image ? <img src={venue.presentation.image.url} alt="" /> : <span />}
                    </span>
                    <span>{venue.name || "Venue"}</span>
                  </button>
                ))}
            </div>
          ) : null}
          <p className="villages-workspace-summary" role="status">
            {placed} of {venues.length} placed ·{" "}
            {incomplete
              ? `${incomplete} ${incomplete === 1 ? "needs" : "need"} details`
              : placed < venues.length
                ? `${venues.length - placed} to place`
                : "Ready for review"}
          </p>
        </section>
      </div>
      <dialog
        ref={inspector}
        className="villages-workspace-inspector villages-founding-dialog villages-workspace-sheet"
        aria-label="Venue editor"
        aria-modal="true"
        onCancel={(event) => {
          event.preventDefault();
          dismiss();
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            dismiss();
        }}
      >
        {selected ? (
          <>
            <header className="villages-workspace-sheet-header">
              <span className="villages-workspace-photo" aria-hidden="true">
                {selected.presentation.image ? <img src={selected.presentation.image.url} alt="" /> : <span />}
              </span>
              {inlineField(
                "Venue name",
                selected.name,
                (name) => onPatch({ ...selected, name }),
                100,
                "Venue name",
                fieldProblem("name"),
              )}
              <button type="button" data-close-sheet aria-label="Close Venue editor" onClick={dismiss}>
                ×
              </button>
            </header>
            <div role="tablist" aria-label="Venue spaces" className="villages-workspace-tabs">
              {(["exterior", "common", "private"] as const).map((tab) => (
                <button
                  type="button"
                  role="tab"
                  key={tab}
                  id={tabId + tab}
                  aria-controls={tabId + "panel"}
                  aria-selected={activeTab === tab}
                  tabIndex={activeTab === tab ? 0 : -1}
                  onKeyDown={(event) => {
                    const tabs = ["exterior", "common", "private"];
                    const index = tabs.indexOf(activeTab);
                    const next =
                      event.key === "ArrowRight"
                        ? tabs[(index + 1) % 3]
                        : event.key === "ArrowLeft"
                          ? tabs[(index + 2) % 3]
                          : event.key === "Home"
                            ? tabs[0]
                            : event.key === "End"
                              ? tabs[2]
                              : null;
                    if (next) {
                      event.preventDefault();
                      changeZone(next);
                      inspector.current?.querySelector<HTMLElement>("#" + CSS.escape(tabId + next))?.focus();
                    }
                  }}
                  onClick={() => {
                    setInclusionProblem("");
                    changeZone(
                      existing && tab !== "exterior"
                        ? activeTab === tab
                          ? existingZoneId
                          : ((tab === "common" ? selected.spaces?.[0]?.id : selected.privateSpaces?.[0]?.id) ?? tab)
                        : tab,
                    );
                  }}
                >
                  {tab === "exterior" ? "Exterior" : tab === "common" ? "Common Space" : "Private Space"}
                </button>
              ))}
            </div>
            <div
              className="villages-workspace-sheet-body"
              role="tabpanel"
              id={tabId + "panel"}
              aria-labelledby={tabId + activeTab}
            >
              {locked ? <p role="status">Preparing image. These physical details are temporarily locked.</p> : null}
              {activeTab === "exterior" ? (
                <section data-zone-id="exterior">
                  {inlineField(
                    "Physical form",
                    selected.form ?? "",
                    (form) => onPatch({ ...selected, form }),
                    240,
                    "What kind of place?",
                    fieldProblem("form"),
                  )}
                  <div className="villages-workspace-purpose">
                    Entrance and approach <FoundingHelp label="Form">Describe the overall physical place.</FoundingHelp>
                  </div>
                  <textarea
                    aria-label="Exterior description"
                    rows={3}
                    maxLength={1000}
                    disabled={locked}
                    value={selected.description}
                    aria-invalid={!!fieldProblem("description", "exterior")}
                    onChange={(event) => onPatch({ ...selected, description: event.target.value })}
                  />
                  {fieldProblem("description", "exterior") ? (
                    <p role="alert">{fieldProblem("description", "exterior")}</p>
                  ) : null}
                  {imageFields("exterior", selected.presentation.image)}
                  {existing ? (
                    <details>
                      <summary>Venue details</summary>
                      <fieldset disabled={locked}>
                        {" "}
                        {existing ? (
                          <label>
                            Venue Type
                            <input
                              aria-label="Venue Type"
                              maxLength={100}
                              value={selected.venueType ?? ""}
                              onChange={(event) => onPatch({ ...selected, venueType: event.target.value })}
                            />
                          </label>
                        ) : null}
                        {existing && selected.classes?.includes("residence") && !selected.occupancy.playerHome ? (
                          <label>
                            Assigned villager
                            <select
                              aria-label="Assigned villager"
                              value={selected.occupancy.residentCharacterId ?? ""}
                              onChange={(event) =>
                                onPatch({
                                  ...selected,
                                  residentIds: [event.target.value],
                                  occupancy: { ...selected.occupancy, residentCharacterId: event.target.value },
                                  privateSpaces: selected.privateSpaces?.map((zone) => ({
                                    ...zone,
                                    ownerId: event.target.value,
                                  })),
                                })
                              }
                            >
                              <option value="">Choose a villager</option>
                              {people.map((person) => (
                                <option
                                  key={person.id}
                                  value={person.id}
                                  disabled={venues.some(
                                    (row) => row.id !== selected.id && row.occupancy.residentCharacterId === person.id,
                                  )}
                                >
                                  {person.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}
                      </fieldset>
                    </details>
                  ) : null}
                </section>
              ) : existing ? (
                <>
                  <label>
                    Selected Zone
                    <select
                      aria-label="Selected Zone"
                      value={existingZoneId}
                      onChange={(event) => changeZone(event.target.value)}
                    >
                      <option value={activeTab}>Choose a space</option>
                      {(activeTab === "common" ? (selected.spaces ?? []) : (selected.privateSpaces ?? [])).map(
                        (zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name || "Unnamed Zone"}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  {existingZoneId !== "exterior" && existingZoneId !== "common" && existingZoneId !== "private" ? (
                    <FoundingZoneFields
                      venue={selected}
                      people={people}
                      busy={locked}
                      onPatch={(next) => {
                        if (
                          ![...(next.spaces ?? []), ...(next.privateSpaces ?? [])].some(
                            (zone) => zone.id === existingZoneId,
                          )
                        )
                          changeZone("exterior");
                        onPatch(next);
                      }}
                      imageFields={imageFields}
                      selectedZoneId={existingZoneId}
                    />
                  ) : null}
                </>
              ) : (
                initialZones(activeTab === "private")
              )}
            </div>
            <footer className="villages-workspace-sheet-footer">
              {saveError ? <p role="alert">{saveError}</p> : null}
              <div>
                {!existing ? (
                  <button type="button" disabled={!mapReady} onClick={() => onMove(selected)}>
                    {selected.presentation.x === null || selected.presentation.y === null
                      ? "Place photograph"
                      : "Move photograph"}
                  </button>
                ) : null}
                <button type="button" className="villages-forging-primary" onClick={dismiss}>
                  Done
                </button>
              </div>
            </footer>
          </>
        ) : null}
      </dialog>
    </div>
  );
}
