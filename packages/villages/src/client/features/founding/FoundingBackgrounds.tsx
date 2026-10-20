import { useEffect, useRef, useState } from "react";
import { FoundingField, FoundingHelp } from "./FoundingField.js";
import { PlayerBackgroundFields } from "./villages-player-background.js";
import {
  residentHistoryForOrigin,
  DEFAULT_RESIDENT_FOUNDING_CONTEXT,
  residentBackgroundSourceKey,
  type ResidentFoundingContext,
} from "../../../shared/helpers/resident-founding-context.js";
import { request, messageFrom } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { BackgroundSource } from "../../shared/ResidentBackgroundReview.js";
type Props = {
  villageName?: string;
  people: { id: string; name: string }[];
  playerBackground: string;
  contexts: Record<string, ResidentFoundingContext>;
  source: BackgroundSource;
  disabled: boolean;
  onPlayer(value: string): void;
  onContexts(value: Record<string, ResidentFoundingContext>): void;
};
export function FoundingBackgrounds(props: Props) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const latest = useRef(props);
  latest.current = props;
  const first = props.people[0]?.id;
  const review = first ? props.contexts[first]?.integration : undefined;
  const actionId = review?.actionId?.startsWith("cast_") ? review.actionId : undefined;
  const key = (value: Props) =>
    JSON.stringify([
      value.people.map((person) => person.id).sort(),
      value.source.playerPersonaId,
      value.source.setting,
      value.source.premise,
      value.source.worldOrigin,
      value.source.selectedLorebookIds,
      value.source.loreTokenBudget,
      value.playerBackground,
      value.people.map((person) => [person.id, value.contexts[person.id]?.integration?.text ?? ""]),
    ]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // Abort display updates on unmount; a paid request remains retrievable from its saved identity.
  const generation = useRef(0);
  async function propose(retrieveOnly = false) {
    if (busy || !first) return;
    const original = props,
      sourceKey = key(original),
      turn = ++generation.current;
    const id = retrieveOnly && actionId ? actionId : "cast_" + createVillagesClientId();
    const context = props.contexts[first] ?? DEFAULT_RESIDENT_FOUNDING_CONTEXT;
    props.onContexts({
      ...props.contexts,
      [first]: {
        ...context,
        integration: {
          text: "",
          direction: "",
          accepted: false,
          ...context.integration,
          actionId: id,
          proposalReceived: false,
        },
      },
    });
    setBusy(true);
    setError("");
    try {
      const result = await request<{ text: string }>("/villagers/background/draft", {
        method: "POST",
        body: JSON.stringify({
          ...props.source,
          foundingCast: true,
          founding: true,
          actionId: id,
          retrieveOnly,
          playerBackground: props.playerBackground,
          foundingResidentContexts: props.contexts,
        }),
      });
      if (!mounted.current || turn !== generation.current || key(latest.current) !== sourceKey) return;
      const proposal = JSON.parse(result.text) as { player: string; residents: Record<string, string> };
      const contexts = { ...latest.current.contexts };
      for (const person of props.people) {
        const previous = contexts[person.id] ?? DEFAULT_RESIDENT_FOUNDING_CONTEXT;
        contexts[person.id] = {
          ...previous,
          historyMode: residentHistoryForOrigin(
            previous,
            previous.integration?.worldOrigin ?? props.source.worldOrigin,
          ),
          integration: {
            ...previous.integration,
            text: proposal.residents[person.id]!,
            direction: previous.integration?.direction ?? "",
            accepted: true,
            ...((previous.integration?.worldOrigin ?? props.source.worldOrigin)
              ? { worldOrigin: previous.integration?.worldOrigin ?? props.source.worldOrigin! }
              : {}),
            sourceKey: residentBackgroundSourceKey(
              props.source.setting,
              props.source.premise,
              props.source.worldOrigin,
            ),
            actionId: id,
            proposalReceived: true,
          },
        };
      }
      props.onPlayer(proposal.player);
      props.onContexts(contexts);
    } catch (cause) {
      if (mounted.current && turn === generation.current)
        setError(messageFrom(cause, "Could not propose backstories. Your edits are kept."));
    } finally {
      if (mounted.current && turn === generation.current) setBusy(false);
    }
  }
  return (
    <section className="villages-forging-card villages-cast-backgrounds" aria-label="Founding backstories">
      <div className="villages-life-heading">
        <h3>Life in {props.villageName?.trim() || "your Village"}</h3>
        <FoundingHelp label="Backstories">
          These backstories connect each person to {props.villageName?.trim() || "your Village"}. Use "Propose
          backstories" after adding the Villagers you want, and their narratives can intersect if appropriate.
        </FoundingHelp>
      </div>
      <PlayerBackgroundFields background={props.playerBackground} onChange={props.onPlayer} disabled={props.disabled} />
      {props.people.map((person) => (
        <FoundingField key={person.id} title={person.name + "’s backstory"}>
          <textarea
            autoComplete="off"
            aria-label={person.name + " backstory"}
            maxLength={1200}
            rows={3}
            value={props.contexts[person.id]?.integration?.text ?? ""}
            disabled={props.disabled}
            onChange={(event) => {
              const context = props.contexts[person.id] ?? DEFAULT_RESIDENT_FOUNDING_CONTEXT;
              props.onContexts({
                ...props.contexts,
                [person.id]: {
                  ...context,
                  historyMode: residentHistoryForOrigin(
                    context,
                    context.integration?.worldOrigin ?? props.source.worldOrigin,
                  ),
                  integration: {
                    text: event.target.value,
                    direction: context.integration?.direction ?? "",
                    accepted: !!event.target.value.trim(),
                    ...((context.integration?.worldOrigin ?? props.source.worldOrigin)
                      ? { worldOrigin: context.integration?.worldOrigin ?? props.source.worldOrigin! }
                      : {}),
                    sourceKey: residentBackgroundSourceKey(
                      props.source.setting,
                      props.source.premise,
                      props.source.worldOrigin,
                    ),
                  },
                },
              });
            }}
          />
        </FoundingField>
      ))}
      <button
        type="button"
        disabled={props.disabled || busy || !props.people.length || !props.source.playerPersonaId}
        onClick={() => void propose()}
      >
        {busy ? "Proposing…" : actionId ? "Try again" : "Propose backstories"}
      </button>
      {actionId && !review?.proposalReceived ? (
        <button type="button" disabled={props.disabled || busy} onClick={() => void propose(true)}>
          Retrieve result
        </button>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </section>
  );
}
