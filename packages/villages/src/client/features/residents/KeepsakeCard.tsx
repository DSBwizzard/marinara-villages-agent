import { useEffect, useState } from "react";
import type { Keepsake } from "../../../shared/contracts/mailbox.js";
import { request } from "../../shared/api.js";

export function KeepsakeCard({ scope, gift }: { scope: string; gift: Keepsake }) {
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const path = `/keepsakes/${encodeURIComponent(gift.id)}/illustration?scope=${scope}`;
  useEffect(() => {
    const abort = new AbortController();
    void request<{ image: string }>(path, { signal: abort.signal }).then(
      (result) => {
        if (!abort.signal.aborted) setImage(result.image);
      },
      (cause) => {
        if (!abort.signal.aborted) setError(String(cause.message ?? cause));
      },
    );
    return () => abort.abort();
  }, [path]);
  async function illustrate() {
    setBusy(true);
    setError("");
    try {
      setImage((await request<{ image: string }>(path, { method: "POST" })).image);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not illustrate the Keepsake.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <figure style={{ margin: "1rem 0", maxWidth: "28rem" }}>
      {image ? (
        <img src={image} alt={gift.caption} style={{ display: "block", width: "100%", borderRadius: "6px" }} />
      ) : null}
      <figcaption>
        {gift.caption} · {gift.sender} · {new Date(gift.at).toLocaleDateString()}
      </figcaption>
      {!image ? (
        <button type="button" disabled={busy} onClick={() => void illustrate()}>
          {busy ? "Illustrating…" : "Generate illustration"}
        </button>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </figure>
  );
}
