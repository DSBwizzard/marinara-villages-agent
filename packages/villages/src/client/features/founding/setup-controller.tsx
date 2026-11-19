import { zoneDayNightDefault } from "../../../shared/helpers/zone-day-night.js";
import { reconcileFoundingHome } from "./founding-homes.js";
import { applyFoundingVenueDraft, foundingVenueDraftSource } from "../../../shared/helpers/founding-venue-draft.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import type { FoundingSetting } from "../../../shared/contracts/founding.js";
import { messageFrom, request } from "../../shared/api.js";
import { API_PATH } from "../../shared/constants.js";
import type { SetupVenueDraft } from "../../shared/types.js";

import type { FoundingState } from "./useFoundingState.js";
import { removeDeviceDraft } from "../../shared/device-drafts.js";
import { playerBackgroundProblem } from "./villages-player-background.js";
import { arrangeQuickStartVenues } from "./quick-start-placement.js";
import {
  quickStartIdentity,
  quickStartTemplates,
  separateFoundingTemplates,
  replaceQuickStartVenue,
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
    | "setSetupContext"
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
      ports.setSetupContext((context) => ({
        ...context,
        rules: context.rules.trim() ? context.rules : apply("rules", context.rules),
      }));
      setSetupWorkspace((workspace) => ({
        ...workspace,
        settingBeat: "village",
        settingManual: undefined,
        suggestionRequest: undefined,
        settingDraft: setting,
        settingEditorOpen: true,
        settingProblem: undefined,
      }));
    } catch (cause) {
      if (!signal?.aborted && !(cause instanceof Error && cause.name === "AbortError")) {
        const problem = messageFrom(cause, "Mari couldn’t draft the setting. You can fill it in yourself.");
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
          separateHomes: pending.separateHomes,
          venueId: pending.venueId,
          ...(pending.fullVenue ? { fullVenue: true, draftEntranceImage: pending.draftEntranceImage } : {}),
        }
      : (options ?? {});
    const {
      personaDraft,
      selectedResidentAdmissions,
      setSetupProblem,
      setSetupSuggestionsBusy,
      setSetupSuggestionsKey,
      setSetupVenues,
      setupAuthoredFieldsRef,
      setupBeginningSourceKey,
      setupBeginningSourceKeyRef,

      setupImageTargetRef,
      setupLorebookDraft,
      setupLoreTokenBudgetDraft,
      setupSetting,
      setupSuggestionsClaim,
      setupVenues,
      setupVenuesRef,
    } = ports;

    if (setupSuggestionsClaim.current || (!pending && !setupSetting.trim())) return;
    setupSuggestionsClaim.current = true;
    const replacing = !!options.quickStart;
    const identity = quickStartIdentity(setupVenues);
    const source = replacing
      ? JSON.stringify([setupBeginningSourceKey, identity])
      : options.venueId
        ? JSON.stringify([setupBeginningSourceKey, options.venueId])
        : setupBeginningSourceKey;
    const roster = ports.setupFoundingVillagerIds ?? ports.setupDraftData.roster ?? [];
    const replacementSource = JSON.stringify(setupVenues);
    const rows = options.separateHomes
      ? separateFoundingTemplates(
          roster,
          ports.setupContext?.openingVenueId ?? "founding-community",
          ports.setupDraftData.workspace?.unusedHomes?.map((venue) => venue.id),
        )
      : replacing
        ? quickStartTemplates(setupVenues)
        : setupVenues;
    setSetupSuggestionsBusy(true);
    setSetupProblem("");
    try {
      const requestRows = (rows: typeof setupVenues) =>
        rows.map((row) => ({
          id: row.id,
          name: replacing ? "" : row.name,
          form: replacing ? "" : row.form,
          description: replacing ? "" : row.description,
          spaceDescription: replacing ? "" : (row.spaces?.[0]?.description ?? ""),
          venueClass: row.classes?.[0] ?? "other",
          residentIds: row.residentIds ?? [],
          playerHome: row.occupancy.playerHome,
        }));
      const target = options.fullVenue ? rows.find((row) => row.id === options.venueId) : undefined;
      if (options.fullVenue && !target && !pending) throw new Error("Choose the Venue to draft.");
      const targetSource = target ? foundingVenueDraftSource(target) : undefined;
      const newZoneIds = target
        ? pending?.sourceInputs
          ? JSON.parse(pending.sourceInputs).newZoneIds
          : Array.from(
              { length: 6 - (target.spaces?.length ?? 0) - (target.privateSpaces?.length ?? 0) },
              () => "zone:" + createVillagesClientId(),
            )
        : undefined;
      const input = {
        setting: setupSetting,
        worldName: ports.setupWorldName,
        ...(options.quickStart ? { mode: "quick-start" } : {}),
        ...(options.fullVenue
          ? {
              mode: "draft-venue",
              targetVenue: targetSource,
              newZoneIds,
              draftEntranceImage: !!options.draftEntranceImage,
              sceneryArtStyle: ports.sceneryStyle,
              sceneryStyleProfileId: ports.sceneryStyleProfileId,
            }
          : {}),
        targetVenueId: options.venueId,
        villageName: ports.setupName,
        context: ports.setupContext,
        openingVenueId: ports.setupContext?.openingVenueId,
        playerPersonaId: personaDraft,
        selectedLorebookIds: setupLorebookDraft,
        loreTokenBudget: setupLoreTokenBudgetDraft,
        foundingResidentAdmissions: selectedResidentAdmissions,
        venues: requestRows(rows),
      };
      const result = await requestFoundingSuggestions(
        { ...ports, signal, setupBeginningSourceKey: source },
        options,
        input,
      );
      const currentTarget = targetSource ? setupVenuesRef.current.find((row) => row.id === targetSource.id) : undefined;

      if (
        (targetSource &&
          (!currentTarget ||
            JSON.stringify(targetSource) !== JSON.stringify(foundingVenueDraftSource(currentTarget)))) ||
        setupBeginningSourceKeyRef.current !== setupBeginningSourceKey ||
        (!replacing &&
          !!options.venueId &&
          JSON.stringify(input.venues) !== JSON.stringify(requestRows(setupVenuesRef.current))) ||
        (replacing && quickStartIdentity(setupVenuesRef.current) !== identity) ||
        (options.separateHomes && JSON.stringify(setupVenuesRef.current) !== replacementSource) ||
        (!replacing && rows.some((row) => !setupVenuesRef.current.some((current) => current.id === row.id)))
      )
        throw new Error(
          "The people or setting changed while suggestions were prepared. Your existing draft is kept; request fresh suggestions when ready.",
        );
      if (replacing) {
        ports.setSetupWorkspace((state) => ({ ...state, lore: result.lore }));
        if (!options.quickStart || options.venueId)
          throw new Error(
            "The older suggestion attempt was checked. Use Suggest Venues again to generate all template Venues.",
          );
        const next = rows.map((row) => {
          const proposal = result.venues.find((item) => item.id === row.id);
          if (!proposal) throw new Error("Suggestions did not return every template Venue. Your draft is unchanged.");
          return replaceQuickStartVenue(row, proposal);
        });
        setSetupVenues(
          arrangeQuickStartVenues(options.separateHomes ? next.map((row) => reconcileFoundingHome(row)) : next, true),
        );
        ports.onQuickStartApplied?.();
        ports.setSetupWorkspace((state) => ({
          ...state,
          view: "map",
          paused: false,
          sections: {},
          zones: {},
          inactive: {},
        }));
        setSetupSuggestionsKey(setupBeginningSourceKey);
        return;
      }
      if (options.quickStart) throw new Error("Use Suggest Venues to confirm replacing Venue drafts.");
      ports.setSetupWorkspace((state) => ({ ...state, lore: result.lore }));
      if (options.fullVenue && !result.venues.find((row) => row.id === options.venueId)?.zones)
        throw new Error("The Venue draft has no complete Zone plan.");
      setSetupVenues((currentRows) =>
        currentRows.map((row) => {
          if (options.venueId && row.id !== options.venueId) return row;
          const proposal = result.venues.find((item) => item.id === row.id);
          const before = rows.find((item) => item.id === row.id);
          if (
            !proposal ||
            !before ||
            setupImageTargetRef.current?.venueId === row.id ||
            quickStartIdentity([row]) !== quickStartIdentity([before])
          )
            return row;
          if (options.fullVenue) {
            const next = applyFoundingVenueDraft(row, proposal);
            return result.entranceImage
              ? { ...next, presentation: { ...next.presentation, image: result.entranceImage } }
              : next;
          }
          const changed: SetupVenueDraft = { ...row };
          // Explicit selected-Venue suggestions change text only; room and access records remain authoritative.
          for (const key of ["name", "venueType", "form", "description"] as const)
            if ((options.venueId || !setupAuthoredFieldsRef.current[row.id]?.includes(key)) && row[key] === before[key])
              changed[key] = proposal[key] ?? row[key];
          if (changed.description !== row.description) Object.assign(changed, zoneDayNightDefault(proposal.dayNight));
          return changed;
        }),
      );
      if (result.imageError) setSetupProblem(result.imageError);
      if (!options?.venueId) setSetupSuggestionsKey(source);
    } catch (cause) {
      if (!signal?.aborted && !(cause instanceof Error && cause.name === "AbortError"))
        setSetupProblem(messageFrom(cause, "Suggestions could not be prepared. You can write the details yourself."));
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

    if (step === 5 && (setupVenueBusy || setupSuggestionsBusy)) {
      setSetupProblem("Wait for the pending Venue request before Review.");
      return;
    }
    if (step > setupStep || step === 5) {
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
        (step >= 2 ? peopleProblem : "") ||
        (step >= 3 ? mapProblem : "") ||
        (step === 5 ? setupBlocker(true) : "");
      if (problem) {
        if (placeProblem || problem === connectionSetupProblem) setSetupStep(0);
        else if (step >= 2 && peopleProblem) setSetupStep(1);
        else if (step >= 3 && mapProblem) setSetupStep(2);
        setSetupProblem(problem);
        return;
      }
    }
    setSetupProblem("");
    if (step === 5) setSetupMapReviewed(true);
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
