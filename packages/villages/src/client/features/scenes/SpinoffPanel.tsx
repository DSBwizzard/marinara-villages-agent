import { useVillageActivity, useVisibleInterval } from "../../shared/activity.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { createContext, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import type { SceneView } from "../../../shared/contracts/village.js";
import { SPINOFF_EXPLANATION, type SpinoffView } from "../../../shared/contracts/spinoff.js";
import { messageFrom, request } from "../../shared/api.js";
import { SceneErrorChip } from "./scene-errors.js";
import { ELEMENT_TAG } from "../../shared/constants.js";

type Host = {
  startScene?: (options: {
    originId: string;
    prompt: string;
    data: { spinoffId: string };
  }) => Promise<{ chatId: string } | null>;
  openChat?: (chatId: string) => void;
  focusSceneOriginId?: string;
  onFocusSceneOriginHandled?: () => void;
};
type CapabilityElement = HTMLElement & { capabilityProps?: Host };
export const SpinoffErrorContext = createContext("");
export const SpinoffActionContext = createContext<(() => void) | undefined>(undefined);

/** The whole return review stays player-visible; none of this recap is resident prompt context. */
export function SpinoffPanel({
  element,
  scene,
  onLocked,
  onResolved,
  children,
}: {
  element: HTMLElement;
  scene: SceneView | null;
  onLocked: (locked: boolean) => void;
  onResolved: () => Promise<void>;
  children: ReactNode;
}) {
  const { visible } = useVillageActivity();
  const [value, setValue] = useState<SpinoffView | null>(null);
  const [residentId, setResidentId] = useState("");
  const [idea, setIdea] = useState("");
  const [showStart, setShowStart] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<{ sceneId: string | null; message: string }>({ sceneId: null, message: "" });
  const error = !scene || failure.sceneId === scene.id ? failure.message : "";
  const latestScene = useRef(scene);
  useEffect(() => {
    latestScene.current = scene;
  }, [scene]);
  useEffect(() => {
    setErrorOpen(false);
  }, [scene?.id]);
  const [errorOpen, setErrorOpen] = useState(false);
  const [host, setHost] = useState<Host>((element as CapabilityElement).capabilityProps ?? {});
  const alive = useRef(true);
  const requestId = useRef<string | null>(null);
  const locked = !!value && value.status !== "resolved";
  const available = !locked && scene?.status === "active" && !!scene.activeIds.length && !!host.startScene;
  const start = useCallback(() => setShowStart(true), []);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const result = await request<{ spinoff: SpinoffView | null }>("/spinoffs/active", {
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000),
    });
    if (alive.current && !signal?.aborted) setValue(result.spinoff);
  }, []);
  useEffect(() => {
    alive.current = true;
    const update = () => setHost((element as CapabilityElement).capabilityProps ?? {});
    update();
    element.addEventListener("marinara-capability-props", update);
    return () => {
      alive.current = false;
      element.removeEventListener("marinara-capability-props", update);
    };
  }, [element]);
  const needsRecovery = locked || !!scene?.spinoffPending;
  useEffect(() => {
    if (!needsRecovery || !visible) return;
    let current = true;
    const update = () => {
      const originSceneId = latestScene.current?.id ?? null;
      void refresh().catch((cause) => {
        if (current && alive.current)
          setFailure({ sceneId: originSceneId, message: messageFrom(cause, "Could not read your spinoff.") });
      });
    };
    update();
    element.addEventListener("marinara-capability-props", update);
    window.addEventListener("focus", update);
    return () => {
      current = false;
      element.removeEventListener("marinara-capability-props", update);
      window.removeEventListener("focus", update);
    };
  }, [element, refresh, needsRecovery, scene?.id, visible]);
  useEffect(() => {
    onLocked(locked ? !browsing : showStart);
    return () => onLocked(false);
  }, [locked, browsing, showStart, onLocked]);
  useEffect(() => {
    if (!showStart || locked) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowStart(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [showStart, locked]);
  useVisibleInterval((signal) => refresh(signal), value?.status === "running" && !busy ? 5_000 : null);
  useEffect(() => {
    if (host.focusSceneOriginId && value?.sessionId === host.focusSceneOriginId) host.onFocusSceneOriginHandled?.();
  }, [host, value?.sessionId]);
  const savedSelection = JSON.stringify(value?.selectionIds ?? value?.memories.map((memory) => memory.id) ?? []);
  useEffect(() => {
    setSelected(JSON.parse(savedSelection));
  }, [value?.id, savedSelection]);
  useEffect(() => {
    if (value?.status === "resolved") requestId.current = null;
  }, [value?.status]);

  async function work(action: () => Promise<void>) {
    if (busy) return;
    const originSceneId = scene?.id ?? null;
    setErrorOpen(false);
    setBusy(true);
    setFailure({ sceneId: originSceneId, message: "" });
    try {
      await action();
    } catch (cause) {
      if (alive.current)
        setFailure({ sceneId: originSceneId, message: messageFrom(cause, "The spinoff could not be updated.") });
    } finally {
      if (alive.current) {
        setBusy(false);
        await refresh().catch(() => undefined);
      }
    }
  }
  async function finish(ids: string[]) {
    if (!value) return;
    const result = await request<{ spinoff: SpinoffView }>("/spinoffs/resolve", {
      method: "POST",
      body: JSON.stringify({ sessionId: value.sessionId, acceptedIds: ids }),
    });
    if (!alive.current) return;
    setValue(result.spinoff);
    setShowStart(false);
    requestId.current = null;
    await onResolved();
  }
  async function launch() {
    setBrowsing(false);
    if (!scene || !host.startScene) throw new Error("This Engine does not expose spinoff scene navigation.");
    requestId.current ??= createVillagesClientId();
    const result = await request<{ spinoff: SpinoffView }>("/spinoffs/begin", {
      method: "POST",
      body: JSON.stringify({
        sessionId: scene.id,
        residentId: residentId || scene.activeIds[0],
        revision: scene.sceneRevision,
        requestId: requestId.current,
      }),
    });
    if (!alive.current) return;
    setValue(result.spinoff);
    const launched = await host.startScene({
      originId: scene.id,
      prompt: idea.trim() || "Continue this Village encounter as a short shared outing.",
      data: { spinoffId: result.spinoff.id },
    });
    if (!launched && alive.current) {
      const current = await request<{ spinoff: SpinoffView }>("/spinoffs/active");
      if (current.spinoff?.status === "prepared") {
        await request("/spinoffs/resolve", {
          method: "POST",
          body: JSON.stringify({ sessionId: scene.id, acceptedIds: [] }),
        });
        requestId.current = null;
      }
    }
  }
  const button = ELEMENT_TAG + "-button";
  const input = ELEMENT_TAG + "-input";
  return (
    <SpinoffActionContext.Provider value={available ? start : undefined}>
      <SpinoffErrorContext.Provider value={scene ? error : ""}>{children}</SpinoffErrorContext.Provider>
      {locked || showStart ? (
        <section
          aria-label="Spinoff"
          role={browsing && locked ? "region" : "dialog"}
          aria-modal={browsing && locked ? undefined : true}
          style={
            !(locked && browsing)
              ? {
                  position: "absolute",
                  inset: 0,
                  zIndex: 30,
                  background: "var(--background, #171923)",
                  overflow: "auto",
                  padding: "1rem",
                }
              : {
                  position: "absolute",
                  top: 0,
                  right: 0,
                  zIndex: 30,
                  background: "var(--background, #171923)",
                  padding: ".5rem 1rem",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }
          }
        >
          {locked && browsing ? (
            <>
              <p>Your spinoff with {value.residentName} is pending. Villages is read-only.</p>
              <button className={button} onClick={() => setBrowsing(false)}>
                Return to spinoff controls
              </button>
            </>
          ) : null}
          <div hidden={locked && browsing}>
            {!locked ? (
              <>
                <h2>Start a spinoff · proof of concept</h2>
                <button className={button} onClick={() => setShowStart(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <h2>Spinoff with {value.residentName}</h2>
            )}
            {showStart || locked ? (
              <>
                <p>{SPINOFF_EXPLANATION}</p>
                {locked ? (
                  <p>
                    Anchored to {new Date(value.anchoredAt).toLocaleString(undefined, { timeZone: value.timeZone })}{" "}
                    {value.timeZone}. Village time and residents’ later agendas continue. Finish or discard this spinoff
                    before starting another Village interaction.
                  </p>
                ) : null}
                {!locked && scene ? (
                  <>
                    <label>
                      Resident{" "}
                      <select
                        className={input}
                        value={residentId || scene.activeIds[0] || ""}
                        onChange={(event) => setResidentId(event.target.value)}
                      >
                        {scene.participants
                          .filter((person) => scene.activeIds.includes(person.characterId))
                          .map((person) => (
                            <option key={person.characterId} value={person.characterId}>
                              {person.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Spinoff idea{" "}
                      <textarea
                        autoComplete="off"
                        className={input}
                        maxLength={600}
                        value={idea}
                        onChange={(event) => setIdea(event.target.value)}
                      />
                    </label>
                    <button
                      className={button}
                      disabled={busy || !scene.activeIds.length}
                      onClick={() => void work(launch)}
                    >
                      Continue in Engine
                    </button>
                  </>
                ) : null}
                {value?.status === "prepared" ? (
                  <>
                    <p>
                      The spinoff is prepared. If Engine planning was cancelled or failed, discard this handoff and
                      start again.
                    </p>
                    <button className={button} disabled={busy} onClick={() => void work(() => finish([]))}>
                      Discard prepared spinoff
                    </button>
                  </>
                ) : null}
                {value?.status === "running" ? (
                  <>
                    <p>
                      Your spinoff is open in Engine. End Scene brings its recap back; Discard or deleting the Engine
                      scene returns without memories.
                    </p>
                    <button
                      className={button}
                      disabled={busy || !host.openChat}
                      onClick={() => value.chatId && host.openChat?.(value.chatId)}
                    >
                      Go to spinoff
                    </button>
                    <button className={button} disabled={busy} onClick={() => void work(refresh)}>
                      Check for return
                    </button>
                  </>
                ) : null}
                {value?.status === "returned" ? (
                  <>
                    <h3>Engine recap · for your review</h3>
                    <p style={{ whiteSpace: "pre-wrap" }}>{value.summary}</p>
                    {value.eligibility === "unreviewed" ? (
                      <button
                        className={button}
                        disabled={busy}
                        onClick={() =>
                          void work(async () => {
                            const result = await request<{ spinoff: SpinoffView }>("/spinoffs/prepare", {
                              method: "POST",
                              body: JSON.stringify({ sessionId: value.sessionId, retry: !!value.preparationAttempted }),
                              signal: AbortSignal.timeout(100000),
                            });
                            if (alive.current) setValue(result.spinoff);
                          })
                        }
                      >
                        {value.preparationAttempted
                          ? "Retry memory preparation · may make another paid call"
                          : "Prepare memories · uses your text connection"}
                      </button>
                    ) : (
                      <>
                        <p style={{ whiteSpace: "pre-wrap" }}>{value.explanation}</p>
                        {value.eligibility === "compatible" ? (
                          <>
                            <p>
                              Choose which eligible memories to save. Compatibility is assessed by AI and may be
                              mistaken; decline any unsuitable memory.
                            </p>
                            {value.memories.map((memory) => (
                              <div key={memory.id}>
                                <label>
                                  <input
                                    autoComplete="off"
                                    type="checkbox"
                                    disabled={value.selectionIds !== undefined}
                                    checked={selected.includes(memory.id)}
                                    onChange={(event) =>
                                      setSelected((ids) =>
                                        event.target.checked
                                          ? [...ids, memory.id]
                                          : ids.filter((id) => id !== memory.id),
                                      )
                                    }
                                  />{" "}
                                  {memory.text}
                                </label>
                                <details>
                                  <summary>Supporting conversation</summary>
                                  {memory.evidence.map((line) => (
                                    <blockquote key={line.id}>{line.quote}</blockquote>
                                  ))}
                                </details>
                              </div>
                            ))}
                            <button
                              className={button}
                              disabled={busy}
                              onClick={() => void work(() => finish(value.selectionIds ?? selected))}
                            >
                              Save selected memories and return
                            </button>
                          </>
                        ) : (
                          <p>This spinoff stays outside Village memory.</p>
                        )}
                      </>
                    )}
                    <button
                      className={button}
                      disabled={busy || !!value.selectionIds?.length}
                      onClick={() => void work(() => finish([]))}
                    >
                      Keep this spinoff separate and return
                    </button>
                  </>
                ) : null}
              </>
            ) : null}
            {busy ? <p role="status">Working…</p> : null}
            {error && scene ? (
              <div className={`${ELEMENT_TAG}-scene-modal-errors ${ELEMENT_TAG}-spinoff-error-notice`}>
                <SceneErrorChip
                  items={[
                    {
                      id: "spinoff",
                      title: "Spinoff request failed",
                      message: error,
                      fields: [{ label: "Scene", value: scene.placeName }],
                    },
                  ]}
                  open={errorOpen}
                  onOpen={setErrorOpen}
                />
              </div>
            ) : error ? (
              <p role="alert">{error}</p>
            ) : null}
            {locked ? (
              <button className={button} disabled={busy} onClick={() => setBrowsing(true)}>
                Browse Villages read-only
              </button>
            ) : null}
          </div>
        </section>
      ) : null}
    </SpinoffActionContext.Provider>
  );
}
