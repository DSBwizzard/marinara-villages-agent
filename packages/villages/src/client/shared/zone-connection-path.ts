import { ZONE_TILE, type ZoneLayout, type ZonePosition } from "../../shared/helpers/zone-layout.js";

/** Choose a short elbow route, preferring open lanes around the other boxes. */
export function zoneConnectionPath(layout: ZoneLayout, a: string, b: string): string {
  const { width, height } = ZONE_TILE;
  const rectangles = Object.values(layout);
  const ports = ({ x, y }: ZonePosition) => [
    { x, y: y + height / 2 },
    { x: x + width, y: y + height / 2 },
    { x: x + width / 2, y },
    { x: x + width / 2, y: y + height },
  ];
  const lanesX = [1, 99, ...rectangles.flatMap((p) => [p.x - 2, p.x + width + 2])].filter((x) => x > 0 && x < 100);
  const lanesY = [1, 99, ...rectangles.flatMap((p) => [p.y - 2, p.y + height + 2])].filter((y) => y > 0 && y < 100);
  let best: ZonePosition[] = [],
    bestScore = Infinity;
  for (const from of ports(layout[a]))
    for (const to of ports(layout[b])) {
      const routes = [
        [from, { x: to.x, y: from.y }, to],
        [from, { x: from.x, y: to.y }, to],
        ...[(from.x + to.x) / 2, ...lanesX].map((x) => [from, { x, y: from.y }, { x, y: to.y }, to]),
        ...[(from.y + to.y) / 2, ...lanesY].map((y) => [from, { x: from.x, y }, { x: to.x, y }, to]),
      ];
      for (const route of routes) {
        let score = route.length;
        for (let i = 1; i < route.length; i++) {
          const p = route[i - 1],
            q = route[i];
          score += Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
          for (const r of rectangles) {
            const crosses =
              p.x === q.x
                ? p.x >= r.x && p.x <= r.x + width && Math.max(p.y, q.y) > r.y && Math.min(p.y, q.y) < r.y + height
                : p.y >= r.y && p.y <= r.y + height && Math.max(p.x, q.x) > r.x && Math.min(p.x, q.x) < r.x + width;
            if (crosses) score += 10000;
          }
        }
        if (score > route.length && score < bestScore) {
          best = route;
          bestScore = score;
        }
      }
    }
  return best.map(({ x, y }) => `${x},${y}`).join(" ");
}
