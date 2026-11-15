import type { z } from "zod";
import type { AccessPermission } from "../../../shared/helpers/venue-access.js";
import { calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { lodgingOption, lodgingProposal } from "../decoding/lodging-codec.js";
import type { ContinuityCollection, ContinuityEvidence, ContinuityWrite } from "../models/continuity-model.js";
import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import { agendaBlocksFor } from "./agenda-week.js";
import { restingAgendaBlock } from "./agenda-plan.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { villagePresence } from "./village-projections.js";
import { continuityActor } from "./continuity-actors.js";
import { continuityHolderKey } from "./continuity.js";
import { memoryRequire } from "./memory-integrity.js";
import { lodgingLocations, pendingLodging } from "./lodging-presence.js";
import { findLocation } from "./places.js";
import { mentionsMinute, sceneAppointment } from "./scene-calendar.js";
import { mayHostStay } from "./venue-access.js";
import { permittedVenuePath } from "./venue-path.js";
import { venueZones, zoneClosed } from "./venue-zones.js";

type Option = z.infer<typeof lodgingOption>;
const lodgingAction =
  /\b(?:sleep(?:ing)?|nap|crash|lodg(?:e|ing)|overnight|stay (?:the night|over|here|with)|spend the night|turn in)\b/iu;
const counter =
  /\b(?:no|cannot|can't|won't|rather|instead|unless|but|if|once|after|when|provided that|as long as|first|need to|have to|another room)\b/iu;
const refusal = /(?:^\s*no\b(?! problem)|\b(?:cannot|can't|won't|wouldn't|never|even if|another room)\b)/iu;
const assent =
  /\b(?:yes|yeah|yep|sure|okay|ok|of course|i accept|it's a deal|we have a deal|that works|that sounds (?:good|great|fine|lovely)|i(?:'d| would) (?:like|love|take) (?:that|it|to)|you (?:can|may)|i(?:'ll| will) (?:stay|sleep|take))\b/iu;
const termWords =
  /\b(?:until|through|checkout|forever|only|(?:for|another|\d+) (?:\w+ )?(?:nights?|days?|weeks?|months?))\b/iu;

function acceptsLodging(words: string, zoneName: string, condition?: string) {
  const line = agreementWords(words);
  const restatesCondition =
    condition &&
    line.toLowerCase().includes(condition.toLowerCase()) &&
    !/\b(?:instead|checkout|for another)\b/iu.test(line);
  return (
    assent.test(line) &&
    !refusal.test(line) &&
    (!(counter.test(line) || termWords.test(line)) || restatesCondition) &&
    (!/\b(?:sleep|crash|stay|nap|turn in)\s+(?:in|at|on|under|over)\b/iu.test(line) ||
      line.toLowerCase().includes(zoneName.toLowerCase()) ||
      /\b(?:in|at) that (?:room|place)\b/iu.test(line))
  );
}

function agreementWords(words: string) {
  return words
    .replaceAll("\u2019", "'")
    .replace(/\b(?:if (?:you|they) don't mind|if (?:she|he) doesn't mind|if that's all right|no problem)\b/giu, "");
}

export function sceneLodgingOptions(
  state: VillageState,
  actors: string[],
  placeId: string,
  input = "",
  at?: Date,
  discuss = true,
): Option[] {
  if (actors.length < 2) return [];
  const pending = at
    ? actors.flatMap((guest) => {
        const stay = pendingLodging(state, guest, at);
        if (
          !stay ||
          !actors.includes(stay.permission.issuerId) ||
          (actors.includes("player") && guest !== "player" && stay.permission.issuerId !== "player")
        )
          return [];
        const record = state.continuity.records.find((row) => row.id === stay.permission.id);
        if (
          record &&
          [guest, stay.permission.issuerId].some((id) => {
            const actor = continuityActor(state, id);
            return actor && !!record.protection[continuityHolderKey(actor)];
          })
        )
          return [];
        return [
          {
            host: stay.permission.issuerId,
            venue: stay.venue.id,
            zone: stay.zone.id,
            placeName: stay.venue.name,
            zoneName: stay.zone.name,
            pending: { id: stay.permission.id, guest, condition: stay.pending.condition },
          },
        ];
      })
    : [];
  if (!discuss) return pending.slice(0, 6);
  const offered = lodgingLocations(state)
    .sort((a, b) => Number(b.id === placeId) - Number(a.id === placeId))
    .flatMap((venue) =>
      venueZones(venue).flatMap((zone) =>
        actors
          .filter((host) => mayHostStay(venue, zone, host) && !zoneClosed(state, venue, zone))
          .map((host) => ({ host, venue: venue.id, zone: zone.id, placeName: venue.name, zoneName: zone.name })),
      ),
    )
    .sort((a, b) => {
      const query = input.toLowerCase();
      const relevant = (option: Option) =>
        Number(query.includes(option.placeName.toLowerCase())) + Number(query.includes(option.zoneName.toLowerCase()));
      return relevant(b) - relevant(a);
    });
  return [...pending, ...offered].slice(0, 6);
}

export const LODGING_SPEECH =
  'For a spoken sleep offer use a commitment keep held by both host and guest, with offer parties and lodging:{guest,venue,zone,condition?,until?:{dayOffset,minute}}. Cite exact spoken offer and assent with act:"offer"/"accept". Natural assent counts. Use the supplied room that the words identify, including an unambiguous bed, couch or "here". For a concrete prerequisite, quote its short clause as condition. Distinguish a chore deadline from checkout. Supply until only for an agreed exact checkout, otherwise code uses one day from confirmation. For replies to a fitted offer use its alias. Only controllers disclose their private rooms.';

export const LODGING_COMPLETION =
  "For a supplied pending stay, when the named work is actually done, use a keep for both parties with stayReady set to its id and a source showing the completed work seen by both in that Zone, or the host telling the guest specifically what is now done. A plan or a done deal does not complete the work. Keep any visit invitation separate and keep talking naturally.";

export function lodgingWrite(
  write: ContinuityWrite,
  proposal: z.infer<typeof lodgingProposal>,
  sources: ContinuityEvidence[],
  options: Option[],
  calendar: NarrationReadset["calendar"],
  placeId: string,
): ContinuityWrite {
  const option = options.find(
    (row) =>
      row.venue === proposal.venue &&
      row.zone === proposal.zone &&
      write.offer?.participants.includes(row.host) &&
      row.host !== proposal.guest,
  );
  memoryRequire(
    option &&
      option.host !== proposal.guest &&
      write.offer &&
      !write.target &&
      write.class === "commitment" &&
      !write.agenda &&
      !write.retire &&
      !write.relationship &&
      write.holders.length === 2 &&
      write.offer.participants.length === 2 &&
      [option.host, proposal.guest].every(
        (id) =>
          write.holders.some((holder) => holder.kind === "actor" && holder.id === id) &&
          write.offer!.participants.includes(id),
      ),
    "lodging needs the supplied room and both parties to the spoken agreement",
  );
  const { host, venue, zone } = option;
  const speech = sources.filter(
    (row) => row.kind === "speech" && row.act === "offer" && row.actorId === write.offer!.proposer,
  );
  const locationSpoken = speech.some((row) => {
    if (venue === placeId && row.positions?.[row.actorId!] === zone && /\bhere\b/iu.test(row.excerpt)) return true;
    const words = row.excerpt.toLocaleLowerCase();
    const named = options.filter((other) => other.host === host && words.includes(other.zoneName.toLocaleLowerCase()));
    const longest = Math.max(...named.map((other) => other.zoneName.length));
    const mostSpecific = named.filter((other) => other.zoneName.length === longest);
    const room = /\b(?:bed|couch|sofa)\b/iu.exec(words)?.[0];
    const inferred =
      room &&
      options.filter(
        (other) =>
          other.host === host &&
          (room === "bed" ? /\bbedroom\b/iu : /\b(?:living room|parlor|sitting room)\b/iu).test(other.zoneName),
      );
    return (
      (mostSpecific.length > 0 && mostSpecific.every((other) => other.venue === venue && other.zone === zone)) ||
      (mostSpecific.includes(option) && words.includes(option.placeName.toLocaleLowerCase())) ||
      (!named.length &&
        inferred &&
        inferred.length > 0 &&
        inferred.every((other) => other.venue === venue && other.zone === zone))
    );
  });
  memoryRequire(
    locationSpoken &&
      speech.some((source) => lodgingAction.test(source.excerpt)) &&
      speech.every((source) => !refusal.test(agreementWords(source.excerpt))) &&
      (proposal.condition
        ? speech.some(
            ({ excerpt }) =>
              excerpt.toLowerCase().includes(proposal.condition!.toLowerCase()) &&
              /\b(?:if|once|after|when|as long as|provided|first|need to|have to)\b/iu.test(excerpt),
          )
        : speech.every((source) => !counter.test(agreementWords(source.excerpt)))),
    "the offer must explicitly offer or request sleep in the supplied Zone",
  );
  const answers = sources.filter((row) => row.act === "accept");
  memoryRequire(
    answers.every(
      (answer) =>
        answer.kind === "speech" &&
        acceptsLodging(answer.excerpt, option.zoneName, proposal.condition) &&
        answer.actorId !== write.offer!.proposer &&
        speech.some(
          (offer) =>
            offer.episodeId === answer.episodeId &&
            offer.moment &&
            answer.moment &&
            (offer.moment.index < answer.moment.index ||
              (offer.moment.index === answer.moment.index &&
                offer.moment.side === "before" &&
                answer.moment.side === "after")),
        ),
    ),
    "acceptance must follow the witnessed lodging offer",
  );
  const now = new ZonedDate(calendar.instant, calendar.timeZone);
  let end = new Date(now.getTime() + 86_400_000);
  if (proposal.until) {
    const { dayOffset, minute } = proposal.until;
    const { date } = sceneAppointment({ when: { dayOffset }, minute }, calendar);
    end = calendarAt(now, date, minute);
    const day = new ZonedDate(end, calendar.timeZone).toLocaleDateString("en-US", { weekday: "long" });
    const dayWords = dayOffset === 0 ? /\b(?:today|tonight)\b/iu : dayOffset === 1 ? /\btomorrow\b/iu : undefined;
    memoryRequire(
      speech.some(
        ({ excerpt }) =>
          (dayWords?.test(excerpt) || excerpt.toLowerCase().includes(day.toLowerCase()) || excerpt.includes(date)) &&
          mentionsMinute(excerpt, minute),
      ),
      "the lodging deadline needs the actual agreed day and time",
    );
  } else {
    memoryRequire(
      !speech.some(
        ({ excerpt }) =>
          termWords.test(excerpt) &&
          !(
            proposal.condition &&
            excerpt.toLowerCase().includes(proposal.condition.toLowerCase()) &&
            !/\b(?:checkout|for (?:\w+ )?(?:nights?|days?|weeks?|months?)|stay (?:until|through)|sleep (?:until|through))\b/iu.test(
              excerpt,
            )
          ),
      ),
      "use exact terms for a stated lodging duration",
    );
  }
  memoryRequire(end.getTime() > now.getTime(), "the stay has already ended");
  return {
    ...write,
    lodging: {
      host,
      guest: proposal.guest,
      venue,
      zone,
      condition: proposal.condition,
      expiresAt: !proposal.condition || proposal.until ? end.toISOString() : undefined,
    },
  };
}
function saveStay(
  world: VillageState,
  venue: VillageState["venues"][number],
  permission: AccessPermission,
  closed = false,
): Pick<VillageState, "venues" | "worldPlaces"> {
  const change = (location: VillageState["venues"][number]) => {
    if (!location.access) return location;
    const existing = location.access.permissions;
    const grants = existing.filter(
      (row) =>
        row.duration !== "stay" ||
        (closed
          ? row.id !== permission.id
          : row.visitorId !== permission.visitorId || (!!permission.pendingStay && !row.pendingStay)),
    );
    if (!closed && location.id === venue.id) grants.push(permission);
    if (grants.length === existing.length && grants.every((row, index) => row === existing[index])) return location;
    return { ...location, access: { ...location.access, revision: location.access.revision + 1, permissions: grants } };
  };
  return {
    venues: world.venues.map(change),
    worldPlaces: {
      ...world.worldPlaces,
      places: Object.fromEntries(
        Object.entries(world.worldPlaces.places).map(([id, row]) => {
          const location = change(row.location);
          return [id, location === row.location ? row : { ...row, location }];
        }),
      ),
    },
  };
}

function confirmStay(
  world: VillageState,
  venue: VillageState["venues"][number],
  permission: AccessPermission,
  at: Date,
) {
  const { visitorId: guestId, issuerId: host, zoneId } = permission;
  const zone = venueZones(venue).find((room) => room.id === zoneId);
  const expiresAt = permission.expiresAt ?? new Date(at.getTime() + 86_400_000).toISOString();
  memoryRequire(
    venue.access && zone && mayHostStay(venue, zone, host) && Date.parse(expiresAt) > at.getTime(),
    "the host, guest or sleeping Zone is no longer available",
  );
  const grant: AccessPermission = {
    ...permission,
    pendingStay: undefined,
    expiresAt,
    issuedAt: at.toISOString(),
    route: venueZones(venue)
      .filter((room) => mayHostStay(venue, room, host))
      .map((room) => room.id),
  };
  const projected = {
    ...venue,
    access: {
      ...venue.access,
      permissions: [
        ...venue.access.permissions.filter((row) => row.duration !== "stay" || row.visitorId !== guestId),
        grant,
      ],
    },
  };
  const when = new ZonedDate(at, world.timeZone || "UTC");
  const path = permittedVenuePath(world, projected, guestId, zoneId, when);
  const checkoutPath = permittedVenuePath(
    world,
    projected,
    guestId,
    zoneId,
    new ZonedDate(Date.parse(expiresAt) - 1, when.zone),
  );
  memoryRequire(path && checkoutPath, "there is no permitted unescorted route for this stay");
  const guest = world.villagers.find((resident) => resident.characterId === guestId);
  if (guest?.agenda) {
    const minute = when.getHours() * 60 + when.getMinutes();
    const nextDay = new ZonedDate(when, when.zone);
    nextDay.setDate(nextDay.getDate() + 1);
    const rest = [when, nextDay].flatMap((day, index) =>
      agendaBlocksFor(guest.agenda!, day)
        .filter((block) => restingAgendaBlock(block) && (index === 1 || block.endMinute > minute))
        .map((block) => {
          const start = Math.max(index === 0 ? minute : 0, block.startMinute);
          const date = new ZonedDate(day, day.zone);
          if (index !== 0 || start !== minute) date.setHours(Math.floor(start / 60), start % 60, 0, 0);
          return { date, start };
        }),
    )[0];
    if (rest && rest.date < new Date(expiresAt)) {
      const occupants = [...villagePresence(world, rest.start, rest.date)].filter(
        ([actor, position]) => actor !== guestId && position.id === venue.id && position.zoneId === zoneId,
      );
      memoryRequire(occupants.length < MAX_ZONE_VILLAGERS, "the sleeping Zone is full at the guest's next rest");
    }
  }
  grant.route = [...new Set([...path, ...checkoutPath])].filter((id) => id !== zoneId && grant.route!.includes(id));
  return saveStay(world, venue, grant);
}

/** Apply sleep placement and access from the same accepted offer. */
export function lodgingSettlement(
  world: VillageState,
  next: ContinuityCollection,
  write: ContinuityWrite,
  operationId: string,
  at: Date,
): Pick<VillageState, "venues" | "worldPlaces"> | undefined {
  if (!write.lodging && !write.accept && !write.closeOffer) return;
  const root = write.target?.id ?? next.receipts[operationId]?.roots[0];
  const offer = next.records.find((row) => row.id === root)?.offer;
  const terms = next.versions.find((row) => row.id === offer?.termsVersionId)?.lodging;
  if (!root || !offer || !terms) return;
  const venue = findLocation(world, terms.venue);
  const zone = venue && venueZones(venue).find((row) => row.id === terms.zone);
  const existing = venue?.access?.permissions.find((row) => row.id === root && row.duration === "stay");
  if (offer.events.some((event) => event.act === "refuse" || event.act === "withdraw"))
    return existing && venue ? saveStay(world, venue, existing, true) : undefined;
  if (write.accept) {
    const listener = offer.participants.find((party) => party.id !== write.accept)?.id;
    const decisions = offer.events.filter((event) => event.act === "accept");
    memoryRequire(
      decisions.length === 1 &&
        decisions[0].by === write.accept &&
        write.accept !== offer.proposer.id &&
        zone &&
        decisions[0].sources.every(
          (source) =>
            source.kind === "speech" &&
            acceptsLodging(source.excerpt, zone.name, terms.condition) &&
            source.perceptions.some((perception) => perception.actorId === listener && perception.channel === "words"),
        ),
      "the reply did not first accept the original stay terms",
    );
  }
  if (
    existing ||
    !offer.participants.every((party) =>
      offer.events.some((event) => event.by === party.id && (event.act === "offer" || event.act === "accept")),
    )
  )
    return;

  const host = continuityActor(world, terms.host);
  const guest = continuityActor(world, terms.guest);
  memoryRequire(
    venue?.access &&
      zone &&
      host &&
      guest &&
      mayHostStay(venue, zone, terms.host) &&
      (!terms.expiresAt || Date.parse(terms.expiresAt) > at.getTime()) &&
      offer.participants.every((party) => continuityActor(world, party.id)?.incarnation === party.incarnation),
    "the host, guest or sleeping Zone is no longer available",
  );
  const permission: AccessPermission = {
    id: root,
    zoneId: terms.zone,
    visitorId: terms.guest,
    issuerId: terms.host,
    duration: "stay",
    expiresAt: terms.expiresAt,
    sceneId: null,
    accompaniedBy: null,
    outsideHours: true,
    revoked: false,
    issuedAt: at.toISOString(),
    sourceLineIds: [...new Set(offer.events.flatMap((event) => event.sources.map((source) => source.id)))],
  };
  if (!terms.condition) return confirmStay(world, venue, permission, at);
  permission.pendingStay = {
    condition: terms.condition,
    hostIncarnation: host.incarnation,
    guestIncarnation: guest.incarnation,
  };
  return saveStay(world, venue, permission);
}

export function lodgingReady(
  world: VillageState,
  id: string,
  options: Option[],
  write: ContinuityWrite,
  sources: ContinuityEvidence[],
  episode: { id: string; capturedAt: string },
  placeId: string,
  at: Date,
) {
  const option = options.find((row) => row.pending?.id === id);
  const stay = option?.pending && pendingLodging(world, option.pending.guest, at);
  memoryRequire(
    stay &&
      stay.permission.id === id &&
      stay.pending.condition === option?.pending?.condition &&
      Date.parse(episode.capturedAt) >= Date.parse(stay.permission.issuedAt) &&
      !write.lodging &&
      !write.accept &&
      !write.offer &&
      !write.closeOffer &&
      write.holders.length === 2 &&
      [stay.permission.issuerId, stay.permission.visitorId].every((id) =>
        write.holders.some((holder) => holder.kind === "actor" && holder.id === id),
      ),
    "the pending stay was not supplied to both parties",
  );
  const { issuerId, visitorId } = stay.permission;
  // shortcut: require the named details in a completion report until world events can prove arbitrary chores.
  const details =
    stay.pending.condition
      .toLowerCase()
      .match(/\b[a-z]{4,}\b/gu)
      ?.filter(
        (word) =>
          ![
            "need",
            "before",
            "first",
            "have",
            "should",
            "once",
            "must",
            "until",
            "move",
            "moved",
            "moving",
            "shift",
            "shifted",
            "shifting",
            "clear",
            "cleared",
            "clearing",
            "done",
            "finish",
            "finished",
            "that",
            "this",
            "into",
          ].includes(word),
      ) ?? [];
  const proof = sources.find((source) => {
    const words = source.excerpt.toLowerCase().replaceAll("\u2019", "'");
    if (
      source.episodeId !== episode.id ||
      !source.moment ||
      !details.length ||
      !details.every((word) => new RegExp(`\\b${word}s?\\b`, "u").test(words)) ||
      /\b(?:if|once|unless|will|would|should|could|might|not|never|still|almost|in the way|going to|needs? to|have to|can we|let's|isn't|wasn't|won't|haven't|hasn't|didn't|can't|don't)\b|\?/u.test(
        words,
      ) ||
      !/\b(?:\w+(?:ed|ung)|done|finished|put|set|took|got|gone|clear|now|already)\b/u.test(words)
    )
      return false;
    if (/\b(?:move|shift|clear)\w*\b/iu.test(stay.pending.condition)) {
      const object =
        /\b(?:move|shift|clear)\w* (?:the |a |that |my |your )?([a-z]+)\b/iu
          .exec(stay.pending.condition)?.[1]
          ?.toLowerCase() ?? details[0];
      const action = "(?:moved|shifted|cleared|put|got|set|took|slid|carried|dragged)";
      const completion = new RegExp(
        `\\b${action} (?:the |that |my |your )?${object}\\b|\\b${object}(?:'s| (?:is|was|has been|had been)) (?:now )?(?:${action}|out of the way|(?:in|on|by|over) \\w+)`,
        "u",
      );
      const destination = /\b(?:into|onto|to) (?:the |a )?([a-z]+(?: [a-z]+)*)/u.exec(
        stay.pending.condition.toLowerCase(),
      )?.[1];
      const arrived = destination && new RegExp(`\\b(?:in|into|at|on|onto|to) (?:the |a )?${destination}\\b`, "u");
      if (
        !words
          .split(/[.!?;]|\b(?:while|although|because|but)\b/u)
          .some(
            (clause) =>
              completion.test(clause) &&
              (!arrived || arrived.test(clause)) &&
              details.every((word) => new RegExp(`\\b${word}s?\\b`, "u").test(clause)),
          )
      )
        return false;
    }
    const perceived = (id: string, channel: "words" | "sight") =>
      source.perceptions.some((row) => row.actorId === id && row.channel === channel);
    return (
      (source.kind === "speech" && source.actorId === issuerId && perceived(visitorId, "words")) ||
      (source.kind === "observation" &&
        placeId === stay.venue.id &&
        source.positions?.[visitorId] === stay.zone.id &&
        source.positions?.[issuerId] === stay.zone.id &&
        perceived(visitorId, "sight") &&
        perceived(issuerId, "sight"))
    );
  });
  memoryRequire(proof, "the named condition needs witnessed completion or the host's specific completed report");
  return confirmStay(
    world,
    stay.venue,
    {
      ...stay.permission,
      sourceLineIds: [...new Set([...stay.permission.sourceLineIds, proof.id])],
    },
    at,
  );
}
