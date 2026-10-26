import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useEffect, useRef, useState } from "react";
import type { LoreDiagnostic, LoreInspection } from "../../../shared/contracts/lore.js";
export function VillagesRuntimeDebug() {
  const [settings, setSettings] = useState<{
    verbose: boolean;
    effective: boolean;
    engineEnabled: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lore, setLore] = useState<(LoreDiagnostic | LoreInspection)[]>([]);
  const [query, setQuery] = useState("");
  const [inspecting, setInspecting] = useState(false);
  const inspectionId = useRef(0);
  const inspectLore = async (test = false) => {
    const id = ++inspectionId.current;
    setInspecting(true);
    setError("");
    try {
      if (test) {
        const result = await request<{ report: LoreInspection }>("/debug/lore", {
          method: "POST",
          body: JSON.stringify({ query }),
        });
        if (id === inspectionId.current) setLore([result.report]);
      } else {
        const result = await request<{ reports: LoreDiagnostic[] }>("/debug/lore");
        if (id === inspectionId.current) setLore(result.reports);
      }
    } catch (cause) {
      if (id === inspectionId.current) setError(messageFrom(cause, "Lorebook inspection is unavailable."));
    } finally {
      if (id === inspectionId.current) setInspecting(false);
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    void request<{ verbose: boolean; effective: boolean; engineEnabled: boolean }>("/debug/runtime", {
      signal: controller.signal,
    })
      .then(setSettings)
      .catch((cause) => {
        if (!controller.signal.aborted) setError(messageFrom(cause, "Runtime logging settings could not be read."));
      });
    return () => {
      controller.abort();
    };
  }, []);
  const save = async (verbose: boolean) => {
    inspectionId.current++;
    setInspecting(false);
    setLore([]);
    const previous = settings;
    if (previous) setSettings({ ...previous, verbose, effective: verbose || previous.engineEnabled });
    setSaving(true);
    setError("");
    try {
      setSettings(await request("/debug/runtime", { method: "PATCH", body: JSON.stringify({ verbose }) }));
      if (!verbose) setLore([]);
    } catch (cause) {
      setSettings(previous);
      setError(messageFrom(cause, "Runtime logging settings could not be saved."));
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className={ELEMENT_TAG + "-panel"}>
      <label>
        <input
          autoComplete="off"
          type="checkbox"
          checked={settings?.verbose ?? false}
          disabled={!settings || saving}
          onChange={(event) => void save(event.currentTarget.checked)}
        />{" "}
        Verbose runtime logging
      </label>
      {settings ? (
        <p className={ELEMENT_TAG + "-status"} role="status">
          Terminal logging: {settings.effective ? "on" : "off"}
          {settings.engineEnabled ? " (also enabled by DEBUG_AGENTS)" : ""}.
        </p>
      ) : null}
      {settings?.verbose ? (
        <section aria-label="Lorebook inspection" style={{ display: "grid", gap: "0.5rem" }}>
          <h3>Lorebook inspection</h3>
          <button type="button" disabled={inspecting} onClick={() => void inspectLore()}>
            Refresh lore reports
          </button>
          <label className={ELEMENT_TAG + "-field"}>
            Test keys
            <input
              type="text"
              value={query}
              maxLength={2000}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </label>
          <button type="button" disabled={inspecting} onClick={() => void inspectLore(true)}>
            Test selection
          </button>
          {lore.map((report, index) => (
            <details key={index} open={index === 0}>
              <summary>
                {report.purpose} · {report.stage === "prompt" ? "Final prompt" : "Selection only"} · {report.budget}{" "}
                tokens
              </summary>
              {report.entries.length ? (
                <ul>
                  {report.entries.map((entry) => (
                    <li key={`${entry.bookId}:${entry.id}`} style={{ overflowWrap: "anywhere" }}>
                      {entry.name} ·{" "}
                      {
                        {
                          current: "Current message",
                          recent: "Recent shared dialogue",
                          setting: "Setting",
                          constant: "Constant",
                          none: "No match",
                        }[entry.match]
                      }{" "}
                      ·{" "}
                      {
                        {
                          included: "Included",
                          "no-match": "No key match",
                          conditions: "Secondary conditions not met",
                          disabled: "Disabled",
                          "folder-disabled": "Folder disabled",
                          unsupported: "Unsupported keys",
                          budget: "Over lore budget",
                          "entry-limit": "Entry limit",
                          "context-limit": "Removed for prompt space",
                        }[entry.status]
                      }
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{report.budget === 0 ? "Lore budget is zero." : "No eligible entries."}</p>
              )}
              {report.omittedDiagnostics ? <p>{report.omittedDiagnostics} additional entries</p> : null}
            </details>
          ))}
        </section>
      ) : null}
      {error ? (
        <p className={ELEMENT_TAG + "-status"} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
