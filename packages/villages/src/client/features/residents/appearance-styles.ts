export const APPEARANCE_STYLES = String.raw`
.villages-appearance,.villages-founding-dialog.appearance-picker {
  --appearance-ink: var(--foreground,#f0dfbc);
  --appearance-panel: var(--menu-project-panel,#393047);
  --appearance-line: var(--border,#a39b8460);
  --appearance-pick: var(--menu-tab-line,#d29399);
  --appearance-action: var(--menu-project-primary,#a7b097);
  --appearance-action-ink: var(--primary-foreground,#292938);
  color: var(--appearance-ink);
  font: 1rem/1.35 var(--menu-font,"village-letter-lora",Georgia,serif);
}
.villages-appearance { container-type:inline-size; min-height:0; padding:clamp(.75rem,2vw,1.5rem); overflow:auto; }
.villages-forging-card .villages-appearance {
  --appearance-ink:#f0dfbc; --appearance-panel:#393047; --appearance-line:#a39b8460;
  --appearance-pick:#d29399; --appearance-action:#a7b097; --appearance-action-ink:#292938;
  background:#302d47; height:100%;
}
.villages-appearance h2 { margin:.2rem 0 1rem; font:700 clamp(1.55rem,5cqw,2.65rem)/1.08 var(--menu-font,Georgia,serif); }
.villages-appearance :is(h3,h4,p) { margin:.25rem 0 .6rem; }
.villages-appearance button,.villages-founding-dialog.appearance-picker button,.appearance-picker select {
  color:var(--appearance-ink); background:transparent; border:1px solid var(--appearance-line); border-radius:.4rem;
  padding:.45rem .65rem; font:inherit; min-height:44px; cursor:pointer;
}
.villages-appearance button:disabled,.appearance-picker button:disabled { opacity:.56; cursor:default; }
.villages-appearance :is(button,input):focus-visible,.appearance-picker :is(label,button,select):focus-visible,
.appearance-picker label:focus-within { outline:2px solid var(--appearance-pick); outline-offset:2px; }
.villages-appearance .appearance-link,.villages-founding-dialog.appearance-picker .appearance-link {
  border:0; padding-inline:.35rem; text-decoration:underline; text-underline-offset:.2em;
}
.appearance-layout { display:grid; grid-template-columns:minmax(10rem,1fr) minmax(0,3fr); gap:.75rem; }
.appearance-mode { display:flex; max-width:33rem; margin-bottom:.7rem; }
.villages-appearance .appearance-mode button { flex:1; }
.villages-appearance .appearance-mode button[aria-pressed=true] { background:var(--menu-selected,#875363); }
.appearance-actions,.appearance-footer { display:flex; align-items:center; flex-wrap:wrap; gap:.55rem; margin:.7rem 0; }
.appearance-actions button:first-child:not(.appearance-link) { background:var(--appearance-panel); }
.appearance-expressions { display:grid; gap:.35rem; max-height:24rem; overflow:auto; padding:3px; }
.villages-appearance .appearance-expressions button {
  display:flex; align-items:center; gap:.4rem; text-align:start; min-width:0;
}
.appearance-expressions span { flex:1; min-width:0; overflow-wrap:anywhere; }
.villages-appearance .appearance-expressions button[aria-pressed=true] { background:var(--menu-selected,#875363); }
.villages-appearance .appearance-expressions button[aria-pressed=true],.appearance-picker label:has(input:checked) {
  border-color:var(--appearance-pick); box-shadow:inset 0 0 0 1px var(--appearance-pick);
}
.appearance-expressions img { width:1.6rem; height:1.6rem; flex:none; object-fit:contain; }
.appearance-expressions small { color:var(--appearance-ink); opacity:.82; }
.appearance-preview { background:var(--appearance-panel); border:1px solid var(--appearance-line); border-radius:.65rem; padding:.75rem; min-width:0; }
.appearance-views { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.55rem; }
.appearance-view {
  display:flex; flex-direction:column; align-items:center; min-width:0;
  border:1px solid var(--appearance-line); border-radius:.45rem; padding:.35rem;
  text-align:center; background:color-mix(in srgb,#566a93 23%,transparent);
}
.appearance-view img { width:100%; height:clamp(8rem,28cqw,22rem); object-fit:contain; }
.appearance-view > button:only-of-type:not(.appearance-link) { margin:auto .1rem; border:1px dashed var(--appearance-pick); }
.appearance-view-actions { display:flex; justify-content:center; flex-wrap:wrap; column-gap:.35rem; }
.appearance-portrait { display:grid; justify-items:center; }
.appearance-portrait > .marinara-capability-villages-avatar { width:min(100%,11rem); height:auto; aspect-ratio:1; border-radius:.45rem; }
.appearance-expression-fields { display:flex; align-items:end; flex-wrap:wrap; gap:.55rem; margin-bottom:.65rem; }
.villages-appearance .appearance-expression-fields label { display:grid; gap:.3rem; flex:1 1 11rem; min-width:0; margin:0; line-height:inherit; }
.appearance-expression-fields input { min-width:0; min-height:44px; color:var(--appearance-ink); background:transparent; border:1px solid var(--appearance-line); border-radius:.35rem; font:inherit; padding:.45rem; }
.appearance-footer > span { margin-inline-end:auto; }
.villages-appearance button.appearance-primary,.villages-founding-dialog.appearance-picker button.appearance-primary {
  color:var(--appearance-action-ink); background:var(--appearance-action); padding-inline:1.2rem;
}
.villages-founding-dialog.appearance-picker {
  width:min(53rem,calc(100vw - 1.5rem)); color:var(--appearance-ink); background:var(--appearance-panel);
  border:1px solid var(--appearance-line); box-shadow:0 .8rem 3rem #100a1a80;
}
.appearance-picker .appearance-actions select { width:auto; max-width:100%; color-scheme:dark; background:var(--appearance-panel); }
.appearance-picker-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,9rem),1fr)); gap:.6rem; }
.appearance-picker .appearance-picker-grid label {
  display:grid; gap:.35rem; border:1px solid var(--appearance-line); border-radius:.45rem; padding:.4rem;
  margin:0; cursor:pointer; min-width:0; overflow-wrap:anywhere;
}
.appearance-picker-grid img { width:100%; height:8rem; object-fit:contain; }
.appearance-picker-grid span { display:flex; align-items:center; gap:.35rem; }
.appearance-picker .appearance-picker-grid input { width:1rem; height:1rem; min-height:0; flex:none; accent-color:var(--appearance-pick); }
.appearance-set-folders { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.75rem; margin-bottom:.75rem; }
.appearance-set-folders select { background:var(--appearance-panel); color-scheme:dark; }
.appearance-pairs { width:100%; table-layout:fixed; border-collapse:collapse; }
.appearance-pairs th,.appearance-pairs td { padding:.35rem; text-align:center; border-bottom:1px solid var(--appearance-line); overflow-wrap:anywhere; }
.appearance-pairs th:first-child { text-align:start; }
.appearance-pairs img { display:block; width:100%; height:6rem; object-fit:contain; background:color-mix(in srgb,#566a93 23%,transparent); border-radius:.35rem; }
@container (max-width:34rem) {
  .appearance-layout { grid-template-columns:1fr; }
  .appearance-expressions { max-height:9rem; }
}
@media(max-width:480px) { .appearance-picker-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
`;
