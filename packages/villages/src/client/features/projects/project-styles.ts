import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { openingProjectsStyles } from "./OpeningProjects.js";
export const projectStyles =
  openingProjectsStyles +
  `
.${P}-root.${P}-project-root{display:block;padding:0;overflow:auto;gap:0}
${P} .${P}-project-desk{--bp-ink:#d9edf2;--bp-muted:#adcfdd;--bp-line:#75a9bf;--bp-panel:#0c4c74;--primary:#d9edf2;position:relative;isolation:isolate;overflow:clip;min-height:100%;padding:clamp(.6rem,2vh,1.2rem);color:var(--bp-ink);background:repeating-linear-gradient(2deg,transparent 0 17px,#644b3338 18px 20px),#805d3f;font-family:Georgia,"Times New Roman",serif;box-sizing:border-box}
.${P}-project-desk::before,.${P}-project-desk::after{content:"";position:absolute;z-index:-1;pointer-events:none;width:24%;height:32%;background:#e7d9b7}
.${P}-project-desk::before{left:0;top:1rem;transform:rotate(-9deg)}
.${P}-project-desk::after{right:0;bottom:1rem;transform:rotate(8deg)}
${P} .${P}-project-board{position:relative;box-sizing:border-box;max-width:90rem;min-height:calc(100vh - 2.4rem);margin:auto;padding:clamp(.65rem,2vh,1.2rem);border:3px solid #d9edf2;outline:5px solid #10384c;box-shadow:0 3px 10px #24180d50;background-color:#084773;background-image:linear-gradient(#8dc6dc0c 1px,transparent 1px),linear-gradient(90deg,#8dc6dc0c 1px,transparent 1px);background-size:26px 26px;color:var(--bp-ink);font-size:1rem;line-height:1.35}
.${P}-project-board *{box-sizing:border-box}
.${P}-project-board h1,.${P}-project-board h2,.${P}-project-board h3,.${P}-project-board p,.${P}-project-board figure{margin:0}
.${P}-project-board h1{font-size:clamp(1.65rem,3.3vw,2.8rem);line-height:1.15;font-weight:600}
.${P}-project-board h2{font-size:1.65rem;line-height:1.25}
.${P}-project-board h3{font-size:1.2rem;font-weight:600;margin-bottom:1rem}
.${P}-project-board p{margin:.6rem 0;white-space:pre-wrap;overflow-wrap:anywhere}
.${P}-project-board .vp-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--bp-ink);padding-bottom:.45rem;margin-bottom:.55rem}
.${P}-project-board .vp-eyebrow,.${P}-project-board .vp-label{display:block;text-transform:uppercase;color:var(--bp-muted);font-size:.75rem;font-weight:600;letter-spacing:.035em;margin-bottom:.35rem}
.${P}-project-board .vp-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.65rem}
.${P}-project-board button,.${P}-project-board .${P}-artwork-upload{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:44px;min-width:0;max-width:100%;padding:.55rem 1rem;margin:0;border:1px solid var(--bp-line);border-radius:0;background:#155f88;color:var(--bp-ink);font:600 1rem/1.3 Georgia,"Times New Roman",serif;box-shadow:none;cursor:pointer;text-align:center;text-decoration:none;overflow-wrap:anywhere}
.${P}-project-board button:hover:not(:disabled),.${P}-project-board .${P}-artwork-upload:hover{background:#216e97}
.${P}-project-board button[aria-pressed=true],.${P}-project-board button[aria-selected=true],.${P}-project-board .vp-primary{background:#d1e9ef;color:#064773;border-color:#d1e9ef}
.${P}-project-board button:disabled{opacity:.48;cursor:default}
.${P}-project-board button:focus-visible,.${P}-project-board input:focus-visible,.${P}-project-board textarea:focus-visible,.${P}-project-board select:focus-visible,.${P}-project-board .${P}-artwork-upload:focus-within{outline:2px solid #f4f3d3;outline-offset:3px}
.${P}-project-board .vp-subtle{background:transparent}
.${P}-project-board .vp-project-heading,.${P}-project-board .vp-panel-heading{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem}
.${P}-project-board .vp-project-heading{margin:.55rem 0}
.${P}-project-board .vp-project-heading h2{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.${P}-project-board .vp-project-heading>span{color:var(--bp-muted);text-transform:uppercase;text-align:right;font-size:.85rem}
.${P}-project-board .vp-panel-heading h3{margin:0}
.${P}-project-board .vp-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.3rem;margin:.5rem 0}
.${P}-project-board .vp-tabs button{padding:.65rem .3rem}
.${P}-project-board .vp-detail-pages{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.65rem}
.${P}-project-board .vp-detail-pages button{min-height:40px;padding:.4rem .7rem;font-size:.9rem}
.${P}-project-board .vp-zone-pages{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.5rem}
.${P}-project-board .vp-zone-pages button{min-height:40px;padding:.3rem .55rem}
.${P}-project-board .vp-columns{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:1rem;align-items:stretch}
.${P}-project-board .vp-columns:has(> :only-child){grid-template-columns:minmax(0,1fr)}
.${P}-project-board .vp-zone-columns{grid-template-columns:minmax(0,.85fr) minmax(0,1.25fr)}
.${P}-project-board .vp-panel{min-width:0;border:1px solid var(--bp-line);background:var(--bp-panel);padding:clamp(.65rem,1.5vh,1rem)}
.${P}-project-board .vp-drawing{display:flex;flex-direction:column;justify-content:center;min-width:0;min-height:0;padding:1rem;border:1px solid var(--bp-line);background:#09436b}
.${P}-project-board .vp-drawing>img{width:100%;max-height:24vh;object-fit:contain}
.${P}-project-board .vp-drawing figcaption{margin-top:1rem;font-size:1rem}
.${P}-project-board label{display:block;color:var(--bp-muted);font-size:.8rem;text-transform:uppercase;font-weight:600;letter-spacing:.02em;margin:0 0 1rem}
.${P}-project-board input,.${P}-project-board textarea,.${P}-project-board select{display:block;width:100%;min-height:44px;border:0;border-bottom:1px solid var(--bp-line);border-radius:0;padding:.5rem .1rem;margin:.2rem 0 0;background:transparent;color:var(--bp-ink);font:400 1.05rem/1.4 Georgia,"Times New Roman",serif;box-shadow:none}
.${P}-project-board textarea{resize:vertical;min-height:5rem}
.${P}-project-board select option{background:#0c4c74;color:var(--bp-ink)}
.${P}-project-board input:disabled,.${P}-project-board textarea:disabled{opacity:.85}
.${P}-project-board fieldset{padding:0;border:0;margin:0;min-width:0}
.${P}-project-board .vp-choices{display:flex;flex-wrap:wrap;gap:.4rem;margin:.3rem 0 1rem}
.${P}-project-board .vp-choices button{font-size:.9rem;padding:.5rem .7rem}
.${P}-project-board .vp-capacity{max-width:10rem}
.${P}-project-board .${P}-artwork-upload{position:relative;font-size:.85rem;text-transform:none;letter-spacing:0;overflow:hidden}
.${P}-project-board .${P}-artwork-upload input{position:absolute;inset:0;opacity:0;cursor:pointer}
.${P}-project-board .${P}-artwork-upload:has(input:disabled){opacity:.48}
.${P}-project-board .vp-note{font-size:.85rem;color:var(--bp-muted)}
.${P}-project-board .vp-footer{display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;border-top:1px solid var(--bp-line);padding-top:.45rem;margin-top:.5rem}
.${P}-project-board .vp-footer p{margin:0;flex:1 1 12rem;font-size:.85rem;color:var(--bp-muted)}
.${P}-project-board .vp-project-list{display:grid;gap:.7rem}
.${P}-project-root:has(.vp-workspace){overflow:hidden}
.${P}-project-root:has(.vp-workspace) .${P}-project-desk{height:100%;min-height:0;padding:clamp(.6rem,4vh,2.5rem)}
.${P}-project-root:has(.vp-workspace) .${P}-project-board{box-sizing:border-box;height:100%;min-height:0;display:flex;flex-direction:column;padding:clamp(.65rem,2vh,1.5rem)}
.${P}-project-board .vp-index-tools{display:flex;justify-content:space-between;align-items:center;min-height:2.8rem;gap:.5rem}
.${P}-project-board .vp-index-tools .vp-note{margin-left:auto}
.${P}-project-board .vp-workspace{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.7rem;flex:1;min-height:0}
.${P}-project-board .vp-drafts,.${P}-project-board .vp-active-slot{min-width:0;min-height:0;border:1px solid var(--bp-line);background:#0c4c74;padding:clamp(.6rem,1.4vw,1.2rem)}
.${P}-project-board .vp-drafts{display:flex;flex-direction:column;gap:.6rem}
.${P}-project-board .vp-drafts h2{font-size:clamp(1.15rem,2vw,1.6rem);border-bottom:1px solid var(--bp-line);padding-bottom:.45rem}
.${P}-project-board .vp-drafts .vp-project-list{gap:.25rem}
.${P}-project-board .vp-drafts .vp-project-row{min-height:44px;padding:.35rem .65rem}
.${P}-project-board .vp-drafts .vp-project-row span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.${P}-project-board .vp-draft-create[data-full=false]{display:none}
.${P}-project-board .vp-active-slot{display:flex}
.${P}-project-board .vp-empty-slot{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:1rem;width:100%;color:var(--bp-muted)}
.${P}-project-board .vp-new-types{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;width:100%}
.${P}-project-board .vp-new-types button{min-height:6rem}
.${P}-project-board .vp-active-project{display:flex;width:100%;height:100%;flex-direction:column;align-items:stretch;justify-content:start;text-align:left;gap:.65rem;background:transparent}
.${P}-project-board .vp-active-project strong{font-size:1.4rem;border-bottom:1px solid var(--bp-line);padding-bottom:.4rem}
.${P}-project-board .vp-active-project img{width:100%;min-height:0;max-height:48%;object-fit:cover}
.${P}-project-board .vp-active-project>span{font-size:1.25rem}
.${P}-project-board .vp-active-project small{color:var(--bp-muted)}
.${P}-project-board .vp-mobile-sections{display:none}
.${P}-project-board .vp-project-row,.${P}-project-board .vp-zone-list button,.${P}-project-board .vp-person{width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:1rem;align-items:center;text-align:left;padding:1rem;background:#0c4c74}
.${P}-project-board .vp-project-row,.${P}-project-board .vp-zone-list button{grid-template-columns:minmax(0,1fr) auto}
.${P}-project-board .vp-project-row strong,.${P}-project-board .vp-zone-list strong,.${P}-project-board .vp-person strong{display:block;font-size:1.2rem;font-weight:600}
.${P}-project-board .vp-project-row small,.${P}-project-board .vp-zone-list small,.${P}-project-board .vp-person small{display:block;color:var(--bp-muted);font-size:.8rem;font-weight:400;margin-top:.2rem}
.${P}-project-board [aria-pressed=true] small{color:#215e7b}
.${P}-project-board .vp-number{display:flex;align-items:center;justify-content:center;width:2.6rem;height:2.6rem;border:1px solid var(--bp-line);font-size:1.2rem}
.${P}-project-board .vp-zone-list,.${P}-project-board .vp-people{display:grid;gap:.6rem;margin-bottom:1rem}
.${P}-project-board .vp-zone-list button{padding:.7rem;gap:.7rem}
.${P}-project-board .vp-zone-artwork{max-height:10rem;max-width:100%;display:block;margin-bottom:1rem}
.${P}-project-board .vp-facts{margin:0}
.${P}-project-board .vp-facts>div{padding:.75rem 0;border-bottom:1px solid var(--bp-line)}
.${P}-project-board .vp-facts dt{font-size:.75rem;text-transform:uppercase;color:var(--bp-muted)}
.${P}-project-board .vp-facts dd{margin:.2rem 0 0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:1.05rem}
.${P}-project-board .vp-agreements{padding:0;list-style:none;margin:0 0 1rem}
.${P}-project-board .vp-agreements li{display:flex;justify-content:space-between;gap:.8rem;border-bottom:1px solid var(--bp-line);padding:.75rem 0}
.${P}-project-board .vp-deadline{font-size:1.7rem;margin:1rem 0;display:block}
.${P}-project-board .vp-error{border:1px solid #f5cbb3;padding:.75rem;color:#ffe0c8}
.${P}-project-board .${P}-opening-projects{border:1px solid var(--bp-line);background:var(--bp-panel);padding:.5rem;margin:.5rem 0}
.${P}-project-board .${P}-project-head{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.5rem}
.${P}-project-board .${P}-project-head h2{font-size:1.25rem}
.${P}-project-board .${P}-opening-list{gap:.25rem}
.${P}-project-board .${P}-project-slot{display:flex;flex-direction:column;align-items:start;gap:0;min-height:44px;padding:.35rem .6rem}
.${P}-project-board .${P}-project-slot small{color:var(--bp-muted);font-size:.8rem}
.${P}-project-board .${P}-project-slot strong{font-size:1rem}
.${P}-project-board .${P}-project-card{display:grid;gap:.25rem;padding:.5rem;border:1px solid var(--bp-line);border-radius:0;background:transparent;box-shadow:none}
.${P}-project-board .${P}-project-card p{margin:.1rem 0;line-height:1.25;color:var(--bp-ink)}
.${P}-project-board .${P}-project-card>.${P}-button{background:transparent;color:var(--bp-ink)}
.${P}-project-board .villages-space-connections{margin-top:1.5rem;border-top:1px solid var(--bp-line);padding-top:1rem}
.${P}-project-board .villages-space-connections legend{font-size:1.2rem;margin-bottom:.6rem}
.${P}-project-board .villages-space-connections ul{padding-left:1.25rem}
.${P}-project-board .vp-zone-list button[aria-pressed=true],.${P}-project-board .vp-person[aria-pressed=true]{background:#d1e9ef;color:#064773;border-color:#d1e9ef}
.${P}-project-board button:is([aria-pressed=true],[aria-selected=true],.vp-primary):hover:not(:disabled){background:#e0f1f4;color:#064773}
.${P}-project-board textarea[rows="2"]{min-height:3.5rem}
@media(min-width:701px) and (max-width:1050px){
 .${P}-project-board .vp-new-types{grid-template-columns:minmax(0,1fr)}
 .${P}-project-board .vp-new-types button{min-height:4rem}
}
@media(max-width:700px){
 ${P} .${P}-project-desk{padding:.6rem}
 ${P} .${P}-project-board{padding:.65rem;outline-width:2px;min-height:calc(100vh - 1.2rem)}
 .${P}-project-board .vp-header{gap:.4rem;align-items:center;padding-bottom:.45rem;margin-bottom:.55rem}
 .${P}-project-board .vp-header h1{font-size:1.2rem}
 .${P}-project-board .vp-header>.vp-actions{margin-left:auto}
 .${P}-project-board .vp-header button{font-size:.7rem;padding:.3rem .35rem;white-space:nowrap}
 .${P}-project-board .vp-project-heading{margin:.55rem 0}
 .${P}-project-board .vp-tabs{grid-template-columns:repeat(4,minmax(0,1fr));margin:.5rem 0}
 .${P}-project-board .vp-tabs button{font:600 .72rem/1.2 Arial,sans-serif;padding:.3rem .15rem;overflow-wrap:normal}
 .${P}-project-board .vp-detail-pages{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:.35rem}
 .${P}-project-board .vp-detail-pages button{font-size:.75rem;padding:.3rem .15rem}
 .${P}-project-board .vp-panel-heading button{font-size:.75rem;padding:.3rem .45rem;white-space:nowrap}
 .${P}-project-board .vp-panel{padding:.65rem}
 .${P}-project-board .vp-panel h3{margin-bottom:.5rem}
 .${P}-project-board label{margin-bottom:.45rem}
 .${P}-project-board textarea{height:3.5rem;min-height:3.5rem;resize:vertical}
 .${P}-project-board .vp-choices{margin:.2rem 0 .45rem}
 .${P}-project-board .vp-choices button{font-size:.75rem;padding:.35rem .45rem}
 .${P}-project-board .vp-choices[aria-label="Classes"]{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.2rem}
 .${P}-project-board .vp-choices[aria-label="Classes"] button{font:600 .72rem/1.2 Arial,sans-serif;padding:.3rem .1rem}
 .${P}-project-board .${P}-project-head h2{font-size:1rem}
 .${P}-project-board .${P}-project-head button{font-size:.8rem;padding:.35rem .45rem}
 .${P}-project-board .${P}-opening-back{justify-self:start;font-size:.8rem;padding:.35rem .45rem}
 .${P}-project-board .${P}-opening-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.25rem}
 .${P}-project-board .${P}-opening-actions button{font-size:.8rem;padding:.35rem .45rem}
 .${P}-project-board .vp-facts>div{padding:.35rem 0}
 .${P}-project-board .vp-footer{gap:.4rem;padding-top:.4rem;margin-top:.45rem}
 .${P}-project-board .vp-columns,.${P}-project-board .vp-zone-columns{grid-template-columns:minmax(0,1fr)}
 .${P}-project-board .vp-zone-columns[data-zone-view="list"]>section:last-child,.${P}-project-board .vp-zone-columns[data-zone-view="editor"]>section:first-child{display:none}
 .${P}-project-board .vp-zone-columns[data-editor-page="details"] :is(.vp-zone-options,.vp-zone-appearance),.${P}-project-board .vp-zone-columns[data-editor-page="appearance"] :is(.vp-zone-details,.vp-zone-options),.${P}-project-board .vp-zone-columns[data-editor-page="access"] :is(.vp-zone-details,.vp-zone-appearance){display:none}
 .${P}-project-board .vp-zone-pages{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.2rem}
 .${P}-project-board .vp-zone-pages button{font-size:.75rem;padding:.3rem .15rem}
 .${P}-project-board .vp-zone-list{gap:.25rem;margin-bottom:.4rem}
 .${P}-project-board .vp-zone-list button{padding:.35rem .55rem}
 .${P}-project-board .vp-zone-list strong{font-size:1rem}
 .${P}-project-board .vp-zone-list small{display:none}
 .${P}-project-board .vp-zone-artwork{max-height:12vh;margin-bottom:.3rem;object-fit:contain}
 .${P}-project-board .villages-space-connections{margin-top:0;padding-top:.35rem}
 .${P}-project-board .vp-connection-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem}
 .${P}-project-board .vp-drawing{min-height:0;padding:1rem}
 .${P}-project-board .vp-drawing:only-child>img{max-height:38vh}
 .${P}-project-board .vp-project-heading{align-items:start;gap:.5rem}
 .${P}-project-board .vp-project-heading h2{font-size:1.35rem}
 .${P}-project-board .vp-project-heading>span{font-size:.7rem;max-width:8rem}
 .${P}-project-board .vp-project-row{gap:.65rem;padding:.8rem}
 .${P}-project-board .vp-project-row strong{font-size:1.1rem}
 .${P}-project-board .vp-footer{align-items:stretch}
 .${P}-project-board .vp-footer>.vp-actions{width:100%}
 .${P}-project-board .vp-footer>.vp-actions button{flex:1}
 .${P}-project-board .vp-mobile-sections{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.3rem;margin-bottom:.5rem}
 .${P}-project-root:has(.vp-workspace) .${P}-project-desk{padding:.6rem}
 .${P}-project-board .vp-mobile-sections button{padding:.35rem .2rem;font-size:.85rem}
 .${P}-project-board .vp-workspace{grid-template-columns:minmax(0,1fr)}
 .${P}-project-board .vp-draft-create[data-full=false]{display:flex}
 .${P}-project-board .vp-workspace[data-mobile-section="drafts"]>.vp-active-slot,.${P}-project-board .vp-workspace[data-mobile-section="slot1"]>.vp-drafts,.${P}-project-board .vp-workspace[data-mobile-section="slot2"]>.vp-drafts,.${P}-project-board .vp-workspace[data-mobile-section="slot1"]>.vp-active-slot:last-child,.${P}-project-board .vp-workspace[data-mobile-section="slot2"]>.vp-active-slot:nth-child(2){display:none}
}
@media(max-width:700px) and (max-height:650px){
 ${P} .${P}-project-desk{padding:.35rem}
 ${P} .${P}-project-board{padding:.4rem}
 .${P}-project-board{font-size:.9rem;line-height:1.2}
 .${P}-project-board .vp-header{padding-bottom:.2rem;margin-bottom:.25rem}
 .${P}-project-board .vp-project-heading{margin:.25rem 0}
 .${P}-project-board .vp-project-heading h2{font-size:1.1rem}
 .${P}-project-board .vp-tabs{margin:.25rem 0}
 .${P}-project-board .vp-detail-pages,.${P}-project-board .vp-zone-pages{margin-bottom:.2rem}
 .${P}-project-board .vp-panel{padding:.4rem}
 .${P}-project-board .vp-panel h3{font-size:1rem;margin-bottom:.2rem}
 .${P}-project-board label{margin-bottom:.2rem}
 .${P}-project-board .vp-footer{margin-top:.25rem;padding-top:.25rem}
 .${P}-project-board .vp-actions{gap:.25rem}
 .${P}-project-board .vp-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.35rem}
 .${P}-project-board .vp-facts dt{font-size:.65rem}
 .${P}-project-board textarea{height:44px;min-height:44px}
}
`;
