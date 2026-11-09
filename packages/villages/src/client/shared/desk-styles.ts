const P = "marinara-capability-villages";

export const DESK_STYLES = `
.${P}-desk-workspace{height:100%;min-height:0;display:flex;flex-direction:column;position:relative;isolation:isolate}
.${P}-desk-workspace[data-desk]:not([data-desk="none"]){--background:#f8efdd;--foreground:#362a20;--popover:#fff6e5;--muted:#e9ddc3;--muted-foreground:#6b5a49;--border:#c8b895;--primary:#5e7047;--primary-foreground:#fff9ec;--secondary:#ede1ca;color:#362a20;background:#704726 url('/api/capability-packages/villages/assets/menu-desk.jpg') center/cover;padding:clamp(10px,2vw,28px);box-sizing:border-box;overflow:hidden;font-family:"village-letter-assistant",system-ui,sans-serif}
.${P}-desk-header{display:flex;align-items:center;gap:clamp(20px,4vw,70px);flex:none;position:relative;z-index:30;margin:0 auto 30px;width:96%;max-width:1380px}
.${P}-desk-header[hidden]{display:none}
.${P}-desk-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));flex:1;min-width:0;box-shadow:0 5px 10px #25180c70;border:1px solid #ead9b9;border-radius:9px;background:linear-gradient(#fff8e950,#fff8e950),url('/api/capability-packages/villages/assets/paper-ivory.webp') center/768px;padding:5px 12px}
.${P}-desk-nav button{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;min-height:52px;min-width:0;border:0;background:transparent;color:#362a20;padding:8px;font:500 clamp(16px,1.5vw,21px)/1.3 "village-letter-assistant",system-ui,sans-serif;cursor:pointer}
.${P}-desk-nav button:last-child{border-right:0}
.${P}-desk-nav button[aria-current="page"]{color:#52663b}
.${P}-desk-nav button[aria-current="page"]::after{content:"";position:absolute;bottom:0;left:10%;right:10%;height:3px;background:#65764a;border-radius:2px}
.${P}-desk-nav svg{width:29px;height:29px;flex:none;color:inherit;animation:none;stroke:currentColor;stroke-width:1.7;fill:none;stroke-linecap:round;stroke-linejoin:round}
.${P}-desk-workspace[data-desk] .${P}-desk-nav button svg{color:inherit!important}
.${P}-desk-nav button:disabled,.${P}-desk-return:disabled{cursor:default;opacity:.65}
.${P}-desk-return{min-height:44px;flex:none;border:1px solid #596a38;border-radius:8px;background:linear-gradient(#77894c,#60733e);color:#fff9ec;padding:12px 22px;font:500 20px/1.3 "village-letter-assistant",system-ui,sans-serif;cursor:pointer;box-shadow:0 3px 7px #25180c60}
.${P}-desk-return-mobile{display:none}
.${P}-desk-scene{background:transparent;border:0;box-shadow:none;padding:8px;color:#fff9ec;white-space:nowrap}
.${P}-desk-workspace :is(button,input,textarea,select,summary,a):focus-visible{outline:3px solid #648096;outline-offset:3px}
.${P}-desk-stage{position:relative;flex:1;min-width:0;min-height:0}
.${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{overflow:clip;padding:46px 10px 18px}
.${P}-desk-document{height:100%;min-height:0;position:relative}
.${P}-desk-workspace:not([data-desk="none"]) .${P}-desk-document{width:94%;max-width:1420px;margin:auto}
/* Hold the departed paper offscreen until the next menu commits. */
.${P}-desk-workspace[data-phase="closing"] .${P}-desk-document{transform:translateY(calc(100% + 120px))}
.${P}-desk-workspace[data-desk="projects"]{--desk-art:url('/api/capability-packages/villages/assets/desk-art/projects-desktop.webp');--desk-art-inset:-22px -40px -24px}
.${P}-desk-workspace[data-desk="places"]{--desk-art:url('/api/capability-packages/villages/assets/desk-art/places-desktop.webp')}
.${P}-desk-workspace[data-desk="mailbox"]{--desk-art:url('/api/capability-packages/villages/assets/desk-art/mailbox-desktop.webp')}
.${P}-desk-workspace[data-desk="settings"]{--desk-art:url('/api/capability-packages/villages/assets/desk-art/settings-desktop.webp')}
.${P}-desk-workspace[data-desk]:not([data-desk="none"]):not([data-desk="people"]) .${P}-desk-document{isolation:isolate}
.${P}-desk-workspace[data-desk]:not([data-desk="none"]):not([data-desk="people"]) .${P}-desk-document::before{content:"";position:absolute;z-index:-1;inset:var(--desk-art-inset,-22px -24px -24px);background:var(--desk-art) center/100% 100% no-repeat;pointer-events:none}
@media(min-width:701px) and (max-height:700px){
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]){padding:12px}
 .${P}-desk-header{margin-bottom:12px}
 .${P}-desk-nav button{min-height:44px}
 .${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{padding:32px 10px 10px}
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
.${P}-workspace-venue-header{position:relative;isolation:isolate;overflow:hidden;min-height:140px;padding:18px;color:#fff9ec;background:#403d2c}
.${P}-workspace-venue-header img{position:absolute;z-index:-2;inset:0;width:100%;height:100%;object-fit:cover}
.${P}-workspace-venue-header::before{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,#262515df,transparent)}
.${P}-workspace-venue-header .${P}-title{color:#fff9ec}
.${P}-workspace-content .${P}-venue-profile-body{max-width:none;margin:0;padding:16px 0}
.${P}-workspace-content .${P}-venue-sections{border-color:#c8b895}
.${P}-workspace-content .${P}-venue-sections button{color:#362a20;background:transparent;border-color:#c8b895}
.${P}-workspace-content .${P}-venue-sections button[aria-pressed="true"]{background:#d1d9b7;color:#344522}
.${P}-workspace-about{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:24px}
.${P}-workspace-about p{white-space:pre-wrap;overflow-wrap:anywhere}
.${P}-workspace-facts{border-left:1px solid #c8b895;padding-left:20px}
.${P}-workspace-facts dl{margin:0}.${P}-workspace-facts dl>div{display:grid;grid-template-columns:minmax(60px,.75fr) minmax(0,1.25fr);gap:8px;padding:8px 0;border-bottom:1px solid #c8b895}
.${P}-workspace-facts dd{margin:0;overflow-wrap:anywhere}
.${P}-desk-workspace[data-desk="places"] .${P}-workspace-body{padding:12px 20px;background:transparent}
.${P}-desk-workspace[data-desk="places"] .${P}-home{background:transparent;color:#362a20;border:0;border-radius:0;box-shadow:none;padding:clamp(16px,4vh,48px) clamp(16px,3vw,50px) clamp(36px,7vh,82px) clamp(12px,1.5vw,24px);overflow:visible}
.${P}-desk-workspace[data-desk="places"] .${P}-home>.${P}-room{gap:clamp(18px,2.5vw,42px);overflow:visible;background:transparent}
.${P}-desk-workspace[data-desk="places"] .${P}-home-bar,.${P}-desk-workspace[data-desk="places"] .${P}-explore-nav{display:none}
.${P}-desk-workspace[data-desk="places"] .${P}-home-map-viewport{z-index:2;background:#fffdf7;border:clamp(6px,.85vw,14px) solid #fffdf7;outline:1px solid #77684f;border-radius:0;box-shadow:0 10px 26px #21180f85,0 2px 5px #21180f65}
.${P}-desk-workspace[data-desk="places"] .${P}-home{--explore-background:#f5ead1;--explore-panel:#f5ead1;--explore-text:#362a20;--explore-muted:#6b5a49;--explore-border:#c8b895;--explore-surface:#fff7e7;--explore-selected:#536a3d;font-family:"village-letter-assistant",system-ui,sans-serif}
.${P}-desk-workspace[data-desk="places"] .${P}-location-navigator{position:relative;z-index:1;flex:0 0 clamp(210px,24%,335px);height:calc(100% - clamp(80px,9vh,130px));align-self:flex-start;background:#fbfcf7;border:1px solid #a9b5a0;border-radius:2px;box-shadow:0 5px 15px #30201965;transform:rotate(-.65deg);--explore-text:#29382b;--explore-muted:#65715c;--explore-border:#b5c0ae;--explore-surface:#f7faf1;color:var(--explore-text)}
.${P}-desk-workspace[data-desk="places"] .${P}-location-navigator h2{font:700 29px/1.3 Georgia,serif;color:#34452d}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-search input{background:#fff;color:#29382b;border-color:#a7b69c}
.${P}-desk-workspace[data-desk="places"] .${P}-navigator-place{border-bottom-color:#d4ddcd}
.${P}-desk-workspace[data-desk="places"] .${P}-map-camera-controls{background:#fff7e7}
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
 .${P}-desk-workspace[data-desk="projects"]{--desk-art:url('/api/capability-packages/villages/assets/desk-art/projects-phone.webp');--desk-art-inset:-28px -20px -10px}
 .${P}-desk-workspace[data-desk="places"]{--desk-art:url('/api/capability-packages/villages/assets/desk-art/places-phone.webp')}
 .${P}-desk-workspace[data-desk="mailbox"]{--desk-art:url('/api/capability-packages/villages/assets/desk-art/mailbox-phone.webp')}
 .${P}-desk-workspace[data-desk="settings"]{--desk-art:url('/api/capability-packages/villages/assets/desk-art/settings-phone.webp')}
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]):not([data-desk="people"]) .${P}-desk-document::before{inset:var(--desk-art-inset,-14px -2px -10px)}
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]){padding:8px}
 .${P}-desk-header{gap:4px;flex-wrap:wrap;margin-bottom:5px;width:100%}
 .${P}-desk-nav{flex-basis:100%;padding:3px 1px}
 .${P}-desk-nav button{font-size:12px;min-height:50px;gap:3px;flex-direction:column;padding:5px 1px}
 .${P}-desk-nav svg{width:20px;height:20px}
 .${P}-desk-return{margin-left:auto;padding:4px 8px;background:transparent;border:0;box-shadow:none;color:#fff9ec;font-size:14px}
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
 .${P}-desk-workspace[data-desk="places"] .${P}-home{padding:12px 6px 42px}
 .${P}-desk-workspace[data-desk="places"] .${P}-home>.${P}-room{gap:0}
 .${P}-desk-workspace[data-desk="places"] .${P}-home-map-viewport{border-width:6px;box-shadow:0 5px 14px #21180f75}
 .${P}-desk-workspace[data-desk="settings"] .${P}-workspace-body{padding-bottom:36px}
 .${P}-workspace-about{grid-template-columns:minmax(0,1fr);gap:16px}
 .${P}-workspace-facts{border:0;padding:0}
 .${P}-workspace-venue-header{min-height:110px;padding:12px}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-tools{left:8px;right:8px;max-width:none;justify-content:space-between;pointer-events:none}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-tools>*{pointer-events:auto}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-tools>button{max-width:45%}
 .${P}-desk-workspace[data-desk="places"] .${P}-location-navigator[data-layout="navigator-sheet"]{z-index:8;flex:0 1 auto;height:auto;align-self:stretch;transform:none;border:1px solid #a9b5a0;border-radius:0;box-shadow:0 -3px 12px #30201935;background:#fbfcf7;max-height:calc(52% + var(--villages-exploration-inset,0px))}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog{padding:20px 12px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header h3{font-size:30px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header{padding:0 8px 8px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-letter-layout{padding:0 3px 7px}
}
@media(max-width:700px) and (max-height:700px){
 .${P}-desk-workspace[data-desk="places"] .${P}-home{padding-bottom:24px}
 .${P}-desk-workspace[data-desk="places"] .${P}-location-navigator[data-layout="navigator-sheet"]{max-height:70%}
 .${P}-desk-workspace[data-desk="mailbox"]>.${P}-desk-stage{padding-top:14px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog{padding:12px 10px 0}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header h3{font-size:26px}
}
`;
