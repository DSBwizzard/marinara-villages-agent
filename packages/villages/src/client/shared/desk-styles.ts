const P = "marinara-capability-villages";

export const DESK_STYLES = `
.${P}-desk-workspace{height:100%;min-height:0;display:flex;flex-direction:column;position:relative;isolation:isolate}
.${P}-desk-workspace[data-desk]:not([data-desk="none"]){--background:#f8efdd;--foreground:#362a20;--popover:#fff6e5;--muted:#e9ddc3;--muted-foreground:#6b5a49;--border:#c8b895;--primary:#5e7047;--primary-foreground:#fff9ec;--secondary:#ede1ca;color:#362a20;background:#704726 var(--desk-wood,url('/api/capability-packages/villages/assets/menu-desk.jpg')) center/cover;padding:clamp(10px,2vw,28px);box-sizing:border-box;overflow:hidden;font-family:"village-letter-assistant",system-ui,sans-serif}
.${P}-desk-header{display:flex;align-items:center;gap:clamp(20px,2.8vw,44px);flex:none;position:relative;z-index:30;margin:0 auto 18px;width:100%;max-width:1500px}
.${P}-desk-header[hidden]{display:none}
.${P}-desk-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));flex:1;min-width:0;border:8px solid transparent;border-image:var(--desk-calm-paper) 75 fill/8px stretch;padding:0 8px;filter:drop-shadow(0 4px 3px #25180c50)}
.${P}-desk-art-error{margin:0 2% 12px;padding:8px 12px;background:#fff4df;color:#6b3523;border:1px solid #b8845e;border-radius:4px}
.${P}-desk-nav button{position:relative;display:flex;align-items:center;justify-content:center;gap:clamp(8px,1vw,16px);min-height:50px;min-width:0;border:0;background:transparent;color:#382513;padding:8px;font:700 clamp(17px,1.8vw,28px)/1.2 Georgia,serif;cursor:pointer}
.${P}-desk-nav button:last-child{border-right:0}
.${P}-desk-nav button[aria-current="page"]{color:#52663b}
.${P}-desk-nav button[aria-current="page"]::after{content:"";position:absolute;bottom:0;left:15%;right:15%;height:4px;background:#526d30;border-radius:3px}
.${P}-desk-nav svg{width:clamp(26px,2.6vw,40px);height:clamp(26px,2.6vw,40px);flex:none;color:inherit;animation:none;stroke:currentColor;stroke-width:1.6;fill:none;stroke-linecap:round;stroke-linejoin:round}
.${P}-desk-workspace[data-desk] .${P}-desk-nav button svg{color:inherit!important}
.${P}-desk-nav button:nth-child(3)[aria-current="page"] svg path{fill:currentColor}
.${P}-desk-nav button:nth-child(3)[aria-current="page"] svg circle{fill:#fff3df;stroke:#fff3df}
.${P}-desk-nav button:disabled,.${P}-desk-return:disabled{cursor:default;opacity:.65}
.${P}-desk-return{min-height:44px;flex:none;border:7px solid transparent;border-image:var(--desk-olive-button) 75 fill/7px stretch;background:transparent;color:#fff9ec;padding:4px 18px;font:700 clamp(17px,1.7vw,26px)/1.2 Georgia,serif;cursor:pointer;filter:drop-shadow(0 3px 3px #25180c60)}
.${P}-desk-return-mobile{display:none}
.${P}-desk-scene{padding-inline:10px;white-space:nowrap}
.${P}-desk-workspace :is(button,input,textarea,select,summary,a):focus-visible{outline:3px solid #648096;outline-offset:3px}
.${P}-desk-stage{position:relative;flex:1;min-width:0;min-height:0}
.${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{overflow:clip;padding:46px 10px 18px}
.${P}-desk-document{height:100%;min-height:0;position:relative}
.${P}-desk-workspace:not([data-desk="none"]) .${P}-desk-document{width:94%;max-width:1420px;margin:auto}
/* Hold the departed paper offscreen until the next menu commits. */
.${P}-desk-workspace[data-phase="closing"] .${P}-desk-document{transform:translateY(calc(100% + 120px))}
.${P}-desk-workspace[data-desk="people"]{--desk-art:var(--desk-art-desktop,url('/api/capability-packages/villages/assets/people-desk.webp'))}
.${P}-desk-workspace[data-desk="projects"]{--desk-art:var(--desk-art-desktop,url('/api/capability-packages/villages/assets/desk-art/projects-desktop.webp'));--desk-art-inset:-22px -40px -24px}
.${P}-desk-workspace[data-desk="places"]{--desk-art:var(--desk-art-desktop,url('/api/capability-packages/villages/assets/desk-art/places-desktop.webp'));--desk-art-inset:0}
.${P}-desk-workspace[data-desk="places"]>.${P}-desk-stage{padding:0 0 18px}
.${P}-desk-workspace[data-desk="places"] .${P}-desk-document{width:100%;max-width:1540px;container-type:size}
.${P}-desk-workspace[data-desk="places"][data-venue="true"]{--desk-art:var(--desk-venue-desktop,url('/api/capability-packages/villages/assets/desk-art/venue-desktop.webp'))}
.${P}-desk-workspace[data-desk="mailbox"]{--desk-art:var(--desk-art-desktop,url('/api/capability-packages/villages/assets/desk-art/mailbox-desktop.webp'))}
.${P}-desk-workspace[data-desk="settings"]{--desk-art:var(--desk-art-desktop,url('/api/capability-packages/villages/assets/desk-art/settings-desktop.webp'))}
.${P}-desk-workspace[data-desk]:not([data-desk="none"]):not([data-desk="people"]) .${P}-desk-document{isolation:isolate}
.${P}-desk-workspace[data-desk]:not([data-desk="none"]):not([data-desk="people"]) .${P}-desk-document::before{content:"";position:absolute;z-index:-1;inset:var(--desk-art-inset,-22px -24px -24px);background:var(--desk-art) center/100% 100% no-repeat;pointer-events:none}
@media(min-width:701px) and (max-height:700px){
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]){padding:12px}
 .${P}-desk-header{margin-bottom:12px}
 .${P}-desk-nav button{min-height:44px}
 .${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{padding:32px 10px 10px}
 .${P}-desk-workspace[data-desk="places"]>.${P}-desk-stage{overflow-y:auto;overflow-x:clip;padding:0 0 20px}
 .${P}-desk-workspace[data-desk="places"] .${P}-desk-document{min-height:650px}
}
.${P}-desk-workspace[data-desk="settings"] .${P}-workspace-body{padding:12px 20px 52px 34px;background:transparent}
.${P}-workspace-body{display:flex;height:100%;min-height:0;min-width:0;gap:0;color:#362a20;font:16px/1.45 "village-letter-assistant",system-ui,sans-serif}
.${P}-workspace-sidebar{flex:0 0 clamp(190px,24%,300px);min-height:0;min-width:0;overflow:auto;padding:24px 20px;background:transparent;border-right:1px solid #cab68d}
.${P}-workspace-sidebar h2{margin:0 0 18px;font:700 28px/1.2 Georgia,serif}
.${P}-workspace-content{flex:1;min-height:0;min-width:0;overflow:auto;background:transparent;padding:16px 22px}
.${P}-workspace-sections{display:grid;gap:4px}
.${P}-workspace-sections button,.${P}-workspace-venues button{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:10px 4px;border:0;border-bottom:1px solid #c8b89590;border-radius:0;background:transparent;color:#362a20;font:inherit;text-align:left;cursor:pointer}
.${P}-workspace-sections button[aria-current="page"],.${P}-workspace-venues button[aria-pressed="true"]{color:#455a2c;background:#c9d1ad80}
.${P}-workspace-venues{display:grid;gap:6px}
.${P}-workspace-venues img{width:60px;height:52px;object-fit:cover;flex:none}
.${P}-workspace-venues span{min-width:0}.${P}-workspace-venues :is(strong,small){display:block;overflow-wrap:anywhere}.${P}-workspace-venues small{font-size:13px}
.${P}-workspace-section-picker,.${P}-workspace-venue-picker{display:none}
.${P}-workspace-content .${P}-root.${P}-sectioned-menu{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);height:100%;padding:0;background:transparent;color:#362a20}
.${P}-workspace-content .${P}-sectioned-menu>.${P}-header{grid-column:1;grid-row:1;background:transparent;border-color:#c8b895;padding:0 0 16px}
.${P}-workspace-content .${P}-sectioned-menu>.${P}-menu-content{grid-column:1;grid-row:2}
.${P}-workspace-content :is(.${P}-title,.${P}-panel-title){color:#362a20;font-family:Georgia,serif;font-weight:700}
.${P}-workspace-content .${P}-panel-title{font-size:22px;line-height:1.3;text-transform:none;letter-spacing:0}
.${P}-workspace-content .${P}-menu-content :is(.${P}-panel,.${P}-overlay),.${P}-workspace-content .${P}-menu-content.${P}-panel{background:transparent;color:#362a20;border-color:#c8b895;border-radius:0;box-shadow:none}
.${P}-workspace-content .${P}-menu-content{font-size:16px;line-height:1.5}
.${P}-workspace-content .${P}-menu-content :is(.${P}-label,.${P}-hint,.${P}-empty){font-size:15px}
.${P}-workspace-content :is(.${P}-label,.${P}-hint,.${P}-empty){color:#6b5a49}
.${P}-workspace-content :is(input,select,textarea){max-width:100%;min-height:44px;background:#fff7e7;color:#362a20;border:1px solid #b7a787;border-radius:3px;padding:8px;font:inherit;box-sizing:border-box}
.${P}-workspace-content input[type="checkbox"]{min-height:0;accent-color:#5e7047}
.${P}-workspace-content :is(.${P}-button,button:not([class])){min-height:44px;padding:8px 12px;background:#f4e8ce;color:#362a20;border:1px solid #b7a787;border-radius:3px;font:inherit;cursor:pointer}
.${P}-workspace-content .villages-lorebook-card,.${P}-workspace-content .villages-lorebook-action{background:#f4e8ce;color:#362a20;border-color:#c8b895}
.${P}-workspace-content .${P}-venue-profile{max-width:none;margin:0;padding:0;background:transparent;color:#362a20}
.${P}-workspace-venue-header{display:flex;align-items:start;gap:12px;position:relative;padding:0 0 20px;min-height:0;color:#362a20;background:transparent;border:0}
.${P}-workspace-venue-header>div{flex:1;min-width:0}
.${P}-workspace-venue-header .${P}-title{margin:0;color:#362a20;font:700 clamp(30px,3vw,44px)/1.15 Georgia,serif;overflow-wrap:break-word}
.${P}-venue-metadata{display:flex;flex-wrap:wrap;gap:4px 12px;margin:10px 0 0;color:#6b5a49;font-size:clamp(14px,1.3vw,18px)}
.${P}-venue-metadata>div{display:flex;min-width:0;max-width:100%}.${P}-venue-metadata>div+div::before{content:"·";margin-right:12px}
.${P}-venue-metadata dt{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.${P}-venue-metadata dd{margin:0;overflow-wrap:break-word}
.${P}-workspace-content .${P}-venue-back{display:block;order:2;flex:none;min-height:44px;padding:6px 18px;border:7px solid transparent;border-image:var(--desk-calm-paper) 75 fill/7px stretch;background:transparent;color:#382513;font:700 clamp(16px,1.6vw,24px)/1.2 Georgia,serif;cursor:pointer;filter:drop-shadow(0 2px 2px #5a391b60)}
.${P}-workspace-content .${P}-venue-back:is(:hover,:focus,:active){background:transparent;color:#382513}
.${P}-workspace-content .${P}-venue-profile-body{max-width:none;margin:0;padding:24px 0 8px}
.${P}-workspace-content .${P}-venue-sections{display:flex;gap:12px;border-bottom:1px solid #b9a480;background:transparent}
.${P}-workspace-content .${P}-venue-sections button{flex:0 1 auto;min-width:0;padding:10px 22px;border:0;border-bottom:4px solid transparent;border-radius:0;background:transparent;color:#362a20;font:700 clamp(18px,1.8vw,28px)/1.3 Georgia,serif}
.${P}-workspace-content .${P}-venue-sections button[aria-pressed="true"]{background:transparent;border-bottom-color:#667a4d;color:#52663b}
.${P}-workspace-about{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);align-items:start;gap:clamp(20px,2.5vw,36px)}
.${P}-workspace-about[data-photo="false"]{grid-template-columns:minmax(0,1fr)}
.${P}-workspace-about p{white-space:pre-wrap;overflow-wrap:anywhere}
.${P}-venue-photo{min-width:0;margin:0;border:6px solid #28251f;background:#28251f;box-shadow:0 2px 4px #50391c30}
.${P}-venue-photo img{display:block;width:100%;height:auto;max-height:420px;object-fit:contain}
.${P}-venue-summary{min-width:0;font-size:clamp(18px,1.85vw,28px);line-height:1.35}.${P}-venue-summary>p:first-child{margin-top:0}
.${P}-venue-form,.${P}-venue-capacity{color:#6b5a49;font-size:15px}
.${P}-venue-occupants{padding-top:16px;margin-top:20px;border-top:1px solid #c8b895}
.${P}-venue-occupants h2{margin:0 0 4px;font:700 24px/1.3 Georgia,serif}.${P}-venue-occupants p{margin:0}
.${P}-workspace-content .${P}-venue-primary{display:inline-block;width:auto;min-height:44px;padding:7px 24px;margin:24px 0 0;border:7px solid transparent;border-image:var(--desk-olive-button) 75 fill/7px stretch;background:transparent;color:#fff9ec;font:700 clamp(21px,2vw,30px)/1.2 Georgia,serif;filter:drop-shadow(0 2px 2px #50391c50)}
.${P}-workspace-content .${P}-venue-primary:disabled{opacity:.6;cursor:default}
.${P}-desk-workspace[data-desk="places"][data-venue="true"]>.${P}-desk-stage{padding-top:0}
.${P}-desk-workspace[data-desk="places"][data-venue="true"] .${P}-workspace-body{box-sizing:border-box;display:grid;grid-template-columns:minmax(0,21.5%) minmax(0,1fr);column-gap:4.8%;padding:calc(8.5cqh + 16px) 4.6% 9cqh 6.2%;font-family:Georgia,serif}
.${P}-desk-workspace[data-venue="true"] .${P}-workspace-sidebar{height:54cqh;box-sizing:border-box;align-self:start;border:0;padding:0}
.${P}-desk-workspace[data-venue="true"] .${P}-workspace-sidebar h2{font-size:clamp(28px,2.8vw,42px);margin:0 0 14px;padding-bottom:16px;border-bottom:1px solid #cab68d}
.${P}-desk-workspace[data-venue="true"] .${P}-workspace-content{box-sizing:border-box;height:100%;padding:0}
.${P}-desk-workspace[data-venue="true"] .${P}-workspace-venues button{justify-content:space-between;padding:12px 10px;border-radius:5px;font:700 clamp(16px,1.55vw,24px)/1.25 Georgia,serif}
@media(min-width:701px) and (max-width:1000px){
 .${P}-workspace-venue-header{flex-direction:column}
 .${P}-workspace-content .${P}-venue-back{order:0}
 .${P}-workspace-about{grid-template-columns:minmax(0,1fr)}
}
.${P}-desk-workspace[data-desk="places"] .${P}-workspace-body{padding:12px 20px;background:transparent}
.${P}-desk-workspace[data-desk="places"] .${P}-home{background:transparent;color:#382513;border:0;border-radius:0;box-shadow:none;padding:calc(8.5cqh + 16px) 4.6% 9cqh 6.2%;overflow:visible}
.${P}-desk-workspace[data-desk="places"] .${P}-home>.${P}-room{display:grid;grid-template-columns:minmax(0,21.5%) minmax(0,1fr);gap:4.8%;overflow:visible;background:transparent}
.${P}-desk-workspace[data-desk="places"] .${P}-home-bar,.${P}-desk-workspace[data-desk="places"] .${P}-explore-nav{display:none}
.${P}-desk-workspace[data-desk="places"] .${P}-home-map-paper{display:flex;flex-direction:column;grid-column:2;min-height:0;gap:16px}
.${P}-desk-workspace[data-desk="places"] .${P}-home-map-viewport{z-index:2;flex:1;min-height:0;height:auto;margin-bottom:60px;background:#28251f;border:6px solid #28251f;outline:0;border-radius:0;box-shadow:none;overflow:visible}
.${P}-desk-workspace[data-desk="places"] .${P}-home{--explore-background:#f8efdd;--explore-panel:#f8efdd;--explore-text:#382513;--explore-muted:#746b56;--explore-border:#c8b895;--explore-surface:#fff7e7;--explore-selected:#536a3d;font-family:Georgia,serif}
.${P}-desk-workspace[data-desk="places"] .${P}-location-navigator{position:relative;z-index:3;height:54cqh;min-width:0;align-self:start;padding:0;background:transparent;border:0;border-radius:0;box-shadow:none;transform:none;color:#382513}
.${P}-desk-workspace[data-desk="places"] .${P}-location-navigator header{padding:0 0 16px;margin-bottom:14px;border-bottom:1px solid #cab68d}
.${P}-desk-workspace[data-desk="places"] .${P}-location-navigator h2{font:700 clamp(28px,2.8vw,42px)/1.2 Georgia,serif;color:#382513}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-search{padding:0 0 14px}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-search input{background:#fff7e730;color:#382513;border-color:#b6a487;font:700 clamp(16px,1.4vw,22px)/1.3 Georgia,serif}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-list{display:flex;flex-direction:column}
.${P}-desk-workspace[data-desk="places"] .${P}-discover-places{order:2;margin:12px 0 0;background:transparent;font-size:14px}
.${P}-desk-workspace[data-desk="places"] .${P}-navigator-place{flex:none;border-left:0;border-bottom:1px solid #c8b89580;border-radius:4px}
.${P}-desk-workspace[data-desk="places"] .${P}-navigator-place[data-selected="true"]{background:#b9c59180}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-row{padding:14px 8px;gap:8px}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-row strong{font:700 clamp(16px,1.55vw,24px)/1.25 Georgia,serif}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-row small{display:none}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-row>svg{display:none}
.${P}-place-chevron{display:none}
.${P}-desk-workspace[data-desk="places"] .${P}-place-chevron{display:block;flex:0;font-size:28px}
.${P}-desk-workspace[data-desk="places"] .${P}-navigator-actions{padding:0 8px 12px;gap:8px}
.${P}-desk-workspace[data-desk="places"] .${P}-navigator-actions button{color:#382513;background:#fff7e7;font:700 15px/1.3 Georgia,serif}
.${P}-desk-workspace[data-desk="places"] .${P}-map-tools{position:relative;left:auto;top:auto;right:auto;flex:none;justify-content:space-between;max-width:100%;gap:12px;z-index:7}
.${P}-desk-workspace[data-desk="places"] .${P}-map-tools>button{border:0;background:transparent;padding:0;max-width:calc(100% - 64px);font:700 clamp(24px,2.8vw,42px)/1.2 Georgia,serif}
.${P}-desk-workspace[data-desk="places"] .${P}-map-tools>button>svg{display:none}
.${P}-desk-workspace[data-desk="places"] .${P}-map-tools summary,.${P}-desk-workspace[data-desk="places"] .${P}-map-camera-controls{border:6px solid transparent;border-image:var(--desk-calm-paper) 75 fill/6px stretch;background:transparent;filter:drop-shadow(0 2px 2px #50391c50)}
.${P}-desk-workspace[data-desk="places"] .${P}-map-camera-controls{right:0;bottom:-64px;padding:0;font:700 20px/1.2 Georgia,serif}
.${P}-desk-workspace[data-desk="places"] .${P}-map-label{max-width:260px;white-space:normal;color:#382513;background:#fff4df;border:1px solid #c1ab82;box-shadow:0 2px 4px #23180d60;font:700 14px/1.2 Georgia,serif}
.${P}-desk-workspace[data-desk="places"] .${P}-map-point{width:16px;height:20px;border:2px solid #fff9ec;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#526d30;box-shadow:0 1px 3px #23180d80}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-overlay{position:relative;inset:auto;height:100%;padding:0;background:transparent;z-index:auto}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog{width:100%;height:100%;max-height:100%;border:0;background:transparent;box-shadow:none;padding:38px 16px 20px;box-sizing:border-box}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header{padding:0 20px 10px}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header{color:#362a20}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header h3{margin:0;color:#362a20;font:700 36px/1.2 Georgia,serif;text-shadow:none}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header>button{color:#362a20}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-layout{padding:0 12px 12px;gap:24px}
.${P}-desk-workspace[data-desk="mailbox"] :is(.villages-letter-list,.villages-letter-paper){background:transparent;border:0;border-radius:0;box-shadow:none}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-row[aria-pressed="true"]{background:#d6dfc1;border-color:#9fae82}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog :is(button,select,input,textarea){font-family:"village-letter-assistant",system-ui,sans-serif}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-error{color:#6d261b}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-pages{container-type:size}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-signature .${P}-signature-image{max-height:min(7rem,30cqh)}
@media(min-width:701px) and (max-height:700px){
 .${P}-desk-workspace[data-desk="mailbox"]>.${P}-desk-stage{padding-top:12px}
 .${P}-desk-workspace[data-desk="mailbox"] .${P}-desk-document::before{top:-36px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog{padding:20px 16px 0}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header h3{font-size:28px}
}
@media(max-width:700px){
 .${P}-desk-workspace[data-desk="people"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/people-phone.webp'))}
 .${P}-desk-workspace[data-desk="projects"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/desk-art/projects-phone.webp'));--desk-art-inset:-28px -20px -10px}
 .${P}-desk-workspace[data-desk="places"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/desk-art/places-phone.webp'));--desk-art-inset:0}
 .${P}-desk-workspace[data-desk="places"][data-venue="true"]{--desk-art:var(--desk-venue-phone,url('/api/capability-packages/villages/assets/desk-art/venue-phone.webp'))}
 .${P}-desk-workspace[data-desk="mailbox"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/desk-art/mailbox-phone.webp'))}
 .${P}-desk-workspace[data-desk="settings"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/desk-art/settings-phone.webp'));--desk-art-inset:0}
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]):not([data-desk="people"]) .${P}-desk-document::before{inset:var(--desk-art-inset,-14px -2px -10px)}
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]){padding:8px}
 .${P}-desk-header{gap:10px;flex-wrap:wrap;margin-bottom:8px;width:100%}
 .${P}-desk-nav{flex-basis:100%;padding:0;border-width:6px}
 .${P}-desk-nav button{font-size:clamp(12px,3.6vw,17px);min-height:54px;gap:3px;flex-direction:column;padding:4px 1px 8px}
 .${P}-desk-nav svg{width:27px;height:27px}
 .${P}-desk-return{margin-left:auto;padding:3px 12px;color:#fff9ec;font-size:19px}
 .${P}-desk-return-desktop{display:none}.${P}-desk-return-mobile{display:inline}
 .${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{padding:32px 1px 8px}
 .${P}-desk-workspace:not([data-desk="none"]) .${P}-desk-document{width:100%}
 .${P}-workspace-body{flex-direction:column;font-size:16px}
 .${P}-workspace-sidebar{flex:none;overflow:visible;padding:10px 12px;border-right:0;border-bottom:1px solid #c8b895}
 .${P}-workspace-sidebar h2,.${P}-workspace-venues,.${P}-workspace-sections{display:none}
 .${P}-workspace-section-picker,.${P}-workspace-venue-picker{display:flex;align-items:center;gap:10px}
 .${P}-workspace-sidebar select{flex:1;min-width:0;min-height:44px;background:#fff7e7;color:#362a20;border:1px solid #b7a787;border-radius:3px;padding:6px;font:inherit}
 .${P}-workspace-content{padding:12px}
 .${P}-desk-workspace:is([data-desk="places"],[data-desk="settings"]) .${P}-workspace-body{padding:8px 10px}
 .${P}-desk-workspace:is([data-desk="places"],[data-desk="settings"])>.${P}-desk-stage{overflow-y:auto;overflow-x:clip;padding:16px 0 20px;overscroll-behavior:contain}
 .${P}-desk-workspace[data-desk="places"]>.${P}-desk-stage{margin-bottom:var(--villages-exploration-inset,0px)}
 .${P}-desk-workspace:is([data-desk="places"],[data-desk="settings"]) .${P}-desk-document{height:auto;min-height:100%;container-type:normal}
 .${P}-desk-workspace[data-desk="places"] .${P}-home{height:auto;min-height:0;padding:12px 0 20px;display:block}
 .${P}-desk-workspace[data-desk="places"] .${P}-home>.${P}-room{display:flex;flex-direction:column;height:auto;gap:26px;padding:0;overflow:visible}
 .${P}-desk-workspace[data-desk="places"] .${P}-home-map-paper{order:0;flex:none;gap:16px;padding:18px 14px 72px;border:8px solid transparent;border-image:var(--desk-calm-paper) 75 fill/12px stretch;filter:drop-shadow(0 4px 3px #25180c50)}
 .${P}-desk-workspace[data-desk="places"] .${P}-home-map-viewport{flex:none;width:auto;height:clamp(240px,70vw,380px);margin:0;border-width:4px}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-camera-controls{left:50%;right:auto;bottom:-64px;transform:translateX(-50%)}
 .${P}-desk-workspace[data-desk="settings"] .${P}-workspace-body{height:auto;min-height:680px;padding:30px 8% 50px 12%;gap:24px;font-family:Georgia,serif}
 .${P}-desk-workspace[data-desk="settings"] .${P}-workspace-sidebar{padding:0;border:0}
 .${P}-desk-workspace[data-desk="settings"] .${P}-workspace-sidebar h2{display:block;font-size:34px;margin:8px 0 22px;padding-bottom:16px;border-bottom:1px solid #78834f}
 .${P}-desk-workspace[data-desk="settings"] .${P}-workspace-section-picker select{border:0;border-radius:5px;background:#78834f;color:#fff9ec;font:700 19px/1.3 Georgia,serif;padding:10px;min-height:46px}
 .${P}-desk-workspace[data-desk="settings"] .${P}-workspace-content{height:auto;overflow:visible;padding:0;flex:none}
 .${P}-desk-workspace[data-desk="settings"] .${P}-sectioned-menu{display:block;height:auto}
 .${P}-desk-workspace[data-desk="settings"] .${P}-sectioned-menu[data-page="general"]>.${P}-header{display:contents}
 .${P}-desk-workspace[data-desk="settings"] .${P}-sectioned-menu[data-page="general"]>.${P}-header>:is(div,button){display:none}
 .${P}-desk-workspace[data-desk="settings"] .${P}-menu-content{padding:0;border:0;font-family:Georgia,serif}
 .${P}-desk-workspace[data-desk="settings"] .${P}-menu-content>.${P}-field:first-child>.${P}-label{font:700 25px/1.3 Georgia,serif;color:#382513;margin-bottom:8px}
 .${P}-desk-workspace[data-desk="settings"] .${P}-menu-content .${P}-row{flex-direction:column;align-items:stretch;gap:12px}
 .${P}-desk-workspace[data-desk="settings"] .${P}-menu-content .${P}-field{gap:6px;margin:0 0 16px}
 .${P}-desk-workspace[data-desk="settings"] .${P}-menu-content .${P}-row>.${P}-field{margin:0;flex:none}
 .${P}-desk-workspace[data-desk="settings"] .${P}-menu-content .${P}-label{font:700 20px/1.2 Georgia,serif;color:#382513}
 .${P}-desk-workspace[data-desk="settings"] .${P}-menu-content select{width:100%;background:#fff7e730;border:1px solid #5f503c;border-radius:5px;font:700 18px/1.2 Georgia,serif;min-height:44px;margin:0 0 6px}
 .${P}-desk-workspace[data-desk="settings"] .${P}-menu-content .${P}-send-toggle{font:700 20px/1.2 Georgia,serif;gap:10px}
 .${P}-desk-workspace[data-desk="settings"] .${P}-send-toggle span{order:-1}
 .${P}-desk-workspace[data-desk="settings"] .${P}-send-toggle input{appearance:none;position:relative;width:48px;height:28px;min-height:28px;border:1px solid #71654b;border-radius:16px;background:#c8bda7;padding:0;margin:0;cursor:pointer}
 .${P}-desk-workspace[data-desk="settings"] .${P}-send-toggle input:checked{background:#637a32;border-color:#53672b}
 .${P}-desk-workspace[data-desk="settings"] .${P}-send-toggle input::after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff7e7;box-shadow:0 1px 3px #38251360}
 .${P}-desk-workspace[data-desk="settings"] .${P}-send-toggle input:checked::after{left:23px}
 .${P}-workspace-about{grid-template-columns:minmax(0,1fr);gap:16px}
 .${P}-workspace-venue-header{flex-direction:column;gap:12px;padding:0 0 14px}
 .${P}-workspace-venue-header .${P}-title{font-size:30px}
 .${P}-workspace-content .${P}-venue-back{display:block;order:0;padding:6px 12px;font-size:20px}
 .${P}-workspace-content .${P}-venue-sections{gap:0}
 .${P}-workspace-content .${P}-venue-sections button{flex:1;padding:10px 6px;font-size:18px}
 .${P}-workspace-content .${P}-venue-profile-body{padding-top:20px}
 .${P}-venue-photo{border-width:4px}.${P}-venue-photo img{max-height:none}
 .${P}-venue-summary{font-size:20px}.${P}-venue-occupants h2{font-size:24px}
 .${P}-workspace-content .${P}-venue-primary{width:auto;box-sizing:border-box;font-size:24px;padding:8px 24px}
 .${P}-desk-workspace[data-desk="places"][data-venue="true"] .${P}-desk-document{padding-top:20px;box-sizing:border-box}
 .${P}-desk-workspace[data-desk="places"][data-venue="true"] .${P}-workspace-body{display:block;height:auto;margin:0 0 30px;padding:24px 18px 30px;border:8px solid transparent;border-image:var(--desk-calm-paper) 75 fill/14px stretch;filter:drop-shadow(0 4px 3px #25180c50)}
 .${P}-desk-workspace[data-venue="true"] .${P}-workspace-sidebar{display:none}
 .${P}-desk-workspace[data-venue="true"] .${P}-workspace-content{padding:0}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-tools{left:auto;right:auto;max-width:100%;justify-content:space-between}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-tools>button{font-size:24px;max-width:calc(100% - 52px)}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-tools>button>span:first-of-type{white-space:normal;overflow:visible;text-overflow:clip}
 .${P}-desk-workspace[data-desk="places"] .${P}-location-navigator[data-layout="navigator-sheet"]{z-index:3;flex:none;width:auto;height:auto;max-height:none;align-self:stretch;padding:20px 14px;transform:none;border:8px solid transparent;border-image:var(--desk-calm-paper) 75 fill/12px stretch;box-shadow:none;background:transparent;filter:drop-shadow(0 4px 3px #25180c50)}
 .${P}-desk-workspace[data-desk="places"] .${P}-location-navigator .${P}-explore-list{overflow:visible}
 .${P}-desk-workspace[data-desk="places"] .${P}-explore-row>svg{display:block;width:24px;height:24px}
 .${P}-desk-workspace[data-desk="places"] .${P}-explore-row strong{font-size:20px}
 .${P}-desk-workspace[data-desk="places"] .${P}-explore-marker:not([data-selected="true"]) .${P}-map-label{display:none}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog{padding:20px 12px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header h3{font-size:30px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header{padding:0 8px 8px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-letter-layout{padding:0 3px 7px}
}
@media(max-width:700px) and (max-height:700px){
 .${P}-desk-header{gap:4px;margin-bottom:4px}
 .${P}-desk-nav button{min-height:44px;gap:2px;padding:2px 1px 6px}
 .${P}-desk-nav svg{width:24px;height:24px}
 .${P}-desk-return{font-size:17px;padding:2px 10px}
 .${P}-desk-workspace[data-desk="mailbox"]>.${P}-desk-stage{padding-top:10px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog{padding:12px 10px 0}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header h3{font-size:26px}
}
`;
