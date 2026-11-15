import type { z } from "zod";
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
import { memoryRequire } from "./memory-integrity.js";
import { findLocation } from "./places.js";
import { mentionsMinute, sceneAppointment } from "./scene-calendar.js";
import { mayHostStay } from "./venue-access.js";
import { permittedVenuePath } from "./venue-path.js";
import { venueZones, zoneClosed } from "./venue-zones.js";

type Option = z.infer<typeof lodgingOption>;
const lodgingAction =
  /\b(?:sleep(?:ing)?|nap|crash|lodg(?:e|ing)|overnight|stay (?:the night|over|here|with)|spend the night|turn in)\b/iu;
const counter =
  /\b(?:no|cannot|can't|won't|rather|instead|unless|but|only if|provided that|as long as|another room)\b/iu;
const assent =
  /\b(?:yes|sure|okay|ok|of course|i accept|that works|that sounds (?:good|great|fine|lovely)|i(?:'d| would) (?:like|love|take) (?:that|it|to)|you (?:can|may)|i(?:'ll| will) (?:stay|sleep|take))\b/iu;
const termWords =
  /\b(?:until|through|checkout|forever|only|nights?|days?|weeks?|months?|tomorrow|tonight|morning|afternoon)\b/iu;

function acceptsLodging(words: string, zoneName: string) {
  const line = words.replaceAll("\u2019", "'");
  return (
    assent.test(line) &&
    !counter.test(line) &&
    !termWords.test(line) &&
    (!/\b(?:sleep|crash|stay|nap|turn in)\s+(?:in|at|on|under|over)\b/iu.test(line) ||
      line.toLowerCase().includes(zoneName.toLowerCase()) ||
      /\b(?:in|at) that (?:room|place)\b/iu.test(line))
  );
}

export function sceneLodgingOptions(state: VillageState, actors: string[], placeId: string, input = ""): Option[] {
  if (actors.length < 2) return [];
  return [
    ...state.venues,
    ...Object.values(state.worldPlaces.places)
      .filter((row) => !row.disabled)
      .map((row) => row.location),
  ]
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
    })
    .slice(0, 6);
}

export const LODGING_SPEECH =
  'When someone offers or asks to sleep in a supplied Zone, use a commitment keep with the actual host and guest as the two holders and offer participants, and lodging:{guest,venue,zone,until?:{dayOffset,minute}}. The proposer may be either person. Cite their actual spoken offer with act:"offer" and, only if already spoken, the other person agreeing to the same terms with act:"accept". Use the room name or an unambiguous "here" in the actual speech. Default to one day only when no duration was stated. For specific deadlines, state the agreed local day and time in dialogue and supply dayOffset (0 today, 1 tomorrow) and minute (noon is 720). If the location, terms or assent are unclear, let them discuss it. Only a controller may disclose their private room. A changed room or duration is a new proposal. Use ordinary offer accept/refuse by its alias on a later turn. Code records confirmed stays.';

export function lodgingWrite(
  write: ContinuityWrite,
  proposal: z.infer<typeof lodgingProposal>,
  sources: ContinuityEvidence[],
  options: Option[],
  calendar: NarrationReadset["calendar"],
  placeId: string,
): ContinuityWrite {
  const option = options.find((row) => row.venue === proposal.venue && row.zone === proposal.zone);
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
    return (
      (mostSpecific.length === 1 && mostSpecific[0] === option) ||
      (mostSpecific.includes(option) && words.includes(option.placeName.toLocaleLowerCase()))
    );
  });
  memoryRequire(
    locationSpoken &&
      speech.some((source) => lodgingAction.test(source.excerpt)) &&
      speech.every((source) => !counter.test(source.excerpt.replaceAll("\u2019", "'"))),
    "the offer must explicitly offer or request sleep in the supplied Zone",
  );
  const answers = sources.filter((row) => row.act === "accept");
  memoryRequire(
    answers.every(
      (answer) =>
        answer.kind === "speech" &&
        acceptsLodging(answer.excerpt, option.zoneName) &&
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
      !speech.some(({ excerpt }) => termWords.test(excerpt)),
      "use exact terms for a stated lodging duration",
    );
  }
  memoryRequire(end.getTime() > now.getTime(), "the stay has already ended");
  return { ...write, lodging: { host, guest: proposal.guest, venue, zone, expiresAt: end.toISOString() } };
}

/** Apply confirmed sleep placement and access from the same accepted offer. */
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
            acceptsLodging(source.excerpt, zone.name) &&
            source.perceptions.some((perception) => perception.actorId === listener && perception.channel === "words"),
        ),
      "the reply did not first accept the original stay terms",
    );
  }
  const closed = offer.events.some((event) => event.act === "refuse" || event.act === "withdraw");
  const granted = (location: VillageState["venues"][number]) =>
    location.access?.permissions.some((permission) => permission.id === root && permission.duration === "stay");
  if (
    !closed &&
    !offer.participants.every((party) =>
      offer.events.some((event) => event.by === party.id && (event.act === "offer" || event.act === "accept")),
    )
  )
    return;

  let permissions = venue?.access?.permissions;
  if (!closed) {
    memoryRequire(
      venue &&
        zone &&
        permissions &&
        mayHostStay(venue, zone, terms.host) &&
        Date.parse(terms.expiresAt) > at.getTime() &&
        offer.participants.every((party) => continuityActor(world, party.id)?.incarnation === party.incarnation),
      "the host, guest or sleeping Zone is no longer available",
    );
    permissions = [
      ...permissions.filter(
        (permission) =>
          permission.duration !== "stay" ||
          (!permission.revoked &&
            permission.visitorId !== terms.guest &&
            Date.parse(permission.expiresAt ?? "") > at.getTime()),
      ),
      {
        id: root,
        zoneId: terms.zone,
        visitorId: terms.guest,
        issuerId: terms.host,
        duration: "stay",
        route: venueZones(venue)
          .filter((room) => mayHostStay(venue, room, terms.host))
          .map((room) => room.id),
        expiresAt: terms.expiresAt,
        sceneId: null,
        accompaniedBy: null,
        outsideHours: true,
        revoked: false,
        issuedAt: at.toISOString(),
        sourceLineIds: [...new Set(offer.events.flatMap((event) => event.sources.map((source) => source.id)))],
      },
    ];
    const projected = { ...venue, access: { ...venue.access!, permissions } };
    const when = new ZonedDate(at, world.timeZone || "UTC");
    const path = permittedVenuePath(world, projected, terms.guest, terms.zone, when);
    const checkoutPath = permittedVenuePath(
      world,
      projected,
      terms.guest,
      terms.zone,
      new ZonedDate(Date.parse(terms.expiresAt) - 1, when.zone),
    );
    memoryRequire(path && checkoutPath, "there is no permitted unescorted route for this stay");
    const guest = world.villagers.find((resident) => resident.characterId === terms.guest);
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
      if (rest && rest.date < new Date(terms.expiresAt)) {
        const occupants = [...villagePresence(world, rest.start, rest.date)].filter(
          ([actor, position]) => actor !== terms.guest && position.id === venue.id && position.zoneId === zone.id,
        );
        memoryRequire(occupants.length < MAX_ZONE_VILLAGERS, "the sleeping Zone is full at the guest's next rest");
      }
    }
    const grant = permissions.at(-1)!;
    grant.route = [...new Set([...path, ...checkoutPath])].filter(
      (id) => id !== terms.zone && grant.route!.includes(id),
    );
  } else if (!venue || !granted(venue)) {
    return;
  }
  const change = (location: VillageState["venues"][number]) => {
    if (!location.access) return location;
    const grants =
      !closed && location.id === terms.venue
        ? permissions!
        : location.access.permissions.filter(
            (permission) =>
              permission.duration !== "stay" ||
              (closed ? permission.id !== root : permission.visitorId !== terms.guest),
          );
    if (
      grants.length === location.access.permissions.length &&
      grants.every((row, index) => row === location.access!.permissions[index])
    )
      return location;
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
