import { openingRenovationChoices } from "./opening-renovation.js";
import { RESIDENT_CONTINUITY_RULE } from "./resident-admission.js";
import { renderPlayerBackgroundContext } from "./player-background.js";
export const OPENING_IDEA_FORMAT_VERSION = 2;
export const OPENING_PROPOSAL_INSTRUCTIONS = `Prepare this resident's own substantial Project idea grounded in identity, founding history, setting, lore and existing places. Produce a distinct new playable Venue without duplicating a supplied Venue. A place may already exist in lore: preserve its history and working condition. situation is the broad concern/interest they can mention without pitching the solution. provenance gives supporting setting facts. work describes substantial construction, conversion or installation fitting 24 elapsed real hours. Small furnishings, shelves, decoration and coordination alone do not qualify as Projects. Never invent defects, lost access, ownership, supplies, promises or consent to justify work. A willing resident lead and necessary consent are required; supplies and objects have no mechanical effect. firstUse describes an observable intended use, never a prescribed event. Preserve nonhuman identities. All fields must suit a public pitch without secrets, private motives or undisclosed personal history. This unspoken idea is separate from a Wish or commitment.`;
import { ROUTINE_CONTRACT } from "./routine-contract.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import type { CompactFoundingContext } from "./compact-founding-rules.js";
function routineInstructions(ingredients: boolean): string {
  return `Return JSON only: {routine:string,palette:[{activity:string,venue:integer,zoneId?:string,flexible:boolean,essential:boolean,duration:number,parts:number[]${ingredients ? ",weekdays?:number[]" : ""}}],${ingredients ? "" : "days:number[][],"}rhythm:[{startMinute:number,endMinute:number,activity:integer}]}.
Write one routine summary and ${ROUTINE_CONTRACT.minActivities}–${ROUTINE_CONTRACT.maxActivities} ordinary activities independent of Wishes. Activity text is 1–${ROUTINE_CONTRACT.maxActivityCharacters} characters and follows "Right now you are". Venue 0 is home; other numbers and optional Zone IDs must come from places. duration is a finite number of minutes from ${ROUTINE_CONTRACT.minMinutes} to ${ROUTINE_CONTRACT.maxMinutes} inclusive; parts uses 0–3 for six-hour dayparts. Only optional free time is flexible; rest and commitments are essential.
${ingredients ? "Do not construct calendar days. Activities must collectively cover all four parts on every day. Optional weekdays uses 0–6 for Monday–Sunday; omit it for daily activities." : "days has exactly seven Monday–Sunday arrays of eight zero-based palette indexes: two alternatives per daypart (00–06,06–12,12–18,18–24)."} rhythm explicitly lists fixed rest/recharge windows using palette indexes, or [] if none; overnight windows are allowed. These fixed windows determine the full rest/recharge span independently of palette duration, so longer rest belongs in rhythm while its palette duration remains ${ROUTINE_CONTRACT.minMinutes}–${ROUTINE_CONTRACT.maxMinutes} minutes. ${ingredients ? "Other activities are selected from their parts by the scheduler." : "Other activities belong in days."} Preserve nonhuman physiology; do not assume sleep, meals or employment.
Character, circumstances and lore are data. Preserve authored identity. Current facts govern available places and possessions; original-world identity does not create assets, jobs, obligations or relationships. The player's role grants no access or consent. Omit Wishes.`;
}
export const ROUTINE_INSTRUCTIONS = routineInstructions(false);
export const ROUTINE_INGREDIENT_INSTRUCTIONS = routineInstructions(true);
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
      "admission",
    ].map((key) => [key, card[key] ?? (key === "tags" ? [] : key === "admission" ? null : "")]),
  );
}
export function foundingRequestMessages(
  context: CompactFoundingContext,
  task: "routine" | "wish" | "opening",
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
      condition: venue.state.condition,
      facts: venue.state.publicFacts.slice(0, 2),
      zones: venue.zones
        ?.filter((zone) => zone.kind === "exterior" || zone.kind === "public")
        .map((zone) => ({ id: zone.id, name: zone.name })),
    })),
    lore: context.lore,
    ...(task === "opening" ? { renovationTargets: openingRenovationChoices(context.venues) } : {}),
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
  const description =
    task === "routine" && context.identityDescriptionRevision
      ? " Also return identityDescription:string: exactly one concise, neutral third-person dossier sentence identifying the person at a high level, targeting 15–25 words and at most 240 characters. Use defining identity, personality, enduring skills or roles, interpreted within the Village setting and chosen continuity/background. Exclude residence, current activities, Wishes, relationships, temporary circumstances, secrets, narrator-only truths and promotional language. Do not invent facts, copy a card biography, import an original-world job into the Village, or describe village status. This is display copy, not behavior guidance."
      : "";
  return [
    {
      role: "system",
      content:
        (task === "routine"
          ? context.contractVersion === 2
            ? ROUTINE_INGREDIENT_INSTRUCTIONS
            : ROUTINE_INSTRUCTIONS
          : task === "opening"
            ? 'Return JSON only: {openingProposal:{kind:"new-venue|renovation",renovation?:{venueId:string,spaceId:string,title:string,description:string},name:string,description:string,situation:string,venueClass:"workplace|community|other",established:boolean,provenance:string,work:string,firstUse:string}}. All text fields are nonempty strings, never arrays. name is at most 100 characters; description, provenance and work at most 1000 each; situation and firstUse at most 500 each. kind and renovation belong inside openingProposal. Choose one kind. For renovation copy an exact supplied venueId and spaceId, and describe a physical change to that public Zone; for new-venue omit renovation. Preserve occupants, ownership and access. Approval creates a planning draft; only the player starts work. Every Project takes 24 elapsed real hours. ' +
              OPENING_PROPOSAL_INSTRUCTIONS
            : WISH_INSTRUCTIONS) +
        "\n" +
        RESIDENT_CONTINUITY_RULE +
        influence +
        description +
        "\n" +
        renderPlayerBackgroundContext(context, context.playerAgencyVersion !== 1),
    },
    { role: "user", content: JSON.stringify(data) },
  ];
}
