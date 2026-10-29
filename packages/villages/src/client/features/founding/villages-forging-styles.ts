export const VILLAGES_FORGING_STYLES = `
/* Extra scroll reach sits outside layout, so a keyboard cannot compress a form or its footer. */
.villages-forging-v2 { position:relative; }
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
.villages-founding-help-popup header button { flex:none; min-width:44px; min-height:44px; padding:.25rem; border:1px solid #596b9b; border-radius:.5rem; color:inherit; background:#192c4c; font:inherit; cursor:pointer; }
.villages-founding-help-popup [role=note] { font-size:.9rem; line-height:1.5; overflow-wrap:anywhere; }
.villages-life-heading { display:flex; align-items:center; gap:.2rem; }
.villages-forging-v2 .villages-life-heading h3 { margin:0; }
.villages-forging-v2 .villages-initial-residents { margin:1.4rem 0 .65rem; }
.villages-selected-villager { display:flex; align-items:center; gap:.65rem; padding:.5rem .65rem; }
.villages-selected-villager>.marinara-capability-villages-identity-card-face { flex:none; width:2.5rem; height:2.5rem; }
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
.villages-forging-v2 .marinara-capability-villages-setup-heading { padding:.9rem 1.25rem; margin:0; border-bottom:1px solid #43547d; flex:none; }
.villages-forging-v2 h1 { font-size:1.25rem; margin:0; } .villages-forging-v2 h1 span { font-weight:400; }
.villages-forging-v2 h2 { font-size:1.65rem; margin:.2rem 0 .6rem; } .villages-forging-v2 h3 { margin:.1rem 0 .65rem; } .villages-forging-v2 h4 { margin:.1rem 0; }
.villages-forging-v2 p { line-height:1.5; margin:.5rem 0 .8rem; color:#c1c9e9; overflow-wrap:anywhere; }
.villages-forging-steps { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.6rem; padding:.75rem 1.25rem; flex:none; }
.villages-forging-v2 button { font:inherit; min-height:44px; border:1px solid #596b9b; border-radius:.5rem; color:#f3f3ff; background:#192c4c; padding:.55rem .8rem; cursor:pointer; }
.villages-forging-v2 button:disabled { opacity:.55; cursor:default; } .villages-forging-v2 button:focus-visible,.villages-forging-v2 summary:focus-visible { outline:3px solid #c1acff; outline-offset:3px; }
.villages-forging-v2 button[aria-pressed=true],.villages-forging-steps button[data-active=true],.villages-forging-v2 .villages-forging-primary { background:#6650cf; border-color:#9d88f4; }
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
.villages-forging-preview { display:block; width:100%; height:auto; max-height:25rem; object-fit:contain; border-radius:.6rem; margin:.75rem 0; }
.villages-forging-card figure { margin:0; } .villages-forging-card figcaption { color:#c1c9e9; line-height:1.5; overflow-wrap:anywhere; }
.villages-forging-placement,.villages-forging-notice { background:#29264f; border:1px solid #7d69c7; border-radius:.6rem; padding:.7rem; }
.villages-forging-map .marinara-capability-villages-setup-map-viewport { min-height:14rem; border:1px solid #5268a0; border-radius:.6rem; overflow:hidden; }
.villages-forging-map .marinara-capability-villages-stage { min-height:14rem; }
.villages-forging-venue { margin-top:.8rem; padding:.8rem; border:1px solid #43547d; border-radius:.6rem; background:#192441; }
.villages-forging-footer { flex:none; padding:.75rem 1.25rem; border-top:1px solid #43547d; align-items:center; background:#141b39; flex-wrap:wrap; }
.villages-forging-saved { color:#81e6cd; font-size:.85rem; }
.villages-forging-footer .villages-forging-saved { flex:1; min-width:8rem; }
.villages-forging-resume { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.2fr); gap:1.5rem; align-items:center; }
.villages-forging-logical-preview { display:grid; place-items:center; min-height:16rem; background:repeating-linear-gradient(0deg,transparent,transparent 39px,#43547d 40px),repeating-linear-gradient(90deg,#121936,#121936 39px,#43547d 40px); border-radius:.5rem; }
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
@media(min-width:1001px) { .villages-forging-body[data-step="1"] .villages-forging-columns { grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr); } }
@media(max-width:1000px) { .villages-forging-columns { grid-template-columns:minmax(0,1fr); } .villages-forging-editor .villages-forging-zone-grid { grid-template-columns:1fr; } .villages-resident-choices { grid-template-columns:1fr; } }
@media(max-width:704px) {
 .villages-forging-body { padding:.75rem; } .villages-forging-steps { padding:.5rem; gap:.25rem; } .villages-forging-steps button { padding:.4rem .15rem; font-size:.8rem; } .villages-forging-resume { grid-template-columns:1fr; }
 .villages-forging-footer { padding:.5rem; padding-bottom:max(.5rem,env(safe-area-inset-bottom)); gap:.4rem; } .villages-forging-footer button { flex:1; } .villages-forging-footer .villages-forging-saved { flex-basis:100%; order:3; } .villages-forging-editor { width:100%; max-height:100dvh; } .villages-forging-editor .villages-forging-editor-top { grid-template-columns:1fr; }
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

/* Header and navigation belong to the document flow, including with an on-screen keyboard. */
.villages-forging-v2 { display:block; overflow:auto; overscroll-behavior:contain; }
.villages-forging-v2 .villages-forging-heading { display:flex; align-items:center; gap:.65rem; padding:.35rem .75rem; min-height:36px; }
.villages-forging-v2 .villages-forging-heading h1 { font-size:.8rem; font-weight:400; white-space:nowrap; }
.villages-forging-v2 .villages-forging-steps { display:flex; flex-wrap:wrap; min-width:0; max-width:100%; list-style:none; margin:0; padding:0; gap:.3rem; }
.villages-forging-steps li { display:flex; align-items:center; gap:.3rem; padding:.2rem .35rem; border-radius:.5rem; font-size:.75rem; }
.villages-forging-steps li[data-active=true] { background:#6650cf; color:#fff; }
@media(max-width:704px) { .villages-forging-v2 .villages-forging-heading { flex-wrap:wrap; } .villages-forging-steps { flex-wrap:wrap; } }
.villages-forging-v2 .villages-forging-body { overflow:visible; flex:none; }
.villages-forging-v2 .villages-forging-footer { position:static; display:flex; margin:0; }
.villages-forging-v2 .villages-forging-heading { position:static; width:auto; height:auto; overflow:visible; clip-path:none; border:0; }
.villages-founding-field { min-width:0; margin:.75rem 0; }
.villages-forging-v2 .villages-founding-field-heading { position:relative; display:flex; align-items:center; flex-wrap:nowrap; min-width:0; }
.villages-forging-v2 .villages-founding-field-heading>label { margin:0; width:auto; min-width:0; flex:0 1 auto; }
.villages-founding-field>input,.villages-founding-field>textarea,.villages-founding-field>select { width:100%; min-width:0; min-height:44px; border:1px solid var(--border,#65799c); border-radius:.45rem; padding:.6rem; color:var(--foreground,#f3f3ff); background:var(--background,#0c1830); font:inherit; }
.villages-founding-help { flex:none; display:inline-flex; align-items:center; flex-wrap:wrap; vertical-align:middle; max-width:100%; font-weight:400; }
.villages-founding-help>button { display:grid; place-items:center; width:44px; min-width:44px; height:44px; padding:0; border:0; background:transparent; color:inherit; }
.villages-founding-help>button>span { display:grid; place-items:center; width:18px; height:18px; border:1px solid currentColor; border-radius:50%; font:12px Arial,sans-serif; }
.villages-admission-fields .villages-founding-help>button { min-height:44px; padding:0; border:0; border-radius:0; background:transparent; }
.villages-forging-v2 p[role=alert],.villages-forging-v2 [role=alert],.villages-forging-v2 [data-founding-problem] { color:#ff9ba5; }
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
.villages-selected-villager { min-width:0; border:1px solid #aa87ff; border-radius:.65rem; background:#30305c; box-shadow:inset 0 0 0 1px #aa87ff; }
.villages-forging-v2 .villages-selected-sprites { display:block; width:auto; min-height:44px; margin:0; padding:.2rem .65rem; font-size:.8rem; line-height:1.2; }
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

/* Backstory editing is a content-sized popup, including under legacy mobile dialog styles. */
.villages-forging-v2 .villages-founding-dialog[data-compact=true] { display:block; inset:0; width:min(26rem,calc(100vw - 2rem)); height:fit-content; min-height:0; max-height:calc(100dvh - 2rem); padding:.75rem; border:2px solid #9d78ed; border-radius:.8rem; overflow:auto; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>header { padding:0; margin:0 0 .5rem; background:transparent; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>header h3 { margin:0; font-size:1rem; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>header button { flex:none; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>footer { padding:.65rem 0 0; background:transparent; flex-wrap:nowrap; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true]>footer button { flex:0 1 auto; white-space:nowrap; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true] button { padding:.4rem .65rem; min-height:44px; }
.villages-forging-v2 .villages-founding-dialog[data-compact=true] textarea { min-height:6rem; max-height:12rem; }


/* Place and Map reuse People's panels and field geometry. */
.villages-map-panel { width:100%; max-width:42rem; margin-inline:auto; }
.villages-map-panel h3 { font-size:1rem; font-weight:400; margin:0 0 .65rem; }
.villages-place-panels { display:grid; grid-template-columns:minmax(0,1fr); min-width:0; }
.villages-place-panels .villages-forging-card h3 { font-size:1rem; font-weight:400; margin:0 0 .65rem; }
.villages-place-panels .villages-founding-field { margin:.6rem 0; }
.villages-place-panels .villages-founding-field+.villages-founding-field { border-top:1px solid #43547d; padding-top:.65rem; margin-top:.65rem; }
.villages-forging-v2 .villages-place-map-choice { display:flex; align-items:center; justify-content:space-between; gap:.65rem; width:100%; text-align:left; background:#30305c; border-color:#aa87ff; box-shadow:inset 0 0 0 1px #aa87ff; border-radius:.65rem; padding:.65rem; }
.villages-place-options details { margin:.4rem 0; }
.villages-place-map-editor .villages-forging-preview { max-height:14rem; }
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

.villages-quick-switch { display:flex; gap:.5rem; margin:0 0 1rem; }
.villages-quick-switch button { flex:1; }
.villages-forging-v2[data-map-first=true] { display:flex; overflow:hidden; }
.villages-forging-v2[data-map-first=true] .villages-forging-heading { padding:.35rem .5rem; }
.villages-forging-v2[data-map-first=true] .villages-forging-heading h1 { display:none; }
.villages-forging-v2[data-map-first=true] .villages-forging-steps { margin:0; padding:0; gap:.25rem; }
.villages-forging-v2[data-map-first=true]>.villages-forging-body { flex:1; min-height:0; display:flex; flex-direction:column; gap:.4rem; padding:.5rem; overflow:hidden; }
.villages-venue-heading { display:flex; align-items:center; justify-content:space-between; gap:.5rem; flex:none; }
.villages-forging-v2 .villages-venue-heading h2 { min-width:0; margin:0; font-size:1.1rem; }
.villages-venue-heading .villages-quick-switch { flex:none; margin:0; }
.villages-quick-start { display:flex; flex-direction:column; gap:.4rem; flex:1; min-width:0; min-height:0; }
.villages-quick-map-toolbar { display:flex; align-items:center; gap:.35rem; flex:none; min-width:0; }
.villages-quick-map-toolbar select { flex:1; min-width:0; min-height:44px; border:1px solid #65799c; border-radius:.45rem; padding:.45rem; color:#f3f3ff; background:#0c1830; font:inherit; }
.villages-forging-v2 .villages-quick-map-toolbar button { flex:none; padding:.45rem .6rem; }
.villages-quick-map { --explore-selected:#a88aff; --explore-border:#343f51; --explore-text:#edf0f5; display:flex; flex:1; min-width:0; min-height:0; position:relative; overflow:hidden; border-radius:.5rem; }
.villages-quick-map>.villages-forging-map { display:flex; flex-direction:column; flex:1; min-height:0; min-width:0; }
.villages-quick-map .marinara-capability-villages-setup-map-viewport { flex:1; min-height:0; border:0; border-radius:0; overflow:hidden; }
.villages-forging-map .marinara-capability-villages-stage[data-exploration=true] { height:clamp(14rem,calc(var(--founding-viewport-height,100dvh) * .4),32rem)!important; }
.villages-quick-map .marinara-capability-villages-stage[data-exploration=true] { height:100%!important; min-height:0; }
.villages-quick-map>p { position:absolute; top:.5rem; left:.5rem; right:.5rem; z-index:7; margin:0; padding:.5rem; border-radius:.4rem; background:#141b39ed; }
@media(min-width:728px) {
 .villages-quick-start { flex:0 1 auto; width:100%; max-width:1024px; max-height:100%; align-self:center; }
 .villages-quick-map { flex:0 1 auto; height:min(55dvh,480px); }
}
.villages-quick-dialog { width:min(68rem,calc(100vw - 1.5rem)); }
.villages-forging-v2 dialog.villages-quick-dialog:not([open]) { display:none; }
.villages-forging-v2 dialog.villages-quick-dialog[open] { display:flex; flex-direction:column; gap:.65rem; height:min(44rem,calc(100dvh - 1.5rem)); padding-bottom:0; overflow:hidden; }
.villages-quick-dialog .villages-quick-heading { display:flex; align-items:center; justify-content:space-between; gap:.5rem; }
.villages-quick-heading,.villages-quick-tabs,.villages-quick-footer { flex:none; }
.villages-quick-tabs { display:flex; border-bottom:1px solid #596b9b; }
.villages-forging-v2 .villages-quick-tabs button { flex:1; min-width:0; min-height:44px; padding:.45rem; border:0; border-bottom:3px solid transparent; border-radius:0; background:transparent; color:#c1cce5; }
.villages-forging-v2 .villages-quick-tabs button[aria-selected=true] { color:#d4bfff; border-bottom-color:#aa87ff; }
.villages-quick-panel { flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; padding:0 .1rem; }
.villages-forging-v2 .villages-quick-dialog>.villages-quick-footer { display:flex; flex-wrap:wrap; justify-content:flex-end; border-top:1px solid #43547d; padding:.55rem 0; margin:0; background:transparent; }
.villages-quick-footer p { flex-basis:100%; margin:0 0 .5rem; }
.villages-quick-panel .villages-zone-map { margin:0; }
.villages-quick-dialog h3 { margin:.2rem 0; overflow-wrap:anywhere; }
.villages-quick-dialog p { color:#c1c9e9; line-height:1.5; }
.villages-quick-dialog fieldset { min-width:0; border:0; padding:0; margin:0; }
.villages-quick-dialog fieldset { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 .75rem; align-content:start; }
.villages-quick-zone-appearance { display:grid; grid-template-columns:minmax(0,1fr) min(34%,8rem); gap:.5rem; align-items:end; }
.villages-quick-zone-appearance textarea,.villages-quick-zone-appearance button { height:clamp(88px,calc(var(--founding-viewport-height,100svh) * .15),112px); min-height:0; }
.villages-quick-zone-appearance button { display:grid; place-items:center; padding:.2rem; }
.villages-quick-zone-image img { width:100%; height:100%; min-height:0; object-fit:contain; border-radius:.3rem; }
.villages-quick-zone-navigation { display:flex; gap:.25rem; align-items:center; margin:.15rem 0 .4rem; }
.villages-quick-zone-navigation strong { flex:1; text-align:center; }
.villages-forging-v2 .villages-quick-zone-navigation input { flex:1; width:0; margin:0; padding:.6rem; border-radius:.45rem; }
.villages-quick-zone-name { flex:1; min-width:0; }
.villages-forging-v2 .villages-quick-zone-name input { width:100%; }
.villages-quick-field-error { display:block; margin-top:.2rem; color:#ffb9bc; font-size:.75rem; line-height:1.25; }
.villages-quick-dialog [aria-invalid=true] { border-color:#ffb9bc; }
.villages-forging-v2 .villages-quick-zone-navigation button { flex:none; width:44px; height:44px; padding:0; font-size:1.5rem; line-height:1; }
.villages-quick-dialog fieldset.villages-quick-zone-fields { display:flex; flex-direction:column; gap:.5rem; }
.villages-quick-dialog .villages-quick-zone-fields label { margin:0; font-size:.8rem; }
.villages-quick-zone-fields input,.villages-quick-zone-fields textarea { margin-top:.2rem; }
.villages-quick-access { display:flex; align-items:center; gap:.35rem; }
.villages-quick-access span { margin-right:auto; font-size:.8rem; }
.villages-quick-access button { min-width:0; font-size:.85rem; padding:.35rem .55rem; }
.villages-quick-access button[aria-pressed=true] { background:#6650cf; border-color:#bca4ff; }
.villages-quick-dialog fieldset.villages-quick-venue-fields { grid-template-columns:repeat(2,minmax(0,1fr)); }
.villages-quick-venue-fields label { font-size:.8rem; }
.villages-quick-art img, .villages-quick-art>div:first-child { width:100%; height:10rem; object-fit:contain; background:#0c1830; border-radius:.5rem; }
.villages-quick-art>div:first-child { display:grid; place-items:center; }
.villages-quick-art-actions { display:flex; flex-wrap:wrap; align-items:center; gap:.4rem; }
.villages-quick-art-actions label { margin:0; }
.villages-quick-dialog label { display:block; margin:.35rem 0; }
.villages-quick-dialog input,.villages-quick-dialog textarea { box-sizing:border-box; margin-top:.35rem; background:#0c1830; border-color:#65799c; }
.villages-quick-dialog>button { margin:.6rem .5rem 0 0; }
.villages-quick-space { border:1px solid #596b9b; background:#192441; padding:.7rem; border-radius:.6rem; margin:.6rem 0; }
.villages-quick-space summary { overflow-wrap:anywhere; }
.villages-quick-space summary>span { float:right; color:#81e6cd; font-size:.85rem; }
.villages-quick-space summary small { display:block; color:#c1c9e9; margin:.35rem 0 0 1rem; line-height:1.4; }
@media(max-width:704px) { .villages-forging-v2 .villages-quick-arrange,.villages-forging-v2 .marinara-capability-villages-map-camera-controls { display:none; } }
@media(max-width:727px) { .villages-quick-dialog { inset:var(--quick-editor-top,8svh) 0 auto; margin:0; width:100%; max-width:100%; border-radius:1rem 1rem 0 0; padding:.9rem .9rem 0; } .villages-forging-v2 dialog.villages-quick-dialog[open] { height:var(--quick-editor-height,92svh); max-height:var(--quick-editor-height,92svh); padding-bottom:0; } }
@media(max-width:359px) { .villages-quick-dialog fieldset.villages-quick-venue-fields { grid-template-columns:1fr; } }

/* Lorebook selection uses the same visible card and modal pattern as People. */
.villages-lorebook-card { min-width:0; }
.villages-place-options .villages-lorebook-card { border:0; background:transparent; padding:0; margin:0; }
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
`;
