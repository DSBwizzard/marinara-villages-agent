import { createHash } from "node:crypto";
import type { VillageState, VillageVenueZone } from "../../domain/models/world.js";
import { MAX_LOCATION_IMAGE_BASE64_LENGTH } from "../../domain/rules/image-limits.js";
import { MAX_IMAGE_PROMPT_LENGTH } from "../../domain/rules/image-generation-rules.js";
import { conflict } from "../../domain/rules/errors.js";
import { sceneryImageKey } from "../../domain/rules/scenery-context.js";
import { zonePictureContext, zonePictureBaseline } from "../../domain/rules/zone-picture.js";
import { resolveVenueZone, legacyZoneId, zoneClosed } from "../../domain/rules/venue-zones.js";
import type { LocationImagePorts } from "./location-image-service.js";

export const AUTOMATIC_PICTURES_PER_HOUR = 6;
export const AUTOMATIC_ZONE_PAUSE_MS = 5 * 60_000;
const HOUR = 60 * 60_000;

/** One activation-owned queue; saved claims and reservations fence restarts and CAS retries. */
export function createZonePictures(
  ports: LocationImagePorts,
  draw: (
    venueId: string,
    zoneId: string,
    automatic: boolean,
    guard: (state: VillageState) => boolean,
  ) => Promise<unknown>,
) {
  let tail: Promise<unknown> = Promise.resolve();
  const jobs = new Map<string, Promise<unknown>>();
  const activeClaims = new Set<string>();
  const now = () => (ports.pictureNow?.() ?? new Date()).getTime();
  async function run<T>(key: string, work: () => Promise<T>): Promise<T> {
    const existing = jobs.get(key);
    if (existing) return existing as Promise<T>;
    const result = tail.catch(() => {}).then(work);
    jobs.set(key, result);
    tail = result.catch(() => {});
    try {
      return await result;
    } finally {
      if (jobs.get(key) === result) jobs.delete(key);
    }
  }
  const find = (state: VillageState, venueId: string, zoneId: string) => {
    const venue = state.venues.find((row) => row.id === venueId);
    const zone =
      venue &&
      (resolveVenueZone(venue, zoneId) ?? resolveVenueZone(venue, legacyZoneId(venue, "private", "residence", zoneId)));
    return { venue, zone };
  };
  async function queue(
    venueId: string,
    zoneId: string,
    automatic: boolean,
    replacement?: (guard: (state: VillageState) => boolean) => Promise<unknown>,
  ): Promise<unknown> {
    const admitted = await ports.readVillageState();
    const identity = JSON.stringify([admitted.seed, admitted.foundedAt]);
    return run(
      JSON.stringify([identity, venueId, zoneId, automatic ? "auto" : replacement ? "replace" : "update"]),
      async () => {
        const village = await ports.readVillageState();
        if (JSON.stringify([village.seed, village.foundedAt]) !== identity) return;
        const { venue, zone } = find(village, venueId, zoneId);
        if (
          !venue ||
          !zone ||
          zoneClosed(village, venue, zone) ||
          zone.preparation?.status === "pending" ||
          zone.preparation?.status === "failed"
        )
          return;
        const eligible = (state: VillageState, current: VillageVenueZone) =>
          !automatic ||
          (state.automaticZonePictures !== false &&
            !current.freezePicture &&
            !current.picture?.removed &&
            current.seen);
        if (!eligible(village, zone)) return;
        const source = zone.image,
          base = zone.picture?.base ?? source;
        const target = zonePictureContext(village, venue, zone);
        const freshContext = !source || replacement ? sceneryImageKey(village, venue, zone.id) : undefined;
        const epoch = village.zonePictureEpoch ?? 0,
          revision = zone.pictureRevision ?? 0;
        const valid = (state: VillageState) => {
          const found = find(state, venueId, zone.id),
            current = found.zone;
          return current &&
            JSON.stringify([state.seed, state.foundedAt]) === identity &&
            (state.zonePictureEpoch ?? 0) === epoch &&
            (current.pictureRevision ?? 0) === revision &&
            current.image?.id === source?.id &&
            current.description === zone.description &&
            (!freshContext || (found.venue && sceneryImageKey(state, found.venue, zone.id) === freshContext)) &&
            eligible(state, current)
            ? current
            : undefined;
        };
        const prior = zone.picture?.context ?? zone.picture?.baseline;
        const same = prior && zonePictureBaseline(prior) === target;
        if (source && same && !replacement) {
          if (zone.picture?.dirty || zone.picture?.problem || zone.picture?.failed || zone.picture?.claim)
            await ports.mutateVillageState((state) => {
              const current = valid(state);
              if (current?.picture) {
                current.picture.dirty = false;
                current.picture.problem = undefined;
                current.picture.failed = false;
                current.picture.claim = undefined;
              }
            });
          return;
        }
        if (automatic && source && !zone.picture?.dirty) return;
        if (automatic && (zone.picture?.failed || zone.picture?.claim || (!source && zone.initialImageAttemptedAt))) {
          await ports.mutateVillageState((state) => {
            const current = valid(state);
            if (current && (!current.picture?.claim || !activeClaims.has(current.picture.claim))) {
              current.picture = {
                ...current.picture,
                base: current.picture?.base ?? current.image,
                failed: true,
                problem: "Artwork needs a deliberate retry.",
              };
            }
          });
          return;
        }
        let support: Awaited<ReturnType<NonNullable<LocationImagePorts["resolveVillageImageEditing"]>>> = null;
        let problem = "";
        try {
          if (source && !replacement) {
            support = (await ports.resolveVillageImageEditing?.()) ?? null;
            if (!support || !ports.readZonePictureReference)
              problem =
                "This connection cannot update artwork. Choose a compatible image connection or Generate a replacement.";
          } else if (!replacement) await ports.resolveVillageImageConnectionId?.();
        } catch {
          problem = "Choose an enabled image connection to update artwork.";
        }
        // Preserve the complete before/after accounts; never truncate a physical change.
        const prompt = [
          "Edit reference 1, the latest appearance of this exact Zone. Preserve viewpoint, architecture, furniture identities, colors, fabrics and all details not contradicted by the complete target physical account. Remove things the previous account names that are absent from the target. No people. Match the existing art style. Do not add possessions from personality context.",
          support?.multiple && base?.id !== source?.id
            ? "Reference 2 is the original architectural anchor; preserve later furnishings unless the target changes them."
            : "",
          "Previous physical account: " +
            (prior
              ? zonePictureBaseline(prior)
                ? String(JSON.parse(zonePictureBaseline(prior)).description)
                : "Not recorded"
              : "Not recorded; preserve existing visual details unless the target contradicts them."),
          "Complete target physical account: " + zone.description,
        ]
          .filter(Boolean)
          .join("\n");
        if (!replacement && source && prior && !zonePictureBaseline(prior))
          problem = "Artwork baseline is unavailable. Generate a replacement.";
        const editPrompt = prompt;
        if (!replacement && source && editPrompt.length > MAX_IMAGE_PROMPT_LENGTH)
          problem =
            "The complete artwork instructions are too long. Shorten Long-term details or Generate a replacement.";
        const claim = createHash("sha256")
          .update(JSON.stringify([identity, zone.id, target, source?.id, revision, epoch]))
          .digest("hex");
        let claimed = false;
        await ports.mutateVillageState((state) => {
          claimed = false;
          const current = valid(state);
          if (!current) return;
          if (current.picture?.claim !== zone.picture?.claim) return;
          if (automatic && !source && current.initialImageAttemptedAt !== zone.initialImageAttemptedAt) return;
          if (problem) {
            current.picture = { ...current.picture, base, problem };
            return;
          }
          if (automatic) {
            const stamp = now(),
              budget = state.zonePictureBudget;
            const sameWindow = budget && stamp - Date.parse(budget.startedAt) < HOUR;
            const used = sameWindow ? budget.used : 0;
            if (
              used >= AUTOMATIC_PICTURES_PER_HOUR ||
              (current.picture?.lastAutomaticAt &&
                stamp - Date.parse(current.picture.lastAutomaticAt) < AUTOMATIC_ZONE_PAUSE_MS)
            ) {
              current.picture = {
                ...current.picture,
                base,
                problem: "Automatic limit reached. Update artwork manually or wait for a later visit or action.",
              };
              return;
            }
            state.zonePictureBudget = {
              startedAt: sameWindow ? budget.startedAt : new Date(stamp).toISOString(),
              used: used + 1,
            };
          }
          current.picture = {
            ...current.picture,
            base,
            claim,
            attempted: claim,
            operation: replacement ? "replace" : "update",
            failed: false,
            problem: undefined,
            lastAutomaticAt: automatic ? new Date(now()).toISOString() : current.picture?.lastAutomaticAt,
          };
          if (!source) current.initialImageAttemptedAt = new Date(now()).toISOString();
          claimed = true;
        });
        if (!claimed) {
          if (!automatic && !valid(await ports.readVillageState()))
            throw conflict("The scenery changed while its image was generated. Generate again.");
          return ports.buildVillageSnapshot?.();
        }
        activeClaims.add(claim);
        try {
          if (!source || replacement)
            return await (replacement
              ? replacement((state) => valid(state)?.picture?.claim === claim)
              : draw(venueId, zone.id, automatic, (state) => valid(state)?.picture?.claim === claim));
          const reference = await ports.readZonePictureReference!(source);
          const references = [reference.dataUrl];
          if (support!.multiple && base && base.id !== source.id)
            references.push((await ports.readZonePictureReference!(base)).dataUrl);
          if (valid(await ports.readVillageState())?.picture?.claim !== claim) return;
          const currentSupport = await ports.resolveVillageImageEditing!();
          if (currentSupport?.signature !== support!.signature)
            throw conflict("The image connection changed. Retry artwork deliberately.");
          const scale = Math.min(1, 2048 / Math.max(reference.width, reference.height));
          const decoded = await ports.generateVillageImage({
            connectionId: support!.connectionId,
            referenceImages: references,
            name: venue.name + " · " + zone.name,
            prompt: editPrompt,
            width: Math.max(64, Math.round(reference.width * scale)),
            height: Math.max(64, Math.round(reference.height * scale)),
            maxBase64Length: MAX_LOCATION_IMAGE_BASE64_LENGTH,
          });
          if (valid(await ports.readVillageState())?.picture?.claim !== claim) return;
          const image = await ports.uploadVillageGalleryImage({
            bytes: decoded.bytes,
            mime: decoded.mime,
            name: venue.name + " · " + zone.name,
            prompt: editPrompt,
          });
          await ports.mutateVillageState((state) => {
            const current = valid(state);
            if (!current || current.picture?.claim !== claim) return;
            current.image = image;
            current.picture = {
              base,
              baseline: zone.picture?.baseline ?? target,
              context: target,
              attempted: claim,
              dirty: false,
              lastAutomaticAt: current.picture.lastAutomaticAt,
            };
          });
        } catch (error) {
          await ports.mutateVillageState((state) => {
            const current = find(state, venueId, zone.id).zone;
            if (JSON.stringify([state.seed, state.foundedAt]) === identity && current?.picture?.claim === claim)
              current.picture = {
                ...current.picture,
                failed: true,
                problem: "Artwork could not be updated. Retry deliberately.",
              };
          });
          ports
            .villagesLogger()
            .warn("[villages] Zone artwork retained for %s/%s: %s", venueId, zone.id, String(error));
          if (!automatic) throw error;
        } finally {
          activeClaims.delete(claim);
          await ports.mutateVillageState((state) => {
            const current = find(state, venueId, zone.id).zone;
            if (JSON.stringify([state.seed, state.foundedAt]) === identity && current?.picture?.claim === claim)
              current.picture.claim = undefined;
          });
        }
      },
    );
  }
  async function updateZonePicture(venueId: string, zoneId: string) {
    await ports.assertVenueImageAccess(venueId, undefined, "", zoneId);
    await queue(venueId, zoneId, false);
    return ports.buildVillageSnapshot!();
  }
  return {
    replaceZonePicture: async (
      venueId: string,
      zoneId: string,
      draw: (guard: (state: VillageState) => boolean) => Promise<unknown>,
    ) => {
      await ports.assertVenueImageAccess(venueId, undefined, "", zoneId);
      return queue(venueId, zoneId, false, draw);
    },
    requestZonePicture: (venueId: string, zoneId: string) => queue(venueId, zoneId, true),
    updateZonePicture,
  };
}
