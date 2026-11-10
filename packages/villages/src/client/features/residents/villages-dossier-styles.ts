import handwriting from "./art/kalam.js";

const P = "marinara-capability-villages";

export const DOSSIER_STYLES = `
@font-face{font-family:Villages Notebook;src:url("${handwriting}") format("truetype");font-weight:400;font-style:normal;font-display:swap}
.${P}-people-session{height:100%;min-height:0}.${P}-people-session[hidden]{display:none}
.${P}-desk-container .${P}-desk-workspace[data-desk="people"]:not([data-desk="none"]){--menu-font:"village-letter-lora",Georgia,serif}
.${P}-people-layout{height:100%;min-height:0;min-width:0;width:100%;margin:0;display:grid;grid-template-columns:clamp(280px,27%,420px) minmax(0,1fr);gap:36px}
.${P}-people-index{height:100%;min-height:0;min-width:0}
.${P}-dossier-root,.${P}-directory-root{--dossier-ink:#f0dfbc;--dossier-line:#a39b8460;--notebook-hand:var(--menu-font,Georgia,serif);color:var(--dossier-ink);background:transparent;box-sizing:border-box;height:100%;min-height:0;min-width:0;overflow:visible;position:relative;font:400 20px/1.6 var(--notebook-hand);padding:0;container-type:size}
.${P}-dossier-root{display:grid;grid-template-columns:minmax(0,1fr) clamp(200px,38%,520px);gap:24px}
.${P}-dossier-root>.${P}-dossier-desk{height:100%;grid-column:1;grid-row:1;position:static}
.${P}-dossier-character{grid-column:2;grid-row:1;min-width:0;min-height:0;height:100%;padding-top:18px;display:flex;align-items:start;justify-content:center;pointer-events:none}
.${P}-dossier-root .${P}-dossier-character>.${P}-dossier-sprite{width:100%;height:100%;overflow:hidden}
.${P}-dossier-root *,.${P}-directory-root *{box-sizing:border-box}
.${P}-dossier-root button,.${P}-directory-root button,.${P}-dossier-root summary{font:inherit;min-height:44px;max-width:100%;color:#f0dfbc;border:1px solid #a39b84;border-radius:4px;background:#514157;padding:8px 12px;cursor:pointer;white-space:normal;overflow-wrap:anywhere;box-shadow:none}
.${P}-dossier-root button:disabled,.${P}-directory-root button:disabled{opacity:.55;cursor:default}
.${P}-dossier-root :is(button,input,textarea,select,summary,a,[tabindex]):focus-visible,.${P}-directory-root :is(button,input,select,summary,a):focus-visible{outline:3px solid #dca5ab;outline-offset:3px}
.${P}-dossier-root :is(p,li,small),.${P}-directory-root p{line-height:1.5;overflow-wrap:anywhere}
.${P}-dossier-root :is(h1,h2,h3,h4),.${P}-directory-root :is(h1,h2,h3){color:inherit;font-family:var(--notebook-hand);overflow-wrap:anywhere}
.${P}-dossier-root :is(input,select,textarea),.${P}-directory-root input{color:#f0dfbc;background:#54415a70;border:1px solid #a39b84;border-radius:4px;padding:9px;min-height:44px;max-width:100%;font:inherit}
.${P}-dossier-desk{height:100%;min-height:0;min-width:0;display:flex;flex-direction:column;position:relative;background:transparent;padding:0}
.${P}-dossier-book{flex:1;height:auto;min-height:0;min-width:0;display:flex;flex-direction:column;position:static;overflow:auto;scrollbar-width:thin;padding-right:6px}
.${P}-dossier-controls{display:flex;flex-wrap:wrap;align-items:start;gap:10px}
.${P}-dossier-signature-tools{width:100%}
.${P}-description-editor{width:100%;min-width:0}.${P}-description-editor label,.${P}-description-editor textarea{display:block;width:100%}
.${P}-description-editor textarea{resize:vertical;margin:6px 0}
.${P}-dossier-refresh{width:100%;border-top:1px solid var(--dossier-line);padding-top:10px}
.${P}-dossier-identity{flex:none;min-width:0;padding:72px 0 24px}
.${P}-dossier-journal{display:flex;align-items:start;gap:20px;min-width:0}
.${P}-dossier-journal-content{flex:1;min-width:0;display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-content:start}
.${P}-dossier-portrait{width:100%;max-width:240px;aspect-ratio:1;margin:0;overflow:hidden;background:#969b7e70;border-radius:7px}
.${P}-dossier-portrait .${P}-avatar{width:100%;height:100%;max-width:none;max-height:none;border:0;border-radius:0;font-size:48px;background:transparent}
.${P}-dossier-portrait .${P}-avatar img{width:100%;height:100%;object-fit:cover}
.${P}-dossier-journal h1{min-width:0;font:600 clamp(44px,3.2vw,76px)/1.12 var(--notebook-hand);letter-spacing:-.025em;margin:0}
.${P}-dossier-biography{min-width:0}
.${P}-dossier-biography p{margin:4px 0 0;font-size:24px;line-height:1.55;font-style:italic;font-weight:400}
.${P}-signature{flex:none;max-width:280px;margin:22px 0 32px;color:#f0dfbc}
.${P}-signature-art{max-width:100%;width:220px;padding:6px;background:#b6ac9a;border-radius:4px}
.${P}-signature-image{display:block;width:auto;height:auto;max-width:100%;max-height:78px;object-fit:contain;object-position:left center;mix-blend-mode:multiply}
.${P}-dossier-root .${P}-signature-art{padding:0;background:transparent;border-radius:0;width:260px}
.${P}-dossier-root .${P}-signature-image{max-height:115px;mix-blend-mode:normal}
.${P}-signature-name{display:block;font:400 28px/1.4 "Villages Notebook","Segoe Print",cursive;overflow-wrap:anywhere;padding:4px 0}
.${P}-signature-name[data-hand="bold"]{font-weight:700}
.${P}-signature-flourish{display:block;width:100%;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.${P}-signature-controls{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.${P}-dossier-root .${P}-signature-controls button{background:transparent;border:0;padding:3px 0;color:#d0c1b3;font-size:12px;text-decoration:underline;text-underline-offset:3px}
.${P}-signature>p{font-size:13px}
.${P}-dossier-workspace{display:flex;flex-direction:column;min-width:0;min-height:220px;flex:1}
.${P}-dossier-section-picker{display:none}
.${P}-dossier-tabs{position:relative;display:flex;align-items:end;gap:8px;flex:none;margin:0 0 16px;border-bottom:1px solid var(--dossier-line)}
.${P}-dossier-tabs>div{display:flex;flex-wrap:wrap;gap:6px 16px}
.${P}-dossier-tabs button{background:transparent;color:inherit;border:0;border-bottom:3px solid transparent;border-radius:0;font:400 20px/1.35 var(--notebook-hand);padding:8px 4px;min-height:44px}
.${P}-dossier-tabs button[aria-pressed="true"]{border-bottom-color:#d29399;color:#fff0d5;background:transparent}
.${P}-dossier-tabs .${P}-dossier-tools-toggle{display:grid;place-items:center;flex:none;width:44px;margin-left:auto}
.${P}-dossier-root .${P}-dossier-inspect{display:flex;gap:10px;align-items:center}
.${P}-dossier-controls .${P}-signature-controls button{font-size:16px}
.${P}-dossier-root .${P}-dossier-inspect svg{width:26px;height:26px}
.${P}-dossier-inspect[aria-pressed="true"]{color:#f5c4c7}
.${P}-dossier-content{min-width:0;min-height:0;flex:1;overflow:visible;padding:0 5px 16px 0;display:block}
.${P}-dossier-content>*{min-width:0}
.${P}-dossier-sheet{min-width:0;background:transparent;border:0;border-radius:0;padding:0;box-shadow:none;margin-bottom:22px}
.${P}-dossier-sheet h2,.${P}-dossier-content h2{display:flex;align-items:center;gap:8px;margin:0 0 10px;font:600 30px/1.25 var(--notebook-hand)}
.${P}-dossier-root svg{width:20px;height:20px;flex:none;color:inherit!important}
.${P}-dossier-overview>.${P}-dossier-sheet{padding:0 0 20px;margin:0 0 20px;border-bottom:1px solid var(--dossier-line)}
.${P}-dossier-overview>.${P}-dossier-sheet:last-child{border-bottom:0}
.${P}-dossier-overview>.${P}-dossier-sheet>h2>svg{display:none}
.${P}-dossier-overview p,.${P}-dossier-overview ul{margin:0 0 8px}
.${P}-dossier-warning{padding:10px;border:1px solid #c88b8e;background:#593947;color:#ffe0d6}
.${P}-dossier-venues,.${P}-dossier-links{display:grid;gap:16px}
.${P}-dossier-venues article{min-width:0;display:grid;grid-template-columns:110px minmax(0,1fr);gap:16px;align-items:start;border-bottom:1px solid var(--dossier-line);padding-bottom:16px}
.${P}-dossier-venues article>div:last-child{min-width:0}.${P}-dossier-venues h3{font-size:24px;margin:0}
.${P}-dossier-venues .${P}-dossier-polaroid{display:block;width:110px;padding:0;background:transparent;transform:none;box-shadow:none}
.${P}-dossier-polaroid .${P}-pin-photo{display:block;width:100%;height:auto;aspect-ratio:4/3;overflow:hidden;background:#514157}
.${P}-dossier-polaroid .${P}-pin-photo-empty{height:100%}.${P}-dossier-polaroid .${P}-pin-photo img{width:100%;height:100%;object-fit:contain}
.${P}-dossier-polaroid .${P}-pin-name{display:none}
.${P}-dossier-links button{text-align:left;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px}.${P}-dossier-links button small{grid-column:1}.${P}-dossier-links button>span{grid-column:2;grid-row:1/3;align-self:center}
.${P}-dossier-root .${P}-overlay,.${P}-dossier-root .villages-relationship-card,.${P}-dossier-root .villages-relationship-setup{background:transparent;color:inherit;border:0;border-radius:0;padding:0;box-shadow:none;min-width:0}
.${P}-dossier-root .villages-relationship-grid{display:grid;grid-template-columns:1fr;gap:18px}
.${P}-dossier-root .villages-relationships :is(details,.villages-relationship-tie){border-color:var(--dossier-line)}
.${P}-dossier-root .villages-relationships :is(input,select){background:#514157;color:#f0dfbc;border-color:#a39b84}
.${P}-dossier-root .${P}-memory-library{--memory-panel:transparent;--memory-ink:#f0dfbc;color:inherit;min-width:0}
.${P}-dossier-root :is(.${P}-memory-hero,.${P}-memory-card,.${P}-memory-evidence,.${P}-memory-empty){background:transparent;color:inherit;border-color:var(--dossier-line);border-radius:0;box-shadow:none;padding:0}
.${P}-dossier-root .${P}-memory-library :is(p,small,dd,dt,h3,strong),.${P}-dossier-root :is(.${P}-story-scope,.${P}-story-meta,.${P}-empty,.${P}-hint){color:inherit}
.${P}-dossier-root .${P}-memory-hero{display:block}
.${P}-dossier-root .${P}-memory-toolbar{display:flex;flex-wrap:wrap;padding:0}
.${P}-dossier-root .${P}-memory-toolbar select{min-width:0;max-width:100%}
.${P}-dossier-root .${P}-memory-card-top,.${P}-dossier-root .${P}-memory-stats,.${P}-dossier-root .${P}-memory-card-actions{flex-wrap:wrap}
.${P}-dossier-root .${P}-memory-evidence :is(small,blockquote){overflow-wrap:anywhere;min-width:0}
.${P}-dossier-root .${P}-memory-grid{grid-template-columns:1fr;gap:16px}
.${P}-dossier-root .${P}-memory-card{border:0;border-bottom:1px solid var(--dossier-line);padding:12px 0}
.${P}-dossier-root .${P}-memory-details>summary{background:transparent;border:0;box-shadow:none;padding:8px 0}
.${P}-dossier-root .${P}-memory-section{min-width:0}
.${P}-dossier-root .${P}-memory-text{font:400 18px/1.6 var(--notebook-hand)}
.${P}-dossier-root :is(.${P}-memory-card-top,.${P}-memory-section-head,.${P}-memory-pill){font-size:14px}
.${P}-dossier-root .${P}-memory-section-head h3{font-size:23px}
.${P}-directory-paper{height:100%;min-height:0;min-width:0;display:flex;flex-direction:column}
.${P}-directory-root .${P}-dossier-book{overflow:hidden}
.${P}-directory-head{display:flex;align-items:center;gap:20px;flex:none;margin:0 0 26px}
.${P}-directory-head h1{display:flex;align-items:center;gap:12px;font:600 clamp(50px,3.2vw,76px)/1.1 var(--notebook-hand);letter-spacing:-.025em;margin:0;flex:1;min-width:0}
.${P}-directory-flourish{width:64px;height:40px;flex:none;fill:#969b7e}
.${P}-directory-search{position:relative;display:block;flex:none;width:100%;max-width:620px;margin:0 0 28px}
.${P}-directory-search svg{position:absolute;left:18px;top:50%;transform:translateY(-50%);width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;pointer-events:none}
.${P}-directory-root .${P}-directory-search input{width:100%;min-height:56px;padding:10px 16px 10px 56px;border:1px solid #b47f92aa;border-radius:13px;background:#74536755;font:400 22px/1.4 var(--notebook-hand)}
.${P}-directory-root .${P}-directory-search input[type="search"]:focus-visible{outline-offset:-3px}
.${P}-directory-reading{min-height:0;overflow:hidden;flex:1;container-type:size}
.${P}-directory-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:16px;height:100%;max-height:calc(100cqw + 98px);padding:3px}
.${P}-directory-root .${P}-directory-card{--name-height:50px;--name-gap:4px;position:relative;display:grid;grid-template-rows:minmax(0,1fr) var(--name-height);align-items:center;gap:var(--name-gap);min-width:0;min-height:0;width:100%;padding:10px 10px 5px;border:1px solid #a39b8470;border-radius:12px;background:#969b7eb0;box-shadow:none;text-align:left;color:#f0dfbc;container-type:size}
.${P}-directory-root .${P}-directory-card[aria-pressed="true"]{background:#b97980bf;border-color:#e5a49e}
.${P}-directory-card .${P}-avatar{--portrait-size:min(100cqw,calc(100cqh - var(--name-height) - var(--name-gap)));width:var(--portrait-size);height:var(--portrait-size);justify-self:center;max-width:none;border:0;border-radius:5px;background:#514157;font-size:44px;overflow:hidden}
.${P}-directory-card .${P}-avatar img{width:100%;height:100%;object-fit:cover}
.${P}-directory-text{min-width:0;text-align:center}.${P}-directory-card strong{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:400 20px/1.25 var(--notebook-hand);overflow-wrap:anywhere}
.${P}-directory-card small{display:block;font-size:12px}
.${P}-directory-text:has(small) strong{-webkit-line-clamp:1}
.${P}-directory-pagination{display:flex;align-items:center;justify-content:center;gap:16px;flex:none;margin-top:12px;font-size:17px}
.${P}-directory-root .${P}-directory-pagination button{min-width:44px;min-height:44px;padding:4px 10px;background:transparent;border-color:var(--dossier-line)}

@container village-desk (min-width:701px) and (max-width:1100px){
 .${P}-people-layout{grid-template-columns:220px minmax(0,1fr);gap:24px}
 .${P}-directory-head h1{font-size:44px}
 .${P}-dossier-journal h1{font-size:40px}
 .${P}-directory-head{flex-wrap:wrap;gap:8px}
 .${P}-directory-root .${P}-directory-card{padding:8px 8px 5px}
 .${P}-directory-card strong{font-size:18px}
 .${P}-dossier-root{grid-template-columns:minmax(0,1fr) 120px;gap:12px}
 .${P}-dossier-journal{flex-wrap:wrap;gap:10px}
}
@container village-desk (max-width:700px){
 .${P}-people-layout{display:block}
 .${P}-people-layout[data-profile="true"]{display:block}.${P}-people-layout[data-profile="true"] .${P}-people-index{display:none}
 .${P}-dossier-root,.${P}-directory-root{font-size:17px}
 .${P}-dossier-root{display:block;overflow:auto;container-type:inline-size}
 .${P}-dossier-root>.${P}-dossier-desk{height:auto;min-height:100%}
 .${P}-dossier-book{overflow:visible;container-type:normal}
 .${P}-dossier-character{position:absolute;right:0;top:0;width:150px;height:230px;padding:0}
 .${P}-dossier-identity{padding-top:0}
 .${P}-dossier-journal{flex-wrap:wrap;gap:12px}
 .${P}-dossier-journal-content{display:block;flex-basis:100%}
 .${P}-dossier-journal h1{font-size:32px;min-height:235px;padding:32px 164px 0 0}
 .${P}-dossier-biography p{font-size:18px}
 .${P}-signature{max-width:240px}
 .${P}-dossier-workspace{min-height:0;flex:none}
 .${P}-dossier-section-picker{display:flex;flex:1;min-width:0}
 .${P}-dossier-section-picker select{flex:1;min-width:0}
 .${P}-dossier-tabs{position:sticky;top:0;z-index:7;background:#302d47f5;padding:8px 0;margin:0 0 8px}
 .${P}-dossier-tabs>div{display:none}
 .${P}-dossier-content{overflow:visible;flex:none;padding:8px 0 18px}
 .${P}-dossier-content h2{font-size:27px}
 .${P}-dossier-venues article{grid-template-columns:1fr}
 .${P}-dossier-root .${P}-agenda-days{grid-template-columns:1fr;gap:12px}
 .${P}-directory-head{margin-bottom:20px;gap:12px}.${P}-directory-head h1{font-size:40px}
 .${P}-directory-search{margin-bottom:22px}
 .${P}-directory-root .${P}-directory-search input{font-size:18px;min-height:50px;padding-left:46px}
 .${P}-directory-search svg{left:14px;width:22px;height:22px}
 .${P}-directory-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 .${P}-directory-root .${P}-directory-card{padding:8px 8px 5px}
 .${P}-directory-card strong{font-size:19px}
}
@media(max-height:700px){
 .${P}-directory-head{margin-bottom:10px}.${P}-directory-head h1{font-size:32px}
 .${P}-directory-search{margin-bottom:12px}.${P}-directory-root .${P}-directory-search input{min-height:44px;padding-block:6px;font-size:18px}
 .${P}-dossier-journal h1{font-size:32px}
 .${P}-dossier-biography p{font-size:16px}
 .${P}-dossier-identity{padding-top:44px;padding-bottom:8px}
 .${P}-dossier-tabs{margin-bottom:6px}
 .${P}-dossier-tabs>div{gap:4px 8px}
 .${P}-dossier-tabs>div button{font-size:17px;padding-inline:2px}
}
@media(prefers-reduced-motion:reduce){.${P}-dossier-root *,.${P}-directory-root *{transition:none!important;animation:none!important}}
`;
