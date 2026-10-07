import { useLayoutEffect, useMemo, useRef } from "react";

type Completion = { roomId: string; submissionId: string } | null;
type RequestClaim = { owner: object; submission: string | null; completion: Completion; busy: boolean };

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
        if (!claim || completion.current !== claim.completion) return;
        inFlight.current = false;
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
        const claim = {
          owner: owner.current,
          submission: submission.current,
          completion: completion.current,
          busy: false,
        };
        pending.current = claim;
        inFlight.current = true;
        return claim;
      },
      owns(claim: RequestClaim): boolean {
        return active.current && enabled.current && owner.current === claim.owner && pending.current === claim;
      },
      finish(claim: RequestClaim): boolean {
        if (!lifetime.owns(claim)) return false;
        pending.current = null;
        inFlight.current = false;
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
