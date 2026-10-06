import type {
  ResidentSignature,
  ResidentSignatureImage,
  ResidentSignatureView,
} from "../../../engine/packages/shared/src/villages/resident-signature.js";
import { useEffect, useState } from "react";

const P = "marinara-capability-villages";
const flourishes = [
  "M12 22 Q95 12 184 18 Q214 20 202 10",
  "M18 23 Q98 28 194 14 M178 12 Q217 6 205 24",
  "M14 20 Q112 10 205 20",
  "M15 23 Q78 12 174 20 Q221 28 203 10 Q195 3 183 14",
];

type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
export function VillagerSignature({
  actorId,
  name,
  signature,
  saved,
  request,
}: {
  actorId: string;
  name: string;
  signature?: ResidentSignature;
  saved?: ResidentSignatureImage;
  request: Request;
}) {
  const [view, setView] = useState<ResidentSignatureView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [broken, setBroken] = useState("");
  const [refresh, setRefresh] = useState(0);
  const path = `/villagers/${encodeURIComponent(actorId)}/signature`;
  const running = view?.status === "running";
  useEffect(() => {
    const controller = new AbortController();
    const read = async () => {
      try {
        const result = await request<ResidentSignatureView>(path, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setView(result);
        }
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : "Signature could not be read.");
      }
    };
    void read();
    const timer = window.setInterval(() => void read(), running ? 2_000 : 30_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [path, request, refresh, running, signature, saved]);
  const local = view?.fallback ?? signature ?? { name, hand: "flowing", slant: 0, spacing: 0, flourish: 0 };
  const image = view?.saved ?? saved;
  const url = image?.image.url;
  const draw = async () => {
    if (!view || busy || running) return;
    setBusy(true);
    setError("");
    try {
      setView(
        await request<ResidentSignatureView>(path, {
          method: "POST",
          body: JSON.stringify({
            actionId: Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
              byte.toString(16).padStart(2, "0"),
            ).join(""),
            expectedAttempt: view.attempt,
          }),
        }),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Signature generation failed.");
      // Lost replies are read back; this never repeats the paid request.
      setRefresh((value) => value + 1);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={`${P}-signature`}>
      <div
        className={`${P}-signature-art`}
        role="img"
        aria-label={`${url && broken !== url ? image?.name : local.name}'s signature`}
      >
        {url && broken !== url ? (
          <img className={`${P}-signature-image`} src={url} alt="" onError={() => setBroken(url)} />
        ) : (
          <>
            <span
              className={`${P}-signature-name`}
              data-hand={local.hand}
              aria-hidden="true"
              dir="auto"
              style={{ transform: `rotate(${local.slant}deg)`, letterSpacing: `${local.spacing}px` }}
            >
              {local.name}
            </span>
            <svg className={`${P}-signature-flourish`} viewBox="0 0 220 32" aria-hidden="true">
              <path d={flourishes[local.flourish] ?? flourishes[0]} />
            </svg>
          </>
        )}
      </div>
      <div className={`${P}-signature-controls`}>
        {view?.available || view?.recoverable ? (
          <button type="button" disabled={busy || running} onClick={() => void draw()}>
            {busy || running
              ? "Generating signature…"
              : view.recoverable
                ? "Retry saving signature"
                : view.status === "failed" || view.status === "interrupted"
                  ? "Retry signature"
                  : image
                    ? "Regenerate signature"
                    : "Generate signature"}
          </button>
        ) : null}
        {error ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setRefresh((value) => value + 1);
            }}
          >
            Refresh signature
          </button>
        ) : null}
      </div>
      {view?.available && !view.recoverable && !busy && !running ? (
        <p>One image request. Saved signatures are reused.</p>
      ) : null}
      {view?.recoverable && !busy && !running ? (
        <p>The generated image is saved. Retry saving uses it without another image request.</p>
      ) : null}
      {view && !view.available ? <p>{view.unavailableReason} The local signature is available.</p> : null}
      {view?.status === "interrupted" ? (
        <p role="status">Generation was interrupted and may have been charged. Retry is deliberate.</p>
      ) : null}
      {error || view?.error ? <p role="alert">{error || view?.error}</p> : null}
    </div>
  );
}
