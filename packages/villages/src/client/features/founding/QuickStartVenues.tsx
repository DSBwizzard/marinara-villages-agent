import { FoundingVenuePages } from "./FoundingVenuePages.js";
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { SetupVenueDraft } from "../../shared/types.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { addFoundingZone } from "./founding-template.js";
import { foundingHomeMembers, reconcileFoundingHome } from "./founding-homes.js";
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
  const patch = (venue: SetupVenueDraft) => {
    const before = venues.find((row) => row.id === venue.id);
    const count = (row: SetupVenueDraft) => (row.spaces?.length ?? 0) + (row.privateSpaces?.length ?? 0);
    onPatch(before && count(before) !== count(venue) ? reconcileFoundingHome(venue) : venue);
  };
  const selectZone = (id: string) => {
    setZoneId(id);
    if (window.matchMedia("(max-width:727px)").matches)
      requestAnimationFrame(() => zoneFields.current?.scrollIntoView({ block: "nearest" }));
  };
  const personal = !!selected?.privateSpaces?.some((zone) => zone.id === zoneId);
  const zone = [...(selected?.spaces ?? []), ...(selected?.privateSpaces ?? [])].find((row) => row.id === zoneId);
  useEffect(() => {
    if (zoneId !== "exterior" && !zone) setZoneId("exterior");
  }, [zoneId, zone]);
  const zoneAccess = zone && selected ? (zone.access ?? draftZonePolicy(selected, zone, personal)) : undefined;
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
                  <span className="villages-quick-venue-badge">{community ? "Community" : "Residence"}</span>
                </span>
                <span className="villages-quick-household" aria-hidden={!home || undefined}>
                  {members.map((id) => actors.find((actor) => actor.id === id)?.name ?? "Resident").join(", ")}
                </span>
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
            <fieldset className="villages-quick-venue-header" disabled={busy || imageBusy}>
              <label>
                Venue name
                <input
                  autoComplete="off"
                  aria-label="Venue Name"
                  {...errorProps("name")}
                  maxLength={60}
                  placeholder="Venue name"
                  value={selected.name}
                  onChange={(event) => patch({ ...selected, name: event.target.value })}
                />
                {fieldError("name")}
              </label>
              <label>
                Appearance
                <textarea
                  autoComplete="off"
                  aria-label="Appearance"
                  {...errorProps("form")}
                  maxLength={2000}
                  rows={2}
                  placeholder="What does this place look like?"
                  value={selected.form ?? ""}
                  onChange={(event) => patch({ ...selected, form: event.target.value })}
                />
                {fieldError("form")}
              </label>
            </fieldset>
            <section className="villages-quick-panel" aria-label="Venue editor">
              <FoundingConnections
                venue={selected}
                onPatch={patch}
                selectedZoneId={zoneId}
                onSelect={selectZone}
                busy={busy || imageBusy}
                allowAdd
                onAdd={addZone}
              />
              <div className="villages-quick-zone-content">
                <fieldset
                  className="villages-quick-zone-fields"
                  ref={zoneFields}
                  aria-label="Selected Zone"
                  data-zone-id={zoneId}
                  disabled={busy || imageBusy}
                >
                  {zone ? (
                    <div className="villages-quick-zone-summary">
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
                    </div>
                  ) : (
                    <h3>Entrance</h3>
                  )}
                  <label>
                    Long-term details
                    <textarea
                      autoComplete="off"
                      aria-label="Long-term details"
                      {...errorProps(zoneId === "exterior" ? "description" : "zone-appearance")}
                      value={zoneId === "exterior" ? selected.description : (zone?.description ?? "")}
                      maxLength={1000}
                      rows={5}
                      onChange={(event) =>
                        zoneId === "exterior"
                          ? patch({ ...selected, description: event.target.value })
                          : patchZone({ description: event.target.value })
                      }
                    />
                    {fieldError(zoneId === "exterior" ? "description" : "zone-appearance")}
                  </label>
                  {zone && zoneAccess ? (
                    <label className="villages-quick-zone-access">
                      <input
                        autoComplete="off"
                        type="checkbox"
                        role="switch"
                        aria-label="Restricted access"
                        checked={zoneAccess.mode === "permission-required"}
                        disabled={selected.id === communityVenueId && zoneAccess.mode === "public"}
                        onChange={(event) =>
                          patchZone({
                            access: { ...zoneAccess, mode: event.target.checked ? "permission-required" : "public" },
                          })
                        }
                      />
                      {zoneAccess.mode === "permission-required" ? "Restricted" : "Public"}
                    </label>
                  ) : null}
                </fieldset>
                <QuickStartZoneArtwork
                  key={selected.id + ":" + zoneId}
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
