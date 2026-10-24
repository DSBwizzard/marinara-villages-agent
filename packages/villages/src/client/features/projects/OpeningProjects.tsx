import { useState } from "react";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";

export function OpeningProjects({
  snapshot,
  busy,
  decide,
  onPeople,
}: {
  snapshot: VillageSnapshot;
  busy: boolean;
  decide(action: "accept" | "decline" | "skip", residentId?: string): Promise<unknown>;
  onPeople(): void;
}) {
  const opening = snapshot.opening!;
  const [selectedId, select] = useState("");
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
          onClick={() => {
            if (window.confirm("Skip opening guidance?")) void decide("skip");
          }}
        >
          Skip opening
        </button>
      </div>
      <div className={`${P}-opening-workspace`} data-selected={!!selectedId}>
        <nav aria-label="Resident proposals" className={`${P}-opening-list`}>
          {opening.residentIds.map((id) => {
            const proposal = proposals.find((entry) => entry.residentId === id);
            const name = snapshot.villagers.find((resident) => resident.characterId === id)?.name ?? id;
            return (
              <button
                type="button"
                key={id}
                className={`${P}-project-slot`}
                aria-pressed={selected?.residentId === id}
                onClick={() => (proposal ? select(id) : onPeople())}
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
        </nav>
        <article className={`${P}-project-card`}>
          <button type="button" className={`${P}-button ${P}-opening-back`} onClick={() => select("")}>
            All proposals
          </button>
          {selected ? (
            <>
              <h3>{selected.name}</h3>
              <p>{selected.kind === "renovation" ? "Renovation" : "New Venue"}</p>
              <p>{selected.description}</p>
              <p>{selected.work}</p>
              <p>
                <strong>Work</strong> · 24 hours
              </p>
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
