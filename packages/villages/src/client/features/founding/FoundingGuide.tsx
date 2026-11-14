import { foundingMariSprite } from "./FoundingSettingScene.js";

export function FoundingGuide({ children, playful }: { children: string; playful?: boolean }) {
  return (
    <aside className="villages-founding-guide" aria-label="Professor Mari">
      <img
        src={playful ? foundingMariSprite("playful") : "/sprites/mari/basic/pose-wave.webp"}
        data-founding-sprite={playful || undefined}
        alt=""
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
      <div>
        <strong>Professor Mari</strong>
        <p>{children}</p>
      </div>
    </aside>
  );
}
