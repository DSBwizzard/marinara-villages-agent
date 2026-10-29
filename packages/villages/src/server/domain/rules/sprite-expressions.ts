import type { StagingLine, StagingState } from "../../../shared/helpers/scene-staging.js";
import type { VillageResidentSprite } from "../models/world.js";

type SpriteEntry = VillageResidentSprite["expressions"][number];

/** Engine convention: two or more suffixed names share the prefix before the first underscore.
 * Names have already had the structural full_ prefix and file extension removed by the media owner.
 * Mirrors Engine sprite.service / expression-agent-utils; no private Engine imports. */
function expressionChoices(sprite: VillageResidentSprite | null | undefined, variants: boolean) {
  const entries = [...new Map((sprite?.expressions ?? []).map((entry) => [entry.expressionId, entry])).values()];
  const name = (entry: SpriteEntry) => (entry.spriteName ?? entry.name).trim().toLowerCase();
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

export function describeSpriteExpressions(sprite: VillageResidentSprite | null | undefined, variants = false): string {
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
          useWhen: [...new Set(members.map((entry) => entry.useWhen).filter(Boolean))].join("; "),
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
  sprite: VillageResidentSprite | null | undefined,
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
  sprite: VillageResidentSprite | null | undefined,
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
  lines: StagingLine[],
  currentStage: StagingState,
  spriteFor: (characterId: string) => VillageResidentSprite | null | undefined,
  variants: boolean,
  random: () => number,
) {
  for (const line of lines) {
    const cues = line.staging ?? [];
    for (const cue of cues)
      if (cue.look && currentStage[cue.characterId]) currentStage[cue.characterId].look = cue.look;
    if (
      line.gazeAt &&
      currentStage[line.speakerId] &&
      !cues.some((cue) => cue.characterId === line.speakerId && cue.look)
    ) {
      currentStage[line.speakerId].look =
        line.gazeAt === "player" ? { target: "player" } : { target: "villager", characterId: line.gazeAt };
    }
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
            (currentStage[characterId]?.look.target ?? "player") === "player" ? "front" : "side",
            random(),
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
    if (!line.expression) continue;
    const expression = resolveExpression(line.speakerId, line.expression);
    if (expression) line.expression = expression;
    else delete line.expression;
  }
}
