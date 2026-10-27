import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MailboxView, PersonalMailThread } from "../../../shared/contracts/mailbox.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { request } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { useLetterFont, letterFontFamily } from "../../shared/letter-font-css.js";
import type { PortraitMap } from "../../shared/types.js";
import { AvatarFace } from "./ResidentPanels.js";
import { SignatureArt } from "./villages-signature.js";

type Letter = { thread: PersonalMailThread; message: PersonalMailThread["messages"][number] };
type Selection = { threadId: string; messageId: string } | null;

function LetterPages({
  text,
  fontId,
  simpleText,
  fontRevision,
  sender,
}: {
  text: string;
  fontId?: string;
  simpleText: boolean;
  fontRevision: number;
  sender?: VillageSnapshot["villagers"][number];
}) {
  const paper = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLDivElement>(null);
  const dimensions = useRef<{ width: number; height: number } | null>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [keepEnding, setKeepEnding] = useState(false);
  const [imageRevision, setImageRevision] = useState(0);
  const lastWords = /(?:\S+\s+){0,2}\S+\s*$/u.exec(text)?.[0].trimEnd() ?? "";
  const endingCharacters = Array.from(lastWords);
  const ending = endingCharacters.length > 64 ? endingCharacters.slice(-32).join("") : lastWords;
  const splitAt = text.trimEnd().length - ending.length;
  useLayoutEffect(() => {
    const node = paper.current;
    if (!node) return;
    const measure = () => {
      const width = node.getBoundingClientRect().width;
      if (!width || !node.clientHeight) return;
      const previousSize = dimensions.current;
      dimensions.current = { width, height: node.clientHeight };
      if (keepEnding && previousSize && (previousSize.width !== width || previousSize.height !== node.clientHeight)) {
        setKeepEnding(false);
        return;
      }
      const controls = navigation.current;
      if (controls && controls.style.display !== "none") {
        const previousDisplay = controls.style.display;
        controls.style.display = "none";
        const fitsWithoutControls = node.scrollWidth - 3 <= width;
        controls.style.display = previousDisplay;
        if (fitsWithoutControls) {
          setPages(1);
          setPage(0);
          node.scrollLeft = 0;
          return;
        }
      }
      if (!keepEnding && sender && ending) {
        const body = node.querySelector(".villages-letter-text")?.firstChild;
        const signature = node.querySelector(".villages-letter-signature");
        if (body && signature) {
          const range = document.createRange();
          const end = text.trimEnd().length;
          range.setStart(body, end - 1);
          range.setEnd(body, end);
          const origin = node.getBoundingClientRect().left;
          const textPage = Math.floor((range.getBoundingClientRect().left - origin + node.scrollLeft + 1) / width);
          const signaturePage = Math.floor(
            (signature.getBoundingClientRect().left - origin + node.scrollLeft + 1) / width,
          );
          if (signaturePage > textPage) {
            setKeepEnding(true);
            return;
          }
        }
      }
      // Rounding and the signature flourish can extend a pixel beyond the last column.
      const count = Math.max(1, Math.ceil((node.scrollWidth - 3) / width));
      setPages(count);
      const current = Math.min(page, count - 1);
      if (current !== page) setPage(current);
      node.scrollLeft = current * width;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [text, simpleText, fontId, fontRevision, imageRevision, page, keepEnding, sender, ending]);
  const hand = !simpleText ? sender?.signatureFallback : undefined;
  const style = {
    fontFamily: fontId ? letterFontFamily(fontId) : simpleText ? "system-ui, sans-serif" : undefined,
    fontStyle: hand ? `oblique ${Math.max(-3, Math.min(3, -hand.slant))}deg` : undefined,
    letterSpacing: hand ? `${Math.max(-0.2, Math.min(0.3, hand.spacing))}px` : undefined,
  };
  const signature = sender ? (
    <div className="villages-letter-signature">
      <SignatureArt name={sender.name} signature={sender.signatureFallback} saved={sender.signature} />
    </div>
  ) : null;
  return (
    <>
      <div className="villages-letter-pages" ref={paper} onLoad={() => setImageRevision((value) => value + 1)}>
        <p className="villages-letter-text" style={style}>
          {keepEnding ? text.slice(0, splitAt) : text}
        </p>
        {keepEnding ? (
          <div className="villages-letter-ending">
            <p className="villages-letter-text" style={style}>
              {text.slice(splitAt)}
            </p>
            {signature}
          </div>
        ) : (
          signature
        )}
      </div>
      <div
        ref={navigation}
        className="villages-letter-pagination"
        aria-label="Letter pages"
        style={{ display: pages > 1 ? "flex" : "none" }}
      >
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage((current) => current - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span aria-live="polite">
          {page + 1} / {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages - 1}
          onClick={() => setPage((current) => current + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </>
  );
}

export function Mailbox({
  open,
  snapshot,
  onClose,
  initialResidentId = "",
  portraits,
}: {
  open: boolean;
  snapshot: VillageSnapshot;
  onClose(): void;
  initialResidentId?: string;
  portraits: PortraitMap;
}) {
  const [simpleText, setSimpleText] = useState(() => {
    try {
      return localStorage.getItem("villages-letter-simple") === "true";
    } catch {
      return false;
    }
  });
  const [view, setView] = useState<MailboxView | null>(null);
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const [selection, setSelection] = useState<Selection>(null);
  const [composing, setComposing] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [readError, setReadError] = useState("");
  const [readAttempt, setReadAttempt] = useState(0);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const root = closeButton.current?.getRootNode();
    const opener = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
    closeButton.current?.focus();
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);
  const retryIdentity = useRef<Record<string, string>>({});
  const sendIdentities = useRef(new Map<string, string>());
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const next = await request<MailboxView>("/mailbox", { signal });
    if (!signal?.aborted) {
      setView(next);
      setLoadError("");
    }
  }, []);
  useEffect(() => {
    if (!open) return;
    setFolder("inbox");
    setSelection(null);
    setRecipient(initialResidentId);
    setComposing(!!initialResidentId);
    const controller = new AbortController();
    const poll = () =>
      void refresh(controller.signal).catch((cause) => {
        if (!controller.signal.aborted) setLoadError(cause instanceof Error ? cause.message : "Mailbox unavailable.");
      });
    poll();
    const timer = window.setInterval(poll, 5000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [open, initialResidentId, refresh]);
  const letters: Letter[] = (view?.threads ?? []).flatMap((thread) =>
    thread.messages.map((message) => ({ thread, message })),
  );
  const selected =
    selection &&
    letters.find(({ thread, message }) => thread.id === selection.threadId && message.id === selection.messageId);
  const unreadId =
    !composing &&
    selected &&
    selected.message.fromId !== "player" &&
    selected.message.status === "delivered" &&
    !selected.message.read
      ? selected.message.id
      : "";
  const selectedThreadId = selected?.thread.id ?? "";
  useEffect(() => {
    setReadError("");
    if (!open || !selectedThreadId || !unreadId) return;
    const controller = new AbortController();
    void request<MailboxView>("/mailbox/threads/" + encodeURIComponent(selectedThreadId) + "/read", {
      method: "POST",
      body: JSON.stringify({ messageId: unreadId }),
      signal: controller.signal,
    })
      .then((next) => {
        if (!controller.signal.aborted) setView(next);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setReadError(cause instanceof Error ? cause.message : "Could not read letter.");
      });
    return () => controller.abort();
  }, [open, selectedThreadId, unreadId, readAttempt]);
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
  const sender = selected && snapshot.villagers.find((person) => person.characterId === selected.message.fromId);
  const fontId =
    open && !simpleText && selected?.message.fromId !== "player"
      ? (selected?.thread.letterFontId ?? sender?.letterFontId)
      : undefined;
  const fontRevision = useLetterFont(fontId);
  if (!open || !snapshot) return null;
  const people = snapshot.villagers.map((person) => ({ id: person.characterId, name: person.name }));
  const shown = letters
    .filter(({ message }) => (folder === "sent" ? message.fromId === "player" : message.fromId !== "player"))
    .sort((a, b) => b.message.at.localeCompare(a.message.at));
  const draft = drafts[recipient] ?? "";
  const write = (id = "") => {
    setRecipient(id);
    setSelection(null);
    setComposing(true);
  };
  const send = async () => {
    const key = JSON.stringify([recipient, draft]);
    const requestId = sendIdentities.current.get(key) ?? createVillagesClientId();
    sendIdentities.current.set(key, requestId);
    const identity = { residentId: recipient, text: draft, requestId };
    setBusy(true);
    setError("");
    try {
      const next = await request<MailboxView>("/mailbox/threads", { method: "POST", body: JSON.stringify(identity) });
      setView(next);
      if (sendIdentities.current.get(key) === requestId) sendIdentities.current.delete(key);
      setDrafts((current) =>
        current[identity.residentId] === identity.text ? { ...current, [identity.residentId]: "" } : current,
      );
      const sent = next.threads.find((row) => row.residentId === identity.residentId);
      const message = sent?.messages.find(
        (row) =>
          row.fromId === "player" && (row.id === identity.requestId || row.id.endsWith(":" + identity.requestId)),
      );
      setFolder("sent");
      setComposing(false);
      setSelection(sent && message ? { threadId: sent.id, messageId: message.id } : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Letter could not be saved.");
    } finally {
      setBusy(false);
    }
  };
  const detail = !!selected || composing;
  const retryPath = (threadId: string, messageId: string) =>
    `/mailbox/threads/${encodeURIComponent(threadId)}/messages/${encodeURIComponent(messageId)}/retry`;
  return (
    <div
      className="villages-mailbox-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="villages-founding-dialog villages-mailbox-dialog" role="dialog" aria-label="Mailbox">
        <header>
          <h3>Mailbox</h3>
          <button ref={closeButton} type="button" aria-label="Close Mailbox" onClick={onClose}>
            ×
          </button>
        </header>
        <style>{`
        .villages-mailbox-overlay{position:absolute;inset:0;z-index:1000;display:grid;grid-template: minmax(0,1fr) / minmax(0,1fr);place-items:center;overflow:hidden;background:#0009;padding:1rem;box-sizing:border-box}
        .villages-founding-dialog:has(.villages-letter-layout){position:relative;width:min(76rem,100%);max-width:100%;height:min(46rem,100%);max-height:100%;margin:0;padding:0;background:#53341f url('/api/capability-packages/villages/assets/menu-desk.jpg') center/cover;color:#34271c;border:1px solid #806044;box-shadow:0 14px 50px #0009;font-family:Georgia,"Times New Roman",serif}
        .villages-founding-dialog:has(.villages-letter-layout)>header{display:flex;align-items:center;justify-content:space-between;background:transparent;color:#fff7eb;border:0;padding:1.25rem 1.8rem .7rem}
        .villages-founding-dialog:has(.villages-letter-layout)>header h3{font:700 clamp(1.8rem,3.2vw,2.8rem) Georgia,serif;color:#fff7eb;text-shadow:0 2px 3px #261407}
        .villages-founding-dialog:has(.villages-letter-layout)>header>button{background:transparent;border:0;color:#fff7eb;font:1.4rem Georgia,serif;min-width:44px;min-height:44px}
        .villages-letter-layout{display:grid;grid-template-columns:minmax(15rem,36%) minmax(0,1fr);gap:1rem;padding:.5rem 1.8rem 1.6rem;min-height:0;flex:1;overflow:hidden;box-sizing:border-box}
        .villages-letter-list,.villages-letter-paper{min-width:0;min-height:0;color:#2c2118;background:radial-gradient(ellipse at 20% 10%,#fff7e6aa,transparent 60%),linear-gradient(120deg,#f5e6c8,#e9d4ad);border:1px solid #b99467;border-radius:.3rem;box-shadow:0 3px 9px #261407a0,inset 0 0 28px #a4763a22}
        .villages-letter-list{display:flex;flex-direction:column;overflow:hidden;padding:.75rem}
        .villages-letter-list-head{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.5rem}
        .villages-letter-folders{display:flex;gap:.2rem}
        .villages-founding-dialog .villages-letter-layout button{font-family:Georgia,"Times New Roman",serif;cursor:pointer}
        .villages-founding-dialog .villages-letter-folders button{border:0;background:transparent;color:#614b37;padding:.45rem .55rem;font-size:1rem}
        .villages-founding-dialog .villages-letter-folders button[aria-pressed=true]{color:#21170f;border-bottom:2px solid #936946;font-weight:bold}
        .villages-founding-dialog .villages-letter-compose{border:1px solid #ae8960;border-radius:.25rem;background:#f3dfbc;color:#352315;padding:.55rem .8rem;white-space:nowrap;box-shadow:0 2px 3px #79512d38}
        .villages-letter-rows{min-height:0;overflow:auto}
        .villages-founding-dialog .villages-letter-row{display:flex;align-items:center;gap:.75rem;width:100%;min-height:5.6rem;padding:.7rem;text-align:left;background:transparent;color:#2c2118;border:1px solid transparent;border-bottom-color:#ccb493;border-radius:.25rem}
        .villages-founding-dialog .villages-letter-row[aria-pressed=true]{background:#c4d8df;border-color:#91afbc;box-shadow:inset 0 0 10px #a2b9bd55}
        .villages-letter-face{position:relative;display:grid;place-items:center;flex:none;width:3.7rem;height:3.7rem;overflow:hidden;background:#d8c4a4;border-radius:50%;font-size:1.6rem}
        .villages-letter-face img{position:absolute;width:100%;height:100%;object-fit:cover}
        .villages-letter-row>span:last-child{min-width:0;flex:1}.villages-letter-row strong,.villages-letter-row small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.villages-letter-row strong{font-size:1.35rem}.villages-letter-row small{font-size:1rem;margin-top:.2rem}
        .villages-letter-paper{position:relative;display:flex;flex-direction:column;overflow:auto;padding:clamp(1.2rem,3vw,2.5rem);box-shadow:4px 5px 0 #d1bb98,0 4px 12px #26140799,inset 0 0 35px #a4763a20}
        .villages-letter-paper[data-reading=true]{overflow:hidden}
        .villages-letter-heading{display:flex;align-items:flex-start;gap:1rem;border-bottom:1px solid #c7ad89;padding-bottom:1rem}.villages-letter-heading h2{margin:0;font-size:clamp(1.8rem,3vw,2.7rem);color:#241a13}.villages-letter-heading small{display:block;margin-top:.25rem;font-size:1rem;color:#6c5640}
        .villages-letter-heading .villages-letter-face{width:7rem;height:7rem;margin-left:auto;border-radius:.2rem;background:transparent;font-size:3rem}
        .villages-letter-reading{margin-left:auto;min-height:44px;border:1px solid #b18f69;background:#efdbb9;color:#302116;border-radius:.35rem;padding:.45rem .7rem}
        .villages-letter-reading[aria-pressed=true]{background:#57717a;color:#fff;border-color:#38535d;box-shadow:inset 0 0 0 1px #fff8}
        .villages-letter-pages{flex:1;min-height:0;overflow:hidden;column-count:1;column-gap:0;column-fill:auto}
        .villages-letter-text{white-space:pre-wrap;overflow-wrap:anywhere;font-size:clamp(1.05rem,1.6vw,1.4rem);line-height:1.55;margin:.5rem 0;orphans:1;widows:1}
        .villages-letter-ending{break-inside:avoid}.villages-letter-ending .villages-letter-text{margin:0}
        .villages-letter-signature{break-inside:avoid;width:min(14rem,60%);margin:.5rem 0 .5rem auto;color:#59434c;text-align:right}
        .villages-letter-pagination{display:flex;align-items:center;justify-content:center;gap:1rem;min-height:44px}
        .villages-founding-dialog .villages-letter-pagination button{min-width:44px;min-height:44px;border:0;background:transparent;color:#493526;font-size:1.6rem}
        .villages-letter-signature .marinara-capability-villages-signature-art{width:100%;max-width:100%}
        .villages-letter-signature .marinara-capability-villages-signature-image{display:block;margin-left:auto;max-width:100%;max-height:7rem;object-fit:contain;mix-blend-mode:multiply}
        .villages-letter-signature .marinara-capability-villages-signature-name{display:block;font:italic 2rem/1.4 var(--notebook-hand, cursive);overflow-wrap:anywhere}
        .villages-letter-signature .marinara-capability-villages-signature-name[data-hand="bold"]{font-weight:700}
        .villages-letter-signature .marinara-capability-villages-signature-flourish{display:block;width:100%;height:1rem;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
        .villages-letter-actions{display:flex;gap:.65rem;flex-wrap:wrap;margin-top:auto}.villages-founding-dialog .villages-letter-actions button{min-height:44px;padding:.65rem 1.25rem;border:1px solid #b18f69;border-radius:.35rem;background:#efdbb9;color:#302116;box-shadow:0 2px 4px #7b56352e;font-size:1.05rem}
        .villages-letter-compose-fields{display:grid;gap:1rem;flex:1;margin-top:1.2rem}.villages-letter-compose-fields label{display:grid;gap:.4rem;font-size:1.1rem}.villages-founding-dialog .villages-letter-compose-fields :is(select,textarea){width:100%;box-sizing:border-box;background:#fff9ed;color:#302116;border:1px solid #b99a72;border-radius:.25rem;padding:.65rem;font:1.05rem Georgia,serif}.villages-letter-compose-fields textarea{min-height:10rem;resize:vertical}
        .villages-letter-empty{font-size:1.1rem;line-height:1.5}.villages-letter-back{display:none}.villages-letter-error{color:#6d261b;background:#f9e9d5;padding:.6rem 1rem;margin:0 1.8rem}
        .villages-letter-layout :is(button,select,textarea):focus-visible{outline:3px solid #385c6b;outline-offset:2px}.villages-letter-layout button:disabled{opacity:.55;cursor:default}
        @media(max-height:700px){.villages-founding-dialog:has(.villages-letter-layout)>header{padding:.5rem 1.2rem .25rem}.villages-letter-layout{padding:.25rem 1rem .75rem}.villages-letter-paper{padding:1rem}.villages-letter-heading{padding-bottom:.4rem}.villages-letter-heading .villages-letter-face{width:3rem;height:3rem;font-size:2rem}}
        @media(max-width:704px){.villages-mailbox-overlay{padding:0}.villages-founding-dialog:has(.villages-letter-layout){width:100%;max-width:100%;height:100%;max-height:100%;border:0;border-radius:0}.villages-founding-dialog:has(.villages-letter-layout)>header{padding:.7rem 1rem .35rem}.villages-letter-layout{display:flex;padding:.4rem .8rem .8rem;gap:0}.villages-letter-list,.villages-letter-paper{flex:1}.villages-letter-layout[data-detail=true] .villages-letter-list{display:none}.villages-letter-layout[data-detail=false] .villages-letter-paper{display:none}.villages-letter-paper{padding:1.2rem}.villages-letter-heading .villages-letter-face{width:5rem;height:5rem}.villages-founding-dialog .villages-letter-paper .villages-letter-back{display:block;align-self:flex-start;margin:0 0 .7rem;border:0;background:transparent;color:#59442f;padding:.4rem 0;font:1rem Georgia,serif;box-shadow:none}.villages-letter-error{margin:0 .8rem}}
        @media(max-width:704px) and (max-height:700px){.villages-letter-paper{padding:.75rem}.villages-letter-heading .villages-letter-face{width:3rem;height:3rem}.villages-founding-dialog .villages-letter-paper .villages-letter-back{margin-bottom:.25rem}}
      `}</style>
        {error || loadError ? (
          <p className="villages-letter-error" role="alert">
            {error || loadError}
          </p>
        ) : null}
        <div className="villages-letter-layout" data-detail={detail}>
          <nav className="villages-letter-list" aria-label="Letters">
            <div className="villages-letter-list-head">
              <div className="villages-letter-folders" aria-label="Mailbox folders">
                <button
                  type="button"
                  aria-pressed={folder === "inbox"}
                  onClick={() => {
                    setFolder("inbox");
                    setSelection(null);
                    setComposing(false);
                  }}
                >
                  Inbox
                </button>
                <button
                  type="button"
                  aria-pressed={folder === "sent"}
                  onClick={() => {
                    setFolder("sent");
                    setSelection(null);
                    setComposing(false);
                  }}
                >
                  Sent
                </button>
              </div>
              <button className="villages-letter-compose" type="button" onClick={() => write()}>
                Write a letter
              </button>
            </div>
            <div className="villages-letter-rows">
              {(view?.recovery ?? [])
                .filter((row) => !letters.some(({ message }) => message.id === row.messageId))
                .map((row) => (
                  <article key={row.messageId}>
                    <p>{row.label}</p>
                    <div className="villages-letter-actions">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void action(retryPath(row.threadId, row.messageId))}
                      >
                        Retry
                      </button>
                    </div>
                  </article>
                ))}
              {shown.length === 0 ? (
                <p className="villages-letter-empty">{folder === "inbox" ? "No letters yet." : "No sent letters."}</p>
              ) : null}
              {shown.map(({ thread, message }) => (
                <button
                  className="villages-letter-row"
                  type="button"
                  key={thread.id + message.id}
                  aria-pressed={selection?.threadId === thread.id && selection.messageId === message.id && !composing}
                  onClick={() => {
                    setSelection({ threadId: thread.id, messageId: message.id });
                    setComposing(false);
                  }}
                >
                  <AvatarFace
                    portrait={portraits[thread.residentId]}
                    name={thread.residentName}
                    className="villages-letter-face"
                  />
                  <span>
                    <strong>{thread.residentName}</strong>
                    <small>
                      {message.fromId !== "player" && !message.read
                        ? `New · ${new Date(message.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
                        : message.text}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </nav>
          <section className="villages-letter-paper" aria-label="Personal mail" data-reading={!!selected && !composing}>
            <button
              type="button"
              className="villages-letter-back"
              onClick={() => {
                setSelection(null);
                setComposing(false);
              }}
            >
              ‹ Back to letters
            </button>
            {readError ? (
              <div role="alert">
                <p>{readError}</p>
                <div className="villages-letter-actions">
                  <button type="button" onClick={() => setReadAttempt((attempt) => attempt + 1)}>
                    Retry reading
                  </button>
                </div>
              </div>
            ) : null}
            {composing ? (
              <>
                <div className="villages-letter-heading">
                  <h2>Write a letter</h2>
                </div>
                <div className="villages-letter-compose-fields">
                  <label>
                    To
                    <select
                      aria-label="Recipient"
                      value={recipient}
                      onChange={(event) => setRecipient(event.target.value)}
                    >
                      <option value="">Choose a resident</option>
                      {people.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Message
                    <textarea
                      autoComplete="off"
                      aria-label="Personal message"
                      maxLength={4000}
                      value={draft}
                      onChange={(event) => setDrafts((current) => ({ ...current, [recipient]: event.target.value }))}
                    />
                  </label>
                </div>
                <div className="villages-letter-actions">
                  <button type="button" disabled={busy || !recipient || !draft.trim()} onClick={() => void send()}>
                    Send letter
                  </button>
                </div>
              </>
            ) : selected ? (
              <>
                <div className="villages-letter-heading">
                  <div>
                    <h2>{selected.thread.residentName}</h2>
                    <small>{selected.message.fromId === "player" ? "Your letter" : "Personal letter"}</small>
                  </div>
                  <button
                    type="button"
                    className="villages-letter-reading"
                    aria-pressed={simpleText}
                    onClick={() => {
                      const next = !simpleText;
                      setSimpleText(next);
                      try {
                        localStorage.setItem("villages-letter-simple", String(next));
                      } catch {
                        /* Keep session preference. */
                      }
                    }}
                  >
                    Simple text {simpleText ? <span aria-hidden="true">✓</span> : null}
                  </button>
                  <AvatarFace
                    portrait={portraits[selected.thread.residentId]}
                    name={selected.thread.residentName}
                    className="villages-letter-face"
                  />
                </div>
                <LetterPages
                  key={selected.thread.id + ":" + selected.message.id}
                  text={selected.message.text}
                  fontId={fontId}
                  simpleText={simpleText}
                  fontRevision={fontRevision}
                  sender={selected.message.fromId !== "player" ? sender : undefined}
                />
                {selected.message.error ? <p role="status">{selected.message.error}</p> : null}
                <div className="villages-letter-actions">
                  {selected.message.fromId !== "player" &&
                  people.some((person) => person.id === selected.thread.residentId) ? (
                    <button type="button" onClick={() => write(selected.thread.residentId)}>
                      Write back
                    </button>
                  ) : null}
                  {selected.message.retryAvailable ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void action(retryPath(selected.thread.id, selected.message.id))}
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="villages-letter-empty">Choose a letter to read.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
