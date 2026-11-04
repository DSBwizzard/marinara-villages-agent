import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createHash } from "node:crypto";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import type { DocumentSlot } from "../../adapters/storage/document-store.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { projectSceneEvidence } from "../../domain/rules/project-scene-evidence.js";

export const PROJECT_EVIDENCE_ID = "villages-project-scene-evidence";
export const PROJECT_EVIDENCE_KIND = "project-scene-evidence";
type ProjectEvidenceIndex = {
  version: 1;
  seed: string;
  scenes: { revision: number; digest: string; scene: VenueScene }[];
};

function evidenceDigest(value: unknown): string {
  const canonical = JSON.stringify(value, (_key, entry: unknown) =>
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)))
      : entry,
  );
  return createHash("sha256").update(canonical).digest("hex");
}

const slot: DocumentSlot<ProjectEvidenceIndex> = {
  kind: PROJECT_EVIDENCE_KIND,
  name: "Recent Project evidence",
  description: "Bounded Project candidate evidence from completed Scenes.",
  label: () => "Recent Project evidence",
  coerce(value) {
    if (value === undefined || value === null) return { version: 1, seed: "", scenes: [] };
    const data = asRecord(value);
    if (data.version !== 1 || typeof data.seed !== "string" || !Array.isArray(data.scenes) || data.scenes.length > 20)
      throw new Error("Saved Project evidence is invalid; Scene cleanup is deferred.");
    const scenes = data.scenes.map((value) => {
      const entry = asRecord(value);
      const raw = asRecord(entry.scene);
      if (!Number.isSafeInteger(entry.revision) || Number(entry.revision) < 1)
        throw new Error("Saved Project evidence is invalid; Scene cleanup is deferred.");
      if (typeof entry.digest !== "string" || entry.digest !== evidenceDigest(raw))
        throw new Error("Saved Project evidence is invalid; Scene cleanup is deferred.");
      if (raw.version !== 3 || raw.status !== "closed" || raw.villageSeed !== data.seed || !raw.id)
        throw new Error("Saved Project evidence is invalid; Scene cleanup is deferred.");
      return { revision: Number(entry.revision), digest: entry.digest, scene: coerceSession(raw) };
    });
    return { version: 1, seed: data.seed, scenes };
  },
};

export interface ProjectEvidenceIndexPorts {
  villagesDocuments(): Pick<CapabilityDocumentStore, "getById">;
  mutateDocument: typeof import("../../adapters/storage/document-store.js").mutateDocument;
}

export function createProjectEvidenceIndex({ villagesDocuments, mutateDocument }: ProjectEvidenceIndexPorts) {
  async function read(seed: string): Promise<VenueScene[]> {
    const saved = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, PROJECT_EVIDENCE_ID);
    const index = slot.coerce(saved?.data);
    return index.seed === seed ? index.scenes.map((row) => row.scene) : [];
  }

  async function save(scene: VenueScene, revision: number): Promise<void> {
    if (!scene.villageSeed || scene.status !== "closed" || !Number.isSafeInteger(revision) || revision < 1)
      throw new Error("Project evidence source is not settled.");
    const projected = projectSceneEvidence(scene);
    if (Buffer.byteLength(JSON.stringify(projected), "utf8") > 2_000_000)
      throw new Error("Project evidence exceeds the saved evidence limit; Scene cleanup is deferred.");
    await mutateDocument(PROJECT_EVIDENCE_ID, slot, (index) => {
      if (index.seed && index.seed !== scene.villageSeed)
        throw new Error("Village changed while saving Project evidence.");
      const old = index.scenes.find((saved) => saved.scene.id === scene.id);
      if (old && old.revision > revision)
        throw new Error("Project evidence source changed; Scene cleanup is deferred.");
      if (old && old.revision === revision && old.digest !== evidenceDigest(projected))
        throw new Error("Project evidence does not match its source revision; Scene cleanup is deferred.");
      index.seed = scene.villageSeed!;
      index.scenes = [
        ...index.scenes.filter((saved) => saved.scene.id !== scene.id),
        { revision, digest: evidenceDigest(projected), scene: projected },
      ]
        .sort((a, b) => b.scene.startedAt.localeCompare(a.scene.startedAt) || a.scene.id.localeCompare(b.scene.id))
        .slice(0, 20);
      if (Buffer.byteLength(JSON.stringify(index), "utf8") > 2_000_000)
        throw new Error("Project evidence exceeds the saved evidence limit; Scene cleanup is deferred.");
    });
  }

  return { read, save };
}
