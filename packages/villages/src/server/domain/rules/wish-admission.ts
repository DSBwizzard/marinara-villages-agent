import type { InterpretationEvidence } from "../models/interpretation-check-model.js";
import type { WishCriteria } from "../models/wish-interpretation-model.js";
import type { VillageWish } from "../models/world.js";

/** Hints route work; original Wish text remains the semantic judge's sole definition of the goal. */
export function localWishRequirements(wish: VillageWish): { criteria: WishCriteria; physicalOnly: boolean } {
  const text = wish.wish;
  const social =
    /\b(?:talk|chat|discuss|conversation|agree|recogniz\w*|acknowledg\w*|respect|authority|claim|trust|blessing|forgiv\w*|friend\w*|company|comfort|listen|reassur\w*)\b/iu.test(
      text,
    ) || /\b(?:identify|remember|name|remind)\b[^.!?]{0,100}\b(?:tune|song|melody|name)\b/iu.test(text);
  const transfer = text.match(/\b(?:bring|give|hand|deliver)\s+(?:\p{L}+\s+){0,3}?me\s+(?:a|an|the)\s+(.+?)[.!]?$/iu);
  const physical =
    (!!transfer && !social) ||
    /\b(?:move|moved|moving|remove|removed|clear)\b[^.!?]{0,100}\b(?:rock|stone|boulder|flowerpot)\b/iu.test(text) ||
    /\b(?:rock|stone|boulder|flowerpot)\b[^.!?]{0,100}\b(?:moved|removed|cleared)\b/iu.test(text) ||
    /\b(?:swim|swimming)\b/iu.test(text) ||
    /\b(?:have|get|receive|eat|taste|bring|give)\b[^.!?]{0,100}\b(?:chocolate|cupcake|cake|bread|meal|food)\b/iu.test(
      text,
    ) ||
    /\b(?:find|discover|scout|locate)\b[^.!?]{0,200}\b(?:vantage|perch|balcony|ledge|overlook|safe route)\b/iu.test(
      text,
    ) ||
    /\b(?:make|draw|create|produce|complete|survey)\b[^.!?]{0,200}\b(?:map|building|bridge|shelter|garden|room|route)\b/iu.test(
      text,
    ) ||
    /\b(?:construct|repair|clean|paint)\b[^.!?]{0,100}\b(?:building|bridge|shelter|garden|room|house|workshop|roof|pump|wall|floor|car|bike)\b/iu.test(
      text,
    ) ||
    /\b(?:cook|bake|harvest)\b[^.!?]{0,100}\b(?:meal|food|cake|cupcake|bread|fruit|vegetables|crops)\b/iu.test(text) ||
    /\bbuild\b[^.!?]{0,100}\b(?:building|bridge|shelter|garden|room|house|workshop)\b/iu.test(text);
  if (transfer && physical && !social && !/\b(?:and|then|after|before)\b/iu.test(transfer[1]))
    return {
      criteria: { kind: "transfer", goal: text, requiresPhysical: true, itemName: transfer[1].trim() },
      physicalOnly: true,
    };
  return {
    criteria: { kind: social && !physical ? "conversation" : "complex", goal: text, requiresPhysical: physical },
    physicalOnly: physical && !social,
  };
}

/** Greetings and clearly unsupported physical plans need no model request. Saved receipts deduplicate replay. */
export function wishEvidenceAdmission(wish: VillageWish, evidence: InterpretationEvidence[], receiptIds: string[]) {
  const requirements = localWishRequirements(wish);
  if (receiptIds.length) return { admitted: true, reason: "New authoritative result", ...requirements };
  if (requirements.physicalOnly)
    return {
      admitted: false,
      reason: "No new witnessed physical receipt; plans and claims cannot advance this physical Wish",
      ...requirements,
    };
  const current = evidence.filter((line) => line.current && line.kind !== "claim" && line.kind !== "receipt");
  const meaningful = current.filter((line) => {
    const text = line.content.trim();
    return text.length > 0 && !/^(?:hello|hi|hey|thanks|thank you|ready|okay|ok|sure|goodbye)[.!\s]*$/iu.test(text);
  });
  if (!meaningful.length) return { admitted: false, reason: "No meaningful new Wish evidence", ...requirements };
  return { admitted: true, reason: "New proposed semantic evidence", ...requirements };
}
