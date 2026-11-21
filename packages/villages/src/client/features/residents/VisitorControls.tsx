import { useEffect, useState } from "react";
import type { CatalogResponse, VillageSnapshot, VillageVisitorView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { useConfirmation } from "../../shared/confirmation.js";
import { ModalDialog } from "../../shared/ModalDialog.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { StorybookSearchIcon } from "../../shared/StorybookHeading.js";
import type { PortraitMap } from "../../shared/types.js";
import { AvatarFace, readPortraits } from "./ResidentPanels.js";
import type { ResidentsScreenController } from "./screen-contracts.js";

type VisitorPorts = Pick<ResidentsScreenController, "snapshot" | "setSnapshot">;

async function saveVisitor({ snapshot, setSnapshot }: VisitorPorts, id: string, enabled?: boolean) {
  const scope = snapshot.worldScope;
  const path = "/visitors/" + encodeURIComponent(id);
  const next = await request<VillageSnapshot>(path + (enabled === undefined ? "/move-in" : ""), {
    method: enabled === undefined ? "POST" : "PUT",
    body: JSON.stringify({ scope, enabled }),
  });
  setSnapshot((current) => (current?.worldScope === scope && next.worldScope === scope ? next : current));
}

export function AddVisitorDialog({
  snapshot,
  setSnapshot,
  scope,
  onClose,
}: VisitorPorts & { scope: HTMLElement; onClose(): void }) {
  const [catalog, setCatalog] = useState<CatalogResponse["characters"]>([]);
  const [choice, setChoice] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => (scope.clientWidth <= 700 ? 4 : 8));
  const [portraits, setPortraits] = useState<PortraitMap>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const observer = new ResizeObserver(() => setPageSize(scope.clientWidth <= 700 ? 4 : 8));
    observer.observe(scope);
    return () => observer.disconnect();
  }, [scope]);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setLoadError("");
    void request<CatalogResponse>("/catalog", { signal: abort.signal })
      .then((value) => {
        if (abort.signal.aborted) return;
        setCatalog(value.characters);
        void readPortraits(
          value.characters.map((card) => card.id),
          abort.signal,
        )
          .then((value) => {
            if (!abort.signal.aborted) setPortraits(value);
          })
          .catch(() => {});
      })
      .catch((cause) => {
        if (!abort.signal.aborted) setLoadError(messageFrom(cause, "Could not read Character Cards."));
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [snapshot.worldScope, reload]);
  const available = catalog.filter(
    (card) =>
      !card.inVillage &&
      !snapshot.visitors?.some((person) => person.characterId === card.id) &&
      !snapshot.villagers.some((person) => person.characterId === card.id) &&
      card.id !== snapshot.settings.playerPersonaId,
  );
  const selected = available.find((card) => card.id === choice);
  const matching = available.filter((card) =>
    card.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  return (
    <ModalDialog
      title="Add Visitor"
      scope={scope}
      className={`${ELEMENT_TAG}-visitor-picker`}
      onClose={onClose}
      dismissible={!busy}
      showCloseButton={!busy}
    >
      <form
        autoComplete="off"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!selected || loading || busy) return;
          setBusy(true);
          setError("");
          try {
            await saveVisitor({ snapshot, setSnapshot }, choice, true);
            onClose();
          } catch (cause) {
            setError(messageFrom(cause, "Could not add Visitor."));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className={`${ELEMENT_TAG}-visitor-picker-search`}>
          <label className={`${ELEMENT_TAG}-directory-search`}>
            <span className={`${ELEMENT_TAG}-sr-only`}>Find a Character Card</span>
            <StorybookSearchIcon />
            <input
              type="search"
              autoComplete="off"
              placeholder="Find a Character Card"
              value={search}
              disabled={busy}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
            />
          </label>
        </div>
        <div className={`${ELEMENT_TAG}-visitor-picker-body`} aria-busy={loading}>
          {loading ? (
            <p role="status">Reading Character Cards…</p>
          ) : loadError ? (
            <div>
              <p role="alert" className={`${ELEMENT_TAG}-dossier-warning`}>
                {loadError}
              </p>
              <button type="button" onClick={() => setReload((value) => value + 1)}>
                Retry cards
              </button>
            </div>
          ) : matching.length ? (
            <div className={`${ELEMENT_TAG}-visitor-picker-grid`} role="group" aria-label="Available Character Cards">
              {matching.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((card) => (
                <button
                  type="button"
                  key={card.id}
                  className={`${ELEMENT_TAG}-visitor-picker-card`}
                  aria-pressed={choice === card.id}
                  disabled={busy}
                  onClick={() => {
                    setChoice(card.id);
                    setError("");
                  }}
                >
                  <AvatarFace portrait={portraits[card.id]} name={card.name} className={`${ELEMENT_TAG}-avatar`} />
                  <span className={`${ELEMENT_TAG}-visitor-picker-name`}>{card.name}</span>
                  {choice === card.id ? (
                    <span className={`${ELEMENT_TAG}-visitor-picker-check`} aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <p role="status">
              {search.trim() ? "No matching Character Cards." : "No unused Character Cards available."}
            </p>
          )}
        </div>
        {pageCount > 1 && !loading && !loadError ? (
          <nav className={`${ELEMENT_TAG}-visitor-picker-pages`} aria-label="Character Card pages">
            <button
              type="button"
              aria-label="Previous Character Card page"
              disabled={busy || currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
            >
              ←
            </button>
            <span role="status">
              {currentPage + 1} / {pageCount}
            </span>
            <button
              type="button"
              aria-label="Next Character Card page"
              disabled={busy || currentPage + 1 === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              →
            </button>
          </nav>
        ) : null}
        {error ? (
          <p role="alert" className={`${ELEMENT_TAG}-dossier-warning`}>
            {error}
          </p>
        ) : null}
        <footer>
          {selected ? <span role="status">{selected.name} selected</span> : null}
          <button type="button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={!selected || loading || !!loadError || busy}>
            {busy ? "Adding…" : "Add Visitor"}
          </button>
        </footer>
      </form>
    </ModalDialog>
  );
}

export function VisitorProfileControls({
  person,
  snapshot,
  setSnapshot,
}: VisitorPorts & { person: VillageVisitorView }) {
  const confirm = useConfirmation(snapshot.worldScope + ":" + person.characterId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const visit = person.visit;
  const change = async (enabled?: boolean) => {
    setBusy(true);
    setError("");
    try {
      await saveVisitor({ snapshot, setSnapshot }, person.characterId, enabled);
    } catch (cause) {
      setError(messageFrom(cause, "Could not update Visitor."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {visit?.stayingWithPlayer ? <span role="status">Staying with you</span> : null}
      <button type="button" disabled={busy} onClick={() => void change(!person.visitsEnabled)}>
        {person.visitsEnabled ? "Turn visits off" : "Turn visits on"}
      </button>
      {person.met ? (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (await confirm(`Move ${person.name} into the Village?`, { cancel: "Cancel", confirm: "Move in" }))
              await change();
          }}
        >
          Move in
        </button>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </>
  );
}
