import type { AgendaReservation } from "../models/agenda-reservation.js";
import type { VillageAgendaBlock } from "../models/world.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";

/** Reservations share one composition rule; their owners decide admission and cancellation. */
export function composeAgenda(
  routine: readonly VillageAgendaBlock[],
  reservations: readonly AgendaReservation[],
): VillageAgendaBlock[] {
  let blocks = routine.map((block) => ({ ...block }));
  for (const reservation of reservations) {
    const replaceable = (block: VillageAgendaBlock) =>
      reservation.replaces === "flexible" ? flexibleAgendaBlock(block) : !block.essential && !block.commitmentId;
    let covered = reservation.startMinute;
    for (const block of blocks.filter(
      (part) => part.endMinute > reservation.startMinute && part.startMinute < reservation.endMinute,
    )) {
      if (block.startMinute > covered || !replaceable(block)) break;
      covered = Math.max(covered, block.endMinute);
    }
    if (covered < reservation.endMinute) continue;
    blocks = blocks.flatMap((block) => {
      const start = Math.max(block.startMinute, reservation.startMinute);
      const end = Math.min(block.endMinute, reservation.endMinute);
      if (start >= end) return [block];
      return [
        ...(block.startMinute < start ? [{ ...block, endMinute: start }] : []),
        {
          startMinute: start,
          endMinute: end,
          venueId: reservation.venueId,
          zoneId: reservation.zoneId,
          activity: reservation.activity,
          commitmentId: reservation.id,
          flexible: false,
        },
        ...(block.endMinute > end ? [{ ...block, startMinute: end }] : []),
      ];
    });
  }
  return blocks;
}
