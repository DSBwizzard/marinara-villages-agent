export const WISH_JOURNAL_STYLES = `
.marinara-capability-villages-dossier-root:has(.villages-wish-browser){overflow:clip}
.marinara-capability-villages-dossier-content:has(.villages-wish-browser){display:block;overflow:clip;height:100%;padding:16px 24px}
.villages-wish-browser{grid-column:1/-1;min-width:0;min-height:0;height:100%;container-type:inline-size;display:flex;flex-direction:column}
.villages-wish-layout{min-width:0;min-height:0;flex:1;display:grid;grid-template-rows:minmax(0,1fr);gap:24px;align-items:stretch}
.villages-wish-list{min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) 44px;gap:10px}
.villages-wish-list h3{margin:0 0 4px;font-size:22px}
.villages-wish-list ul{list-style:none;margin:0;padding:0;min-height:0;overflow:hidden;display:grid;gap:8px;align-content:start}
.villages-wish-list li{min-width:0;min-height:0;margin:0}
.villages-wish-list button.villages-wish-entry{width:100%;height:100%;min-height:0;padding:8px 10px;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:minmax(0,1fr) auto;gap:4px 10px;text-align:left;background:var(--popover,#fff3dd);border:1px solid var(--border);border-radius:8px;box-shadow:none}
.villages-wish-entry[aria-pressed=true]{border-color:var(--primary);box-shadow:inset 3px 0 var(--primary)}
.villages-wish-entry-title{min-width:0;min-height:0;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;line-height:1.35}
.villages-wish-entry-arrow{grid-column:2;grid-row:1/3;align-self:center;font:20px/1 sans-serif;color:var(--muted-foreground)}
.villages-wish-meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-size:12px;line-height:1.3;color:var(--muted-foreground)}
.villages-wish-entry .villages-wish-meta{grid-column:1}
.villages-wish-status{display:inline-block;border:1px solid var(--border);border-radius:20px;padding:1px 8px;white-space:nowrap;font-size:13px;color:var(--foreground)}
.villages-wish-detail{min-width:0;min-height:0;display:grid;grid-template-rows:44px auto auto minmax(0,1fr);gap:10px;overflow:hidden}
.villages-wish-detail header{display:grid;gap:6px}
.villages-wish-detail header h3{font-size:20px;line-height:1.3;margin:0;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.villages-wish-detail :is(p,blockquote){margin:0;overflow-wrap:anywhere;line-height:1.55}
.villages-wish-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}
.villages-wish-actions button{min-height:44px;height:44px;padding:5px 10px}
.villages-wish-tabs{display:flex;flex-wrap:wrap;align-content:start;gap:4px;border-bottom:1px solid var(--border);padding-bottom:4px}
.villages-wish-tabs button{flex:1 0 auto;min-height:44px;padding:4px 8px;font-size:14px;line-height:1.2;border-radius:6px 6px 0 0;box-shadow:none;white-space:nowrap}
.villages-wish-tabs button[aria-selected=true]{background:#f7df9a;border-color:#8c7145;box-shadow:inset 0 -3px #8c7145;font-weight:700}
.villages-wish-panel{min-width:0;min-height:0;display:grid;grid-template-rows:minmax(0,1fr)}
.villages-wish-section{min-width:0;display:block}
.villages-wish-section h4{font-size:19px;margin:0 0 8px;line-height:1.3;break-after:avoid}
.villages-wish-section p+h4{margin-top:16px}
.villages-wish-section strong+p{margin-top:8px}
.villages-wish-section blockquote{padding:8px 12px;border-left:3px solid var(--border);background:#b9925409}
.villages-wish-section ul{list-style:none;margin:0;padding:0}
.villages-wish-section li{break-inside:avoid;margin:0 0 16px}
.villages-wish-timeline{list-style:none;padding:0;margin:0}
.villages-wish-timeline li{min-width:0;margin:0 0 18px;padding:0 0 0 10px;border-left:2px solid var(--border)}
.villages-wish-event{margin-bottom:5px}
.villages-wish-event strong{display:block}
.villages-wish-browser time{font-size:13px;color:var(--muted-foreground)}
.villages-wish-pages{min-width:0;min-height:0;display:grid;grid-template-rows:minmax(0,1fr) 44px;gap:10px}
.villages-wish-page-window{min-width:0;min-height:0;overflow:hidden}
.villages-wish-page-track{width:100%;height:100%;column-width:var(--wish-page-width,1000px);column-gap:24px;column-fill:auto;overflow-wrap:anywhere}
.villages-wish-pagination{min-width:0;display:flex;align-items:center;justify-content:space-between;gap:8px;height:44px;border-top:1px solid var(--border);padding-top:0}
.villages-wish-pagination button{min-height:40px;height:40px;min-width:44px;padding:3px 10px}
.villages-wish-pagination span{font-size:14px;white-space:nowrap}
.villages-wish-placeholder{display:none}
.villages-wish-layout[data-open=true]>.villages-wish-list{display:none}
@container (min-width:650px){
 .villages-wish-layout{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(28px,6cqw,80px)}
 .villages-wish-layout[data-open=true]>.villages-wish-list{display:grid}
 .villages-wish-placeholder{display:block;color:var(--muted-foreground);margin:0;padding:12px 0}
}
`;
