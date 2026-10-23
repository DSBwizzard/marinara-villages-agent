/** Translate technical failures only at display time; keep the original for Copy details. */
export function sceneErrorMessage(original: string): string {
  const message = original
    .trim()
    .replace(/^(?:Error|VillagesRequestError|VillageApiError):\s*/u, "")
    .replace(/\s*\(HTTP \d+; [^)]+\)/gu, "");
  // Recovery status also carries the transport failure and request ID for diagnostics.
  if (/^(?:Reconnecting to check your saved reply|Your reply is still processing|Reply outcome unknown)/u.test(message))
    return message.split("\n\n")[0]!;

  if (/generated opening idea/iu.test(message) && /provenance/iu.test(message))
    return message.replace(/provenance/giu, "supporting setting facts");

  const rules: [RegExp, string][] = [
    [
      /evidence fingerprint changed|sourceHash.*changed/iu,
      "The saved conversation no longer matches the information used to check it. Copy the details so this can be investigated before retrying.",
    ],
    [
      /unsupported (?:interaction|writing) contract|invalid writing capability manifest/iu,
      "This saved request uses a format this version of the game cannot resume. Its history is still saved.",
    ],
    [
      /admin.?secret|X-Admin-Secret|loopback access/iu,
      "The server needs admin access. Open Settings → Advanced → Admin Access and enter the server's admin secret, or open the app through localhost.",
    ],
    [
      /Villages.*(?:runtime.*not configured|activation.*inactive)|Villages is inactive|Engine version did not provide/iu,
      "The game's server is not ready. Reload the app; copy the details if this continues.",
    ],
    [
      /missing.*(?:api.?key|connection)|invalid api.?key|unauthorized|\b40[13]\b|admin.?secret|authentication/iu,
      "The server or AI connection refused access. Check the connection and access settings.",
    ],
    [
      /connection rejected JSON mode|(?:response[_ ]?format|json[_ ]?(?:object|mode|schema)).*(?:unsupported|not support|invalid)|(?:unsupported|not support|invalid).*(?:response[_ ]?format|json[_ ]?(?:object|mode|schema))/iu,
      "The AI connection does not support the reply format the game needs. Check that connection's settings.",
    ],
    [
      /\bno (?:language model |system )?connection\b|\b(?:choose|selected)\b.*\bconnection|\bconnection.*(?:not configured|not available|no longer exists|not found|has no (?:model|base URL))|System interpretation is not configured/iu,
      "The AI connection is not ready. Check the System and Narration connections in settings.",
    ],
    [
      /quota|insufficient (?:credits|funds)|account balance|payment required/iu,
      "The AI service could not run this request because of an account or usage limit. Check the account for that connection.",
    ],
    [
      /rate.?limit|too many requests|\b429\b/iu,
      "The AI service is receiving too many requests. Wait a little before trying again.",
    ],
    [
      /could not reach the server|could not read the server response|fetch failed|failed to fetch|network.?error|ECONN/iu,
      "The connection was interrupted. Check the saved reply before sending again.",
    ],
    [
      /timeout|timed out|deadline|AbortError/iu,
      "The request took too long to answer. Check the saved reply before trying again.",
    ],
    [
      /server returned an invalid or empty JSON response|server response.*(?:invalid|empty|unreadable)/iu,
      "The server's answer could not be read. Reload to check whether the action completed before trying again.",
    ],
    [/output (?:budget|allowance)/iu, "The response length limit was too small for this step."],
    [
      /output limit|truncated|max_tokens/iu,
      "The AI stopped before finishing its answer. Retry the saved request if you want to try again.",
    ],
    [
      /context.*(?:limit|budget|allowance|insufficient)|(?:evidence|context).*(?:does not fit|exceeds)|insufficient.*(?:budget|context)|essential System evidence/iu,
      "The AI did not have enough room to read the information needed for this request. Copy the details if this keeps happening.",
    ],
    [
      /request exceeds the available budget/iu,
      "This request needs more room than the current AI limits allow. Copy the details if this keeps happening.",
    ],
    [
      /System context is unavailable or changed/iu,
      "Information needed to check this reply is no longer available or has changed.",
    ],
    [
      /additional System context is saved/iu,
      "More information has been saved for this request. Retry the saved request to use it.",
    ],
    [
      /model.*changed/iu,
      "The AI model changed while this request was being prepared. Retry the saved request using the current settings.",
    ],
    [
      /venue response|invalid-json|not (?:valid )?JSON|invalid or empty JSON|invalid-segments|malformed|invalid segments|incomplete or ambiguous/iu,
      "The AI reply was incomplete or could not be read.",
    ],
    [/player-echo/iu, "The reply repeated your message instead of continuing the conversation."],
    [/repeated-question/iu, "The reply repeated a question that was already answered."],
    [/residence-consent/iu, "The reply treated a housing arrangement as agreed before everyone had agreed."],
    [/construction-worksite/iu, "The reply treated a place under construction as ready to use."],
    [
      /^The saved (?:movement|immediate outcome|standing permission|access outcome|physical outcome|invitation).*(?:needs recovery|could not commit|missing)/iu,
      "The game has an unfinished saved action. Recover the saved request before continuing.",
    ],
    [
      /unsupported-physical-claim|physical outcome|invented player Zone travel|player movement metadata|unsupported resident movement/iu,
      "The reply described an action or movement that the game could not confirm.",
    ],
    [
      /invented player speech|speech capture|speech recovery|authored moment/iu,
      "The game could not separate your words from the rest of the reply. Retry the saved request.",
    ],
    [
      /narrated sound|unknown sound source|sound cannot|sound outside hearing range/iu,
      "The reply described a sound that the game could not place in the Scene.",
    ],
    [
      /unknown speech (?:delivery|presentation)/iu,
      "The reply did not clearly say how a line was spoken or who could hear it.",
    ],
    [
      /attention fragments|attention beyond its adjacent audience|without hearing the attention event/iu,
      "The reply did not correctly account for who could hear the call or sound.",
    ],
    [/Multiple legacy invitations/iu, "The reply combined invitations that need to be handled one at a time."],
    [
      /resident action|standing permission|access (?:event|effects|interpretation|scope|condition|issuer|evidence|command|management)|standing (?:grant|withdrawal)|permission.*(?:scope|authority)/iu,
      "The game could not confirm who gave permission, what they allowed, or who heard it.",
    ],
    [
      /another speaker's project statement|disclosure sources|citation|unwitnessed|witness|invalid source|source reference|incompatible source|conflicting source|different (?:source|exchange)|exact current narration source/iu,
      "The game could not confirm this update from what the residents saw or heard.",
    ],
    [
      /disclosure source exceeds its saved text limit/iu,
      "The reply quoted more conversation than the game can check at once.",
    ],
    [
      /provenance|metadata|sourceHash|source hash|fingerprint/iu,
      "The reply is missing information the game needs to check what happened.",
    ],
    [
      /memory.*(?:missing|obsolete|changed)/iu,
      "A memory needed to check this update is no longer available or has changed.",
    ],
    [
      /proposal.*(?:unsupported|unresolved)|System (?:rejected|could not (?:verify|determine))/iu,
      "The game could not confirm that the conversation supports this update.",
    ],
    [
      /verification failed during the model request|model (?:request failed|returned no answer)|provider/iu,
      "The AI service did not return a usable answer. Check the connection before retrying.",
    ],
    [
      /proposal|System verification|verification result|System (?:event|intent|prepared action|source timeline|opening|did not finish|could not establish)|movement timeline|Scene (?:verdict|reply failed validation)/iu,
      "The game could not finish checking what happened in the reply.",
    ],
    [
      /request outcome is unknown|model request outcome is unknown/iu,
      "It is not yet clear whether the AI request finished. Check the saved reply before trying again.",
    ],
    [
      /storage|could not (?:commit|be applied)|usage accounting/iu,
      "The game could not save this update. Check the saved state before trying again.",
    ],
    [/Invalid changes cursor/iu, "The saved update list has changed. Refresh the Scene to load it again."],
    [/No saved (?:live )?exchange/iu, "The saved conversation needed to check this update could not be found."],
    [
      /old action admission/iu,
      "This saved action uses a format this version of the game cannot resume. Its history is still saved.",
    ],
    [
      /saved Scene Wish protection is invalid/iu,
      "The saved Wish information could not be checked. Copy the details before moving time forward.",
    ],
    [
      /submission ID|navigation ID|Village identity changed/iu,
      "The saved Scene changed while this action was being prepared. Refresh the Scene before trying again.",
    ],
    [
      /semantic|interpretation|validation|routing|ledger|manifest|capability|contract|\bHTTP\b|\bAPI\b|\bJSON\b|\b(?:TypeError|RangeError|ENOENT|EACCES)\b|\bat \S+\s*\(|\b\w+\[\d+\]\.|^[{[]/iu,
      "The game could not complete this step. Copy the details if you need help.",
    ],
  ];
  const friendly = rules.find(([pattern]) => pattern.test(message))?.[1];
  if (!friendly) return message || "The game could not complete this step. Copy the details if you need help.";
  return [
    friendly,
    /draft (?:is preserved|retained)/iu.test(message) ? "Your draft is still here." : "",
    /no request was made/iu.test(message) ? "No AI request was sent." : "",
    /no outcome was applied/iu.test(message) ? "No changes from this step were applied." : "",
    /wasn[’']t saved.*conversation.*transcript/iu.test(message)
      ? "This update wasn’t saved; the conversation is still in the transcript."
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}
