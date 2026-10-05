const P = "marinara-capability-villages";

/** Paper styling is local to the directory and dossier, never other menus or Engine chrome. */
export const DOSSIER_STYLES = `
.${P}-dossier-root, .${P}-directory-root {
  --background:#ece2ce; --foreground:#302b23; --border:#c7b99d; --muted-foreground:#695f50;
  --primary:#526951; --secondary:#ede4d2; --popover:#faf4e8;
  --dossier-paper:#faf4e8; --dossier-ink:#302b23; --dossier-line:#d9cdb6;
  box-sizing:border-box; color:var(--dossier-ink); background-color:#414e41;
  background-image:repeating-linear-gradient(9deg,#ffffff03 0 1px,transparent 1px 5px),linear-gradient(135deg,#56614a,#333f35);
  padding:0; gap:0; overflow:auto; display:block; height:100%; min-height:0;
}
.${P}-dossier-root *, .${P}-directory-root * { box-sizing:border-box; }
.${P}-dossier-root button, .${P}-directory-root button {
  font:inherit; color:var(--dossier-ink); min-height:44px; border:1px solid #c7b99d; border-radius:4px;
  background:linear-gradient(#fcf7ee,#efe5d2); padding:10px 16px; cursor:pointer;
  box-shadow:0 2px 3px #372c2012; white-space:normal; overflow-wrap:anywhere;
}
.${P}-dossier-root button:hover:not(:disabled), .${P}-directory-root button:hover:not(:disabled) { background:#e9dfcc; }
.${P}-dossier-root button:disabled, .${P}-directory-root button:disabled { opacity:.55; cursor:default; }
.${P}-dossier-root :is(button,input,select,summary,a):focus-visible, .${P}-directory-root :is(button,input,select,summary,a):focus-visible { outline:3px solid #526951; outline-offset:3px; }
.${P}-dossier-root :is(p,li,small), .${P}-directory-root p { line-height:1.55; overflow-wrap:anywhere; }
.${P}-dossier-root :is(h1,h2,h3,h4), .${P}-directory-root :is(h1,h2,h3) { color:var(--dossier-ink); overflow-wrap:anywhere; }
.${P}-dossier-desk { display:grid; grid-template-columns:minmax(0,40%) minmax(0,1fr); gap:28px; padding:24px; min-height:100%; isolation:isolate; overflow:hidden; position:relative; }
.${P}-dossier-desk::before { content:""; position:absolute; z-index:-1; inset:28px 18px 18px 24px; border:1px solid #cbbda1; border-radius:7px; background:linear-gradient(120deg,#f1e7d3,#e8dcc3); box-shadow:0 7px 20px #17201540; }
.${P}-dossier-identity { min-width:0; padding:28px 0 0 14px; display:flex; flex-direction:column; align-items:start; }
.${P}-dossier-journal { position:relative; width:100%; min-height:560px; transform:rotate(-9deg); transform-origin:70% 35%; margin:-30px 0 55px -30px; padding:40px 24px 44px 48px;
  border:9px solid #4b3427; border-left-width:16px; border-radius:5px 12px 15px 4px;
  background-color:#f6edd9; background-image:repeating-linear-gradient(0deg,transparent 0 31px,#a9906110 31px 32px),radial-gradient(ellipse at 30% 20%,#fffaf099,transparent 65%),linear-gradient(120deg,#f4e8cb,#fbf2dc 70%,#e1ceb0);
  box-shadow:2px 3px 0 #c0aa87,4px 6px 0 #dfc9a5,7px 9px 0 #6d4b32,9px 14px 18px #2b251b60,inset 0 0 26px #ab8e5240;
}
.${P}-dossier-journal::before { content:""; position:absolute; inset:-6px; border:1px dashed #b58b57; border-radius:3px 9px 11px 3px; pointer-events:none; }
.${P}-dossier-binding { position:absolute; top:38px; bottom:35px; left:-24px; width:37px; background:repeating-linear-gradient(0deg,transparent 0 40px,#372c20 40px 43px,#b49c65 43px 47px,#f8e5a9 47px 49px,#6e582e 49px 52px,transparent 52px 80px); border-radius:4px; pointer-events:none; }
.${P}-dossier-journal h1 { font-family:"Segoe Print","Bradley Hand",Georgia,serif; font-weight:700; font-size:clamp(30px,3.4vw,58px); line-height:1.2; margin:0 0 26px; }
.${P}-dossier-journal-content { display:grid; grid-template-columns:minmax(0,1fr); gap:25px; }
.${P}-dossier-portrait { position:relative; max-width:260px; width:80%; aspect-ratio:4/5; padding:9px 9px 23px; background:#fffbef; transform:rotate(3deg); box-shadow:0 3px 6px #59482b40; }
.${P}-dossier-portrait::before, .${P}-dossier-portrait::after { content:""; position:absolute; top:-9px; width:72px; height:25px; background:#d8c7a38f; transform:rotate(-16deg); z-index:2; }
.${P}-dossier-portrait::before { left:-12px; } .${P}-dossier-portrait::after { right:-12px; transform:rotate(14deg); }
.${P}-dossier-portrait .${P}-avatar { width:100%; height:100%; min-width:0; max-width:none; max-height:none; border:0; border-radius:0; background:#e5d8c2; font-size:72px; }
.${P}-dossier-portrait .${P}-avatar img { width:100%; height:100%; object-fit:cover; }
.${P}-dossier-biography { min-width:0; max-height:280px; overflow:auto; scrollbar-width:thin; }
.${P}-dossier-biography p { margin:0 0 10px; font-size:15px; line-height:1.65; }
.${P}-dossier-tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:25px; }
.${P}-dossier-tags span { border-radius:20px; padding:5px 13px; color:#322d28; background:#d2d9ba; font-size:13px; overflow-wrap:anywhere; max-width:100%; }
.${P}-dossier-tags span:nth-child(3n+2) { background:#d9c9df; } .${P}-dossier-tags span:nth-child(3n+3) { background:#e6c998; }
.${P}-dossier-journal-rule { display:block; width:65%; height:1px; background:#bba37c; margin:30px 0 0; }
.${P}-signature { margin:20px 0 0; max-width:100%; color:#302b23; }
.${P}-signature-art { max-width:100%; width:240px; padding:8px 10px; }
.${P}-signature-image { display:block; width:220px; max-width:100%; height:70px; object-fit:contain; object-position:left center; }
.${P}-signature-name { display:block; font:36px/1.4 "Segoe Script","Snell Roundhand","URW Chancery L",cursive; overflow-wrap:anywhere; transform-origin:center; padding:4px 0; }
.${P}-signature-name[data-hand="neat"] { font-family:"Segoe Print","Bradley Hand",cursive; font-size:30px; }
.${P}-signature-name[data-hand="bold"] { font-weight:700; }
.${P}-signature-name[data-hand="lively"] { font-family:"Bradley Hand","Segoe Print",cursive; font-style:italic; }
.${P}-dossier-root .${P}-signature-flourish { display:block; width:100%; height:20px; fill:none; stroke:currentColor; stroke-width:1.6; stroke-linecap:round; }
.${P}-signature-controls { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
.${P}-dossier-root .${P}-signature-controls button { font-size:12px; padding:8px 10px; }
.${P}-signature > p { font-size:12px; margin:8px 0 0; }
.${P}-dossier-back { margin:12px 0 15px; position:relative; z-index:2; }
.${P}-dossier-workspace { min-width:0; display:flex; flex-direction:column; gap:18px; padding:12px 0 0; position:relative; z-index:1; }
.${P}-dossier-tabs { display:flex; gap:14px; align-items:start; min-width:0; }
.${P}-dossier-tabs > div { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; flex:1; min-width:0; }
.${P}-dossier-tabs button { display:flex; align-items:center; justify-content:center; gap:8px; font-size:14px; padding:11px 9px; }
.${P}-dossier-tabs button[aria-pressed="true"] { background:#657654; color:#fffaf0; border-color:#536448; }
.${P}-dossier-tabs .${P}-dossier-inspect { flex:0 0 auto; }
.${P}-dossier-root svg { width:21px; height:21px; flex:0 0 21px; }
.${P}-dossier-content { min-width:0; display:grid; gap:16px; align-content:start; }
.${P}-dossier-sheet { min-width:0; background:linear-gradient(115deg,#fffaf0,#f5ecdc); border:1px solid #d6c9b1; border-radius:5px; padding:20px; box-shadow:0 3px 7px #57452b12; }
.${P}-dossier-sheet h2 { display:flex; align-items:center; gap:10px; margin:0 0 15px; padding-bottom:11px; border-bottom:1px solid var(--dossier-line); font:700 23px Georgia,serif; }
.${P}-dossier-sheet p { margin:6px 0 12px; }
.${P}-dossier-venues { display:grid; gap:14px; }
.${P}-dossier-venues article { display:flex; gap:20px; align-items:center; min-width:0; }
.${P}-dossier-venues article > div:last-child { flex:1; min-width:0; }
.${P}-dossier-venues h3 { margin:0 0 6px; font:700 22px Georgia,serif; }
.${P}-dossier-venues button { background:#5b6d52; color:#fffaf0; border-color:#4d5f45; }
.${P}-dossier-venues .${P}-dossier-polaroid { width:155px; flex:0 0 155px; padding:7px; transform:none; background:#fff9ed; border:1px solid #d3c4a6; }
.${P}-dossier-polaroid .${P}-pin-photo { width:100%; aspect-ratio:4/3; background:#e5dbc9; }
.${P}-dossier-polaroid .${P}-pin-photo img { width:100%; height:100%; object-fit:contain; }
.${P}-dossier-polaroid .${P}-pin-name { display:none; }
.${P}-dossier-summary-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
.${P}-dossier-root .${P}-dossier-summary { display:flex; flex-direction:column; align-items:stretch; text-align:left; gap:12px; padding:20px; min-height:170px; border-color:#d6c9b1; background:linear-gradient(115deg,#fffaf0,#f5ecdc); }
.${P}-dossier-summary-title { display:flex; align-items:center; gap:8px; font:700 21px Georgia,serif; padding-bottom:12px; border-bottom:1px solid var(--dossier-line); }
.${P}-dossier-summary-title > span { margin-left:auto; }
.${P}-dossier-summary strong { font-weight:500; } .${P}-dossier-summary small { color:#695f50; }
.${P}-dossier-links { display:grid; gap:9px; }
.${P}-dossier-links button { text-align:left; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:5px; }
.${P}-dossier-links button small { grid-column:1; } .${P}-dossier-links button > span { grid-column:2; grid-row:1 / 3; align-self:center; }
.${P}-dossier-controls { display:flex; flex-wrap:wrap; justify-content:end; align-items:center; gap:10px; padding:4px 0 10px; }
.${P}-dossier-controls > .${P}-row { flex-wrap:wrap; }
.${P}-dossier-controls details { position:relative; }
.${P}-dossier-controls summary { cursor:pointer; padding:12px 16px; min-height:44px; border:1px solid #c7b99d; background:#f6eedd; border-radius:4px; }
.${P}-dossier-controls details > button { display:block; margin-top:6px; }
.${P}-dossier-refresh { width:100%; border-top:1px solid var(--dossier-line); padding-top:10px; }
.${P}-dossier-inspect-notice { padding:12px 15px; margin:0; background:#eadbbd; border-left:4px solid #977340; color:#584529; }
.${P}-dossier-warning { padding:12px; border:1px solid #a86345; background:#f7e3d4; color:#733d2c; }
/* Existing management components inherit the paper system only within a profile. */
.${P}-dossier-root .${P}-overlay { background:transparent; color:var(--dossier-ink); border:0; padding:0; box-shadow:none; min-width:0; }
.${P}-dossier-root .villages-relationship-card, .${P}-dossier-root .villages-relationship-setup { background:var(--dossier-paper); color:var(--dossier-ink); border-color:var(--dossier-line); border-radius:4px; }
.${P}-dossier-root .villages-relationships :is(details,.villages-relationship-tie) { border-color:var(--dossier-line); }
.${P}-dossier-root .villages-relationships :is(input,select) { background:#fffaf0; color:var(--dossier-ink); border-color:#b7a787; }
.${P}-dossier-root .villages-relationship-meter meter { accent-color:#637953; }
.${P}-dossier-root .${P}-memory-library { --memory-panel:#fff8eb; --memory-ink:#302b23; color:var(--dossier-ink); }
.${P}-dossier-root .${P}-memory-library :is(.${P}-memory-hero,.${P}-memory-card,.${P}-memory-layers article,.${P}-memory-evidence,.${P}-memory-empty) { background:var(--dossier-paper); color:var(--dossier-ink); border-color:var(--dossier-line); }
.${P}-dossier-root .${P}-memory-library :is(p,small,dd,dt,h3,strong), .${P}-dossier-root :is(.${P}-story-scope,.${P}-story-meta,.${P}-empty,.${P}-hint) { color:inherit; }
.${P}-dossier-root .${P}-memory-toolbar { flex-wrap:wrap; }
.${P}-dossier-root .${P}-memory-hero, .${P}-dossier-root .${P}-memory-layers { display:block; }
.${P}-dossier-root .${P}-memory-layers article { margin-bottom:8px; }
.${P}-dossier-root .${P}-week, .${P}-dossier-root .${P}-wish-card, .${P}-dossier-root .${P}-agenda-day { background:#fbf4e6; color:var(--dossier-ink); border-color:var(--dossier-line); }
.${P}-dossier-root .${P}-agenda-compare { display:block; }
.${P}-dossier-root .${P}-agenda-blocks li { grid-template-columns:1fr; background:#f2e8d5; border-color:var(--dossier-line); }
.${P}-dossier-root .${P}-week-toggle h3 { font-size:18px; }
.${P}-dossier-root .${P}-week-body { padding:12px; }
.${P}-dossier-root input:not([type="checkbox"]):not([type="range"]), .${P}-directory-root input { background:#fffaf0; color:var(--dossier-ink); border:1px solid #b7a787; border-radius:4px; padding:11px; min-height:44px; max-width:100%; font:inherit; }
.${P}-directory-paper { max-width:1440px; margin:24px auto; padding:30px; background:linear-gradient(120deg,#fbf5e9,#eee2cd); border:1px solid #bfae90; border-radius:6px; box-shadow:0 8px 25px #17201540; }
.${P}-directory-head { display:flex; align-items:center; justify-content:space-between; gap:16px; }
.${P}-directory-head h1 { font:700 36px Georgia,serif; margin:0; }
.${P}-directory-tools { display:flex; gap:12px; margin:24px 0; flex-wrap:wrap; }
.${P}-directory-tools input { flex:1; min-width:min(100%,180px); }
.${P}-directory-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr)); gap:20px; }
.${P}-directory-root .${P}-directory-card { display:flex; flex-direction:column; align-items:stretch; text-align:left; padding:14px; gap:14px; background:#fffaef; box-shadow:0 3px 6px #4b3e2920; }
.${P}-directory-card .${P}-avatar { width:100%; height:210px; max-width:none; border:0; border-radius:2px; background:#e6dccb; font-size:55px; }
.${P}-directory-card .${P}-avatar img { width:100%; height:100%; object-fit:cover; }
.${P}-directory-card strong { font:700 23px Georgia,serif; }
.${P}-directory-card small { line-height:1.5; }
.${P}-directory-picker { border-top:1px solid var(--dossier-line); padding:20px 0; }
.${P}-directory-root .${P}-picker-item { background:#f9f0df; color:var(--dossier-ink); }
@media(min-width:1450px) { .${P}-dossier-journal-content { grid-template-columns: minmax(0,1fr) minmax(0,.85fr); } .${P}-dossier-portrait { width:100%; } }
@media(min-width:1101px) {
  .${P}-dossier-desk[data-overview="true"] { grid-template-rows:auto auto minmax(0,1fr) auto auto; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-workspace,
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-content { display:contents; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-identity { grid-column:1; grid-row:1 / 4; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-tabs { grid-column:2; grid-row:1; align-self:start; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-primary-sheet { grid-column:2; grid-row:3; align-self:start; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-content > p { grid-column:2; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-summary-grid { grid-column:1 / -1; grid-row:4; grid-template-columns:repeat(4,minmax(0,1fr)); }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-controls { grid-column:2; grid-row:2; align-self:start; }
  .${P}-dossier-desk[data-overview="true"] .${P}-dossier-content > :last-child:not(.${P}-dossier-primary-sheet):not(.${P}-dossier-summary-grid):not(p) { grid-column:1 / -1; }
}
@media(max-width:1100px) { .${P}-dossier-desk { gap:18px; padding:16px; grid-template-columns:minmax(0,36%) minmax(0,1fr); } .${P}-dossier-journal { padding:30px 18px 30px 32px; margin-left:-24px; } .${P}-dossier-tabs { flex-wrap:wrap; } .${P}-dossier-tabs > div { flex-basis:100%; } .${P}-dossier-tabs .${P}-dossier-inspect { margin-left:auto; } .${P}-dossier-summary-title { font-size:18px; } .${P}-dossier-sheet { padding:15px; } .${P}-dossier-venues article { gap:12px; } .${P}-dossier-venues .${P}-dossier-polaroid { flex-basis:110px; width:110px; } }
@media(min-width:761px) and (max-width:1100px) { .${P}-dossier-journal { transform:rotate(-4deg); } }
@media(max-width:760px) {
  .${P}-dossier-desk { display:block; padding:14px; overflow:hidden; } .${P}-dossier-desk::before { inset:15px 7px 7px; }
  .${P}-dossier-identity { padding:10px 15px 0; } .${P}-dossier-journal { transform:rotate(-2deg); width:100%; min-height:0; margin:-12px 0 22px; padding:24px 18px 24px 30px; border-width:6px; border-left-width:10px; }
  .${P}-dossier-journal h1 { font-size:34px; margin-bottom:18px; } .${P}-dossier-journal-content { grid-template-columns:minmax(0,.7fr) minmax(0,1fr); gap:16px; }
  .${P}-dossier-portrait { width:100%; } .${P}-dossier-biography { max-height:180px; } .${P}-dossier-biography p { font-size:14px; }
  .${P}-dossier-tags { margin-top:18px; } .${P}-dossier-journal-rule { margin-top:18px; } .${P}-dossier-binding { left:-19px; width:28px; }
  .${P}-dossier-back { margin:8px 0 14px; } .${P}-dossier-workspace { padding-top:0; }
  .${P}-dossier-tabs > div { grid-template-columns:repeat(3,minmax(0,1fr)); } .${P}-dossier-tabs button { flex-direction:column; font-size:12px; padding:8px 3px; min-height:62px; gap:5px; }
  .${P}-dossier-tabs .${P}-dossier-inspect { flex-direction:row; min-height:44px; padding:8px 12px; font-size:14px; }
  .${P}-dossier-summary-grid { grid-template-columns:1fr; gap:12px; } .${P}-dossier-root .${P}-dossier-summary { min-height:145px; }
  .${P}-dossier-controls { justify-content:start; } .${P}-dossier-venues article { flex-wrap:wrap; } .${P}-dossier-venues .${P}-dossier-polaroid { flex-basis:115px; width:115px; }
  .${P}-dossier-root .${P}-memory-stats { flex-wrap:wrap; } .${P}-dossier-root .${P}-memory-grid { grid-template-columns:minmax(0,1fr); }
  .${P}-directory-paper { margin:12px; padding:18px; } .${P}-directory-head { align-items:start; flex-wrap:wrap; } .${P}-directory-head h1 { font-size:30px; }
}
@media(prefers-reduced-motion:reduce) { .${P}-dossier-root *, .${P}-directory-root * { transition:none; animation:none; } }
`;
