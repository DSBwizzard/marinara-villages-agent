import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { SetupVenueDraft } from "../../shared/types.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { addFoundingZone } from "./founding-template.js";
import {
  assignFoundingPrivateZone,
  foundingHomeMembers,
  foundingSleepZones,
  reconcileFoundingHome,
} from "./founding-homes.js";
import { QuickStartZoneArtwork } from "./QuickStartZoneArtwork.js";
import { draftZonePolicy, FoundingConnections, foundingLayoutProblem } from "./villages-founding-zones.js";
import {
  foundingVenueIssues,
  type FoundingIssue,
  type FoundingWorkspaceState,
} from "./villages-founding-workspace-state.js";

export function QuickStartVenues({
  venues,
  people,
  selectedId,
  movingVenueId,
  state,
  busy,
  imageBusy,
  focusIssue,
  saveError,
  problem,
  map,
  onState,
  onSelect,
  onPatch,
  onGenerateImage,
  onUploadImage,
  onArrange,
  onMove,
  communityVenueId,
  onRemove,
  actions,
  mapArtwork,
  onAssignHome,
  onCommunityVenue,
  suggestions,
}: {
  venues: SetupVenueDraft[];
  people: { id: string; name: string }[];
  selectedId: string | null;
  movingVenueId?: string | null;
  state: FoundingWorkspaceState;
  busy: boolean;
  imageBusy: boolean;
  focusIssue: FoundingIssue | null;
  saveError?: string;
  problem?: string;
  map: ReactNode;
  onState(state: FoundingWorkspaceState): void;
  onSelect(venue: SetupVenueDraft): void;
  onPatch(venue: SetupVenueDraft): void;
  onGenerateImage(venue: VillageVenue, area: "exterior" | "interior" | "private", zoneId?: string): void;
  onUploadImage(venue: VillageVenue, area: "exterior" | "interior" | "private", file: File, zoneId?: string): void;
  onArrange(): void;
  onMove(venue: VillageVenue | null): void;
  communityVenueId?: string;
  onRemove?(venue: VillageVenue): void;
  actions?: ReactNode;
  mapArtwork?: ReactNode;
  suggestions?: ReactNode;
  onAssignHome?(venue: VillageVenue, actorId: string, assigned: boolean): void;
  onCommunityVenue?(venue: VillageVenue): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mapDetails = useRef<HTMLElement>(null);
  const zoneFields = useRef<HTMLFieldSetElement>(null);
  const fieldId = useId();
  const [artworkOpen, setArtworkOpen] = useState(false);
  const [layoutError, setLayoutError] = useState("");
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [zoneId, setZoneId] = useState("exterior");
  const selected = venues.find((venue) => venue.id === selectedId);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const open = state.view === "details" && !!selected;
  const moving = !open && !state.paused ? venues.find((venue) => venue.id === movingVenueId) : undefined;
  const issues = foundingVenueIssues(venues, false);
  const actors = [{ id: "player", name: "You" }, ...people];
  const unassigned = actors.filter(
    (person) =>
      !venues.some((venue) => venue.classes?.includes("residence") && foundingHomeMembers(venue).includes(person.id)),
  );
  const patch = (venue: SetupVenueDraft) => onPatch(reconcileFoundingHome(venue));
  const close = () => onState({ ...state, view: "map", paused: true });
  const selectZone = (id: string) => {
    setZoneId(id);
    setArtworkOpen(false);
    if (window.matchMedia("(max-width:727px)").matches)
      requestAnimationFrame(() => zoneFields.current?.scrollIntoView({ block: "nearest" }));
  };
  const finish = () => {
    if (!selected) return;
    setSaveAttempted(true);
    const problem = foundingLayoutProblem(selected);
    setLayoutError(problem);
    if (problem) return;
    const issue = issues.find(
      (issue) =>
        issue.venueId === selected.id &&
        ["name", "form", "description", "zone-name", "zone-purpose", "zone-appearance"].includes(issue.field),
    );
    if (issue) {
      if (issue.zoneId) selectZone(issue.zoneId);
    } else close();
  };
  useEffect(() => setLayoutError(""), [selected, open]);
  useEffect(() => setSaveAttempted(false), [open, selectedId]);
  const personal = !!selected?.privateSpaces?.some((zone) => zone.id === zoneId);
  const zone = [...(selected?.spaces ?? []), ...(selected?.privateSpaces ?? [])].find((row) => row.id === zoneId);
  const area = zoneId === "exterior" ? "exterior" : personal ? "private" : "interior";
  const image = zoneId === "exterior" ? selected?.presentation.image : zone?.image;
  const fieldIssue = (field: FoundingIssue["field"]) =>
    saveAttempted || focusIssue?.venueId === selected?.id
      ? issues.find(
          (issue) =>
            issue.venueId === selected?.id && issue.field === field && (!issue.zoneId || issue.zoneId === zoneId),
        )
      : undefined;
  const errorProps = (field: FoundingIssue["field"]) => ({
    "aria-invalid": fieldIssue(field) ? true : undefined,
    "aria-describedby": fieldIssue(field) ? `${fieldId}-error-${field}` : undefined,
  });
  const fieldError = (field: FoundingIssue["field"]) =>
    fieldIssue(field) ? (
      <span className="villages-quick-field-error" id={`${fieldId}-error-${field}`} role="alert">
        {fieldIssue(field)?.message}
      </span>
    ) : null;
  useEffect(() => {
    const node = dialog.current;
    if (!open || !node) return;
    const opener = document.activeElement;
    if (window.matchMedia("(max-width:727px)").matches) {
      node.style.setProperty("--quick-editor-height", `${window.innerHeight * 0.92}px`);
      node.style.setProperty("--quick-editor-top", `${window.innerHeight * 0.08}px`);
    }
    const pickerCancel = (event: Event) => {
      if (event.target instanceof HTMLInputElement && event.target.type === "file") {
        const input = event.target;
        event.stopPropagation();
        requestAnimationFrame(() => {
          if (node.open && input.isConnected) input.focus({ preventScroll: true });
        });
      }
    };
    node.addEventListener("cancel", pickerCancel, true);
    node.showModal();
    node.querySelector<HTMLElement>("[data-close-quick]")?.focus();
    return () => {
      node.removeEventListener("cancel", pickerCancel, true);
      node.close();
      node.style.removeProperty("--quick-editor-height");
      node.style.removeProperty("--quick-editor-top");
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, selected?.id]);
  useEffect(() => {
    const venue = selectedRef.current;
    if (!venue || !open) return;
    const target = focusIssue?.venueId === venue.id ? focusIssue.zoneId : undefined;
    setZoneId(
      target === "common"
        ? (venue.spaces?.[0]?.id ?? "exterior")
        : target === "private"
          ? (venue.privateSpaces?.[0]?.id ?? "exterior")
          : (target ?? "exterior"),
    );
    setArtworkOpen(false);
  }, [open, selectedId, focusIssue]);
  useEffect(() => {
    if (focusIssue?.field === "placement") mapDetails.current?.scrollIntoView({ block: "nearest" });
  }, [focusIssue]);
  const patchZone = (change: Partial<NonNullable<VillageVenue["spaces"]>[number]>) => {
    if (!selected) return;
    const key = personal ? "privateSpaces" : "spaces";
    patch({ ...selected, [key]: selected[key]?.map((row) => (row.id === zoneId ? { ...row, ...change } : row)) });
  };
  const addPrivateZone = (venue: SetupVenueDraft, actor: string) => {
    const id = `zone:${createVillagesClientId()}`;
    const next = addFoundingZone(venue, true, id);
    if (next === venue) return;
    const named = {
      ...next,
      privateSpaces: next.privateSpaces?.map((row) =>
        row.id === id
          ? {
              ...row,
              name:
                actor === "player"
                  ? "Your private Zone"
                  : `${actors.find((person) => person.id === actor)?.name ?? "Resident"}'s private Zone`.slice(0, 100),
            }
          : row,
      ),
    };
    patch(assignFoundingPrivateZone(named, id, actor));
    if (selected?.id === venue.id) selectZone(id);
  };
  const addZone = () => {
    if (!selected) return;
    const id = `zone:${createVillagesClientId()}`;
    const next = addFoundingZone(selected, false, id);
    if (next !== selected) {
      patch(next);
      selectZone(id);
    }
  };
  const changeUse = (actor: string) => {
    if (!selected || !zone) return;
    const shared = actor === "shared";
    const changed = {
      ...zone,
      ownerId: "",
      controllerIds: undefined,
      access: draftZonePolicy(selected, { ...zone, ownerId: "" }, !shared),
    };
    const next = {
      ...selected,
      spaces: [...(selected.spaces ?? []).filter((row) => row.id !== zone.id), ...(shared ? [changed] : [])],
      privateSpaces: [
        ...(selected.privateSpaces ?? []).filter((row) => row.id !== zone.id),
        ...(!shared ? [changed] : []),
      ],
    };
    next.layout = next.spaces.length ? (next.privateSpaces.length ? "both" : "common") : "private";
    patch(shared ? next : assignFoundingPrivateZone(next, zone.id, actor));
  };
  return (
    <section className="villages-quick-start" aria-label="Venues">
      <section className="villages-forging-card villages-quick-venue-list" aria-label="Starting Venues">
        <header className="villages-venue-heading">
          <h2>Starting Venues</h2>
          <div className="villages-quick-venue-actions">{actions}</div>
        </header>
        {onAssignHome && unassigned.length ? (
          <p role="status">Choose a home for {unassigned.map((person) => person.name).join(", ")}.</p>
        ) : null}
        {[
          ...venues.filter((venue) => venue.classes?.includes("residence")),
          ...venues.filter((venue) => !venue.classes?.includes("residence")),
        ].map((venue) => {
          const home = venue.classes?.includes("residence");
          const community = venue.id === communityVenueId;
          const members = foundingHomeMembers(venue);
          const canRemove = !!onRemove && !community && !members.length && !venue.workerIds?.length;
          return (
            <section
              key={venue.id}
              className="villages-quick-venue-card"
              aria-label={venue.name || "Venue"}
              data-venue-id={venue.id}
              data-selected={selectedId === venue.id}
            >
              <div className="villages-quick-venue-summary">
                {venue.presentation.image ? (
                  <img className="villages-quick-venue-thumbnail" src={venue.presentation.image.url} alt="" />
                ) : null}
                <div className="villages-quick-venue-title">
                  <h3>
                    <button type="button" disabled={busy || imageBusy} onClick={() => onSelect(venue)}>
                      {venue.name || "Venue"}
                    </button>
                  </h3>
                  {community ? (
                    <span className="villages-quick-venue-badge">Community Venue</span>
                  ) : home ? (
                    <span className="villages-quick-venue-badge">{members.length ? "Home" : "Vacant home"}</span>
                  ) : null}
                  {community ? <p>Starting meeting place</p> : !home ? <p>{venue.description}</p> : null}
                </div>
                <button
                  type="button"
                  disabled={busy || imageBusy}
                  aria-label={`Place ${venue.name || "Venue"} on map`}
                  title="Place on map"
                  aria-pressed={moving?.id === venue.id}
                  onClick={() => onMove(moving?.id === venue.id ? null : venue)}
                >
                  ⌖
                </button>
                <button
                  type="button"
                  disabled={busy || imageBusy}
                  aria-label={`Edit ${venue.name || "Venue"}`}
                  onClick={() => onSelect(venue)}
                >
                  Edit
                </button>
              </div>
              {home && onAssignHome ? (
                <>
                  <fieldset className="villages-quick-home-people" disabled={busy || imageBusy}>
                    <legend>Who lives here?</legend>
                    {actors.map((person) => (
                      <label key={person.id}>
                        <input
                          autoComplete="off"
                          type="checkbox"
                          aria-label={person.name}
                          checked={members.includes(person.id)}
                          onChange={(event) => onAssignHome(venue, person.id, event.target.checked)}
                        />
                        {person.name}
                      </label>
                    ))}
                  </fieldset>
                  <div className="villages-quick-home-capacity">
                    <span>
                      {members.length} {members.length === 1 ? "resident" : "residents"}
                    </span>
                    <label>
                      Capacity{" "}
                      <select
                        aria-label={`Capacity for ${venue.name}`}
                        disabled={busy || imageBusy}
                        value={
                          venue.foundingCapacity === null
                            ? "auto"
                            : String(venue.foundingCapacity ?? venue.residenceCapacity ?? 1)
                        }
                        onChange={(event) =>
                          patch({
                            ...venue,
                            foundingCapacity: event.target.value === "auto" ? null : Number(event.target.value),
                          })
                        }
                      >
                        <option value="auto">Automatic ({Math.max(1, members.length)})</option>
                        {[1, 2, 3, 4].map((count) => (
                          <option key={count} value={count} disabled={count < members.length}>
                            Fixed: {count}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {members.map((actor) => {
                    const name = actors.find((person) => person.id === actor)?.name ?? "Resident";
                    const choices = foundingSleepZones(venue, actor);
                    const sleep =
                      venue.destinations?.[actor]?.sleep ??
                      choices.find((row) => row.ownerId === actor)?.id ??
                      choices[0]?.id ??
                      "";
                    return (
                      <label key={actor} className="villages-quick-sleeping">
                        {name} {actor === "player" ? "sleep in" : "sleeps in"}
                        <select
                          aria-label={`${name} sleeping Zone in ${venue.name}`}
                          disabled={busy || imageBusy}
                          value={sleep}
                          onChange={(event) => {
                            if (event.target.value === "new-private") addPrivateZone(venue, actor);
                            else
                              patch({
                                ...venue,
                                destinations: {
                                  ...venue.destinations,
                                  [actor]: { ...venue.destinations?.[actor], sleep: event.target.value },
                                },
                              });
                          }}
                        >
                          <option value="" disabled>
                            Choose a sleeping Zone
                          </option>
                          {choices.map((row) => (
                            <option key={row.id} value={row.id}>
                              {row.name || "Zone"}
                              {row.ownerId ? " · Private" : " · Shared"}
                            </option>
                          ))}
                          <option
                            value="new-private"
                            disabled={(venue.spaces?.length ?? 0) + (venue.privateSpaces?.length ?? 0) >= 6}
                          >
                            Add private Zone…
                          </option>
                        </select>
                      </label>
                    );
                  })}
                </>
              ) : home ? (
                <p>
                  Lives here:{" "}
                  {members.map((id) => actors.find((person) => person.id === id)?.name ?? "Resident").join(", ") ||
                    "Nobody"}
                </p>
              ) : null}
              {!community && !home && !members.length && !venue.workerIds?.length && onCommunityVenue ? (
                <button type="button" disabled={busy || imageBusy} onClick={() => onCommunityVenue(venue)}>
                  Use as Community Venue
                </button>
              ) : null}
              {canRemove ? (
                <button
                  type="button"
                  disabled={busy || imageBusy}
                  aria-label={`Remove ${venue.name}`}
                  onClick={() => onRemove?.(venue)}
                >
                  Remove{home ? " vacant home" : " Venue"}
                </button>
              ) : null}
            </section>
          );
        })}
      </section>
      <section className="villages-forging-card villages-quick-map-panel" aria-label="Village map">
        <div className="villages-quick-map-toolbar">
          <h2>Village map</h2>
          <button type="button" aria-label="Arrange automatically" disabled={busy || imageBusy} onClick={onArrange}>
            Arrange
          </button>
        </div>
        {mapArtwork ? (
          <details className="villages-quick-map-artwork">
            <summary>Map artwork</summary>
            {mapArtwork}
          </details>
        ) : null}
        {moving ? (
          <p role="status" className="villages-quick-placement-hint">
            Place {moving.name || "Venue"} on the map.
          </p>
        ) : null}
        <section ref={mapDetails} className="villages-quick-map" aria-label="Venue placement">
          {map}
        </section>
      </section>
      <dialog
        ref={dialog}
        className="villages-founding-dialog villages-quick-dialog"
        onCancel={(event) => {
          event.preventDefault();
          if (event.target === event.currentTarget) close();
        }}
        aria-label={selected ? `Edit ${selected.name || "Venue"}` : "Edit Venue"}
      >
        {selected ? (
          <Fragment key={selected.id}>
            <div className="villages-quick-heading">
              <h3>{selected.name || "Venue"}</h3>
              <button data-close-quick type="button" aria-label="Close Venue details" onClick={close}>
                ×
              </button>
            </div>
            <section className="villages-quick-panel" aria-label="Venue editor">
              <fieldset className="villages-quick-venue-fields" disabled={busy || imageBusy}>
                <label>
                  Venue Name
                  <input
                    autoComplete="off"
                    aria-label="Venue Name"
                    {...errorProps("name")}
                    maxLength={60}
                    value={selected.name}
                    onChange={(event) => patch({ ...selected, name: event.target.value })}
                  />
                  {fieldError("name")}
                </label>
                <label>
                  Physical Form
                  <input
                    autoComplete="off"
                    aria-label="Physical Form"
                    {...errorProps("form")}
                    maxLength={2000}
                    value={selected.form ?? ""}
                    onChange={(event) => patch({ ...selected, form: event.target.value })}
                  />
                  {fieldError("form")}
                </label>
                {!foundingHomeMembers(selected).length &&
                !selected.workerIds?.length &&
                selected.id !== communityVenueId ? (
                  <label>
                    Venue Class
                    <select
                      aria-label="Venue Class"
                      value={selected.classes?.[0] ?? "other"}
                      onChange={(event) => {
                        const role = event.target.value as NonNullable<VillageVenue["classes"]>[number];
                        patch({
                          ...selected,
                          classes: [role],
                          spaces: selected.spaces?.map((row) => ({ ...row, venueClass: role })),
                          privateSpaces: selected.privateSpaces?.map((row) => ({ ...row, venueClass: role })),
                        });
                      }}
                    >
                      <option value="other">Other</option>
                      <option value="residence">Residence</option>
                      <option value="community">Community</option>
                      <option value="workplace">Workplace</option>
                    </select>
                  </label>
                ) : null}
              </fieldset>
              {suggestions}
              <div className="villages-quick-zone-editor">
                <FoundingConnections
                  venue={selected}
                  onPatch={patch}
                  selectedZoneId={zoneId}
                  onSelect={selectZone}
                  allowAdd
                  onAdd={addZone}
                  busy={busy || imageBusy}
                />
                <fieldset
                  className="villages-quick-zone-fields"
                  ref={zoneFields}
                  aria-label="Selected Zone"
                  data-zone-id={zoneId}
                  disabled={busy || imageBusy}
                >
                  {zone ? (
                    <>
                      <label>
                        Zone name
                        <input
                          autoComplete="off"
                          aria-label="Zone name"
                          {...errorProps("zone-name")}
                          value={zone.name ?? ""}
                          maxLength={100}
                          onChange={(event) => patchZone({ name: event.target.value })}
                        />
                        {fieldError("zone-name")}
                      </label>
                      {selected.classes?.includes("residence") ? (
                        <label>
                          Zone use
                          <select
                            aria-label="Zone use"
                            value={personal ? zone.ownerId || "unassigned" : "shared"}
                            onChange={(event) => changeUse(event.target.value)}
                          >
                            <option value="shared">Shared Zone</option>
                            {personal && !zone.ownerId ? (
                              <option value="unassigned" disabled>
                                Unassigned private Zone
                              </option>
                            ) : null}
                            {actors
                              .filter((person) => foundingHomeMembers(selected).includes(person.id))
                              .map((person) => (
                                <option key={person.id} value={person.id}>
                                  Private for {person.name}
                                </option>
                              ))}
                          </select>
                        </label>
                      ) : null}
                      <div className="villages-quick-access" role="group" aria-label="Zone access">
                        <span>Access</span>
                        {(["public", "permission-required"] as const).map((mode) => (
                          <button
                            type="button"
                            key={mode}
                            aria-label={mode === "public" ? "Public access" : "Permission required"}
                            disabled={selected.id === communityVenueId && mode !== "public"}
                            aria-pressed={(zone.access ?? draftZonePolicy(selected, zone, personal)).mode === mode}
                            onClick={() =>
                              patchZone({
                                access: {
                                  ...(zone.access ?? draftZonePolicy(selected, zone, personal)),
                                  mode,
                                  ...(mode === "permission-required" &&
                                  personal &&
                                  !zone.ownerId &&
                                  !zone.access?.managerIds?.length
                                    ? { managerIds: ["player"], memberIds: ["player"] }
                                    : {}),
                                },
                              })
                            }
                          >
                            {mode === "public" ? "Public" : "Restricted"}
                          </button>
                        ))}
                      </div>
                      <label>
                        Used for
                        <input
                          autoComplete="off"
                          aria-label="Used for"
                          {...errorProps("zone-purpose")}
                          value={zone.purpose ?? ""}
                          maxLength={240}
                          onChange={(event) => patchZone({ purpose: event.target.value })}
                        />
                        {fieldError("zone-purpose")}
                      </label>
                    </>
                  ) : (
                    <h4>Entrance</h4>
                  )}
                  <div className="villages-quick-zone-appearance">
                    <label>
                      Long-term details
                      <textarea
                        autoComplete="off"
                        aria-label="Long-term details"
                        {...errorProps(zoneId === "exterior" ? "description" : "zone-appearance")}
                        value={zoneId === "exterior" ? selected.description : (zone?.description ?? "")}
                        maxLength={1000}
                        rows={3}
                        onChange={(event) =>
                          zoneId === "exterior"
                            ? patch({ ...selected, description: event.target.value })
                            : patchZone({ description: event.target.value })
                        }
                      />
                      {fieldError(zoneId === "exterior" ? "description" : "zone-appearance")}
                    </label>
                    <button
                      type="button"
                      className="villages-quick-zone-image"
                      aria-label={image ? "Edit Zone artwork" : "Artwork"}
                      onClick={() => setArtworkOpen(true)}
                    >
                      {image ? (
                        <img
                          src={image.url}
                          alt={`Artwork for ${zoneId === "exterior" ? "Entrance" : zone?.name || "Zone"}`}
                        />
                      ) : (
                        "Artwork"
                      )}
                    </button>
                  </div>
                </fieldset>
              </div>
            </section>
            <footer className="villages-quick-footer">
              {layoutError ? <p role="alert">{layoutError}</p> : null}
              {saveError ? <p role="alert">{saveError}</p> : null}
              {problem ? <p role="alert">{problem}</p> : null}
              <button type="button" className="villages-forging-primary" onClick={finish}>
                {saveError ? "Return to Venues" : "Done"}
              </button>
            </footer>
            {artworkOpen ? (
              <QuickStartZoneArtwork
                image={image}
                name={zoneId === "exterior" ? "Entrance" : zone?.name || "Zone"}
                busy={busy || imageBusy}
                onClose={() => setArtworkOpen(false)}
                onUpload={(file) => onUploadImage(selected, area, file, zone?.id)}
                onGenerate={() => onGenerateImage(selected, area, zone?.id)}
                onRemove={() =>
                  zoneId === "exterior"
                    ? patch({ ...selected, presentation: { ...selected.presentation, image: null } })
                    : patchZone({ image: null })
                }
              />
            ) : null}
          </Fragment>
        ) : null}
      </dialog>
    </section>
  );
}
