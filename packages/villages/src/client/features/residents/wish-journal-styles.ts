export const WISH_JOURNAL_STYLES = `
.villages-wish-browser{grid-column:1/-1;min-width:0;container-type:inline-size}
.villages-wish-layout{min-width:0;display:grid;gap:24px;align-items:start}
.villages-wish-list{min-width:0;display:grid;gap:10px;align-content:start}
.villages-wish-list h3{margin:0 0 4px;font-size:22px}
.villages-wish-list ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.villages-wish-list li{min-width:0;margin:0}
.villages-wish-list button.villages-wish-entry{width:100%;min-height:72px;padding:12px 14px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px 12px;text-align:left;background:var(--popover,#fff3dd);border:1px solid var(--border);border-radius:8px;box-shadow:none}
.villages-wish-entry[aria-pressed=true]{border-color:var(--primary);box-shadow:inset 3px 0 var(--primary)}
.villages-wish-entry-title{min-width:0;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;line-height:1.4}
.villages-wish-entry-arrow{grid-column:2;grid-row:1/3;align-self:center;font:20px/1 sans-serif;color:var(--muted-foreground)}
.villages-wish-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;font-size:14px;line-height:1.4;color:var(--muted-foreground)}
.villages-wish-entry .villages-wish-meta{grid-column:1}
.villages-wish-status{display:inline-block;border:1px solid var(--border);border-radius:20px;padding:1px 8px;white-space:nowrap;font-size:13px;color:var(--foreground)}
.villages-wish-detail{min-width:0;display:grid;gap:18px;align-content:start;scroll-margin:16px}
.villages-wish-detail header{display:grid;gap:10px;padding-bottom:16px;border-bottom:1px solid var(--border)}
.villages-wish-detail header h3{font-size:24px;line-height:1.35;margin:0;overflow-wrap:anywhere}
.villages-wish-detail :is(p,blockquote){margin:0;overflow-wrap:anywhere;line-height:1.55}
.villages-wish-detail p{max-width:60ch}
.villages-wish-detail .villages-wish-back{justify-self:start;min-height:44px}
.villages-wish-detail .villages-wish-follow{justify-self:start;min-height:44px}
.villages-wish-section{min-width:0;display:grid;gap:8px;padding-bottom:16px;border-bottom:1px solid var(--border)}
.villages-wish-section h4{font-size:19px;margin:0;line-height:1.3}
.villages-wish-section blockquote{padding:8px 12px;border-left:3px solid var(--border);background:#b9925409}
.villages-wish-section ul{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.villages-wish-timeline{list-style:none;padding:0;margin:0;display:grid;gap:18px}
.villages-wish-timeline li{min-width:0;display:grid;gap:5px;margin:0;padding:0 0 0 13px;border-left:2px solid var(--border)}
.villages-wish-event{display:flex;align-items:baseline;justify-content:space-between;gap:6px 12px;flex-wrap:wrap}
.villages-wish-browser time{font-size:13px;color:var(--muted-foreground)}
.villages-wish-placeholder{display:none}
.villages-wish-layout[data-open=true]>.villages-wish-list{display:none}
@container (min-width:650px){
 .villages-wish-layout{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(28px,6cqw,80px)}
 .villages-wish-layout[data-open=true]>.villages-wish-list{display:grid}
 .villages-wish-placeholder{display:block;color:var(--muted-foreground);margin:0;padding:12px 0}
}
`;
