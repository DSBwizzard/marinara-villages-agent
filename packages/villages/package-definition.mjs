import { letterFontAssets } from "./letter-font-assets.mjs";

const description = "A text-first shared-life sim in any setting that reconstructs elapsed life when you return.";
const menuArtAssets = [
  "storybook-background-wide.webp",
  "storybook-background-day.webp",
  "storybook-scenery-matte.webp",
  "venue-fallback.webp",
  "venue-fallback-day.webp",
];

// Authoritative Villages package metadata; generated payloads are built from this definition.
export const villagesDefinition = {
  id: "villages",
  version: "0.8.3",
  minEngineVersion: "2.5.2",
  maxEngineExclusive: "4.0.0",
  name: "Villages",
  description:
    description +
    " Install the package, restart Marinara Engine when prompted, then open Villages from Home. Add characters from your library, then talk to them in the village tab.",
  category: "misc",
  kind: ["agent"],
  modes: ["conversation", "roleplay", "game"],
  permissions: ["network", "routes", "storage", "ui"],
  serverImport: "src/server/entry/index.ts",
  serverEntry: true,
  clientImport: "src/client/entry/index.tsx",
  entrypoints: { agents: "agents.json", server: "server.mjs", client: "client.js" },
  agent: {
    description,
    runtimeDisabled: false,
  },
  assetPaths: [...letterFontAssets, "villages-icon.png", "icon-licenses.txt", ...menuArtAssets],
  boundaryDisplayName: "Villages",
  capabilityApi: {
    major: 1,
    minor: 818,
  },
  contributions: {
    slots: ["home-browser-tab"],
    homeBrowserTab: {
      label: "Villages",
      ariaLabel: "Open Villages",
      iconPaths: ["villages-icon.png"],
    },
    assets: {
      paths: [...letterFontAssets.filter((path) => path.endsWith(".json")), ...menuArtAssets],
    },
  },
};
