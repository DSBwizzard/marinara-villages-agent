import type { SpriteFacing } from "./villages-sprite-stage.js";
import { useLayoutEffect, useRef } from "react";

type SpriteFace = {
  url: string;
  facing: SpriteFacing;
  mirrored: boolean;
  view: "front" | "side";
};

/** Owns only the image's source, facing and rotation; the cast owns its position. */
export function CardFlipSprite({
  url,
  facing,
  mirrored,
  view,
  framing,
  enabled,
  animate,
  stepKey,
  onError,
}: SpriteFace & {
  framing: "full" | "half";
  enabled: boolean;
  animate: boolean;
  stepKey: string;
  onError: (url: string) => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  // React keeps the initial attributes stable; the effect owns later swaps so
  // a new render cannot reveal replacement artwork before the edge-on moment.
  const initial = useRef({ url, facing, mirrored, view });
  const shown = useRef(initial.current);
  const previousStep = useRef(stepKey);
  const errorHandler = useRef(onError);
  useLayoutEffect(() => {
    errorHandler.current = onError;
  });

  useLayoutEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const advanced = previousStep.current !== stepKey;
    previousStep.current = stepKey;
    const next = { url, facing, mirrored, view };
    const changed = shown.current.url !== url || shown.current.facing !== facing || shown.current.mirrored !== mirrored;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let rotation: Animation | undefined;
    const commit = () => {
      image.src = url;
      image.dataset.facing = view === "front" ? "front" : mirrored ? "left" : "right";
      shown.current = next;
    };
    const stop = () => {
      cancelled = true;
      rotation?.cancel();
      image.dataset.flipping = "false";
    };
    const reduceMotion = () => {
      if (motion.matches) {
        stop();
        commit();
      }
    };
    const turn = async () => {
      try {
        if (shown.current.url !== url) {
          const preload = new Image();
          await new Promise<void>((resolve, reject) => {
            preload.onload = () => resolve();
            preload.onerror = reject;
            preload.src = url;
          });
        }
        if (cancelled) return;
        const transform = (angle: number, mirror: boolean) =>
          `perspective(900px) rotateY(${angle}deg) scaleX(${mirror ? -1 : 1})`;
        image.dataset.flipping = "out";
        rotation = image.animate(
          [{ transform: transform(0, shown.current.mirrored) }, { transform: transform(90, shown.current.mirrored) }],
          { duration: 150, easing: "ease-in", fill: "forwards" },
        );
        await rotation.finished;
        if (cancelled) return;
        commit();
        rotation.cancel();
        image.dataset.flipping = "in";
        rotation = image.animate([{ transform: transform(-90, mirrored) }, { transform: transform(0, mirrored) }], {
          duration: 150,
          easing: "ease-out",
          fill: "forwards",
        });
        await rotation.finished;
        if (!cancelled) {
          rotation.cancel();
          image.dataset.flipping = "false";
        }
      } catch {
        if (!cancelled) {
          stop();
          errorHandler.current(url);
        }
      }
    };
    if (enabled && animate && advanced && changed && !motion.matches) void turn();
    else {
      commit();
      image.dataset.flipping = "false";
    }
    motion.addEventListener("change", reduceMotion);
    return () => {
      stop();
      motion.removeEventListener("change", reduceMotion);
    };
  }, [url, facing, mirrored, view, enabled, animate, stepKey]);

  return (
    <img
      ref={imageRef}
      src={initial.current.url}
      alt=""
      data-framing={framing}
      data-facing={initial.current.view === "front" ? "front" : initial.current.mirrored ? "left" : "right"}
      style={{ transformOrigin: "center bottom" }}
      onError={(event) => errorHandler.current(event.currentTarget.getAttribute("src") ?? url)}
    />
  );
}
