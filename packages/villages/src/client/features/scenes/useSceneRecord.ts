import type { SceneView } from "../../../shared/contracts/village.js";
import { type SetStateAction, useReducer } from "react";

/** Keep the newest server revision when a delayed read arrives for this Scene. */
export function useSceneRecord() {
  return useReducer((current: SceneView | null, next: SetStateAction<SceneView | null>) => {
    const candidate = typeof next === "function" ? next(current) : next;
    if (current?.id && current.id === candidate?.id && (current.sceneRevision ?? 0) > (candidate.sceneRevision ?? 0))
      return current;
    return candidate;
  }, null);
}
