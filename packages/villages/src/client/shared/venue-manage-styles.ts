import { ELEMENT_TAG as P } from "./constants.js";

export const VENUE_MANAGE_STYLES = `
.${P}-venue-profile .villages-profile-title-row>h1{flex:1}
.${P}-venue-profile .villages-manage .villages-manage-form,.${P}-venue-profile .villages-manage.villages-access-panel>fieldset{grid-template-columns:minmax(0,1fr)}
.${P}-venue-profile .villages-arrangement-summary .${P}-venue-zone-caption>small{margin-inline-start:auto;padding-inline-start:12px;font:inherit}
.${P}-venue-profile .villages-access-hours button{background:var(--menu-field);color:var(--venue-ink);border:1px solid var(--menu-control-border);border-radius:5px;min-height:44px;padding:6px 12px;font:inherit}
.villages-access-hours .villages-access-days{display:flex;flex-wrap:nowrap;gap:4px}.villages-access-hours .villages-access-days button{flex:1;min-width:0;padding:5px 2px;font-size:14px}.villages-access-hours .villages-access-days button[aria-pressed=true]{background:var(--menu-selected);border-color:var(--menu-selected-border)}.villages-hours-actions{grid-column:1/-1;display:flex;justify-content:space-between;gap:12px}
.villages-profile-title-row{display:flex;align-items:center;justify-content:space-between;gap:16px;min-width:0}.villages-profile-title-row>h1{min-width:0;flex:1}.villages-profile-title-row>button{flex:none;font:inherit!important;font-size:16px!important;min-height:44px!important;padding:7px 12px!important}.villages-profile-fallback{display:grid;place-items:center;background:var(--menu-field)}.villages-profile-fallback svg{width:46px;height:46px}.villages-visitor-roles{margin-top:20px}.villages-arrangement-summary .${P}-venue-zone-caption>small{margin-inline-start:auto;padding-inline-start:14px;font:inherit}.villages-manage .villages-access-hours button{justify-self:start;font:inherit;color:var(--venue-ink,var(--foreground));background:var(--menu-field);border:1px solid var(--menu-control-border,var(--border));border-radius:4px;min-height:44px;padding:7px 12px}

.${P}-venue-profile .villages-manage{display:block;width:100%;max-width:none;min-width:0;font:inherit}
.villages-manage h2{font:500 clamp(22px,2cqw,28px)/1.3 var(--menu-font);margin:0 0 16px}
.villages-manage-heading{gap:8px;margin-bottom:18px}.villages-manage-heading h2{margin:0;font-size:24px}
.villages-manage-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.villages-manage-title-row>button{font-size:17px!important;min-height:44px!important;padding:6px 12px!important}
.villages-manage-heading .${P}-venue-back{font-size:18px}
.villages-manage .villages-manage-people{height:auto;container-type:normal;font:inherit;overflow:visible}
.villages-manage .${P}-directory-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,144px));grid-template-rows:auto;justify-content:start;gap:12px}
.villages-manage .${P}-directory-card{min-height:156px!important;padding:10px!important;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px}
.villages-manage .${P}-avatar{width:88px;height:88px;flex:none;font-size:34px;border-radius:5px}
.villages-manage .${P}-directory-card strong{font-size:18px;line-height:1.35;overflow-wrap:anywhere}
.villages-manage .${P}-directory-pagination{display:flex;justify-content:space-between;align-items:center;margin-top:18px;gap:15px;font-size:17px}
.villages-manage .${P}-directory-pagination button{min-height:44px}
.villages-manage :is(button,input,select,textarea){color:var(--venue-ink,var(--foreground));font:inherit}
.villages-manage :is(.villages-manage-actions button,.villages-manage-title-row>button,.villages-work-fields button){background:var(--menu-field,var(--secondary));border-color:var(--menu-control-border,var(--border));min-height:44px}
.villages-manage label{display:flex;flex-direction:column;align-items:stretch;min-width:0;gap:6px;text-align:left}
.villages-manage label>span{align-self:flex-start}
.villages-manage :is(input:not([type=checkbox]),select,textarea){width:100%;min-width:0;min-height:44px;box-sizing:border-box;padding:8px 10px;background:var(--menu-field);border:1px solid var(--menu-control-border,var(--border));border-radius:4px}
.villages-manage input[type=time]{font-size:16px;padding-inline:6px}
.villages-manage textarea{min-height:90px}.villages-manage fieldset{display:block;border:0;min-width:0;margin:0;padding:0}
.villages-manage .villages-manage-form{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;max-width:36rem}
.villages-manage .villages-home-fields{max-width:25rem}.villages-manage:has(.villages-home-fields) .villages-manage-actions{max-width:25rem}.villages-person-arrangements{max-width:36rem}.${P}-dossier-root .villages-person-arrangements .${P}-venue-back{font:inherit;text-decoration:none;min-height:44px;margin:0 0 16px;padding:4px 0;border:0;background:transparent;color:inherit}
.${P}-venue-profile .villages-arrangement-summary{grid-template-columns:minmax(0,1fr);gap:0;margin-block:18px;max-width:22rem}.${P}-venue-profile .villages-arrangement-summary button{display:flex;flex-wrap:nowrap;min-height:44px;border-radius:0;padding:8px 34px 8px 12px;border:0;border-inline-start:3px solid var(--venue-accent,var(--border));border-bottom:1px solid var(--menu-control-border,var(--border));background:var(--menu-field)}.${P}-venue-profile .villages-arrangement-summary .${P}-venue-zone-thumb{display:none}.${P}-venue-profile .villages-arrangement-summary .${P}-venue-zone-caption{display:contents}
.villages-manage-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-top:22px}
.villages-manage button.villages-manage-primary{background:var(--primary);color:var(--primary-foreground);border-color:var(--primary)}
.${P}-venue-zone-list .villages-people-actions{margin-bottom:8px}.villages-people-actions{display:flex;justify-content:flex-end;margin-bottom:18px}.villages-person-heading{display:flex;align-items:center;gap:14px;margin:18px 0}.villages-person-heading h2{margin:0;flex:1}.villages-manage .villages-person-heading .${P}-avatar{width:56px;height:56px}.villages-person-heading>button{font-size:16px;min-height:44px}.villages-manage-remove{margin-top:16px}
.villages-manage .villages-manage-check{display:flex;flex-direction:row;align-items:center;gap:10px;min-height:32px}
.villages-manage input[type=checkbox]{flex:none;width:20px;height:20px;min-height:0;margin:0;accent-color:var(--primary)}
.villages-manage-empty{margin:14px 0}.villages-manage-details{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px 18px;margin:16px 0}.villages-manage-details dd{margin:0;overflow-wrap:anywhere}
.villages-work-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:14px 18px}
.villages-manage .villages-work-fields label{flex-wrap:nowrap;margin:0}
.villages-work-fields>:is(.villages-work-days,.villages-work-times,.villages-work-access){grid-column:1/-1}.villages-work-fields .villages-work-day-buttons{display:flex;gap:4px;margin-top:6px}
.villages-work-fields .villages-work-day-buttons button{flex:1;min-width:0;min-height:44px;padding:5px 2px;font-size:14px}
.villages-work-fields .villages-work-day-buttons button[aria-pressed=true]{background:var(--menu-selected);border-color:var(--menu-selected-border);color:var(--venue-ink,var(--foreground))}
.villages-work-times{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr));gap:10px;align-self:start}
.villages-work-access legend{margin-bottom:7px}.villages-manage .villages-work-access .villages-manage-check{flex-direction:row;align-items:flex-start;font-size:15px;min-height:28px;margin:4px 0}.villages-work-access .villages-manage-check>span{flex:1;min-width:0;overflow-wrap:anywhere}.villages-work-access input[type=checkbox]{margin-top:2px}
.villages-work-offer{padding:16px 0;border-top:1px solid var(--border)}.villages-work-offer h3{font-size:22px;margin:0 0 12px}
.villages-manage .villages-access-panel{width:100%;max-width:none}.villages-manage .villages-access-panel>fieldset{margin-top:18px}
.villages-access-hours{display:grid;gap:12px}.villages-access-hours>fieldset{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 14px}.villages-access-days{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:10px}.villages-manage .villages-access-days label{display:flex;flex-direction:row;align-items:center;gap:4px;font-size:15px}.villages-access-hours legend{margin:8px 0}.villages-access-hours>fieldset>button{justify-self:start}.villages-manage.villages-access-panel>fieldset{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;border:0;padding:0}.villages-manage.villages-access-panel label{display:flex;flex-direction:column;align-items:stretch}.villages-manage.villages-access-panel label:has(input[type=checkbox]){flex-direction:row;align-items:center}.villages-manage.villages-access-panel :is(select,input[type=time]){background:var(--menu-field);color:var(--venue-ink);min-height:44px}.villages-access-panel>nav{margin-top:22px}
.${P}-workspace-venue-header form{margin:0}.${P}-venue-profile .${P}-workspace-venue-header h1 input[aria-label="Zone name"]{font:inherit;color:inherit;background:transparent;border:0;border-radius:0;padding:0;margin:0;min-width:0;min-height:44px;width:100%;outline:none}.${P}-venue-profile .${P}-workspace-venue-header h1 input[aria-label="Zone name"]:focus-visible{box-shadow:0 2px var(--primary)}
.villages-zone-fields{margin-bottom:18px}.villages-zone-fields textarea{resize:vertical}.villages-zone-fields label:last-child textarea{min-height:72px}
.${P}-zone-artwork h3{font:inherit;font-weight:500;margin:14px 0 8px}.${P}-zone-image-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-width:25rem}.${P}-zone-image-actions>button{font:inherit;color:inherit;min-height:44px;padding:8px 10px;background:var(--menu-field);border:1px solid var(--menu-control-border,var(--border));border-radius:5px}.${P}-zone-image-actions>input{display:none}.villages-room-assignment{margin-bottom:20px}
@container village-desk (max-width:700px){
 .villages-manage-heading h2{font-size:22px}.villages-manage-title-row>button{font-size:15px!important}
 .villages-manage .${P}-avatar{width:80px;height:80px}
 .villages-work-fields .villages-work-day-buttons button{font-size:11px}
 .villages-work-times{gap:14px}.villages-manage label{font-size:16px}.villages-manage .${P}-directory-card strong{font-size:18px}
}
`;
