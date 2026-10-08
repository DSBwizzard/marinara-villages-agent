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
  const attention = new Set(issues.filter((issue) => issue.field !== "placement").map((issue) => issue.venueId)).size;
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
  const sheet = narrow && state.view === "details" && !!selected;
  const dismiss = () => onState({ ...state, view: "map" });
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setNarrow(element.getBoundingClientRect().width < 704));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (sheet && !wasSheet.current) inspector.current?.querySelector<HTMLElement>("button")?.focus();
    if (!sheet && wasSheet.current)
      [...(root.current?.querySelectorAll<HTMLElement>("[data-pin-id]") ?? [])]
        .find((element) => element.dataset.pinId === selectedId)
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
  const changeSection = (next: "venue" | "zones") =>
    selected && onState({ ...state, sections: { ...state.sections, [selected.id]: next } });
  const changeZone = (next: string) =>
    selected && onState({ ...state, zones: { ...state.zones, [selected.id]: next } });
  const imageFields = (area: Area, image: VillageVenueImage | null | undefined, id?: string) =>
    selected && (
      <section className="villages-workspace-artwork" aria-label={`${area} photograph`}>
        <p>{area === "exterior" ? "Exterior photograph" : "Zone photograph"} · optional</p>
        {image ? (
          <a href={image.url} target="_blank" rel="noreferrer" aria-label="View photograph">
            <img src={image.url} alt={`${area} of ${selected.name}`} />
          </a>
        ) : (
          <span>No photograph added.</span>
        )}
        <details>
          <summary>{image ? "Change photo" : "Add photo"}</summary>
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
            <p>Form, the selected Zone’s purpose and description, and shared scenery style inform this artwork.</p>
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
        {area === "exterior" ? <small>Also used as the map marker.</small> : null}
      </section>
    );
  const included = personal ? !!selected?.privateSpaces?.length : !!selected?.spaces?.length;
  const gathering = selected?.category === "public-center";
  const initialZones = selected && (
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
      <p>
        {gathering
          ? personal
            ? "The starting Gathering Place has no Private Space. It is a neutral meeting spot everyone can enter."
            : "Required for the starting Gathering Place. Open to everyone · No owner."
          : "At least one Common or Private Space is required."}
      </p>
      {inclusionProblem ? <p role="alert">{inclusionProblem}</p> : null}
      {!included ? (
        <p>
          {personal ? "Private" : "Common"} Space is not included.{" "}
          {state.inactive?.[selected.id]?.[personal ? "private" : "common"]?.length
            ? "Its previous draft and photographs are kept."
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
              <label>
                Zone name
                <input
                  aria-label="Zone name"
                  maxLength={100}
                  disabled={locked}
                  value={zone.name ?? ""}
                  onChange={(event) => patch({ name: event.target.value })}
                />
              </label>
              <label>
                Purpose
                <input
                  aria-label="Zone used for"
                  maxLength={240}
                  disabled={locked}
                  value={zone.purpose ?? ""}
                  onChange={(event) => patch({ purpose: event.target.value })}
                />
              </label>
              {hidden ? (
                <p>The private interior is prepared for this resident after founding and stays hidden until invited.</p>
              ) : (
                <label>
                  Description
                  <textarea
                    aria-label="Zone appearance"
                    rows={3}
                    maxLength={1000}
                    disabled={locked}
                    value={zone.description}
                    onChange={(event) => patch({ description: event.target.value })}
                  />
                </label>
              )}
              <p>
                Access:{" "}
                {gathering
                  ? "Open to everyone."
                  : personal
                    ? "Entry follows this personal space’s invitation rules."
                    : "Entry follows this home’s invitation rules."}
              </p>
              {!hidden ? imageFields(personal ? "private" : "interior", zone.image, zone.id) : null}
            </section>
          );
        })
      )}
    </>
  );
  return (
    <div ref={root} className="villages-workspace" data-view={state.view} data-sheet={sheet} data-narrow={narrow}>
      <div className="villages-workspace-toolbar" inert={sheet}>
        <strong role="status">
          <span>
            {placed} / {venues.length} placed
          </span>
          {placement ? (
            <small>
              {placement.presentation.x === null ? "Next" : "Move"}: {placement.name || "Venue"}
            </small>
          ) : null}
        </strong>
        <span>{attention ? `${attention} need details` : "Details ready"}</span>
        {!existing ? (
          <button type="button" className="villages-workspace-draft" disabled={suggestionsBusy} onClick={onDraft}>
            {suggestionsBusy ? "Drafting…" : "Draft starting Venues"}
          </button>
        ) : null}
        {onArrange ? (
          <button
            type="button"
            aria-label="Arrange automatically"
            className="villages-workspace-arrange"
            onClick={onArrange}
          >
            Arrange
          </button>
        ) : null}
        {!existing && placed < venues.length ? (
          <button type="button" disabled={!mapReady} onClick={onContinue}>
            Continue placing
          </button>
        ) : null}
      </div>
      {suggestionsChanged ? (
        <p className="villages-workspace-notice">
          People or setting changed. Your edits are kept; review these drafts or request fresh suggestions.
        </p>
      ) : null}
      <div className="villages-workspace-grid">
        <section className="villages-workspace-map" aria-label="Place Venues" inert={sheet}>
          {map}
          <p>Tap a photograph to edit its Venue.</p>
        </section>
        <aside
          ref={inspector}
          className="villages-workspace-inspector"
          role={sheet ? "dialog" : undefined}
          aria-modal={sheet ? true : undefined}
          aria-label="Venue inspector"
          onKeyDown={(event) => {
            if (!sheet) return;
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              dismiss();
            }
            if (event.key === "Tab") {
              const fields = [
                ...(inspector.current?.querySelectorAll<HTMLElement>(
                  "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),summary,a[href]",
                ) ?? []),
              ].filter((element) => element.getClientRects().length > 0);
              const first = fields[0],
                last = fields.at(-1);
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              }
              if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <div className="villages-workspace-back">
            <button type="button" onClick={dismiss}>
              Return to map
            </button>
          </div>
          {selected ? (
            <>
              <header className="villages-workspace-detail-heading">
                <h3>{selected.name || "Venue"}</h3>
                {!existing ? (
                  <button type="button" disabled={!mapReady} onClick={() => onMove(selected)}>
                    Move
                  </button>
                ) : null}
              </header>
              <p>
                {gathering
                  ? "Gathering Place · Open to everyone · No owner"
                  : selected.occupancy.playerHome
                    ? "Residence · Your home"
                    : `Residence · ${people.find((person) => person.id === selected.occupancy.residentCharacterId)?.name ?? "Assigned resident"}`}{" "}
                · {selected.presentation.x === null || selected.presentation.y === null ? "Not placed" : "Placed"}
              </p>
              <div role="group" aria-label="Venue detail section" className="villages-workspace-tabs">
                {(["venue", "zones"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={section === tab}
                    onClick={() => {
                      setInclusionProblem("");
                      changeSection(tab);
                    }}
                  >
                    {tab === "venue" ? "Venue" : "Zones"}
                  </button>
                ))}
              </div>
              {locked ? (
                <p role="status">
                  Preparing image. These physical details are temporarily locked; other Venues and placement remain
                  available.
                </p>
              ) : null}
              {section === "venue" ? (
                <fieldset disabled={locked}>
                  <label>
                    Venue name
                    <input
                      aria-label="Venue name"
                      maxLength={100}
                      value={selected.name}
                      onChange={(event) => onPatch({ ...selected, name: event.target.value })}
                    />
                  </label>
                  <label>
                    Form<p>Describe the overall physical place.</p>
                    <textarea
                      aria-label="Physical form"
                      maxLength={240}
                      rows={3}
                      value={selected.form ?? ""}
                      onChange={(event) => onPatch({ ...selected, form: event.target.value })}
                    />
                  </label>
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
                  <button type="button" onClick={() => changeSection("zones")}>
                    Edit this Venue’s Zones
                  </button>
                </fieldset>
              ) : (
                <>
                  <div role="group" aria-label="Venue Zones" className="villages-workspace-tabs">
                    {(["exterior", "common", "private"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        aria-pressed={zoneTab === tab}
                        onClick={() => {
                          setInclusionProblem("");
                          changeZone(tab);
                        }}
                      >
                        {tab === "exterior" ? "Exterior" : tab === "common" ? "Common" : "Private"}
                      </button>
                    ))}
                  </div>
                  {existing ? (
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
                  ) : null}
                  {(existing ? existingZoneId : zoneTab) === "exterior" ? (
                    <section>
                      <h4>Exterior</h4>
                      <p>The approach or doorway just outside this Venue.</p>
                      <label>
                        Exterior description
                        <textarea
                          aria-label="Exterior description"
                          rows={3}
                          maxLength={1000}
                          disabled={locked}
                          value={selected.description}
                          onChange={(event) => onPatch({ ...selected, description: event.target.value })}
                        />
                      </label>
                      {imageFields("exterior", selected.presentation.image)}
                    </section>
                  ) : existing ? (
                    <FoundingZoneFields
                      venue={selected}
                      people={people}
                      busy={locked}
                      onPatch={onPatch}
                      imageFields={imageFields}
                      selectedZoneId={existingZoneId}
                    />
                  ) : (
                    initialZones
                  )}
                </>
              )}
              <p className="villages-workspace-save" role="status">
                {saveStatus}
              </p>
            </>
          ) : (
            <p>Place your Venues, then tap a photograph to refine its details. Photograph artwork is optional.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
