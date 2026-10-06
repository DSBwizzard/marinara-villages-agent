/** Presentation only: never exposes the personality text or establishes character facts. */
export type ResidentSignature = {
  name: string;
  hand: "flowing" | "neat" | "bold" | "lively";
  slant: number;
  spacing: number;
  flourish: number;
};

export type ResidentSignatureImage = {
  image: { ref: string; url: string; id: string };
  original: { ref: string; url: string; id: string };
  name: string;
  generatedAt: string;
};
export type ResidentSignatureView = {
  fallback: ResidentSignature;
  saved: ResidentSignatureImage | null;
  available: boolean;
  recoverable: boolean;
  unavailableReason: string;
  attempt: number;
  status: "local" | "running" | "failed" | "interrupted" | "saved";
  error: string;
};

/** Local, repeatable handwriting from the adopted card; no model, storage or library reads. */
export function residentSignature(card: { id: string; name: string; personality: string }): ResidentSignature {
  const personality = card.personality.normalize("NFKC").toLocaleLowerCase("en-US");
  const traits = {
    flowing: /\b(gentle|graceful|romantic|elegant|dreamy|patient|calm|warm|kind)\b/g,
    neat: /\b(reserved|shy|meticulous|precise|orderly|disciplined|practical|analytical|quiet)\b/g,
    bold: /\b(confident|assertive|bold|brave|stubborn|proud|decisive|ambitious|commanding)\b/g,
    lively: /\b(playful|energetic|curious|creative|impulsive|cheerful|eccentric|mischievous|outgoing)\b/g,
  };
  let seed = 2_166_136_261;
  for (const char of `${card.id}\0${card.name}\0${personality}`) {
    seed = Math.imul(seed ^ char.codePointAt(0)!, 16_777_619) >>> 0;
  }
  // Unknown traits use a neutral flowing hand, with individual variation from the same saved inputs.
  let hand: ResidentSignature["hand"] = "flowing";
  let score = 0;
  for (const [candidate, pattern] of Object.entries(traits)) {
    const matches = new Set(personality.match(pattern) ?? []).size;
    if (matches > score) {
      hand = candidate as ResidentSignature["hand"];
      score = matches;
    }
  }
  return {
    name: card.name,
    hand,
    slant: (hand === "neat" ? 0 : hand === "lively" ? -5 : -2) + (seed % 5) * 0.5,
    spacing: (hand === "neat" ? -0.5 : hand === "bold" ? 0.5 : 0) + ((seed >>> 4) % 4) * 0.1,
    flourish: (seed >>> 8) % 4,
  };
}
