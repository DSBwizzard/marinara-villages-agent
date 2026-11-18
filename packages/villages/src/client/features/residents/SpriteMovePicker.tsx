import { useState } from "react";
import type { SpriteLibraryFolder, SpriteView } from "../../../shared/contracts/sprites.js";
import { ModalDialog } from "../../shared/ModalDialog.js";

type MoveSprite = {
  id: string;
  name: string;
  image: string;
  folderId?: string | null;
  unavailable: boolean;
};

export function SpriteMovePicker({
  sprites,
  folders,
  pending,
  uncertain,
  stale,
  error,
  onMove,
  onRetry,
  onReload,
  onClose,
}: {
  sprites: Record<SpriteView, MoveSprite[]>;
  folders: SpriteLibraryFolder[];
  pending: boolean;
  uncertain: boolean;
  stale: boolean;
  error: string;
  onMove(from: SpriteView, ids: Set<string>): void;
  onRetry(): void;
  onReload(): void;
  onClose(): void;
}) {
  const [view, setView] = useState<SpriteView>(sprites.front.length ? "front" : "side");
  const [folder, setFolder] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const locked = pending || uncertain;
  const visible = sprites[view].filter((sprite) => !folder || sprite.folderId === folder);
  const available = visible.filter((sprite) => !sprite.unavailable);
  const destination = view === "front" ? "Side" : "Front";
  const selected = checked.length;
  return (
    <ModalDialog
      title="Assign side-facing sprites"
      className="appearance-picker appearance-move-picker"
      scrollBody
      dismissible={!locked}
      showCloseButton={!locked}
      onClose={onClose}
    >
      <div className="appearance-picker-body">
        <div className="appearance-mode" role="group" aria-label="Current facing">
          {(["front", "side"] as const).map((facing) => (
            <button
              key={facing}
              type="button"
              aria-pressed={view === facing}
              disabled={locked}
              onClick={() => {
                if (view === facing) return;
                setView(facing);
                setFolder("");
                setChecked([]);
              }}
            >
              {facing === "front" ? "Front" : "Side"} ({sprites[facing].length})
            </button>
          ))}
        </div>
        <div className="appearance-source">
          {folders.some(({ id }) => sprites[view].some((sprite) => sprite.folderId === id)) ? (
            <label>
              Folder
              <select value={folder} disabled={locked} onChange={(event) => setFolder(event.target.value)}>
                <option value="">All sprites</option>
                {folders
                  .filter(({ id }) => sprites[view].some((sprite) => sprite.folderId === id))
                  .map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
              </select>
            </label>
          ) : null}
          {available.length > 0 ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => setChecked([...new Set([...checked, ...available.map(({ id }) => id)])])}
            >
              {folder ? "Select folder" : "Select all"}
            </button>
          ) : null}
        </div>
        {visible.length ? (
          <div className="appearance-picker-grid">
            {visible.map((sprite) => (
              <label key={sprite.id}>
                <input
                  type="checkbox"
                  checked={checked.includes(sprite.id)}
                  disabled={locked || sprite.unavailable}
                  onChange={(event) =>
                    setChecked((ids) =>
                      event.target.checked ? [...ids, sprite.id] : ids.filter((id) => id !== sprite.id),
                    )
                  }
                />
                {sprite.image ? <img src={sprite.image} alt="" loading="lazy" /> : null}
                <span>{sprite.name}</span>
                {sprite.unavailable ? <small>Unavailable</small> : null}
              </label>
            ))}
          </div>
        ) : (
          <p>No {view === "front" ? "Front" : "Side"} sprites.</p>
        )}
      </div>
      <footer>
        {error ? <p role="alert">{error}</p> : null}
        <span aria-live="polite">{selected} selected</span>
        <button type="button" disabled={locked} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="appearance-primary"
          disabled={pending || (!uncertain && !stale && (!selected || selected > 200))}
          onClick={uncertain ? onRetry : stale ? onReload : () => onMove(view, new Set(checked))}
        >
          {pending
            ? "Saving…"
            : uncertain
              ? "Retry save"
              : stale
                ? "Reload appearance"
                : `Move ${selected} to ${destination}`}
        </button>
      </footer>
    </ModalDialog>
  );
}
