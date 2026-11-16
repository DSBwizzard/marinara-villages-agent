import { foundingMariSprite } from "./FoundingSettingScene.js";
import type { ReactNode } from "react";

export function FoundingGuide({
  children,
  pose = "neutral",
  replies,
  scene = false,
}: {
  children: string;
  pose?: Parameters<typeof foundingMariSprite>[0];
  replies?: ReactNode;
  scene?: boolean;
}) {
  const sprite = <img src={foundingMariSprite(pose)} alt="" />;
  return (
    <aside
      className={scene ? "villages-setting-guide villages-chapter-guide" : "villages-founding-guide"}
      aria-label="Professor Mari"
    >
      {scene ? (
        <div className="villages-setting-stage" aria-hidden="true">
          {sprite}
        </div>
      ) : (
        sprite
      )}
      <div className="villages-setting-dialogue">
        <strong>Professor Mari</strong>
        <p>{children}</p>
        {replies ? <div className="villages-founding-replies">{replies}</div> : null}
      </div>
    </aside>
  );
}
