import type { ReactNode, Ref } from "react";

const art = "/api/capability-packages/villages/assets/mari-founding-";
export const foundingMariSprite = (pose: "neutral" | "happy" | "playful" | "looking-up") => art + pose + ".webp";

export function FoundingSpeaker({ pose }: { pose: Parameters<typeof foundingMariSprite>[0] }) {
  return (
    <strong className="villages-founding-speaker">
      <span aria-hidden="true">
        <img src={foundingMariSprite(pose)} alt="" />
      </span>
      Professor Mari
    </strong>
  );
}

export function FoundingGuide({
  children,
  pose = "neutral",
  replies,
  scene = false,
  inactive = false,
  lineRef,
}: {
  children: string;
  pose?: Parameters<typeof foundingMariSprite>[0];
  replies?: ReactNode;
  scene?: boolean;
  inactive?: boolean;
  lineRef?: Ref<HTMLParagraphElement>;
}) {
  const sprite = <img src={foundingMariSprite(pose)} alt="" />;
  return (
    <aside
      className={scene ? "villages-setting-guide villages-chapter-guide" : "villages-founding-guide"}
      aria-label="Professor Mari"
      aria-hidden={inactive || undefined}
      inert={inactive || undefined}
    >
      {scene ? (
        <div className="villages-setting-stage" aria-hidden="true">
          {sprite}
        </div>
      ) : (
        sprite
      )}
      <div className="villages-setting-dialogue">
        {scene ? <FoundingSpeaker pose={pose} /> : <strong>Professor Mari</strong>}
        <p ref={lineRef} tabIndex={lineRef ? -1 : undefined}>
          {children}
        </p>
        {replies ? <div className="villages-founding-replies">{replies}</div> : null}
      </div>
    </aside>
  );
}
