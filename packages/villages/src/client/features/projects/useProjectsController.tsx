import { renovationZoneChanges, type ZoneRenovationDraft } from "../../shared/zone-renovation.js";
import { projectPhysicalDesign } from "../../../shared/helpers/project-design.js";
import type { VillageSnapshot, VillageVenue } from "../../../shared/contracts/village.js";
import { useEffect, useRef, useState } from "react";
import { request, messageFrom } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { useProjectWorkspaces } from "./useProjectWorkspaces.js";

function draftVenue(name: string, physicalDesign: string): VillageVenue {
  return {
    id: "draft",
    name,
    form: physicalDesign,
    description: "",
    category: "",
    layoutVersion: 1,
    layout: "exterior",
    presentation: { mapId: "", image: null, x: null, y: null },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    capabilities: [],

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
    [draftType, setDraftType] = useState<"new-venue" | "renovation" | "">("");
  const [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [venueId, setVenueId] = useState("");
  const [renovationDraft, setRenovationDraft] = useState<{
    venueId: string;
    key: string;
    initial: ZoneRenovationDraft;
  } | null>(null);
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
          ...draftVenue(project.title, projectPhysicalDesign(project)),
          ...(project.plan
            ? {
                form: project.plan.form,
                venueType: project.plan.venueType,
                description: project.plan.exteriorDescription,
                layout: project.plan.layout,
                spaces: project.plan.spaces,
                privateSpaces: project.plan.privateSpaces.map((zone) => ({ ...zone, ownerId: zone.ownerId ?? "" })),
                presentation: { mapId: "", image: project.plan.exteriorImage, x: null, y: null },
              }
            : {}),
        }
      : target
        ? {
            ...target,
            form: project?.lifecycle?.change?.form ?? target.form,
          }
        : null;
  const seedDraft =
    !project && draftType === "renovation" && renovationDraft?.venueId === venueId ? renovationDraft : null;
  const workspace = useProjectWorkspaces(
    project ? "project:" + project.id : "draft:" + draftType + ":" + venueId + (seedDraft ? ":" + seedDraft.key : ""),
    {
      revision: project?.lifecycle?.revision,
      venue: initial,
      title: seedDraft?.initial.title ?? project?.title ?? name,
      detail: seedDraft?.initial.detail ?? project?.lifecycle?.change?.detail ?? description,
      zones:
        seedDraft?.initial.zones ??
        project?.lifecycle?.change?.zones ??
        target?.zones?.filter((zone) => zone.kind !== "exterior") ??
        [],
      roomEdits: seedDraft?.initial.roomEdits ?? project?.lifecycle?.change?.roomEdits ?? [],
    },
    String(snapshot?.isFounded ?? ""),
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
  const create = async () => {
    const next = await run(
      draftType === "new-venue" ? "/projects" : "/projects/renovations/" + encodeURIComponent(venueId),
      draftType === "new-venue"
        ? { name, description }
        : {
            title: name,
            detail: description,
            ...(seedDraft
              ? {
                  ...(workspace.draft.venue?.form !== seedDraft.initial.base.form
                    ? { form: workspace.draft.venue?.form }
                    : {}),
                  zones: renovationZoneChanges(workspace.draft.zones, seedDraft.initial.base.zones ?? []),
                  expectedZoneIds: seedDraft.initial.base.zones
                    ?.filter((zone) => zone.kind !== "exterior")
                    .map((zone) => zone.id),
                }
              : {
                  form: workspace.draft.venue?.form,
                  zones: workspace.draft.zones,
                }),
            roomEdits: workspace.draft.roomEdits,
          },
    );
    if (next && selected.current === selectedId) {
      const created = next.projects.find((project) => !snapshot?.projects.some((old) => old.id === project.id));
      if (created) {
        setSelectedId(created.id);
        setDraftType("");
      }
    }
  };
  const save = async () => {
    const draft = workspace.draft,
      venue = draft.venue;
    if (!project || !venue) return Promise.resolve(null);
    const next = await (project.kind === "new-venue"
      ? action("plan", {
          expectedRevision: draft.revision,
          form: venue.form,
          venueType: venue.venueType,
          exteriorDescription: venue.description,
          exteriorImage: venue.presentation.image,
          layoutVersion: 1,
          layout: venue.layout,
          spaces: venue.spaces ?? [],
          privateSpaces: venue.privateSpaces ?? [],
        })
      : action("revise", {
          expectedRevision: draft.revision,
          title: draft.title,
          detail: draft.detail,
          form: venue.form,

          zones: draft.zones,
          roomEdits: draft.roomEdits,
        }));
    if (next) workspace.field("dirty")(false);
    return next;
  };
  return {
    selectedId,
    setSelectedId,
    draftType,
    setDraftType,
    name,
    setName,
    description,
    setDescription,
    venueId,
    setVenueId,
    project,
    target,
    workspace,
    action,
    create,
    save,
    startRenovation: (venue: VillageVenue, initial?: ZoneRenovationDraft) => {
      setRenovationDraft(initial ? { venueId: venue.id, key: createVillagesClientId(), initial } : null);
      if (initial) {
        setName(initial.title);
        setDescription(initial.detail);
      }
      setSelectedId("");
      setDraftType("renovation");
      setVenueId(venue.id);
      return true;
    },
  };
}
export type ProjectsController = ReturnType<typeof useProjectsController>;
