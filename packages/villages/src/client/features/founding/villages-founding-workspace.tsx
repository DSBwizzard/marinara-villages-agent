import { FoundingHelp } from "./FoundingField.js";
import type { VillageVenue, VillageVenueImage } from "../../../shared/contracts/village.js";
import { includeFoundingZone } from "./founding-template.js";
import type { FoundingIssue, FoundingWorkspaceState } from "./villages-founding-workspace-state.js";
import { FoundingConnections, FoundingZoneFields } from "./villages-founding-zones.js";
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";

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
  saveError,
  onState,
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
  saveError?: string;
  onState(state: FoundingWorkspaceState): void;
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
  const viewer = useRef<HTMLDialogElement>(null);
  const backdropPress = useRef(false);
  const viewerBackdropPress = useRef(false);
  const uploadPending = useRef(false);
  const uploadOpener = useRef<HTMLButtonElement | null>(null);
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);
  const finishUpload = useCallback(() => {
    if (!uploadPending.current) return;
    requestAnimationFrame(() => {
      if (!uploadPending.current) return;
      uploadPending.current = false;
      if (inspector.current?.open && !viewer.current?.open && uploadOpener.current?.isConnected)
        uploadOpener.current.focus({ preventScroll: true });
    });
  }, []);
  const outside = (node: HTMLDialogElement, x: number, y: number) => {
    const box = node.getBoundingClientRect();
    return x < box.left || x > box.right || y < box.top || y > box.bottom;
  };
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
  const headerZone =
    activeTab === "exterior"
      ? undefined
      : ((activeTab === "private" ? selected?.privateSpaces : selected?.spaces)?.find(
          (zone) => zone.id === existingZoneId,
        ) ?? (activeTab === "private" ? selected?.privateSpaces : selected?.spaces)?.[0]);
  const privateHeaderHidden = activeTab === "private" && headerZone?.ownerId !== "player";
  const patchHeaderZone = (patch: {
    name?: string;
    purpose?: string;
    description?: string;
    roomSpecification?: string;
  }) => {
    if (!selected || !headerZone) return;
    onPatch(
      activeTab === "private"
        ? {
            ...selected,
            privateSpaces: selected.privateSpaces?.map((zone) =>
              zone.id === headerZone.id ? { ...zone, ...patch } : zone,
            ),
          }
        : {
            ...selected,
            spaces: selected.spaces?.map((zone) => (zone.id === headerZone.id ? { ...zone, ...patch } : zone)),
          },
    );
  };
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
    const pickerCancel = (event: Event) => {
      if (event.target instanceof HTMLInputElement && event.target.type === "file") {
        event.stopPropagation();
        finishUpload();
      }
    };
    node.addEventListener("cancel", pickerCancel, true);
    window.addEventListener("focus", finishUpload);
    node.showModal();
    node.querySelector<HTMLElement>("[data-close-sheet]")?.focus();
    return () => {
      node.removeEventListener("cancel", pickerCancel, true);
      window.removeEventListener("focus", finishUpload);
      uploadPending.current = false;
      backdropPress.current = false;
      node.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected && opener !== document.body)
        opener.focus({ preventScroll: true });
      else
        [...(root.current?.querySelectorAll<HTMLElement>("[data-venue-id], [data-pin-id]") ?? [])]
          .find((element) => (element.dataset.venueId ?? element.dataset.pinId) === selectedId)
          ?.focus({ preventScroll: true });
    };
  }, [sheet, selectedId, finishUpload]);
  useEffect(() => {
    setPreview(null);
    inspector.current?.querySelector<HTMLElement>(".villages-workspace-sheet-body")?.scrollTo({ top: 0 });
  }, [sheet, selectedId, activeTab]);
  useEffect(() => {
    const node = viewer.current;
    if (!preview || !sheet || !node) return;
    const opener = document.activeElement;
    node.showModal();
    return () => {
      node.close();
      viewerBackdropPress.current = false;
      if (inspector.current?.open && opener instanceof HTMLElement && opener.isConnected)
        opener.focus({ preventScroll: true });
    };
  }, [preview, sheet]);
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
    const containers = [...(inspector.current?.querySelectorAll<HTMLElement>("[data-zone-id]") ?? [])].filter(
      (element) => element.dataset.zoneId === focusIssue.zoneId,
    );
    const selector = `[aria-label="${labels[focusIssue.field]}"]`;
    const field = focusIssue.zoneId
      ? containers.map((element) => element.querySelector<HTMLElement>(selector)).find(Boolean)
      : inspector.current?.querySelector<HTMLElement>(selector);
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
        <div className="villages-workspace-image-actions">
          <button type="button" disabled={imageBusy} onClick={() => onGenerate(selected, area, id)}>
            {image ? "Generate again" : "Generate image"}
          </button>
          <button
            type="button"
            disabled={imageBusy}
            onClick={(event) => {
              uploadPending.current = true;
              backdropPress.current = false;
              uploadOpener.current = event.currentTarget;
              event.currentTarget.parentElement?.querySelector<HTMLInputElement>('input[type="file"]')?.click();
            }}
          >
            Upload image
          </button>
          <input
            hidden
            aria-label={`Upload ${area} image`}
            type="file"
            accept="image/*"
            disabled={imageBusy}
            onChange={(event) => {
              finishUpload();
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onUpload(selected, area, file, id);
            }}
          />
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
          ) : (
            <button type="button" disabled>
              Remove image
            </button>
          )}
        </div>
        {image ? (
          <button
            type="button"
            className="villages-workspace-image-preview"
            aria-label="View image"
            onClick={() => setPreview({ url: image.url, label: `${area} of ${selected.name}` })}
          >
            <img src={image.url} alt={`${area} of ${selected.name}`} />
          </button>
        ) : (
          <div className="villages-workspace-image-placeholder">No image yet</div>
        )}
      </section>
    );
  const fieldProblem = (field: FoundingIssue["field"], zoneId?: string) =>
    focusIssue
      ? issues.find((issue) => issue.venueId === selectedId && issue.field === field && issue.zoneId === zoneId)
          ?.message
      : undefined;
  const community = selected?.category === "public-center";
  const inclusionControl = (personal: boolean) =>
    selected && (
      <>
        <div className="villages-workspace-inclusion" data-zone-id={personal ? "private" : "common"}>
          <label className="villages-workspace-included">
            <input
              aria-label={`Include ${personal ? "Private" : "Common"} Space`}
              type="checkbox"
              disabled={locked || community}
              checked={personal ? !!selected.privateSpaces?.length : !!selected.spaces?.length}
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
            {community
              ? personal
                ? "The starting Community Place has no Private Space. It is a neutral meeting spot everyone can enter."
                : "Required for the starting Community Place. Open to everyone · No owner."
              : "At least one Common or Private Space is required."}
          </FoundingHelp>
        </div>
        {fieldProblem("layout", "common") ? <p role="alert">{fieldProblem("layout", "common")}</p> : null}
        {inclusionProblem ? <p role="alert">{inclusionProblem}</p> : null}
      </>
    );
  const initialZones = (personal: boolean) => {
    const included = personal ? !!selected?.privateSpaces?.length : !!selected?.spaces?.length;
    return (
      selected && (
        <>
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
              return (
                <section key={zone.id} data-zone-id={zone.id}>
                  {hidden ? (
                    <FoundingHelp label="Private interior">
                      This interior is prepared privately. Discover it on your first authorized visit.
                    </FoundingHelp>
                  ) : null}
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
              : "Tap a photograph to edit."}
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
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]',
            ),
          ].filter((control) => control.tabIndex >= 0 && control.getClientRects().length > 0);
          const index = controls.indexOf(document.activeElement as HTMLElement);
          if (index < 0 || (event.shiftKey ? index === 0 : index === controls.length - 1)) {
            event.preventDefault();
            (event.shiftKey ? controls.at(-1) : controls[0])?.focus();
          }
        }}
        aria-modal="true"
        onCancel={(event) => {
          event.preventDefault();
          if (event.target === event.currentTarget && !uploadPending.current) dismiss();
        }}
        onPointerCancel={() => {
          backdropPress.current = false;
        }}
        onPointerDown={(event) => {
          backdropPress.current =
            !uploadPending.current &&
            event.target === event.currentTarget &&
            outside(event.currentTarget, event.clientX, event.clientY);
          if (uploadPending.current) finishUpload();
        }}
        onClick={(event) => {
          const beganOutside = backdropPress.current;
          backdropPress.current = false;
          if (
            beganOutside &&
            !uploadPending.current &&
            event.target === event.currentTarget &&
            outside(event.currentTarget, event.clientX, event.clientY)
          )
            dismiss();
        }}
      >
        {selected ? (
          <>
            <div className="villages-workspace-sheet-body">
              <header className="villages-workspace-sheet-header villages-workspace-venue-identity">
                <div className="villages-workspace-box-field">
                  <label className="villages-workspace-caption" htmlFor={tabId + "Venue-name"}>
                    Venue name
                  </label>
                  <div className="villages-workspace-sheet-summary">
                    <textarea
                      id={tabId + "Venue-name"}
                      aria-label="Venue name"
                      placeholder="Venue name"
                      rows={1}
                      maxLength={100}
                      disabled={locked}
                      value={selected.name}
                      aria-invalid={!!fieldProblem("name")}
                      onChange={(event) => onPatch({ ...selected, name: event.target.value })}
                    />
                  </div>
                  {fieldProblem("name") ? <p role="alert">{fieldProblem("name")}</p> : null}
                </div>
                <div className="villages-workspace-box-field">
                  <label className="villages-workspace-caption" htmlFor={tabId + "Physical-form"}>
                    Venue form
                  </label>
                  <div className="villages-workspace-sheet-summary">
                    <textarea
                      id={tabId + "Physical-form"}
                      aria-label="Physical form"
                      placeholder="Venue form"
                      rows={2}
                      maxLength={240}
                      disabled={locked}
                      value={selected.form ?? ""}
                      aria-invalid={!!fieldProblem("form")}
                      onChange={(event) => onPatch({ ...selected, form: event.target.value })}
                    />
                    <FoundingHelp label="Form">Describe the overall physical place.</FoundingHelp>
                  </div>
                  {fieldProblem("form") ? <p role="alert">{fieldProblem("form")}</p> : null}
                </div>
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
              <section role="tabpanel" id={tabId + "panel"} aria-labelledby={tabId + activeTab}>
                {activeTab !== "exterior" && !existing ? inclusionControl(activeTab === "private") : null}
                <div
                  className="villages-workspace-sheet-header villages-workspace-zone-fields"
                  data-zone-id={activeTab === "exterior" ? "exterior" : headerZone?.id}
                >
                  {activeTab === "exterior" ? (
                    <>
                      <div className="villages-workspace-box-field">
                        <label className="villages-workspace-caption" htmlFor={tabId + "Exterior-description"}>
                          Exterior and approach
                        </label>
                        <div className="villages-workspace-sheet-summary">
                          <textarea
                            id={tabId + "Exterior-description"}
                            aria-label="Exterior description"
                            placeholder="Zone appearance"
                            rows={3}
                            maxLength={1000}
                            disabled={locked}
                            value={selected.description}
                            aria-invalid={!!fieldProblem("description", "exterior")}
                            onChange={(event) => onPatch({ ...selected, description: event.target.value })}
                          />
                          <FoundingHelp label="Exterior and approach">
                            Describe the entrance, approach and visible exterior of this Venue.
                          </FoundingHelp>
                        </div>
                        {fieldProblem("description", "exterior") ? (
                          <p role="alert">{fieldProblem("description", "exterior")}</p>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="villages-workspace-box-field">
                        <label className="villages-workspace-caption" htmlFor={tabId + "Zone-name"}>
                          Zone name
                        </label>
                        <div className="villages-workspace-sheet-summary">
                          <textarea
                            id={tabId + "Zone-name"}
                            aria-label="Zone name"
                            placeholder="Zone name"
                            rows={1}
                            maxLength={100}
                            disabled={locked || !headerZone}
                            value={headerZone?.name ?? ""}
                            aria-invalid={!!fieldProblem("zone-name", headerZone?.id)}
                            onChange={(event) => patchHeaderZone({ name: event.target.value })}
                          />
                        </div>
                        {fieldProblem("zone-name", headerZone?.id) ? (
                          <p role="alert">{fieldProblem("zone-name", headerZone?.id)}</p>
                        ) : null}
                      </div>
                      {headerZone ? (
                        <>
                          <div className="villages-workspace-box-field">
                            <label className="villages-workspace-caption" htmlFor={tabId + "Zone-used-for"}>
                              Zone purpose
                            </label>
                            <div className="villages-workspace-sheet-summary">
                              <textarea
                                id={tabId + "Zone-used-for"}
                                aria-label="Zone used for"
                                placeholder="Zone purpose"
                                rows={2}
                                maxLength={240}
                                disabled={locked}
                                value={headerZone.purpose ?? ""}
                                aria-invalid={!!fieldProblem("zone-purpose", headerZone.id)}
                                onChange={(event) => patchHeaderZone({ purpose: event.target.value })}
                              />
                              <FoundingHelp label="Zone purpose">Describe what this space is used for.</FoundingHelp>
                            </div>
                            {fieldProblem("zone-purpose", headerZone.id) ? (
                              <p role="alert">{fieldProblem("zone-purpose", headerZone.id)}</p>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                      {headerZone && privateHeaderHidden ? (
                        <div className="villages-workspace-box-field">
                          <label className="villages-workspace-caption" htmlFor={tabId + "Room-specification"}>
                            Room specification (optional)
                          </label>
                          <textarea
                            id={tabId + "Room-specification"}
                            aria-label="Room specification"
                            placeholder="A small bedroom with a garden-facing window…"
                            rows={3}
                            maxLength={1000}
                            disabled={locked}
                            value={headerZone.roomSpecification ?? ""}
                            onChange={(event) => patchHeaderZone({ roomSpecification: event.target.value })}
                          />
                          <p>
                            {selected.occupancy.residentCharacterId
                              ? `${people.find((person) => person.id === selected.occupancy.residentCharacterId)?.name ?? "The resident"} will personalize this interior. Discover it when they invite you inside.`
                              : "This specification describes the provided space. Its prepared interior stays hidden until entry."}
                          </p>
                        </div>
                      ) : null}
                      {headerZone && !privateHeaderHidden ? (
                        <>
                          <div className="villages-workspace-box-field">
                            <label className="villages-workspace-caption" htmlFor={tabId + "Zone-appearance"}>
                              Zone appearance
                            </label>
                            <div className="villages-workspace-sheet-summary">
                              <textarea
                                id={tabId + "Zone-appearance"}
                                aria-label="Zone appearance"
                                placeholder="Zone appearance"
                                rows={3}
                                maxLength={1000}
                                disabled={locked}
                                value={headerZone.description}
                                aria-invalid={!!fieldProblem("zone-appearance", headerZone.id)}
                                onChange={(event) => patchHeaderZone({ description: event.target.value })}
                              />
                              <FoundingHelp label="Zone appearance">
                                Describe the visible interior of this space.
                              </FoundingHelp>
                            </div>
                            {fieldProblem("zone-appearance", headerZone.id) ? (
                              <p role="alert">{fieldProblem("zone-appearance", headerZone.id)}</p>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </>
                  )}
                </div>
                {locked ? <p role="status">Preparing image. These physical details are temporarily locked.</p> : null}
                {activeTab === "exterior" ? (
                  <section data-zone-id="exterior">
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
                                      (row) =>
                                        row.id !== selected.id && row.occupancy.residentCharacterId === person.id,
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
                        identityInHeader
                      />
                    ) : null}
                  </>
                ) : (
                  initialZones(activeTab === "private")
                )}
                {!existing ? <FoundingConnections venue={selected} onPatch={onPatch} /> : null}
              </section>
            </div>
            <footer className="villages-workspace-sheet-footer">
              {saveError ? <p role="alert">{saveError}</p> : null}
              <div>
                <button type="button" data-close-sheet className="villages-forging-primary" onClick={dismiss}>
                  Done
                </button>
              </div>
            </footer>
          </>
        ) : null}
      </dialog>
      <dialog
        ref={viewer}
        className="villages-workspace-image-viewer"
        aria-label="Venue image viewer"
        onCancel={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setPreview(null);
        }}
        onPointerCancel={() => {
          viewerBackdropPress.current = false;
        }}
        onPointerDown={(event) => {
          viewerBackdropPress.current =
            event.target === event.currentTarget && outside(event.currentTarget, event.clientX, event.clientY);
        }}
        onClick={(event) => {
          const beganOutside = viewerBackdropPress.current;
          viewerBackdropPress.current = false;
          if (
            beganOutside &&
            event.target === event.currentTarget &&
            outside(event.currentTarget, event.clientX, event.clientY)
          )
            setPreview(null);
        }}
      >
        <button type="button" onClick={() => setPreview(null)}>
          Close image
        </button>
        {preview ? <img src={preview.url} alt={preview.label} /> : null}
      </dialog>
    </div>
  );
}
