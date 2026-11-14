import { foundingMariSprite } from "./FoundingSettingScene.js";
import type { ReactNode } from "react";

export function FoundingGuide({
  children,
  pose = "neutral",
  replies,
}: {
  children: string;
  pose?: Parameters<typeof foundingMariSprite>[0];
  replies?: ReactNode;
}) {
  return (
    <aside className="villages-founding-guide" aria-label="Professor Mari" data-replies={!!replies || undefined}>
      <img src={foundingMariSprite(pose)} alt="" />
      <div className="villages-setting-dialogue">
        <strong>Professor Mari</strong>
        <p>{children}</p>
        {replies ? <div className="villages-founding-replies">{replies}</div> : null}
      </div>
    </aside>
  );
}
