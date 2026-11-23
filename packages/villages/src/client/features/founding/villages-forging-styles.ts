import { STORYBOOK_DAY_PALETTE, STORYBOOK_NIGHT_PALETTE } from "../../shared/desk-styles.js";

export const VILLAGES_FORGING_STYLES = `
.villages-forging-v2,.villages-forging-preparing {
  ${STORYBOOK_NIGHT_PALETTE}
  --menu-font:"village-letter-lora",Georgia,serif;
  --menu-card:var(--secondary); --menu-card-line:var(--menu-field-border);
  --menu-selected-border:var(--menu-tab-line); --menu-focus:#dca5ab; --menu-hover:#624553;
  --menu-option:var(--popover); --menu-placeholder:var(--muted-foreground);
  --founding-foreground:var(--foreground); --founding-muted:var(--muted-foreground);
  --founding-panel:var(--popover); --founding-card:var(--menu-card,var(--secondary));
  --founding-field:var(--menu-field); --founding-control:var(--secondary);
  --founding-line:var(--menu-card-line,var(--menu-field-border));
  --founding-selected:var(--menu-selected); --founding-selected-line:var(--menu-selected-border,var(--menu-tab-line));
  --founding-accent:var(--menu-focus,#efb6bc); --founding-focus:var(--menu-focus,#dca5ab);
  --founding-primary:var(--primary); --founding-on-primary:var(--primary-foreground);
  --founding-error:var(--destructive); --founding-hover:var(--menu-hover,var(--secondary));
  --founding-star:var(--popover); --founding-active:var(--foreground); --founding-inactive:var(--muted-foreground);
  --founding-active-star:#fff0c3; --founding-star-ring:#d9b77e; --founding-placeholder:#bdb0bd;
  --founding-chart:color-mix(in srgb,var(--popover) 75%,transparent);
  --founding-canvas:var(--background); --founding-overlay:#17102070;
  color-scheme:dark; font-family:var(--menu-font);
}
:is(.villages-forging-v2,.villages-forging-preparing)[data-lighting=day] {
  ${STORYBOOK_DAY_PALETTE}
  --founding-star:#21483e; --founding-star-ink:#d4e5de; --founding-active-star:#ffe3a0; --founding-placeholder:#5d7468;
  --founding-progress-line:#21483e; --founding-star-ring:#b69857;
  --founding-chart:var(--popover);
  --founding-overlay:#213e3633;
}

/* Extra scroll reach sits outside layout, so a keyboard cannot compress a form or its footer. */
.villages-forging-v2 { position:relative; isolation:isolate; container:founding-stage / size; }
.villages-forging-v2[data-founding-keyboard=true],.villages-forging-v2 dialog[data-founding-keyboard=true] { overflow:auto!important; }
.villages-forging-v2[data-founding-keyboard=true]::after,.villages-forging-v2 dialog[data-founding-keyboard=true]::after { content:""; position:absolute; top:var(--founding-scroll-end,100%); left:0; width:1px; height:var(--founding-keyboard-inset); pointer-events:none; }
.villages-forging-v2 .villages-founding-dialog[data-header-input]>header { display:flex; gap:.6rem; padding:0; background:transparent; align-items:center; }
.villages-founding-dialog[data-header-input]>header>input { flex:1; min-width:0; width:auto; margin:0; }
.villages-founding-dialog[data-header-input]>header>button { flex:none; width:44px; height:44px; padding:0; }
.villages-character-choice { border:1px solid var(--founding-line,#596b9b); background:var(--founding-control,#192c4c); color:var(--founding-foreground,#f3f3ff); }
.villages-forging-v2 .villages-character-add { flex:none; width:44px; height:44px; padding:0; border-radius:.4rem; font-size:.8rem; }
/* Helpers stay in the top layer, leaving form geometry unchanged. */
.villages-founding-help-popup { position:fixed; inset:auto; margin:0; max-width:calc(100vw - 32px); max-height:calc(100dvh - 32px); overflow:auto; box-sizing:border-box; padding:1rem; border:1px solid var(--founding-line,#596b9b); border-radius:.6rem; background:var(--founding-panel,#19213b); color:var(--founding-foreground,#f3f3ff); box-shadow:0 .5rem 2rem #0006; font:inherit; }
.villages-founding-help-popup:popover-open { display:block; }
.villages-founding-help-popup[data-mobile] { inset:0; margin:auto; width:min(28rem,calc(100vw - 32px)); height:fit-content; }
.villages-founding-help-popup[data-mobile]::backdrop { background:rgb(0 0 0 / 25%); }
.villages-founding-help-popup header { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin:0 0 .6rem; }
.villages-founding-help-popup header h3 { margin:0; font-size:1rem; }
.villages-founding-help-popup header button,.villages-forging-preparing button { flex:none; min-width:44px; min-height:44px; padding:.25rem; border:1px solid var(--founding-line,#596b9b); border-radius:.5rem; color:inherit; background:var(--founding-control,#192c4c); font:inherit; cursor:pointer; }
.villages-founding-help-popup [role=note] { font-size:.9rem; line-height:1.5; overflow-wrap:anywhere; }
.villages-life-heading { display:flex; align-items:center; gap:.2rem; }
.villages-forging-v2 .villages-life-heading h3 { margin:0; }
.villages-forging-v2 .villages-initial-residents { margin:1.4rem 0 .65rem; }
.villages-selected-villager { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:.4rem .65rem; padding:.5rem .65rem; }
.villages-selected-resident>.marinara-capability-villages-identity-card-face { flex:none; width:2.5rem; height:2.5rem; }
.villages-forging-v2 .villages-selected-resident { display:flex;align-items:center;gap:.65rem;flex:1;min-width:0;padding:0;border:0;background:transparent!important;text-align:left; }
.villages-selected-name { flex:1; min-width:0; overflow-wrap:anywhere; }
.villages-appearance-summary { display:block; color:var(--founding-muted,#d5dabc); font-size:.78rem; line-height:1.25; }
.villages-selected-labels { display:flex; flex-wrap:wrap; align-items:baseline; gap:.15rem .65rem; min-width:0; }
.villages-selected-labels>.villages-selected-name { flex:0 1 auto; max-width:100%; }
.villages-appearance-summary[data-no-sprites] { color:var(--founding-error,#ff929f); }
.villages-forging-v2 .villages-remove-resident { flex:none; min-width:44px; min-height:44px; padding:.25rem; border:0; background:transparent; color:var(--founding-accent,#c4a8ff); }
.villages-people-selected+button { width:100%; }
.villages-space-connections { min-width:0; max-width:100%; margin:.75rem 0; }
.villages-space-connections legend,.villages-space-connections li { overflow-wrap:anywhere; }
.villages-space-connections label { display:block; margin:.5rem 0; }
.villages-space-connections select { display:block; max-width:100%; width:100%; min-height:44px; }
.villages-space-connections button { min-height:44px; max-width:100%; white-space:normal; }
.villages-space-connections ul { padding-left:1.25rem; }
.villages-space-connections li { margin:.5rem 0; }

.villages-forging-v2 { display:flex; flex-direction:column; height:100%; max-height:100dvh; min-height:0; padding:0!important; overflow:hidden; color:var(--founding-foreground,#f3f3ff); background:var(--founding-panel,#121936); }
.villages-forging-v2 *, .villages-forging-editor * { box-sizing:border-box; }
.villages-forging-v2 h1 { font-size:1.25rem; margin:0; } .villages-forging-v2 h1 span { font-weight:400; }
.villages-forging-v2 h2 { font-size:1.65rem; margin:.2rem 0 .6rem; } .villages-forging-v2 h3 { margin:.1rem 0 .65rem; } .villages-forging-v2 h4 { margin:.1rem 0; }
.villages-forging-v2 p { line-height:1.5; margin:.5rem 0 .8rem; color:var(--founding-muted,#c1c9e9); overflow-wrap:anywhere; }
.villages-forging-v2 button { font:inherit; min-height:44px; border:1px solid var(--founding-line,#596b9b); border-radius:.5rem; color:var(--founding-foreground,#f3f3ff); background:var(--founding-control,#192c4c); padding:.55rem .8rem; cursor:pointer; }
.villages-forging-v2 button:disabled { opacity:.55; cursor:default; } .villages-forging-v2 button:focus-visible,.villages-forging-v2 summary:focus-visible { outline:3px solid var(--founding-focus,#c1acff); outline-offset:3px; }
.villages-forging-v2 button[aria-pressed=true],.villages-forging-v2 .villages-forging-primary { background:var(--founding-selected,#6650cf); border-color:var(--founding-selected-line,#9d88f4); }
.villages-forging-body { flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; padding:1rem 1.25rem 1.5rem; }
.villages-forging-kicker { font-size:.85rem; }
.villages-forging-columns { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:1rem; align-items:start; }
.villages-forging-spaces { grid-template-columns:minmax(0,1.45fr) minmax(0,1fr); }
.villages-forging-card { border:1px solid var(--founding-line,#43547d); border-radius:.8rem; padding:1rem; background:linear-gradient(135deg,var(--founding-panel,#192441),var(--founding-panel,#141b39)); min-width:0; margin-bottom:1rem; }
.villages-forging-card-heading { display:flex; justify-content:space-between; gap:.6rem; align-items:start; margin-bottom:.4rem; }
.villages-forging-card-heading h3 { flex:1; }
.villages-forging-v2 label { display:flex; flex-wrap:wrap; gap:.4rem; align-items:center; margin:.75rem 0; line-height:1.45; }
.villages-forging-v2 label>input:not([type=checkbox]),.villages-forging-v2 label>select,.villages-forging-v2 label>textarea,.villages-forging-v2 details>textarea { width:100%; min-width:0; min-height:44px; border:1px solid var(--founding-line,#65799c); border-radius:.45rem; padding:.6rem; color:var(--founding-foreground,#f3f3ff); background:var(--founding-field,#0c1830); font:inherit; }
.villages-forging-v2 textarea { resize:none; } .villages-forging-v2 input[type=checkbox] { width:1.2rem; height:1.2rem; }
.villages-forging-v2 details { margin:.7rem 0; border-top:1px solid var(--founding-line,#43547d); padding:.6rem 0; } .villages-forging-v2 summary { cursor:pointer; line-height:1.5; }
.villages-forging-actions { display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; margin:.6rem 0; }
.villages-forging-card figure { margin:0; } .villages-forging-card figcaption { color:var(--founding-muted,#c1c9e9); line-height:1.5; overflow-wrap:anywhere; }
.villages-forging-placement,.villages-forging-notice { background:var(--founding-panel,#29264f); border:1px solid var(--founding-line,#7d69c7); border-radius:.6rem; padding:.7rem; }
.villages-forging-map .marinara-capability-villages-setup-map-viewport { min-height:14rem; border:1px solid var(--founding-line,#5268a0); border-radius:.6rem; overflow:hidden; }
.villages-forging-map .marinara-capability-villages-stage { min-height:14rem; }
.villages-forging-venue { margin-top:.8rem; padding:.8rem; border:1px solid var(--founding-line,#43547d); border-radius:.6rem; background:var(--founding-panel,#192441); }
.villages-forging-editor { width:min(76rem,96vw); max-height:92dvh; }
.villages-forging-editor .villages-forging-editor-top { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; }
.villages-forging-editor .villages-forging-zone-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1rem; align-items:start; }
.villages-forging-zone-grid>section { min-width:0; border:1px solid var(--founding-line,#51688c); border-radius:.6rem; padding:.7rem; }
.villages-forging-editor img { max-width:100%; max-height:12rem; object-fit:contain; }
.villages-forging-editor .villages-forging-zone-grid label { display:block; }
.villages-forging-preparing { background:radial-gradient(circle at 50% 30%,var(--founding-panel,#29264f),var(--founding-panel,#121936) 70%)!important; color:var(--founding-foreground,#f3f3ff)!important; overflow:auto; }
.villages-forging-preparing>div { width:min(36rem,100%); box-sizing:border-box; }
.villages-forging-preparing progress { width:100%; height:1rem; accent-color:var(--founding-primary); }
.villages-forging-preparation-list { list-style:none; padding:0; text-align:left; }
.villages-forging-preparation-list li { padding:.8rem; margin:.6rem 0; border:1px solid var(--founding-line,#596b9b); border-radius:.5rem; }
.villages-forging-preparing details { text-align:left; border-top:1px solid var(--founding-line,#596b9b); padding:1rem 0; }
.villages-forging-v2 .villages-resident-help { font-size:.82rem; line-height:1.4; margin:.3rem 0; color:var(--founding-muted,#c1c9e9); }
.villages-resident-identity { display:flex; flex-direction:column; gap:.5rem; min-width:0; overflow-wrap:anywhere; }
.villages-resident-fields { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.1fr); gap:1rem; min-width:0; }
.villages-resident-choices { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.6rem; align-content:start; min-width:0; }
.villages-resident-custom { grid-column:1/-1; }
.villages-resident-toggle,.villages-mobile-role-toggle { display:none; }
.villages-admission-fields { display:grid; gap:.75rem; min-width:0; }
.villages-admission-fields>.villages-founding-field { margin:0; }
.villages-admission-heading { display:flex; align-items:center; gap:.4rem; min-width:0; margin-bottom:.3rem; }
.villages-admission-heading>label { flex:1; min-width:0; margin:0!important; }
.villages-admission-heading>.villages-founding-help { margin-right:auto; }
.villages-admission-heading>label:has(+.villages-founding-help) { flex:0 1 auto; }
.villages-admission-heading>button { flex:none; }
.villages-admission-add-note { justify-self:start; }
.villages-admission-fields input,.villages-admission-fields textarea { width:100%; min-width:0; box-sizing:border-box; font-size:1rem; }
.villages-resident-review { padding:.6rem 0; border-bottom:1px solid var(--founding-line,#43547d); overflow-wrap:anywhere; }
.villages-resident-review p { margin:.2rem 0; }
.villages-forging-v2 .villages-persona-preview { margin:.4rem 0; }
.villages-forging-v2 .marinara-capability-villages-founding-roster > p { display:none; }
.villages-forging-body[data-step="1"] .marinara-capability-villages-identity-strip { min-height:0; }
.villages-forging-body[data-step="1"] .marinara-capability-villages-identity-card { flex-direction:row; flex:0 0 auto; max-width:15rem; gap:.45rem; padding:.4rem; font-size:.9rem; }
.villages-forging-body[data-step="1"] .marinara-capability-villages-identity-card strong { max-width:10rem; white-space:normal; overflow-wrap:anywhere; text-align:left; }
.villages-forging-body[data-step="1"] .marinara-capability-villages-identity-card small { display:none; }
.villages-forging-body[data-step="1"] .marinara-capability-villages-identity-card-face { width:2rem; height:2rem; }
.villages-forging-body[data-step="1"] .marinara-capability-villages-founding-roster-grid { height:11rem; grid-auto-rows:3.25rem; }
.villages-forging-v2 .villages-people-connections details { margin:.5rem 0 0; padding:.4rem 0 0; }
@media(max-width:1000px) { .villages-forging-columns { grid-template-columns:minmax(0,1fr); } .villages-forging-editor .villages-forging-zone-grid { grid-template-columns:1fr; } .villages-resident-choices { grid-template-columns:1fr; } }
@media(max-width:704px) {
 .villages-forging-body { padding:.75rem; }
 .villages-forging-editor { width:100%; max-height:100dvh; } .villages-forging-editor .villages-forging-editor-top { grid-template-columns:1fr; }
  .villages-resident-identity,.villages-desktop-role-heading { display:none; }
 .villages-forging-v2 .villages-resident-toggle,.villages-forging-v2 .villages-mobile-role-toggle { display:flex; align-items:center; gap:.6rem; width:100%; min-width:0; text-align:left; }
 .villages-resident-toggle>span:nth-child(2) { flex:1; min-width:0; }
 .villages-resident-toggle strong,.villages-resident-toggle small { display:block; overflow-wrap:anywhere; }
 .villages-resident-toggle small { color:var(--founding-muted,#c1c9e9); font-size:.8rem; }
 .villages-resident-fields { grid-template-columns:1fr; gap:.8rem; padding-top:.8rem; }
 .villages-forging-v2 .marinara-capability-villages-founding-roster-card { font-size:.9rem; min-height:44px; }
 .villages-forging-v2 .marinara-capability-villages-founding-roster-card small { display:none; }
 .villages-forging-v2 .marinara-capability-villages-founding-roster-card strong { white-space:normal; overflow-wrap:anywhere; }
 .villages-forging-body[data-step="1"] .marinara-capability-villages-founding-roster-grid { grid-auto-rows:minmax(3.25rem,auto); }
}

.villages-forging-v2 { overscroll-behavior:contain; }
.villages-forging-v2 .villages-forging-body { flex:1; min-height:0; }
.villages-founding-field { min-width:0; margin:.75rem 0; }
.villages-forging-v2 .villages-founding-field-heading { position:relative; display:flex; align-items:center; flex-wrap:nowrap; min-width:0; }
.villages-forging-v2 .villages-founding-field-heading>label { margin:0; width:auto; min-width:0; flex:0 1 auto; }
.villages-forging-v2 .villages-founding-field>.villages-founding-field-description {
  margin:.15rem 0 .3rem; color:var(--muted-foreground); font-size:.85em; line-height:1.35;
}
.villages-founding-field>input,.villages-founding-field>textarea,.villages-founding-field>select,.villages-lorebook-inline .villages-lorebook-search { width:100%; min-width:0; min-height:44px; border:1px solid var(--border,var(--founding-line,#65799c)); border-radius:.45rem; padding:.6rem; color:var(--foreground,var(--founding-foreground,#f3f3ff)); background:var(--background,var(--founding-field,#0c1830)); font:inherit; }
.villages-founding-help { flex:none; display:inline-flex; align-items:center; flex-wrap:wrap; vertical-align:middle; max-width:100%; font-weight:400; }
.villages-founding-help>button { display:grid; place-items:center; width:44px; min-width:44px; height:44px; padding:0; border:0; background:transparent; color:inherit; }
.villages-founding-help>button>span { display:grid; place-items:center; width:18px; height:18px; border:1px solid currentColor; border-radius:50%; font:12px Arial,sans-serif; }
.villages-admission-fields .villages-founding-help>button { min-height:44px; padding:0; border:0; border-radius:0; background:transparent; }
.villages-forging-v2 [role=alert] { color:var(--founding-error,#ff9ba5); }
.villages-forging-v2 [aria-invalid=true] { border-color:var(--founding-error,#ff9ba5); }


/* People uses the same selected identity geometry on every device. */
.villages-people-identity { display:flex!important; align-items:center; gap:.65rem; text-align:left; width:100%; min-width:0; padding:.65rem!important; border-radius:.65rem!important; }
.villages-people-identity>span:nth-child(2) { display:flex; flex:1; flex-direction:column; min-width:0; gap:.15rem; }
.villages-people-identity strong { overflow-wrap:anywhere; }
.villages-people-identity small { display:block!important; color:var(--founding-muted,#c1c9e9); font-size:.8rem; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.villages-people-identity .marinara-capability-villages-identity-card-face { flex:none; width:2.5rem!important; height:2.5rem!important; }
.villages-people-identity[aria-pressed=true] { background:var(--founding-selected,#30305c)!important; border-color:var(--founding-selected-line,#aa87ff)!important; box-shadow:inset 0 0 0 1px var(--founding-selected-line,#aa87ff); }
.villages-people-action { flex:none; font-size:.8rem; color:var(--founding-accent,#c4a8ff); }
.villages-people-selected,.villages-people-choices { display:grid; gap:.5rem; margin:.5rem 0; }
.villages-selected-villager { min-width:0; border:1px solid var(--founding-line,#43547d); border-radius:.65rem; background:var(--founding-card,#19243f); }
.villages-forging-v2 .villages-selected-villager>.villages-people-identity { border:0; box-shadow:none; background:transparent!important; }
.villages-embedded-backstory { margin:0 .65rem; border-top:1px solid var(--founding-line,#596b9b); min-width:0; }
.villages-forging-v2 .villages-embedded-backstory .villages-backstory-row { flex-wrap:wrap; }
.villages-forging-v2 .villages-embedded-backstory label { margin:0; flex:none; font-size:.9rem; }
.villages-embedded-backstory .villages-backstory-row>select { flex:1; }
.villages-backstory-heading { display:flex; align-items:center; min-width:0; flex-basis:100%; position:relative; }
.villages-backstory-heading .villages-founding-help { width:44px; }

.villages-backstory-row>p[data-founding-problem] { flex-basis:100%; margin:.1rem 0 0; font-size:.85rem; line-height:1.4; }
.villages-embedded-backstory .villages-backstory-row>[data-founding-problem] { flex-basis:100%; }
@media(max-width:704px) {
 .villages-forging-v2 .villages-embedded-backstory .villages-backstory-row { display:grid; grid-template-columns:minmax(0,1fr) auto; }
 .villages-embedded-backstory .villages-backstory-heading { grid-column:1/-1; }
 .villages-embedded-backstory .villages-backstory-row>select { width:100%; }
 .villages-embedded-backstory .villages-backstory-row>[data-founding-problem] { grid-column:1/-1; }
}
.villages-backstory-row { display:flex; align-items:center; flex-wrap:wrap; gap:.5rem; margin:.5rem 0; padding:.5rem 0; min-width:0; }
.villages-backstory-row>span { display:flex; align-items:center; flex:1; min-width:5rem; gap:.5rem; overflow-wrap:anywhere; }
.villages-backstory-row .marinara-capability-villages-identity-card-face { width:2rem; height:2rem; flex:none; }
.villages-backstory-row>select { flex:1.7; min-width:0; width:auto; max-width:100%; min-height:44px; font:inherit; font-size:.9rem; color:var(--founding-foreground,#f3f3ff); background:var(--founding-panel,#141b39); border:1px solid var(--founding-line,#8574be); border-radius:.5rem; padding:.5rem; }
.villages-founding-dialog { position:fixed; box-sizing:border-box; width:min(30rem,calc(100vw - 1.5rem)); max-width:calc(100vw - 1.5rem); max-height:calc(100dvh - 1.5rem); margin:auto; padding:1rem; overflow:auto; overscroll-behavior:contain; color:var(--founding-foreground,#f3f3ff); background:var(--founding-panel,#141b39); border:2px solid var(--founding-selected-line,#9d78ed); border-radius:.8rem; box-shadow:0 1rem 4rem #0009; font:inherit; }
.villages-founding-dialog::backdrop { background:var(--founding-overlay,#090c1a99); }
.villages-founding-dialog * { box-sizing:border-box; }
.villages-founding-dialog header { display:flex; align-items:center; gap:.5rem; margin-bottom:.75rem; }
.villages-founding-dialog h3 { flex:1; margin:0; font-size:1.1rem; overflow-wrap:anywhere; }
.villages-founding-dialog button { min-height:44px; min-width:44px; font:inherit; border:1px solid var(--founding-line,#596b9b); border-radius:.5rem; color:var(--founding-foreground,#f3f3ff); background:var(--founding-control,#192c4c); padding:.5rem .7rem; cursor:pointer; }
.villages-founding-dialog button:disabled { opacity:.55; }
.villages-founding-dialog button:focus-visible { outline:3px solid var(--founding-focus,#c1acff); outline-offset:2px; }
.villages-founding-dialog input,.villages-founding-dialog textarea,.villages-founding-dialog select { display:block; width:100%; min-width:0; min-height:44px; font:inherit; font-size:1rem; color:var(--founding-foreground,#f3f3ff); background:var(--founding-field,#10172f); border:1px solid var(--founding-line,#8574be); border-radius:.5rem; padding:.55rem; }
.villages-founding-dialog textarea { resize:none; max-height:14rem; }
.villages-founding-dialog label { display:block; margin:.7rem 0 .35rem; }
.villages-founding-dialog p[role=alert] { color:var(--founding-error,#ffb9bc); }
.villages-founding-dialog footer { display:flex; justify-content:flex-end; gap:.5rem; padding-top:.75rem; }
.villages-founding-dialog .villages-forging-primary { background:var(--founding-selected,#6650cf); border-color:var(--founding-selected-line,#9d88f4); }

/* Backstory dialogs keep their content height on phones. */
.villages-forging-v2 .villages-founding-dialog[data-compact=true] { display:block; inset:0; width:min(26rem,calc(100vw - 2rem)); height:fit-content; min-height:0; max-height:calc(100dvh - 2rem); padding:.75rem; border:2px solid var(--founding-selected-line,#9d78ed); border-radius:.8rem; overflow:auto; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>header { padding:0; margin:0 0 .5rem; background:transparent; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>header h3 { margin:0; font-size:1rem; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>header button { flex:none; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>footer { padding:.65rem 0 0; background:transparent; flex-wrap:nowrap; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>footer button { flex:0 1 auto; white-space:nowrap; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true] button { padding:.4rem .65rem; min-height:44px; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true] textarea { min-height:6rem; max-height:12rem; }


.villages-founding-places { width:100%; min-width:0; }
.villages-map-panel { width:100%; margin:0; }
.villages-map-panel h3 { font-size:1rem; font-weight:400; margin:0 0 .65rem; }
.villages-place-panels { display:grid; grid-template-columns:minmax(0,1fr); min-width:0; }
.villages-place-panels .villages-forging-card h3 { font-size:1rem; font-weight:400; margin:0 0 .65rem; }
.villages-place-panels .villages-founding-field { margin:.6rem 0; }
.villages-place-panels .villages-founding-field+.villages-founding-field { border-top:1px solid var(--founding-line,#43547d); padding-top:.65rem; margin-top:.65rem; }
.villages-forging-v2 .villages-place-map-choice { display:flex; align-items:center; justify-content:space-between; gap:.65rem; width:100%; text-align:left; background:var(--founding-selected,#30305c); border-color:var(--founding-selected-line,#aa87ff); box-shadow:inset 0 0 0 1px var(--founding-selected-line,#aa87ff); border-radius:.65rem; padding:.65rem; }
.villages-forging-v2 .villages-founding-dialog[data-scroll-body=true] { display:flex; flex-direction:column; overflow:hidden; }
.villages-forging-v2 .villages-founding-dialog[data-scroll-body=true]>header { flex:none; }
.villages-forging-v2 .villages-founding-dialog[data-scroll-body=true]>footer { flex:none; margin-top:.65rem; border-top:1px solid var(--founding-line,#43547d); }
.villages-place-map-editor { min-width:0; padding:.15rem .2rem; }
.villages-map-sources { display:grid; gap:.5rem; }
.villages-map-sources>button { display:flex; align-items:center; gap:.75rem; width:100%; text-align:left; }
.villages-map-sources>button[aria-pressed=true] { background:var(--founding-selected,#30305c); border-color:var(--founding-selected-line,#aa87ff); }
.villages-map-source-indicator { display:block; width:1.3rem; height:1.3rem; flex:none; border:2px solid var(--founding-line,#91a5cf); border-radius:50%; }
.villages-map-sources>button[aria-pressed=true] .villages-map-source-indicator { background:var(--founding-selected,#9470ef); border-color:var(--founding-selected-line,#bb9cff); box-shadow:inset 0 0 0 3px var(--founding-selected,#30305c); }
.villages-map-source-title { display:block; }
.villages-map-sources small { display:block; color:var(--founding-muted,#b8c3e8); margin-top:.2rem; line-height:1.4; }
.villages-place-map-editor .villages-founding-field-heading label small { color:var(--founding-muted,#b8c3e8); font-size:.8rem; margin-left:.5rem; }
.villages-map-context { color:var(--founding-muted,#b8c3e8); font-size:.9rem; line-height:1.4; }
.villages-map-generate { width:100%; margin-top:.65rem; }
.villages-place-map-editor input[type=checkbox] { display:inline-block; width:1.2rem; min-height:0; vertical-align:middle; }



.villages-forging-v2 dialog.villages-workspace-sheet { inset:auto 1rem 1rem auto; margin:0; width:min(28rem,calc(100vw - 2rem)); height:min(26rem,65dvh); max-height:calc(100dvh - 1rem); padding:.75rem; padding-bottom:calc(32px + .45rem)!important; display:flex; flex-direction:column; gap:.25rem; border:1px solid var(--founding-line,#8574be); overflow:hidden; background:var(--founding-panel,#192441); }
.villages-forging-v2 dialog.villages-workspace-sheet:not([open]) { display:none; }
.villages-workspace-sheet::backdrop { background:var(--founding-overlay,#090c1a66); }
.villages-forging-v2 .villages-workspace-sheet .villages-workspace-title { flex:none; margin:0!important; padding:0 .1rem!important; color:var(--founding-muted,#c1cce5); font-size:.9rem; line-height:1.15; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.villages-forging-v2 .villages-workspace-sheet-header { flex:none; display:flex; flex-direction:column; align-items:stretch; gap:.35rem; padding:.5rem; border-radius:.65rem; margin:0!important; }
.villages-forging-v2 .villages-workspace-sheet .villages-workspace-caption { display:block; margin:0; padding:0; font-size:.7rem; line-height:1.2; color:var(--founding-muted,#c1cce5); }
.villages-workspace-box-field { min-width:0; }
.villages-workspace-box-field .villages-workspace-sheet-summary { margin-top:.15rem; }
.villages-workspace-venue-identity { margin-bottom:.4rem!important; }
.villages-workspace-zone-fields { margin-top:.4rem!important; }
.villages-forging-v2 .villages-workspace-sheet-header textarea { width:100%; min-width:0; min-height:44px; border:1px solid var(--founding-line,#65799c); border-radius:.45rem; padding:.4rem; color:var(--founding-foreground,#f3f3ff); background:var(--founding-field,#0c1830); font:inherit; resize:none; }
.villages-workspace-sheet-header>textarea { font-weight:700; }
.villages-workspace-sheet-header .villages-workspace-inline { flex:1; min-width:0; }
.villages-workspace-sheet-header input { font-weight:700; }
.villages-workspace-sheet-summary { flex:none; position:relative; display:flex; align-items:center; gap:.2rem; }
.villages-workspace-sheet-summary textarea { flex:1; min-width:0; }
.villages-workspace-inline { display:flex; align-items:center; flex-wrap:wrap; gap:.2rem; }
.villages-forging-v2 .villages-workspace-inline input { flex:1; width:0; padding:.2rem; background:transparent; border-color:transparent; }
.villages-forging-v2 .villages-workspace-inline input:focus { border-color:var(--founding-selected-line,#aa87ff); background:var(--founding-field,#10172f); }
.villages-forging-v2 .villages-workspace-inline button { padding:.25rem; border:0; background:transparent; color:var(--founding-accent,#c4a8ff); flex:none; }
.villages-workspace-inline p { width:100%; margin:.2rem 0; }
.villages-workspace-tabs { display:flex; flex:none; border-bottom:1px solid var(--founding-line,#596b9b); }
.villages-forging-v2 .villages-workspace-tabs button { flex:1; min-width:0; border:0; border-radius:0; background:transparent; min-height:30px; padding:.1rem .2rem; line-height:1.15; color:var(--founding-muted,#c1cce5); font-size:.8rem; }
.villages-forging-v2 .villages-workspace-tabs button[aria-selected=true] { color:var(--founding-accent,#c4a8ff); border-bottom:3px solid var(--founding-selected-line,#aa87ff); }
.villages-forging-v2 .villages-workspace-sheet .villages-founding-help>button { display:grid; place-items:center; width:44px; min-width:44px; height:44px; min-height:44px; padding:0; border:0; border-radius:0; background:transparent; color:inherit; box-shadow:none; }
.villages-workspace-sheet .villages-founding-field-heading,.villages-workspace-sheet .villages-workspace-purpose,.villages-workspace-sheet .villages-workspace-inclusion,.villages-workspace-sheet-body section { position:relative; }
.villages-forging-v2 .villages-workspace-purpose-input { width:100%; min-width:0; min-height:44px; margin:.35rem 0; padding:.4rem; border:1px solid var(--founding-line,#65799c); border-radius:.45rem; color:var(--founding-foreground,#f3f3ff); background:var(--founding-field,#0c1830); font:inherit; resize:none; }
.villages-workspace-sheet-body { flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; padding:.25rem .1rem; }
.villages-workspace-inclusion { display:flex; align-items:center; justify-content:flex-start; }
.villages-workspace-purpose { color:var(--founding-muted,#c1cce5); display:flex; align-items:center; justify-content:space-between; margin:0 0 .35rem; }
.villages-workspace-sheet .villages-founding-field { margin:.35rem 0; }
.villages-workspace-sheet .villages-founding-field-heading { font-size:.85rem; }
.villages-forging-v2 .villages-workspace-sheet .villages-workspace-included { display:flex; align-items:center; gap:.4rem; margin:0; font-size:.85rem; }
.villages-forging-v2 .villages-workspace-included input { width:1.2rem; min-height:1.2rem; height:1.2rem; accent-color:var(--founding-selected-line,#aa87ff); }
.villages-workspace-sheet .villages-workspace-artwork { margin:.4rem 0; font-size:.9rem; }
.villages-forging-v2 .villages-workspace-image-preview,.villages-workspace-image-placeholder { display:block; width:8rem; height:5rem; margin:.6rem auto; padding:.2rem; border:1px solid var(--founding-line,#65799c); border-radius:.45rem; background:var(--founding-field,#0c1830); }
.villages-workspace-image-placeholder { text-align:center; align-content:center; font-size:.75rem; color:var(--founding-muted,#c1cce5); }
.villages-workspace-image-preview img { width:100%; height:100%; object-fit:contain; }
.villages-workspace-image-viewer { position:fixed; inset:0; margin:auto; width:fit-content; max-width:90vw; max-height:90dvh; padding:.5rem; border:1px solid var(--founding-line,#8574be); border-radius:.6rem; background:var(--founding-field,#10172f); color:var(--founding-foreground,#f3f3ff); }
.villages-workspace-image-viewer::backdrop { background:var(--founding-overlay,#090c1acc); }
.villages-workspace-image-viewer img { display:block; max-width:85vw; max-height:80dvh; object-fit:contain; }
.villages-workspace-image-viewer button { display:block; margin:0 0 .4rem auto; min-height:32px; padding:.25rem .5rem; border:1px solid var(--founding-line,#65799c); border-radius:.4rem; background:var(--founding-control,#192c4c); color:inherit; }
.villages-workspace-image-actions { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.35rem; margin-top:.35rem; }
.villages-forging-v2 .villages-workspace-image-actions button { min-width:0; min-height:44px; padding:.25rem; font-size:.75rem; line-height:1.2; }
.villages-forging-v2 .villages-workspace-sheet-footer { position:absolute; bottom:0; left:0; right:0; flex:none; display:block!important; border-top:1px solid var(--founding-line,#43547d); padding:.2rem .75rem!important; margin:0!important; min-height:0; background:var(--founding-control,#192c4c); }
.villages-workspace-sheet-footer p { font-size:.75rem; color:var(--founding-muted,#c1cce5); text-align:center; margin:0 0 .25rem; }
.villages-workspace-sheet-footer>div { display:flex; justify-content:flex-end; gap:.5rem; }
.villages-forging-v2 .villages-workspace-sheet-footer button { flex:none; width:auto; min-width:0; min-height:32px; padding:.15rem .65rem; font-size:.8rem; line-height:1.2; white-space:nowrap; }
.villages-workspace-tray { display:flex; overflow-x:auto; gap:.6rem; }
.villages-forging-v2 .villages-workspace-tray button { flex:0 0 5rem; font-size:.8rem; padding:.4rem; }
.villages-workspace-tray .villages-workspace-photo { display:block; margin:0 auto .3rem; }
@media(max-width:727px) { .villages-forging-v2 dialog.villages-workspace-sheet { inset:auto 0 0; width:100%; max-width:100%; height:min(31rem,70dvh); border-radius:1rem 1rem 0 0; padding:.35rem .75rem max(.35rem,env(safe-area-inset-bottom)); } }

/* Venues shares the earlier founding panels and document scrolling. */
.villages-workspace { min-width:0; }
.villages-workspace [hidden] { display:none!important; }
.villages-workspace-toolbar { display:flex; align-items:center; justify-content:flex-start; margin:.65rem 0; padding-bottom:1.2rem; }
.villages-workspace-toolbar strong { display:flex; flex-direction:column; font-weight:400; }
.villages-workspace-toolbar h3 { margin:0 0 .3rem; }
.villages-workspace-summary { color:var(--muted-foreground); font-size:.9rem; }
.villages-workspace-detail-heading { display:flex; align-items:center; gap:.75rem; }
.villages-workspace-detail-heading h3 { margin:0; }
.villages-forging-v2 .villages-workspace-move { width:100%; margin-top:.65rem; }
.villages-workspace-toolbar small { position:absolute; bottom:0; left:0; color:var(--muted-foreground); }
.villages-workspace-map { min-width:0; }
.villages-workspace-map .marinara-capability-villages-setup-map-viewport,.villages-workspace-map .marinara-capability-villages-stage { min-height:0; --founding-photo-width:36px; }
.villages-workspace-map .villages-forging-map>button { margin-top:.65rem; }
.villages-workspace-list { border-top:1px solid var(--founding-line,#43547d); margin-top:1rem; padding-top:.8rem; }
.villages-workspace-draft { width:100%; margin:.2rem 0 .65rem; }
.villages-forging-v2 .villages-workspace-venue { display:flex; align-items:center; gap:.65rem; width:100%; min-width:0; text-align:left; margin:.5rem 0; padding:.5rem .65rem; border-radius:.65rem; background:var(--founding-panel,#192441); }
.villages-forging-v2 .villages-workspace-venue[aria-pressed=true] { background:var(--founding-selected,#30305c); border-color:var(--founding-selected-line,#aa87ff); box-shadow:inset 0 0 0 1px var(--founding-selected-line,#aa87ff); }
.villages-workspace-venue>span:nth-child(2) { flex:1; min-width:0; }
.villages-workspace-venue strong,.villages-workspace-venue small { display:block; overflow-wrap:anywhere; }
.villages-workspace-venue small { color:var(--muted-foreground); }
.villages-workspace-photo { width:2.5rem; flex:none; padding:.2rem .2rem .45rem; background:#f5f3ee; }
.villages-workspace-photo>span,.villages-workspace-photo img { display:block; width:100%; aspect-ratio:1; object-fit:contain; background:#d3d6df; }
.villages-workspace-detail-heading h3 { margin:0; overflow-wrap:anywhere; }
.villages-workspace-back button { padding:0; border:0; background:transparent; color:var(--founding-accent,#c4a8ff); }
.villages-workspace-assignment { display:flex; align-items:center; gap:.65rem; border-bottom:1px solid var(--founding-line,#43547d); margin-bottom:.65rem; }
.villages-workspace-assignment p { flex:1; }
.villages-workspace-assignment button { flex:none; }
.villages-workspace fieldset { min-width:0; margin:0; padding:0; border:0; }
.villages-workspace-artwork img { max-width:100%; max-height:12rem; object-fit:contain; }
.villages-workspace-artwork summary small { display:inline; margin-left:.5rem; color:var(--muted-foreground); }
.villages-workspace-space summary small { display:block; color:var(--muted-foreground); margin-left:1rem; }
.villages-workspace-space section { margin-top:.65rem; }
.villages-workspace-save { border-top:1px solid var(--founding-line,#43547d); padding-top:.65rem; }
.villages-workspace .marinara-capability-villages-stage[data-photo-pins="true"][data-mobile="false"] .marinara-capability-villages-pin { display:grid; place-items:center; padding:0; min-width:44px; min-height:44px; width:auto; height:auto; background:transparent; border:0; touch-action:none; }
.villages-workspace .marinara-capability-villages-stage[data-photo-pins="true"] .marinara-capability-villages-pin-photo-card { width:36px; transform:none!important; transition:transform .12s; }
.villages-workspace .marinara-capability-villages-pin-name { display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; white-space:normal; font-size:8px; line-height:1.2; max-height:1.2em; overflow:hidden; }
.villages-workspace .marinara-capability-villages-stage[data-compact-photos="true"] .marinara-capability-villages-pin:focus-visible .marinara-capability-villages-pin-photo-card { transform:scale(2)!important; }
.villages-workspace .marinara-capability-villages-pin-holder:focus-within { z-index:30; }
@media(hover:hover) and (pointer:fine) {
 .villages-workspace .marinara-capability-villages-stage[data-compact-photos="true"] .marinara-capability-villages-pin:hover .marinara-capability-villages-pin-photo-card { transform:scale(2)!important; }
 .villages-workspace .marinara-capability-villages-pin-holder:hover { z-index:30; }
}
.villages-workspace .marinara-capability-villages-pin[data-selected="true"] .marinara-capability-villages-pin-photo-card { outline:3px solid var(--founding-selected-line,#aa87ff); outline-offset:3px; }

.villages-venue-heading { display:flex; align-items:center; justify-content:space-between; gap:.5rem; flex:none; }
.villages-forging-v2 .villages-venue-heading h2 { min-width:0; margin:0; font-size:1.1rem; }
.villages-quick-start { display:grid; grid-template-columns:minmax(21rem, .8fr) minmax(0,1.2fr); align-items:start; gap:1rem; width:100%; min-width:0; min-height:0; }
.villages-quick-venue-list,.villages-quick-map-panel { min-width:0; margin:0; }
.villages-quick-venue-list { display:flex; flex-direction:column; gap:.8rem; }
.villages-forging-v2 .villages-quick-venue-list>.villages-venue-heading { flex-wrap:wrap; padding:0; background:transparent; }
.villages-quick-venue-actions { display:flex; align-items:center; flex-wrap:wrap; gap:.4rem; }
.villages-quick-venue-card { padding:.85rem; border:1px solid var(--founding-line,#596b9b); border-radius:.65rem; min-width:0; background:var(--founding-panel,#192441); }
.villages-quick-venue-card[data-selected=true] { border-color:var(--founding-selected-line,#ae8aff); box-shadow:inset 0 0 0 1px var(--founding-selected-line,#ae8aff); }
.villages-quick-venue-summary { display:flex; align-items:center; gap:.65rem; min-width:0; }
.villages-quick-venue-thumbnail { width:4.5rem; height:4.5rem; border-radius:.4rem; object-fit:cover; flex:none; }
.villages-quick-venue-title { flex:1; min-width:0; }
.villages-quick-venue-title h3 { display:inline; margin:0; }
.villages-forging-v2 .villages-quick-venue-title h3>button { display:inline; border:0; border-radius:0; background:transparent; padding:0; min-height:44px; text-align:left; font-weight:600; overflow-wrap:anywhere; }
.villages-quick-venue-badge { display:inline-block; border:1px solid var(--founding-line,#8277b7); border-radius:.7rem; padding:.15rem .5rem; margin-left:.35rem; font-size:.8rem; line-height:1.25; background:var(--founding-selected,#343359); }
.villages-quick-venue-title p { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin:.2rem 0; }
.villages-quick-home-people { display:flex; flex-wrap:wrap; gap:.35rem .65rem; padding:0; margin:.35rem 0 .6rem; border:0; min-width:0; }
.villages-quick-home-people legend { font-size:.9rem; color:var(--founding-muted,#c1c9e9); margin-bottom:.15rem; }
.villages-forging-v2 .villages-quick-home-people label { display:flex; gap:.4rem; min-height:44px; margin:0; min-width:0; overflow-wrap:anywhere; }
.villages-quick-map-panel { position:sticky; top:1rem; }
.villages-quick-map-artwork { margin:.5rem 0; }
.villages-quick-map-artwork>.villages-map-panel { margin-top:.6rem; }
.villages-quick-map-panel .villages-quick-map { height:clamp(22rem,62dvh,44rem); }
.villages-quick-map-toolbar h2 { flex:1; min-width:0; margin:0; font-size:1.1rem; }
.villages-quick-placement-hint { font-size:.9rem; margin:.5rem 0; }
@media(max-width:1000px) { .villages-quick-start { grid-template-columns:minmax(0,1fr); } .villages-quick-map-panel { position:static; } .villages-quick-map-panel .villages-quick-map { height:clamp(16rem,50dvh,28rem); } }
.villages-quick-map-toolbar { display:flex; align-items:center; gap:.35rem; flex:none; min-width:0; }
.villages-forging-v2 .villages-quick-map-toolbar button { flex:none; padding:.45rem .6rem; }
.villages-quick-map { --explore-selected:var(--founding-selected-line,#a88aff); --explore-border:var(--founding-line,#343f51); --explore-text:var(--founding-foreground,#edf0f5); display:flex; flex:0 0 auto; height:clamp(14rem,40dvh,32rem); min-width:0; min-height:14rem; position:relative; overflow:hidden; border-radius:.5rem; }
.villages-quick-map>.villages-forging-map { display:flex; flex-direction:column; flex:1; min-height:0; min-width:0; }
.villages-quick-map .marinara-capability-villages-setup-map-viewport { position:relative; contain:size layout; flex:1; min-height:0; border:0; border-radius:0; overflow:hidden; }
.villages-quick-map .marinara-capability-villages-setup-map-viewport>.marinara-capability-villages-stage { position:absolute; inset:0; }
.villages-forging-map .marinara-capability-villages-stage[data-exploration=true]:not([data-picture-width]) .marinara-capability-villages-canvas-img { visibility:hidden; }
.villages-forging-map .marinara-capability-villages-stage[data-exploration=true] { height:clamp(14rem,calc(var(--founding-viewport-height,100dvh) * .4),32rem)!important; }
.villages-quick-map .marinara-capability-villages-stage[data-exploration=true] { height:100%!important; min-height:0; }
.villages-quick-map>p { position:absolute; top:.5rem; left:.5rem; right:.5rem; z-index:7; margin:0; padding:.5rem; border-radius:.4rem; background:var(--founding-panel,#141b39ed); }
.villages-forging-v2 dialog.villages-quick-dialog[open] { display:flex; flex-direction:column; gap:1rem; width:min(92rem,100%); height:min(48rem,100%); max-height:100%; max-width:100%; padding:1.5rem; overflow:hidden; background:linear-gradient(135deg,var(--founding-panel,#192441),var(--founding-panel,#141b39)); container:founding-editor / inline-size; }
.villages-forging-v2 .villages-quick-dialog>header { flex:none; margin:0; padding:0; background:transparent; }
.villages-forging-v2 .villages-quick-dialog>header h3 { font-size:1.5rem; }
.villages-forging-v2 .villages-quick-dialog>header>button { width:auto; height:auto; }
.villages-quick-editor-body { display:flex; flex-direction:column; gap:1rem; flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; }
.villages-quick-footer { flex:none; align-items:center; }
.villages-forging-v2 .villages-quick-dialog>.villages-quick-footer { padding:.75rem 0 0; background:transparent; }
.villages-forging-v2 .villages-quick-dialog>.villages-quick-footer button { flex:none; }
.villages-forging-v2 .villages-quick-sleeping { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.4fr); gap:.5rem; align-items:center; font-size:.9rem; margin:.5rem 0; }
.villages-quick-sleeping select { min-width:0; }
.villages-quick-panel { display:grid; grid-template-columns:11rem minmax(0,1fr); gap:1.5rem; flex:1; min-height:0; align-content:start; padding:0 .1rem; }
.villages-quick-panel:has(.villages-founding-zone-nav[data-editing=true]) { grid-template-columns:minmax(0,1fr); }
.villages-quick-panel:has(.villages-founding-zone-nav[data-editing=true])>.villages-quick-selected-zone { display:none; }
.villages-forging-v2 .villages-quick-dialog fieldset.villages-quick-venue-header { display:grid; grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr); align-items:start; gap:.75rem; flex:none; }
.villages-quick-venue-header label { margin:0; font-size:.8rem; }
.villages-forging-v2 .villages-quick-dialog .villages-quick-venue-header input,.villages-forging-v2 .villages-quick-dialog .villages-quick-venue-header textarea { height:auto; min-height:44px; font-size:1rem; font-weight:400; resize:none; }
.villages-quick-zone-content { display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,1fr); gap:1rem; align-items:start; margin-top:.75rem; }
.villages-quick-zone-content .villages-quick-art { display:flex; flex-direction:column; gap:.5rem; min-width:0; }
.villages-quick-zone-content .villages-quick-art img { flex:none; }
.villages-quick-zone-fields .villages-quick-zone-access { display:flex; align-items:center; gap:.5rem; }
.villages-quick-zone-access input { width:auto; }
@container founding-editor (max-width:48rem) { .villages-quick-zone-content { grid-template-columns:minmax(0,1fr); } }
@media(max-width:727px) { .villages-forging-v2 .villages-quick-dialog fieldset.villages-quick-venue-header { grid-template-columns:minmax(0,1fr); } }
.villages-quick-footer { display:flex; flex-wrap:wrap; justify-content:flex-end; border-top:1px solid var(--founding-line,#43547d); padding:.55rem 0; margin:0; background:transparent; }
.villages-quick-footer p { flex-basis:100%; margin:0 0 .5rem; }
.villages-quick-panel .villages-zone-map { margin:0; }
.villages-quick-dialog h3 { margin:.2rem 0; overflow-wrap:anywhere; }
.villages-quick-dialog p { color:var(--founding-muted,#c1c9e9); line-height:1.5; }
.villages-forging-v2 .villages-quick-dialog fieldset { min-width:0; border:0; padding:0; margin:0; }
.villages-quick-dialog fieldset { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 .75rem; align-content:start; }
.villages-quick-field-error { display:block; margin-top:.2rem; color:var(--founding-error,#ffb9bc); font-size:.75rem; line-height:1.25; }
.villages-quick-dialog [aria-invalid=true] { border-color:var(--founding-error,#ffb9bc); }
.villages-quick-dialog .villages-quick-zone-fields { display:flex; flex-direction:column; gap:.6rem; min-width:0; }
.villages-quick-dialog .villages-quick-zone-fields label { margin:0; font-size:.8rem; }
.villages-quick-zone-fields input,.villages-quick-zone-fields textarea { margin-top:.2rem; }
.villages-founding-zone-nav { display:flex; flex-direction:column; align-items:stretch; gap:.75rem; min-width:0; }
.villages-quick-panel>.villages-founding-zone-nav[data-editing=false] { border-right:1px solid var(--founding-line,#43547d); padding-right:1rem; }
.villages-founding-zone-choices { display:flex; flex-direction:column; gap:.5rem; }
.villages-founding-zone-choices button { overflow-wrap:anywhere; touch-action:manipulation; }
.villages-founding-zone-nav-heading,.villages-quick-zone-heading,.villages-quick-art-header { display:flex; align-items:center; gap:.5rem; padding:0; background:transparent; }
.villages-forging-v2 .villages-quick-dialog .villages-founding-zone-nav-heading,.villages-forging-v2 .villages-quick-dialog .villages-quick-zone-heading,.villages-forging-v2 .villages-quick-dialog .villages-quick-art-header { margin:0; padding:0; background:transparent; }
.villages-founding-zone-nav-heading { justify-content:space-between; }
.villages-forging-v2 .villages-founding-zone-nav-heading h3 { margin:0; font-size:1.15rem; }
.villages-forging-v2 .villages-founding-zone-nav-heading button { flex:none; min-height:44px; padding:.35rem .6rem; font-size:.85rem; background:transparent; border-color:var(--founding-line,#60708f); }
.villages-forging-v2 .villages-quick-dialog fieldset.villages-quick-selected-zone { display:block; min-width:0; }
.villages-forging-v2 .villages-quick-panel:has(.villages-founding-zone-nav[data-editing=true]) fieldset.villages-quick-selected-zone { display:none; }
.villages-forging-v2 .villages-quick-zone-heading h3 { display:flex; flex:0 1 auto; align-items:center; min-width:0; max-width:calc(100% - 3rem); margin:0; font-size:1.4rem; font-weight:600; }
.villages-forging-v2 .villages-quick-zone-heading input { field-sizing:content; width:auto; min-width:0; max-width:100%; height:2.75rem; min-height:44px; margin:0; padding:.15rem .3rem; font:inherit; color:inherit; border-color:transparent; background:transparent; }
.villages-forging-v2 .villages-quick-zone-heading input:focus { border-color:var(--founding-selected-line,#a88aff); background:var(--founding-field,#0c1830); }
.villages-forging-v2 .villages-quick-zone-heading input[aria-invalid=true] { border-color:var(--founding-error,#ffb9bc); }
.villages-forging-v2 .villages-quick-zone-heading button { display:grid; place-items:center; width:44px; min-width:44px; min-height:44px; padding:.4rem; border-color:transparent; background:transparent; }
.villages-quick-zone-description>span:first-child { display:flex; align-items:center; min-height:44px; }
.villages-forging-v2 .villages-quick-dialog .villages-quick-zone-description textarea { margin-top:.5rem; }
.villages-forging-v2 .villages-quick-zone-fields textarea { height:clamp(7rem,15dvh,10rem); font-size:1rem; line-height:1.4; border-color:var(--founding-line,#60708f); }
.villages-forging-v2 .villages-quick-zone-fields input:not([type=checkbox]) { font-size:.9rem; border-color:var(--founding-line,#60708f); }
.villages-forging-v2 .villages-quick-dialog .villages-quick-zone-fields [aria-invalid=true] { border-color:var(--founding-error,#ffb9bc); }
.villages-quick-art-header { flex-wrap:wrap; justify-content:space-between; }
.villages-quick-art-header h4 { flex:none; margin:0; font-size:1rem; font-weight:600; }
.villages-forging-v2 .villages-quick-art-actions button { min-height:44px; padding:.35rem .5rem; font-size:.85rem; background:transparent; border-color:var(--founding-line,#60708f); }
.villages-quick-zone-content .villages-quick-art img { background:transparent; }
.villages-forging-v2 .villages-quick-art .villages-quick-remove-art { align-self:center; min-height:44px; padding:.2rem .5rem; font-size:.8rem; border-color:transparent; background:transparent; color:var(--founding-accent,#c6b4ff); text-decoration:underline; }

.villages-quick-art img,.villages-quick-art-empty { width:100%; height:clamp(160px,25dvh,300px); object-fit:contain; background:var(--founding-field,#0c1830); border-radius:.5rem; }
.villages-quick-art-empty { display:grid; place-items:center; }
.villages-quick-art-actions { display:flex; flex-wrap:wrap; align-items:center; gap:.4rem; }
.villages-quick-art-actions label { margin:0; }
.villages-quick-dialog label { display:block; margin:.35rem 0; }
.villages-quick-dialog input,.villages-quick-dialog textarea { box-sizing:border-box; margin-top:.35rem; background:var(--founding-field,#0c1830); border-color:var(--founding-line,#65799c); }
.villages-quick-dialog>button { margin:.6rem .5rem 0 0; }
.villages-quick-space { border:1px solid var(--founding-line,#596b9b); background:var(--founding-panel,#192441); padding:.7rem; border-radius:.6rem; margin:.6rem 0; }
.villages-quick-space summary { overflow-wrap:anywhere; }
.villages-quick-space summary>span { float:right; color:var(--founding-primary,#81e6cd); font-size:.85rem; }
.villages-quick-space summary small { display:block; color:var(--founding-muted,#c1c9e9); margin:.35rem 0 0 1rem; line-height:1.4; }
@media(max-width:704px) { .villages-forging-v2 .marinara-capability-villages-map-camera-controls { display:none; } }
@media(max-width:1000px) {
 .villages-forging-v2 dialog.villages-quick-dialog[open] { width:100%; height:100%; padding:1rem; border-radius:0; }
}
@media(max-width:727px) {
 .villages-forging-v2 dialog.villages-quick-dialog[open] { padding:.75rem; }
 .villages-quick-panel { grid-template-columns:minmax(0,1fr); gap:1rem; }
 .villages-quick-panel>.villages-founding-zone-nav[data-editing=false] { border-right:0; border-bottom:1px solid var(--founding-line,#43547d); padding:0 0 .75rem; }
 .villages-founding-zone-choices { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }
 .villages-forging-v2 .villages-quick-dialog>header h3 { font-size:1.15rem; }
}

/* Lorebook selection uses the same visible card and modal pattern as People. */
.villages-lorebook-card { min-width:0; }
.villages-lorebook-header { position:relative; display:flex; align-items:center; gap:.5rem; justify-content:space-between; min-width:0; }
.villages-lorebook-heading { display:flex; align-items:center; min-width:0; }
.villages-lorebook-heading h3 { margin:0!important; min-width:0; font-size:1rem; font-weight:400; }
.villages-lorebook-card .villages-lorebook-action { flex:none; min-height:44px; border:1px solid var(--founding-selected-line,#aa87ff); border-radius:.65rem; padding:.5rem .8rem; background:var(--founding-selected,#30305c); color:var(--founding-foreground,#f3f3ff); transition:background .15s,border-color .15s,box-shadow .15s; }
.villages-lorebook-card .villages-lorebook-action:hover { background:var(--founding-hover,#41366e); border-color:var(--founding-focus,#c1acff); }
.villages-lorebook-card .marinara-capability-villages-lore-selected { max-height:8rem; margin:.55rem 0; }
.villages-lorebook-card .marinara-capability-villages-lore-chip { min-height:44px; padding:0 .1rem 0 .65rem; border-color:var(--founding-selected-line,#aa87ff); background:var(--founding-selected,#30305c); font-size:.85rem; }
.villages-lorebook-card .marinara-capability-villages-lore-chip button { flex:none; min-width:44px; min-height:44px; padding:0; border:0; background:transparent; color:inherit; }
.villages-lorebook-card .marinara-capability-villages-lore-chip button:hover { color:var(--founding-accent,#d4bfff); }
.villages-lorebook-budget { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:.2rem .5rem; margin:.75rem 0 0; padding-top:.65rem; border-top:1px solid var(--founding-line,#43547d); }
.villages-lorebook-budget>label { margin:0!important; min-width:0; }
.villages-lorebook-budget>p { grid-column:1 / -1; margin:0; color:inherit; opacity:.8; font-size:.75rem; line-height:1.3; }
.villages-lorebook-budget-value { display:flex; align-items:center; gap:.45rem; font-size:.85rem; }
.villages-lorebook-budget input { width:5rem!important; min-width:0; min-height:44px; padding:.5rem; border:1px solid var(--founding-line,#65799c); border-radius:.45rem; color:inherit; background:var(--founding-field,#0c1830); font:inherit; }
.villages-lorebook-search { flex:none; margin-bottom:.65rem; }
.villages-lorebook-results { flex:1 1 auto; min-height:0; max-height:calc(var(--founding-viewport-height,100dvh) * .5); overflow:auto; overscroll-behavior:contain; }
:is(.villages-founding-dialog,.villages-lorebook-inline) .villages-lorebook-option { display:flex; align-items:center; gap:.65rem; min-height:44px; margin:0 0 .4rem; padding:.55rem .65rem; border:1px solid var(--founding-line,#43547d); border-radius:.65rem; background:var(--founding-panel,#19213b); cursor:pointer; transition:background .15s,border-color .15s; }
:is(.villages-founding-dialog,.villages-lorebook-inline) .villages-lorebook-option[data-selected=true] { background:var(--founding-selected,#30305c); border-color:var(--founding-selected-line,#aa87ff); }
:is(.villages-founding-dialog,.villages-lorebook-inline) .villages-lorebook-option:hover { border-color:var(--founding-focus,#b495ff); }
:is(.villages-founding-dialog,.villages-lorebook-inline) .villages-lorebook-option input { flex:none; width:1.15rem; min-height:1.15rem; height:1.15rem; margin:0; padding:0; accent-color:var(--founding-focus,#b495ff); }
.villages-lorebook-option>span { min-width:0; overflow-wrap:anywhere; }
.villages-lorebook-option small { display:block; color:var(--founding-muted,#b8c3e8); font-size:.8rem; }
.villages-lorebook-option:has(input:disabled) { opacity:.55; cursor:default; }
.villages-lorebook-footer { display:grid!important; grid-template-columns:1fr auto 1fr; grid-template-areas:'count pages actions'; align-items:center; gap:.5rem; margin-top:.65rem; padding-top:.65rem; border-top:1px solid var(--founding-line,#a6809166); }
.villages-lorebook-footer>span { grid-area:count; display:flex; align-items:center; min-height:44px; white-space:nowrap; font-size:.85rem; }
.villages-lorebook-footer .villages-founding-pagination { grid-area:pages; margin:0; padding:0; gap:.3rem; font-size:.8rem; }
.villages-lorebook-actions { grid-area:actions; display:flex; justify-content:flex-end; gap:.4rem; }
.villages-lorebook-actions button { min-width:4.5rem; }
.villages-founding-replies>[data-picker-open] { flex:1 1 100%; min-width:0; }
.villages-founding-replies:has(>[data-picker-open])>button { display:none; }
.villages-lorebook-inline { display:grid; gap:.55rem; }
.villages-forging-v2 .villages-lorebook-results { --lorebook-rows:3; --lorebook-row-height:3.3rem; --lorebook-gap:.35rem; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:repeat(var(--lorebook-rows),var(--lorebook-row-height)); grid-auto-rows:var(--lorebook-row-height); height:calc(var(--lorebook-rows) * var(--lorebook-row-height) + (var(--lorebook-rows) - 1) * var(--lorebook-gap)); align-content:start; gap:var(--lorebook-gap); flex:none; max-height:none; overflow:auto; }
.villages-forging-v2 .villages-lorebook-results .villages-lorebook-option { display:grid; grid-template-columns:1rem minmax(0,1fr); align-items:start; gap:.45rem; min-width:0; min-height:3.1rem; margin:0; padding:.55rem .6rem; font-size:.85rem; line-height:1.25; border-color:var(--founding-line,#9b768c); background:var(--founding-card,#3c304966); border-radius:.5rem; }
.villages-forging-v2 .villages-lorebook-option[data-selected=true] { background:var(--founding-selected,#8c596d); border-color:var(--founding-selected-line,#dea2a7); }
.villages-forging-v2 .villages-lorebook-option:hover { border-color:var(--founding-accent,#e2b5c2); }
.villages-forging-v2 .villages-lorebook-option input { width:1rem; height:1rem; min-height:1rem; accent-color:var(--founding-primary,#e9c583); }
.villages-forging-v2 :is(.villages-lorebook-search,.villages-lorebook-budget input) { margin:0; background:var(--founding-field,#3c3049); border-color:var(--founding-line,#9b768c); color:var(--founding-foreground,#f0dfbc); border-radius:.45rem; }
.villages-forging-v2 .villages-lorebook-budget { margin:0; border-color:var(--founding-line,#a6809166); }
.villages-forging-v2 .villages-lorebook-budget>p { margin:0; color:inherit; line-height:1.3; }
.villages-forging-v2 .villages-lorebook-footer { margin:0; grid-template-areas:'back pages next'; }
.villages-forging-v2 .villages-lorebook-actions { display:contents; }
.villages-forging-v2 .villages-lorebook-actions>button { grid-area:back; justify-self:start; }
.villages-forging-v2 .villages-lorebook-actions>.villages-forging-primary { grid-area:next; justify-self:end; }
.villages-forging-v2 .villages-lorebook-footer button { min-height:44px; color:var(--founding-foreground,#f0dfbc); background:var(--founding-control,#514157); border-color:var(--founding-line,#a87788); padding:.4rem .7rem; }
.villages-forging-v2 .villages-lorebook-footer .villages-forging-primary { background:var(--founding-primary,#a5ac8b); border-color:var(--founding-primary,#a5ac8b); color:var(--founding-on-primary,#292938); }
.villages-forging-v2 .villages-lorebook-footer .villages-founding-pagination button { min-width:44px; padding:0; background:var(--founding-control,#514157); }
.villages-lorebook-option { position:relative; }
.villages-lorebook-check { position:relative; display:inline-grid; flex:none; width:1.15rem; height:1.15rem; }
.villages-forging-v2 .villages-lorebook-check { width:1rem; height:1rem; }
.villages-lorebook-check[data-unavailable] input { opacity:0; }
.villages-lorebook-name { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; }
.villages-lorebook-state { position:absolute; inset:0; display:grid; place-items:center; font-size:1rem; line-height:1; pointer-events:none; }
.villages-lorebook-search-row { display:flex; align-items:center; gap:.35rem; flex:none; min-width:0; }
.villages-lorebook-search-row .villages-lorebook-search { flex:1; min-width:0; margin:0; }
.villages-lorebook-inline .villages-lorebook-results { --lorebook-rows:4; grid-template-columns:repeat(3,minmax(0,1fr)); }
.villages-forging-v2 .villages-lorebook-embedded .villages-lorebook-results { --lorebook-rows:2; grid-template-columns:repeat(2,minmax(0,1fr)); overflow:hidden; }
.villages-lorebook-embedded>.villages-founding-pagination { padding-top:0; margin:0; }
.villages-forging-v2 .villages-founding-overlay>dialog.villages-lorebook-dialog[open] { display:flex; flex-direction:column; gap:.5rem; width:min(34rem,100%); max-width:100%; max-height:100%; padding:.75rem; }
.villages-forging-v2 .villages-lorebook-dialog[open]>header { padding:0; margin:0; background:transparent; border-bottom:1px solid var(--founding-line,#a6809166); }
.villages-forging-v2 .villages-lorebook-dialog[open]>header h3 { margin:0; }
.villages-forging-v2 .villages-lorebook-dialog .villages-lorebook-footer { grid-template-columns:1fr 1fr; grid-template-rows:44px auto; grid-template-areas:'pages pages' 'back next'; }
.villages-lorebook-dialog .villages-lorebook-actions>* { flex:1; }
.villages-forging-v2 .villages-lorebook-results>p { grid-column:1 / -1; }
.villages-lorebook-action:focus-visible { outline:3px solid var(--founding-focus,#c1acff); outline-offset:2px; }
.villages-lorebook-check:has(input:focus-visible) { outline:2px solid var(--founding-focus,#c1acff); outline-offset:3px; }
@media(min-width:728px) {
 .villages-setting-guide .villages-setting-dialogue:has(.villages-lorebook-inline) { width:min(100%,44rem); }
}
@media(max-width:727px) {
 .villages-forging-v2 .villages-lorebook-results .villages-lorebook-option { min-height:44px; padding:.35rem .4rem; gap:.3rem; font-size:clamp(13px,.8rem,16px); }
 .villages-forging-v2 .villages-lorebook-budget>label { font-size:.8rem; }
 .villages-forging-v2 .villages-lorebook-budget-value { gap:.25rem; font-size:.75rem; }
 .villages-forging-v2 .villages-lorebook-budget-value input { width:4rem!important; }
}
@container founding-stage (height < 44rem) {
 .villages-forging-v2 .villages-founding-overlay>dialog.villages-lorebook-dialog[open] { padding:.5rem; gap:.35rem; }
 .villages-forging-v2 .villages-lorebook-results { --lorebook-row-height:44px; --lorebook-gap:.15rem; }
 .villages-forging-v2 .villages-lorebook-results .villages-lorebook-option { min-height:44px; padding:.1rem .35rem; font-size:clamp(13px,.8rem,16px); }
 .villages-setting-guide .villages-setting-dialogue:has(.villages-lorebook-inline) { padding:.65rem .85rem; }
 .villages-lorebook-inline { gap:.35rem; }
 .villages-forging-v2 .villages-lorebook-budget,.villages-forging-v2 .villages-lorebook-footer { padding-top:.2rem; gap:.15rem .4rem; }
 .villages-forging-v2 .villages-lorebook-dialog .villages-lorebook-footer { padding-top:.2rem; }
 .villages-forging-v2 .villages-lorebook-budget>p { font-size:clamp(11px,.7rem,14px); }
}
@media(prefers-reduced-motion:reduce) { .villages-lorebook-card .villages-lorebook-action,.villages-lorebook-option { transition:none; } }

/* Each step fits the Engine content area; only the active pane can scroll. */
.villages-forging-v2 [hidden] { display:none!important; }
.villages-forging-body { overflow:hidden; padding:.75rem 1rem; }
.villages-forging-body>div:not([hidden]),.villages-place-panels,.villages-founding-places,.villages-quick-start { height:100%; min-height:0; }
.villages-place-panels { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; align-items:stretch; }

.villages-people-panel>.villages-forging-card { margin:0; }
.villages-place-panels>.villages-forging-card { height:100%; overflow:auto; margin:0; }
.villages-founding-tabs { display:flex; flex-wrap:wrap; gap:.4rem; align-items:start; flex:none; }
.villages-founding-pagination { display:flex; align-items:center; justify-content:space-between; gap:.5rem; margin-top:auto; padding-top:.5rem; flex:none; }
.villages-quick-start { grid-template-columns:minmax(18rem,.85fr) minmax(0,2.3fr); grid-template-rows:minmax(0,1fr); align-items:stretch; }
.villages-quick-venue-list { grid-column:1; grid-row:1; }
.villages-quick-map-panel { grid-column:2; grid-row:1; }
.villages-forging-v2 .villages-quick-venue-card { display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; gap:.25rem; padding:.65rem .75rem; font-size:.95rem; line-height:1.2; width:100%; min-height:clamp(76px,12dvh,120px); text-align:left; background-size:cover; background-position:center; }
.villages-quick-venue-title { display:flex; flex:none; align-items:center; flex-wrap:nowrap; gap:.4rem; }
.villages-forging-v2 .villages-quick-venue-card[aria-pressed=true] { background-color:var(--founding-selected,#263153); }
.villages-quick-venue-title strong { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.villages-quick-venue-badge { flex:none; min-width:6rem; text-align:center; padding:.1rem .4rem; line-height:1.1; }
.villages-quick-map-toolbar { justify-content:flex-start; flex-wrap:wrap; gap:.5rem; }
.villages-quick-map-toolbar h2 { flex:1; margin:0 .5rem 0 0; }
.villages-quick-venue-list,.villages-quick-map-panel { min-height:0; height:100%; margin:0; overflow:auto; position:static; }
.villages-quick-venue-list { display:flex; flex-direction:column; gap:.4rem; }
.villages-quick-venue-list h2 { font-size:1.1rem; }
.villages-quick-venue-card { padding:.4rem .6rem; margin:0; max-height:var(--venue-page-height); overflow:auto; }
.villages-quick-venue-list>.villages-venue-heading,.villages-quick-venue-list>p { flex:none; }
.villages-quick-map .marinara-capability-villages-stage[data-pin-movable=true] .marinara-capability-villages-pin { touch-action:none; cursor:grab; }
.villages-quick-map .marinara-capability-villages-stage[data-pin-movable=true] .marinara-capability-villages-pin:active { cursor:grabbing; }
.villages-quick-artwork-button { display:flex; align-items:center; gap:.4rem; margin-left:auto; }
.villages-quick-artwork-button img { width:2rem; height:2rem; object-fit:cover; border-radius:.25rem; }
.villages-quick-venue-card h3 { margin:0; }
.villages-quick-household { display:block; min-height:1.2em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:.8rem; margin:0!important; }
.villages-quick-zone-list { display:grid; gap:0; }
.villages-forging-v2 .villages-quick-zone-list .villages-quick-venue-card {
  display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:.6rem;
  min-height:44px; max-height:none; padding:.55rem .2rem; overflow:visible;
  background:transparent; border:0; border-radius:0; border-bottom:1px solid var(--founding-line,#a6809159);
}
.villages-forging-v2 .villages-quick-zone-list .villages-quick-venue-card:is(:hover,[data-selected=true]) { background:var(--founding-field,#74536740); box-shadow:none; }
.villages-quick-venue-copy { display:grid; gap:.14rem; min-width:0; overflow-wrap:anywhere; }
.villages-quick-venue-icon { display:grid; place-items:center; width:2rem; height:2rem; border:1px solid var(--founding-line,#a6809199); border-radius:.42rem; background:var(--founding-field,#74536755); }
.villages-quick-venue-icon svg { width:1.15rem; height:1.15rem; }
.villages-quick-zone-summary { white-space:normal; overflow-wrap:anywhere; font-size:.8rem; line-height:1.3; color:var(--founding-foreground,#decabe); }
.villages-forging-v2 button.villages-quick-open-map { display:none; }
@media(max-width:727px) {
  .villages-forging-v2 button.villages-quick-open-map { display:inline-flex; align-items:center; }
  .villages-quick-start:not([data-map-open])>.villages-quick-map-panel,
  .villages-quick-start[data-map-open]>.villages-quick-venue-list { display:none; }
}
.villages-quick-map-panel { display:flex; flex-direction:column; }
.villages-quick-map-panel .villages-quick-map { flex:1; min-height:10rem; height:auto; }
.villages-quick-footer { display:flex; gap:.4rem; flex-wrap:wrap; padding-top:.5rem; border-top:1px solid var(--founding-line,#43547d); }
.villages-forging-body[data-step="4"] { overflow:hidden; }
.villages-founding-map-artwork { display:flex; flex-direction:column; min-height:0; }
.villages-founding-map-artwork .villages-quick-map-toolbar { margin-bottom:.5rem; }
.villages-founding-map-artwork .villages-quick-map-toolbar h2 { flex:0 0 100%; overflow-wrap:anywhere; }
.villages-founding-places { display:flex; flex-direction:column; gap:.5rem; }
.villages-founding-places>.villages-quick-start { flex:1; }
.villages-forging-map-warning { font-weight:600; font-size:.9rem; margin:.2rem 0; }
@media(min-width:728px) and (max-width:1100px) {
 .villages-quick-start { grid-template-columns:1fr; grid-template-rows:auto; height:auto; }
 .villages-forging-body>.villages-founding-places { height:auto; }
 .villages-quick-venue-list,.villages-quick-map-panel { grid-column:1; grid-row:auto; height:auto; max-height:none; }
 .villages-quick-map-panel .villages-quick-map { height:300px; flex:none; }
}
@media(max-width:727px) {
 .villages-forging-body { overflow:auto; }
 .villages-place-panels,.villages-quick-start { grid-template-columns:minmax(0,1fr); height:auto; }
 .villages-forging-body>div:not([hidden]),.villages-founding-places { height:auto; }
 .villages-place-panels>.villages-forging-card { height:auto; min-height:0; }
 .villages-quick-venue-list,.villages-quick-map-panel { height:auto; max-height:none; grid-column:1; grid-row:auto; }
 .villages-quick-start { grid-template-rows:auto; }
 .villages-quick-map-panel .villages-quick-map { height:300px; flex:none; }
}
/* Founding overlays belong to the capability pane, never the Engine window. */
.villages-founding-overlay { position:absolute; inset:0; z-index:100; display:grid; grid-template:minmax(0,1fr) / minmax(0,1fr); place-items:center; padding:1rem; overflow:hidden; background:var(--founding-overlay,#090c1a99); }
.villages-forging-v2 .villages-founding-overlay>dialog { position:relative; inset:auto; margin:0; width:min(42rem,100%); height:auto; max-width:100%; max-height:100%; }
.villages-forging-v2 .villages-founding-dialog { border:1px solid var(--founding-line); background:var(--founding-panel); color:var(--founding-foreground); font:inherit; }
.villages-forging-v2 .villages-founding-dialog>:is(header,footer) { background:transparent; color:inherit; border-color:var(--founding-line); }
.villages-forging-v2 .villages-founding-dialog footer button { background:var(--founding-control); color:var(--founding-foreground); border-color:var(--founding-line); }
.villages-forging-v2 .villages-founding-dialog footer .villages-forging-primary { background:var(--founding-primary); color:var(--founding-on-primary); border-color:var(--founding-primary); }
.villages-forging-v2 :is(fieldset,.villages-scenery-fields) { border-color:var(--founding-line); }
.villages-forging-v2 .marinara-capability-villages-model-row,.villages-forging-v2 .marinara-capability-villages-model-choices button { font:inherit; }
.villages-forging-v2 :is(input,textarea,select) { color-scheme:inherit; accent-color:var(--menu-rose); }
.villages-forging-v2 :is(input:not([type=checkbox],[type=radio]),textarea,select):focus-visible { outline:3px solid var(--founding-focus); outline-offset:2px; }
.villages-forging-v2 :is(input,textarea)::placeholder { color:var(--founding-placeholder); font-style:italic; opacity:1; }
.villages-forging-v2 .marinara-capability-villages-identity-card-face { background:var(--founding-control); color:var(--founding-foreground); }
.villages-forging-v2 .villages-founding-overlay>dialog:not(.villages-quick-dialog,[data-scroll-body=true]) { overflow:auto; }
.villages-founding-roster-dialog>input { flex:none; }
.villages-founding-roster-dialog>.villages-people-choices { min-height:0; overflow:auto; overscroll-behavior:contain; }
.villages-forging-v2 .villages-founding-overlay>dialog.villages-founding-roster-dialog { border:1px solid var(--founding-line,#a68091a6); border-radius:1rem; color:var(--founding-foreground,#f0dfbc); background:var(--founding-panel); box-shadow:0 1rem 3rem #170f2870; }
.villages-forging-v2 .villages-founding-roster-dialog>:is(header,footer) { color:inherit; background:transparent; border-color:var(--founding-line,#ad839b45); }
.villages-forging-v2 .villages-founding-roster-dialog input { color:var(--founding-foreground,#f0dfbc); background:var(--founding-field,#30283e); border-color:var(--founding-line,#9b768c8c); }
.villages-forging-v2 .villages-founding-roster-dialog .villages-people-identity { color:var(--founding-foreground,#f0dfbc); background:var(--founding-card,#3c304966); border-color:var(--founding-line,#9b768c); }
.villages-forging-v2 .villages-founding-roster-dialog .villages-people-identity small { color:inherit; opacity:.75; }
.villages-forging-v2 .villages-founding-roster-dialog button { color:var(--founding-foreground,#f0dfbc); background:var(--founding-control,#514157); border-color:var(--founding-line,#a87788); }
.villages-forging-v2 .villages-founding-roster-dialog button.villages-forging-primary { color:var(--founding-on-primary,#292938); background:var(--founding-primary,#a5ac8b); border-color:var(--founding-primary,#a5ac8b); }
.villages-forging-v2 .villages-founding-overlay>dialog[data-compact=true] { width:min(26rem,100%); max-height:100%; }
.villages-forging-v2 .villages-founding-overlay>dialog.villages-quick-dialog { width:min(92rem,100%); height:min(48rem,100%); }
@media(max-width:1000px) { .villages-founding-overlay { padding:0; } .villages-forging-v2 .villages-founding-overlay>dialog.villages-quick-dialog { width:100%; height:100%; } }
.villages-forging-v2 { color:var(--foreground); background:var(--founding-canvas,#302d47); font-family:"village-letter-lora", Georgia, serif; }
.villages-forging-v2 .villages-forging-card { background:var(--founding-panel,#352c44); border-color:var(--founding-line,#a3899666); }
.villages-forging-v2 :is(button,.villages-quick-venue-card) { color:var(--founding-foreground,#f0dfbc); background-color:var(--founding-control,#514157); border-color:var(--founding-line,#a87788); }
.villages-forging-v2 button[aria-pressed=true] { background-color:var(--founding-selected,#83576b); border-color:var(--founding-selected-line,#d29399); }
.villages-forging-v2 .villages-forging-primary { color:var(--founding-on-primary,#292938); background:var(--founding-primary,#a5ac8b); border-color:var(--founding-primary,#a5ac8b); }
.villages-forging-v2[data-step] {
  --founding-night-wash:linear-gradient(100deg,#271c3530,#271c35a8 58%,#271c35ea);
  gap:0;
  background:var(--founding-night-wash),url('/api/capability-packages/villages/assets/mari-founding-overlook.webp') center 62% / cover no-repeat var(--founding-canvas,#302d47);
}
.villages-forging-v2[data-lighting=day] {
  background:linear-gradient(180deg,#23364b9c,transparent 7rem),linear-gradient(100deg,#23364b14,#23364b55),url('/api/capability-packages/villages/assets/mari-founding-overlook-day.webp') center 62% / cover no-repeat #526b82;
}
.villages-founding-title {
  min-width:0; container-type:inline-size; display:grid; justify-items:center;
  gap:clamp(.85rem,3dvh,1.75rem); padding-block:1rem;
  text-align:center; color:#fff0d1;
}
.villages-founding-logo {
  display:grid; justify-items:center; gap:.05em; max-width:100%;
  font-size:min(16cqi,13dvh,6rem);
}
.villages-founding-logo svg {
  display:block; width:5.65em; max-width:100%; height:auto;
  color:#e0e4c9; filter:drop-shadow(0 2px 3px #21192d);
}
.villages-forging-v2 .villages-founding-title h1 {
  padding-inline-start:.105em; font:400 1em/1.04 "village-letter-lora",Georgia,serif;
  letter-spacing:.105em; text-transform:uppercase; text-shadow:0 2px 3px #21192d,0 0 .22em #21192db0;
}
.villages-forging-v2 .villages-founding-title button {
  min-width:min(10rem,100%); min-height:50px; padding:.6rem 1.4rem; border:1px solid var(--founding-primary,#c3c9a4); border-radius:2rem;
  color:var(--founding-on-primary,#242b27); background:var(--founding-primary,#aeb797); box-shadow:0 2px 8px #16142166,inset 0 0 0 2px #2c382826;
  font-size:.95rem; letter-spacing:.17em;
}
.villages-forging-v2 .villages-founding-title button:hover { background:var(--founding-hover,#c3cbac); }
.villages-forging-v2 .villages-founding-title button:focus-visible { outline-color:#fff0d1; outline-offset:5px; }
.villages-forging-v2[data-prelude] .villages-forging-steps { visibility:hidden; }
.villages-forging-steps {
  position:relative; isolation:isolate; display:grid; grid-template-columns:repeat(5,1fr); list-style:none;
  flex:none; width:min(22rem,calc(100% - 6rem)); margin:.65rem auto 0; padding:0 0 1.15rem; text-align:center;
}
.villages-forging-v2 .villages-founding-models {
  position:absolute; top:.3rem; right:.45rem; z-index:3; display:grid; place-items:center;
  width:44px; min-height:44px; padding:.55rem; border:1px solid var(--founding-line,#a6809180); border-radius:.65rem;
  color:var(--founding-foreground,#f0dfbc); background:var(--founding-panel,#292438e8);
}
.villages-founding-models svg { width:1.25rem; height:1.25rem; }
.villages-founding-dialog>header>.villages-founding-models { position:static; flex:none; }
.villages-founding-dialog>header:has(>.villages-founding-models)>h3 { flex:1; }
.villages-forging-steps::before { content:''; position:absolute; z-index:-1; inset:.68rem 10% auto; height:1px; background:var(--founding-progress-line,#d8a7b880); }
.villages-forging-steps li { position:relative; color:var(--founding-inactive,#d4b0c7); }
.villages-founding-star { display:inline-grid; place-items:center; width:1.35rem; height:1.35rem; font:1rem/1 Georgia,serif; color:var(--founding-star-ink,var(--founding-inactive)); background:var(--founding-star,#362a46); border-radius:50%; opacity:.65; }
.villages-forging-steps li[data-complete] { color:var(--founding-active,#eed1a8); }
.villages-forging-steps li[aria-current=step] { color:var(--founding-active,#fff0c3); }
.villages-forging-steps li[data-complete] .villages-founding-star { color:var(--founding-star-ink,var(--founding-accent)); opacity:1; }
.villages-forging-steps li[aria-current=step] .villages-founding-star { color:var(--founding-active-star); font-size:1.35rem; opacity:1; text-shadow:0 0 .55rem var(--founding-star-ring); box-shadow:0 0 0 2px var(--founding-star-ring),0 0 .6rem color-mix(in srgb,var(--founding-star-ring) 45%,transparent); }
.villages-founding-step-label { position:absolute; top:1.4rem; left:50%; transform:translateX(-50%); white-space:nowrap; font-size:.77rem; }
.villages-founding-hierarchy {
  --chart-width:min(var(--chart-limit,15rem),calc(var(--mari-x) - var(--mari-height) * .31 - 1.25rem));
  --chart-right:calc(100% - var(--mari-x) + var(--mari-height) * .31 + .5rem);
  position:absolute; right:var(--chart-right);
  bottom:min(calc(var(--mari-floor) + var(--mari-height) * .56),calc(100cqh - 3.5rem - var(--chart-width) * .88));
  width:var(--chart-width); height:auto; padding:.25rem;
  background:var(--founding-chart,#342741bf); border:1px solid var(--founding-line,#eed1a830); border-radius:.65rem; outline:none; user-select:none;
}
.villages-founding-hierarchy text { fill:var(--founding-foreground,#f0dfbc); font-size:17px; font-weight:500; stroke:none; text-shadow:none; }
.villages-founding-hierarchy-links { fill:none; stroke:var(--founding-accent,#e2b5c2); filter:drop-shadow(0 1px 1px #21192d); }
.villages-forging-v2[data-lighting=day] .villages-founding-hierarchy-links { filter:none; }
.villages-founding-hierarchy-star circle { fill:var(--founding-star,#362a46); stroke:var(--founding-selected-line,#dfbbaf); stroke-width:.8; }
.villages-founding-hierarchy-star path { fill:none; stroke:var(--founding-star-ink,var(--founding-inactive)); stroke-width:.7; }
.villages-founding-hierarchy [data-complete] .villages-founding-hierarchy-star path { fill:var(--founding-inactive); stroke:none; }
.villages-founding-hierarchy [data-active] text { fill:var(--founding-active,#fff0c3); }
.villages-founding-hierarchy [data-active] .villages-founding-hierarchy-star path { fill:var(--founding-active-star); stroke:none; filter:drop-shadow(0 0 2px var(--founding-star-ring)); }
.villages-founding-hierarchy [data-active] circle { stroke:var(--founding-star-ring); stroke-width:1.5; }
.villages-founding-guide { display:flex; align-items:center; gap:.55rem; margin:.55rem 0; flex:none; }
.villages-founding-guide img { flex:none; width:2rem; height:3rem; object-fit:contain; object-position:center top; }
.villages-forging-v2 .villages-founding-guide .villages-setting-dialogue { max-width:48rem; padding:.55rem .8rem; }
.villages-founding-replies { display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; margin-top:.35rem; }
.villages-founding-replies>.villages-founding-draft-map { margin-inline-start:auto; }
.villages-founding-chapter { position:relative; display:flex; flex:1; min-width:0; min-height:0; }
.villages-founding-chapter[data-guided] .villages-forging-card { background:var(--founding-panel,#292438f5); border-color:var(--founding-line,#a6809199); }
.villages-founding-chapter[data-guided] .villages-quick-venue-badge { min-width:0; margin-left:0; }
.villages-founding-chapter[data-guided] .villages-founding-pagination>span { white-space:nowrap; }
.villages-forging-v2 .villages-forging-body[data-step="0"] { padding:0; overflow:auto; }
.villages-forging-v2 .villages-forging-body>.villages-place-panels {
  --scene-padding:clamp(.75rem,1.6vw,1.5rem);
  min-height:100%; height:auto; max-width:84rem; margin-inline:auto; grid-template-columns:minmax(0,1fr) minmax(0,1fr); align-items:start;
  gap:clamp(.75rem,2.5vw,1.75rem); padding:var(--scene-padding);
}
.villages-setting-guide { min-width:0; min-height:0; }
.villages-setting-stage {
  position:absolute; left:var(--mari-x); bottom:var(--mari-floor); height:var(--mari-height); aspect-ratio:3 / 8;
  translate:-50% 0; pointer-events:none;
}
.villages-setting-stage::before {
  content:''; position:absolute; inset:auto 0 -.28rem; margin:auto;
  width:80%; height:.6rem; background:radial-gradient(ellipse,#1713288c,transparent 72%);
}
/* Register each pose at the midpoint of its shoes on the shared ground line. */
.villages-setting-stage img {
  position:absolute; left:50%; bottom:0; height:100%; width:auto; max-width:none;
  translate:calc(-1 * var(--shoe-center,50%)) 0;
  filter:drop-shadow(0 .15rem .3rem #170f2840);
}
.villages-setting-stage img[data-facing=left] { transform:scaleX(-1); }
.villages-setting-stage [src$="mari-founding-neutral.webp"] { --shoe-center:48.2%; }
.villages-setting-stage [src$="mari-founding-happy.webp"] { --shoe-center:50.7%; }
.villages-setting-stage [src$="mari-founding-looking-up.webp"] { --shoe-center:40.6%; }
.villages-setting-stage [src$="mari-founding-playful.webp"] { --shoe-center:49.6%; }
.villages-setting-stage [src$="mari-founding-presenting.webp"] { --shoe-center:63%; }
.villages-setting-stage [src$="mari-founding-wave.webp"] { --shoe-center:52.7%; }
.villages-setting-stage [src$="mari-founding-thoughtful.webp"] { --shoe-center:48%; }
.villages-setting-stage [src$="mari-founding-happy-side.webp"] { --shoe-center:35%; }
.villages-setting-stage [src$="mari-founding-proud.webp"] { --shoe-center:47.9%; }
.villages-setting-dialogue {
  background:var(--founding-panel,#292438f5); border:1px solid var(--founding-line,#a6809199); border-radius:.65rem; padding:clamp(.85rem,2vw,1.45rem);
  box-shadow:0 .65rem 2rem #170f2859;
}
.villages-setting-dialogue { position:relative; min-width:0; }
.villages-setting-dialogue>strong { color:var(--founding-foreground); font-size:1rem; font-weight:600; }
.villages-setting-dialogue p { margin:.2rem 0 .35rem; line-height:1.4; }
.villages-forging-v2 .villages-setting-dialogue>p { color:var(--founding-foreground); font-size:1rem; line-height:1.45; margin:.3rem 0 .5rem; }
.villages-setting-dialogue .villages-founding-replies>button { min-height:48px; font-size:1rem; }
.villages-setting-dialogue .villages-founding-field { margin:.5rem 0; }
.villages-forging-v2 .villages-place-panels .villages-founding-field+.villages-founding-field { border-top:0; padding-top:0; }
.villages-place-panels .villages-founding-field :is(input,textarea),.villages-lorebook-inline .villages-lorebook-search { background:var(--founding-field,#3c3049); border-color:var(--founding-line,#9b768c); margin-top:.25rem; }
.villages-forging-v2 .villages-place-panels textarea { resize:vertical; }
.villages-founding-connections { width:min(100%,25rem); min-width:0; }
.villages-founding-connections .marinara-capability-villages-model-connections { margin:0; }
.villages-founding-connections .marinara-capability-villages-model-rows {
  display:grid; gap:.45rem; background:none; border:0; border-radius:0; overflow:visible;
}
.villages-founding-connections .marinara-capability-villages-model-rows>.marinara-capability-villages-model-row {
  position:relative; display:block; padding:.5rem .65rem; border:1px solid var(--founding-line,#bf96a4b8);
  border-radius:.65rem; background:var(--founding-panel,#392e46f5); color:var(--founding-foreground,#f4e5c8); font:inherit; box-shadow:0 2px 10px #1c132638;
}
.villages-founding-connections .marinara-capability-villages-model-rows>.marinara-capability-villages-model-row:enabled:not([aria-disabled]):hover {
  background:var(--founding-control,#514157); border-color:var(--founding-accent,#d4a9ae);
}
.villages-founding-connections :is(.marinara-capability-villages-model-icon,.marinara-capability-villages-model-chevron,
  .marinara-capability-villages-model-assignment small:not([data-needs-review])) { display:none; }
.villages-founding-connections .marinara-capability-villages-model-row small { color:var(--founding-accent,#e9bec6); font-size:.75rem; }
.villages-founding-connections .marinara-capability-villages-model-assignment {
  display:block; margin-top:.3rem; font-size:.8rem;
}
.villages-founding-connections .marinara-capability-villages-model-assignment[data-needs-choice] { color:var(--founding-error,#ffbac5); }
.villages-founding-connections .marinara-capability-villages-model-assignment strong { font-weight:400; }
.villages-founding-connections .marinara-capability-villages-model-pending { position:absolute; inset:.6rem .6rem auto auto; }
.villages-forging-v2 .marinara-capability-villages-model-readiness { align-self:start; color:var(--founding-error); font-size:.75rem; white-space:nowrap; }
.villages-forging-v2 .marinara-capability-villages-model-readiness[data-valid] { color:var(--founding-foreground); }
.villages-founding-connections .marinara-capability-villages-model-readiness { position:absolute; top:.6rem; right:.65rem; }
.villages-forging-v2 .villages-founding-image-recommendation>footer { display:grid; grid-template-columns:minmax(0,1fr); gap:.5rem; }
.villages-forging-v2 .villages-founding-image-recommendation[data-compact=true]>footer>button { width:100%; min-width:0; white-space:normal; }
.villages-founding-appearance-options { display:grid; gap:.25rem; margin:0; padding:.6rem; border:1px solid var(--founding-line); border-radius:.6rem; }
.villages-founding-appearance-options legend { padding:0 .25rem; }
.villages-forging-v2 .villages-founding-appearance-options button { display:flex; align-items:center; justify-content:space-between; gap:1rem; text-align:left; }
.villages-forging-v2 .villages-founding-overlay:has(>.villages-founding-appearance) { place-items:start end; padding:3.5rem .5rem .5rem; background:transparent; backdrop-filter:none; }
.villages-forging-v2 .villages-founding-overlay>dialog.villages-founding-appearance { width:min(17rem,100%); height:auto; margin:0; padding:.75rem; }
.villages-founding-appearance .villages-founding-appearance-options { border:0; padding:0; }
.villages-founding-appearance legend { display:none; }
.villages-forging-v2 .villages-founding-connections-footer { display:flex; justify-content:flex-end; flex:none; margin-top:.65rem; padding:0; border:0; background:transparent; }
.villages-forging-v2 .villages-founding-connections-dialog[open] { padding:.75rem; }
.villages-forging-v2 .villages-founding-connections .villages-founding-connections-footer>.villages-forging-primary {
  display:block; min-width:min(5.75rem,100%); margin:.65rem 0 0 auto; padding:.4rem 1rem;
  border-color:var(--founding-primary,#c3c9a4); border-radius:2rem; color:var(--founding-on-primary,#242b27); background:var(--founding-primary,#aeb797);
  box-shadow:0 2px 8px #16142166,inset 0 0 0 2px #2c382826;
}
@media(prefers-reduced-motion:no-preference) {
  .villages-forging-v2[data-title-fading] .villages-founding-title { animation:villages-title-fade .35s ease-out both; }
  .villages-forging-v2[data-scene-arrival] :is(.villages-forging-steps,.villages-setting-guide>.villages-setting-dialogue) {
    animation:villages-mari-greet .2s ease-out both;
  }
}
@keyframes villages-mari-greet { from { opacity:0; } }
@keyframes villages-title-fade { to { opacity:0; visibility:hidden; } }
@media(min-width:728px) {
  /* Keep the terrace floor in frame as the overlook crops on wide displays. */
  .villages-forging-v2[data-step] {
    --mari-x:max(29cqw,calc((100cqw - min(100cqw,56rem)) / 2 + clamp(.75rem,1.6cqw,1.5rem) + clamp(3.5rem,7.5cqw,8.5rem)));
    --mari-height:min(66cqh,42rem,44cqw); --mari-floor:min(10cqh,6.6rem);
    background-position:center,center bottom;
  }
  .villages-forging-v2[data-step][data-lighting=day] { background-position:center,center,center bottom; }
  .villages-founding-chapter {
    padding-inline:calc(var(--mari-x) + clamp(5rem,11cqw,9rem)) clamp(.75rem,2.5cqw,3rem);
  }
  .villages-founding-chapter[data-guided] {
    container-type:size; display:grid; grid-template-columns:minmax(9rem,.52fr) minmax(0,1fr);
    gap:clamp(.75rem,2vw,1.75rem); width:100%;
  }
  .villages-founding-chapter[data-explanation] { grid-template-columns:minmax(0,1fr); }
  .villages-founding-chapter[data-guided]>.villages-forging-body {
    container:founding-work / inline-size; align-self:center; height:min(94cqh,54rem);
    padding-inline:0; overflow:auto;
  }
  .villages-forging-v2 .villages-forging-body[data-step="0"] { container-type:size; }
  .villages-forging-v2 .villages-forging-body>.villages-place-panels { grid-template-columns:minmax(0,1fr); }
  .villages-setting-guide {
    display:grid; align-content:center; min-height:var(--scene-height);
  }
  .villages-setting-guide {
    --scene-height:calc(100cqh - 2 * var(--scene-padding));
  }
  .villages-founding-chapter>.villages-chapter-guide { --scene-height:100cqh; }
  .villages-setting-guide .villages-setting-dialogue {
    width:min(100%,34rem); max-height:var(--scene-height); overflow:auto; overscroll-behavior:contain;
  }
}
@container founding-work (width > 45rem) {
  .villages-quick-start { grid-template-columns:minmax(13.5rem,1fr) minmax(0,2.3fr); }
}
@container founding-work (max-width:45rem) {

  .villages-quick-start { grid-template-columns:minmax(0,1fr); grid-template-rows:auto; height:auto; }
  .villages-forging-body>.villages-founding-places { height:auto; }
  .villages-quick-venue-list,.villages-quick-map-panel { grid-column:1; grid-row:auto; height:auto; }
  .villages-quick-map-panel .villages-quick-map { flex:none; height:clamp(16rem,48dvh,25rem); }
}
@media(max-width:727px) {
  .villages-founding-chapter[data-guided] {
    flex-direction:column; justify-content:safe flex-end;
    overflow:auto; overscroll-behavior:contain;
  }
  .villages-founding-overlay { padding:.85rem; background:var(--founding-overlay,#17102070); backdrop-filter:blur(3px); }
  .villages-forging-v2 .villages-founding-overlay>dialog.villages-founding-dialog {
    width:min(30rem,100%); max-width:100%; max-height:86%; padding:.85rem;
    border:1px solid var(--founding-line,#a68091a6); border-radius:1rem; color:var(--founding-foreground,#f0dfbc);
    background:var(--founding-panel); box-shadow:0 1rem 3rem #170f2870;
  }
  .villages-forging-v2 .villages-founding-dialog>header {
    padding:0 0 .55rem; margin:0 0 .55rem; background:transparent; border-bottom:1px solid var(--founding-line,#ad839b45);
  }
  .villages-forging-v2 .villages-founding-dialog>header h3 { font-size:1.1rem; font-weight:400; }
  .villages-forging-v2 .villages-founding-dialog>header>button {
    flex:none; width:44px; height:44px; padding:0; border-color:transparent; background:transparent;
  }
  .villages-forging-v2 .villages-founding-dialog>footer {
    padding:.65rem 0 0; background:transparent; border-color:var(--founding-line,#ad839b45);
  }
  .villages-forging-v2 .villages-founding-dialog :is(input:not([type=checkbox]),textarea,select) {
    background:var(--founding-field,#30283e); border-color:var(--founding-line,#9b768c8c); color:var(--founding-foreground,#f0dfbc);
  }
  .villages-forging-v2 .villages-founding-dialog .villages-forging-primary {
    background:var(--founding-primary,#a5ac8b); border-color:var(--founding-primary,#a5ac8b); color:var(--founding-on-primary,#292938);
  }
  .villages-forging-v2 .villages-founding-overlay>dialog.villages-chapter-menu {
    height:auto; overflow:hidden;
  }
  .villages-chapter-menu>.villages-forging-body { overflow:auto; padding:.35rem; }
  .villages-forging-v2 .villages-chapter-menu [role=alert] { color:var(--founding-error,#ff9ba5); }
  .villages-forging-v2 .villages-founding-overlay>dialog.villages-setting-fields-dialog { overflow:hidden; }
  .villages-setting-fields { min-height:0; overflow:auto; }
  .villages-setting-fields-dialog .villages-founding-field { margin:.4rem 0; }
  .villages-setting-fields-dialog .villages-founding-field-heading label { font-size:.9rem; }
  .villages-forging-v2 .villages-setting-fields-dialog .villages-founding-field-description { font-size:.8rem; line-height:1.35; }
  .villages-forging-v2 .villages-setting-fields-dialog textarea { min-height:3.5rem; height:3.5rem; }
  .villages-setting-fields-dialog .villages-founding-field-heading label>small { margin-inline-start:.45em; }
  .villages-forging-v2[data-step] {
    --mari-floor:12cqh;
    --mari-x:69cqw;
    --mari-height:min(120cqw,68cqh);
    --founding-mobile-backdrop-height:max(130cqh,82cqw);
    --founding-night-wash:linear-gradient(100deg,#271c350c,#271c3535 65%,#271c3580);
    background-position:center,center bottom;
    background-size:auto,auto var(--founding-mobile-backdrop-height);
  }
  .villages-forging-v2[data-step][data-lighting=day] {
    background-position:center,center,center bottom;
    background-size:auto,auto,auto var(--founding-mobile-backdrop-height);
  }
  .villages-setting-stage::before {
    inset-block-end:-.3rem; width:100%; height:.9rem;
    background:radial-gradient(ellipse,#231829b8,transparent 70%);
  }
  .villages-forging-steps { position:absolute; inset:.65rem auto auto 50%; translate:-50% 0; margin:0; }
  .villages-founding-chapter>.villages-chapter-guide { margin:0 .65rem .65rem; }
  .villages-forging-v2 .villages-forging-body>.villages-place-panels {
    display:flex; flex-direction:column; align-items:stretch; justify-content:safe flex-end;
    height:100%; padding:0 .65rem .65rem;
  }
  .villages-founding-hierarchy {
    --chart-width:clamp(10rem,45cqw,11.5rem);
    top:max(4rem,calc(100cqh - var(--mari-floor) - var(--mari-height) - 1rem));
    left:.7rem; right:auto; bottom:auto;
  }
  .villages-founding-title {
    position:absolute; inset:auto auto calc(var(--mari-floor) + var(--mari-height) * .57) .65rem;
    width:calc(var(--mari-x) - var(--mari-height) * .17 - 1.3rem);
    translate:0 50%; padding:0;
  }
  .villages-founding-logo { font-size:min(15cqi,2.75rem); }
  .villages-setting-guide .villages-setting-dialogue { z-index:1; padding:.75rem .85rem; font-size:1rem; }
  .villages-setting-guide .villages-founding-replies { margin-top:.4rem; }
  .villages-setting-guide .villages-founding-replies>button { padding:.45rem .85rem; }
  .villages-setting-guide .villages-founding-replies>button,
  .villages-forging-v2 .villages-founding-menu-actions>button { min-height:44px; }
  .villages-forging-v2 .villages-chapter-menu>footer.villages-founding-menu-actions {
    justify-content:space-between; align-items:center; flex-wrap:wrap;
    padding:.5rem .35rem 0; border-color:var(--founding-line,#ad839b62);
  }
  .villages-founding-menu-actions .villages-founding-next-reply { margin-inline-start:auto; }
  .villages-forging-v2[data-founding-keyboard=true] .villages-forging-body { margin-bottom:var(--founding-keyboard-inset) !important; }
  .villages-forging-v2[data-step="0"][data-founding-keyboard=true]::after { content:none; }
}
.villages-forging-v2 .villages-founding-overlay:has(> .villages-founding-venue-page) { padding:0; }
.villages-forging-v2 .villages-founding-overlay>dialog.villages-founding-venue-page[open] {
  width:100%; height:100%; max-width:100%; max-height:100%; padding:0; gap:0;
  border:0; border-radius:0; background:var(--founding-canvas,#302d47); box-shadow:none; outline:0;
}
.villages-forging-v2 .villages-founding-venue-workspace { container:village-desk / size; height:100%; --menu-font:"village-letter-lora",Georgia,serif; padding:0; flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; font:1rem/1.45 var(--menu-font); }
.villages-forging-v2 .villages-founding-venue-page .marinara-capability-villages-workspace-venue-header { display:block; padding:0 0 .5rem; background:transparent; }
.villages-forging-v2 .villages-founding-venue-page fieldset.villages-quick-venue-header,
.villages-founding-venue-page .villages-quick-zone-content { grid-template-columns:minmax(0,1fr); }
.villages-founding-venue-page .villages-founding-zone-use { grid-row:1; }
.villages-forging-v2 .villages-founding-venue-page fieldset.villages-founding-venue-choices { display:flex; flex-wrap:wrap; gap:.4rem; margin:.8rem 0; }
.villages-founding-venue-choices legend { margin-bottom:.3rem; }
.villages-forging-v2 .villages-founding-venue-choices button { color:var(--founding-foreground,#f0dfbc); background:var(--founding-control,#514157); border-color:var(--founding-line,#a87788); }
.villages-forging-v2 .villages-founding-venue-choices button[aria-pressed=true] { opacity:1; background:var(--founding-selected,#8c596d); border-color:var(--founding-selected-line,#dea2a7); }
.villages-forging-v2[data-desktop-map] {
  display:grid;
  grid-template-columns:clamp(.75rem,6%,7.5rem) clamp(10rem,19.5%,23rem) clamp(.7rem,2%,2.5rem) minmax(0,1fr) clamp(.75rem,3.5%,3.75rem);
  grid-template-rows:auto clamp(.75rem,5%,3.1rem) auto minmax(0,1fr) clamp(.75rem,6.5%,4rem);
}
.villages-forging-v2[data-desktop-map] .villages-forging-steps { grid-column:1 / -1; grid-row:1; }
.villages-forging-v2[data-desktop-map] .villages-founding-chapter[data-guided] { display:contents; }
.villages-forging-v2[data-desktop-map] .villages-chapter-guide { grid-area:3 / 2; align-content:start; min-height:0; }
.villages-forging-v2[data-desktop-map] .villages-setting-dialogue { padding:.75rem 1rem; }
.villages-forging-v2[data-desktop-map] .villages-setting-stage {
  grid-area:4 / 2; place-self:end; position:relative; left:auto; bottom:auto; translate:none;
  height:calc(100% - .5rem); max-height:min(60cqh,34rem,42cqw); margin-inline-end:clamp(.3rem,1.35cqw,1.75rem);
}
.villages-forging-v2[data-desktop-map] .villages-forging-body { grid-area:3 / 4 / 5 / 5; align-self:stretch; height:auto; padding:0; }
.villages-forging-v2[data-desktop-map] .villages-founding-map-artwork { height:100%; margin:0; }
.villages-forging-v2[data-desktop-map] .villages-founding-map-artwork .villages-quick-map-toolbar h2 { flex:1 0 min(13rem,100%); }
.villages-forging-v2[data-desktop-map] .villages-forging-body>.villages-founding-places { height:100%; }
.villages-forging-v2[data-desktop-map] .villages-quick-start {
  grid-template-columns:minmax(0,1fr) clamp(10rem,21cqw,17rem);
  grid-template-rows:auto minmax(0,1fr);
  gap:.75rem; padding:clamp(.6rem,1.25cqw,1.1rem);
  background:var(--founding-panel,#292438f5); border:1px solid var(--founding-line,#a6809199); border-radius:.8rem;
}
.villages-forging-v2[data-desktop-map] .villages-quick-start>.villages-quick-map-panel {
  display:grid; grid-column:1; grid-row:1 / -1; grid-template-rows:subgrid;
  height:auto; padding:0; border:0; background:none; overflow:visible;
}
.villages-forging-v2[data-desktop-map] .villages-quick-start>.villages-quick-map-panel h2 { overflow-wrap:anywhere; }
.villages-forging-v2[data-desktop-map] .villages-quick-map-panel .villages-quick-map { height:auto; min-height:0; flex:1; }
.villages-forging-v2[data-desktop-map] .villages-quick-map-panel>:is(.villages-quick-map,.villages-founding-venue-pane) { grid-area:2 / 1; }
.villages-quick-map[inert] { visibility:hidden; }
.villages-forging-v2:has(dialog.villages-chapter-map[open]) { background-image:none; background-color:var(--founding-panel,#292438); }
.villages-forging-v2 .villages-founding-overlay:has(>.villages-chapter-map) { padding:3.5rem 0 0; background:transparent; backdrop-filter:none; }
.villages-forging-v2 .villages-founding-overlay>dialog.villages-chapter-map[open] {
  width:100%; height:100%; max-width:100%; max-height:100%; padding:0; overflow:hidden; gap:0;
  border:0; border-radius:0; background:var(--founding-panel,#292438); box-shadow:none;
}
.villages-chapter-map>.villages-forging-body { display:flex; flex-direction:column; padding:0; overflow:hidden; }
.villages-chapter-map .villages-founding-places { flex:1; min-height:0; height:100%; }
.villages-chapter-map .villages-quick-start { display:flex; flex-direction:column; height:100%; min-height:0; gap:0; }
.villages-forging-v2 .villages-chapter-map .villages-quick-map-panel { display:grid; grid-template-rows:auto minmax(0,1fr); flex:1; min-height:0; height:100%; margin:0; padding:0; border:0; border-radius:0; background:var(--founding-panel,#292438); }
.villages-chapter-map .villages-quick-map-panel>:is(.villages-quick-map,.villages-founding-venue-pane) { grid-area:2 / 1; height:100%; min-height:0; border-radius:0; }
.villages-forging-v2 .villages-chapter-map .marinara-capability-villages-setup-map-viewport { max-height:none; }
.villages-forging-v2 .villages-chapter-map .marinara-capability-villages-map-camera-controls { display:flex; }
.villages-chapter-map .villages-quick-map-toolbar { padding:.5rem; border-bottom:1px solid var(--founding-line,#a6809180); }
.villages-forging-v2 .villages-chapter-map .villages-quick-map-toolbar .villages-founding-models { position:static; flex:none; }
.villages-chapter-map .villages-quick-map-toolbar h2 { font-size:1rem; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.villages-forging-v2 .villages-chapter-map>footer.villages-founding-menu-actions { flex:none; padding:.5rem; margin:0; border-top:1px solid var(--founding-line,#a6809180); flex-wrap:nowrap; }
.villages-chapter-map>footer>button { flex:1; }
.villages-founding-map-notice { flex:none; padding:.5rem; font-size:.85rem; }
.villages-founding-map-notice p { margin:0; }
.villages-founding-venue-pane { container:founding-editor / inline-size; min-width:0; min-height:0; overflow:hidden; border-radius:.5rem; background:var(--founding-panel,#292438); }
.villages-forging-v2[data-desktop-map] .villages-quick-start>.villages-quick-venue-list {
  grid-column:2; grid-row:2; align-self:start; height:auto; max-height:100%; padding:.65rem;
  background:var(--founding-panel,#352c44); border-color:var(--founding-line,#a6809160);
}

.villages-forging-v2 .villages-setting-dialogue.villages-dialogue-reader { padding:0; }
.villages-forging-v2 .villages-reader-speaker { color:var(--founding-foreground); }
.villages-forging-v2 .villages-setting-dialogue .marinara-capability-villages-chat-vn-reading { min-height:min(4.5rem,var(--villages-reading-page-height,4.5rem)); max-height:var(--villages-reading-page-height,none); overflow:auto; }
.villages-forging-v2 .villages-setting-dialogue .marinara-capability-villages-chat-vn-reading>p { font-size:1rem; color:var(--founding-foreground); margin:0; line-height:1.5; }
.villages-setting-dialogue .villages-reader-footer { border-color:var(--founding-line); }
.villages-setting-dialogue .villages-founding-replies { margin:0; min-height:44px; justify-content:space-between; }
.villages-setting-dialogue .villages-founding-replies>button[data-reader-direction=next]:last-child { margin-inline-start:auto; }
.villages-setting-dialogue[data-reader-page] [data-reader-direction=back] { visibility:hidden; }
.villages-setting-dialogue .villages-reader-page-back { position:absolute; bottom:.5rem; left:0; z-index:1; visibility:visible!important; }
.villages-setting-dialogue[data-reader-next-page] [data-reader-direction=next] { visibility:hidden; }
.villages-setting-dialogue .villages-reader-page-next { position:absolute; bottom:.5rem; right:0; z-index:1; visibility:visible!important; }
.villages-forging-v2 .villages-setting-dialogue:has(input,textarea,.villages-lorebook-inline) .marinara-capability-villages-chat-vn-reading { min-height:0; max-height:none; }
.villages-setting-dialogue:has(input,textarea,.villages-lorebook-inline) .villages-founding-replies { justify-content:flex-start; }
.villages-setting-dialogue .villages-reader-footer:has(.villages-lorebook-inline) { padding-block:0; border-top:0; }
.villages-setting-dialogue:has(.villages-lorebook-inline) .villages-reader-content { padding-block:.5rem; }

/* Review shares the Map's left guide rail; its overview never becomes a scrolling document. */
.villages-forging-v2[data-review] .villages-forging-body[data-step="4"] { display:flex; flex-direction:column; min-height:0; overflow:hidden; }
.villages-founding-review { display:flex; flex:1; flex-direction:column; min-width:0; min-height:0; gap:.65rem; padding:clamp(.6rem,1.1cqw,1rem); border:1px solid var(--founding-line); border-radius:.8rem; background:var(--founding-panel); }
.villages-forging-v2 .villages-founding-review>h2 { margin:0; font-size:clamp(1.1rem,2cqw,1.6rem); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.villages-review-fields { flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; justify-content:center; }
.villages-founding-review[data-page="people"] .villages-review-fields { justify-content:safe center; overflow:auto; gap:.65rem; }
.villages-founding-review[data-page="people"] .villages-review-fields>* { flex-shrink:0; }
.villages-review-fields .villages-people-panel>.villages-forging-card { padding:0; border:0; }
.villages-review-fields .villages-people-panel { width:100%; max-width:40rem; align-self:center; }
.villages-review-fields .villages-review-setting-editor { width:100%; max-width:48rem; align-self:center; }
.villages-forging-v2 .villages-review-actions { background:transparent; color:inherit; margin:0; padding:0; display:flex; flex:none; justify-content:space-between; gap:.5rem; padding-top:.5rem; border-top:1px solid var(--founding-line); }
.villages-forging-v2 .villages-review-actions>button { flex:none; width:auto; min-width:0; min-height:44px; padding:.4rem .7rem; white-space:nowrap; }
.villages-forging-v2 .villages-founding-overlay>dialog.villages-review-editor { display:flex; flex-direction:column; width:min(48rem,100%); max-height:100%; overflow:hidden; }
.villages-forging-v2 .villages-review-editor>footer { margin:0; padding:.5rem 0 0; border-top:1px solid var(--founding-line); background:transparent; color:inherit; display:flex; flex:none; justify-content:space-between; gap:.5rem; }
.villages-review-setting-editor { min-height:0; }
.villages-review-setting-editor>nav { display:flex; gap:.3rem; margin-bottom:.6rem; }
.villages-review-setting-editor>nav>button { flex:1; min-width:0; padding:.35rem .4rem; font-size:.85rem; }
.villages-review-setting-editor>fieldset { min-width:0; padding:0; margin:0; border:0; }
.villages-forging-v2 .villages-founding-overlay>dialog.villages-review-editor-map { width:min(80rem,100%); height:100%; }
.villages-review-editor-map .villages-founding-map-artwork { display:flex; flex-direction:column; flex:1; min-height:0; margin:0; }
.villages-review-editor-map .villages-quick-map { flex:1; height:auto; min-height:0; }
@media(max-width:727px) {
 .villages-forging-v2[data-review] .villages-founding-overlay>dialog.villages-chapter-menu { height:100%; max-height:100%; }
 .villages-forging-v2[data-review] .villages-chapter-menu>.villages-forging-body { flex:1; }
 .villages-founding-review { gap:.35rem; padding:.45rem; border:0; }
 .villages-forging-v2 .villages-founding-review>h2 { display:none; }
 .villages-forging-v2 .villages-review-actions { padding-top:.35rem; }
 .villages-forging-v2 .villages-review-actions>button { font-size:1rem; }
 .villages-review-setting-editor>nav { flex-wrap:wrap; }
 .villages-review-setting-editor>nav>button { flex:1 0 40%; }
}

@media(max-width:727px) {
 .villages-review-fields { justify-content:flex-start; }
 .villages-review-fields .villages-initial-residents { margin:.65rem 0 .35rem; }
 .villages-review-fields .villages-people-selected { gap:.35rem; margin:.35rem 0; }
 .villages-review-fields .villages-selected-villager { padding:.3rem .45rem; }
 .villages-review-fields .villages-people-identity { min-height:3.25rem; padding:.35rem .45rem; }
 .villages-review-fields .villages-review-setting-editor>nav { margin-bottom:.45rem; }
}
@media(min-width:728px) and (max-height:700px) {
 .villages-founding-review { gap:.35rem; padding:.5rem; }
 .villages-forging-v2 .villages-founding-review>h2 { font-size:1.1rem; }
 .villages-forging-v2 .villages-review-actions { padding-top:.3rem; }
}

.villages-forging-v2 .villages-review-map-options { position:relative; flex:none; z-index:12; margin:0; padding:0; border:0; }
.villages-review-map-options>summary { display:grid; place-items:center; min-width:44px; min-height:44px; padding:.2rem; border:1px solid var(--founding-line); border-radius:.5rem; cursor:pointer; font-size:1.5rem; list-style:none; background:var(--founding-control); }
.villages-review-map-options>summary::-webkit-details-marker { display:none; }
.villages-review-map-options>div { position:absolute; top:100%; right:0; display:flex; flex-direction:column; min-width:10rem; padding:.3rem; border:1px solid var(--founding-line); border-radius:.5rem; background:var(--founding-panel); box-shadow:0 .4rem 1.2rem #0004; }
.villages-review-map-options button { white-space:nowrap; }
.villages-quick-map-toolbar:has(.villages-review-map-options[open]) { position:relative; z-index:30; }
.villages-forging-v2[data-review-stage=map] .villages-forging-body>.villages-founding-places { flex:1; height:auto; min-height:0; }
.villages-forging-v2[data-review-scene] { --mari-x:28cqw; }
.villages-forging-v2[data-review-scene] .villages-founding-replies { flex-wrap:wrap; }
.villages-forging-v2[data-review-scene] .villages-founding-replies>p[role=alert] { flex:1 0 100%; margin:0; color:var(--founding-error); }
@media(min-width:728px) {
 .villages-forging-v2[data-review-scene] .villages-founding-chapter { padding-inline-start:calc(var(--mari-x) + 10cqw); }
}
`;
