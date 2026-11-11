const P = "marinara-capability-villages";

export const DESK_STYLES = `
.${P}-desk-container{height:100%;min-height:0;min-width:0;container:village-desk/inline-size}
.${P}-desk-workspace{height:100%;min-height:0;display:flex;flex-direction:column;position:relative;isolation:isolate}
.${P}-desk-workspace[data-desk]:not([data-desk="none"]){--background:#302d47;--foreground:#f0dfbc;--popover:#393047;--muted:#4f3c53;--muted-foreground:#d0c1b3;--border:#a39b8460;--primary:#969b7e;--primary-foreground:#292938;--secondary:#514157;--destructive:#f3b6b7;--menu-font:"village-letter-lora",Georgia,serif;--menu-rose:#b97980;--menu-sage:#969b7e;--menu-selected:#b979809e;--menu-tab-line:#d29399;--menu-field:#74536755;--menu-field-border:#b47f92aa;--menu-heading-size:clamp(40px,3.6cqw,76px);--menu-rail-width:clamp(210px,20cqw,260px);--menu-art-placement:center bottom/cover no-repeat;display:grid;grid-template-columns:var(--menu-rail-width) minmax(0,1fr);color:var(--foreground);background:#302d47 var(--menu-art) var(--menu-art-placement);overflow:hidden;box-sizing:border-box;font:18px/1.45 var(--menu-font)}
.${P}-desk-workspace[data-desk]:not([data-desk="none"])::before{content:"";position:absolute;inset:0 auto 0 0;width:var(--menu-rail-width);z-index:-2;background:#542d43b0;pointer-events:none}
.${P}-desk-workspace[data-desk]:not([data-desk="none"])::after{content:"";position:absolute;inset:0;z-index:-1;background:var(--menu-art) var(--menu-art-placement);mask:var(--menu-scenery-matte) var(--menu-art-placement);pointer-events:none}
.${P}-desk-workspace[data-desk]:not([data-desk="none"]) *{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:#a2859370 transparent}
.${P}-desk-header{display:flex;flex-direction:column;align-items:stretch;align-self:start;height:85%;gap:18px;min-width:0;min-height:0;overflow:auto;padding:28px 14px 24px;position:relative;z-index:20}
.${P}-desk-header[hidden]{display:none}
.${P}-menu-brand{order:0;text-align:center;font:700 34px/1.1 var(--menu-font);letter-spacing:.025em;margin-bottom:4px}
.${P}-menu-brand>svg{display:block;width:88%;height:auto;max-height:52px;margin:12px auto 0;fill:#b97980;stroke:none}
.${P}-desk-nav{order:3;display:grid;gap:6px;min-width:0}
.${P}-desk-nav button{position:relative;display:flex;align-items:center;gap:12px;min-width:0;min-height:56px;height:56px;padding:7px 14px;border:0;border-radius:7px;background:transparent;color:inherit;font:400 26px/1.25 var(--menu-font);text-align:left;cursor:pointer}
.${P}-desk-nav button[aria-current="page"]{background:#b979809e;color:#fff0d5}
.${P}-desk-nav button[aria-current="page"] span::after{content:"";display:block;width:55%;height:3px;margin-top:6px;border-radius:3px;background:#f0dfbc}
.${P}-desk-nav svg{width:30px;height:30px;flex:none;color:inherit!important;animation:none}
.${P}-desk-header .${P}-desk-return{order:1;align-self:center;max-width:100%;min-height:44px;padding:4px;border:0;background:transparent;color:inherit;font:400 20px/1.25 var(--menu-font);cursor:pointer;text-align:left}
.${P}-desk-header .${P}-desk-scene{order:2;font-size:18px;align-self:start;padding-inline:10px}
.${P}-desk-return-mobile{display:none}
.${P}-desk-nav button:disabled,.${P}-desk-return:disabled{opacity:.6;cursor:default}
.${P}-desk-stage{flex:1;min-width:0;min-height:0;position:relative}
.${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{padding:28px 30px 104px;overflow:hidden}
.${P}-desk-document{height:100%;min-height:0;min-width:0;position:relative}
.${P}-desk-art-error{position:absolute;z-index:40;left:20%;right:3%;top:0;background:#593947;color:#fff0d5;padding:10px;border:1px solid #c88b8e}
.${P}-desk-workspace[data-phase="closing"] .${P}-desk-document{opacity:0}
.${P}-desk-workspace:where(:not([data-desk="none"])) :where(button,input,select,textarea,summary){font-family:var(--menu-font);font-size:inherit}
.${P}-desk-workspace:where(:not([data-desk="none"])) :where(input,select,textarea){min-height:44px;max-width:100%;padding:8px 12px;background:var(--menu-field);color:var(--foreground);border:1px solid var(--menu-field-border);border-radius:8px;box-shadow:none;accent-color:var(--menu-rose)}
.${P}-desk-workspace:where(:not([data-desk="none"])) :where(input[type="checkbox"],input[type="radio"]){min-height:0}
.${P}-desk-workspace:where(:not([data-desk="none"])) :where(select option){background:#3e334c;color:#f0dfbc}
.${P}-desk-workspace:where(:not([data-desk="none"])) :where(input,textarea)::placeholder{color:#d0bfc3;opacity:1}
.${P}-desk-workspace:where(:not([data-desk="none"])) :where(button){min-height:44px;max-width:100%;padding:8px 16px;background:#969b7e;color:#292938;border:1px solid #aaaf91;border-radius:5px;cursor:pointer}
.${P}-desk-workspace:where(:not([data-desk="none"])) :where(button):disabled{cursor:default;opacity:.55}
.${P}-desk-workspace:not([data-desk="none"]) :is(button,input,textarea,select,summary,a,[tabindex]):focus-visible{outline:3px solid #dca5ab;outline-offset:3px}
.${P}-desk-workspace:where(:not([data-desk="none"])) :where(h1,h2,h3,h4){font-family:var(--menu-font);color:#f0dfbc}
.${P}-desk-workspace:where(:not([data-desk="none"])) :where(svg){color:inherit!important;animation:none}
.${P}-desk-workspace .${P}-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.${P}-desk-workspace:where(:not([data-desk="none"])) .${P}-storybook-heading{display:flex;align-items:center;gap:12px;min-width:0;margin:0;color:inherit;font:600 var(--menu-heading-size)/1.12 var(--menu-font);letter-spacing:-.025em}
.${P}-storybook-heading>.${P}-directory-flourish{flex:none;width:clamp(34px,4cqw,60px);height:auto;fill:#969b7e}
.${P}-places-title,.${P}-explore-search .${P}-storybook-search-icon{display:none}
.${P}-workspace-body{display:grid;grid-template-columns:clamp(185px,25%,300px) minmax(0,1fr);gap:26px;height:100%;min-height:0;min-width:0;color:inherit;font:inherit;background:transparent}
.${P}-workspace-sidebar{min-height:0;min-width:0;overflow:auto;padding:0 20px 12px 0;border-right:1px solid var(--border)}
.${P}-workspace-sidebar>.${P}-storybook-heading{margin-bottom:26px}
.${P}-workspace-content{min-height:0;min-width:0;overflow:auto;padding:0 4px 16px 0;background:transparent}
.${P}-workspace-sections,.${P}-workspace-venues{display:grid;gap:4px}
.${P}-workspace-sections button,.${P}-workspace-venues button{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:50px;padding:10px 12px;color:inherit;background:transparent;border:1px solid transparent;border-bottom-color:var(--border);border-radius:7px;text-align:left;font:inherit;overflow-wrap:anywhere}
.${P}-workspace-sections button[aria-current="page"],.${P}-workspace-venues button[aria-pressed="true"]{background:var(--menu-selected);border-color:#c78d9370;color:#fff0d5}
.${P}-workspace-sidebar button:hover:not(:disabled,[aria-current],[aria-pressed="true"]){background:var(--menu-field)}
.${P}-workspace-section-picker,.${P}-workspace-venue-picker{display:none}
.${P}-workspace-content .${P}-root.${P}-sectioned-menu{display:flex;flex-direction:column;height:100%;padding:0;min-height:0;gap:0;background:transparent;color:inherit;font:inherit}
.${P}-workspace-content .${P}-sectioned-menu>.${P}-header{background:transparent;padding:8px 4px 16px;border-bottom:1px solid var(--border);flex:none;color:inherit}
.${P}-workspace-content .${P}-title{font:600 clamp(28px,2.9cqw,50px)/1.15 var(--menu-font);color:inherit;overflow-wrap:anywhere}
.${P}-workspace-content .${P}-menu-content{min-height:0;flex:1;padding:22px 6px 12px;margin:0;overflow:auto;font:18px/1.5 var(--menu-font);background:transparent;border:0}
.${P}-sectioned-menu .${P}-menu-content>.${P}-field{max-width:44rem}
.${P}-sectioned-menu .${P}-menu-content>.${P}-field + .${P}-field{padding-top:12px;border-top:1px solid var(--border)}
.${P}-workspace-content :is(.${P}-panel,.${P}-overlay,.villages-lorebook-card){color:inherit;background:transparent;border-color:var(--border);box-shadow:none}
.${P}-workspace-content :is(.${P}-panel-title,.${P}-label,.${P}-hint,.${P}-empty){color:inherit;font-family:var(--menu-font);letter-spacing:0;text-transform:none}
.${P}-workspace-content .${P}-panel-title{font-size:24px}
.${P}-workspace-content .${P}-label{font-size:18px}
.${P}-workspace-content .${P}-menu-content :is(input:not([type="checkbox"],[type="radio"]),select,textarea){background:var(--menu-field);color:var(--foreground);border:1px solid var(--menu-field-border);border-radius:8px;font:400 17px/1.4 var(--menu-font)}
.${P}-workspace-content .${P}-menu-content>.${P}-field:first-child>.${P}-label{font-size:24px}
.${P}-workspace-content :is(.${P}-hint,.${P}-empty){color:#d0c1b3}
.${P}-workspace-content .${P}-notice-row{color:var(--muted-foreground);background:var(--menu-field);border-color:var(--border)}
.${P}-workspace-content :is(.${P}-row,.${P}-field){min-width:0}
.${P}-workspace-content .${P}-row{flex-wrap:wrap}
.${P}-workspace-content .${P}-button{background:var(--secondary);color:var(--foreground);border:1px solid var(--menu-field-border);border-radius:7px;font:inherit;min-height:44px}
.${P}-workspace-content .${P}-button:not(:disabled):hover{background:#685269}
.${P}-workspace-content .${P}-button.${P}-danger{color:var(--destructive);border-color:var(--destructive)}
.${P}-workspace-content .${P}-venue-profile{margin:0;padding:0;max-width:none;background:transparent;color:inherit}
.${P}-workspace-venue-header{display:flex;align-items:start;gap:14px;padding:0 0 22px;border:0;background:transparent;color:inherit}
.${P}-workspace-venue-header>div{flex:1;min-width:0}
.${P}-workspace-venue-header .${P}-title{margin:0;overflow-wrap:anywhere}
.${P}-venue-metadata{display:flex;flex-wrap:wrap;gap:4px 10px;margin:8px 0 0;color:#d0c1b3;font-size:17px}
.${P}-venue-metadata>div{display:flex;min-width:0;max-width:100%}.${P}-venue-metadata>div+div::before{content:"·";margin-right:10px}
.${P}-venue-metadata dt{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.${P}-venue-metadata dd{margin:0;overflow-wrap:anywhere}
.${P}-workspace-content .${P}-venue-back{flex:none;order:2;min-height:44px;padding:4px 0;border:0;background:transparent;color:#f0dfbc;font:400 20px/1.3 var(--menu-font)}
.${P}-workspace-content .${P}-venue-back:is(:hover,:focus,:active){background:transparent;color:#fff0d5}
.${P}-workspace-content .${P}-venue-sections{display:flex;gap:12px;border:0;border-bottom:1px solid var(--border);background:transparent}
.${P}-workspace-content .${P}-venue-sections button{min-width:0;flex:0 1 auto;padding:8px 16px;background:transparent;color:inherit;border:0;border-bottom:3px solid transparent;border-radius:0;font:600 21px/1.3 var(--menu-font)}
.${P}-workspace-content .${P}-venue-sections button[aria-pressed="true"]{border-bottom-color:var(--menu-tab-line);background:transparent;color:#fff0d5}
.${P}-workspace-content .${P}-venue-profile-body{padding:22px 0;max-width:none;margin:0}
.${P}-workspace-about{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:24px;align-items:start}
.${P}-workspace-about[data-photo="false"]{grid-template-columns:1fr}
.${P}-workspace-about p{white-space:pre-wrap;overflow-wrap:anywhere}
.${P}-venue-photo{min-width:0;margin:0;border:1px solid #a39b8480;border-radius:10px;overflow:hidden;background:#242135}
.${P}-venue-photo img{display:block;width:100%;height:auto;max-height:400px;object-fit:contain}
.${P}-venue-summary{min-width:0;font-size:19px;line-height:1.55}.${P}-venue-summary>p:first-child{margin-top:0;font-style:italic}
.${P}-venue-form,.${P}-venue-capacity{font-size:15px;color:#d0c1b3}
.${P}-venue-occupants{margin-top:20px;padding-top:16px;border-top:1px solid var(--border)}
.${P}-venue-occupants h2{font:700 25px/1.2 var(--menu-font);margin:0 0 8px}.${P}-venue-occupants p{margin:0}
.${P}-workspace-content .${P}-venue-primary{display:inline-block;margin-top:22px;padding:8px 24px;font:600 22px/1.3 var(--menu-font);min-height:44px;background:#969b7e;color:#292938;border-color:#a5ac8b}
.${P}-workspace-content .${P}-picture-menu :is(summary,div){background:var(--secondary);border-color:var(--menu-field-border)}
.${P}-workspace-content .${P}-picture-menu summary:focus-visible{outline-color:#dca5ab}
.${P}-workspace-content .${P}-zone-artwork-frame:has(>.${P}-venue-image-empty){height:100px;border-radius:8px;background:var(--menu-field);color:var(--muted-foreground)}
.${P}-workspace-content .villages-zone-map-tile[aria-pressed="true"]{background:var(--menu-selected);border-color:var(--menu-tab-line);box-shadow:none}
.${P}-desk-workspace[data-desk="places"] .${P}-home{--explore-background:transparent;--explore-panel:#393047;--explore-surface:#514157;--explore-text:#f0dfbc;--explore-muted:#d0c1b3;--explore-border:#a39b8460;--explore-selected:#b97980;background:transparent;color:inherit;border:0;border-radius:0;box-shadow:none;padding:0;font:inherit;overflow:visible}
.${P}-desk-workspace[data-desk="places"] .${P}-home>.${P}-room{display:grid;grid-template-columns:clamp(180px,26%,300px) minmax(0,1fr);gap:26px;overflow:visible;background:transparent}
.${P}-desk-workspace[data-desk="places"] :is(.${P}-home-bar,.${P}-explore-nav){display:none}
.${P}-desk-workspace[data-desk="places"] .${P}-home-map-paper{display:flex;flex-direction:column;grid-column:2;min-width:0;min-height:0;gap:14px;padding:0 0 60px}
.${P}-desk-workspace[data-desk="places"] .${P}-room:not(:has(>.${P}-location-navigator))>.${P}-home-map-paper{grid-column:1/-1}
.${P}-desk-workspace[data-desk="places"] .${P}-room:not(:has(>.${P}-location-navigator)) .${P}-places-title{display:block}
.${P}-desk-workspace[data-desk="places"] .${P}-home-map-viewport{position:relative;flex:1;min-width:0;min-height:0;height:auto;background:#242135;border:2px solid #8a768a;border-radius:9px;box-shadow:none;overflow:visible}
.${P}-desk-workspace[data-desk="places"] .${P}-home-map-viewport .${P}-canvas{border-radius:7px}
.${P}-desk-workspace[data-desk="places"] .${P}-location-navigator{position:relative;z-index:3;align-self:stretch;min-width:0;width:auto;height:100%;max-height:none;transform:none;padding:0 20px 0 0;background:transparent;color:inherit;border:0;border-right:1px solid var(--border);border-radius:0;box-shadow:none}
.${P}-desk-workspace[data-desk="places"] .${P}-location-navigator header{padding:0 0 24px;margin:0}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-search{position:relative;padding:0;margin:0 0 16px}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-search input{width:100%;min-height:50px;padding:9px 10px 9px 44px;background:var(--menu-field);color:inherit;border:1px solid var(--menu-field-border);border-radius:11px;font:inherit}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-search input:focus-visible{outline-offset:-3px}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-search .${P}-storybook-search-icon{display:block;position:absolute;left:14px;top:50%;transform:translateY(-50%);width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;pointer-events:none}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-list{display:flex;flex-direction:column;flex:1}
.${P}-desk-workspace[data-desk="places"] .${P}-discover-places{order:2;margin:16px 0 4px;background:var(--secondary);color:inherit;border:1px solid var(--menu-field-border);border-radius:7px;font:inherit}
.${P}-desk-workspace[data-desk="places"] .${P}-navigator-place{flex:none;border:1px solid transparent;border-bottom-color:var(--border);border-radius:7px}
.${P}-desk-workspace[data-desk="places"] .${P}-navigator-place[data-selected="true"]{background:var(--menu-selected);border-color:#c78d9370;color:#fff0d5}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-row{padding:10px 8px;gap:10px;font:inherit;color:inherit;background:transparent;border:0;border-radius:6px}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-row:hover:not(:disabled){background:var(--menu-field)}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-row strong{font:600 18px/1.3 var(--menu-font)}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-row small{color:#d0c1b3}
.${P}-desk-workspace[data-desk="places"] .${P}-explore-row>svg{width:22px;height:22px}
.${P}-place-chevron{display:none}
.${P}-desk-workspace[data-desk="places"] .${P}-place-chevron{display:block;flex:0;font-size:26px}
.${P}-desk-workspace[data-desk="places"] .${P}-navigator-actions{padding:0 8px 10px;gap:8px}
.${P}-desk-workspace[data-desk="places"] .${P}-navigator-actions button{background:#969b7e;color:#292938;font:inherit;border-color:#a5ac8b}
.${P}-desk-workspace[data-desk="places"] .${P}-map-tools{position:relative;left:auto;top:auto;right:auto;flex:none;justify-content:space-between;max-width:100%;gap:12px;z-index:7}
.${P}-desk-workspace[data-desk="places"] .${P}-map-tools>button{padding:6px 10px;max-width:calc(100% - 56px);font:600 clamp(19px,2.1cqw,30px)/1.2 var(--menu-font);border:0;background:transparent;color:inherit}
.${P}-desk-workspace[data-desk="places"] .${P}-map-tools>button>svg{color:var(--menu-sage)!important}
.${P}-desk-workspace[data-desk="places"] :is(.${P}-map-tools summary,.${P}-map-camera-controls){background:var(--secondary);color:inherit;border:1px solid var(--menu-field-border);border-radius:7px;box-shadow:none}
.${P}-desk-workspace[data-desk="places"] .${P}-map-camera-controls{right:0;bottom:-58px;padding:0;font:600 18px/1.2 var(--menu-font)}
.${P}-desk-workspace[data-desk="places"] .${P}-map-label{width:max-content;max-width:190px;white-space:normal;color:#f0dfbc;background:#302d47ed;border:1px solid #a39b84;box-shadow:0 1px 3px #18152160;font:600 15px/1.2 var(--menu-font);transform:translateX(clamp(calc(50% - var(--pin-left) + 4px),0px,calc(var(--pin-right) - 50% - 4px)))}
.${P}-desk-workspace[data-desk="places"] .${P}-map-point{width:14px;height:18px;border:2px solid #f0dfbc;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#b97980;box-shadow:0 1px 3px #18152180}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-overlay{position:relative;inset:auto;height:100%;padding:0;background:transparent;z-index:auto}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog{width:100%;height:100%;max-height:100%;padding:0;border:0;background:transparent;box-shadow:none;color:inherit;font:inherit}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header{background:transparent;color:inherit;padding:0 0 24px}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-title{flex-wrap:wrap;gap:10px 18px}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header>button{color:inherit}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-layout{grid-template-columns:minmax(200px,30%) minmax(0,1fr);padding:0;gap:26px}
.${P}-desk-workspace[data-desk="mailbox"] :is(.villages-letter-list,.villages-letter-paper){background:transparent;color:inherit;border:0;border-radius:0;box-shadow:none}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-list{padding:0 20px 0 0;border-right:1px solid var(--border)}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-paper{padding:0 0 8px}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-row[aria-pressed="true"]{background:var(--menu-selected);color:#fff0d5;border-color:#c78d9370;box-shadow:none}
.${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog :is(button,select,input,textarea){font-family:var(--menu-font)}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-empty{color:var(--muted-foreground);margin:14px 0}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-error{color:#f3c2b8}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-pages{container-type:size}
.${P}-desk-workspace[data-desk="mailbox"] .villages-letter-signature .${P}-signature-image{max-height:min(6rem,25cqh)}
.${P}-desk-workspace[data-desk="settings"] .villages-repair{--repair-bg:transparent;--repair-paper:#514157;--repair-ink:var(--foreground);--repair-muted:var(--muted-foreground);--repair-line:var(--border);--repair-soft:var(--menu-field);--repair-primary:var(--menu-sage);--repair-onprimary:#292938;--repair-mark:var(--menu-selected);--repair-warn:#f3b6b7;--repair-focus:#dca5ab;height:100%;font:inherit}
.${P}-desk-workspace[data-desk="settings"] .repair-chrome{justify-content:end;padding:0 5px 12px;background:transparent}
.${P}-desk-workspace[data-desk="settings"] .repair-chrome>span{display:none}
@container village-desk (max-width:1050px) and (min-width:701px){
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]){--menu-heading-size:36px}
 .${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{padding:24px 20px 80px}
 .${P}-workspace-body,.${P}-desk-workspace[data-desk="places"] .${P}-home>.${P}-room{grid-template-columns:190px minmax(0,1fr);gap:18px}
 .${P}-workspace-sidebar .${P}-directory-flourish,.${P}-location-navigator .${P}-directory-flourish{display:none}
 .${P}-workspace-about{grid-template-columns:minmax(0,1fr)}
 .${P}-workspace-venue-header{flex-direction:column}.${P}-venue-back{order:0}
 .${P}-desk-nav button{gap:10px;padding-inline:10px}
}
@container village-desk (max-width:700px){
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]){--menu-heading-size:38px;display:flex;font-size:17px;background-size:auto 100%;background-position:right bottom}
 .${P}-desk-workspace::before,.${P}-desk-workspace::after{display:none}
 .${P}-desk-header{flex:none;display:grid;grid-template-columns:1fr auto;height:auto;align-self:stretch;gap:8px;padding:8px 8px 6px;background:#4e3044b0;overflow:visible}
 .${P}-menu-brand{font-size:24px;align-self:center;text-align:left;margin:0;padding-left:8px}.${P}-menu-brand>svg{display:none}
 .${P}-desk-nav{grid-column:1/-1;grid-row:2;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;order:3}
 .${P}-desk-nav button{flex-direction:column;justify-content:center;gap:3px;min-height:56px;height:auto;padding:4px 1px 6px;font:600 clamp(12px,3.8cqw,17px)/1.1 var(--menu-font);text-align:center}
 .${P}-desk-nav svg{width:23px;height:23px}.${P}-desk-nav button[aria-current="page"] span::after{width:75%;height:2px;margin:4px auto 0}
 .${P}-desk-header .${P}-desk-return{grid-column:2;grid-row:1;font-size:18px;margin:0;padding:4px 8px;align-self:center;justify-self:end}
 .${P}-desk-return-desktop{display:none}.${P}-desk-return-mobile{display:inline}
 .${P}-desk-header .${P}-desk-scene{grid-column:1;grid-row:3;font-size:17px;justify-self:start;min-height:36px}
 .${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{margin-bottom:60px;padding:16px 12px 0;overflow-x:clip;overflow-y:auto;overscroll-behavior:contain}
 .${P}-desk-workspace:is([data-desk="people"],[data-desk="mailbox"],[data-desk="projects"])>.${P}-desk-stage{overflow:hidden}
 .${P}-desk-workspace:is([data-desk="places"],[data-desk="settings"]) .${P}-desk-document{height:auto;min-height:100%}
 .${P}-desk-workspace[data-desk="places"]>.${P}-desk-stage{margin-bottom:calc(60px + var(--villages-exploration-inset,0px))}
 .${P}-workspace-body{display:flex;flex-direction:column;height:auto;gap:20px}
 .${P}-workspace-sidebar{flex:none;padding:0;border:0;overflow:visible}
 .${P}-workspace-sidebar>.${P}-storybook-heading{margin:0 0 16px}
 .${P}-workspace-content{overflow:visible;padding:0;flex:none}
 .${P}-workspace-sections,.${P}-workspace-venues{display:none}
 .${P}-workspace-section-picker,.${P}-workspace-venue-picker{display:flex;align-items:center;gap:12px}
 .${P}-workspace-section-picker select{width:100%;background:var(--menu-field);color:var(--foreground);border-color:var(--menu-field-border)}
 .${P}-workspace-content .${P}-root.${P}-sectioned-menu{height:auto}
 .${P}-workspace-content .${P}-sectioned-menu>.${P}-header{padding:0 0 12px}
 .${P}-workspace-content .${P}-sectioned-menu[data-page="general"]>.${P}-header{display:contents}
 .${P}-workspace-content .${P}-sectioned-menu[data-page="general"]>.${P}-header>:is(div,button){display:none}
 .${P}-workspace-content .${P}-menu-content{overflow:visible;flex:none;padding:0;font-size:18px}
 .${P}-workspace-content .${P}-menu-content .${P}-row{flex-direction:column;align-items:stretch;gap:12px}
 .${P}-workspace-content .${P}-menu-content .${P}-row.${P}-send-toggle{flex-direction:row;align-items:center;justify-content:start}
 .${P}-workspace-content .${P}-menu-content .${P}-field{gap:6px;margin-bottom:18px}
 .${P}-workspace-content .${P}-menu-content .${P}-row>.${P}-field{margin:0;flex:none}
 .${P}-workspace-content .${P}-menu-content .${P}-label{font-size:19px}
 .${P}-workspace-content .${P}-menu-content select{width:100%;font-size:18px}
 .${P}-workspace-about{grid-template-columns:1fr;gap:18px}
 .${P}-workspace-venue-header{flex-direction:column;gap:12px;padding-bottom:14px}
 .${P}-workspace-venue-header .${P}-title{font-size:32px}
 .${P}-workspace-content .${P}-venue-back{order:0;font-size:20px}
 .${P}-workspace-content .${P}-venue-sections{gap:0}
 .${P}-workspace-content .${P}-venue-sections button{flex:1;padding:8px 6px;font-size:19px}
 .${P}-venue-photo img{max-height:none}.${P}-venue-summary{font-size:20px}
 .${P}-desk-workspace[data-venue="true"] .${P}-workspace-sidebar{display:none}
 .${P}-desk-workspace[data-desk="places"] .${P}-home{height:auto;min-height:0;display:block}
 .${P}-desk-workspace[data-desk="places"] .${P}-home>.${P}-room{display:flex;flex-direction:column;height:auto;gap:14px;overflow:visible;padding:0}
 .${P}-desk-workspace[data-desk="places"] .${P}-home-map-paper{flex:none;order:0;padding:0 0 60px;gap:12px}
 .${P}-desk-workspace[data-desk="places"] .${P}-places-title{display:block}
 .${P}-desk-workspace[data-desk="places"] .${P}-location-navigator header{position:absolute;right:0;top:3px;padding:0}
 .${P}-desk-workspace[data-desk="places"] .${P}-location-navigator .${P}-storybook-heading{display:none}
 .${P}-desk-workspace[data-desk="places"] .${P}-explore-search{margin-right:48px}
 .${P}-desk-workspace[data-desk="places"] .${P}-home-map-viewport{flex:none;width:auto;height:clamp(210px,62cqw,380px)}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-camera-controls{left:50%;right:auto;transform:translateX(-50%)}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-tools>button{font-size:19px;max-width:calc(100% - 48px)}
 .${P}-desk-workspace[data-desk="places"] .${P}-map-tools>button>span:first-of-type{white-space:normal;overflow:visible;text-overflow:clip}
 .${P}-desk-workspace[data-desk="places"] .${P}-location-navigator{order:2;flex:none;width:auto;height:auto;max-height:none;align-self:stretch;padding:0;border:0}
 .${P}-desk-workspace[data-desk="places"] .${P}-location-navigator .${P}-explore-list{overflow:visible}
 .${P}-desk-workspace[data-desk="places"] .${P}-explore-marker:not([data-selected="true"]) .${P}-map-label{display:none}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-dialog>header{padding-bottom:16px}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-mailbox-title:has(.villages-letter-reading) .${P}-directory-flourish{display:none}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-letter-layout{padding:0;gap:0}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-letter-list{padding:0;border:0}
 .${P}-desk-workspace[data-desk="mailbox"] .villages-letter-paper{padding:0}
}
@media(max-height:700px){
 .${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{padding-bottom:60px}
 @container village-desk (min-width:701px){
  .${P}-desk-header{padding-block:12px;gap:12px}
  .${P}-menu-brand{font-size:28px}.${P}-menu-brand>svg{height:28px;margin-top:6px}
  .${P}-desk-nav button{min-height:44px;height:44px;padding-block:4px;font-size:21px}
  .${P}-desk-nav svg{width:26px;height:26px}
 }
}
@media(max-height:700px){@container village-desk (max-width:700px){
 .${P}-desk-workspace[data-desk]:not([data-desk="none"]){--menu-heading-size:30px}
 .${P}-desk-header{gap:3px;padding-block:4px}
 .${P}-desk-nav button{min-height:44px;gap:2px;padding-block:2px}
 .${P}-desk-nav svg{width:20px;height:20px}
 .${P}-desk-workspace:not([data-desk="none"])>.${P}-desk-stage{padding-top:10px;padding-bottom:0;margin-bottom:calc(38px + var(--villages-exploration-inset,0px))}
}}
`;
