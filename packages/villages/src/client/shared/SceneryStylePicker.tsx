import { useEffect, useState } from "react";
import { request } from "./api.js";
import type { VillageImageStyleCatalog } from "../../shared/helpers/scenery-style.js";
export function SceneryStylePicker({
  profileId,
  onChange,
  asButtons,
}: {
  profileId: string | null;
  onChange(value: string | null): void;
  asButtons?: boolean;
}) {
  const [catalog, setCatalog] = useState<VillageImageStyleCatalog | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void request<VillageImageStyleCatalog>("/image-style-profiles", { signal: controller.signal })
      .then((value) => {
        if (
          !Array.isArray(value.profiles) ||
          typeof value.defaultProfileId !== "string" ||
          value.profiles.some((row) => typeof row.id !== "string" || typeof row.name !== "string")
        )
          throw new Error("Invalid Engine style catalog");
        if (!controller.signal.aborted) setCatalog(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, []);
  const missing = !!profileId && !catalog?.profiles.some((row) => row.id === profileId);
  const defaultName = catalog?.profiles.find((row) => row.id === catalog.defaultProfileId)?.name;
  const choices = [
    { id: "", name: defaultName ? `Engine default (${defaultName})` : "Engine default" },
    ...(catalog?.profiles ?? []),
    ...(missing ? [{ id: profileId!, name: catalog ? "Unavailable saved style" : "Saved Engine style" }] : []),
    { id: "@custom", name: "Custom description" },
  ];
  const selected = profileId === null ? "@custom" : profileId;
  const choose = (id: string) => onChange(id === "@custom" ? null : id);
  return (
    <>
      {asButtons ? (
        <div role="group" aria-label="Scenery style preset" className="villages-founding-tabs">
          {choices.map(({ id, name }) => (
            <button type="button" key={id} aria-pressed={id === selected} onClick={() => choose(id)}>
              {name}
            </button>
          ))}
        </div>
      ) : (
        <select aria-label="Scenery style preset" value={selected} onChange={(event) => choose(event.target.value)}>
          {choices.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      )}
      {failed ? <small>Styles unavailable</small> : null}
    </>
  );
}
