export const REPAIR_STYLES = `
.villages-repair {
 --repair-bg:#23272a;--repair-paper:#1b1e20;--repair-ink:#eceae3;--repair-muted:#b9bcbf;
 --repair-line:#495056;--repair-control:#777e84;--repair-soft:#30363b;
 --repair-primary:#eda967;--repair-onprimary:#211a15;--repair-warn:#ffd49c;--repair-focus:#b1d9f6;
 display:grid;grid-template-columns:196px minmax(0,1fr);grid-template-rows:auto 1fr;
 background:var(--repair-bg);color:var(--repair-ink);color-scheme:dark;
 font:16px/1.5 "Segoe UI",system-ui,sans-serif;min-height:100%;overflow:auto;
}
.villages-repair * {box-sizing:border-box;overflow-wrap:anywhere;}
.villages-repair :is(button,input,select,textarea) {font:inherit;color:inherit;}
.villages-repair button {min-height:44px;padding:8px 13px;border:1px solid var(--repair-control);background:transparent;border-radius:4px;cursor:pointer;}
.villages-repair button:hover:not(:disabled){background:var(--repair-soft);}
.villages-repair button:disabled{opacity:.5;cursor:default;}
.villages-repair :is(button,input,select,textarea,summary):focus-visible{outline:2px solid var(--repair-focus);outline-offset:3px;}
.villages-repair :is(.repair-primary,button[aria-pressed=true]){background:var(--repair-primary);color:var(--repair-onprimary);border-color:var(--repair-primary);}
.villages-repair :is(.repair-primary,button[aria-pressed=true]):hover:not(:disabled){background:var(--repair-primary);filter:brightness(.94);}
.villages-repair h1{font-size:clamp(25px,3vw,36px);font-weight:650;line-height:1.2;margin:0 0 12px;}
.villages-repair h2{font-size:17px;font-weight:600;margin:0 0 8px;}
.villages-repair .repair-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}
.villages-repair .repair-heading h1{min-width:0;margin-bottom:0;}
.villages-repair .repair-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:10px;margin:16px 0;}
.villages-repair .repair-hub-tiles{grid-template-columns:repeat(3,minmax(0,1fr));}
.villages-repair .repair-sections{grid-template-columns:repeat(2,minmax(0,1fr));}
.villages-repair .repair-sections:has(>:nth-child(3)){grid-template-columns:repeat(3,minmax(0,1fr));}
.villages-repair .repair-tile{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;min-height:64px;padding:12px;text-align:start;background:#292e32;}
.villages-repair :is(.repair-tile,.repair-sections button)>svg{color:var(--repair-primary);}
.villages-repair .repair-sections button[aria-pressed=true]>svg{color:inherit;}
.villages-repair .repair-tile strong{display:block;font-weight:600;}
.villages-repair .repair-tile small{display:block;color:var(--repair-muted);margin-top:3px;}
.villages-repair .repair-chevron{color:var(--repair-muted);font-size:24px;line-height:1;}
.villages-repair .repair-sections button{display:flex;align-items:center;gap:10px;justify-content:center;}
.villages-repair .repair-crumb{display:flex;gap:12px;align-items:center;min-width:0;}
.villages-repair p{margin:0 0 12px;white-space:pre-wrap;}
.villages-repair small{font-size:13px;}
.villages-repair .repair-muted{color:var(--repair-muted);}
.villages-repair .repair-chrome{grid-column:1/-1;display:flex;align-items:center;gap:16px;min-height:54px;padding:8px 24px;border-bottom:1px solid var(--repair-line);}
.villages-repair .repair-chrome strong{border-left:1px solid var(--repair-control);padding-left:16px;letter-spacing:.04em;}
.villages-repair .repair-chrome button{margin-inline-start:auto;border:0;padding:0;text-decoration:underline;text-underline-offset:4px;}
.villages-repair .repair-console-nav{display:flex;flex-direction:column;align-items:stretch;background:var(--repair-paper);padding:24px 12px;}
.villages-repair .repair-console-nav button{border:0;border-inline-start:2px solid transparent;border-radius:0;text-align:start;}
.villages-repair .repair-console-nav button[aria-current=page]{border-inline-start-color:var(--repair-primary);font-weight:600;}
.villages-repair main{width:100%;min-width:0;max-width:930px;padding:32px 36px;}
.villages-repair .repair-links{display:flex;align-items:center;gap:4px 22px;flex-wrap:wrap;margin-bottom:10px;}
.villages-repair .repair-links button{border:0;padding:0;text-decoration:underline;text-underline-offset:4px;}
.villages-repair .repair-links button:hover:not(:disabled){background:transparent;color:var(--repair-primary);}
.villages-repair .repair-links button[aria-current=page]{color:var(--repair-primary);}
.villages-repair footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid var(--repair-line);margin-top:23px;padding-top:16px;}
.villages-repair footer label{display:flex;align-items:center;gap:8px;min-height:44px;font-size:13px;}
.villages-repair .repair-notice{border-left:2px solid var(--repair-warn);padding:8px 12px;margin:15px 0 20px;}
.villages-repair .repair-notice button{margin-left:8px;}
.villages-repair .repair-error{color:var(--repair-warn);}
.villages-repair .repair-layout{display:grid;grid-template-columns:minmax(0,1fr) 265px;gap:20px;align-items:start;}
.villages-repair .repair-layout[data-single=true]{grid-template-columns:minmax(0,1fr);max-width:800px;}
.villages-repair .repair-panel{min-width:0;}
.villages-repair .repair-panel+.repair-panel{margin-top:14px;}
.villages-repair .repair-search{display:flex;gap:10px;margin:20px 0;}
.villages-repair .repair-search input{flex:1 1 0;width:0;min-width:0;}
.villages-repair .repair-search input::placeholder{color:var(--repair-muted);opacity:1;}
.villages-repair .repair-search button{flex:none;white-space:nowrap;overflow-wrap:normal;}
.villages-repair :is(textarea,input:not([type=checkbox]),select){width:100%;min-width:0;border:1px solid var(--repair-control);border-radius:4px;background:var(--repair-bg);padding:10px 12px;font-size:16px;}
.villages-repair textarea{min-height:110px;resize:vertical;}
.villages-repair .repair-records{display:grid;gap:10px;margin:17px 0 10px;}
.villages-repair .repair-actions{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:20px;}
.villages-repair .repair-field{margin-bottom:20px;}
.villages-repair .repair-editor[data-agenda=true]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:12px;}
.villages-repair .repair-editor[data-agenda=true]>:is(.repair-notice,.repair-buttons,.repair-field:has(textarea)){grid-column:1/-1;}
.villages-repair .repair-editor[data-agenda=true] textarea{min-height:68px;}
.villages-repair .repair-field>label{display:block;font-weight:500;margin-bottom:7px;}
.villages-repair fieldset{border:0;padding:0;margin:15px 0;}
.villages-repair legend{font-weight:500;margin-bottom:7px;}
.villages-repair .repair-audience{display:flex;flex-wrap:wrap;gap:9px;}
.villages-repair .repair-audience label{display:flex;gap:7px;align-items:center;padding:8px 11px;min-height:44px;}
.villages-repair input[type=checkbox]{width:17px;height:17px;accent-color:var(--repair-primary);flex:none;}
.villages-repair blockquote{margin:8px 0 13px;padding-left:12px;border-left:3px solid var(--repair-line);white-space:pre-wrap;}
.villages-repair .repair-buttons{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;margin-top:22px;}
.villages-repair .repair-comparison{display:grid;gap:12px;margin:14px 0 22px;}
.villages-repair .repair-comparison>h2{margin-bottom:0;}
.villages-repair .repair-addition{margin-bottom:20px;}
.villages-repair .repair-comparison small{color:var(--repair-muted);}
.villages-repair .repair-comparison p{margin:0;}
.villages-repair .repair-review-meta{display:grid;gap:12px;padding-top:16px;border-top:1px solid var(--repair-line);}
.villages-repair .repair-review-people{display:flex;flex-wrap:wrap;gap:4px 16px;}
.villages-repair .repair-review-people li{padding:0;border:0;}
.villages-repair .repair-review-source summary{width:fit-content;min-height:44px;align-content:center;cursor:pointer;text-decoration:underline;text-underline-offset:4px;}
.villages-repair ul{list-style:none;margin:0;padding:0;}
.villages-repair li{padding:10px 0;border-bottom:1px solid var(--repair-line);}
.villages-repair li:last-child{border:0;}
.villages-repair .repair-confirm{display:flex;gap:9px;align-items:center;margin-top:20px;min-height:44px;}
.villages-repair .repair-done{text-align:center;padding:35px 0;}
.villages-repair .repair-done .repair-buttons{justify-content:center;}
.villages-repair .repair-history-entry{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:17px 0;border-bottom:1px solid var(--repair-line);}
.villages-repair .repair-history-entry>div{min-width:0;}
.villages-repair .repair-history-entry small{color:var(--repair-muted);}
.villages-repair .repair-history-change{margin-top:12px;}
@media(max-width:900px){
 .villages-repair .repair-hub-tiles{grid-template-columns:1fr;}
}
@media(max-width:700px){
 .villages-repair{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto 1fr;}
 .villages-repair .repair-console-nav{display:flex;flex-flow:row wrap;padding:4px 12px;border-bottom:1px solid var(--repair-line);}
 .villages-repair .repair-console-nav button{padding:6px 8px;border-inline-start:0;border-bottom:2px solid transparent;}
 .villages-repair .repair-console-nav button[aria-current=page]{border-bottom-color:var(--repair-primary);}
 .villages-repair .repair-layout{grid-template-columns:1fr;}
 .villages-repair main{padding:20px 16px;}
}
@media(max-width:460px){
 .villages-repair .repair-buttons button{flex:1;}
 .villages-repair .repair-history-entry{flex-wrap:wrap;}
 .villages-repair .repair-sections:has(>:nth-child(3)) button{flex-direction:column;gap:3px;padding-inline:4px;}
}
`;
