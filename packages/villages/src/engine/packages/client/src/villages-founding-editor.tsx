import type { ReactNode } from "react";
import { FoundingZoneFields, draftZonePolicy, foundingZoneProblem } from "./villages-founding-zones";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { VillageVenue, VillageVenueImage } from "./villages-package-entry";
import { createVillagesClientId } from "./villages-venue-send";

export const SCENERY_STYLES = {
  "Painted illustration":
    "Painted storybook illustration, coherent brushwork, soft lighting, and a consistent color palette.",
  Watercolor: "Watercolor scenery with translucent washes, textured paper, soft edges, and a harmonious palette.",
  Cartoon: "Cartoon scenery with clean outlines, simplified shapes, expressive colors, and consistent cel shading.",
  "Pixel art": "Pixel art scenery with crisp pixel edges, a limited consistent palette, and carefully shaded forms.",
  Photorealism: "Photorealistic scenery with natural materials, realistic lighting, and coherent photographic detail.",
  Custom: "",
};
export function SceneryStyleFields({ value, onChange }: { value: string; onChange(value: string): void }) {
  return (
    <fieldset className="villages-scenery-fields">
      <legend>Scenery art style</legend>
      <label>
        Style preset
        <select
          aria-label="Scenery style preset"
          value={
            Object.keys(SCENERY_STYLES).find((key) => SCENERY_STYLES[key as keyof typeof SCENERY_STYLES] === value) ??
            "Custom"
          }
          onChange={(event) => onChange(SCENERY_STYLES[event.target.value as keyof typeof SCENERY_STYLES])}
        >
          {Object.keys(SCENERY_STYLES).map((key) => (
            <option key={key}>{key}</option>
          ))}
        </select>
      </label>
      <label>
        Style description
        <textarea
          aria-label="Scenery style description"
          rows={3}
          maxLength={600}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <p>Used for future map and venue images. Existing artwork stays as it is.</p>
    </fieldset>
  );
}
export type VenueLayout = "exterior" | "common" | "private" | "both";
export function venueHasCommon(venue: VillageVenue): boolean {
  return venue.layout === "common" || venue.layout === "both" || (!venue.layout && !!venue.spaces?.length);
}
export function venueHasPrivate(venue: VillageVenue): boolean {
  return venue.layout === "private" || venue.layout === "both" || (!venue.layout && !!venue.privateSpaces?.length);
}
export type AreaDraftCache = {
  current: {
    common?: NonNullable<VillageVenue["spaces"]>[number];
    personal?: NonNullable<VillageVenue["privateSpaces"]>[number];
  };
};
export function VenueLayoutFields({
  venue,
  onChange,
}: {
  venue: VillageVenue;
  onChange(venue: VillageVenue): void;
  compact?: boolean;
  drafts?: AreaDraftCache;
  onReveal?(area: "common" | "private", layout: VenueLayout): void;
}) {
  const add = (personal: boolean) => {
    const role = venue.classes?.[0] ?? "other";
    const area = {
      ...personalSpaceDraft(),
      id: "zone:" + createVillagesClientId(),
      name: "New Zone",
      purpose: "",
      venueClass: role,
      ownerId:
        personal && role === "residence"
          ? venue.occupancy.playerHome
            ? "player"
            : venue.occupancy.residentCharacterId || ""
          : "",
    };
    const zone = { ...area, access: draftZonePolicy(venue, area, personal) };
    const spaces = personal ? (venue.spaces ?? []) : [...(venue.spaces ?? []), zone];
    const privateSpaces = personal ? [...(venue.privateSpaces ?? []), zone] : (venue.privateSpaces ?? []);
    onChange({
      ...venue,
      layoutVersion: 1,
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
  };
  return (
    <fieldset className="villages-scenery-fields villages-layout-fields">
      <legend>Zones</legend>
      <p>Entrance · Unrestricted, 24/7. Every Venue includes this arrival and departure point.</p>
      <button
        type="button"
        onClick={() => onChange({ ...venue, layoutVersion: 1, layout: "exterior", spaces: [], privateSpaces: [] })}
      >
        Use Entrance only
      </button>
      <p>
        {(venue.spaces?.length ?? 0) + (venue.privateSpaces?.length ?? 0)} additional Zones. Each has its own use,
        appearance, and access.
      </p>
      <button type="button" onClick={() => add(false)}>
        Add Zone
      </button>
      <button type="button" onClick={() => add(true)}>
        Add personal Zone
      </button>
      <p>
        “Personal” preselects the assigned resident as manager. You can choose Public or Permission required for any
        added Zone.
      </p>
    </fieldset>
  );
}
export function AreaClassField({
  venue,
  privateArea = false,
  onChange,
}: {
  venue: VillageVenue;
  privateArea?: boolean;
  onChange(venue: VillageVenue): void;
}) {
  if ((venue.classes?.length ?? 0) < 2) return null;
  const area = privateArea ? venue.privateSpaces?.[0] : venue.spaces?.[0];
  return (
    <label>
      Zone Class
      <select
        aria-label={privateArea ? "Private Space Class" : "Common Space Class"}
        value={area?.venueClass}
        onChange={(event) => {
          const venueClass = event.target.value as NonNullable<VillageVenue["classes"]>[number];
          onChange(
            privateArea
              ? {
                  ...venue,
                  privateSpaces: venue.privateSpaces?.map((room) => ({
                    ...room,
                    venueClass,
                    ownerId:
                      venueClass === "residence"
                        ? venue.occupancy.playerHome
                          ? "player"
                          : venue.occupancy.residentCharacterId || ""
                        : "",
                  })),
                }
              : { ...venue, spaces: venue.spaces?.map((room) => ({ ...room, venueClass })) },
          );
        }}
      >
        {venue.classes?.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </label>
  );
}

export function BaseZoneFields({
  people = [],
  venue,
  zones,
  onChange,
}: {
  venue: VillageVenue;
  zones: NonNullable<VillageVenue["zones"]>;
  people?: { id: string; name: string }[];
  onChange(zones: NonNullable<VillageVenue["zones"]>): void;
}) {
  const add = (personal: boolean) => {
    const role = venue.classes?.[0] ?? "other";
    const zone = {
      ...personalSpaceDraft(),
      id: "base:" + createVillagesClientId(),
      ownerId: undefined,
      name: personal ? "Private Space" : "Common Space",
      venueClass: role,
      kind: (personal
        ? role === "residence"
          ? "private-residence"
          : role === "workplace"
            ? "staff"
            : "restricted"
        : role === "residence"
          ? "shared-residence"
          : "public") as NonNullable<VillageVenue["zones"]>[number]["kind"],
      seen: false,
      controllerIds: [],
    };
    onChange([...zones, zone]);
  };
  return (
    <section>
      <p>Change the base layout through this Renovation. Further zones belong to Upgrades. Capacity is separate.</p>
      {zones.map((zone) => (
        <fieldset key={zone.id}>
          <legend>{zone.name}</legend>
          <label>
            Area name
            <input
              value={zone.name}
              onChange={(event) =>
                onChange(zones.map((area) => (area.id === zone.id ? { ...area, name: event.target.value } : area)))
              }
            />
          </label>
          <label>
            Zone Class
            <select
              value={zone.venueClass}
              onChange={(event) => {
                const role = event.target.value as NonNullable<VillageVenue["classes"]>[number];
                const personal = ["private-residence", "staff", "restricted"].includes(zone.kind);
                onChange(
                  zones.map((area) =>
                    area.id === zone.id
                      ? {
                          ...area,
                          venueClass: role,
                          ownerId: role === "residence" ? area.ownerId : undefined,
                          kind: personal
                            ? role === "residence"
                              ? "private-residence"
                              : role === "workplace"
                                ? "staff"
                                : "restricted"
                            : role === "residence"
                              ? "shared-residence"
                              : "public",
                        }
                      : area,
                  ),
                );
              }}
            >
              {venue.classes?.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          {["public", "shared-residence"].includes(zone.kind) ? (
            <label>
              Description
              <textarea
                value={zone.description}
                placeholder="Existing undiscovered description is retained"
                onChange={(event) =>
                  onChange(
                    zones.map((area) => (area.id === zone.id ? { ...area, description: event.target.value } : area)),
                  )
                }
              />
            </label>
          ) : (
            <label>
              Structural purpose
              <input
                value={zone.purpose || ""}
                onChange={(event) =>
                  onChange(zones.map((area) => (area.id === zone.id ? { ...area, purpose: event.target.value } : area)))
                }
              />
            </label>
          )}
          {zone.kind === "private-residence" && !venue.zones?.some((area) => area.id === zone.id) ? (
            <label>
              Assigned resident
              <select
                value={zone.ownerId ?? ""}
                onChange={(event) =>
                  onChange(
                    zones.map((area) =>
                      area.id === zone.id ? { ...area, ownerId: event.target.value || undefined } : area,
                    ),
                  )
                }
              >
                <option value="">Vacant</option>
                {venue.occupancy.playerHome ? <option value="player">You</option> : null}
                {venue.residentIds?.map((id) => (
                  <option key={id} value={id}>
                    {people.find((person) => person.id === id)?.name ?? id}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {zone.kind === "restricted" ? (
            <label>
              Controllers
              <select
                multiple
                value={zone.controllerIds ?? []}
                onChange={(event) =>
                  onChange(
                    zones.map((area) =>
                      area.id === zone.id
                        ? { ...area, controllerIds: Array.from(event.target.selectedOptions, (option) => option.value) }
                        : area,
                    ),
                  )
                }
              >
                <option value="player">You</option>
                {people
                  .filter((person) => person.id !== "player")
                  .map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
              </select>
            </label>
          ) : null}
          <button type="button" onClick={() => onChange(zones.filter((area) => area.id !== zone.id))}>
            Remove {zone.name}
          </button>
        </fieldset>
      ))}
      {!zones.some((zone) => ["public", "shared-residence"].includes(zone.kind)) ? (
        <button type="button" onClick={() => add(false)}>
          Add Common Space
        </button>
      ) : null}
      {!zones.some((zone) => ["private-residence", "staff", "restricted"].includes(zone.kind)) ? (
        <button type="button" onClick={() => add(true)}>
          Add Private Space
        </button>
      ) : null}
    </section>
  );
}

type PrivateDraft = NonNullable<VillageVenue["privateSpaces"]>[number];
export function personalSpaceDraft(): PrivateDraft {
  return {
    id: "private:player",
    ownerId: "player",
    name: "Your personal space",
    purpose: "Personal space",
    venueClass: "residence",
    description: "",
    image: null,
    state: { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: "" },
  };
}
export function PrivateSpaceFields({
  rooms,
  onChange,
  people,
  workplace = false,
  playerHome = false,
  allowAdd = true,
}: {
  rooms: PrivateDraft[];
  onChange(rooms: PrivateDraft[]): void;
  people: { id: string; name: string }[];
  workplace?: boolean;
  playerHome?: boolean;
  allowAdd?: boolean;
}) {
  const container = useRef<HTMLElement>(null);
  const previousCount = useRef(0);
  useEffect(() => {
    if (rooms.length > previousCount.current) {
      const card = container.current?.querySelector("fieldset:last-of-type");
      card?.scrollIntoView({ block: "nearest" });
      card?.querySelector<HTMLInputElement>("input")?.focus();
    }
    previousCount.current = rooms.length;
  }, [rooms.length]);
  const patch = (id: string, update: Partial<PrivateDraft>) =>
    onChange(rooms.map((room) => (room.id === id ? { ...room, ...update } : room)));
  return (
    <section ref={container} className="villages-private-fields">
      {playerHome ? (
        <p>
          Your personal space belongs to you. Other residents’ personal spaces remain a surprise until you’re invited.
        </p>
      ) : workplace ? (
        <p>A Private Space is optional. All current workers have access; guests need an invitation.</p>
      ) : (
        <p>Restricted Zones are optional. Choose who can invite guests and approve lasting changes.</p>
      )}
      {rooms
        .filter((room) => room.ownerId !== "player")
        .map((room) => (
          <fieldset key={room.id}>
            <legend>{room.name || "Private space"}</legend>
            <label>
              Zone name
              <input
                maxLength={100}
                value={room.name ?? ""}
                onChange={(event) => patch(room.id, { name: event.target.value })}
              />
            </label>
            <label>
              Purpose
              <input
                maxLength={240}
                value={room.purpose ?? ""}
                onChange={(event) => patch(room.id, { purpose: event.target.value })}
              />
            </label>
            {!workplace && room.venueClass !== "residence" ? (
              <fieldset>
                <legend>Room controllers</legend>
                {people.map((person) => (
                  <label key={person.id}>
                    <input
                      type="checkbox"
                      checked={room.controllerIds?.includes(person.id) ?? false}
                      onChange={(event) =>
                        patch(room.id, {
                          controllerIds: event.target.checked
                            ? [...(room.controllerIds ?? []), person.id]
                            : room.controllerIds?.filter((id) => id !== person.id),
                        })
                      }
                    />
                    {person.name}
                  </label>
                ))}
              </fieldset>
            ) : null}
            {room.venueClass === "residence" ? (
              <p>
                This residential Private Space is prepared for its assigned resident. Contents remain hidden until
                invitation.
              </p>
            ) : (
              <label>
                Description · optional
                <textarea
                  maxLength={1000}
                  value={room.description}
                  onChange={(event) => patch(room.id, { description: event.target.value })}
                />
              </label>
            )}
            <p>Private details will be prepared when the venue opens. Its image is drawn on first invited entry.</p>
            <button type="button" onClick={() => onChange(rooms.filter((entry) => entry.id !== room.id))}>
              Remove this private space
            </button>
          </fieldset>
        ))}
      {allowAdd && rooms.length < 1 ? (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...rooms,
              {
                ...personalSpaceDraft(),
                id: "restricted:" + createVillagesClientId(),
                ownerId: "",
                name: "",
                purpose: "",
                venueClass: workplace ? "workplace" : "other",
                controllerIds: [],
              },
            ])
          }
        >
          Add Private Space
        </button>
      ) : null}
    </section>
  );
}
type FoundingVenueEditorProps = {
  venue: VillageVenue;
  existing?: boolean;
  tag: string;
  people: { id: string; name: string }[];
  assignedIds: string[];
  busy: boolean;
  problem: string;
  onPatch(venue: VillageVenue): void;
  zoneDrafts?: AreaDraftCache;
  onDone(): void;
  onCancel(): void;
  onMove(): void;
  onGenerate(area: "exterior" | "interior" | "private", zoneId?: string): void;
  usagePreview?: ReactNode;
  onUpload(area: "exterior" | "interior" | "private", file: File, zoneId?: string): void;
  onRemove(): void;
};

export function FoundingVenueEditor({
  venue,
  existing = false,
  tag,
  people,
  assignedIds,
  busy,
  problem,
  onPatch,
  zoneDrafts,
  onDone,
  onCancel,
  onMove,
  onGenerate,
  usagePreview,
  onUpload,
  onRemove,
}: FoundingVenueEditorProps) {
  const dialog = useRef<HTMLDivElement>(null);
  const [validation, setValidation] = useState("");
  const residence = venue.classes?.includes("residence") ?? false;
  const owner = venue.occupancy.playerHome ? "player" : (venue.occupancy.residentCharacterId ?? "");
  useLayoutEffect(() => {
    const previous = document.activeElement;
    dialog.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  const imageFields = (
    area: "exterior" | "interior" | "private",
    image: VillageVenueImage | null | undefined,
    zoneId?: string,
  ) => (
    <div>
      {image ? <img src={image.url} alt={`${area} of ${venue.name}`} /> : <p>No image added · optional</p>}
      <div className="villages-forging-actions">
        <button type="button" disabled={busy} onClick={() => onGenerate(area, zoneId)}>
          {image ? "Generate again" : "Generate image"}
        </button>
        {usagePreview}
        <label>
          Upload image
          <input
            aria-label={`Upload ${area} image`}
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onUpload(area, file, zoneId);
            }}
          />
        </label>
        {image ? (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              onPatch(
                area === "exterior"
                  ? { ...venue, presentation: { ...venue.presentation, image: null } }
                  : area === "interior"
                    ? {
                        ...venue,
                        spaces: venue.spaces?.map((room, index) =>
                          (zoneId ? room.id === zoneId : index === 0) ? { ...room, image: null } : room,
                        ),
                      }
                    : {
                        ...venue,
                        privateSpaces: venue.privateSpaces?.map((room) =>
                          (zoneId ? room.id === zoneId : room.ownerId === "player") ? { ...room, image: null } : room,
                        ),
                      },
              )
            }
          >
            Remove image
          </button>
        ) : null}
      </div>
    </div>
  );
  const complete = () => {
    const error =
      !venue.name.trim() || !venue.form?.trim()
        ? "Add a Venue name and physical form."
        : !venue.description.trim()
          ? "Describe the Entrance appearance."
          : foundingZoneProblem(venue)
            ? foundingZoneProblem(venue)
            : !venue.occupancy.playerHome && residence && !owner
              ? "Assign a resident."
              : venue.privateSpaces?.some(
                    (room) =>
                      !room.access &&
                      (!room.name?.trim() ||
                        !room.purpose?.trim() ||
                        (!["residence", "workplace"].includes(room.venueClass) && !room.controllerIds?.length)),
                  )
                ? "Give each Private Space a name, purpose, and controller."
                : "";
    setValidation(error);
    if (!error) onDone();
  };
  return (
    <div className="villages-founding-backdrop">
      <div
        ref={dialog}
        className="villages-founding-dialog villages-forging-editor"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${venue.name}`}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) onCancel();
          if (event.key === "Tab") {
            const controls = Array.from(
              dialog.current?.querySelectorAll<HTMLElement>(
                "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary",
              ) ?? [],
            );
            if (event.shiftKey && event.target === controls[0]) {
              event.preventDefault();
              controls.at(-1)?.focus();
            } else if (!event.shiftKey && event.target === controls.at(-1)) {
              event.preventDefault();
              controls[0]?.focus();
            }
          }
        }}
      >
        <header>
          <h3>Edit {venue.name}</h3>
          <p>Location stays where you placed its pin. Artwork is optional.</p>
        </header>
        <div className="villages-founding-editor-body">
          <div className="villages-forging-editor-top">
            <label>
              Venue name
              <input
                aria-label="Venue name"
                maxLength={100}
                value={venue.name}
                disabled={busy}
                onChange={(event) => onPatch({ ...venue, name: event.target.value })}
              />
            </label>
            <label>
              Venue Type
              <input
                aria-label="Venue Type"
                maxLength={100}
                value={venue.venueType ?? ""}
                placeholder="Home, bakery, church, campsite…"
                onChange={(event) => onPatch({ ...venue, venueType: event.target.value })}
              />
            </label>
            <label>
              Physical form
              <input
                aria-label="Physical form"
                maxLength={240}
                value={venue.form ?? ""}
                disabled={busy}
                placeholder="A room, cottage, tent, bunk, or shared hall…"
                onChange={(event) => onPatch({ ...venue, form: event.target.value })}
              />
            </label>
            {residence && !venue.occupancy.playerHome ? (
              <label>
                Assigned villager
                <select
                  aria-label="Assigned villager"
                  disabled={busy}
                  value={owner}
                  onChange={(event) =>
                    onPatch({
                      ...venue,
                      residentIds: [event.target.value],
                      occupancy: { ...venue.occupancy, residentCharacterId: event.target.value },
                      privateSpaces: venue.privateSpaces?.map((room) => ({ ...room, ownerId: event.target.value })),
                    })
                  }
                >
                  <option value="">Choose a villager</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id} disabled={assignedIds.includes(person.id)}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p>{venue.occupancy.playerHome ? "Assigned to you" : "Community Gathering Place"}</p>
            )}
          </div>
          {!existing ? <VenueLayoutFields compact venue={venue} drafts={zoneDrafts} onChange={onPatch} /> : null}
          <div className="villages-forging-zone-grid">
            <section>
              <h4>Entrance · Unrestricted, 24/7</h4>
              <p>The entrance and approach, including corridors for indoor Venues.</p>
              <label>
                Entrance appearance
                <textarea
                  aria-label="Exterior description"
                  maxLength={1000}
                  value={venue.description}
                  disabled={busy}
                  onChange={(event) => onPatch({ ...venue, description: event.target.value })}
                />
              </label>
              {imageFields("exterior", venue.presentation.image)}
            </section>
            <FoundingZoneFields venue={venue} people={people} busy={busy} onPatch={onPatch} imageFields={imageFields} />
          </div>
          <details>
            <summary>Artwork context</summary>
            <label>
              <input
                type="checkbox"
                checked={venue.imageContext?.useAssignedVillagerContext ?? true}
                onChange={(event) =>
                  onPatch({
                    ...venue,
                    imageContext: {
                      useVisualLore: venue.imageContext?.useVisualLore ?? true,
                      useAssignedVillagerContext: event.target.checked,
                    },
                  })
                }
              />
              Use assigned resident’s personality
            </label>
            <label>
              <input
                type="checkbox"
                checked={venue.imageContext?.useVisualLore ?? true}
                onChange={(event) =>
                  onPatch({
                    ...venue,
                    imageContext: {
                      useAssignedVillagerContext: venue.imageContext?.useAssignedVillagerContext ?? true,
                      useVisualLore: event.target.checked,
                    },
                  })
                }
              />
              Use selected Village lorebooks
            </label>
          </details>
          <div className="villages-forging-actions">
            <button type="button" disabled={busy} onClick={onMove}>
              Move on map
            </button>
            {existing ? (
              <button type="button" disabled={busy} onClick={onRemove}>
                Remove Venue
              </button>
            ) : null}
          </div>
          {validation || problem ? (
            <p role="alert" className={tag + "-error"}>
              {validation || problem}
            </p>
          ) : null}
          {busy ? <p role="status">Preparing image…</p> : null}
        </div>
        <footer>
          <button type="button" disabled={busy} onClick={onCancel}>
            Cancel edits
          </button>
          <button type="button" disabled={busy} onClick={complete}>
            Use these details
          </button>
        </footer>
      </div>
    </div>
  );
}
