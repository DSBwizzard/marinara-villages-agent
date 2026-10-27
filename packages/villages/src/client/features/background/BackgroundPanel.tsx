import type { BackgroundWork } from "../../../shared/contracts/village.js";
import { messageFrom } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useState } from "react";

function waitingTime(timestamp: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(timestamp)) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)} hr`;
  const days = Math.floor(minutes / 1_440);
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function BackgroundWorkPanel({
  jobs,
  onRetry,
}: {
  jobs: BackgroundWork[];
  onRetry(job: BackgroundWork): Promise<void>;
}) {
  const [pending, setPending] = useState("");
  const [problem, setProblem] = useState("");
  const visible = jobs.filter((job) => job.kind !== "personal-mail" && job.status !== "obsolete");
  const active = visible.filter((job) => ["queued", "running"].includes(job.status));
  const paused = visible.filter((job) => job.status === "paused");
  const attention = visible.filter((job) => ["failed", "interrupted"].includes(job.status));
  const completed = visible.filter((job) => job.status === "completed");
  const renderJobs = (rows: BackgroundWork[]) =>
    rows.map((job) => (
      <div key={job.id} className={ELEMENT_TAG + "-background-job"}>
        <div className={ELEMENT_TAG + "-background-job-content"}>
          <strong>{job.kind === "resident-planning" ? "Resident activity" : job.label}</strong>
          <span className={ELEMENT_TAG + "-background-meta"}>
            {job.status} · {job.completedSteps} steps · {job.requests} requests ·{" "}
            {job.tokens === null ? "tokens unavailable" : job.tokens + " tokens"}
          </span>
          {["failed", "interrupted"].includes(job.status) ? (
            <p className={ELEMENT_TAG + "-hint"}>
              {job.failure ? job.failure.cause.replaceAll("_", " ") + " · " + job.failure.stage + " · " : ""}
              {Number.isFinite(Date.parse(job.failedAt ?? job.updatedAt ?? ""))
                ? "Waiting for retry · " + waitingTime(job.failedAt ?? job.updatedAt!)
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
      <style>{`
        .${ELEMENT_TAG}-background-summary { display:flex; flex-wrap:wrap; gap:.4rem 1rem; align-items:baseline; cursor:pointer; }
        .${ELEMENT_TAG}-background-counts, .${ELEMENT_TAG}-background-meta { color:var(--muted-foreground); font-size:.88rem; }
        .${ELEMENT_TAG}-background-group { display:grid; gap:.5rem; margin-top:1rem; }
        .${ELEMENT_TAG}-background-group h3 { margin:0; font-size:1rem; }
        .${ELEMENT_TAG}-background-job { border:1px solid var(--border); padding:.75rem; min-width:0; }
        .${ELEMENT_TAG}-background-job-content { display:grid; gap:.3rem; min-width:0; overflow-wrap:anywhere; }
        .${ELEMENT_TAG}-background-job-content p { margin:0; }
        .${ELEMENT_TAG}-background-job-content button { justify-self:start; }
      `}</style>
      <summary className={ELEMENT_TAG + "-background-summary"}>
        <strong>Background work</strong>
        <span className={ELEMENT_TAG + "-background-counts"}>
          {active.length} active · {paused.length} paused · {attention.length} need attention
        </span>
      </summary>
      {active.length ? (
        <section className={ELEMENT_TAG + "-background-group"}>
          <h3>Active ({active.length})</h3>
          {renderJobs(active)}
        </section>
      ) : null}
      {paused.length ? (
        <section className={ELEMENT_TAG + "-background-group"}>
          <h3>Paused ({paused.length})</h3>
          {renderJobs(paused)}
        </section>
      ) : null}
      {attention.length ? (
        <section className={ELEMENT_TAG + "-background-group"}>
          <h3>Needs attention ({attention.length})</h3>
          {renderJobs(attention)}
        </section>
      ) : null}
      {completed.length ? (
        <details className={ELEMENT_TAG + "-background-group"}>
          <summary>Completed ({completed.length})</summary>
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
