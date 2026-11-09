import handwriting from "./art/kalam.js";

const P = "marinara-capability-villages";
const paper =
  "linear-gradient(#fff9ef66,#fff9ef66),var(--desk-paper,url('/api/capability-packages/villages/assets/paper-ivory.webp')) center/768px repeat";

/** Folder artwork sits beneath the live directory and profile controls. */
export const DOSSIER_STYLES = `

@font-face { font-family:Villages Notebook; src:url("${handwriting}") format("truetype"); font-weight:400; font-style:normal; font-display:swap; }
.${P}-dossier-root,.${P}-directory-root{--background:#f8efdd;--foreground:#362a20;--border:#c8b895;--muted-foreground:#6b5a49;--primary:#5e7047;--primary-foreground:#fff9ec;--secondary:#ede1ca;--popover:#fff6e5;--dossier-paper:#fcf2df;--dossier-ink:#362a20;--dossier-line:#c6b28c80;--notebook-hand:Georgia,"Times New Roman",serif;box-sizing:border-box;color:var(--dossier-ink);background:transparent;padding:2px 8px 8px;display:block;height:100%;min-height:0;overflow:visible;font:18px/1.4 "village-letter-assistant",system-ui,sans-serif;position:relative;isolation:isolate}
.${P}-dossier-root *,.${P}-directory-root *{box-sizing:border-box}
.${P}-dossier-root button,.${P}-directory-root button,.${P}-dossier-root summary{font:inherit;color:var(--dossier-ink);min-height:44px;border:1px solid #c8b895;border-radius:4px;background:#fff5e3;padding:8px 12px;cursor:pointer;white-space:normal;overflow-wrap:anywhere;box-shadow:none}
.${P}-dossier-root button:hover:not(:disabled),.${P}-directory-root button:hover:not(:disabled){filter:brightness(.97)}
.${P}-dossier-root button:disabled,.${P}-directory-root button:disabled{opacity:.55;cursor:default}
.${P}-dossier-root :is(button,input,textarea,select,summary,a,[tabindex]):focus-visible,.${P}-directory-root :is(button,input,select,summary,a):focus-visible{outline:3px solid #648096;outline-offset:3px}
.${P}-dossier-root :is(p,li,small),.${P}-directory-root p{line-height:1.5;overflow-wrap:anywhere}
.${P}-dossier-root :is(h1,h2,h3,h4),.${P}-directory-root :is(h1,h2,h3){color:var(--dossier-ink);font-family:Georgia,"Times New Roman",serif;font-weight:700;overflow-wrap:anywhere}
.${P}-dossier-root :is(input,select,textarea),.${P}-directory-root input{color:var(--dossier-ink);background:#fff7e7;border:1px solid #b7a787;border-radius:3px;padding:9px;min-height:44px;max-width:100%;font:inherit}

.${P}-dossier-root,.${P}-directory-root{container-type:size}
.${P}-dossier-desk{height:100%;min-height:0;display:flex;flex-direction:column;position:relative;isolation:isolate;margin:auto;padding:6cqh 13% 8cqh 5%;background:transparent}
.${P}-dossier-desk::before{content:"";position:absolute;z-index:-1;inset:0;background:var(--desk-art,url('/api/capability-packages/villages/assets/people-desk.webp')) center/100% 100% no-repeat;pointer-events:none}
.${P}-dossier-book{--tab-width:clamp(92px,9vw,140px);position:relative;flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);column-gap:6%;background:transparent}
.${P}-dossier-toolbar{grid-column:1;grid-row:1;z-index:8;min-height:62px;display:flex;align-items:center;gap:8px;margin:14px 28px 0;padding:0 0 12px;background:transparent;border-bottom:1px solid #8c7559}
.${P}-dossier-toolbar h1{font-size:26px;line-height:1.2;margin:0;flex:1;min-width:0}
.${P}-dossier-toolbar button,.${P}-dossier-toolbar summary{background:transparent;border:0;box-shadow:none;padding:6px 0;font-size:18px}
.${P}-dossier-back{margin:0;white-space:nowrap!important}
.${P}-dossier-actions{display:contents}
.${P}-dossier-management{margin-left:auto;position:relative;z-index:8}
.${P}-dossier-management>summary{list-style:none;white-space:nowrap}
.${P}-dossier-management>summary::before{content:"⚙";margin-right:8px;font-size:24px;vertical-align:middle}
.${P}-dossier-controls{position:absolute;right:0;top:100%;margin-top:6px;width:min(520px,calc(46vw - 44px));max-height:65vh;overflow:auto;display:flex;flex-wrap:wrap;gap:10px;padding:14px;border:1px solid #bba27a;background:${paper};border-radius:5px;box-shadow:0 4px 16px #30201940}
.${P}-description-editor{width:100%;min-width:0}
.${P}-description-editor label,.${P}-description-editor textarea{display:block;width:100%;box-sizing:border-box}
.${P}-description-editor textarea{resize:vertical;margin:6px 0}
.${P}-dossier-controls>.${P}-row{flex-wrap:wrap}
.${P}-dossier-controls details>button{display:block;margin-top:6px}
.${P}-dossier-refresh{width:100%;border-top:1px solid var(--dossier-line);padding-top:10px}
.${P}-dossier-toolbar .${P}-notebook-close{position:absolute;right:16px;top:18px;color:#362a20;padding:5px 10px;min-height:44px;font-size:15px}
.${P}-dossier-identity{grid-column:1;grid-row:2;min-width:0;min-height:0;padding:24px 28px 20px;overflow:auto;scrollbar-width:thin;scrollbar-color:#bda16b transparent}
.${P}-dossier-journal{width:100%}
.${P}-dossier-journal-content{display:flex;flex-direction:column;align-items:center;gap:14px}
.${P}-dossier-journal h1{font-size:clamp(34px,4.6cqh,46px);line-height:1.1;margin:0;text-align:center}
.${P}-dossier-portrait{width:min(70%,clamp(110px,25cqh,220px));aspect-ratio:1;margin:0 auto 4px;padding:7px 7px 10px;background:#fff9e9;border:1px solid #e2d1b4;box-shadow:0 3px 8px #785a3555}
.${P}-dossier-portrait .${P}-avatar{width:100%;height:100%;min-width:0;max-width:none;max-height:none;border:0;border-radius:0;background:#e5d8c2;font-size:65px}
.${P}-dossier-portrait .${P}-avatar img{width:100%;height:100%;object-fit:cover}
.${P}-dossier-biography{min-width:0;max-height:6em;overflow:auto;scrollbar-width:thin;text-align:center}
.${P}-dossier-biography p{margin:0;font-size:clamp(17px,2.4cqh,21px);line-height:1.35}
.${P}-signature{margin-top:16px;max-width:100%;color:#59434c}
.${P}-signature-art{max-width:100%;width:240px;padding:8px 0}
.${P}-signature-image{display:block;width:auto;height:auto;max-width:100%;max-height:180px;object-fit:contain;object-position:left center;mix-blend-mode:multiply}
.${P}-signature-name{display:block;font:400 34px/1.4 "Villages Notebook","Segoe Print",cursive;overflow-wrap:anywhere;padding:4px 0}
.${P}-signature-name[data-hand="bold"]{font-weight:700}
.${P}-dossier-root .${P}-signature-flourish{display:block;width:100%;height:20px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.${P}-signature-controls{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.${P}-dossier-root .${P}-signature-controls button{background:transparent;border:0;padding:4px 0;color:#756447;font-size:13px;text-decoration:underline;text-underline-offset:3px}
.${P}-dossier-root .${P}-signature-controls button,.${P}-signature>p{font-size:13px}

.${P}-dossier-workspace{min-width:0;min-height:0;grid-column:1/-1;grid-row:2;display:flex;flex-direction:column}
.${P}-dossier-section-picker{display:none}
.${P}-dossier-section-title{margin:16px 28px 0;padding:0 80px 14px 0;min-height:60px;display:flex;align-items:center;border-bottom:1px solid #8c7559;font-size:40px;line-height:1.1}
.${P}-dossier-content{width:100%;min-width:0;min-height:0;flex:1;overflow:auto;scrollbar-width:thin;scrollbar-color:#bda16b transparent;padding:22px 28px 28px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-content:start;gap:26px 68px}
.${P}-dossier-desk[data-overview="true"] .${P}-dossier-workspace{grid-column:2;grid-row:1/3}
.${P}-dossier-desk[data-overview="true"] .${P}-dossier-content{display:block;padding-bottom:80px}
.${P}-dossier-desk:not([data-overview="true"]) .${P}-dossier-toolbar{grid-column:1/-1}
.${P}-dossier-desk:not([data-overview="true"]) .${P}-dossier-toolbar .${P}-notebook-close{position:static}
.${P}-dossier-desk:not([data-overview="true"]) .${P}-dossier-section-title{display:none}
.${P}-dossier-overview{display:grid;gap:0}
.${P}-dossier-overview>.${P}-dossier-sheet{padding:0 0 24px;margin:0 0 22px;border-bottom:1px solid #b59b78}
.${P}-dossier-overview>.${P}-dossier-sheet:last-child{border-bottom:0;margin-bottom:0}
.${P}-dossier-overview p,.${P}-dossier-overview ul{margin:0 0 10px}
.${P}-dossier-desk:not([data-overview="true"]) .${P}-dossier-identity{display:none}
.${P}-dossier-content>*{min-width:0}
.${P}-dossier-sheet{min-width:0;background:transparent;border:0;border-radius:0;padding:0;box-shadow:none}
.${P}-dossier-sheet h2,.${P}-dossier-content h2{display:flex;align-items:center;gap:8px;margin:0 0 12px;font:700 29px/1.2 Georgia,serif}
.${P}-dossier-root svg{width:21px;height:21px;flex:0 0 21px}
.${P}-dossier-root svg,.${P}-directory-root svg{color:inherit!important}
.${P}-dossier-overview>.${P}-dossier-sheet>h2>svg{display:none}
.${P}-dossier-tabs{position:absolute;z-index:6;right:calc(-1 * var(--tab-width));top:22px;bottom:22px;width:var(--tab-width)}
.${P}-dossier-tabs>div{display:flex;flex-direction:column;gap:12px;height:100%;overflow:auto;scrollbar-width:thin}
.${P}-dossier-tabs>div button{position:relative;background:linear-gradient(100deg,#e5ca8690,#fff0bd80),var(--desk-paper,url('/api/capability-packages/villages/assets/paper-ivory.webp')) center/768px;border:1px solid #d1b68b;border-left:0;border-radius:1px 3px 3px 0;box-shadow:2px 4px 5px #39291c40;padding:12px 6px;min-height:52px;flex-shrink:0;width:100%;font:400 clamp(13px,1.15vw,17px)/1.3 Georgia,serif;white-space:nowrap;overflow-wrap:normal;text-align:center}
.${P}-dossier-tabs>div button::after{content:"";position:absolute;right:0;top:0;border-top:8px solid #fff9e8;border-left:8px solid #c8ac6d80}
.${P}-dossier-tabs>div button[aria-pressed="true"]{background:linear-gradient(100deg,#99a972c0,#aeb886c0),var(--desk-paper,url('/api/capability-packages/villages/assets/paper-ivory.webp')) center/768px;color:#2c351c;border-color:#7a8958}
.${P}-dossier-toolbar .${P}-dossier-inspect{position:absolute;right:24px;bottom:18px;display:flex;align-items:center;gap:9px;min-height:44px;padding:5px 14px;border:1px solid #70573b;border-radius:7px;background:#fff4dd60;font-size:18px}
.${P}-dossier-desk:not([data-overview="true"]) .${P}-dossier-inspect{position:static;margin-left:auto}
.${P}-dossier-inspect[aria-pressed="true"]{outline:2px solid #789573;outline-offset:1px}
.${P}-dossier-warning { padding:10px; border:1px solid #a86345; background:#f7e3d4; color:#733d2c; }
.${P}-dossier-content > [role="alert"] { grid-column:1 / -1; }
.${P}-dossier-venues, .${P}-dossier-links { display:grid; gap:16px; }
.${P}-dossier-venues article { min-width:0; display:grid; grid-template-columns:120px minmax(0,1fr); align-items:start; gap:14px; border-bottom:1px solid var(--dossier-line); padding-bottom:16px; }
.${P}-dossier-venues article > div:last-child { min-width:0; }
.${P}-dossier-venues h3 { margin:0; font-size:24px; }
.${P}-dossier-venues .${P}-dossier-polaroid { display:block; width:120px; padding:7px; background:#fff9ed; transform:none; box-shadow:0 2px 5px #785a3530; }
.${P}-dossier-polaroid .${P}-pin-photo { display:block; width:100%; height:auto; aspect-ratio:4/3; overflow:hidden; background:#e5dbc9; }
.${P}-dossier-polaroid .${P}-pin-photo-empty { height:100%; }
.${P}-dossier-polaroid .${P}-pin-photo img { width:100%; height:100%; object-fit:contain; }
.${P}-dossier-polaroid .${P}-pin-name { display:none; }
.${P}-dossier-links button { text-align:left; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px; }
.${P}-dossier-links button small { grid-column:1; }
.${P}-dossier-links button > span { grid-column:2; grid-row:1 / 3; align-self:center; }
/* Section owners supply records. Semantic groups occupy either side of the binding. */
.${P}-dossier-root .${P}-overlay { background:transparent; color:var(--dossier-ink); border:0; padding:0; box-shadow:none; min-width:0; }
.${P}-dossier-content > [role="region"] > :is(.villages-relationships,.${P}-overlay), .${P}-dossier-content > [role="region"] > .${P}-dossier-sheet:has(.${P}-memory-library), .${P}-dossier-root .${P}-memory-library { display:contents; }
.${P}-dossier-content .villages-relationship-grid { display:contents; }
.${P}-dossier-root .villages-relationship-card, .${P}-dossier-root .villages-relationship-setup { background:transparent; color:var(--dossier-ink); border:0; border-radius:0; padding:0; }
.${P}-dossier-content .villages-relationship-card { grid-column:2; grid-row:1 / span 4; }
.${P}-dossier-root .villages-relationships :is(details,.villages-relationship-tie) { border-color:var(--dossier-line); }
.${P}-dossier-root .villages-relationships :is(input,select) { background:#fff7e7; color:var(--dossier-ink); border-color:#b7a787; }
.${P}-dossier-root .villages-relationship-meter meter { accent-color:#78957c; }
.${P}-dossier-root .${P}-memory-library { --memory-panel:transparent; --memory-ink:#30281f; color:var(--dossier-ink); }
.${P}-dossier-root :is(.${P}-memory-hero,.${P}-memory-card,.${P}-memory-evidence,.${P}-memory-empty) { background:transparent; color:var(--dossier-ink); border:0; border-radius:0; box-shadow:none; padding:0; }
.${P}-dossier-root .${P}-memory-library :is(p,small,dd,dt,h3,strong), .${P}-dossier-root :is(.${P}-story-scope,.${P}-story-meta,.${P}-empty,.${P}-hint) { color:inherit; }
.${P}-dossier-root .${P}-memory-hero { display:block; }
.${P}-dossier-content > .${P}-dossier-sheet:has(.villages-wish-journal), .${P}-dossier-content .villages-wish-journal { display:contents; }
.${P}-dossier-content .villages-wish-journal > style { display:none; }
.${P}-dossier-root .${P}-memory-toolbar { display:flex; flex-wrap:wrap; padding:0; }
.${P}-dossier-root .${P}-memory-toolbar select { min-width:0; max-width:100%; }
.${P}-dossier-root .${P}-memory-card-top { flex-wrap:wrap; }
.${P}-dossier-root .${P}-memory-evidence :is(small,blockquote) { overflow-wrap:anywhere; min-width:0; }
.${P}-dossier-root .${P}-memory-stats { flex-wrap:wrap; }
.${P}-dossier-root .${P}-memory-grid { grid-template-columns:minmax(0,1fr); gap:16px; }
.${P}-dossier-root .${P}-memory-card { border-bottom:1px solid var(--dossier-line); padding:12px 0; }
.${P}-dossier-root .${P}-memory-details > summary { background:transparent; border:0; box-shadow:none; padding:8px 0; }
.${P}-dossier-root .${P}-memory-section { min-width:0; }
.${P}-dossier-root .${P}-memory-text { font:400 18px/1.6 var(--notebook-hand); }
.${P}-dossier-root :is(.${P}-memory-card-top,.${P}-memory-section-head,.${P}-memory-pill) { font-size:14px; }
.${P}-dossier-root .${P}-memory-section-head h3 { font-size:23px; }
.${P}-dossier-root .${P}-memory-card-actions { flex-wrap:wrap; }
.${P}-dossier-root :is(.${P}-week,.${P}-wish-card,.${P}-agenda-day) { background:transparent; color:var(--dossier-ink); border-color:var(--dossier-line); }
.${P}-dossier-root .${P}-agenda-compare { display:block; }
.${P}-dossier-root .${P}-agenda-blocks li { grid-template-columns:1fr; background:#f4e6ce; border-color:var(--dossier-line); }
.${P}-dossier-root .${P}-week-toggle h3 { font-size:22px; }
.${P}-dossier-root .${P}-week-body { padding:12px 0; }
.${P}-dossier-root .${P}-agenda-list { display:contents; }
.${P}-dossier-content .${P}-week { grid-column:1 / -1; border:0; }
.${P}-dossier-root .${P}-week-body { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:16px 72px; }
.${P}-dossier-root .${P}-week-body > * { grid-column:1; }
.${P}-dossier-root .${P}-week-body > .${P}-agenda-days { grid-column:2; grid-row:1 / span 12; display:grid; gap:16px; align-content:start; }
.${P}-dossier-turn { pointer-events:none; position:absolute; z-index:4; left:50%; right:0; top:0; bottom:0; transform-origin:left center; border-radius:0 12px 12px 0; background:${paper}; box-shadow:-5px 0 18px #67432150; animation:${P}-page-turn 450ms ease-in-out both; backface-visibility:hidden; }
.${P}-dossier-turn[data-backwards="true"] { animation-name:${P}-page-back; }
@keyframes ${P}-page-turn { 0% { opacity:1; transform:rotateY(0); } 75% { opacity:.9; } 100% { opacity:0; transform:rotateY(-165deg); } }
@keyframes ${P}-page-back { 0% { opacity:1; transform:rotateY(-165deg); } 100% { opacity:0; transform:rotateY(0); } }
.${P}-people-session{height:100%;min-height:0}
.${P}-people-session[hidden]{display:none}

.${P}-directory-paper{grid-column:1/-1;grid-row:1/3;min-width:0;min-height:0;display:flex;flex-direction:column}
.${P}-directory-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6%;flex:none;margin-bottom:8px}
.${P}-directory-head h1,.${P}-directory-meta{margin:24px 32px 0;padding:0 0 14px;border-bottom:1px solid #8c7559;min-height:66px}
.${P}-directory-head h1{font-size:44px;line-height:1.1}
.${P}-directory-meta{display:flex;align-items:center;justify-content:flex-end;gap:12px;font-size:19px;white-space:nowrap}
.${P}-directory-root .${P}-directory-meta button{background:transparent;border:0;box-shadow:none;padding:5px;margin:0;font-size:14px}
.${P}-directory-reading{min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#bda16b transparent}
.${P}-directory-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6%}
.${P}-directory-page{min-width:0;display:flex;flex-direction:column;padding:0 32px 20px}
.${P}-directory-root .${P}-directory-card{position:relative;width:100%;display:grid;grid-template-columns:clamp(105px,12vw,156px) minmax(0,1fr) 14px;align-items:center;text-align:left;padding:18px 0;gap:24px;background:transparent;border:0;border-radius:0;box-shadow:none}
.${P}-directory-card::after{content:"";position:absolute;left:calc(clamp(105px,12vw,156px) + 24px);right:0;bottom:0;border-bottom:1px solid #bca481}
.${P}-directory-card:last-child::after{display:none}
.${P}-directory-card .${P}-avatar{width:100%;height:auto;aspect-ratio:1.08;max-width:none;border:0;border-radius:3px;background:#e6dccb;font-size:44px}
.${P}-directory-card .${P}-avatar img{width:100%;height:100%;object-fit:cover}
.${P}-directory-text{min-width:0}
.${P}-directory-card strong{display:block;font:700 clamp(24px,2.2vw,34px)/1.1 Georgia,serif;overflow-wrap:anywhere;margin-bottom:9px}
.${P}-directory-card small{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-size:clamp(17px,1.3vw,21px);line-height:1.25}
.${P}-directory-card>span:last-child{font-size:30px;font-weight:400}
.${P}-directory-root .${P}-picker-item{background:#f9f0df;color:var(--dossier-ink);min-width:0;flex-wrap:wrap}
@media(min-width:701px) and (max-width:1050px){
 .${P}-dossier-toolbar{margin:8px 16px 0;min-height:54px}
 .${P}-dossier-toolbar button,.${P}-dossier-toolbar summary{font-size:16px}
 .${P}-dossier-section-title{font-size:28px;margin:8px 16px 0;padding-right:54px;min-height:54px}
 .${P}-dossier-content{padding:18px 16px 24px;gap:20px 24px}
 .${P}-dossier-content h2{font-size:clamp(21px,2.6vw,27px)}
 .${P}-dossier-identity{padding:20px 16px}
 .${P}-directory-page{padding:0 16px 20px}
 .${P}-directory-root .${P}-directory-card{grid-template-columns:80px minmax(0,1fr) 10px;gap:12px}
 .${P}-directory-card::after{left:92px}
}
@media(max-width:700px){
 .${P}-dossier-root,.${P}-directory-root{padding:0 1px 7px;font-size:17px}
 .${P}-dossier-desk{padding:8cqh 9% 6cqh}
 .${P}-dossier-desk::before{background-image:var(--desk-art,url('/api/capability-packages/villages/assets/people-phone.webp'))}
 .${P}-dossier-book{--tab-width:0px;display:block;margin:0;overflow:auto;container-type:normal}
 .${P}-dossier-toolbar{position:sticky;top:0;display:flex;flex-wrap:wrap;gap:5px 12px;margin:0;padding:5px 12px;min-height:48px;background:${paper};border-bottom:1px solid #b59b78;z-index:8}
 .${P}-dossier-toolbar h1{font-size:22px;flex-basis:100%;order:3}
 .${P}-dossier-toolbar button,.${P}-dossier-toolbar summary{font-size:15px;padding:5px 0}
 .${P}-dossier-management>summary::before{font-size:20px;margin-right:4px}
 .${P}-dossier-management{position:static}
 .${P}-dossier-toolbar .${P}-notebook-close{position:static;color:#362a20;font-size:13px;margin-left:auto;padding:5px 0}
 .${P}-dossier-toolbar .${P}-dossier-inspect{position:static;order:4;margin-left:auto;padding:4px 8px;font-size:14px;min-height:38px}
 .${P}-dossier-controls{left:12px;right:12px;width:auto;max-height:min(55vh,calc(90cqh - 150px))}
 .${P}-dossier-identity{padding:18px 16px 8px;overflow:visible}
 .${P}-dossier-journal-content{display:grid;grid-template-columns:80px minmax(0,1fr);gap:12px 16px;align-items:center}
 .${P}-dossier-portrait{grid-column:1;grid-row:1;width:80px;height:92px;aspect-ratio:auto;padding:4px 4px 7px;margin:0}
 .${P}-dossier-journal h1{grid-column:2;grid-row:1;font-size:29px;text-align:left;line-height:1.1}
 .${P}-dossier-biography{grid-column:1/-1;grid-row:2;max-height:none;overflow:visible;text-align:left}
 .${P}-dossier-biography p{font-size:18px;line-height:1.4}
 .${P}-signature{margin-top:8px}
 .${P}-signature-name{font-size:28px}
 .${P}-signature-art{width:170px}
 .${P}-signature-controls{gap:4px;margin-top:2px}
 .${P}-dossier-root .${P}-signature-controls button{font-size:12px;padding:4px 6px}
 .${P}-dossier-workspace{display:flex;min-height:0}
 .${P}-dossier-section-title{display:none}
 .${P}-dossier-section-picker{display:flex;position:sticky;top:0;z-index:7;background:${paper};align-items:center;gap:12px;margin:12px 16px 4px;padding-bottom:8px;border-bottom:1px solid #cab89780;font-size:16px}
 .${P}-dossier-section-picker select{flex:1;min-width:0;font-size:17px}
 .${P}-dossier-tabs{display:none}
 .${P}-dossier-content,.${P}-dossier-desk[data-overview="true"] .${P}-dossier-content{display:block;overflow:visible;flex:none;padding:14px 16px 22px}
 .${P}-dossier-content h2{font-size:27px}
 .${P}-dossier-sheet{margin-bottom:22px}
 .${P}-dossier-venues article{grid-template-columns:minmax(0,1fr)}
 .${P}-dossier-root .${P}-agenda-days{grid-template-columns:minmax(0,1fr);gap:12px}
 .${P}-dossier-root .${P}-week-body{display:block}
 .${P}-dossier-content .villages-relationship-card{grid-column:auto;grid-row:auto}
 .${P}-dossier-turn{display:none}
 .${P}-directory-paper{display:flex;height:100%}
 .${P}-directory-head{display:flex;align-items:center;gap:10px;margin:0 16px 5px;padding:14px 0 12px;border-bottom:1px solid #8c7559}
 .${P}-directory-head h1,.${P}-directory-meta{min-height:0;margin:0;padding:0;border:0}
 .${P}-directory-head h1{font-size:32px;margin-right:auto}
 .${P}-directory-meta{gap:10px;font-size:15px}
 .${P}-directory-root .${P}-directory-meta button{font-size:13px}
 .${P}-directory-grid{grid-template-columns:minmax(0,1fr);gap:0}
 .${P}-directory-page{padding:0 16px}
 .${P}-directory-root .${P}-directory-card{grid-template-columns:80px minmax(0,1fr) 10px;gap:14px;padding:16px 0}
 .${P}-directory-card::after{left:94px}
 .${P}-directory-card .${P}-avatar{aspect-ratio:1}
 .${P}-directory-card strong{font-size:24px}
 .${P}-directory-card small{font-size:16px;line-height:1.3}
}
@media(prefers-reduced-motion:reduce){
 .${P}-dossier-turn{display:none!important}
 .${P}-dossier-root *,.${P}-directory-root *{transition:none!important;animation:none!important}
}
`;
