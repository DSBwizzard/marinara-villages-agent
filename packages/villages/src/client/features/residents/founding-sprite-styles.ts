export const FOUNDING_SPRITE_STYLES = `
.villages-founding-sprite-setup{height:100%;min-height:0;min-width:0;display:flex;flex-direction:column;overflow:hidden;color:#edf0fc}
.founding-sprite-heading{display:flex;gap:.75rem;align-items:center;justify-content:space-between;flex-wrap:wrap;flex:none;padding:.75rem 1rem;border-bottom:1px solid #394866}
.founding-sprite-heading h3{margin:0;font-size:1.05rem}
.founding-sprite-heading>div{display:flex;gap:.4rem}
.founding-sprite-heading button[aria-pressed=true]{background:#674dc5;border-color:#a28ae2}
.founding-sprite-body{display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.1fr);min-height:0;flex:1}
.founding-sprite-library{display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;gap:.6rem;padding:.75rem;min-width:0;min-height:0;border-right:1px solid #394866}
.founding-sprite-label{display:flex;align-items:center;justify-content:space-between;gap:.5rem;min-width:0}
.founding-sprite-label h4,.founding-sprite-portrait h4{margin:0;font-size:.9rem}
.founding-sprite-label span{font-size:.75rem;color:#b8c4dc;font-weight:400}
.founding-sprite-label button{padding:.1rem .5rem;min-height:28px}
.founding-sprite-library label{display:grid;gap:.25rem;font-size:.8rem;color:#b8c4dc}
.founding-sprite-library select{width:100%;min-width:0}
.founding-sprite-source-grid,.founding-sprite-assigned-grid{display:grid;gap:.4rem;min-height:0;min-width:0}
.founding-sprite-source{display:flex;flex-direction:column;align-items:center;gap:.25rem;min-height:0;min-width:0;padding:.35rem!important;cursor:grab}
.founding-sprite-source img{flex:1;min-height:0;height:0;width:100%;object-fit:contain;pointer-events:none}
.founding-sprite-source>span:last-child,.founding-sprite-default>span{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.8rem}
.founding-sprite-source[aria-pressed=true]{outline:2px solid #a28ae2;outline-offset:-2px}
.founding-sprite-source:disabled{cursor:default;opacity:1!important}
.founding-sprite-source[data-assigned] img,.founding-sprite-source[data-assigned]>span:last-child{opacity:.5}
.founding-sprite-source:disabled:not([data-assigned]) img{opacity:.5}
.founding-sprite-assignment{height:1.15rem;flex:none;max-width:100%;font-size:.7rem}
.founding-sprite-assignment:not(:empty){background:#0d1930;border-radius:4px;padding:0 .35rem}
.founding-sprite-pagination{display:flex;align-items:center;justify-content:space-between;gap:.25rem;min-width:0;font-size:.75rem;flex:none}
.founding-sprite-pagination button{padding:.25rem .5rem!important;font-size:.75rem;min-height:32px}
.founding-sprite-pagination span{white-space:nowrap;font-variant-numeric:tabular-nums}
.founding-sprite-page-arrow{display:none}
.founding-sprite-destinations{padding:.75rem;display:flex;flex-direction:column;gap:.65rem;min-height:0;min-width:0}
.founding-sprite-folder{display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:.4rem;min-height:0;min-width:0;flex:1;background:#0d1930;border:1px solid #394866;border-radius:.6rem;padding:.55rem}
.founding-sprite-folder:has(.founding-sprite-empty){border-style:dashed}
.founding-sprite-folder:focus-within{border-color:#a28ae2}
.founding-sprite-folder[data-drag-over=true]{border-color:#a28ae2;background:#302e56}
.founding-sprite-card{position:relative;min-width:0;min-height:0;background:#1b2b43;border:1px solid #40516f;border-radius:.4rem}
.founding-sprite-card[data-default=true]{border-color:#a28ae2}
.founding-sprite-remove{position:absolute;top:.15rem;right:.15rem;z-index:1;width:26px;min-height:26px!important;height:26px;padding:0!important}
.founding-sprite-default{height:100%;width:100%;min-width:0;min-height:0;display:flex;flex-direction:column;align-items:center;gap:.2rem;background:transparent!important;border:0!important;padding:1.65rem .25rem .4rem!important}
.founding-sprite-default img{flex:1;min-height:0;height:0;width:100%;object-fit:contain;pointer-events:none}
.founding-sprite-default small{font-size:.7rem;color:#b8c4dc;white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:.2rem}
.founding-sprite-card[data-default=true] small{color:#83dbb2}
.founding-sprite-check{background:#254c43;color:#83dbb2;border-radius:50%;display:grid;place-items:center;width:1rem;height:1rem}
.founding-sprite-empty{grid-column:1/-1;margin:0!important;align-self:center;justify-self:center;text-align:center;font-size:.8rem;color:#b8c4dc}
.founding-sprite-portrait{display:flex;flex-direction:column;gap:.75rem;min-height:0;flex:1}
.founding-sprite-portrait>div{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:1rem;flex:1;min-height:0;border:1px solid #394866;border-radius:.65rem;background:linear-gradient(#293d53 0%,#3b514e 60%,#273e38 60%);padding:.75rem}
.founding-sprite-scene-avatar{width:min(9rem,75%);aspect-ratio:1;border-radius:50%;overflow:hidden;background:#1b2b43;display:grid;place-items:center;position:relative}
.founding-sprite-scene-avatar img{width:100%;height:100%;object-fit:cover}
.founding-sprite-portrait strong{padding:.4rem .7rem;border-radius:.4rem;background:#18223c;max-width:100%;overflow-wrap:anywhere}
.founding-sprite-error{padding:.5rem .75rem;flex:none;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;color:#ffadb2;font-size:.8rem}
.founding-sprite-error p{margin:0!important}
.founding-sprite-status{padding:0 .75rem .35rem;min-height:1.35rem;flex:none;font-size:.75rem;color:#83dbb2}
@media(max-width:1100px){.founding-sprite-heading{padding:.65rem}.founding-sprite-heading h3{width:100%}.founding-sprite-library,.founding-sprite-destinations{padding:.5rem}.founding-sprite-folder{padding:.4rem}.founding-sprite-pagination button{padding:.25rem!important}}
@media(max-width:727px){.founding-sprite-pagination .founding-sprite-page-word{display:none}.founding-sprite-pagination .founding-sprite-page-arrow{display:inline}.founding-sprite-pagination button{width:2.5rem;min-height:44px}}
@media(pointer:coarse){.founding-sprite-remove{width:32px;height:32px;min-height:32px!important}.founding-sprite-default{padding-top:2rem!important}.founding-sprite-pagination button{min-height:40px}.founding-sprite-label button{min-height:36px;min-width:36px}}
`;
