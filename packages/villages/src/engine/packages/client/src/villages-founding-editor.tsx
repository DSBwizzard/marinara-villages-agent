import { useEffect, useRef, useState } from "react";
import type { VillageVenue, VillageVenueImage } from "./villages-package-entry";

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
type AreaDraftCache = {
  current: {
    common?: NonNullable<VillageVenue["spaces"]>[number];
    personal?: NonNullable<VillageVenue["privateSpaces"]>[number];
  };
};
export function VenueLayoutFields({
  drafts,
  venue,
  onChange,
  onReveal,
}: {
  venue: VillageVenue;
  onChange(venue: VillageVenue): void;
  onReveal?(area: "common" | "private", layout: VenueLayout): void;
  drafts?: AreaDraftCache;
}) {
  const savedCommon = useRef(venue.spaces?.[0] ?? drafts?.current.common);
  const savedPrivate = useRef(venue.privateSpaces?.[0] ?? drafts?.current.personal);
  const choose = (layout: VenueLayout, reveal?: "common" | "private") => {
    savedCommon.current = venue.spaces?.[0] ?? savedCommon.current;
    savedPrivate.current = venue.privateSpaces?.[0] ?? savedPrivate.current;
    if (drafts) {
      drafts.current.common = savedCommon.current;
      drafts.current.personal = savedPrivate.current;
    }
    const role = venue.classes?.[0] ?? "other";
    const owner = venue.occupancy.playerHome ? "player" : venue.occupancy.residentCharacterId || "";
    const common = savedCommon.current ?? {
      ...personalSpaceDraft(),
      id: "common:base",
      venueClass: role,
      ownerId: "",
      name: "Common Area",
    };
    const personal = savedPrivate.current ?? {
      ...personalSpaceDraft(),
      id: "private:base",
      venueClass: role,
      ownerId: role === "residence" ? owner : "",
      name: "Private Area",
      purpose: "Personal area appropriate to this venue",
      controllerIds: [],
    };
    onChange({
      ...venue,
      layoutVersion: 1,
      layout,
      spaces: layout === "common" || layout === "both" ? [common] : [],
      privateSpaces: layout === "private" || layout === "both" ? [personal] : [],
    });
    if (reveal) onReveal?.(reveal, layout);
  };
  return (
    <fieldset className="villages-scenery-fields">
      <legend>Venue layout</legend>
      <p>Every venue has an Exterior. Choose whether an interior exists and how it is used.</p>
      {(
        [
          ["exterior", "Exterior only"],
          ["common", "Common Area only"],
          ["private", "Private Area only"],
          ["both", "Common Area and Private Area"],
        ] as const
      ).map(([value, label]) => (
        <label key={value}>
          <input
            type="radio"
            name={"layout:" + venue.id}
            checked={venue.layout === value}
            onChange={() => choose(value)}
          />
          {label}
        </label>
      ))}
      <p role="status">
        Exterior · {venueHasCommon(venue) ? "1" : "0"} Common Areas · {venueHasPrivate(venue) ? "1" : "0"} Private Areas
      </p>
      {venue.layout ? (
        <div>
          <button
            type="button"
            onClick={() =>
              choose(
                venueHasCommon(venue)
                  ? venueHasPrivate(venue)
                    ? "private"
                    : "exterior"
                  : venueHasPrivate(venue)
                    ? "both"
                    : "common",
                venueHasCommon(venue) ? undefined : "common",
              )
            }
          >
            {venueHasCommon(venue) ? "Remove Common Area" : "Add Common Area"}
          </button>
          <button
            type="button"
            onClick={() =>
              choose(
                venueHasPrivate(venue)
                  ? venueHasCommon(venue)
                    ? "common"
                    : "exterior"
                  : venueHasCommon(venue)
                    ? "both"
                    : "private",
                venueHasPrivate(venue) ? undefined : "private",
              )
            }
          >
            {venueHasPrivate(venue) ? "Remove Private Area" : "Add Private Area"}
          </button>
        </div>
      ) : null}
      <p>A new venue has at most one of each. Renovations can add further zones. Resident capacity is separate.</p>
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
      Area Class
      <select
        aria-label={privateArea ? "Private Area Class" : "Common Area Class"}
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
      id: "base:" + crypto.randomUUID(),
      ownerId: undefined,
      name: personal ? "Private Area" : "Common Area",
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
            Area Class
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
          Add Common Area
        </button>
      ) : null}
      {!zones.some((zone) => ["private-residence", "staff", "restricted"].includes(zone.kind)) ? (
        <button type="button" onClick={() => add(true)}>
          Add Private Area
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
        <p>A Private Area is optional. All current workers have access; guests need an invitation.</p>
      ) : (
        <p>Restricted rooms are optional. Choose who can invite guests and approve lasting changes.</p>
      )}
      {rooms
        .filter((room) => room.ownerId !== "player")
        .map((room) => (
          <fieldset key={room.id}>
            <legend>{room.name || "Private space"}</legend>
            <label>
              Room name
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
                This residential Private Area is prepared for its assigned resident. Contents remain hidden until
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
                id: "restricted:" + crypto.randomUUID(),
                ownerId: "",
                name: "",
                purpose: "",
                venueClass: workplace ? "workplace" : "other",
                controllerIds: [],
              },
            ])
          }
        >
          Add Private Area
        </button>
      ) : null}
    </section>
  );
}
export function FoundingVenueEditor({
  existing = false,
  venue,
  tag,
  people,
  assignedIds,
  busy,
  problem,
  onPatch,
  onDone,
  onCancel,
  onMove,
  onGenerate,
  onUpload,
  onRemove,
}: {
  venue: VillageVenue;
  existing?: boolean;
  tag: string;
  people: { id: string; name: string }[];
  assignedIds: string[];
  busy: boolean;
  problem: string;
  onPatch(venue: VillageVenue): void;
  onDone(): void;
  onCancel(): void;
  onMove(): void;
  onGenerate(area: "exterior" | "interior" | "private"): void;
  onUpload(area: "exterior" | "interior" | "private", file: File): void;
  onRemove(): void;
}) {
  const residence = venue.classes?.includes("residence") ?? false;
  const needsResident = residence && !venue.occupancy.playerHome;
  const steps = [
    ...(needsResident ? ["Resident"] : []),
    "Name and form",
    ...(!existing ? ["Layout"] : []),
    "Exterior",
    ...(venueHasCommon(venue) ? ["Common Area"] : []),
    ...(venueHasPrivate(venue) ? ["Private Area"] : []),
  ];
  const [stage, setStage] = useState(0),
    [error, setError] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const step = steps[Math.min(stage, steps.length - 1)];
  const space = venue.spaces?.[0];
  const personal = venue.privateSpaces?.find((room) => room.ownerId === "player") ?? personalSpaceDraft();
  const areaDrafts = useRef<AreaDraftCache["current"]>({});
  if (venue.spaces?.[0]) areaDrafts.current.common = venue.spaces[0];
  if (venue.privateSpaces?.[0]) areaDrafts.current.personal = venue.privateSpaces[0];
  useEffect(() => {
    dialog.current?.querySelector<HTMLElement>("input,textarea,select,button")?.focus();
  }, [stage, step]);
  useEffect(() => {
    if (stage >= steps.length) setStage(steps.length - 1);
  }, [stage, steps.length]);
  const imageFields = (area: "exterior" | "interior" | "private", image: VillageVenueImage | null | undefined) => (
    <section>
      <p>Image · optional</p>
      {image ? (
        <img className={tag + "-setup-image-preview"} src={image.url} alt={area + " of " + venue.name} />
      ) : (
        <p>No image yet.</p>
      )}
      <div className={tag + "-row"}>
        <button type="button" disabled={busy} onClick={() => onGenerate(area)}>
          {image ? "Regenerate" : "Generate"} {area} image
        </button>
        <label>
          Upload {area} image
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onUpload(area, file);
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
                  : area === "private"
                    ? {
                        ...venue,
                        privateSpaces: (venue.privateSpaces ?? [personal]).map((room) =>
                          room.ownerId === "player" ? { ...room, image: null } : room,
                        ),
                      }
                    : {
                        ...venue,
                        spaces: venue.spaces?.map((room, index) => (index === 0 ? { ...room, image: null } : room)),
                      },
              )
            }
          >
            Remove image
          </button>
        ) : null}
      </div>
    </section>
  );
  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => {
      const node = dialog.current;
      if (!node || !viewport || window.innerWidth > 704) return;
      node.style.height = viewport.height + "px";
      node.parentElement!.style.top = viewport.offsetTop + "px";
      node.parentElement!.style.bottom = "auto";
    };
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    return () => {
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
    };
  }, []);
  const next = () => {
    const missing =
      step === "Resident" && !venue.occupancy.residentCharacterId
        ? "Choose a villager."
        : step === "Name and form" && (!venue.name.trim() || !venue.form?.trim())
          ? "Add a name and describe the form."
          : step === "Exterior" && !venue.description.trim()
            ? "Describe the exterior."
            : step === "Layout" && !venue.layout
              ? "Choose a venue layout."
              : step === "Common Area" && !space?.description.trim()
                ? "Describe the interior."
                : "";
    setError(missing);
    if (missing) {
      dialog.current?.querySelector<HTMLElement>("input,textarea,select")?.focus();
      return;
    }
    if (stage === steps.length - 1) onDone();
    else setStage(stage + 1);
  };
  return (
    <div className="villages-founding-backdrop">
      <div
        ref={dialog}
        className="villages-founding-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={"Define " + venue.name}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) onCancel();
          if (event.key === "Tab") {
            const controls = Array.from(
              dialog.current?.querySelectorAll<HTMLElement>(
                "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)",
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
          <h3>{venue.name || "New venue"}</h3>
          <p>
            {step} · {stage + 1} of {steps.length}
          </p>
        </header>
        <div className="villages-founding-editor-body">
          {step === "Resident" ? (
            <label>
              Assigned villager
              <select
                aria-label="Assigned villager"
                value={venue.occupancy.residentCharacterId ?? ""}
                onChange={(event) =>
                  onPatch({
                    ...venue,
                    residentIds: event.target.value ? [event.target.value] : [],
                    occupancy: { ...venue.occupancy, residentCharacterId: event.target.value || null },
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
          ) : null}
          {step === "Name and form" ? (
            <>
              <label>
                Name
                <input
                  aria-label="Venue name"
                  maxLength={100}
                  value={venue.name}
                  onChange={(event) => onPatch({ ...venue, name: event.target.value })}
                />
              </label>
              <label>
                Form
                <textarea
                  aria-label="Venue form"
                  maxLength={240}
                  value={venue.form ?? ""}
                  placeholder={
                    residence
                      ? "A stone house, a tent, or a converted vehicle…"
                      : "A park, communal fire pit, or gathering hall…"
                  }
                  onChange={(event) => onPatch({ ...venue, form: event.target.value })}
                />
              </label>
            </>
          ) : null}
          {step === "Layout" ? (
            <VenueLayoutFields
              venue={venue}
              drafts={areaDrafts}
              onChange={onPatch}
              onReveal={(area, layout) =>
                setStage((needsResident ? 1 : 0) + 4 + (area === "private" && layout === "both" ? 1 : 0))
              }
            />
          ) : null}
          {step === "Exterior" || step === "Common Area" ? (
            <>
              {step === "Common Area" ? <AreaClassField venue={venue} onChange={onPatch} /> : null}
              <label>
                {step} description
                <textarea
                  aria-label={step + " description"}
                  maxLength={1000}
                  value={step === "Exterior" ? venue.description : (space?.description ?? "")}
                  onChange={(event) =>
                    onPatch(
                      step === "Exterior"
                        ? { ...venue, description: event.target.value }
                        : {
                            ...venue,
                            spaces: venue.spaces?.map((room, index) =>
                              index === 0 ? { ...room, description: event.target.value } : room,
                            ),
                          },
                    )
                  }
                />
              </label>
              <fieldset>
                <legend>Image context</legend>
                {needsResident ? (
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
                    Use assigned villager’s personality
                  </label>
                ) : null}
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
                  Use selected visual lore
                </label>
              </fieldset>
              {imageFields(
                step === "Exterior" ? "exterior" : "interior",
                step === "Exterior" ? venue.presentation.image : space?.image,
              )}
            </>
          ) : null}
          {step === "Private Area" ? (
            <>
              <AreaClassField venue={venue} privateArea onChange={onPatch} />
              {needsResident ? (
                <p>
                  This villager’s personal space will be prepared from their personality, relevant lore, and this home’s
                  form. Its details stay hidden until you’re invited.
                </p>
              ) : null}
              {venue.occupancy.playerHome && venue.privateSpaces?.[0]?.venueClass === "residence" ? (
                <>
                  <label>
                    Your personal-space description
                    <textarea
                      aria-label="Your personal-space description"
                      maxLength={1000}
                      value={personal.description}
                      onChange={(event) =>
                        onPatch({
                          ...venue,
                          privateSpaces: [
                            ...(venue.privateSpaces ?? []).filter((room) => room.ownerId !== "player"),
                            { ...personal, description: event.target.value },
                          ],
                        })
                      }
                    />
                  </label>
                  {imageFields("private", personal.image)}
                </>
              ) : null}
              <PrivateSpaceFields
                rooms={venue.privateSpaces ?? []}
                allowAdd={false}
                onChange={(privateSpaces) =>
                  onPatch({
                    ...venue,
                    privateSpaces,
                    layout: privateSpaces.length
                      ? venueHasCommon(venue)
                        ? "both"
                        : "private"
                      : venueHasCommon(venue)
                        ? "common"
                        : "exterior",
                  })
                }
                people={[{ id: "player", name: "You" }, ...people]}
                playerHome={venue.occupancy.playerHome}
                workplace={venue.privateSpaces?.[0]?.venueClass === "workplace"}
              />
            </>
          ) : null}
          <div className={tag + "-row"}>
            <button type="button" disabled={busy} onClick={onMove}>
              Move on map
            </button>
            <button type="button" disabled={busy} onClick={onRemove}>
              Remove venue
            </button>
          </div>
          {error || problem ? (
            <p role="alert" className={tag + "-error"}>
              {error || problem}
            </p>
          ) : null}
          {busy ? <p role="status">Preparing image…</p> : null}
        </div>
        <footer>
          <button type="button" disabled={busy} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || stage === 0}
            onClick={() => {
              setError("");
              setStage(stage - 1);
            }}
          >
            Back
          </button>
          <button type="button" disabled={busy} onClick={next}>
            {stage === steps.length - 1 ? "Done" : "Continue"}
          </button>
        </footer>
      </div>
    </div>
  );
}
