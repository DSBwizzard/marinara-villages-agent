export const VILLAGES_FORGING_STYLES = `
/* Extra scroll reach sits outside layout, so a keyboard cannot compress a form or its footer. */
.villages-forging-v2 { position:relative; isolation:isolate; container:founding-stage / size; }
.villages-forging-v2[data-founding-keyboard=true],.villages-forging-v2 dialog[data-founding-keyboard=true] { overflow:auto!important; }
.villages-forging-v2[data-founding-keyboard=true]::after,.villages-forging-v2 dialog[data-founding-keyboard=true]::after { content:""; position:absolute; top:var(--founding-scroll-end,100%); left:0; width:1px; height:var(--founding-keyboard-inset); pointer-events:none; }
.villages-forging-v2 .villages-founding-dialog[data-header-input]>header { display:flex; gap:.6rem; padding:0; background:transparent; align-items:center; }
.villages-founding-dialog[data-header-input]>header>input { flex:1; min-width:0; width:auto; margin:0; }
.villages-founding-dialog[data-header-input]>header>button { flex:none; width:44px; height:44px; padding:0; }
.villages-character-choice { border:1px solid #596b9b; background:#192c4c; color:#f3f3ff; }
.villages-forging-v2 .villages-character-add { flex:none; width:44px; height:44px; padding:0; border-radius:.4rem; font-size:.8rem; }
/* Helpers stay in the top layer, leaving form geometry unchanged. */
.villages-founding-help-popup { position:fixed; inset:auto; margin:0; max-width:calc(100vw - 32px); max-height:calc(100dvh - 32px); overflow:auto; box-sizing:border-box; padding:1rem; border:1px solid #596b9b; border-radius:.6rem; background:#19213b; color:#f3f3ff; box-shadow:0 .5rem 2rem #0006; font:inherit; }
.villages-founding-help-popup:popover-open { display:block; }
.villages-founding-help-popup[data-mobile] { inset:0; margin:auto; width:min(28rem,calc(100vw - 32px)); height:fit-content; }
.villages-founding-help-popup[data-mobile]::backdrop { background:rgb(0 0 0 / 25%); }
.villages-founding-help-popup header { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin:0 0 .6rem; }
.villages-founding-help-popup header h3 { margin:0; font-size:1rem; }
.villages-founding-help-popup header button,.villages-forging-preparing button { flex:none; min-width:44px; min-height:44px; padding:.25rem; border:1px solid #596b9b; border-radius:.5rem; color:inherit; background:#192c4c; font:inherit; cursor:pointer; }
.villages-founding-help-popup [role=note] { font-size:.9rem; line-height:1.5; overflow-wrap:anywhere; }
.villages-life-heading { display:flex; align-items:center; gap:.2rem; }
.villages-forging-v2 .villages-life-heading h3 { margin:0; }
.villages-forging-v2 .villages-initial-residents { margin:1.4rem 0 .65rem; }
.villages-selected-villager { display:flex; align-items:center; gap:.65rem; padding:.5rem .65rem; }
.villages-selected-resident>.marinara-capability-villages-identity-card-face { flex:none; width:2.5rem; height:2.5rem; }
.villages-forging-v2 .villages-selected-resident { display:flex;align-items:center;gap:.65rem;flex:1;min-width:0;padding:0;border:0;background:transparent!important;text-align:left; }
.villages-selected-name { flex:1; min-width:0; overflow-wrap:anywhere; }
.villages-forging-v2 .villages-remove-resident { flex:none; min-width:44px; min-height:44px; padding:.25rem; border:0; background:transparent; color:#c4a8ff; }
.villages-people-selected+button { width:100%; }
.villages-space-connections { min-width:0; max-width:100%; margin:.75rem 0; }
.villages-space-connections legend,.villages-space-connections li { overflow-wrap:anywhere; }
.villages-space-connections label { display:block; margin:.5rem 0; }
.villages-space-connections select { display:block; max-width:100%; width:100%; min-height:44px; }
.villages-space-connections button { min-height:44px; max-width:100%; white-space:normal; }
.villages-space-connections ul { padding-left:1.25rem; }
.villages-space-connections li { margin:.5rem 0; }

.villages-forging-v2 { --background:#121936; --popover:#141b39; --foreground:#f3f3ff; --muted-foreground:#c1c9e9; --border:#596b9b; display:flex; flex-direction:column; height:100%; max-height:100dvh; min-height:0; padding:0!important; overflow:hidden; color:#f3f3ff; background:#121936; }
.villages-forging-v2 *, .villages-forging-editor * { box-sizing:border-box; }
.villages-forging-v2 h1 { font-size:1.25rem; margin:0; } .villages-forging-v2 h1 span { font-weight:400; }
.villages-forging-v2 h2 { font-size:1.65rem; margin:.2rem 0 .6rem; } .villages-forging-v2 h3 { margin:.1rem 0 .65rem; } .villages-forging-v2 h4 { margin:.1rem 0; }
.villages-forging-v2 p { line-height:1.5; margin:.5rem 0 .8rem; color:#c1c9e9; overflow-wrap:anywhere; }
.villages-forging-v2 button { font:inherit; min-height:44px; border:1px solid #596b9b; border-radius:.5rem; color:#f3f3ff; background:#192c4c; padding:.55rem .8rem; cursor:pointer; }
.villages-forging-v2 button:disabled { opacity:.55; cursor:default; } .villages-forging-v2 button:focus-visible,.villages-forging-v2 summary:focus-visible { outline:3px solid #c1acff; outline-offset:3px; }
.villages-forging-v2 button[aria-pressed=true],.villages-forging-v2 .villages-forging-primary { background:#6650cf; border-color:#9d88f4; }
.villages-forging-body { flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; padding:1rem 1.25rem 1.5rem; }
.villages-forging-kicker { font-size:.85rem; }
.villages-forging-columns { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:1rem; align-items:start; }
.villages-forging-spaces { grid-template-columns:minmax(0,1.45fr) minmax(0,1fr); }
.villages-forging-card { border:1px solid #43547d; border-radius:.8rem; padding:1rem; background:linear-gradient(135deg,#192441,#141b39); min-width:0; margin-bottom:1rem; }
.villages-forging-card-heading { display:flex; justify-content:space-between; gap:.6rem; align-items:start; margin-bottom:.4rem; }
.villages-forging-card-heading h3 { flex:1; }
.villages-forging-v2 label { display:flex; flex-wrap:wrap; gap:.4rem; align-items:center; margin:.75rem 0; line-height:1.45; }
.villages-forging-v2 label>input:not([type=checkbox]),.villages-forging-v2 label>select,.villages-forging-v2 label>textarea,.villages-forging-v2 details>textarea { width:100%; min-width:0; min-height:44px; border:1px solid #65799c; border-radius:.45rem; padding:.6rem; color:#f3f3ff; background:#0c1830; font:inherit; }
.villages-forging-v2 textarea { resize:none; } .villages-forging-v2 input[type=checkbox] { width:1.2rem; height:1.2rem; }
.villages-forging-v2 details { margin:.7rem 0; border-top:1px solid #43547d; padding:.6rem 0; } .villages-forging-v2 summary { cursor:pointer; line-height:1.5; }
.villages-forging-actions { display:flex; flex-wrap:wrap; gap:.5rem; align-items:center; margin:.6rem 0; }
.villages-forging-card figure { margin:0; } .villages-forging-card figcaption { color:#c1c9e9; line-height:1.5; overflow-wrap:anywhere; }
.villages-forging-placement,.villages-forging-notice { background:#29264f; border:1px solid #7d69c7; border-radius:.6rem; padding:.7rem; }
.villages-forging-map .marinara-capability-villages-setup-map-viewport { min-height:14rem; border:1px solid #5268a0; border-radius:.6rem; overflow:hidden; }
.villages-forging-map .marinara-capability-villages-stage { min-height:14rem; }
.villages-forging-venue { margin-top:.8rem; padding:.8rem; border:1px solid #43547d; border-radius:.6rem; background:#192441; }
.villages-forging-editor { width:min(76rem,96vw); max-height:92dvh; }
.villages-forging-editor .villages-forging-editor-top { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; }
.villages-forging-editor .villages-forging-zone-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1rem; align-items:start; }
.villages-forging-zone-grid>section { min-width:0; border:1px solid #51688c; border-radius:.6rem; padding:.7rem; }
.villages-forging-editor img { max-width:100%; max-height:12rem; object-fit:contain; }
.villages-forging-editor .villages-forging-zone-grid label { display:block; }
.villages-forging-preparing { background:radial-gradient(circle at 50% 30%,#29264f,#121936 70%)!important; color:#f3f3ff!important; overflow:auto; }
.villages-forging-preparing>div { width:min(36rem,100%); box-sizing:border-box; }
.villages-forging-preparing progress { width:100%; height:1rem; accent-color:#9d88f4; }
.villages-forging-preparation-list { list-style:none; padding:0; text-align:left; }
.villages-forging-preparation-list li { padding:.8rem; margin:.6rem 0; border:1px solid #596b9b; border-radius:.5rem; }
.villages-forging-preparing details { text-align:left; border-top:1px solid #596b9b; padding:1rem 0; }
.villages-forging-v2 .villages-resident-help { font-size:.82rem; line-height:1.4; margin:.3rem 0; color:#c1c9e9; }
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
.villages-resident-review { padding:.6rem 0; border-bottom:1px solid #43547d; overflow-wrap:anywhere; }
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
 .villages-resident-toggle small { color:#c1c9e9; font-size:.8rem; }
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
.villages-founding-field>input,.villages-founding-field>textarea,.villages-founding-field>select { width:100%; min-width:0; min-height:44px; border:1px solid var(--border,#65799c); border-radius:.45rem; padding:.6rem; color:var(--foreground,#f3f3ff); background:var(--background,#0c1830); font:inherit; }
.villages-founding-help { flex:none; display:inline-flex; align-items:center; flex-wrap:wrap; vertical-align:middle; max-width:100%; font-weight:400; }
.villages-founding-help>button { display:grid; place-items:center; width:44px; min-width:44px; height:44px; padding:0; border:0; background:transparent; color:inherit; }
.villages-founding-help>button>span { display:grid; place-items:center; width:18px; height:18px; border:1px solid currentColor; border-radius:50%; font:12px Arial,sans-serif; }
.villages-admission-fields .villages-founding-help>button { min-height:44px; padding:0; border:0; border-radius:0; background:transparent; }
.villages-forging-v2 [role=alert] { color:#ff9ba5; }
.villages-forging-v2 [aria-invalid=true] { border-color:#ff9ba5; }


/* People uses the same selected identity geometry on every device. */
.villages-people-identity { display:flex!important; align-items:center; gap:.65rem; text-align:left; width:100%; min-width:0; padding:.65rem!important; border-radius:.65rem!important; }
.villages-people-identity>span:nth-child(2) { display:flex; flex:1; flex-direction:column; min-width:0; gap:.15rem; }
.villages-people-identity strong { overflow-wrap:anywhere; }
.villages-people-identity small { display:block!important; color:#c1c9e9; font-size:.8rem; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.villages-people-identity .marinara-capability-villages-identity-card-face { flex:none; width:2.5rem!important; height:2.5rem!important; }
.villages-people-identity[aria-pressed=true] { background:#30305c!important; border-color:#aa87ff!important; box-shadow:inset 0 0 0 1px #aa87ff; }
.villages-people-action { flex:none; font-size:.8rem; color:#c4a8ff; }
.villages-people-selected,.villages-people-choices { display:grid; gap:.5rem; margin:.5rem 0; }
.villages-selected-villager { min-width:0; border:1px solid #43547d; border-radius:.65rem; background:#19243f; }
.villages-selected-villager[data-selected=true] { border-color:#aa87ff;background:#30305c;box-shadow:inset 0 0 0 1px #aa87ff; }
.villages-forging-v2 .villages-selected-villager>.villages-people-identity { border:0; box-shadow:none; background:transparent!important; }
.villages-embedded-backstory { margin:0 .65rem; border-top:1px solid #596b9b; min-width:0; }
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
.villages-backstory-row>select { flex:1.7; min-width:0; width:auto; max-width:100%; min-height:44px; font:inherit; font-size:.9rem; color:#f3f3ff; background:#141b39; border:1px solid #8574be; border-radius:.5rem; padding:.5rem; }
.villages-founding-dialog { position:fixed; box-sizing:border-box; width:min(30rem,calc(100vw - 1.5rem)); max-width:calc(100vw - 1.5rem); max-height:calc(100dvh - 1.5rem); margin:auto; padding:1rem; overflow:auto; overscroll-behavior:contain; color:#f3f3ff; background:#141b39; border:2px solid #9d78ed; border-radius:.8rem; box-shadow:0 1rem 4rem #0009; font:inherit; }
.villages-founding-dialog::backdrop { background:#090c1a99; }
.villages-founding-dialog * { box-sizing:border-box; }
.villages-founding-dialog header { display:flex; align-items:center; gap:.5rem; margin-bottom:.75rem; }
.villages-founding-dialog h3 { flex:1; margin:0; font-size:1.1rem; overflow-wrap:anywhere; }
.villages-founding-dialog button { min-height:44px; min-width:44px; font:inherit; border:1px solid #596b9b; border-radius:.5rem; color:#f3f3ff; background:#192c4c; padding:.5rem .7rem; cursor:pointer; }
.villages-founding-dialog button:disabled { opacity:.55; }
.villages-founding-dialog button:focus-visible { outline:3px solid #c1acff; outline-offset:2px; }
.villages-founding-dialog input,.villages-founding-dialog textarea,.villages-founding-dialog select { display:block; width:100%; min-width:0; min-height:44px; font:inherit; font-size:1rem; color:#f3f3ff; background:#10172f; border:1px solid #8574be; border-radius:.5rem; padding:.55rem; }
.villages-founding-dialog textarea { resize:none; max-height:14rem; }
.villages-founding-dialog label { display:block; margin:.7rem 0 .35rem; }
.villages-founding-dialog p[role=alert] { color:#ffb9bc; }
.villages-founding-dialog footer { display:flex; justify-content:flex-end; gap:.5rem; padding-top:.75rem; }
.villages-founding-dialog .villages-forging-primary { background:#6650cf; border-color:#9d88f4; }

/* Backstory dialogs keep their content height on phones. */
.villages-forging-v2 .villages-founding-dialog[data-compact=true] { display:block; inset:0; width:min(26rem,calc(100vw - 2rem)); height:fit-content; min-height:0; max-height:calc(100dvh - 2rem); padding:.75rem; border:2px solid #9d78ed; border-radius:.8rem; overflow:auto; }
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
.villages-place-panels .villages-founding-field+.villages-founding-field { border-top:1px solid #43547d; padding-top:.65rem; margin-top:.65rem; }
.villages-forging-v2 .villages-place-map-choice { display:flex; align-items:center; justify-content:space-between; gap:.65rem; width:100%; text-align:left; background:#30305c; border-color:#aa87ff; box-shadow:inset 0 0 0 1px #aa87ff; border-radius:.65rem; padding:.65rem; }
.villages-forging-v2 .villages-founding-dialog[data-scroll-body=true] { display:flex; flex-direction:column; overflow:hidden; }
.villages-forging-v2 .villages-founding-dialog[data-scroll-body=true]>header { flex:none; }
.villages-forging-v2 .villages-founding-dialog[data-scroll-body=true]>footer { flex:none; margin-top:.65rem; border-top:1px solid #43547d; }
.villages-place-map-editor { min-width:0; padding:.15rem .2rem; }
.villages-map-sources { display:grid; gap:.5rem; }
.villages-map-sources>button { display:flex; align-items:center; gap:.75rem; width:100%; text-align:left; }
.villages-map-sources>button[aria-pressed=true] { background:#30305c; border-color:#aa87ff; }
.villages-map-source-indicator { display:block; width:1.3rem; height:1.3rem; flex:none; border:2px solid #91a5cf; border-radius:50%; }
.villages-map-sources>button[aria-pressed=true] .villages-map-source-indicator { background:#9470ef; border-color:#bb9cff; box-shadow:inset 0 0 0 3px #30305c; }
.villages-map-source-title { display:block; }
.villages-map-sources small { display:block; color:#b8c3e8; margin-top:.2rem; line-height:1.4; }
.villages-place-map-editor .villages-founding-field-heading label small { color:#b8c3e8; font-size:.8rem; margin-left:.5rem; }
.villages-map-context { color:#b8c3e8; font-size:.9rem; line-height:1.4; }
.villages-map-generate { width:100%; margin-top:.65rem; }
.villages-place-map-editor input[type=checkbox] { display:inline-block; width:1.2rem; min-height:0; vertical-align:middle; }



.villages-forging-v2 dialog.villages-workspace-sheet { inset:auto 1rem 1rem auto; margin:0; width:min(28rem,calc(100vw - 2rem)); height:min(26rem,65dvh); max-height:calc(100dvh - 1rem); padding:.75rem; padding-bottom:calc(32px + .45rem)!important; display:flex; flex-direction:column; gap:.25rem; border:1px solid #8574be; overflow:hidden; background:#192441; }
.villages-forging-v2 dialog.villages-workspace-sheet:not([open]) { display:none; }
.villages-workspace-sheet::backdrop { background:#090c1a66; }
.villages-forging-v2 .villages-workspace-sheet .villages-workspace-title { flex:none; margin:0!important; padding:0 .1rem!important; color:#c1cce5; font-size:.9rem; line-height:1.15; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.villages-forging-v2 .villages-workspace-sheet-header { flex:none; display:flex; flex-direction:column; align-items:stretch; gap:.35rem; padding:.5rem; border-radius:.65rem; margin:0!important; }
.villages-forging-v2 .villages-workspace-sheet .villages-workspace-caption { display:block; margin:0; padding:0; font-size:.7rem; line-height:1.2; color:#c1cce5; }
.villages-workspace-box-field { min-width:0; }
.villages-workspace-box-field .villages-workspace-sheet-summary { margin-top:.15rem; }
.villages-workspace-venue-identity { margin-bottom:.4rem!important; }
.villages-workspace-zone-fields { margin-top:.4rem!important; }
.villages-forging-v2 .villages-workspace-sheet-header textarea { width:100%; min-width:0; min-height:44px; border:1px solid #65799c; border-radius:.45rem; padding:.4rem; color:#f3f3ff; background:#0c1830; font:inherit; resize:none; }
.villages-workspace-sheet-header>textarea { font-weight:700; }
.villages-workspace-sheet-header .villages-workspace-inline { flex:1; min-width:0; }
.villages-workspace-sheet-header input { font-weight:700; }
.villages-workspace-sheet-summary { flex:none; position:relative; display:flex; align-items:center; gap:.2rem; }
.villages-workspace-sheet-summary textarea { flex:1; min-width:0; }
.villages-workspace-inline { display:flex; align-items:center; flex-wrap:wrap; gap:.2rem; }
.villages-forging-v2 .villages-workspace-inline input { flex:1; width:0; padding:.2rem; background:transparent; border-color:transparent; }
.villages-forging-v2 .villages-workspace-inline input:focus { border-color:#aa87ff; background:#10172f; }
.villages-forging-v2 .villages-workspace-inline button { padding:.25rem; border:0; background:transparent; color:#c4a8ff; flex:none; }
.villages-workspace-inline p { width:100%; margin:.2rem 0; }
.villages-workspace-tabs { display:flex; flex:none; border-bottom:1px solid #596b9b; }
.villages-forging-v2 .villages-workspace-tabs button { flex:1; min-width:0; border:0; border-radius:0; background:transparent; min-height:30px; padding:.1rem .2rem; line-height:1.15; color:#c1cce5; font-size:.8rem; }
.villages-forging-v2 .villages-workspace-tabs button[aria-selected=true] { color:#c4a8ff; border-bottom:3px solid #aa87ff; }
.villages-forging-v2 .villages-workspace-sheet .villages-founding-help>button { display:grid; place-items:center; width:44px; min-width:44px; height:44px; min-height:44px; padding:0; border:0; border-radius:0; background:transparent; color:inherit; box-shadow:none; }
.villages-workspace-sheet .villages-founding-field-heading,.villages-workspace-sheet .villages-workspace-purpose,.villages-workspace-sheet .villages-workspace-inclusion,.villages-workspace-sheet-body section { position:relative; }
.villages-forging-v2 .villages-workspace-purpose-input { width:100%; min-width:0; min-height:44px; margin:.35rem 0; padding:.4rem; border:1px solid #65799c; border-radius:.45rem; color:#f3f3ff; background:#0c1830; font:inherit; resize:none; }
.villages-workspace-sheet-body { flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; padding:.25rem .1rem; }
.villages-workspace-inclusion { display:flex; align-items:center; justify-content:flex-start; }
.villages-workspace-purpose { color:#c1cce5; display:flex; align-items:center; justify-content:space-between; margin:0 0 .35rem; }
.villages-workspace-sheet .villages-founding-field { margin:.35rem 0; }
.villages-workspace-sheet .villages-founding-field-heading { font-size:.85rem; }
.villages-forging-v2 .villages-workspace-sheet .villages-workspace-included { display:flex; align-items:center; gap:.4rem; margin:0; font-size:.85rem; }
.villages-forging-v2 .villages-workspace-included input { width:1.2rem; min-height:1.2rem; height:1.2rem; accent-color:#aa87ff; }
.villages-workspace-sheet .villages-workspace-artwork { margin:.4rem 0; font-size:.9rem; }
.villages-forging-v2 .villages-workspace-image-preview,.villages-workspace-image-placeholder { display:block; width:8rem; height:5rem; margin:.6rem auto; padding:.2rem; border:1px solid #65799c; border-radius:.45rem; background:#0c1830; }
.villages-workspace-image-placeholder { text-align:center; align-content:center; font-size:.75rem; color:#c1cce5; }
.villages-workspace-image-preview img { width:100%; height:100%; object-fit:contain; }
.villages-workspace-image-viewer { position:fixed; inset:0; margin:auto; width:fit-content; max-width:90vw; max-height:90dvh; padding:.5rem; border:1px solid #8574be; border-radius:.6rem; background:#10172f; color:#f3f3ff; }
.villages-workspace-image-viewer::backdrop { background:#090c1acc; }
.villages-workspace-image-viewer img { display:block; max-width:85vw; max-height:80dvh; object-fit:contain; }
.villages-workspace-image-viewer button { display:block; margin:0 0 .4rem auto; min-height:32px; padding:.25rem .5rem; border:1px solid #65799c; border-radius:.4rem; background:#192c4c; color:inherit; }
.villages-workspace-image-actions { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.35rem; margin-top:.35rem; }
.villages-forging-v2 .villages-workspace-image-actions button { min-width:0; min-height:44px; padding:.25rem; font-size:.75rem; line-height:1.2; }
.villages-forging-v2 .villages-workspace-sheet-footer { position:absolute; bottom:0; left:0; right:0; flex:none; display:block!important; border-top:1px solid #43547d; padding:.2rem .75rem!important; margin:0!important; min-height:0; background:#192c4c; }
.villages-workspace-sheet-footer p { font-size:.75rem; color:#c1cce5; text-align:center; margin:0 0 .25rem; }
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
.villages-workspace-list { border-top:1px solid #43547d; margin-top:1rem; padding-top:.8rem; }
.villages-workspace-draft { width:100%; margin:.2rem 0 .65rem; }
.villages-forging-v2 .villages-workspace-venue { display:flex; align-items:center; gap:.65rem; width:100%; min-width:0; text-align:left; margin:.5rem 0; padding:.5rem .65rem; border-radius:.65rem; background:#192441; }
.villages-forging-v2 .villages-workspace-venue[aria-pressed=true] { background:#30305c; border-color:#aa87ff; box-shadow:inset 0 0 0 1px #aa87ff; }
.villages-workspace-venue>span:nth-child(2) { flex:1; min-width:0; }
.villages-workspace-venue strong,.villages-workspace-venue small { display:block; overflow-wrap:anywhere; }
.villages-workspace-venue small { color:var(--muted-foreground); }
.villages-workspace-photo { width:2.5rem; flex:none; padding:.2rem .2rem .45rem; background:#f5f3ee; }
.villages-workspace-photo>span,.villages-workspace-photo img { display:block; width:100%; aspect-ratio:1; object-fit:contain; background:#d3d6df; }
.villages-workspace-detail-heading h3 { margin:0; overflow-wrap:anywhere; }
.villages-workspace-back button { padding:0; border:0; background:transparent; color:#c4a8ff; }
.villages-workspace-assignment { display:flex; align-items:center; gap:.65rem; border-bottom:1px solid #43547d; margin-bottom:.65rem; }
.villages-workspace-assignment p { flex:1; }
.villages-workspace-assignment button { flex:none; }
.villages-workspace fieldset { min-width:0; margin:0; padding:0; border:0; }
.villages-workspace-artwork img { max-width:100%; max-height:12rem; object-fit:contain; }
.villages-workspace-artwork summary small { display:inline; margin-left:.5rem; color:var(--muted-foreground); }
.villages-workspace-space summary small { display:block; color:var(--muted-foreground); margin-left:1rem; }
.villages-workspace-space section { margin-top:.65rem; }
.villages-workspace-save { border-top:1px solid #43547d; padding-top:.65rem; }
.villages-workspace .marinara-capability-villages-stage[data-photo-pins="true"][data-mobile="false"] .marinara-capability-villages-pin { display:grid; place-items:center; padding:0; min-width:44px; min-height:44px; width:auto; height:auto; background:transparent; border:0; touch-action:none; }
.villages-workspace .marinara-capability-villages-stage[data-photo-pins="true"] .marinara-capability-villages-pin-photo-card { width:36px; transform:none!important; transition:transform .12s; }
.villages-workspace .marinara-capability-villages-pin-name { display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; white-space:normal; font-size:8px; line-height:1.2; max-height:1.2em; overflow:hidden; }
.villages-workspace .marinara-capability-villages-stage[data-compact-photos="true"] .marinara-capability-villages-pin:focus-visible .marinara-capability-villages-pin-photo-card { transform:scale(2)!important; }
.villages-workspace .marinara-capability-villages-pin-holder:focus-within { z-index:30; }
@media(hover:hover) and (pointer:fine) {
 .villages-workspace .marinara-capability-villages-stage[data-compact-photos="true"] .marinara-capability-villages-pin:hover .marinara-capability-villages-pin-photo-card { transform:scale(2)!important; }
 .villages-workspace .marinara-capability-villages-pin-holder:hover { z-index:30; }
}
.villages-workspace .marinara-capability-villages-pin[data-selected="true"] .marinara-capability-villages-pin-photo-card { outline:3px solid #aa87ff; outline-offset:3px; }

.villages-venue-heading { display:flex; align-items:center; justify-content:space-between; gap:.5rem; flex:none; }
.villages-forging-v2 .villages-venue-heading h2 { min-width:0; margin:0; font-size:1.1rem; }
.villages-quick-start { display:grid; grid-template-columns:minmax(21rem, .8fr) minmax(0,1.2fr); align-items:start; gap:1rem; width:100%; min-width:0; min-height:0; }
.villages-quick-venue-list,.villages-quick-map-panel { min-width:0; margin:0; }
.villages-quick-venue-list { display:flex; flex-direction:column; gap:.8rem; }
.villages-quick-venue-list>.villages-venue-heading { flex-wrap:wrap; }
.villages-quick-venue-actions { display:flex; align-items:center; flex-wrap:wrap; gap:.4rem; }
.villages-quick-venue-card { padding:.85rem; border:1px solid #596b9b; border-radius:.65rem; min-width:0; background:#192441; }
.villages-quick-venue-card[data-selected=true] { border-color:#ae8aff; box-shadow:inset 0 0 0 1px #ae8aff; }
.villages-quick-venue-summary { display:flex; align-items:center; gap:.65rem; min-width:0; }
.villages-quick-venue-thumbnail { width:4.5rem; height:4.5rem; border-radius:.4rem; object-fit:cover; flex:none; }
.villages-quick-venue-title { flex:1; min-width:0; }
.villages-quick-venue-title h3 { display:inline; margin:0; }
.villages-forging-v2 .villages-quick-venue-title h3>button { display:inline; border:0; border-radius:0; background:transparent; padding:0; min-height:44px; text-align:left; font-weight:600; overflow-wrap:anywhere; }
.villages-quick-venue-badge { display:inline-block; border:1px solid #8277b7; border-radius:.7rem; padding:.15rem .5rem; margin-left:.35rem; font-size:.8rem; line-height:1.25; background:#343359; }
.villages-quick-venue-title p { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin:.2rem 0; }
.villages-quick-home-people { display:flex; flex-wrap:wrap; gap:.35rem .65rem; padding:0; margin:.35rem 0 .6rem; border:0; min-width:0; }
.villages-quick-home-people legend { font-size:.9rem; color:#c1c9e9; margin-bottom:.15rem; }
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
.villages-quick-map { --explore-selected:#a88aff; --explore-border:#343f51; --explore-text:#edf0f5; display:flex; flex:0 0 auto; height:clamp(14rem,40dvh,32rem); min-width:0; min-height:14rem; position:relative; overflow:hidden; border-radius:.5rem; }
.villages-quick-map>.villages-forging-map { display:flex; flex-direction:column; flex:1; min-height:0; min-width:0; }
.villages-quick-map .marinara-capability-villages-setup-map-viewport { flex:1; min-height:0; border:0; border-radius:0; overflow:hidden; }
.villages-forging-map .marinara-capability-villages-stage[data-exploration=true] { height:clamp(14rem,calc(var(--founding-viewport-height,100dvh) * .4),32rem)!important; }
.villages-quick-map .marinara-capability-villages-stage[data-exploration=true] { height:100%!important; min-height:0; }
.villages-quick-map>p { position:absolute; top:.5rem; left:.5rem; right:.5rem; z-index:7; margin:0; padding:.5rem; border-radius:.4rem; background:#141b39ed; }
.villages-forging-v2 dialog.villages-quick-dialog[open] { display:flex; flex-direction:column; gap:1rem; width:min(92rem,100%); height:min(48rem,100%); max-height:100%; max-width:100%; padding:1.5rem; overflow:hidden; background:linear-gradient(135deg,#192441,#141b39); container:founding-editor / inline-size; }
.villages-forging-v2 .villages-quick-dialog>header { flex:none; margin:0; padding:0; background:transparent; }
.villages-forging-v2 .villages-quick-dialog>header h3 { font-size:1.5rem; }
.villages-forging-v2 .villages-quick-dialog>header>button { width:auto; height:auto; }
.villages-quick-editor-body { display:flex; flex-direction:column; gap:1rem; flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; }
.villages-quick-footer { flex:none; align-items:center; }
.villages-forging-v2 .villages-quick-dialog>.villages-quick-footer { padding:.75rem 0 0; background:transparent; }
.villages-forging-v2 .villages-quick-dialog>.villages-quick-footer button { flex:none; }
.villages-quick-home-capacity { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:.5rem; font-size:.9rem; margin:.3rem 0; }
.villages-forging-v2 .villages-quick-home-capacity label { display:flex; align-items:center; gap:.5rem; margin:0; }
.villages-quick-home-capacity select { width:auto; }
.villages-forging-v2 .villages-quick-sleeping { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.4fr); gap:.5rem; align-items:center; font-size:.9rem; margin:.5rem 0; }
.villages-quick-sleeping select { min-width:0; }
.villages-quick-panel { display:grid; grid-template-columns:11rem minmax(0,1fr); gap:1.5rem; flex:1; min-height:0; align-content:start; padding:0 .1rem; }
.villages-quick-panel:has(.villages-founding-zone-nav[data-editing=true]) { grid-template-columns:minmax(0,1fr); }
.villages-quick-panel:has(.villages-founding-zone-nav[data-editing=true])>.villages-quick-selected-zone { display:none; }
.villages-forging-v2 .villages-quick-dialog fieldset.villages-quick-venue-header { display:grid; grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr); align-items:start; gap:.75rem; flex:none; }
.villages-quick-venue-header label { margin:0; font-size:.8rem; }
.villages-forging-v2 .villages-quick-dialog .villages-quick-venue-header input,.villages-forging-v2 .villages-quick-dialog .villages-quick-venue-header textarea { height:3rem; min-height:3rem; font-size:1rem; font-weight:400; resize:none; }
.villages-quick-zone-content { display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,1fr); gap:1rem; align-items:start; margin-top:.75rem; }
.villages-quick-zone-content .villages-quick-art { display:flex; flex-direction:column; gap:.5rem; min-width:0; }
.villages-quick-zone-content .villages-quick-art img { flex:none; }
.villages-quick-zone-fields .villages-quick-zone-access { display:flex; align-items:center; gap:.5rem; }
.villages-quick-zone-access input { width:auto; }
@container founding-editor (max-width:48rem) { .villages-quick-zone-content { grid-template-columns:minmax(0,1fr); } }
@media(max-width:727px) { .villages-forging-v2 .villages-quick-dialog fieldset.villages-quick-venue-header { grid-template-columns:minmax(0,1fr); } }
.villages-quick-footer { display:flex; flex-wrap:wrap; justify-content:flex-end; border-top:1px solid #43547d; padding:.55rem 0; margin:0; background:transparent; }
.villages-quick-footer p { flex-basis:100%; margin:0 0 .5rem; }
.villages-quick-panel .villages-zone-map { margin:0; }
.villages-quick-dialog h3 { margin:.2rem 0; overflow-wrap:anywhere; }
.villages-quick-dialog p { color:#c1c9e9; line-height:1.5; }
.villages-forging-v2 .villages-quick-dialog fieldset { min-width:0; border:0; padding:0; margin:0; }
.villages-quick-dialog fieldset { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 .75rem; align-content:start; }
.villages-quick-field-error { display:block; margin-top:.2rem; color:#ffb9bc; font-size:.75rem; line-height:1.25; }
.villages-quick-dialog [aria-invalid=true] { border-color:#ffb9bc; }
.villages-quick-dialog .villages-quick-zone-fields { display:flex; flex-direction:column; gap:.6rem; min-width:0; }
.villages-quick-dialog .villages-quick-zone-fields label { margin:0; font-size:.8rem; }
.villages-quick-zone-fields input,.villages-quick-zone-fields textarea { margin-top:.2rem; }
.villages-founding-zone-nav { display:flex; flex-direction:column; align-items:stretch; gap:.75rem; min-width:0; }
.villages-quick-panel>.villages-founding-zone-nav[data-editing=false] { border-right:1px solid #43547d; padding-right:1rem; }
.villages-founding-zone-choices { display:flex; flex-direction:column; gap:.5rem; }
.villages-founding-zone-choices button { overflow-wrap:anywhere; touch-action:manipulation; }
.villages-founding-zone-nav-heading,.villages-quick-zone-heading,.villages-quick-art-header { display:flex; align-items:center; gap:.5rem; padding:0; background:transparent; }
.villages-forging-v2 .villages-quick-dialog .villages-founding-zone-nav-heading,.villages-forging-v2 .villages-quick-dialog .villages-quick-zone-heading,.villages-forging-v2 .villages-quick-dialog .villages-quick-art-header { margin:0; padding:0; background:transparent; }
.villages-founding-zone-nav-heading { justify-content:space-between; }
.villages-forging-v2 .villages-founding-zone-nav-heading h3 { margin:0; font-size:1.15rem; }
.villages-forging-v2 .villages-founding-zone-nav-heading button { flex:none; min-height:44px; padding:.35rem .6rem; font-size:.85rem; background:transparent; border-color:#60708f; }
.villages-forging-v2 .villages-quick-dialog fieldset.villages-quick-selected-zone { display:block; min-width:0; }
.villages-forging-v2 .villages-quick-panel:has(.villages-founding-zone-nav[data-editing=true]) fieldset.villages-quick-selected-zone { display:none; }
.villages-forging-v2 .villages-quick-zone-heading h3 { display:flex; flex:0 1 auto; align-items:center; min-width:0; max-width:calc(100% - 3rem); margin:0; font-size:1.4rem; font-weight:600; }
.villages-forging-v2 .villages-quick-zone-heading input { field-sizing:content; width:auto; min-width:0; max-width:100%; height:2.75rem; min-height:44px; margin:0; padding:.15rem .3rem; font:inherit; color:inherit; border-color:transparent; background:transparent; }
.villages-forging-v2 .villages-quick-zone-heading input:focus { border-color:#a88aff; background:#0c1830; }
.villages-forging-v2 .villages-quick-zone-heading input[aria-invalid=true] { border-color:#ffb9bc; }
.villages-forging-v2 .villages-quick-zone-heading button { display:grid; place-items:center; width:44px; min-width:44px; min-height:44px; padding:.4rem; border-color:transparent; background:transparent; }
.villages-quick-zone-description>span:first-child { display:flex; align-items:center; min-height:44px; }
.villages-forging-v2 .villages-quick-dialog .villages-quick-zone-description textarea { margin-top:.5rem; }
.villages-forging-v2 .villages-quick-zone-fields textarea { height:clamp(7rem,15dvh,10rem); font-size:1rem; line-height:1.4; border-color:#60708f; }
.villages-forging-v2 .villages-quick-zone-fields input:not([type=checkbox]) { font-size:.9rem; border-color:#60708f; }
.villages-forging-v2 .villages-quick-dialog .villages-quick-zone-fields [aria-invalid=true] { border-color:#ffb9bc; }
.villages-quick-art-header { flex-wrap:wrap; justify-content:space-between; }
.villages-quick-art-header h4 { flex:none; margin:0; font-size:1rem; font-weight:600; }
.villages-forging-v2 .villages-quick-art-actions button { min-height:44px; padding:.35rem .5rem; font-size:.85rem; background:transparent; border-color:#60708f; }
.villages-quick-zone-content .villages-quick-art img { background:transparent; }
.villages-forging-v2 .villages-quick-art .villages-quick-remove-art { align-self:center; min-height:44px; padding:.2rem .5rem; font-size:.8rem; border-color:transparent; background:transparent; color:#c6b4ff; text-decoration:underline; }

.villages-quick-art img,.villages-quick-art-empty { width:100%; height:clamp(160px,25dvh,300px); object-fit:contain; background:#0c1830; border-radius:.5rem; }
.villages-quick-art-empty { display:grid; place-items:center; }
.villages-quick-art-actions { display:flex; flex-wrap:wrap; align-items:center; gap:.4rem; }
.villages-quick-art-actions label { margin:0; }
.villages-quick-dialog label { display:block; margin:.35rem 0; }
.villages-quick-dialog input,.villages-quick-dialog textarea { box-sizing:border-box; margin-top:.35rem; background:#0c1830; border-color:#65799c; }
.villages-quick-dialog>button { margin:.6rem .5rem 0 0; }
.villages-quick-space { border:1px solid #596b9b; background:#192441; padding:.7rem; border-radius:.6rem; margin:.6rem 0; }
.villages-quick-space summary { overflow-wrap:anywhere; }
.villages-quick-space summary>span { float:right; color:#81e6cd; font-size:.85rem; }
.villages-quick-space summary small { display:block; color:#c1c9e9; margin:.35rem 0 0 1rem; line-height:1.4; }
@media(max-width:704px) { .villages-forging-v2 .marinara-capability-villages-map-camera-controls { display:none; } }
@media(max-width:1000px) {
 .villages-forging-v2 dialog.villages-quick-dialog[open] { width:100%; height:100%; padding:1rem; border-radius:0; }
}
@media(max-width:727px) {
 .villages-forging-v2 dialog.villages-quick-dialog[open] { padding:.75rem; }
 .villages-quick-panel { grid-template-columns:minmax(0,1fr); gap:1rem; }
 .villages-quick-panel>.villages-founding-zone-nav[data-editing=false] { border-right:0; border-bottom:1px solid #43547d; padding:0 0 .75rem; }
 .villages-founding-zone-choices { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }
 .villages-forging-v2 .villages-quick-dialog>header h3 { font-size:1.15rem; }
}

/* Lorebook selection uses the same visible card and modal pattern as People. */
.villages-lorebook-card { min-width:0; }
.villages-lorebook-header { position:relative; display:flex; align-items:center; gap:.5rem; justify-content:space-between; min-width:0; }
.villages-lorebook-heading { display:flex; align-items:center; min-width:0; }
.villages-lorebook-heading h3 { margin:0!important; min-width:0; font-size:1rem; font-weight:400; }
.villages-lorebook-card .villages-lorebook-action { flex:none; min-height:44px; border:1px solid #aa87ff; border-radius:.65rem; padding:.5rem .8rem; background:#30305c; color:#f3f3ff; transition:background .15s,border-color .15s,box-shadow .15s; }
.villages-lorebook-card .villages-lorebook-action:hover { background:#41366e; border-color:#c1acff; }
.villages-lorebook-card .marinara-capability-villages-lore-selected { max-height:8rem; margin:.55rem 0; }
.villages-lorebook-card .marinara-capability-villages-lore-chip { min-height:44px; padding:0 .1rem 0 .65rem; border-color:#aa87ff; background:#30305c; font-size:.85rem; }
.villages-lorebook-card .marinara-capability-villages-lore-chip button { flex:none; min-width:44px; min-height:44px; padding:0; border:0; background:transparent; color:inherit; }
.villages-lorebook-card .marinara-capability-villages-lore-chip button:hover { color:#d4bfff; }
.villages-lorebook-budget { position:relative; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:.5rem; margin:.75rem 0 0; padding-top:.75rem; border-top:1px solid #43547d; }
.villages-lorebook-budget-heading { display:flex; align-items:center; min-width:0; }
.villages-lorebook-budget-heading>label { margin:0!important; width:auto; flex:none; }
.villages-lorebook-budget>p { flex-basis:100%; margin:0; color:#ff9ba5; }
.villages-lorebook-budget input { flex:none; width:6rem!important; min-width:0; min-height:44px; margin-left:auto; padding:.6rem; border:1px solid #65799c; border-radius:.45rem; color:#f3f3ff; background:#0c1830; font:inherit; }
.villages-lorebook-search { flex:none; margin-bottom:.65rem; }
.villages-lorebook-results { flex:1 1 auto; min-height:0; max-height:calc(var(--founding-viewport-height,100dvh) * .5); overflow:auto; overscroll-behavior:contain; }
.villages-founding-dialog .villages-lorebook-option { display:flex; align-items:center; gap:.65rem; min-height:44px; margin:0 0 .4rem; padding:.55rem .65rem; border:1px solid #43547d; border-radius:.65rem; background:#19213b; cursor:pointer; transition:background .15s,border-color .15s; }
.villages-founding-dialog .villages-lorebook-option[data-selected=true] { background:#30305c; border-color:#aa87ff; }
.villages-founding-dialog .villages-lorebook-option:hover { border-color:#b495ff; }
.villages-founding-dialog .villages-lorebook-option input { flex:none; width:1.15rem; min-height:1.15rem; height:1.15rem; margin:0; padding:0; accent-color:#b495ff; }
.villages-lorebook-option>span { min-width:0; overflow-wrap:anywhere; }
.villages-lorebook-option small { display:block; color:#b8c3e8; font-size:.8rem; }
.villages-lorebook-option:has(input:disabled) { opacity:.55; cursor:default; }
.villages-founding-dialog .villages-lorebook-footer { align-items:center; justify-content:space-between; }
.villages-lorebook-action:focus-visible { outline:3px solid #c1acff; outline-offset:2px; }
.villages-lorebook-option input:focus-visible { outline:2px solid #c1acff; outline-offset:3px; }
@media(prefers-reduced-motion:reduce) { .villages-lorebook-card .villages-lorebook-action,.villages-founding-dialog .villages-lorebook-option { transition:none; } }

/* Each step fits the Engine content area; only the active pane can scroll. */
.villages-forging-v2 [hidden] { display:none!important; }
.villages-forging-body { overflow:hidden; padding:.75rem 1rem; }
.villages-forging-body>div:not([hidden]),.villages-place-panels,.villages-people-columns,.villages-founding-places,.villages-quick-start { height:100%; min-height:0; }
.villages-place-panels,.villages-people-columns { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; align-items:stretch; }
.villages-founding-setting { min-width:0; min-height:0; overflow:auto; }
.villages-people-columns { grid-template-columns:minmax(14rem,.75fr) minmax(0,2fr); }
.villages-place-panels>.villages-forging-card,.villages-people-columns>.villages-forging-card { height:100%; overflow:auto; margin:0; }
.villages-founding-tabs { display:flex; flex-wrap:wrap; gap:.4rem; align-items:start; flex:none; }
.villages-founding-sprites { padding:0; }
.villages-founding-sprites>h3,.villages-founding-sprites>p { margin:1rem; }
.villages-founding-pagination { display:flex; align-items:center; justify-content:space-between; gap:.5rem; margin-top:auto; padding-top:.5rem; flex:none; }
.villages-quick-start { grid-template-columns:minmax(18rem,.85fr) minmax(0,2.3fr); grid-template-rows:minmax(0,1fr); align-items:stretch; }
.villages-quick-venue-list { grid-column:1; grid-row:1; }
.villages-quick-map-panel { grid-column:2; grid-row:1; }
.villages-forging-v2 .villages-quick-venue-card { display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; gap:.25rem; padding:.65rem .75rem; font-size:.95rem; line-height:1.2; width:100%; min-height:clamp(76px,12dvh,120px); text-align:left; background-size:cover; background-position:center; }
.villages-quick-venue-title { display:flex; flex:none; align-items:center; flex-wrap:nowrap; gap:.4rem; }
.villages-forging-v2 .villages-quick-venue-card[aria-pressed=true] { background-color:#263153; }
.villages-quick-venue-title strong { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.villages-quick-venue-badge { flex:none; min-width:6rem; text-align:center; padding:.1rem .4rem; line-height:1.1; }
.villages-quick-map-toolbar { justify-content:flex-start; flex-wrap:wrap; gap:.5rem; }
.villages-quick-map-toolbar h2 { flex:1; margin:0 .5rem 0 0; }
.villages-quick-venue-list,.villages-quick-map-panel { min-height:0; height:100%; margin:0; overflow:auto; position:static; }
.villages-quick-venue-list { display:flex; flex-direction:column; gap:.4rem; }
.villages-quick-venue-list h2 { font-size:1.1rem; }
.villages-quick-venue-card { padding:.4rem .6rem; margin:0; max-height:var(--venue-page-height); overflow:auto; }
.villages-quick-venue-list>.villages-venue-heading,.villages-quick-venue-list>p { flex:none; }
.villages-quick-pages { display:flex; flex-direction:column; flex:1; min-height:0; gap:.4rem; }
.villages-quick-page-viewport { flex:1; min-height:0; overflow:hidden; }
.villages-quick-page-rows { position:relative; display:flex; flex-direction:column; gap:.4rem; min-height:100%; }
.villages-quick-page-rows>div { display:flex; flex:1 0 auto; }
.villages-quick-page-controls { flex:none; }
.villages-quick-page-controls:empty { display:none; }
.villages-quick-map .marinara-capability-villages-stage[data-pin-movable=true] .marinara-capability-villages-pin { touch-action:none; cursor:grab; }
.villages-quick-map .marinara-capability-villages-stage[data-pin-movable=true] .marinara-capability-villages-pin:active { cursor:grabbing; }
.villages-quick-artwork-button { display:flex; align-items:center; gap:.4rem; margin-left:auto; }
.villages-quick-artwork-button img { width:2rem; height:2rem; object-fit:cover; border-radius:.25rem; }
.villages-quick-venue-card h3 { margin:0; }
.villages-quick-household { display:block; min-height:1.2em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:.8rem; margin:0!important; }
.villages-quick-map-panel { display:flex; flex-direction:column; }
.villages-quick-map-panel .villages-quick-map { flex:1; min-height:10rem; height:auto; }
.villages-quick-footer { display:flex; gap:.4rem; flex-wrap:wrap; padding-top:.5rem; border-top:1px solid #43547d; }
.villages-forging-body[data-step="3"] { overflow:auto; }
.villages-founding-places { display:flex; flex-direction:column; gap:.5rem; }
.villages-founding-places>.villages-quick-start { flex:1; }
.villages-forging-map-warning { font-weight:600; font-size:.9rem; margin:.2rem 0; }
@media(min-width:728px) and (max-width:1100px) {
 .villages-quick-start { grid-template-columns:1fr; grid-template-rows:auto; height:auto; }
 .villages-forging-body>.villages-founding-places { height:auto; }
 .villages-quick-venue-list,.villages-quick-map-panel { grid-column:1; grid-row:auto; height:auto; max-height:none; }
 .villages-quick-pages { flex:none; height:clamp(18rem,55dvh,38rem); }
 .villages-quick-map-panel .villages-quick-map { height:300px; flex:none; }
}
@media(max-width:727px) {
 .villages-people-selected{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem}
 .villages-people-selected .villages-selected-villager{position:relative;padding:.5rem .2rem;min-width:0}
 .villages-forging-v2 .villages-people-selected .villages-selected-resident{flex-direction:column;text-align:center;gap:.3rem;padding-top:.5rem;font-size:.75rem}
 .villages-people-selected .villages-remove-resident{position:absolute;top:0;right:0;padding:0!important;width:24px;min-height:24px!important;height:24px;font-size:.75rem}
 .villages-forging-body { overflow:auto; }
 .villages-place-panels,.villages-people-columns,.villages-quick-start { grid-template-columns:minmax(0,1fr); height:auto; }
 .villages-forging-body>div:not([hidden]),.villages-founding-places { height:auto; }
 .villages-place-panels>.villages-forging-card,.villages-people-columns>.villages-forging-card { height:auto; min-height:0; }
 .villages-quick-venue-list,.villages-quick-map-panel { height:auto; max-height:none; grid-column:1; grid-row:auto; }
 .villages-quick-start { grid-template-rows:auto; }
 .villages-quick-map-panel .villages-quick-map { height:300px; flex:none; }
 .villages-quick-pages { flex:none; height:clamp(16rem,50dvh,32rem); }
}
/* Founding overlays belong to the capability pane, never the Engine window. */
.villages-founding-overlay { position:absolute; inset:0; z-index:100; display:grid; grid-template:minmax(0,1fr) / minmax(0,1fr); place-items:center; padding:1rem; overflow:hidden; background:#090c1a99; }
.villages-forging-v2 .villages-founding-overlay>dialog { position:relative; inset:auto; margin:0; width:min(42rem,100%); height:auto; max-width:100%; max-height:100%; }
.villages-forging-v2 .villages-founding-overlay>dialog:not(.villages-quick-dialog) { overflow:auto; }
.villages-forging-v2 .villages-founding-overlay>dialog[data-compact=true] { width:min(26rem,100%); max-height:100%; }
.villages-forging-v2 .villages-founding-overlay>dialog.villages-quick-dialog { width:min(92rem,100%); height:min(48rem,100%); }
@media(max-width:1000px) { .villages-founding-overlay { padding:0; } .villages-forging-v2 .villages-founding-overlay>dialog.villages-quick-dialog { width:100%; height:100%; } }
.villages-forging-v2 { --background:#302d47; --foreground:#f0dfbc; --muted-foreground:#ded0c2; --border:#a39b8460; color:var(--foreground); background:#302d47; font-family:"village-letter-lora", Georgia, serif; }
.villages-forging-v2 .villages-forging-card { background:#352c44; border-color:#a3899666; }
.villages-forging-v2 :is(button,.villages-quick-venue-card) { color:#f0dfbc; background-color:#514157; border-color:#a87788; }
.villages-forging-v2 button[aria-pressed=true] { background-color:#83576b; border-color:#d29399; }
.villages-forging-v2 .villages-forging-primary { color:#292938; background:#a5ac8b; border-color:#a5ac8b; }
.villages-forging-v2[data-step] {
  gap:0;
  background:linear-gradient(100deg,#271c3530,#271c35a8 58%,#271c35ea),url('/api/capability-packages/villages/assets/mari-founding-overlook.webp') center 62% / cover no-repeat #302d47;
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
  min-width:min(10rem,100%); min-height:50px; padding:.6rem 1.4rem; border:1px solid #c3c9a4; border-radius:2rem;
  color:#242b27; background:#aeb797; box-shadow:0 2px 8px #16142166,inset 0 0 0 2px #2c382826;
  font-size:.95rem; letter-spacing:.17em;
}
.villages-forging-v2 .villages-founding-title button:hover { background:#c3cbac; }
.villages-forging-v2 .villages-founding-title button:focus-visible { outline-color:#fff0d1; outline-offset:5px; }
.villages-forging-v2[data-prelude] .villages-forging-steps { visibility:hidden; }
.villages-forging-steps {
  position:relative; isolation:isolate; display:grid; grid-template-columns:repeat(4,1fr); list-style:none;
  flex:none; width:min(15rem,75%); margin:.65rem auto 0; padding:0 0 1.15rem; text-align:center;
}
.villages-forging-steps::before { content:''; position:absolute; z-index:-1; inset:.68rem 12.5% auto; height:1px; background:#d8a7b880; }
.villages-forging-steps li { position:relative; color:#d4b0c7; }
.villages-founding-star { display:inline-grid; place-items:center; width:1.35rem; height:1.35rem; font:1rem/1 Georgia,serif; background:#362a46; border-radius:50%; }
.villages-forging-steps li[data-complete] { color:#eed1a8; }
.villages-forging-steps li[aria-current=step] { color:#fff0c3; }
.villages-forging-steps li[aria-current=step] .villages-founding-star { font-size:1.35rem; text-shadow:0 0 .55rem #ffc982; }
.villages-founding-step-label { position:absolute; top:1.4rem; left:50%; transform:translateX(-50%); white-space:nowrap; font-size:.77rem; }
.villages-founding-hierarchy {
  --chart-width:min(var(--chart-limit,15rem),calc(var(--mari-x) - var(--mari-height) * .31 - 1.25rem));
  --chart-right:calc(100% - var(--mari-x) + var(--mari-height) * .31 + .5rem);
  position:absolute; right:var(--chart-right);
  bottom:min(calc(var(--mari-floor) + var(--mari-height) * .56),calc(100cqh - 3.5rem - var(--chart-width) * .88));
  width:var(--chart-width); height:auto; padding:.25rem;
  background:#342741bf; border:1px solid #eed1a830; border-radius:.65rem;
}
.villages-founding-hierarchy text { fill:#f0dfbc; font-size:16px; text-shadow:0 1px 2px #21192d; }
.villages-founding-hierarchy-links { fill:none; stroke:#e2b5c2; filter:drop-shadow(0 1px 1px #21192d); }
.villages-founding-hierarchy-links [data-highlighted] { stroke:#eed1a8; }
.villages-founding-hierarchy-star circle { fill:#362a46; stroke:#dfbbaf; stroke-width:.8; }
.villages-founding-hierarchy-star path { fill:#d4b0c7; }
.villages-founding-hierarchy [data-ancestor] .villages-founding-hierarchy-star path { fill:#eed1a8; }
.villages-founding-hierarchy [data-active] :is(text,.villages-founding-hierarchy-star path) { fill:#fff0c3; }
.villages-founding-hierarchy [data-active] .villages-founding-hierarchy-star path { filter:drop-shadow(0 0 3px #ffc982); }
.villages-founding-guide { display:flex; align-items:center; gap:.55rem; margin:.55rem 0; flex:none; }
.villages-founding-guide img { flex:none; width:2rem; height:3rem; object-fit:contain; object-position:center top; }
.villages-forging-v2 .villages-founding-guide .villages-setting-dialogue { max-width:48rem; padding:.55rem .8rem; }
.villages-founding-replies { display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; margin-top:.35rem; }
.villages-founding-chapter { position:relative; display:flex; flex:1; min-width:0; min-height:0; }
.villages-founding-chapter[data-guided] .villages-forging-card { background:#292438f5; border-color:#a6809199; }
.villages-founding-chapter[data-guided] .villages-quick-venue-badge { min-width:0; margin-left:0; }
.villages-founding-chapter[data-guided] .villages-founding-pagination>span { white-space:nowrap; }
.villages-forging-v2 .villages-forging-body[data-step="0"] { padding:0; overflow:auto; }
.villages-forging-v2 .villages-forging-body>.villages-place-panels {
  --scene-padding:clamp(.75rem,1.6vw,1.5rem);
  min-height:100%; height:auto; max-width:84rem; margin-inline:auto; grid-template-columns:minmax(0,1fr) minmax(0,1fr); align-items:start;
  gap:clamp(.75rem,2.5vw,1.75rem); padding:var(--scene-padding);
}
.villages-place-panels[data-intro]:not([data-editing])>.villages-founding-setting { display:none; }
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
.villages-setting-stage [src$="mari-founding-neutral.webp"] { --shoe-center:48.2%; }
.villages-setting-stage :is([src$="mari-founding-happy.webp"],[src$="mari-founding-delighted.webp"]) { --shoe-center:50.7%; }
.villages-setting-stage [src$="mari-founding-looking-up.webp"] { --shoe-center:40.6%; }
.villages-setting-stage [src$="mari-founding-playful.webp"] { --shoe-center:49.6%; }
.villages-setting-stage [src$="mari-founding-presenting.webp"] { --shoe-center:63%; }
.villages-setting-stage [src$="mari-founding-wave.webp"] { --shoe-center:52.7%; }
.villages-setting-stage [src$="mari-founding-thoughtful.webp"] { --shoe-center:48.4%; }
.villages-setting-stage [src$="mari-founding-happy-side.webp"] { --shoe-center:35%; }
.villages-setting-stage [src$="mari-founding-proud.webp"] { --shoe-center:47.9%; }
.villages-setting-dialogue,.villages-forging-v2 .villages-founding-setting.villages-forging-card {
  background:#292438f5; border:1px solid #a6809199; border-radius:.65rem; padding:clamp(.85rem,2vw,1.45rem);
  box-shadow:0 .65rem 2rem #170f2859;
}
.villages-setting-dialogue { position:relative; min-width:0; }
.villages-setting-dialogue>strong { color:#efb6bc; font-size:.85rem; }
.villages-setting-dialogue p { margin:.2rem 0 .35rem; line-height:1.4; }
.villages-setting-dialogue form { margin-top:.7rem; border-top:1px solid #ad839b62; }
.villages-setting-dialogue .villages-founding-field { margin:.5rem 0; }
.villages-setting-lore-notice { color:#e8b9c2; font-size:.85rem; }
.villages-setting-dialogue-actions .villages-founding-next-reply { margin-inline-start:auto; }
.villages-setting-dialogue-actions { display:flex; flex-wrap:wrap; gap:.4rem; }
.villages-forging-v2 .villages-place-panels>.villages-founding-setting { height:auto; min-height:0; overflow:visible; margin:clamp(.35rem,5dvh,3rem) 0 0; }
.villages-founding-setting h2 { font:500 clamp(1.45rem,3vw,2rem)/1.15 "village-letter-lora",Georgia,serif; color:#f4e5c8; margin:0; letter-spacing:-.035em; }
.villages-forging-v2 .villages-place-panels .villages-founding-field+.villages-founding-field { border-top:0; padding-top:0; }
.villages-place-panels .villages-founding-field :is(input,textarea) { background:#3c3049; border-color:#9b768c; margin-top:.25rem; }
.villages-forging-v2 .villages-place-panels textarea { resize:vertical; }
.villages-founding-connections { width:min(100%,25rem); min-width:0; }
.villages-founding-connections .marinara-capability-villages-model-connections { margin:0; }
.villages-founding-connections .marinara-capability-villages-model-rows {
  display:grid; gap:.45rem; background:none; border:0; border-radius:0; overflow:visible;
}
.villages-founding-connections .marinara-capability-villages-model-rows>.marinara-capability-villages-model-row {
  position:relative; display:block; padding:.5rem .65rem; border:1px solid #bf96a4b8;
  border-radius:.65rem; background:#392e46f5; color:#f4e5c8; font:inherit; box-shadow:0 2px 10px #1c132638;
}
.villages-founding-connections .marinara-capability-villages-model-rows>.marinara-capability-villages-model-row:enabled:not([aria-disabled]):hover {
  background:#514157; border-color:#d4a9ae;
}
.villages-founding-connections :is(.marinara-capability-villages-model-icon,.marinara-capability-villages-model-chevron,
  .marinara-capability-villages-model-assignment small:not([data-needs-review])) { display:none; }
.villages-founding-connections .marinara-capability-villages-model-row small { color:#e9bec6; font-size:.75rem; }
.villages-founding-connections .marinara-capability-villages-model-assignment {
  display:block; margin-top:.3rem; font-size:.8rem;
}
.villages-founding-connections .marinara-capability-villages-model-assignment[data-needs-choice] { color:#ffbac5; }
.villages-founding-connections .marinara-capability-villages-model-assignment strong { font-weight:400; }
.villages-founding-connections .marinara-capability-villages-model-pending { position:absolute; inset:.6rem .6rem auto auto; }
.villages-forging-v2 .villages-founding-connections>.villages-forging-primary {
  display:block; min-width:min(5.75rem,100%); margin:.65rem 0 0 auto; padding:.4rem 1rem;
  border-color:#c3c9a4; border-radius:2rem; color:#242b27; background:#aeb797;
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
  .villages-founding-chapter[data-guided]>.villages-forging-body {
    container:founding-work / inline-size; align-self:center; height:min(94cqh,54rem);
    padding-inline:0; overflow:auto;
  }
  .villages-founding-chapter[data-guided] .villages-people-columns>.villages-forging-card {
    align-self:start; height:auto; max-height:100%;
  }
  .villages-forging-v2 .villages-forging-body[data-step="0"] { container-type:size; }
  .villages-forging-v2 .villages-forging-body>.villages-place-panels { grid-template-columns:minmax(0,1fr); }
  .villages-setting-guide {
    display:grid; align-content:center; min-height:var(--scene-height);
  }
  .villages-setting-guide,.villages-forging-v2 .villages-place-panels>.villages-founding-setting {
    --scene-height:calc(100cqh - 2 * var(--scene-padding));
  }
  .villages-founding-chapter>.villages-chapter-guide { --scene-height:100cqh; }
  .villages-setting-guide .villages-setting-dialogue {
    width:min(100%,34rem); max-height:var(--scene-height); overflow:auto; overscroll-behavior:contain;
  }
  .villages-forging-v2 .villages-place-panels>.villages-founding-setting {
    --setting-top:clamp(.35rem,5cqh,3rem);
    margin-top:var(--setting-top); max-height:calc(var(--scene-height) - var(--setting-top));
    overflow:auto; overscroll-behavior:contain;
  }
  @container founding-stage (width <= 100rem) {
    .villages-forging-v2[data-step="2"] .villages-founding-chapter[data-guided] {
      grid-template-columns:minmax(0,1fr); grid-template-rows:auto minmax(0,1fr); gap:.65rem; padding-block:.6rem;
    }
    .villages-forging-v2[data-step="2"] .villages-chapter-guide { min-height:0; }
    .villages-forging-v2[data-step="2"] .villages-founding-chapter[data-guided]>.villages-forging-body { height:100%; }
    .villages-forging-v2[data-step="2"] .villages-quick-map-panel .villages-quick-map { min-height:13rem; }
  }
  @container (width >= 44rem) {
    .villages-forging-v2 .villages-forging-body>.villages-place-panels:is(:not([data-intro]),[data-editing]) {
      grid-template-columns:minmax(0,1fr) minmax(16rem,.85fr);
    }
  }
  @container (width < 44rem) {
    .villages-place-panels:is(:not([data-intro]),[data-editing])>.villages-setting-guide {
      --scene-height:min(58cqh,22rem);
    }
  }
}
@container founding-work (width > 45rem) {
  .villages-quick-start { grid-template-columns:minmax(13.5rem,1fr) minmax(0,2.3fr); }
}
@container founding-work (max-width:45rem) {
  .villages-people-columns,.villages-forging-body[data-step="3"]>.villages-forging-columns {
    grid-template-columns:minmax(0,1fr); height:auto;
  }
  .villages-people-columns>.villages-forging-card { height:auto; }
  .villages-quick-start { grid-template-columns:minmax(0,1fr); grid-template-rows:auto; height:auto; }
  .villages-forging-body>.villages-founding-places { height:auto; }
  .villages-quick-venue-list,.villages-quick-map-panel { grid-column:1; grid-row:auto; height:auto; }
  .villages-quick-pages { flex:none; height:clamp(16rem,50dvh,28rem); }
  .villages-quick-map-panel .villages-quick-map { flex:none; height:clamp(16rem,48dvh,25rem); }
}
@media(max-width:727px) {
  .villages-founding-chapter[data-guided] {
    flex-direction:column; padding-top:var(--founding-mobile-stage-height); overflow:auto; overscroll-behavior:contain;
  }
  .villages-forging-v2 .villages-founding-overlay>dialog.villages-chapter-menu {
    width:calc(100% - 1.1rem); height:min(52rem,calc(100% - 1.1rem)); overflow:hidden;
  }
  .villages-chapter-menu>.villages-forging-body { overflow:auto; padding:.35rem; }
  .villages-forging-v2 .villages-chapter-menu [role=alert] { color:#ff9ba5; }
  .villages-forging-v2[data-step] {
    --founding-mobile-stage-height:clamp(8rem,calc(var(--founding-viewport-height,100dvh) - 20rem),32rem);
    --founding-mobile-backdrop-height:calc(var(--founding-mobile-stage-height) + 4rem);
    --founding-mobile-backdrop-size:max(100%,calc(var(--founding-mobile-backdrop-height) * 1.6)) var(--founding-mobile-backdrop-height);
    --mari-x:74cqw; --mari-height:min(calc(var(--founding-mobile-stage-height) * .85),82cqw,24rem);
    --mari-floor:calc(100cqh - var(--founding-mobile-stage-height) - 1rem);
    background-position:center,center top;
    background-size:auto,var(--founding-mobile-backdrop-size);
    background-color:#292438;
  }
  .villages-forging-v2[data-step][data-lighting=day] {
    background-position:center,center,center top;
    background-size:auto,auto,var(--founding-mobile-backdrop-size);
  }
  .villages-founding-chapter>.villages-chapter-guide { margin:0 .65rem .65rem; }
  .villages-forging-v2 .villages-forging-body>.villages-place-panels {
    display:block; height:100%; padding:var(--founding-mobile-stage-height) .65rem .75rem;
  }
  .villages-founding-hierarchy { --chart-limit:min(13rem,calc(var(--founding-mobile-stage-height) * .9)); }
  .villages-founding-logo { font-size:min(13cqi,8dvh,4rem); }
  .villages-setting-guide .villages-setting-dialogue { padding:.65rem .75rem; backdrop-filter:blur(12px); }
  .villages-setting-guide .villages-setting-dialogue p { line-height:1.4; margin:.45rem 0; }
  .villages-setting-guide .villages-founding-replies>button,
  .villages-forging-v2 .villages-founding-menu-actions>button { min-height:44px; }
  .villages-founding-menu-actions {
    display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:.5rem;
    margin-top:.9rem; padding-top:.7rem; border-top:1px solid #ad839b62;
  }
  .villages-founding-menu-actions .villages-founding-next-reply { margin-inline-start:auto; }
  .villages-forging-v2[data-founding-keyboard=true] .villages-forging-body { margin-bottom:var(--founding-keyboard-inset) !important; }
  .villages-forging-v2[data-step="0"][data-founding-keyboard=true]::after { content:none; }
}
.villages-forging-v2 dialog.villages-founding-venue-dialog[open] { gap:0; padding:0; background:#302d47; color:#f0dfbc; border-color:#a38996; }
.villages-founding-venue-workspace { --menu-font:"village-letter-lora",Georgia,serif; --border:#a39b8460; --menu-tab-line:#d29399; flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; font:1rem/1.45 var(--menu-font); }
.villages-forging-v2 .villages-founding-venue-dialog .marinara-capability-villages-venue-profile { padding:clamp(1rem,3cqw,2.5rem); }
.villages-founding-venue-dialog .marinara-capability-villages-venue-profile::before { background:linear-gradient(90deg,#262134fa 0%,#262134f0 38%,#262134ac 61%,transparent 93%); }
.villages-founding-venue-dialog .marinara-capability-villages-venue-navigation { margin-bottom:1rem; }
.villages-forging-v2 .villages-founding-venue-dialog fieldset.villages-quick-venue-header { display:grid; grid-template-columns:minmax(0,1fr); }
.villages-founding-venue-dialog .villages-quick-zone-content { grid-template-columns:minmax(0,1fr); }
.villages-founding-venue-dialog .villages-founding-zone-use { grid-row:1; }
.villages-forging-v2 .villages-founding-venue-dialog :is(input:not([type=checkbox]),textarea) { background:#33283f; color:#f0dfbc; border-color:#9f788e; }
.villages-forging-v2 .villages-founding-venue-dialog fieldset.villages-founding-venue-choices { display:flex; flex-wrap:wrap; gap:.4rem; margin:.8rem 0; }
.villages-founding-venue-choices legend { margin-bottom:.3rem; }
.villages-forging-v2 .villages-founding-venue-choices button { color:#f0dfbc; background:#514157; border-color:#a87788; }
.villages-forging-v2 .villages-founding-venue-choices button[aria-pressed=true] { opacity:1; background:#8c596d; border-color:#dea2a7; }
.villages-forging-v2 dialog.villages-founding-venue-dialog>.villages-quick-footer { padding:.5rem 1rem; border-top:1px solid #a39b8460; }
.villages-forging-v2 .villages-founding-venue-dialog .villages-forging-primary { color:#292938; background:#a5ac8b; border-color:#a5ac8b; }
@container founding-editor (max-width:42rem) {
 .villages-founding-venue-dialog .marinara-capability-villages-venue-profile :is(.marinara-capability-villages-workspace-venue-header,.marinara-capability-villages-venue-sections,.marinara-capability-villages-venue-profile-body) { width:100%; }
 .villages-founding-venue-dialog .marinara-capability-villages-venue-profile::before { background:linear-gradient(180deg,#262134e8,#262134f2); }
}
`;
