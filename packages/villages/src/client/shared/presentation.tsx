import type {
  SceneView,
  StoryEntry,
  VillageBuildingOption,
  VillageHappening,
  VillagerAgendaView,
  VillageRecap,
  VillageSnapshot,
  VillageStoryPace,
  VillageVenue,
} from "../../shared/contracts/village.js";
import { ELEMENT_TAG } from "./constants.js";
import type { EngineConnectionRow, VillageConnectionOption, VillagesStyledNode } from "./types.js";
import { isHouse, venueClassesFor, venueSpaceFor } from "./venue.js";
import { parseVillagesInlineMarkdown, type VillagesMarkdownNode } from "./villages-inline-markdown";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * A stamp as a wall-clock time, or nothing when there is not one to read.
 *
 * The one formatter behind both the story's stamps and the chat log's, because
 * the two are the same question asked of the same string. An absent or
 * unparseable stamp draws nothing rather than an epoch date.
 */
export function stampTime(at: string): string {
  if (at.length === 0) return "";
  const when = new Date(at);
  return Number.isNaN(when.getTime()) ? "" : CLOCK_TIME.format(when);
}

/**
 * The time of day a memory was written, when it was written with one.
 *
 * This is the only place a memory's `at` is ever used, and it is formatted
 * rather than compared — the day the memory belongs to arrived as a label
 * already, so nothing here has to work out what "today" means or in whose
 * timezone.
 */
export function storyTime(entry: StoryEntry): string {
  return stampTime(entry.occurredAt);
}

/**
 * Which place an id names, for the panel that prints the table.
 *
 * The id is the only thing the translation stores, on purpose — a stored name
 * would re-point at whatever building now answers to it. So the name is looked
 * up at the moment it is drawn, out of the places the player can see in the
 * settings panel, and an id that matches nothing is said to match nothing rather
 * than left blank. That distinction is the point of showing this at all: "the
 * translator said nowhere" and "the place it named has been deleted" look
 * identical in the drawer, and only one of them is a fault.
 */
export function remapPlaceName(venues: readonly VillageVenue[], venueId: string): string {
  return venues.find((venue) => venue.id === venueId)?.name ?? "a place that is gone";
}

export function agendaMinuteLabel(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export function agendaUpdatePending(view: VillagerAgendaView): boolean {
  const active = view.agenda?.activeDay;
  if (!active) return false;
  const future = view.agenda?.week?.[active.weekday];
  return !!future && JSON.stringify(active.blocks) !== JSON.stringify(future);
}

/**
 * The picture of one place, or `""` for one that has never been drawn.
 *
 * A room is keyed by its place and holds the place's NAME, not its picture, and
 * that is deliberate on the server's side: a place can be redrawn while a room is
 * open in it, and the room's record must not be a copy of a picture from before
 * the redraw. So the lookup happens here, once, out of the village's own list.
 */
export function venuePictureOf(venues: readonly VillageVenue[], room: SceneView): string {
  const venue = venues.find((entry) => entry.id === room.placeId);
  if (!venue) return "";
  if (room.area === "outside") return venue.presentation.image?.url ?? "";
  if (room.zoneId && venue.zones) return venue.zones.find((zone) => zone.id === room.zoneId)?.image?.url ?? "";
  if (room.area === "private")
    return venue.privateSpaces?.find((entry) => entry.ownerId === room.privateOwnerId)?.image?.url ?? "";
  return (room.spaceClass ? venueSpaceFor(venue, room.spaceClass).image : null)?.url ?? "";
}

/**
 * The Engine's connection list, reduced to what a picker can draw.
 *
 * Video connections are dropped rather than shown greyed out: the village never
 * generates video, so offering one would be a choice that cannot be made.
 * Anything that is not an image connection is a language connection, which is
 * the same rule the Engine's own dropdowns apply.
 */
export function connectionOptionsFrom(rows: readonly EngineConnectionRow[]): VillageConnectionOption[] {
  const options: VillageConnectionOption[] = [];
  for (const row of rows) {
    const id = typeof row.id === "string" ? row.id.trim() : "";
    if (id.length === 0) continue;
    const provider = typeof row.provider === "string" ? row.provider : "";
    if (["video_generation", "decision", "audio_generation"].includes(provider)) continue;
    const name = typeof row.name === "string" && row.name.trim() ? row.name.trim() : id;
    options.push({
      id,
      name,
      category: provider === "image_generation" ? "image_generation" : "language",
      defaultForAgents: row.defaultForAgents === true || row.defaultForAgents === "true",
    });
  }
  return options;
}

/**
 * A villager's line, drawn rather than printed.
 *
 * The reading of it is not here — it is `parseVillagesInlineMarkdown`, a copy of
 * the Engine's own reader, and the reasons for both the copy and the split are in
 * that module. What lives here is the translation from its nodes to elements,
 * because the class names are this file's and because the mapping is the part a
 * regression can only check by reading, not by running.
 *
 * Two of the six marks are the ENGINE'S OWN element and get no class at all:
 * `**bold**` is a `<strong>` and `*italic*` is an `<em>`, and the theme's fonts
 * already say what those mean. The rest need a word of styling the browser does
 * not supply on its own — see the sheet, where the three classes are one short
 * block and where the Engine's own version of them lives (scoped there to
 * `.mari-message-content`, which is what keeps it from being reused as-is).
 *
 * `keyPrefix` exists because these nodes are drawn inside lists — the history's
 * messages, and the two halves of a `***bold-italic***` — where React wants a key
 * and the position is the only identity there is. The Engine's own reader passes
 * one for the same reason.
 *
 * ponytail: nothing here is memoised, because a villager's line is read once per
 * draw and a paragraph is a few hundred characters. If a transcript ever grows
 * long enough for the reading to show up in a profile, the upgrade path is a
 * `useMemo` per message keyed on its content, not a change to the reader.
 */
export function villagesSpeechPaintStyle(value: string | undefined): CSSProperties | undefined {
  const paint = value?.trim();
  if (!paint || /url\(|;|expression\(/i.test(paint)) return undefined;
  if (/^(?:linear|radial|conic)-gradient\(/i.test(paint)) {
    return CSS.supports("background-image", paint)
      ? {
          backgroundImage: paint,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        }
      : undefined;
  }
  return CSS.supports("color", paint) ? { color: paint } : undefined;
}

export function renderVillagesMarkdown(text: string, keyPrefix: string): ReactNode {
  return drawVillagesNodes(parseVillagesInlineMarkdown(text), keyPrefix);
}

export function drawVillagesNodes(nodes: readonly VillagesMarkdownNode[], keyPrefix: string): ReactNode[] {
  let key = 0;
  return nodes.map((node) => {
    const at = `${keyPrefix}${key++}`;
    switch (node.kind) {
      // A string in an array needs no key, and a key on one would be noise.
      case "text":
        return node.text;
      case "code":
        return (
          <code key={at} className={`${ELEMENT_TAG}-chat-md-code`} dir="ltr">
            {node.text}
          </code>
        );
      case "link":
        return (
          <a
            key={at}
            className={`${ELEMENT_TAG}-chat-md-link`}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {node.text}
          </a>
        );
      default:
        return drawVillagesStyled(node, at);
    }
  });
}

/** The six marks, one element each. Bold-italic is the two the Engine nests. */
function drawVillagesStyled(node: VillagesStyledNode, at: string) {
  const children = drawVillagesNodes(node.children, `${at}-`);
  switch (node.style) {
    case "bold":
      return <strong key={at}>{children}</strong>;
    case "bold-italic":
      return (
        <strong key={at}>
          <em>{children}</em>
        </strong>
      );
    case "italic":
      return <em key={at}>{children}</em>;
    case "underline":
      return <u key={at}>{children}</u>;
    case "strikethrough":
      return <del key={at}>{children}</del>;
    default:
      return (
        <mark key={at} className={`${ELEMENT_TAG}-chat-md-highlight`}>
          {children}
        </mark>
      );
  }
}

/**
 * `"Morning"`, `"Morning and Evening"`, `"Morning, Afternoon and Evening"`.
 *
 * Written out as a sentence rather than joined with commas alone, because the
 * one caller reads it back to the player as a statement about what will happen,
 * and `"Morning, Evening"` reads like two unrelated things.
 */
export function storyPaceSummary(pace: VillageStoryPace): string {
  if (pace === "off")
    return "Automatic Events and new wishes are paused. Existing wishes can still be fulfilled or expire.";
  if (pace === "quiet") return "Usually one optional village story is written on an active day.";
  if (pace === "lively") return "Up to three optional village stories may be written on an active day.";
  return "Usually one to three optional village stories are written on an active day, averaging two.";
}

/**
 * Whether a place is a house, which is the one question the whole place list
 * turns on.
 *
 * Read as "does this place SAY it is a house", and read that way because the two
 * ways of being wrong are not the same size. A place wrongly counted as a
 * destination is offered to the model as somewhere a villager can be sent, and
 * the model answers with the number of the one it means — so a house in that list
 * is a villager sent to a place whose only reading is "at home". A place wrongly
 * counted as a house is offered to nobody, and the cost is a destination that
 * never gets chosen.
 *
 * It counts a BUILDING rather than an occupant, so an empty house the player
 * placed and has not filled yet is still a house. That is what lets the founding
 * wizard's four pins be four houses long before they are four people.
 *
 * This is the tab's copy of the server's `isHousePlace`, and it is a copy on
 * purpose: the server owns the record and this only decides what to draw and what
 * to offer. The alternative — sending the answer down beside every place — is a
 * field that could only ever restate what the record already says, and a field
 * that disagrees with the record it restates is the exact failure one list was
 * meant to end.
 */

/** And the other half of the same list: everywhere a villager can be sent. */
export function destinationPlaces(places: readonly VillageVenue[]): VillageVenue[] {
  return places.filter((place) => !isHouse(place) || venueClassesFor(place).some((item) => item !== "residence"));
}

/**
 * A stable key for a row the player adds by hand — a venue, a home. Uniqueness
 * only has to hold within the open editor; the server mints the real id.
 */
export function freshRowKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Four decimal places is finer than a pixel on any map and keeps stored numbers readable. */
export function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

/*
  The two halves of the corner readout, built once rather than per render.
  The locale is deliberately left to the platform — `undefined` means "whatever
  this machine is set to" — which is what decides between 2:30 PM and 14:30
  without the tab needing a setting of its own for it.
*/
const CLOCK_DATE = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });

const CLOCK_TIME = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

/**
 * How often an open tab checks whether the village has moved on.
 *
 * A minute, against a clock that turns over four times a day. Fine enough that
 * nothing the village does can be noticed late, coarse enough that the check
 * itself is never the thing anyone is waiting for — and nearly every check ends
 * at the first question, because the part of the day has not changed.
 */
export const VILLAGE_PULSE_MS = 60_000;

/**
 * How long a write-up has to be running before the tab admits to it.
 *
 * The common tick is the one that finds nothing to write and answers in a few
 * milliseconds, and a chip that blinks on every check would train the player to
 * ignore the one place real news is allowed to appear — the same corner that
 * carries every error. The rare tick that has a part of the day to catch up on
 * takes seconds, and that is the one worth saying something about.
 */
export const SHOW_CATCHING_UP_AFTER_MS = 700;

function clockLabel(now: Date): string {
  return `${CLOCK_DATE.format(now)} · ${CLOCK_TIME.format(now)}`;
}

/**
 * The real date and time, always current.
 *
 * The label is held as the string rather than as a `Date`, so the once-a-second
 * tick produces a different string once a minute and React skips the other
 * fifty-nine renders instead of redrawing the tab every second for nothing.
 *
 * ponytail: this reads the DEVICE clock, which is the same thing as the
 * village's own clock only while the village derives it from real time. If the
 * village ever keeps time of its own, this has to read the snapshot again.
 */
function useRealClock(): string {
  const [label, setLabel] = useState(() => clockLabel(new Date()));
  useEffect(() => {
    const timer = setInterval(() => setLabel(clockLabel(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  return label;
}

/**
 * The corner readout on the map.
 *
 * A component of its own so the once-a-minute tick re-renders this span and
 * nothing else — putting the hook in the view would redraw the whole tab, map
 * included, every time the minute turned over.
 */
function MobileHudClock() {
  const [date, time] = useRealClock().split(" · ");
  return (
    <span className={`${ELEMENT_TAG}-mobile-clock`}>
      <span>{date}</span>
      <strong>{time}</strong>
    </span>
  );
}

export function HomeDateWeather({ weather }: { weather: string }) {
  return (
    <span className={`${ELEMENT_TAG}-mobile-datetime`}>
      <MobileHudClock />
      <span role="img" aria-label={`Weather: ${weather || "unknown"}`} title={weather || "Weather unavailable"}>
        {weatherEmoji(weather)}
      </span>
    </span>
  );
}

function weatherEmoji(weather: string): string {
  if (/thunder/u.test(weather)) return "⛈️";
  if (/snow/u.test(weather)) return "❄️";
  if (/sleet/u.test(weather)) return "🌨️";
  if (/rain|drizzle/u.test(weather)) return "🌧️";
  if (/fog|haze/u.test(weather)) return "🌫️";
  if (/wind|breez/u.test(weather)) return "🌬️";
  if (/overcast/u.test(weather)) return "☁️";
  if (/frost/u.test(weather)) return "🥶";
  if (/hot|heat/u.test(weather)) return "☀️";
  return "🌤️";
}

/** The Engine's own node for this tab: everything the tab draws is inside it. */
function hostOf(node: Element | null): HTMLElement | null {
  return node?.closest<HTMLElement>(ELEMENT_TAG) ?? null;
}

// ── DORMANT 0.4.45 — the orientation reading, and what it was read for. ──────
//
// Two functions, both of them only ever called by the notice that asked a phone
// held upright to turn over. That notice is dormant below, and its stylesheet
// half is dormant beside the coarse-pointer block in the sheet, and the tab is
// drawn for portrait now — so neither of these is reached by anything.
//
// `hostOf` above is NOT part of this and is still live and still called — the
// fullscreen toggle uses it on every press, and it is the only way back to the
// Engine's node from a control inside the tab. Only the orientation reading and
// the two questions built on it are dormant.
//
// Kept, not deleted, for the same reason the notice is: the map is still a wide
// picture in a fitted frame, and a later lane that wants a sideways map again
// wants these back with it. Uncomment this and the notice below, uncomment the
// CSS block in the stylesheet, and put `<RotateNotice />` back on the homepage.
//
// /** The screen's orientation object, where the browser has one to offer. */
// function screenOrientation(): ScreenOrientation | null {
//   return screen.orientation ?? null;
// }
//
// /**
//  * Whether the phone is upright, as far as this browser is willing to say.
//  *
//  * Safari on an iPhone answers "portrait-primary" whichever way the phone is
//  * being held, so reading it there would hide the map from somebody already
//  * holding it the right way round. Being unsure which way up a phone is and
//  * saying nothing is the only answer that is never wrong — and the stylesheet,
//  * which asks the screen directly, still gets the notice right.
//  *
//  * The same shape of question as the fullscreen button's: the browser is the one
//  * that knows, and this never guesses on its behalf.
//  */
// function isPhoneUpright(): boolean {
//   const orientation = screenOrientation();
//   if (!orientation || typeof orientation.lock !== "function") return false;
//   return orientation.type === "portrait-primary" || orientation.type === "portrait-secondary";
// }

/**
 * The way onto the whole screen, and the only way this tab has of getting one.
 *
 * The Engine cannot help here: its capability mount is a plain element in a tab
 * with no fullscreen control of its own, and GachaForge draws its own button for
 * exactly the same reason — so this one lives on the map with the rest of the
 * tab's controls rather than in a header this package does not have.
 *
 * The screen is asked for on the HOST, not on the map's frame. The host is the
 * one node a re-render does not replace, and a fullscreen element that is
 * replaced takes the fullscreen state with it — the map would go fullscreen and
 * then lose the screen the next time the snapshot arrived.
 *
 * It is not stateful beyond the one fact it has to draw. The browser is already
 * keeping the answer, so it is read back off document.fullscreenElement; a copy
 * in this component would be a second answer to the same question, and the two
 * would disagree the first time the player pressed Escape.
 */
export function FullscreenToggle() {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const sync = () => setFull(hostOf(document.fullscreenElement) !== null);
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // Some phones — an iPhone is the one that matters — will not give a page the
  // whole screen at all. The button stays where it is and says so, because a
  // control that comes and goes with the browser is a control nobody can find
  // twice; there is nothing else this tab can offer in its place.
  const available = document.fullscreenEnabled;
  const label = available
    ? full
      ? "Leave the whole screen"
      : "Use the whole screen"
    : "This browser will not give the tab the whole screen";

  return (
    <button
      type="button"
      className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-icon-button`}
      disabled={!available}
      aria-pressed={full}
      aria-label={label}
      title={label}
      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
        const host = hostOf(event.currentTarget);
        if (!host) return;
        if (document.fullscreenElement === host) {
          void document.exitFullscreen().catch(() => undefined);
          return;
        }
        const request = host.requestFullscreen?.();
        if (request) void request.catch(() => undefined);
      }}
    >
      {/* Inside out while the screen is ours: the same four corners pointing the
          other way, rather than a different picture to learn. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {full ? (
          <path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4" />
        ) : (
          <path d="M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5" />
        )}
      </svg>
    </button>
  );
}

/**
 * Visual-only Events prose, behind the button in the map's own top corner.
 * Until structured Events land, this feed never grounds narration, wishes,
 * memories, notices, or venue state. Its old entries remain readable here.
 *
 * The news used to be a column of the homepage: a gutter down one side of the
 * map, held open whether or not there was anything to put in it, and paid for by
 * the map on every screen. On a phone held sideways there is no width to hold it
 * open with, and a map fitted to whatever the news left of the tab is a strange
 * price for reading the news. So it is a disclosure: the button says the feed is
 * there and the panel unrolls beneath it, over the picture.
 *
 * A details element rather than a button and a box of state, because being open
 * or shut, the Enter and Space keys, and the expanded-or-collapsed announcement
 * are all the element's own and cannot drift out of step with the panel. The one
 * thing it does not do by itself is close when the player presses somewhere
 * else, which is what the component adds: a panel that can only be dismissed by
 * finding the button again would sit over the map for the whole game.
 *
 * What it says is what the column said. Deliberately not the noticeboard, which
 * is the other half of the same idea: the board is what the villagers say TO
 * each other, in their own handwriting, and most of it is a request; this is what
 * HAPPENED to the place, in the narrator's voice, and none of it is aimed at
 * anybody. A village with a full board and a quiet feed is getting on with
 * things.
 *
 * ponytail: it lists every happening the server keeps and scrolls, rather than
 * folding them by day or paging them. Forty short lines is a scroll, not a
 * problem; the day it is one is the day to group them.
 */
export function VillageEvents({
  happenings,
  recap,
  mobile = false,
  inline = false,
}: {
  happenings: readonly VillageHappening[];
  recap: VillageRecap | null;
  mobile?: boolean;
  inline?: boolean;
}) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  // Whether the panel is open is the element's own business, so this mirrors it
  // rather than owning it: two answers to one question are two answers that can
  // disagree, and the dismissal below has to know when there is something to
  // dismiss.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const node = detailsRef.current;
    if (!node) return;
    const sync = () => setOpen(node.open);
    node.addEventListener("toggle", sync);
    return () => node.removeEventListener("toggle", sync);
  }, []);

  // A pointerdown on the summary is inside the element, so it does not dismiss
  // it; a keydown on Enter while the summary has focus is; anything outside is.
  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (!(event.target instanceof Node) || detailsRef.current?.contains(event.target)) return;
      detailsRef.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", outside);
    };
  }, [open]);

  const content = (
    <div className={`${ELEMENT_TAG}-news-panel`}>
      <h2 className={`${ELEMENT_TAG}-news-title`}>Events</h2>
      {recap ? (
        <div>
          <strong>While you were away</strong>
          {recap.details.length > 0 ? (
            <ul className={`${ELEMENT_TAG}-news-list`}>
              {recap.details.map((entry) => (
                <li key={`recap-${entry.id}`} className={`${ELEMENT_TAG}-news-item`}>
                  {entry.text}
                </li>
              ))}
            </ul>
          ) : null}
          {recap.summaries.map((summary) => (
            <p key={summary} className={`${ELEMENT_TAG}-news-empty`}>
              {summary}
            </p>
          ))}
          {recap.pendingDecisionCount > 0 ? (
            <p className={`${ELEMENT_TAG}-news-empty`}>
              {recap.pendingDecisionCount} pending{" "}
              {recap.pendingDecisionCount === 1 ? "decision needs" : "decisions need"} your attention.
            </p>
          ) : null}
        </div>
      ) : null}
      {happenings.length === 0 ? (
        <p className={`${ELEMENT_TAG}-news-empty`}>No events to show yet.</p>
      ) : (
        <ul className={`${ELEMENT_TAG}-news-list`}>
          {happenings.map((entry) => (
            <li key={entry.id} className={`${ELEMENT_TAG}-news-item`}>
              {entry.text}
              {entry.socialOutcome ? (
                <details>
                  <summary>Social encounter recorded</summary>
                  <p>This interaction was recorded separately from its visual description.</p>
                  {entry.socialOutcome.changes.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  if (inline) return content;

  return (
    <details ref={detailsRef} className={`${ELEMENT_TAG}-news`}>
      <summary className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-news-toggle`} aria-label="Events (NYI)">
        {/* A page and its lines: the news keeps happening, and the button says
            where it is rather than how much of it there is. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <path d="M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
          <path d="M8 8h7M8 12h7M8 16h4" />
        </svg>
        {!mobile ? "Events" : null}
        <span className={`${ELEMENT_TAG}-news-nyi`}>NYI</span>
      </summary>
      {content}
    </details>
  );
}

// ── DORMANT 0.4.45 — the notice that told a phone held upright to turn. ───────
//
// One component and the one helper only it used. It drew a full-bleed panel
// over the whole tab — a phone on its side, "Landscape only", a sentence saying
// why the village wanted a wide screen, and a **Play in landscape** button that
// asked for the screen and then asked the screen to turn — and it was shown by a
// portrait-and-coarse-pointer media query rather than by any state.
//
// It is switched off, and it is not retired. 0.4.45 draws the tab for portrait,
// so the sentence it carried is no longer true: the village is still a map and a
// map still wants a wide screen, but the tab no longer refuses to work without
// one. It is left in the file rather than deleted because the decision is not
// final — see the DORMANT CSS block in the stylesheet, which is the other half
// of it and which carries the whole argument for keeping the pair.
//
// NOTE FOR WHOEVER UNCOMMENTS THIS: the media query that showed the notice was
// `z-index: 5` and the chat drawer is `z-index: 3`, so a portrait phone with a
// conversation open had the notice painted over the conversation. That is not a
// reason to leave it dormant; it is a thing to fix on the way back in.
//
// /**
//  * What a phone held upright is told, and the only thing it is told.
//  *
//  * Almost all of this is CSS. The notice is hidden by default and shown by a
//  * portrait-and-touch media query, so it costs a desktop nothing and cannot get
//  * out of step with the layout: there is no listener and no state keeping the two
//  * in agreement, because there is only one of them. A coarse pointer is part of
//  * that test and is not decoration — a narrow desktop window is not a rotated
//  * phone, and telling somebody to turn their monitor would be absurd.
//  *
//  * The button exists for the one thing CSS cannot do, which is hold the screen
//  * sideways. Automatic rotation is a phone setting, and a phone with it switched
//  * off would otherwise be told to turn by a page that will not turn.
//  *
//  * screen.orientation.lock is not in every browser, so it is read off the object
//  * rather than assumed, and it is refused outright wherever the document is not
//  * itself fullscreen — which is why the screen is asked for first, and waited
//  * for. Only a refusal changes the sentence, into the one fact that is still true
//  * once the browser has said it cannot do it: the phone's own setting is holding
//  * the screen upright.
//  */
// /**
//  * Ask the screen to turn, and say whether it agreed.
//  *
//  * The whole screen is asked for first and WAITED for, because a rotation lock is
//  * refused outright wherever the document is not already fullscreen and the
//  * request for one does not finish before the next line runs. Starting both at
//  * once looks like it should work and never does: the lock is asked of a document
//  * that has not been given the screen yet.
//  *
//  * Every other browser, and every phone whose own rotation setting is off, comes
//  * back empty-handed, and that is a fact about the phone rather than an error to
//  * be shown — GachaForge answers it the same way, by leaving the notice up and
//  * changing what it says. So it is reported as an answer, not thrown.
//  */
// async function playLandscape(host: HTMLElement | null): Promise<boolean> {
//   try {
//     if (!document.fullscreenElement && host?.requestFullscreen) await host.requestFullscreen();
//     await screenOrientation()?.lock?.("landscape");
//     return true;
//   } catch {
//     return false;
//   }
// }
//
// function RotateNotice() {
//   // On a browser that will say which way up the phone is, and says it is
//   // upright, the phone's own rotation setting is the likely reason the page has
//   // not turned — so that is the thing to point at from the start rather than to
//   // wait to be asked. A browser that will not say is not being called a liar,
//   // only an unknown, and gets the sentence that is true either way.
//   const [lockedLikely, setLockedLikely] = useState(() => isPhoneUpright());
//   return (
//     <div className={`${ELEMENT_TAG}-rotate`} role="note">
//       <span aria-hidden="true" className={`${ELEMENT_TAG}-rotate-phone`}>
//         {/* A phone on its side, with the turn drawn on both sides of it. */}
//         <svg
//           viewBox="0 0 48 32"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.6"
//           strokeLinecap="round"
//           focusable="false"
//         >
//           <rect x="15" y="6" width="18" height="20" rx="2.5" />
//           <circle cx="24" cy="22.5" r="1" fill="currentColor" stroke="none" />
//           <path d="M6 16h4M10 12.5 13.5 16 10 19.5M42 16h-4M38 12.5 34.5 16 38 19.5" />
//         </svg>
//       </span>
//       <p className={`${ELEMENT_TAG}-rotate-title`}>Landscape only</p>
//       <p className={`${ELEMENT_TAG}-rotate-note`}>
//         {lockedLikely
//           ? "The screen would not turn: switch off the phone's rotation lock, then turn the phone on its side."
//           : "The village is a map, and a map wants a wide screen."}
//       </p>
//       {screenOrientation()?.lock ? (
//         <button
//           type="button"
//           className={`${ELEMENT_TAG}-button`}
//           onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
//             // Only a refusal is reported: a screen that turns takes the notice
//             // with it, because the media query that shows it stops matching.
//             void playLandscape(hostOf(event.currentTarget)).then((turned) => {
//               if (!turned) setLockedLikely(true);
//             });
//           }}
//         >
//           Play in landscape
//         </button>
//       ) : null}
//     </div>
//   );
// }

/**
 * What a house is called, from whoever lives in it.
 *
 * A village does not name its houses: everybody there knows where everybody
 * lives, so the person IS the name, and "Professor Mari's house" is what a
 * villager would say. The player's own house is named by the same rule out of the
 * same field, because the player lives in a house like everybody else does — and
 * the day the player can move, the map will not have to be taught a second rule
 * to say where they went. It used to be the one house with a rule of its own: the
 * map called it "You" and the place screen called it "Your house", which made the
 * player's home a different KIND of thing from every other home on the map.
 *
 * `occupant` is a personal name, and every name here takes the possessive the
 * same way but one. "You" is what `playerDisplayName` falls back to for a village
 * nobody has been described in; it is the one word that arrives here that is not
 * a name, so it is the one that cannot be put in the possessive. That one house
 * says "Your house" at the start of a sentence and "your house" inside one.
 *
 * `startOfSentence` is the whole of that difference and it is the caller's to
 * answer, because only the caller knows where its own text begins: a pin and a
 * title begin one, and the look-around is read mid-sentence.
 */
function houseLabel(occupant: string, startOfSentence: boolean): string {
  const owner = occupant === "You" ? (startOfSentence ? "Your" : "your") : `${occupant}'s`;
  return `${owner} house`;
}

/**
 * What a house's pin says: whose it is, and nothing else.
 *
 * A house nobody has moved into is waiting rather than nameless, and "Empty
 * house" says that where the name of a building would say nothing about the one
 * thing the player is looking for — which is whether anybody lives here yet.
 */
export function pinText(occupant: string): string {
  return occupant.length > 0 ? houseLabel(occupant, true) : "Empty house";
}

/**
 * What a building is called and the class it belongs to, as the village named
 * them. A kind the tab was not handed — reachable only from a document written
 * by some later version — is drawn by its own name rather than as a blank row.
 */
export function buildingOf(buildings: readonly VillageBuildingOption[], kind: string | null): VillageBuildingOption {
  if (kind === null) return { kind: "", name: "Venue residence", category: "" };
  return buildings.find((option) => option.kind === kind) ?? { kind, name: kind, category: "" };
}

/** How a house's pin reads at a glance: yours, someone's, or nobody's yet. */
export function pinTone(place: { isPlayerHome: boolean; occupant: string }): "player" | "resident" | "empty" {
  if (place.isPlayerHome) return "player";
  return place.occupant ? "resident" : "empty";
}

/**
 * What the screen standing in a place is called.
 *
 * A house is named by who lives in it rather than by its own name, because the
 * village does not give houses names — everybody knows where everybody lives —
 * and the player's own house is named the same way out of the same reader. A
 * named house still says its name once nobody has moved in, which is the one case
 * where the name is the only true thing about it.
 *
 * A landmark is its own name, and the village never made one without one: the
 * server drops a place with no name and nothing to make it a house, so the last
 * arm here is reached only by an empty house.
 */
export function venueTitle(place: Pick<VillageVenue, "name">, occupant: string): string {
  if (occupant.length > 0) return houseLabel(occupant, true);
  return place.name || "An empty house";
}

/**
 * Where a place stands on the picture, or null when nobody has drawn it yet.
 *
 * One reader for the question, because the answer is two fields that are only ever
 * a position together: half a spot is not a place, and a caller that reads `x` and
 * forgets to ask about `y` puts a pin on the left-hand edge of the map.
 */
export function placeSpot(place: VillageVenue | null | undefined): { x: number; y: number } | null {
  if (!place) return null;
  return place.presentation.x === null || place.presentation.y === null
    ? null
    : { x: place.presentation.x, y: place.presentation.y };
}

/** Read a picked picture as a data URL, which is the only form the village stores. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("That picture could not be read."));
    reader.readAsDataURL(file);
  });
}

/**
 * How large a picture is, read from the picture itself.
 *
 * The size comes off the decoded image rather than off the file's own metadata:
 * this is the number the panel compares against the size the map expects, and
 * the browser is the thing that will actually draw it. A header that disagrees
 * with the pixels would make the tab warn about the wrong picture.
 */
export function measureImage(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => {
      image.onload = image.onerror = null;
      reject(new Error("The picture is taking too long to open. Try again."));
    }, 30_000);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("That picture could not be read."));
    };
    image.src = src;
  });
}

/** A number brought inside a range. The drag is the only caller that can leave one. */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * What this village calls the player, for the two places that print it.
 *
 * The name is the Persona's, cached on the village the last time it wrote it out,
 * and there is no second candidate. This used to read `settings.playerName` — a
 * typed name the village kept beside the Persona — and when the Persona took that
 * question over the field stopped being sent while the reads stayed. Both of them
 * fell through to the fallback on every turn of every conversation, so the drawer
 * and the conversation record called the player "You" however carefully they had
 * said who they were.
 *
 * A Persona whose link is broken still answers with the copy the village kept of
 * it, exactly as the prompts do: the player loses the notice, not their name. "You"
 * is left for a village nobody has been described in, which is the same word the
 * prompts use for that case.
 *
 * It is handed the snapshot rather than its settings box on purpose: every field
 * this tab reads out of the village arrives as `snapshot.settings.<field>`, and a
 * reader that takes the box on its own is a reader the check in
 * `tests/villages-settings-drift.regression.ts` cannot see.
 */
export function playerDisplayName(snapshot: VillageSnapshot | undefined): string {
  const playerPersonaName = snapshot?.settings.playerPersonaName;
  return typeof playerPersonaName === "string" ? playerPersonaName.trim() || "You" : "You";
}
