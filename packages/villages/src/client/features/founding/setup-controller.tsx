import { FOUNDING_STEP } from "./founding-steps.js";
import { applyFoundingVenueDraft, foundingVenueDraftSource } from "../../../shared/helpers/founding-venue-draft.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import type { FoundingSetting } from "../../../shared/contracts/founding.js";
import { messageFrom, request } from "../../shared/api.js";
import { API_PATH } from "../../shared/constants.js";

import type { FoundingState } from "./useFoundingState.js";
import { removeDeviceDraft } from "../../shared/device-drafts.js";
import { playerBackgroundProblem } from "./villages-player-background.js";
import { appendFoundingVenue, arrangeQuickStartVenues } from "./quick-start-placement.js";
import { FOUNDING_VENUE_LIMIT } from "../../../shared/helpers/founding-venues.js";
import {
  clearFoundingAssignments,
  quickStartIdentity,
  emptyFoundingVenue,
  newFoundingPlanSources,
  physicalFoundingProposal,
} from "./quick-start-drafts.js";
import { requestFoundingSuggestions, type FoundingSuggestionOptions } from "./suggestion-request.js";
import { useCallback } from "react";

export function createFoundingDraftSetting(
  ports: Pick<
    FoundingState,
    | "setupWorkspace"
    | "setSetupWorkspace"
    | "setupSuggestionsClaim"
    | "setSetupSuggestionsBusy"
    | "setSetupName"
    | "setSetupLocationName"
    | "setSetupSetting"
    | "setSetupWorldName"
    | "setupLorebookDraft"
    | "setupLoreTokenBudgetDraft"
  > & {
    signal?: AbortSignal;
    persistSetupDraft: (data: import("./draft-model.js").SetupDraftData) => Promise<void>;
    setupDraftData: import("./draft-model.js").SetupDraftData;
  },
) {
  return async (mode: "request" | "replace" | "recover", signal = ports.signal) => {
    const { setupWorkspace, setSetupWorkspace, setupSuggestionsClaim, setSetupSuggestionsBusy } = ports;
    const request = setupWorkspace.suggestionRequest;
    const pending = request && !request.failure ? request : undefined;
    if (setupSuggestionsClaim.current || (pending && !pending.draftSetting) || (!pending && mode === "recover")) return;
    if (!pending && !setupWorkspace.settingBrief?.trim()) return;
    const { name, startingLocationName, setting: description, worldName, context } = ports.setupDraftData;
    const current = { name, startingLocationName, description, worldName, rules: context?.rules ?? "" };
    if (!pending && mode !== "replace" && [startingLocationName, description].some((value) => value.trim())) return;
    const baseline = pending ? pending.settingReplacement : current;
    setupSuggestionsClaim.current = true;
    setSetupSuggestionsBusy(true);
    if (mode !== "recover") setSetupWorkspace((workspace) => ({ ...workspace, settingProblem: undefined }));
    try {
      const input = pending
        ? JSON.parse(pending.sourceInputs ?? "null")
        : {
            mode: "draft-setting",
            brief: setupWorkspace.settingBrief!.trim(),
            ...(name.trim() ? { villageName: name.trim() } : {}),
            worldBrief: setupWorkspace.settingWorldBrief?.trim() ?? "",
            ...(worldName.trim() ? { worldName: worldName.trim() } : {}),
            ...(current.rules.trim() ? { worldRules: current.rules.trim() } : {}),
            selectedLorebookIds: ports.setupLorebookDraft,
            loreTokenBudget: ports.setupLoreTokenBudgetDraft,
          };
      const { setting } = await requestFoundingSuggestions(
        { ...ports, signal, setupBeginningSourceKey: "founding-setting" },
        { draftSetting: true, checkSetting: mode !== "recover", settingReplacement: baseline },
        input,
      );
      signal?.throwIfAborted();
      if (!setting) throw new Error("The saved attempt has no setting draft.");
      // Fields may have been edited while Mari was working, including after a reload.
      const apply = (field: keyof FoundingSetting, value: string) =>
        (baseline ? value === baseline[field] : !value.trim()) ? setting[field] : value;
      if (!input?.villageName) ports.setSetupName((value) => apply("name", value));
      ports.setSetupLocationName((value) => apply("startingLocationName", value));
      ports.setSetupSetting((value) => apply("description", value));
      ports.setSetupWorldName((value) => (value.trim() ? value : apply("worldName", value)));
      setSetupWorkspace((workspace) => ({
        ...workspace,
        settingBeat: "village",
        suggestionRequest: undefined,
        settingDraft: setting,
        settingEditorOpen: true,
        settingProblem: undefined,
      }));
    } catch (cause) {
      if (!signal?.aborted && !(cause instanceof Error && cause.name === "AbortError")) {
        const problem = messageFrom(cause, "Mari couldn’t draft the Map. Try again or edit the Map details here.");
        setSetupWorkspace((workspace) =>
          workspace.settingProblem === problem ? workspace : { ...workspace, settingProblem: problem },
        );
      }
    } finally {
      setupSuggestionsClaim.current = false;
      setSetupSuggestionsBusy(false);
    }
  };
}

export function createFoundingSuggestSetupVenues(ports: {
  signal?: AbortSignal;
  readonly setupWorkspace: FoundingState["setupWorkspace"];
  readonly setSetupWorkspace: FoundingState["setSetupWorkspace"];
  readonly persistSetupDraft: (data: import("./draft-model.js").SetupDraftData) => Promise<void>;
  readonly setupDraftData: import("./draft-model.js").SetupDraftData;
  readonly onQuickStartApplied?: () => void;
  readonly personaDraft: string;
  readonly selectedResidentAdmissions: {
    [k: string]: import("../../../shared/helpers/resident-admission").ResidentAdmission;
  };
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupSuggestionsBusy: FoundingState["setSetupSuggestionsBusy"];
  readonly setSetupSuggestionsKey: FoundingState["setSetupSuggestionsKey"];
  readonly setSetupMapReviewed?: FoundingState["setSetupMapReviewed"];
  readonly setSetupVenues: FoundingState["setSetupVenues"];
  readonly setupAuthoredFieldsRef: React.RefObject<Record<string, string[]>>;
  readonly setupBeginningSourceKey: string;
  readonly setupBeginningSourceKeyRef: React.RefObject<string>;

  readonly setupImageTargetRef: FoundingState["setupImageTargetRef"];
  readonly setupLorebookDraft: FoundingState["setupLorebookDraft"];
  readonly setupLoreTokenBudgetDraft: FoundingState["setupLoreTokenBudgetDraft"];
  readonly setupWorldName?: string;
  readonly setupSetting: FoundingState["setupSetting"];
  readonly setupName?: FoundingState["setupName"];
  readonly sceneryStyle?: string;
  readonly sceneryStyleProfileId?: string | null;
  readonly setupContext?: FoundingState["setupContext"];

  readonly setupSuggestionsClaim: FoundingState["setupSuggestionsClaim"];
  readonly setupFoundingVillagerIds?: string[];
  readonly setupVenues: FoundingState["setupVenues"];
  readonly setupVenuesRef: React.RefObject<import("../../../shared/contracts/village").VillageVenue[]>;
}) {
  return async (options?: FoundingSuggestionOptions, signal = ports.signal) => {
    const request = ports.setupWorkspace.suggestionRequest;
    const pending = request?.failure ? undefined : request;
    if (pending?.draftSetting) return;
    options = pending
      ? {
          quickStart: pending.quickStart,
          plan: pending.plan,
          separateHomes: pending.separateHomes,
          venueId: pending.venueId,
          addVenue: pending.addVenue,
          ...(pending.fullVenue ? { fullVenue: true, draftEntranceImage: pending.draftEntranceImage } : {}),
        }
      : (options ?? {});
    const {
      personaDraft,
      selectedResidentAdmissions,
      setSetupProblem,
      setSetupSuggestionsBusy,
      setSetupSuggestionsKey,
      setupBeginningSourceKey,
      setupBeginningSourceKeyRef,

      setupLorebookDraft,
      setupLoreTokenBudgetDraft,
      setupSetting,
      setupSuggestionsClaim,
      setupVenues,
      setupVenuesRef,
    } = ports;

    if (setupSuggestionsClaim.current || (!pending && !setupSetting.trim())) return;
    const added = options.addVenue && options.venueId ? emptyFoundingVenue(options.venueId) : undefined;
    if (added && !pending && setupVenues.length >= FOUNDING_VENUE_LIMIT) return;
    setupSuggestionsClaim.current = true;
    const replacing = !!options.plan || !!options.quickStart || !options.venueId;
    const identity = quickStartIdentity(setupVenues);
    const source = replacing
      ? JSON.stringify([setupBeginningSourceKey, identity])
      : JSON.stringify([setupBeginningSourceKey, options.venueId]);
    const roster = ports.setupFoundingVillagerIds ?? ports.setupDraftData.roster ?? [];
    const baseline = JSON.stringify(setupVenues);
    setSetupSuggestionsBusy(true);
    setSetupProblem("");
    let completedAdd = false;
    try {
      const stored = pending?.sourceInputs ? JSON.parse(pending.sourceInputs) : undefined;
      const rows = replacing ? (stored?.sourceVenues ?? newFoundingPlanSources()) : added ? [added] : setupVenues;
      const target = added ?? setupVenues.find((row) => row.id === options.venueId);
      if (!replacing && !target && !pending) throw new Error("Choose the Venue to redraft.");
      const bank = (venue: (typeof setupVenues)[number]) =>
        Array.from(
          { length: Math.max(0, 6 - (venue.spaces?.length ?? 0) - (venue.privateSpaces?.length ?? 0)) },
          () => "zone:" + createVillagesClientId(),
        );
      const input = stored ?? {
        setting: setupSetting,
        worldName: ports.setupWorldName,
        mode: replacing ? "draft-plan" : "draft-venue",
        replacePlan: replacing,
        venueBrief:
          options.venueBrief ??
          (options.venueId ? ports.setupWorkspace.venueBriefs?.[options.venueId] : ports.setupWorkspace.venueBrief) ??
          "",
        villageName: ports.setupName,
        context: ports.setupContext,
        openingVenueId: ports.setupContext?.openingVenueId,
        playerPersonaId: personaDraft,
        selectedLorebookIds: setupLorebookDraft,
        loreTokenBudget: setupLoreTokenBudgetDraft,
        foundingResidentAdmissions: selectedResidentAdmissions,
        foundingCharacterIds: roster,
        venues: rows.map((row: (typeof setupVenues)[number]) => ({
          id: row.id,
          name: row.name,
          form: row.form,
          description: row.description,
          residentIds: [],
          playerHome: false,
        })),
        ...(replacing
          ? {
              sourceVenues: rows.map(foundingVenueDraftSource),
              newZoneIdsByVenue: Object.fromEntries(
                rows.map((row: (typeof setupVenues)[number]) => [row.id, bank(row)]),
              ),
            }
          : {
              targetVenueId: options.venueId,
              targetVenue: target && foundingVenueDraftSource(target),
              newZoneIds: target ? bank(target) : [],
              draftEntranceImage: false,
            }),
      };
      const result = await requestFoundingSuggestions(
        { ...ports, signal, setupBeginningSourceKey: source },
        options,
        input,
      );
      completedAdd = !!added;
      const current = setupVenuesRef.current;
      const currentTarget = added ?? current.find((row) => row.id === options.venueId);
      if (
        setupBeginningSourceKeyRef.current !== setupBeginningSourceKey ||
        JSON.stringify(current) !== baseline ||
        input.setting !== setupSetting ||
        (input.foundingCharacterIds && JSON.stringify(input.foundingCharacterIds) !== JSON.stringify(roster)) ||
        (!replacing &&
          JSON.stringify(input.targetVenue) !==
            JSON.stringify(currentTarget && foundingVenueDraftSource(currentTarget)))
      )
        throw new Error("Founding choices changed. Your current draft stays unchanged; request a fresh draft.");
      const physical = result.venues.map(physicalFoundingProposal);
      if (added) {
        const [proposal] = physical;
        if (physical.length !== 1 || proposal?.id !== added.id)
          throw new Error("The new Venue draft doesn’t match this request.");
        if (current.length >= FOUNDING_VENUE_LIMIT || current.some((venue) => venue.id === added.id))
          throw new Error("Founding Venues changed. Add the Venue again when ready.");
        const venue = clearFoundingAssignments(applyFoundingVenueDraft(added, proposal));
        // Autosave records the added Venue and the cleared receipt in one draft snapshot.
        ports.setSetupVenues(appendFoundingVenue(current, venue));
        ports.setSetupMapReviewed?.(false);
        ports.setSetupWorkspace((state) => ({ ...state, addVenueBrief: undefined, suggestionRequest: undefined }));
        return venue.id;
      }
      const reviewed = replacing
        ? arrangeQuickStartVenues(physical.map((plan) => applyFoundingVenueDraft(emptyFoundingVenue(plan.id), plan)))
        : current.map((row) =>
            row.id === options.venueId
              ? applyFoundingVenueDraft(
                  row,
                  physical.find((plan) => plan.id === row.id) ??
                    (() => {
                      throw new Error("The Venue draft is missing.");
                    })(),
                )
              : row,
          );
      // Recover artwork from an already completed older request without dispatching new generation.
      if (!replacing && result.entranceImage && pending?.draftEntranceImage) {
        const target = reviewed.find((row) => row.id === options.venueId);
        if (target) target.presentation = { ...target.presentation, image: result.entranceImage };
      }
      ports.setSetupWorkspace((state) => ({
        ...state,
        lore: result.lore,
        venueReview: {
          baseline: JSON.stringify(current),
          venues: reviewed,
          sourceKey: setupBeginningSourceKey,
          replaceAll: replacing,
        },
      }));
      setSetupSuggestionsKey(setupBeginningSourceKey);
    } catch (cause) {
      if (!signal?.aborted && !(cause instanceof Error && cause.name === "AbortError")) {
        const failure = messageFrom(cause, "Suggestions could not be prepared. You can write the details yourself.");
        if (completedAdd)
          ports.setSetupWorkspace((state) =>
            state.suggestionRequest?.addVenue && state.suggestionRequest.venueId === added?.id
              ? { ...state, suggestionRequest: { ...state.suggestionRequest, failure } }
              : state,
          );
        setSetupProblem(failure);
      }
    } finally {
      setupSuggestionsClaim.current = false;
      setSetupSuggestionsBusy(false);
    }
  };
}

// ── Founding the village ───────────────────────────────────────────────────
// The wizard collects place, the description, map, and residents before
// writing the village. A half-answered setup never claims to be founded.
export function createFoundingGotoSetupStep(ports: {
  readonly setupResidentAdmissions?: FoundingState["setupResidentAdmissions"];
  readonly setSetupResidentAdmissions?: FoundingState["setSetupResidentAdmissions"];

  readonly catalog: import("../../../shared/contracts/village").CatalogEntry[];
  readonly connectionSetupProblem: FoundingState["connectionSetupProblem"];
  readonly loadCatalog: (signal?: AbortSignal) => Promise<void>;
  readonly loadLorebooks: (signal?: AbortSignal) => Promise<void>;
  readonly loadPersonas: (signal?: AbortSignal) => Promise<void>;
  readonly personaDraft: string;
  readonly personas: import("../../../shared/contracts/village").PersonaEntry[];
  readonly residentContextProblem: "" | "Check starting notes in People.";
  readonly setMovingSetupVenueId: FoundingState["setMovingSetupVenueId"];
  readonly setSetupEditorOpen: FoundingState["setSetupEditorOpen"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupStep: FoundingState["setSetupStep"];
  readonly setupBlocker: (reviewingMap?: boolean) => string;
  readonly setSetupMapReviewed: FoundingState["setSetupMapReviewed"];

  readonly setupFoundingVillagerIds: FoundingState["setupFoundingVillagerIds"];
  readonly setupHomeCount: number;
  readonly setupMapBusy: FoundingState["setupMapBusy"];
  readonly setupMapSrc: string | null;
  readonly setupName: FoundingState["setupName"];
  readonly setupLocationName: FoundingState["setupLocationName"];
  readonly setupPlayerBackground: FoundingState["setupPlayerBackground"];
  readonly setupWorldName?: string;
  readonly setupSetting: FoundingState["setupSetting"];
  readonly setupStep: FoundingState["setupStep"];
  readonly setupSuggestionsBusy: FoundingState["setupSuggestionsBusy"];
  readonly setupVenueBusy: FoundingState["setupVenueBusy"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  return (step: number) => {
    const {
      catalog,
      connectionSetupProblem,
      loadCatalog,
      loadLorebooks,
      loadPersonas,
      personaDraft,
      personas,
      residentContextProblem,
      setMovingSetupVenueId,
      setSetupEditorOpen,
      setSetupProblem,
      setSetupStep,
      setupBlocker,
      setSetupMapReviewed,

      setupFoundingVillagerIds,
      setupHomeCount,
      setupMapBusy,
      setupMapSrc,
      setupName,
      setupLocationName,
      setupPlayerBackground,
      setupSetting,
      setupStep,
      setupSuggestionsBusy,
      setupVenueBusy,
      snapshot,
    } = ports;

    if (step === FOUNDING_STEP.Review && (setupVenueBusy || setupSuggestionsBusy)) {
      setSetupProblem("Wait for the pending Venue request before Review.");
      return;
    }
    if (step > setupStep || step === FOUNDING_STEP.Review) {
      const peopleProblem =
        !personaDraft || !personas?.some((persona) => persona.id === personaDraft)
          ? "Choose an available Persona."
          : residentContextProblem ||
            (!snapshot?.isFounded ? playerBackgroundProblem(setupPlayerBackground) : "") ||
            (!snapshot?.isFounded &&
            (setupHomeCount < 1 ||
              setupHomeCount > 3 ||
              setupFoundingVillagerIds.some((id) => !catalog?.some((person) => person.id === id)))
              ? "Choose one to three available founding villagers."
              : "");
      const placeProblem = !setupName.trim()
        ? "Give the village a name."
        : !setupLocationName.trim()
          ? "Name the starting location."
          : !setupSetting.trim()
            ? "Describe the starting location."
            : "";
      const mapProblem =
        !snapshot?.isFounded && (setupMapBusy || !setupMapSrc)
          ? setupMapBusy
            ? "Wait for the requested map artwork."
            : "Generate or upload map artwork on Maps before continuing."
          : "";
      const problem =
        placeProblem ||
        connectionSetupProblem ||
        (step > FOUNDING_STEP.People ? peopleProblem : "") ||
        (step > FOUNDING_STEP.Maps ? mapProblem : "") ||
        (step === FOUNDING_STEP.Review ? setupBlocker(true) : "");
      if (problem) {
        if (placeProblem || problem === connectionSetupProblem) setSetupStep(FOUNDING_STEP.Setting);
        else if (step > FOUNDING_STEP.People && peopleProblem) setSetupStep(FOUNDING_STEP.People);
        else if (step > FOUNDING_STEP.Maps && mapProblem) setSetupStep(FOUNDING_STEP.Maps);
        setSetupProblem(problem);
        return;
      }
    }
    setSetupProblem("");
    if (step === FOUNDING_STEP.Review) setSetupMapReviewed(true);
    setSetupStep(step);
    setSetupEditorOpen(false);
    void loadPersonas();
    void loadCatalog();
    void loadLorebooks();
    setMovingSetupVenueId(null);
  };
}

/** The destructive half of the pair the General settings panel offers. */
export function useFoundingStartOver(ports: {
  readonly draftRevision: FoundingState["draftRevision"];
  readonly draftSaveQueue: FoundingState["draftSaveQueue"];
  readonly openSetup: (fresh: boolean, village: import("../../../shared/contracts/village").VillageSnapshot) => void;
  readonly setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setCatalog: React.Dispatch<React.SetStateAction<import("../../../shared/contracts/village").CatalogEntry[]>>;
  readonly setDraftReady: FoundingState["setDraftReady"];
  readonly setResetArmed: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setSavedSetupDraft: React.Dispatch<
    React.SetStateAction<import("../../shared/device-drafts").SavedDeviceDraft<import("./draft-model").SetupDraftData>>
  >;
  readonly setSettingsError: React.Dispatch<React.SetStateAction<string>>;
  readonly setSnapshot: React.Dispatch<
    React.SetStateAction<import("../../../shared/contracts/village").VillageSnapshot>
  >;
}) {
  const {
    draftRevision,
    draftSaveQueue,
    openSetup,
    setBusy,
    setCatalog,
    setDraftReady,
    setResetArmed,
    setSavedSetupDraft,
    setSettingsError,
    setSnapshot,
  } = ports;

  return useCallback(async () => {
    setBusy(true);
    setSettingsError("");
    try {
      const next = await request<VillageSnapshot>("/setup/reset", { method: "POST" });
      setSnapshot(next);
      setCatalog(null);
      // The offer to found the village is made again by hand: the player asked
      // for the wizard by asking to start over.
      await draftSaveQueue.current;
      await removeDeviceDraft(API_PATH);
      draftRevision.current = 0;
      setSavedSetupDraft(null);
      setDraftReady(true);
      openSetup(true, next);
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The village could not be reset."));
    } finally {
      setBusy(false);
      setResetArmed(false);
    }
  }, [
    draftRevision,
    draftSaveQueue,
    openSetup,
    setBusy,
    setCatalog,
    setDraftReady,
    setResetArmed,
    setSavedSetupDraft,
    setSettingsError,
    setSnapshot,
  ]);
}
