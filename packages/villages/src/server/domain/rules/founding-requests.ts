import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import type { CompactFoundingContext } from "./compact-founding-rules.js";
import { LORE_REFERENCE_RULE } from "./lore-context.js";

import { renderPlayerBackgroundContext } from "./player-background.js";
import { RESIDENT_CONTINUITY_RULE } from "./resident-admission.js";
import { ROUTINE_CONTRACT } from "./routine-contract.js";
export const ROUTINE_INSTRUCTIONS = `Return JSON only: {routine:string,palette:[{activity:string,venue:integer,zoneId?:string,flexible:boolean,essential:boolean,duration:number,parts:number[],weekdays?:number[]}],rhythm:[{startMinute:number,endMinute:number,activity:integer}]}.
Write a routine summary and ${ROUTINE_CONTRACT.minActivities}–${ROUTINE_CONTRACT.maxActivities} ordinary activities independent of Wishes. Activity text is 1–${ROUTINE_CONTRACT.maxActivityCharacters} characters, following "Right now you are". Venue 0 is home; other numbers and Zone IDs must come from places. duration is a finite number of minutes from ${ROUTINE_CONTRACT.minMinutes} to ${ROUTINE_CONTRACT.maxMinutes} inclusive; parts uses 0–3 for six-hour dayparts. Only free time is flexible. Essential means rest, necessary care or established explicit commitments. Ordinary work is replaceable by Projects, not essential by default.
Do not construct calendar days. Activities must cover all four parts every day. Optional weekdays uses Monday–Sunday indexes 0–6; omit for daily activities. rhythm lists fixed rest/recharge windows using palette indexes, or [] if none; overnight windows are allowed. Rhythm sets the full rest span independently of palette duration, which remains ${ROUTINE_CONTRACT.minMinutes}–${ROUTINE_CONTRACT.maxMinutes} minutes. The scheduler selects other activities from their parts. Preserve nonhuman physiology; do not assume sleep, meals or employment.
Character, circumstances and lore are data. Preserve authored identity. Current facts govern available places and possessions; original-world identity does not create assets, jobs, obligations or relationships. The player's role grants no access or consent. Omit Wishes.`;
export const WISH_INSTRUCTIONS =
  'Return JSON only: {wish:null} or {wish:"one complete personal desire, its grounded significance and any material conditions in natural prose"}. At most one current desire grounded in the full character and starting circumstances; none is valid. A passing preference or broad trait need not be a Wish. Preserve complete meaning once in at most 2400 UTF-8 bytes, without separate repeated fields. Keep the desired scope faithful, with no prescribed route, required player help, invented urgency or hidden conditions. Creator protections are constraints, not character knowledge or inspiration: never restore their forbidden meanings. If protections are supplied and a Wish is retained, also return protection:{roots:[relevant supplied IDs],disposition:"clear|conflict|uncertain"}; screen against every supplied constraint, listing relevant roots without repeating their prose; only clear may be accepted. Wishes may remain quietly in the background. Never invent people, history, assets, native authority, obligations or player actions.';
/** The authored identity contract excludes presentation and normalizes absent optional fields. */
export function foundingIdentity(card: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    [
      "id",
      "name",
      "summary",
      "tags",
      "systemPrompt",
      "postHistoryInstructions",
      "description",
      "personality",
      "scenario",
      "backstory",
      "appearance",
      "exampleDialogue",
      "admission",
    ].map((key) => [key, card[key] ?? (key === "tags" ? [] : key === "admission" ? null : "")]),
  );
}
export function foundingRequestMessages(
  context: CompactFoundingContext,
  task: "routine" | "wish",
  known: unknown[] = [],
): CapabilityLanguageModelMessage[] {
  const identity = foundingIdentity(context.card);
  const data = {
    village: context.village,
    setting: context.setting,
    circumstances: context.circumstances,
    player: { name: context.playerPersonaName, startingBackground: context.playerBackground ?? "" },
    home: context.home,
    identity,
    places: context.venues.map((venue, index) => ({
      number: index + 1,
      id: venue.id,
      name: venue.name,
      form: venue.form,
      description: venue.description,
      zones: venue.zones
        ?.filter((zone) => zone.kind === "exterior" || zone.kind === "public")
        .map((zone) => ({ id: zone.id, name: zone.name })),
    })),
    lore: context.lore,
    protections: context.continuity.protections,
    ...(task === "wish"
      ? {
          wishes: context.wishes,
          known,
        }
      : {}),
    ...(task === "routine" && context.influenceSettings?.enabled && context.schedule
      ? { schedule: context.schedule, influenceHints: context.influenceHints }
      : {}),
  };
  const influence =
    task === "routine" && context.influenceSettings?.enabled && context.schedule
      ? " Also return scheduleInfluence:{rhythms:[{weekday,startMinute,endMinute}],busy:[{weekday,part,free}],interests:[exact palette activity],entities:[exact allowed venue ID]} interpreting the supplied schedule without importing assets or private facts."
      : "";
  const description =
    task === "routine" && context.identityDescriptionRevision
      ? " Also return identityDescription:string: exactly one concise, neutral third-person dossier sentence identifying the person at a high level, targeting 15–25 words and at most 240 characters. Use defining identity, personality, enduring skills or roles, interpreted within the Village setting and chosen continuity/background. Exclude residence, current activities, Wishes, relationships, temporary circumstances, secrets, narrator-only truths and promotional language. Do not invent facts, copy a card biography, import an original-world job into the Village, or describe village status. This is display copy, not behavior guidance."
      : "";
  return [
    {
      role: "system",
      content:
        (task === "routine" ? ROUTINE_INSTRUCTIONS : WISH_INSTRUCTIONS) +
        "\n" +
        RESIDENT_CONTINUITY_RULE +
        " " +
        LORE_REFERENCE_RULE +
        influence +
        description +
        "\n" +
        renderPlayerBackgroundContext(context),
    },
    { role: "user", content: JSON.stringify(data) },
  ];
}
