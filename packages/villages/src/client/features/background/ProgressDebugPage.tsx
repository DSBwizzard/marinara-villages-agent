import type { ProgressDebugView } from "../../../shared/contracts/village.js";
import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { MenuScreenController } from "../settings/screen-contracts.js";

export function renderProgressDebugPage(
  ports: Pick<MenuScreenController, "error" | "progressDebug" | "setProgressDebug">,
) {
  const { error, progressDebug, setProgressDebug } = ports;
  return (
    <div className={`${ELEMENT_TAG}-panel`}>
      <h2>DEBUG: Progress</h2>
      <p>Engine version: {progressDebug?.engineVersion ?? "loading"}</p>
      <button
        type="button"
        className={`${ELEMENT_TAG}-button`}
        onClick={() => void request<ProgressDebugView>("/progress/debug").then(setProgressDebug)}
      >
        Refresh diagnostics
      </button>
      {progressDebug?.backlog.length ? (
        <section>
          <h3>Unprocessed saved turns</h3>
          {progressDebug.backlog.map((turn) => (
            <p key={`${turn.sessionId}:${turn.submissionId}`}>
              {turn.at} · {turn.sessionId}/{turn.submissionId} {turn.error ? `· ${turn.error}` : "· awaiting replay"}
            </p>
          ))}
        </section>
      ) : (
        <p>No saved turns await replay.</p>
      )}
      {progressDebug?.speechProofs?.length ? (
        <section>
          <h3>Captured Project speech</h3>
          {progressDebug.speechProofs.map((proof) => (
            <p key={`${proof.projectId}:${proof.lineId}`}>
              {proof.projectId} · {proof.grade ?? "typed"} · {proof.lineId}: “{proof.quote}”
              {proof.citations?.map((citation, index) => (
                <span key={`${citation.lineId}:${index}`}>
                  {" "}
                  · {citation.lineId}: “{citation.quote}”
                </span>
              ))}
            </p>
          ))}
        </section>
      ) : null}
      {progressDebug?.tasks.map((task) => (
        <details key={task.definition.id} open>
          <summary>
            {task.definition.owner.kind} {task.definition.owner.id} · revision {task.definition.revision} ·{" "}
            {task.resolvedAt ? "resolved" : (task.definition.phases[task.phaseIndex]?.title ?? "complete")}
          </summary>
          <p>
            Disclosed: {task.visibleAt || "hidden"}
            {task.resolvedAt ? ` · Resolved: ${task.resolvedAt} · ${task.resolutionKey}` : ""}
          </p>
          {task.definition.phases.map((phase) => (
            <section key={phase.id}>
              <h3>{phase.title}</h3>
              {phase.requirements.map((requirement) => {
                const receipts = task.receipts.filter(
                  (receipt) => receipt.phaseId === phase.id && receipt.requirementId === requirement.id,
                );
                return (
                  <p key={requirement.id}>
                    {requirement.title} · {task.requirementVisibleAt[requirement.id] || "hidden"} ·{" "}
                    {receipts.length
                      ? receipts
                          .map(
                            (receipt) =>
                              `${receipt.routeId} [${receipt.evidence.grade ?? "typed"}]: ${receipt.evidence.sourceId} ${receipt.evidence.excerpt ?? ""} ${(receipt.evidence.citations ?? []).map((citation) => `${citation.lineId}: ${citation.quote}`).join("; ")}`,
                          )
                          .join("; ")
                      : "pending"}
                  </p>
                );
              })}
            </section>
          ))}
          {task.attempts.length ? (
            <section>
              <h3>Rejected or unavailable</h3>
              {task.attempts.map((attempt, index) => (
                <p key={`${attempt.evidenceId}:${index}`}>
                  {attempt.phaseId}/{attempt.requirementId} · {attempt.status}: {attempt.reason}
                </p>
              ))}
            </section>
          ) : null}
          {task.transitions.length ? (
            <section>
              <h3>Transitions</h3>
              {task.transitions.map((transition, index) => (
                <p key={`${transition.phaseId}:${index}`}>
                  {transition.phaseId} → {transition.at} · {transition.evidenceId}
                </p>
              ))}
            </section>
          ) : null}
          {task.revisionHistory?.map((prior) => (
            <details key={prior.definition.revision}>
              <summary>
                Earlier revision {prior.definition.revision} · {prior.receipts.length} accepted sources
              </summary>
              {prior.receipts.map((receipt) => (
                <p key={`${receipt.requirementId}:${receipt.evidence.sourceId}`}>
                  {receipt.requirementId} · {receipt.evidence.grade ?? "typed"} · {receipt.evidence.sourceId} ·{" "}
                  {receipt.evidence.excerpt ?? ""}
                  {receipt.evidence.citations?.map((citation) => (
                    <span key={`${citation.lineId}:${citation.quote}`}>
                      {" "}
                      · {citation.lineId}: “{citation.quote}”
                    </span>
                  ))}
                </p>
              ))}
              {prior.transitions.map((transition, index) => (
                <p key={`${transition.phaseId}:${index}`}>
                  {transition.phaseId} → {transition.at}
                </p>
              ))}
            </details>
          ))}
        </details>
      ))}
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
