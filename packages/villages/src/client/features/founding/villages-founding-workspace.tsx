import { FoundingField, FoundingHelp } from "./FoundingField.js";
import type { VillageVenue, VillageVenueImage } from "../../../shared/contracts/village.js";
import { includeFoundingZone } from "./founding-template.js";
import type { FoundingIssue, FoundingWorkspaceState } from "./villages-founding-workspace-state.js";
import { FoundingZoneFields } from "./villages-founding-zones.js";
import { type ReactNode, useEffect, useRef, useState } from "react";

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
  saveStatus,
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
  saveStatus: string;
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
  const inspector = useRef<HTMLElement>(null);
  const wasSheet = useRef(false);
  const [narrow, setNarrow] = useState(false);
  const [inclusionProblem, setInclusionProblem] = useState("");
  const selected = venues.find((venue) => venue.id === selectedId);
  const placement = venues.find((venue) => venue.id === placementId);
  const placed = venues.filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null).length;
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
    if (sheet && !wasSheet.current) {
      inspector.current?.querySelector<HTMLElement>("button")?.focus();
      inspector.current?.scrollIntoView({ block: "start" });
    }
    if (!sheet && wasSheet.current)
      [...(root.current?.querySelectorAll<HTMLElement>("[data-venue-id]") ?? [])]
        .find((element) => element.dataset.venueId === selectedId)
        ?.focus();
    wasSheet.current = sheet;
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
    const field = (zone ?? root.current)?.querySelector<HTMLElement>(`[aria-label="${labels[focusIssue.field]}"]`);
    field?.focus();
    field?.scrollIntoView({ block: "nearest" });
  }, [focusIssue, selectedId, section, zoneTab, sheet]);
  const changeZone = (next: string) =>
    selected && onState({ ...state, zones: { ...state.zones, [selected.id]: next } });
  const imageFields = (area: Area, image: VillageVenueImage | null | undefined, id?: string) =>
    selected && (
      <section className="villages-workspace-artwork" aria-label={`${area} image`}>
        {image ? (
          <a href={image.url} target="_blank" rel="noreferrer" aria-label="View photograph">
            <img src={image.url} alt={`${area} of ${selected.name}`} />
          </a>
        ) : null}
        <details>
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
        {area === "exterior" ? (
          <FoundingHelp label="Exterior image">
            The image also appears inside this Venue’s required map marker. Adding an image is optional.
          </FoundingHelp>
        ) : null}
      </section>
    );
  const fieldProblem = (field: FoundingIssue["field"], zoneId?: string) =>
    focusIssue
      ? issues.find((issue) => issue.venueId === selectedId && issue.field === field && issue.zoneId === zoneId)
          ?.message
      : undefined;
  const gathering = selected?.category === "public-center";
  const initialZones = (personal: boolean) => {
    const included = personal ? !!selected?.privateSpaces?.length : !!selected?.spaces?.length;
    return (
      selected && (
        <>
          <label>
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
            Include {personal ? "Private" : "Common"} Space
          </label>
          <FoundingHelp label="Included spaces">
            {gathering
              ? personal
                ? "The starting Gathering Place has no Private Space. It is a neutral meeting spot everyone can enter."
                : "Required for the starting Gathering Place. Open to everyone · No owner."
              : "At least one Common or Private Space is required."}
          </FoundingHelp>
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
                  <FoundingField
                    title="Zone name"
                    help="The name of this dedicated space."
                    error={fieldProblem("zone-name", zone.id)}
                  >
                    <input
                      aria-label="Zone name"
                      maxLength={100}
                      disabled={locked}
                      value={zone.name ?? ""}
                      onChange={(event) => patch({ name: event.target.value })}
                    />
                  </FoundingField>
                  <FoundingField
                    title="Purpose"
                    help="Describe what this Zone is used for."
                    error={fieldProblem("zone-purpose", zone.id)}
                  >
                    <input
                      aria-label="Zone used for"
                      maxLength={240}
                      disabled={locked}
                      value={zone.purpose ?? ""}
                      onChange={(event) => patch({ purpose: event.target.value })}
                    />
                  </FoundingField>
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
      <div className="villages-workspace-overview villages-forging-card" hidden={sheet}>
        <h3>Venues</h3>
        <section className="villages-workspace-map" aria-label="Place Venues">
          <div className="villages-founding-field-heading villages-workspace-toolbar">
            <strong role="status">
              <span>
                {placement
                  ? `${placement.presentation.x === null ? "Place" : "Move"} ${placement.name || "Venue"}`
                  : "Starting places"}
              </span>
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
              : "Select a photograph or Edit to change a Venue’s details."}
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
          <h3>Starting Venues</h3>
          {!existing ? (
            <button type="button" className="villages-workspace-draft" disabled={suggestionsBusy} onClick={onDraft}>
              {suggestionsBusy ? "Drafting…" : "Suggest names & descriptions"}
            </button>
          ) : null}
          {suggestionsChanged ? (
            <p>People or setting changed. Your edits are kept; review these drafts or request fresh suggestions.</p>
          ) : null}
          {venues.map((venue) => {
            const isPlaced = venue.presentation.x !== null && venue.presentation.y !== null;
            const problems = issues.filter((issue) => issue.venueId === venue.id && issue.field !== "placement");
            return (
              <button
                key={venue.id}
                type="button"
                data-venue-id={venue.id}
                className="villages-workspace-venue"
                aria-label={`Edit ${venue.name || "Venue"}`}
                aria-pressed={selectedId === venue.id}
                onClick={() => onSelect(venue)}
              >
                <span className="villages-workspace-photo" aria-hidden="true">
                  {venue.presentation.image ? <img src={venue.presentation.image.url} alt="" /> : <span />}
                </span>
                <span>
                  <strong>{venue.name || "Venue"}</strong>
                  <small>
                    {isPlaced ? "Placed" : "Not placed"}
                    {problems.length ? " · Needs details" : ""}
                  </small>
                </span>
                <span className="villages-people-action">Edit</span>
              </button>
            );
          })}
        </section>
      </div>
      <aside
        ref={inspector}
        className="villages-workspace-inspector villages-forging-card"
        aria-label="Venue inspector"
        hidden={!sheet}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !event.defaultPrevented) {
            event.preventDefault();
            dismiss();
          }
        }}
      >
        {selected ? (
          <>
            <header className="villages-workspace-detail-heading">
              <h3>{selected.name || "Venue"}</h3>
            </header>
            <div className="villages-workspace-back">
              <button type="button" onClick={dismiss}>
                Return to placement
              </button>
            </div>
            <div className="villages-workspace-assignment">
              <p>
                {gathering
                  ? "Gathering Place · Open to everyone · No owner"
                  : selected.occupancy.playerHome
                    ? "Residence · Your home"
                    : `Residence · ${people.find((person) => person.id === selected.occupancy.residentCharacterId)?.name ?? "Assigned resident"}`}{" "}
                · {selected.presentation.x === null || selected.presentation.y === null ? "Not placed" : "Placed"}
              </p>
              {!existing ? (
                <button type="button" disabled={!mapReady} onClick={() => onMove(selected)}>
                  Move
                </button>
              ) : null}
            </div>
            {locked ? (
              <p role="status">
                Preparing image. These physical details are temporarily locked; other Venues and placement remain
                available.
              </p>
            ) : null}
            <fieldset disabled={locked}>
              <FoundingField title="Venue name" help="The name of the overall place." error={fieldProblem("name")}>
                <input
                  aria-label="Venue name"
                  maxLength={100}
                  value={selected.name}
                  onChange={(event) => onPatch({ ...selected, name: event.target.value })}
                />
              </FoundingField>
              <FoundingField
                title="Physical form"
                help="Describe the overall physical place."
                error={fieldProblem("form")}
              >
                <textarea
                  aria-label="Physical form"
                  maxLength={240}
                  rows={3}
                  value={selected.form ?? ""}
                  onChange={(event) => onPatch({ ...selected, form: event.target.value })}
                />
              </FoundingField>
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
            <section data-zone-id="exterior">
              <FoundingField
                title="Exterior description"
                help="The approach or doorway just outside this Venue."
                error={fieldProblem("description", "exterior")}
              >
                <textarea
                  aria-label="Exterior description"
                  rows={3}
                  maxLength={1000}
                  disabled={locked}
                  value={selected.description}
                  onChange={(event) => onPatch({ ...selected, description: event.target.value })}
                />
              </FoundingField>
              {imageFields("exterior", selected.presentation.image)}
            </section>
            {existing ? (
              <>
                <label>
                  Selected Zone
                  <select
                    aria-label="Selected Zone"
                    value={existingZoneId}
                    onChange={(event) => changeZone(event.target.value)}
                  >
                    <option value="exterior">Exterior</option>
                    {[...(selected.spaces ?? []), ...(selected.privateSpaces ?? [])].map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name || "Unnamed Zone"}
                      </option>
                    ))}
                  </select>
                </label>
                {existingZoneId !== "exterior" ? (
                  <FoundingZoneFields
                    venue={selected}
                    people={people}
                    busy={locked}
                    onPatch={onPatch}
                    imageFields={imageFields}
                    selectedZoneId={existingZoneId}
                  />
                ) : null}
              </>
            ) : (
              ([false, true] as const).map((privateSpace) => {
                const tab = privateSpace ? "private" : "common";
                const spaces = privateSpace ? selected.privateSpaces : selected.spaces;
                const expanded = section === "zones" && zoneTab === tab;
                return (
                  <details key={tab} className="villages-workspace-space" open={expanded}>
                    <summary
                      onClick={(event) => {
                        event.preventDefault();
                        setInclusionProblem("");
                        onState({
                          ...state,
                          sections: { ...state.sections, [selected.id]: expanded ? "venue" : "zones" },
                          zones: { ...state.zones, [selected.id]: tab },
                        });
                      }}
                    >
                      {privateSpace ? "Private Space" : "Common Space"}
                      <small>
                        {spaces?.length ? `Included · ${spaces.map((zone) => zone.name).join(", ")}` : "Not included"}
                      </small>
                    </summary>
                    {expanded ? initialZones(privateSpace) : null}
                  </details>
                );
              })
            )}
            <p className="villages-workspace-save" role="status">
              {saveStatus}
            </p>
          </>
        ) : null}
      </aside>
    </div>
  );
}
