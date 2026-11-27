import { useEffect, useRef, useState } from "react";
import { request } from "../../shared/api.js";
import { CardFlipSprite } from "../../shared/CardFlipSprite.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useLetterFont } from "../../shared/letter-font-css.js";
import { AgentConnections } from "../settings/AgentConnections.js";
import { FoundingGuide, foundingMariSprite } from "./FoundingGuide.js";
import { StartingHistoryPreparation } from "./StartingHistoryPreparation.js";
import type { PreparationScreenController } from "./screen-contracts.js";

export function PreparationScreen({
  controller,
  onEnter,
  storybookDaylight,
}: {
  controller: PreparationScreenController;
  onEnter: () => void;
  storybookDaylight: boolean;
}) {
  const { snapshot } = controller;
  const preparation = snapshot?.foundingPreparation;
  const ready = !!snapshot?.isFounded && (preparation?.canPlay ?? true);
  const [farewell, setFarewell] = useState(false);
  const lineRef = useRef<HTMLParagraphElement>(null);
  useLetterFont("lora");
  useEffect(() => {
    if (ready) lineRef.current?.focus({ preventScroll: true });
  }, [ready, farewell]);

  const pose = farewell ? "playful" : "happy";
  return (
    <div
      className={`${ELEMENT_TAG}-root villages-forging-v2 villages-forging-preparing`}
      data-step="preparation"
      data-lighting={storybookDaylight ? "day" : "night"}
      data-review-scene={ready || undefined}
    >
      {ready ? (
        <>
          <div className="villages-setting-stage" aria-hidden="true">
            <CardFlipSprite
              url={foundingMariSprite(pose)}
              facing="front"
              mirrored={false}
              view="front"
              framing="full"
              enabled={snapshot.settings.spriteCardFlipEnabled !== false}
              animate
              stepKey={pose}
              transformOrigin="var(--shoe-center, 50%) bottom"
            />
          </div>
          <div className="villages-founding-chapter" data-guided data-explanation>
            <FoundingGuide
              scene
              lineRef={lineRef}
              replies={
                <>
                  {farewell ? (
                    <button type="button" data-reader-direction="back" onClick={() => setFarewell(false)}>
                      Back
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="villages-forging-primary villages-founding-next-reply"
                    data-reader-direction="next"
                    onClick={farewell ? onEnter : () => setFarewell(true)}
                  >
                    {farewell ? "Enter village" : "Next"}
                  </button>
                </>
              }
            >
              {farewell
                ? "Maybe I'll see you there!"
                : `Look at that. ${snapshot.village.name} is ready for you. Have fun! Professor’s orders.`}
            </FoundingGuide>
          </div>
        </>
      ) : (
        <PreparationProgress controller={controller} />
      )}
    </div>
  );
}

function PreparationProgress({ controller }: { controller: PreparationScreenController }) {
  const { preparationProblem, retryPreparation, snapshot } = controller;
  const preparation = snapshot?.foundingPreparation;
  const residents = (snapshot?.villagers ?? []).filter(
    (resident) => preparation?.tasksVersion !== 1 || !!preparation.tasks?.[resident.characterId],
  );
  const total = residents.length;
  const done = preparation?.completedIds.length ?? 0;
  const current = snapshot?.villagers.find((villager) => villager.characterId === preparation?.currentId)?.name;
  const currentVenue = snapshot?.settings.venues.find((venue) => venue.id === preparation?.currentVenueId);
  const currentSpace = currentVenue?.zones?.find((zone) => zone.id === preparation?.currentZoneId)?.name;
  const phase = preparation?.phase ?? (current ? "residents" : "private-spaces");
  const subject = phase === "private-spaces" ? [currentSpace, currentVenue?.name].filter(Boolean).join(", ") : current;
  const task =
    phase === "venues"
      ? "starting venue details"
      : phase === "private-spaces"
        ? "this private space"
        : preparation?.currentTask === "wish"
          ? "an Initial Wish"
          : "an Agenda";
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
                      ? "Saving preparation"
                      : "Saving prepared details"
                    : phase === "venues"
                      ? "Preparing starting venue details"
                      : phase === "private-spaces"
                        ? "Preparing private spaces"
                        : "Preparing residents";
  const failed = preparation?.status === "failed";
  const activeResident = preparation?.status === "pending" && phase === "residents" ? preparation.currentId : "";
  const privateTotal = preparation?.privateSpacesTotal ?? 0;
  const privateReady = preparation?.privateSpacesReady ?? 0;
  const started = Date.parse(preparation?.stageStartedAt ?? "");
  const stageSeconds =
    preparation?.status === "pending" && Number.isFinite(started)
      ? Math.max(0, Math.floor((Date.now() - started) / 1000))
      : null;
  const loreCount =
    preparation?.stage && ["resolving", "model", "applying", "saving"].includes(preparation.stage)
      ? preparation.loreEntryCount
      : undefined;
  const stageMetrics = [
    stageSeconds !== null ? `${stageSeconds}s in this stage` : "",
    loreCount !== undefined ? `${loreCount} lorebook entries included` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="villages-setting-dialogue villages-founding-progress" aria-labelledby="founding-progress-title">
      <h1 id="founding-progress-title">Preparing your village</h1>
      {total > 0 ? (
        <>
          <p role="status">{`${done} of ${total} residents ready`}</p>
          <progress aria-label="Residents ready" max={total} value={done} />
          <table aria-label="Resident preparation">
            <thead>
              <tr>
                <th scope="col">Resident</th>
                <th scope="col">Agenda</th>
                <th scope="col">Initial Wish</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((villager) => (
                <tr key={villager.characterId} data-current={activeResident === villager.characterId || undefined}>
                  <th scope="row">{villager.name}</th>
                  {(["routine", "wish"] as const).map((kind) => {
                    const entry = preparation?.tasks?.[villager.characterId]?.[kind];
                    const active = activeResident === villager.characterId && preparation?.currentTask === kind;
                    const status =
                      entry?.status === "completed" ||
                      (!entry && preparation?.completedIds.includes(villager.characterId))
                        ? "Ready"
                        : active
                          ? "Preparing"
                          : entry?.status === "failed"
                            ? "Failed"
                            : "Waiting";
                    return (
                      <td key={kind}>
                        <span className="villages-founding-task-state" data-status={status}>
                          {status}
                        </span>
                        {active && preparation?.attempt ? <small>Attempt {preparation.attempt}</small> : null}
                        {entry?.error ? <p className={`${ELEMENT_TAG}-error`}>{entry.error}</p> : null}
                        {failed && entry && entry.status !== "completed" ? (
                          <button
                            type="button"
                            onClick={() =>
                              void retryPreparation({
                                characterId: villager.characterId,
                                task: kind,
                                expectedAttempt: entry.attempt,
                              })
                            }
                          >
                            {kind === "routine" ? "Retry Agenda" : "Retry Wish"}
                          </button>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
      {privateTotal > 0 ? (
        <div className="villages-founding-progress-row">
          <p>Private spaces</p>
          <p>{`${privateReady} of ${privateTotal} private spaces ready`}</p>
        </div>
      ) : null}
      {preparation?.startingHistoryReady !== undefined ? (
        <StartingHistoryPreparation
          ready={preparation.startingHistoryReady}
          work={
            snapshot?.backgroundWork
              ?.filter((row) => row.kind === "starting-ties")
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
          }
          onChange={async () => controller.setSnapshot(await request("/setup/preparation"))}
        />
      ) : null}
      {!failed && preparation?.status !== "ready" ? (
        <section className="villages-founding-current-work" aria-label="Current preparation">
          <p>
            {stageText}
            {subject ? ` for ${subject}` : ""}.
          </p>
          {!activeResident && preparation?.attempt ? <p>Attempt {preparation.attempt}</p> : null}
          {stageMetrics ? <p>{stageMetrics}</p> : null}
          {preparation?.status === "pending" && preparation.error ? <p>Previous attempt: {preparation.error}</p> : null}
        </section>
      ) : null}
      {failed ? (
        <section className="villages-founding-current-work" aria-label="Preparation recovery">
          <p className={`${ELEMENT_TAG}-error`} role="alert">
            {preparation.error}
          </p>
          <button type="button" onClick={() => void retryPreparation()}>
            Retry failed
          </button>
          <details>
            <summary>Change connections</summary>
            <AgentConnections />
          </details>
        </section>
      ) : null}
      {preparationProblem ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {preparationProblem}
        </p>
      ) : null}
    </section>
  );
}
