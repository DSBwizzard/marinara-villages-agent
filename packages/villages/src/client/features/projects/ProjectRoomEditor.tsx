import { useEffect, useState } from "react";
import type { ProjectRoomEntry } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import type { DraftProjectRoomEdit } from "./useProjectWorkspaces.js";

export function ProjectRoomEditor({
  placeId,
  zoneId,
  editable,
  edits,
  onEdits,
}: {
  placeId: string;
  zoneId: string;
  editable: boolean;
  edits: DraftProjectRoomEdit[];
  onEdits(edits: DraftProjectRoomEdit[]): void;
}) {
  const [entries, setEntries] = useState<ProjectRoomEntry[] | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [addition, setAddition] = useState("");
  useEffect(() => {
    if (!editable) return;
    const controller = new AbortController();
    const path = "/projects/rooms/" + encodeURIComponent(placeId) + "/" + encodeURIComponent(zoneId);
    void request<{ entries: ProjectRoomEntry[] | null }>(path, { signal: controller.signal }).then(
      (result) => {
        if (!controller.signal.aborted) {
          if (result.entries) setEntries(result.entries);
          else setError("Visit this Zone to edit its current appearance.");
        }
      },
      (reason) => {
        if (!controller.signal.aborted) setError(messageFrom(reason, "Room details are unavailable."));
      },
    );
    return () => controller.abort();
  }, [placeId, zoneId, editable]);
  const local = edits.filter((edit) => edit.zoneId === zoneId);
  const entry = entries?.find((row) => row.id === selected);
  const pending = local.find((edit) => edit.entryId === selected);
  const queued = local.filter((edit) => edit !== pending || !editable || !entry);
  const undo = (edit: DraftProjectRoomEdit) => onEdits(edits.filter((row) => row !== edit));
  const update = (row: ProjectRoomEntry, text: string | null) => {
    const others = edits.filter((edit) => edit.entryId !== row.id);
    onEdits(text === row.text ? others : [...others, { zoneId, entryId: row.id, version: row.version, text }]);
  };
  return (
    <div className="vp-room-edits">
      {editable && error ? <p role="status">{error}</p> : null}
      {editable && !entries && !error ? <p role="status">Loading Room details…</p> : null}
      {editable && entries ? (
        <>
          <div className="vp-room-picker">
            {entries.length ? (
              <select aria-label="Room entry" value={selected} onChange={(event) => setSelected(event.target.value)}>
                <option value="">New detail</option>
                {entries.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.text.split(/\r?\n/u)[0].slice(0, 90)}
                  </option>
                ))}
              </select>
            ) : null}
            {entry ? (
              <button type="button" onClick={() => (pending ? undo(pending) : update(entry, null))}>
                {pending ? "Undo edit" : "Plan removal"}
              </button>
            ) : (
              <button
                type="button"
                disabled={!addition.trim()}
                onClick={() => {
                  onEdits([...edits, { zoneId, text: addition.trim() }]);
                  setAddition("");
                }}
              >
                Add detail
              </button>
            )}
          </div>
          {entry ? (
            <textarea
              autoComplete="off"
              aria-label="Room detail"
              rows={4}
              maxLength={16000}
              value={pending ? (pending.text ?? entry.text) : entry.text}
              readOnly={pending?.text === null}
              onChange={(event) => update(entry, event.target.value)}
            />
          ) : (
            <textarea
              autoComplete="off"
              aria-label="New Room detail"
              placeholder="New Room detail"
              rows={3}
              maxLength={16000}
              value={addition}
              onChange={(event) => setAddition(event.target.value)}
            />
          )}
        </>
      ) : null}
      {queued.length ? (
        <ul aria-label="Planned Room edits">
          {queued.map((edit, index) => (
            <li key={edit.entryId ?? index}>
              <span>{edit.text === null ? "Remove entry" : edit.text}</span>
              {editable ? (
                <button type="button" onClick={() => undo(edit)}>
                  Undo edit
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
