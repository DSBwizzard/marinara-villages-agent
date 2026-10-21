import { useEffect, useRef, useState } from "react";
import { ModalDialog } from "./ModalDialog.js";
import { messageFrom, request } from "./api.js";
import { createVillagesClientId } from "./request-id.js";
import {
  residentBackgroundSourceKey,
  adaptationEmptyStatus,
  residentHistoryForOrigin,
  WORLD_ORIGINS,
  type ResidentFoundingContext,
  type BackgroundReview,
  type WorldOrigin,
} from "../../shared/helpers/resident-founding-context.js";

export type BackgroundSource = {
  founding?: boolean;
  playerPersonaId?: string;
  foundingCharacterIds?: string[];
  foundingResidentContexts?: Record<string, ResidentFoundingContext>;
  setting: string;
  premise: string;
  worldOrigin?: WorldOrigin | null;
  selectedLorebookIds?: string[];
  loreTokenBudget?: number;
};

/** Only deliberate selection, Propose and Try again dispatch generation. Opening saved drafts does not. */
export function ResidentBackgroundReview({
  name,
  characterId,
  context,
  source,
  onChange,
  onAccept,
  onCancel,
  initialRequest = false,
  disabled = false,
}: {
  name: string;
  characterId: string;
  context: ResidentFoundingContext;
  source: BackgroundSource;
  onChange(value: ResidentFoundingContext): void;
  onAccept(value: ResidentFoundingContext): void | Promise<void>;
  onCancel(): void;
  initialRequest?: boolean;
  disabled?: boolean;
}) {
  const review: BackgroundReview = context.integration ?? {
    text: context.villageBackstory || context.background || context.customDescription,
    direction: "",
    accepted: false,
  };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [customize, setCustomize] = useState(false);
  const mounted = useRef(true);
  const generation = useRef(0);
  const current = useRef({ context, source });
  current.current = { context, source };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const patch = (change: Partial<typeof review>) => {
    generation.current++;
    onChange({
      ...context,
      integration: {
        ...review,
        ...change,
        accepted: false,
        actionId: undefined,
        proposalReceived: false,
        sourceKey: undefined,
      },
    });
  };
  async function propose(reuse = false) {
    if (busy) return;
    const attempt = ++generation.current;
    const sourceKey = JSON.stringify(source);
    const actionId = reuse && review.actionId ? review.actionId : createVillagesClientId();
    const proposalFormat = reuse ? review.proposalFormat : ("adaptations-v1" as const);
    onChange({
      ...context,
      integration: { ...review, actionId, proposalReceived: false, proposalFormat, accepted: false },
    });
    setBusy(true);
    setError("");
    try {
      const result = await request<{ text: string }>("/villagers/background/draft", {
        method: "POST",
        body: JSON.stringify({
          ...source,
          characterId,
          actionId,
          retrieveOnly: reuse,
          proposalFormat,
          existingContext: {
            historyMode: context.historyMode,
            storyRole: context.storyRole,
            background: context.background,
            customDescription: context.customDescription,
            ...(context.villageBackstory !== undefined ? { villageBackstory: context.villageBackstory } : {}),
            ...(proposalFormat === "adaptations-v1" && review.text.trim()
              ? {
                  integration: { text: review.text.trim(), direction: "", accepted: true },
                }
              : {}),
          },
          direction: review.direction,
          ...(review.worldOrigin ? { worldOrigin: review.worldOrigin } : {}),
        }),
      });
      if (!mounted.current || attempt !== generation.current || sourceKey !== JSON.stringify(current.current.source))
        return;
      onChange({
        ...current.current.context,
        integration: {
          ...review,
          actionId,
          proposalFormat,
          proposalReceived: true,
          sourceKey: residentBackgroundSourceKey(source.setting, source.premise, source.worldOrigin),
          text: result.text,
          accepted: false,
        },
      });
    } catch (cause) {
      if (mounted.current && attempt === generation.current)
        setError(messageFrom(cause, "Could not propose adaptations. Edit them or try again."));
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  const started = useRef(false);
  useEffect(() => {
    if (initialRequest && !started.current && !context.integration) {
      started.current = true;
      void propose();
    }
  });
  return (
    <ModalDialog title={name + "’s life here"} onClose={onCancel} compact>
      <label style={{ display: "grid", gap: ".5rem" }}>
        Village adaptations
        <textarea
          autoComplete="off"
          aria-label={name + " Village adaptations"}
          placeholder="Only changes or additions needed for this Village. Leave blank if none."
          rows={6}
          maxLength={1200}
          value={review.text}
          disabled={disabled}
          onChange={(event) => patch({ text: event.target.value })}
        />
      </label>
      {adaptationEmptyStatus(
        review,
        residentBackgroundSourceKey(source.setting, source.premise, source.worldOrigin),
        "Accept without adaptations",
      ) ? (
        <p role="status">
          {adaptationEmptyStatus(
            review,
            residentBackgroundSourceKey(source.setting, source.premise, source.worldOrigin),
            "Accept without adaptations",
          )}
        </p>
      ) : null}
      {busy ? <p role="status">Proposing adaptations…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      <details open={customize} onToggle={(event) => setCustomize(event.currentTarget.open)}>
        <summary>Customize</summary>
        <label style={{ display: "grid", gap: ".5rem" }}>
          Origin
          <select
            aria-label={name + " origin"}
            value={review.worldOrigin ?? ""}
            disabled={busy || disabled}
            onChange={(event) => patch({ worldOrigin: (event.target.value as WorldOrigin) || undefined })}
          >
            <option value="">
              Village default{source.worldOrigin ? " · " + WORLD_ORIGINS[source.worldOrigin] : ""}
            </option>
            {Object.entries(WORLD_ORIGINS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", gap: ".5rem" }}>
          Direction
          <textarea
            autoComplete="off"
            aria-label={name + " backstory direction"}
            rows={2}
            maxLength={500}
            value={review.direction}
            disabled={busy || disabled}
            onChange={(event) => patch({ direction: event.target.value })}
          />
        </label>
      </details>
      <footer>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        {review.actionId && !review.proposalReceived ? (
          <button type="button" disabled={busy || disabled} onClick={() => void propose(true)}>
            Retrieve result
          </button>
        ) : null}
        <button type="button" disabled={busy || disabled || !source.setting.trim()} onClick={() => void propose()}>
          {review.actionId || review.text ? "Try again" : "Propose adaptations"}
        </button>
        <button
          type="button"
          disabled={busy || disabled}
          onClick={async () => {
            const origin = review.worldOrigin ?? source.worldOrigin;
            const accepted: ResidentFoundingContext = {
              ...context,
              historyMode: residentHistoryForOrigin(context, origin),
              integration: {
                ...review,
                worldOrigin: origin ?? undefined,
                sourceKey: residentBackgroundSourceKey(source.setting, source.premise, source.worldOrigin),
                text: review.text.trim(),
                accepted: true,
                historyPolicy: origin === "same-world" && review.text.trim() ? "adapted-v1" : undefined,
                reviewVersion: "adaptations-v1",
              },
            };
            setBusy(true);
            setError("");
            try {
              await onAccept(accepted);
            } catch (cause) {
              if (mounted.current) setError(messageFrom(cause, "Could not save these adaptations."));
            } finally {
              if (mounted.current) setBusy(false);
            }
          }}
        >
          Accept
        </button>
      </footer>
    </ModalDialog>
  );
}
