// Authoritative Villages package metadata; generated payloads are built from this definition.
export const villagesDefinition = {
  "id": "villages",
  "version": "0.6.170",
  "minEngineVersion": "2.4.6",
  "maxEngineExclusive": "4.0.0",
  "name": "Villages",
  "description": "A text-first shared-life sim in any setting that reconstructs elapsed life when you return.",
  "category": "misc",
  "kind": [
    "agent"
  ],
  "modes": [
    "conversation",
    "roleplay",
    "game"
  ],
  "permissions": [
    "network",
    "routes",
    "storage",
    "ui",
    "chat-read",
    "chat-write"
  ],
  "serverImport": "src/engine/packages/server/src/services/villages/server-entry.ts",
  "serverEntry": true,
  "clientImport": "src/client/entry/index.tsx",
  "agent": {
    "runtimeDisabled": false
  },
  "assetPaths": [
    "villages-icon.png",
    "founding-rebuild.jpg",
    "founding-pioneer.jpg",
    "founding-prosper.jpg",
    "founding-custom.jpg",
    "founding-none.jpg"
  ],
  "boundaryDisplayName": "Villages",
  "capabilityApi": {
    "major": 1,
    "minor": 14
  },
  "contributions": {
    "slots": [
      "home-browser-tab",
      "roleplay-tracker",
      "tracker-panel"
    ],
    "homeBrowserTab": {
      "label": "Villages",
      "ariaLabel": "Open Villages",
      "iconPaths": [
        "villages-icon.png"
      ]
    },
    "assets": {
      "paths": [
        "founding-rebuild.jpg",
        "founding-pioneer.jpg",
        "founding-prosper.jpg",
        "founding-custom.jpg",
        "founding-none.jpg"
      ]
    }
  }
};
