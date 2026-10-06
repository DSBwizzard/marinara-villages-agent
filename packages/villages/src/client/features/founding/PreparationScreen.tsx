import { request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { PreparationScreenController } from "./screen-contracts.js";
import { AgentConnections } from "../settings/SettingsPanels.js";
import { VillagesBurstPreview } from "../settings/villages-burst-preview.js";

export function PreparationScreen({ controller }: { controller: PreparationScreenController }) {
  const { preparationProblem, retryPreparation, screen, snapshot } = controller;

  // ── The founding wizard ────────────────────────────────────────────────────
  // It owns the whole tab while it runs. The questions sit in the left column
  // and the map is drawn beside them, so the player answers and marks their own
  // houses by clicking the picture without either one being drawn over the
  // other.
  if (screen === "preparing") {
    const preparation = snapshot?.foundingPreparation;
    const total = snapshot?.villagers.length ?? 0;
    const done = preparation?.completedIds.length ?? 0;
    const current = snapshot?.villagers.find((villager) => villager.characterId === preparation?.currentId)?.name;
    const currentVenue = snapshot?.settings.venues.find((venue) => venue.id === preparation?.currentVenueId);
    const currentSpace = currentVenue?.zones?.find((zone) => zone.id === preparation?.currentZoneId)?.name;
    const phase =
      preparation?.phase ?? (current ? "residents" : preparation?.venueDetailsSeeded ? "private-spaces" : "venues");
    const subject =
      phase === "private-spaces" ? [currentSpace, currentVenue?.name].filter(Boolean).join(" · ") : current;
    const task =
      phase === "venues"
        ? "starting venue details"
        : phase === "private-spaces"
          ? "this private space"
          : "wishes and a routine profile";
    const stageText =
      preparation?.stage === "reading"
        ? "Reading the character card"
        : preparation?.stage === "lore"
          ? "Selecting relevant entries from the founding lorebooks"
          : preparation?.stage === "resolving"
            ? "Connecting to the System model"
            : preparation?.stage === "model"
              ? `Waiting for ${preparation.modelName || "the System model"} to write ${task}`
              : preparation?.stage === "queued"
                ? "Waiting for preparation to start"
                : preparation?.stage === "validating"
                  ? "Checking the generated result"
                  : preparation?.stage === "applying"
                    ? "Building varied days locally"
                    : preparation?.stage === "saving"
                      ? phase === "residents"
                        ? "Saving this villager's wishes and routine"
                        : "Saving prepared details"
                      : phase === "venues"
                        ? "Preparing starting venue details"
                        : phase === "private-spaces"
                          ? "Preparing private spaces"
                          : "Preparing residents";
    const started = preparation?.stageStartedAt ? Date.parse(preparation.stageStartedAt) : NaN;
    const stageSeconds =
      preparation?.status === "pending" && Number.isFinite(started)
        ? Math.max(0, Math.floor((Date.now() - started) / 1000))
        : null;
    return (
      <div
        className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-preparing villages-forging-preparing`}
        role="status"
        aria-live="polite"
      >
        <div>
          <div className={`${ELEMENT_TAG}-preparing-house`} aria-hidden="true">
            🏡
          </div>
          <h1>{snapshot?.village.name ?? "Your village"} is settling in</h1>
          <p>
            {preparation?.status === "failed"
              ? "The villagers need a hand before the gates open."
              : current
                ? `Making room for ${current}…`
                : "Lighting windows and making plans…"}
          </p>
          <p>{`${done} of ${total} villagers ready`}</p>
          <progress aria-label="Villagers ready" max={Math.max(1, total)} value={done} />
          {preparation?.privateSpacesTotal !== undefined ? (
            <>
              <p>{`${preparation.privateSpacesReady ?? 0} of ${preparation.privateSpacesTotal} private spaces ready`}</p>
              <progress
                aria-label="Private spaces ready"
                max={Math.max(1, preparation.privateSpacesTotal)}
                value={preparation.privateSpacesReady ?? 0}
              />
            </>
          ) : null}
          <ul className="villages-forging-preparation-list">
            {(snapshot?.villagers ?? []).map((villager) => (
              <li key={villager.characterId}>
                {preparation?.completedIds.includes(villager.characterId)
                  ? "✓"
                  : villager.characterId === preparation?.currentId
                    ? "…"
                    : "○"}{" "}
                {villager.name}
                {preparation?.completedIds.includes(villager.characterId)
                  ? " · Ready"
                  : villager.characterId === preparation?.currentId
                    ? " · Preparing wishes and daily routine"
                    : " · Waiting"}
              </li>
            ))}
          </ul>
          <p>
            Your place, starting spaces, and map are saved. Completed villagers stay ready if preparation needs a retry.
          </p>
          <details>
            <summary>Preparation details</summary>
            <p>
              {phase === "venues"
                ? "Starting venue details"
                : phase === "private-spaces"
                  ? "Private-space preparation"
                  : "Resident preparation"}
            </p>
            {subject ? <p>{subject}</p> : null}
            {preparation?.status === "failed" ? (
              <p>Preparation stopped. Completed work is saved; retry to continue.</p>
            ) : (
              <p>
                {stageText}
                {subject ? ` for ${subject}` : ""}.
              </p>
            )}
            {preparation?.attempt ? <p>{`Attempt ${preparation.attempt}`}</p> : null}
            {stageSeconds !== null ? <p>{`${stageSeconds}s in this stage`}</p> : null}
            {preparation?.stage === "resolving" ||
            preparation?.stage === "model" ||
            preparation?.stage === "applying" ||
            preparation?.stage === "saving" ? (
              preparation.loreEntryCount !== undefined ? (
                <p>{`${preparation.loreEntryCount} relevant lorebook entries included`}</p>
              ) : null
            ) : null}
            {preparation?.status === "pending" && preparation.error ? (
              <p className={`${ELEMENT_TAG}-hint`}>{`Previous attempt: ${preparation.error}`}</p>
            ) : null}
          </details>
          {preparation?.status === "failed" ? (
            <div className={`${ELEMENT_TAG}-overlay`}>
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {preparation.error}
              </p>
              <VillagesBurstPreview request={request} action="founding" />
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => void retryPreparation()}>
                Retry preparation
              </button>
              <details>
                <summary>Change connections</summary>
                <AgentConnections />
              </details>
            </div>
          ) : null}
          {preparationProblem ? (
            <p className={`${ELEMENT_TAG}-error`} role="alert">
              {preparationProblem}
            </p>
          ) : null}
        </div>
      </div>
    );
  }
  return null;
}
