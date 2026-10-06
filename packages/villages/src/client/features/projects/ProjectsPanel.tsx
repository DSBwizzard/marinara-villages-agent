import type {
  BuildProject,
  SceneView,
  VenueClass,
  VillageSnapshot,
  VillageVenue,
  VillageVenueImage,
} from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { readFileAsDataUrl } from "../../shared/presentation.js";
import { BaseZoneFields, venueHasCommon, VenueLayoutFields } from "../founding/villages-founding-editor";
import { FoundingZoneFields, foundingZoneProblem } from "../founding/villages-founding-zones";
import { VillagesBurstPreview } from "../settings/villages-burst-preview.js";
import { VENUE_CLASS_CHOICES } from "../venues/VenuePanels.js";
import { useEffect, useRef, useState } from "react";

const PROJECT_PHASES = [
  "concept",
  "approval",
  "builder",
  "requirements",
  "materials",
  "construction",
  "finishing",
] as const;

const PROJECT_PHASE_NAMES: Record<(typeof PROJECT_PHASES)[number], string> = {
  concept: "Concept & placement",
  approval: "Affected villagers",
  builder: "Assign a Builder",
  requirements: "Define requirements",
  materials: "Prepare materials",
  construction: "Construction",
  finishing: "Finishing visit",
};

function RenovationRevisionEditor({
  venue,
  people,
  project,
  busy,
  onSave,
}: {
  project: BuildProject;
  venue?: VillageVenue;
  people: { id: string; name: string }[];
  busy: boolean;
  onSave: (body: unknown) => Promise<unknown>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [change, setChange] = useState(() => structuredClone(project.lifecycle!.change!));
  const upgrade = change.improvement;
  if (!editing)
    return (
      <button type="button" className={ELEMENT_TAG + "-button"} disabled={busy} onClick={() => setEditing(true)}>
        Revise reviewed proposal
      </button>
    );
  return (
    <section className={ELEMENT_TAG + "-project-card"}>
      <p>
        Changing reviewed terms requires fresh affected-person approvals, a Builder agreement, and a checklist. Acquired
        supplies remain available.
      </p>
      <label>
        Project name
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        Reviewed change
        <textarea value={change.detail} onChange={(event) => setChange({ ...change, detail: event.target.value })} />
      </label>
      {change.classes ? (
        <label>
          Base Classes
          {VENUE_CLASS_CHOICES.map((role) => (
            <label key={role}>
              <input
                type="checkbox"
                checked={change.classes!.includes(role)}
                onChange={(event) =>
                  setChange({
                    ...change,
                    classes: event.target.checked
                      ? [...change.classes!, role]
                      : change.classes!.filter((item) => item !== role),
                  })
                }
              />
              {role}
            </label>
          ))}
        </label>
      ) : null}
      {change.capacity !== undefined ? (
        <label>
          Residential capacity
          <input
            type="number"
            min={1}
            max={4}
            value={change.capacity}
            onChange={(event) => setChange({ ...change, capacity: Number(event.target.value) })}
          />
        </label>
      ) : null}
      {change.baseZones && venue ? (
        <BaseZoneFields
          venue={venue}
          people={people}
          zones={change.baseZones}
          onChange={(baseZones) => setChange({ ...change, baseZones })}
        />
      ) : null}
      {upgrade ? (
        <>
          <label>
            Upgrade title
            <input
              value={upgrade.title}
              onChange={(event) => setChange({ ...change, improvement: { ...upgrade, title: event.target.value } })}
            />
          </label>
          <label>
            Upgrade description
            <textarea
              value={upgrade.description}
              onChange={(event) =>
                setChange({ ...change, improvement: { ...upgrade, description: event.target.value } })
              }
            />
          </label>
          <label>
            Contributed Class
            <select
              value={upgrade.classContribution ?? ""}
              onChange={(event) =>
                setChange({
                  ...change,
                  improvement: {
                    ...upgrade,
                    classContribution: (event.target.value || undefined) as VenueClass | undefined,
                  },
                })
              }
            >
              <option value="">No additional Class</option>
              {VENUE_CLASS_CHOICES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          {(upgrade.zones ?? []).map((zone, index) => (
            <section key={zone.id || index}>
              <label>
                Zone name
                <input
                  value={zone.name}
                  onChange={(event) =>
                    setChange({
                      ...change,
                      improvement: {
                        ...upgrade,
                        zones: upgrade.zones!.map((item, i) =>
                          i === index ? { ...item, name: event.target.value } : item,
                        ),
                      },
                    })
                  }
                />
              </label>
              <label>
                Zone description
                <textarea
                  value={zone.description}
                  onChange={(event) =>
                    setChange({
                      ...change,
                      improvement: {
                        ...upgrade,
                        zones: upgrade.zones!.map((item, i) =>
                          i === index ? { ...item, description: event.target.value } : item,
                        ),
                      },
                    })
                  }
                />
              </label>
              <label>
                Zone kind
                <select
                  value={zone.kind}
                  onChange={(event) =>
                    setChange({
                      ...change,
                      improvement: {
                        ...upgrade,
                        zones: upgrade.zones!.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                kind: event.target.value as typeof zone.kind,
                                venueClass:
                                  event.target.value === "staff"
                                    ? "workplace"
                                    : event.target.value === "shared-residence" ||
                                        event.target.value === "private-residence"
                                      ? "residence"
                                      : (upgrade.classContribution ?? item.venueClass),
                              }
                            : item,
                        ),
                      },
                    })
                  }
                >
                  <option value="public">Public</option>
                  <option value="shared-residence">Residential Common Space</option>
                  <option value="private-residence">Residential Private Space · assigned resident</option>
                  <option value="staff">Staff</option>
                </select>
              </label>
              {zone.kind === "private-residence" ? (
                <label>
                  Assigned resident
                  <select
                    value={zone.ownerId ?? ""}
                    disabled={!!venue?.zones?.some((area) => area.id === zone.id)}
                    onChange={(event) =>
                      setChange({
                        ...change,
                        improvement: {
                          ...upgrade,
                          zones: upgrade.zones!.map((area, i) =>
                            i === index ? { ...area, ownerId: event.target.value || undefined } : area,
                          ),
                        },
                      })
                    }
                  >
                    <option value="">Vacant</option>
                    {venue?.occupancy.playerHome ? <option value="player">You</option> : null}
                    {venue?.residentIds?.map((id) => (
                      <option key={id} value={id}>
                        {people.find((person) => person.id === id)?.name ?? id}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button
                type="button"
                className={ELEMENT_TAG + "-button"}
                onClick={() =>
                  setChange({
                    ...change,
                    improvement: { ...upgrade, zones: upgrade.zones!.filter((_, i) => i !== index) },
                  })
                }
              >
                Remove this zone
              </button>
            </section>
          ))}
          <button
            type="button"
            className={ELEMENT_TAG + "-button"}
            disabled={(upgrade.zones?.length ?? 0) >= 16}
            onClick={() =>
              setChange({
                ...change,
                improvement: {
                  ...upgrade,
                  zones: [
                    ...(upgrade.zones ?? []),
                    {
                      id: "",
                      name: "",
                      description: "",
                      kind: "public",
                      venueClass: upgrade.classContribution ?? "other",
                    },
                  ],
                },
              })
            }
          >
            Add a zone
          </button>
        </>
      ) : null}
      <button
        type="button"
        className={ELEMENT_TAG + "-button"}
        disabled={busy}
        onClick={async () => {
          if (await onSave({ title, ...change })) setEditing(false);
        }}
      >
        Submit revised proposal
      </button>
      <button type="button" className={ELEMENT_TAG + "-button"} disabled={busy} onClick={() => setEditing(false)}>
        Cancel revision
      </button>
    </section>
  );
}

export function ProjectsPanelV2({
  snapshot,
  room,
  onSnapshot,
  onReturn,
  onMap,
  onPlaceOnMap,
  mobile,
  debugEnabled,
  focusProjectId,
  siteProjectId,
}: {
  snapshot: VillageSnapshot;
  room: SceneView | null;
  onSnapshot: (next: VillageSnapshot) => void;
  onReturn: () => void;
  onMap: () => void;
  onPlaceOnMap: (projectId: string) => void;
  mobile: boolean;
  debugEnabled: boolean;
  focusProjectId: string;
  siteProjectId: string;
}) {
  const [selectedId, setSelectedId] = useState(focusProjectId);
  const [draftType, setDraftType] = useState<"new-venue" | "renovation" | "">("");
  const [name, setName] = useState("");
  const [venueClass, setVenueClass] = useState<VenueClass>("gathering");
  const [description, setDescription] = useState("");
  const [venueId, setVenueId] = useState("");
  const [changeKind, setChangeKind] = useState<"class" | "capacity" | "layout" | "upgrade" | "remove-upgrade">(
    "upgrade",
  );
  const [baseZoneDrafts, setBaseZoneDrafts] = useState<
    import("../../../shared/contracts/village.js").VillageZoneDraft[]
  >([]);
  const [baseClasses, setBaseClasses] = useState<VenueClass[]>(["gathering"]);
  const [upgradeTarget, setUpgradeTarget] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [slot, setSlot] = useState(0);
  const [extraBeds, setExtraBeds] = useState(0);
  const [upgradeMode, setUpgradeMode] = useState<"replace" | "modify">("replace");
  const [upgradeClass, setUpgradeClass] = useState<VenueClass | "">("");
  const [upgradeZones, setUpgradeZones] = useState<
    NonNullable<NonNullable<VillageVenue["improvements"]>[number]>["zones"]
  >([]);
  const [form, setForm] = useState("");
  const [openingVenueType, setOpeningVenueType] = useState("");
  const [openingSpaces, setOpeningSpaces] = useState<NonNullable<VillageVenue["spaces"]>>([]);
  const [exterior, setExterior] = useState("");
  const [interior, setInterior] = useState("");
  const [exteriorImage, setExteriorImage] = useState<VillageVenueImage | null>(null);
  const [interiorImage, setInteriorImage] = useState<VillageVenueImage | null>(null);
  const [zoneImages, setZoneImages] = useState<Record<string, VillageVenueImage>>({});
  const [imagePreview, setImagePreview] = useState<{
    area: "exterior" | "interior";
    image: VillageVenueImage;
    key: string;
  } | null>(null);
  const [finishingVisit, setFinishingVisit] = useState(false);
  const [openingLayout, setOpeningLayout] = useState<VillageVenue["layout"]>();
  const [openingFocusArea, setOpeningFocusArea] = useState<"common" | "private">();
  const openingEditors = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!openingFocusArea) return;
    const area = openingEditors.current?.querySelector<HTMLElement>(`[data-layout-editor="${openingFocusArea}"]`);
    area?.scrollIntoView({ block: "nearest" });
    (area?.matches("input,textarea,select")
      ? area
      : area?.querySelector<HTMLElement>("input,textarea,select")
    )?.focus();
    setOpeningFocusArea(undefined);
  }, [openingFocusArea, openingLayout]);
  const [openingCommonClass, setOpeningCommonClass] = useState<VenueClass>();
  const [openingPrivateSpaces, setOpeningPrivateSpaces] = useState<NonNullable<VillageVenue["privateSpaces"]>>([]);
  const [openingPersonality, setOpeningPersonality] = useState(
    snapshot.settings.personalizeVenueImagesByDefault !== false,
  );
  const [openingLore, setOpeningLore] = useState(snapshot.settings.useVisualLoreByDefault !== false);
  useEffect(() => {
    setOpeningPrivateSpaces([]);
    setOpeningLayout(undefined);
    setOpeningCommonClass(undefined);
    setForm("");
    setOpeningVenueType("");
    setOpeningSpaces([]);
    setExterior("");
    setInterior("");
    setExteriorImage(null);
    setInteriorImage(null);
  }, [selectedId]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (focusProjectId) setSelectedId(focusProjectId);
  }, [focusProjectId]);
  const active = snapshot.projects.filter(
    (entry) => (entry.kind === "new-venue" || entry.kind === "renovation") && entry.lifecycle?.phase !== "complete",
  );
  const project = active.find((entry) => entry.id === selectedId) ?? null;
  const flow = project?.lifecycle;
  const target = snapshot.settings.venues.find((entry) => entry.id === project?.venueId);
  const selectedVenue = snapshot.settings.venues.find((entry) => entry.id === venueId);
  const openingVenue: VillageVenue | null = target
    ? {
        ...target,
        layoutVersion: 1,
        layout: openingLayout,
        form,
        venueType: openingVenueType,
        description: exterior,
        spaces:
          openingLayout === "common" || openingLayout === "both"
            ? openingSpaces.map((zone, index) =>
                index === 0
                  ? {
                      ...zone,
                      venueClass: openingCommonClass || zone.venueClass,
                      description: interior,
                      image: interiorImage,
                    }
                  : zone,
              )
            : [],
        privateSpaces: openingPrivateSpaces,
      }
    : null;
  const patchOpeningLayout = (venue: VillageVenue) => {
    setOpeningLayout(venue.layout);
    setOpeningSpaces(venue.spaces ?? []);
    setOpeningVenueType(venue.venueType ?? "");
    setOpeningPrivateSpaces(venue.privateSpaces ?? []);
    if (venue.spaces?.[0]) {
      setOpeningCommonClass(venue.spaces[0].venueClass);
      setInterior(venue.spaces[0].description);
    }
  };

  const selectedUpgrade = JSON.stringify(selectedVenue?.improvements?.[slot] ?? null);
  useEffect(() => {
    const upgrade = JSON.parse(selectedUpgrade) as NonNullable<VillageVenue["improvements"]>[number];
    if (upgradeMode === "modify" && upgrade) {
      setName(upgrade.title);
      setDescription(upgrade.description);
      setExtraBeds(upgrade.extraBeds);
      setUpgradeTarget(upgrade.spaceId ?? "");
      setUpgradeClass(upgrade.classContribution ?? "");
      setUpgradeZones(upgrade.zones ?? []);
    } else {
      setUpgradeClass("");
      setUpgradeTarget("");
      setUpgradeZones([]);
    }
  }, [selectedVenue?.id, selectedUpgrade, slot, upgradeMode]);
  const selectedBaseZones = JSON.stringify(
    selectedVenue?.zones?.filter((zone) => !zone.upgradeId && zone.kind !== "exterior") ?? [],
  );
  useEffect(() => {
    setBaseZoneDrafts(JSON.parse(selectedBaseZones));
  }, [selectedBaseZones]);
  const selectedBaseClasses = JSON.stringify(selectedVenue?.baseClasses ?? selectedVenue?.classes ?? ["gathering"]);
  useEffect(() => {
    setBaseClasses(JSON.parse(selectedBaseClasses) as VenueClass[]);
  }, [selectedVenue?.id, selectedBaseClasses]);
  const run = async (path: string, body: unknown = {}) => {
    setBusy(true);
    setError("");
    try {
      const next = await request<VillageSnapshot>(path, { method: "POST", body: JSON.stringify(body) });
      onSnapshot(next);
      return next;
    } catch (cause) {
      setError(messageFrom(cause, "The Project could not be updated."));
      return null;
    } finally {
      setBusy(false);
    }
  };
  const action = (step: string, body: unknown = {}) =>
    project && run(`/projects/${encodeURIComponent(project.id)}/${step}`, body);
  const create = async () => {
    const body =
      draftType === "new-venue"
        ? { name, venueClass, description }
        : {
            title: name,
            detail: description,
            ...(changeKind === "class" && selectedVenue ? { classes: baseClasses } : {}),
            ...(changeKind === "capacity" ? { capacity } : {}),
            ...(changeKind === "layout" ? { baseZones: baseZoneDrafts } : {}),
            ...(changeKind === "upgrade"
              ? {
                  slot,
                  improvement: {
                    id: upgradeMode === "modify" ? selectedVenue?.improvements?.[slot]?.id : undefined,
                    title: name,
                    description,
                    extraBeds,
                    spaceId: upgradeTarget || null,
                    classContribution: upgradeClass || undefined,
                    zones: upgradeZones,
                  },
                }
              : {}),
            ...(changeKind === "remove-upgrade" ? { slot, improvement: null } : {}),
          };
    const next = await run(
      draftType === "new-venue" ? "/projects" : `/projects/renovations/${encodeURIComponent(venueId)}`,
      body,
    );
    const created = next?.projects.find((entry) => entry.kind === draftType && entry.lifecycle?.phase !== "complete");
    if (created) {
      setSelectedId(created.id);
      setDraftType("");
    }
  };
  const openingImageKey = JSON.stringify([
    project?.id,
    openingVenue
      ? {
          venueType: openingVenue.venueType,
          form: openingVenue.form,
          description: openingVenue.description,
          spaces: openingVenue.spaces?.map(({ access: _access, accessView: _view, ...physical }) => physical),
          privateSpaces: openingVenue.privateSpaces?.map(
            ({ access: _access, accessView: _view, ...physical }) => physical,
          ),
        }
      : null,
    openingLore,
    openingPersonality,
    snapshot.settings.setting,
    snapshot.settings.worldFacts,
    snapshot.settings.sceneryArtStyle,
  ]);
  const openingImageKeyRef = useRef(openingImageKey);
  openingImageKeyRef.current = openingImageKey;
  const generateImage = async (area: "exterior" | "interior") => {
    const expectedKey = openingImageKey;
    if (!project) return;
    setBusy(true);
    setError("");
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image/generate", {
        method: "POST",
        body: JSON.stringify({
          venue: {
            id: target?.id || project.venueId || project.id,
            name: project.title,
            venueType: openingVenueType,
            form: form || project.title,
            description: exterior || project.venueDraft?.description || target?.description,
            spaceDescription: interior || target?.spaces?.[0]?.description || exterior,
            layout: project.kind === "new-venue" ? openingLayout : undefined,
            areas: openingVenue
              ? [...(openingVenue.spaces ?? []), ...(openingVenue.privateSpaces ?? [])].map((area) => ({
                  role: area.venueClass,
                  name: area.name,
                  purpose: area.purpose,
                }))
              : [],
            venueClass: project.venueDraft?.classes?.[0] ?? target?.classes?.[0] ?? "other",
          },
          area,
          villageName: snapshot.village.name,
          setting: snapshot.settings.setting,
          worldFacts: snapshot.settings.worldFacts,
          selectedLorebookIds: snapshot.settings.selectedLorebookIds,
          sceneryArtStyle: snapshot.settings.sceneryArtStyle,
          useVisualLore: openingLore,
          useAssignedVillagerContext: openingPersonality,
        }),
      });
      if (openingImageKeyRef.current !== expectedKey) {
        setError("The Venue changed while the image was being prepared. Generate a fresh image.");
        return;
      }
      setImagePreview({ area, image, key: expectedKey });
    } catch (cause) {
      setError(messageFrom(cause, "The Venue image could not be generated."));
    } finally {
      setBusy(false);
    }
  };
  const uploadImage = async (area: "exterior" | "interior", file?: File) => {
    const expectedKey = openingImageKey;
    if (!file || !project) return;
    setBusy(true);
    setError("");
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image", {
        method: "PUT",
        body: JSON.stringify({ name: project.title, image: await readFileAsDataUrl(file) }),
      });
      if (openingImageKeyRef.current !== expectedKey) {
        setError("The Venue changed while the image was being prepared. Generate a fresh image.");
        return;
      }
      setImagePreview({ area, image, key: expectedKey });
    } catch (cause) {
      setError(messageFrom(cause, "The Venue image could not be uploaded."));
    } finally {
      setBusy(false);
    }
  };
  const phase = flow?.phase;
  if (project && phase === "finishing" && finishingVisit)
    return (
      <div className={`${ELEMENT_TAG}-project-finish-visit`} ref={openingEditors}>
        <header>
          <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setFinishingVisit(false)}>
            Back to Project
          </button>
          <h2>{project.kind === "new-venue" ? `Open ${project.title}` : `Review ${project.title}`}</h2>
          <p>
            {project.kind === "new-venue"
              ? "Define the Venue Type, physical form, and each Zone’s use and appearance. Images are optional."
              : "Review the approved zone names, access, and descriptions, then choose final images if you wish."}
          </p>
        </header>
        {project.kind === "renovation" ? (
          <button
            type="button"
            className={ELEMENT_TAG + "-button"}
            disabled={busy}
            onClick={async () => {
              if (await action("renew-approvals")) setFinishingVisit(false);
            }}
          >
            Renew approvals for current residents and workers
          </button>
        ) : null}
        {project.kind === "new-venue" ? (
          <>
            <label>
              Venue Type
              <input
                value={openingVenueType}
                maxLength={100}
                placeholder="Bakery, church, campsite…"
                onChange={(event) => setOpeningVenueType(event.target.value)}
              />
            </label>
            <label>
              Physical form
              <input
                value={form}
                onChange={(event) => setForm(event.target.value)}
                placeholder="What is this place, physically?"
              />
            </label>
            {openingVenue ? (
              <VenueLayoutFields venue={openingVenue} onChange={patchOpeningLayout} onReveal={setOpeningFocusArea} />
            ) : null}
            <label>
              Entrance appearance
              <textarea value={exterior} onChange={(event) => setExterior(event.target.value)} />
            </label>
            {openingVenue ? (
              <FoundingZoneFields
                venue={openingVenue}
                busy={busy}
                editAccess={false}
                people={snapshot.villagers.map((person) => ({ id: person.characterId, name: person.name }))}
                onPatch={patchOpeningLayout}
                imageFields={() => <p>Optional artwork for additional Zones can be added after opening.</p>}
              />
            ) : null}
            <label>
              <input
                type="checkbox"
                checked={openingPersonality}
                onChange={(event) => setOpeningPersonality(event.target.checked)}
              />
              Use assigned villagers’ personality for images
            </label>
            <label>
              <input type="checkbox" checked={openingLore} onChange={(event) => setOpeningLore(event.target.checked)} />
              Use selected visual lore
            </label>
            {target?.classes?.includes("residence") ? (
              <p>
                Capacity starts at one resident. A personal residential Zone is assigned explicitly when someone moves
                in.
              </p>
            ) : null}
          </>
        ) : (
          <p>{flow?.change?.detail}</p>
        )}
        {(
          [
            "exterior",
            ...(project.kind === "new-venue" && openingVenue && venueHasCommon(openingVenue) ? ["interior"] : []),
          ] as Array<"exterior" | "interior">
        ).map((area) => {
          const image = area === "exterior" ? exteriorImage : interiorImage;
          return (
            <section key={area} className={`${ELEMENT_TAG}-project-image`}>
              <h3>
                {area === "exterior" ? "Entrance" : openingVenue?.spaces?.[0]?.name || "First Zone"} image · optional
              </h3>
              {image ? (
                <img src={image.url} alt={`${area} preview`} />
              ) : (
                <p>No image chosen. A placeholder will be used.</p>
              )}
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={busy}
                onClick={() => void generateImage(area)}
              >
                Generate image
              </button>
              <VillagesBurstPreview request={request} action="images" args={{ count: 1 }} />
              <input
                type="file"
                accept="image/*"
                aria-label={`Upload ${area} image`}
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  void uploadImage(area, file);
                }}
              />
            </section>
          );
        })}
        {project.kind === "renovation"
          ? (flow?.change?.improvement?.zones ?? []).map((zone) => (
              <section key={zone.id} className={ELEMENT_TAG + "-project-image"}>
                <h3>
                  {zone.name} · {zone.kind}
                </h3>
                <p>{zone.description}</p>
                {zoneImages[zone.id!] ? (
                  <img src={zoneImages[zone.id!]!.url} alt={zone.name + " preview"} />
                ) : (
                  <p>Image optional. Existing images are preserved.</p>
                )}
                <label>
                  Upload final zone image
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busy}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      setBusy(true);
                      try {
                        const image = await request<VillageVenueImage>("/setup/venue-image", {
                          method: "PUT",
                          body: JSON.stringify({ name: zone.name, image: await readFileAsDataUrl(file) }),
                        });
                        setZoneImages((current) => ({ ...current, [zone.id!]: image }));
                      } catch (cause) {
                        setError(messageFrom(cause, "The zone image could not be uploaded."));
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </label>
              </section>
            ))
          : null}
        {imagePreview && imagePreview.key === openingImageKey ? (
          <section className={`${ELEMENT_TAG}-project-image`}>
            <img src={imagePreview.image.url} alt="Generated Venue candidate" />
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={() => {
                if (imagePreview.area === "exterior") setExteriorImage(imagePreview.image);
                else setInteriorImage(imagePreview.image);
                setImagePreview(null);
              }}
            >
              Use this image
            </button>
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setImagePreview(null)}>
              Discard
            </button>
          </section>
        ) : null}
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          disabled={
            busy ||
            (project.kind === "new-venue" &&
              (!form.trim() ||
                !exterior.trim() ||
                !openingLayout ||
                ((openingLayout === "common" || openingLayout === "both") && !interior.trim()) ||
                !!(openingVenue && foundingZoneProblem(openingVenue))))
          }
          onClick={async () => {
            const next = await action("open", {
              form,
              venueType: openingVenueType,
              exteriorDescription: exterior,
              exteriorImage,
              ...(project.kind === "new-venue" && openingVenue && venueHasCommon(openingVenue)
                ? { interiorDescription: interior, interiorImage }
                : {}),
              zoneImages,
              layoutVersion: 1,
              layout: openingLayout,
              spaces: openingVenue?.spaces ?? [],
              privateSpaces: openingPrivateSpaces,
              imageContext: { useAssignedVillagerContext: openingPersonality, useVisualLore: openingLore },
            });
            if (next) setFinishingVisit(false);
          }}
        >
          Open Venue
        </button>
        {error ? (
          <p className={`${ELEMENT_TAG}-error`} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  return (
    <div className={`${ELEMENT_TAG}-project-screen`} data-mobile={mobile}>
      <header className={`${ELEMENT_TAG}-project-head`}>
        <div>
          <span className={`${ELEMENT_TAG}-project-eyebrow`}>PROJECTS</span>
          <h2>{project?.title ?? "Build something in the Village"}</h2>
          <p>
            {project
              ? project.kind === "new-venue"
                ? "A new place, from blueprint to opening day."
                : "Change a place that already belongs to the Village."
              : "One New Venue and one Renovation may be underway at once."}
          </p>
        </div>
        {project ? (
          <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setSelectedId("")}>
            All Projects
          </button>
        ) : null}
      </header>
      {!project ? (
        <div className={`${ELEMENT_TAG}-project-slots`}>
          {(["new-venue", "renovation"] as const).map((kind) => {
            const current = active.find((entry) => entry.kind === kind);
            return (
              <button
                key={kind}
                type="button"
                className={`${ELEMENT_TAG}-project-slot`}
                onClick={() => (current ? setSelectedId(current.id) : setDraftType(kind))}
              >
                <span>{kind === "new-venue" ? "NEW VENUE" : "RENOVATION"}</span>
                <strong>
                  {current?.title ?? (kind === "new-venue" ? "Imagine a new place" : "Change an existing Venue")}
                </strong>
                <small>
                  {current?.lifecycle
                    ? (PROJECT_PHASE_NAMES[current.lifecycle.phase as (typeof PROJECT_PHASES)[number]] ?? "Opening")
                    : "Available"}
                </small>
              </button>
            );
          })}
          {draftType ? (
            <section className={`${ELEMENT_TAG}-project-card ${ELEMENT_TAG}-project-create`}>
              <h3>{draftType === "new-venue" ? "Describe the new Venue" : "Describe the Renovation"}</h3>
              {draftType === "renovation" ? (
                <>
                  <label>
                    Venue
                    <select value={venueId} onChange={(event) => setVenueId(event.target.value)}>
                      <option value="">Choose a Venue</option>
                      {snapshot.settings.venues
                        .filter((entry) => entry.constructionStatus !== "worksite")
                        .map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Physical change
                    <select
                      value={changeKind}
                      onChange={(event) => setChangeKind(event.target.value as typeof changeKind)}
                    >
                      <option value="upgrade">Add or replace an Upgrade</option>
                      <option value="remove-upgrade">Remove an Upgrade</option>
                      <option value="class">Change base Classes</option>
                      <option value="layout">Change base layout</option>
                      <option value="capacity">Change Residence capacity</option>
                    </select>
                  </label>
                  {changeKind === "class" ? (
                    <fieldset>
                      <legend>Base Classes</legend>
                      <p>
                        Choose one or two base Classes. Upgrade contributions also count toward the two-Class limit.
                      </p>
                      {VENUE_CLASS_CHOICES.map((item) => (
                        <label key={item}>
                          <input
                            type="checkbox"
                            checked={baseClasses.includes(item)}
                            onChange={(event) =>
                              setBaseClasses((current) =>
                                event.target.checked ? [...current, item] : current.filter((entry) => entry !== item),
                              )
                            }
                          />
                          {item}
                        </label>
                      ))}
                    </fieldset>
                  ) : null}
                  {changeKind === "layout" && selectedVenue ? (
                    <BaseZoneFields
                      venue={selectedVenue}
                      people={snapshot.villagers.map((person) => ({ id: person.characterId, name: person.name }))}
                      zones={baseZoneDrafts}
                      onChange={setBaseZoneDrafts}
                    />
                  ) : null}
                  {changeKind === "capacity" ? (
                    <label>
                      Capacity
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={capacity}
                        onChange={(event) => setCapacity(Number(event.target.value))}
                      />
                    </label>
                  ) : null}
                  {changeKind === "upgrade" || changeKind === "remove-upgrade" ? (
                    <label>
                      Upgrade slot
                      <select value={slot} onChange={(event) => setSlot(Number(event.target.value))}>
                        <option value={0}>Slot 1 · {selectedVenue?.improvements?.[0]?.title ?? "empty"}</option>
                        <option value={1}>Slot 2 · {selectedVenue?.improvements?.[1]?.title ?? "empty"}</option>
                      </select>
                    </label>
                  ) : null}
                  {changeKind === "upgrade" ? (
                    <>
                      <label>
                        Upgrade action
                        <select
                          value={upgradeMode}
                          onChange={(event) => setUpgradeMode(event.target.value as "replace" | "modify")}
                        >
                          <option value="replace">Add or replace this Upgrade</option>
                          {selectedVenue?.improvements?.[slot] ? (
                            <option value="modify">Modify the existing Upgrade</option>
                          ) : null}
                        </select>
                      </label>
                      <label>
                        Class contributed
                        <select
                          value={upgradeClass}
                          onChange={(event) => setUpgradeClass(event.target.value as VenueClass | "")}
                        >
                          <option value="">No additional Class</option>
                          {VENUE_CLASS_CHOICES.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Existing area improved (optional)
                        <select value={upgradeTarget} onChange={(event) => setUpgradeTarget(event.target.value)}>
                          <option value="">No existing Zone</option>
                          {selectedVenue?.zones
                            ?.filter((zone) => zone.kind !== "private-residence")
                            .map((zone) => (
                              <option key={zone.id} value={zone.id}>
                                {zone.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <p>
                        A Venue supports at most two distinct Classes, including its Upgrades. An Upgrade can add zones
                        or improve an existing area.
                      </p>
                      {(upgradeZones ?? []).map((zone, index) => (
                        <section className={ELEMENT_TAG + "-project-card"} key={zone.id ?? index}>
                          <label>
                            Zone name
                            <input
                              value={zone.name}
                              onChange={(event) =>
                                setUpgradeZones((current) =>
                                  current?.map((item, i) =>
                                    i === index ? { ...item, name: event.target.value } : item,
                                  ),
                                )
                              }
                            />
                          </label>
                          <label>
                            Area
                            <select
                              value={zone.kind}
                              onChange={(event) =>
                                setUpgradeZones((current) =>
                                  current?.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          kind: event.target.value as typeof zone.kind,
                                          venueClass:
                                            event.target.value === "shared-residence" ||
                                            event.target.value === "private-residence"
                                              ? "residence"
                                              : event.target.value === "staff"
                                                ? "workplace"
                                                : upgradeClass || selectedVenue?.classes?.[0] || "other",
                                        }
                                      : item,
                                  ),
                                )
                              }
                            >
                              <option value="public">General Zone</option>
                              <option value="shared-residence">Shared residential Zone</option>
                              <option value="private-residence">Personal residential Zone · assigned resident</option>
                              <option value="staff">Work Zone</option>
                              <option value="restricted">Other dedicated Zone</option>
                            </select>
                          </label>
                          {
                            <label>
                              Used for
                              <input
                                value={zone.purpose ?? ""}
                                maxLength={240}
                                onChange={(event) =>
                                  setUpgradeZones((current) =>
                                    current?.map((item, i) =>
                                      i === index ? { ...item, purpose: event.target.value } : item,
                                    ),
                                  )
                                }
                              />
                            </label>
                          }
                          {zone.kind === "private-residence" ? (
                            <label>
                              Assigned resident
                              <select
                                value={zone.ownerId || ""}
                                onChange={(event) =>
                                  setUpgradeZones((current) =>
                                    current?.map((item, i) =>
                                      i === index ? { ...item, ownerId: event.target.value || undefined } : item,
                                    ),
                                  )
                                }
                              >
                                <option value="">Vacant · assign on move-in</option>
                                {selectedVenue?.residentIds?.map((id) => (
                                  <option key={id} value={id}>
                                    {snapshot.villagers.find((person) => person.characterId === id)?.name || id}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : null}
                          {zone.kind === "restricted" ? (
                            <fieldset>
                              <legend>Room controllers</legend>
                              {snapshot.villagers.map((person) => (
                                <label key={person.characterId}>
                                  <input
                                    type="checkbox"
                                    checked={zone.controllerIds?.includes(person.characterId) ?? false}
                                    onChange={(event) =>
                                      setUpgradeZones((current) =>
                                        current?.map((item, i) =>
                                          i === index
                                            ? {
                                                ...item,
                                                controllerIds: event.target.checked
                                                  ? [...(item.controllerIds ?? []), person.characterId]
                                                  : item.controllerIds?.filter((id) => id !== person.characterId),
                                              }
                                            : item,
                                        ),
                                      )
                                    }
                                  />
                                  {person.name}
                                </label>
                              ))}
                            </fieldset>
                          ) : null}
                          <label>
                            Description
                            <textarea
                              value={zone.description}
                              onChange={(event) =>
                                setUpgradeZones((current) =>
                                  current?.map((item, i) =>
                                    i === index ? { ...item, description: event.target.value } : item,
                                  ),
                                )
                              }
                            />
                          </label>
                          <button
                            type="button"
                            className={ELEMENT_TAG + "-button"}
                            onClick={() => setUpgradeZones((current) => current?.filter((_, i) => i !== index))}
                          >
                            Remove from proposal
                          </button>
                        </section>
                      ))}
                      <button
                        type="button"
                        className={ELEMENT_TAG + "-button"}
                        onClick={() =>
                          setUpgradeZones((current) => [
                            ...(current ?? []),
                            {
                              name: "",
                              kind: "public",
                              description: "",
                              venueClass: upgradeClass || selectedVenue?.classes?.[0] || "other",
                            },
                          ])
                        }
                      >
                        Add a Zone to this Upgrade
                      </button>
                    </>
                  ) : null}
                  {changeKind === "upgrade" ? (
                    <label>
                      Extra beds
                      <input
                        type="number"
                        min={0}
                        max={3}
                        value={extraBeds}
                        onChange={(event) => setExtraBeds(Number(event.target.value))}
                      />
                    </label>
                  ) : null}
                </>
              ) : (
                <label>
                  Venue Class
                  <select value={venueClass} onChange={(event) => setVenueClass(event.target.value as VenueClass)}>
                    <option value="residence">Residence</option>
                    <option value="workplace">Workplace</option>
                    <option value="gathering">Gathering</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              )}
              <label>
                {draftType === "new-venue" ? "Venue name" : "Project name"}
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Give this place a name"
                />
              </label>
              <label>
                What would this {draftType === "new-venue" ? "place" : "change"} be like in the Village?
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
              </label>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={
                  busy ||
                  !name.trim() ||
                  !description.trim() ||
                  (draftType === "renovation" &&
                    (!venueId || (changeKind === "class" && (!baseClasses.length || baseClasses.length > 2))))
                }
                onClick={() => void create()}
              >
                {draftType === "new-venue" ? "Continue to map placement" : "Start Renovation"}
              </button>
            </section>
          ) : null}
        </div>
      ) : (
        <div className={`${ELEMENT_TAG}-project-layout`}>
          <nav className={`${ELEMENT_TAG}-project-rail`} aria-label="Project phases">
            {PROJECT_PHASES.filter((item) => item !== "approval" || project.kind === "renovation").map(
              (item, index) => {
                const currentIndex = PROJECT_PHASES.indexOf(phase as (typeof PROJECT_PHASES)[number]);
                const stepIndex = PROJECT_PHASES.indexOf(item);
                return (
                  <div
                    key={item}
                    className={`${ELEMENT_TAG}-project-step`}
                    data-state={stepIndex === currentIndex ? "active" : stepIndex < currentIndex ? "done" : "locked"}
                  >
                    <b>{stepIndex < currentIndex ? "✓" : index + 1}</b>
                    <span>{PROJECT_PHASE_NAMES[item]}</span>
                  </div>
                );
              },
            )}
          </nav>
          <main className={`${ELEMENT_TAG}-project-card`}>
            {project.kind === "renovation" && !["construction", "finishing", "complete"].includes(phase ?? "") ? (
              <RenovationRevisionEditor
                key={project.id + project.updatedAt}
                project={project}
                venue={target}
                people={snapshot.villagers.map((person) => ({ id: person.characterId, name: person.name }))}
                busy={busy}
                onSave={(body) => run(`/projects/${encodeURIComponent(project.id)}/revise`, body)}
              />
            ) : null}
            {phase === "concept" ? (
              <>
                <h3>Place the blueprint</h3>
                <p>{project.venueDraft?.description}</p>
                <p>Choose a clear spot on the Village map. The blueprint marks where this Venue will be built.</p>
                <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => onPlaceOnMap(project.id)}>
                  Place on Village map
                </button>
              </>
            ) : null}
            {phase === "approval" ? (
              <>
                <h3>People affected by this change</h3>
                <p>{flow?.change?.detail}</p>
                {(flow?.change?.improvement?.zones ?? []).map((zone) => (
                  <p key={zone.id}>
                    <strong>{zone.name}</strong> · {zone.kind}: {zone.description}
                  </p>
                ))}
                <p>
                  They may approve in conversation or reply through Mailbox. Every affected resident or worker must
                  agree before you ask for a Builder.
                </p>
                {flow?.affectedIds.map((id) => (
                  <p key={id}>
                    {snapshot.villagers.find((entry) => entry.characterId === id)?.name ?? id}:{" "}
                    {flow.approvals.some((entry) => entry.residentId === id) ? "Approved" : "Awaiting approval"}
                  </p>
                ))}
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy}
                  onClick={() => void action("request-approval")}
                >
                  Ask remaining villagers through Mailbox
                </button>
              </>
            ) : null}
            {phase === "builder" ? (
              <>
                <h3>Find a Builder</h3>
                <p>
                  Find villagers on the map and ask them about this Project in a real conversation. Their clear
                  agreements appear here automatically.
                </p>

                {flow?.candidates.length ? (
                  flow.candidates.map((entry) => (
                    <button
                      key={entry.residentId}
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => void action("builder", { residentId: entry.residentId })}
                    >
                      Assign{" "}
                      {snapshot.villagers.find((row) => row.characterId === entry.residentId)?.name ?? "this Villager"}
                    </button>
                  ))
                ) : (
                  <p>No one has agreed yet.</p>
                )}
              </>
            ) : null}
            {phase === "requirements" ? (
              <>
                <h3>Define requirements with your Builder</h3>
                <p>
                  Ask{" "}
                  {snapshot.villagers.find((entry) => entry.characterId === flow?.builderId)?.name ?? "your Builder"}{" "}
                  what this job needs. They decide the materials, functional equipment, and finishing supplies. Their
                  checklist appears here automatically.
                </p>
                {flow?.requirements.length ? (
                  <div>
                    {flow.requirements.map((entry) => (
                      <p key={entry.id}>
                        <strong>{entry.category}</strong> · {entry.needed ? entry.title : "Not needed"}
                      </p>
                    ))}
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => void action("requirements")}
                    >
                      Accept Builder's plan
                    </button>
                    <p>To change it, discuss a revision with the Builder.</p>
                  </div>
                ) : (
                  <p>Waiting for the Builder's plan.</p>
                )}
                {flow?.candidates
                  .filter((entry) => entry.residentId !== flow.builderId)
                  .map((entry) => (
                    <button
                      key={entry.residentId}
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => void action("builder", { residentId: entry.residentId })}
                    >
                      Switch to{" "}
                      {snapshot.villagers.find((row) => row.characterId === entry.residentId)?.name ??
                        "another Builder"}
                    </button>
                  ))}
              </>
            ) : null}
            {phase === "materials" ? (
              <>
                <h3>Prepare materials</h3>
                <p>
                  Find each supply in the Village, then bring it to this blueprint site. Offers and handoffs are
                  recognized during your Scenes. Deliveries update the list here.
                </p>
                {flow?.requirements
                  .filter((entry) => entry.needed)
                  .map((entry) => (
                    <div key={entry.id} className={`${ELEMENT_TAG}-project-material`}>
                      <strong>{entry.title}</strong>
                      <span>
                        {entry.deliveredAt ? "Delivered" : entry.carriedAt ? "Ready to deliver" : "Find and obtain"}
                      </span>
                      {snapshot.progressEngineVersion === 1 && !entry.carriedAt ? (
                        <>
                          {!flow.sources?.some((source) => source.requirementId === entry.id) ? (
                            <>
                              {(flow.recordedItems ?? [])
                                .filter((item) => item.itemName.toLocaleLowerCase() === entry.title.toLocaleLowerCase())
                                .map((item) => (
                                  <button
                                    key={item.venueId + ":" + item.zoneId + ":" + item.itemName}
                                    type="button"
                                    className={`${ELEMENT_TAG}-button`}
                                    disabled={busy}
                                    onClick={() =>
                                      void action("existing-source", {
                                        requirementId: entry.id,
                                        venueId: item.venueId,
                                        zoneId: item.zoneId,
                                      })
                                    }
                                  >
                                    Choose available item at{" "}
                                    {snapshot.settings.venues.find((venue) => venue.id === item.venueId)?.name ??
                                      "Venue"}
                                    {item.zoneId
                                      ? " · " +
                                        (snapshot.settings.venues
                                          .find((venue) => venue.id === item.venueId)
                                          ?.zones?.find((zone) => zone.id === item.zoneId)?.name ?? "Zone")
                                      : ""}
                                  </button>
                                ))}
                              {(flow.heldSupplies ?? [])
                                .filter(
                                  (held) =>
                                    !held.assignedRequirementId &&
                                    held.itemName.toLocaleLowerCase() === entry.title.toLocaleLowerCase(),
                                )
                                .map((held) => (
                                  <button
                                    key={held.id}
                                    type="button"
                                    className={`${ELEMENT_TAG}-button`}
                                    disabled={busy}
                                    onClick={() =>
                                      void action("reallocate-held", { requirementId: entry.id, heldId: held.id })
                                    }
                                  >
                                    Commit previously acquired {held.itemName}
                                    {held.deliveredAt ? " (already delivered)" : ""}
                                  </button>
                                ))}
                            </>
                          ) : (
                            <p>The supplier’s handoff will be recognized during your Scene.</p>
                          )}
                        </>
                      ) : null}
                      {entry.carriedAt && !entry.deliveredAt && siteProjectId === project.id ? (
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={() => void action("deliver", { requirementId: entry.id })}
                        >
                          Deliver at blueprint site
                        </button>
                      ) : null}
                      {entry.carriedAt && !entry.deliveredAt && siteProjectId !== project.id ? (
                        <span>Visit this Project's blueprint on the Village map to deliver it.</span>
                      ) : null}
                    </div>
                  ))}
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy || flow?.requirements.some((entry) => entry.needed && !entry.deliveredAt)}
                  onClick={() => void action("start")}
                >
                  Begin construction
                </button>
              </>
            ) : null}
            {phase === "construction" ? (
              <>
                <h3>Construction is underway</h3>
                <p>
                  {snapshot.villagers.find((entry) => entry.characterId === flow?.builderId)?.name ?? "The Builder"} is
                  focused on this site for 24 hours, with normal rest and essential breaks.
                </p>
                {flow?.workOrder ? (
                  <p>Expected completion: {new Date(flow.workOrder.completesAt).toLocaleString()}</p>
                ) : null}
                {flow?.blockedReason ? <p role="status">{flow.blockedReason}</p> : null}
                {project.status === "blocked"
                  ? flow?.candidates
                      .filter((entry) => entry.residentId !== flow.builderId)
                      .map((entry) => (
                        <button
                          key={entry.residentId}
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          onClick={() => void action("builder", { residentId: entry.residentId })}
                        >
                          Continue with{" "}
                          {snapshot.villagers.find((row) => row.characterId === entry.residentId)?.name ?? "Builder"}
                        </button>
                      ))
                  : null}
                {debugEnabled && project.status === "building" ? (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy}
                    onClick={() => void action("debug-complete")}
                  >
                    DEBUG: Complete construction now
                  </button>
                ) : null}
              </>
            ) : null}
            {phase === "finishing" ? (
              <>
                <h3>Construction is complete</h3>
                <p>
                  Visit the finished {project.kind === "new-venue" ? "Venue" : "Renovation"} to define its final details
                  and open it to the Village.
                </p>
                <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setFinishingVisit(true)}>
                  Visit finished Venue
                </button>
              </>
            ) : null}
            {error ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {error}
              </p>
            ) : null}
            <footer className={`${ELEMENT_TAG}-project-footer`}>
              {room?.status === "active" ? (
                <button type="button" className={`${ELEMENT_TAG}-button`} onClick={onReturn}>
                  Return to current Scene
                </button>
              ) : (
                <button type="button" className={`${ELEMENT_TAG}-button`} onClick={onMap}>
                  Back to map
                </button>
              )}
            </footer>
          </main>
        </div>
      )}
      {!project && error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
