import { ELEMENT_TAG } from "../../shared/constants.js";
import type { ProgressDebugPagePorts } from "./page-contracts.js";

export function renderProgressDebugPage(ports: ProgressDebugPagePorts) {
  const { error, progressDebug, loadProgressDebug } = ports;
  return (
    <div className={`${ELEMENT_TAG}-panel`}>
      <h2>DEBUG: Progress</h2>
      <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => void loadProgressDebug()}>
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
      ) : progressDebug ? (
        <p>No saved turns await replay.</p>
      ) : error ? null : (
        <p>Loading diagnostics…</p>
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
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
