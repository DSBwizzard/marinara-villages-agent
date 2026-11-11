import type { ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { VillageState } from "../models/world.js";
import { actorContinuityEvidence, continuityHolderKey, continuitySourceUnit } from "./continuity.js";
import { continuityActor } from "./continuity-actors.js";
import { episodeUnit } from "../decoding/episode-codec.js";
import { episodeContextActors, episodeContextRooms } from "./episode-sources.js";
import { actorEpisodeView, recallEpisodeSpeech, recallEpisodeMail, type selectEpisodeHistory } from "./episodes.js";
type Actor = Extract<ContinuityHolder, { kind: "actor" }>;

/** Scene and correspondence prompts share exact perception and inherited private-context provenance. */
export function projectEpisodeRecall(
  state: VillageState,
  episode: AcceptedEpisode,
  view: ReturnType<typeof selectEpisodeHistory>["episodes"][number],
  holders: Actor[],
  actors: Actor[],
  contextScopes: Map<string, string>,
  sourceAlias: () => string,
) {
  const part = {
    sources: {} as Record<string, ContinuityEvidence>,
    provenance: {} as Record<string, string[]>,
    episodeIds: [episode.id],
  };
  const aliases: { ref: string; holder: string; evidence: ContinuityEvidence }[] = [];
  for (const holder of holders) {
    const own = actorEpisodeView(episode, state.continuity, holder, state.episodes);
    if (!own) continue;
    const eligible = episode.grounding.flatMap((source) => {
      try {
        const projected = actorContinuityEvidence(source, holder.id);
        return own.input.some((row) => row.id === source.id) ||
          (source.kind === "written" &&
            own.letters.some((row) => row.id === source.unitId && row.text === projected.excerpt)) ||
          own.segments.some(
            (row) =>
              row.id === source.unitId &&
              row.text === projected.excerpt &&
              row.channel === projected.perceptions[0]?.channel,
          )
          ? [projected]
          : [];
      } catch {
        return [];
      }
    });
    for (const segment of own.segments)
      if (!eligible.some((source) => source.unitId === segment.id)) {
        const source = recallEpisodeSpeech(episode, segment.id, state.continuity, holder, state.episodes);
        if (source) eligible.push(source);
      }
    for (const letter of own.letters)
      if (!eligible.some((source) => source.unitId === letter.id)) {
        const source = recallEpisodeMail(episode, letter.id, state.continuity, holder, state.episodes);
        if (source) eligible.push(source);
      }
    const key = continuityHolderKey(holder);
    part.provenance[key] = [
      ...new Set([
        ...eligible.map(continuitySourceUnit),
        ...own.segments
          .filter(
            (row) =>
              row.channel !== "sound-only" &&
              episode.segments.some((line) => line.id === row.id && line.content === row.text),
          )
          .map((row) => episodeUnit(episode, row.id)),
      ]),
    ];
    for (const source of eligible) {
      const ref = sourceAlias();
      part.sources[ref] = source;
      aliases.push({ ref, holder: holder.id, evidence: source });
    }
  }
  const segments = view.segments.flatMap((line) => {
    if (!("gmOnlyText" in line)) return [line];
    const scopes = [...episode.actors, ...episodeContextActors(episode)].filter(
      (holder) => episode.holderDependencies?.[continuityHolderKey({ kind: "actor", ...holder })]?.[line.id]?.length,
    );
    if (
      scopes.some((holder) => {
        const incarnation = contextScopes.get(holder.id) ?? continuityActor(state, holder.id)?.incarnation;
        return incarnation && incarnation !== holder.incarnation;
      })
    ) {
      const perceived = { ...line };
      delete perceived.gmOnlyText;
      return line.projections.length ? [perceived] : [];
    }
    for (const holder of scopes) {
      contextScopes.set(holder.id, holder.incarnation);
      const key = continuityHolderKey({ kind: "actor", ...holder });
      (part.provenance[key] ??= []).push(episodeUnit(episode, line.id));
    }
    return [line];
  });
  const gmUnits = [
    ...("text" in view.gmPrivateInput && view.gmPrivateInput.text.length > 0 ? [episodeUnit(episode, "input")] : []),
    ...segments.filter((row) => "gmOnlyText" in row).map((row) => episodeUnit(episode, row.id)),
  ];
  for (const holder of [...(episode.room ? [episode.room] : []), ...episodeContextRooms(episode)]) {
    const key = continuityHolderKey(holder),
      units = [...segments.map((line) => line.id), ...(view.letters ?? []).map((letter) => letter.id)].filter(
        (unit) => episode.holderDependencies?.[key]?.[unit]?.length,
      );
    if (units.length)
      part.provenance[key] = [
        ...new Set([...(part.provenance[key] ?? []), ...units.map((unit) => episodeUnit(episode, unit))]),
      ];
  }
  for (const holder of holders.filter((holder) =>
    actors.some((actor) => continuityHolderKey(actor) === continuityHolderKey(holder)),
  )) {
    const key = continuityHolderKey(holder);
    part.provenance[key] = [...new Set([...(part.provenance[key] ?? []), ...gmUnits])];
  }
  const sourceRefs = (holder: string, unit: string, text: string) =>
    aliases
      .filter((row) => row.holder === holder && row.evidence.unitId === unit && row.evidence.excerpt === text)
      .map(({ ref, evidence }) => ({ ref, ...(evidence.act ? { act: evidence.act } : {}) }));
  const named = new Set([
    ...segments.map((line) => line.speakerId),
    ...(view.letters ?? []).flatMap((letter) => [letter.fromId, letter.toId]),
    ...aliases.flatMap((alias) => (alias.evidence.actorId ? [alias.evidence.actorId] : [])),
  ]);
  const formerActors = episode.actors
    .filter((actor) => named.has(actor.id) && continuityActor(state, actor.id)?.incarnation !== actor.incarnation)
    .map((actor) => actor.id);
  const interaction = {
    ...view,
    ...(formerActors.length ? { formerActors } : {}),
    ...(view.letters
      ? {
          letters: view.letters.map((letter) => ({
            ...letter,
            knownBy: Object.fromEntries(
              letter.knownBy.map((id) => [id, { source: sourceRefs(id, letter.id, letter.text) }]),
            ),
          })),
        }
      : {}),
    groundedInput: view.groundedInput.map((row) => ({
      ...row,
      source: aliases
        .filter((alias) => alias.holder === row.for && alias.evidence.id === row.id)
        .map((alias) => alias.ref),
    })),
    segments: segments.map((row) => ({
      ...row,
      perceivedBy: Object.fromEntries(
        Object.entries(row.perceivedBy).map(([id, channel]) => [
          id,
          { channel, source: sourceRefs(id, row.id, "text" in row ? row.text : "") },
        ]),
      ),
      projections: row.projections.map((projection) => ({
        ...projection,
        source: sourceRefs(projection.for, row.id, projection.text),
      })),
    })),
  };
  return { ...part, interaction };
}

/** Shorten the on-wire projection while leaving immutable line IDs in the readset. */
export function compactSceneExchange(
  {
    id,
    at,
    gmPrivateInput,
    formerActors,
    groundedInput,
    letters,
    segments,
  }: ReturnType<typeof projectEpisodeRecall>["interaction"],
  sources: Record<string, ContinuityEvidence>,
) {
  const visible: Record<string, ContinuityEvidence> = {};
  const citation = (ref: string) => {
    const source = sources[ref];
    visible[ref] = source;
    return source.act ? [ref, source.act] : ref;
  };
  const exchange = {
    id,
    at,
    ...("text" in gmPrivateInput ? { gmPrivateInput: gmPrivateInput.text } : { inputWithheld: true }),
    ...(formerActors?.length ? { formerActors } : {}),
    ...(groundedInput.length
      ? {
          groundedInput: groundedInput.map(({ id: _id, source, ...row }) => ({
            ...row,
            source: source.map(citation),
          })),
        }
      : {}),
    ...(letters?.length
      ? {
          letters: letters.map(({ id: _id, knownBy, ...row }) => ({
            ...row,
            readBy: Object.entries<{ source: { ref: string }[] }>(knownBy).map(([actor, { source }]) => [
              actor,
              ...(source.length ? [source.map(({ ref }) => citation(ref))] : []),
            ]),
          })),
        }
      : {}),
    segments: segments.map(({ id: _id, perceivedBy, projections, ...line }) => {
      const audiences = Object.entries(perceivedBy);
      return {
        ...line,
        ...(audiences.length
          ? {
              perceivedBy: audiences.map(([actor, { channel, source }]) => [
                actor,
                channel,
                ...(source.length ? [source.map(({ ref }) => citation(ref))] : []),
              ]),
            }
          : {}),
        ...(projections.length
          ? {
              projections: projections.map(({ source, ...row }) => ({
                ...row,
                source: source.map(({ ref }) => citation(ref)),
              })),
            }
          : {}),
      };
    }),
  };
  return { exchange, sources: visible };
}
