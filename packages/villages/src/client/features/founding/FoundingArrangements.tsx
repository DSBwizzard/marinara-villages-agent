import type { VillageVenue } from "../../../shared/contracts/village.js";
import { workTime } from "../../../shared/helpers/venue-work.js";
import { foundingHomeMembers } from "./founding-homes.js";

export function FoundingArrangements({
  venues,
  people,
}: {
  venues: VillageVenue[];
  people: { id: string; name: string }[];
}) {
  const name = (id: string) => (id === "player" ? "You" : (people.find((row) => row.id === id)?.name ?? "Villager"));
  return (
    <section aria-label="Home and work arrangements">
      {venues.map((venue) => {
        const zones = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])];
        const zoneName = (id: string | undefined) => zones.find((row) => row.id === id)?.name || "Choose a Zone";
        const members = foundingHomeMembers(venue);
        return (
          <div key={venue.id}>
            <h3>{venue.name}</h3>
            <dl>
              {!!members.length && (
                <>
                  <dt>Lives here</dt>
                  <dd>
                    {members
                      .map((id) => `${name(id)} , sleeps in ${zoneName(venue.destinations?.[id]?.sleep)}`)
                      .join("; ")}
                  </dd>
                </>
              )}
              {!!venue.access?.managerIds.length && (
                <>
                  <dt>Change visitor rules</dt>
                  <dd>{venue.access.managerIds.map(name).join(", ")}</dd>
                </>
              )}
              {(venue.access?.work ?? []).map((work) => (
                <div key={work.characterId}>
                  <dt>{name(work.characterId)} works here</dt>
                  <dd>
                    {work.activity} , {zoneName(work.zoneId)} , {work.days.map((day) => day.slice(0, 3)).join(", ")} ,{" "}
                    {workTime(work.startMinute)}–{workTime(work.endMinute)}
                    <br />
                    Access: {work.accessZoneIds.map(zoneName).join(", ")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </section>
  );
}
