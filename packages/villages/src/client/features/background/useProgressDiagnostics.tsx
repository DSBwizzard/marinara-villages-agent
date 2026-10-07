import type { ProgressDebugView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { useCallback, useState } from "react";

/** Always mounted by the shell so diagnostics remain available between menu visits. */
export function useProgressDiagnostics(ports: { setError: React.Dispatch<React.SetStateAction<string>> }) {
  const { setError } = ports;
  const [progressDebug, setProgressDebug] = useState<ProgressDebugView | null>(null);
  const loadProgressDebug = useCallback(() => request<ProgressDebugView>("/progress/debug").then(setProgressDebug), []);
  const openProgressDebug = useCallback(
    () =>
      loadProgressDebug().catch((cause) => {
        setProgressDebug(null);
        setError(messageFrom(cause, "Progress diagnostics are unavailable."));
      }),
    [loadProgressDebug, setError],
  );
  return { progressDebug, loadProgressDebug, openProgressDebug };
}
