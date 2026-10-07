import type {
  VillageSnapshot,
  VillageVenue,
  VillageVenueImage,
  VenueClass,
} from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { readFileAsDataUrl } from "../../shared/presentation.js";
import { venueHasCommon } from "../founding/villages-founding-editor";
import { useEffect, useRef, useState } from "react";

/** Owns Project drafts and commands; the panel owns rendering and DOM focus. */
export function useProjectsController({
  snapshot,
  onSnapshot,
  focusProjectId,
}: {
  snapshot: VillageSnapshot;
  onSnapshot: (next: VillageSnapshot) => void;
  focusProjectId: string;
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

  const uploadZoneImage = async (zone: { id?: string; name: string }, file?: File) => {
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
  };
  const openVenue = async () => {
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
  };

  return {
    setSelectedId,
    draftType,
    setDraftType,
    name,
    setName,
    venueClass,
    setVenueClass,
    description,
    setDescription,
    venueId,
    setVenueId,
    changeKind,
    setChangeKind,
    baseZoneDrafts,
    setBaseZoneDrafts,
    baseClasses,
    setBaseClasses,
    upgradeTarget,
    setUpgradeTarget,
    capacity,
    setCapacity,
    slot,
    setSlot,
    extraBeds,
    setExtraBeds,
    upgradeMode,
    setUpgradeMode,
    upgradeClass,
    setUpgradeClass,
    upgradeZones,
    setUpgradeZones,
    form,
    setForm,
    openingVenueType,
    setOpeningVenueType,
    exterior,
    setExterior,
    interior,
    exteriorImage,
    setExteriorImage,
    interiorImage,
    setInteriorImage,
    zoneImages,
    imagePreview,
    setImagePreview,
    finishingVisit,
    setFinishingVisit,
    openingLayout,
    openingPersonality,
    setOpeningPersonality,
    openingLore,
    setOpeningLore,
    busy,
    error,
    active,
    project,
    flow,
    target,
    selectedVenue,
    openingVenue,
    patchOpeningLayout,
    run,
    action,
    create,
    openingImageKey,
    generateImage,
    uploadImage,
    phase,
    uploadZoneImage,
    openVenue,
  };
}

export type ProjectsController = ReturnType<typeof useProjectsController>;
