import { ROMANCE_LIMIT } from "../../shared/contracts/relationships.js";

export const RELATIONSHIP_METER_STYLES = `      .villages-relationship-meters {display:grid;grid-template-columns:minmax(0,1fr);gap:.35rem .8rem;align-items:center;min-width:0;font-size:.9em}
      .villages-relationship-meters[data-labeled=true] {grid-template-columns:fit-content(45%) minmax(0,1fr);gap:.65rem 1rem;padding:.8rem;border-radius:.58rem;font-size:1.02em;background:rgba(169,147,185,.22)}
      [data-theme=day] .villages-relationship-meters[data-labeled=true] {background:rgba(220,239,232,.60)}
      .villages-relationship-bar {position:relative;height:.5rem;background:#1c192b;border-radius:3px}
      .villages-relationship-meters[data-labeled=true] .villages-relationship-bar {height:.96rem;border-radius:.46rem;overflow:hidden}
      .villages-relationship-bar > span {position:absolute;inset-block:0;background:#9ea680;border-radius:2px}
      .villages-relationship-bar > span[data-negative=true] {background:#c38887}
      .villages-relationship-bar::after {content:"";position:absolute;left:50%;inset-block:-2px;width:1px;background:#f0dfbc}
      .villages-romantic-interest {min-width:0;--heart-filled:#ed9db4;--heart-empty:transparent;--heart-outline:#d1a0b3}
      .villages-romantic-interest[data-negative=true] {--heart-filled:#ad93c8;--heart-outline:#c6b3dc}
      [data-theme=day] .villages-romantic-interest {--heart-filled:#9d3559;--heart-outline:#574055}
      [data-theme=day] .villages-romantic-interest[data-negative=true] {--heart-filled:#614477;--heart-outline:#584264}
      .villages-romantic-hearts {display:grid;grid-template-columns:repeat(10,minmax(0,1fr));inline-size:min(100%,10rem);min-width:0;container-type:inline-size;font:1rem/1 "Segoe UI Symbol","DejaVu Sans",sans-serif}
      .villages-romantic-hearts > span {justify-self:center;font-size:min(1rem,10cqi);color:var(--heart-empty);-webkit-text-stroke:.55px var(--heart-outline)}
      .villages-relationship-meters[data-labeled=true] .villages-romantic-hearts {inline-size:min(100%,15rem)}
      .villages-relationship-meters[data-labeled=true] .villages-romantic-hearts > span {font-size:min(1.5rem,10cqi);-webkit-text-stroke-width:.7px}
      .villages-romantic-hearts > [data-fill=full] {color:var(--heart-filled)}
      .villages-romantic-hearts > [data-fill=half] {background:linear-gradient(90deg,var(--heart-filled) 50%,var(--heart-empty) 50%);background-clip:text;color:transparent}
      .villages-romantic-interest[data-negative=true] [data-fill]:not([data-fill=empty]) {clip-path:polygon(0 0,48% 0,40% 39%,55% 46%,43% 82%,65% 41%,51% 34%,58% 0,100% 0,100% 100%,0 100%)}
`;

export function WarmthMeter({ score, target }: { score: number; target: string }) {
  return (
    <div
      className="villages-relationship-bar"
      role="meter"
      aria-label={"Warmth toward " + target}
      aria-valuemin={-100}
      aria-valuemax={100}
      aria-valuenow={score}
    >
      <span
        data-negative={score < 0}
        style={{ left: 50 + Math.min(0, score) / 2 + "%", width: Math.abs(score) / 2 + "%" }}
      />
    </div>
  );
}

export function RomanticInterest({ score, target }: { score: number; target: string }) {
  const magnitude = Math.abs(score);
  const value = score < 0 ? "−" + magnitude : score > 0 ? "+" + magnitude : "0";
  return (
    <div
      className="villages-romantic-interest"
      data-negative={score < 0}
      role="meter"
      aria-label={"Romantic interest toward " + target}
      aria-valuemin={-ROMANCE_LIMIT}
      aria-valuemax={ROMANCE_LIMIT}
      aria-valuenow={score}
      aria-valuetext={
        score < 0
          ? `${magnitude} of ${ROMANCE_LIMIT} aversion`
          : score > 0
            ? `${score} of ${ROMANCE_LIMIT} interest`
            : "Neutral"
      }
      title={value}
    >
      <div className="villages-romantic-hearts" aria-hidden="true">
        {Array.from({ length: ROMANCE_LIMIT / 2 }, (_, index) => {
          const filled = magnitude - index * 2;
          return (
            <span key={index} data-fill={filled >= 2 ? "full" : filled === 1 ? "half" : "empty"}>
              ♥
            </span>
          );
        })}
      </div>
    </div>
  );
}
