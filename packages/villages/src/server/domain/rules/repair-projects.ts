import type { RepairField, RepairRecord, RepairRequest } from "../../../shared/contracts/repair.js";
import type { VillageState, VillageProject, VillageZoneDraft } from "../models/world.js";
import {
  administrativeProjectCurrent,
  beginProject,
  cancelProjectWork,
  pauseProject,
  projectFor,
  PROJECT_DURATION_MS,
} from "./project-lifecycle-rules.js";
import { completeProject, readProjectPlan } from "./project-completion.js";
import { plannedVenue, readRenovationChange } from "./project-design.js";
import { changedZoneIds, venueDesignHash } from "./project-structure.js";
import { projectDesignKey, projectAgreementCurrent, renovationAffectedIds } from "./project-terms.js";
import { projectAgendaReservations, trimProjectFocus } from "./project-focus.js";
import { normalizeVillageMutation } from "./world-mutation.js";
import { findLocation } from "./places.js";
import { venueZones } from "./venue-zones.js";
import { defaultVenueSpace } from "./venue-model.js";
import { repairLocalTime, repairInstant } from "./repair-time.js";
import { memoryHash } from "./memory-integrity.js";
import { badRequest, conflict } from "./errors.js";

const draftZones = (project: VillageProject): VillageZoneDraft[] =>
  project.kind === "new-venue"
    ? [...(project.plan?.spaces ?? []), ...(project.plan?.privateSpaces ?? [])]
    : (project.lifecycle?.change?.zones ?? []);
const text = (key: string, label: string, value: string, group: string): RepairField => ({
  key,
  label,
  value,
  type: "text",
  ...(key === "title" || key === "venueType" || key === "newZone" || key.endsWith(":name") ? { multiline: false } : {}),
  group,
});
export function projectRepairRecords(state: VillageState): RepairRecord[] {
  return state.projects
    .filter((project) => project.lifecycle)
    .map((project) => {
      const flow = project.lifecycle!,
        terminal = ["complete", "cancelled"].includes(project.status);
      const venue = findLocation(state, project.venueId);
      const zones =
        project.kind === "renovation" && !flow.change?.zones
          ? venueZones(venue!).filter((z) => z.kind !== "exterior")
          : draftZones(project);
      const fields: RepairField[] = [
        text("title", "Title", project.title, "Project"),
        { key: "status", label: "Status", type: "text", value: project.status, readOnly: true, group: "Project" },
      ];
      if (!terminal) {
        fields.push({
          key: "lead",
          label: "Lead",
          type: "choice",
          value: flow.builderId,
          group: "Work",
          options: [
            { value: "", label: "Choose a resident" },
            ...state.villagers.map((p) => ({ value: p.characterId, label: p.cardSnapshot.name })),
          ],
        });
        if (project.status === "working")
          fields.push({
            key: "completesAt",
            label: "Completion",
            type: "datetime",
            value: repairLocalTime(flow.workOrder?.completesAt, state.timeZone),
            group: "Work",
          });
        else
          fields.push({
            key: "hours",
            label: "Hours remaining",
            type: "number",
            value: (flow.workOrder?.remainingMs ?? PROJECT_DURATION_MS) / 3600000,
            min: 0,
            max: 720,
            group: "Work",
          });
        fields.push(
          text("form", "Physical form", project.plan?.form ?? flow.change?.form ?? venue?.form ?? "", "Design"),
        );
        fields.push(
          text(
            "detail",
            project.kind === "new-venue" ? "Entrance" : "Physical change",
            project.plan?.exteriorDescription ?? flow.change?.detail ?? "",
            "Design",
          ),
        );
        if (project.kind === "new-venue") {
          fields.push(text("venueType", "Venue type", project.plan?.venueType ?? "", "Design"));
          fields.push({
            key: "mapId",
            label: "Map",
            type: "choice",
            value: project.venueDraft?.position.mapId ?? state.maps[0]?.id ?? "",
            options: [{ value: "", label: "Choose a map" }, ...state.maps.map((m) => ({ value: m.id, label: m.name }))],
            group: "Map",
            readOnly: project.status !== "planning",
          });
          for (const key of ["x", "y"] as const)
            fields.push({
              key,
              label: key.toUpperCase(),
              type: "number",
              value: project.venueDraft?.position[key] ?? 0.5,
              min: 0.03,
              max: 0.97,
              group: "Map",
              readOnly: project.status !== "planning",
            });
        }
        zones.forEach((zone, index) => {
          const group = zone.name,
            prefix = `zone:${index}:`;
          fields.push({ key: prefix + "keep", label: "Keep Zone", type: "boolean", value: true, group });
          fields.push(text(prefix + "name", "Name", zone.name, group), {
            key: prefix + "kind",
            label: "Zone kind",
            type: "choice",
            value: zone.kind,
            options: [
              { value: "public", label: "Public" },
              { value: "restricted", label: "Restricted" },
              { value: "personal", label: "Private Space" },
            ],
            group,
          });
          fields.push(
            text(prefix + "purpose", "Used for", zone.purpose ?? "", group),
            text(prefix + "roomSpecification", "Room details", zone.roomSpecification ?? "", group),
          );
          if (!venue?.zones?.some((z) => z.id === zone.id))
            fields.push(text(prefix + "description", "Description", zone.description, group));
          fields.push({
            key: prefix + "ownerId",
            label: "Owner",
            type: "choice",
            value: zone.ownerId ?? "",
            options: [
              { value: "", label: "No individual owner" },
              { value: "player", label: state.playerName },
              ...state.villagers.map((p) => ({ value: p.characterId, label: p.cardSnapshot.name })),
            ],
            group,
          });
          for (const other of [{ id: "exterior", name: "Entrance" }, ...zones].filter((z) => z.id !== zone.id))
            fields.push({
              key: prefix + "connect:" + other.id,
              label: "Connect to " + other.name,
              type: "boolean",
              value: (zone.connectedTo ?? ["exterior"]).includes(other.id),
              group: group + " connections",
            });
        });
        if (zones.length < 6)
          fields.push(
            text("newZone", "Add Zone, name", "", "New Zone"),
            text("newDescription", "Room details", "", "New Zone"),
          );
      }
      return {
        id: JSON.stringify(["project", project.id]),
        topic: "progress",
        title: project.title,
        summary: project.status,
        fields,
        revision: flow.revision,
        related: [],
        source: [
          ...(flow.blockedReason ? [flow.blockedReason] : []),
          "Agreements: " +
            (flow.approvals
              .filter((a) => projectAgreementCurrent(state, a))
              .map((a) => state.villagers.find((p) => p.characterId === a.residentId)?.cardSnapshot.name)
              .join(", ") || "None"),
          ...(administrativeProjectCurrent(state, project) ? ["Administrative correction"] : []),
          ...(venue
            ? [
                "Affected: " +
                  renovationAffectedIds(venue, flow.change, flow.changedZoneIds)
                    .map((id) =>
                      id === "player"
                        ? state.playerName
                        : (state.villagers.find((p) => p.characterId === id)?.cardSnapshot.name ?? "Former resident"),
                    )
                    .join(", "),
              ]
            : []),
        ],
        actions: [
          { id: "correct", label: "Modify" },
          ...(!terminal
            ? [
                ...(project.status === "planning" ? [{ id: "start", label: "Start" }] : []),
                ...(project.status === "paused" ? [{ id: "resume", label: "Resume" }] : []),
                ...(project.status === "working" ? [{ id: "pause", label: "Pause" }] : []),
                { id: "finish", label: "Finish now" },
                { id: "cancel", label: "Cancel Project" },
              ]
            : []),
        ],
      };
    });
}

export function applyProjectRepair(
  state: VillageState,
  record: RepairRecord,
  request: RepairRequest,
  at: string,
): boolean {
  const [kind, id] = JSON.parse(record.id) as string[];
  if (kind !== "project") return false;
  const value = Object.fromEntries(record.fields.map((f) => [f.key, request.values[f.key] ?? f.value]));
  const changed = (key: string) => value[key] !== record.fields.find((f) => f.key === key)?.value;
  const designChanged = record.fields.some((f) =>
    ["Design", "New Zone"].includes(f.group ?? "") || f.key.startsWith("zone:") ? changed(f.key) : false,
  );
  normalizeVillageMutation(
    state,
    () => {
      const project = projectFor(state, id!),
        flow = project.lifecycle,
        now = new Date(at);
      const title = String(value.title).trim();
      if (!title || title.length > 160) throw badRequest("Enter a short Project title.");
      project.title = title;
      if (!["complete", "cancelled"].includes(project.status)) {
        if (request.action === "cancel") cancelProjectWork(state, project, at);
        else {
          const wasWorking = project.status === "working",
            oldCompletion = flow.workOrder?.completesAt;
          const currentSite = findLocation(state, project.venueId);
          if (
            project.kind === "renovation" &&
            (!currentSite || flow.baseDesignHash !== venueDesignHash(currentSite, flow.changedZoneIds, flow.change))
          )
            throw conflict("The Project design changed. Correct the current Location or cancel this outdated Project.");
          if (wasWorking) pauseProject(project, at, "");
          const venue = findLocation(state, project.venueId);
          const oldZones =
            project.kind === "renovation" && !flow.change?.zones
              ? venueZones(venue!).filter((z) => z.kind !== "exterior")
              : draftZones(project);
          const zones: VillageZoneDraft[] = oldZones.flatMap((zone, index) => {
            const p = `zone:${index}:`;
            if (value[p + "keep"] !== true) return [];
            return [
              {
                ...zone,
                name: String(value[p + "name"]),
                kind: value[p + "kind"] as VillageZoneDraft["kind"],
                ownerId: String(value[p + "ownerId"]) || undefined,
                purpose: String(value[p + "purpose"]),
                roomSpecification: String(value[p + "roomSpecification"]),
                description:
                  value[p + "description"] === undefined ? zone.description : String(value[p + "description"]),
                connectedTo: record.fields
                  .filter((f) => f.key.startsWith(p + "connect:") && value[f.key] === true)
                  .map((f) => f.key.slice((p + "connect:").length)),
              },
            ];
          });
          if (String(value.newZone ?? "").trim())
            zones.push({
              ...defaultVenueSpace(
                "repair-plan-" + memoryHash(request.operationId).slice(0, 24),
                String(value.newDescription ?? ""),
              ),
              name: String(value.newZone).trim(),
              kind: "public",
              connectedTo: ["exterior"],
            });
          const ids = new Set(["exterior", ...zones.map((z) => z.id)]);
          for (const zone of zones) zone.connectedTo = zone.connectedTo?.filter((id) => ids.has(id));
          if (project.kind === "new-venue") {
            if (!project.venueDraft) throw conflict("This Project has no saved Venue draft.");
            project.venueDraft.name = title;
            if (
              state.venues.some(
                (v) => v.id !== project.venueId && v.name.toLocaleLowerCase() === title.toLocaleLowerCase(),
              )
            )
              throw conflict("That Venue name is already in use.");
            if (currentSite?.buildProjectId === project.id) currentSite.name = title;
            if (["mapId", "x", "y"].some(changed))
              project.venueDraft.position = { mapId: String(value.mapId), x: Number(value.x), y: Number(value.y) };
            if (project.plan || designChanged || request.action !== "correct")
              project.plan = readProjectPlan(
                {
                  ...project.plan,
                  form: value.form,
                  venueType: value.venueType,
                  exteriorDescription: value.detail,
                  layoutVersion: 1,
                  layout: zones.some((z) => z.kind === "public")
                    ? zones.some((z) => z.kind !== "public")
                      ? "both"
                      : "common"
                    : zones.length
                      ? "private"
                      : "exterior",
                  spaces: zones.filter((z) => z.kind === "public"),
                  privateSpaces: zones.filter((z) => z.kind !== "public"),
                },
                plannedVenue(project),
              );
          } else if (flow.change || designChanged || request.action !== "correct") {
            if (!venue) throw conflict("This Project's Location is missing.");
            const result = readRenovationChange(
              state,
              venue,
              { form: value.form, detail: value.detail, zones, roomEdits: flow.change?.roomEdits },
              now,
              flow,
            );
            flow.change = result.change;
            flow.roomBasis = result.roomBasis;
            flow.changedZoneIds = changedZoneIds(venue, flow.change);
            flow.baseDesignHash = venueDesignHash(venue, flow.changedZoneIds, flow.change);
          }
          const lead = state.villagers.find((p) => p.characterId === value.lead);
          if (!lead && (project.status !== "planning" || request.action !== "correct"))
            throw badRequest("Choose a current resident lead.");
          flow.builderId = lead?.characterId ?? "";
          if (lead)
            flow.repair = {
              operationId: request.operationId,
              at,
              scope: projectDesignKey(project),
              builder: { id: lead.characterId, incarnation: lead.incarnation },
            };
          let remaining = Number(value.hours) * 3600000;
          if (wasWorking) {
            const completion =
              value.completesAt === repairLocalTime(oldCompletion, state.timeZone)
                ? oldCompletion
                : repairInstant(value.completesAt, state.timeZone);
            remaining = Date.parse(completion ?? "") - now.getTime();
          }
          if (request.action === "finish") remaining = 0;
          if (
            !Number.isFinite(remaining) ||
            remaining < 0 ||
            remaining > 720 * 3600000 ||
            (["start", "resume"].includes(request.action) && remaining < 3600000)
          )
            throw badRequest("Choose between 1 and 720 hours of remaining work.");
          if (flow.workOrder) flow.workOrder.remainingMs = remaining;
          const start = project.status === "planning" && ["start", "finish"].includes(request.action);
          const resume =
            project.status === "paused" &&
            (request.action === "resume" ||
              request.action === "finish" ||
              (wasWorking && request.action === "correct"));
          if (start || resume) {
            beginProject(state, project, { residentId: lead!.characterId }, resume, now, {
              administrativeFinish: request.action === "finish",
              remainingMs: remaining,
            });
          }
          if (request.action === "finish") {
            trimProjectFocus(project, at);
            completeProject(state, project, at, { administrative: true });
          }
          if (request.action === "pause") pauseProject(project, at, "");
          projectAgendaReservations(state);
        }
      }
      flow.revision++;
      project.updatedAt = at;
    },
    { now: () => new Date(at), seed: () => request.operationId },
  );
  return true;
}
