import type { SceneView } from "../../../shared/contracts/village.js";
import { useLayoutEffect, useMemo, useRef } from "react";
import { beginSceneRequest, ownsSceneRequest, releaseSceneRequest } from "./request-lifetime.js";

type Completion = { roomId: string; submissionId: string } | null;
type Selection = {
  id: string | undefined;
  blank: SceneView | null;
  unfounded: boolean;
  ended: boolean;
  closed: boolean;
};
type EntryClaim = { token: object; completion: Completion; busy: boolean; handoffs: Selection[] };
function selectionOf(scene: SceneView | null, unfounded: boolean, ended: boolean): Selection {
  return { id: scene?.id, blank: scene?.id ? null : scene, unfounded, ended, closed: scene?.status === "closed" };
}
function sameSelection(a: Selection, b: Selection): boolean {
  return (
    a.id === b.id && a.blank === b.blank && a.unfounded === b.unfounded && a.ended === b.ended && a.closed === b.closed
  );
}

/** One entry may publish its placeholder and returned ID without adopting foreign selections. */
export function useSceneEntryLifetime(ports: {
  room: SceneView | null;
  isFounded: boolean | undefined;
  ended: boolean;
  inFlight: React.RefObject<boolean>;
  completion: React.RefObject<Completion>;
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { room, isFounded, ended, inFlight, completion, setBusy } = ports;
  const id = room?.id,
    blank = id ? null : room,
    closed = room?.status === "closed",
    unfounded = isFounded === false;
  const selection = useMemo(() => ({ id, blank, closed, unfounded, ended }), [id, blank, closed, unfounded, ended]);
  const selected = useRef(selection),
    active = useRef(true),
    pending = useRef<EntryClaim | null>(null);
  const lifetime = useMemo(
    () => ({
      retire() {
        const claim = pending.current;
        pending.current = null;
        if (!claim) return;
        claim.handoffs.length = 0;
        if (!releaseSceneRequest(inFlight, claim.token, completion.current === claim.completion)) return;
        if (active.current && claim.busy && completion.current === claim.completion) setBusy(false);
      },
      begin(candidate: Selection, zoneOnly: boolean): EntryClaim | null {
        if (
          !active.current ||
          selected.current !== candidate ||
          candidate.unfounded ||
          pending.current ||
          (zoneOnly && (!candidate.id || candidate.ended || candidate.closed))
        )
          return null;
        const token = beginSceneRequest(inFlight);
        if (!token) return null;
        const claim = { token, completion: completion.current, busy: false, handoffs: [] };
        pending.current = claim;
        return claim;
      },
      owns(claim: EntryClaim): boolean {
        return (
          active.current &&
          !selected.current.unfounded &&
          pending.current === claim &&
          ownsSceneRequest(inFlight, claim.token)
        );
      },
      handoff(claim: EntryClaim, scene: SceneView | null, nextEnded: boolean): boolean {
        if (!lifetime.owns(claim)) return false;
        const next = selectionOf(scene, selected.current.unfounded, nextEnded);
        const last = claim.handoffs.at(-1) ?? selected.current;
        if (!sameSelection(last, next)) claim.handoffs.push(next);
        return true;
      },
      finish(claim: EntryClaim): boolean {
        if (!lifetime.owns(claim)) return false;
        pending.current = null;
        claim.handoffs.length = 0;
        return releaseSceneRequest(inFlight, claim.token, true);
      },
    }),
    [inFlight, completion, setBusy],
  );
  useLayoutEffect(() => {
    const claim = pending.current;
    if (claim && !sameSelection(selected.current, selection)) {
      const acknowledged = claim.handoffs.findIndex((next) => sameSelection(next, selection));
      if (acknowledged < 0) lifetime.retire();
      else claim.handoffs.splice(0, acknowledged + 1);
    }
    selected.current = selection;
  }, [selection, lifetime]);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      lifetime.retire();
    };
  }, [lifetime]);
  return useMemo(
    () => ({
      begin: (zoneOnly = false) => lifetime.begin(selection, zoneOnly),
      owns: lifetime.owns,
      handoff: lifetime.handoff,
      finish: lifetime.finish,
    }),
    [lifetime, selection],
  );
}
