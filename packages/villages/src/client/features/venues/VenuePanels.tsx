import { messageFrom } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type {
  VenueClass,
  VenueViewZone,
  VillageSnapshot,
  VillageVenue,
  VillageVillagerView,
} from "../../shared/types.js";
import { venueAssignedCountFor, venueClassesFor, venueSpaceFor } from "../../shared/venue.js";
import { createVillagesClientId } from "../scenes/villages-venue-send";
import { useState } from "react";

export function VenueZoneEditor({ zone, onSave }: { zone: VenueViewZone; onSave: (body: unknown) => Promise<void> }) {
  const [name, setName] = useState(zone.label);
  const [purpose, setPurpose] = useState(zone.purpose ?? "");
  const [description, setDescription] = useState(zone.description);
  const [features, setFeatures] = useState(zone.state?.features.map((feature) => feature.text).join("\n") ?? "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <section className={ELEMENT_TAG + "-venue-card"}>
      <h2>{zone.label} details</h2>
      <label>
        Zone name
        <input maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Used for
        <input maxLength={240} value={purpose} onChange={(event) => setPurpose(event.target.value)} />
      </label>
      <label>
        Appearance
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label>
        Features · one per line
        <textarea value={features} onChange={(event) => setFeatures(event.target.value)} />
      </label>
      <p>
        {zone.area === "shared" || zone.area === "private"
          ? "Resident-controlled changes become exact proposals during an invited visit."
          : "These details describe this zone."}
      </p>
      <button
        type="button"
        className={ELEMENT_TAG + "-button"}
        disabled={busy || !description.trim()}
        onClick={async () => {
          setBusy(true);
          setNotice("");
          try {
            await onSave({
              name,
              purpose,
              description,
              state: {
                features: features
                  .split("\n")
                  .map((text) => text.trim())
                  .filter(Boolean)
                  .map((text) => ({ ...zone.state?.features.find((feature) => feature.text === text), text })),
              },
            });
            setNotice(
              zone.area === "shared" || zone.area === "private"
                ? "Saved. Any required resident approvals appear in the Venue."
                : "Zone saved.",
            );
          } catch {
            setNotice("The zone could not be saved. See the message above.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy
          ? "Saving…"
          : zone.area === "shared" || zone.area === "private"
            ? "Save / propose zone changes"
            : "Save zone details"}
      </button>
      {notice ? <p role="status">{notice}</p> : null}
    </section>
  );
}

export const VENUE_CLASS_CHOICES: VenueClass[] = ["residence", "workplace", "gathering", "other"];

export function VenueDraftFields({
  draft,
  existing,
  villagers,
  editableClasses,
  onChange,
}: {
  draft: VillageVenue;
  existing: boolean;
  villagers: VillageVillagerView[];
  editableClasses?: VenueClass[];
  onChange: (next: VillageVenue) => void;
}) {
  const classes = venueClassesFor(draft);
  const spaceClasses = draft.layoutVersion === 1 ? (draft.spaces ?? []).map((space) => space.venueClass) : classes;
  const changeSpace = (venueClass: VenueClass, patch: Partial<NonNullable<VillageVenue["spaces"]>[number]>) => {
    const spaces = spaceClasses.map((item) =>
      item === venueClass ? { ...venueSpaceFor(draft, item), ...patch } : venueSpaceFor(draft, item),
    );
    onChange({ ...draft, spaces, description: spaces[0]?.description ?? draft.description });
  };
  return (
    <div className={`${ELEMENT_TAG}-field`}>
      <label className={`${ELEMENT_TAG}-label`}>
        Name
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          value={draft.name}
          maxLength={100}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          placeholder="The Lantern Workshop"
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        Venue Type <span className={`${ELEMENT_TAG}-hint`}>Home, bakery, church, campsite…</span>
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          maxLength={100}
          value={draft.venueType ?? ""}
          onChange={(event) => onChange({ ...draft, venueType: event.target.value })}
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        Physical form <span className={`${ELEMENT_TAG}-hint`}>Building, shelter, or physical arrangement</span>
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          value={draft.form ?? ""}
          maxLength={200}
          onChange={(event) => onChange({ ...draft, form: event.target.value })}
          placeholder="A converted truck, a sleeping pod, an old diner…"
        />
      </label>
      <fieldset className={`${ELEMENT_TAG}-field`}>
        <legend className={`${ELEMENT_TAG}-label`}>Venue photograph · optional</legend>
        <p className={`${ELEMENT_TAG}-hint`}>Use a fraction from 0 to 1 across the map and down the map.</p>
        <div className={`${ELEMENT_TAG}-row`}>
          {(["x", "y"] as const).map((axis) => (
            <label key={axis} className={`${ELEMENT_TAG}-label`}>
              {axis === "x" ? "Across" : "Down"}
              <input
                className={`${ELEMENT_TAG}-notice-input`}
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={draft.presentation[axis] ?? ""}
                disabled={existing && venueAssignedCountFor(draft) > 0}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    presentation: {
                      ...draft.presentation,
                      [axis]: event.target.value === "" ? null : Number(event.target.value),
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
        {existing && venueAssignedCountFor(draft) > 0 ? (
          <p className={`${ELEMENT_TAG}-hint`}>Move residents before changing this Venue's pin.</p>
        ) : null}
      </fieldset>
      <fieldset className={`${ELEMENT_TAG}-field`}>
        <legend className={`${ELEMENT_TAG}-label`}>Classes · choose up to two</legend>
        <div className={`${ELEMENT_TAG}-row`}>
          {VENUE_CLASS_CHOICES.map((item) => (
            <label key={item} className={`${ELEMENT_TAG}-label`} style={{ textTransform: "capitalize" }}>
              <input
                type="checkbox"
                checked={classes.includes(item)}
                disabled={existing || (!classes.includes(item) && classes.length >= 2)}
                onChange={(event) => {
                  const next = event.target.checked ? [...classes, item] : classes.filter((entry) => entry !== item);
                  if (next.length < 1 || next.length > 2) return;
                  onChange({ ...draft, classes: next, spaces: next.map((entry) => venueSpaceFor(draft, entry)) });
                }}
              />{" "}
              {item}
            </label>
          ))}
        </div>
        {existing ? <p className={`${ELEMENT_TAG}-hint`}>Class changes go through a Venue proposal.</p> : null}
      </fieldset>
      {classes.includes("residence") ? (
        <label className={`${ELEMENT_TAG}-label`}>
          Resident capacity · includes you
          <input
            className={`${ELEMENT_TAG}-notice-input`}
            type="number"
            min={1}
            max={4}
            value={draft.residenceCapacity ?? 1}
            disabled={existing}
            onChange={(event) => onChange({ ...draft, residenceCapacity: Number(event.target.value) })}
          />
          {existing ? (
            <span className={`${ELEMENT_TAG}-hint`}>Capacity changes go through a Venue proposal.</span>
          ) : null}
        </label>
      ) : null}
      {classes.includes("workplace") ? (
        <fieldset className={`${ELEMENT_TAG}-field`}>
          <legend className={`${ELEMENT_TAG}-label`}>Workers</legend>
          {villagers.map((villager) => (
            <label key={villager.characterId} className={`${ELEMENT_TAG}-label`}>
              <input
                type="checkbox"
                checked={(draft.workerIds ?? []).includes(villager.characterId)}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    workerIds: event.target.checked
                      ? [...(draft.workerIds ?? []), villager.characterId]
                      : (draft.workerIds ?? []).filter((id) => id !== villager.characterId),
                  })
                }
              />{" "}
              {villager.name}
            </label>
          ))}
          {villagers.length === 0 ? <p className={`${ELEMENT_TAG}-hint`}>No villagers are available yet.</p> : null}
        </fieldset>
      ) : null}
      {spaceClasses
        .filter((item) => !editableClasses || editableClasses.includes(item))
        .map((item) => {
          const space = venueSpaceFor(draft, item);
          return (
            <section className={`${ELEMENT_TAG}-field`} key={item}>
              <h3 className={`${ELEMENT_TAG}-panel-title`} style={{ textTransform: "capitalize" }}>
                {item} space
              </h3>
              <label className={`${ELEMENT_TAG}-label`}>
                Scene description
                <textarea
                  className={`${ELEMENT_TAG}-textarea`}
                  value={space.description}
                  maxLength={1000}
                  onChange={(event) => changeSpace(item, { description: event.target.value })}
                />
              </label>
              <details className={`${ELEMENT_TAG}-venue-scene-details`}>
                <summary>Zone details</summary>
                <p className={`${ELEMENT_TAG}-hint`}>Current physical state used by Scenes and pictures.</p>
                <label className={`${ELEMENT_TAG}-label`}>
                  Condition now{" "}
                  <span className={`${ELEMENT_TAG}-hint`}>For example, a leaking roof or a repaired door.</span>
                  <input
                    className={`${ELEMENT_TAG}-notice-input`}
                    value={space.state.condition}
                    onChange={(event) =>
                      changeSpace(item, { state: { ...space.state, condition: event.target.value } })
                    }
                  />
                </label>
                <label className={`${ELEMENT_TAG}-label`}>
                  Present items · one per line{" "}
                  <span className={`${ELEMENT_TAG}-hint`}>Objects physically in this space.</span>
                  <textarea
                    className={`${ELEMENT_TAG}-textarea`}
                    value={space.state.items.join("\n")}
                    onChange={(event) =>
                      changeSpace(item, { state: { ...space.state, items: event.target.value.split("\n") } })
                    }
                  />
                </label>
                <label className={`${ELEMENT_TAG}-label`}>
                  Established facts · one per line{" "}
                  <span className={`${ELEMENT_TAG}-hint`}>Durable truths about this space.</span>
                  <textarea
                    className={`${ELEMENT_TAG}-textarea`}
                    value={space.state.publicFacts.join("\n")}
                    onChange={(event) =>
                      changeSpace(item, { state: { ...space.state, publicFacts: event.target.value.split("\n") } })
                    }
                  />
                </label>
                <div className={`${ELEMENT_TAG}-field`}>
                  <span className={`${ELEMENT_TAG}-label`}>Features · lasting details established through play</span>
                  {space.state.features.map((feature, index) => (
                    <div className={`${ELEMENT_TAG}-row`} key={feature.id}>
                      <input
                        className={`${ELEMENT_TAG}-notice-input`}
                        value={feature.text}
                        aria-label={`Feature ${index + 1}`}
                        onChange={(event) =>
                          changeSpace(item, {
                            state: {
                              ...space.state,
                              features: space.state.features.map((entry) =>
                                entry.id === feature.id ? { ...entry, text: event.target.value } : entry,
                              ),
                            },
                          })
                        }
                      />
                      <label className={`${ELEMENT_TAG}-label`}>
                        <input
                          type="checkbox"
                          checked={feature.locked}
                          onChange={(event) =>
                            changeSpace(item, {
                              state: {
                                ...space.state,
                                features: space.state.features.map((entry) =>
                                  entry.id === feature.id ? { ...entry, locked: event.target.checked } : entry,
                                ),
                              },
                            })
                          }
                        />{" "}
                        Locked
                      </label>
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-remove`}
                        aria-label={`Remove feature ${index + 1}`}
                        onClick={() =>
                          changeSpace(item, {
                            state: {
                              ...space.state,
                              features: space.state.features.filter((entry) => entry.id !== feature.id),
                            },
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={space.state.features.length >= 5}
                    onClick={() =>
                      changeSpace(item, {
                        state: {
                          ...space.state,
                          features: [
                            ...space.state.features,
                            {
                              id: createVillagesClientId(),
                              text: "",
                              sourceCharacterId: "",
                              locked: false,
                              updatedAt: "",
                            },
                          ],
                        },
                      })
                    }
                  >
                    Add Feature
                  </button>
                </div>
              </details>
              <p className={`${ELEMENT_TAG}-hint`}>Structural improvements use two proposal slots per Venue.</p>
            </section>
          );
        })}
    </div>
  );
}

export function MailboxImprovementEditor({
  entry,
  onDecide,
}: {
  entry: VillageSnapshot["venueMail"][number];
  onDecide: (
    approved: boolean,
    value: { title: string; description: string; extraBeds: number; slot: number },
  ) => Promise<void>;
}) {
  const [title, setTitle] = useState(entry.improvement?.title ?? "");
  const [description, setDescription] = useState(entry.improvement?.description ?? "");
  const [extraBeds, setExtraBeds] = useState(entry.improvement?.extraBeds ?? 0);
  const [slot, setSlot] = useState(entry.improvementSlot ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const decide = (approved: boolean) => {
    setBusy(true);
    setError("");
    void onDecide(approved, { title, description, extraBeds, slot })
      .catch((cause) => setError(messageFrom(cause, "That Venue request could not be decided.")))
      .finally(() => setBusy(false));
  };
  const edited =
    title !== entry.improvement?.title ||
    description !== entry.improvement?.description ||
    extraBeds !== entry.improvement?.extraBeds ||
    slot !== entry.improvementSlot;
  return (
    <div className={`${ELEMENT_TAG}-field`}>
      <label className={`${ELEMENT_TAG}-label`}>
        Proposed improvement
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        What changes?
        <textarea
          className={`${ELEMENT_TAG}-textarea`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        Extra beds
        <input
          type="number"
          min={0}
          max={3}
          value={extraBeds}
          onChange={(event) => setExtraBeds(Number(event.target.value))}
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        Improvement slot
        <select value={slot} onChange={(event) => setSlot(Number(event.target.value))}>
          <option value={0}>Slot 1</option>
          <option value={1}>Slot 2</option>
        </select>
      </label>
      <div className={`${ELEMENT_TAG}-row`}>
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          disabled={busy || !title.trim() || !description.trim()}
          onClick={() => decide(true)}
        >
          {edited ? "Send counteroffer" : "Approve exact request"}
        </button>
        <button type="button" className={`${ELEMENT_TAG}-button`} disabled={busy} onClick={() => decide(false)}>
          Decline
        </button>
      </div>
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
