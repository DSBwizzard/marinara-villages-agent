import type { BackgroundWork } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { VillagesBurstPreview } from "../settings/villages-burst-preview.js";
import { useState } from "react";

export function BackgroundWorkPanel({
  jobs,
  onRetry,
}: {
  jobs: BackgroundWork[];
  onRetry(job: BackgroundWork): Promise<void>;
}) {
  const [pending, setPending] = useState("");
  const [problem, setProblem] = useState("");
  const visible = jobs.filter((job) => job.status !== "obsolete");
  const active = visible.filter((job) => ["queued", "running"].includes(job.status));
  const paused = visible.filter((job) => job.status === "paused");
  const attention = visible.filter((job) => ["failed", "interrupted"].includes(job.status));
  const completed = visible.filter((job) => job.status === "completed");
  const renderJobs = (rows: BackgroundWork[]) =>
    rows.map((job) => (
      <div key={job.id} className={ELEMENT_TAG + "-notice-row"}>
        <div className={ELEMENT_TAG + "-field"}>
          <strong>{job.label}</strong>
          <span>
            {job.status}: {job.completedSteps} reusable steps, {job.requests} requests,{" "}
            {job.tokens === null ? "token usage unavailable" : job.tokens + " reported tokens"}
          </span>
          {["failed", "interrupted"].includes(job.status) ? (
            <p className={ELEMENT_TAG + "-hint"}>
              {job.failure ? job.failure.cause.replaceAll("_", " ") + " · " + job.failure.stage + " · " : ""}
              {Number.isFinite(Date.parse(job.failedAt ?? job.updatedAt ?? ""))
                ? "Waiting for retry · " +
                  Math.max(0, Math.floor((Date.now() - Date.parse(job.failedAt ?? job.updatedAt!)) / 60000)) +
                  " minutes"
                : "Waiting for explicit retry"}
            </p>
          ) : null}
          {job.error ? <p className={ELEMENT_TAG + "-status"}>{job.error}</p> : null}
          {job.connectionPaused ? (
            <p className={ELEMENT_TAG + "-status"}>
              Automatic work on this connection is paused. A successful retry resumes it.
            </p>
          ) : null}
          {["failed", "interrupted", "paused"].includes(job.status) ? (
            <>
              <VillagesBurstPreview request={request} action="retry" args={{ jobId: job.id }} />
              <button
                type="button"
                className={ELEMENT_TAG + "-button"}
                disabled={!!pending}
                onClick={() => {
                  setPending(job.id);
                  setProblem("");
                  void onRetry(job)
                    .catch((cause) => setProblem(messageFrom(cause, "Could not retry background work.")))
                    .finally(() => setPending(""));
                }}
              >
                {pending === job.id ? "Queuing..." : job.status === "paused" ? "Run now" : "Retry unfinished work"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    ));
  if (!visible.length) return null;
  return (
    <details
      className={ELEMENT_TAG + "-panel"}
      open={visible.some((job) => ["failed", "interrupted"].includes(job.status))}
    >
      <summary>
        Background work: {active.length} running / queued, {paused.length} paused, {attention.length} need attention
      </summary>
      <p className={ELEMENT_TAG + "-hint"}>
        Recurring updates run while Villages is visible. Requested work can finish while away.
      </p>
      {active.length ? (
        <section>
          <h3>Running / queued ({active.length})</h3>
          {renderJobs(active)}
        </section>
      ) : null}
      {paused.length ? (
        <section>
          <h3>Paused ({paused.length})</h3>
          {renderJobs(paused)}
        </section>
      ) : null}
      {attention.length ? (
        <section>
          <h3>Needs attention ({attention.length})</h3>
          {renderJobs(attention)}
        </section>
      ) : null}
      {completed.length ? (
        <details>
          <summary>Completed history ({completed.length})</summary>
          {renderJobs(completed)}
        </details>
      ) : null}
      {problem ? (
        <p role="alert" className={ELEMENT_TAG + "-error"}>
          {problem}
        </p>
      ) : null}
    </details>
  );
}
