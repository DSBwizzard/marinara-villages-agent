import { useLayoutEffect, useMemo, useRef } from "react";

type SaveClaim = { owner: object; token: object; onRetire?: () => void };
const admissions = new WeakMap<object, object>();
function release(key: object, claim: SaveClaim): boolean {
  if (admissions.get(key) !== claim.token) return false;
  admissions.delete(key);
  return true;
}

/** A save owns its response and cleanup until reset, semantic selection or disposal retires it. */
export function useVillageMutationLifetime(
  isFounded: boolean | undefined,
  admissionKey?: object,
  selectionKey?: object,
) {
  const localKey = useRef<object>({});
  const key = admissionKey ?? localKey.current;
  const unfounded = isFounded === false;
  const selection = useMemo(() => ({ unfounded, selectionKey }), [unfounded, selectionKey]);
  const selected = useRef(selection);
  const active = useRef(true);
  const pending = useRef<SaveClaim | null>(null);
  const lifetime = useMemo(
    () => ({
      retire() {
        const claim = pending.current;
        pending.current = null;
        if (claim && release(key, claim) && active.current) claim.onRetire?.();
      },
      begin(candidate: object): SaveClaim | null {
        if (!active.current || selected.current !== candidate || pending.current || admissions.has(key)) return null;
        const token = {};
        const claim = { owner: candidate, token };
        admissions.set(key, token);
        pending.current = claim;
        return claim;
      },
      owns(claim: SaveClaim): boolean {
        return (
          active.current &&
          selected.current === claim.owner &&
          pending.current === claim &&
          admissions.get(key) === claim.token
        );
      },
      finish(claim: SaveClaim): boolean {
        if (!lifetime.owns(claim)) return false;
        pending.current = null;
        return release(key, claim);
      },
    }),
    [key],
  );
  useLayoutEffect(() => {
    lifetime.retire();
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
      begin: () => lifetime.begin(selection),
      owns: lifetime.owns,
      finish: lifetime.finish,
    }),
    [lifetime, selection],
  );
}
