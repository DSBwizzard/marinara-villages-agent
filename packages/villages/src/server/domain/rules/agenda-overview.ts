import type { AgendaTime, AgendaWeek } from "../../../shared/contracts/agenda.js";
import { calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import type { ContinuityEvidence, ContinuityWrite } from "../models/continuity-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { VillageAgendaBlock, VillageState } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { restingAgendaBlock } from "./agenda-plan.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";
import { continuityActor } from "./continuity-actors.js";
import { continuityProtectionUnits, continuityViews, latestRelationshipScores, relationshipKey } from "./continuity.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { notFound } from "./errors.js";
import { findLocation } from "./places.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { ordinaryUseRestricted } from "./narrative-environment.js";
import { resolveVenueZone, zoneClosed } from "./venue-zones.js";
import { zoneActivityFits } from "./venue-presence.js";
import { projectAgendaReservations } from "./project-focus.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

export const AGENDA_SHARED_WARMTH = 60;
const dateAt = (world: VillageState, instant: Date) =>
  new ZonedDate(instant, world.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
const scheduled = (block: VillageAgendaBlock) =>
  !(!block.venueId && flexibleAgendaBlock(block) && block.activity === "Taking care of their own affairs");
const dayOffset = (now: ZonedDate, offset: number) => {
  const day = new ZonedDate(now, now.zone);
  day.setDate(day.getDate() + offset);
  return day;
};

function mentionsMinute(text: string, minute: number) {
  const hour = Math.floor(minute / 60),
    rest = minute % 60;
  const twelve = hour % 12 || 12;
  const words = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
  const spoken =
    rest === 0 ? `|${words[hour % 12]}|${twelve}${hour === 12 ? "|noon|midday" : hour === 0 ? "|midnight" : ""}` : "";
  const suffix = hour < 12 ? "a\\.?m\\.?" : "p\\.?m\\.?";
  const clock = `:${String(rest).padStart(2, "0")}`;
  const exact = `0?${twelve}${rest ? clock : `(?:${clock})?`}\\s*${suffix}`;
  const bare = `(?:0?${hour}${clock}|0?${twelve}${clock}${spoken})(?![\\d:]|\\s*[ap]\\.?m)`;
  return new RegExp(`\\b(?:${exact}|${bare})\\b`, "iu").test(text);
}

function checkAppointmentReply(text: string, time: AgendaTime) {
  const times = text.match(/\b(?:\d{1,2}:\d{2}(?:\s*[ap]\.?m\.?)?|\d{1,2}\s*[ap]\.?m\.?|noon|midnight)\b/giu) ?? [];
  memoryRequire(
    !/\b(?:instead|but|unless|only if|could we|can we|what about)\b/iu.test(text) &&
      times.every((label) => mentionsMinute(label, time.startMinute) || mentionsMinute(label, time.endMinute)),
    "Different appointment terms need a new offer",
  );
}

export function agendaSpeechOptions(world: VillageState, actorIds: readonly string[], now: Date, currentOnly: boolean) {
  const at = dateAt(world, now);
  return world.villagers
    .flatMap((resident) => {
      if (!resident.agenda || !actorIds.includes(resident.characterId)) return [];
      const agenda = resident.agenda;
      const currentMinute = at.getHours() * 60 + at.getMinutes();
      return Array.from({ length: currentOnly ? 1 : 7 }, (_, offset) => {
        const day = dayOffset(at, offset);
        return agendaBlocksFor(agenda, day)
          .filter(
            (block) =>
              scheduled(block) &&
              !!block.venueId &&
              (offset > 0 || block.endMinute > currentMinute) &&
              (!currentOnly || block.startMinute <= currentMinute),
          )
          .map((block) => ({
            actorId: resident.characterId,
            activity: block.activity,
            time: {
              date: agendaDateKey(day),
              startMinute: block.startMinute,
              endMinute: block.endMinute,
              venueId: block.venueId,
              ...(block.zoneId ? { zoneId: block.zoneId } : {}),
            },
          }));
      })
        .flat()
        .slice(0, currentOnly ? 1 : 6);
    })
    .slice(0, 16);
}

export function agendaWeek(world: VillageState, actorId: string, now: Date, inspect: boolean): AgendaWeek {
  const resident = world.villagers.find((row) => row.characterId === actorId);
  const player = continuityActor(world, "player");
  if (!resident || !player) throw notFound("That villager does not live here.");
  const actor = { id: actorId, incarnation: resident.incarnation };
  const shared =
    !inspect &&
    (latestRelationshipScores(world.continuity).get(relationshipKey(actor, player))?.relationshipScore ?? 0) >=
      AGENDA_SHARED_WARMTH;
  const known = continuityViews(
    world.continuity,
    player,
    now.toISOString(),
    continuityProtectionUnits(world.continuity, player, episodeSourceGraph(world.episodes.records, player)),
  ).flatMap<{ id: string; time: AgendaTime; activity: string; source: "told" | "seen" | "agreed" }>((row) => {
    const offer =
      row.offer?.state === "accepted" && world.continuity.records.find((record) => record.id === row.id)?.offer;
    const fact =
      row.version.agenda ||
      (offer && world.continuity.versions.find((version) => version.id === offer.termsVersionId)?.agenda);
    if (!fact || row.repaired || row.version.closed || fact.actorId !== actorId) return [];
    if (fact.kind !== "offer")
      return row.version.about.some((subject) => subject.id === actorId && subject.incarnation === actor.incarnation)
        ? [{ ...fact, id: row.id, source: fact.kind }]
        : [];
    if (
      !row.offer?.participants.some((party) => party.id === actorId && party.incarnation === actor.incarnation) ||
      !row.offer.participants.some((party) => party.id === "player" && party.incarnation === player.incarnation) ||
      row.offer.state !== "accepted"
    )
      return [];
    return [{ ...fact, id: row.id, source: "agreed" as const }];
  });
  const at = dateAt(world, now);
  return {
    visibility: inspect ? "inspect" : shared ? "shared" : "known",
    days: Array.from({ length: 7 }, (_, offset) => {
      const day = dayOffset(at, offset),
        date = agendaDateKey(day);
      const visible = known.filter((row) => row.time.date === date);
      const effective = resident.agenda ? agendaBlocksFor(resident.agenda, day).filter(scheduled) : [];
      const times: (Omit<AgendaTime, "date"> & { activity: string; source?: "told" | "seen" | "agreed" })[] =
        inspect || shared
          ? effective.map((block) => ({
              ...block,
              source: visible.find(
                (row) =>
                  row.source === "agreed" &&
                  row.id === block.commitmentId &&
                  row.time.startMinute <= block.startMinute &&
                  row.time.endMinute >= block.endMinute &&
                  row.time.venueId === block.venueId,
              )?.source,
            }))
          : visible.map(({ time, activity, source }) => ({ ...time, activity, source }));
      const blocks = times.map(({ startMinute, endMinute, activity, venueId, zoneId, source }) => {
        const venue = findLocation(world, venueId);
        const zone = venue && zoneId && resolveVenueZone(venue, zoneId);
        return {
          startMinute,
          endMinute,
          activity,
          ...(venue ? { place: zone && (inspect || zone.seen || source === "agreed") ? zone.name : venue.name } : {}),
          ...(source ? { source } : {}),
        };
      });
      return {
        date,
        weekday: VILLAGE_WEEKDAYS[(day.getDay() + 6) % 7]!,
        blocks: [...new Map(blocks.map((block) => [memoryHash(block), block])).values()].sort(
          (a, b) => a.startMinute - b.startMinute,
        ),
      };
    }),
  };
}

function visitFits(world: VillageState, actor: string, time: AgendaTime, at: Date) {
  const venue = findLocation(world, time.venueId);
  const zone = venue && resolveVenueZone(venue, time.zoneId ?? "exterior");
  if (!venue || !zone || zoneClosed(world, venue, zone)) return false;
  return Array.from({ length: time.endMinute - time.startMinute }, (_, offset) => {
    const when = calendarAt(at, time.date, time.startMinute + offset);
    return (
      !ordinaryUseRestricted(world.narrative, when.toISOString(), venue.id, zone.id) &&
      evaluateZoneAccess(venue, zone, actor, { at: when, environment: world.narrative }).allowed
    );
  }).every(Boolean);
}

export function sceneAgendaEvidence(
  world: VillageState,
  write: ContinuityWrite,
  readset: NarrationReadset,
  sources: ContinuityEvidence[],
) {
  const evidence = write.agenda;
  if (!evidence) return;
  const { actorId, time, kind } = evidence;
  const actor = continuityActor(world, actorId);
  const resident = world.villagers.find((row) => row.characterId === actorId);
  memoryRequire(
    actor &&
      resident?.agenda &&
      write.holders.some((row) => row.kind === "actor" && row.id === "player") &&
      write.about?.some((row) => row.id === actorId && row.incarnation === actor.incarnation) &&
      !write.target &&
      !write.retire &&
      !write.parentId &&
      !write.relationship,
    "Agenda evidence requires this resident and the player's exact knowledge",
  );
  const current = sources.filter((source) => source.episodeId === readset.source.episodeId);
  if (kind === "offer") {
    time.zoneId ??= "exterior";
    const venue = findLocation(world, time.venueId);
    const zone = venue && resolveVenueZone(venue, time.zoneId);
    const proposed = current
      .filter((source) => source.actorId === write.offer?.proposer && source.act === "offer")
      .map((source) => source.excerpt)
      .join(" ");
    const admitted = new ZonedDate(readset.calendar.instant, readset.calendar.timeZone);
    const appointmentDay = calendarAt(admitted, time.date, time.startMinute);
    const weekday = VILLAGE_WEEKDAYS[(appointmentDay.getDay() + 6) % 7]!;
    const dayWasSpoken =
      proposed.includes(time.date) ||
      new RegExp(`\\b${weekday}\\b`, "iu").test(proposed) ||
      (time.date === agendaDateKey(admitted) &&
        /\b(?:today|tonight|this (?:morning|afternoon|evening))\b/iu.test(proposed)) ||
      (time.date === agendaDateKey(dayOffset(admitted, 1)) && /\btomorrow\b/iu.test(proposed));
    memoryRequire(
      readset.agendaVenues &&
        write.offer &&
        write.offer.participants.length === 2 &&
        write.holders.some((row) => row.kind === "actor" && row.id === actorId) &&
        write.offer.participants.includes(actorId) &&
        write.offer.participants.includes("player") &&
        current.some(
          (source) =>
            source.kind === "speech" &&
            source.actorId === write.offer!.proposer &&
            source.act === "offer" &&
            write.offer!.participants.every(
              (id) =>
                source.actorId === id ||
                source.perceptions.some((row) => row.actorId === id && row.channel === "words"),
            ),
        ),
      "An Agenda offer needs spoken terms heard by both parties",
    );
    memoryRequire(
      venue &&
        zone &&
        dayWasSpoken &&
        mentionsMinute(proposed, time.startMinute) &&
        mentionsMinute(proposed, time.endMinute) &&
        ((zone.kind === "exterior" && proposed.toLocaleLowerCase().includes(venue.name.toLocaleLowerCase())) ||
          proposed.toLocaleLowerCase().includes(zone.name.toLocaleLowerCase()) ||
          (venue.id === readset.source.scene.placeId &&
            zone.id === readset.source.scene.zoneId &&
            /\bhere\b/iu.test(proposed))) &&
        time.endMinute - time.startMinute <= 180 &&
        readset.agendaVenues.some(
          (venue) => venue.id === time.venueId && venue.zones.includes(time.zoneId ?? "exterior"),
        ) &&
        calendarAt(
          new ZonedDate(readset.calendar.instant, readset.calendar.timeZone),
          time.date,
          time.startMinute,
        ).getTime() > Date.parse(readset.calendar.instant),
      "The appointment needs both times, its day, and a supplied place in the actual spoken offer",
    );
    return;
  }
  memoryRequire(!write.offer && write.class === "information", "Agenda discoveries describe existing routines");
  const offered = readset.agendaOptions?.find(
    (row) =>
      row.actorId === actorId &&
      row.time.date === time.date &&
      row.time.venueId === time.venueId &&
      row.time.zoneId === time.zoneId &&
      row.time.startMinute <= time.startMinute &&
      row.time.endMinute >= time.endMinute,
  );
  const at = new ZonedDate(readset.calendar.instant, readset.calendar.timeZone);
  const date = calendarAt(at, time.date, time.startMinute);
  const block = agendaBlocksFor(resident.agenda, date).find(
    (row) =>
      row.venueId === time.venueId &&
      row.zoneId === time.zoneId &&
      row.startMinute <= time.startMinute &&
      row.endMinute >= time.endMinute &&
      row.activity === offered?.activity,
  );
  memoryRequire(offered && block, "The discovered Agenda entry changed or was not supplied");
  if (kind === "told") {
    memoryRequire(
      offered.time.startMinute === time.startMinute &&
        offered.time.endMinute === time.endMinute &&
        current.some(
          (source) =>
            source.kind === "speech" &&
            source.actorId === actorId &&
            mentionsMinute(source.excerpt, time.startMinute) &&
            mentionsMinute(source.excerpt, time.endMinute) &&
            source.excerpt.toLocaleLowerCase().includes(offered.activity.toLocaleLowerCase()) &&
            source.perceptions.some((row) => row.actorId === "player" && row.channel === "words"),
        ),
      "The player did not hear the resident share this Agenda entry",
    );
  } else {
    const minute = at.getHours() * 60 + at.getMinutes();
    memoryRequire(
      time.date === agendaDateKey(at) &&
        time.startMinute === minute &&
        time.endMinute === minute + 1 &&
        readset.source.scene.placeId === time.venueId &&
        current.some(
          (source) =>
            source.kind === "observation" &&
            source.positions?.player === time.zoneId &&
            source.positions?.[actorId] === time.zoneId &&
            source.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
        ),
      "An observed Agenda entry needs actual sight at that time and place",
    );
  }
  evidence.activity = kind === "seen" ? "Seen here" : offered.activity;
}

export function cloneAppointmentState(state: VillageState): VillageState {
  return {
    ...state,
    residentPlans: { ...state.residentPlans },
    villagers: state.villagers.map((resident) => ({
      ...resident,
      agenda: resident.agenda && { ...resident.agenda },
    })),
  };
}

export function applySceneAppointment(
  world: VillageState,
  continuity: VillageState["continuity"],
  write: ContinuityWrite,
  operationId: string,
  instant: string,
) {
  const root = write.target?.id ?? continuity.receipts[operationId]?.roots[0];
  const offer = continuity.records.find((row) => row.id === root)?.offer;
  const fact = offer && continuity.versions.find((row) => row.id === offer.termsVersionId)?.agenda;
  if (!root || !offer || fact?.kind !== "offer") return false;
  const now = dateAt(world, new Date(instant));
  const rows = (world.residentPlans.appointments ?? []).filter((row) => {
    const venue = findLocation(world, row.time.venueId);
    return (
      !!venue &&
      !!resolveVenueZone(venue, row.time.zoneId ?? "exterior") &&
      calendarAt(now, row.time.date, row.time.endMinute).getTime() > now.getTime() &&
      world.villagers.some(
        (resident) => resident.characterId === row.resident.id && resident.incarnation === row.resident.incarnation,
      )
    );
  });
  if (write.closeOffer) {
    world.residentPlans.appointments = rows.filter((row) => row.id !== root);
  } else {
    if (offer.events.some((event) => event.act === "refuse" || event.act === "withdraw")) return false;
    if (
      !offer.participants.every((party) =>
        offer.events.some((event) => event.by === party.id && (event.act === "offer" || event.act === "accept")),
      )
    )
      return false;
    if (rows.some((row) => row.id === root)) return false;
    const { time } = fact;
    for (const event of offer.events.filter(
      (row) => row.act === "accept" && (row.id === operationId || row.id.startsWith(operationId + ":")),
    ))
      for (const source of event.sources) checkAppointmentReply(source.excerpt, time);
    const resident = offer.participants.find((party) => party.id === fact.actorId);
    const player = offer.participants.find((party) => party.id === "player");
    const live =
      resident &&
      world.villagers.find((row) => row.characterId === resident.id && row.incarnation === resident.incarnation);
    const start = calendarAt(now, time.date, time.startMinute);
    const end = calendarAt(now, time.date, time.endMinute);
    memoryRequire(
      rows.length < 64 &&
        live?.agenda &&
        resident &&
        player &&
        continuityActor(world, "player")?.incarnation === player.incarnation &&
        start.getTime() > now.getTime() &&
        end.getTime() - start.getTime() === (time.endMinute - time.startMinute) * 60_000 &&
        start.getHours() * 60 + start.getMinutes() === time.startMinute &&
        visitFits(world, resident.id, time, now) &&
        visitFits(world, player.id, time, now) &&
        zoneActivityFits(
          world,
          [resident.id],
          time.venueId,
          time.zoneId ?? "exterior",
          time.startMinute,
          time.endMinute,
          start,
        ) &&
        !rows.some(
          (row) =>
            (row.playerIncarnation === player.incarnation || row.resident.id === resident.id) &&
            row.time.date === time.date &&
            row.time.startMinute < time.endMinute &&
            row.time.endMinute > time.startMinute,
        ),
      "The appointment is past, inaccessible, or overlaps another commitment",
    );
    let covered = time.startMinute;
    for (const block of agendaBlocksFor(live.agenda, start)) {
      if (block.endMinute <= covered || block.startMinute >= time.endMinute) continue;
      if (block.startMinute > covered || !flexibleAgendaBlock(block) || restingAgendaBlock(block)) break;
      covered = block.endMinute;
    }
    memoryRequire(covered >= time.endMinute, "That resident is already committed during this appointment");
    world.residentPlans.appointments = [
      ...rows,
      {
        id: root,
        resident,
        playerIncarnation: player.incarnation,
        time: structuredClone(time),
        activity: fact.activity,
      },
    ];
  }
  projectAgendaReservations(world);
  return true;
}
