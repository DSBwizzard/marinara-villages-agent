import { createVillagesClientId } from "../../shared/request-id.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MailboxView } from "../../../shared/contracts/mailbox.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import type { MenuPage } from "../../shared/types.js";
import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { MailboxImprovementEditor } from "../venues/VenuePanels.js";

export function Mailbox({
  open,
  snapshot,
  setSnapshot,
  onClose,
  openMenu,
  initialResidentId = "",
}: {
  open: boolean;
  snapshot: VillageSnapshot;
  setSnapshot: (snapshot: VillageSnapshot) => void;
  onClose: () => void;
  openMenu: (page: MenuPage) => void;
  initialResidentId?: string;
}) {
  const [view, setView] = useState<MailboxView | null>(null),
    [selected, setSelected] = useState(""),
    [drafts, setDrafts] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const retryIdentity = useRef<Record<string, string>>({});
  const sendIdentity = useRef<{ residentId: string; text: string; requestId: string } | null>(null);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const next = await request<MailboxView>("/mailbox", { signal });
    if (!signal?.aborted) setView(next);
  }, []);
  useEffect(() => {
    if (!open) return;
    setSelected(initialResidentId);
    const controller = new AbortController();
    const poll = () =>
      void refresh(controller.signal).catch((cause) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Mailbox unavailable.");
      });
    poll();
    const timer = window.setInterval(poll, 5000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [open, initialResidentId, refresh]);
  const thread = view?.threads.find((row) => row.residentId === selected);
  const unreadIds =
    thread?.messages
      .filter((row) => row.fromId !== "player" && row.status === "delivered" && !row.read)
      .map((row) => row.id)
      .join("|") ?? "";
  const threadId = thread?.id;
  useEffect(() => {
    if (!open || !threadId || !unreadIds) return;
    const controller = new AbortController();
    void request<MailboxView>("/mailbox/threads/" + encodeURIComponent(threadId) + "/read", {
      method: "POST",
      signal: controller.signal,
    })
      .then((next) => {
        if (!controller.signal.aborted) setView(next);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not read thread.");
      });
    return () => controller.abort();
  }, [open, threadId, unreadIds]);
  const action = async (path: string, body?: unknown) => {
    setBusy(true);
    setError("");
    try {
      if (path.endsWith("/retry")) {
        retryIdentity.current[path] ??= createVillagesClientId();
        body = { requestId: retryIdentity.current[path] };
      }
      setView(
        await request<MailboxView>(path, {
          method: "POST",
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
      );
      delete retryIdentity.current[path];
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Mailbox action failed.");
    } finally {
      setBusy(false);
    }
  };
  if (!open || !snapshot) return null;
  const nameOfCharacter = (id: string) =>
    snapshot.villagers.find((row) => row.characterId === id)?.name ?? "Former resident";
  const draft = drafts[selected] ?? "";
  return (
    <ModalDialog title="Mailbox" onClose={onClose} scrollBody>
      <style>{`
      .villages-personal-mail {display:grid;gap:.75rem;min-width:0}
      .villages-personal-mail textarea {box-sizing:border-box;width:100%;min-height:7rem;resize:vertical}
      .villages-personal-mail article {border:1px solid #65708966;border-radius:.5rem;padding:.75rem;overflow-wrap:anywhere}
      .villages-personal-mail p {white-space:pre-wrap}
      .villages-mail-actions {display:flex;gap:.5rem;flex-wrap:wrap}
    `}</style>
      {error ? <p role="alert">{error}</p> : null}
      <section className="villages-personal-mail" aria-label="Personal mail">
        {view?.recovery?.map((row) => (
          <article key={row.messageId}>
            <p>{row.label}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void action(
                  "/mailbox/threads/" +
                    encodeURIComponent(row.threadId) +
                    "/messages/" +
                    encodeURIComponent(row.messageId) +
                    "/retry",
                )
              }
            >
              {row.reinterpretRequired ? "Reinterpret saved message" : "Replay delivery"}
            </button>
          </article>
        ))}
        <label>
          To{" "}
          <select
            autoComplete="off"
            aria-label="Mail recipient"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            <option value="">Choose a resident</option>
            {snapshot.villagers.map((person) => (
              <option key={person.characterId} value={person.characterId}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        {view?.threads
          .filter((row) => row.residentId !== selected)
          .map((row) => (
            <button key={row.id} type="button" onClick={() => setSelected(row.residentId)}>
              {row.residentName}
              {row.messages.some(
                (message) => message.fromId !== "player" && !message.read && message.status === "delivered",
              )
                ? " · New"
                : ""}
            </button>
          ))}
        {selected ? (
          <>
            {thread?.messages.map((message) => (
              <article key={message.id}>
                <strong>{message.fromId === "player" ? "You" : nameOfCharacter(message.fromId)}</strong>
                <p>{message.text}</p>
                <small>
                  {new Date(message.at).toLocaleString()} ·{" "}
                  {message.status === "applying"
                    ? "Delivery recovery"
                    : message.status === "delivered" && message.replyPending
                      ? "Delivered · reply pending"
                      : message.status}
                </small>
                {message.error ? <p role="status">{message.error}</p> : null}
                {message.fromId === "player" &&
                (message.status === "pending" || message.status === "applying" || message.replyPending) ? (
                  <div className="villages-mail-actions">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void action(
                          "/mailbox/threads/" +
                            encodeURIComponent(thread.id) +
                            "/messages/" +
                            encodeURIComponent(message.id) +
                            "/retry",
                        )
                      }
                    >
                      Retry {message.status === "delivered" ? "reply" : "delivery"}
                    </button>
                    {message.status === "pending" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void action(
                            "/mailbox/threads/" +
                              encodeURIComponent(thread.id) +
                              "/messages/" +
                              encodeURIComponent(message.id) +
                              "/cancel",
                          )
                        }
                      >
                        Cancel message
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
            {view?.invitations
              .filter((row) => row.threadId === thread?.id)
              .map((invitation) => (
                <article key={invitation.id}>
                  <strong>{invitation.terms.title}</strong>
                  <p>{invitation.terms.detail}</p>
                  {invitation.terms.dueAt ? <p>Due {new Date(invitation.terms.dueAt).toLocaleString()}</p> : null}
                  <p>{invitation.status}</p>
                  {invitation.status === "proposed" ? (
                    <div className="villages-mail-actions">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void action("/mailbox/invitations/" + encodeURIComponent(invitation.id) + "/response", {
                            expectedRevision: invitation.revision,
                            accepted: true,
                          })
                        }
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void action("/mailbox/invitations/" + encodeURIComponent(invitation.id) + "/response", {
                            expectedRevision: invitation.revision,
                            accepted: false,
                          })
                        }
                      >
                        Decline
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            <label>
              Message
              <textarea
                autoComplete="off"
                aria-label="Personal message"
                maxLength={4000}
                value={draft}
                onChange={(event) => setDrafts((current) => ({ ...current, [selected]: event.target.value }))}
              />
            </label>
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={async () => {
                const prior = sendIdentity.current;
                const identity =
                  prior?.residentId === selected && prior.text === draft
                    ? prior
                    : { residentId: selected, text: draft, requestId: createVillagesClientId() };
                sendIdentity.current = identity;
                setBusy(true);
                setError("");
                try {
                  setView(
                    await request<MailboxView>("/mailbox/threads", { method: "POST", body: JSON.stringify(identity) }),
                  );
                  if (sendIdentity.current === identity) sendIdentity.current = null;
                  setDrafts((current) =>
                    current[selected] === identity.text ? { ...current, [selected]: "" } : current,
                  );
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : "Message could not be saved.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Send
            </button>
          </>
        ) : null}
      </section>
      <details>
        <summary>Venue decisions</summary>
        <div className={ELEMENT_TAG + "-mailbox-list"}>
          {[...(snapshot.venueMail ?? [])].reverse().map((entry) => (
            <article className={`${ELEMENT_TAG}-mailbox-item`} key={entry.id}>
              <strong>{entry.title}</strong>
              <p>{entry.detail}</p>
              <p className={`${ELEMENT_TAG}-hint`}>
                {entry.status === "awaiting-villagers"
                  ? `Awaiting replies · due ${new Date(entry.dueAt).toLocaleString()}`
                  : entry.status === "pending-player"
                    ? "Awaiting your decision"
                    : entry.status === "approved"
                      ? "Approved"
                      : "Declined"}
              </p>
              {entry.decisions.map((decision) => (
                <p key={decision.characterId}>
                  <strong>{nameOfCharacter(decision.characterId)}:</strong> {decision.reply}
                </p>
              ))}
              {entry.status === "pending-player" && entry.kind === "villager-change" ? (
                <MailboxImprovementEditor
                  entry={entry}
                  onDecide={async (approved, value) => {
                    setSnapshot(
                      await request<VillageSnapshot>(`/venue-mail/${encodeURIComponent(entry.id)}/decision`, {
                        method: "POST",
                        body: JSON.stringify({ approved, ...value }),
                      }),
                    );
                  }}
                />
              ) : null}
              {entry.error ? <p className={`${ELEMENT_TAG}-hint`}>Reply delayed: {entry.error}</p> : null}
            </article>
          ))}
          {(snapshot.venueMail?.length ?? 0) === 0 &&
          snapshot.venueRequests.length === 0 &&
          snapshot.upgradeRequests.length === 0 ? (
            <p className={`${ELEMENT_TAG}-empty`}>No Venue mail yet.</p>
          ) : null}
          {snapshot.venueRequests.map((entry) => (
            <article className={`${ELEMENT_TAG}-mailbox-item`} key={entry.id}>
              <strong>
                {entry.requesterName || "A villager"} suggests {entry.venueDraft.name}
              </strong>
              <p>
                {entry.venueDraft.classes
                  .map((venueClass) => venueClass[0].toUpperCase() + venueClass.slice(1))
                  .join(" / ")}
              </p>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={() => {
                  onClose();
                  openMenu("venueRequests");
                }}
              >
                Review request
              </button>
            </article>
          ))}
          {snapshot.upgradeRequests.map((entry) => (
            <article className={`${ELEMENT_TAG}-mailbox-item`} key={entry.id}>
              <strong>{entry.requesterName} suggests a home change</strong>
              <p>{entry.detail}</p>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={() => {
                  onClose();
                  openMenu("venueRequests");
                }}
              >
                Review request
              </button>
            </article>
          ))}
        </div>
      </details>
    </ModalDialog>
  );
}
