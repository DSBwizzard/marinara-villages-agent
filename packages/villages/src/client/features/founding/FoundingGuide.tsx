import { FoundingReader } from "./FoundingReader.js";
import type { ReactNode, Ref } from "react";

const art = "/api/capability-packages/villages/assets/mari-founding-";
export const foundingMariSprite = (
  pose: "neutral" | "happy" | "playful" | "looking-up" | "presenting" | "wave" | "thoughtful" | "happy-side" | "proud",
) => art + pose + ".webp";

export function FoundingGuide({
  children,
  replies,
  scene = false,
  inactive = false,
  lineRef,
}: {
  children: string;
  replies?: ReactNode;
  scene?: boolean;
  inactive?: boolean;
  lineRef?: Ref<HTMLParagraphElement>;
}) {
  return (
    <aside
      className={scene ? "villages-setting-guide villages-chapter-guide" : "villages-founding-guide"}
      aria-label="Professor Mari"
      aria-hidden={inactive || undefined}
      inert={inactive || undefined}
    >
      {scene ? null : <img src={foundingMariSprite("neutral")} alt="" />}
      <FoundingReader text={children} lineRef={lineRef} active={!inactive}>
        {replies ? <div className="villages-founding-replies">{replies}</div> : null}
      </FoundingReader>
    </aside>
  );
}
