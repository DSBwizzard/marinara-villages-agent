import { useLayoutEffect, useMemo, useRef } from "react";

type Completion = { roomId: string; submissionId: string } | null;
type RequestClaim = { owner: object; submission: string | null; completion: Completion; busy: boolean };

/** Admission identity only; each mounted Scene owns its existing in-flight ref. */
const admissions = new WeakMap<React.RefObject<boolean>, object>();
export function beginSceneRequest(inFlight: React.RefObject<boolean>): object | null {
  if (inFlight.current || admissions.has(inFlight)) return null;
  const token = {};
  admissions.set(inFlight, token);
  inFlight.current = true;
  return token;
}
export function ownsSceneRequest(inFlight: React.RefObject<boolean>, token: object): boolean {
  return admissions.get(inFlight) === token;
}
export function releaseSceneRequest(inFlight: React.RefObject<boolean>, token: object, clearFlag: boolean): boolean {
  if (!ownsSceneRequest(inFlight, token)) return false;
  admissions.delete(inFlight);
  if (clearFlag) inFlight.current = false;
  return true;
}

/** One request owns its continuation and cleanup while its selected Scene remains current. */
export function useSceneRequestLifetime(ports: {
  sceneId: string | undefined;
  isFounded: boolean | undefined;
  ended: boolean;
  allowEnded?: boolean;
  selectionIdentity?: object;
  inFlight: React.RefObject<boolean>;
  submission: React.RefObject<string | null>;
  completion: React.RefObject<Completion>;
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  clearCompletionOnRetire?: boolean;
}) {
  const {
    sceneId,
    isFounded,
    ended,
    allowEnded = false,
    selectionIdentity,
    inFlight,
    submission,
    completion,
    setBusy,
    clearCompletionOnRetire = true,
  } = ports;
  const unfounded = isFounded === false;
  const selection = useMemo(
    () => ({ sceneId, unfounded, ended, selectionIdentity }),
    [sceneId, unfounded, ended, selectionIdentity],
  );
  const owner = useRef<object>({}),
    selected = useRef(sceneId),
    enabled = useRef(false),
    active = useRef(true),
    pending = useRef<RequestClaim | null>(null);
  const lifetime = useMemo(
    () => ({
      retire() {
        const claim = pending.current;
        owner.current = {};
        pending.current = null;
        if (!claim || !releaseSceneRequest(inFlight, claim.owner, completion.current === claim.completion)) return;
        if (completion.current !== claim.completion) return;
        if (submission.current === claim.submission) submission.current = null;
        if (clearCompletionOnRetire) completion.current = null;
        if (active.current && claim.busy) setBusy(false);
      },
      begin(id: string, candidate: object): RequestClaim | null {
        if (
          !active.current ||
          !enabled.current ||
          selected.current !== id ||
          owner.current !== candidate ||
          pending.current ||
          inFlight.current
        )
          return null;
        const admission = beginSceneRequest(inFlight);
        if (!admission) return null;
        const claim = {
          owner: admission,
          submission: submission.current,
          completion: completion.current,
          busy: false,
        };
        pending.current = claim;
        return claim;
      },
      owns(claim: RequestClaim): boolean {
        return (
          active.current && enabled.current && pending.current === claim && ownsSceneRequest(inFlight, claim.owner)
        );
      },
      finish(claim: RequestClaim): boolean {
        if (!lifetime.owns(claim)) return false;
        pending.current = null;
        releaseSceneRequest(inFlight, claim.owner, true);
        return true;
      },
    }),
    [inFlight, submission, completion, setBusy, clearCompletionOnRetire],
  );
  useLayoutEffect(() => {
    lifetime.retire();
    owner.current = selection;
    selected.current = sceneId;
    enabled.current = !!sceneId && !unfounded && (!ended || allowEnded);
  }, [sceneId, unfounded, ended, allowEnded, lifetime, selection]);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      enabled.current = false;
      lifetime.retire();
    };
  }, [lifetime]);
  return useMemo(
    () => ({
      isCurrent: (id: string) =>
        active.current && !selection.unfounded && selected.current === id && owner.current === selection,
      begin: (id: string) => lifetime.begin(id, selection),
      owns: lifetime.owns,
      finish: lifetime.finish,
    }),
    [lifetime, selection],
  );
}
