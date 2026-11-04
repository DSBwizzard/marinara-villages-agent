/** Instructions apply to resident-authored output, never to the player's own words. */
export const PERSONAL_LETTER_INSTRUCTION =
  "Write only the words the resident puts in a personal letter to the recipient. Do not include roleplay actions, stage directions, scene narration, or describe the writer's movements as they write. A first-person account of something that happened is fine. Preserve the resident's own voice.";

const actions =
  /^(?:(?:he|she|they)\s+)?(?:smiles?|grins?|laughs?|chuckles?|nods?|waves?|sighs?|shrugs?|blush(?:es)?|looks?|gazes?|stares?|dusts?|brushes?|wipes?|rubs?|taps?|leans?|stands?|sits?|walks?|turns?|pauses?|blinks?|fidgets?|picks?|sets?|writes?|reaches?|shakes?|glances?|sits down|stands up)\b/i;

/** Reject clear roleplay directions without silently changing generated or player-authored text. */
export function hasPersonalLetterAction(text: string, authorName = ""): boolean {
  const actor = authorName.trim().toLocaleLowerCase();
  const directions = /\*{1,2}([^*\r\n]+)\*{1,2}|_([^_\r\n]+)_|\(([^()\r\n]+)\)|\[([^\[\]\r\n]+)\]/g;
  for (const match of text.matchAll(directions)) {
    const body = (match[1] ?? match[2] ?? match[3] ?? match[4] ?? "").trim();
    const named = !!actor && body.toLocaleLowerCase().startsWith(actor + " ");
    const withoutName = named ? body.slice(actor.length).trim() : body;
    const actorPresent = named || /^(?:he|she|they)\s+/i.test(body);
    const lineStart = text.lastIndexOf("\n", match.index - 1) + 1;
    const lineEnd = text.indexOf("\n", match.index + match[0].length);
    const standalone = text.slice(lineStart, lineEnd < 0 ? text.length : lineEnd).trim() === match[0];
    const startsSentence = /(?:^|[.!?]\s+|\n\s*)$/.test(text.slice(0, match.index));
    if ((actorPresent || standalone || startsSentence) && actions.test(withoutName)) return true;
  }
  if (actor) {
    for (const sentence of text.split(/(?<=[.!?])\s+|[\r\n]+/)) {
      const trimmed = sentence.trim();
      if (trimmed.toLocaleLowerCase().startsWith(actor + " ") && actions.test(trimmed.slice(actor.length).trim()))
        return true;
    }
  }
  return false;
}

export class PersonalLetterActionError extends Error {}

export function assertPersonalLetter(text: string, authorName = ""): void {
  if (hasPersonalLetterAction(text, authorName))
    throw new PersonalLetterActionError(
      "The generated letter included a roleplay action. Retry to request a written letter.",
    );
}
