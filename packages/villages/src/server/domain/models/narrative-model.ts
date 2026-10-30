import type { PlaceAfter, PlaceUpdate } from "../../../shared/contracts/place-continuity.js";
import type { VillageNarrativeConsequence } from "../../../shared/contracts/village.js";

export type NarrativeTarget = PlaceAfter & {
  venueId: string;
  zoneId: string;
  name: string;
  exterior: boolean;
  controllers: string[];
  correctiveActorIds: string[];
};
export type NarrativeSituation = {
  id: string;
  revision: number;
  title: string;
  summary: string;
  status: "active" | "resolved";
  targets: { venueId: string; zoneId: string }[];
  updatedAt: string;
};
export type NarrativeCondition = {
  id: string;
  revision: number;
  situationId: string;
  venueId: string;
  zoneId: string;
  observation: string;
  restriction: "none" | "ordinary-use";
  remedy: string;
  startsAt: string;
  endsAt: string | null;
  clearedAt: string | null;
  /** A repair-linked restriction cannot clear without matching physical work. */
  physicalRevision?: number;
};
export type NarrativeWeather = {
  id: string;
  revision: number;
  sourceId: string;
  description: string;
  startsAt: string;
  endsAt: string;
};
/** A code-authored finite source, saved in the existing job/Scene before dispatch. */
export type NarrativeAdmission = {
  version: 1;
  id: string;
  source: "world" | "scene";
  sourceId: string;
  seed: string;
  at: string;
  adoptedAt: string;
  setting: string;
  facts: string[];
  consequence: VillageNarrativeConsequence;
  reviewBasis: string;
  targets: NarrativeTarget[];
  situations: NarrativeSituation[];
  conditions: NarrativeCondition[];
  weather: NarrativeWeather | null;
  weatherRevision: number;
  moment: import("../rules/village-clock.js").VillageMoment;
  baselineWeather: string;
};
export type NarrativeDevelopment = {
  severity: VillageNarrativeConsequence;
  occurrence: string;
  situation: {
    id: string | null;
    expectedRevision: number;
    title: string;
    summary: string;
    status: "active" | "resolved";
  };
  physical: { venueId: string; zoneId: string; update: PlaceUpdate }[];
  conditions: {
    id: string | null;
    expectedRevision: number;
    venueId: string;
    zoneId: string;
    observation: string;
    restriction: "none" | "ordinary-use";
    remedy: string;
    endsAt: string | null;
    clear: boolean;
  }[];
  weather: { description: string; endsAt: string; supersedes: string | null } | null;
};
export type NarrativeAfter = {
  situations: NarrativeSituation[];
  conditions: NarrativeCondition[];
  weather?: NarrativeWeather | null;
  weatherRevision?: number;
};
export type NarrativeReceipt = {
  rejected?: boolean;
  id: string;
  at: string;
  sourceId: string;
  source: "world" | "scene" | "action";
  occurrence: string;
  after: NarrativeAfter;
  physical: (PlaceAfter & { venueId: string; zoneId: string; appearanceChanged: boolean })[];
};
export type NarrativeState = {
  claims?: { id: string; attemptId: string; venueId: string; zoneId: string; fingerprint: string; batchId?: string }[];
  version: 1;
  adoptedAt: string;
  revision: number;
  weatherRevision: number;
  weather: NarrativeWeather | null;
  situations: NarrativeSituation[];
  conditions: NarrativeCondition[];
  receipts: NarrativeReceipt[];
};
