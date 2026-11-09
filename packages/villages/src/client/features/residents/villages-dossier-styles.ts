import handwriting from "./art/kalam.js";

const P = "marinara-capability-villages";
const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' opacity='.045' filter='url(%23n)'/%3E%3C/svg%3E")`;
const paper = `${grain},radial-gradient(ellipse at 25% 20%,#fffdf480,transparent 65%),linear-gradient(110deg,#f8edda,#fff6e7 65%,#f0e0bf)`;

/** Illustrated notebook styling stays local to Villagers, never Engine chrome. */
export const DOSSIER_STYLES = `
@font-face { font-family:Villages Notebook; src:url("${handwriting}") format("truetype"); font-weight:400; font-style:normal; font-display:swap; }
.${P}-dossier-root,.${P}-directory-root{--background:#f8efdd;--foreground:#362a20;--border:#c8b895;--muted-foreground:#6b5a49;--primary:#5e7047;--primary-foreground:#fff9ec;--secondary:#ede1ca;--popover:#fff6e5;--dossier-paper:#fcf2df;--dossier-ink:#362a20;--dossier-line:#c6b28c80;--notebook-hand:Georgia,"Times New Roman",serif;box-sizing:border-box;color:var(--dossier-ink);background:transparent;padding:2px 8px 8px;display:block;height:100%;min-height:0;overflow:visible;font:16px/1.5 system-ui,sans-serif;position:relative;isolation:isolate}
.${P}-dossier-root *,.${P}-directory-root *{box-sizing:border-box}
.${P}-dossier-root button,.${P}-directory-root button,.${P}-dossier-root summary{font:inherit;color:var(--dossier-ink);min-height:44px;border:1px solid #c8b895;border-radius:4px;background:#fff5e3;padding:8px 12px;cursor:pointer;white-space:normal;overflow-wrap:anywhere;box-shadow:none}
.${P}-dossier-root button:hover:not(:disabled),.${P}-directory-root button:hover:not(:disabled){filter:brightness(.97)}
.${P}-dossier-root button:disabled,.${P}-directory-root button:disabled{opacity:.55;cursor:default}
.${P}-dossier-root :is(button,input,textarea,select,summary,a,[tabindex]):focus-visible,.${P}-directory-root :is(button,input,select,summary,a):focus-visible{outline:3px solid #648096;outline-offset:3px}
.${P}-dossier-root :is(p,li,small),.${P}-directory-root p{line-height:1.5;overflow-wrap:anywhere}
.${P}-dossier-root :is(h1,h2,h3,h4),.${P}-directory-root :is(h1,h2,h3){color:var(--dossier-ink);font-family:Georgia,"Times New Roman",serif;font-weight:400;overflow-wrap:anywhere}
.${P}-dossier-root :is(input,select,textarea),.${P}-directory-root input{color:var(--dossier-ink);background:#fff7e7;border:1px solid #b7a787;border-radius:3px;padding:9px;min-height:44px;max-width:100%;font:inherit}
.${P}-dossier-desk{height:100%;min-height:0;display:flex;flex-direction:column;position:relative;max-width:1500px;margin:auto;background:${grain},linear-gradient(115deg,#e9c48a,#d9ad6e 58%,#e6c18b);padding:14px 18px 18px;border-radius:5px 18px 16px 12px;box-shadow:0 3px 0 #aa7e44,0 9px 16px #24160960}
.${P}-dossier-desk::before{content:"PEOPLE";position:absolute;left:0;top:-26px;height:31px;width:170px;padding:5px 24px;clip-path:polygon(5% 0,88% 0,100% 100%,0 100%);border-radius:12px 14px 0 0;background:linear-gradient(115deg,#e9c48a,#e1b87b);font:600 18px/1.3 Georgia,serif;letter-spacing:1.5px;color:#674728}
.${P}-dossier-toolbar{min-height:48px;position:relative;z-index:8;display:flex;align-items:center;gap:12px;flex-wrap:wrap;flex:none;padding:8px 14px;background:#f9efdc;border-bottom:1px solid #c6b28c80}

.${P}-dossier-toolbar h1{font-size:22px;line-height:1.2;margin:0;flex:1;min-width:0}
.${P}-dossier-toolbar button,.${P}-dossier-toolbar summary{background:transparent;border:0;box-shadow:none}
.${P}-dossier-back{margin:0}
.${P}-dossier-actions{margin-left:auto;display:flex;align-items:center;gap:10px}
.${P}-dossier-management{margin-left:auto;position:relative;z-index:8}
.${P}-dossier-management>summary{list-style:none}
.${P}-dossier-controls{position:absolute;right:0;top:100%;margin-top:6px;width:min(520px,78vw);max-height:65vh;overflow:auto;display:flex;flex-wrap:wrap;gap:10px;padding:14px;border:1px solid #bba27a;background:#fff3dd;border-radius:5px;box-shadow:0 4px 16px #30201940}
.${P}-description-editor{width:100%;min-width:0}
.${P}-description-editor label,.${P}-description-editor textarea{display:block;width:100%;box-sizing:border-box}
.${P}-description-editor textarea{resize:vertical;margin:6px 0}
.${P}-dossier-controls>.${P}-row{flex-wrap:wrap}
.${P}-dossier-controls details>button{display:block;margin-top:6px}
.${P}-dossier-refresh{width:100%;border-top:1px solid var(--dossier-line);padding-top:10px}
.${P}-notebook-close{margin-left:auto}
.${P}-dossier-book{--tab-width:114px;position:relative;flex:1;min-height:0;margin:0 var(--tab-width) 0 0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);border:0;border-radius:0;background:${paper};isolation:isolate;box-shadow:0 2px 5px #634c2838,4px 5px 0 #eee1c4,7px 8px 0 #f5e8cc;container-type:size}
.${P}-directory-root .${P}-dossier-book{margin-right:0}
.${P}-dossier-book::before{content:"";position:absolute;inset:0;z-index:-1;background:${paper};transform:rotate(-.45deg);box-shadow:1px 2px 4px #634c2840;pointer-events:none}
.${P}-dossier-book::after{content:"";position:absolute;z-index:1;left:50%;top:0;bottom:0;width:18px;transform:translateX(-50%);pointer-events:none;background:#dfb77c;box-shadow:2px 0 3px #785a3525,-2px 0 3px #785a3525}
.${P}-dossier-identity{grid-column:1;grid-row:1;min-width:0;min-height:0;padding:clamp(14px,3cqh,32px) clamp(18px,3vw,40px);overflow:auto;scrollbar-width:thin;scrollbar-color:#bda16b transparent}
.${P}-dossier-journal{width:100%}
.${P}-dossier-journal-content{display:flex;flex-direction:column;align-items:center;gap:14px}
.${P}-dossier-journal h1{font-size:clamp(27px,4.5cqh,44px);line-height:1.15;margin:0;text-align:center}
.${P}-dossier-portrait{width:min(78%,300px,35cqh);aspect-ratio:1;margin:0 auto 8px;padding:8px 8px 14px;background:#fff9eb;box-shadow:0 3px 7px #785a3545}
.${P}-dossier-portrait .${P}-avatar{width:100%;height:100%;min-width:0;max-width:none;max-height:none;border:0;border-radius:0;background:#e5d8c2;font-size:65px}
.${P}-dossier-portrait .${P}-avatar img{width:100%;height:100%;object-fit:cover}
.${P}-dossier-journal-content>button{background:#637548;color:#fff9ec;border-color:#7d8e5f;padding:8px 24px}
.${P}-dossier-biography{min-width:0;max-height:180px;overflow:auto;scrollbar-width:thin}
.${P}-dossier-biography p{margin:0;font-size:clamp(16px,2.2cqh,19px);line-height:1.5}
.${P}-signature{margin-top:16px;max-width:100%;color:#59434c}
.${P}-signature-art{max-width:100%;width:240px;padding:8px 0}
.${P}-signature-image{display:block;width:auto;height:auto;max-width:100%;max-height:180px;object-fit:contain;object-position:left center;mix-blend-mode:multiply}
.${P}-signature-name{display:block;font:400 34px/1.4 "Villages Notebook","Segoe Print",cursive;overflow-wrap:anywhere;padding:4px 0}
.${P}-signature-name[data-hand="bold"]{font-weight:700}
.${P}-dossier-root .${P}-signature-flourish{display:block;width:100%;height:20px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.${P}-signature-controls{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.${P}-dossier-root .${P}-signature-controls button{background:transparent;border:0;padding:4px 0;color:#756447;font-size:13px;text-decoration:underline;text-underline-offset:3px}
.${P}-dossier-root .${P}-signature-controls button,.${P}-signature>p{font-size:13px}
.${P}-dossier-workspace{min-width:0;min-height:0;grid-column:1/-1;grid-row:1;display:flex;flex-direction:column}
.${P}-dossier-section-picker{display:none}
.${P}-dossier-content{width:100%;min-width:0;min-height:0;flex:1;overflow:auto;scrollbar-width:thin;scrollbar-color:#bda16b transparent;padding:28px 36px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-content:start;gap:22px 64px}
.${P}-dossier-desk[data-overview="true"] .${P}-dossier-workspace{grid-column:2}
.${P}-dossier-desk[data-overview="true"] .${P}-dossier-content{display:block}
.${P}-dossier-overview{display:grid;gap:24px}
.${P}-dossier-overview h2{margin-bottom:12px}
.${P}-dossier-overview p,.${P}-dossier-overview ul{margin:0 0 10px}
.${P}-dossier-desk:not([data-overview="true"]) .${P}-dossier-identity{display:none}
.${P}-dossier-content>*{min-width:0}
.${P}-dossier-sheet{min-width:0;background:transparent;border:0;border-radius:0;padding:0;box-shadow:none}
.${P}-dossier-sheet h2,.${P}-dossier-content h2{display:flex;align-items:center;gap:8px;margin:0 0 16px;padding-bottom:10px;border-bottom:1px solid var(--dossier-line);font:400 26px/1.3 Georgia,serif}
.${P}-dossier-root svg{width:21px;height:21px;flex:0 0 21px}
.${P}-dossier-tabs{position:absolute;z-index:6;right:calc(-1 * var(--tab-width));top:16px;bottom:16px;width:var(--tab-width)}
.${P}-dossier-tabs>div{display:flex;flex-direction:column;gap:6px;height:100%;overflow:auto;scrollbar-width:thin}
.${P}-dossier-tabs>div button{background:linear-gradient(110deg,#f6e7c9,#f0d8ae);border:0;border-radius:0 7px 7px 0;box-shadow:2px 3px 4px #39291c30;padding:12px 8px;min-height:44px;flex-shrink:0;width:100%;font:400 15px/1.3 Georgia,serif;overflow-wrap:anywhere;text-align:center}
.${P}-dossier-tabs>div button[aria-pressed="true"]{background:linear-gradient(110deg,#aab88b,#91a370);color:#24351b}
.${P}-dossier-inspect{font-size:13px;display:flex;align-items:center;gap:4px;min-height:44px}
.${P}-dossier-actions>button[aria-pressed="true"]{outline:2px solid #789573;outline-offset:1px;background:#f3efd9}
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
.${P}-directory-paper{grid-column:1/-1;min-width:0;min-height:0;padding:24px 36px;display:flex;flex-direction:column}
.${P}-directory-head{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding-bottom:14px;border-bottom:1px solid #bfa983;margin-bottom:12px}
.${P}-directory-head h1{font-size:38px;margin:0 auto 0 0}
.${P}-directory-root .${P}-directory-head button{background:transparent;border:0;box-shadow:none;padding:6px;font-size:13px;margin:0}
.${P}-directory-head>span{font-size:14px;white-space:nowrap;color:#6b5a49}
.${P}-directory-reading{min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#bda16b transparent}
.${P}-directory-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px}
.${P}-directory-page{min-width:0;display:flex;flex-direction:column}
.${P}-directory-root .${P}-directory-card{width:100%;display:grid;grid-template-columns:clamp(64px,8vw,100px) minmax(0,1fr) 14px;align-items:center;text-align:left;padding:18px 0;gap:20px;background:transparent;border:0;border-bottom:1px solid #cab89780;border-radius:0;box-shadow:none}
.${P}-directory-card .${P}-avatar{width:100%;height:auto;aspect-ratio:1;max-width:none;border:0;border-radius:2px;background:#e6dccb;font-size:38px}
.${P}-directory-card .${P}-avatar img{width:100%;height:100%;object-fit:cover}
.${P}-directory-text{min-width:0}
.${P}-directory-card strong{display:block;font:400 clamp(21px,2.1vw,28px)/1.25 Georgia,serif;overflow-wrap:anywhere;margin-bottom:6px}
.${P}-directory-card small{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-size:16px;line-height:1.45}
.${P}-directory-root .${P}-picker-item{background:#f9f0df;color:var(--dossier-ink);min-width:0;flex-wrap:wrap}
@media(max-width:700px){
 .${P}-dossier-root,.${P}-directory-root{padding:0 1px 7px;font-size:16px}
 .${P}-dossier-desk{padding:8px 9px 12px;border-radius:5px 12px 12px 8px}
 .${P}-dossier-desk::before{top:-23px;height:28px;width:135px;padding:5px 18px;font-size:16px}
 .${P}-dossier-toolbar{padding:2px 7px;gap:4px;min-height:44px;flex-wrap:wrap}

 .${P}-dossier-toolbar h1{font-size:18px;flex-basis:100%;order:3}
 .${P}-dossier-toolbar button,.${P}-dossier-toolbar summary{font-size:13px;padding:6px}
 .${P}-dossier-actions{gap:4px}
 .${P}-dossier-controls{position:absolute;right:0;width:min(78vw,520px);max-height:55vh}
 .${P}-dossier-book{--tab-width:0px;display:block;margin:0;overflow:auto;container-type:normal}
 .${P}-dossier-book::after{display:none}
 .${P}-dossier-identity{padding:16px 14px 8px;overflow:visible}
 .${P}-dossier-journal-content{display:grid;grid-template-columns:84px minmax(0,1fr);gap:10px 14px;align-items:start}
 .${P}-dossier-portrait{grid-column:1;grid-row:1/3;width:84px;height:100px;aspect-ratio:auto;padding:4px 4px 8px;margin:0}
 .${P}-dossier-journal h1{grid-column:2;font-size:27px;text-align:left;line-height:1.1}
 .${P}-dossier-biography{grid-column:1/-1;grid-row:3;max-height:none;overflow:visible}
 .${P}-dossier-biography p{font-size:16px}
 .${P}-dossier-journal-content>button{grid-column:2;grid-row:2;justify-self:start;align-self:start;margin-top:0;padding:8px 24px}
 .${P}-signature{margin-top:8px}
 .${P}-signature-name{font-size:25px}
 .${P}-signature-art{width:150px}
 .${P}-signature-controls{gap:4px;margin-top:2px}
 .${P}-dossier-root .${P}-signature-controls button{font-size:12px;padding:4px 6px}
 .${P}-dossier-workspace{display:flex;min-height:0}
 .${P}-dossier-section-picker{display:flex;position:sticky;top:0;z-index:7;background:#fcf2df;align-items:center;gap:12px;margin:12px 14px 4px;padding-bottom:8px;border-bottom:1px solid #cab89780;font-size:15px}
 .${P}-dossier-section-picker select{flex:1;min-width:0;font-size:16px}
 .${P}-dossier-tabs{display:none}
 .${P}-dossier-tabs>div{display:none}

 .${P}-dossier-content,.${P}-dossier-desk[data-overview="true"] .${P}-dossier-content{display:block;overflow:visible;flex:none;padding:12px 14px 22px}
 .${P}-dossier-content h2{font-size:25px}
 .${P}-dossier-sheet{margin-bottom:22px}
 .${P}-dossier-venues article{grid-template-columns:minmax(0,1fr)}
 .${P}-dossier-root .${P}-agenda-days{grid-template-columns:minmax(0,1fr);gap:12px}
 .${P}-dossier-root .${P}-week-body{display:block}
 .${P}-dossier-content .villages-relationship-card{grid-column:auto;grid-row:auto}
 .${P}-dossier-turn{display:none}
 .${P}-directory-paper{padding:18px 14px;display:flex;height:100%}
 .${P}-directory-head{gap:8px;margin-bottom:2px}
 .${P}-directory-head h1{font-size:29px}
 .${P}-directory-head>span{font-size:13px}
 .${P}-directory-grid{grid-template-columns:minmax(0,1fr);gap:0}
 .${P}-directory-root .${P}-directory-card{grid-template-columns:60px minmax(0,1fr) 10px;gap:12px;padding:16px 0}
 .${P}-directory-card strong{font-size:21px}
 .${P}-directory-card small{font-size:15px}
}
@media(prefers-reduced-motion:reduce){
 .${P}-dossier-turn{display:none!important}
 .${P}-dossier-root *,.${P}-directory-root *{transition:none!important;animation:none!important}
}
`;
