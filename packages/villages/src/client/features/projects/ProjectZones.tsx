import { draftZonePolicy } from "../founding/villages-founding-zones.js";
import type { VillageVenue, VillageZoneDraft } from "../../../shared/contracts/village.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ClassChoices, ArtworkUpload } from "./ProjectDesign.js";

const personalKind = (kind: string) => ["private-residence", "staff", "restricted"].includes(kind);
function kindFor(role: string, personal: boolean): VillageZoneDraft["kind"] {
  return personal
    ? role === "residence"
      ? "private-residence"
      : role === "workplace"
        ? "staff"
        : "restricted"
    : role === "residence"
      ? "shared-residence"
      : "public";
}
export function ProjectZones({
  venue,
  zones,
  renovation,
  editable,
  busy,
  onVenue,
  onZones,
  onUpload,
  people,
  selectedId,
  onSelect: select,
}: {
  venue: VillageVenue;
  selectedId: string;
  onSelect(id: string): void;
  people: { id: string; name: string }[];
  zones: VillageZoneDraft[];
  renovation: boolean;
  editable: boolean;
  busy: boolean;
  onVenue(venue: VillageVenue): void;
  onZones(zones: VillageZoneDraft[]): void;
  onUpload(file?: File, zoneId?: string): void;
}) {
  const rows: VillageZoneDraft[] = renovation
    ? zones
    : [
        ...(venue.spaces ?? []).map((zone) => ({
          ...zone,
          name: zone.name ?? "",
          kind: kindFor(zone.venueClass, false),
        })),
        ...(venue.privateSpaces ?? []).map((zone) => ({
          ...zone,
          name: zone.name ?? "",
          kind: kindFor(zone.venueClass, true),
        })),
      ];
  const selected = rows.find((zone) => zone.id === selectedId);
  const entrance = !selected;
  const patch = (next: Partial<VillageZoneDraft>) => {
    if (!selected) return;
    if (renovation) onZones(rows.map((zone) => (zone.id === selected.id ? { ...zone, ...next } : zone)));
    else
      onVenue({
        ...venue,
        spaces: venue.spaces?.map((zone) => (zone.id === selected.id ? { ...zone, ...next } : zone)),
        privateSpaces: venue.privateSpaces?.map((zone) => (zone.id === selected.id ? { ...zone, ...next } : zone)),
      });
  };
  const setNewRows = (
    spaces: NonNullable<VillageVenue["spaces"]>,
    privateSpaces: NonNullable<VillageVenue["privateSpaces"]>,
  ) =>
    onVenue({
      ...venue,
      spaces,
      privateSpaces,
      layoutVersion: 1,
      layout: spaces.length
        ? privateSpaces.length
          ? "both"
          : "common"
        : privateSpaces.length
          ? "private"
          : "exterior",
    });
  const add = (personal: boolean) => {
    if (rows.length >= 6) return;
    const role = venue.classes?.[0] ?? "other";
    const zone = {
      id: "zone:" + createVillagesClientId(),
      name: "New Zone",
      purpose: "",
      description: "",
      kind: kindFor(role, personal),
      venueClass: role,
      connectedTo: ["exterior"],
      controllerIds: [],
    };
    if (renovation) onZones([...rows, zone]);
    else {
      const area = {
        ...zone,
        access: draftZonePolicy(venue, zone, personal),
        image: null,
        state: { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: "" },
      };
      setNewRows(
        personal ? (venue.spaces ?? []) : [...(venue.spaces ?? []), area],
        personal ? [...(venue.privateSpaces ?? []), { ...area, ownerId: "" }] : (venue.privateSpaces ?? []),
      );
    }
    select(zone.id);
  };
  const remove = () => {
    if (!selected) return;
    const without = <T extends { id: string; connectedTo?: string[] }>(rows: T[]) =>
      rows
        .filter((zone) => zone.id !== selected.id)
        .map((zone) => ({
          ...zone,
          connectedTo: zone.connectedTo?.filter((id) => id !== selected.id),
        }));
    if (renovation) onZones(without(rows));
    else setNewRows(without(venue.spaces ?? []), without(venue.privateSpaces ?? []));
    select("exterior");
  };
  const privateRoom = !!selected && personalKind(selected.kind);
  const hidden = privateRoom && (renovation || selected.ownerId !== "player");
  const artwork = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find(
    (zone) => zone.id === selected?.id,
  )?.image;
  return (
    <div className="vp-columns vp-zone-columns">
      <section className="vp-panel">
        <div className="vp-panel-heading">
          <h3>Zones</h3>
          <span>{rows.length} / 6</span>
        </div>
        <nav className="vp-zone-list" aria-label="Project Zones">
          <button type="button" aria-pressed={entrance} onClick={() => select("exterior")}>
            <span className="vp-number">00</span>
            <span>
              <strong>Entrance</strong>
              <small>Arrival & departure</small>
            </span>
            <span>›</span>
          </button>
          {rows.map((zone, index) => (
            <button type="button" key={zone.id} aria-pressed={selected?.id === zone.id} onClick={() => select(zone.id)}>
              <span className="vp-number">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong>{zone.name || "Unnamed Zone"}</strong>
                <small>
                  {personalKind(zone.kind) ? "Private" : "Shared"} · {zone.venueClass}
                </small>
              </span>
              <span>›</span>
            </button>
          ))}
        </nav>
        {editable ? (
          <div className="vp-actions">
            <button type="button" disabled={busy || rows.length >= 6} onClick={() => add(false)}>
              Add Zone
            </button>
            <button type="button" disabled={busy || rows.length >= 6} onClick={() => add(true)}>
              Add private Zone
            </button>
          </div>
        ) : null}
      </section>
      <section className="vp-panel">
        <h3>{entrance ? "Entrance" : selected.name || "Zone specification"}</h3>
        <fieldset disabled={!editable || busy}>
          {entrance ? (
            <label>
              Entrance
              <textarea
                autoComplete="off"
                aria-label="Entrance"
                rows={4}
                value={venue.description}
                readOnly={renovation}
                onChange={(event) => onVenue({ ...venue, description: event.target.value })}
              />
            </label>
          ) : (
            <>
              <label>
                Zone name
                <input
                  autoComplete="off"
                  aria-label="Zone Name"
                  maxLength={100}
                  value={selected.name}
                  onChange={(event) => patch({ name: event.target.value })}
                />
              </label>
              <label>
                Used for
                <input
                  autoComplete="off"
                  aria-label="Zone Used For"
                  maxLength={240}
                  value={selected.purpose ?? ""}
                  onChange={(event) => patch({ purpose: event.target.value })}
                />
              </label>
              {hidden ? (
                <label>
                  Room specification
                  <textarea
                    autoComplete="off"
                    aria-label="Room Specification"
                    rows={4}
                    maxLength={1000}
                    value={selected.roomSpecification ?? ""}
                    onChange={(event) => patch({ roomSpecification: event.target.value })}
                  />
                </label>
              ) : (
                <label>
                  Appearance
                  <textarea
                    autoComplete="off"
                    aria-label="Zone Appearance"
                    rows={4}
                    maxLength={1000}
                    value={selected.description}
                    onChange={(event) => patch({ description: event.target.value })}
                  />
                </label>
              )}
              <span className="vp-label">Class</span>
              <ClassChoices
                value={[selected.venueClass]}
                choices={venue.classes ?? []}
                multiple={false}
                onChange={([role]) => patch({ venueClass: role, kind: kindFor(role, privateRoom) })}
              />
              {renovation && selected.kind === "restricted" && !venue.zones?.some((zone) => zone.id === selected.id) ? (
                <>
                  <span className="vp-label">Controllers</span>
                  <div className="vp-choices" role="group" aria-label="Zone controllers">
                    {[{ id: "player", name: "You" }, ...people].map((person) => (
                      <button
                        type="button"
                        key={person.id}
                        aria-pressed={selected.controllerIds?.includes(person.id) ?? false}
                        onClick={() =>
                          patch({
                            controllerIds: selected.controllerIds?.includes(person.id)
                              ? selected.controllerIds.filter((id) => id !== person.id)
                              : [...(selected.controllerIds ?? []), person.id],
                          })
                        }
                      >
                        {person.name}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
              {hidden ? (
                <p className="vp-note">Private contents stay hidden. Specify the physical changes here.</p>
              ) : null}
              {!renovation && !hidden ? (
                <>
                  {artwork ? <img className="vp-zone-artwork" src={artwork.url} alt={selected.name} /> : null}
                  <ArtworkUpload busy={busy || !editable} onUpload={(file) => onUpload(file, selected.id)} />
                </>
              ) : null}
            </>
          )}
        </fieldset>
        {!entrance && editable ? (
          <button type="button" className="vp-subtle" disabled={busy} onClick={remove}>
            Remove Zone
          </button>
        ) : null}
      </section>
    </div>
  );
}
