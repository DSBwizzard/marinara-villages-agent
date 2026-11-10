import { z } from "zod";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import type { MailboxView, PersonalLetter } from "../../../shared/contracts/mailbox.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { PersonalMailInput, PersonalMailResult } from "../../domain/models/social-mail.js";
import { readPersonalMailInput } from "../../domain/decoding/mailbox-codec.js";
import { readEffectiveVillagerCard } from "../../adapters/engine/catalog.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import { continuityActor } from "../../domain/rules/continuity-actors.js";
import { continuityProtectionFingerprint } from "../../domain/rules/continuity.js";
import { captureMailContext } from "../../domain/rules/mail-context.js";
import { acceptMailExchange, acceptResidentLetter, readDeliveredLetter } from "../../domain/rules/mail-delivery.js";
import { mailSourceHash } from "../../domain/rules/mail-evidence.js";
import { queueMailboxLetter } from "../../domain/rules/social-mail.js";
import {
  createMailboxPresentation,
  readMailboxQuery,
  mailboxLetterIdentity,
  mailboxThreadId,
} from "../../domain/rules/mailbox-view.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";
import { startingHistoryReady } from "../../domain/rules/starting-history.js";
import { venueCardProfile } from "../../domain/rules/venue-writing.js";
import { villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { readPlayerIdentity } from "../../domain/rules/village-projections.js";
import { assertPersonalLetter, PERSONAL_LETTER_INSTRUCTION } from "../../domain/rules/personal-letter.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import { memoryHash, memoryRequire } from "../../domain/rules/memory-integrity.js";

export interface SocialMailPorts {
  withWork: typeof import("../../adapters/storage/repair-gate.js").withRepairWork;
  readVillageSnapshot: typeof import("../world/village-store.js").readVillageSnapshot;
  withVillageSceneAcceptance: typeof import("../world/village-store.js").withVillageSceneAcceptance;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  queueBackgroundJob: typeof import("../../jobs/background-work.js").queueBackgroundJob;
  retryBackgroundJob: typeof import("../../jobs/background-work.js").retryBackgroundJob;
  backgroundWorkSummaries: typeof import("../../jobs/background-work.js").backgroundWorkSummaries;
  villagesLanguageModels: typeof import("../../adapters/models/language-models.js").villagesLanguageModels;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
}
const scopeId = z.string().regex(/^[a-f0-9]{64}$/),
  meaning = z
    .object({
      keep: z.array(z.unknown()).max(32).optional(),
      requires: z.array(z.string().min(1).max(48)).max(48).optional(),
    })
    .strict(),
  replySchema = z
    .object({ incoming: meaning.optional(), reply: meaning.extend({ text: z.string().max(2000) }).strict() })
    .strict(),
  resultSchema = z
    .object({
      replyText: z.string().max(2000),
      incomingMeaning: meaning.required(),
      replyMeaning: meaning.required(),
      responseDigest: scopeId,
    })
    .strict();
const MAIL_DIRECTION =
  "You are the GM of Villages correspondence. Portray the complete authored resident faithfully. Return ONE JSON object {incoming?:{keep?:[],requires?:[]},reply:{text,keep?:[],requires?:[]}}. A natural decision not to reply uses empty text. Letters establish what their authors wrote, never verified meetings, physical work, access grants or native operations. Preserve refusal and resident initiative. Private GM chronology and entries marked for Player or other people never become this resident's knowledge. Only explicit sources/individual perceptions establish knowledge; formerActors are earlier identities, never replacements. Omitted history never proves absence. " +
  PERSONAL_LETTER_INSTRUCTION +
  ' Meaningful lasting developments use the common keep schema: {id?,for:[actor IDs],text?,source:["letter"|"self"|supplied h:N],replace?,class?:"experience|information|perspective|desire|motivation|commitment|open-matter",owner?,about?:[actor IDs],parent?,facet?:"reason|attention|approach|connection|stance|expectation|concern|boundary",current?,retire?:"fulfilled|withdrawn|ended"|null,offer?:{proposer,participants:[actor IDs]},accept?:actor ID,closeOffer?:{by,reason:"refused|withdrawn"},protection?:{roots:[supplied IDs],disposition:"clear|conflict|uncertain"},requires?:[effect IDs],independent?:true}. Labels are unique ASCII identifiers up to48 characters. One complete meaning/conditions/terms in text, max2400 UTF-8 bytes; do not repeat it in metadata. Desires, motives, perspectives and unilateral commitments belong to owner, initially among for. for lists actual knowers; learning another person\'s wish never makes it yours. Meaningful shared writing uses one keep for writer and reader. Reader learning happens only at reading. letter means the current corresponding incoming/reply text. self can establish only that portrayed non-player writer/reader\'s own private state, never Player decisions or another person\'s knowledge. Actual written offers/acceptance/refusal/withdrawal require the deciding author among for; silence/politeness is not consent. An unchanged valid offer can be accepted later; qualifications require a new offer. Native Projects remain outside this contract. Reply replace:"incoming:<keep label>" refers only to an accepted meaning from this same incoming letter. Otherwise replace only a supplied entry. Keep complete terms once; omit keep text when inheriting unchanged terms. Screen all consequential keeps against supplied protections; only clear may proceed. Never restore forgotten meaning or bypass corrections through paraphrase, self or an old letter. List every keep required by asserted successful fiction in the corresponding requires; only genuinely independent optional effects may use independent:true. Never promise lasting retention without its keep. Ordinary correspondence needs no keep.';

function parseReply(
  input: PersonalMailInput,
  answer: Parameters<typeof extractModelJsonObject>[0],
): PersonalMailResult {
  if (answer.finishReason === "length")
    throw new Error("Personal reply reached its output limit. The saved response is retained.");
  const raw = replySchema.parse(extractModelJsonObject(answer));
  assertPersonalLetter(raw.reply.text, input.residentName);
  return {
    replyText: raw.reply.text,
    incomingMeaning: { keep: raw.incoming?.keep ?? [], requires: raw.incoming?.requires ?? [] },
    replyMeaning: { keep: raw.reply.keep ?? [], requires: raw.reply.requires ?? [] },
    responseDigest: memoryHash(raw),
  };
}

/** The existing background job saves the one GM response before this service applies its native candidate. */
export function createSocialMail(ports: SocialMailPorts) {
  const assertScope = (state: Parameters<typeof villageWorldScope>[0], scope: string) => {
    if (villageWorldScope(state) !== scopeId.parse(scope))
      throw conflict("The Village changed. Open its Mailbox again.");
  };
  const now = (state: Pick<Awaited<ReturnType<SocialMailPorts["readVillageSnapshot"]>>, "clock">) =>
    villageNow(state.clock?.advanceMs ?? 0).toISOString();
  async function presentation(scope?: string) {
    const state = await ports.readVillageSnapshot({ memories: true });
    if (scope) assertScope(state, scope);
    return createMailboxPresentation(state, state.mailbox, await ports.backgroundWorkSummaries());
  }
  async function readMailbox(value: unknown = {}): Promise<MailboxView> {
    const query = readMailboxQuery(value);
    return (await presentation(query.scope)).mailbox(query);
  }
  async function getLetter(threadId: string, messageId: string, scope: string, token: string): Promise<PersonalLetter> {
    const letter = (await presentation(scope)).letter(threadId, messageId);
    if (letter.message.token !== scopeId.parse(token)) throw conflict("The letter changed. Choose it again.");
    return letter;
  }
  function mutation(state: Awaited<ReturnType<SocialMailPorts["readVillageSnapshot"]>>, messageId: string) {
    const message = state.mailbox.messages[messageId];
    if (!message) throw conflict("The saved letter is no longer in this Village.");
    const threadId = mailboxThreadId(message.from.id === "player" ? message.to.id : message.from.id);
    return {
      scope: villageWorldScope(state),
      threadId,
      messageId,
      token: mailboxLetterIdentity(state, state.mailbox, threadId, message),
    };
  }
  function makeInput(
    state: Awaited<ReturnType<SocialMailPorts["readVillageSnapshot"]>>,
    messageId: string,
  ): PersonalMailInput {
    const message = state.mailbox.messages[messageId],
      resident = state.villagers.find(
        (resident) => resident.characterId === message.to.id && resident.incarnation === message.to.incarnation,
      );
    if (!resident) throw conflict("The original correspondent changed. The saved letter is retained.");
    const player = readPlayerIdentity(state);
    return readPersonalMailInput({
      seed: state.seed,
      setupAt: state.setupAt,
      residentId: resident.characterId,
      incarnation: resident.incarnation,
      residentName: resident.cardSnapshot.name,
      incoming: {
        id: message.id,
        at: message.at,
        from: message.from,
        to: message.to,
        text: message.text,
        requestId: message.requestId,
      },
      capture: captureMailContext(state, resident.characterId, message.text, now(state)),
      identity:
        venueCardProfile(readEffectiveVillagerCard(resident), player.name) +
        "\n\n" +
        JSON.stringify({ setting: villageCurrentSetting(state), player }),
    });
  }
  async function admit(state: Awaited<ReturnType<SocialMailPorts["readVillageSnapshot"]>>, messageId: string) {
    try {
      const input = makeInput(state, messageId);
      await ports.queueBackgroundJob({
        kind: "personal-mail",
        seed: input.seed,
        subjectId: messageId,
        finite: true,
        label: "Personal reply",
        revision: mailSourceHash(input.seed, input.incoming, input.incoming.text),
        input,
      });
    } catch (error) {
      await ports.mutateVillageState(
        (current) => {
          if (current.seed !== state.seed || current.setupAt !== state.setupAt) return;
          const message = current.mailbox.messages[messageId];
          if (message?.status !== "pending") return;
          current.mailbox = {
            ...current.mailbox,
            revision: current.mailbox.revision + 1,
            messages: {
              ...current.mailbox.messages,
              [messageId]: { ...message, admissionFailed: true, error: "Letter processing could not start." },
            },
          };
        },
        { memories: true },
      );
      throw error;
    }
  }
  async function send(value: unknown, threadId?: string) {
    const input = z
      .object({
        scope: scopeId,
        residentId: z.string().min(1).max(160),
        requestId: z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/),
        text: z.string().min(1).max(4000),
      })
      .strict()
      .parse(value);
    const messageId = mailboxThreadId(input.residentId) + ":" + input.requestId;
    if (threadId && threadId !== mailboxThreadId(input.residentId))
      throw badRequest("The recipient does not match this thread.");
    const state = await ports.mutateVillageState(
      (state) => {
        assertScope(state, input.scope);
        const prior = state.mailbox.messages[messageId];
        if (prior) {
          if (
            prior.from.id !== "player" ||
            prior.to.id !== input.residentId ||
            prior.requestId !== input.requestId ||
            prior.text !== input.text
          )
            throw conflict("This request ID already belongs to a different letter.");
          return;
        }
        if (!startingHistoryReady(state)) throw conflict("Starting history needs preparation before correspondence.");
        const from = continuityActor(state, "player"),
          to = continuityActor(state, input.residentId);
        if (!from || !to || !state.villagers.some((resident) => resident.characterId === input.residentId))
          throw badRequest("Choose a current resident.");
        if (threadId && threadId !== mailboxThreadId(to.id))
          throw badRequest("The recipient does not match this thread.");
        state.mailbox = queueMailboxLetter(
          state.mailbox,
          state.seed,
          { id: mailboxThreadId(to.id) + ":" + input.requestId, at: now(state), from, to },
          input.requestId,
          input.text,
        );
      },
      { memories: true },
    );
    if (state.mailbox.messages[messageId].status === "pending") await admit(state, messageId);
    const latest = await ports.readVillageSnapshot({ memories: true });
    assertScope(latest, input.scope);
    return mutation(latest, messageId);
  }
  async function readLetter(threadId: string, messageId: string, scope: string, token: string) {
    const state = await ports.mutateVillageState(
      (state) => {
        assertScope(state, scope);
        const message = state.mailbox.messages[messageId];
        if (!message || message.to.id !== "player" || mailboxThreadId(message.from.id) !== threadId)
          throw badRequest("That letter is unavailable.");
        if (mailboxLetterIdentity(state, state.mailbox, threadId, message) !== scopeId.parse(token))
          throw conflict("The letter changed. Choose it again.");
        readDeliveredLetter(state, messageId, now(state));
      },
      { memories: true },
    );
    return mutation(state, messageId);
  }
  async function retry(threadId: string, messageId: string, requestId: string, scope: string, token: string) {
    z.string()
      .regex(/^[a-zA-Z0-9_-]{1,200}$/)
      .parse(requestId);
    const state = await ports.readVillageSnapshot({ memories: true });
    assertScope(state, scope);
    const message = state.mailbox.messages[messageId];
    if (!message || message.status !== "pending" || mailboxThreadId(message.to.id) !== threadId)
      throw conflict("This letter has no pending processing to retry.");
    if (mailboxLetterIdentity(state, state.mailbox, threadId, message) !== scopeId.parse(token))
      throw conflict("The saved letter changed. Refresh its status.");
    const jobs = (await ports.backgroundWorkSummaries())
        .filter((job) => job.kind === "personal-mail" && job.subjectId === messageId)
        .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")),
      job = jobs.find((job) => ["queued", "running", "paused"].includes(job.status)) ?? jobs[0];
    if (job && ["queued", "running", "paused"].includes(job.status))
      throw conflict("This letter is already being processed.");
    if (job && ["failed", "interrupted"].includes(job.status))
      await ports.retryBackgroundJob(job.id, job.attempt, requestId, job.instanceId);
    else if (!job && message.admissionFailed) await admit(state, messageId);
    else throw conflict("This letter has no failed processing to retry.");
    return mutation(state, messageId);
  }
  const handler: Handler = {
    authority: "raw",
    generate: async (raw) => {
      const input = readPersonalMailInput(raw),
        model = await ports
          .villagesLanguageModels()
          .resolveForRequest({ connectionId: await ports.villagesConnectionIdFor("narration") }),
        messages: CapabilityLanguageModelMessage[] = [
          { role: "system", content: MAIL_DIRECTION + "\n\n" + input.identity },
          {
            role: "user",
            content: JSON.stringify({ incoming: input.incoming, at: input.capture.at, context: input.capture.prompt }),
          },
        ],
        output = Math.min(4096, model.maxOutputTokens ?? 4096);
      const fit = () => {
        const fitted = model.fitContext(messages, { maxTokens: output });
        if (
          fitted.trimmed ||
          JSON.stringify(fitted.messages) !== JSON.stringify(messages) ||
          (fitted.maxTokens ?? output) < 1024
        )
          throw new Error("Required personal mail context does not fit. No request was made.");
        return Math.min(output, fitted.maxTokens ?? output);
      };
      const answer = await ports.completeWithRoom(model, messages, fit(), {
        responseFormat: { type: "json_object" },
        checkpointId: "personal-mail:gm:" + mailSourceHash(input.seed, input.incoming, input.incoming.text),
        beforeBackgroundDispatch: async () => fit(),
        debugMode: false,
        temperature: 0.7,
        usagePurpose: "background",
      });
      return parseReply(input, answer);
    },
    valid: (state, raw) => {
      const input = readPersonalMailInput(raw);
      if (state.seed !== input.seed || state.setupAt !== input.setupAt) return false;
      const source = state.mailbox.messages[input.incoming.id];
      memoryRequire(
        source &&
          source.text === input.incoming.text &&
          memoryHash([source.id, source.at, source.from, source.to, source.requestId]) ===
            memoryHash([
              input.incoming.id,
              input.incoming.at,
              input.incoming.from,
              input.incoming.to,
              input.incoming.requestId,
            ]),
        "saved mail source changed",
      );
      if (source.status === "delivered") return true;
      if (source.status !== "pending" || continuityActor(state, input.residentId)?.incarnation !== input.incarnation)
        throw conflict("The original correspondent changed. The saved source and response are retained.");
      const scope = [input.incoming.from, input.incoming.to, ...input.capture.references],
        expected = input.capture.protection[memoryHash(scope)];
      if (
        expected !==
        continuityProtectionFingerprint(
          state.continuity,
          scope.map((party) => ({ kind: "actor", ...party })),
        )
      )
        throw conflict("Mail continuity protection changed. The saved work is retained.");
      return true;
    },
    apply: (state, raw, savedResult: unknown) => {
      const input = readPersonalMailInput(raw),
        result = resultSchema.parse(savedResult) as PersonalMailResult;
      assertPersonalLetter(result.replyText, input.residentName);
      acceptMailExchange(
        state,
        {
          capture: input.capture,
          incoming: input.incoming,
          incomingMeaning: result.incomingMeaning,
          replyMeaning: result.replyMeaning,
          replyText: result.replyText,
          responseDigest: result.responseDigest,
        },
        now(state),
      );
    },
    recoverSavedResult: (raw, steps) => {
      const input = readPersonalMailInput(raw),
        key = "personal-mail:gm:" + mailSourceHash(input.seed, input.incoming, input.incoming.text),
        step = steps.find((step) => step.key === key && step.status === "completed" && step.response);
      return step?.response ? parseReply(input, step.response) : undefined;
    },
  };
  const owned =
    <A extends unknown[], R>(work: (...args: A) => Promise<R>) =>
    (...args: A) =>
      ports.withWork(() => work(...args));
  const command = <A extends unknown[], R>(work: (...args: A) => Promise<R>) =>
    owned((...args: A) => ports.withVillageSceneAcceptance(() => work(...args), { memories: true }));
  return {
    handler,
    readMailbox: owned(readMailbox),
    getLetter: owned(getLetter),
    send: command(send),
    readLetter: command(readLetter),
    retry: command(retry),
    automaticMail: acceptResidentLetter,
  };
}
export type SocialMailService = ReturnType<typeof createSocialMail>;
