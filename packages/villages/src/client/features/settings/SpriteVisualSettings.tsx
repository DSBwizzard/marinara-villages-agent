import { useMemo, useState } from "react";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";

type VisualSetting = "spriteVariantsEnabled" | "spriteCardFlipEnabled" | "characterSpeechColors";
type VisualValues = Record<VisualSetting, boolean> & { menuAppearance: "auto" | "day" | "night" };
const controls: Array<{ key: VisualSetting; label: string; description: string }> = [
  {
    key: "spriteVariantsEnabled",
    label: "Random sprite variants",
    description: "Use different saved images for the same expression.",
  },
  {
    key: "spriteCardFlipEnabled",
    label: "Card-flip sprite changes",
    description: "Animate sprite changes with a card flip. Respects reduced motion.",
  },
  {
    key: "characterSpeechColors",
    label: "Character chat colors",
    description: "Use each character’s color for their dialogue.",
  },
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
  const [draft, setDraft] = useState<Partial<VisualValues>>({});
  const [error, setError] = useState("");
  const selection = useMemo(() => ({ scope: snapshot?.worldScope }), [snapshot?.worldScope]);
  const lifetime = useVillageMutationLifetime(snapshot?.isFounded, setBusy, selection);
  async function save<K extends keyof VisualValues>(key: K, value: VisualValues[K]) {
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
      <MenuAppearanceField settings={settings} disabled={disabled} />
      {controls.map(({ key, label, description }) => (
        <div key={key} className={`${ELEMENT_TAG}-visual-setting`}>
          <label className={`${ELEMENT_TAG}-row`}>
            <input
              type="checkbox"
              autoComplete="off"
              aria-describedby={`${ELEMENT_TAG}-${key}-help`}
              checked={draft[key] ?? snapshot.settings[key] !== false}
              disabled={disabled || saving}
              onChange={(event) => void save(key, event.target.checked)}
            />
            {label}
          </label>
          <small id={`${ELEMENT_TAG}-${key}-help`} className={`${ELEMENT_TAG}-hint`}>
            {description}
          </small>
        </div>
      ))}
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export function MenuAppearanceField({
  settings,
  disabled,
}: {
  settings: ReturnType<typeof useSpriteVisualSettings>;
  disabled: boolean;
}) {
  const { snapshot, saving, draft, save } = settings;
  if (!snapshot) return null;
  return (
    <div className={`${ELEMENT_TAG}-visual-setting`}>
      <label htmlFor={`${ELEMENT_TAG}-menu-appearance`}>Menu appearance</label>
      <select
        id={`${ELEMENT_TAG}-menu-appearance`}
        value={draft.menuAppearance ?? snapshot.settings.menuAppearance ?? "auto"}
        disabled={disabled || saving}
        onChange={(event) => void save("menuAppearance", event.target.value as VisualValues["menuAppearance"])}
      >
        <option value="auto">Day &amp; night</option>
        <option value="day">Day</option>
        <option value="night">Night</option>
      </select>
    </div>
  );
}
