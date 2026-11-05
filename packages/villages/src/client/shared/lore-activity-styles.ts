import { ELEMENT_TAG as P } from "./constants.js";
export const LORE_ACTIVITY_STYLES = `
.villages-lore-host{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;min-width:0;container-type:inline-size}
.villages-lore-toolbar{display:flex;justify-content:flex-end;flex:none;padding:.35rem .85rem;border-bottom:1px solid #8b80ba30;background:linear-gradient(110deg,#121830,#1b2140);font-family:system-ui,sans-serif}
.villages-lore-launch{position:relative;display:inline-flex;align-items:center;gap:.5rem;min-height:36px;padding:.35rem .7rem;border:1px solid #9480cf88;border-radius:.55rem;background:#9c7ce610;color:#e4dcff;font:inherit;font-size:.8rem;font-weight:600;cursor:pointer}
.villages-lore-launch:hover{background:#9c7ce629;border-color:#bca1ff}
.villages-lore-launch svg{width:18px;height:18px;stroke:#c6afff;fill:none;stroke-width:1.7;stroke-linejoin:round;stroke-linecap:round}
.villages-lore-dot{display:inline-block;width:8px;height:8px;flex:none;border-radius:50%;background:#ff617b;box-shadow:0 0 0 3px #ff617b20}
.villages-lore-workarea{flex:1;min-height:0;min-width:0;overflow:hidden}
.villages-lore-host .${P}-home-full[data-mobile="true"] .${P}-home-map-viewport{min-height:max(0px,calc(88px - var(--villages-exploration-inset,0px)))}
.villages-founding-overlay:has(>.villages-lore-dialog){padding:0;place-items:stretch end;background:#05091766;backdrop-filter:blur(2px)}
.villages-founding-overlay>dialog.villages-lore-dialog{position:relative;inset:auto;display:flex;flex-direction:column;box-sizing:border-box;max-width:100%;max-height:100%;height:100%;width:min(70rem,68%);margin:0;padding:0;overflow:hidden;overscroll-behavior:contain;border:1px solid #b295ff88;border-right:0;border-radius:1rem 0 0 1rem;box-shadow:-1rem 0 4rem #0006;background:linear-gradient(135deg,#1b2343,#11182f 65%);color:#edf0ff;font: .9rem/1.5 system-ui,sans-serif}
.villages-lore-dialog *{box-sizing:border-box}
.villages-lore-dialog>header{display:flex;align-items:center;gap:.7rem;margin:0;padding:1rem 1.25rem;border-bottom:1px solid #9a91c52e;flex:none;background:#ffffff03}
.villages-lore-dialog>header h3{flex:1;margin:0;font-size:1.2rem;letter-spacing:-.025em;color:#f4f0ff}
.villages-lore-dialog button{font:inherit;min-height:44px;cursor:pointer;border:1px solid #8d80bc66;border-radius:.55rem;background:#242d4b;color:#ede8ff;padding:.5rem .75rem}
.villages-lore-dialog button:hover{background:#9881dc20;border-color:#ab90e5}
.villages-lore-dialog button:focus-visible,.villages-lore-dialog input:focus-visible,.villages-lore-launch:focus-visible{outline:3px solid #c7b1ff;outline-offset:2px}
.villages-lore-dialog>header>button:last-child{min-width:44px;padding:0;border:0;background:transparent;font-size:1.5rem}
.villages-lore-dialog .villages-lore-refresh{display:inline-flex;align-items:center;gap:.6rem;font-size:.8rem}
.villages-lore-filters{display:flex;flex:none;gap:.45rem;padding:.8rem 1.25rem;overflow-x:auto;border-bottom:1px solid #9a91c52e;scrollbar-width:thin}
.villages-lore-filters button{white-space:nowrap;background:transparent;border-color:transparent;font-size:.8rem;min-height:38px}
.villages-lore-filters button[aria-pressed=true]{background:#8b68df29;border-color:#b59af180;color:#e3d5ff}
.villages-lore-panes{display:grid;grid-template-columns:minmax(230px,.8fr) minmax(0,1.3fr);min-height:0;flex:1;overflow:hidden}
.villages-lore-list{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid #9a91c52e;background:#0c14242b}
.villages-lore-search{padding:1rem;flex:none}
.villages-lore-search input{width:100%;min-width:0;min-height:44px;padding:.65rem .8rem;border:1px solid #8177a770;border-radius:.6rem;background:#090f2540;color:#edf0ff;font:inherit;font-size:.85rem}
.villages-lore-search input::placeholder{color:#a4abc6}
.villages-lore-search>span{display:block;padding:.6rem .2rem 0;color:#9ca6c5;font-size:.7rem;letter-spacing:.04em}
.villages-lore-rows{flex:1;overflow:auto;padding:0 .75rem 1rem;scrollbar-width:thin;scrollbar-color:#80729760 transparent}
.villages-lore-rows>button{display:flex;flex-direction:column;align-items:flex-start;width:100%;gap:.2rem;text-align:left;padding:.85rem;margin-bottom:.45rem;border:1px solid transparent;border-bottom-color:#8386b027;border-radius:.65rem;background:transparent;overflow-wrap:anywhere}
.villages-lore-rows>button[aria-pressed=true]{background:linear-gradient(120deg,#9572e030,#47346540);border-color:#b193ee99;box-shadow:inset 3px 0 #b89afa}
.villages-lore-rows>button strong{font-size:.9rem;font-weight:650;line-height:1.35}
.villages-lore-rows>button>span:not(.villages-lore-tags){font-size:.75rem;color:#aeb8d4}
.villages-lore-rows time{font-size:.68rem;color:#929cbb;margin-top:.25rem}
.villages-lore-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.35rem}
.villages-lore-tags>span{border:1px solid #9a91c530;border-radius:2rem;padding:.1rem .45rem;color:#c8c8e4;background:#aba3e00a;font-size:.65rem}
.villages-lore-detail{overflow:auto;min-height:0;min-width:0;padding:1.4rem 1.6rem 2rem;scrollbar-width:thin;scrollbar-color:#80729760 transparent;overflow-wrap:anywhere}
.villages-lore-detail h4{margin:0;font-size:1.45rem;letter-spacing:-.035em;line-height:1.25;color:#f6f3ff}
.villages-lore-muted{color:#abb5d0;font-size:.8rem;margin:.4rem 0 1rem}
.villages-lore-uses{display:flex;flex-wrap:wrap;gap:.4rem;margin:1.1rem 0;max-height:9rem;overflow:auto}
.villages-lore-uses button{display:flex;flex-direction:column;align-items:flex-start;max-width:100%;text-align:left;padding:.45rem .65rem;background:transparent;font-size:.72rem;border-color:#8d80bc40}
.villages-lore-uses button span{color:#9da9c9;font-size:.65rem}
.villages-lore-uses button[aria-pressed=true]{background:#9671de20;border-color:#b79be680}
.villages-lore-why{padding:1rem 1.1rem;border:1px solid #ad8de37a;border-left:3px solid #b898f4;border-radius:.65rem;background:linear-gradient(120deg,#9572e026,#a18eda08);margin-top:1rem}
.villages-lore-why>span{color:#c3b0eb;text-transform:uppercase;letter-spacing:.09em;font-size:.65rem;font-weight:650}
.villages-lore-why p{font-size:1rem;line-height:1.5;margin:.4rem 0 0;color:#f0e8ff}
.villages-lore-stamp{display:flex;flex-wrap:wrap;gap:.3rem .6rem;margin:.7rem 0 1.2rem;font-size:.7rem;color:#9ba7c9}
.villages-lore-stamp time{color:#c2cae0}
.villages-lore-facts{margin:1rem 0;font-size:.78rem}
.villages-lore-facts>div{display:grid;grid-template-columns:minmax(100px,.75fr) minmax(0,1.3fr);gap:.6rem;padding:.65rem 0;border-bottom:1px solid #9a91c52e}
.villages-lore-facts dt{color:#98a4c4}.villages-lore-facts dd{margin:0;color:#d5dbec}
.villages-lore-context{margin-top:1.5rem}.villages-lore-context h5{margin:0;font-size:.82rem;color:#d7d8ed;font-weight:650}
.villages-lore-context>p{color:#99a5c7;margin:.3rem 0 .6rem;font-size:.72rem}
.villages-lore-context blockquote{white-space:pre-wrap;margin:.6rem 0 0;padding:.9rem 1rem;border:1px solid #8b84b035;border-radius:.6rem;background:#050e203d;color:#bec8e3;font-size:.82rem;line-height:1.8;overflow-wrap:anywhere}
.villages-lore-context mark{background:#a57bfa40;color:#f4e9ff;border-bottom:1px solid #c09bff;padding:.08rem .15rem;border-radius:.2rem}
.villages-lore-secondary blockquote{font-size:.75rem;color:#aab5ce}
.villages-lore-empty{padding:1.2rem;color:#aab5d0;font-size:.85rem}.villages-lore-empty h4{color:#e1dcf2;font-size:1rem;margin:0}.villages-lore-empty p{margin:.5rem 0}
.villages-lore-dialog .villages-lore-back{display:none}
@container(max-width:1050px){.villages-founding-overlay>dialog.villages-lore-dialog{width:94%}.villages-lore-detail{padding:1.2rem}}
@container(max-width:620px){
.villages-founding-overlay>dialog.villages-lore-dialog{width:100%;border-radius:0;border:0}
.villages-lore-dialog>header{padding:.65rem 1rem}.villages-lore-filters{padding:.6rem .75rem}.villages-lore-filters button{min-height:44px}
.villages-lore-panes{grid-template-columns:minmax(0,1fr)}.villages-lore-list{border-right:0}
.villages-lore-panes[data-reading=false]>.villages-lore-detail,.villages-lore-panes[data-reading=true]>.villages-lore-list{display:none}
.villages-lore-dialog .villages-lore-back{display:block;margin:0 0 1rem;padding:.35rem 0;border:0;background:transparent;color:#c2a4ff;font-size:.8rem}
.villages-lore-detail{padding:1rem 1.1rem 2rem}.villages-lore-detail h4{font-size:1.3rem}.villages-lore-launch{min-height:44px}.villages-lore-toolbar{padding:.15rem .7rem}
}
`;
