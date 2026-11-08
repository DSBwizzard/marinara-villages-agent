import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type { MemoryCollection } from "../../domain/models/memories.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import {
  encounterKnowerProtected,
  fitEncounterQuotations,
  sharedEncounterSpeech,
  type EncounterQuotation,
} from "../../domain/rules/scene-encounters.js";
import {
  readSceneTranscriptHead,
  readSceneTranscriptPositions,
  type SceneTranscriptHead,
} from "./scene-transcript-pages.js";

export const SCENE_ENCOUNTER_KIND = "scene-encounter";
export const sceneEncounterId = (id: string) => "villages-scene-encounter-" + id;
export type SceneEncounter = {
  version: 1;
  id: string;
  villageSeed: string;
  sourceRevision: number;
  startedAt: string;
  placeId: string;
  placeName: string;
  participants: VenueScene["participants"];
  transcript: SceneTranscriptHead;
  recent: Record<string, number[]>;
};

/** A small immutable header owns the original transcript pages, never a copied Village snapshot. */
export function readSceneEncounter(value: unknown): SceneEncounter {
  memoryObject(value, [
    "version",
    "id",
    "villageSeed",
    "sourceRevision",
    "startedAt",
    "placeId",
    "placeName",
    "participants",
    "transcript",
    "recent",
  ]);
  memoryRequire(
    value.version === 1 && Number.isSafeInteger(value.sourceRevision) && value.sourceRevision > 0,
    "invalid encounter revision",
  );
  for (const key of ["id", "villageSeed", "startedAt", "placeId", "placeName"])
    memoryRequire(typeof value[key] === "string" && !!value[key], "invalid encounter identity");
  const scene = coerceSession({
    version: 4,
    id: value.id,
    villageSeed: value.villageSeed,
    participants: value.participants,
  });
  memoryRequire(
    JSON.stringify(scene.participants) === JSON.stringify(value.participants),
    "invalid encounter participants",
  );
  const transcript = readSceneTranscriptHead(value.transcript, scene);
  memoryObject(value.recent);
  for (const [id, positions] of Object.entries(value.recent))
    memoryRequire(
      scene.participants.some((person) => person.characterId === id) &&
        Array.isArray(positions) &&
        positions.length <= 4 &&
        positions.every(
          (position, i) =>
            Number.isSafeInteger(position) &&
            position >= 0 &&
            position < transcript.count &&
            (i === 0 || positions[i - 1] < position),
        ),
      "invalid encounter source positions",
    );
  return value as SceneEncounter;
}

export function createSceneEncounters(documents: CapabilityDocumentStore) {
  async function save(scene: VenueScene, source: { revision: number; data: unknown }) {
    const recent: Record<string, number[]> = {};
    for (const person of scene.participants) {
      const positions = scene.lines
        .flatMap((line, index) => (sharedEncounterSpeech(line, person.characterId) ? [index] : []))
        .slice(-4);
      if (positions.length) recent[person.characterId] = positions;
    }
    if (!Object.keys(recent).length) return;
    const encounter = readSceneEncounter({
      version: 1,
      id: scene.id,
      villageSeed: scene.villageSeed,
      sourceRevision: source.revision,
      startedAt: scene.startedAt,
      placeId: scene.placeId,
      placeName: scene.placeName,
      participants: scene.participants,
      transcript: (source.data as Record<string, unknown>).transcript,
      recent,
    });
    const id = sceneEncounterId(scene.id);
    const old = await documents.getById("villages", id);
    if (old) {
      const prior = readSceneEncounter(old.data);
      memoryRequire(
        old.kind === SCENE_ENCOUNTER_KIND &&
          old.packageId === "villages" &&
          prior.villageSeed === scene.villageSeed &&
          prior.sourceRevision <= source.revision,
        "encounter source changed; Scene retained",
      );
      if (JSON.stringify(prior) !== JSON.stringify(encounter)) {
        memoryRequire(prior.sourceRevision < source.revision, "encounter source bytes changed");
        memoryRequire(
          await documents.update({
            ...old,
            expectedRevision: old.revision,
            data: encounter,
            updatedAt: new Date().toISOString(),
          }),
          "encounter changed; Scene retained",
        );
      }
      return;
    }
    const at = new Date().toISOString();
    await documents.create({
      id,
      packageId: "villages",
      kind: SCENE_ENCOUNTER_KIND,
      name: "Past encounter",
      description: "Witnessed Scene source references",
      data: encounter,
      createdAt: at,
      updatedAt: at,
    });
  }

  async function recall(seed: string, currentSceneId: string, audience: string[], memories: MemoryCollection) {
    const records = new Map(memories.records.map((row) => [row.id, row]));
    const headers = (await documents.list("villages", SCENE_ENCOUNTER_KIND))
      .map((row) => {
        const data = readSceneEncounter(row.data);
        memoryRequire(row.id === sceneEncounterId(data.id) && row.packageId === "villages", "encounter owner changed");
        return data;
      })
      .filter((row) => row.villageSeed === seed && row.id !== currentSceneId)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt) || a.id.localeCompare(b.id));
    const rows: EncounterQuotation[] = [];
    // Read only each present person's latest actual encounter: bounded page reads, even after months.
    const selected = new Map<SceneEncounter, string[]>();
    for (const id of audience.filter((id) => id !== "player")) {
      const header = headers.find((row) => row.recent[id]?.length);
      if (header) selected.set(header, [...(selected.get(header) ?? []), id]);
    }
    for (const [header, ids] of selected) {
      // A failed retirement publication is not yet an independent historical encounter.
      if (await documents.getById("villages", "villages-venue-visit-" + header.id)) continue;
      const owner = coerceSession({
        version: 4,
        id: header.id,
        villageSeed: header.villageSeed,
        participants: header.participants,
      });
      const positions = [...new Set(ids.flatMap((id) => header.recent[id]!))].sort((a, b) => b - a);
      for (const line of await readSceneTranscriptPositions(documents, header.transcript, owner, positions)) {
        if (!ids.some((id) => sharedEncounterSpeech(line, id))) continue;
        const heardBy = ids.filter(
          (id) => sharedEncounterSpeech(line, id) && !encounterKnowerProtected(records, header.id, id, line.at),
        );
        if (!encounterKnowerProtected(records, header.id, "player", line.at)) heardBy.push("player");
        rows.push({
          sceneId: header.id,
          lineId: line.id,
          at: line.at,
          place: header.placeName,
          speakerId: line.role === "user" ? "player" : line.speakerId,
          text: line.content,
          heardBy,
        });
      }
    }
    return fitEncounterQuotations(rows);
  }
  return { save, recall };
}
