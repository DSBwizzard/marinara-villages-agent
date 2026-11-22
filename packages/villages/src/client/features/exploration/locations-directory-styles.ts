import { ELEMENT_TAG as P } from "../../shared/constants.js";

export const LOCATIONS_DIRECTORY_STYLES = `
.${P}-locations-directory{display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;color:inherit;font:inherit}
.${P}-locations-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 8px 20px 0;scrollbar-gutter:stable}
.${P}-locations-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px}
.${P}-locations-header .${P}-storybook-heading{font-size:clamp(32px,4.5cqw,56px)}
.${P}-locations-directory button,.${P}-locations-directory input,.${P}-locations-directory select{font:inherit;min-height:44px;color:inherit}
.${P}-locations-directory input,.${P}-locations-directory select{background:var(--menu-field,var(--popover));border:1px solid var(--menu-field-border,var(--border));border-radius:8px;padding:9px 12px;min-width:0;max-width:100%}
.${P}-locations-directory button{cursor:pointer}
.${P}-locations-directory button:disabled{cursor:default;opacity:.55}
.${P}-locations-directory .${P}-locations-map{display:flex;align-items:center;gap:8px;background:transparent;border:1px solid var(--menu-field-border,var(--border));border-radius:8px;padding:6px 14px}
.${P}-locations-map svg{width:22px;height:22px}
.${P}-locations-map-filter{display:block;margin:0 0 20px;max-width:100%}
.${P}-locations-map-filter select{max-width:min(100%,30rem)}
.${P}-locations-search{display:block;position:relative;margin-bottom:16px}
.${P}-locations-search input{width:100%;padding-left:46px}
.${P}-locations-search svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;pointer-events:none}
.${P}-locations-filters{display:flex;border-bottom:1px solid var(--border);margin:0 0 20px;gap:12px}
.${P}-locations-filters button{display:flex;align-items:center;justify-content:center;gap:8px;min-width:0;flex:1;padding:8px 10px;border:0;border-bottom:3px solid transparent;border-radius:0;background:transparent;color:inherit}
.${P}-locations-filters button[aria-pressed="true"]{border-bottom-color:var(--menu-sage,var(--foreground));background:var(--menu-field,var(--secondary));font-weight:600}
.${P}-locations-filters small{color:var(--muted-foreground);font-size:.85em}
.${P}-locations-discover{padding:14px 16px;margin:0 0 22px;background:var(--menu-selected,var(--secondary));border-radius:10px;display:flex;align-items:center;gap:18px}
.${P}-locations-discover>label{font-weight:600;flex:none}
.${P}-locations-discover>div{display:flex;flex:1;gap:10px;min-width:0}
.${P}-locations-discover input{width:100%;flex:1}
.${P}-locations-discover button{flex:none;padding:8px 24px;background:var(--primary);color:var(--primary-foreground);border:1px solid var(--menu-control-border,var(--border));border-radius:7px}
.${P}-locations-group{margin-bottom:26px}
.${P}-locations-group>header{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 6px}
.${P}-locations-group h2{font-size:26px;line-height:1.2;margin:0}
.${P}-locations-group>header>small{color:var(--muted-foreground)}
.${P}-locations-group ul{list-style:none;padding:0;margin:0}
.${P}-locations-group li{margin:0;padding:0;border-bottom:1px solid var(--border)}
.${P}-locations-group li>button{display:grid;grid-template-columns:30px minmax(0,1fr) auto 20px;align-items:center;gap:16px;width:100%;min-height:64px;padding:10px 12px;border:0;border-radius:5px;background:transparent;color:inherit;text-align:left}
.${P}-locations-group li>button:hover:not(:disabled){background:var(--menu-field,var(--secondary))}
.${P}-locations-group li>button>svg{width:26px;height:26px}
.${P}-location-caption{display:flex;align-items:baseline;flex-wrap:wrap;gap:3px 24px;min-width:0;overflow-wrap:anywhere}
.${P}-location-caption strong{font-weight:600;font-size:20px}
.${P}-location-caption>small{font-size:15px;color:var(--muted-foreground)}
.${P}-location-status{display:flex;align-items:center;gap:8px;color:var(--muted-foreground);font-size:15px}
.${P}-venue-badge{display:inline-block;border:1px solid var(--menu-field-border,var(--border));background:var(--menu-selected,var(--secondary));border-radius:12px;padding:1px 12px;font-weight:600;color:var(--foreground)}
.${P}-location-chevron{font-size:28px;line-height:1}
.${P}-locations-pagination{display:flex;flex:none;align-items:center;justify-content:space-between;gap:10px;padding:10px 8px 8px 0;border-top:1px solid var(--border);font-size:16px}
.${P}-locations-pagination>div{display:flex;gap:8px}
.${P}-locations-pagination button{padding:6px 16px;min-height:44px;border:1px solid var(--menu-field-border,var(--border));border-radius:7px;background:var(--secondary);color:inherit}
.${P}-locations-pagination button:last-child{background:var(--primary);color:var(--primary-foreground)}
@container village-desk (max-width:1000px){.${P}-locations-discover{flex-direction:column;align-items:stretch;gap:8px}}
@container village-desk (max-width:700px){
 .${P}-locations-header{margin-bottom:10px}.${P}-locations-header .${P}-storybook-heading{font-size:32px}
 .${P}-locations-header .${P}-directory-flourish{display:none}
 .${P}-locations-map-filter{margin-bottom:12px}.${P}-locations-map-filter select{font-size:16px;min-height:40px}
 .${P}-locations-filters{gap:2px;margin-bottom:14px}.${P}-locations-filters button{flex-wrap:wrap;column-gap:6px;padding:6px 3px;font-size:15px;line-height:1.2}
 .${P}-locations-discover{padding:10px 12px;margin-bottom:16px;gap:6px;font-size:16px}
 .${P}-locations-discover>div{gap:6px}.${P}-locations-discover button{padding-inline:12px}
 .${P}-locations-group h2{font-size:23px}
 .${P}-locations-group li>button{grid-template-columns:25px minmax(0,1fr) auto 12px;gap:9px;padding:10px 4px}
 .${P}-location-caption{display:block}.${P}-location-caption strong{display:block;font-size:17px;line-height:1.3}.${P}-location-caption>small{display:block;font-size:13px;margin-top:3px}
 .${P}-location-status{font-size:12px;max-width:6rem;overflow-wrap:anywhere}.${P}-venue-badge{padding-inline:7px}
 .${P}-locations-pagination{font-size:13px;gap:5px;padding-top:8px}.${P}-locations-pagination>div{gap:5px}.${P}-locations-pagination button{padding-inline:10px;font-size:14px}
}
`;
