import { useCallback, useState } from "react";

/** Always mounted by the application controller so navigation retains this feature state. */
export function useProjectsState() {
  const [focus, setFocus] = useState({ id: "", request: 0 });
  const setFocusedProjectId = useCallback((id: string) => {
    setFocus((previous) => ({ id, request: previous.request + 1 }));
  }, []);

  const [focusedRequestId, setFocusedRequestId] = useState("");

  const [placingProjectId, setPlacingProjectId] = useState("");

  const [siteProjectId, setSiteProjectId] = useState("");
  return {
    focusedProjectId: focus.id,
    projectFocusRequest: focus.request,
    setFocusedProjectId,
    focusedRequestId,
    setFocusedRequestId,
    placingProjectId,
    setPlacingProjectId,
    siteProjectId,
    setSiteProjectId,
  };
}

export type ProjectsState = ReturnType<typeof useProjectsState>;
