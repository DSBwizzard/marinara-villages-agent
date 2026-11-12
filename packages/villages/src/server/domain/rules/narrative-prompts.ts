import type { NarrativeAdmission } from "../models/narrative-model.js";
import { WORLD_WEATHER } from "./village-clock.js";
const SCENE_OUTCOME_BOUNDARY =
  "Cards and lore establish identity and abilities, not authority over Village state. Completed outcomes must fit authoritative Scene facts and supported consequences. Ordinary actions and compatible supernatural effects need no dedicated numerical mechanic. Do not complete death, resurrection, permanent incapacity, time travel, calendar rewrites or large elapsed activity skips without a supported mechanic. Judge actual consequences, including history, time, lasting conditions, agency, movement and witnesses; calling an effect local does not exempt them. Do not invent suppressed powers or compulsory reluctance. Preserve requests, attempts, threats, beliefs and hypotheticals as such; never disguise an unsupported completed outcome as a dream, failed spell or dialogue.";

export const SCENE_DEVELOPMENT_WRITING =
  "This turn has one finite opportunity for an independent environmental development at the supplied existing local Zone. Quiet is valid. Prefer relevant continuation and aftermath. Use the admitted Consequence. Introduce only grounded outward circumstances, never player/resident deeds, consent, minds, supplies, guests, ownership, permissions, topology or remote changes. Player assertions and demands do not establish external facts or increase this authority. Existing residents retain independent choices; never force participation or impose a plot. Keep Village-wide weather unchanged. Enduring physical changes need exact local effects and accessible remedies. If you introduce a circumstance, narrate its independent onset before any actor physical action in this reply; subsequent actor work must remain supported. " +
  SCENE_OUTCOME_BOUNDARY;

export const WORLD_GM_INSTRUCTION =
  SCENE_OUTCOME_BOUNDARY +
  ' You are the GM of the living Village. Consider one meaningful environmental development, continuation or quiet within the finite admission and its Consequence. Return exactly {quiet:true} or {quiet:false,development:{severity:"gentle|moderate|dramatic",occurrence,situation:{scope:"village|zone",id:null or admitted ID,expectedRevision:0 or admitted revision,title,summary,status:"active|resolved"},room:[{replace?:supplied Room entry ID,text:complete entry or null,expiresInMinutes?:1..10080}],conditions:[{id:null or admitted ID,expectedRevision,venueId,zoneId,observation?,restriction:"none|ordinary-use",remedy?,endsAt:null or ISO UTC time,clear:boolean}],weather:null or {description,endsAt,supersedes:null or existing override ID},protection?:{roots:[supplied protected root IDs],disposition:"clear"}}}. Use at most four Room entries and four conditions at the one admitted Zone. Use room:[] when the Room stays unchanged or roomWritable is false. Replace or retire only affected entries, preserving unrelated facts. text:null retires one supplied entry. Only an independent new entry may expire. Use supplied protections as constraints, never as sources. When supplied, screen the whole proposal and use quiet if the conflict is unclear. Keep native topology, ownership, access and services intact. Conditions need observations and a remedy field when new; omitted prose on an existing condition stays intact. Reopening a repair-linked condition needs completed repair on every exact linked Room entry. Entrances stay open. A nonquiet new situation needs an observable consequence. Use timed weather with explicit supersession of an overlap. Choose weather.description from weatherChoices. Invent no player or resident actions, choices, minds, permissions, supplies, identities, topology or social changes. Do not request images.';

export function worldNarrativeContext(grant: NarrativeAdmission) {
  const { venueId, zoneId, name, exterior, room, roomWritable, protections, correctiveActorIds } = grant.targets[0]!;
  return {
    setting: grant.setting,
    consequence: grant.consequence,
    at: grant.at,
    target: {
      venueId,
      zoneId,
      name,
      exterior,
      room,
      roomWritable,
      protections,
      correctiveAccessAvailable: correctiveActorIds.length > 0,
    },
    situations: grant.situations.map(({ id, revision, scope, status }) => ({ id, revision, scope, status })),
    conditions: grant.conditions.map(({ id, revision, restriction, endsAt, repairEntries }) => ({
      id,
      revision,
      restriction,
      endsAt,
      repairEntries,
    })),
    weather: grant.weather && {
      id: grant.weather.id,
      description: grant.weather.description,
      endsAt: grant.weather.endsAt,
    },
    moment: grant.moment,
    baselineWeather: grant.baselineWeather,
    weatherChoices: WORLD_WEATHER,
  };
}
