import { ZoneMap } from "../../shared/ZoneMap.js";
import { resolveZoneLayout } from "../../../shared/helpers/zone-layout.js";
import { connectionProblem, materializeConnections } from "../../../shared/helpers/zone-contact.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { ZoneAccessPolicy } from "../../../shared/helpers/venue-access.js";
import { ZonePolicyFields } from "../venues/villages-venue-access";
import type { ReactNode } from "react";

export function removeFoundingZone(venue: VillageVenue, id: string): VillageVenue {
  if (id === "exterior") return venue;
  const prune = <T extends { id: string; connectedTo?: string[] }>(rows: T[]) =>
    rows
      .filter((zone) => zone.id !== id)
      .map((zone) => ({ ...zone, connectedTo: zone.connectedTo?.filter((other) => other !== id) }));
  const spaces = prune(venue.spaces ?? []),
    privateSpaces = prune(venue.privateSpaces ?? []);
  return {
    ...venue,
    spaces,
    privateSpaces,
    layout: spaces.length ? (privateSpaces.length ? "both" : "common") : privateSpaces.length ? "private" : "exterior",
    zoneLayout: venue.zoneLayout
      ? resolveZoneLayout(["exterior", ...spaces.map((z) => z.id), ...privateSpaces.map((z) => z.id)], venue.zoneLayout)
      : undefined,
  };
}

export function foundingZoneProblem(venue: VillageVenue): string {
  if (
    [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].some(
      (zone) => zone.access && (!zone.name?.trim() || !zone.purpose?.trim()),
    )
  )
    return "Give each Zone a name and describe what it is used for.";
  if (venue.spaces?.some((zone) => !zone.description.trim())) return "Describe each Zone's appearance.";
  return connectionProblem(
    materializeConnections([
      { id: "exterior", kind: "exterior" },
      ...(venue.spaces ?? []).map((zone) => ({ ...zone, kind: "public" })),
      ...(venue.privateSpaces ?? []).map((zone) => ({ ...zone, kind: "restricted" })),
    ]),
  );
}

export function draftZonePolicy(
  venue: VillageVenue,
  area: { ownerId?: string; venueClass: string },
  personal = false,
): ZoneAccessPolicy {
  const owner = area.ownerId || (venue.occupancy.playerHome ? "player" : venue.occupancy.residentCharacterId || "");
  return {
    mode: area.venueClass === "residence" || personal ? "permission-required" : "public",
    managerIds: personal && owner ? [owner] : null,
    memberIds: personal && owner ? [owner] : [],
    memberRoles:
      !personal && area.venueClass === "residence"
        ? ["residents"]
        : personal && area.venueClass === "workplace"
          ? ["workers"]
          : [],
    inviterIds: [],
    visitorHours: "inherit",
    accompanied: false,
  };
}
export function FoundingZoneFields({
  venue,
  people,
  busy,
  onPatch,
  imageFields,
  editAccess = true,
  selectedZoneId,
  identityInHeader = false,
}: {
  venue: VillageVenue;
  people: { id: string; name: string }[];
  busy: boolean;
  editAccess?: boolean;
  selectedZoneId?: string;
  identityInHeader?: boolean;
  onPatch(venue: VillageVenue): void;
  imageFields(
    area: "exterior" | "interior" | "private",
    image: VillageVenue["presentation"]["image"],
    zoneId?: string,
  ): ReactNode;
}) {
  return (
    <>
      {[
        ...(venue.spaces ?? []).map((zone) => ({ zone, personal: false })),
        ...(venue.privateSpaces ?? []).map((zone) => ({ zone, personal: true })),
      ]
        .filter(({ zone }) => !selectedZoneId || zone.id === selectedZoneId)
        .map(({ zone, personal }) => {
          const patch = (next: Partial<typeof zone>) =>
            onPatch(
              personal
                ? {
                    ...venue,
                    privateSpaces: venue.privateSpaces?.map((row) => (row.id === zone.id ? { ...row, ...next } : row)),
                  }
                : { ...venue, spaces: venue.spaces?.map((row) => (row.id === zone.id ? { ...row, ...next } : row)) },
            );
          const policy = zone.access ?? draftZonePolicy(venue, zone, personal);
          const generatedLater = personal && zone.ownerId !== "player";
          return (
            <section key={zone.id} data-zone-id={zone.id}>
              {!identityInHeader ? (
                <>
                  <h4>{zone.name || "Zone"}</h4>
                  <label>
                    Zone Name
                    <input
                      autoComplete="off"
                      aria-label="Zone Name"
                      disabled={busy}
                      maxLength={100}
                      value={zone.name ?? ""}
                      placeholder="Living room, bedroom, foyer…"
                      onChange={(event) => patch({ name: event.target.value })}
                    />
                  </label>
                </>
              ) : null}
              {!identityInHeader ? (
                <>
                  <label>
                    Used for
                    <input
                      autoComplete="off"
                      aria-label="Zone Used For"
                      disabled={busy}
                      maxLength={240}
                      value={zone.purpose ?? ""}
                      placeholder="Eating together, sleeping, worship, washing…"
                      onChange={(event) => patch({ purpose: event.target.value })}
                    />
                  </label>
                  <p>Describe the activities here. Access is a separate choice.</p>
                </>
              ) : null}
              {(venue.classes?.length ?? 0) > 1 ? (
                <label>
                  Zone role
                  <select
                    value={zone.venueClass}
                    disabled={busy}
                    onChange={(event) => patch({ venueClass: event.target.value as typeof zone.venueClass })}
                  >
                    {venue.classes?.map((role) => (
                      <option key={role} value={role}>
                        {role === "residence"
                          ? "Residential"
                          : role === "workplace"
                            ? "Work"
                            : role === "community"
                              ? "Community"
                              : "Other"}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {generatedLater ? (
                <>
                  <label>
                    Room Specification (optional)
                    <textarea
                      autoComplete="off"
                      aria-label="Room Specification"
                      disabled={busy}
                      maxLength={1000}
                      rows={3}
                      value={zone.roomSpecification ?? zone.description}
                      placeholder="Structure, windows, and furnishings you are providing…"
                      onChange={(event) => patch({ roomSpecification: event.target.value })}
                    />
                  </label>
                  <p>
                    The interior is prepared privately from this specification and stays hidden until authorized entry.
                  </p>
                </>
              ) : !identityInHeader ? (
                <label>
                  Appearance
                  <textarea
                    autoComplete="off"
                    aria-label="Zone Appearance"
                    disabled={busy}
                    maxLength={1000}
                    rows={3}
                    value={zone.description}
                    placeholder={
                      generatedLater
                        ? "Optional; prepared for the assigned resident after founding."
                        : "Materials, furnishings, light, and other visible details…"
                    }
                    onChange={(event) => patch({ description: event.target.value })}
                  />
                </label>
              ) : null}
              {editAccess ? (
                <>
                  {personal && !zone.access && !["residence", "workplace"].includes(zone.venueClass) ? (
                    <label>
                      Legacy Zone controllers
                      <select
                        aria-label="Zone Controllers"
                        multiple
                        value={zone.controllerIds ?? []}
                        onChange={(event) =>
                          patch({ controllerIds: Array.from(event.target.selectedOptions, (option) => option.value) })
                        }
                      >
                        {[{ id: "player", name: "You" }, ...people].map((person) => (
                          <option key={person.id} value={person.id}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  <label>
                    Zone access
                    <select
                      aria-label="Zone access"
                      value={policy.mode}
                      onChange={(event) =>
                        patch({ access: { ...policy, mode: event.target.value as ZoneAccessPolicy["mode"] } })
                      }
                    >
                      <option value="public">Public</option>
                      <option value="permission-required">Permission required</option>
                    </select>
                  </label>
                  <details>
                    <summary>Access rules</summary>
                    <ZonePolicyFields
                      value={policy}
                      people={[{ id: "player", name: "You" }, ...people]}
                      onChange={(access) => patch({ access })}
                    />
                  </details>
                </>
              ) : (
                <p>
                  New Zones start with {policy.mode === "public" ? "Public" : "Permission required"} access. Manage
                  their access after opening.
                </p>
              )}
              <details>
                <summary>What informs this Zone’s artwork?</summary>
                <p>
                  Venue Type: {venue.venueType || "Not set"}. Physical form: {venue.form || "Not set"}.
                </p>
                <p>
                  Used for: {zone.purpose || "Not set"}. Appearance:{" "}
                  {zone.description || (generatedLater ? "Prepared after founding" : "Not set")}.
                </p>
                <p>
                  Shared scenery style and enabled resident/lore context also apply. Access rules do not change the
                  artwork.
                </p>
              </details>
              {generatedLater ? (
                <p>Unvisited contents stay hidden after founding. Optional artwork is generated on first entry.</p>
              ) : (
                imageFields(personal ? "private" : "interior", zone.image, zone.id)
              )}
              <button type="button" disabled={busy} onClick={() => onPatch(removeFoundingZone(venue, zone.id))}>
                Remove Zone
              </button>
            </section>
          );
        })}
      {(() => {
        const actor = venue.occupancy.playerHome ? "player" : venue.occupancy.residentCharacterId;
        if (!actor) return null;
        const home = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].filter(
          (zone) => zone.venueClass === "residence" && (!zone.ownerId || zone.ownerId === actor),
        );
        const shared = home.filter((zone) => !zone.ownerId),
          owned = home.filter((zone) => zone.ownerId === actor);
        return (["home", "sleep"] as const).map((role) => {
          const choices = role === "home" ? (shared.length ? shared : home) : owned.length ? owned : home;
          if (choices.length < 2) return null;
          return (
            <label key={role}>
              Default {role === "home" ? "home activities" : "sleeping"} Zone
              <select
                aria-label={`Default ${role} Zone`}
                value={venue.destinations?.[actor]?.[role] ?? ""}
                onChange={(event) =>
                  onPatch({
                    ...venue,
                    destinations: {
                      ...venue.destinations,
                      [actor]: { ...venue.destinations?.[actor], [role]: event.target.value || undefined },
                    },
                  })
                }
              >
                <option value="">Choose a Zone</option>
                {choices.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name || "Unnamed Zone"}
                  </option>
                ))}
              </select>
              <p>
                Used by schedules. Access remains separate; an unset or inaccessible destination falls back to Exterior.
              </p>
            </label>
          );
        });
      })()}
    </>
  );
}

/** Shared by the founding workspace and the standalone Venue editor. */
export function FoundingConnections({
  venue,
  onPatch,
  selectedZoneId,
  onSelect,
  onAdd,
  allowAdd = false,
  busy = false,
  readOnly = false,
}: {
  venue: VillageVenue;
  onPatch(venue: VillageVenue): void;
  selectedZoneId?: string;
  onSelect?(id: string): void;
  onAdd?(personal: boolean): void;
  allowAdd?: boolean;
  busy?: boolean;
  readOnly?: boolean;
}) {
  const zones = [
    { id: "exterior", name: "Entrance", kind: "exterior", connectedTo: undefined as string[] | undefined },
    ...(venue.spaces ?? []).map((zone) => ({ ...zone, kind: "public" })),
    ...(venue.privateSpaces ?? []).map((zone) => ({ ...zone, kind: "restricted" })),
  ];
  const remove = () => {
    if (!selectedZoneId || selectedZoneId === "exterior") return;
    onPatch(removeFoundingZone(venue, selectedZoneId));
    onSelect?.("exterior");
  };
  if (readOnly)
    return (
      <ZoneMap
        zones={zones}
        positions={venue.zoneLayout}
        selectedId={selectedZoneId}
        onSelect={onSelect}
        disabled={busy}
      />
    );
  return (
    <>
      <ZoneMap
        zones={zones}
        positions={venue.zoneLayout}
        selectedId={selectedZoneId}
        onSelect={onSelect}
        disabled={busy}
        onPositions={(zoneLayout) => onPatch({ ...venue, zoneLayout })}
        onConnections={(rows) =>
          onPatch({
            ...venue,
            spaces: venue.spaces?.map((zone) => ({
              ...zone,
              connectedTo: rows.find((row) => row.id === zone.id)?.connectedTo,
            })),
            privateSpaces: venue.privateSpaces?.map((zone) => ({
              ...zone,
              connectedTo: rows.find((row) => row.id === zone.id)?.connectedTo,
            })),
          })
        }
      />
      {allowAdd ? (
        <div className="villages-zone-map-actions">
          <span>{zones.length - 1} / 6 Zones + Entrance</span>
          <button type="button" disabled={busy || zones.length >= 7} onClick={() => onAdd?.(false)}>
            Add Zone
          </button>
          {venue.category !== "public-center" ? (
            <button type="button" disabled={busy || zones.length >= 7} onClick={() => onAdd?.(true)}>
              Add private Zone
            </button>
          ) : null}
          {selectedZoneId && selectedZoneId !== "exterior" ? (
            <button type="button" disabled={busy || zones.length <= 2} onClick={remove}>
              Remove Zone
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
