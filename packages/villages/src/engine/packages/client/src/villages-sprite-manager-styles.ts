export const SPRITE_MANAGER_STYLES = `
.marinara-capability-villages-sprite-manager-root { display: block; height: 100%; min-height: 0; overflow: auto; background: #29251f; padding: 0; }
.vsm {
  --sm-background: #29251f; --sm-panel: #37352b; --sm-text: #f2e9d8;
  --sm-muted: #c4c9aa; --sm-primary: #eadcc0; --sm-ink: #30261c;
  --sm-line: #71664f; --sm-hover: #494535;
  font-family: var(--font-sans, system-ui, sans-serif); font-size: .9rem; line-height: 1.4;
  color: var(--sm-text); background: var(--sm-background); container: sprite-manager / inline-size;
  min-width: 0; max-width: 100%; padding: 1rem; border-radius: 8px;
}
.vsm *, .vsm-dialog * { box-sizing: border-box; }
.vsm h2, .vsm h3, .vsm p, .vsm figure { margin: 0; }
.vsm h2, .vsm h3 { color: var(--sm-text); }
.vsm h2 { font-size: clamp(1.2rem, 3cqw, 1.6rem); }
.vsm h3 { font-size: 1rem; }
.vsm button, .vsm.vsm.vsm input, .vsm.vsm.vsm select, .vsm.vsm.vsm.vsm.vsm textarea {
  font: inherit; color: inherit; border: 1px solid var(--sm-line); border-radius: 8px;
  background: var(--sm-panel); padding: .6rem .75rem; min-height: 44px;
}
.vsm button { cursor: pointer; }
.vsm button:hover:not(:disabled) { background: var(--sm-hover); }
.vsm button:disabled { opacity: .5; cursor: default; }
.vsm.vsm :focus-visible { outline: 3px solid var(--sm-primary); outline-offset: 3px; }
.vsm .vsm-primary, .vsm .vsm-primary:hover:not(:disabled) { background: var(--sm-primary); color: var(--sm-ink); }
.vsm.vsm input::placeholder, .vsm.vsm textarea::placeholder { color: var(--sm-muted); }
.vsm-heading { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
.vsm-heading > div:first-of-type { flex: 1; min-width: 180px; }
.vsm-heading small { display: block; color: var(--sm-muted); margin-top: .3rem; }
.vsm-toolbar { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
.vsm-help { margin: .5rem 0 1rem; color: var(--sm-muted); font-size: .85rem; line-height: 1.6; }
.vsm summary { cursor: pointer; min-height: 44px; padding: .7rem 0; }
.vsm details > :not(summary) { margin-top: .65rem; }
.vsm-workspace { display: grid; grid-template-columns: minmax(170px, .7fr) minmax(0, 1.5fr) minmax(260px, 1fr); gap: .8rem; align-items: start; }
.vsm-panel { min-width: 0; border: 1px solid var(--sm-line); border-radius: 8px; padding: .85rem; display: grid; gap: .8rem; }
.vsm-artwork { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.vsm-artwork button { min-width: 0; padding: .3rem; text-align: left; overflow: hidden; }
.vsm-artwork button[aria-pressed=true] { border-color: var(--sm-primary); box-shadow: inset 0 0 0 2px var(--sm-primary); }
.vsm-artwork img { width: 100%; height: 140px; display: block; object-fit: contain; background: #201e29; border-radius: 5px; }
.vsm-artwork-name { display: block; padding: .4rem .1rem; font-size: .85rem; overflow-wrap: anywhere; }
.vsm-badges { display: flex; gap: .25rem; flex-wrap: wrap; font-size: .7rem; color: var(--sm-muted); }
.vsm-badges span { padding: .15rem .3rem; background: var(--sm-hover); border-radius: 4px; overflow-wrap: anywhere; }
.vsm-badges .vsm-default { background: var(--sm-primary); color: var(--sm-ink); }
.vsm-preview-head { display: flex; gap: .5rem; align-items: center; justify-content: space-between; flex-wrap: wrap; }
.vsm-toggle { display: flex; gap: 0; }
.vsm-toggle button { flex: 1; border-radius: 0; padding: .5rem .65rem; }
.vsm-toggle button:first-child { border-radius: 8px 0 0 8px; }
.vsm-toggle button:last-child { border-radius: 0 8px 8px 0; }
.vsm-toggle button[aria-pressed=true] { background: var(--sm-primary); color: var(--sm-ink); }
.vsm-scene { height: clamp(260px, 42cqw, 520px); border-radius: 6px; background: linear-gradient(#494535 0 85%, #373b2e 85%); display: flex; justify-content: center; overflow: hidden; }
.vsm-scene[data-mobile=true] { width: 70%; max-width: 230px; margin-inline: auto; }
.vsm-scene canvas { display: block; width: 66.6667%; height: 100%; object-fit: contain; object-position: center bottom; }
.vsm-scene[data-half=true] canvas { object-fit: cover; object-position: center top; }
.vsm-hint { color: var(--sm-muted); font-size: .8rem; line-height: 1.5; }
.vsm-comparison { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.vsm-comparison figure { min-width: 0; }
.vsm-comparison figcaption { color: var(--sm-muted); font-size: .8rem; margin-top: .4rem; }
.vsm-image { aspect-ratio: 2 / 3; position: relative; background: repeating-conic-gradient(#c4c9aa22 0 25%, transparent 0 50%) 0 0 / 16px 16px; overflow: hidden; }
.vsm-image canvas, .vsm-image img { display: block; width: 100%; height: 100%; object-fit: contain; }
.vsm-safe { position: absolute; inset: 2.083333% 3.125%; border: 1px dashed var(--sm-primary); pointer-events: none; }
.vsm-settings { display: grid; gap: 1rem; }
.vsm-settings section { display: grid; gap: .65rem; }
.vsm-settings section + section { border-top: 1px solid var(--sm-line); padding-top: 1rem; }
.vsm label { display: grid; gap: .35rem; font-size: .85rem; min-width: 0; }
.vsm.vsm.vsm input, .vsm.vsm.vsm select, .vsm.vsm.vsm textarea { width: 100%; min-width: 0; }
.vsm.vsm.vsm textarea { min-height: 84px; resize: vertical; }
.vsm.vsm.vsm input[type=range] { accent-color: var(--sm-primary); padding: 0; border: 0; background: transparent; }
.vsm-slider-label { display: flex; justify-content: space-between; gap: .5rem; }
.vsm-slider-label output { color: var(--sm-muted); font-variant-numeric: tabular-nums; }
.vsm-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.vsm-original { position: relative; max-width: 330px; width: 100%; margin-inline: auto; }
.vsm-original img { display: block; width: 100%; height: 100%; object-fit: contain; }
.vsm-source-crop { position: absolute; border: 2px solid var(--sm-primary); pointer-events: none; }
.vsm-marker { position: absolute; left: 0; right: 0; border-top: 2px dashed #e9b87c; pointer-events: none; }
.vsm-savebar { position: sticky; bottom: 0; z-index: 3; background: var(--sm-background); border-top: 1px solid var(--sm-line); margin-top: 1rem; padding: .75rem 0 max(.75rem, env(safe-area-inset-bottom)); display: grid; gap: .65rem; }
.vsm-save-row { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
.vsm-save-row > p { flex: 1; min-width: 120px; color: var(--sm-muted); font-size: .8rem; }
.vsm-more { position: relative; }
.vsm-more > summary { list-style: none; border: 1px solid var(--sm-line); border-radius: 8px; padding: .6rem .75rem; background: var(--sm-panel); }
.vsm-more > summary::-webkit-details-marker { display: none; }
.vsm-more-menu { position: absolute; bottom: 100%; right: 0; z-index: 5; width: 230px; background: var(--sm-background); border: 1px solid var(--sm-line); padding: .5rem; border-radius: 8px; display: grid; gap: .4rem; box-shadow: 0 4px 20px #17120c70; }
.vsm-more-menu button { width: 100%; text-align: left; }
.vsm-danger { color: #f3aaaa !important; }
.vsm-alert { padding: .7rem .8rem; border-left: 3px solid #e9b87c; background: #d99b4315; font-size: .85rem; line-height: 1.5; overflow-wrap: anywhere; }
.vsm-error { border-color: #f09090; }
.vsm-empty { padding: 2rem 1rem; text-align: center; line-height: 1.6; color: var(--sm-muted); }
.vsm-file { position: absolute; width: 1px !important; height: 1px; opacity: 0; pointer-events: none; }
.vsm-dialog { color: var(--sm-text); background: var(--sm-background); border: 1px solid var(--sm-line); border-radius: 8px; width: min(760px, calc(100vw - 24px)); max-height: calc(100dvh - 24px); padding: 1rem; }
.vsm-dialog::backdrop { background: #17120cb0; }
.vsm-dialog-header { display: flex; justify-content: space-between; gap: .5rem; align-items: center; margin-bottom: .8rem; }
.vsm-library { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .6rem; margin: .8rem 0; }
.vsm-library label { border: 1px solid var(--sm-line); padding: .5rem; border-radius: 8px; overflow-wrap: anywhere; }
.vsm-library img { width: 100%; height: 150px; object-fit: contain; }
.vsm.vsm.vsm .vsm-library input { width: auto; min-height: 24px; }
.vsm-dialog-footer { position: sticky; bottom: -1rem; background: var(--sm-background); padding: .75rem 0; display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
@container sprite-manager (max-width: 1099px) {
  .vsm-workspace { grid-template-columns: minmax(170px, .65fr) minmax(0, 1.7fr); }
  .vsm-gallery { grid-row: span 2; }
  .vsm-scene { height: 300px; }
}
@container sprite-manager (max-width: 719px) {
  .vsm-workspace { grid-template-columns: minmax(0, 1fr); }
  .vsm-gallery { grid-row: auto; }
  .vsm-artwork { display: flex; overflow-x: auto; scroll-snap-type: x proximity; padding: 3px; }
  .vsm-artwork button { flex: 0 0 105px; scroll-snap-align: start; }
  .vsm-artwork img { height: 80px; }
  .vsm-artwork-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .vsm-badges span { max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .vsm-panel { gap: .6rem; padding: .7rem; }
  .vsm-heading > div:first-of-type { min-width: 130px; }
  .vsm-help summary { min-height: 32px; padding: .35rem 0; }
  .vsm-scene { height: 230px; }
  .vsm-scene[data-mobile=true] { max-width: 170px; }
  .vsm-save-row > p { flex-basis: 100%; }
  .vsm-save-row > .vsm-primary { flex: 1; }
  .vsm-heading > .vsm-toolbar { width: 100%; }
  .vsm-heading > .vsm-toolbar button { flex: 1; }
}
@media (max-width: 420px) { .vsm { padding: .65rem; } }
@media (max-height: 480px) { .vsm-scene { height: 170px; } }
`;
