import { ELEMENT_TAG as P } from "./constants.js";
import { STORYBOOK_DAY_PALETTE, STORYBOOK_NIGHT_PALETTE } from "./desk-styles.js";
export const LORE_ACTIVITY_STYLES = `
.villages-lore-host{${STORYBOOK_NIGHT_PALETTE}position:relative;display:flex;flex-direction:column;height:100%;min-height:0;min-width:0;container-type:inline-size}
.villages-lore-host[data-daylight=true]{${STORYBOOK_DAY_PALETTE}}
.villages-lore-workarea{flex:1;min-height:0;min-width:0;overflow:hidden}
.villages-lore-host .${P}-home-full[data-mobile=true] .${P}-home-map-viewport{min-height:max(0px,calc(88px - var(--villages-exploration-inset,0px)))}
.villages-lore-global{position:absolute;z-index:25;right:1rem;bottom:1rem}
.villages-lore-chip-slot{display:contents}
.villages-founding-lore{position:absolute;z-index:25;top:4.5rem;left:1rem}.villages-founding-lore:empty{display:none}
.villages-lore-notice{position:relative;font-size:.8125rem}
.villages-lore-chip{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;min-height:40px;padding:.35rem .65rem;border:1px solid var(--border);border-radius:.65rem;background:var(--popover);color:var(--foreground);font:inherit;cursor:pointer;box-shadow:0 .25rem .75rem #0004}
.villages-lore-chip svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linejoin:round;stroke-linecap:round}
.villages-lore-chip:focus-visible,.villages-lore-popout button:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.villages-lore-popout{position:absolute;z-index:25;top:calc(100% + .5rem);left:0;width:min(20rem,calc(100vw - 2rem));max-height:max(5rem,calc(var(--villages-scene-visible-height,100cqh) - 12rem));overflow-y:auto;overscroll-behavior:contain;box-sizing:border-box;border:1px solid var(--border);border-radius:.75rem;background:var(--popover);color:var(--foreground);box-shadow:0 .75rem 2rem #0006;line-height:1.4}
.villages-lore-head{position:sticky;top:0;display:flex;justify-content:space-between;align-items:center;gap:.5rem;padding:.25rem .75rem;border-bottom:1px solid var(--border);background:var(--popover)}
.villages-lore-head h2{margin:0;font-size:.875rem}
.villages-lore-head button{min-width:44px;min-height:44px;background:transparent;color:inherit;border:0;font:inherit;cursor:pointer}
.villages-lore-popout ul{list-style:none;margin:0;padding:.5rem .75rem;display:grid;gap:.35rem;overflow-wrap:anywhere}
.villages-lore-popout p{margin:.75rem;overflow-wrap:anywhere}
.villages-lore-global .villages-lore-popout{top:auto;bottom:calc(100% + .5rem);left:auto;right:0}
@container(max-width:620px){.villages-lore-chip{min-height:44px}}
`;
