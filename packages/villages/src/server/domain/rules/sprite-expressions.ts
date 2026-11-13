import {
  currentStaging,
  lineStagingCues,
  retainStagingAttention,
  stagingTranscriptEvents,
  type StagingLine,
  type StagingState,
} from "../../../shared/helpers/scene-staging.js";
import type { VenueReplyLine, VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import type { VillageResidentSprite } from "../models/world.js";
import { memoryHash } from "./memory-integrity.js";

type SpriteEntry = VillageResidentSprite["expressions"][number];
type SpriteCatalog = {
  defaultExpressionId?: string;
  expressions: Pick<SpriteEntry, "expressionId" | "name" | "spriteName" | "view">[];
};
export type SpriteSelectionContext = {
  state: StagingState;
  variants: boolean;
  sprites: Record<string, SpriteCatalog>;
};
/** Freeze selection inputs with the Narration request, without artwork or descriptive notes. */
export function sceneSpriteSelection(scene: VenueScene, village: VillageState): SpriteSelectionContext {
  const ids = scene.activeIds;
  const sprites = Object.fromEntries(
    ids.flatMap((id) => {
      const sprite = village.villagers.find((person) => person.characterId === id)?.sprite;
      if (!sprite) return [];
      const { defaultExpressionId, expressions } = sprite;
      return [
        [
          id,
          {
            defaultExpressionId,
            expressions: expressions.map(({ expressionId, name, spriteName, view }) => ({
              expressionId,
              name,
              spriteName,
              view,
            })),
          },
        ] as const,
      ];
    }),
  );
  return {
    state: Object.keys(sprites).length
      ? currentStaging(ids, [
          ...stagingTranscriptEvents(
            (scene.lines ?? []).filter(
              (line) =>
                !line.contactHidden &&
                !line.contactReport &&
                (!scene.zoneId || !line.zoneId || line.zoneId === scene.zoneId),
            ),
            scene.submissions ?? [],
          ),
          { afterIds: ids },
        ])
      : {},
    variants: village.spriteVariantsEnabled !== false,
    sprites,
  };
}

/** Only visible cues can change playback. The admitted Episode gives each choice a stable roll. */
export function settleSceneSpriteCues(
  lines: VenueReplyLine[],
  context: SpriteSelectionContext | undefined,
  episodeId: string,
) {
  const visible = lines.map((line) => {
    if (line.contactHidden || line.contactReport) {
      line.staging = [];
      return { speakerId: "", physicalIdsAfter: line.physicalIdsAfter };
    }
    line.staging = (line.staging ?? []).flatMap(({ position: _position, ...cue }) =>
      cue.expression || cue.look ? [cue] : [],
    );
    return line;
  });
  resolveSceneSpriteExpressions(
    visible,
    structuredClone(context?.state ?? {}),
    (id) => (context && Object.hasOwn(context.sprites, id) ? context.sprites[id] : undefined),
    context?.variants === true,
    (index, id, expression) =>
      Number.parseInt(memoryHash([episodeId, index, id, expression]).slice(0, 8), 16) / 0x1_0000_0000,
  );
}

/** Engine convention: two or more suffixed names share the prefix before the first underscore.
 * Names have already had the structural full_ prefix and file extension removed by the media owner.
 * Mirrors Engine sprite.service / expression-agent-utils; no private Engine imports. */
function expressionChoices(sprite: SpriteCatalog | null | undefined, variants: boolean) {
  const byExpression = new Map<string, SpriteCatalog["expressions"][number]>();
  for (const entry of sprite?.expressions ?? [])
    if (entry.view === "front" || !byExpression.has(entry.expressionId)) byExpression.set(entry.expressionId, entry);
  const entries = [...byExpression.values()];
  const name = (entry: SpriteCatalog["expressions"][number]) => (entry.spriteName ?? entry.name).trim().toLowerCase();
  const prefixes = new Map<string, number>();
  for (const entry of entries) {
    const key = name(entry).split("_")[0];
    if (variants && name(entry).indexOf("_") > 0) prefixes.set(key, (prefixes.get(key) ?? 0) + 1);
  }
  const emitted = new Set<string>();
  return entries.flatMap((entry) => {
    const key = name(entry).split("_")[0];
    const grouped = (prefixes.get(key) ?? 0) > 1;
    const members = grouped
      ? entries.filter((item) => name(item) === key || name(item).startsWith(key + "_"))
      : [entry];
    const id = grouped ? "g-" + members[0].expressionId : entry.expressionId;
    if (emitted.has(id)) return [];
    emitted.add(id);
    return [{ id, name: grouped ? key : entry.name, members }];
  });
}

export function describeSpriteExpressions(sprite: SpriteCatalog | null | undefined, variants = false): string {
  const seen = new Set<string>();
  const defaultEntry = sprite?.expressions[0];
  const defaultId = sprite?.defaultExpressionId ?? defaultEntry?.expressionId;
  return expressionChoices(sprite, variants)
    .flatMap(({ id, name, members }) => {
      if (seen.has(id)) return [];
      seen.add(id);
      return [
        JSON.stringify({
          id,
          name,
          views: [
            ...new Set(
              (sprite?.expressions ?? [])
                .filter((item) => members.some((member) => member.expressionId === item.expressionId))
                .map((item) => item.view),
            ),
          ],
          isDefault: members.some((member) => member.expressionId === defaultId),
        }),
      ];
    })
    .join("; ");
}

/** Resolve a model-visible group once to a concrete saved ID. Existing concrete IDs never reroll. */
export function resolveSpriteExpression(
  sprite: SpriteCatalog | null | undefined,
  requested: string,
  variants: boolean,
  view: "front" | "side" | undefined,
  random: number,
): string {
  const exact = validateSpriteExpression(sprite, requested);
  if (exact) return exact;
  const choice = expressionChoices(sprite, variants).find((entry) => entry.id === requested);
  if (!choice) return "";
  const matching = choice.members.filter((member) =>
    sprite?.expressions.some((entry) => entry.expressionId === member.expressionId && entry.view === view),
  );
  const pool = matching.length ? matching : choice.members;
  return pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random * pool.length)))]?.expressionId ?? "";
}

/** Replies may select only this resident's assigned expression IDs. */
export function validateSpriteExpression(
  sprite: SpriteCatalog | null | undefined,
  requested: string,
  variants = false,
): string {
  return (
    sprite?.expressions.find((entry) => entry.expressionId === requested)?.expressionId ??
    (variants && expressionChoices(sprite, true).some((entry) => entry.id === requested) ? requested : "")
  );
}

/** Resolve new cues in playback order; the caller persists only concrete expression IDs. */
export function resolveSceneSpriteExpressions(
  lines: (StagingLine & { physicalIdsAfter?: readonly string[] })[],
  currentStage: StagingState,
  spriteFor: (characterId: string) => SpriteCatalog | null | undefined,
  variants: boolean,
  random: (index: number, characterId: string, expression: string) => number,
) {
  for (const [index, line] of lines.entries()) {
    if (line.physicalIdsAfter) currentStage = retainStagingAttention(currentStage, line.physicalIdsAfter);
    const cues = line.staging ?? [];
    for (const cue of lineStagingCues(line))
      if (cue.look && Object.hasOwn(currentStage, cue.characterId)) currentStage[cue.characterId].look = cue.look;
    const choices = new Map<string, string>();
    const resolveExpression = (characterId: string, requested: string) => {
      const key = characterId + ":" + requested;
      if (!choices.has(key))
        choices.set(
          key,
          resolveSpriteExpression(
            spriteFor(characterId),
            requested,
            variants,
            (currentStage[characterId]?.look?.target ?? "player") === "player" ? "front" : "side",
            random(index, characterId, requested),
          ),
        );
      return choices.get(key)!;
    };
    for (const cue of cues) {
      if (!cue.expression) continue;
      const expression = resolveExpression(cue.characterId, cue.expression);
      if (expression) cue.expression = expression;
      else delete cue.expression;
    }
  }
}
