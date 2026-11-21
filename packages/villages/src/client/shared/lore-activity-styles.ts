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
.villages-lore-chip{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;min-height:40px;padding:.35rem .65rem;border:1px solid var(--border);border-radius:.75rem;background:var(--popover);color:var(--foreground);font:inherit;cursor:pointer;box-shadow:0 .15rem .4rem #0002}
.villages-lore-chip svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linejoin:round;stroke-linecap:round}
.villages-lore-chip:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
.villages-founding-overlay>dialog.villages-lore-dialog{width:min(42rem,calc(100% - 2rem));max-height:calc(100% - 2rem);padding:0;overflow:hidden;background:var(--popover);color:var(--foreground);border:1px solid var(--border);font-family:"village-letter-lora",Georgia,serif}
.villages-lore-host .villages-lore-dialog>header{flex:none;display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;border-bottom:1px solid var(--border);margin:0;background:var(--popover);color:var(--foreground)}
.villages-lore-dialog>header h3{font-size:1.15rem;margin:0}
.villages-lore-host .villages-lore-dialog :is(button,select){background:var(--secondary);color:var(--foreground);border:1px solid var(--border);border-radius:.5rem;min-height:40px;font:inherit;padding:.4rem .65rem;cursor:pointer}
.villages-lore-host .villages-lore-dialog>header button{background:transparent}
.villages-lore-body{overflow:auto;min-height:0;padding:1rem;display:grid;gap:1rem;overscroll-behavior:contain}
.villages-lore-request{display:grid;gap:.35rem;font-size:.85rem}.villages-lore-request select{max-width:100%;width:100%}
.villages-lore-entries{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}
.villages-lore-entries>button{text-align:left;display:grid;gap:.2rem;overflow-wrap:anywhere}
.villages-lore-host .villages-lore-dialog .villages-lore-entries>button[aria-pressed=true]{background:var(--primary);color:var(--primary-foreground)}
.villages-lore-body>button{justify-self:start}
.villages-lore-entries small{font-size:.75rem;opacity:.85}
.villages-lore-entry{min-width:0;overflow-wrap:anywhere}.villages-lore-entry h3{font-size:1rem;margin:0 0 .5rem}
.villages-lore-text{white-space:pre-wrap;font-size:.95rem;line-height:1.55}
@container(max-width:620px){.villages-lore-chip{min-height:44px}.villages-lore-host .villages-lore-dialog :is(button,select){min-height:44px}.villages-lore-entries{grid-template-columns:minmax(0,1fr)}}
`;
