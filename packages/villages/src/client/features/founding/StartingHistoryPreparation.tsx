import { useEffect, useRef, useState } from "react";
import type { RelationshipInspectView } from "../../../shared/contracts/relationships.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { useVillageActivity } from "../../shared/activity.js";
import { request } from "../../shared/api.js";
import { HistoryClarifications } from "../../shared/HistoryClarifications.js";
import { createVillagesClientId } from "../../shared/request-id.js";
export function StartingHistoryPreparation({
  ready,
  work,
  onChange,
  retryMissing,
}: {
  ready: boolean;
  work: VillageSnapshot["backgroundWork"][number] | undefined;
  onChange: () => Promise<void>;
  retryMissing?: () => Promise<void>;
}) {
  const { visible, backgroundRevision } = useVillageActivity();
  const [inspect, setInspect] = useState(false);
  const [view, setView] = useState<RelationshipInspectView | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const retryActions = useRef<Record<string, string>>({});
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!inspect || !visible) return;
    const controller = new AbortController();
    void request<RelationshipInspectView>("/relationships/inspect", { signal: controller.signal })
      .then((next) => {
        if (!controller.signal.aborted) {
          setView(next);
          setError("");
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : "Starting history could not be read.");
      });
    return () => controller.abort();
  }, [inspect, visible, backgroundRevision, work?.status, work?.attempt, refresh]);
  const active = work && ["queued", "running"].includes(work.status);
  const missing = !work || ["completed", "obsolete"].includes(work.status);
  return (
    <section aria-label="Starting history">
      <div className="villages-founding-progress-row">
        <h2>Starting history</h2>
        <p className="villages-founding-task-state" data-status={ready ? "Ready" : active ? "Preparing" : undefined}>
          {ready ? "Ready" : active ? "Preparing" : "Needs review"}
        </p>
      </div>
      {!ready && work?.error ? <p role="alert">{work.error}</p> : null}
      {!ready && missing && retryMissing && !view?.conflicts.length ? (
        <button type="button" onClick={() => void retryMissing()}>
          Retry starting history
        </button>
      ) : null}
      {!ready && work && ["failed", "interrupted", "paused"].includes(work.status) ? (
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            const key = work.instanceId + ":" + work.attempt;
            retryActions.current[key] ??= createVillagesClientId();
            setSaving(true);
            setError("");
            try {
              await request("/background/retry", {
                method: "POST",
                body: JSON.stringify({
                  id: work.id,
                  expectedAttempt: work.attempt,
                  expectedInstanceId: work.instanceId,
                  actionId: retryActions.current[key],
                }),
              });
              delete retryActions.current[key];
              setRefresh((value) => value + 1);
              await onChange();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Starting history could not be retried.");
            } finally {
              setSaving(false);
            }
          }}
        >
          Retry starting history
        </button>
      ) : null}
      {!ready ? (
        <details onToggle={(event) => setInspect(event.currentTarget.open)}>
          <summary>Inspect starting history</summary>
          {view ? (
            <>
              <HistoryClarifications
                conflicts={view.conflicts}
                disabled={!!active}
                onSubmit={async (conflict, text) => {
                  setView(
                    await request<RelationshipInspectView>("/relationships/clarifications", {
                      method: "POST",
                      body: JSON.stringify({ sourceHash: conflict.sourceHash, actorIds: conflict.actorIds, text }),
                    }),
                  );
                  await onChange();
                }}
              />
              {!view.conflicts.length && !active && !ready ? <p>Starting history has not completed.</p> : null}
            </>
          ) : (
            <p role="status">Reading starting history…</p>
          )}
        </details>
      ) : null}
      {error && !ready ? <p role="alert">{error}</p> : null}
    </section>
  );
}
