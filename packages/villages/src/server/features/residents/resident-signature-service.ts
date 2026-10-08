import { residentSignature, type ResidentSignatureView } from "../../../shared/helpers/resident-signature.js";
import type { VillageGalleryUpload } from "../../adapters/engine/global-gallery.js";
import { decodeVillageImageDataUrl, type DecodedVillageImage } from "../../adapters/engine/image-files.js";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VillageState, VillageVenueImage } from "../../domain/models/world.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict, notFound, safeFailureMessage, statusCodeOf } from "../../domain/rules/errors.js";
import { signaturePrompt } from "../../domain/rules/resident-signature-prompt.js";
import type { ResidentSignatureTasks } from "./resident-signature-tasks.js";
import { createHash } from "node:crypto";

export interface ResidentSignaturePorts {
  owner: string;
  tasks: ResidentSignatureTasks;
  villagesDocuments(): CapabilityDocumentStore;
  villagesRuntimeEpoch(): number | null;
  readVillageAuthority(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  resolveVillageImageConnectionId(): Promise<string>;
  generateVillageImage(input: {
    connectionId?: string;
    name: string;
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    maxBase64Length: number;
  }): Promise<DecodedVillageImage>;
  prepareSignatureImage(
    decoded: DecodedVillageImage,
  ): Promise<{ originalSize: { width: number; height: number }; bytes: Uint8Array; width: number; height: number }>;
  uploadVillageGalleryImage(input: VillageGalleryUpload): Promise<VillageVenueImage>;
}

/** One connection owner; saved-world admission and process recovery identity are explicit. */
export function createResidentSignatures({
  owner,
  tasks,
  villagesDocuments,
  villagesRuntimeEpoch,
  readVillageAuthority,
  mutateVillageState,
  resolveVillageImageConnectionId,
  generateVillageImage,
  prepareSignatureImage,
  uploadVillageGalleryImage,
}: ResidentSignaturePorts) {
  const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const LIMIT = 8_000_000;
  type Attempt = {
    attempt: number;
    actionId: string;
    owner: string;
    runtimeEpoch?: number | null;
    status: "running" | "failed" | "saved";
    revision: string;
    prompt: string;
    name: string;
    error: string;
    response?: string;
    original?: VillageVenueImage;
    image?: VillageVenueImage;
  };
  async function subject(id: string) {
    const village = await readVillageAuthority();
    const resident = village.villagers.find((person) => person.characterId === id);
    if (!resident) throw notFound("That Villager no longer lives here.");
    const incarnation = digest([village.seed, id, resident.addedAt]);
    return {
      village,
      resident,
      documentId: `villages-signature-${incarnation}`,
      incarnation,
      runtimeEpoch: villagesRuntimeEpoch(),
      revision: digest([resident.cardSnapshot.name, resident.cardSnapshot.personality]),
    };
  }
  async function readAttempt(id: string) {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, id);
    return record ? { record, data: structuredClone(record.data) as Attempt } : null;
  }
  async function saveAttempt(id: string, data: Attempt, expectedRevision?: number) {
    const stamp = new Date().toISOString();
    const fields = {
      id,
      packageId: VILLAGES_PACKAGE_ID,
      kind: "resident-signature",
      name: `${data.name}'s signature`,
      description: "Explicit signature image request and saved response",
      data,
      updatedAt: stamp,
    };
    if (expectedRevision !== undefined) {
      if (!(await villagesDocuments().update({ ...fields, expectedRevision })))
        throw conflict("Signature changed. Refresh the profile.");
    } else await villagesDocuments().create({ ...fields, createdAt: stamp });
  }
  async function readResidentSignature(id: string): Promise<ResidentSignatureView> {
    const { resident, documentId, revision } = await subject(id);
    const attempt = (await readAttempt(documentId))?.data;
    let available = false,
      unavailableReason = "";
    try {
      await resolveVillageImageConnectionId();
      available = true;
    } catch (error) {
      unavailableReason = safeFailureMessage(error).replace(
        "Add one in the Engine's settings, or upload an image instead.",
        "Add one in the Engine's settings to generate signature artwork.",
      );
    }
    return {
      fallback: residentSignature(resident.cardSnapshot),
      saved: resident.signature ?? null,
      available,
      recoverable: Boolean(
        attempt?.status !== "saved" &&
        attempt?.revision === revision &&
        (attempt?.response || (attempt?.original && attempt?.image)),
      ),
      unavailableReason,
      attempt: attempt?.attempt ?? 0,
      status:
        attempt?.status === "running"
          ? attempt.owner === owner && attempt.runtimeEpoch === villagesRuntimeEpoch() && tasks.has(documentId)
            ? "running"
            : "interrupted"
          : attempt?.status === "failed"
            ? "failed"
            : resident.signature
              ? "saved"
              : "local",
      error: attempt?.error ?? "",
    };
  }

  /** A deliberate request, with a persisted claim and response recovery; reads never dispatch. */
  async function generateResidentSignature(id: string, body: unknown): Promise<ResidentSignatureView> {
    const raw = asRecord(body),
      actionId = asTrimmedString(raw.actionId),
      expectedAttempt = raw.expectedAttempt;
    if (!/^[a-zA-Z0-9_-]{8,100}$/.test(actionId) || !Number.isInteger(expectedAttempt) || Number(expectedAttempt) < 0)
      throw badRequest("A signature action ID and current attempt are required.");
    const initial = await subject(id);
    const active = tasks.get(initial.documentId);
    if (active) {
      const existing = (await readAttempt(initial.documentId))?.data;
      if (existing?.actionId === actionId) return active;
      throw conflict("A signature is already being generated.");
    }
    const task = run(initial, actionId, Number(expectedAttempt));
    tasks.set(initial.documentId, task);
    try {
      return await task;
    } finally {
      tasks.forget(initial.documentId, task);
    }
  }
  async function run(initial: Awaited<ReturnType<typeof subject>>, actionId: string, expectedAttempt: number) {
    const previous = await readAttempt(initial.documentId);
    if (previous?.data.actionId === actionId) return readResidentSignature(initial.resident.characterId);
    if ((previous?.data.attempt ?? 0) !== expectedAttempt)
      throw conflict("Signature changed. Refresh the profile before retrying.");
    // A failed upload or Village write reuses the paid image, even if the image connection is now disabled.
    const recover =
      previous?.data.status !== "saved" &&
      previous?.data.revision === initial.revision &&
      Boolean(previous.data.response || (previous.data.original && previous.data.image));
    const connectionId = recover ? "" : await resolveVillageImageConnectionId();
    const data: Attempt = {
      ...(recover ? previous!.data : {}),
      attempt: expectedAttempt + 1,
      actionId,
      owner,
      runtimeEpoch: initial.runtimeEpoch,
      status: "running",
      revision: initial.revision,
      prompt: recover ? previous!.data.prompt : signaturePrompt(initial.resident),
      name: initial.resident.cardSnapshot.name,
      error: "",
    };
    await saveAttempt(initial.documentId, data, previous?.record.revision);
    const checkpoint = async () => {
      if (villagesRuntimeEpoch() !== initial.runtimeEpoch) throw conflict("The Villages package runtime changed.");
      const current = await readAttempt(initial.documentId);
      if (current?.data.actionId !== actionId) throw conflict("Signature request changed.");
      await saveAttempt(initial.documentId, data, current.record.revision);
    };
    const stillCurrent = async () => {
      if (villagesRuntimeEpoch() !== initial.runtimeEpoch) throw conflict("The Villages package runtime changed.");
      const current = await subject(initial.resident.characterId);
      if (current.incarnation !== initial.incarnation || current.revision !== initial.revision)
        throw conflict(
          "The Villager changed while the signature was generated. Your previous signature remains available.",
        );
    };
    try {
      if (!data.response && !data.image) {
        await stillCurrent();
        const image = await generateVillageImage({
          connectionId,
          name: `${data.name} signature`,
          prompt: data.prompt,
          negativePrompt: "portrait, person, objects, scenery, paper texture, watermark, captions, extra text",
          width: 1536,
          height: 1024,
          maxBase64Length: LIMIT,
        });
        data.response = image.dataUrl;
        await checkpoint();
      }
      await stillCurrent();
      if (!data.original || !data.image) {
        const decoded = decodeVillageImageDataUrl(data.response, { label: "signature", maxBase64Length: LIMIT });
        let prepared: Awaited<ReturnType<typeof prepareSignatureImage>>;
        try {
          prepared = await prepareSignatureImage(decoded);
        } catch (error) {
          delete data.response;
          throw error;
        }
        if (!data.original) {
          data.original = await uploadVillageGalleryImage({
            ...prepared.originalSize,
            bytes: decoded.bytes,
            mime: decoded.mime,
            name: `${data.name} signature original`,
            prompt: data.prompt,
          });
          await checkpoint();
        }
        if (!data.image) {
          data.image = await uploadVillageGalleryImage({
            width: prepared.width,
            height: prepared.height,
            bytes: prepared.bytes,
            mime: "image/png",
            name: `${data.name} signature`,
            prompt: data.prompt,
          });
          await checkpoint();
        }
      }
      await stillCurrent();
      await mutateVillageState((village) => {
        const resident = village.villagers.find(
          (person) =>
            person.characterId === initial.resident.characterId && person.addedAt === initial.resident.addedAt,
        );
        if (
          village.seed !== initial.village.seed ||
          !resident ||
          digest([resident.cardSnapshot.name, resident.cardSnapshot.personality]) !== initial.revision
        )
          throw conflict("The Villager changed while the signature was generated.");
        resident.signature = {
          image: data.image!,
          original: data.original!,
          name: data.name,
          generatedAt: new Date().toISOString(),
        };
      });
      data.status = "saved";
      delete data.response;
      await checkpoint();
    } catch (error) {
      data.status = "failed";
      data.error = safeFailureMessage(error);
      if ([404, 409].includes(statusCodeOf(error))) delete data.response;
      try {
        await checkpoint();
      } catch {
        /* The persisted claim still prevents an implicit paid retry. */
      }
    }
    return readResidentSignature(initial.resident.characterId);
  }

  return { readResidentSignature, generateResidentSignature };
}
export type ResidentSignatures = ReturnType<typeof createResidentSignatures>;
