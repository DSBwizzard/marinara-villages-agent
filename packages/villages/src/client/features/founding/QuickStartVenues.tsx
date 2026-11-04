import { FoundingVenuePages } from "./FoundingVenuePages.js";
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { SetupVenueDraft } from "../../shared/types.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { addFoundingZone } from "./founding-template.js";
import { assignFoundingPrivateZone, foundingHomeMembers, reconcileFoundingHome } from "./founding-homes.js";
import { QuickStartZoneArtwork } from "./QuickStartZoneArtwork.js";
import { draftZonePolicy, FoundingConnections } from "./villages-founding-zones.js";
import { foundingVenueIssues, type FoundingIssue } from "./villages-founding-workspace-state.js";

export function QuickStartVenues({
  venues,
  people,
  selectedId,
  busy,
  imageBusy,
  focusIssue,
  saveError,
  problem,
  map,
  onSelect,
  onPatch,
  onGenerateImage,
  onUploadImage,
  communityVenueId,
  actions,
  mapArtwork,
}: {
  venues: SetupVenueDraft[];
  people: { id: string; name: string }[];
  selectedId: string | null;
  busy: boolean;
  imageBusy: boolean;
  focusIssue: FoundingIssue | null;
  saveError?: string;
  problem?: string;
  map: ReactNode;
  onSelect(venue: SetupVenueDraft): void;
  onPatch(venue: SetupVenueDraft): void;
  onGenerateImage(venue: VillageVenue, area: "exterior" | "interior" | "private", zoneId?: string): void;
  onUploadImage(venue: VillageVenue, area: "exterior" | "interior" | "private", file: File, zoneId?: string): void;
  communityVenueId?: string;
  actions?: ReactNode;
  mapArtwork?: ReactNode;
}) {
  const dialog = useRef<HTMLElement>(null);
  const zoneFields = useRef<HTMLFieldSetElement>(null);
  const fieldId = useId();
  const [editorTab, setEditorTab] = useState("Venue");
  const [zoneTab, setZoneTab] = useState("Details");
  const [zoneId, setZoneId] = useState("exterior");
  const selected = venues.find((venue) => venue.id === selectedId) ?? venues[0];
  const ordered = [
    ...venues.filter((venue) => venue.classes?.includes("residence")),
    ...venues.filter((venue) => !venue.classes?.includes("residence")),
  ];
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const open = !!selected;
  const issues = foundingVenueIssues(venues, false);
  const actors = [{ id: "player", name: "You" }, ...people];
  const patch = (venue: SetupVenueDraft) => onPatch(reconcileFoundingHome(venue));
  const selectZone = (id: string) => {
    setZoneId(id);
    setZoneTab("Details");
    if (window.matchMedia("(max-width:727px)").matches)
      requestAnimationFrame(() => zoneFields.current?.scrollIntoView({ block: "nearest" }));
  };
  const personal = !!selected?.privateSpaces?.some((zone) => zone.id === zoneId);
  const zone = [...(selected?.spaces ?? []), ...(selected?.privateSpaces ?? [])].find((row) => row.id === zoneId);
  useEffect(() => {
    if (zoneId !== "exterior" && !zone) setZoneId("exterior");
  }, [zoneId, zone]);
  const area = zoneId === "exterior" ? "exterior" : personal ? "private" : "interior";
  const artworkZone = zone;
  const artworkArea = artworkZone ? area : "exterior";
  const image = artworkZone ? artworkZone.image : selected?.presentation.image;
  const artworkName = artworkZone?.name || (artworkZone ? "Zone" : "Entrance");
  const fieldIssue = (field: FoundingIssue["field"]) =>
    focusIssue?.venueId === selected?.id
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
    setEditorTab(
      focusIssue?.venueId === venue.id &&
        (focusIssue.zoneId || focusIssue.field === "description" || focusIssue.field === "layout")
        ? "Zones"
        : "Venue",
    );
    setZoneTab("Details");
  }, [open, selectedId, focusIssue]);
  const patchZone = (change: Partial<NonNullable<VillageVenue["spaces"]>[number]>) => {
    if (!selected) return;
    const key = personal ? "privateSpaces" : "spaces";
    patch({ ...selected, [key]: selected[key]?.map((row) => (row.id === zoneId ? { ...row, ...change } : row)) });
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
        <FoundingVenuePages selectedId={selectedId}>
          {ordered.map((venue) => {
            const home = venue.classes?.includes("residence");
            const community = venue.id === communityVenueId;
            const members = foundingHomeMembers(venue);
            return (
              <button
                key={venue.id}
                type="button"
                className="villages-quick-venue-card"
                aria-label={venue.name || "Venue"}
                aria-pressed={selected?.id === venue.id}
                data-venue-id={venue.id}
                data-selected={selected?.id === venue.id}
                disabled={busy || imageBusy}
                style={
                  venue.presentation.image
                    ? {
                        backgroundImage: `linear-gradient(90deg,#0c1830ed,#0c183044),url(${JSON.stringify(venue.presentation.image.url)})`,
                      }
                    : undefined
                }
                onClick={() => {
                  onSelect(venue);
                  if (window.matchMedia("(max-width:727px)").matches)
                    requestAnimationFrame(() => dialog.current?.scrollIntoView({ block: "start" }));
                }}
              >
                <span className="villages-quick-venue-title">
                  <strong>{venue.name || "Venue"}</strong>
                  <span className="villages-quick-venue-badge">{community ? "Community Venue" : "Residence"}</span>
                </span>
                {home ? (
                  <span className="villages-quick-household">
                    {members.map((id) => actors.find((actor) => actor.id === id)?.name ?? "Resident").join(", ")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </FoundingVenuePages>
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
            </div>
            <div className="villages-founding-tabs" role="group" aria-label="Venue sections">
              {["Venue", "Zones"].map((tab) => (
                <button
                  key={tab}
                  disabled={busy || imageBusy}
                  aria-pressed={editorTab === tab}
                  onClick={() => setEditorTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <section className="villages-quick-panel" aria-label="Venue editor">
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
                  <label className="villages-quick-venue-description">
                    What does this place look like?
                    <textarea
                      autoComplete="off"
                      aria-label="What does this place look like?"
                      {...errorProps("form")}
                      maxLength={2000}
                      rows={4}
                      placeholder={
                        "A two-story timber house with a slate roof\nA converted school bus\nA beautiful park with winding paths and a pond\nA dark cave"
                      }
                      value={selected.form ?? ""}
                      onChange={(event) => patch({ ...selected, form: event.target.value })}
                    />
                    {fieldError("form")}
                  </label>
                </fieldset>
              </div>
              <div hidden={editorTab !== "Zones"}>
                <FoundingConnections
                  venue={selected}
                  onPatch={patch}
                  selectedZoneId={zoneId}
                  onSelect={selectZone}
                  busy={busy || imageBusy}
                  allowAdd
                  onAdd={addZone}
                />
                <label>
                  Zone
                  <select
                    aria-label="Selected Zone"
                    disabled={busy || imageBusy}
                    value={zoneId}
                    onChange={(event) => selectZone(event.target.value)}
                  >
                    <option value="exterior">Entrance</option>
                    {[...(selected.spaces ?? []), ...(selected.privateSpaces ?? [])].map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.name || "Zone"}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="villages-founding-tabs" role="group" aria-label="Zone sections">
                  {["Details", "Access", "Artwork"].map((tab) => (
                    <button
                      key={tab}
                      disabled={busy || imageBusy}
                      aria-pressed={zoneTab === tab}
                      onClick={() => setZoneTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="villages-quick-zone-editor">
                  <fieldset
                    hidden={zoneTab === "Artwork"}
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
                  {zoneTab === "Artwork" ? (
                    <QuickStartZoneArtwork
                      image={image}
                      name={artworkName}
                      busy={busy || imageBusy}
                      onUpload={(file) => onUploadImage(selected, artworkArea, file, artworkZone?.id)}
                      onGenerate={() => onGenerateImage(selected, artworkArea, artworkZone?.id)}
                      onRemove={() =>
                        !artworkZone
                          ? patch({ ...selected, presentation: { ...selected.presentation, image: null } })
                          : patchZone({ image: null })
                      }
                    />
                  ) : null}
                </div>
              </div>
            </section>
            {saveError || problem ? (
              <footer className="villages-quick-footer">
                <p role="alert">{saveError || problem}</p>
              </footer>
            ) : null}
          </Fragment>
        ) : null}
      </section>
      <section className="villages-forging-card villages-quick-map-panel" aria-label="Village map">
        <div className="villages-quick-map-toolbar">
          <h2>Village map</h2>
          {mapArtwork}
        </div>
        <section className="villages-quick-map" aria-label="Venue placement">
          {map}
        </section>
      </section>
    </section>
  );
}
