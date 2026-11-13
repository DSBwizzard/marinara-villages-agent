import { useEffect, useState } from "react";
import { villageLighting, type VillageLighting } from "../../shared/helpers/village-lighting.js";
import type { VillageSnapshot } from "../../shared/contracts/village.js";

export function useVillageLighting(village?: VillageSnapshot["village"], deviceFallback = false): VillageLighting {
  const [lighting, setLighting] = useState<VillageLighting>(() =>
    village?.timeZone && Number.isFinite(Date.parse(village.instant))
      ? villageLighting(village.instant, village.timeZone)
      : deviceFallback
        ? villageLighting(new Date().toISOString())
        : "day",
  );
  useEffect(() => {
    const base = Date.parse(village?.instant ?? "");
    const useVillageTime = Number.isFinite(base) && !!village?.timeZone;
    if (!useVillageTime && !deviceFallback) return;
    const began = performance.now();
    const update = () => {
      const now = useVillageTime ? base + (performance.now() - began) : Date.now();
      setLighting(villageLighting(new Date(now).toISOString(), useVillageTime ? village?.timeZone : undefined));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [village?.instant, village?.timeZone, deviceFallback]);
  return lighting;
}
