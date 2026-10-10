export const VILLAGES_FORGING_STYLES = `
/* Step 3 owns a bounded map workspace. Its inspector cannot resize the map. */
.villages-forging-v2[data-step="2"] { container-type:inline-size; gap:0; --background:#29251f; --popover:#37352b; --foreground:#f2e9d8; --muted-foreground:#c4c9aa; --border:#71664f; background:#29251f; color:#f2e9d8; }
.villages-forging-v2[data-step="2"] .marinara-capability-villages-setup-heading { padding:.35rem .75rem; border-color:#71664f; }
.villages-forging-v2[data-step="2"] .villages-forging-steps { padding:.35rem .75rem; gap:.35rem; margin:0; }
.villages-forging-v2[data-step="2"] .villages-forging-kicker { display:none; }
.villages-forging-v2[data-step="2"] .villages-forging-body { display:flex; flex-direction:column; overflow:hidden; padding:.35rem .75rem; }
.villages-forging-v2[data-step="2"] button { background:#37352b; color:#f2e9d8; border-color:#71664f; }
.villages-forging-v2[data-step="2"] button[aria-pressed="true"],.villages-forging-v2[data-step="2"] button[data-active="true"],.villages-forging-v2[data-step="2"] .villages-forging-primary { background:#655a43; border-color:#eadcc0; }
.villages-forging-v2[data-step="2"] p { color:#c4c9aa; }
.villages-forging-v2[data-step="2"] label>input:not([type="checkbox"]),.villages-forging-v2[data-step="2"] label>select,.villages-forging-v2[data-step="2"] label>textarea { color:#f2e9d8; background:#211f1a; border-color:#71664f; }
.villages-forging-v2[data-step="2"] details { border-color:#71664f; }
.villages-forging-v2[data-step="2"] .villages-forging-footer { background:#29251f; border-color:#71664f; padding:.4rem .75rem; margin:0; }
.villages-workspace { display:flex; flex:1; flex-direction:column; min-height:0; min-width:0; gap:.4rem; }
.villages-workspace-toolbar { display:flex; flex:none; flex-wrap:wrap; gap:.4rem .75rem; align-items:center; }
.villages-workspace-toolbar>span { flex:1; font-size:.85rem; }
.villages-workspace-toolbar>strong { display:flex; align-items:center; gap:.5rem; min-width:0; max-width:50%; }
.villages-workspace-toolbar>strong small { font-weight:400; font-size:.8rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:12rem; }
.villages-workspace-grid { display:grid; grid-template-columns:minmax(0,1fr) 22rem; gap:.6rem; flex:1; min-height:0; }
.villages-workspace-map { position:relative; display:flex; flex-direction:column; min-width:0; min-height:0; }
.villages-workspace-map .villages-forging-map { display:flex; flex-direction:column; flex:1; min-height:0; gap:.35rem; }
.villages-workspace-map .villages-forging-map>p { font-size:.82rem; margin:0; }
.villages-workspace-map .villages-forging-placement { padding:.3rem .5rem; border-color:#71664f; background:#37352b; }
.villages-workspace-map .villages-forging-map .marinara-capability-villages-setup-map-viewport { flex:1; min-height:0; border-color:#71664f; display:grid; place-items:center; }
.villages-workspace-map .villages-forging-map .marinara-capability-villages-stage { min-height:0; --founding-photo-width:36px; }
.villages-workspace-map .villages-forging-map>button { align-self:start; }
.villages-workspace-map>p[role="alert"] { position:absolute; z-index:10; bottom:3.5rem; left:.5rem; right:.5rem; margin:0; padding:.35rem; background:#49352b; border:1px solid #d2ab72; border-radius:.4rem; pointer-events:none; }
.villages-workspace-inspector { overflow:auto; overscroll-behavior:contain; min-width:0; min-height:0; padding:.6rem; border:1px solid #71664f; border-radius:.6rem; background:#37352b; }
.villages-workspace-detail-heading { display:flex; align-items:center; justify-content:space-between; gap:.5rem; margin-top:.75rem; }
.villages-workspace-detail-heading h3 { overflow-wrap:anywhere; }
.villages-workspace-tabs { display:flex; gap:.35rem; }
.villages-workspace-tabs button { flex:1; }
.villages-workspace fieldset { min-width:0; margin:.5rem 0; padding:.35rem; border:0; }
.villages-workspace label { display:block; }
.villages-workspace-artwork img { width:48px; height:48px; object-fit:cover; }
.villages-workspace-artwork small { display:block; }
.villages-workspace-save { border-top:1px solid #71664f; padding-top:.6rem; }
.villages-workspace-switch,.villages-workspace-back { display:none; }
.villages-workspace .marinara-capability-villages-stage[data-photo-pins="true"][data-mobile="false"] .marinara-capability-villages-pin { display:grid; place-items:center; padding:0; min-width:44px; min-height:44px; width:auto; height:auto; background:transparent; border:0; touch-action:none; }
.villages-workspace .marinara-capability-villages-stage[data-photo-pins="true"] .marinara-capability-villages-pin-photo-card { width:36px; transform:none!important; transition:transform .12s; }
.villages-workspace .marinara-capability-villages-pin-name { display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; white-space:normal; font-size:8px; line-height:1.2; max-height:1.2em; overflow:hidden; }
.villages-workspace .marinara-capability-villages-stage[data-compact-photos="true"] .marinara-capability-villages-pin:focus-visible .marinara-capability-villages-pin-photo-card { transform:scale(2)!important; }
.villages-workspace .marinara-capability-villages-pin-holder:focus-within { z-index:30; }
@media(hover:hover) and (pointer:fine) {
 .villages-workspace .marinara-capability-villages-stage[data-compact-photos="true"] .marinara-capability-villages-pin:hover .marinara-capability-villages-pin-photo-card { transform:scale(2)!important; }
 .villages-workspace .marinara-capability-villages-pin-holder:hover { z-index:30; }
}
.villages-workspace .marinara-capability-villages-pin[data-selected="true"] .marinara-capability-villages-pin-photo-card { outline:3px solid #eadcc0; outline-offset:3px; }
.villages-workspace[data-narrow="true"] .villages-workspace-grid { grid-template-columns:minmax(0,1fr); }
.villages-workspace[data-narrow="true"] .villages-workspace-inspector { display:none; }
.villages-workspace[data-sheet="true"] .villages-workspace-inspector { display:block; position:fixed; inset:0; z-index:1000; border-radius:0; padding:1rem; background:#37352b; }
.villages-workspace[data-sheet="true"] .villages-workspace-back { display:block; margin-bottom:.5rem; }
.villages-workspace[data-narrow="true"] .villages-workspace-toolbar { gap:.25rem; }
.villages-workspace[data-narrow="true"] .villages-workspace-toolbar>strong { max-width:100%; }
.villages-workspace[data-narrow="true"] .villages-workspace-toolbar>span { display:none; }
.villages-workspace[data-narrow="true"] .villages-workspace-toolbar button { font-size:.85rem; }
@media(max-height:750px) {
 .villages-forging-v2[data-step="2"] .villages-workspace-map .villages-forging-map>p:not([role]) { display:none; }
}
.villages-forging-v2 { --background:#121936; --popover:#141b39; --foreground:#f3f3ff; --muted-foreground:#c1c9e9; --border:#596b9b; display:flex; flex-direction:column; height:100%; max-height:100dvh; min-height:0; padding:0!important; overflow:hidden; color:#f3f3ff; background:#121936; }
.villages-forging-v2 *, .villages-forging-editor * { box-sizing:border-box; }
.villages-forging-v2 .marinara-capability-villages-setup-heading { padding:.9rem 1.25rem; margin:0; border-bottom:1px solid #43547d; flex:none; }
.villages-forging-v2 h1 { font-size:1.25rem; margin:0; } .villages-forging-v2 h1 span { font-weight:400; }
.villages-forging-v2 h2 { font-size:1.65rem; margin:.2rem 0 .6rem; } .villages-forging-v2 h3 { margin:.1rem 0 .65rem; } .villages-forging-v2 h4 { margin:.1rem 0; }
.villages-forging-v2 p { line-height:1.5; margin:.5rem 0 .8rem; color:#c1c9e9; overflow-wrap:anywhere; }
.villages-forging-steps { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.6rem; padding:.75rem 1.25rem; flex:none; }
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
.villages-forging-v2 textarea { resize:vertical; } .villages-forging-v2 input[type=checkbox] { width:1.2rem; height:1.2rem; }
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
.villages-resident-background { display:grid; grid-template-columns:6rem minmax(0,1fr); gap:1rem; border:1px solid #43547d; border-radius:.6rem; padding:.8rem; margin:.6rem 0; min-width:0; }
.villages-resident-identity { display:flex; flex-direction:column; gap:.5rem; min-width:0; overflow-wrap:anywhere; }
.villages-resident-fields { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.1fr); gap:1rem; min-width:0; }
.villages-resident-choices { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.6rem; align-content:start; min-width:0; }
.villages-resident-custom { grid-column:1/-1; }
.villages-resident-background label { margin:0; align-content:start; font-size:.9rem; }
.villages-resident-background label small[role=alert] { color:#ffb9bc; }
.villages-resident-background textarea,.villages-resident-background select { width:100%; min-width:0; font-size:1rem!important; }
.villages-resident-toggle,.villages-mobile-role-toggle { display:none; }
.villages-resident-review { padding:.6rem 0; border-bottom:1px solid #43547d; overflow-wrap:anywhere; }
.villages-resident-review p { margin:.2rem 0; }
.villages-forging-v2 .villages-persona-preview { margin:.4rem 0; }
.villages-forging-v2 .marinara-capability-villages-founding-roster > p { display:none; }
.villages-forging-body[data-step="0"] .marinara-capability-villages-identity-strip { min-height:0; }
.villages-forging-body[data-step="0"] .marinara-capability-villages-identity-card { flex-direction:row; flex:0 0 auto; max-width:15rem; gap:.45rem; padding:.4rem; font-size:.9rem; }
.villages-forging-body[data-step="0"] .marinara-capability-villages-identity-card strong { max-width:10rem; white-space:normal; overflow-wrap:anywhere; text-align:left; }
.villages-forging-body[data-step="0"] .marinara-capability-villages-identity-card small { display:none; }
.villages-forging-body[data-step="0"] .marinara-capability-villages-identity-card-face { width:2rem; height:2rem; }
.villages-forging-body[data-step="0"] .marinara-capability-villages-founding-roster-grid { height:11rem; grid-auto-rows:3.25rem; }
.villages-forging-body[data-step="0"] .villages-founding-role-editor input,.villages-forging-body[data-step="0"] .villages-founding-role-editor textarea { font-size:1rem; }
.villages-founding-role-editor fieldset { margin:.4rem 0 0; }
.villages-forging-v2 .villages-founding-role-editor label { margin:0; align-items:stretch; font-size:.9rem; font-weight:400; }
.villages-forging-v2 .villages-people-connections details { margin:.5rem 0 0; padding:.4rem 0 0; }
@media(min-width:1001px) { .villages-forging-body[data-step="0"] .villages-forging-columns { grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr); } }
@media(max-width:1000px) { .villages-forging-columns { grid-template-columns:minmax(0,1fr); } .villages-forging-editor .villages-forging-zone-grid { grid-template-columns:1fr; } .villages-resident-choices { grid-template-columns:1fr; } }
@media(max-width:704px) {
 .villages-forging-body { padding:.75rem; } .villages-forging-steps { padding:.5rem; gap:.25rem; } .villages-forging-steps button { padding:.4rem .15rem; font-size:.8rem; } .villages-forging-resume { grid-template-columns:1fr; }
 .villages-forging-footer { padding:.5rem; padding-bottom:max(.5rem,env(safe-area-inset-bottom)); gap:.4rem; } .villages-forging-footer button { flex:1; } .villages-forging-footer .villages-forging-saved { flex-basis:100%; order:3; } .villages-forging-editor { width:100%; max-height:100dvh; } .villages-forging-editor .villages-forging-editor-top { grid-template-columns:1fr; }
 .villages-resident-background { display:block; padding:.6rem; }
 .villages-resident-identity,.villages-desktop-role-heading { display:none; }
 .villages-forging-v2 .villages-resident-toggle,.villages-forging-v2 .villages-mobile-role-toggle { display:flex; align-items:center; gap:.6rem; width:100%; min-width:0; text-align:left; }
 .villages-resident-toggle>span:nth-child(2) { flex:1; min-width:0; }
 .villages-resident-toggle strong,.villages-resident-toggle small { display:block; overflow-wrap:anywhere; }
 .villages-resident-toggle small { color:#c1c9e9; font-size:.8rem; }
 .villages-resident-fields { grid-template-columns:1fr; gap:.8rem; padding-top:.8rem; }
 .villages-resident-fields[data-expanded=false],.villages-founding-role-editor[data-expanded=false] { display:none; }
 .villages-forging-v2 .marinara-capability-villages-founding-roster-card { font-size:.9rem; min-height:44px; }
 .villages-forging-v2 .marinara-capability-villages-founding-roster-card small { display:none; }
 .villages-forging-v2 .marinara-capability-villages-founding-roster-card strong { white-space:normal; overflow-wrap:anywhere; }
 .villages-forging-body[data-step="0"] .marinara-capability-villages-founding-roster-grid { grid-auto-rows:minmax(3.25rem,auto); }
}

/* Header and navigation belong to the document flow, including with an on-screen keyboard. */
.villages-forging-v2 { display:block; overflow:auto; overscroll-behavior:contain; }
.villages-forging-v2 .villages-forging-heading { display:flex; align-items:center; gap:.65rem; padding:.35rem .75rem; min-height:36px; }
.villages-forging-v2 .villages-forging-heading h1 { font-size:.8rem; font-weight:400; white-space:nowrap; }
.villages-forging-v2 .villages-forging-steps { display:flex; list-style:none; margin:0; padding:0; gap:.3rem; }
.villages-forging-steps li { display:grid; place-items:center; width:20px; height:20px; border:1px solid #8090b7; border-radius:50%; font-size:.65rem; }
.villages-forging-steps li[data-active=true] { background:#6650cf; color:#fff; border-color:#c1acff; }
.villages-forging-v2 .villages-forging-body { overflow:visible; flex:none; }
.villages-forging-v2[data-step="2"] .villages-forging-body { height:calc(100% - 36px); min-height:24rem; overflow:visible; }
.villages-forging-v2 .villages-forging-footer { position:static; display:flex; margin:0; }
.villages-forging-v2 .villages-forging-heading { position:static; width:auto; height:auto; overflow:visible; clip-path:none; border:0; }
.villages-founding-field { min-width:0; margin:.75rem 0; }
.villages-forging-v2 .villages-founding-field-heading { display:flex; align-items:center; flex-wrap:wrap; min-width:0; }
.villages-forging-v2 .villages-founding-field-heading>label { margin:0; flex:1; }
.villages-founding-field>input,.villages-founding-field>textarea,.villages-founding-field>select { width:100%; min-width:0; min-height:44px; border:1px solid var(--border,#65799c); border-radius:.45rem; padding:.6rem; color:var(--foreground,#f3f3ff); background:var(--background,#0c1830); font:inherit; }
.villages-founding-help { display:inline-flex; align-items:center; flex-wrap:wrap; vertical-align:middle; max-width:100%; font-weight:400; }
.villages-founding-help>button { display:grid; place-items:center; width:44px; min-width:44px; height:44px; padding:0; border:0; background:transparent; color:inherit; }
.villages-founding-help>button>span { display:grid; place-items:center; width:18px; height:18px; border:1px solid currentColor; border-radius:50%; font:12px Arial,sans-serif; }
.villages-founding-help-text { display:block; flex-basis:100%; max-width:28rem; font-size:.85rem; line-height:1.5; padding:.4rem; }
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
.villages-forging-v2 .villages-founding-role-editor { border-top:1px solid #43547d; margin:.65rem 0 0; padding:.5rem 0 0; }
.villages-forging-v2 .villages-founding-role-editor fieldset { border:0; padding:0; margin:0; }
.villages-founding-role-editor .marinara-capability-villages-founding-role-fields { grid-template-columns:minmax(0,1fr); }
.villages-forging-v2 .villages-founding-role-editor .villages-founding-field { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:.5rem; align-items:center; margin:.2rem 0 0; }
.villages-founding-role-editor .villages-founding-field>p { grid-column:1/-1; }
.villages-forging-v2 .villages-founding-role-editor input::placeholder { color:#a6aed0; opacity:.75; }
.villages-selected-villager { min-width:0; border:1px solid #aa87ff; border-radius:.65rem; background:#30305c; box-shadow:inset 0 0 0 1px #aa87ff; }
.villages-forging-v2 .villages-selected-villager>.villages-people-identity { border:0; box-shadow:none; background:transparent!important; }
.villages-embedded-backstory { margin:0 .65rem; border-top:1px solid #596b9b; min-width:0; }
.villages-forging-v2 .villages-embedded-backstory .villages-backstory-row { flex-wrap:wrap; }
.villages-forging-v2 .villages-embedded-backstory label { margin:0; flex:none; font-size:.9rem; }
.villages-embedded-backstory .villages-backstory-row>select { flex:1; }
.villages-backstory-heading { display:flex; align-items:center; min-width:0; flex-basis:100%; position:relative; }
.villages-backstory-heading .villages-founding-help { width:44px; }
.villages-backstory-heading .villages-founding-help-text { position:absolute; z-index:3; top:100%; right:0; width:min(28rem,100%); max-width:none; box-sizing:border-box; border:1px solid #596b9b; border-radius:.5rem; background:#19213b; color:#f3f3ff; padding:.65rem; box-shadow:0 .3rem 1rem #0006; }

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
.villages-founding-dialog textarea { resize:vertical; max-height:14rem; }
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

.villages-founding-role-editor .villages-founding-field,.villages-place-panels .villages-founding-field-heading,.villages-place-panels h3 { position:relative; }
.villages-founding-role-editor .villages-founding-help,.villages-place-panels .villages-founding-help { width:44px; align-self:start; }
.villages-founding-role-editor .villages-founding-help-text,.villages-place-panels .villages-founding-help-text { position:absolute; z-index:3; top:100%; right:0; width:min(28rem,100%); max-width:none; box-sizing:border-box; border:1px solid #596b9b; border-radius:.5rem; background:#19213b; color:#f3f3ff; padding:.65rem; box-shadow:0 .3rem 1rem #0006; }

/* Place reuses People's panels and field geometry; map controls leave the reading flow. */
.villages-place-panels { display:grid; grid-template-columns:minmax(0,1fr); min-width:0; }
.villages-place-panels .villages-forging-card h3 { font-size:1rem; font-weight:400; margin:0 0 .65rem; }
.villages-place-panels .villages-founding-field { margin:.6rem 0; }
.villages-place-panels .villages-founding-field+.villages-founding-field { border-top:1px solid #43547d; padding-top:.65rem; margin-top:.65rem; }
.villages-starting-situation .villages-founding-field-heading>label { font-size:1rem; }
.villages-forging-v2 .villages-place-map-choice { display:flex; align-items:center; justify-content:space-between; gap:.65rem; width:100%; text-align:left; background:#30305c; border-color:#aa87ff; box-shadow:inset 0 0 0 1px #aa87ff; border-radius:.65rem; padding:.65rem; }
.villages-place-options details { margin:.4rem 0; }
.villages-place-map-editor .villages-forging-preview { max-height:14rem; }
.villages-place-map-editor .villages-forging-actions { display:flex; flex-wrap:wrap; gap:.4rem; }
.villages-place-map-editor input[type=checkbox] { display:inline-block; width:1.2rem; min-height:0; vertical-align:middle; }
`;
