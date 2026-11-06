import { useEffect, useState } from "react";
import { villageLighting, type VillageLighting } from "../../shared/helpers/village-lighting.js";
import type { VillageSnapshot } from "../../shared/contracts/village.js";

export function useVillageLighting(village?: VillageSnapshot["village"]): VillageLighting {
  const [lighting, setLighting] = useState<VillageLighting>(() =>
    village?.timeZone ? villageLighting(village.instant ?? "", village.timeZone) : "day",
  );
  useEffect(() => {
    const base = Date.parse(village?.instant ?? "");
    if (!Number.isFinite(base) || !village?.timeZone) return;
    const began = performance.now();
    const update = () =>
      setLighting(villageLighting(new Date(base + (performance.now() - began)).toISOString(), village.timeZone));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [village?.instant, village?.timeZone]);
  return lighting;
}
