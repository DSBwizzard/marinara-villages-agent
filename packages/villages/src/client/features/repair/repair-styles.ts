export const REPAIR_STYLES = `
.villages-repair {
 --repair-bg:light-dark(#f6f5ef,#20231f);--repair-paper:light-dark(#fffef9,#292d27);--repair-ink:light-dark(#292f26,#eef0e8);
 --repair-muted:light-dark(#62695c,#b7bfb0);--repair-line:light-dark(#d8dbd0,#454b40);--repair-soft:light-dark(#eceee5,#333a2e);
 --repair-primary:light-dark(#435b3c,#c4d6b5);--repair-onprimary:light-dark(#fffef9,#202b1c);--repair-mark:light-dark(#e5eddd,#3b4731);
 --repair-warn:light-dark(#785015,#e8c381);--repair-focus:light-dark(#416a81,#97c9e4);
 background:var(--repair-bg);color:var(--repair-ink);font:15px/1.5 "Segoe UI",system-ui,sans-serif;min-height:100%;overflow:auto;
}
.villages-repair * {box-sizing:border-box;overflow-wrap:anywhere;}
.villages-repair :is(button,input,select,textarea) {font:inherit;color:inherit;}
.villages-repair button {min-height:44px;padding:8px 13px;border:1px solid var(--repair-line);background:var(--repair-paper);border-radius:7px;cursor:pointer;}
.villages-repair button:hover:not(:disabled){background:var(--repair-soft);}
.villages-repair button:disabled{opacity:.5;cursor:default;}
.villages-repair :is(button,input,select,textarea):focus-visible{outline:3px solid var(--repair-focus);outline-offset:3px;}
.villages-repair :is(.repair-primary,button[aria-pressed=true]){background:var(--repair-primary);color:var(--repair-onprimary);border-color:var(--repair-primary);}
.villages-repair :is(.repair-primary,button[aria-pressed=true]):hover:not(:disabled){background:var(--repair-primary);filter:brightness(.94);}
.villages-repair h1{font-size:27px;font-weight:500;line-height:1.25;margin:0 0 12px;letter-spacing:.03em;}
.villages-repair h2{font-size:18px;font-weight:500;margin:0 0 10px;}
.villages-repair .repair-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;}
.villages-repair .repair-heading h1{min-width:0;margin-bottom:0;}
.villages-repair .repair-spoilers{display:flex;align-items:center;gap:8px;min-height:44px;white-space:nowrap;flex:none;cursor:pointer;font-size:13px;}
.villages-repair .repair-people{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px;}
.villages-repair .repair-person{text-align:left;padding:20px;font-size:17px;}
.villages-repair p{margin:0 0 12px;white-space:pre-wrap;}
.villages-repair small{font-size:13px;}
.villages-repair .repair-muted{color:var(--repair-muted);}
.villages-repair .repair-chrome{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 23px;background:var(--repair-paper);border-bottom:1px solid var(--repair-line);}
.villages-repair main{padding:23px;max-width:1100px;margin:auto;}
.villages-repair nav{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
.villages-repair nav button{border:0;background:transparent;padding:0 3px;color:var(--repair-primary);text-decoration:underline;text-underline-offset:3px;}
.villages-repair .repair-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px;}
.villages-repair .repair-tile{text-align:left;padding:20px;min-height:108px;}
.villages-repair .repair-tile strong{display:block;font-weight:500;font-size:16px;}
.villages-repair .repair-tile span{display:block;color:var(--repair-muted);font-size:13px;margin-top:5px;}
.villages-repair footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid var(--repair-line);margin-top:23px;padding-top:16px;}
.villages-repair footer label{display:flex;align-items:center;gap:8px;min-height:44px;font-size:13px;}
.villages-repair .repair-notice{padding:12px 14px;border-radius:7px;background:var(--repair-soft);font-size:13px;margin:15px 0 20px;}
.villages-repair .repair-notice button{margin-left:8px;}
.villages-repair .repair-error{color:var(--repair-warn);}
.villages-repair .repair-layout{display:grid;grid-template-columns:minmax(0,1fr) 265px;gap:20px;align-items:start;}
.villages-repair .repair-layout[data-single=true]{grid-template-columns:minmax(0,1fr);max-width:800px;}
.villages-repair .repair-panel{background:var(--repair-paper);border:1px solid var(--repair-line);border-radius:9px;padding:19px;min-width:0;}
.villages-repair .repair-panel+.repair-panel{margin-top:14px;}
.villages-repair .repair-search{display:flex;gap:10px;margin:20px 0;}
.villages-repair .repair-search input{flex:1 1 0;width:0;min-width:0;}
.villages-repair .repair-search button{flex:none;white-space:nowrap;overflow-wrap:normal;}
.villages-repair :is(textarea,input:not([type=checkbox]),select){width:100%;min-width:0;border:1px solid var(--repair-line);border-radius:6px;background:var(--repair-bg);padding:10px 12px;font-size:16px;}
.villages-repair textarea{min-height:110px;resize:vertical;}
.villages-repair .repair-records{display:grid;gap:10px;margin-top:17px;}
.villages-repair .repair-record{width:100%;text-align:left;padding:16px;}
.villages-repair .repair-record strong{display:block;font-weight:500;}
.villages-repair .repair-record small{display:block;color:var(--repair-muted);margin-top:5px;}
.villages-repair .repair-actions{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:20px;}
.villages-repair .repair-field{margin-bottom:20px;}
.villages-repair .repair-field>label{display:block;font-weight:500;margin-bottom:7px;}
.villages-repair .repair-current{padding:8px 12px;border-left:2px solid var(--repair-line);margin-bottom:12px;}
.villages-repair .repair-current small{color:var(--repair-muted);}
.villages-repair .repair-current p{margin:4px 0 0;}
.villages-repair fieldset{border:0;padding:0;margin:15px 0;}
.villages-repair legend{font-weight:500;margin-bottom:7px;}
.villages-repair .repair-audience{display:flex;flex-wrap:wrap;gap:9px;}
.villages-repair .repair-audience label{display:flex;gap:7px;align-items:center;padding:8px 11px;min-height:44px;border:1px solid var(--repair-line);border-radius:6px;}
.villages-repair input[type=checkbox]{width:17px;height:17px;accent-color:var(--repair-primary);flex:none;}
.villages-repair blockquote{margin:8px 0 13px;padding-left:12px;border-left:3px solid var(--repair-line);white-space:pre-wrap;}
.villages-repair .repair-buttons{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;margin-top:22px;}
.villages-repair .repair-comparison{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px;}
.villages-repair .repair-comparison>h2{grid-column:1/-1;margin-bottom:0;}
.villages-repair .repair-addition{margin-bottom:20px;}
.villages-repair .repair-comparison>div{padding:16px;border:1px solid var(--repair-line);background:var(--repair-paper);border-radius:7px;min-width:0;}
.villages-repair .repair-comparison>div:last-child{background:var(--repair-mark);}
.villages-repair .repair-comparison p{margin:8px 0 0;}
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
@media(max-width:700px){.villages-repair .repair-layout{grid-template-columns:1fr;}.villages-repair main{padding:17px;}}
@media(max-width:460px){.villages-repair .repair-grid,.villages-repair .repair-comparison{grid-template-columns:1fr;}.villages-repair .repair-tile{min-height:88px;padding:15px;}.villages-repair .repair-buttons button{flex:1;}.villages-repair .repair-panel{padding:15px;}.villages-repair .repair-history-entry{flex-wrap:wrap;}}
`;
