import type {
  VillageSnapshot,
  VillageVenue,
  VillageVenueImage,
  VenueClass,
} from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { readFileAsDataUrl } from "../../shared/presentation.js";
import { venueHasCommon } from "../founding/villages-founding-editor";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { useProjectImageKey, useProjectWorkspaces } from "./useProjectWorkspaces.js";

/** Owns Project drafts and commands; the panel owns rendering and DOM focus. */
export function useProjectsController({
  snapshot,
  onSnapshot,
  focusProjectId,
  focusProjectRequest,
}: {
  snapshot: VillageSnapshot | null;
  onSnapshot: (next: VillageSnapshot) => void;
  focusProjectId: string;
  focusProjectRequest: number;
}) {
  const [selectedId, setSelectedId] = useState(focusProjectId);
  const latestSnapshot = useRef(snapshot);
  useLayoutEffect(() => {
    latestSnapshot.current = snapshot;
  }, [snapshot]);
  const [draftType, setDraftType] = useState<"new-venue" | "renovation" | "">("");
  const selection = useRef({ selectedId, draftType });
  useLayoutEffect(() => {
    selection.current = { selectedId, draftType };
  }, [selectedId, draftType]);
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
  useEffect(() => {
    if (snapshot?.isFounded !== false) return;
    setSelectedId("");
    setDraftType("");
    setName("");
    setVenueClass("gathering");
    setDescription("");
    setVenueId("");
    setChangeKind("upgrade");
    setBaseZoneDrafts([]);
    setBaseClasses(["gathering"]);
    setUpgradeTarget("");
    setCapacity(2);
    setSlot(0);
    setExtraBeds(0);
    setUpgradeMode("replace");
    setUpgradeClass("");
    setUpgradeZones([]);
  }, [snapshot?.isFounded]);
  const workspace = useProjectWorkspaces(selectedId ? `project:${selectedId}` : `draft:${draftType}`, snapshot);
  const {
    form,
    openingVenueType,
    openingSpaces,
    exterior,
    interior,
    exteriorImage,
    interiorImage,
    zoneImages,
    imagePreview,
    finishingVisit,
    openingLayout,
    openingCommonClass,
    openingPrivateSpaces,
    openingPersonality,
    openingLore,
    busy,
    error,
  } = workspace.draft;
  const setForm = workspace.field("form");
  const setOpeningVenueType = workspace.field("openingVenueType");
  const setOpeningSpaces = workspace.field("openingSpaces");
  const setExterior = workspace.field("exterior");
  const setInterior = workspace.field("interior");
  const setExteriorImage = workspace.field("exteriorImage");
  const setInteriorImage = workspace.field("interiorImage");
  const setZoneImages = workspace.field("zoneImages");
  const setImagePreview = workspace.field("imagePreview");
  const setFinishingVisit = workspace.field("finishingVisit");
  const setOpeningLayout = workspace.field("openingLayout");
  const setOpeningCommonClass = workspace.field("openingCommonClass");
  const setOpeningPrivateSpaces = workspace.field("openingPrivateSpaces");
  const setOpeningPersonality = workspace.field("openingPersonality");
  const setOpeningLore = workspace.field("openingLore");
  const setError = workspace.field("error");
  useEffect(() => {
    if (focusProjectId) setSelectedId(focusProjectId);
  }, [focusProjectId, focusProjectRequest]);
  const active = (snapshot?.projects ?? []).filter(
    (entry) => (entry.kind === "new-venue" || entry.kind === "renovation") && entry.lifecycle?.phase !== "complete",
  );
  const project = active.find((entry) => entry.id === selectedId) ?? null;
  const flow = project?.lifecycle;
  const target = snapshot?.settings.venues.find((entry) => entry.id === project?.venueId);
  const selectedVenue = snapshot?.settings.venues.find((entry) => entry.id === venueId);
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
    const attempt = workspace.begin();
    if (!attempt) return null;
    try {
      const next = await request<VillageSnapshot>(path, { method: "POST", body: JSON.stringify(body) });
      if (!attempt.current()) return null;
      onSnapshot(next);
      return next;
    } catch (cause) {
      if (attempt.current()) setError(messageFrom(cause, "The Project could not be updated."));
      return null;
    } finally {
      attempt.finish();
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
    if (created && selection.current.selectedId === selectedId && selection.current.draftType === draftType) {
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
    snapshot?.settings.setting,
    snapshot?.settings.worldFacts,
    snapshot?.settings.sceneryArtStyle,
  ]);
  const imageContextKey = JSON.stringify([
    snapshot?.settings.setting,
    snapshot?.settings.worldFacts,
    snapshot?.settings.sceneryArtStyle,
  ]);
  const imageInputsCurrent = useProjectImageKey(workspace.imageKeys, workspace.key, openingImageKey, imageContextKey);
  const generateImage = async (area: "exterior" | "interior") => {
    const expectedKey = openingImageKey;
    if (!project || !snapshot) return;
    const attempt = workspace.begin();
    if (!attempt) return null;
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
          setting: snapshot?.settings.setting,
          worldFacts: snapshot?.settings.worldFacts,
          selectedLorebookIds: snapshot?.settings.selectedLorebookIds,
          sceneryArtStyle: snapshot?.settings.sceneryArtStyle,
          useVisualLore: openingLore,
          useAssignedVillagerContext: openingPersonality,
        }),
      });
      if (!attempt.current()) return;
      if (!imageInputsCurrent()) {
        setError("The Venue changed while the image was being prepared. Generate a fresh image.");
        return;
      }
      setImagePreview({ area, image, key: expectedKey });
    } catch (cause) {
      if (attempt.current()) setError(messageFrom(cause, "The Venue image could not be generated."));
    } finally {
      attempt.finish();
    }
  };
  const uploadImage = async (area: "exterior" | "interior", file?: File) => {
    const expectedKey = openingImageKey;
    if (!file || !project || !snapshot) return;
    const attempt = workspace.begin();
    if (!attempt) return null;
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image", {
        method: "PUT",
        body: JSON.stringify({ name: project.title, image: await readFileAsDataUrl(file) }),
      });
      if (!attempt.current()) return;
      if (!imageInputsCurrent()) {
        setError("The Venue changed while the image was being prepared. Generate a fresh image.");
        return;
      }
      setImagePreview({ area, image, key: expectedKey });
    } catch (cause) {
      if (attempt.current()) setError(messageFrom(cause, "The Venue image could not be uploaded."));
    } finally {
      attempt.finish();
    }
  };
  const phase = flow?.phase;
  const revisionKey = `${project?.id}:${project?.updatedAt}`;
  const revision = project?.lifecycle?.change
    ? workspace.draft.revision?.sourceKey === revisionKey
      ? workspace.draft.revision
      : {
          sourceKey: revisionKey,
          editing: false,
          title: project.title,
          change: structuredClone(project.lifecycle.change),
        }
    : null;
  function patchRevision<K extends "editing" | "title" | "change">(field: K, value: NonNullable<typeof revision>[K]) {
    const currentProject = latestSnapshot.current?.projects.find((entry) => entry.id === project?.id);
    if (!revision || `${currentProject?.id}:${currentProject?.updatedAt}` !== revisionKey) return;
    workspace.field("revision")((previous) => ({
      ...(previous?.sourceKey === revisionKey ? previous : revision),
      [field]: value,
    }));
  }
  const revisionEditor = revision
    ? {
        draft: revision,
        setEditing: (editing: boolean) => patchRevision("editing", editing),
        setTitle: (title: string) => patchRevision("title", title),
        setChange: (change: typeof revision.change) => patchRevision("change", change),
        save: (body: unknown) => run(`/projects/${encodeURIComponent(project.id)}/revise`, body),
      }
    : null;

  const uploadZoneImage = async (zone: { id?: string; name: string }, file?: File) => {
    if (!file) return;
    const attempt = workspace.begin();
    if (!attempt) return;
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image", {
        method: "PUT",
        body: JSON.stringify({ name: zone.name, image: await readFileAsDataUrl(file) }),
      });
      if (!attempt.current()) return;
      setZoneImages((current) => ({ ...current, [zone.id!]: image }));
    } catch (cause) {
      if (attempt.current()) setError(messageFrom(cause, "The zone image could not be uploaded."));
    } finally {
      attempt.finish();
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
    action,
    create,
    openingImageKey,
    generateImage,
    uploadImage,
    phase,
    uploadZoneImage,
    openVenue,
    revisionEditor,
  };
}

export type ProjectsController = ReturnType<typeof useProjectsController>;
