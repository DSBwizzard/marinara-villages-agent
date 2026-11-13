import { useEffect, useState } from "react";
import { villageLighting, type VillageLighting } from "../../shared/helpers/village-lighting.js";
import type { VillageSnapshot } from "../../shared/contracts/village.js";

export function useVillageLighting(
  village?: VillageSnapshot["village"],
  mode: "world" | "storybook" = "world",
): VillageLighting {
  const storybook = mode === "storybook";
  const sunriseHour = storybook ? 6 : undefined;
  const [lighting, setLighting] = useState<VillageLighting>(() =>
    village?.timeZone && Number.isFinite(Date.parse(village.instant))
      ? villageLighting(village.instant, village.timeZone, sunriseHour)
      : storybook
        ? villageLighting(new Date().toISOString(), undefined, sunriseHour)
        : "day",
  );
  useEffect(() => {
    const base = Date.parse(village?.instant ?? "");
    const useVillageTime = Number.isFinite(base) && !!village?.timeZone;
    if (!useVillageTime && !storybook) return;
    const began = performance.now();
    const update = () => {
      const now = useVillageTime ? base + (performance.now() - began) : Date.now();
      setLighting(
        villageLighting(new Date(now).toISOString(), useVillageTime ? village?.timeZone : undefined, sunriseHour),
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [village?.instant, village?.timeZone, storybook, sunriseHour]);
  return lighting;
}
