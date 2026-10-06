import type {
  MemoryCategory,
  MemoryLibrary,
  MemoryPerson,
  SceneView,
  WishHistoryPage,
} from "../../../shared/contracts/village.js";
import { messageFrom, request, requestHost } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { renderVillagesMarkdown, stampTime, storyTime } from "../../shared/presentation.js";
import type {
  AvatarCrop,
  EngineCharacterSummary,
  EnginePersonaRow,
  Portrait,
  PortraitMap,
} from "../../shared/types.js";
import { type CSSProperties, useState } from "react";

const MEMORY_CATEGORY_LABELS: Record<MemoryCategory, string> = {
  commitment: "Promise & obligation",
  "personal-fact": "Personal truth",
  preference: "Preference & boundary",
  relationship: "Relationship change",
  "shared-experience": "Shared experience",
};

function memoryNames(people: readonly MemoryPerson[]): string {
  return people.map((person) => person.name).join(", ") || "No resident recorded";
}

function recollectionTimeLeft(expiresAt: string, now: number): string {
  const remaining = Date.parse(expiresAt) - now;
  if (remaining <= 0) return "expiring now";
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.max(1, Math.ceil((remaining % 3_600_000) / 60_000));
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

export function VillagerMemoriesPanel({
  library,
  busy,
  onRefresh,
  onForget,
  characterId,
}: {
  library: MemoryLibrary | null;
  busy: boolean;
  onRefresh: () => void;
  onForget: (kind: "durable" | "recollections", id: string) => void;
  characterId: string;
}) {
  const [kind, setKind] = useState<"all" | "passing" | "durable">("all");
  const [query, setQuery] = useState("");
  const [evidence, setEvidence] = useState<{ visit: SceneView; lineIds: string[] } | null>(null);
  const [evidenceError, setEvidenceError] = useState("");
  const now = Date.now();
  const matches = (text: string, people: readonly MemoryPerson[]) =>
    (!query.trim() ||
      `${text} ${people.map((person) => person.name).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())) &&
    people.some((person) => person.id === characterId);
  const passing = (library?.recollections ?? []).filter((entry) =>
    matches(entry.text, [...entry.subjects, ...entry.knownBy]),
  );
  const durable = (library?.durable ?? []).filter((entry) =>
    matches(entry.text, [...entry.subjects, ...entry.knownBy]),
  );
  const openEvidence = async (visitId: string, lineIds: string[]) => {
    try {
      const response = await request<{ visit: SceneView }>(`/rooms/archive/${encodeURIComponent(visitId)}`);
      setEvidence({ visit: response.visit, lineIds });
      setEvidenceError("");
    } catch (cause) {
      setEvidence(null);
      setEvidenceError(messageFrom(cause, "The source Scene could not be read."));
    }
  };
  return (
    <div className={`${ELEMENT_TAG}-memory-library`}>
      <section className={`${ELEMENT_TAG}-memory-hero`}>
        <div>
          <span className={`${ELEMENT_TAG}-memory-kicker`}>Continuity, with receipts</span>
          <h3>What your villagers carry forward</h3>
          <p>
            Passing recollections keep conversations coherent for 24 hours. Durable memories retain witnessed
            commitments, facts, boundaries, and meaningful experiences. Exact transcripts remain separate from character
            knowledge.
          </p>
        </div>
        <div className={`${ELEMENT_TAG}-memory-stats`}>
          <span>
            <strong>{passing.length}</strong> passing
          </span>
          <span>
            <strong>{durable.length}</strong> durable
          </span>
        </div>
      </section>

      <div className={`${ELEMENT_TAG}-memory-layers`} aria-label="How Villages memory works">
        <article>
          <span>01</span>
          <strong>Passing</strong>
          <p>Useful context with a visible 24-hour expiry.</p>
        </article>
        <article>
          <span>02</span>
          <strong>Durable</strong>
          <p>Promises, truths, boundaries, bonds, and significant experiences.</p>
        </article>
        <article>
          <span>03</span>
          <strong>Archive</strong>
          <p>Word-for-word evidence, stored independently from character memory.</p>
        </article>
      </div>

      <div className={`${ELEMENT_TAG}-memory-toolbar`}>
        <div className={`${ELEMENT_TAG}-memory-tabs`} role="group" aria-label="Memory type">
          {(
            [
              ["all", "All"],
              ["passing", "Passing"],
              ["durable", "Durable"],
            ] as const
          ).map(([value, label]) => (
            <button key={value} type="button" data-active={kind === value} onClick={() => setKind(value)}>
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search memories…"
          aria-label="Search memories"
        />
        <button type="button" className={`${ELEMENT_TAG}-button`} disabled={busy} onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {library === null ? <p className={`${ELEMENT_TAG}-empty`}>Reading the village’s memory layers…</p> : null}
      {library && kind !== "durable" && passing.length > 0 ? (
        <section className={`${ELEMENT_TAG}-memory-section`}>
          <div className={`${ELEMENT_TAG}-memory-section-head`}>
            <div>
              <span className={`${ELEMENT_TAG}-memory-orb`} data-kind="passing">
                ◌
              </span>
              <h3>Passing recollections</h3>
            </div>
            <span>Quiet context · expires naturally</span>
          </div>
          <div className={`${ELEMENT_TAG}-memory-grid`}>
            {passing.map((entry) => {
              const source = entry.evidence[entry.evidence.length - 1] ?? { visitId: entry.visitId, lineIds: [] };
              return (
                <article key={entry.id} className={`${ELEMENT_TAG}-memory-card`} data-kind="passing">
                  <div className={`${ELEMENT_TAG}-memory-card-top`}>
                    <span className={`${ELEMENT_TAG}-memory-pill`}>Passing</span>
                    <span>{recollectionTimeLeft(entry.expiresAt, now)}</span>
                  </div>
                  <p className={`${ELEMENT_TAG}-memory-text`}>{entry.text}</p>
                  <dl>
                    <div>
                      <dt>About</dt>
                      <dd>{memoryNames(entry.subjects)}</dd>
                    </div>
                    <div>
                      <dt>Known by</dt>
                      <dd>{memoryNames(entry.knownBy)}</dd>
                    </div>
                  </dl>
                  {entry.reinforcementCount > 0 ? (
                    <p className={`${ELEMENT_TAG}-memory-reinforced`}>
                      ↻ Reinforced {entry.reinforcementCount} {entry.reinforcementCount === 1 ? "time" : "times"}
                    </p>
                  ) : null}
                  <div className={`${ELEMENT_TAG}-memory-card-actions`}>
                    <button type="button" onClick={() => void openEvidence(source.visitId, source.lineIds)}>
                      View evidence
                    </button>
                    <button type="button" disabled={busy} onClick={() => onForget("recollections", entry.id)}>
                      Let go
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {library && kind !== "passing" && durable.length > 0 ? (
        <section className={`${ELEMENT_TAG}-memory-section`}>
          <div className={`${ELEMENT_TAG}-memory-section-head`}>
            <div>
              <span className={`${ELEMENT_TAG}-memory-orb`} data-kind="durable">
                ✦
              </span>
              <h3>Durable memories</h3>
            </div>
            <span>Lasting meaning · no arbitrary Scene quota</span>
          </div>
          <div className={`${ELEMENT_TAG}-memory-grid`}>
            {durable.map((entry) => (
              <article key={entry.id} className={`${ELEMENT_TAG}-memory-card`} data-kind="durable">
                <div className={`${ELEMENT_TAG}-memory-card-top`}>
                  <span className={`${ELEMENT_TAG}-memory-pill`}>
                    {entry.memoryCategory
                      ? MEMORY_CATEGORY_LABELS[entry.memoryCategory]
                      : entry.kind === "favour"
                        ? "Fulfilled wish"
                        : "Legacy memory"}
                  </span>
                  <span>
                    {entry.dateLabel}
                    {storyTime(entry) ? ` · ${storyTime(entry)}` : ""}
                  </span>
                </div>
                <p className={`${ELEMENT_TAG}-memory-text`}>{entry.text}</p>
                <dl>
                  <div>
                    <dt>About</dt>
                    <dd>{memoryNames(entry.subjects)}</dd>
                  </div>
                  <div>
                    <dt>Known by</dt>
                    <dd>{memoryNames(entry.knownBy)}</dd>
                  </div>
                </dl>
                <div className={`${ELEMENT_TAG}-memory-card-actions`}>
                  {entry.evidence ? (
                    <button
                      type="button"
                      onClick={() => void openEvidence(entry.evidence!.visitId, entry.evidence!.lineIds)}
                    >
                      View evidence
                    </button>
                  ) : (
                    <span className={`${ELEMENT_TAG}-memory-legacy`}>No evidence link on this older memory</span>
                  )}
                  <button type="button" disabled={busy} onClick={() => onForget("durable", entry.id)}>
                    Forget
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {library && ((kind !== "durable" && passing.length) || (kind !== "passing" && durable.length)) === 0 ? (
        <div className={`${ELEMENT_TAG}-memory-empty`}>
          <span>✧</span>
          <h3>No memories match</h3>
          <p>Try another phrase or memory layer.</p>
        </div>
      ) : null}
      {evidenceError ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {evidenceError}
        </p>
      ) : null}
      {evidence ? (
        <section className={`${ELEMENT_TAG}-memory-evidence`}>
          <div className={`${ELEMENT_TAG}-memory-section-head`}>
            <div>
              <span className={`${ELEMENT_TAG}-memory-orb`} data-kind="archive">
                ⌁
              </span>
              <h3>Exact evidence · {evidence.visit.placeName}</h3>
            </div>
            <button type="button" onClick={() => setEvidence(null)} aria-label="Close evidence">
              ×
            </button>
          </div>
          <p>Only the cited archive lines are shown. The full Scene remains in DEBUG → Scenes.</p>
          <ol>
            {evidence.visit.lines
              .filter((line) => evidence.lineIds.includes(line.id))
              .map((line) => (
                <li key={line.id}>
                  <span>
                    <strong>{line.name || "Player"}</strong>
                    <small>
                      {stampTime(line.at)} · heard by{" "}
                      {line.heardBy
                        .map(
                          (id) => evidence.visit.participants.find((person) => person.characterId === id)?.name ?? id,
                        )
                        .join(", ") || "no one"}
                    </small>
                  </span>
                  {renderVillagesMarkdown(line.content, `memory-evidence-${line.id}-`)}
                </li>
              ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

/** How a wish's death day is said: a day, and never a time of day. */
const WISH_DEATH_DAY = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

/**
 * How old a wish is and when it dies, as the one trailing line the tab prints.
 *
 * Days and never a timestamp, because a wish is an ordinary thing somebody keeps
 * on their mind rather than an event with a clock on it, and because the only
 * date the village ever decided about this wish is which DAY it goes. Two facts,
 * said one after the other, and either can be missing: an `addedAt` that cannot
 * be read says nothing about age rather than reading as today, and a deadline
 * that cannot be read never expires — the safe direction the server chose,
 * repeated rather than guessed at with a date nobody wrote.
 *
 * ponytail: the age comes off the device clock at the moment the row is drawn.
 * That is the same clock as the village's own for exactly as long as the village
 * derives its time from real time — the ceiling `useRealClock` names — and the
 * line is refreshed by the tab's own read of the agendas rather than by a timer
 * of its own.
 */
export function wishLifetimeLabel(addedAt: string, expiresAt: string): string {
  const parts: string[] = [];
  const born = Date.parse(addedAt);
  if (Number.isFinite(born)) {
    const days = Math.floor((Date.now() - born) / 86_400_000);
    parts.push(days <= 0 ? "written today" : days === 1 ? "written yesterday" : `written ${days} days ago`);
  }
  // A wish without a readable deadline has no set expiry.
  const dies = Date.parse(expiresAt);
  parts.push(Number.isFinite(dies) ? `fades ${WISH_DEATH_DAY.format(new Date(dies))}` : "no set end");
  return parts.join(" · ");
}

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

/**
 * The card's framing, or null when it has none and when it cannot be read.
 *
 * A description of a picture is not a thing to trust, and the two ways one can
 * be wrong both end in a stretched face: a rectangle that runs off the edge of
 * the picture, and numbers that are not numbers. Both are refused rather than
 * clamped, and a refused crop is not an error the player is told about — the
 * picture is then drawn whole, which is what a card with no crop gets, and which
 * is what the Engine's own panels do with the same bad value.
 *
 * Decoded twice at most, because a persona's copy of this travels as a string
 * inside a string. Anything still a string after that is not a crop.
 */
export function readAvatarCrop(value: unknown): AvatarCrop | null {
  let crop: unknown = value;
  for (let depth = 0; depth < 2 && typeof crop === "string"; depth += 1) {
    try {
      crop = JSON.parse(crop);
    } catch {
      return null;
    }
  }
  if (!crop || typeof crop !== "object" || Array.isArray(crop)) return null;
  const stored = crop as Record<string, unknown>;
  const { srcX, srcY, srcWidth, srcHeight } = stored;
  if (isFiniteNumber(srcX) && isFiniteNumber(srcY) && isFiniteNumber(srcWidth) && isFiniteNumber(srcHeight)) {
    if (srcWidth <= 0 || srcHeight <= 0 || srcX < 0 || srcY < 0) return null;
    // A hair of slack for a rectangle that was rounded as it was written, which
    // is the same slack the Engine's own reader allows.
    if (srcX + srcWidth > 1.001 || srcY + srcHeight > 1.001) return null;
    return { srcX, srcY, srcWidth, srcHeight };
  }
  const { zoom, offsetX, offsetY, fullImage } = stored;
  if (!isFiniteNumber(zoom) || zoom <= 0 || !isFiniteNumber(offsetX) || !isFiniteNumber(offsetY)) return null;
  if (fullImage !== undefined && typeof fullImage !== "boolean") return null;
  return fullImage === undefined
    ? { zoom, offsetX, offsetY }
    : { zoom, offsetX, offsetY, fullImage: fullImage as boolean };
}

/**
 * The card's framing, as the styles the picture is drawn with.
 *
 * A rectangle is drawn by making the picture's box the crop's inverse and moving
 * it by the crop's own negative offset: a crop a quarter of the picture across is
 * drawn four times the box's width and slid left by the share it was cut from.
 * `object-fit: fill` is what makes those two cancel out into a plain,
 * undistorted enlargement — the box and the picture inside it share a shape by
 * construction, which is what the arithmetic is doing.
 *
 * That construction is also why the box this is drawn into has to be SQUARE: it
 * is the same square the crop is. A rectangle chosen in the avatar editor is
 * square in the source picture's own pixels, so it lands undistorted on a square
 * frame and on a tall one as a stretched face.
 *
 * The older shape needs none of that arithmetic — a zoom and an offset are
 * already a transform, and the box clips whatever is moved out of it. `fullImage`
 * is the one that asks for the letterbox instead of the crop, and a zoom of one
 * or less with no `fullImage` asks for nothing at all, exactly as it does in the
 * Engine.
 *
 * No crop returns no styles, which leaves the picture filling its box the way it
 * always would — the ordinary case for a card nobody has re-framed, not a fault.
 */
function avatarCropStyle(crop: AvatarCrop | null): CSSProperties {
  if (!crop) return {};
  if ("zoom" in crop) {
    const transform = `scale(${crop.zoom}) translate(${crop.offsetX}%, ${crop.offsetY}%)`;
    if (crop.fullImage) return { objectFit: "contain", transform };
    return crop.zoom <= 1 ? {} : { transform };
  }
  return {
    position: "absolute",
    width: `${100 / crop.srcWidth}%`,
    height: `${100 / crop.srcHeight}%`,
    left: `${(-crop.srcX / crop.srcWidth) * 100}%`,
    top: `${(-crop.srcY / crop.srcHeight) * 100}%`,
    maxWidth: "none",
    maxHeight: "none",
    objectFit: "fill",
  };
}

/**
 * The portraits behind a list of character ids, in one call.
 *
 * Empty ids never leave the tab, because a request for nothing is a request the
 * Engine has to answer and a drawer that has no villagers in it has no pictures
 * to draw. A failure is swallowed by the caller rather than handled here: the
 * fallback is the initial that was already being drawn, so there is no error
 * state to reach — a villager whose picture could not be read is a villager
 * wearing their initial, which is exactly what they wore before this existed.
 */
export async function readPortraits(ids: readonly string[], signal?: AbortSignal): Promise<PortraitMap> {
  if (ids.length === 0) return {};
  const rows = await requestHost<EngineCharacterSummary[]>("/api/characters/summaries", {
    method: "POST",
    body: JSON.stringify({ ids }),
    signal,
  });
  const portraits: PortraitMap = {};
  if (!Array.isArray(rows)) return portraits;
  for (const row of rows) {
    const id = typeof row?.id === "string" ? row.id : "";
    const url = typeof row?.avatarUrl === "string" ? row.avatarUrl.trim() : "";
    // The framing is read beside the picture rather than instead of it: a card
    // with a crop and no picture has nothing to frame, and a row with neither
    // leaves the villager in the initial they were already wearing.
    if (id.length > 0 && url.length > 0) portraits[id] = { url, crop: readAvatarCrop(row.avatarCrop) };
  }
  return portraits;
}

/**
 * The picture of the Persona the player is being in this village, if there is one.
 *
 * Read one at a time rather than as a list, and read by id, because the question
 * is about exactly one Persona: the one this village is written against. A list
 * would be the whole library crossing the wire — names, descriptions, galleries —
 * to find a single address in it.
 *
 * Null is the ordinary answer for a player who is being nobody: a village can be
 * played as the name and description the wizard took, with no Persona behind it
 * at all, and that player has no picture and is not missing one. A Persona whose
 * portrait was never given one answers with an empty path and lands here too — the
 * two are the same thing to the card, which draws the Engine's own person mark for
 * both. So does a Persona the player has since deleted: the Engine answers 404,
 * the caller drops it, and the card wears the mark.
 */
export async function readPersonaPortrait(personaId: string, signal?: AbortSignal): Promise<Portrait | null> {
  const id = personaId.trim();
  if (id.length === 0) return null;
  const row = await requestHost<EnginePersonaRow>(`/api/characters/personas/${encodeURIComponent(id)}`, { signal });
  const url = typeof row?.avatarPath === "string" ? row.avatarPath.trim() : "";
  if (url.length === 0) return null;
  return { url, crop: readAvatarCrop(row.avatarCrop) };
}

/**
 * A face, in one of the frames this tab draws faces in.
 *
 * The circle is the frame and the picture gives up its own shape to it — and now
 * gives up the part of itself the card was told to show, which is the one thing a
 * stored avatar is for. `overflow: hidden` on the frame plus the crop's own
 * styles is the whole of it: a crop is drawn by enlarging the picture inside the
 * box and pushing the rest of it out, so a frame that did not clip would be a
 * frame with the whole photograph still around it.
 *
 * A villager the Engine has no picture for wears their initial, which is not a
 * placeholder for a missing picture: it is what is drawn when there is no
 * picture, and it is the same frame either way.
 *
 * The player is the one face in this drawer that is nobody in the library, which
 * is what `glyph` is for. See it for why their missing picture is not an initial.
 */
export function AvatarFace({
  portrait,
  name,
  className,
  glyph = "initial",
}: {
  portrait: Portrait | undefined;
  name: string;
  /** The frame this face is drawn in: the list's circle, or the drawer's own box. */
  className: string;
  /**
   * What to draw when there is no picture to draw.
   *
   * `initial` is the villager's, whose name the player has just read off the map
   * and whose missing portrait the village says nothing more about. `person` is
   * the player's: they are the Persona they are being, the village may have been
   * told nothing about their face at all, and their name here can be several
   * words long — an initial off the front of it would be a letter from a name
   * nobody chose to be called by. So the Engine's own person mark is drawn
   * instead, which is the same glyph the Engine puts on the player's own turns in
   * its chats, and is the truer answer to which of the two is speaking.
   */
  glyph?: "initial" | "person";
}) {
  const [failedUrl, setFailedUrl] = useState("");
  return (
    <span aria-hidden="true" className={className}>
      {portrait && portrait.url !== failedUrl ? (
        <img
          src={portrait.url}
          alt=""
          style={avatarCropStyle(portrait.crop)}
          onError={() => setFailedUrl(portrait.url)}
        />
      ) : glyph === "person" ? (
        <svg className={`${ELEMENT_TAG}-person`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

export function WishHistory({
  characterId,
  total,
  busy,
  onCorrect,
}: {
  characterId: string;
  total: number;
  busy: boolean;
  onCorrect: (characterId: string, wishId: string) => Promise<void>;
}) {
  const [page, setPage] = useState<WishHistoryPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState("");
  const load = async (cursor?: string) => {
    setLoading(true);
    setFailure("");
    try {
      setPage(
        await request<WishHistoryPage>(
          `/agendas/${encodeURIComponent(characterId)}/history${cursor === undefined ? "" : `?cursor=${encodeURIComponent(cursor)}`}`,
        ),
      );
    } catch (error) {
      setFailure(messageFrom(error, "Wish history could not be read."));
    } finally {
      setLoading(false);
    }
  };
  return (
    <details
      className={`${ELEMENT_TAG}-agenda-notes`}
      onToggle={(event) => {
        if (event.currentTarget.open && !page && !loading) void load();
      }}
    >
      <summary>{`Wish history (${total})`}</summary>
      {failure ? <p role="alert">{failure}</p> : null}
      {loading ? <p>Loading wish history…</p> : null}
      <ul className={`${ELEMENT_TAG}-story`}>
        {page?.entries.map((entry) => (
          <li key={entry.sequence} className={`${ELEMENT_TAG}-wish-card`}>
            <p className={`${ELEMENT_TAG}-wish-text`}>{entry.wish.wish}</p>
            <p
              className={`${ELEMENT_TAG}-wish-meta`}
            >{`${entry.correctedAt ? "Corrected" : entry.kind === "fulfilled" ? "Fulfilled" : "Expired"} ${new Date(entry.correctedAt || entry.fulfilledAt).toLocaleDateString()}`}</p>
            {entry.kind === "fulfilled" && !entry.correctedAt ? (
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={busy || loading}
                onClick={() =>
                  void (async () => {
                    await onCorrect(characterId, entry.wish.id);
                    await load();
                  })()
                }
              >
                Mark as not fulfilled
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <button type="button" className={`${ELEMENT_TAG}-button`} disabled={loading} onClick={() => void load()}>
        Latest outcomes
      </button>
      {page?.nextCursor ? (
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          disabled={loading}
          onClick={() => void load(page.nextCursor!)}
        >
          Older outcomes
        </button>
      ) : null}
    </details>
  );
}
