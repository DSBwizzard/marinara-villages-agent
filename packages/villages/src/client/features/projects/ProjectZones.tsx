import { draftZonePolicy } from "../founding/villages-founding-zones.js";
import type { VillageVenue, VillageZoneDraft } from "../../../shared/contracts/village.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ClassChoices, ArtworkUpload } from "./ProjectDesign.js";
import { useState } from "react";

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
  mobile = false,
  pageSize = 6,
}: {
  venue: VillageVenue;
  selectedId: string;
  onSelect(id: string): void;
  mobile?: boolean;
  pageSize?: number;
  people: { id: string; name: string }[];
  zones: VillageZoneDraft[];
  renovation: boolean;
  editable: boolean;
  busy: boolean;
  onVenue(venue: VillageVenue): void;
  onZones(zones: VillageZoneDraft[]): void;
  onUpload(file?: File, zoneId?: string): void;
}) {
  const [view, setView] = useState<"list" | "editor">("list");
  const [editorPage, setEditorPage] = useState<"details" | "appearance" | "access">("details");
  const [optionPage, setOptionPage] = useState<"main" | "controllers" | "artwork">("main");
  const [controllerPage, setControllerPage] = useState(0);
  const [zonePage, setZonePage] = useState(0);
  const openZone = (id: string) => {
    select(id);
    setEditorPage("details");
    setOptionPage("main");
    setControllerPage(0);
    setView("editor");
  };
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
  const allZones = [{ id: "exterior" }, ...rows];
  const pages = Math.max(1, Math.ceil(allZones.length / pageSize));
  const currentPage = Math.min(zonePage, pages - 1);
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
        state: { revision: 0, updatedAt: "", recent: null },
      };
      setNewRows(
        personal ? (venue.spaces ?? []) : [...(venue.spaces ?? []), area],
        personal ? [...(venue.privateSpaces ?? []), { ...area, ownerId: "" }] : (venue.privateSpaces ?? []),
      );
    }
    openZone(zone.id);
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
    setView("list");
  };
  const privateRoom = !!selected && personalKind(selected.kind);
  const specificationOnly = privateRoom && renovation;
  const artwork = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find(
    (zone) => zone.id === selected?.id,
  )?.image;
  const hasControllers =
    !!selected && renovation && selected.kind === "restricted" && !venue.zones?.some((zone) => zone.id === selected.id);
  const hasArtwork = !!selected && !renovation;
  const controllers = [{ id: "player", name: "You" }, ...people];
  const controllerPages = Math.max(1, Math.ceil(controllers.length / pageSize));
  const currentControllerPage = Math.min(controllerPage, controllerPages - 1);
  return (
    <div className="vp-columns vp-zone-columns" data-zone-view={mobile ? view : "both"} data-editor-page={editorPage}>
      <section className="vp-panel">
        <div className="vp-panel-heading">
          <h3>Zones</h3>
          <span>{rows.length} / 6</span>
        </div>
        <nav className="vp-zone-list" aria-label="Project Zones">
          {currentPage === 0 ? (
            <button type="button" aria-pressed={entrance} onClick={() => openZone("exterior")}>
              <span>
                <strong>Entrance</strong>
                <small>Arrival & departure</small>
              </span>
              <span>›</span>
            </button>
          ) : null}
          {rows
            .filter((_zone, index) => Math.floor((index + 1) / pageSize) === currentPage)
            .map((zone) => (
              <button
                type="button"
                key={zone.id}
                aria-pressed={selected?.id === zone.id}
                onClick={() => openZone(zone.id)}
              >
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
        {pages > 1 ? (
          <div className="vp-actions">
            <button type="button" disabled={currentPage === 0} onClick={() => setZonePage(currentPage - 1)}>
              Previous
            </button>
            <span>
              {currentPage + 1} / {pages}
            </span>
            <button type="button" disabled={currentPage + 1 === pages} onClick={() => setZonePage(currentPage + 1)}>
              Next
            </button>
          </div>
        ) : null}
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
        {mobile ? (
          <div className="vp-zone-pages">
            <button type="button" onClick={() => setView("list")}>
              ‹ Zones
            </button>
            {!entrance ? (
              <>
                <button type="button" aria-pressed={editorPage === "details"} onClick={() => setEditorPage("details")}>
                  Details
                </button>
                <button
                  type="button"
                  aria-pressed={editorPage === "appearance"}
                  onClick={() => setEditorPage("appearance")}
                >
                  Long-term details
                </button>
                <button
                  type="button"
                  aria-pressed={editorPage === "access"}
                  onClick={() => {
                    setEditorPage("access");
                    setOptionPage("main");
                  }}
                >
                  Options
                </button>
              </>
            ) : null}
          </div>
        ) : null}
        <h3>{entrance ? "Entrance" : selected.name || "Zone specification"}</h3>
        {mobile && editorPage === "access" && !entrance && optionPage === "main" && (hasControllers || hasArtwork) ? (
          <div className="vp-detail-pages" role="group" aria-label="Zone options">
            {hasControllers ? (
              <button type="button" onClick={() => setOptionPage("controllers")}>
                Controllers
              </button>
            ) : null}
            {hasArtwork ? (
              <button type="button" onClick={() => setOptionPage("artwork")}>
                Artwork
              </button>
            ) : null}
          </div>
        ) : null}
        <fieldset disabled={!editable || busy}>
          {entrance ? (
            <label>
              Long-term details
              <textarea
                autoComplete="off"
                aria-label="Long-term details"
                rows={4}
                value={venue.description}
                readOnly={renovation}
                onChange={(event) => onVenue({ ...venue, description: event.target.value })}
              />
            </label>
          ) : (
            <>
              <div className="vp-zone-details">
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
              </div>
              <div className="vp-zone-appearance">
                {specificationOnly ? (
                  <label>
                    Room specification
                    <textarea
                      autoComplete="off"
                      aria-label="Room Specification"
                      rows={4}
                      maxLength={4000}
                      value={selected.roomSpecification ?? ""}
                      onChange={(event) => patch({ roomSpecification: event.target.value })}
                    />
                  </label>
                ) : (
                  <label>
                    Long-term details
                    <textarea
                      autoComplete="off"
                      aria-label="Long-term details"
                      rows={4}
                      maxLength={4000}
                      value={selected.description}
                      onChange={(event) => patch({ description: event.target.value })}
                    />
                  </label>
                )}
                {specificationOnly ? <p className="vp-note">Specify the physical changes to this Zone.</p> : null}
              </div>
              <div className="vp-zone-options">
                {!mobile || optionPage === "main" ? (
                  <>
                    <span className="vp-label">Class</span>
                    <ClassChoices
                      value={[selected.venueClass]}
                      choices={venue.classes ?? []}
                      multiple={false}
                      onChange={([role]) => patch({ venueClass: role, kind: kindFor(role, privateRoom) })}
                    />
                  </>
                ) : null}
                {hasControllers && (!mobile || optionPage === "controllers") ? (
                  <>
                    <span className="vp-label">Controllers</span>
                    <div className="vp-choices" role="group" aria-label="Zone controllers">
                      {(mobile
                        ? controllers.slice(currentControllerPage * pageSize, (currentControllerPage + 1) * pageSize)
                        : controllers
                      ).map((person) => (
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
                    {mobile && controllerPages > 1 ? (
                      <div className="vp-actions">
                        <button
                          type="button"
                          disabled={currentControllerPage === 0}
                          onClick={() => setControllerPage(currentControllerPage - 1)}
                        >
                          Previous
                        </button>
                        <span>
                          {currentControllerPage + 1} / {controllerPages}
                        </span>
                        <button
                          type="button"
                          disabled={currentControllerPage + 1 === controllerPages}
                          onClick={() => setControllerPage(currentControllerPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : null}
                {hasArtwork && (!mobile || optionPage === "artwork") ? (
                  <>
                    {artwork ? <img className="vp-zone-artwork" src={artwork.url} alt={selected.name} /> : null}
                    <ArtworkUpload busy={busy || !editable} onUpload={(file) => onUpload(file, selected.id)} />
                  </>
                ) : null}
              </div>
            </>
          )}
        </fieldset>
        {!entrance && editable && (!mobile || (editorPage === "access" && optionPage === "main")) ? (
          <button type="button" className="vp-subtle" disabled={busy} onClick={remove}>
            Remove Zone
          </button>
        ) : null}
      </section>
    </div>
  );
}
