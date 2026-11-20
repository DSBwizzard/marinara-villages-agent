import { useEffect, useRef, useState } from "react";
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
};
export type SceneMoveArrangement = {
  saving: boolean;
  error: string;
  onPositions(positions: ZoneLayout): void;
  onSave(): Promise<boolean>;
};

export function SceneMoveDialog({
  zones,
  positions,
  currentId,
  venueName,
  currentZoneLabel,
  trespassing,
  lighting,
  arrangement,
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
  arrangement?: SceneMoveArrangement;
  busy: boolean;
  onClose(): void;
  onMove(id: string, trespass?: boolean): void;
}) {
  useLetterFont("lora");
  const [selected, setSelected] = useState<string | null>(null);
  const [trespass, setTrespass] = useState(false);
  const [arrange, setArranging] = useState(false);
  const arranging = arrange && !!arrangement;
  const alive = useRef(true);
  const finishing = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const finish = async (close: boolean) => {
    if (finishing.current || arrangement?.saving) return;
    if (close && arrangement?.error) {
      onClose();
      return;
    }
    finishing.current = true;
    const saved = !arranging || !arrangement || (await arrangement.onSave());
    finishing.current = false;
    if (!alive.current || !saved) return;
    setArranging(false);
    if (close) onClose();
  };
  const target = zones.find((zone) => zone.id === selected && zone.id !== currentId);
  const disabled = busy || !!arrangement?.saving;
  return (
    <ModalDialog
      title="Move to Zone"
      onClose={() => void finish(true)}
      dismissible={!arrangement?.saving}
      className={`villages-scene-move villages-scene-move-${lighting}`}
      compact
      scrollBody
      headerContent={
        <>
          <div className="villages-scene-move-heading">
            <h3>Move</h3>
            <small>{venueName}</small>
          </div>
          {arrangement && (
            <button
              type="button"
              className="villages-scene-move-arrange"
              disabled={disabled}
              aria-pressed={arranging}
              onClick={() => {
                if (arranging) void finish(false);
                else {
                  setSelected(null);
                  setTrespass(false);
                  setArranging(true);
                }
              }}
            >
              {arrangement.saving ? "Saving…" : arranging ? "Done" : "Arrange"}
            </button>
          )}
        </>
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
          disabled={disabled}
          onPositions={arranging ? arrangement?.onPositions : undefined}
          onSelect={
            arranging
              ? undefined
              : (id) => {
                  setSelected(id === currentId ? null : id);
                  setTrespass(false);
                }
          }
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
        {arranging && <p className="villages-scene-move-location">Drag to arrange · Arrow keys to nudge</p>}
        {arrangement?.error && <p role="alert">{arrangement.error}</p>}
        {!arranging && target && (
          <div className="villages-scene-move-zone">
            {target.allowed || (target.canTrespass && trespass) ? (
              <div className="villages-scene-move-confirm">
                <p>{target.allowed ? `Move to ${target.label}?` : `Enter ${target.label} without permission?`}</p>
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
                  disabled={disabled}
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
                  <button type="button" disabled={disabled} onClick={() => setTrespass(true)}>
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
