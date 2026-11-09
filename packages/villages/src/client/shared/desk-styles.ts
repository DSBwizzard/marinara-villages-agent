const P = "marinara-capability-villages";

export const DESK_STYLES = `
.${P}-desk-workspace{height:100%;min-height:0;display:flex;flex-direction:column;position:relative;isolation:isolate}
.${P}-desk-workspace[data-desk]:not([data-desk="none"]){--background:#f8efdd;--foreground:#362a20;--popover:#fff6e5;--muted:#e9ddc3;--muted-foreground:#6b5a49;--border:#c8b895;--primary:#5e7047;--primary-foreground:#fff9ec;--secondary:#ede1ca;color:#362a20;background:#704726 var(--desk-wood,url('/api/capability-packages/villages/assets/menu-desk.jpg')) center/cover;padding:clamp(10px,2vw,28px);box-sizing:border-box;overflow:hidden;font-family:"village-letter-assistant",system-ui,sans-serif}
.${P}-desk-header{display:flex;align-items:center;gap:clamp(16px,2vw,32px);flex:none;position:relative;z-index:30;margin:0 auto 24px;width:100%}
.${P}-desk-header[hidden]{display:none}
.${P}-desk-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));flex:1;min-width:0;box-shadow:0 5px 10px #25180c70;border:1px solid #ead9b9;border-radius:9px;background:linear-gradient(#fff8e950,#fff8e950),var(--desk-paper,url('/api/capability-packages/villages/assets/paper-ivory.webp')) center/768px;padding:5px 12px}
.${P}-desk-art-error{margin:0 2% 12px;padding:8px 12px;background:#fff4df;color:#6b3523;border:1px solid #b8845e;border-radius:4px}
.${P}-desk-nav button{position:relative;display:flex;align-items:center;justify-content:center;gap:clamp(6px,.8vw,12px);min-height:64px;min-width:0;border:0;background:transparent;color:#362a20;padding:8px;font:400 clamp(16px,1.55vw,24px)/1.3 "Segoe UI",system-ui,sans-serif;cursor:pointer}
.${P}-desk-nav button:last-child{border-right:0}
.${P}-desk-nav button[aria-current="page"]{color:#52663b}
.${P}-desk-nav button[aria-current="page"]::after{content:"";position:absolute;bottom:0;left:10%;right:10%;height:3px;background:#65764a;border-radius:2px}
.${P}-desk-nav svg{width:clamp(22px,2.1vw,32px);height:clamp(22px,2.1vw,32px);flex:none;color:inherit;animation:none;stroke:currentColor;stroke-width:1.6;fill:none;stroke-linecap:round;stroke-linejoin:round}
.${P}-desk-workspace[data-desk] .${P}-desk-nav button svg{color:inherit!important}
.${P}-desk-nav button:disabled,.${P}-desk-return:disabled{cursor:default;opacity:.65}
.${P}-desk-return{min-height:44px;flex:none;border:1px solid #596a38;border-radius:8px;background:linear-gradient(#77894c,#60733e);color:#fff9ec;padding:12px 22px;font:400 18px/1.3 "Segoe UI",system-ui,sans-serif;cursor:pointer;box-shadow:0 3px 7px #25180c60}
.${P}-desk-return-mobile{display:none}
.${P}-desk-scene{background:transparent;border:0;box-shadow:none;padding:8px;color:#fff9ec;white-space:nowrap}
.${P}-desk-workspace :is(button,input,textarea,select,summary,a):focus-visible{outline:3px solid #648096;outline-offset:3px}
.${P}-desk-stage{position:relative;flex:1;min-width:0;min-height:0}
.${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{overflow:clip;padding:46px 10px 18px}
.${P}-desk-document{height:100%;min-height:0;position:relative}
.${P}-desk-workspace:not([data-desk="none"]) .${P}-desk-document{width:94%;max-width:1420px;margin:auto}
/* Hold the departed paper offscreen until the next menu commits. */
.${P}-desk-workspace[data-phase="closing"] .${P}-desk-document{transform:translateY(calc(100% + 120px))}
.${P}-desk-workspace[data-desk="people"]{--desk-art:var(--desk-art-desktop,url('/api/capability-packages/villages/assets/people-desk.webp'))}
.${P}-desk-workspace[data-desk="projects"]{--desk-art:var(--desk-art-desktop,url('/api/capability-packages/villages/assets/desk-art/projects-desktop.webp'));--desk-art-inset:-22px -40px -24px}
.${P}-desk-workspace[data-desk="places"]{--desk-art:var(--desk-art-desktop,url('/api/capability-packages/villages/assets/desk-art/places-desktop.webp'));--desk-art-inset:-22px -24px 0}
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
.${P}-venue-back{display:block;order:2;flex:none;min-height:44px;padding:8px 0;background:transparent;color:#52663b;border:0;font:inherit;cursor:pointer}
.${P}-workspace-content .${P}-venue-profile-body{max-width:none;margin:0;padding:24px 0 8px}
.${P}-workspace-content .${P}-venue-sections{display:flex;gap:12px;border-bottom:1px solid #b9a480;background:transparent}
.${P}-workspace-content .${P}-venue-sections button{flex:0 1 auto;min-width:0;padding:10px 22px;border:0;border-bottom:3px solid transparent;border-radius:0;background:transparent;color:#362a20;font:400 20px/1.3 Georgia,serif}
.${P}-workspace-content .${P}-venue-sections button[aria-pressed="true"]{background:transparent;border-bottom-color:#667a4d;color:#52663b}
.${P}-workspace-about{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);align-items:start;gap:clamp(20px,2.5vw,36px)}
.${P}-workspace-about[data-photo="false"]{grid-template-columns:minmax(0,1fr)}
.${P}-workspace-about p{white-space:pre-wrap;overflow-wrap:anywhere}
.${P}-venue-photo{min-width:0;margin:0;border:8px solid #fff7e7;outline:1px solid #cbb894;background:#fff7e7;box-shadow:0 3px 9px #50391c40}
.${P}-venue-photo img{display:block;width:100%;height:auto;max-height:420px;object-fit:contain}
.${P}-venue-summary{min-width:0;font-size:clamp(16px,1.4vw,20px);line-height:1.5}.${P}-venue-summary>p:first-child{margin-top:0}
.${P}-venue-form,.${P}-venue-capacity{color:#6b5a49;font-size:15px}
.${P}-venue-occupants{padding-top:16px;margin-top:20px;border-top:1px solid #c8b895}
.${P}-venue-occupants h2{margin:0 0 4px;font:700 24px/1.3 Georgia,serif}.${P}-venue-occupants p{margin:0}
.${P}-workspace-content .${P}-venue-primary{display:inline-block;width:auto;min-height:44px;padding:10px 28px;margin:20px 0 0;border:1px solid #61703f;border-radius:5px;background:#667a49;color:#fff9ec;font:inherit}
.${P}-workspace-content .${P}-venue-primary:disabled{opacity:.6;cursor:default}
.${P}-desk-workspace[data-desk="places"][data-venue="true"]>.${P}-desk-stage{padding-top:0}
.${P}-desk-workspace[data-desk="places"][data-venue="true"] .${P}-workspace-body{box-sizing:border-box;display:grid;grid-template-columns:minmax(0,20.8%) minmax(0,1fr);column-gap:6.5%;padding:clamp(22px,6vh,62px) 1.5% clamp(24px,4vh,40px);font-family:"Segoe UI",system-ui,sans-serif}
.${P}-desk-workspace[data-venue="true"] .${P}-workspace-sidebar{height:88%;box-sizing:border-box;align-self:start;border:0;padding:16px 8px}
.${P}-desk-workspace[data-venue="true"] .${P}-workspace-sidebar h2{font-size:32px;margin-bottom:18px}
.${P}-desk-workspace[data-venue="true"] .${P}-workspace-content{box-sizing:border-box;height:100%;padding:16px 24px}
.${P}-desk-workspace[data-venue="true"] .${P}-workspace-venues button{padding:14px 4px;border-radius:3px;font-size:clamp(14px,1.3vw,18px)}
@media(min-width:701px) and (max-width:1000px){
 .${P}-desk-workspace[data-venue="true"] .${P}-workspace-venues button{flex-direction:column;align-items:stretch;gap:8px}
 .${P}-desk-workspace[data-venue="true"] .${P}-workspace-venues img{width:100%;height:76px}
 .${P}-workspace-about{grid-template-columns:minmax(0,1fr)}
}
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
 .${P}-desk-workspace[data-desk="people"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/people-phone.webp'))}
 .${P}-desk-workspace[data-desk="projects"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/desk-art/projects-phone.webp'));--desk-art-inset:-28px -20px -10px}
 .${P}-desk-workspace[data-desk="places"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/desk-art/places-phone.webp'));--desk-art-inset:-14px -2px 0}
 .${P}-desk-workspace[data-desk="places"][data-venue="true"]{--desk-art:var(--desk-venue-phone,url('/api/capability-packages/villages/assets/desk-art/venue-phone.webp'))}
 .${P}-desk-workspace[data-desk="mailbox"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/desk-art/mailbox-phone.webp'))}
 .${P}-desk-workspace[data-desk="settings"]{--desk-art:var(--desk-art-phone,url('/api/capability-packages/villages/assets/desk-art/settings-phone.webp'))}
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]):not([data-desk="people"]) .${P}-desk-document::before{inset:var(--desk-art-inset,-14px -2px -10px)}
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]){padding:8px}
 .${P}-desk-header{gap:4px;flex-wrap:wrap;margin-bottom:5px;width:100%}
 .${P}-desk-nav{flex-basis:100%;padding:3px 1px}
 .${P}-desk-nav button{font-size:clamp(11px,3.2vw,13px);min-height:50px;gap:3px;flex-direction:column;padding:5px 1px}
 .${P}-desk-nav svg{width:22px;height:22px}
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
 .${P}-workspace-venue-header{flex-direction:column;gap:12px;padding:0 0 14px}
 .${P}-workspace-venue-header .${P}-title{font-size:30px}
 .${P}-venue-back{display:block;order:0;padding:0;font-size:15px}
 .${P}-workspace-content .${P}-venue-sections{gap:0}
 .${P}-workspace-content .${P}-venue-sections button{flex:1;padding:10px 6px;font-size:18px}
 .${P}-workspace-content .${P}-venue-profile-body{padding-top:20px}
 .${P}-venue-photo{border-width:6px}.${P}-venue-photo img{max-height:260px}
 .${P}-venue-summary{font-size:17px}.${P}-venue-occupants h2{font-size:23px}
 .${P}-workspace-content .${P}-venue-primary{width:100%;box-sizing:border-box}
 .${P}-desk-workspace[data-desk="places"][data-venue="true"] .${P}-workspace-body{display:block;padding:clamp(28px,5vh,44px) 7% clamp(38px,7vh,64px)}
 .${P}-desk-workspace[data-venue="true"] .${P}-workspace-sidebar{display:none}
 .${P}-desk-workspace[data-venue="true"] .${P}-workspace-content{padding:0}
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
