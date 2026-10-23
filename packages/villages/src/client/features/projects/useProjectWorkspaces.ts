import { useLayoutEffect, useRef, useState } from "react";
import type { VillageVenue, VillageZoneDraft } from "../../../shared/contracts/village.js";
export type ProjectWorkspace = {
  venue: VillageVenue | null;
  zones: VillageZoneDraft[];
  title: string;
  detail: string;
  capacity: number;
  dirty: boolean;
  busy: boolean;
  error: string;
};
export function useProjectWorkspaces(
  key: string,
  initial: Omit<ProjectWorkspace, "busy" | "error" | "dirty">,
  seed: string,
) {
  const [drafts, setDrafts] = useState<Record<string, ProjectWorkspace>>({});
  const claims = useRef(new Map<string, object>()),
    requests = useRef(new Map<string, string>());
  const lifetime = useRef(true),
    lastSeed = useRef(seed);
  useLayoutEffect(() => {
    lifetime.current = true;
    return () => {
      lifetime.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    if (lastSeed.current !== seed) {
      lastSeed.current = seed;
      claims.current.clear();
      requests.current.clear();
      setDrafts({});
    }
  }, [seed]);
  const field =
    <K extends keyof ProjectWorkspace>(name: K) =>
    (value: React.SetStateAction<ProjectWorkspace[K]>) => {
      if (!lifetime.current || lastSeed.current !== seed) return;
      setDrafts((current) => {
        const old = current[key] ?? { ...initial, busy: false, error: "", dirty: false };
        return {
          ...current,
          [key]: {
            ...old,
            ...(name !== "busy" && name !== "error" && name !== "dirty" ? { dirty: true } : {}),
            [name]:
              typeof value === "function"
                ? (value as (old: ProjectWorkspace[K]) => ProjectWorkspace[K])(old[name])
                : value,
          },
        };
      });
    };
  const begin = () => {
    if (!lifetime.current || claims.current.has(key)) return null;
    const token = {};
    claims.current.set(key, token);
    field("busy")(true);
    field("error")("");
    const current = () => lifetime.current && lastSeed.current === seed && claims.current.get(key) === token;
    return {
      current,
      finish: () => {
        if (current()) {
          claims.current.delete(key);
          field("busy")(false);
        }
      },
    };
  };
  return { key, draft: drafts[key] ?? { ...initial, busy: false, error: "", dirty: false }, field, begin, requests };
}
