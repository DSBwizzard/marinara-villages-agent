import type { ReactNode } from "react";
import { ELEMENT_TAG as P } from "./constants.js";

export type WorkspaceDestination = "map" | "places" | "people" | "projects" | "more";
const destinations: WorkspaceDestination[] = ["map", "places", "people", "projects", "more"];
const icons: Record<WorkspaceDestination, ReactNode> = {
  map: (
    <>
      <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z" />
      <path d="M9 3v16M15 5v16" />
    </>
  ),
  places: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-3a7 7 0 0 1 14 0v3ZM17 3a4 4 0 0 1 0 8M20 21v-3a7 7 0 0 0-3-6" />
    </>
  ),
  projects: (
    <>
      <path d="m14 5 5 5M3 21l9-9m1-8 3-2 6 6-2 3-7-7ZM3 21l3-1-2-2-1 3Z" />
    </>
  ),
  more: <path d="M4 6h16M4 12h16M4 18h16" />,
};

const styles = `
.${P}-workspace-desk{box-sizing:border-box;display:flex;min-height:0;height:100%;padding:clamp(.5rem,2vw,2rem);background:#51321e url('/api/capability-packages/villages/assets/menu-desk.jpg') center/cover;font-family:Georgia,"Times New Roman",serif}
.${P}-workspace-board{display:flex;flex:1;flex-direction:column;min-width:0;min-height:0;border:2px solid #b89362;outline:5px solid #17232a;background:#1b2930;color:#f5eee0;box-shadow:0 5px 18px #0009}
.${P}-workspace-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));flex:none;border-bottom:1px solid #a8875f}
.${P}-workspace-nav button{display:flex;align-items:center;justify-content:center;gap:.65rem;min-width:0;min-height:54px;padding:.4rem;border:0;border-right:1px solid #516069;background:transparent;color:#f5eee0;font:inherit;cursor:pointer}
.${P}-workspace-nav button[aria-current="page"]{background:#d9ad72;color:#17232a}
.${P}-workspace-nav button:disabled,.${P}-workspace-venues button:disabled{opacity:.55;cursor:default}
.${P}-workspace-nav svg{width:24px;height:24px;flex:none;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
.${P}-workspace-body{display:flex;flex:1;min-height:0;min-width:0;gap:.45rem;padding:.45rem}
.${P}-workspace-sidebar{flex:0 0 clamp(210px,25%,340px);min-width:0;min-height:0;overflow:auto;border:1px solid #7a8584;background:#202f36;padding:.8rem}
.${P}-workspace-content{flex:1;min-width:0;min-height:0;overflow:auto;border:1px solid #7a8584;background:#202f36}
.${P}-workspace-sidebar h2{margin:.15rem 0 .8rem;color:#fff8eb;font-size:1.5rem}
.${P}-workspace-venues{display:grid;gap:.25rem}
.${P}-workspace-venues button{display:flex;align-items:center;gap:.65rem;width:100%;min-height:72px;padding:.4rem;border:1px solid transparent;border-bottom-color:#536168;background:transparent;color:#f5eee0;font:inherit;text-align:left;cursor:pointer}
.${P}-workspace-venues button[aria-pressed="true"]{background:#d9ad72;border-color:#efc994;color:#18252d}
.${P}-workspace-venues img{width:72px;height:56px;object-fit:cover;flex:none}
.${P}-workspace-venues span{min-width:0}.${P}-workspace-venues strong,.${P}-workspace-venues small{display:block;overflow-wrap:anywhere}.${P}-workspace-venues small{font-size:.8rem}
.${P}-workspace-venue-picker{display:none}
.${P}-workspace-content .${P}-venue-profile{max-width:none;margin:0;padding:.45rem;background:transparent;color:#f5eee0;box-sizing:border-box}
.${P}-workspace-venue-header{position:relative;isolation:isolate;overflow:hidden;min-height:140px;padding:1rem;background:#111b20;color:#fff9ef}
.${P}-workspace-venue-header img{position:absolute;z-index:-2;inset:0;width:100%;height:100%;object-fit:cover}
.${P}-workspace-venue-header::before{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,#101719ef 0%,#101719b8 38%,#10171920 100%)}
.${P}-workspace-venue-header h1{color:#fff9ef}.${P}-workspace-venue-header button{flex:none}
.${P}-workspace-content .${P}-venue-sections{border:1px solid #758180}
.${P}-workspace-content .${P}-venue-sections button{color:#f5eee0;border:0;border-right:1px solid #758180}
.${P}-workspace-content .${P}-venue-sections button[aria-pressed="true"]{background:#d9ad72;color:#18252d}
.${P}-workspace-content .${P}-venue-profile-body{max-width:none;margin:0;padding:1rem;box-sizing:border-box}
.${P}-workspace-about{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:1.5rem}
.${P}-workspace-about h2{padding-bottom:.4rem;border-bottom:1px solid #607076}
.${P}-workspace-about p{line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
.${P}-workspace-facts{border-left:1px solid #53656a;padding-left:1rem}
.${P}-workspace-facts dl{margin:0}.${P}-workspace-facts dl>div{display:grid;grid-template-columns:8rem minmax(0,1fr);gap:.5rem;padding:.5rem 0;border-bottom:1px solid #405157}
.${P}-workspace-facts dt{color:#b3d0d8}.${P}-workspace-facts dd{margin:0;overflow-wrap:anywhere}
.${P}-workspace-content .${P}-venue-primary{display:inline-block;width:auto;padding:.7rem 1rem;border-radius:.2rem;background:#d9ad72;color:#18252d}
.${P}-workspace-content .${P}-venue-zone-details{background:#1a292f;border-color:#758180;border-radius:.2rem}
.${P}-workspace-content .${P}-sectioned-menu{--background:#202f36;--foreground:#f5eee0;--popover:#25373e;--muted:#33474d;--muted-foreground:#c9d2ce;--border:#738382;--primary:#d9ad72;--primary-foreground:#17232a;height:100%;background:#202f36;color:var(--foreground)}
.${P}-workspace-content .${P}-sectioned-menu>.${P}-header{background:#1b2930;border-color:#738382}
.${P}-workspace-content .${P}-sectioned-menu .${P}-menu-nav{background:#202f36;border-color:#738382}
.${P}-workspace-content .${P}-sectioned-menu .${P}-menu-nav .${P}-button[data-active="true"]{background:#d9ad72;border-color:#efc994;color:#18252d;box-shadow:none}
.${P}-workspace-content .${P}-menu-content :is(.${P}-panel,.${P}-overlay){background:#25373e;border-color:#738382;border-radius:.2rem}
.${P}-workspace-content .${P}-menu-content .${P}-button{background:#2c4047;color:#f5eee0;border-color:#738382}
.${P}-workspace-content .${P}-sectioned-menu button:not([class]){min-height:44px;padding:.5rem .8rem;border:1px solid #738382;border-radius:.2rem;background:#2c4047;color:#f5eee0;font:inherit;cursor:pointer}
.${P}-workspace-content .${P}-sectioned-menu input[type="checkbox"]{accent-color:#d9ad72}
.${P}-workspace-content .${P}-sectioned-menu fieldset{border-color:#738382;border-radius:.2rem}
.${P}-workspace-content .${P}-menu-content :is(input:not([type="checkbox"]):not([type="radio"]),select,textarea){background:#17252c;color:#f5eee0;border-color:#738382}
.${P}-workspace-desk :is(button,input,select,textarea):focus-visible{outline:3px solid #f4cf94;outline-offset:2px}
@media(max-width:700px){
 .${P}-workspace-desk{padding:.4rem}
 .${P}-workspace-nav button{min-height:48px;gap:.1rem;flex-direction:column;font-size:.72rem}
 .${P}-workspace-nav svg{width:20px;height:20px}
 .${P}-workspace-body{flex-direction:column}
 .${P}-workspace-sidebar{flex:none;overflow:visible;padding:.5rem}
 .${P}-workspace-sidebar h2,.${P}-workspace-venues{display:none}
 .${P}-workspace-venue-picker{display:flex;align-items:center;gap:.5rem}
 .${P}-workspace-venue-picker select{flex:1;min-width:0;min-height:44px;background:#17252c;color:#f5eee0;border:1px solid #7a8584;font:inherit}
 .${P}-workspace-venue-header{min-height:110px;padding:.65rem}
 .${P}-workspace-content .${P}-venue-profile-body{padding:.65rem}
 .${P}-workspace-about{grid-template-columns:minmax(0,1fr);gap:.75rem}
 .${P}-workspace-facts{border:0;padding:0}
}
`;

export function WorkspaceShell({
  active,
  onNavigate,
  sidebar,
  children,
  disabled = false,
}: {
  active: WorkspaceDestination;
  onNavigate(destination: WorkspaceDestination): void;
  sidebar?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={`${P}-root ${P}-workspace-desk`}>
      <style>{styles}</style>
      <div className={`${P}-workspace-board`}>
        <nav className={`${P}-workspace-nav`} aria-label="Village navigation">
          {destinations.map((name) => (
            <button
              type="button"
              key={name}
              disabled={disabled}
              aria-current={active === name ? "page" : undefined}
              onClick={() => onNavigate(name)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {icons[name]}
              </svg>
              <span>{name[0].toUpperCase() + name.slice(1)}</span>
            </button>
          ))}
        </nav>
        <div className={`${P}-workspace-body`}>
          {sidebar ? <aside className={`${P}-workspace-sidebar`}>{sidebar}</aside> : null}
          <div className={`${P}-workspace-content`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
