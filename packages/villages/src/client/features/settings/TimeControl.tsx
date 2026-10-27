import { useEffect, useRef, useState } from "react";
import type { VillageClockView, VillageTimeAdvance } from "../../../shared/contracts/clock.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { createVillagesClientId } from "../../shared/request-id.js";

const units = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };

/** Temporary development tool; remove before active playtesters are admitted. */
export function VillageTimeControl({
  snapshot,
  onAdvanced,
}: {
  snapshot: VillageSnapshot | null;
  onAdvanced: (snapshot: VillageSnapshot) => void;
}) {
  const [readClock, setClock] = useState<VillageClockView | null>(null);
  const clock =
    snapshot?.clock?.worldId &&
    snapshot.clock.worldId === readClock?.worldId &&
    snapshot.clock.revision >= readClock.revision &&
    Date.parse(snapshot.clock.instant ?? "") >= Date.parse(readClock.instant ?? "")
      ? snapshot.clock
      : readClock;
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState<keyof typeof units>("days");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [needsNewAction, setNeedsNewAction] = useState(false);
  const pending = useRef<VillageTimeAdvance | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void request<VillageClockView>("/clock", { signal: controller.signal })
      .then(setClock)
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Village time could not be read."));
      });
    return () => controller.abort();
  }, []);
  async function advance() {
    const milliseconds = Math.round(Number(amount) * units[unit]);
    if (!clock?.worldId || !Number.isSafeInteger(milliseconds) || milliseconds <= 0) {
      setError("Choose a positive duration.");
      return;
    }
    const action =
      pending.current?.milliseconds === milliseconds && pending.current.worldId === clock.worldId
        ? pending.current
        : { worldId: clock.worldId, revision: clock.revision, milliseconds, actionId: createVillagesClientId() };
    pending.current = action;
    setBusy(true);
    setError("");
    setResult("");
    try {
      const next = await request<VillageSnapshot>("/clock/advance", { method: "POST", body: JSON.stringify(action) });
      setClock(next.clock ?? null);
      onAdvanced(next);
      pending.current = null;
      setResult("Time advanced. Check Background work for model requests.");
    } catch (cause) {
      setError(messageFrom(cause, "Time advancement could not finish. Check the current time before retrying."));
      try {
        const current = await request<VillageClockView>(`/clock?actionId=${encodeURIComponent(action.actionId)}`);
        setClock(current);
        if (
          current.worldId !== action.worldId ||
          (current.revision !== action.revision && current.advanceReceipt?.actionId !== action.actionId)
        )
          setNeedsNewAction(true);
      } catch {
        /* Retain the original failure and retry identity. */
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={`${ELEMENT_TAG}-panel`} aria-label="Development time">
      <h3>Advance Village time</h3>
      <p>
        {clock?.instant
          ? new Date(clock.instant).toLocaleString(undefined, {
              timeZone: clock.timeZone,
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "Reading Village time…"}
      </p>
      {clock ? (
        <p>
          {clock.timeZone} · Advanced{" "}
          {((clock.advanceMs ?? 0) / 86_400_000).toLocaleString(undefined, { maximumFractionDigits: 3 })} days
        </p>
      ) : null}
      <div className={`${ELEMENT_TAG}-row`} style={{ flexWrap: "wrap" }}>
        <label>
          Amount{" "}
          <input
            autoComplete="off"
            aria-label="Time amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            disabled={busy}
            onChange={(event) => setAmount(event.currentTarget.value)}
            style={{ width: "6em" }}
          />
        </label>
        <select
          autoComplete="off"
          aria-label="Time unit"
          value={unit}
          disabled={busy}
          onChange={(event) => setUnit(event.currentTarget.value as keyof typeof units)}
        >
          {Object.keys(units).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          disabled={busy || needsNewAction || !clock?.worldId || !snapshot?.isFounded}
          onClick={() => void advance()}
        >
          {busy ? "Advancing…" : "Advance time"}
        </button>
        {needsNewAction ? (
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            onClick={() => {
              pending.current = null;
              setNeedsNewAction(false);
              setError("");
            }}
          >
            New advance
          </button>
        ) : null}
      </div>
      <p className={`${ELEMENT_TAG}-hint`}>Normal background work may use models. Days are 24 hours.</p>
      {result ? <p role="status">{result}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
    </section>
  );
}
