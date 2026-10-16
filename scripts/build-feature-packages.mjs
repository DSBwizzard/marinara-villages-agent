// Compatibility entry for older local tooling. Ordinary builds use npm run build.
const args = process.argv.slice(2);
if (args.length && (args.length !== 1 || args[0] !== "villages"))
  throw new Error("This repository builds only Villages. Use npm run build.");
await import("./build-villages.mjs");
