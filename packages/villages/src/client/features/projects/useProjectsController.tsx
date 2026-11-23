import { projectPhysicalDesign } from "../../../shared/helpers/project-design.js";
import type { VillageSnapshot, VillageVenue, VenueClass } from "../../../shared/contracts/village.js";
import { useEffect, useRef, useState } from "react";
import { request, messageFrom } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { useProjectWorkspaces } from "./useProjectWorkspaces.js";

function draftVenue(name: string, classes: VenueClass[], physicalDesign: string): VillageVenue {
  return {
    id: "draft",
    name,
    classes,
    form: physicalDesign,
    description: "",
    category: "",
    layoutVersion: 1,
    layout: "exterior",
    presentation: { mapId: "", image: null, x: null, y: null },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: [],
    residenceCapacity: 1,
    spaces: [],
    privateSpaces: [],
  };
}
export function useProjectsController({
  snapshot,
  onSnapshot,
  focusProjectId,
  focusProjectRequest,
}: {
  snapshot: VillageSnapshot | null;
  onSnapshot(next: VillageSnapshot): void;
  focusProjectId: string;
  focusProjectRequest: number;
}) {
  const [selectedId, setSelectedId] = useState(focusProjectId),
    [draftType, setDraftType] = useState<"new-venue" | "renovation" | "undertaking" | "idea" | "">("");
  const [idea, setIdea] = useState("");
  const [venueId, setVenueId] = useState("");
  const selected = useRef(selectedId);
  selected.current = selectedId;
  useEffect(() => {
    if (focusProjectId) {
      setSelectedId(focusProjectId);
      setDraftType("");
    }
  }, [focusProjectId, focusProjectRequest]);
  const project = snapshot?.projects.find((project) => project.id === selectedId);
  const target =
    snapshot?.settings.venues.find((venue) => venue.id === (project?.venueId || venueId)) ?? project?.place;
  const initial =
    project?.kind === "new-venue"
      ? {
          ...draftVenue(project.title, project.venueDraft?.classes ?? ["other"], projectPhysicalDesign(project)),
          ...(project.plan
            ? {
                form: project.plan.form,
                venueType: project.plan.venueType,
                description: project.plan.exteriorDescription,
                layout: project.plan.layout,
                spaces: project.plan.spaces,
                privateSpaces: project.plan.privateSpaces.map((zone) => ({ ...zone, ownerId: zone.ownerId ?? "" })),
                presentation: { mapId: "", image: project.plan.exteriorImage, x: null, y: null },
                residenceCapacity: project.plan.capacity,
              }
            : {}),
        }
      : target
        ? {
            ...target,
            classes: project?.lifecycle?.change?.classes ?? target.classes,
            form: project?.lifecycle?.change?.form ?? target.form,
          }
        : null;
  const workspace = useProjectWorkspaces(
    project ? "project:" + project.id : "draft:" + draftType + ":" + venueId,
    {
      revision: project?.lifecycle?.revision,
      venue: initial,
      title: project?.title ?? "",
      detail: project?.lifecycle?.change?.detail ?? "",
      zones: project?.lifecycle?.change?.zones ?? target?.zones?.filter((zone) => zone.kind !== "exterior") ?? [],
      roomEdits: project?.lifecycle?.change?.roomEdits ?? [],
      capacity: project?.lifecycle?.change?.capacity ?? initial?.residenceCapacity ?? 1,
    },
    snapshot?.worldScope ?? String(snapshot?.isFounded ?? ""),
  );
  const run = async (path: string, body: Record<string, unknown>) => {
    const attempt = workspace.begin();
    if (!attempt) return null;
    const fingerprint = JSON.stringify([path, body]),
      requestId = workspace.requests.current.get(fingerprint) ?? createVillagesClientId();
    workspace.requests.current.set(fingerprint, requestId);
    try {
      const next = await request<VillageSnapshot>(path, {
        method: "POST",
        body: JSON.stringify({ ...body, requestId }),
      });
      if (!attempt.current()) return null;
      workspace.requests.current.delete(fingerprint);
      onSnapshot(next);
      return next;
    } catch (error) {
      if (attempt.current()) workspace.field("error")(messageFrom(error, "The Project could not be updated."));
      return null;
    } finally {
      attempt.finish();
    }
  };
  const action = (step: string, body: Record<string, unknown> = {}) =>
    project
      ? run("/projects/" + encodeURIComponent(project.id) + "/" + step, {
          expectedRevision: project.lifecycle?.revision,
          ...body,
        })
      : Promise.resolve(null);
  const save = async () => {
    const draft = workspace.draft,
      venue = draft.venue;
    if (!project || !venue) return Promise.resolve(null);
    const next = await (project.kind === "new-venue"
      ? action("plan", {
          expectedRevision: draft.revision,
          classes: venue.classes,
          form: venue.form,
          venueType: venue.venueType,
          exteriorDescription: venue.description,
          exteriorImage: venue.presentation.image,
          layoutVersion: 1,
          layout: venue.layout,
          spaces: venue.spaces ?? [],
          privateSpaces: venue.privateSpaces ?? [],
          capacity: draft.capacity,
        })
      : action("revise", {
          expectedRevision: draft.revision,
          title: draft.title,
          detail: draft.detail,
          form: venue.form,
          classes: venue.classes,
          capacity: draft.capacity,
          zones: draft.zones,
          roomEdits: draft.roomEdits,
        }));
    if (next) workspace.field("dirty")(false);
    return next;
  };
  return {
    idea,
    beginIdea: (text = "") => {
      setIdea(text.slice(0, 2000));
      setSelectedId("");
      setDraftType("idea");
    },
    createIdea: async (
      kind: "new-venue" | "renovation" | "undertaking",
      title: string,
      description: string,
      placeId: string,
    ) => {
      const next = await run(
        kind === "undertaking"
          ? "/projects/undertakings"
          : kind === "renovation"
            ? "/projects/renovations/" + encodeURIComponent(placeId)
            : "/projects",
        kind === "undertaking"
          ? { title, description }
          : kind === "renovation"
            ? { title, detail: description.trim() || title, firstUse: true }
            : { name: title, description: description.trim() || title, classes: ["community"], firstUse: true },
      );
      if (next && selected.current === selectedId) {
        const created = next.projects.find((entry) => !snapshot?.projects.some((old) => old.id === entry.id));
        if (created) {
          setSelectedId(created.id);
          setDraftType("");
          setIdea("");
        }
      }
      return next;
    },
    selectedId,
    setSelectedId,
    draftType,
    setDraftType,
    venueId,
    setVenueId,
    project,
    target,
    workspace,
    action,
    save,
    startRenovation: (venue: VillageVenue) => {
      setIdea("");
      setSelectedId("");
      setDraftType("renovation");
      setVenueId(venue.id);
      return true;
    },
  };
}
export type ProjectsController = ReturnType<typeof useProjectsController>;
