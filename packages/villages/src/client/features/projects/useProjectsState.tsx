import { useState } from "react";

/** Always mounted by the application controller so navigation retains this feature state. */
export function useProjectsState() {
  const [focusedProjectId, setFocusedProjectId] = useState("");

  const [focusedRequestId, setFocusedRequestId] = useState("");

  const [placingProjectId, setPlacingProjectId] = useState("");

  const [siteProjectId, setSiteProjectId] = useState("");
  return {
    focusedProjectId,
    setFocusedProjectId,
    focusedRequestId,
    setFocusedRequestId,
    placingProjectId,
    setPlacingProjectId,
    siteProjectId,
    setSiteProjectId,
  };
}
