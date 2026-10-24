import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { useEffect, useState } from "react";
export function VillagesRuntimeDebug() {
  const [settings, setSettings] = useState<{
    verbose: boolean;
    effective: boolean;
    engineEnabled: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
    const previous = settings;
    if (previous) setSettings({ ...previous, verbose, effective: verbose || previous.engineEnabled });
    setSaving(true);
    setError("");
    try {
      setSettings(await request("/debug/runtime", { method: "PATCH", body: JSON.stringify({ verbose }) }));
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
      {error ? (
        <p className={ELEMENT_TAG + "-status"} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
