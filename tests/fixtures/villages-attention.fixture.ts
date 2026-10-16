import { normalizeSceneJson } from "../../packages/villages/src/server/domain/rules/scene-json-syntax.js";
/** Existing non-attention scenarios explicitly nominate their ordinary local inputs. */
export function fixtureLocalAttention(messages: { content?: string }[]) {
  if (!messages[0]?.content?.startsWith("Interpret nearby attention")) return undefined;
  const input = JSON.parse(messages[1]!.content!);
  return {
    content: JSON.stringify({
      results: input.checks.map((check: { id: string }) => ({
        id: check.id,
        outcome: "local",
        evidenceIds: ["player-input"],
        reason: "This fixture exercises local conversation.",
      })),
    }),
    finishReason: "stop",
  };
}

/** Explicit synthetic hearing for consumer fixtures, never a real-provider fallback. */
export function fixtureAcousticReply(messages: { content?: string }[], result: any, records: Map<string, any>) {
  const system = messages[0]?.content ?? "";
  if (!system.includes("ACTION-BASED SOUND")) return result;
  const scene = [...records.values()].find(
    (row) => row.id?.startsWith("villages-venue-visit-") && row.data?.status === "active",
  )?.data;
  const graph = JSON.parse(system.match(/Connections: ([^\n]+)/)![1]) as { id: string; connectedTo: string[] }[];
  const fragments = JSON.parse(system.match(/Fragments: ([^\n]+)/)![1]);
  const ids = (scene.sceneAttendance?.occupants ?? []).map((row: any) => row.characterId);
  const position = (id: string, index = -1) =>
    result.contactMoves?.find((move: any) => move.characterId === id && move.segment <= index)?.zoneId ??
    scene.accompanying?.find((row: any) => row.characterId === id)?.zoneId ??
    scene.sceneAttendance?.occupants.find((row: any) => row.characterId === id)?.zoneId;
  const origin = scene.zoneId ?? "exterior";
  result.attentionWitnesses = fragments.map((fragment: any) => ({
    id: fragment.id,
    emitted: true,
    heardBy: [...new Set([...ids.filter((id: string) => position(id) === origin), ...fragment.possibleListeners])],
    understoodBy:
      fragment.kind === "sound"
        ? []
        : [...new Set([...ids.filter((id: string) => position(id) === origin), ...fragment.possibleWordListeners])],
    ...(fragment.kind === "sound" ? { segment: 0 } : {}),
  }));
  result.acousticReplies = (result.segments ?? result.lines ?? []).flatMap((line: any, index: number) => {
    if (line.kind ? line.kind !== "dialogue" : !line.speakerId || line.speakerId === "__venue_scene__") return [];
    const from = position(line.speakerId, index);
    const near = graph
      .filter(
        (row) =>
          row.id === from ||
          row.connectedTo.includes(from) ||
          graph.find((other) => other.id === from)?.connectedTo.includes(row.id),
      )
      .map((row) => row.id);
    const heard = ids.filter((id: string) => near.includes(position(id, index)));
    const player = near.includes(origin);
    return [
      {
        segment: index,
        delivery: "call",
        outward: true,
        heardBy: heard,
        understoodBy: heard,
        playerHeard: player,
        playerUnderstood: player,
      },
    ];
  });
  return result;
}

export function fixtureAcousticContent(messages: { content?: string }[], content: string, records: Map<string, any>) {
  if (!messages[0]?.content?.includes("ACTION-BASED SOUND")) return content;
  try {
    const start = content.indexOf("{"),
      end = content.lastIndexOf("}");
    const raw = JSON.parse(normalizeSceneJson(content.slice(start, end + 1)));
    const decorated = fixtureAcousticReply(messages, raw, records);
    const fields = JSON.stringify({
      attentionWitnesses: decorated.attentionWitnesses,
      acousticReplies: decorated.acousticReplies,
    }).slice(1, -1);
    return (
      content.slice(0, end) + (content.slice(0, end).trimEnd().endsWith(",") ? "" : ",") + fields + content.slice(end)
    );
  } catch {
    return content;
  }
}

export function fixtureAcousticModel<T extends { chatComplete(messages: any[], options?: any): Promise<any> }>(
  model: T,
  records: Map<string, any>,
): T {
  return {
    ...model,
    async chatComplete(messages: any[], options?: any) {
      const result = await model.chatComplete(messages, options);
      return { ...result, content: fixtureAcousticContent(messages, result.content, records) };
    },
  };
}
