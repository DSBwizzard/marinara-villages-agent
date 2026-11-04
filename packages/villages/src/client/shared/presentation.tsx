import type {
  SceneView,
  VillageBuildingOption,
  VillagerAgendaView,
  VillageSnapshot,
  VillageVenue,
} from "../../shared/contracts/village.js";
import { ELEMENT_TAG } from "./constants.js";
import type { EngineConnectionRow, VillageConnectionOption, VillagesStyledNode } from "./types.js";
import { isHouse, venueClassesFor, venueSpaceFor } from "./venue.js";
import { parseVillagesInlineMarkdown, type VillagesMarkdownNode } from "./villages-inline-markdown";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";

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
  if (room.zoneId && venue.zones) {
    const zone = venue.zones.find((zone) => zone.id === room.zoneId);
    if (!zone) return "";
    // A deliberate removal stays blank; old Entrance rows without artwork
    // keep their Venue-image fallback.
    if (zone.image !== undefined) return zone.image?.url ?? "";
    if (room.area !== "outside") return "";
  }
  if (room.area === "outside") return venue.presentation.image?.url ?? "";
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
 * How long a write-up has to be running before the tab admits to it.
 *
 * The common tick is the one that finds nothing to write and answers in a few
 * milliseconds, and a chip that blinks on every check would train the player to
 * ignore the one place real news is allowed to appear — the same corner that
 * carries every error. The rare tick that has a part of the day to catch up on
 * takes seconds, and that is the one worth saying something about.
 */

function clockLabel(now: Date, timeZone?: string): string {
  if (timeZone) {
    try {
      return (
        new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", timeZone }).format(now) +
        " · " +
        new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", timeZone }).format(now)
      );
    } catch {
      /* Legacy snapshots may not name an IANA zone. */
    }
  }
  return `${CLOCK_DATE.format(now)} · ${CLOCK_TIME.format(now)}`;
}

/**
 * The real date and time, always current.
 *
 * The label is held as the string rather than as a `Date`, so the once-a-second
 * tick produces a different string once a minute and React skips the other
 * fifty-nine renders instead of redrawing the tab every second for nothing.
 *
 * The server snapshot and saved village timezone are authoritative. A local
 * monotonic timer animates between snapshots; the browser clock is not authority.
 */
function useRealClock(village?: VillageSnapshot["village"], paused = false): string {
  const [label, setLabel] = useState(() => clockLabel(new Date(village?.instant || Date.now()), village?.timeZone));
  useEffect(() => {
    const epoch = Date.parse(village?.instant ?? "");
    const base = Number.isFinite(epoch) ? epoch : Date.now();
    const began = performance.now();
    const update = () =>
      setLabel(clockLabel(new Date(base + (paused ? 0 : performance.now() - began)), village?.timeZone));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [village?.instant, village?.timeZone, paused]);
  return label;
}

/**
 * The corner readout on the map.
 *
 * A component of its own so the once-a-minute tick re-renders this span and
 * nothing else — putting the hook in the view would redraw the whole tab, map
 * included, every time the minute turned over.
 */
function MobileHudClock({ village, paused }: { village?: VillageSnapshot["village"]; paused?: boolean }) {
  const [date, time] = useRealClock(village, paused).split(" · ");
  return (
    <span className={`${ELEMENT_TAG}-mobile-clock`}>
      <span>{date}</span>
      <strong>{time}</strong>
    </span>
  );
}

export function HomeDateWeather({
  weather,
  village,
  paused,
}: {
  weather: string;
  village?: VillageSnapshot["village"];
  paused?: boolean;
}) {
  return (
    <span className={`${ELEMENT_TAG}-mobile-datetime`}>
      <MobileHudClock village={village} paused={paused} />
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
