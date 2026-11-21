import { useState } from "react";
import type { ZoneLayout } from "../../../shared/helpers/zone-layout.js";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useLetterFont } from "../../shared/letter-font-css.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { ZoneMap } from "../../shared/ZoneMap.js";

export type SceneMoveZone = {
  id: string;
  label: string;
  connectedTo?: string[];
  status?: string;
  allowed?: boolean;
  canTrespass?: boolean;
  image?: string;
  companions?: { id: string; name: string; trespass?: true; staying?: true }[];
  automaticReactions?: boolean;
};
export function SceneMoveDialog({
  zones,
  positions,
  currentId,
  venueName,
  currentZoneLabel,
  trespassing,
  lighting,
  busy,
  onClose,
  onMove,
}: {
  zones: SceneMoveZone[];
  positions?: ZoneLayout;
  currentId?: string;
  venueName: string;
  currentZoneLabel: string;
  trespassing?: boolean;
  lighting: "day" | "night";
  busy: boolean;
  onClose(): void;
  onMove(id: string, trespass?: boolean): void;
}) {
  useLetterFont("lora");
  const [selected, setSelected] = useState<string | null>(null);
  const [trespass, setTrespass] = useState(false);
  const target = zones.find((zone) => zone.id === selected && zone.id !== currentId);
  return (
    <ModalDialog
      title="Move to Zone"
      onClose={onClose}
      className={`villages-scene-move villages-scene-move-${lighting}`}
      compact
      scrollBody
      headerContent={
        <div className="villages-scene-move-heading">
          <h3>Move</h3>
          <small>{venueName}</small>
        </div>
      }
    >
      <div className="villages-founding-editor-body">
        <p className="villages-scene-move-location">
          In {currentZoneLabel}
          {trespassing ? " · Trespassing" : ""}
        </p>
        <ZoneMap
          zones={zones.map((zone) => ({ ...zone, name: zone.label }))}
          positions={positions}
          angular
          artwork={(zone) => zone.image}
          currentId={currentId}
          selectedId={selected ?? currentId}
          disabled={busy}
          onSelect={(id) => {
            setSelected(id === currentId ? null : id);
            setTrespass(false);
          }}
          labels={(zone) => (
            <>
              <small
                data-zone-access={
                  zone.id === currentId
                    ? "current"
                    : zone.allowed
                      ? "allowed"
                      : zone.canTrespass
                        ? "trespass"
                        : "blocked"
                }
              >
                {zone.id === currentId ? "You are here" : (zone.status ?? "Unavailable")}
              </small>
              <span className={ELEMENT_TAG + "-visually-hidden"}>
                Connected to{" "}
                {contactNeighborIds(zones, zone.id)
                  .map((id) => zones.find((row) => row.id === id)?.label)
                  .join(", ") || "no other Zones"}
                .
              </span>
            </>
          )}
        />
        {target && (
          <div className="villages-scene-move-zone">
            {target.companions?.length ? (
              <div className="villages-scene-move-companions">
                {target.companions.some((row) => !row.staying) && (
                  <p>
                    Coming with you:{" "}
                    {target.companions
                      .filter((row) => !row.staying)
                      .map((row) => row.name + (row.trespass ? " (trespassing)" : ""))
                      .join(", ")}
                  </p>
                )}
                {target.companions.some((row) => row.staying) && (
                  <p>
                    Staying here:{" "}
                    {target.companions
                      .filter((row) => row.staying)
                      .map((row) => row.name)
                      .join(", ")}
                  </p>
                )}
              </div>
            ) : null}
            {target.allowed || (target.canTrespass && trespass) ? (
              <div className="villages-scene-move-confirm">
                <p>
                  {target.allowed ? `Move to ${target.label}?` : `Enter ${target.label} without permission?`}
                  {target.automaticReactions &&
                  (!target.allowed || target.companions?.some((row) => row.trespass && !row.staying)) ? (
                    <small>May start a GM response.</small>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (target.allowed) setSelected(null);
                    setTrespass(false);
                  }}
                >
                  Stay here
                </button>
                <button
                  type="button"
                  className="villages-scene-move-primary"
                  disabled={busy}
                  onClick={() => {
                    onClose();
                    onMove(target.id, target.allowed ? undefined : true);
                  }}
                >
                  {target.allowed ? "Move" : "Attempt entry"}
                </button>
              </div>
            ) : (
              <div className="villages-scene-move-confirm">
                <p>
                  <strong>{target.label}</strong>
                  {target.status && <small>{target.status}</small>}
                </p>
                {target.canTrespass && (
                  <button type="button" disabled={busy} onClick={() => setTrespass(true)}>
                    Trespass…
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
