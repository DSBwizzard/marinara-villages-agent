import { useState } from "react";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";

type VisualSetting = "spriteVariantsEnabled" | "spriteCardFlipEnabled" | "characterSpeechColors";
const controls: Array<{ key: VisualSetting; label: string }> = [
  { key: "spriteVariantsEnabled", label: "Random sprite variants" },
  { key: "spriteCardFlipEnabled", label: "Card-flip sprite changes" },
  { key: "characterSpeechColors", label: "Character chat colors" },
];

/** Mounted by the shell so a save retains ownership while navigating between settings pages. */
export function useSpriteVisualSettings({
  snapshot,
  setSnapshot,
  setBusy,
}: {
  snapshot: VillageSnapshot | null;
  setSnapshot: React.Dispatch<React.SetStateAction<VillageSnapshot>>;
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Partial<Record<VisualSetting, boolean>>>({});
  const [error, setError] = useState("");
  const lifetime = useVillageMutationLifetime(snapshot?.isFounded, setBusy);
  async function save(key: VisualSetting, value: boolean) {
    const claim = lifetime.begin();
    if (!claim) return;
    claim.onRetire = () => {
      setSaving(false);
      setDraft({});
    };
    setSaving(true);
    setBusy(true);
    setDraft({ [key]: value });
    setError("");
    try {
      const saved = await request<VillageSnapshot>("/settings", {
        method: "PATCH",
        body: JSON.stringify({ [key]: value }),
      });
      if (lifetime.owns(claim)) setSnapshot(saved);
    } catch (cause) {
      if (lifetime.owns(claim)) setError(messageFrom(cause, "That visual setting could not be saved."));
    } finally {
      if (lifetime.finish(claim)) {
        setSaving(false);
        setDraft({});
        setBusy(false);
      }
    }
  }
  return { snapshot, saving, draft, error, save };
}

export function SpriteVisualSettings({
  settings,
  disabled,
}: {
  settings: ReturnType<typeof useSpriteVisualSettings>;
  disabled: boolean;
}) {
  const { snapshot, saving, draft, error, save } = settings;
  if (!snapshot) return null;
  return (
    <section className={`${ELEMENT_TAG}-venue-card`} aria-label="Sprite and dialogue settings">
      {controls.map(({ key, label }) => (
        <label className={`${ELEMENT_TAG}-row`} key={key}>
          <input
            type="checkbox"
            autoComplete="off"
            checked={draft[key] ?? snapshot.settings[key] !== false}
            disabled={disabled || saving}
            onChange={(event) => void save(key, event.target.checked)}
          />
          {label}
        </label>
      ))}
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
