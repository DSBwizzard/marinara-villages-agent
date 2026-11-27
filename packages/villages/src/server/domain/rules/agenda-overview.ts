import type { AgendaAppointmentOffer, AgendaTime, AgendaWeek } from "../../../shared/contracts/agenda.js";
import { calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import type { ContinuityEvidence, ContinuityWrite } from "../models/continuity-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import { recentAgendaChanges } from "./agenda-changes.js";
import type { VillageAgendaBlock, VillageState } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { restingAgendaBlock, scheduledAgendaActivity } from "./agenda-plan.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";
import { continuityActor } from "./continuity-actors.js";
import { continuityProtectionUnits, continuityViews, latestRelationshipScores, relationshipKey } from "./continuity.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { conflict, notFound } from "./errors.js";
import { findLocation } from "./places.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { ordinaryUseRestricted } from "./narrative-environment.js";
import { resolveVenueZone, zoneClosed } from "./venue-zones.js";
import { zoneActivityFits } from "./venue-presence.js";
import { projectAgendaReservations } from "./project-focus.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { WARMTH_THRESHOLDS } from "../../../shared/contracts/relationships.js";
import { villageWorldScope } from "./village-identity.js";

export const AGENDA_SHARED_WARMTH = WARMTH_THRESHOLDS[1];
const dateAt = (world: VillageState, instant: Date) =>
  new ZonedDate(instant, world.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
const dayOffset = (now: ZonedDate, offset: number) => {
  const day = new ZonedDate(now, now.zone);
  day.setDate(day.getDate() + offset);
  return day;
};

function flexibleAgendaRanges(blocks: VillageAgendaBlock[], start: number) {
  const ranges: [number, number][] = [];
  for (const block of blocks) {
    const from = Math.max(start, block.startMinute);
    if (from >= block.endMinute || !flexibleAgendaBlock(block) || restingAgendaBlock(block)) continue;
    const last = ranges.at(-1);
    if (last && last[1] === from) last[1] = block.endMinute;
    else ranges.push([from, block.endMinute]);
  }
  return ranges;
}

export function sceneAgendaContext(
  world: VillageState,
  speakers: readonly { characterId: string; doing: string; zoneId?: string }[],
  now: Date,
  currentVenueId: string,
  knownVenues: readonly { id: string; zones: readonly { id: string }[] }[],
) {
  const at = dateAt(world, now);
  const minute = at.getHours() * 60 + at.getMinutes();
  const today = agendaDateKey(at);
  const days = Array.from({ length: 7 }, (_, offset) => dayOffset(at, offset));
  const schedules = speakers.flatMap((speaker) => {
    const agenda = world.villagers.find((resident) => resident.characterId === speaker.characterId)?.agenda;
    return agenda ? [{ speaker, agenda }] : [];
  });
  const destinations = new Map(knownVenues.map(({ id, zones }) => [id, new Set(zones.map((zone) => zone.id))]));
  const knownSlot = ({ venueId, zoneId }: Pick<AgendaTime, "venueId" | "zoneId">) =>
    destinations.get(venueId)?.has(zoneId ?? "exterior") === true;
  const option = (actorId: string, block: VillageAgendaBlock, date: string) => ({
    actorId,
    activity: block.activity,
    time: {
      date,
      startMinute: block.startMinute,
      endMinute: block.endMinute,
      venueId: block.venueId,
      ...(block.zoneId ? { zoneId: block.zoneId } : {}),
    },
  });
  const current = schedules.flatMap(({ speaker, agenda }) => {
    const block = agendaBlocksFor(agenda, at).find(
      (entry) =>
        entry.startMinute <= minute &&
        entry.endMinute > minute &&
        entry.venueId === currentVenueId &&
        (!entry.zoneId || !speaker.zoneId || entry.zoneId === speaker.zoneId),
    );
    return block && knownSlot(block) ? [option(speaker.characterId, block, today)] : [];
  });
  const calendar = days.map((day) => {
    const date = agendaDateKey(day);
    const start = date === today ? minute + 1 : 0;
    return {
      date,
      start,
      schedules: schedules.map(({ speaker, agenda }) => ({
        actorId: speaker.characterId,
        blocks: agendaBlocksFor(agenda, day).filter((block) => block.endMinute > start),
      })),
    };
  });
  const upcoming = calendar.map(({ date, start, schedules }) =>
    schedules
      .flatMap(({ actorId, blocks }) =>
        blocks
          .filter((block) => block.startMinute >= start && scheduledAgendaActivity(block))
          .map((block) => option(actorId, block, date)),
      )
      .toSorted((a, b) => a.time.startMinute - b.time.startMinute),
  );
  const venueActivities = upcoming.flatMap((day) => day.filter(({ time }) => knownSlot(time)).slice(0, 2));
  const homeActivities = upcoming
    .flatMap((day) => day.filter(({ time }) => !time.venueId).slice(0, 1))
    .map(({ actorId, activity, time: { date, startMinute, endMinute } }) => ({
      actorId,
      activity,
      date,
      startMinute,
      endMinute,
    }));
  const available = Object.fromEntries(
    schedules.map(({ speaker }, index) => [
      speaker.characterId,
      Object.fromEntries(
        calendar.map(({ date, start, schedules }) => [date, flexibleAgendaRanges(schedules[index].blocks, start)]),
      ),
    ]),
  );
  const latest = schedules
    .flatMap(({ speaker, agenda }) =>
      recentAgendaChanges(agenda, at).map((change) => ({ actorId: speaker.characterId, ...change })),
    )
    .toSorted((a, b) => b.changedAt.localeCompare(a.changedAt))[0];
  const activities = speakers.flatMap(({ characterId, doing }) => (doing ? [{ actorId: characterId, doing }] : []));
  const { changedAt: _at, ...recentChange } = latest ?? {};
  return {
    agendaOptions: [...current, ...venueActivities].slice(0, 16),
    ...(activities.length ? { activities } : {}),
    ...(homeActivities.length ? { homeActivities } : {}),
    ...(schedules.length ? { available } : {}),
    ...(latest ? { recentChange } : {}),
  };
}
function knownAgenda(world: VillageState, actorId: string, now: Date) {
  const resident = world.villagers.find((row) => row.characterId === actorId);
  const player = continuityActor(world, "player");
  if (!resident || !player) throw notFound("That villager does not live here.");
  const actor = { id: actorId, incarnation: resident.incarnation };
  const pending: (AgendaAppointmentOffer & { booked: boolean; termsVersionId: string })[] = [];
  const known = continuityViews(
    world.continuity,
    player,
    now.toISOString(),
    continuityProtectionUnits(world.continuity, player, episodeSourceGraph(world.episodes.records, player)),
  ).flatMap<{ id: string; time: AgendaTime; activity: string; source: "told" | "seen" | "agreed" }>((row) => {
    const offer = row.offer && world.continuity.records.find((record) => record.id === row.id)?.offer;
    const fact = offer
      ? world.continuity.versions.find((version) => version.id === offer.termsVersionId)?.agenda
      : row.version.agenda;
    if (!fact || row.repaired || row.version.closed || fact.actorId !== actorId) return [];
    if (fact.kind !== "offer")
      return row.version.about.some((subject) => subject.id === actorId && subject.incarnation === actor.incarnation)
        ? [{ ...fact, id: row.id, source: fact.kind }]
        : [];
    if (
      !row.offer?.participants.some((party) => party.id === actorId && party.incarnation === actor.incarnation) ||
      !row.offer.participants.some((party) => party.id === "player" && party.incarnation === player.incarnation) ||
      !offer ||
      !["offered", "accepted"].includes(row.offer.state) ||
      !row.offer.contributions.some(
        (event) =>
          event.by === actorId &&
          (event.act === "offer" || event.act === "accept") &&
          event.sources.some(
            (source) =>
              source.kind === "speech" &&
              source.perceptions.some((reader) => reader.actorId === "player" && reader.channel === "words"),
          ),
      )
    )
      return [];
    const appointment = world.residentPlans.appointments?.find(
      (appointment) =>
        appointment.id === row.id &&
        appointment.playerIncarnation === player.incarnation &&
        appointment.resident.id === actor.id &&
        appointment.resident.incarnation === actor.incarnation,
    );
    const sameTerms = !appointment?.termsVersionId || appointment.termsVersionId === offer.termsVersionId;
    if (world.residentPlans.appointmentRepairs?.[row.id] && sameTerms)
      return appointment && !appointment.cancelled
        ? [{ id: row.id, time: appointment.time, activity: appointment.activity, source: "agreed" as const }]
        : [];
    const reservation =
      appointment && memoryHash(appointment.time) === memoryHash(fact.time) && appointment.activity === fact.activity
        ? appointment
        : undefined;
    if (reservation?.cancelled && sameTerms) return [];
    const booked = !!reservation && !reservation.cancelled;
    const venue = findLocation(world, fact.time.venueId);
    const zone = venue && resolveVenueZone(venue, fact.time.zoneId ?? "exterior");
    if (
      (fact.confirmable || booked) &&
      venue &&
      zone &&
      calendarAt(dateAt(world, now), fact.time.date, fact.time.startMinute) > now
    )
      pending.push({
        id: row.id,
        token: memoryHash([villageWorldScope(world), player, actor, offer.termsVersionId, fact.time, fact.activity]),
        time: fact.time,
        activity: fact.activity,
        place: zone.kind === "exterior" ? venue.name : `${venue.name}, ${zone.name}`,
        booked,
        termsVersionId: offer.termsVersionId,
      });
    return booked ? [{ ...fact, id: row.id, source: "agreed" as const }] : [];
  });
  return { resident, actor, player, known, pending };
}

export function agendaWeek(world: VillageState, actorId: string, now: Date, inspect: boolean): AgendaWeek {
  const { resident, actor, player, known, pending } = knownAgenda(world, actorId, now);
  const shared =
    !inspect &&
    (latestRelationshipScores(world.continuity).get(relationshipKey(actor, player))?.relationshipScore ?? 0) >=
      AGENDA_SHARED_WARMTH;
  const at = dateAt(world, now);
  const confirmed = currentAppointments(world, at)
    .filter(
      (entry) =>
        !entry.cancelled &&
        entry.resident.id === actor.id &&
        entry.resident.incarnation === actor.incarnation &&
        entry.playerIncarnation === player.incarnation,
    )
    .map((entry) => {
      const control = { id: entry.id, token: appointmentCancellationToken(world, entry) };
      if (!known.some(({ id, source }) => id === entry.id && source === "agreed"))
        return { ...control, activity: "Booked appointment" };
      const venue = findLocation(world, entry.time.venueId);
      const zone = venue && resolveVenueZone(venue, entry.time.zoneId ?? "exterior");
      return venue && zone
        ? {
            ...control,
            time: entry.time,
            activity: entry.activity,
            place: zone.kind === "exterior" ? venue.name : `${venue.name}, ${zone.name}`,
          }
        : { ...control, activity: "Booked appointment" };
    });
  const privateAppointments = new Set(confirmed.filter((entry) => !("time" in entry)).map((entry) => entry.id));
  return {
    ...(confirmed.length ? { confirmed } : {}),
    visibility: inspect ? "inspect" : shared ? "shared" : "known",
    ...(pending.some((offer) => !offer.booked)
      ? {
          pending: pending
            .filter((offer) => !offer.booked)
            .slice(-12)
            .map(({ booked: _booked, termsVersionId: _terms, ...offer }) => offer),
        }
      : {}),
    days: Array.from({ length: 7 }, (_, offset) => {
      const day = dayOffset(at, offset),
        date = agendaDateKey(day);
      const visible = known.filter((row) => row.time.date === date);
      const effective = resident.agenda ? agendaBlocksFor(resident.agenda, day).filter(scheduledAgendaActivity) : [];
      const times: (Omit<AgendaTime, "date"> & {
        activity: string;
        purpose?: VillageAgendaBlock["purpose"];
        source?: "told" | "seen" | "agreed";
      })[] =
        inspect || shared
          ? effective.map((block) => ({
              ...block,
              ...(!inspect && block.commitmentId && privateAppointments.has(block.commitmentId)
                ? { activity: "Booked appointment", venueId: "", zoneId: undefined }
                : {}),
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
      const blocks = times.map(({ startMinute, endMinute, activity, purpose, venueId, zoneId, source }) => {
        const venue = findLocation(world, venueId);
        const zone = venue && zoneId && resolveVenueZone(venue, zoneId);
        return {
          startMinute,
          endMinute,
          activity,
          ...(restingAgendaBlock({ activity, purpose }) ? { resting: true as const } : {}),
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

/** Administrative correction changes the current booking, retaining its original witnessed terms. */
export function repairSceneAppointment(
  world: VillageState,
  id: string,
  next: { time: AgendaTime; activity: string } | null,
  instant: string,
  operationId: string,
) {
  const rows = world.residentPlans.appointments ?? [],
    row = rows.find((entry) => entry.id === id);
  memoryRequire(row && !row.cancelled, "This agreed plan changed. Reopen the Agenda.");
  (world.residentPlans.appointmentRepairs ??= {})[id] = { operationId, at: instant };
  world.residentPlans.appointments = rows.filter((entry) => entry.id !== id);
  projectAgendaReservations(world);
  if (!next) return;
  const now = dateAt(world, new Date(instant)),
    { time, activity } = next;
  const resident = world.villagers.find(
    (entry) => entry.characterId === row.resident.id && entry.incarnation === row.resident.incarnation,
  );
  const start = calendarAt(now, time.date, time.startMinute),
    end = calendarAt(now, time.date, time.endMinute);
  memoryRequire(
    resident?.agenda &&
      row.playerIncarnation === continuityActor(world, "player")?.incarnation &&
      activity.trim() &&
      activity.length <= 240 &&
      Number.isInteger(time.startMinute) &&
      Number.isInteger(time.endMinute) &&
      time.startMinute >= 0 &&
      time.endMinute <= 1440 &&
      time.endMinute > time.startMinute &&
      start.getTime() > now.getTime() &&
      end.getTime() - start.getTime() === (time.endMinute - time.startMinute) * 60000 &&
      start.getHours() * 60 + start.getMinutes() === time.startMinute &&
      visitFits(world, resident.characterId, time, now) &&
      visitFits(world, "player", time, now) &&
      zoneActivityFits(
        world,
        [resident.characterId],
        time.venueId,
        time.zoneId ?? "exterior",
        time.startMinute,
        time.endMinute,
        start,
      ) &&
      !world.residentPlans.appointments.some(
        (other) =>
          !other.cancelled &&
          other.time.date === time.date &&
          (other.playerIncarnation === row.playerIncarnation || other.resident.id === resident.characterId) &&
          other.time.startMinute < time.endMinute &&
          other.time.endMinute > time.startMinute,
      ),
    "The agreed plan is past, inaccessible, or overlaps another commitment.",
  );
  let covered = time.startMinute;
  for (const block of agendaBlocksFor(resident.agenda, start)) {
    if (block.endMinute <= covered || block.startMinute >= time.endMinute) continue;
    if (block.startMinute > covered || !flexibleAgendaBlock(block) || restingAgendaBlock(block)) break;
    covered = block.endMinute;
  }
  memoryRequire(covered >= time.endMinute, "That person already has a commitment during this time.");
  world.residentPlans.appointments.push({ ...row, time, activity });
  projectAgendaReservations(world);
}

export function sceneAgendaEvidence(
  world: VillageState,
  write: ContinuityWrite,
  readset: NarrationReadset,
  sources: ContinuityEvidence[],
  acceptedAt: string,
) {
  const evidence = write.agenda;
  if (!evidence) return;
  const { actorId, time, kind } = evidence;
  const actor = continuityActor(world, actorId);
  const resident = world.villagers.find((row) => row.characterId === actorId);
  memoryRequire(
    actor &&
      resident?.agenda &&
      !readset.visitorIds?.includes(actorId) &&
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
        time.endMinute - time.startMinute <= 180 &&
        readset.agendaVenues.some(
          (venue) => venue.id === time.venueId && venue.zones.includes(time.zoneId ?? "exterior"),
        ) &&
        calendarAt(
          new ZonedDate(readset.calendar.instant, readset.calendar.timeZone),
          time.date,
          time.startMinute,
        ).getTime() > Date.parse(readset.calendar.instant),
      "The appointment needs a future slot and a supplied location",
    );
    if (readset.validateAppointmentAvailability && evidence.confirmable) {
      const player = continuityActor(world, "player");
      memoryRequire(
        player && !appointmentConflict(world, resident, player, time, dateAt(world, new Date(acceptedAt))),
        "The offered appointment is unavailable",
      );
    }
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

export function assertFreshAppointmentDecision(world: VillageState, write: ContinuityWrite, capturedAt: string) {
  const repair = write.closeOffer && write.target && world.residentPlans.appointmentRepairs?.[write.target.id];
  memoryRequire(
    !repair || Date.parse(capturedAt) > Date.parse(repair.at),
    "The appointment changed after this decision was captured.",
  );
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
  if (!write.closeOffer) return false;
  const now = dateAt(world, new Date(instant));
  const rows = currentAppointments(world, now);
  if (!rows.some((row) => row.id === root && !row.cancelled)) return false;
  world.residentPlans.appointments = rows.filter((row) => row.id !== root);
  projectAgendaReservations(world);
  return true;
}

function currentAppointments(world: VillageState, now: ZonedDate) {
  return (world.residentPlans.appointments ?? []).filter((row) => {
    const venue = findLocation(world, row.time.venueId);
    return (
      (row.cancelled || (!!venue && !!resolveVenueZone(venue, row.time.zoneId ?? "exterior"))) &&
      calendarAt(now, row.time.date, row.time.endMinute).getTime() > now.getTime() &&
      world.villagers.some(
        (resident) => resident.characterId === row.resident.id && resident.incarnation === row.resident.incarnation,
      )
    );
  });
}

function appointmentConflict(
  world: VillageState,
  resident: VillageState["villagers"][number],
  player: { incarnation: string },
  time: AgendaTime,
  now: ZonedDate,
  replacingId?: string,
) {
  const rows = currentAppointments(world, now);
  const residentId = resident.characterId;
  const start = calendarAt(now, time.date, time.startMinute);
  const end = calendarAt(now, time.date, time.endMinute);
  if (!(
    (rows.length < 64 || rows.some((row) => row.id === replacingId)) &&
    resident.agenda &&
    start.getTime() > now.getTime() &&
    end.getTime() - start.getTime() === (time.endMinute - time.startMinute) * 60_000 &&
    start.getHours() * 60 + start.getMinutes() === time.startMinute &&
    visitFits(world, residentId, time, now) &&
    visitFits(world, "player", time, now) &&
    zoneActivityFits(
      world,
      [residentId],
      time.venueId,
      time.zoneId ?? "exterior",
      time.startMinute,
      time.endMinute,
      start,
    ) &&
    !rows.some(
      (row) =>
        !row.cancelled &&
        (row.playerIncarnation === player.incarnation || row.resident.id === residentId) &&
        row.time.date === time.date &&
        row.time.startMinute < time.endMinute &&
        row.time.endMinute > time.startMinute,
    )
  ))
    return "The appointment is past, inaccessible, or overlaps another commitment";
  if (
    !flexibleAgendaRanges(agendaBlocksFor(resident.agenda, start), time.startMinute).some(
      ([from, to]) => from === time.startMinute && to >= time.endMinute,
    )
  )
    return "That resident is already committed during this appointment";
}

function appointmentCancellationToken(
  world: VillageState,
  entry: NonNullable<VillageState["residentPlans"]["appointments"]>[number],
) {
  return memoryHash(["cancel-appointment", villageWorldScope(world), entry]);
}

export function cancelAgendaAppointment(world: VillageState, actorId: string, token: string, instant: Date) {
  const resident = world.villagers.find((row) => row.characterId === actorId);
  const player = continuityActor(world, "player");
  const rows = currentAppointments(world, dateAt(world, instant));
  const selected = rows.find(
    (row) =>
      !row.cancelled &&
      row.resident.id === actorId &&
      row.resident.incarnation === resident?.incarnation &&
      row.playerIncarnation === player?.incarnation &&
      appointmentCancellationToken(world, row) === token,
  );
  if (!selected) throw conflict("That appointment changed. Refresh the Agenda.", "APPOINTMENT_CHANGED");
  world.residentPlans.appointments = rows.map((row) => (row.id === selected.id ? { ...row, cancelled: true } : row));
  projectAgendaReservations(world);
}

export function confirmAgendaAppointment(world: VillageState, actorId: string, token: string, instant: Date) {
  const { pending, resident: live, actor: resident, player } = knownAgenda(world, actorId, instant);
  const selected = pending.find((offer) => offer.token === token);
  if (!selected) throw conflict("That appointment changed. Refresh the Agenda.", "APPOINTMENT_CHANGED");
  const now = dateAt(world, instant);
  const rows = currentAppointments(world, now);
  const { time, activity, id, termsVersionId } = selected;
  const previous = rows.find((row) => row.id === id);
  if (previous && !previous.cancelled) {
    if (previous.activity !== activity || memoryHash(previous.time) !== memoryHash(time))
      throw conflict("That appointment was already booked with a different slot.", "APPOINTMENT_CHANGED");
    return false;
  }
  const unavailable = appointmentConflict(world, live, player, time, now, previous?.id);
  if (unavailable) throw conflict(unavailable, "APPOINTMENT_UNAVAILABLE");
  world.residentPlans.appointments = [
    ...rows.filter((row) => row.id !== id),
    {
      id,
      resident,
      playerIncarnation: player.incarnation,
      termsVersionId,
      time: structuredClone(time),
      activity,
    },
  ];
  projectAgendaReservations(world);
  return true;
}
