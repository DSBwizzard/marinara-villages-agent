import { ELEMENT_TAG } from "../../shared/constants.js";
import type { VillageController } from "../../shell/useVillageController.js";
import { SETUP_STEPS } from "./FoundingPanels.js";

export function ResumeScreen({ controller }: { controller: VillageController }) {
  const {
    draftSaveError,
    draftSavedAt,
    newSetupDraft,
    restoreSetupDraft,
    savedSetupDraft,
    screen,
    setSetupStep,
    setupMapBusy,
    setupSuggestionsBusy,
    setupVenueBusy,
  } = controller;

  if (screen === "resume") {
    const draft = savedSetupDraft?.data;
    const count =
      draft?.venues.filter((venue) => venue.presentation.x !== null && venue.presentation.y !== null).length ?? 0;
    return (
      <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-setup-root villages-forging-v2`}>
        <header className={`${ELEMENT_TAG}-setup-heading`}>
          <h1>Village Forging</h1>
          <span>Saved draft · this browser</span>
        </header>
        <main className="villages-forging-body">
          <section className="villages-forging-card villages-forging-resume">
            <div>
              {draft?.mapImage ? (
                <img className="villages-forging-preview" src={draft.mapImage} alt="Your saved map artwork" />
              ) : (
                <div className="villages-forging-logical-preview">Your saved logical map</div>
              )}
            </div>
            <div>
              <span className="villages-forging-saved">Saved draft</span>
              <h2>Welcome back to {draft?.name.trim() || "your village"}</h2>
              <p>Your choices, edits, photograph positions, and finished artwork are saved.</p>
              <p>
                <strong>Resume:</strong> {SETUP_STEPS[draft?.step ?? 0]} · {count} of {draft?.venues.length ?? 0}{" "}
                photographs placed
              </p>
              <p>{draft?.roster.length ?? 0} villagers selected · Persona and role saved</p>
              {draftSavedAt ? <p>Last saved {new Date(draftSavedAt).toLocaleString()}</p> : null}
              <div className="villages-forging-actions">
                <button
                  type="button"
                  className="villages-forging-primary"
                  disabled={!draft}
                  onClick={() => draft && restoreSetupDraft(draft)}
                >
                  Resume {draft?.step === 2 ? "photograph placement" : "founding"}
                </button>
                <button
                  type="button"
                  disabled={!draft}
                  onClick={() => {
                    if (draft) {
                      restoreSetupDraft(draft);
                      setSetupStep(0);
                    }
                  }}
                >
                  Review saved choices
                </button>
              </div>
            </div>
          </section>
          <button
            type="button"
            disabled={setupMapBusy || setupVenueBusy || setupSuggestionsBusy}
            onClick={() => void newSetupDraft()}
          >
            Start a new village draft
          </button>
          {draftSaveError ? <p role="alert">{draftSaveError}</p> : null}
        </main>
      </div>
    );
  }
  return null;
}
