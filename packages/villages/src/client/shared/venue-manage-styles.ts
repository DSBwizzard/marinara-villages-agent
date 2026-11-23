import { ELEMENT_TAG as P } from "./constants.js";

export const VENUE_MANAGE_STYLES = `
.${P}-venue-profile[data-manage] .${P}-venue-profile-body{width:min(59%,40rem)}
.${P}-venue-profile[data-manage][data-storybook-daylight]::before{content:"";background:linear-gradient(90deg,#e3eee4fa 0%,#d4e7dff2 42%,#d4e7dfc4 58%,transparent 85%)}
.${P}-venue-profile .villages-manage{display:block;width:100%;max-width:none;min-width:0;font:inherit;line-height:1.5}
.villages-manage h2{font:500 clamp(22px,2cqw,28px)/1.3 var(--menu-font);margin:0 0 16px}
.villages-manage .villages-manage-menu{max-width:none;display:flex;flex-direction:column;gap:0}
.villages-manage-menu>button{width:100%;min-height:74px!important;padding-block:16px!important}
.villages-manage-menu .${P}-venue-zone-thumb{display:none!important}
.villages-manage-menu .${P}-venue-zone-caption{font-size:23px}
.villages-manage-heading{gap:20px;margin-bottom:22px}.villages-manage-heading h2{margin:0;font-size:24px}
.villages-manage-heading .${P}-venue-back{font-size:18px}
.villages-manage .villages-manage-people{height:auto;container-type:normal;font:inherit;overflow:visible}
.villages-manage-list-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0 0 20px}
.villages-manage-list-heading h2{margin:0}.villages-manage-list-heading>button{font-size:17px!important;min-height:44px!important;padding:6px 12px!important}
.villages-manage .${P}-directory-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:auto;gap:16px}
.villages-manage .${P}-directory-card{min-height:142px!important;padding:12px!important;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px}
.villages-manage .${P}-avatar{width:76px;height:76px;flex:none;font-size:34px;border-radius:5px}
.villages-manage .${P}-directory-card strong{font-size:21px;line-height:1.35;overflow-wrap:anywhere}
.villages-manage .${P}-directory-pagination{display:flex;justify-content:space-between;align-items:center;margin-top:18px;gap:15px;font-size:17px}
.villages-manage .${P}-directory-pagination button{min-height:44px}
.villages-manage :is(button,input,select,textarea){color:var(--venue-ink,var(--foreground));font:inherit}
.villages-manage button{background:var(--menu-field,var(--secondary));border-color:var(--menu-control-border,var(--border));min-height:44px}
.villages-manage label{display:flex;flex-direction:column;align-items:stretch;min-width:0;gap:6px;text-align:left}
.villages-manage label>span{align-self:flex-start}
.villages-manage :is(input:not([type=checkbox]),select,textarea){width:100%;min-width:0;min-height:44px;box-sizing:border-box;padding:8px 10px;background:var(--menu-field);border:1px solid var(--menu-control-border,var(--border));border-radius:4px}
.villages-manage input[type=time]{font-size:16px;padding-inline:6px}
.villages-manage textarea{min-height:90px}.villages-manage fieldset{display:block;border:0;min-width:0;margin:0;padding:0}
.villages-manage-form{display:grid;gap:16px;max-width:36rem}
.villages-manage-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-top:22px}
.villages-manage .villages-manage-primary{background:var(--primary);color:var(--primary-foreground);border-color:var(--primary)}
.villages-manage .villages-manage-check{display:flex;flex-direction:row;align-items:center;gap:10px;min-height:32px}
.villages-manage input[type=checkbox]{flex:none;width:20px;height:20px;min-height:0;margin:0;accent-color:var(--primary)}
.villages-manage-empty{margin:14px 0}.villages-manage-details{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px 18px;margin:16px 0}.villages-manage-details dd{margin:0;overflow-wrap:anywhere}
.villages-work-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px}
.villages-work-fields>.villages-work-days{grid-column:1/-1}.villages-work-fields .villages-work-day-buttons{display:flex;gap:4px;margin-top:6px}
.villages-work-fields .villages-work-day-buttons button{flex:1;min-width:0;min-height:44px;padding:5px 2px;font-size:14px}
.villages-work-fields .villages-work-day-buttons button[aria-pressed=true]{background:var(--menu-selected);border-color:var(--menu-selected-border);color:var(--venue-ink,var(--foreground))}
.villages-work-times{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-self:start}
.villages-work-access legend{margin-bottom:7px}.villages-work-access .villages-manage-check{font-size:15px;min-height:28px;margin:4px 0}
.villages-work-offer{padding:16px 0;border-top:1px solid var(--border)}.villages-work-offer h3{font-size:22px;margin:0 0 12px}
.villages-manage .villages-access-panel{width:100%;max-width:none}.villages-manage .villages-access-panel>fieldset{margin-top:18px}
@container village-desk (max-width:700px){
 .${P}-venue-profile[data-manage] .${P}-venue-profile-body{width:min(100%,36rem)}
 .villages-manage-menu>button{min-height:64px!important}.villages-manage-menu .${P}-venue-zone-caption{font-size:20px}
 .villages-manage-heading{gap:14px}.villages-manage-heading h2{font-size:22px}.villages-manage-list-heading>button{font-size:15px!important}
 .villages-manage .${P}-directory-card{min-height:130px!important}.villages-manage .${P}-avatar{width:64px;height:64px}
 .villages-work-fields{grid-template-columns:minmax(0,1fr)}.villages-work-fields>.villages-work-days{grid-column:auto}.villages-work-fields .villages-work-day-buttons button{font-size:11px}
 .villages-work-times{gap:14px}.villages-manage label{font-size:16px}.villages-manage .${P}-directory-card strong{font-size:18px}
}
`;
