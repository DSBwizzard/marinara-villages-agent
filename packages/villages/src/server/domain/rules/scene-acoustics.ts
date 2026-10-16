import type { AttentionFragment, AttentionPlan } from "./scene-attention.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageVenue } from "../models/world.js";
import { sceneLayoutVenue } from "./scene-layout.js";
import { venueZones } from "./venue-zones.js";
import { contactNeighbors } from "./venue-contact.js";
import { fingerprint } from "./interpretation-rules.js";

export type SoundDelivery = "ordinary" | "call" | "shout" | "exceptional";
export const soundDeliveries: readonly SoundDelivery[] = ["ordinary", "call", "shout", "exceptional"];
export function acousticReach(
  venue: VillageVenue,
  scene: VenueScene,
  origin: string,
  delivery: SoundDelivery,
  outward: boolean,
) {
  const zones = venueZones(sceneLayoutVenue(venue, scene));
  const adjacent = contactNeighbors(venue, origin, scene);
  return {
    sound:
      delivery === "shout" || delivery === "exceptional"
        ? zones.map((zone) => zone.id).filter((id) => id !== origin)
        : adjacent,
    words: delivery === "exceptional" ? [] : delivery === "ordinary" && !outward ? [] : adjacent,
  };
}
export function acousticFragment(
  venue: VillageVenue,
  scene: VenueScene,
  fragment: Pick<AttentionFragment, "id" | "start" | "end" | "kind">,
  delivery: SoundDelivery,
  outward: boolean,
): AttentionFragment {
  const reach = acousticReach(venue, scene, scene.zoneId ?? "exterior", delivery, outward);
  return {
    ...fragment,
    delivery,
    outward,
    reach: "broadcast",
    zoneIds: reach.sound,
    wordZoneIds: fragment.kind === "speech" ? reach.words : [],
  };
}
export function acousticFingerprint(plan: AttentionPlan, message: string, venue: VillageVenue, scene: VenueScene) {
  return fingerprint([
    {
      id: "acoustics-v5",
      domain: "attention",
      question: "Acoustic plan",
      evidence: [],
      outcomes: [],
      facts: {
        message,
        zoneId: scene.zoneId,
        revision: scene.sceneRevision,
        layout: venueZones(sceneLayoutVenue(venue, scene)).map((zone) => ({
          id: zone.id,
          connectedTo: zone.connectedTo,
        })),
        contacts: scene.doorwayContacts,
        activeIds: scene.activeIds,
        history: scene.lines
          .filter((line) => !line.contactHidden && !line.contactReport)
          .slice(-6)
          .map((line) => ({ id: line.id, content: line.content, speakerId: line.speakerId })),
        plan: {
          status: plan.status,
          fragments: plan.fragments.map((fragment) => ({
            id: fragment.id,
            start: fragment.start,
            end: fragment.end,
            kind: fragment.kind,
            reach: fragment.reach,
            delivery: fragment.delivery,
            outward: fragment.outward,
            targetZoneId: fragment.targetZoneId,
            zoneIds: fragment.zoneIds,
            wordZoneIds: fragment.wordZoneIds,
          })),
          question: plan.question,
        },
      },
    },
  ]);
}
export function bindAcousticPlan(
  plan: AttentionPlan,
  message: string,
  venue: VillageVenue,
  scene: VenueScene,
  _sourceReferences?: boolean,
): AttentionPlan {
  return { ...plan, validation: { version: 3, fingerprint: acousticFingerprint(plan, message, venue, scene) } };
}
