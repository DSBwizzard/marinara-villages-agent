export const APPEARANCE_STYLES = String.raw`
.villages-appearance {
  --appearance-ink: var(--foreground,#f0dfbc);
  --appearance-panel: var(--menu-project-panel,#393047);
  --appearance-line: var(--border,#a39b8460);
  --appearance-pick: var(--menu-tab-line,#d29399);
  --appearance-action: var(--menu-project-primary,#a7b097);
  --appearance-action-ink: var(--primary-foreground,#292938);
  color: var(--appearance-ink);
  font: 1rem/1.35 var(--menu-font,"village-letter-lora",Georgia,serif);
}
.villages-appearance {
  display:flex; flex-direction:column; container-type:inline-size; min-height:0;
  padding:clamp(.75rem,2vw,1.5rem); overflow:auto;
}
.villages-forging-card .villages-appearance {
  --appearance-ink:#f0dfbc; --appearance-panel:#393047; --appearance-line:#a39b8460;
  --appearance-pick:#d29399; --appearance-action:#a7b097; --appearance-action-ink:#292938;
  background:#302d47; height:100%;
}
.villages-appearance h2 { margin:.2rem 0 1rem; font:700 clamp(1.55rem,5cqw,2.65rem)/1.08 var(--menu-font,Georgia,serif); }
.villages-appearance :is(h3,h4,p) { margin:.25rem 0 .6rem; }
.villages-appearance :is(button,select) {
  color:var(--appearance-ink); background:transparent; border:1px solid var(--appearance-line); border-radius:.4rem;
  padding:.45rem .65rem; font:inherit; min-height:44px; cursor:pointer;
}
.villages-appearance :is(button,select):disabled { opacity:.56; cursor:default; }
.villages-appearance :is(button,select):focus-visible { outline:2px solid var(--appearance-pick); outline-offset:2px; }
.villages-appearance .appearance-link { border:0; padding-inline:.35rem; text-decoration:underline; text-underline-offset:.2em; }
.appearance-layout { display:grid; grid-template-columns:minmax(10rem,1fr) minmax(0,3fr); gap:.75rem; }
.appearance-sprite-body { min-height:0; overflow:auto; }
.appearance-mode { display:flex; max-width:33rem; margin-bottom:.7rem; }
.villages-appearance .appearance-mode button { flex:1; }
.villages-appearance .appearance-mode button[aria-pressed=true] { background:var(--menu-selected,#875363); }
.appearance-actions,.appearance-footer { display:flex; align-items:center; flex-wrap:wrap; gap:.55rem; margin:.7rem 0; }
.appearance-actions button:first-child:not(.appearance-link) { background:var(--appearance-panel); }
.appearance-expressions { display:grid; gap:.35rem; max-height:24rem; overflow:auto; padding:3px; }
.villages-appearance .appearance-expressions button {
  display:flex; flex-wrap:wrap; align-items:center; gap:.4rem; text-align:start; min-width:0;
}
.appearance-expressions span { flex:1; min-width:0; overflow-wrap:anywhere; }
.villages-appearance .appearance-expressions button[aria-pressed=true] { background:var(--menu-selected,#875363); }
.villages-appearance .appearance-expressions button[aria-pressed=true] {
  border-color:var(--appearance-pick); box-shadow:inset 0 0 0 1px var(--appearance-pick);
}
.appearance-expressions .appearance-expression-image { width:2.15rem; aspect-ratio:1; flex:none; overflow:hidden; border-radius:.3rem; }
.appearance-expression-image img { display:block; width:100%; height:100%; object-fit:contain; object-position:center top; transform:scale(2.65); transform-origin:50% 8%; }
.appearance-expressions small { color:var(--appearance-ink); opacity:.82; }
.appearance-preview { background:var(--appearance-panel); border:1px solid var(--appearance-line); border-radius:.65rem; padding:.75rem; min-width:0; }
.appearance-views { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.55rem; }
.appearance-view {
  display:flex; flex-direction:column; align-items:center; min-width:0;
  border:1px solid var(--appearance-line); border-radius:.45rem; padding:.35rem;
  text-align:center; background:color-mix(in srgb,#566a93 23%,transparent);
}
.appearance-full-sprite { display:block; width:100%; height:clamp(10rem,23dvh,20rem); object-fit:contain; }
.appearance-gallery { display:flex; gap:.35rem; max-width:100%; overflow-x:auto; padding:.25rem; }
.villages-appearance .appearance-gallery button { flex:0 0 5rem; min-width:0; padding:.3rem; font-size:.75rem; }
.appearance-gallery img { display:block; width:100%; height:3.4rem; object-fit:contain; }
.appearance-gallery span,.appearance-variant-name { overflow-wrap:anywhere; }
.villages-appearance .appearance-gallery button[aria-pressed=true] { border-color:var(--appearance-pick); background:var(--menu-selected,#875363); }
.appearance-portrait { display:grid; justify-items:center; }
.appearance-portrait > .marinara-capability-villages-avatar { width:min(100%,11rem); height:auto; aspect-ratio:1; border-radius:.45rem; }
.appearance-expression-fields { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.55rem; margin-bottom:.65rem; }
.appearance-footer { flex:none; padding:.35rem .15rem; border-radius:.4rem; background:var(--appearance-panel); }
.appearance-footer > span { margin-inline-end:auto; }
.villages-appearance button.appearance-primary {
  color:var(--appearance-action-ink); background:var(--appearance-action); padding-inline:1.2rem;
}
.villages-appearance dialog.appearance-picker[open] {
  position:fixed; inset:0; width:min(52rem,calc(100vw - 1.5rem)); height:fit-content; max-height:calc(100dvh - 1.5rem);
  margin:auto; padding:0; border:1px solid var(--appearance-line); border-radius:.65rem;
  background:var(--appearance-panel); color:var(--appearance-ink); font:inherit;
}
.appearance-picker::backdrop { background:#111426a8; }
.appearance-picker > header { display:flex; align-items:center; justify-content:space-between; gap:.5rem; }
.villages-appearance .appearance-picker > :is(header,footer) { background:transparent; padding:.75rem 1rem; }
.villages-appearance .appearance-picker > footer { align-items:center; justify-content:flex-end; }
.appearance-picker footer > span { margin-inline-end:auto; }
.villages-appearance .appearance-picker footer button { flex:none; }
.appearance-picker-body { min-height:0; overflow:auto; padding:0 1rem .65rem; }
.appearance-source { display:flex; flex-wrap:wrap; align-items:end; gap:.5rem; margin-bottom:.75rem; }
.villages-appearance .appearance-source label { display:grid; flex:1; gap:.25rem; margin:0; min-width:9rem; }
.villages-appearance .appearance-source select { width:100%; min-width:0; background:var(--appearance-panel); color-scheme:dark; }
.appearance-picker-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,7rem),1fr)); gap:.45rem; }
.villages-appearance .appearance-picker-grid label {
  position:relative; display:grid; align-content:start; gap:.3rem; margin:0; min-width:0; padding:.4rem;
  border:1px solid var(--appearance-line); border-radius:.4rem; cursor:pointer; overflow-wrap:anywhere;
}
.appearance-picker-grid input { position:absolute; top:.35rem; right:.35rem; width:1.1rem; height:1.1rem; accent-color:var(--appearance-pick); }
.appearance-picker-grid label:has(:checked) { border-color:var(--appearance-pick); background:var(--menu-selected,#875363); }
.appearance-picker-grid img { display:block; width:100%; height:7rem; object-fit:contain; }
.appearance-picker-grid :is(span,small) { text-align:center; font-size:.85rem; }
@container (max-width:34rem) {
  .appearance-layout { grid-template-columns:1fr; }
  .appearance-expressions { max-height:9rem; }
}
@container (max-width:21rem) { .appearance-views { grid-template-columns:1fr; } }
`;
