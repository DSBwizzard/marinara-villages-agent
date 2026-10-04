import { useEffect, useState } from "react";

type Profile = {
  characterId: string;
  name: string;
  warmth: number;
  trust: number;
  warmthLabel: string;
  trustLabel: string;
  familiarity: number;
  friend: boolean;
  close: boolean;
  knownAt: string;
  closeKnownAt: string;
  routine: string[];
  interests: string;
  wishes: string[];
  ties: { toId: string; name: string; warmth: number; trust: number; reasons: string[] }[];
  learned: { text: string; kind: string; at: string }[];
  access: { venueId: string; zoneId: string; active: boolean; name: string }[];
};
type CreatorTie = {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  warmth: number;
  trust: number;
  proposed: boolean;
};
type View = {
  profiles: Profile[];
  starting: {
    pending: boolean;
    spoilers: boolean;
    summaries: { fromId: string; toId: string; fromName: string; toName: string; status: string }[];
    values?: CreatorTie[];
  };
};
type Request = <T>(path: string, options?: RequestInit) => Promise<T>;
const date = (value: string) => (value ? new Date(value).toLocaleString() : "Not yet learned");

function Feeling({ name, value, label }: { name: string; value: number; label?: string }) {
  return (
    <label className="villages-relationship-meter">
      <span>
        {name}{" "}
        <strong>
          {value > 0 ? "+" : ""}
          {value}
        </strong>
        {label ? ` · ${label}` : ""}
      </span>
      <meter min={-100} max={100} value={value} aria-label={`${name}: ${value}${label ? `, ${label}` : ""}`} />
    </label>
  );
}

/** Ordinary profiles receive only the server's earned/last-known projection. */
export function VillagesRelationships({
  request,
  prefix,
  onVenue,
}: {
  request: Request;
  prefix: string;
  onVenue: (id: string) => void;
}) {
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [acknowledge, setAcknowledge] = useState(false);
  const [selected, setSelected] = useState("");
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      void request<View>("/relationships")
        .then((next) => {
          if (!cancelled) setView(next);
        })
        .catch((cause) => {
          if (!cancelled) setError(cause instanceof Error ? cause.message : "Relationships could not be read.");
        });
    };
    refresh();
    const interval = window.setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [request]);
  const action = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    try {
      setView(await request<View>("/relationships/creator", { method: "POST", body: JSON.stringify(body) }));
      setAcknowledge(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Relationships could not be saved.");
    } finally {
      setBusy(false);
    }
  };
  const button = `${prefix}-button`;
  return (
    <section className={`${prefix}-overlay villages-relationships`} aria-label="Villager relationships">
      <style>{`
      .villages-relationships { display:grid; gap:1rem; }
      .villages-relationship-card, .villages-relationship-setup { background:linear-gradient(135deg,#122545,#192c51); border:1px solid #405580; border-radius:1rem; padding:1rem; color:#e5eaff; }
      .villages-relationship-card h3 { margin:0 0 .75rem; }
      .villages-relationship-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr)); gap:1rem; }
      .villages-relationship-meter { display:grid; gap:.35rem; margin:.75rem 0; }
      .villages-relationship-meter meter { width:100%; height:1rem; accent-color:#b2a0ff; }
      .villages-relationships details { border-top:1px solid #405580; padding:.75rem 0; }
      .villages-relationships summary { cursor:pointer; font-weight:600; }
      .villages-relationships p { line-height:1.5; }
      .villages-relationship-tie { padding:.6rem 0; border-bottom:1px solid #405580; }
      .villages-relationship-editor { display:flex; flex-wrap:wrap; gap:.75rem; align-items:end; }
      .villages-relationship-editor label { display:grid; gap:.35rem; }
      .villages-relationship-editor input, .villages-relationships select { background:#0d1b33; color:#e5eaff; border:1px solid #7286b0; border-radius:.4rem; padding:.5rem; max-width:100%; }
      .villages-relationship-editor input { width:7rem; }
      .villages-relationships button:focus-visible, .villages-relationships summary:focus-visible { outline:2px solid #bbabff; outline-offset:3px; }
    `}</style>
      <header>
        <h2>Relationships</h2>
        <p>
          Warmth is how someone feels about your company. Trust is their confidence in you. Each villager has their own
          feelings.
        </p>
      </header>
      {error ? <p role="alert">{error}</p> : null}
      {!view ? (
        <p role="status">Reading relationships…</p>
      ) : (
        <>
          <details className="villages-relationship-setup" open={view.starting.pending || undefined}>
            <summary>{view.starting.pending ? "Review starting ties" : "Relationship creator"}</summary>
            {view.starting.pending ? (
              <>
                <p>
                  These suggestions use explicit existing history. Accept them, start neutral, or reveal values to
                  adjust them. Creator choices do not tell your player character private information.
                </p>
                <div className="villages-relationship-grid">
                  {view.starting.summaries
                    .filter((tie) => tie.status !== "No established history")
                    .map((tie) => (
                      <p key={`${tie.fromId}:${tie.toId}`}>
                        {tie.fromName} → {tie.toName}: <strong>{tie.status}</strong>
                      </p>
                    ))}
                </div>
                {view.starting.summaries.every((tie) => tie.status === "No established history") ? (
                  <p>No established history was found. Unspecified ties begin neutral.</p>
                ) : null}
                <button
                  type="button"
                  className={button}
                  disabled={busy}
                  onClick={() => void action({ action: "accept" })}
                >
                  Accept suggested ties
                </button>{" "}
                <button
                  type="button"
                  className={button}
                  disabled={busy}
                  onClick={() => void action({ action: "neutral" })}
                >
                  Start neutral
                </button>
              </>
            ) : null}
            {!view.starting.spoilers ? (
              <>
                <p>
                  Revealing values exposes relationships you have not discovered in gameplay and allows editing them.
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={acknowledge}
                    onChange={(event) => setAcknowledge(event.target.checked)}
                  />{" "}
                  I understand this reveals gameplay spoilers.
                </label>
                <p>
                  <button
                    type="button"
                    className={button}
                    disabled={!acknowledge || busy}
                    onClick={() => void action({ action: "acknowledge", spoilerAcknowledged: true })}
                  >
                    Reveal and edit relationship values
                  </button>
                </p>
              </>
            ) : (
              <>
                <p>Creator values are visible for this village. Exact reasons remain learned through gameplay.</p>
                <button
                  type="button"
                  className={button}
                  disabled={busy}
                  onClick={() => void action({ action: "hide" })}
                >
                  Hide spoiler values
                </button>
                <p>
                  <select
                    aria-label="Directional relationship to edit"
                    value={selected}
                    onChange={(event) => setSelected(event.target.value)}
                  >
                    <option value="">Choose a direction…</option>
                    {view.starting.values?.map((tie) => (
                      <option key={`${tie.fromId}:${tie.toId}`} value={`${tie.fromId}:${tie.toId}`}>
                        {tie.fromName} → {tie.toName}
                        {tie.proposed ? " · proposed" : ""}
                      </option>
                    ))}
                  </select>
                </p>
                {view.starting.values
                  ?.filter((tie) => `${tie.fromId}:${tie.toId}` === selected)
                  .map((tie) => (
                    <form
                      key={`${selected}:${tie.warmth}:${tie.trust}`}
                      className="villages-relationship-editor"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const values = new FormData(event.currentTarget);
                        void action({
                          action: "edit",
                          fromId: tie.fromId,
                          toId: tie.toId,
                          warmth: Number(values.get("warmth")),
                          trust: Number(values.get("trust")),
                        });
                      }}
                    >
                      <label>
                        Warmth
                        <input
                          name="warmth"
                          type="number"
                          min={-100}
                          max={100}
                          step={1}
                          required
                          defaultValue={tie.warmth}
                        />
                      </label>
                      <label>
                        Trust
                        <input
                          name="trust"
                          type="number"
                          min={-100}
                          max={100}
                          step={1}
                          required
                          defaultValue={tie.trust}
                        />
                      </label>
                      <button type="submit" className={button} disabled={busy}>
                        Save {tie.proposed ? "suggestion" : "values"}
                      </button>
                    </form>
                  ))}
              </>
            )}
          </details>
          <div className="villages-relationship-grid">
            {view.profiles.map((profile) => (
              <article key={profile.characterId} className="villages-relationship-card">
                <h3>{profile.name}</h3>
                <p>{profile.familiarity ? "You have established familiarity." : "No established familiarity yet."}</p>
                <Feeling name="Warmth toward you" value={profile.warmth} label={profile.warmthLabel} />
                <Feeling name="Trust toward you" value={profile.trust} label={profile.trustLabel} />
                <details>
                  <summary>Personal life</summary>
                  {!profile.knownAt ? (
                    <p>Friendship reveals more of their routine and interests.</p>
                  ) : (
                    <>
                      <p>
                        {profile.friend ? "Current shared information" : "Last known information"} ·{" "}
                        {date(profile.knownAt)}
                      </p>
                      <ul>
                        {profile.routine.map((line, index) => (
                          <li key={index}>{line}</li>
                        ))}
                      </ul>
                      <p>Interests: {profile.interests || "Not yet shared."}</p>
                    </>
                  )}
                  {profile.wishes.length ? (
                    <>
                      <p>Known wishes</p>
                      <ul>
                        {profile.wishes.map((wish, index) => (
                          <li key={index}>{wish}</li>
                        ))}
                      </ul>
                      {!profile.wishes.length ? <p>No current wish recorded.</p> : null}
                    </>
                  ) : (
                    <p>No wishes shared yet.</p>
                  )}
                  {profile.learned.map((entry, index) => (
                    <p key={index}>
                      {entry.kind}: {entry.text} <small>· {date(entry.at)}</small>
                    </p>
                  ))}
                </details>
                <details>
                  <summary>Feelings toward other villagers</summary>
                  {!profile.closeKnownAt ? (
                    <p>A close, trusted friendship reveals these meters. Reasons must be shared separately.</p>
                  ) : (
                    <>
                      <p>
                        {profile.close ? "Current feelings" : "Last known feelings"} · {date(profile.closeKnownAt)}
                      </p>
                      {profile.ties.map((tie) => (
                        <div className="villages-relationship-tie" key={tie.toId}>
                          <strong>
                            {profile.name} → {tie.name}
                          </strong>
                          <Feeling name="Warmth" value={tie.warmth} />
                          <Feeling name="Trust" value={tie.trust} />
                          <p>Why: {tie.reasons.length ? tie.reasons.join(" ") : "Not yet shared."}</p>
                        </div>
                      ))}
                    </>
                  )}
                </details>
                <details>
                  <summary>Ongoing access</summary>
                  {profile.access.length ? (
                    profile.access.map((access) => (
                      <p key={`${access.venueId}:${access.zoneId}`}>
                        <strong>{access.name}</strong> ·{" "}
                        {access.active ? "Available" : "Suspended until your relationship recovers"}{" "}
                        <button type="button" className={button} onClick={() => onVenue(access.venueId)}>
                          View Venue
                        </button>
                      </p>
                    ))
                  ) : (
                    <p>
                      Friendship can earn shared-home access. Personal and work areas need an explicit standing
                      invitation.
                    </p>
                  )}
                </details>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
