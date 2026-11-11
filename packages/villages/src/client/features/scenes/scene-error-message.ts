/** Display only; Copy details keeps the original error. */
export function sceneErrorMessage(original: string): string {
  const message = original
    .trim()
    .replace(/^(?:Error|VillagesRequestError|VillageApiError):\s*/u, "")
    .replace(/\s*\(HTTP \d+; [^)]+\)/gu, "");
  const rules: [RegExp, string][] = [
    [/^Invalid request details/iu, "The request contains invalid details."],
    [/History temporarily unavailable|Could not load Scene history/iu, "The game couldn’t load the Scene history."],
    [/^Interrupted$|^Request interrupted$/iu, "The request stopped before it finished."],
    [
      /Reconnecting to check|Reply outcome unknown|request outcome is unknown/iu,
      "The game couldn’t confirm whether the reply finished.",
    ],
    [/Your reply is still processing/iu, "The server hasn’t finished the reply."],
    [
      /unwitnessed source quotation|no witnessed evidence|not witnessed|unwitnessed evidence/iu,
      "The AI based an update on something a resident didn’t see or hear.",
    ],
    [
      /memory.*(?:missing|obsolete)|referenced memory.*changed/iu,
      "The game couldn’t find the current version of a memory.",
    ],
    [/stale (?:target|collection)/iu, "The memory changed before the game could update it."],
    [
      /evidence fingerprint changed|source identity changed/iu,
      "The conversation changed before the game could check it.",
    ],
    [/unsupported (?:Scene|Village) format/iu, "This version of the game requires a fresh Village."],
    [/admin.?secret|X-Admin-Secret|loopback access/iu, "The server refused admin access."],
    [
      /Villages.*(?:runtime.*not configured|activation.*inactive)|Villages is inactive|Engine version did not provide/iu,
      "The server hasn’t started Villages correctly.",
    ],
    [
      /missing.*api.?key|invalid api.?key|unauthorized|\b40[13]\b|authentication|access was denied/iu,
      "The server or AI service refused access.",
    ],
    [
      /connection rejected JSON mode|(?:response[_ ]?format|json[_ ]?(?:object|mode|schema)).*(?:unsupported|not support|invalid)|(?:unsupported|not support|invalid).*(?:response[_ ]?format|json[_ ]?(?:object|mode|schema))/iu,
      "The AI service doesn’t support the reply format the game needs.",
    ],
    [/output (?:budget|allowance)/iu, "The response length limit leaves too little room for this check."],
    [
      /context.*(?:limit|budget|allowance|insufficient)|(?:evidence|context).*(?:do(?:es)? not fit|exceeds)|insufficient.*(?:budget|context)/iu,
      "The conversation exceeds the AI’s reading limit.",
    ],
    [
      /\bno (?:language model |system )?connection\b|\b(?:choose|selected)\b.*\bconnection|\bconnection.*(?:not configured|not available|no longer exists|not found|has no (?:model|base URL))|missing.*connection/iu,
      "The game has no usable AI connection.",
    ],
    [
      /quota|insufficient (?:credits|funds)|account balance|payment required/iu,
      "The AI account has run out of credits or reached its usage limit.",
    ],
    [/rate.?limit|too many requests|\b429\b/iu, "The AI service received too many requests."],
    [
      /could not reach the server|fetch failed|failed to fetch|network.?error|ECONN/iu,
      "The game couldn’t reach the server.",
    ],
    [/timeout|timed out|deadline/iu, "The server took too long to answer."],
    [
      /AbortError|request.*cancel|operation.*interrupt|request was interrupted/iu,
      "The request stopped before it finished.",
    ],
    [
      /could not read the server response|server returned an invalid or empty JSON response|server response.*(?:invalid|empty|unreadable)/iu,
      "The game couldn’t read the server’s reply.",
    ],
    [/output limit|truncated|max_tokens/iu, "The AI stopped before it finished the reply."],
    [/request exceeds the available budget/iu, "The request exceeds the game’s AI usage limit."],
    [/model.*changed/iu, "The AI model changed during the request."],
    [
      /saved (?:movement|narration|invitation).*(?:needs recovery|could not commit|missing)/iu,
      "The game couldn’t finish saving an action.",
    ],
    [
      /invented player Zone travel|player movement metadata|unsupported resident movement/iu,
      "The AI described an action the game couldn’t confirm.",
    ],
    [/invented player speech/iu, "The AI invented words for your character."],
    [
      /narrated sound|unknown sound source|sound cannot|sound outside hearing range/iu,
      "The AI described a sound the game couldn’t place in the Scene.",
    ],
    [/unknown speech (?:delivery|presentation)/iu, "The AI didn’t specify how a character spoke."],
    [
      /attention fragments|attention beyond its adjacent audience|without hearing the attention event/iu,
      "The AI didn’t identify who heard the sound.",
    ],
    [
      /resident action|standing permission|access (?:scope|condition|issuer|evidence|command|management)|standing (?:grant|withdrawal)|permission.*(?:scope|authority)/iu,
      "The game couldn’t confirm who gave permission or what they allowed.",
    ],
    [/disclosure source exceeds its saved text limit/iu, "The AI quoted more dialogue than the game can check."],
    [
      /another speaker's project statement|disclosure sources|citation|witness|invalid source|source reference|incompatible source|conflicting source|different (?:source|exchange)|exact current narration source/iu,
      "The AI used missing or incorrect evidence for an update.",
    ],
    [/model request failed|provider/iu, "The AI service couldn’t complete the request."],
    [/model returned no answer|empty (?:answer|output)/iu, "The AI returned an empty reply."],
    [
      /not (?:(?:valid|complete) )?JSON|invalid-json|invalid or empty JSON/iu,
      "The AI returned a reply the game couldn’t read.",
    ],
    [/proposal.*(?:unsupported|unresolved)/iu, "The game couldn’t confirm the AI’s proposed update."],
    [
      /provenance|metadata|source hash|fingerprint|missing.*result/iu,
      "The AI left out information the game needs to check the reply.",
    ],
    [
      /venue response|invalid-segments|malformed|invalid segments|incomplete or ambiguous/iu,
      "The AI returned an incomplete or invalid reply.",
    ],
    [/storage|could not (?:commit|be applied)|usage accounting/iu, "The game couldn’t save the update."],
    [/Invalid changes cursor/iu, "The saved update list changed while the game read it."],
    [/No saved (?:live )?exchange/iu, "The game couldn’t find the saved exchange."],
    [
      /submission ID|navigation ID|Village identity changed|request conflicts with the current saved state|request changed|action changed|Scene changed|Refresh the scene before/iu,
      "The Scene changed during the request.",
    ],
    [/proposal|movement timeline|Scene reply failed validation/iu, "The game couldn’t finish checking the reply."],
    [
      /semantic|interpretation|validation|routing|ledger|manifest|capability|contract|\bHTTP\b|\bAPI\b|\bJSON\b|\b(?:TypeError|RangeError|ENOENT|EACCES)\b|\bat \S+\s*\(|\b\w+\[\d+\]\.|^[{[]/iu,
      "The game hit an internal error.",
    ],
  ];
  const friendly = rules.find(([pattern]) => pattern.test(message))?.[1];
  if (friendly) return friendly;
  // Keep the cause in the panel and the recovery details in the copied report.
  const cause = message
    .replace(/^Request failed\.\s*/u, "")
    .split(/\n|;|(?<=[.!?])\s+/u)[0]!
    .replace(/\s*\([^)]*(?:POST|GET|\/api\/)[^)]*\)/gu, "")
    .trim();
  if (
    !cause ||
    /retry|reload|refresh|recover|copy.*details|check.*saved|[a-f\d]{8}-[a-f\d]{4}-[a-f\d-]{20,}|\b(?:Request|Attempt|Scene ID):/iu.test(
      cause,
    )
  )
    return "The game couldn’t complete the action.";
  return cause.replace(/^Could not /u, "The game couldn’t ");
}
