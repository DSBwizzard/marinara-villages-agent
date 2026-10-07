import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { API_PATH } from "../../shared/constants.js";
import type { SetupVenueDraft } from "../../shared/types.js";
import type { SettingsState } from "../settings/useSettingsState.js";
import { foundingScenario } from "./FoundingPanels.js";
import type { FoundingScenarioId } from "./scenarios.js";
import type { FoundingState } from "./useFoundingState.js";
import { removeFoundingDraft } from "./villages-founding-draft.js";
import { personalSpaceDraft } from "./villages-founding-editor";
import { draftZonePolicy } from "./villages-founding-zones";
import { playerRoleProblem } from "./villages-player-role.js";
import { useCallback } from "react";

export function createFoundingSuggestSetupVenues(ports: {
  readonly personaDraft: SettingsState["personaDraft"];
  readonly selectedResidentContexts: {
    [k: string]: import("../../../shared/helpers/resident-founding-context").ResidentFoundingContext;
  };
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupSuggestionsBusy: FoundingState["setSetupSuggestionsBusy"];
  readonly setSetupSuggestionsKey: FoundingState["setSetupSuggestionsKey"];
  readonly setSetupVenues: FoundingState["setSetupVenues"];
  readonly setupAuthoredFieldsRef: React.RefObject<Record<string, string[]>>;
  readonly setupBeginningSourceKey: string;
  readonly setupBeginningSourceKeyRef: React.RefObject<string>;
  readonly setupFoundingDetails: FoundingState["setupFoundingDetails"];
  readonly setupImageTargetRef: FoundingState["setupImageTargetRef"];
  readonly setupLorebookDraft: FoundingState["setupLorebookDraft"];
  readonly setupLoreTokenBudgetDraft: FoundingState["setupLoreTokenBudgetDraft"];
  readonly setupSetting: FoundingState["setupSetting"];
  readonly setupSuggestionsClaim: FoundingState["setupSuggestionsClaim"];
  readonly setupVenues: FoundingState["setupVenues"];
  readonly setupVenuesRef: React.RefObject<import("../../../shared/contracts/village").VillageVenue[]>;
}) {
  return async () => {
    const {
      personaDraft,
      selectedResidentContexts,
      setSetupProblem,
      setSetupSuggestionsBusy,
      setSetupSuggestionsKey,
      setSetupVenues,
      setupAuthoredFieldsRef,
      setupBeginningSourceKey,
      setupBeginningSourceKeyRef,
      setupFoundingDetails,
      setupImageTargetRef,
      setupLorebookDraft,
      setupLoreTokenBudgetDraft,
      setupSetting,
      setupSuggestionsClaim,
      setupVenues,
      setupVenuesRef,
    } = ports;

    if (setupSuggestionsClaim.current || !setupSetting.trim() || !setupFoundingDetails.trim()) return;
    setupSuggestionsClaim.current = true;
    const source = setupBeginningSourceKey;
    const rows = setupVenues;
    setSetupSuggestionsBusy(true);
    setSetupProblem("");
    try {
      const result = await request<{
        venues: Array<{
          id: string;
          name: string;
          form: string;
          description: string;
          layout: "exterior" | "common" | "private" | "both";
          commonName: string;
          commonPurpose?: string;
          venueType?: string;
          commonDescription: string;
          privateName: string;
          privatePurpose: string;
        }>;
      }>("/setup/venues/suggest", {
        method: "POST",
        body: JSON.stringify({
          setting: setupSetting,
          foundingDetails: setupFoundingDetails,
          playerPersonaId: personaDraft,
          selectedLorebookIds: setupLorebookDraft,
          loreTokenBudget: setupLoreTokenBudgetDraft,
          foundingResidentContexts: selectedResidentContexts,
          venues: rows.map((row) => ({
            id: row.id,
            name: row.name,
            form: row.form,
            description: row.description,
            spaceDescription: row.spaces?.[0]?.description ?? "",
            venueClass: row.category === "public-center" ? "gathering" : "residence",
            residentCharacterId: row.occupancy.residentCharacterId ?? "",
          })),
        }),
      });
      if (
        setupBeginningSourceKeyRef.current !== source ||
        rows.some((row) => !setupVenuesRef.current.some((current) => current.id === row.id))
      )
        throw new Error(
          "The people or setting changed while suggestions were prepared. Your existing draft is kept; request fresh suggestions when ready.",
        );
      setSetupVenues((currentRows) =>
        currentRows.map((row) => {
          const proposal = result.venues.find((item) => item.id === row.id);
          const before = rows.find((item) => item.id === row.id);
          if (
            !proposal ||
            !before ||
            setupImageTargetRef.current?.venueId === row.id ||
            JSON.stringify(row.occupancy) !== JSON.stringify(before.occupancy)
          )
            return row;
          const changed: SetupVenueDraft = { ...row };
          for (const key of ["name", "venueType", "form", "description"] as const)
            if (!setupAuthoredFieldsRef.current[row.id]?.includes(key) && row[key] === before[key])
              changed[key] = proposal[key] ?? row[key];
          const layoutEdited = ["layout", "spaces", "privateSpaces"].some((key) =>
            setupAuthoredFieldsRef.current[row.id]?.includes(key),
          );
          if (
            !layoutEdited &&
            ![...(row.spaces ?? []), ...(row.privateSpaces ?? [])].some(
              (zone) => zone.image || !["common:base", "private:base"].includes(zone.id),
            ) &&
            JSON.stringify(row.spaces) === JSON.stringify(before.spaces) &&
            JSON.stringify(row.privateSpaces) === JSON.stringify(before.privateSpaces) &&
            row.layout === before.layout
          ) {
            const role = row.category === "public-center" ? "gathering" : "residence";
            changed.layout = proposal.layout;
            changed.spaces =
              proposal.layout === "common" || proposal.layout === "both"
                ? [
                    {
                      ...personalSpaceDraft(),
                      id: "common:base",
                      ownerId: "",
                      venueClass: role,
                      name: proposal.commonName,
                      purpose:
                        proposal.commonPurpose ||
                        (role === "residence" ? "Everyday home activities" : "Community gatherings"),
                      access: draftZonePolicy(row, { venueClass: role }),
                      description: proposal.commonDescription,
                    },
                  ]
                : [];
            changed.privateSpaces =
              proposal.layout === "private" || proposal.layout === "both"
                ? [
                    {
                      ...personalSpaceDraft(),
                      id: "private:base",
                      venueClass: role,
                      ownerId: row.occupancy.playerHome ? "player" : (row.occupancy.residentCharacterId ?? ""),
                      name: proposal.privateName,
                      purpose: proposal.privatePurpose,
                      access: draftZonePolicy(
                        row,
                        {
                          venueClass: role,
                          ownerId: row.occupancy.playerHome ? "player" : row.occupancy.residentCharacterId || "",
                        },
                        true,
                      ),
                      controllerIds: role === "gathering" ? ["player"] : undefined,
                    },
                  ]
                : [];
          }
          return changed;
        }),
      );
      setSetupSuggestionsKey(source);
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "Suggestions could not be prepared. You can write the details yourself."));
    } finally {
      setupSuggestionsClaim.current = false;
      setSetupSuggestionsBusy(false);
    }
  };
}

// ── Founding the village ───────────────────────────────────────────────────
// The wizard collects place, shared circumstances, map, and residents before
// writing the village. A half-answered setup never claims to be founded.
export function createFoundingChooseSetupScenario(ports: {
  readonly setSetupFoundingDetails: FoundingState["setSetupFoundingDetails"];
  readonly setSetupFoundingGuidance: FoundingState["setSetupFoundingGuidance"];
  readonly setSetupFoundingReason: FoundingState["setSetupFoundingReason"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setupFoundingDetails: FoundingState["setupFoundingDetails"];
  readonly setupFoundingReason: FoundingState["setupFoundingReason"];
  readonly snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  return (value: FoundingScenarioId) => {
    const {
      setSetupFoundingDetails,
      setSetupFoundingGuidance,
      setSetupFoundingReason,
      setSetupProblem,
      setupFoundingDetails,
      setupFoundingReason,
      snapshot,
    } = ports;

    if (snapshot?.isFounded) return;
    if (value === setupFoundingReason) return;
    const previousStarter = foundingScenario(setupFoundingReason).premise;
    const keepPlayerText = !!setupFoundingDetails.trim() && setupFoundingDetails !== previousStarter;
    setSetupFoundingReason(value);
    if (!keepPlayerText) setSetupFoundingDetails(foundingScenario(value).premise);
    setSetupFoundingGuidance("");
    setSetupProblem("");
  };
}

export function createFoundingGotoSetupStep(ports: {
  readonly catalog: import("../../../shared/contracts/village").CatalogEntry[];
  readonly connectionSetupProblem: FoundingState["connectionSetupProblem"];
  readonly loadCatalog: (signal?: AbortSignal) => Promise<void>;
  readonly loadLorebooks: (signal?: AbortSignal) => Promise<void>;
  readonly loadPersonas: (signal?: AbortSignal) => Promise<void>;
  readonly personaDraft: SettingsState["personaDraft"];
  readonly personas: import("../../../shared/contracts/village").PersonaEntry[];
  readonly residentContextProblem: "" | "Complete the highlighted resident background fields in People.";
  readonly setMovingSetupVenueId: FoundingState["setMovingSetupVenueId"];
  readonly setPlacingHome: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setPlacingPublicCenter: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setSetupEditorOpen: FoundingState["setSetupEditorOpen"];
  readonly setSetupProblem: FoundingState["setSetupProblem"];
  readonly setSetupStep: FoundingState["setSetupStep"];
  readonly setupBlocker: () => string;
  readonly setupFoundingDetails: FoundingState["setupFoundingDetails"];
  readonly setupFoundingVillagerIds: FoundingState["setupFoundingVillagerIds"];
  readonly setupHomeCount: number;
  readonly setupName: FoundingState["setupName"];
  readonly setupPlayerRole: FoundingState["setupPlayerRole"];
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
      setPlacingHome,
      setPlacingPublicCenter,
      setSetupEditorOpen,
      setSetupProblem,
      setSetupStep,
      setupBlocker,
      setupFoundingDetails,
      setupFoundingVillagerIds,
      setupHomeCount,
      setupName,
      setupPlayerRole,
      setupSetting,
      setupStep,
      setupSuggestionsBusy,
      setupVenueBusy,
      snapshot,
    } = ports;

    if (step === 3 && (setupVenueBusy || setupSuggestionsBusy)) {
      setSetupProblem("Wait for the pending Venue request before Review.");
      return;
    }
    if (step > setupStep) {
      const peopleProblem =
        !personaDraft || !personas?.some((persona) => persona.id === personaDraft)
          ? "Choose an available Persona."
          : residentContextProblem ||
            connectionSetupProblem ||
            (!snapshot?.isFounded ? playerRoleProblem(setupPlayerRole) : "") ||
            (!snapshot?.isFounded &&
            (setupHomeCount < 1 ||
              setupHomeCount > 3 ||
              setupFoundingVillagerIds.some((id) => !catalog?.some((person) => person.id === id)))
              ? "Choose one to three available founding villagers."
              : "");
      const placeProblem = !setupName.trim()
        ? "Give the village a name."
        : !setupSetting.trim()
          ? "Describe where we are."
          : !snapshot?.isFounded && !setupFoundingDetails.trim()
            ? "Describe what brings you together."
            : "";
      const problem = peopleProblem || (step >= 2 ? placeProblem : "") || (step >= 3 ? setupBlocker() : "");
      if (problem) {
        setSetupProblem(problem);
        return;
      }
    }
    setSetupProblem("");
    setSetupStep(step);
    setSetupEditorOpen(false);
    void loadPersonas();
    void loadCatalog();
    void loadLorebooks();
    setPlacingHome(false);
    setPlacingPublicCenter(false);
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
    React.SetStateAction<import("./villages-founding-draft").SavedFoundingDraft<import("./draft-model").SetupDraftData>>
  >;
  readonly setSettingsError: SettingsState["setSettingsError"];
  readonly setSnapshot: React.Dispatch<
    React.SetStateAction<import("../../../shared/contracts/village").VillageSnapshot>
  >;
}) {
  return useCallback(async () => {
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

    setBusy(true);
    setSettingsError("");
    try {
      const next = await request<VillageSnapshot>("/setup/reset", { method: "POST" });
      setSnapshot(next);
      setCatalog(null);
      // The offer to found the village is made again by hand: the player asked
      // for the wizard by asking to start over.
      await draftSaveQueue.current;
      await removeFoundingDraft(API_PATH);
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
  }, [ports.openSetup]);
}
