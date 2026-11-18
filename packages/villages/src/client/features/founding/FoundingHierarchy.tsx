const levels = ["World", "Village", "Map", "Venue", "Zone"] as const;
const links = ["M116 16V76", "M116 76 88 106 70 136M88 106 99 136", "M116 76 144 106 133 136M144 106 162 136"];

export function FoundingHierarchy({ current }: { current: "World" | "Village" | "Map" }) {
  return (
    <svg
      className="villages-founding-hierarchy"
      viewBox="0 0 174 152"
      role="img"
      focusable="false"
      aria-label={`World, Village, Map, Venue, Zone. Current layer: ${current}`}
    >
      <g className="villages-founding-hierarchy-links">
        {links.map((path) => (
          <path key={path} d={path} />
        ))}
      </g>
      {levels.map((level, index) => {
        const y = 16 + 30 * index;
        const stars = index < 3 ? [116] : index === 3 ? [88, 144] : [70, 99, 133, 162];
        return (
          <g key={level} data-active={level === current || undefined}>
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
