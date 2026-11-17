const levels = ["World", "Village", "Map", "Venue", "Zone"] as const;
const links = ["M144 16V76", "M144 76 106 106 87 136M106 106 125 136", "M144 76 182 106 163 136M182 106 201 136"];
const highlighted = { World: "", Village: "M144 16V46", Map: "M144 16V76" };

export function FoundingHierarchy({ current }: { current: keyof typeof highlighted }) {
  const active = levels.indexOf(current);
  return (
    <svg
      className="villages-founding-hierarchy"
      viewBox="0 0 222 152"
      role="img"
      aria-label={`World, Village, Map, Venue, Zone. Current layer: ${current}`}
    >
      <g className="villages-founding-hierarchy-links">
        {links.map((path) => (
          <path key={path} d={path} />
        ))}
        {highlighted[current] ? <path d={highlighted[current]} data-highlighted="true" /> : null}
      </g>
      {levels.map((level, index) => {
        const y = 16 + 30 * index;
        const stars = index < 3 ? [144] : index === 3 ? [106, 182] : [87, 125, 163, 201];
        return (
          <g key={level} data-active={index === active || undefined} data-ancestor={index < active || undefined}>
            <text x="9" y={y} dominantBaseline="central">
              {level}
            </text>
            {stars.map((x) => (
              <g key={x} transform={`translate(${x} ${y})`} className="villages-founding-hierarchy-star">
                <circle r={index === 4 ? 7.5 : 9} />
                <path d="M0-6Q1-1 6 0Q1 1 0 6Q-1 1-6 0Q-1-1 0-6Z" />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
