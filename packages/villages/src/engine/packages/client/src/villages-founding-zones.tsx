import type { ReactNode } from "react";
import type { VillageVenue } from "./villages-package-entry";
import { ZonePolicyFields } from "./villages-venue-access";
import type { ZoneAccessPolicy } from "../../shared/src/villages/venue-access.js";

export function foundingZoneProblem(venue: VillageVenue): string {
  if (
    [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].some(
      (zone) => zone.access && (!zone.name?.trim() || !zone.purpose?.trim()),
    )
  )
    return "Give each Zone a name and describe what it is used for.";
  if (venue.spaces?.some((zone) => !zone.description.trim())) return "Describe each Zone's appearance.";
  return "";
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
    regularVisitors: [],
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
}: {
  venue: VillageVenue;
  people: { id: string; name: string }[];
  busy: boolean;
  editAccess?: boolean;
  selectedZoneId?: string;
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
            <section key={zone.id}>
              <h4>{zone.name || "Zone"}</h4>
              <label>
                Zone name
                <input
                  aria-label="Zone name"
                  disabled={busy}
                  maxLength={100}
                  value={zone.name ?? ""}
                  placeholder="Living room, bedroom, foyer…"
                  onChange={(event) => patch({ name: event.target.value })}
                />
              </label>
              <label>
                Used for
                <input
                  aria-label="Zone used for"
                  disabled={busy}
                  maxLength={240}
                  value={zone.purpose ?? ""}
                  placeholder="Eating together, sleeping, worship, washing…"
                  onChange={(event) => patch({ purpose: event.target.value })}
                />
              </label>
              <p>Describe the activities here. Access is a separate choice.</p>
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
                            : role === "gathering"
                              ? "Gathering"
                              : "Other"}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {generatedLater ? (
                <p>Appearance is prepared for the assigned resident after founding and stays hidden until entry.</p>
              ) : (
                <label>
                  Appearance
                  <textarea
                    aria-label="Zone appearance"
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
              )}
              {editAccess ? (
                <>
                  {personal && !zone.access && !["residence", "workplace"].includes(zone.venueClass) ? (
                    <label>
                      Legacy Zone controllers
                      <select
                        aria-label="Zone controllers"
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
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const spaces = venue.spaces?.filter((row) => row.id !== zone.id) ?? [],
                    privateSpaces = venue.privateSpaces?.filter((row) => row.id !== zone.id) ?? [];
                  onPatch({
                    ...venue,
                    spaces,
                    privateSpaces,
                    layout: spaces.length
                      ? privateSpaces.length
                        ? "both"
                        : "common"
                      : privateSpaces.length
                        ? "private"
                        : "exterior",
                  });
                }}
              >
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
                Used by schedules. Access remains separate; an unset or inaccessible destination falls back to Entrance.
              </p>
            </label>
          );
        });
      })()}
    </>
  );
}
