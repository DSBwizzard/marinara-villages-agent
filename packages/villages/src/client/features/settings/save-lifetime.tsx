import { useLayoutEffect, useMemo, useRef } from "react";

type SaveClaim = { owner: object };

/** A save owns its response and cleanup until reset or disposal retires it. */
export function useSettingsSaveLifetime(isFounded: boolean | undefined) {
  const owner = useRef<object>({});
  const active = useRef(true);
  const pending = useRef<SaveClaim | null>(null);
  useLayoutEffect(() => {
    if (isFounded === false) owner.current = {};
  }, [isFounded]);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      owner.current = {};
    };
  }, []);
  return useMemo(
    () => ({
      begin(): SaveClaim | null {
        if (!active.current || pending.current?.owner === owner.current) return null;
        const claim = { owner: owner.current };
        pending.current = claim;
        return claim;
      },
      owns(claim: SaveClaim): boolean {
        return active.current && owner.current === claim.owner && pending.current === claim;
      },
      finish(claim: SaveClaim): boolean {
        if (pending.current !== claim) return false;
        pending.current = null;
        return active.current && owner.current === claim.owner;
      },
    }),
    [],
  );
}
