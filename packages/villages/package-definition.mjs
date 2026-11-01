import { letterFontAssets } from "./letter-font-assets.mjs";

const description = "A text-first shared-life sim in any setting that reconstructs elapsed life when you return.";

// Authoritative Villages package metadata; generated payloads are built from this definition.
export const villagesDefinition = {
  id: "villages",
  version: "0.7.3",
  minEngineVersion: "2.5.0",
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
  assetPaths: [
    ...letterFontAssets,
    "villages-icon.png",
    "icon-licenses.txt",
    "menu-desk.jpg",
    "founding-rebuild.jpg",
    "founding-pioneer.jpg",
    "founding-prosper.jpg",
    "founding-custom.jpg",
    "founding-none.jpg",
  ],
  boundaryDisplayName: "Villages",
  capabilityApi: {
    major: 1,
    minor: 66,
  },
  contributions: {
    slots: ["home-browser-tab"],
    homeBrowserTab: {
      label: "Villages",
      ariaLabel: "Open Villages",
      iconPaths: ["villages-icon.png"],
    },
    assets: {
      paths: [
        ...letterFontAssets.filter((path) => path.endsWith(".json")),
        "menu-desk.jpg",
        "founding-rebuild.jpg",
        "founding-pioneer.jpg",
        "founding-prosper.jpg",
        "founding-custom.jpg",
        "founding-none.jpg",
      ],
    },
  },
};
