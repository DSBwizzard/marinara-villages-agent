import { useCallback, useEffect, useRef, useState } from "react";
import type { MailboxView } from "../../../shared/contracts/mailbox.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { request } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { AvatarFace } from "./ResidentPanels.js";
import type { PortraitMap } from "../../shared/types.js";

export function Mailbox({
  open,
  snapshot,
  onClose,
  initialResidentId = "",
  portraits,
}: {
  open: boolean;
  snapshot: VillageSnapshot;
  onClose: () => void;
  initialResidentId?: string;
  portraits: PortraitMap;
}) {
  const [view, setView] = useState<MailboxView | null>(null);
  const [selected, setSelected] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
  const threadId = thread?.id;
  const unreadIds =
    thread?.messages
      .filter((row) => row.fromId !== "player" && row.status === "delivered" && !row.read)
      .map((row) => row.id)
      .join("|") ?? "";
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
  const action = async (path: string) => {
    setBusy(true);
    setError("");
    try {
      let body: unknown;
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
  const people = snapshot.villagers.map((person) => ({ id: person.characterId, name: person.name }));
  for (const row of view?.threads ?? [])
    if (!people.some((person) => person.id === row.residentId))
      people.push({ id: row.residentId, name: row.residentName });
  const person = people.find((row) => row.id === selected);
  const draft = drafts[selected] ?? "";
  const send = async () => {
    const prior = sendIdentity.current;
    const identity =
      prior?.residentId === selected && prior.text === draft
        ? prior
        : { residentId: selected, text: draft, requestId: createVillagesClientId() };
    sendIdentity.current = identity;
    setBusy(true);
    setError("");
    try {
      setView(await request<MailboxView>("/mailbox/threads", { method: "POST", body: JSON.stringify(identity) }));
      if (sendIdentity.current === identity) sendIdentity.current = null;
      setDrafts((current) => (current[selected] === identity.text ? { ...current, [selected]: "" } : current));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Message could not be saved.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <ModalDialog title="Mailbox" onClose={onClose} scrollBody>
      <style>{`
        .villages-founding-dialog:has(.villages-letter-layout) {width:min(70rem,96vw);max-width:96vw;background:repeating-linear-gradient(2deg,#50311e 0,#69452a 22px,#5b3923 44px);color:#34271c;border-color:#a17753}
        .villages-founding-dialog:has(.villages-letter-layout)>header {background:transparent;color:#fff6df}.villages-founding-dialog:has(.villages-letter-layout)>header h3 {font:700 clamp(1.6rem,3vw,2.4rem) Georgia,serif}
        .villages-letter-layout {display:grid;grid-template-columns:minmax(12rem,30%) minmax(0,1fr);gap:1rem;padding:1rem;min-height:0;overflow:auto;font-family:Georgia,serif}
        .villages-letter-list,.villages-letter-paper {background:linear-gradient(135deg,#f7ecd6,#efddbc);color:#34271c;border:1px solid #c8a97b;border-radius:.35rem;box-shadow:0 3px 10px #24160988}
        .villages-letter-list {padding:.5rem;align-self:start;max-height:60vh;overflow:auto}
        .villages-founding-dialog .villages-letter-person {display:flex;align-items:center;gap:.75rem;width:100%;min-width:0;text-align:left;background:transparent;color:#34271c;border:1px solid transparent;border-radius:.3rem;padding:.55rem}
        .villages-founding-dialog .villages-letter-person[aria-pressed=true] {background:#c8d9dd;border-color:#8aaeb9}
        .villages-letter-face {position:relative;display:grid;place-items:center;flex:none;width:3.5rem;height:3.5rem;overflow:hidden;background:#d4c0a1;border-radius:50%;font-size:1.5rem}
        .villages-letter-face img {position:absolute;width:100%;height:100%;object-fit:cover}
        .villages-letter-person > span:last-child {min-width:0;flex:1}
        .villages-letter-person strong,.villages-letter-person small {display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .villages-letter-paper {padding:1.2rem;min-width:0;display:flex;flex-direction:column;gap:.8rem}
        .villages-letter-heading {display:flex;gap:1rem;align-items:center;border-bottom:1px solid #c8aa84;padding-bottom:.8rem}
        .villages-letter-heading h2 {margin:0;font-size:2rem}
        .villages-letter-heading .villages-letter-face {width:5rem;height:5rem;margin-left:auto}
        .villages-letter-messages {display:grid;gap:.8rem;max-height:43vh;overflow:auto;overflow-wrap:anywhere}
        .villages-letter-messages article {border-bottom:1px solid #d5c09e;padding:.5rem 0}
        .villages-letter-messages p {white-space:pre-wrap;margin:.4rem 0}
        .villages-letter-messages small {color:#6a5848}
        .villages-founding-dialog .villages-letter-paper textarea {background:#fffaf0;color:#34271c;border-color:#b99d77;resize:vertical}
        .villages-founding-dialog .villages-letter-paper button {background:#e7d4b1;color:#34271c;border-color:#b99d77}
        .villages-letter-actions {display:flex;gap:.5rem;flex-wrap:wrap}
        @media(max-width:704px) {.villages-letter-layout {grid-template-columns:1fr;grid-template-rows:max-content max-content;align-content:start;padding:.65rem}.villages-letter-list {display:flex;min-height:5rem;max-height:none;overflow-x:auto;overflow-y:hidden;box-sizing:border-box}.villages-founding-dialog .villages-letter-person {width:auto;min-width:9rem}.villages-letter-heading .villages-letter-face {width:3.5rem;height:3.5rem}.villages-letter-messages {max-height:35vh}}
      `}</style>
      {error ? <p role="alert">{error}</p> : null}
      <div className="villages-letter-layout">
        <nav className="villages-letter-list" aria-label="Conversations">
          {people.map((row) => {
            const conversation = view?.threads.find((item) => item.residentId === row.id);
            const unread = conversation?.messages.some(
              (message) => message.fromId !== "player" && !message.read && message.status === "delivered",
            );
            const last = conversation?.messages.at(-1);
            return (
              <button
                className="villages-letter-person"
                type="button"
                key={row.id}
                aria-pressed={selected === row.id}
                onClick={() => setSelected(row.id)}
              >
                <AvatarFace portrait={portraits[row.id]} name={row.name} className="villages-letter-face" />
                <span>
                  <strong>{row.name}</strong>
                  <small>{unread ? "New message" : (last?.text ?? "Write a message")}</small>
                </span>
              </button>
            );
          })}
        </nav>
        <section className="villages-letter-paper" aria-label="Personal mail">
          {(view?.recovery ?? []).map((row) => (
            <article key={row.messageId}>
              <p>{row.label}</p>
              <div className="villages-letter-actions">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void action(
                      `/mailbox/threads/${encodeURIComponent(row.threadId)}/messages/${encodeURIComponent(row.messageId)}/retry`,
                    )
                  }
                >
                  {row.reinterpretRequired ? "Reinterpret saved message" : "Replay saved work"}
                </button>
                {row.cancellable ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void action(
                        `/mailbox/threads/${encodeURIComponent(row.threadId)}/messages/${encodeURIComponent(row.messageId)}/cancel`,
                      )
                    }
                  >
                    Discard message
                  </button>
                ) : null}
              </div>
            </article>
          ))}
          {!person ? (
            <p>Choose a resident to write to.</p>
          ) : (
            <>
              <div className="villages-letter-heading">
                <h2>{person.name}</h2>
                <AvatarFace portrait={portraits[person.id]} name={person.name} className="villages-letter-face" />
              </div>
              <div className="villages-letter-messages">
                {thread?.messages.map((message) => (
                  <article key={message.id}>
                    <strong>{message.fromId === "player" ? "You" : person.name}</strong>
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
                      <div className="villages-letter-actions">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void action(
                              `/mailbox/threads/${encodeURIComponent(thread.id)}/messages/${encodeURIComponent(message.id)}/retry`,
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
                                `/mailbox/threads/${encodeURIComponent(thread.id)}/messages/${encodeURIComponent(message.id)}/cancel`,
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
              </div>
              {snapshot.villagers.some((row) => row.characterId === selected) ? (
                <>
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
                  <button type="button" disabled={busy || !draft.trim()} onClick={() => void send()}>
                    Send
                  </button>
                </>
              ) : null}
            </>
          )}
        </section>
      </div>
    </ModalDialog>
  );
}
