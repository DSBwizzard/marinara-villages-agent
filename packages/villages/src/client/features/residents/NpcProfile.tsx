import { useEffect, useState } from "react";
import type { VillageNpcView } from "../../../shared/contracts/village.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { PeopleBook } from "./PeopleBook.js";
import { VillagerMemoriesPanel } from "./MemoriesPanel.js";
import type { ResidentsScreenController } from "./screen-contracts.js";

export function NpcProfile({
  npc,
  controller,
  onDirectory,
}: {
  npc: VillageNpcView;
  controller: ResidentsScreenController;
  onDirectory?: () => Promise<boolean>;
}) {
  const [memories, setMemories] = useState(false);
  const { setProfileInspection, memoryLibrary, busy, loadMemoryLibrary, forgetMemory } = controller;
  useEffect(() => {
    setProfileInspection(memories ? "memories" : null);
    return () => setProfileInspection(null);
  }, [memories, setProfileInspection]);
  return (
    <div className={`${P}-root ${P}-dossier-root`}>
      <PeopleBook label={`${npc.name} profile`}>
        <div className={`${P}-dossier-identity`}>
          {onDirectory ? (
            <button type="button" className={`${P}-dossier-back`} onClick={() => void onDirectory()}>
              ← NPCs
            </button>
          ) : null}
          <article className={`${P}-dossier-journal`} aria-label={`${npc.name} journal`}>
            <div className={`${P}-dossier-journal-content`}>
              <h1>{npc.name}</h1>
              <div className={`${P}-dossier-biography`}>
                <p>{npc.mapName}</p>
              </div>
            </div>
          </article>
        </div>
        <main className={`${P}-dossier-workspace`}>
          <nav className={`${P}-dossier-tabs`} aria-label="NPC profile sections">
            <div>
              <button type="button" aria-pressed={!memories} onClick={() => setMemories(false)}>
                Overview
              </button>
              <button type="button" aria-pressed={memories} onClick={() => setMemories(true)}>
                Inspect memories
              </button>
            </div>
            <label className={`${P}-dossier-section-picker`}>
              <span className={`${P}-sr-only`}>Section</span>
              <select
                value={memories ? "memories" : "overview"}
                onChange={(event) => setMemories(event.target.value === "memories")}
              >
                <option value="overview">Overview</option>
                <option value="memories">Inspect memories</option>
              </select>
            </label>
          </nav>
          <div className={`${P}-dossier-content`}>
            {controller.error ? <p role="alert">{controller.error}</p> : null}
            {memories ? (
              <div className={`${P}-dossier-sheet`}>
                <VillagerMemoriesPanel
                  key={npc.characterId}
                  characterId={npc.characterId}
                  library={memoryLibrary}
                  busy={busy}
                  onQuery={(query, signal) => loadMemoryLibrary(signal, query)}
                  onForget={(entry, knower) => memoryLibrary && void forgetMemory(entry, [knower], memoryLibrary)}
                />
              </div>
            ) : (
              <section className={`${P}-dossier-sheet`}>
                {npc.appearance ? (
                  <p>{npc.appearance}</p>
                ) : (
                  <p>{npc.met ? "No recorded appearance." : "Not met yet."}</p>
                )}
              </section>
            )}
          </div>
        </main>
      </PeopleBook>
    </div>
  );
}
