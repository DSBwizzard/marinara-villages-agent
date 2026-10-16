import type { VillagerCard } from "../../domain/models/catalog-model.js";
import type {
  VillageCatalogEntry,
  VillageSnapshot,
  VillageState,
  VillageVillagerRefreshPreview,
} from "../../domain/models/world.js";
import { badRequest, notFound } from "../../domain/rules/errors.js";
import { unwrittenVillageAgenda } from "../../domain/rules/agenda-plan.js";
import { snapshotContent, snapshotFromCard } from "../../domain/rules/resident-card-snapshot.js";

export interface ResidentCardPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  listVillagerCards(): Promise<VillagerCard[]>;
  findVillagerCard(id: string): Promise<VillagerCard | null>;
  toCatalogEntry(card: VillagerCard, resident: boolean): VillageCatalogEntry;
}

/** Card commands keep their specific library and Village connections. Construction starts no work. */
export function createResidentCards({
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  listVillagerCards,
  findVillagerCard,
  toCatalogEntry,
}: ResidentCardPorts) {
  /** Every card the player owns, flagged with whether it already lives here. */
  async function buildVillageCatalog(): Promise<VillageCatalogEntry[]> {
    const [village, cards] = await Promise.all([readVillageState(), listVillagerCards()]);
    const resident = new Set(village.villagers.map((villager) => villager.characterId));
    return cards.map((card) => toCatalogEntry(card, resident.has(card.id)));
  }

  async function previewVillagerRefresh(characterId: string): Promise<VillageVillagerRefreshPreview> {
    const village = await readVillageState();
    const villager = village.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) throw notFound("That villager does not live here.");
    const card = await findVillagerCard(characterId);
    const proposed = card ? snapshotFromCard(card, villager.cardSnapshot.revision + 1) : null;
    return {
      characterId,
      current: villager.cardSnapshot,
      proposed,
      sourceAvailable: card !== null,
      changed: proposed !== null && snapshotContent(proposed) !== snapshotContent(villager.cardSnapshot),
    };
  }

  async function applyVillagerRefresh(characterId: string): Promise<VillageSnapshot> {
    const village = await readVillageState();
    const villager = village.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) throw notFound("That villager does not live here.");
    const card = await findVillagerCard(characterId);
    if (!card) throw badRequest("That character card is no longer in your library.");
    const proposed = snapshotFromCard(card, villager.cardSnapshot.revision + 1);
    const proseChanged =
      snapshotContent({
        ...villager.cardSnapshot,
        nameColor: proposed.nameColor,
        dialogueColor: proposed.dialogueColor,
      }) !== snapshotContent(proposed);
    if (
      snapshotContent(proposed) === snapshotContent(villager.cardSnapshot) &&
      villager.cardSnapshot.sourceStatus === "available"
    ) {
      return buildVillageSnapshot();
    }
    await mutateVillageState((state) => {
      const resident = state.villagers.find((entry) => entry.characterId === characterId);
      if (!resident) return;
      resident.cardSnapshot = {
        ...proposed,
      };
      if (proseChanged) {
        resident.agenda = unwrittenVillageAgenda(state.venues, card.name);
        resident.remap = null;
        resident.remapFailure = null;
      }
    });
    return buildVillageSnapshot();
  }
  return { buildVillageCatalog, previewVillagerRefresh, applyVillagerRefresh };
}
export type ResidentCards = ReturnType<typeof createResidentCards>;
