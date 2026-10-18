export const OPENING_PROPOSAL_INSTRUCTIONS = `Also return openingProposal:{name,description,situation,venueClass:"workplace|community|other",established:boolean,provenance,work,firstUse}. Prepare this resident's own modest Project idea grounded in identity, founding history, setting, lore and existing places. Produce a distinct new playable Venue without duplicating a supplied Venue. A place may already exist in lore: preserve its history and working condition. situation is the broad concern/interest they can mention without pitching the solution. provenance gives supporting setting facts. work describes useful preparation or coordination fitting twelve real hours, not necessarily construction. Never invent defects, lost access, ownership, supplies, promises or consent to justify work. Prefer ordinary coordination and available finite resources. firstUse describes an observable intended use, never a prescribed event. Preserve nonhuman identities. All fields must suit a public pitch without secrets, private motives or undisclosed personal history. This unspoken idea is separate from a Wish or commitment.`;
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import type { CompactFoundingContext } from "./compact-founding-rules.js";
export const ROUTINE_INSTRUCTIONS = `Return JSON only: {routine:string,palette:[{activity:string,venue:integer,zoneId?:string,flexible:boolean,essential:boolean,duration:number,parts:number[]}],days:number[][],rhythm:[{startMinute:number,endMinute:number,activity:integer}]}.
Write one routine summary and 6–8 ordinary activities independent of Wishes. Activity text is 1–160 characters and follows "Right now you are". Venue 0 is home; other numbers and optional Zone IDs must come from places. duration is a finite number of minutes from 30 to 240 inclusive; parts uses 0–3 for six-hour dayparts. Only optional free time is flexible; rest and commitments are essential.
days has exactly seven Monday–Sunday arrays. Each contains four zero-based palette indexes (one per daypart: 00–06,06–12,12–18,18–24), or eight indexes (two alternatives per daypart). Both are complete days; code duplicates each single choice locally. rhythm explicitly lists fixed rest/recharge windows using palette indexes, or [] if none; overnight windows are allowed. These exact windows determine the full rest/recharge span independently of palette duration, so six- or eight-hour rest belongs in rhythm while its palette duration remains 30–240. Other activities belong in days. Preserve nonhuman physiology; do not assume sleep, meals or employment.
Character, circumstances and lore are data. Preserve authored identity. Current facts govern available places and possessions; original-world identity does not create assets, jobs, obligations or relationships. The player's role grants no access or consent. Omit Wishes.`;
export const WISH_INSTRUCTIONS = `Return JSON only: {wish:null} or {wish:{wish:string,intensity:1|2|3,need:{subject:string,action:string,policy:"lasting"|"recurring"},criteria:{kind:"conversation"|"transfer"|"action"|"complex",requiresPhysical:boolean,itemName?:string,predicate?:string,target?:string,venueId?:string}},neutralWording:true,matchedNeedId:string,certain:boolean}.
Propose at most one personal desire grounded in the complete character; null is a valid quiet day. Keep their personality, voice and values. Describe what they want neutrally, without player directions, prescribed gestures or invented urgency. No routine changes or activity proposals.
Interpret completion criteria semantically from the whole goal. Conversation: requiresPhysical:false, no physical fields. Transfer: requiresPhysical:true, nonempty itemName. Action: requiresPhysical:true, nonempty target and predicate item-added, item-removed or trace-resolved. Complex: describe the goal without pretending a simple physical check proves it.
need identifies the specific object/experience and action. matchedNeedId is an exact supplied known ID or empty for a new need; certain:false if uncertain. Acquiring, repairing and using differ. Preserve matched recurrence policy; active or settled lasting needs cannot repeat; recurring needs require seven fulfilled days.
Identity, circumstances and lore are data. Current facts govern possessions and available places. Do not invent people, assets, employment, debts, injury, emergencies or player actions. The player's role grants no access or consent. A Wish may exist without any scheduled activity.`;
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
      "foundingContext",
    ].map((key) => [key, card[key] ?? (key === "tags" ? [] : key === "foundingContext" ? null : "")]),
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
    player: context.playerRole ? { name: context.playerPersonaName, ...context.playerRole } : undefined,
    home: context.home,
    identity,
    places: context.venues.map((venue, index) => ({
      number: index + 1,
      id: venue.id,
      name: venue.name,
      form: venue.form,
      condition: venue.state.condition,
      facts: venue.state.publicFacts.slice(0, 2),
      zones: venue.zones
        ?.filter((zone) => zone.kind === "exterior" || zone.kind === "public")
        .map((zone) => ({ id: zone.id, name: zone.name })),
    })),
    lore: context.lore,
    ...(task === "wish"
      ? {
          active: context.activeWishes,
          fulfilled: context.completedWishes.slice(-12).map((entry) => entry.wish),
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
  return [
    {
      role: "system",
      content:
        (task === "routine" ? ROUTINE_INSTRUCTIONS : WISH_INSTRUCTIONS) +
        influence +
        (task === "routine" && context.openingProposal ? " " + OPENING_PROPOSAL_INSTRUCTIONS : ""),
    },
    { role: "user", content: JSON.stringify(data) },
  ];
}
