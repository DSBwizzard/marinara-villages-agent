import { readPlayerIdentity } from "./player-identity.js";
import type { VillageState } from "../models/world.js";
import type { RepairRecord, RepairRequest } from "../../../shared/contracts/repair.js";
import { cardCharacters } from "./visitors.js";
import { continuityActor } from "./continuity-actors.js";
import {
  isRelationshipAnswer,
  latestRelationshipScores,
  latestRomanticInterests,
  relationshipKey,
} from "./continuity.js";
import { badRequest, conflict } from "./errors.js";
import { currentRelationshipAnswerState } from "./continuity-library.js";

export function relationshipRepairRecords(state: VillageState, personId?: string): RepairRecord[] {
  const people = [
    { id: "player", name: readPlayerIdentity(state).name || "You" },
    ...cardCharacters(state).map((p) => ({ id: p.characterId, name: p.cardSnapshot.name })),
  ];
  const scores = latestRelationshipScores(state.continuity),
    romance = latestRomanticInterests(state.continuity);
  return cardCharacters(state).flatMap((owner) =>
    people.flatMap((subject) => {
      if (
        subject.id === owner.characterId ||
        (personId && owner.characterId !== personId && !(personId === "player" && subject.id === "player"))
      )
        return [];
      const actor = continuityActor(state, owner.characterId)!,
        target = continuityActor(state, subject.id)!,
        key = relationshipKey(actor, target);
      return [
        {
          id: JSON.stringify(["relationship", owner.characterId, subject.id]),
          topic: "people",
          title: `${owner.cardSnapshot.name} → ${subject.name}`,
          summary: "Relationship scores",
          source: [],
          actions: [{ id: "correct", label: "Modify" }],
          related: [],
          revision: Math.max(
            scores.get(key)?.createdRevision ?? 0,
            romance.get(key)?.createdRevision ?? 0,
            currentRelationshipAnswerState(state, actor, target)?.createdRevision ?? 0,
          ),
          fields: [
            {
              key: "warmth",
              label: "Warmth",
              type: "number",
              min: -100,
              max: 100,
              value: scores.get(key)?.relationshipScore ?? 0,
            },
            {
              key: "romance",
              label: "Romantic interest",
              type: "number",
              min: -20,
              max: 20,
              value: romance.get(key)?.romanticInterest ?? 0,
            },
            ...(subject.id === "player"
              ? [
                  {
                    key: "answer",
                    label: "Perspective Note",
                    type: "text" as const,
                    multiline: false,
                    value: currentRelationshipAnswerState(state, actor, target)?.relationshipAnswer ?? "",
                  },
                ]
              : []),
          ],
        } satisfies RepairRecord,
      ];
    }),
  );
}

export function applyRelationshipRepair(
  state: VillageState,
  ownerId: string,
  subjectId: string,
  request: RepairRequest,
  at: string,
) {
  const owner = cardCharacters(state).find((p) => p.characterId === ownerId),
    actor = owner && continuityActor(state, ownerId),
    subject = continuityActor(state, subjectId);
  if (
    !actor ||
    !subject ||
    ownerId === subjectId ||
    !["player", ...cardCharacters(state).map((p) => p.characterId)].includes(subjectId)
  )
    throw conflict("Choose a supported relationship direction.");
  const score = request.values.warmth,
    romance = request.values.romance,
    answer = request.values.answer;
  if (
    !Number.isInteger(score) ||
    Number(score) < -100 ||
    Number(score) > 100 ||
    !Number.isInteger(romance) ||
    Number(romance) < -20 ||
    Number(romance) > 20 ||
    (answer !== undefined &&
      (subjectId !== "player" || typeof answer !== "string" || (answer !== "" && !isRelationshipAnswer(answer))))
  )
    throw badRequest("Use whole-number scores and one sentence of up to 15 words for the Perspective Note.");
  const key = relationshipKey(actor, subject),
    prior = latestRelationshipScores(state.continuity).get(key),
    priorRomance = latestRomanticInterests(state.continuity).get(key),
    baselines = state.continuity.relationshipBaselines ?? {},
    previousAnswer = currentRelationshipAnswerState(state, actor, subject),
    answerChanged = typeof answer === "string" && answer !== (previousAnswer?.relationshipAnswer ?? "");
  const revision = state.continuity.revision + 1;
  const relationshipBaselines = {
    ...baselines,
    [key]: {
      owner: { id: actor.id, incarnation: actor.incarnation },
      subject: { id: subject.id, incarnation: subject.incarnation },
      operationId: request.operationId,
      at,
      createdRevision: revision,
      relationshipScore: Number(score),
      romanticInterest: Number(romance),
      ...(prior?.relationshipDay
        ? {
            relationshipDay: {
              ...prior.relationshipDay,
              adjustment: (prior.relationshipDay.adjustment ?? 0) + Number(score) - (prior.relationshipScore ?? 0),
            },
          }
        : {}),
      ...(priorRomance?.romanticDay ? { romanticDay: { ...priorRomance.romanticDay } } : {}),
      ...(answerChanged
        ? { answer: { text: String(answer), at, createdRevision: revision, score: Number(score) } }
        : baselines[key]?.answer
          ? { answer: baselines[key].answer }
          : {}),
    },
  };
  state.continuity = { ...state.continuity, revision, relationshipBaselines };
}
