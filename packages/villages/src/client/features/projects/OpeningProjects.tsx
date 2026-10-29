import { useConfirmation } from "../../shared/confirmation.js";
import { useState } from "react";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";

export function OpeningProjects({
  snapshot,
  busy,
  decide,
  onPeople,
  pageSize = 4,
}: {
  snapshot: VillageSnapshot;
  busy: boolean;
  decide(action: "accept" | "decline" | "skip", residentId?: string): Promise<unknown>;
  onPeople(): void;
  pageSize?: number;
}) {
  const confirmVillages = useConfirmation(snapshot.opening?.stage);
  const opening = snapshot.opening!;
  const [selectedId, select] = useState("");
  const [page, setPage] = useState(0);
  const [full, setFull] = useState(false);
  const pages = Math.max(1, Math.ceil(opening.residentIds.length / pageSize));
  const currentPage = Math.min(page, pages - 1);
  const proposals = opening.proposals;
  const selected = proposals.find((proposal) => proposal.residentId === selectedId) ?? proposals[0];
  const eligible =
    selected &&
    selected.available !== false &&
    opening.residentIds.includes(selected.residentId) &&
    !opening.declinedIds.includes(selected.residentId);
  const ready = opening.stage === "conversations";
  return (
    <section className={`${P}-opening-projects`} aria-label="Opening proposals">
      <div className={`${P}-project-head`}>
        <h2>Opening Project</h2>
        <button
          type="button"
          className={`${P}-button`}
          disabled={busy}
          onClick={async () => {
            if (await confirmVillages("Skip opening guidance?")) void decide("skip");
          }}
        >
          Skip opening
        </button>
      </div>
      <div className={`${P}-opening-workspace`} data-selected={!!selectedId}>
        <nav aria-label="Resident proposals" className={`${P}-opening-list`}>
          {opening.residentIds.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((id) => {
            const proposal = proposals.find((entry) => entry.residentId === id);
            const name = snapshot.villagers.find((resident) => resident.characterId === id)?.name ?? id;
            return (
              <button
                type="button"
                key={id}
                className={`${P}-project-slot`}
                aria-pressed={selected?.residentId === id}
                onClick={() => {
                  setFull(false);
                  return proposal ? select(id) : onPeople();
                }}
              >
                <span>{name}</span>
                <strong>{proposal?.name ?? "Talk together"}</strong>
                <small>
                  {opening.declinedIds.includes(id)
                    ? "Declined"
                    : proposal?.available === false
                      ? "Unavailable"
                      : proposal
                        ? "Heard"
                        : "Not heard"}
                </small>
              </button>
            );
          })}
          {pages > 1 ? (
            <div className="vp-actions">
              <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                Previous
              </button>
              <span>
                {currentPage + 1} / {pages}
              </span>
              <button type="button" disabled={currentPage + 1 === pages} onClick={() => setPage(currentPage + 1)}>
                Next
              </button>
            </div>
          ) : null}
        </nav>
        <article className={`${P}-project-card`}>
          <button
            type="button"
            className={`${P}-button ${P}-opening-back`}
            onClick={() => {
              setFull(false);
              select("");
            }}
          >
            All proposals
          </button>
          {selected ? (
            <>
              <div className="vp-panel-heading">
                <h3>{selected.name}</h3>
                {selected.description.length > 24 || selected.work.length > 24 ? (
                  <button type="button" onClick={() => setFull(!full)}>
                    {full ? "Summary" : "Full proposal"}
                  </button>
                ) : null}
              </div>
              <p>{selected.kind === "renovation" ? "Renovation" : "New Venue"} · 24 hours</p>
              {full ? (
                <>
                  <label>
                    Design
                    <textarea autoComplete="off" readOnly value={selected.description} />
                  </label>
                  <label>
                    Work
                    <textarea autoComplete="off" readOnly value={selected.work} />
                  </label>
                </>
              ) : (
                <>
                  <p>
                    {selected.description.length > 24
                      ? selected.description.slice(0, 24).trimEnd() + "…"
                      : selected.description}
                  </p>
                  <p>{selected.work.length > 24 ? selected.work.slice(0, 24).trimEnd() + "…" : selected.work}</p>
                </>
              )}
              {!full ? (
                <div className={`${P}-opening-actions`}>
                  <button
                    type="button"
                    className={`${P}-button`}
                    disabled={busy || !ready || !eligible}
                    onClick={() => void decide("accept", selected.residentId)}
                  >
                    Accept proposal
                  </button>
                  <button
                    type="button"
                    className={`${P}-button`}
                    disabled={busy || !eligible}
                    onClick={() => void decide("decline", selected.residentId)}
                  >
                    Decline
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <p>{opening.action}</p>
          )}
          {!ready ? (
            <button type="button" className={`${P}-button`} onClick={onPeople}>
              Meet residents
            </button>
          ) : null}
        </article>
      </div>
    </section>
  );
}

export const openingProjectsStyles = `
.${P}-opening-workspace{display:grid;grid-template-columns:minmax(12rem,17rem) minmax(0,1fr);gap:1rem;align-items:start}
.${P}-opening-back{display:none}
.${P}-opening-list{display:grid;gap:.75rem;min-width:0}
.${P}-opening-list button{text-align:left;min-height:44px;overflow-wrap:anywhere}
.${P}-opening-list [aria-pressed=true]{outline:2px solid var(--primary)}
.${P}-opening-actions{display:flex;flex-wrap:wrap;gap:.5rem}
@media(max-width:700px){.${P}-opening-workspace{grid-template-columns:minmax(0,1fr)}.${P}-opening-workspace[data-selected=false]>article{display:none}.${P}-opening-workspace[data-selected=true]>nav{display:none}.${P}-opening-back{display:inline-flex}}
`;
