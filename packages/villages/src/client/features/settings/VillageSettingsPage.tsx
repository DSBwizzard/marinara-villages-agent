import { MapsPanel } from "./MapsPanel.js";
import { WorldNameSettings } from "./WorldNameSettings.js";
import { ELEMENT_TAG } from "../../shared/constants.js";

import { PlayerIdentityEditor, VillageLorebookPicker, LoreTokenBudgetField } from "../founding/FoundingPanels.js";
import { SceneryStyleFields } from "../founding/villages-founding-editor";
import { PlayerBackgroundSummary } from "../founding/villages-player-background.js";
import type { VillageSettingsPagePorts } from "./page-contracts.js";
import { VillageWritingSettings } from "./WritingSettings.js";

export function renderVillageSettingsPage(ports: VillageSettingsPagePorts) {
  const {
    addVenue,
    backgroundPanel,
    busy,
    insertMacro,
    knowledgeDraft,
    knowledgeRef,
    loreTokenBudgetDraft,
    lorebookDraft,
    lorebooks,
    lorebooksError,
    mobile,
    openPlace,
    openSetup,
    personaDraft,
    personalizeHomes,
    personas,
    placeCount,
    saveScenerySettings,
    saveSettings,
    sceneryStyle,
    sceneryStyleProfileId,
    setKnowledgeDraft,
    setLoreTokenBudgetDraft,
    setLorebookDraft,
    setPersonaDraft,
    setPersonalizeHomes,
    setSceneryStyle,
    setSceneryStyleProfileId,
    setSettingDraft,
    setVenueSearch,
    setVisualLoreDefault,
    settingDraft,
    settingsError,
    snapshot,
    venueSearch,
    visualLoreDefault,
  } = ports;
  return (
    <div className={`${ELEMENT_TAG}-menu-body ${ELEMENT_TAG}-menu-content`} role="main">
      <p>
        Village timezone · <strong>{snapshot.clock?.timeZone || snapshot.village.timeZone}</strong>
      </p>
      <section className={ELEMENT_TAG + "-venue-card"}>
        <label>
          <input
            autoComplete="off"
            type="checkbox"
            disabled={busy}
            checked={snapshot.settings.automaticZonePictures !== false}
            onChange={(event) => void saveScenerySettings(event.target.checked)}
          />
          Automatic Zone pictures
        </label>
        <SceneryStyleFields
          value={sceneryStyle}
          profileId={sceneryStyleProfileId}
          onChange={setSceneryStyle}
          onProfileChange={setSceneryStyleProfileId}
        />
        <label>
          <input
            autoComplete="off"
            type="checkbox"
            checked={personalizeHomes}
            onChange={(event) => setPersonalizeHomes(event.target.checked)}
          />
          Personalize new venue images by default
        </label>
        <label>
          <input
            autoComplete="off"
            type="checkbox"
            checked={visualLoreDefault}
            onChange={(event) => setVisualLoreDefault(event.target.checked)}
          />
          Use visual lore by default
        </label>
        <button type="button" disabled={busy} onClick={() => void saveScenerySettings()}>
          Save scenery settings
        </button>
      </section>

      {backgroundPanel}
      {snapshot ? (
        <section className={`${ELEMENT_TAG}-panel`}>
          <h2 className={`${ELEMENT_TAG}-panel-title`}>Village settings</h2>

          <VillageWritingSettings />

          <MapsPanel snapshot={snapshot} onSnapshot={ports.setSnapshot} mobile={mobile} />

          <div className={`${ELEMENT_TAG}-field`}>
            <div className={`${ELEMENT_TAG}-row`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={busy || !snapshot}
                onClick={() => openSetup(false, snapshot)}
              >
                Run setup again
              </button>
            </div>
          </div>

          {/*
                  The setting below is the wizard's. It is left on screen with
                  its value in it and made read-only, rather than taken away.

                  Setting a village up is one question with two halves — the
                  world it sits in and the houses standing in it — and the
                  founding wizard asks both, in one sitting, which is what it is
                  for. Two screens writing the same village is the thing to
                  avoid, and the half-edited state between them is worse than
                  one of the two being read-only.

                  It stays on screen because what it holds is still real: the
                  setting reaches every villager through the town description,
                  and a village that has lost the place you write about it in
                  reads as a bug rather than as a division of labour.

                  The places below it are the other way round. Where the houses
                  stand is the wizard's second question; what there is to DO in
                  a place is not one of its three, so this is the only editor a
                  destination has — and a destination is the way into a
                  conversation now, which makes the list furniture rather than
                  leftover.
                */}
          <div className={`${ELEMENT_TAG}-field`}>
            <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setting`}>
              Place
            </label>
            <textarea
              autoComplete="off"
              id={`${ELEMENT_TAG}-setting`}
              className={`${ELEMENT_TAG}-textarea ${ELEMENT_TAG}-off`}
              value={settingDraft}
              maxLength={snapshot.settings.settingMaxLength}
              placeholder="A cliffside fishing town where the boats go out before dawn…"
              disabled
              onChange={(event) => setSettingDraft(event.target.value)}
            />
          </div>

          <WorldNameSettings
            key={snapshot.settings.worldName}
            onSnapshot={ports.setSnapshot}
            initial={snapshot.settings.worldName ?? ""}
          />
          <VillageLorebookPicker
            books={lorebooks}
            error={lorebooksError}
            selected={lorebookDraft}
            onChange={setLorebookDraft}
            disabled={busy}
          />
          <LoreTokenBudgetField
            value={loreTokenBudgetDraft}
            onChange={setLoreTokenBudgetDraft}
            min={snapshot.settings.loreTokenBudgetMin ?? 0}
            max={snapshot.settings.loreTokenBudgetMax ?? 3200}
            disabled={busy}
          />

          <section className={ELEMENT_TAG + "-field"}>
            <h2 className={ELEMENT_TAG + "-panel-title"}>Venues</h2>
            <button
              type="button"
              className={ELEMENT_TAG + "-button"}
              onClick={addVenue}
              disabled={busy || placeCount >= snapshot.settings.maxPlaces}
            >
              Propose Venue Project
            </button>
            <input
              autoComplete="off"
              className={ELEMENT_TAG + "-notice-input"}
              type="search"
              value={venueSearch}
              onChange={(event) => setVenueSearch(event.target.value)}
              placeholder="Find a Venue"
              aria-label="Search Venues"
            />
            {snapshot.settings.venues
              .filter((venue) =>
                (venue.name + " " + (venue.form || "")).toLowerCase().includes(venueSearch.toLowerCase()),
              )
              .map((venue) => (
                <div className={ELEMENT_TAG + "-notice-row"} key={venue.id}>
                  <strong>{venue.name}</strong>
                  <span>{venue.form}</span>
                  <button type="button" className={ELEMENT_TAG + "-button"} onClick={() => openPlace(venue)}>
                    View Venue
                  </button>
                </div>
              ))}
          </section>
          {/*
                  The knowledge box is world context. Writing guidance is above;
                  each resident's own card governs their speech.
                */}
          <div className={`${ELEMENT_TAG}-field`}>
            <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-knowledge`}>
              The information villagers know
            </label>
            <textarea
              autoComplete="off"
              id={`${ELEMENT_TAG}-knowledge`}
              ref={knowledgeRef}
              className={`${ELEMENT_TAG}-preset`}
              value={knowledgeDraft}
              maxLength={snapshot.settings.promptBoxMaxLength}
              spellCheck={false}
              onChange={(event) => setKnowledgeDraft(event.target.value)}
            />

            <div className={`${ELEMENT_TAG}-macros`}>
              {snapshot.settings.macros.map((macro) => (
                <button
                  key={macro.token}
                  type="button"
                  className={`${ELEMENT_TAG}-macro`}
                  title={`${macro.label} — ${macro.help}`}
                  onClick={() => insertMacro(macro.token)}
                >
                  {macro.token}
                </button>
              ))}
            </div>
          </div>

          <PlayerIdentityEditor
            idPrefix="settings"
            personas={personas}
            draft={personaDraft}
            onDraft={setPersonaDraft}
            storedId={snapshot.settings.playerPersonaId}
            storedName={snapshot.settings.playerPersonaName}
            storedMissing={snapshot.settings.playerPersonaMissing}
            disabled={busy}
          />
          <PlayerBackgroundSummary background={snapshot.settings.playerBackground} />

          <div className={`${ELEMENT_TAG}-row`}>
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={() => void saveSettings()}
              disabled={busy}
            >
              Save settings
            </button>

            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={() => {
                setKnowledgeDraft(snapshot.settings.defaultPromptKnowledge);
              }}
              disabled={busy}
            >
              Restore the default box
            </button>
            <span className={`${ELEMENT_TAG}-hint`}>
              {knowledgeDraft === snapshot.settings.promptKnowledge &&
              personaDraft === snapshot.settings.playerPersonaId &&
              settingDraft === snapshot.settings.setting &&
              JSON.stringify(lorebookDraft) === JSON.stringify(snapshot.settings.selectedLorebookIds)
                ? "No unsaved changes."
                : "Unsaved changes."}
            </span>
          </div>
        </section>
      ) : null}

      {settingsError ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {settingsError}
        </p>
      ) : null}
    </div>
  );
}
