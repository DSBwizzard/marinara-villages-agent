import type { AgendaReservation } from "../models/agenda-reservation.js";
import type { VillageAgendaBlock } from "../models/world.js";
import { flexibleAgendaBlock, restingAgendaBlock } from "./agenda-flexibility.js";

/** Reservations share one composition rule; their owners decide admission and cancellation. */
export function composeAgenda(
  routine: readonly VillageAgendaBlock[],
  reservations: readonly AgendaReservation[],
): VillageAgendaBlock[] {
  let blocks = routine.map((block) => ({ ...block }));
  for (const reservation of reservations) {
    const replaceable = (block: VillageAgendaBlock) =>
      reservation.replaces === "flexible" ? flexibleAgendaBlock(block) : !block.essential && !block.commitmentId;
    const work = reservation.source === "work";
    let covered = reservation.startMinute;
    for (const block of blocks.filter(
      (part) => part.endMinute > reservation.startMinute && part.startMinute < reservation.endMinute,
    )) {
      if (block.startMinute > covered || !replaceable(block)) break;
      covered = Math.max(covered, block.endMinute);
    }
    if (!work && covered < reservation.endMinute) continue;
    const composed: VillageAgendaBlock[] = [];
    let assigned: VillageAgendaBlock | undefined;
    for (const block of blocks) {
      const start = Math.max(block.startMinute, reservation.startMinute);
      const end = Math.min(block.endMinute, reservation.endMinute);
      if (start >= end || (work && (!replaceable(block) || restingAgendaBlock(block)))) {
        composed.push(block);
        continue;
      }
      if (block.startMinute < start) composed.push({ ...block, endMinute: start });
      if (assigned?.endMinute === start && composed.at(-1) === assigned) {
        assigned.endMinute = end;
      } else {
        assigned = {
          startMinute: start,
          endMinute: end,
          venueId: reservation.venueId,
          zoneId: reservation.zoneId,
          activity: reservation.activity,
          ...(work ? {} : { commitmentId: reservation.id }),
          flexible: false,
        };
        composed.push(assigned);
      }
      if (block.endMinute > end) composed.push({ ...block, startMinute: end });
    }
    blocks = composed;
  }
  return blocks;
}
