/** null preserves an authored/legacy description; empty string follows Engine default. */
export type SceneryStyleProfileId = string | null;
export interface VillageImageStyleCatalog {
  defaultProfileId: string;
  profiles: { id: string; name: string }[];
}
