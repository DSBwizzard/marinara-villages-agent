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

function discussionWindow(now: ZonedDate, query: string) {
  const weekday = query.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/iu)?.[0];
  const weekdayIndex = VILLAGE_WEEKDAYS.findIndex((name) => name.toLowerCase() === weekday?.toLowerCase());
  const date = query.match(/\b\d{4}-\d{2}-\d{2}\b/u)?.[0];
  const offset = /\byesterday\b/iu.test(query)
    ? -1
    : /\btomorrow\b/iu.test(query)
      ? 1
      : weekdayIndex >= 0
        ? (weekdayIndex - ((now.getDay() + 6) % 7) + 7) % 7
        : 0;
  const key = date ?? agendaDateKey(dayOffset(now, offset));
  const candidate = date ? calendarAt(now, date, 720) : dayOffset(now, offset);
  const day = agendaDateKey(candidate) === key ? candidate : undefined;
  const [start, end] = /\bmorning\b/iu.test(query)
    ? [0, 720]
    : /\bafternoon\b/iu.test(query)
      ? [720, 1080]
      : /\b(?:evening|tonight)\b/iu.test(query)
        ? [1080, 1440]
        : [0, 1440];
  return { day, key, start, end };
}

export function sceneAgendaContext(
  world: VillageState,
  speakers: readonly { characterId: string; doing: string; zoneId?: string }[],
  now: Date,
  query: string,
  currentVenueId: string,
  focusActorId?: string,
) {
  const at = dateAt(world, now);
  const minute = at.getHours() * 60 + at.getMinutes();
  const today = agendaDateKey(at);
  const window = discussionWindow(at, query);
  const candidateDays = [
    ...new Map(
      [window.day, ...Array.from({ length: 7 }, (_, offset) => dayOffset(at, offset))].flatMap((day) =>
        day && agendaDateKey(day) >= today ? [[agendaDateKey(day), day] as const] : [],
      ),
    ).values(),
  ];
  const addressed = focusActorId ? speakers.filter((speaker) => speaker.characterId === focusActorId) : speakers;
  const agendaOptions: { actorId: string; activity: string; time: AgendaTime }[] = [];
  const activities = speakers.flatMap(({ characterId, doing, zoneId }) => {
    const agenda = world.villagers.find((row) => row.characterId === characterId)?.agenda;
    if (!agenda) return doing ? [{ actorId: characterId, doing }] : [];
    const current = agendaBlocksFor(agenda, at).find(
      (block) =>
        block.startMinute <= minute &&
        block.endMinute > minute &&
        block.venueId === currentVenueId &&
        (!block.zoneId || !zoneId || block.zoneId === zoneId),
    );
    const option = (block: VillageAgendaBlock, date: string) => ({
      actorId: characterId,
      activity: block.activity,
      time: {
        date,
        startMinute: block.startMinute,
        endMinute: block.endMinute,
        venueId: block.venueId,
        ...(block.zoneId ? { zoneId: block.zoneId } : {}),
      },
    });
    if (current) agendaOptions.push(option(current, today));
    return doing ? [{ actorId: characterId, doing }] : [];
  });
  const upcoming = candidateDays
    .flatMap((day) =>
      addressed.flatMap(({ characterId }) => {
        const agenda = world.villagers.find((row) => row.characterId === characterId)?.agenda;
        if (!agenda) return [];
        const date = agendaDateKey(day);
        const firstMinute = date === today ? minute : -1;
        return agendaBlocksFor(agenda, day)
          .filter((block) => scheduledAgendaActivity(block) && block.startMinute > firstMinute)
          .sort((a, b) =>
            date === window.key
              ? Number(b.startMinute < window.end && b.endMinute > window.start) -
                Number(a.startMinute < window.end && a.endMinute > window.start)
              : 0,
          )
          .slice(0, date === window.key ? 3 : 1)
          .map((block) => ({
            actorId: characterId,
            activity: block.activity,
            time: {
              date,
              startMinute: block.startMinute,
              endMinute: block.endMinute,
              venueId: block.venueId,
              ...(block.zoneId ? { zoneId: block.zoneId } : {}),
            },
          }));
      }),
    )
    .slice(0, 12);
  agendaOptions.push(...upcoming.filter(({ time }) => !!time.venueId));
  const homeActivities = upcoming
    .filter(({ time }) => !time.venueId)
    .map(({ actorId, activity, time }) => ({
      actorId,
      activity,
      date: time.date,
      startMinute: time.startMinute,
      endMinute: time.endMinute,
    }));
  const available =
    window.day && window.key >= today
      ? addressed
          .flatMap(({ characterId }) => {
            const agenda = world.villagers.find((row) => row.characterId === characterId)?.agenda;
            const start = Math.max(window.start, window.key === today ? minute : 0);
            const block =
              agenda &&
              agendaBlocksFor(agenda, window.day!).find(
                (row) =>
                  flexibleAgendaBlock(row) &&
                  !restingAgendaBlock(row) &&
                  Math.min(row.endMinute, window.end) > Math.max(row.startMinute, start),
              );
            if (!agenda || start >= window.end) return [];
            return [
              {
                actorId: characterId,
                date: window.key,
                startMinute: block ? Math.max(block.startMinute, start) : start,
                endMinute: block ? Math.min(block.endMinute, window.end) : window.end,
                free: !!block,
              },
            ];
          })
          .slice(0, 1)
      : [];
  const recentChange = addressed.flatMap(({ characterId }) => {
    const agenda = world.villagers.find((row) => row.characterId === characterId)?.agenda;
    const change =
      agenda &&
      recentAgendaChanges(agenda, at).find(
        (row) => row.date === window.key && row.startMinute < window.end && row.endMinute > window.start,
      );
    if (!change) return [];
    const { changedAt: _changedAt, ...details } = change;
    return [{ actorId: characterId, ...details }];
  })[0];
  return {
    agendaOptions: agendaOptions.slice(0, 16),
    ...(activities.length ? { activities } : {}),
    ...(homeActivities.length ? { homeActivities } : {}),
    ...(available.length ? { available } : {}),
    ...(recentChange ? { recentChange } : {}),
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
    const reservation = world.residentPlans.appointments?.find(
      (appointment) =>
        appointment.id === row.id &&
        appointment.playerIncarnation === player.incarnation &&
        appointment.resident.id === actor.id &&
        appointment.resident.incarnation === actor.incarnation &&
        memoryHash(appointment.time) === memoryHash(fact.time) &&
        appointment.activity === fact.activity,
    );
    if (reservation?.cancelled && (!reservation.termsVersionId || reservation.termsVersionId === offer.termsVersionId))
      return [];
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
  if (!write.closeOffer) return false;
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
      !!venue &&
      !!resolveVenueZone(venue, row.time.zoneId ?? "exterior") &&
      calendarAt(now, row.time.date, row.time.endMinute).getTime() > now.getTime() &&
      world.villagers.some(
        (resident) => resident.characterId === row.resident.id && resident.incarnation === row.resident.incarnation,
      )
    );
  });
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
  const start = calendarAt(now, time.date, time.startMinute);
  const end = calendarAt(now, time.date, time.endMinute);
  if (!(
    (rows.length < 64 || !!previous) &&
    live?.agenda &&
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
        !row.cancelled &&
        (row.playerIncarnation === player.incarnation || row.resident.id === resident.id) &&
        row.time.date === time.date &&
        row.time.startMinute < time.endMinute &&
        row.time.endMinute > time.startMinute,
    )
  ))
    throw conflict("The appointment is past, inaccessible, or overlaps another commitment", "APPOINTMENT_UNAVAILABLE");
  let covered = time.startMinute;
  for (const block of agendaBlocksFor(live.agenda, start)) {
    if (block.endMinute <= covered || block.startMinute >= time.endMinute) continue;
    if (block.startMinute > covered || !flexibleAgendaBlock(block) || restingAgendaBlock(block)) break;
    covered = block.endMinute;
  }
  if (covered < time.endMinute) {
    throw conflict("That resident is already committed during this appointment", "APPOINTMENT_UNAVAILABLE");
  }
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
