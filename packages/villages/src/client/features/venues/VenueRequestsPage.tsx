import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { VenueRequestsPagePorts } from "./page-contracts.js";

export function renderVenueRequestsPage(ports: VenueRequestsPagePorts) {
  const {
    busy,
    decideVenueRequest,
    nameOfCharacter,
    requestEdits,
    setBusy,
    setRequestEdits,
    setSettingsError,
    setSnapshot,
    settingsError,
    snapshot,
  } = ports;
  return (
    <div className={`${ELEMENT_TAG}-overlay`}>
      <div className={`${ELEMENT_TAG}-overlay-head`}>
        <h2 className={`${ELEMENT_TAG}-panel-title`}>Venue Requests</h2>
      </div>
      <p className={`${ELEMENT_TAG}-macro-help`}>
        Villagers can ask for places in conversation. Accepting a request starts a New Venue Project; place its
        blueprint on the map, find a willing Builder, and work through the Project phases.
      </p>
      {snapshot.venueRequests.length === 0 ? (
        <p className={`${ELEMENT_TAG}-empty`}>Nobody has requested a new place.</p>
      ) : (
        <ul className={`${ELEMENT_TAG}-notices`}>
          {snapshot.venueRequests.map((entry) => {
            const draft = requestEdits[entry.id] ?? entry.venueDraft;
            const edit = (patch: Partial<typeof draft>) =>
              setRequestEdits((current) => ({ ...current, [entry.id]: { ...draft, ...patch } }));
            return (
              <li
                key={entry.id}
                className={`${ELEMENT_TAG}-notice-row`}
                data-villager-request={"request:" + entry.id}
                tabIndex={-1}
              >
                <div className={`${ELEMENT_TAG}-field`}>
                  <strong>{entry.requesterName || "A villager"}</strong>
                  {entry.requestQuote ? <p>“{entry.requestQuote}”</p> : null}
                  <span className={`${ELEMENT_TAG}-hint`}>
                    {` · ${entry.source === "chat" ? "Conversation" : "Village life"}`}
                  </span>
                  <input
                    className={`${ELEMENT_TAG}-notice-input`}
                    value={draft.name}
                    maxLength={snapshot.settings.maxVenueNameLength}
                    aria-label={`Requested place name from ${entry.requesterName || "villager"}`}
                    onChange={(event) => edit({ name: event.target.value })}
                  />
                  <select
                    className={`${ELEMENT_TAG}-notice-input`}
                    value={draft.classes[0] ?? "gathering"}
                    aria-label={`Requested place class from ${entry.requesterName || "villager"}`}
                    onChange={(event) => edit({ classes: [event.target.value as (typeof draft.classes)[number]] })}
                  >
                    <option value="residence">Residence</option>
                    <option value="gathering">Gathering</option>
                    <option value="workplace">Workplace</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    className={`${ELEMENT_TAG}-textarea`}
                    value={draft.description ?? ""}
                    maxLength={1000}
                    aria-label={`Requested place description from ${entry.requesterName || "villager"}`}
                    onChange={(event) => edit({ description: event.target.value })}
                  />
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy || !draft.name.trim()}
                    onClick={() => {
                      setBusy(true);
                      setSettingsError("");
                      void request<{ descriptions: Record<string, string> }>("/locations/venue/descriptions/draft", {
                        method: "POST",
                        body: JSON.stringify({
                          venues: [{ id: entry.id, name: draft.name, classes: draft.classes }],
                        }),
                      })
                        .then((result) => edit({ description: result.descriptions[entry.id] ?? "" }))
                        .catch((cause) =>
                          setSettingsError(messageFrom(cause, "The description draft could not be generated.")),
                        )
                        .finally(() => setBusy(false));
                    }}
                  >
                    Generate description draft
                  </button>
                  <div className={`${ELEMENT_TAG}-row`}>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy || !draft.name.trim() || draft.classes.length === 0 || !draft.description?.trim()}
                      onClick={() => void decideVenueRequest(entry, true)}
                    >
                      {draft.name !== entry.venueDraft.name ||
                      JSON.stringify(draft.classes) !== JSON.stringify(entry.venueDraft.classes)
                        ? "Send counteroffer"
                        : "Start planning project"}
                    </button>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => void decideVenueRequest(entry, false)}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <h3 className={`${ELEMENT_TAG}-panel-title`}>Home upgrade requests</h3>
      {snapshot.upgradeRequests.length === 0 ? (
        <p className={`${ELEMENT_TAG}-hint`}>No home upgrades requested.</p>
      ) : (
        snapshot.upgradeRequests.map((entry) => (
          <div
            key={entry.id}
            className={`${ELEMENT_TAG}-notice-row`}
            data-villager-request={"upgrade:" + entry.id}
            tabIndex={-1}
          >
            <span>{entry.detail}</span>
            {([true, false] as const).map((approved) => (
              <button
                key={String(approved)}
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  setSettingsError("");
                  void request<VillageSnapshot>(
                    `/venue-upgrades/${encodeURIComponent(entry.id)}/${approved ? "approve" : "deny"}`,
                    { method: "POST" },
                  )
                    .then(setSnapshot)
                    .catch((cause) => setSettingsError(messageFrom(cause, "The upgrade request could not be decided.")))
                    .finally(() => setBusy(false));
                }}
              >
                {approved ? "Approve upgrade" : "Deny"}
              </button>
            ))}
          </div>
        ))
      )}
      <h3 className={`${ELEMENT_TAG}-panel-title`}>Resident move requests</h3>
      {snapshot.residences.filter((entry) => entry.status !== "current").length === 0 ? (
        <p className={`${ELEMENT_TAG}-hint`}>No moves pending.</p>
      ) : (
        snapshot.residences
          .filter((entry) => entry.status !== "current")
          .map((entry) => {
            const name = nameOfCharacter(entry.characterId);
            const target =
              snapshot.settings.venues.find((venue) => venue.id === entry.proposedVenueId)?.name || "another venue";
            return (
              <div
                key={entry.characterId}
                className={`${ELEMENT_TAG}-notice-row`}
                data-villager-request={"residence:" + entry.characterId}
                tabIndex={-1}
              >
                <span>{`${name} → ${target}`}</span>
                {entry.status === "moving" ? (
                  <>
                    <span className={`${ELEMENT_TAG}-hint`}>
                      Move due {new Date(entry.completesAt ?? "").toLocaleString()}
                    </span>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => {
                        setBusy(true);
                        setSettingsError("");
                        void request<VillageSnapshot>("/residences/debug/complete-now", {
                          method: "POST",
                          body: JSON.stringify({ characterId: entry.characterId }),
                        })
                          .then(setSnapshot)
                          .catch((cause) => setSettingsError(messageFrom(cause, "The move could not be completed.")))
                          .finally(() => setBusy(false));
                      }}
                    >
                      DEBUG: Complete move now
                    </button>
                  </>
                ) : entry.requestedBy === "player" ? (
                  <span className={`${ELEMENT_TAG}-hint`}>Awaiting {name}&apos;s answer in conversation.</span>
                ) : (
                  ([true, false] as const).map((approved) => (
                    <button
                      key={String(approved)}
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => {
                        setBusy(true);
                        setSettingsError("");
                        void request<VillageSnapshot>(`/residences/${approved ? "approvals" : "denials"}`, {
                          method: "POST",
                          body: JSON.stringify({ characterId: entry.characterId }),
                        })
                          .then(setSnapshot)
                          .catch((cause) =>
                            setSettingsError(messageFrom(cause, "The move request could not be decided.")),
                          )
                          .finally(() => setBusy(false));
                      }}
                    >
                      {approved ? "Approve move" : "Deny"}
                    </button>
                  ))
                )}
              </div>
            );
          })
      )}
      {settingsError ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {settingsError}
        </p>
      ) : null}
    </div>
  );
}
