import { ELEMENT_TAG as P } from "../../shared/constants.js";
export const REPAIR_STYLES = `
.villages-repair .repair-context-title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.villages-repair{--repair-bg:#23272a;--repair-paper:#1b1e20;--repair-ink:#eceae3;--repair-muted:#b9bcbf;--repair-line:#424a50;--repair-control:#68767d;--repair-primary:#eda967;--repair-onprimary:#271e17;--repair-focus:#b1d9f6;display:flex;flex-direction:column;height:100%;min-height:0;width:100%;background:var(--repair-bg);color:var(--repair-ink);color-scheme:dark;font:16px/1.45 "Segoe UI",system-ui,sans-serif}
.villages-repair *{box-sizing:border-box;overflow-wrap:anywhere}
.villages-repair svg{width:21px;height:21px;flex:none}
.villages-repair :is(button,input,select,textarea){font:inherit;color:inherit}
.villages-repair button{cursor:pointer;background:transparent;border:1px solid var(--repair-control);border-radius:6px;min-height:44px;padding:9px 16px}
.villages-repair button:disabled{opacity:.45;cursor:default}
.villages-repair button:hover:not(:disabled){background:#30363b}
.villages-repair :is(button,input,select,textarea):focus-visible{outline:2px solid var(--repair-focus);outline-offset:3px}
.villages-repair :is(input:not([type=checkbox]),select,textarea){min-height:44px;width:100%;background:#23272a;border:1px solid var(--repair-control);border-radius:6px;padding:9px 13px}
.villages-repair input[type=checkbox]{width:22px;height:22px;accent-color:var(--repair-primary)}
.villages-repair textarea{resize:none;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.villages-repair h1{font-size:29px;line-height:1.2;font-weight:600;letter-spacing:-.025em;margin:0 0 22px}
.villages-repair h2{font-size:22px;line-height:1.3;font-weight:600;margin:0}
.villages-repair h3{font-size:14px;font-weight:500;margin:0}
.villages-repair p{margin:12px 0;white-space:pre-wrap}
.villages-repair small{font-size:13px;color:var(--repair-muted)}
.villages-repair .repair-chrome{flex:none;min-height:64px;display:flex;align-items:center;gap:24px;padding:8px 30px;background:var(--repair-paper);border-bottom:1px solid var(--repair-line)}
.villages-repair .repair-chrome>span{font-size:14px;color:var(--repair-muted)}
.villages-repair .repair-chrome>strong{display:flex;align-items:center;gap:10px;flex:none;font-size:19px;letter-spacing:.04em;border-left:1px solid var(--repair-line);padding-left:22px}
.villages-repair .repair-chrome>strong>img{display:block;width:36px;height:36px;object-fit:contain;image-rendering:pixelated;flex:none}
.villages-repair .repair-chrome form{margin-left:auto;width:295px}
.villages-repair .repair-chrome input{font-size:14px;min-height:40px}
.villages-repair .repair-chrome>button{font-size:13px;border:0;white-space:nowrap}
.villages-repair .repair-area-tabs{display:flex;gap:6px;padding:8px 28px;border-bottom:1px solid var(--repair-line);flex:none;background:#1f2326}
.villages-repair .repair-area-tabs button{display:flex;align-items:center;gap:11px;border:0;font-size:14px;color:var(--repair-muted);padding:9px 18px}
.villages-repair :is(.repair-area-tabs,.repair-actions) button:is([aria-current=page],[aria-pressed=true]),.villages-repair .repair-steps button[aria-current=step]{background:#39342f;color:var(--repair-primary)}
.villages-repair .repair-content{flex:1;min-height:0;min-width:0;display:flex;flex-direction:column;padding:20px 30px 18px;max-width:1490px;width:100%;align-self:flex-start}
.villages-repair .repair-workspace{flex:1;min-height:0;min-width:0;position:relative;display:flex;flex-direction:column;container:village-desk/inline-size}
.villages-repair .repair-notebook-body{display:flex;flex-direction:column;flex:1;min-width:0;min-height:0}
.villages-repair .repair-workspace[data-sections=true]{flex-direction:row;gap:22px}
.villages-repair .repair-notebook-nav{width:185px;flex:none;display:flex;flex-direction:column;gap:6px;padding-right:14px;border-right:1px solid var(--repair-line);align-self:flex-start}
.villages-repair .repair-notebook-nav button{display:flex;align-items:center;gap:10px;border:1px solid transparent;min-height:44px;padding:8px 11px;font-size:14px;text-align:left;color:var(--repair-muted)}
.villages-repair .repair-notebook-nav button[aria-current=page]{background:#39342f;border-color:#755943;color:var(--repair-primary)}
.villages-repair .repair-workspace[data-sections=true] .repair-editor:has(>.repair-steps){grid-template-columns:minmax(0,815px);gap:10px}
.villages-repair .repair-workspace[data-sections=true] .repair-steps{flex-direction:row;flex-wrap:wrap}
.villages-repair .repair-workspace[data-sections=true] .repair-steps button{min-height:44px;padding:5px 9px;font-size:13px;gap:6px}
.villages-repair .repair-workspace[data-notebook=true] .repair-editor{display:flex;padding:0;min-width:0}
.villages-repair .repair-workspace[data-notebook=true] .repair-steps{display:none}
.villages-repair .repair-workspace[data-notebook=true] .repair-card{flex:1;max-width:815px}
.villages-repair .repair-workspace[data-notebook=true] .repair-fields[data-columns=true]>.repair-field:last-child:nth-child(odd){grid-column:1/-1}
.villages-repair .repair-weekdays{display:flex;flex-wrap:wrap;gap:6px 14px}
.villages-repair .repair-weekdays label{display:flex;align-items:center;gap:6px;min-height:44px;font-size:14px}
.villages-repair .repair-clock>label{display:flex;align-items:center;gap:8px;min-height:36px;font-size:13px}
.villages-repair .repair-target{display:flex;align-items:center;gap:14px;min-height:64px;margin-bottom:14px;flex:none}
.villages-repair .repair-target h1{font-size:25px;margin:0 0 4px}
.villages-repair .repair-target small{display:block;font-size:12px}
.villages-repair .repair-back{font-size:13px;border:0;border-right:1px solid var(--repair-line);border-radius:0;padding:8px 17px 8px 0;color:var(--repair-primary)}
.villages-repair .repair-target-icon{width:48px;height:48px;border-radius:50%;background:#38443f;display:flex;align-items:center;justify-content:center;color:#c6d5cc;flex:none}
.villages-repair .repair-sections{display:flex;gap:24px;align-items:stretch;border-bottom:1px solid var(--repair-line);margin-bottom:21px;flex:none}
.villages-repair .repair-sections button{border:0;border-bottom:2px solid transparent;border-radius:0;padding:9px 0 12px;font-size:13px;color:var(--repair-muted)}
.villages-repair .repair-sections button[aria-current=page]{border-color:var(--repair-primary);color:var(--repair-primary)}
.villages-repair .repair-directory{display:flex;flex-direction:column;gap:16px;min-height:0;flex:1}
.villages-repair .repair-directory>.repair-sections{margin-bottom:0}
.villages-repair .repair-search{display:flex;align-items:center;gap:12px;border:1px solid var(--repair-control);border-radius:7px;padding:0 15px;min-height:46px;max-width:650px;flex:none}
.villages-repair .repair-search input{border:0;padding:9px 0;background:none}
.villages-repair .${P}-storybook-search-icon{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.villages-repair .${P}-directory-grid{display:grid;grid-template-columns:repeat(2,166px);grid-template-rows:none;grid-auto-rows:auto;height:auto;max-height:none;padding:0;flex:none;gap:18px}
.villages-repair .repair-directory:has([aria-label="People categories"]) .repair-search{max-width:460px}
.villages-repair .repair-locations-title .repair-target-icon{border-radius:8px}
.villages-repair .repair-locations.repair-card{width:100%;max-width:780px;padding:16px 18px;gap:12px}
.villages-repair .repair-location-toolbar{display:flex;align-items:center;gap:8px}
.villages-repair .repair-location-toolbar>.repair-search{flex:2;min-width:0;max-width:390px}
.villages-repair .repair-location-toolbar>select{flex:1;min-width:0;max-width:220px;font-size:14px}
.villages-repair .repair-location-group h2{font-size:15px;line-height:20px;margin:0 0 8px;color:var(--repair-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.villages-repair .repair-location-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px}
.villages-repair .repair-location-grid button{width:100%;height:56px;display:flex;align-items:center;gap:11px;padding:6px 10px;border-color:var(--repair-line);text-align:left}
.villages-repair .repair-location-grid button:is(:hover,:focus-visible){background:#39342f;border-color:#84613f;color:var(--repair-primary)}
.villages-repair .repair-location-grid button>svg{width:30px;height:30px;padding:6px;border-radius:5px;background:#38443f;color:#c6d5cc}
.villages-repair .repair-location-grid button:is(:hover,:focus-visible)>svg{background:#514539;color:var(--repair-primary)}
.villages-repair .repair-location-grid .${P}-location-caption{flex:1;min-width:0}
.villages-repair .repair-location-grid strong{font-weight:500;line-height:1.2;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.villages-repair .repair-location-grid .${P}-location-chevron{font-size:18px;flex:none}
.villages-repair .repair-locations>p{margin:0;color:var(--repair-muted)}
.villages-repair .repair-locations[data-compact=true]{padding:10px;gap:10px}
.villages-repair .repair-locations[data-compact=true] .repair-location-toolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.villages-repair .repair-locations[data-compact=true] .repair-location-toolbar>.repair-search{grid-column:1/-1;max-width:none}
.villages-repair .repair-locations[data-compact=true] .repair-location-toolbar>select{max-width:none}
.villages-repair .repair-locations[data-compact=true] .repair-location-grid{grid-template-columns:minmax(0,1fr);gap:5px}
.villages-repair .repair-locations[data-compact=true] .repair-location-grid button{height:46px;padding:4px 8px;font-size:15px}
.villages-repair .repair-locations[data-compact=true] .repair-location-grid button>svg{width:27px;height:27px;padding:5px}
.villages-repair button.${P}-directory-card{display:flex;align-items:center;flex-direction:column;gap:11px;padding:12px 13px 13px;border:1px solid #58645f;border-radius:8px;background:#2d3531;min-height:166px;width:166px;text-align:center}
.villages-repair .${P}-avatar{display:flex;align-items:center;justify-content:center;width:52px;height:52px;position:relative;overflow:hidden;border-radius:6px;background:#43514c;flex:none}
.villages-repair .${P}-avatar img{display:block;width:100%;height:100%;max-width:none;object-fit:cover}
.villages-repair .${P}-directory-card .${P}-avatar{width:132px;height:132px}
.villages-repair .${P}-directory-text{font-size:16px;line-height:1.3}
.villages-repair .${P}-directory-text strong{font-weight:500}
.villages-repair .${P}-venue-zones{display:flex;flex-direction:column;background:transparent;border:0;padding:0;gap:0;overflow:visible}
.villages-repair .${P}-venue-zones>button{display:flex;align-items:center;gap:15px;border:0;border-bottom:1px solid var(--repair-line);border-radius:0;min-height:68px;text-align:left}
.villages-repair .${P}-venue-zone-thumb{display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex:none;background:#34413c;border-radius:5px}
.villages-repair .${P}-venue-zone-caption{flex:1}
.villages-repair .repair-pages{display:flex;align-items:center;justify-content:flex-end;gap:10px;font-size:13px;margin-top:auto;flex:none}
.villages-repair .repair-pages>span{margin-right:auto;color:var(--repair-muted)}
.villages-repair .repair-pages button{font-size:13px}
.villages-repair .repair-people-directory{max-width:460px}
.villages-repair .repair-people-directory .${P}-directory-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.villages-repair .repair-people-directory button.${P}-directory-card{width:100%;min-height:0;padding:10px;gap:8px}
.villages-repair .repair-people-directory .${P}-directory-card .${P}-avatar{width:var(--repair-portrait-size);height:var(--repair-portrait-size)}
.villages-repair .repair-people-directory .repair-pages{margin-top:0;justify-content:flex-start;gap:8px}
.villages-repair .repair-people-directory[data-compact=true]{gap:8px}
.villages-repair .repair-people-directory[data-compact=true] button.${P}-directory-card{flex-direction:row;padding:6px;gap:6px;min-height:64px}
.villages-repair .repair-people-directory[data-compact=true] .${P}-directory-text{font-size:13px}
.villages-repair .repair-editor{display:grid;grid-template-columns:minmax(0,815px);gap:30px;min-height:0;flex:1;align-items:start}
.villages-repair .repair-editor:has(>.repair-steps){grid-template-columns:245px minmax(0,815px)}
.villages-repair .repair-editor[data-collection=true]{grid-template-columns:minmax(260px,300px) minmax(0,815px)}
.villages-repair .repair-steps{display:flex;flex-direction:column;gap:8px;align-items:stretch}
.villages-repair .repair-steps>button{display:flex;align-items:center;gap:12px;border:0;min-height:53px;padding:10px 14px;font-size:14px;text-align:left;color:var(--repair-muted)}
.villages-repair .repair-steps>button>span{display:flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;border:1px solid #626f76;border-radius:50%;font-size:12px}
.villages-repair .repair-steps>button[aria-current=step]>span{background:var(--repair-primary);border-color:var(--repair-primary);color:var(--repair-onprimary)}
.villages-repair .repair-card{border:1px solid var(--repair-line);border-radius:9px;padding:25px 30px;background:#262b2e;min-width:0;display:flex;flex-direction:column;gap:20px}
.villages-repair .repair-card-title{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:5px}
.villages-repair .repair-card-title>h2{margin-right:auto}
.villages-repair .repair-card-title>small{font-size:12px;white-space:nowrap}
.villages-repair .repair-card-title>button{flex:none}
.villages-repair .repair-field{display:flex;flex-direction:column;gap:8px;min-width:0}
.villages-repair .repair-field>label{font-size:14px;color:var(--repair-muted)}
.villages-repair .repair-fields{display:grid;gap:22px}
.villages-repair .repair-fields[data-columns=true]{grid-template-columns:repeat(2,minmax(0,1fr))}
.villages-repair .repair-fields[data-columns=true]>.repair-field:has(.repair-weekdays){grid-column:1/-1}
.villages-repair .repair-fields[data-world][data-columns=true]>.repair-field:has(textarea){grid-column:1/-1}
.villages-repair button.repair-close{padding:0;min-width:44px;border:0;font-size:24px}
.villages-repair .repair-editor:has(.repair-field[data-score]) .repair-fields{gap:16px}
.villages-repair .repair-field[data-score]{display:grid;grid-template-columns:minmax(0,1fr) 76px;align-items:center;gap:6px 14px}
.villages-repair .repair-field[data-score]>:is(label,p){grid-column:1/-1}
.villages-repair .repair-field[data-score]>:is([role=meter],.repair-score-slider){grid-column:1}
.villages-repair .repair-score-slider{min-width:0;position:relative}
.villages-repair .repair-score-slider::after{content:"";position:absolute;left:50%;top:22px;height:15px;width:1px;transform:translate(-50%,-50%);background:#f0dfbc;pointer-events:none}
.villages-repair .repair-score-slider>input[type=range]{position:relative;z-index:1;display:block;appearance:none;min-width:0;min-height:44px;border:0;background:transparent;margin:0;padding:0;cursor:pointer;--score-track:linear-gradient(to right,#576467 0 min(50%,var(--repair-score-position)),#678b76 min(50%,var(--repair-score-position)) max(50%,var(--repair-score-position)),#576467 max(50%,var(--repair-score-position)) 100%)}
.villages-repair .repair-score-slider>input[type=range]::-webkit-slider-runnable-track{height:5px;background:var(--score-track);border-radius:3px}
.villages-repair .repair-score-slider>input[type=range]::-moz-range-track{height:5px;background:var(--score-track);border-radius:3px}
.villages-repair .repair-score-slider>input[type=range]::-webkit-slider-thumb{appearance:none;width:15px;height:15px;margin-top:-5px;border:0;border-radius:50%;background:var(--repair-primary)}
.villages-repair .repair-score-slider>input[type=range]::-moz-range-thumb{width:15px;height:15px;border:0;border-radius:50%;background:var(--repair-primary)}
.villages-repair .repair-score-axis{display:grid;grid-template-columns:1fr 1fr 1fr;margin-top:-4px;color:var(--repair-muted);font-size:12px}
.villages-repair .repair-score-axis span:nth-child(2){text-align:center}
.villages-repair .repair-score-axis span:last-child{text-align:right}
.villages-repair .repair-field[data-score]>input[type=number]{grid-area:3/2;align-self:start;text-align:center;padding-inline:6px}
.villages-repair .repair-relationship-target{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.villages-repair .repair-relationship-target select{flex:1;min-width:100px;max-width:340px}
.villages-repair .repair-relationship-target nav{flex-basis:100%}
.villages-repair .repair-prose{min-width:0}
.villages-repair .repair-prose textarea{display:block}
.villages-repair .repair-text-pages{display:flex;align-items:center;justify-content:flex-end;gap:10px;font-size:12px;margin-top:4px}
.villages-repair .repair-text-pages button{padding:2px 10px;min-height:32px}
.villages-repair .repair-actions{display:flex;gap:8px;flex-wrap:wrap}
.villages-repair .repair-actions button{font-size:13px}
.villages-repair .repair-record-list{display:flex;flex-direction:column;gap:0}
.villages-repair .repair-record-list>button{display:flex;align-items:center;gap:16px;min-height:68px;border:0;border-bottom:1px solid var(--repair-line);border-radius:0;text-align:left}
.villages-repair .repair-record-list>button>strong{font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.villages-repair .repair-record-list>button>small{max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.villages-repair .repair-record-list>button>span:last-child{margin-left:auto;flex:none}
.villages-repair .repair-collection{width:100%;max-width:815px;gap:12px}
.villages-repair .repair-collection>header{margin:0;flex-wrap:wrap;gap:8px}
.villages-repair .repair-collection-tools{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.villages-repair .repair-collection-tools nav{gap:6px}
.villages-repair .repair-collection-tools button{font-size:13px;padding:6px 8px}
.villages-repair .repair-collection>.repair-search{min-width:0;max-width:380px}
.villages-repair .repair-collection p{margin:0;color:var(--repair-muted)}
.villages-repair .repair-collection .repair-record-list>button{min-height:60px;padding:6px 10px}
.villages-repair .repair-collection .repair-record-list>button[aria-current=page]{background:#39342f;color:var(--repair-primary)}
.villages-repair .repair-editor[data-collection=true]>.repair-collection{padding:16px}
.villages-repair .repair-editor[data-collection=true] .repair-record-list>button{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px}
.villages-repair .repair-editor[data-collection=true] .repair-record-list>button>small{grid-column:1;max-width:none}
.villages-repair .repair-editor[data-collection=true] .repair-record-list>button>span{grid-area:1/2/3/3}
.villages-repair .repair-editor[data-collection=true] .repair-pages{gap:6px}
.villages-repair .repair-editor[data-collection=true] .repair-pages button{padding-inline:8px}
.villages-repair .repair-editor>.repair-card>header>button[data-collection]{font-size:13px;border:1px solid var(--repair-control);padding-inline:10px}
.villages-repair .repair-evidence{border-top:1px solid var(--repair-line);padding-top:12px}
.villages-repair .repair-evidence textarea{background:transparent;border:0;padding:8px 0}
.villages-repair .repair-history{width:100%;border-collapse:collapse;table-layout:fixed;font-size:14px}
.villages-repair .repair-history :is(th,td){text-align:left;border-bottom:1px solid var(--repair-line);padding:10px 12px;font-weight:400;vertical-align:top}
.villages-repair .repair-history th{font-size:12px;color:var(--repair-muted)}
.villages-repair .repair-history :is(th,td):first-child{width:150px}
.villages-repair .repair-history :is(th,td):nth-child(2){width:32%}
.villages-repair .repair-history button{padding:0;min-height:32px;border:0;text-align:left;color:var(--repair-primary)}
.villages-repair .repair-review{max-width:1100px;width:100%;display:flex;flex-direction:column;gap:12px;min-height:0;flex:1}
.villages-repair .repair-comparison{display:grid;grid-template-columns:180px minmax(0,1fr) minmax(0,1fr);gap:15px;border-bottom:1px solid var(--repair-line);padding:10px 0}
.villages-repair .repair-comparison>div>span{font-size:12px;color:var(--repair-muted)}
.villages-repair .repair-comparison textarea{background:transparent;border:0;padding:6px 0}
.villages-repair .repair-snapshot-create{display:flex;gap:12px;flex:none}
.villages-repair .repair-snapshot-create button{white-space:nowrap}
.villages-repair .repair-snapshot-row{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--repair-line)}
.villages-repair .repair-snapshot-row>button:first-child{flex:1;display:flex;align-items:center;gap:14px;text-align:left;border:0;min-height:68px}
.villages-repair .repair-snapshot-row strong{font-weight:500}
.villages-repair .repair-snapshot-row small{margin-left:auto}
.villages-repair .repair-recovery-row{display:flex;align-items:center;gap:15px;border-bottom:1px solid var(--repair-line);padding:12px 0;font-size:14px;flex-wrap:wrap}
.villages-repair .repair-recovery-row strong{font-weight:500;flex:1}
.villages-repair .repair-recovery-row button{font-size:13px}
.villages-repair .repair-agenda-dates{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));flex:none}
.villages-repair .repair-agenda-dates button{padding:4px;font-size:13px}
.villages-repair .repair-agenda-dates span{display:block;font-size:18px}
.villages-repair .repair-agenda-dates button[aria-pressed=true]{color:var(--repair-primary);background:#39342f}
.villages-repair .repair-agenda-blocks{display:flex;flex-direction:column}
.villages-repair .repair-agenda-blocks button{display:grid;grid-template-columns:130px minmax(0,1fr);text-align:left;border:0;border-left:6px solid #608272;border-bottom:1px solid var(--repair-line);border-radius:0;min-height:64px;padding:8px 14px}
.villages-repair .repair-agenda-blocks button>span{grid-row:span 2;font-size:13px}
.villages-repair .repair-agenda-blocks strong{font-weight:500}
.villages-repair .repair-footer{flex:none;min-height:76px;display:flex;align-items:center;justify-content:flex-end;gap:12px;border-top:1px solid var(--repair-line);padding:14px 36px;background:#202427}
.villages-repair .repair-footer>span{margin-right:auto;font-size:13px;color:var(--repair-muted)}
.villages-repair .repair-footer button{font-size:14px}
.villages-repair .repair-footer[data-active=false]{min-height:35px;padding-block:4px}
.villages-repair button.repair-primary{background:var(--repair-primary);border-color:var(--repair-primary);color:var(--repair-onprimary);font-weight:600}
.villages-repair .repair-error{color:#ffaaaa;margin:4px 0 12px}
.villages-repair :is(.repair-mobile-area,.repair-mobile-section,.repair-mobile-record,.repair-mobile-search){display:none}
.villages-repair .repair-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;clip:rect(0,0,0,0);overflow:hidden;white-space:nowrap;border:0}
.villages-repair :is(.repair-compact-area,.repair-menu-short,.repair-page-arrow){display:none}
.villages-repair .repair-review-sides{display:flex;gap:8px}
.villages-repair .repair-review-sides [aria-pressed=true]{color:var(--repair-primary);background:#39342f}
@media(max-width:700px){
.villages-repair{overflow:hidden}
.villages-repair .repair-notebook-body{overflow:auto;overscroll-behavior:contain}
.villages-repair .repair-notebook-body :is(button,input,select,textarea):focus-visible{outline-offset:-3px}
.villages-repair .repair-notebook-body>:is(.repair-directory,.repair-editor,.repair-review,.repair-card){flex-shrink:0}
.villages-repair .repair-workspace[data-sections=true]{flex-direction:column;gap:0}
.villages-repair .repair-notebook-nav{display:none}
.villages-repair .repair-chrome{min-height:54px;padding:5px 14px;gap:12px}
.villages-repair .repair-chrome>span,.villages-repair .repair-chrome form{display:none}
.villages-repair .repair-chrome>strong{border:0;padding:0;font-size:17px;gap:7px}
.villages-repair .repair-chrome>strong>img{width:30px;height:30px}
.villages-repair .repair-chrome>button{padding:5px 0;font-size:12px}
.villages-repair .repair-area-tabs{display:none}
.villages-repair .repair-mobile-area{display:block;padding:8px 14px;background:#1f2326;border-bottom:1px solid var(--repair-line)}
.villages-repair .repair-mobile-search{display:block;flex:none;margin-bottom:12px}
.villages-repair .repair-content{padding:12px 14px;max-width:none}
.villages-repair h1{font-size:24px;margin-bottom:14px}
.villages-repair h2{font-size:19px}
.villages-repair .repair-target{min-height:52px;gap:10px;margin-bottom:10px}
.villages-repair .repair-target h1{font-size:20px}
.villages-repair .repair-target>div:last-child{min-width:0}
.villages-repair .repair-target :is(h1,small){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.villages-repair .repair-target .${P}-avatar,.villages-repair .repair-target-icon{height:40px;width:40px}
.villages-repair .repair-back{font-size:12px;padding-right:10px;flex:none}
.villages-repair .repair-sections{display:none}
.villages-repair .repair-mobile-section{display:block;margin-bottom:12px}
.villages-repair .repair-directory{gap:12px}
.villages-repair .repair-directory>.repair-sections{display:flex;gap:0;margin-bottom:0}
.villages-repair .repair-directory>.repair-sections button{flex:1;padding:7px 5px;font-size:14px}
.villages-repair .repair-directory>.repair-mobile-section{display:none}
.villages-repair .${P}-directory-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.villages-repair button.${P}-directory-card{width:100%;min-height:145px;padding:10px}
.villages-repair .${P}-directory-card .${P}-avatar{width:96px;height:96px}
.villages-repair .repair-record-list>button{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;min-height:72px;padding:6px 4px}
.villages-repair .repair-record-list>button>strong{grid-area:1/1;font-size:15px;line-height:1.3;white-space:normal;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.villages-repair .repair-record-list>button>small{grid-area:2/1;max-width:none}
.villages-repair .repair-record-list>button>span:last-child{grid-area:1/2/3/3;margin:0}
.villages-repair :is(.${P}-venue-zone-caption,.${P}-directory-text strong){display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.villages-repair button.${P}-directory-card>.${P}-directory-text{min-width:0;max-width:100%}
.villages-repair .repair-snapshot-create{gap:6px}
.villages-repair .repair-snapshot-create input{min-width:0}
.villages-repair .repair-snapshot-create button,.villages-repair .repair-snapshot-row>button:not(:first-child){font-size:13px;padding-inline:9px}
.villages-repair .repair-snapshot-row>button:first-child{display:grid;gap:2px;font-size:14px;min-width:0;padding:6px 4px}
.villages-repair .repair-snapshot-row>button:first-child>*{margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.villages-repair .repair-snapshot-row>button:first-child>span{font-size:12px;color:var(--repair-primary)}
.villages-repair .repair-snapshot-row:has(.repair-snapshot-confirm){flex-wrap:wrap}
.villages-repair .repair-snapshot-row:has(.repair-snapshot-confirm)>button:first-child{flex-basis:100%}
.villages-repair .repair-recovery-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 8px;padding:8px 0}
.villages-repair .repair-recovery-row>strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.villages-repair .repair-recovery-row>.repair-recovery-problem{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.villages-repair .repair-recovery-row>button,.villages-repair .repair-recovery-row>p,.villages-repair .repair-recovery-row>.repair-recovery-problem{grid-column:1/-1}
.villages-repair .${P}-day-planner[data-repair=true]{margin-block:0}
.villages-repair .${P}-day-planner[data-repair=true] .${P}-planner-block>:not(.${P}-planner-time){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.villages-repair .${P}-day-planner[data-repair=true] .${P}-planner-pages{gap:6px}
.villages-repair .repair-editor{display:flex;flex-direction:column;gap:12px;padding:0}
.villages-repair .repair-mobile-record{display:block;width:100%}
.villages-repair .repair-steps{display:none}
.villages-repair .repair-card{padding:16px;width:100%;gap:16px}
.villages-repair .repair-card-title{gap:10px;margin-bottom:0}
.villages-repair .repair-card-title>h2{font-size:18px}
.villages-repair .repair-collection>header>h2,.villages-repair .repair-collection>header:not(:has(button)){display:none}
.villages-repair .repair-collection>.repair-search{max-width:none}
.villages-repair .repair-collection .repair-record-list>button{min-height:68px;padding-inline:4px}
.villages-repair .repair-collection .repair-pages button{padding-inline:9px}
.villages-repair .repair-actions{gap:6px}
.villages-repair .repair-actions button{padding:5px 10px}
.villages-repair .repair-field{gap:6px}
.villages-repair .repair-field[data-score]{grid-template-columns:minmax(0,1fr) 58px;column-gap:10px}
.villages-repair .repair-comparison{grid-template-columns:1fr 1fr;gap:8px}
.villages-repair .repair-comparison>h3{grid-column:1/-1}
.villages-repair .repair-review>p{margin:0;font-size:13px}
.villages-repair .repair-history,.villages-repair .repair-history tbody{display:block}
.villages-repair .repair-history thead{position:absolute;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}
.villages-repair .repair-history tbody tr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 8px;border-bottom:1px solid var(--repair-line);padding:6px 0}
.villages-repair .repair-history tbody td:nth-child(n){width:auto;padding:0;border:0;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--repair-muted)}
.villages-repair .repair-history tbody td:first-child{grid-area:1/2}
.villages-repair .repair-history tbody td:nth-child(2){grid-area:1/1}
.villages-repair .repair-history tbody td:nth-child(n+3){grid-column:1/-1}
.villages-repair .repair-history tbody button{min-height:44px;width:100%;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.villages-repair .repair-footer{min-height:70px;padding:8px 14px;gap:6px;flex-wrap:wrap}
.villages-repair .repair-footer[data-active=false]:not(:has(button)):has(>span:empty){min-height:0;padding-block:0}
.villages-repair .repair-footer>span{width:100%;font-size:12px}
.villages-repair .repair-footer button{padding:7px 9px;font-size:13px}
.villages-repair .repair-footer .repair-page-word{display:none}
.villages-repair .repair-footer .repair-page-arrow{display:inline}
.villages-repair .repair-footer .repair-page-nav{width:44px;min-width:44px;padding:6px}
.villages-repair .repair-text-pages button{min-height:44px;min-width:44px}
.villages-repair .repair-review{gap:8px}
.villages-repair .repair-comparison[data-mobile=true]{display:flex;flex-direction:column;padding-block:6px}
.villages-repair .repair-agenda-blocks button{grid-template-columns:100px minmax(0,1fr);padding:8px;font-size:14px}
.villages-repair .repair-agenda-blocks button>span{font-size:12px}
}
@media(min-width:701px) and (max-height:800px){
.villages-repair .repair-workspace[data-sections=true] .repair-steps+.repair-card{padding-block:16px;gap:14px}
.villages-repair .repair-workspace[data-sections=true] .repair-steps+.repair-card .repair-fields{gap:16px}
}
@media(max-height:650px){
.villages-repair .repair-notebook-nav{gap:3px}
.villages-repair .repair-notebook-nav button{min-height:44px;padding-block:7px;font-size:14px}
.villages-repair .repair-score-axis{display:none}
.villages-repair .repair-content{padding-top:10px;padding-bottom:10px}
.villages-repair .repair-target{margin-bottom:8px}
.villages-repair .repair-sections{margin-bottom:10px}
.villages-repair .repair-card{padding:14px 18px;gap:12px}
.villages-repair .repair-card-title h2{font-size:18px}
.villages-repair .repair-footer{min-height:60px;padding-top:8px;padding-bottom:8px}
.villages-repair .${P}-directory-card .${P}-avatar{width:80px;height:80px}
.villages-repair button.${P}-directory-card{min-height:128px}
}
@media(max-width:700px) and (max-height:650px){
.villages-repair .repair-mobile-area{display:none}
.villages-repair .repair-compact-area{display:block;flex:1;min-width:0}
.villages-repair .repair-compact-area select{font-size:13px;padding:7px;min-height:44px}
.villages-repair .repair-menu-full{display:none}
.villages-repair .repair-menu-short{display:inline}
.villages-repair .repair-chrome{gap:8px;padding-inline:10px}
.villages-repair .repair-chrome>strong{font-size:16px;gap:5px}
.villages-repair .repair-chrome>strong>img{width:24px;height:24px}
.villages-repair .repair-chrome>button{padding-inline:5px}
.villages-repair .repair-card{padding:8px;gap:8px}
.villages-repair .repair-card:has(.repair-field[data-score]){gap:6px;padding-block:6px}
.villages-repair .repair-editor:has(.repair-field[data-score]) .repair-fields{gap:6px}
.villages-repair .repair-field[data-score]{row-gap:3px}
.villages-repair .repair-editor{gap:8px}
}
`;
