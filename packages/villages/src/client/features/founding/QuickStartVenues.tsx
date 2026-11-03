import { FoundingVenuePages } from "./FoundingVenuePages.js";
import { FoundingPagination } from "./FoundingPagination.js";
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
import {
  draftZonePolicy,
  FoundingConnections,
  foundingLayoutProblem,
  removeFoundingZone,
} from "./villages-founding-zones.js";
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
  const dialog = useRef<HTMLElement>(null);
  const mapDetails = useRef<HTMLElement>(null);
  const zoneFields = useRef<HTMLFieldSetElement>(null);
  const fieldId = useId();
  const [sleepPage, setSleepPage] = useState(0);
  const [editorTab, setEditorTab] = useState("Venue");
  const [zoneTab, setZoneTab] = useState("Details");
  const [artworkOpen, setArtworkOpen] = useState(false);
  const [layoutError, setLayoutError] = useState("");
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [zoneId, setZoneId] = useState("exterior");
  const selected = venues.find((venue) => venue.id === selectedId);
  const ordered = [
    ...venues.filter((venue) => venue.classes?.includes("residence")),
    ...venues.filter((venue) => !venue.classes?.includes("residence")),
  ];
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
    setZoneTab("Details");
    setArtworkOpen(false);
    if (window.matchMedia("(max-width:727px)").matches)
      requestAnimationFrame(() => zoneFields.current?.scrollIntoView({ block: "nearest" }));
  };
  const finish = () => {
    if (!selected) return;
    setSaveAttempted(true);
    const problem = foundingLayoutProblem(selected);
    setLayoutError(problem);
    if (problem) {
      setEditorTab("Zones");
      setZoneTab("Connections");
      return;
    }
    const issue = issues.find(
      (issue) =>
        issue.venueId === selected.id &&
        ["name", "form", "description", "zone-name", "zone-purpose", "zone-appearance"].includes(issue.field),
    );
    if (issue) {
      setEditorTab(issue.zoneId || issue.field === "description" ? "Zones" : "Venue");
      selectZone(issue.zoneId ?? "exterior");
    } else close();
  };
  useEffect(() => setLayoutError(""), [selected, open]);
  useEffect(() => setSaveAttempted(false), [open, selectedId]);
  const sleepingIndex = Math.min(sleepPage, Math.max(0, selected ? foundingHomeMembers(selected).length - 1 : 0));
  const personal = !!selected?.privateSpaces?.some((zone) => zone.id === zoneId);
  const zone = [...(selected?.spaces ?? []), ...(selected?.privateSpaces ?? [])].find((row) => row.id === zoneId);
  const area = zoneId === "exterior" ? "exterior" : personal ? "private" : "interior";
  const artworkZone = editorTab === "Zones" ? zone : undefined;
  const artworkArea = artworkZone ? area : "exterior";
  const image = artworkZone ? artworkZone.image : selected?.presentation.image;
  const artworkName = artworkZone?.name || (artworkZone ? "Zone" : "Entrance");
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
    node.querySelector<HTMLElement>("[data-close-quick]")?.focus();
    return () => {
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
    setSleepPage(0);
    setEditorTab(
      focusIssue?.venueId === venue.id &&
        (focusIssue.zoneId || focusIssue.field === "description" || focusIssue.field === "layout")
        ? "Zones"
        : "Venue",
    );
    setZoneTab(focusIssue?.field === "layout" ? "Connections" : "Details");
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
        <FoundingVenuePages selectedId={selectedId}>
          {ordered.map((venue) => {
            const home = venue.classes?.includes("residence");
            const community = venue.id === communityVenueId;
            const members = foundingHomeMembers(venue);
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
                {home && members.length ? (
                  <p className="villages-quick-household">
                    {members.length
                      ? members
                          .map((id) => {
                            const actor = actors.find((person) => person.id === id)?.name ?? "Resident";
                            const choices = foundingSleepZones(venue, id);
                            const sleep =
                              choices.find((zone) => zone.id === venue.destinations?.[id]?.sleep) ??
                              choices.find((zone) => zone.ownerId === id) ??
                              choices[0];
                            return actor + " · " + (sleep?.name || "Choose sleeping Zone");
                          })
                          .join("; ")
                      : "Vacant home"}
                  </p>
                ) : null}
              </section>
            );
          })}
        </FoundingVenuePages>
      </section>
      <section hidden={open} className="villages-forging-card villages-quick-map-panel" aria-label="Village map">
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
      <section
        hidden={!open}
        ref={dialog}
        className="villages-forging-card villages-quick-dialog"
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
            <div className="villages-founding-tabs" role="group" aria-label="Venue sections">
              {["Venue", ...(selected.classes?.includes("residence") ? ["People"] : []), "Zones"].map((tab) => (
                <button key={tab} aria-pressed={editorTab === tab} onClick={() => setEditorTab(tab)}>
                  {tab}
                </button>
              ))}
              <button
                disabled={busy || imageBusy}
                className="villages-quick-artwork-button"
                aria-label={"Artwork for " + artworkName}
                onClick={() => setArtworkOpen(true)}
              >
                {image ? <img src={image.url} alt="" /> : null}Artwork
              </button>
            </div>
            <section className="villages-quick-panel" aria-label="Venue editor">
              <div hidden={editorTab !== "People"}>
                {" "}
                {selected.classes?.includes("residence") && onAssignHome ? (
                  <>
                    <fieldset className="villages-quick-home-people" disabled={busy || imageBusy}>
                      <legend>Who lives here?</legend>
                      {actors.map((person) => (
                        <label key={person.id}>
                          <input
                            autoComplete="off"
                            type="checkbox"
                            aria-label={person.name}
                            checked={foundingHomeMembers(selected).includes(person.id)}
                            onChange={(event) => onAssignHome(selected, person.id, event.target.checked)}
                          />
                          {person.name}
                        </label>
                      ))}
                    </fieldset>
                    <div className="villages-quick-home-capacity">
                      <span>
                        {foundingHomeMembers(selected).length}{" "}
                        {foundingHomeMembers(selected).length === 1 ? "resident" : "residents"}
                      </span>
                      <label>
                        Capacity{" "}
                        <select
                          aria-label={`Capacity for ${selected.name}`}
                          disabled={busy || imageBusy}
                          value={
                            selected.foundingCapacity === null
                              ? "auto"
                              : String(selected.foundingCapacity ?? selected.residenceCapacity ?? 1)
                          }
                          onChange={(event) =>
                            patch({
                              ...selected,
                              foundingCapacity: event.target.value === "auto" ? null : Number(event.target.value),
                            })
                          }
                        >
                          <option value="auto">Automatic ({Math.max(1, foundingHomeMembers(selected).length)})</option>
                          {[1, 2, 3, 4].map((count) => (
                            <option key={count} value={count} disabled={count < foundingHomeMembers(selected).length}>
                              Fixed: {count}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {foundingHomeMembers(selected)
                      .slice(sleepingIndex, sleepingIndex + 1)
                      .map((actor) => {
                        const name = actors.find((person) => person.id === actor)?.name ?? "Resident";
                        const choices = foundingSleepZones(selected, actor);
                        const sleep =
                          selected.destinations?.[actor]?.sleep ??
                          choices.find((row) => row.ownerId === actor)?.id ??
                          choices[0]?.id ??
                          "";
                        return (
                          <label key={actor} className="villages-quick-sleeping">
                            {name} {actor === "player" ? "sleep in" : "sleeps in"}
                            <select
                              aria-label={`${name} sleeping Zone in ${selected.name}`}
                              disabled={busy || imageBusy}
                              value={sleep}
                              onChange={(event) => {
                                if (event.target.value === "new-private") addPrivateZone(selected, actor);
                                else
                                  patch({
                                    ...selected,
                                    destinations: {
                                      ...selected.destinations,
                                      [actor]: { ...selected.destinations?.[actor], sleep: event.target.value },
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
                                disabled={(selected.spaces?.length ?? 0) + (selected.privateSpaces?.length ?? 0) >= 6}
                              >
                                Add private Zone…
                              </option>
                            </select>
                          </label>
                        );
                      })}
                    <FoundingPagination
                      page={Math.min(sleepPage, Math.max(0, foundingHomeMembers(selected).length - 1))}
                      count={foundingHomeMembers(selected).length}
                      onPage={setSleepPage}
                      label="Sleeping residents"
                    />
                  </>
                ) : selected.classes?.includes("residence") ? (
                  <p>
                    Lives here:{" "}
                    {foundingHomeMembers(selected)
                      .map((id) => actors.find((person) => person.id === id)?.name ?? "Resident")
                      .join(", ") || "Nobody"}
                  </p>
                ) : null}
              </div>
              <div hidden={editorTab !== "Venue"}>
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
                <label>
                  Entrance appearance
                  <textarea
                    autoComplete="off"
                    disabled={busy || imageBusy}
                    aria-label="Entrance appearance"
                    value={selected.description}
                    maxLength={1000}
                    rows={4}
                    onChange={(event) => patch({ ...selected, description: event.target.value })}
                  />
                </label>
                {suggestions}
              </div>
              <div hidden={editorTab !== "Zones"}>
                <div className="villages-quick-zone-picker">
                  <label>
                    Zone
                    <select
                      aria-label="Selected Zone"
                      value={zoneId}
                      onChange={(event) => selectZone(event.target.value)}
                    >
                      <option value="exterior">Entrance</option>
                      {[...(selected.spaces ?? []), ...(selected.privateSpaces ?? [])].map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name || "Zone"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    disabled={
                      busy || imageBusy || (selected.spaces?.length ?? 0) + (selected.privateSpaces?.length ?? 0) >= 6
                    }
                    onClick={addZone}
                  >
                    Add Zone
                  </button>
                  <button
                    disabled={busy || imageBusy || zoneId === "exterior"}
                    onClick={() => {
                      patch(removeFoundingZone(selected, zoneId));
                      selectZone("exterior");
                    }}
                  >
                    Remove Zone
                  </button>
                </div>
                <div className="villages-founding-tabs" role="group" aria-label="Zone sections">
                  {["Details", "Access", "Connections"].map((tab) => (
                    <button key={tab} aria-pressed={zoneTab === tab} onClick={() => setZoneTab(tab)}>
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="villages-quick-zone-editor">
                  <div hidden={zoneTab !== "Connections"}>
                    <FoundingConnections
                      venue={selected}
                      onPatch={patch}
                      selectedZoneId={zoneId}
                      onSelect={selectZone}
                      busy={busy || imageBusy}
                    />
                  </div>
                  <fieldset
                    className="villages-quick-zone-fields"
                    ref={zoneFields}
                    aria-label="Selected Zone"
                    data-zone-id={zoneId}
                    disabled={busy || imageBusy}
                  >
                    {zone ? (
                      <>
                        <label hidden={zoneTab !== "Details"}>
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
                        {zoneTab === "Access" && selected.classes?.includes("residence") ? (
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
                        <div
                          hidden={zoneTab !== "Access"}
                          className="villages-quick-access"
                          role="group"
                          aria-label="Zone access"
                        >
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
                        <label hidden={zoneTab !== "Details"}>
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
                    ) : zoneTab === "Details" ? (
                      <h4>Entrance</h4>
                    ) : null}
                    <div className="villages-quick-zone-appearance">
                      <label hidden={zoneTab !== "Details"}>
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
                    </div>
                  </fieldset>
                </div>
              </div>
            </section>
            <footer className="villages-quick-footer">
              {layoutError ? <p role="alert">{layoutError}</p> : null}
              {saveError ? <p role="alert">{saveError}</p> : null}
              {problem ? <p role="alert">{problem}</p> : null}
              <button
                disabled={busy || imageBusy}
                onClick={() => {
                  close();
                  onMove(selected);
                }}
              >
                Place on map
              </button>
              {selected.id !== communityVenueId &&
              !foundingHomeMembers(selected).length &&
              !selected.workerIds?.length ? (
                <>
                  {!selected.classes?.includes("residence") && onCommunityVenue ? (
                    <button disabled={busy || imageBusy} onClick={() => onCommunityVenue(selected)}>
                      Use as Community Venue
                    </button>
                  ) : null}
                  {onRemove ? (
                    <button
                      disabled={busy || imageBusy}
                      aria-label={"Remove " + selected.name}
                      onClick={() => {
                        onRemove(selected);
                        close();
                      }}
                    >
                      Remove
                    </button>
                  ) : null}
                </>
              ) : null}
              <button type="button" className="villages-forging-primary" onClick={finish}>
                {saveError ? "Return to Venues" : "Done"}
              </button>
            </footer>
            {artworkOpen ? (
              <QuickStartZoneArtwork
                image={image}
                name={artworkName}
                busy={busy || imageBusy}
                onClose={() => setArtworkOpen(false)}
                onUpload={(file) => onUploadImage(selected, artworkArea, file, artworkZone?.id)}
                onGenerate={() => onGenerateImage(selected, artworkArea, artworkZone?.id)}
                onRemove={() =>
                  !artworkZone
                    ? patch({ ...selected, presentation: { ...selected.presentation, image: null } })
                    : patchZone({ image: null })
                }
              />
            ) : null}
          </Fragment>
        ) : null}
      </section>
    </section>
  );
}
