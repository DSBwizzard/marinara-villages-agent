import { createHash } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import { copyFile, cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { catalogArtworkUrl } from "./catalog-artwork.mjs";
import { createDeterministicZip } from "./deterministic-zip.mjs";
import { readCatalogFamily, writeCatalogFamily } from "./catalog-lanes.mjs";
import { assertHierarchicalMapsPrivateImportBoundary } from "./hierarchical-maps-boundary.mjs";
import { assertPackagePrivateImportBoundary } from "./package-engine-boundary.mjs";
import { withPackageActivationGuidance } from "./catalog-package-guidance.mjs";
import { writeEnglishPackageLocale } from "./package-locales.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const engineRootArgument = process.env.MARINARA_ENGINE_ROOT;
if (!engineRootArgument) throw new Error("Set MARINARA_ENGINE_ROOT to the current Marinara Engine checkout.");
const engineRoot = resolve(engineRootArgument);

// Tool binaries run as JS entrypoints under the current Node instead of via
// `pnpm exec`: pnpm is a .cmd on Windows that bare spawnSync cannot start, and
// shell-mode spawning would mangle arguments that contain spaces (the esbuild
// banner). Resolution goes through the engine workspace that declares each
// tool, so the pnpm strict layout still applies.
const engineRequire = createRequire(pathToFileURL(join(engineRoot, "package.json")));
const engineClientRequire = createRequire(pathToFileURL(join(engineRoot, "packages/client/package.json")));
// esbuild honors NODE_PATH; `pnpm exec` used to provide the module paths, so
// list every workspace node_modules a vendored source can import from (pnpm's
// strict layout keeps each package's deps in its own node_modules symlinks).
// This repo's own node_modules comes FIRST so a package pinned in BOTH repos
// (zod) resolves to a single copy everywhere — the vendored shared dist
// already reaches it by directory walk-up, and two distinct realpaths would
// bundle twice (review finding: doubled zod bloated every bundle ~6-20%).
const engineNodePathDirs = [
  join(repoRoot, "node_modules"),
  join(engineRoot, "node_modules"),
  join(engineRoot, "packages/server/node_modules"),
  join(engineRoot, "packages/shared/node_modules"),
  join(engineRoot, "packages/client/node_modules"),
];
let engineNodePath = engineNodePathDirs.join(process.platform === "win32" ? ";" : ":");

// esbuild's bin is a JS shim on Windows but is optimized into the NATIVE
// executable by its postinstall on POSIX — running that under node would try
// to parse machine code as JavaScript. Spawn it directly where it is
// executable; only Windows needs the node indirection (review finding).
function spawnEsbuild(args, options) {
  const bin = engineRequire.resolve("esbuild/bin/esbuild");
  return process.platform === "win32"
    ? spawnSync(process.execPath, [bin, ...args], options)
    : spawnSync(bin, args, options);
}
const artifactsDir = join(repoRoot, "artifacts");
const packagesDir = join(repoRoot, "packages");
const sourcesRoot = join(repoRoot, "sources/engine");
const hierarchicalMapsSourceRoot = join(packagesDir, "hierarchical-maps/src/engine");
const sourceRoot = process.env.MARINARA_ENGINE_SOURCE_ROOT
  ? resolve(process.env.MARINARA_ENGINE_SOURCE_ROOT)
  : existsSync(sourcesRoot)
    ? sourcesRoot
    : engineRoot;
// An external MARINARA_ENGINE_SOURCE_ROOT tree carries its own dependency
// installs; without these entries its bare imports (e.g. chess.js) cannot
// resolve (review finding).
if (process.env.MARINARA_ENGINE_SOURCE_ROOT && sourceRoot !== engineRoot && sourceRoot !== sourcesRoot) {
  engineNodePath = [
    ...engineNodePathDirs.slice(0, 1),
    join(sourceRoot, "node_modules"),
    join(sourceRoot, "packages/server/node_modules"),
    join(sourceRoot, "packages/shared/node_modules"),
    join(sourceRoot, "packages/client/node_modules"),
    ...engineNodePathDirs.slice(1),
  ].join(process.platform === "win32" ? ";" : ":");
}
const packageSharedEntry = join(repoRoot, "sources/package-shared.ts");
const MIN_ENGINE_VERSION = "2.4.6";
const MAX_ENGINE_EXCLUSIVE = "4.0.0";
const hierarchicalMapsOwnedSourcePaths = [
  "packages/server/src/routes/spatial-context.routes.ts",
  "packages/server/src/services/spatial-context",
  "packages/server/src/services/storage/spatial-context.storage.ts",
  "packages/client/src/features/spatial-context",
  "packages/client/src/hooks/use-spatial-context.ts",
  "packages/client/src/components/game/GameWorldMap.tsx",
  "packages/maps-shared",
];
const longTermMemoryOwnedSourcePaths = [
  "packages/shared/src/features/agents/long-term-memory",
  "packages/server/src/services/long-term-memory",
  "packages/client/src/features/long-term-memory",
];
const longTermMemorySourceRoot = join(packagesDir, "long-term-memory/src/engine");
const memoryNagSourceRoot = join(packagesDir, "memory-nag/src/engine");
const memoryNagOwnedSourcePaths = [
  "packages/shared/src/features/agents/memory-nag",
  "packages/server/src/services/memory-nag",
  "packages/client/src/features/memory-nag",
];
const noodleSourceRoot = join(packagesDir, "noodle/src/engine");
const noodleOwnedSourcePaths = [
  "packages/client/src/components/noodle",
  "packages/client/src/hooks/use-noodle.ts",
  "packages/client/src/hooks/use-noodle-custom-emojis.ts",
  "packages/client/src/lib/noodle-custom-emojis.ts",
  "packages/client/src/localization/locales",
  "packages/client/src/noodle-package-entry.tsx",
  "packages/client/src/stores/noodle-package.store.ts",
  "packages/server/src/db/schema/noodle.ts",
  "packages/server/src/routes/noodle.routes.ts",
  "packages/server/src/services/noodle/noodle-ambient-profile-generation.service.ts",
  "packages/server/src/services/noodle/noodle-ambient-profiles.ts",
  "packages/server/src/services/noodle/noodle-context.ts",
  "packages/server/src/services/noodle/noodle-generated-activity.service.ts",
  "packages/server/src/services/noodle/noodle-generated-profiles.ts",
  "packages/server/src/services/noodle/noodle-generated-refresh.ts",
  "packages/server/src/services/noodle/noodle-generation-log.ts",
  "packages/server/src/services/noodle/noodle-handle.ts",
  "packages/server/src/services/noodle/noodle-image-prompt-rewrite.ts",
  "packages/server/src/services/noodle/noodle-image-format.ts",
  "packages/server/src/services/noodle/noodle-image-prompt.ts",
  "packages/server/src/services/noodle/noodle-image-retry.ts",
  "packages/server/src/services/noodle/noodle-interaction-policy.ts",
  "packages/server/src/services/noodle/noodle-model-capabilities.ts",
  "packages/server/src/services/noodle/noodle-participant-selection.ts",
  "packages/server/src/services/noodle/noodle-post-target.ts",
  "packages/server/src/services/noodle/noodle-profile-avatar.ts",
  "packages/server/src/services/noodle/noodle-profile-selection.ts",
  "packages/server/src/services/noodle/noodle-prompt.ts",
  "packages/server/src/services/noodle/noodle-public-generation.service.ts",
  "packages/server/src/services/noodle/noodle-public-images.service.ts",
  "packages/server/src/services/noodle/noodle-public-profiles.service.ts",
  "packages/server/src/services/noodle/noodle-public-prompt.service.ts",
  "packages/server/src/services/noodle/noodle-public-support.ts",
  "packages/server/src/services/noodle/noodle-prompt-safety.ts",
  "packages/server/src/services/noodle/noodle-refresh-schedule.ts",
  "packages/server/src/services/noodle/noodle-refresh-scheduler.service.ts",
  "packages/server/src/services/noodle/noodle-response-format.ts",
  "packages/server/src/services/noodle/noodle-sampling-options.ts",
  "packages/server/src/services/noodle/noodle-vision.ts",
  "packages/server/src/services/noodle/server-entry.ts",
  "packages/server/src/services/prompt-overrides/registry/noodle.ts",
  "packages/server/src/services/storage/noodle-refresh-run-retention.ts",
  "packages/server/src/services/storage/noodle.storage.ts",
];
const slurpSourceRoot = join(packagesDir, "slurp/src/engine");
const slurpOwnedSourcePaths = [
  "packages/client/src/components/slurp",
  "packages/client/src/hooks/use-slurp.ts",
  "packages/client/src/localization/locales",
  "packages/client/src/slurp-package-entry.tsx",
  "packages/client/src/stores/slurp-package.store.ts",
  "packages/server/src/db/schema/slurp.ts",
  "packages/server/src/routes/slurp.routes.ts",
  "packages/server/src/services/slurp",
  "packages/server/src/services/storage/slurp.storage.ts",
];
const villagesSourceRoot = join(packagesDir, "villages/src/engine");
const villagesOwnedSourcePaths = [
  "packages/shared/src/villages",
  "packages/client/src/villages-chat-paragraphs.ts",
  "packages/client/src/villages-inline-markdown.ts",
  "packages/client/src/villages-package-entry.tsx",
  "packages/client/src/villages-decisions-control.tsx",
  "packages/client/src/villages-saved-changes.tsx",
  "packages/client/src/villages-scene-styles.ts",
  "packages/client/src/villages-scene-viewport.ts",
  "packages/client/src/villages-player-role.tsx",
  "packages/client/src/villages-relationships.tsx",
  "packages/client/src/villages-founding-editor.tsx",
  "packages/client/src/villages-room-reading.ts",
  "packages/client/src/villages-sprite-stage.ts",
  "packages/client/src/villages-sprite-studio.tsx",
  "packages/client/src/villages-sprite-library.tsx",
  "packages/client/src/villages-sprite-render-cache.ts",
  "packages/client/src/villages-venue-send.ts",
  "packages/client/src/villages-mobile-exploration.tsx",
  "packages/client/src/villages-mobile-map.ts",
  "packages/client/src/villages-snapshot-normalization.ts",
  "packages/server/src/routes/villages.routes.ts",
  "packages/server/src/services/villages",
];
const reuseExistingRuntime = process.env.MARINARA_REUSE_FEATURE_RUNTIME === "1";
const rebuiltFeatureClients = new Set(
  String(process.env.MARINARA_REBUILD_FEATURE_CLIENTS || "")
    .split(",")
    .filter(Boolean),
);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function prepareFeatureBuildRoot(feature) {
  if (feature.id === "noodle" || feature.id === "slurp" || feature.id === "villages") {
    if (!existsSync(feature.packageSourceRoot)) {
      throw new Error(`Missing package-owned ${feature.name} source`);
    }
    const buildRoot = await mkdtemp(join(tmpdir(), `marinara-${feature.id}-source-`));
    await cp(sourceRoot, buildRoot, { recursive: true, force: true });
    await cp(feature.packageSourceRoot, buildRoot, { recursive: true, force: true });
    return {
      buildRoot,
      cleanup: () => rm(buildRoot, { recursive: true, force: true }),
    };
  }
  if (feature.id === "long-term-memory" || feature.id === "memory-nag") {
    if (!existsSync(feature.packageSourceRoot)) {
      throw new Error(`Missing package-owned ${feature.name} source`);
    }
    const buildRoot = await mkdtemp(join(tmpdir(), `marinara-${feature.id}-source-`));
    await cp(feature.packageSourceRoot, buildRoot, {
      recursive: true,
      force: true,
    });
    return {
      buildRoot,
      cleanup: () => rm(buildRoot, { recursive: true, force: true }),
    };
  }
  if (feature.id !== "hierarchical-maps") {
    return { buildRoot: sourceRoot, cleanup: async () => {} };
  }
  if (!existsSync(hierarchicalMapsSourceRoot)) {
    throw new Error("Missing package-owned Hierarchical Maps source");
  }
  const buildRoot = await mkdtemp(join(tmpdir(), "marinara-hierarchical-maps-source-"));
  await cp(hierarchicalMapsSourceRoot, buildRoot, {
    recursive: true,
    force: true,
  });
  return {
    buildRoot,
    cleanup: () => rm(buildRoot, { recursive: true, force: true }),
  };
}

async function captureEngineSources(metafilePath, buildRoot = sourceRoot, excludedPaths = []) {
  const metafile = JSON.parse(await readFile(metafilePath, "utf8"));
  const normalizedBuildRoot = resolve(buildRoot);
  for (const input of Object.keys(metafile.inputs || {})) {
    const absolute = resolve(engineRoot, input);
    // Separator-aware like capturePackageSources: resolve() yields \-delimited
    // paths on Windows, and the old /-based prefix check silently captured
    // nothing there (review finding).
    if (!absolute.startsWith(`${normalizedBuildRoot}${sep}`) || absolute.includes(`${sep}node_modules${sep}`)) continue;
    const relativePath = relative(normalizedBuildRoot, absolute);
    if (!relativePath || relativePath.startsWith(`..${sep}`) || relativePath === "..") continue;
    const normalizedRelativePath = relativePath.split(sep).join("/");
    if (excludedPaths.some((path) => normalizedRelativePath === path || normalizedRelativePath.startsWith(`${path}/`)))
      continue;
    const destination = join(sourcesRoot, normalizedRelativePath);
    if (absolute === destination) continue;
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(absolute, destination);
  }
}

async function capturePackageSources(metafilePath, buildRoot, excludedPaths) {
  const metafile = JSON.parse(await readFile(metafilePath, "utf8"));
  const normalizedBuildRoot = resolve(buildRoot);
  for (const input of Object.keys(metafile.inputs || {})) {
    const absolute = resolve(engineRoot, input);
    let realAbsolute;
    try {
      realAbsolute = realpathSync(absolute);
    } catch {
      continue;
    }
    if (!realAbsolute.startsWith(`${normalizedBuildRoot}${sep}`) || realAbsolute.includes(`${sep}node_modules${sep}`))
      continue;
    const relativePath = relative(normalizedBuildRoot, realAbsolute);
    if (!relativePath || relativePath.startsWith(`..${sep}`) || relativePath === "..") continue;
    const normalizedRelativePath = relativePath.split(sep).join("/");
    if (excludedPaths.some((path) => normalizedRelativePath === path || normalizedRelativePath.startsWith(`${path}/`)))
      continue;
    const destination = join(sourcesRoot, relativePath);
    if (absolute === destination) continue;
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(absolute, destination);
  }
}

async function removeOwnedSourceSnapshots(excludedPaths) {
  for (const path of excludedPaths) {
    await rm(join(sourcesRoot, path), { recursive: true, force: true });
  }
}

const features = [
  {
    id: "noodle",
    version: "1.2.15",
    minEngineVersion: "2.4.6",
    maxEngineExclusive: MAX_ENGINE_EXCLUSIVE,
    name: "Noodle",
    description: "Explore the Noodle public timeline as an optional local social world.",
    localizations: {
      de: {
        name: "Noodle",
        description:
          "Entdecke die öffentliche Noodle-Timeline als optionale lokale soziale Welt. Installiere das Paket, starte Marinara Engine nach Aufforderung neu und öffne dann unter Home den Tab Noodle.",
        homeBrowserTab: {
          label: "Noodle",
          ariaLabel: "Noodle öffnen",
        },
      },
      ko: {
        name: "Noodle",
        description:
          "Noodle 공개 타임라인을 선택형 로컬 소셜 세계로 만나 보세요. 패키지를 설치하고 안내에 따라 Marinara Engine을 다시 시작한 다음 홈 → Noodle을 여세요.",
        homeBrowserTab: {
          label: "Noodle",
          ariaLabel: "Noodle 열기",
        },
      },
      pl: {
        name: "Noodle",
        description:
          "Poznaj publiczną oś czasu Noodle jako opcjonalny lokalny świat społecznościowy. Zainstaluj pakiet, uruchom ponownie Marinara Engine po wyświetleniu monitu, a następnie otwórz zakładkę Noodle na stronie głównej.",
        homeBrowserTab: {
          label: "Noodle",
          ariaLabel: "Otwórz Noodle",
        },
      },
    },
    category: "misc",
    kind: ["agent"],
    modes: ["conversation", "roleplay", "game"],
    permissions: ["chat-read", "chat-write", "network", "routes", "storage", "ui"],
    serverImport: "packages/server/src/services/noodle/server-entry.ts",
    serverEntry: true,
    clientImport: "packages/client/src/noodle-package-entry.tsx",
    packageSourceRoot: noodleSourceRoot,
    ownedSourcePaths: noodleOwnedSourcePaths,
    libraryHidden: true,
    assetPaths: ["noodle-klusek.png"],
    contributions: {
      slots: ["home-browser-tab"],
      homeBrowserTab: {
        label: "Noodle",
        ariaLabel: "Open Noodle",
        iconPaths: ["noodle-klusek.png"],
      },
    },
  },
  {
    id: "slurp",
    version: "1.0.20",
    minEngineVersion: "2.4.6",
    maxEngineExclusive: MAX_ENGINE_EXCLUSIVE,
    name: "Slurp",
    description:
      "The standalone successor to NoodleR: create a local Creator profile from an Engine character or persona, publish public or locked posts, and simulate subscriptions and audience activity.",
    localizations: {
      de: {
        name: "Slurp",
        description:
          "Erstelle ein lokales Creator-Profil aus einem Engine-Charakter oder einer Engine-Persona, veröffentliche öffentliche oder gesperrte Beiträge und simuliere Abonnements und Publikumsaktivität. Installiere das Paket, starte Marinara Engine nach Aufforderung neu und öffne dann unter Home den Tab Slurp.",
        homeBrowserTab: {
          label: "Slurp",
          ariaLabel: "Slurp öffnen",
        },
      },
      ko: {
        name: "Slurp",
        description:
          "Engine 캐릭터나 Engine 페르소나로 로컬 크리에이터 프로필을 만들고, 공개 또는 잠긴 Slurp 게시물을 게시하며, 구독 및 청중 활동을 시뮬레이션합니다. 패키지를 설치하고 안내에 따라 Marinara Engine을 다시 시작한 다음 홈 → Slurp를 여세요.",
        homeBrowserTab: {
          label: "Slurp",
          ariaLabel: "Slurp 열기",
        },
      },
      pl: {
        name: "Slurp",
        description:
          "Utwórz lokalne profile twórców z postaci silnika lub person silnika, publikuj publiczne lub zablokowane posty Slurp i symuluj subskrypcje oraz aktywność publiczności. Zainstaluj pakiet, uruchom ponownie Marinara Engine po wyświetleniu monitu, a następnie otwórz zakładkę Slurp na stronie głównej.",
        homeBrowserTab: {
          label: "Slurp",
          ariaLabel: "Otwórz Slurp",
        },
      },
    },
    category: "misc",
    kind: ["agent"],
    modes: ["conversation", "roleplay", "game"],
    permissions: ["chat-read", "network", "routes", "storage", "ui"],
    serverImport: "packages/server/src/services/slurp/server-entry.ts",
    serverEntry: true,
    clientImport: "packages/client/src/slurp-package-entry.tsx",
    packageSourceRoot: slurpSourceRoot,
    ownedSourcePaths: slurpOwnedSourcePaths,
    libraryHidden: true,
    assetPaths: ["slurp-logo.png", "slurpagent.png"],
    contributions: {
      slots: ["home-browser-tab"],
      homeBrowserTab: {
        label: "Slurp",
        ariaLabel: "Open Slurp",
        iconPaths: ["slurp-logo.png"],
      },
    },
  },
  {
    id: "villages",
    // 0.4.68: a villager can end a conversation, and it is rarely the right thing to do.
    //
    // Until now every conversation in the village ended the same way: the player said
    // goodbye. A villager could walk out of a room and a room could be closed, but a
    // private word with one of them ran until the player stopped it — which is not how
    // talking to somebody works. People leave, and the ones who leave are usually the
    // ones with somewhere to be.
    //
    // So the turn carries a PERMISSION rather than a rule. An ordinary chat turn that is
    // not being asked for anything in particular — not a question being answered, not a
    // claim just ruled on, not a goodbye being written, not a room — is told that it MAY
    // end the conversation, and told in the same breath that it rarely should: only when
    // the talk has genuinely run out AND there is somewhere else to be, never as a way
    // past an awkward pause, and that a lull is not an ending. Most turns are not this
    // one, and the wording says so. The first two player turns omit this permission
    // so a new conversation cannot close before it has had a chance to continue.
    //
    // A villager who means it says a line of their own — what they have to get back to,
    // or that they will see the player again — and then writes a marker on a line at the
    // very end of the answer. The marker is the whole of how an ending is known to be
    // meant, so nothing can end a conversation by accident and nothing ends without it.
    // It is read once, before the answer is split into the beats it is drawn from, and
    // taken out before anything is stored: it never reaches the transcript, the
    // paragraph reader, the card, or a room.
    //
    // What happens next is the ending the tab already had. The route answers with the
    // conversation and one flag on it, the drawer runs the tail the End button runs —
    // the filing, the snapshot, the same road out — and the one part of it that is the
    // player's is removed, because there is nobody to say goodbye. The line they
    // finished on is held up in place of the conversation, exactly as the player's own
    // goodbye is, and the drawer says which of the two happened rather than telling a
    // player they said goodbye when they did not.
    //
    // A room is left alone on purpose. A villager saying goodbye to a room does not end
    // the room and does not close their own copy of it; the marker is stripped there and
    // otherwise ignored. Who ends a room is a question for another release.
    //
    // The one thing a suite cannot prove is the decision itself, because a model has to
    // make it. So the conversation's own debug menu has a press that says one real line
    // into the room that is already open and forces a real ending through that same road,
    // and its copy says in as many words that what it proves is that the road is joined up
    // end to end — not that a villager would ever choose to walk it.
    //
    // 0.4.73: the schedules panel is the Engine's own week, seven days deep and pressable.
    //
    // Three complaints, one cause. The panel showed a WINDOW of three days beginning today — the
    // Engine keeps seven, and a window is the panel deciding which of somebody's days are worth
    // looking at. It stacked every villager's week on top of the last, so a reader who came for one
    // person scrolled past the whole village to reach them. And it printed an hour's facts as one
    // unlabelled run of text, so the two things this panel exists to compare could not be told
    // apart. All three are the same mistake in different clothes: the panel had its own idea of
    // what an hour is instead of drawing the Engine's.
    //
    // So the panel is now the Engine's own week, at the Engine's own scale. Seven tracks per
    // resident, one per day, in order and beginning with today, each labelled with the Engine's
    // weekday and the village's own date for THAT occurrence of it — the Engine's week holds no
    // dates at all, so the two are joined in the panel and nowhere else. A day the Engine has
    // nothing for keeps its track and says so, because a blank row is a fact about the card and a
    // missing row is the panel losing one; a villager with no week at all gets seven of those,
    // which is a blank schedule rather than a gap.
    //
    // Every hour is a PRESS. The block geometry is the Engine's schedule editor's to the pixel,
    // including its floor on a block's width, so a player who has seen that screen does not have to
    // read a second, differently-shaped account of the same week to check it. Pressing one opens
    // exactly two LABELLED lines: `Schedule event:`, copied off the character card and never
    // touched, and `Agenda event:`, which is what every prompt downstream actually reads. They are
    // labelled because they are two different answers to one question, and a reader who cannot tell
    // which is which cannot tell a translation they disagree with from the schedule it was made
    // from. The place the translation named rides on the agenda line, because it is part of that
    // answer rather than a fact beside it.
    //
    // Everything else about the hour rides in a CAPTION beside the bubble — the availability token,
    // whether the clock is in it, and whether the village had words for it at all. A third kind of
    // statement inside the bubble would ask a reader to sort two kinds of claim apart on the one
    // row that has to be unambiguous, and none of those is a second answer about the hour. The
    // caption is also where 0.4.72's wish moved to: the wish that bent an hour was printed under the
    // agenda line, and it is not what the hour reads as, it is a note about how it came to read
    // that way. Nothing about which wish bent what changed — the same id, resolved at the same
    // moment, naming the same hour in the same panel.
    //
    // A night is drawn as the two pieces it really is. An hour that ends before it starts is one
    // block crossing midnight, so it is drawn at the right-hand edge of its own day's track AND at
    // the left-hand edge of the same track, both pieces the same press, the second carrying no name
    // because the hour was announced by the first. An hour with no place on a clock — the Engine's
    // own `whenever`, or a typo — is not dropped either: a range that cannot be read has no position
    // on a track, and dropping it would be this panel quietly shortening somebody's day, so those
    // hours are listed under their day, still pressable, still two lines when opened.
    //
    // Each resident is a disclosure, and shut. Shut, the panel is a list of names with their state
    // beside them — the missing card, the week's start date, whether the translation is out of date,
    // and the count of hours the village has no words for — which is the question a reader arrives
    // with; open, it is the whole week. It is a native `details` rather than a press this package
    // animates, because the browser already knows how to open one from a keyboard, how to announce
    // it as expanded, and how to leave one open for a reader coming back to it.
    //
    // Escape closes the opened hour and nothing else, handled on the resident's own body rather than
    // on the document, so a whole-panel listener is not paid for by every reader of the tab and a
    // reader who pressed Escape at a bubble does not also shut the surface behind it.
    //
    // Nothing is written by any of this, no stored field is added, no prompt changes and no model
    // call is spent, and `engine.min` does not move. The change has a server half — the week view
    // now answers with all seven days instead of a three-day window — so installing it needs a
    // restart like every release.
    //
    // The shape has a suite rather than a memory. `tests/villages-village-chat.regression.ts` holds
    // the seven-day window: seven days in order, today first, each weekday once, seven distinct
    // dates, a villager with no week getting seven days with nothing in them, and an unreadable
    // card doing the same. `tests/villages-schedule-remap.regression.ts` holds the panel itself: both
    // labelled lines present and in that order, both inside the resident's own disclosure and behind
    // no second press, the wish resolved from the id rather than stored as a name, and the wish
    // drawn in the caption beside the bubble rather than as a third line inside it.
    //
    // 0.4.72: the invisible half of a wish — its age, the day it dies, and which hour it
    // bent — is on the debug tab, and the tab says why an obvious press is not there.
    //
    // Nothing in this release changes what the village decides. It is the release where the
    // decisions can be LOOKED AT, which the wish work needed before it could be called done:
    // a wish never reaches a prompt as a fact and is never said out loud, so the debug tab is
    // the only place one can be checked at all, and without the second half of that check the
    // influence is invisible and a miss is indistinguishable from a bug. The failure this
    // display exists to catch is a specific one — a move tagged with a wish whose `here`
    // phrase plainly has nothing to do with it — and catching it needs the wish and the hour
    // it bent on one row.
    //
    // Per wish the tab now prints its age and its day: "written today / written yesterday /
    // written N days ago", then "dies 12 Oct" or "never dies". The dates are the one thing
    // about a wish that cannot be worked out afterwards, which is exactly why they are drawn:
    // a wish that vanishes between two visits is a bug until the day it was always going to
    // vanish on is printed beside it, and a wish with no readable deadline says "never dies"
    // rather than naming a day nobody wrote. The line is worked out where the row is drawn and
    // refreshed by the tab's own read of the agendas, so there is no timer to get out of step
    // with the clock the rest of the tab uses, and it carries the same device-clock ceiling
    // `useRealClock` carries.
    //
    // Per hour the tab names the wish that bent it, resolved from the id at the moment of
    // drawing rather than stored as a name, because a wish answered since is gone from the
    // list and a stored name would go on claiming an hour was bent by something that no
    // longer exists. The id travels out to the panel on the day block rather than being looked
    // up on the move it came from: the tab draws HOURS, and the translation already answered
    // what the hour reads as — a lookup in the panel would be a second answer to a question
    // that has one. An hour no wish bent prints nothing beside it, which is the load-bearing
    // half: an untagged hour must not inherit the wish above it, and an agenda written before
    // this release reads exactly like a week no wish has touched, which is the honest reading
    // of both.
    //
    // The press that is NOT there is now said out loud. "Send somebody there now" cannot exist
    // once a wish holds no place: the place is the translator's decision, and a button that
    // moved a villager would be the player's wish wearing theirs. The tab says so rather than
    // leaving the absence to be read as unfinished, and describes the one press it does have —
    // forget the translation — as what it is now: it throws away the village's reading of that
    // week, and the next one is written from the wishes as they stand then, so a wish answered
    // since no longer bends anything and a wish that arrived since does.
    //
    // Nothing is written by any of this, no stored field is added, and the only server-side
    // change is that `dayPlan` copies a move's `wishId` out onto the day block so the client
    // has something to resolve it against. The change has a server half, so installing it
    // needs a restart like every release.
    //
    // 0.4.71: a wish is something a villager can lose, and it is called a wish everywhere.
    //
    // A villager's list of wishes had exactly one way out and the player owned it: settle
    // the thing and the village helps them put it down. Everything else stayed on the list
    // for the life of the village, so a wish that had become impossible in the fiction —
    // and one everybody involved had simply moved on from — went on bending hours and
    // colouring prompts forever. Two of the three ways a wish actually leaves a person's
    // mind were missing, and neither of them happens because the player did anything.
    //
    // The first is a LAPSE, and only the narrator can notice it. The tick's reply carries a
    // fourth list beside happenings, memory and notices: `lapsed`, whose entries name a
    // resident and quote one of their wishes word for word. Because it is the one thing a
    // reply can say that TAKES SOMETHING AWAY, it is the only part of a reply checked twice
    // over: the name has to be a resident the village holds and the words have to be a wish
    // that resident is carrying, in full. A near miss is refused rather than repaired — a
    // wish quoted in full is a different wish the moment a letter changes — a stranger's
    // name is refused, somebody else's wish in the wrong mouth is refused, and the safe
    // direction to be wrong in is to let a wish run its course. Up to MAX_LAPSES_PER_WRITE
    // (3) come off one reply and the rest of it is written as usual, deduped by wish id so
    // naming the same wish twice spends one slot. A lapse is a line in one list and NOTHING
    // else: never a happening, never a memory, never a notice, never somebody announcing
    // that they have given up on something. The list is only in the prompt at all when
    // somebody in the village is actually holding a wish — otherwise the reply's shape is
    // the same three fields it has always been, so a village with no agendas is asked
    // exactly what it was asked before. And the model's sentence about a lapse is
    // deliberately not kept; what is kept is the id of a wish that is already stored.
    //
    // The second is the CLOCK, and it is what makes the list finite. Every wish is stamped
    // when it is written — `addedAt`, and `expiresAt` — and the lifetime is rolled ONCE
    // from the wish's own id: `wishLifetimeDays` is a sixteen-slot table indexed by
    // `hashString(id) % 16`, so it is one to seven days, three parts in four of them inside
    // three, and it is reproducible from the id alone. That is the whole reason it is rolled
    // off the id rather than stored at write time and derived again on read: nothing needs
    // the roll to survive a rebuild, so the two writers cannot disagree about it, and there
    // is no second derivation to get wrong. A villager is NEVER told about the deadline —
    // nothing in any prompt says a wish is running out, because nobody knows that about
    // themselves and a wish with a countdown is a quest with a timer on it. Wishes are taken
    // off the record by `dropExpiredWishes` on the part of the day that passes them, and
    // that pass runs ABOVE both tick switches, BEFORE the week is retranslated. The order is
    // load-bearing rather than tidy: a wish is part of what a translation is written from
    // AND part of what says a written one is stale, so a dead wish left on the list would
    // bend hours around something nobody is carrying any more and file the answer under a
    // signature the very next part of the day disagrees with. A wish whose dates cannot be
    // read — everything stored before this release — has no deadline at all rather than a
    // guessed one, and never expires.
    //
    // Losing one ASKS FOR ANOTHER, and this is the one place in the package where losing
    // something spends a model call. A villager left short is asked what they want next
    // (`buildNextWishMessages`, the call the settled-wish replacement already made), in the
    // same breath as the part of day that took the wish away, with the dead wish's own words
    // handed over as the thing NOT to wish for again. It is capped at
    // WISH_REFILLS_PER_PASS (2): a roster written in one afternoon loses a whole village's
    // worth of wishes on the same day and one part of a day is not allowed to answer that
    // with sixty calls, so whoever is left over is asked on the next one. That pass spends
    // its calls ABOVE both switches, which is the one counter-intuitive thing here — a part
    // of day the player has switched off still ages wishes, and the list of who lost one is
    // the only copy that will ever exist, so a tick returning early must not throw it away
    // unanswered.
    //
    // Three ways out and one record. A wish leaves because the player settled it, because
    // the narrator lapsed it, or because its day came; all three end in a shorter list, which
    // is a shape the whole package already reads — the debug tab, the villager's prompt, the
    // judge's numbered list, and the hours the translation bends. Nothing downstream has to
    // know which way it went.
    //
    // Keeping a translation honest is what made the wish part of the signature. A remap move
    // carries the `wishId` it was bent by, the translation prompt now carries the villager's
    // wishes as a NUMBERED list (so a move can say "wish 2" and mean it), and
    // `remapSignature` digests the wishes alongside the week: id, the words, the tell, and
    // the floored intensity. So a wish entering or leaving that villager's list costs that
    // villager ONE model call on the next part of the day — the week is retranslated, for
    // them and nobody else — which is the price of a translation that knows what the week is
    // being lived for. It is also why the expiry pass has to run before the translation
    // rather than after it.
    //
    // Finally the rename, which is the whole of the vocabulary: `wants.ts` is `wishes.ts`,
    // `VillageWant` is `VillageWish`, the field is `VillageWish.wish` rather than `.want`,
    // the debug tab is "DEBUG: Villager Wishes", and the macro presets render is
    // `{{wishes}}`. Nothing the village says, stores or decides about a wish changed with
    // the words; the split existed only because the second half of the feature was built
    // after the first.
    //
    // What this costs on disk is two more fields on a wish the village already stores.
    // `engine.min` does not move, no permission is added, no dependency and no new file. A
    // village founded before this release reads exactly as it did, because its wishes have
    // neither date and therefore never expire.
    //
    // 0.4.70: the third debug press opens the menu it lives on, and a compiler is put over
    // the client tree so that the next one of these is caught before it ships.
    //
    // 0.4.69 moved the forced ending into the conversation's own debug menu and gave it a
    // name, and it blanked the tab. The press calls a prop, and the prop was declared in
    // the drawer's props type and handed over at the call site and left out of the
    // destructuring list at the top of the component. A prop that is declared and never
    // taken is not a prop: the name is bound nowhere, so the render threw the moment the
    // "..." menu opened, React unmounted the tree, and the whole village tab went black
    // with every control on it. Nothing in the repository could see it — the bundle is
    // built with no type pass, ESLint's `no-undef` is off for TypeScript, and the suites
    // read source as text, where a name that is written and a name that is bound are the
    // same text.
    //
    // So the fix is one missing word, and the guard is the one tool that was missing: a
    // compiler. `tests/villages-client-scope.regression.ts` puts the TypeScript that
    // `npm run check` already has on disk over all three files of the tab's client tree,
    // and fails on the family of diagnostics that mean a file is wrong on its own terms —
    // a name that resolves to nothing, a prop the type requires and the caller never hands
    // over, a binding read before it exists. React is not installed here and the tree has
    // no tsconfig, so the unresolved-module diagnostics that come with that are expected
    // and are counted rather than asserted on. The suite proves its own instrument armed
    // first, on a scratch file with a name nothing declares, because a guard that cannot
    // fail is not a guard — and it was watched failing on this exact bug, naming the line,
    // before the word was put back.
    //
    // The layout suite keeps the cheap local form of the same rule: the drawer has to TAKE
    // the press out of its props, not merely name it.
    //
    // 0.4.69: the press that forces a villager's ending is in the chat, where it is wanted.
    //
    // 0.4.68 put that press on the debug panel, beside "Write it again", on the argument
    // that the debug group is where a player goes to see the machinery. That was the wrong
    // room. The press acts on ONE conversation, and the panel could only reach it by
    // opening a room first — a navigation step for a press about the villager standing in
    // front of you — so it was never where anybody looked for it. It is in the
    // conversation's own DEBUG menu now, under the "..." beside Close chat and Force end
    // chat, and it is named for what it does rather than for what it achieves:
    // DEBUG: Force character-triggered chat end.
    //
    // The panel's paragraph about it went with it, because a press the panel no longer
    // draws does not need explaining there. Nothing else changed: the same flag, the same
    // effect, the same forced line, and the same road under it. The panel keeps the press
    // that rewrites an agenda, which is the one thing only it can do.
    //
    // It is shut until the villager has actually said hello, which is a state the panel
    // could not be in: a room with no hello in it has nobody to end anything, and in the
    // drawer that is one failed greeting away rather than impossible.
    //
    // 0.4.67: a crowd is a room you can walk into.
    //
    // Until now a place with more than one person standing in it was the one press the
    // map could not answer: the place screen listed them and said in as many words that
    // talking to more than one at once was not built, and the player picked one. This
    // release is the room — everybody standing there when the player walked in, in one
    // conversation, each of them keeping their own copy of it.
    //
    // A room is one conversation AT A PLACE rather than a second thing per villager, so
    // it is kept by the place and it belongs to the village: walking into a place nobody
    // has walked into before costs no model call at all, the room draws itself over the
    // village's own picture of the place, and a room closed on the map is read back
    // where it was left. Who is IN it is frozen on the first line the player says,
    // because an hour that turns mid-conversation must not change who they are talking
    // to.
    //
    // Who answers is a setting, because there are two honest ways to run a room and the
    // only way to choose between them is to try both. "Each of them answers" is the
    // default: one call per villager standing there, each asked for a reply of their
    // own to what was said, and the replies drawn in the order the village lists them.
    // "The room answers" is one call for the whole turn, answered as the room they are
    // standing in rather than as anybody in it, and read into a line per speaker. Four
    // villagers in one room is four calls one way and one call the other, and the
    // toggle says which in the Conversation settings beside the preset and the length.
    //
    // Every participant keeps their own copy. What is said in a room is written into
    // each participant's own conversation as something they heard rather than something
    // they said, so a room is not a second memory a villager has to be reconciled with
    // the first, and their next private word starts from the room they were just in.
    // Ending the room ends each of those copies through the same reader a private
    // conversation ends through; if one of them cannot put it into their own words the
    // room is kept whole to end again rather than left half-closed.
    //
    // On the map, a place with a crowd behind it offers the same two doors a house
    // does, because a crowd is a fork in the road too: About for the place and Enter for
    // the room. The place screen leads into the same room by one button under the names
    // — "Talk to all N of them" — and both presses hand the tab back to the map, where
    // the drawer lives, exactly as the villager list has always done it.
    //
    // 0.4.66: every house offers the same two doors, the one you live in included.
    //
    // 0.4.65 offered the two doors — About and Enter — to a pin with exactly one
    // villager behind it, which left the player's own house out entirely: no villager's
    // hour ever resolves to somebody else's address, so nothing is ever standing in it,
    // and the house the player looks at most was the one house the map decided for
    // them. It is a house like the house next door, so it is offered the same choice for
    // the same reason: a house is somewhere to look at or somewhere to walk into, and
    // an empty one is still both.
    //
    // The question is now one reader — `pinHasDoors` — asked both by the pin that draws
    // the doors and by the press that decides whether to offer them, so a pin can never
    // draw a choice the press would not offer, or the other way round. A house offers
    // both doors whether or not anybody is standing in it; a place with exactly one
    // person in it offers both, as before; everywhere else the press still means one
    // thing and goes straight to the place screen.
    //
    // And the two doors now mean two different things on every house. About opens the
    // place screen ON the About panel, which is the screen somebody asking about a house
    // is asking for; Enter means going in — a house with somebody in it meets you with
    // them, an empty one gives you the room and "You have the place to yourself." One
    // rule for every house, the player's included.
    //
    // 0.4.65: a house is named after whoever lives in it, and a place you can walk into.
    //
    // The map named houses after their BUILDING, so four pins on one picture all read
    // "Small home" and a player looking for somebody's door had nothing to go on. A
    // village does not name its houses — everybody knows where everybody lives — so a
    // house is named after its resident: "Professor Mari's house", and "Empty house"
    // for one nobody has moved into. The player's own house is named by the same rule
    // out of the Persona rather than by one of its own, because the player lives in a
    // house like everybody else does and the day they can move, the map has nothing to
    // learn. The look-around on the place screen reads the same two:
    // "You are standing in Professor Mari's house."
    //
    // And a pin with somebody behind it no longer answers for you. It used to open their
    // conversation outright, so a house with somebody in it could not be looked at —
    // asking what kind of house this is was answered with a greeting. Pressing such a
    // pin now opens two doors on the map, "About" and "Enter": About is the place
    // screen, Enter is the conversation. A press anywhere else on the picture, or on
    // another pin, is the way out of them.
    //
    // 0.4.64: a place is somewhere you can stand.
    //
    // The village kept two lists that meant the same thing — houses, and places.
    // A house carried a name, a picture, a spot on the map and somebody living in
    // it; the mill and the harbour carried a name and a sentence and were drawn on
    // the map as decoration. The house list is gone, and what makes a place a house
    // is that the place says so.
    //
    // The pins lead into PLACES rather than into people. A pin opened a villager's
    // conversation when somebody lived there, which is what made a house the only
    // pin with a door on it: a place nobody stood at was dead and a place with two
    // people in it had no answer. The pin opens the place, and the place decides —
    // one villager in it is that conversation, nobody or several is the place.
    //
    // And there is a screen for standing in one. The beat it reads is drawn from
    // the village's own clock and weather and asks the model for nothing at all; the
    // place's drawing, its note and what stands there sit beside it, and who is here
    // right now is listed by name, one press each. Two or more and it says that
    // talking to more than one at once is not built yet rather than picking for you.
    //
    // The place list under the map is destinations only, the destinations editor in
    // Village settings is live again (the wizard's three questions never included
    // what there is to do here), and a place with no spot on the map draws no pin —
    // this release does not add a way to give a destination its spot.
    //
    // 0.4.63: the schedules panel is a week first and an explanation second.
    //
    // The panel opened with three paragraphs telling the reader how to read it,
    // and printed the whole translation prompt — thousands of characters of the
    // model's own instructions — under every villager that had one. Somebody who
    // came to see what a person's Tuesday looks like scrolled past the
    // documentation for the panel and then past the ask that produced the answer
    // they were reading.
    //
    // Both are kept and both are shut. The vocabulary sits behind "How to read
    // this panel" and the prompt behind a press that says how many messages it
    // has, because both are what a reader reaches for when a row reads wrong and
    // nothing about them was wrong. What changed is what is shown before a reader
    // asks for it. The two labelled lines under each hour stay open and in place:
    // they are the week itself, not a note about it.
    //
    // The shape is now asserted by position rather than by markup —
    // `tests/villages-schedule-remap.regression.ts` reads the tab and requires the
    // explanation and the prompt to be inside a disclosure, and the two labelled
    // lines to be outside one — so a later restyle cannot quietly put the prose
    // back on top of the week.
    //
    // 0.4.62: founding a village works again, the player is called by their own
    // name in both places the village prints one, and the translation prompt is
    // finally a prompt.
    //
    // Three faults and one cause. When the Persona took over the question "who
    // are you", the settings view stopped carrying the typed player name and
    // blurb — deliberately, because a second answer to a question the Persona
    // already answers is only ever a way for the two to disagree — and the tab
    // went on being written against the view as it used to be.
    //
    //   1. `openMenuTab` seeded a name draft from `snapshot.settings.playerName`,
    //      which is no longer in the snapshot, so the draft was `undefined` and
    //      `foundVillage()` called `.trim()` on it:
    //      `TypeError: can't access property 'trim', undefined`. Founding a
    //      village did nothing at all. The whole dead path is deleted — the two
    //      drafts, the four fields the tab's own copy of the view still declared,
    //      both request bodies, and the hidden typed-name branch of the identity
    //      editor, which existed only to read a field nobody sends.
    //
    //   2. Two more reads of the same missing field were live and silent, both
    //      with a `?? "You"` fallback: the name plate on the conversation drawer
    //      and the record of conversations already had. Both printed "You" for
    //      every turn of every conversation, however carefully the player had
    //      said who they were. Both now read one field — the Persona name the
    //      village cached when it last wrote it out — through one reader.
    //
    //   3. The translation prompt was one `system` message 5,200 characters long
    //      with `REMAP_SYSTEM_PROMPT` spliced into the middle of itself, because
    //      the array was joined as one item of a list of sections and
    //      `Array.join` stringified it; the JSON shape, the `here` rule and the
    //      `routine` rule all landed inside other sentences. The turn the model
    //      was asked to answer was then the four words
    //      `How does that week happen in Willowbrook?`, while everything worth
    //      answering sat in the wall above it. It is now two messages: the rules
    //      one per line as a `system` turn, and the whole brief — village,
    //      places, person, week — as the `user` turn, ending on the ask.
    //
    // None of the three could fail a check this package runs. A type is only ever
    // compared against the keys it declares, so a field missing from the other
    // side of an object from another package is not something the compiler is
    // asked to look for, and the package is bundled with no type pass at all.
    // `tests/villages-settings-drift.regression.ts` now reads both sides as text
    // and holds them together, which is the check that would have caught the
    // first two before they were shipped.
    //
    // 0.4.61: the translation actually gets written, and when it cannot be, the
    // tab says so instead of saying nothing.
    //
    // A village whose schedules had been ingested showed an Agenda of `at home`
    // for every hour of every villager, forever, while the tick ran on schedule
    // twice a day. Nothing was logged that could be read, and the tab had no way
    // to say the difference between "the village has not got round to this
    // villager" and "the village asked and was refused", because both are the
    // same `remap: null` on the record.
    //
    // Four things were wrong, and the first is the one that explains the symptom:
    //
    //   1. `runVillageTick` called the translation refresh BELOW both of its
    //      early-return gates, under a comment claiming it was above them. A
    //      village with any part of the day switched off never translated
    //      anything at all; with every part on, a village translated only on the
    //      first tick of each part of the day, which is one chance to fail and
    //      then a whole day of not trying.
    //   2. The walk stopped at the FIRST villager it could not translate. Roster
    //      order is move-in order, so one unanswerable villager starved every
    //      villager who arrived after them, permanently, because a failed write
    //      leaves exactly the state that asks for another try. It now loses the
    //      villager who was refused and carries on, giving up the pass after
    //      `REMAP_REFUSALS_PER_PASS` so a dead connection still costs two calls.
    //   3. The output budget was a flat 6 000 tokens for a prompt carrying the
    //      whole week twice, and the connection this runs on is a reasoning model
    //      whose thinking comes out of the same budget. `remapAnswerBudget` now
    //      sizes the answer to the number of blocks actually asked about, and an
    //      unparseable answer says how long it was and why it stopped rather than
    //      "the village could not picture that week".
    //   4. An incomplete translation was indistinguishable from a complete one
    //      once the retry budget ran out, which it did silently. The count of
    //      hours the stored translation cannot explain is now on the listing, so
    //      a week the village gave up on reads as a half-translated week with a
    //      number on it.
    //
    // A refusal is now a fact on the villager's record: `remapFailure` holds when
    // the last attempt was made and what the model host said about it, cleared by
    // the next write that succeeds. Nothing else could carry it — the Engine's
    // log is not somewhere a player can look, and a silent feature was the whole
    // problem.
    //
    // The wording went with it. The translation was described as "saying" a week
    // in the log lines, the tab and the doc comments, and the press that deletes a
    // stored translation was labelled "Say their week again" while doing the
    // opposite of asking — it manufactures the very state its own badge reports.
    // Everything in this feature that means TRANSLATE now says translate, and the
    // press is "Forget this translation", which is what it does. No route, id or
    // stored field was renamed.
    //
    // 0.4.60: the schedules tab shows the week again, because the translation
    // became a TIMETABLE instead of a glossary.
    //
    // Two things were wrong with the tab and only one of them looked like a bug.
    // The listing was there and the tab drew nothing for it, which is what a
    // player reported. Underneath that, the village's own reading of the week was
    // keyed by the ACTIVITY SENTENCE — so a week with five copies of "sleeping" in
    // it had ONE entry answering for all five, and the tab could only print that
    // entry once, with the hours summed. ``50h a week``. Every hour of the week
    // collapsed into a handful of distinct sentences, and not one of the ten
    // thousand things a player might want to check — this hour, today, against
    // their card — could be checked at all.
    //
    // The key is now the SLOT: the weekday and the hour range of the block, and
    // nothing else. The Engine's week goes to the model day by day and hour by
    // hour, and the model copies the day and the hour range back exactly as the
    // week listed them. What comes back is one entry per BLOCK rather than one per
    // noun, so the two blocks that share a sentence still have two answers, and
    // two activities that happen to read alike on different days are still two
    // answers. A sentence cannot be shared, which is the whole of the fix.
    //
    // That changes what the tab is. Every block of the next three days is printed
    // TWICE, side by side and labelled: `Schedule event:` is the hour and the
    // sentence exactly as they sit on the character's card, and `Agenda event:` is
    // this village's phrase for that hour and the place it happens in. The
    // ingested week is not touched to produce the second line — it is copied —
    // which is what makes the pair worth reading: a player can see the village's
    // reading against the card it came from, hour by hour, instead of trusting
    // either.
    //
    // Three days rather than seven because the Engine's week is a PATTERN keyed by
    // weekday name and holding no dates, and a reader shown Monday, Thursday and
    // Saturday is shown three summaries of one routine rather than three days of a
    // story. Today and the two days ahead are the days that matter to somebody
    // deciding whether to go and find a person, and the run of them is what makes
    // a routine legible as a routine. Each of the three carries the village's own
    // date beside the Engine's weekday, so the wrapping pattern and the calendar
    // the player is living in cannot be read as each other. Only today's hours are
    // ever marked as happening now.
    //
    // An hour the village has no words for does not vanish and is not faked. It
    // arrives as the village's own default — "at home" — and is marked as
    // untranslated, so a reader can both count the hours and see which of them the
    // village failed to say. The Engine's sentence never stands in for it: that
    // sentence names the world the card was written for, and this package spends
    // its time keeping that out of the village rather than letting it in through a
    // gap.
    //
    // Nothing new is read to do any of this. The week was already on disk, the
    // translation was already stored, and both were already fetched once per part
    // of the day; what changed is what they are keyed by. The one cost is a
    // one-time one: every translation stored by an earlier version is keyed by a
    // sentence no longer looked up, so each villager is asked about once more on
    // the next part of the day and the record repairs itself. No permission, no
    // dependency, no manifest change.
    //
    // 0.4.59: a villager can answer "who is around?" with the people who are
    // actually around.
    //
    // The roster is who LIVES here, and it is the same list at three in the
    // morning as at noon. A villager given that and nothing else answers a
    // question about the room with the whole village — wrong in the way that is
    // hardest to notice, because it is true, it is the wrong sentence, and it
    // has every neighbour at the mill when each of them is asleep in a different
    // house.
    //
    // The fact the room needed was already on disk. Every villager's hour is
    // already placed in the remap the village wrote, and already resolved for
    // the plate that villager's own card is drawn from; it was simply only ever
    // read for the speaker. Now it is read for the whole village, off the SAME
    // schedule read this file already performs once per turn, and grouped by
    // place. One send is still one derivation of the moment, and a crowded venue
    // costs nothing extra, because the read is a cache rather than a call.
    //
    // ## Who is around. The speaker's own place is marked and comes first, and
    // it is said as a room — "Here with you, at the mill" — because the room is
    // what the player asked about. Everybody else is named by the place they are
    // in, and a villager at home is said to be at home rather than by the name of
    // the building every house in the village shares. Two caps, because there
    // are two crowds: four places and four people, so a village scattered across
    // its map cannot put the roster's own problem back into the block that exists
    // to be shorter than it.
    //
    // One thing it deliberately does NOT say. What each person is at comes from
    // the village's own translation and never from the Engine's sentence about
    // them, because that sentence is about another world and this block is read
    // as fact about this one. It never falls back to the village's "at home"
    // default either: a line that has just said where somebody is does not then
    // need to be told so again.
    //
    // No new permission, no new dependency and no client change at all. The
    // macro appears in the tab's own list because that list is the server's, the
    // block renders empty when nobody else can be placed, and an empty block
    // leaves the prompt byte-for-byte as it was before this release.
    //
    // 0.4.58: the aside leaves the plate and is drawn beside it, which is the
    // half of 0.4.57 that was still wrong.
    //
    // 0.4.57 read the tag correctly and then drew it in the wrong place twice
    // over. First as a badge inside the speaker's own row — a fact told to the
    // player from inside the dialogue box, which is the one thing the Engine's
    // stage never does with a side remark. Then, worse, the whole bubble was
    // pushed into the plate in the paragraph's own place, so an aside BECAME the
    // paragraph: the player read the whisper where the sentence should have been
    // and the sentence where the whisper should have been.
    //
    // The Engine's own arrangement, and therefore this one: an aside is a SECOND
    // surface, floating in the band above the plate and justified to the end of
    // it, drawn at the same time as the line it was said after. The player never
    // steps onto a bubble — the counter and the arrows count paragraphs, of which
    // an aside is not one — and no sentence can be missed by stepping past it,
    // because the bubble is standing beside that sentence while it is on screen.
    //
    // Making that true is where the walk comes from. A tagged line was never a
    // paragraph: it is filed against the paragraph it FOLLOWS, so the bubble
    // floats while the line it was said after is still on the card. The one case
    // that cannot work that way is a reply that opens with a side line, since
    // there is nothing in front of it yet, and there it waits for the first
    // paragraph instead. Two accidents are read as the whole reply being ordinary
    // — beats that no longer line up with the paragraphs, and a reply made of
    // nothing but asides — and in both the words are exactly the words either
    // way, because a register is a drawing and never a rewrite.
    //
    // The card keeps two registers rather than four. `side` and `whisper` were
    // briefly ways of drawing the plate; they are now the two kinds of bubble
    // beside it, and the plate is speech or narration as it was in 0.4.56.
    //
    // The one wire change is a line of direction. When the player asks for
    // something said only to them, that ASKING is the line, and the villager is
    // told to begin it with the whisper mark: the mark is the whole of how the
    // player is shown the difference, so a request answered without it has been
    // answered in the wrong voice — a whisper the whole room reads as speech.
    //
    // No new permission, no new dependency, no new file and no new stored field:
    // the beats were already on the wire and already in the transcript. An aside
    // now costs the player no extra step.
    //
    // 0.4.57: the registers are wired, and an aside is drawn where the Engine
    // draws it.
    //
    // 0.4.56 taught the tab to ask what SHAPE a paragraph is and drew the answer
    // as two registers — somebody speaking, and the room describing itself. This
    // release adds the two the Engine's own visual-novel stage keeps for speech
    // that is not offered to the room: a `[side]` line said aloud to nobody in
    // particular, and a `[whisper:Listener]` line said to one person alone. The
    // server tags them; the card reads the tag. The tag WINS over the shape,
    // because nothing about a side remark's punctuation can tell it apart from a
    // sentence spoken to the room, and a card that guessed would be wrong on the
    // first villager who muttered.
    //
    // The tag is read positionally, against the beats the message carries, and
    // only when the beats line up with the paragraphs the splitter found. A
    // message whose two lists ever came apart is read by shape exactly as it was
    // in 0.4.56, so the words on the card are the words either way and only the
    // register was a guess.
    //
    // The four registers are the four the Engine's stage draws, and so is WHERE
    // each one is drawn — which is the half of this that 0.4.56 got wrong.
    // Narration is a label and no face. Speech is the face, the name and the
    // plate. And an aside is NOT a plate with a badge in it: the Engine keeps a
    // second surface for those, a small floating bubble justified to the end of
    // the window and standing UNDER the plate of whatever was said before it,
    // carrying the speaker's own round face, the type's own mark, their name, and
    // the listener after an arrow on a whisper. The card now does that. The face
    // stays on it at the Engine's own size because the whole point of the drawing
    // is that the player can see at a glance who leant in.
    //
    // No new permission, no new dependency and no new file. The wire does gain
    // one thing — the villager is told how to MARK a line, in the turn block
    // beside the three other parts that were never the player's to choose, and
    // that direction says nothing at all about how to WRITE one — and the
    // transcript gains one optional field. The tags are read once, server-side,
    // before anything is stored, so the words stay and the tags never reach
    // `content`. An answer with no tag in it is stored byte-for-byte as it
    // arrived and carries no beats at all, which is the ordinary case and every
    // turn written before this release.
    //
    // 0.4.56: a villager's answer is read, and the room they are standing in is
    // drawn as the room rather than under their name.
    //
    // A villager's turn is two things at once. They describe the place they are
    // in and then they say something in it, and both have always arrived as one
    // paragraph under one name in one dialogue box. The card IS a dialogue box —
    // a face, a name, and the words — so it should keep the words, and the
    // description between the speeches should not be standing under somebody's
    // name as though they had said it.
    //
    // So the tab now asks what shape a paragraph is. Speech is drawn exactly as
    // it was; everything else is drawn as a bubble in the register the Engine's
    // own visual-novel stage uses for anything said out of the side of
    // somebody's mouth — the smaller, muted box, under no name at all.
    //
    // The rule is the CLOSING quote, and it is read off real replies rather than
    // off a preference. A villager describes, then speaks, and the speech is what
    // closes the beat: a paragraph that ends on a quote is somebody talking and
    // one that never reaches a quote is the room describing itself. Reading the
    // FIRST character instead is the obvious-looking half of the same idea and it
    // is wrong on the same data — description-first paragraphs are common, and
    // one reply would come out half in the plate and half in a bubble for no
    // reason a player could ever see. A quote in the middle of a sentence is not
    // a way of talking either, so a paragraph that ends on its own full stop is
    // the room talking ABOUT something somebody said.
    //
    // The opening-quote test beside it is the one that keeps it honest. An
    // apostrophe is the most common punctuation mark in English and a closing
    // mark on its own is a typo, so neither the cats' food bowl nor a stray
    // quote mark becomes somebody speaking.
    //
    // The walk does not grow. A described beat and a spoken beat are one beat
    // each, so the counter and the arrows count exactly what they counted
    // yesterday — which is why the question is asked at the draw and not in the
    // splitter that decides where the paragraphs are. Where a paragraph is has
    // nothing to do with what is in it.
    //
    // The same release took the ban on asterisks out of the direction that opens
    // a scene. What a mark MEANS in this chat is the player's own Engine preset's
    // business: a preset that turns an asterisk into narration and one that turns
    // it into emphasis inside spoken word are both correct presets, and a
    // direction forbidding the character outright was the village overruling the
    // player's chosen way of writing. It was also already being ignored — real
    // replies carry their stage directions in asterisks, and the tab has drawn
    // them as emphasis since 0.4.52 — so the clause was doing nothing but putting
    // a rule in the prompt that the sentence under it contradicted.
    //
    // The direction also stopped requiring the villager to have noticed the
    // player the moment they arrived. Being absorbed in what you were doing and
    // coming to somebody a beat later is the ordinary way a person is
    // interrupted, and the direction already asks where they were and what they
    // were doing; saying they must already be attending on arrival is what turned
    // that into a greeting. It matters more, not less, once a room is what is
    // being opened.
    //
    // The register is built for the room that is coming and is deliberately not
    // finished: `data-shape="prose"` is the room describing itself and is not
    // named like a line type, because the line types — side speech to everybody
    // present, and whispers to one listener — arrive with the room that has more
    // than one villager in it. A sprite system and an expression per beat are
    // intended and not built, and are marked as such where they will go.
    //
    // No new permission, no new dependency, and no stored format: the transcript
    // a villager's turn is written to is byte-for-byte the one it was, so the six
    // other readers of it — the wants judge, the distiller, the agenda writer,
    // the scene lane, the storyboard and spin-off — see nothing new.
    //
    // 0.4.52: a villager's line is read the way the Engine reads a roleplay's.
    //
    // The tab drew the characters a villager typed, so an action in one asterisk
    // arrived with its asterisks still on it. Native roleplay has never done that,
    // and the two rooms are meant to be the same room, so the reader is the
    // Engine's own — `applyInlineMarkdown` and the alternation it runs on, ported
    // whole: the backslash escape, inline code, ==highlight==, ~~strikethrough~~,
    // ***bold-italic*** tried BEFORE **bold**, __underline__, *italic* and
    // _italic_, with the lookarounds that keep a snake_case_name and a bold pair
    // out of the italic rule. A link is read too, and only over http(s).
    //
    // Two of the Engine's rules are deliberately not carried over. Image syntax
    // draws an <img> in the Engine; a village has no card assets, and an image in
    // a model's line is a fetch the player did not ask for, so what is left of it
    // is the label as a link the player has to click. `card://` and `/api/` link
    // targets go the same way, for the same reason — a line a model wrote must not
    // be able to point the player's browser back at the Engine through a link that
    // reads like something else.
    //
    // Block-level markdown — headings, lists, tables, fences — is the Engine's
    // other half and is not here. The card shows one paragraph at a time in a
    // height-capped box, and a table drawn in it would be the one thing in the
    // card that cannot be read. A villager who writes a bullet list gets the
    // bullets they typed.
    //
    // It is a copy rather than an import for the reason the paragraph splitter is
    // one: a capability package cannot reach the Engine's own `src`. The three
    // marks that need a class wear the tab's own, because every one of the
    // Engine's is scoped to `mari-message-content`, which this card is not.
    //
    // Both places a villager's words are drawn are wired — the log, the reading
    // card, the ruling in each, and the kept transcript in the story panel. The
    // prompt inspector is left raw on purpose: it says, in as many words, that it
    // shows the prompt exactly as it is sent.
    //
    // No new permission and no new dependency: the reading is React elements built
    // in the tab, never an HTML string, and there is no markdown library in it.
    //
    // 0.4.51: a villager is written with the player's own Engine preset.
    //
    // The two prompt boxes were the right shape and the wrong author. "How
    // everyone talks" asked a player to describe, in a plugin's textarea, the one
    // thing their Engine preset already describes — their register, their section
    // order, their wrap format, their choice variables — and to keep the two in
    // step by hand. It is gone: deleted from the tab, deleted from the server,
    // refused by the route.
    //
    // What replaces it is the preset itself. `GET /api/prompts/:id/full` is read
    // over the Engine's loopback API, the sections are put in the order the player
    // arranged them, and a villager's turn is assembled through the Engine's own
    // pipeline — grouping, merging, squashing, depth injection, strict roles —
    // ported rather than approximated, because the order is the part that decides
    // how a prompt reads. Markers expand out of the card, the player's persona,
    // the transcript and the village's own knowledge, and the preset's
    // Tense/POV/SNF questions are asked once per village and re-applied on every
    // turn.
    //
    // "The information villagers know" stays, and stays this package's job. What a
    // villager knows is live village state — the clock, the roster, the
    // noticeboard, the venues, what they were last doing — and no preset can hold
    // it, because a preset is the player's writing and this is the village's own
    // facts.
    //
    // The reply cap moves 700/800 → 4096, which is the Engine's own default, with
    // a switch in the tab that hands the cap back to the preset instead.
    //
    // No new permission is asked for: the loopback reader is the same door
    // spin-off has used since 0.4.43.
    //
    // 0.4.50: the reading is the whole conversation, and the box is the Engine's
    // down to its left-hand edge.
    //
    // 0.4.49 made the row under the room into the Engine's own composer and left
    // three things where it found them. This release is those three, and every
    // one of them was visible the moment the two tabs were put side by side
    // again.
    //
    // 1. THE WALK SPANS BOTH VOICES. The arrows under the card walked the
    //    villager's replies and nothing else, so the player's own sentences were
    //    in the room and not in the reading: the one voice the player had just
    //    used was the one voice the arrows could not show them, and a ten-turn
    //    conversation read as a monologue with the questions taken out. The
    //    Engine's own visual-novel stage has never done this — its visible list
    //    is every non-system message, whichever side of the table it came from,
    //    and its step crosses between them at either edge — so the thing being
    //    walked is a list of turns now: the role and the paragraphs together.
    //    The card wears the right name and the right face for whichever turn it
    //    is standing on, which is the player's own name and the player's own
    //    Persona when the paragraph is theirs, and the arrows reach from the
    //    first thing said in the room to the last.
    //
    // 2. THE HEAD OF THE ROOM IS THE PICTURE AND NOTHING ELSE. A strip across
    //    the top of the card printed "Right now: at home", which was the
    //    activity line the server resolves for the schedule and which the room
    //    was spending a row of a small tab on saying twice: the villager is
    //    standing in the place, and the plate under them names it. The strip is
    //    gone, and with it the last thing in the room that was not the Engine's.
    //
    // 3. THE VERB BUTTON IS INSIDE THE BOX. It stood in the row beside the box,
    //    with the textarea between it and the paper plane. It is the first child
    //    of the box itself now, at its left-hand edge, and both glyphs are
    //    centred on the box's own line — the verb is a property of what the
    //    player is about to type, so the control holding it belongs in the frame
    //    the player types into. The menu it opens still opens upward off the
    //    box's top edge, and the three dots still float in the corner of the
    //    room, which is where the Engine keeps its own.
    //
    // AND THE DOOR THE PLAYER COULD NOT FIND. Leave was offered to a room the
    // player had already spoken in, which was a rule written when the player
    // opened the conversation and became nonsense the day the villager started
    // greeting first: a player could walk up, be greeted, decide they wanted
    // nothing to do with it, and have no way out of the room but the browser.
    // Leave now asks whether the villager can be reached and nothing at all
    // about whether the player spoke. The debug erase kept that question
    // instead, since a room where nothing was said has nothing to forget, which
    // is the one place it was ever the right question to ask.
    //
    // 0.4.49: the bar and the plate are the Engine's own now, which is the half
    // of the Visual Novel that 0.4.48 did not reach. 0.4.48 moved the ROOM — the
    // scrim, the vignette, the floor, the bubble with a face and a name at the
    // head of it, the chevron, the floating transcript, the chrome of chips — and
    // left the row under the room exactly as it had been: one wide box, a row of
    // three verb pills under it, and a Send button at the far right of the row.
    // Side by side with the Engine that row was the tell, because the Engine has
    // no such row: it has a box with the send press inside it on the right-hand
    // edge, and everything else about a message is behind one control in a corner.
    //
    // THE SIX THINGS THAT MOVED.
    //
    // 1. THE ROOM OWNS THE TAB. The stage was `flex: 0 1 34cqh` — a row that could
    //    shrink to 34% of the tab and never grow, so on a tall tab the picture sat
    //    in a band at the top and the leftover height went to nothing. It is
    //    `flex: 1 1 34cqh` now: still a 34% basis, still able to shrink, and able
    //    to take the rest. The figure followed it — `min(38cqw, calc(100cqh -
    //    2.5rem))`, up from `min(30cqw, calc(100cqh - 1.75rem))` — and the two
    //    numbers are one change: the area the green box in the request covers is
    //    the whole of what the plate is not using.
    //
    // 2. THE THREE VERBS ARE ONE ROUND BUTTON. A row of three words is a row the
    //    bar has to be read before it can be used, and on a narrow tab the row WAS
    //    the bar. They are one round button in the bottom-left corner of the row
    //    opening a popover in the shape of the Engine's own Connections switcher —
    //    a titled head, three `menuitemradio` rows with the tick on the one in
    //    force, and the conversation's own verb in the foot. That is where Leave
    //    lives now: it is the conversation's own press rather than a fourth verb
    //    beside the other three, and one press down is still reachable while
    //    somebody is talking to you. The popover is ANCHORED, not portalled — the
    //    sheet already had the anchor pattern for the options menu in the head, so
    //    this adds no import, no portal, and no measurement of the window.
    //
    // 3. THE SEND IS INSIDE THE BOX. It is the Engine's own placement and its own
    //    glyph — a paper plane on the right-hand edge of the box, in the frame the
    //    words are in rather than in the row beside them — and it is a glyph rather
    //    than the word Send because the button over it already says the verb. The
    //    box is the Engine's own input shell: `rounded-2xl`, the chrome input
    //    border and fill, the blurred backdrop, and a `:focus-within` that lights
    //    the border and puts the Engine's own 1px ring round the whole box. The
    //    textarea was STRIPPED rather than framed: no border, no fill, no resize
    //    grip, which would have sat exactly where the glyph is, and a right padding
    //    that is the room the glyph needs.
    //
    // 4. THE PLATE'S ARROWS ARE THE ENGINE'S OWN ROW. The plate carried its own
    //    padding, so the rule above the arrows was inset off both edges while the
    //    Engine's reaches them, and the arrows sat out at the plate's content edge
    //    while the Engine's sit in from it. The padding moved onto the row inside
    //    the plate, which is the Engine's structure, and the arrows took the
    //    Engine's own metrics, its own hover, and its own two words — "Previous
    //    paragraph" and "Next paragraph". The long words are the point of them: the
    //    card is one paragraph of a longer answer, and a control called Next on a
    //    card holding somebody's speech does not say what it walks.
    //
    // 5. THE WAY OUT IS NARROWED, AND IT FLOATS. It used to be drawn in every
    //    room that had one, including the room where the villager had just said
    //    hello and was waiting for the player to speak: a Close across the middle
    //    of a room with a box on the screen, offered as though the player were
    //    finished. It is drawn only in the two rooms where there is nothing left
    //    to type into — the conversation has been ended, or it never opened — and
    //    those are the two rooms where the composer is off the screen, which is
    //    the same statement made a second way: the drawers that draw this have no
    //    box under it for the menu to hang off. And it is no longer a ROW of the
    //    column: it is drawn inside the reading's own stack and pinned over the
    //    top of it, so the card and the box keep the position they have in a room
    //    with nothing to close, and all this state adds is a chip over the room.
    //    In the menu, the rooms with no goodbye to spend wear Close in Leave's
    //    slot instead, and of those two only the room nobody has spoken in can
    //    reach it: a room whose card is gone holds its own button shut and carries
    //    a Close up in the head.
    //
    // 6. THE HINT IS THE MODE'S. The box said the villager's name in all three
    //    verbs. It says what this box is FOR now — a line, a question, the one
    //    thing you did — because the placeholder is the only text in the row that
    //    can say it, and the three verbs are one press away behind a glyph.
    //
    // WHAT DID NOT CHANGE. The routes, the transcript, the greeting, the prompt,
    // the spinoff, the two presses of the ending, the paragraph splitter, and the
    // four debug controls. No new permission, no new dependency, no portal, and
    // nothing from the Engine: this is the package's own stylesheet and its own
    // markup, and `engine.min` does not move. The regression lane for the drawer
    // was rewritten with it — nine groups of assertions described the bar this
    // release replaced — and it is the proof that every rule above is the rule
    // that ships.
    //
    // 0.4.48: the room is the Engine's Visual Novel, layer for layer, rather
    // than a chat that happens to be laid out like one. 0.4.46 copied the
    // PRESENTATION — a paragraph at a time in a card over the room — and left
    // the composition around it alone, which is why the two still did not read
    // as the same screen. This release moves the composition.
    //
    // WHAT THE ENGINE ACTUALLY DOES, read off its own roleplay surface rather
    // than guessed at. The place picture is not a column or a panel: it is a
    // layer of the whole chat, with a vertical scrim over it so the chrome and
    // the composer have something to be read against and a vignette over that so
    // the eye goes to the middle of the room. The character stands at the bottom
    // of it as a sprite with a drop shadow, not inside the reading. The reading
    // is the card, and the card is a BUBBLE: the speaker's face and the speaker's
    // name at the head of it, one paragraph under them in a box with a ceiling,
    // and the arrows that walk the rest at the foot behind a rule. The history is
    // a bare chevron tab the width of a thumb hanging off the top of whatever is
    // open, and the whole transcript is a floating card under it. The commands
    // are one "..." in the top chrome, and the chrome is a row of individually
    // surfaced chips rather than a plate across the tab, so the picture shows
    // between them.
    //
    // THE FIVE THINGS THAT MOVED.
    //
    // 1. THE SCRIM AND THE VIGNETTE. Both are the Engine's own and this tab had
    //    neither, which is the whole of why its room read as a photograph with a
    //    card lying on it. The scrim is a four-stop gradient of the theme's own
    //    background mixed with transparency — dark in a dark theme, light in a
    //    light one — rather than the Engine's fixed near-black, because a fixed
    //    near-black over a pale theme's map is a black band across a drawing.
    //
    // 2. THE VILLAGER MOVED ONTO A FLOOR. They used to stand at the head of the
    //    reading column, which put the person inside the words. Now the aside is
    //    two flexible rows: a floor that takes whatever the chrome and the
    //    reading leave, with the figure and the place plate standing at the
    //    bottom of it, and the bottom stack under that. The figure wears the
    //    Engine's own drop shadow. This is not cosmetic: the floor is the row
    //    that yields, so a short tab shrinks the villager instead of printing the
    //    reading across their face, and the hazard 0.4.46 documented — a growing
    //    reply overflowing out the TOP of a column justified to its end — is
    //    structurally gone rather than mitigated.
    //
    // 3. THE CARD IS THE ENGINE'S BUBBLE. It has a face and a name at the head of
    //    it now, and the name is the whole reason: the tab's heading is gone, so
    //    this is the only place the player is told who is speaking, and the Engine
    //    says it the same way — a card with a portrait in it, where the player is
    //    already looking. The paragraph sits in its own capped, scrollable box
    //    with the Engine's own ceiling, and the arrows moved into the card as a
    //    rule-separated row. The Engine draws the face twice — a body on the stage
    //    floor and a head in the card — and so does this, because a village has
    //    one picture per villager and both frames show it.
    //
    // 4. THE HISTORY IS A CHEVRON AND A FLOATING CARD. The labelled pill is gone;
    //    the Engine hangs a bare chevron off the top of the card, and it can,
    //    because the thing being opened is obviously the history of the thing
    //    being read. The words are not gone, they are out of the way — the
    //    accessible name and the title still say "Show chat history" and "Return
    //    to Visual Novel" in both directions. The shape is the state: rounded at
    //    the top and open at the bottom when the card is up, rounded at the bottom
    //    when the history is, so the control and the thing it opened read as one
    //    object. The transcript is capped in height so the room is still a room.
    //
    // 5. THE TOP CHROME FLOATS. It is an absolutely positioned bar of
    //    individually surfaced chips rather than a row with a wash across it, with
    //    pointer-events: none on the bar itself so a press meant for the room is
    //    not swallowed by the gap between the chips, and the loudest z-index in
    //    the sheet because the options menu hangs off it. The villager's name
    //    left it for the card; what stayed is the two things about the room rather
    //    than the reading — what they are at, now a two-line chip that cannot
    //    cover the villager it sits over, and the "..." menu.
    //
    // WHAT DID NOT CHANGE. The routes, the transcript, the greeting, the two
    // presses of the ending, the three-corner bar, the wait dot, the spinoff, the
    // four debug controls and the splitter copy. Only the drawer's own layer is
    // different.
    //
    // 0.4.47: the villager greets first, the ending is two presses, and the wait
    // is a dot rather than a sentence. Three changes, and they are one change:
    // what this room says about who is in charge of it.
    //
    // THE VILLAGER ALWAYS SPEAKS FIRST. They always did, in the prompt — the
    // greeting was asked for before the player had a box to type in — but the tab
    // was written when a chat was something the player opened and spoke into, and
    // it still behaved that way when the greeting did not come back: it drew the
    // empty room, the composer and the verbs, and left the player to start a
    // conversation that a villager was supposed to be starting. So the tab now
    // WAITS. Until the greeting has landed there is no chevron, no card, no
    // history and no composer in the drawer — nothing that can be pressed to no
    // effect — only the room, the villager's face, the place plate and a spinner.
    // The options menu in the head stays, because it is the one press out of a
    // room that has not let the player in yet.
    //
    // A GREETING THAT FAILS NOW FAILS. There used to be a fallback line — "Hello.
    // Come and stand a while if you like." — written to the transcript whenever
    // the model threw or answered nothing twice, which meant the player always
    // got a room and never learned that anything had gone wrong. It is gone, and
    // with it the village's willingness to invent a line of a character's speech
    // in somebody else's voice. A model that cannot be reached now ends the
    // greeting with a 502 naming the villager, and the tab draws that sentence in
    // the plank the reading is read on, says plainly that nothing was written
    // down, and offers Close. Because nothing was written, walking back in
    // retries the greeting against an untouched transcript — there is no half
    // conversation to clean up, and the villager does not notice the attempt.
    //
    // THE ENDING IS TWO PRESSES. Leaving and ending were one press wearing one
    // label, and both labels lied a little: "End chat" on a room where nothing
    // had been said, and an ending that had to be confirmed before it began. Now
    // the bar's left-hand corner says LEAVE THIS CONVERSATION, which spends the
    // goodbye and files the memory — the same call it always made — and only once
    // that has happened does END CONVERSATION appear under the reading, which
    // closes the drawer. A player who sees the second button has finished. The
    // two rooms with no ending to give — nothing said yet, and a card deleted out
    // from under the drawer — draw CLOSE in the same slot instead.
    //
    // AND THE BAR IS THREE CORNERS. Leave on the left, Chat/Ask/Fulfil in the
    // middle, Send on the right, laid out as a three-column grid so the verbs
    // stay in the middle of the tab whether or not there is anything to leave,
    // and wrapping to two rows on a tab narrower than 34rem, where Leave and Send
    // become the wide thumb targets a phone wants. The line of helper text that
    // used to sit between the verbs and the button — "Enter sends · Shift+Enter
    // adds a line" — is gone; the box's own placeholder and the button's own
    // label said the same thing in fewer words. The claim box's "is not waiting
    // on anything" note stays, because that one says something the player cannot
    // see by looking.
    //
    // THE WAIT IS A DOT. "Hana is thinking..." in the card and "Hana is saying
    // goodbye..." in the log are both gone, replaced by one small spinner at the
    // end of the reading, right-aligned where the answer is about to arrive and
    // drawn in exactly the same place while the villager is finding their first
    // line. It is not announced as a spinner: what it means is written in a
    // hidden span so a screen reader hears "Hana is thinking" rather than
    // nothing, and the tab grew its first visually-hidden rule to carry it.
    //
    // WHAT WAS LEFT ALONE. The routes, the transcript format, the permissions,
    // the spinoff, the four debug controls, the ending's own server call and the
    // fact that a transcript with no line of the player's own in it is cleared
    // without spending a model call. The composer is HIDDEN rather than unmounted
    // while the villager is finding their line, so a half-written sentence
    // survives a retry that succeeds.
    //
    // 0.4.46: the conversation is drawn the way the Engine's own Roleplay chats
    // are drawn when they are set to the Visual Novel presentation. The village
    // is still behind it — the room fills the tab and the villager's face still
    // stands in front of the room — but the words are now a PARAGRAPH AT A TIME
    // in a card directly above the composer, with a chevron above it that swaps
    // that card for the whole history and back, and the options that used to be
    // a column of buttons in the drawer's head are behind one "..." button in
    // that head, which is where the Engine keeps them too.
    //
    // WHY. The drawer had grown into a scrolling list with a button for every
    // verb, and the reason the Engine's Visual Novel reads the way it does is
    // that it never asks a player to read a wall: one block of speech, a counter
    // saying where in the reply they are, and arrows to step through it, with the
    // history one press away rather than always open. That is a presentation the
    // Engine already taught players, so this is the tab catching up to it.
    //
    // WHAT IS COPIED AND WHAT IS SHARED. The splitter — blank line ends a
    // paragraph, a fenced block is never split in half — is a faithful copy of
    // the Engine's `splitRoleplayParagraphs` and is NOT imported: this package
    // declares `privateEngineImports: []`, so the boundary file stays empty and
    // the copy lives in `villages-chat-paragraphs.ts` with its own regression.
    // The splitter is the whole of the presentation logic; nothing else about the
    // Engine's Roleplay surface is touched.
    //
    // THE ONE DEPARTURE, and it is deliberate. The Engine draws the Visual Novel
    // sprite in a layer behind the text, because its sprite is a full body that
    // can stand tall enough to keep its head above a card. Ours is a square face
    // crop, and a square sitting under the card is a square the card covers —
    // face included. So the figure and the place plate are the first two rows of
    // the reading column instead of a layer under it, and the room is left as a
    // backdrop with nothing drawn on it.
    //
    // WHICH IS WHY THE SHORT-TAB QUERIES ARE IN THIS RELEASE. A figure in the
    // reading column is a figure spending the tab's HEIGHT, and the column is
    // justified to its end, so anything that does not fit overflows out of its
    // TOP and prints over the villager's "right now" line instead of past the
    // composer. Measured at 640x360 with the sprite sized by width alone, the
    // face sat across that line by 1350 square pixels. The figure is therefore
    // sized by the smaller of a share of the tab's width and a share of its
    // height, never shrinks (a square that takes a flex shrink stops being a
    // square, and the crop's own arithmetic needs one), and the tab gives up its
    // rows in order as it gets shorter: the plate under 30rem, the "right now"
    // line under 22rem. Measured after: square and clear of every other row from
    // 1180x820 down to 560x320, no overprint at any of the eleven sizes tried.
    //
    // WHAT WAS LEFT ALONE. Nothing about what a chat IS: the same routes, the
    // same transcript, the same spin-off, the same waiting state, the same
    // ending. No new permissions, no new request, no change to the server. The
    // reading is read-only — the history shows what the village said and offers
    // no way to edit it, which is what the drawer always did.
    //
    // 0.4.45: the tab is drawn for a phone held the way a phone is normally
    // held, and the notice that told a phone held upright to turn over is
    // switched off. It is COMMENTED OUT rather than deleted, in both halves —
    // the stylesheet block and the four pieces of the component — with a note
    // saying plainly that this may be revisited or removed later, and what
    // either of those would take.
    //
    // WHY IT HAD TO GO. The map is a 1080x566 picture and MapStage fits it
    // WHOLE, because a house on a corner that nobody can see is a house nobody
    // can open. Fitted whole into a tab that is taller than it is wide, the
    // picture is a BAND: measured at 390x640 the room is 378x628, the buffer its
    // padding keeps is 21px a side, and the map comes out 336x176 — so
    // seventy-two percent of the tab was under the village and the old answer to
    // that was a full-screen panel asking the player to turn their phone over.
    // Marinara Engine is drawn portrait-first everywhere else; this is the tab
    // catching up rather than a new idea.
    //
    // WHAT REPLACED IT, and it is deliberately the least it can do — one
    // container query, no markup change, nothing moved in landscape. A tab that
    // is taller than it is wide AND narrower than 44rem (the same width the
    // drawer's own query already calls a phone) gets the map at the TOP of the
    // room, and the readout and the controls moved off the picture to sit as a
    // bar UNDER it, with the notices below them.
    //
    // The bar is the one non-cosmetic part: on a 176px map the old corner row was
    // a 36px band of it, a fifth of the whole village, and a Menu button drawn
    // over the picture is a picture with a hole in it. Nothing had to move in the
    // markup to do it — the controls were already children of the frame, and the
    // frame does not clip (overflow: visible is what lets the wooden moulding be
    // drawn outside the picture at all), so `top: calc(100% + .5rem)` on an
    // absolutely placed child lands them under the map as it stands. Measured:
    // the 336-wide bar holds 241px of controls with 79px of slack at
    // mouse-sized buttons, and the notice is given `top: calc(100% + 5.5rem)`,
    // which is the CEILING of a two-row coarse-pointer bar (2.25rem floor × 2 +
    // the .5rem gap = 80px) rather than a taste, so the two can never land on
    // each other.
    //
    // WHAT WAS LEFT ALONE. Every landscape width, the 30rem short-tab query, the
    // 34rem Menu query and every coarse-pointer floor are untouched, and the new
    // query's width clause is what keeps it off a desktop window: a window wider
    // than it is tall never matches it whatever its height, which the harness
    // confirms at 1280x800 and at 844x390 — the controls are still inside the
    // picture at both.
    // 0.4.44: the way into a roleplay is a button in the conversation drawer's
    // own header row, and the block that used to stand in the drawer's foot is
    // gone. Nothing about the spin-off lane changed and nothing it does changed;
    // what changed is where its one verb is drawn, and the reason is that the
    // drawer's foot was never a place a fixed-size thing could be drawn.
    //
    // THE MEASUREMENT, because this is the whole release. The drawer is a flex
    // column and the conversation inside it is `flex: 1 1 auto` — it takes what
    // is left over. The block 0.4.42 put in the foot is a border, a margin, a
    // padding, a title, an actions row and a note explaining that the trip is
    // one way, and it is a SIBLING of the conversation rather than part of it,
    // so it took 139 px off the top of the screen before the conversation was
    // given a look at it and could not be argued with or scrolled past.
    // Measured at six real phone sizes on the shipped build: at 844×390 the
    // transcript had 26 px and a villager's picture was drawn 94×2; at 844×340
    // and at 740×360 the transcript had 0 px and the picture 94×2, which is a
    // drawer that opens onto nothing at all. On a desktop the same 139 px is
    // invisible, which is why it took a phone in someone's hand to find it.
    //
    // WHY THE HEADER AND NOT A SMALLER FOOT. A row in the header is geometry
    // the drawer already pays for: the verbs row wraps and is drawn whether or
    // not the conversation is still open, so a third button in it costs nothing
    // until the row has to wrap, and a wrapped header row costs the
    // conversation a line of its own text rather than its whole body. The
    // alternative — a cluster of its own in the head — was measured and is not
    // free either (it takes 33 px off the body at 844×390 and squeezes the
    // picture in the shortest sizes), so the button went into the row that
    // exists. Measured against the 0.4.39 build, the last release before any of
    // the scene work, the head, body, picture and transcript are IDENTICAL at
    // all six sizes. That is the test this had to pass: on a phone, the button
    // is now the only trace 0.4.40–0.4.43 left behind.
    //
    // THE BUTTON IS DRAWN WHATEVER PHASE THE CONVERSATION IS IN, where `End
    // conversation` and `Forget` are still drawn only while it is open. A
    // spin-off is a way out of a villager you have finished with as much as one
    // you are still talking to, and hiding it at the end of the conversation
    // would hide it exactly when somebody is deciding whether they like the
    // villager enough to write with them.
    //
    // WHAT ELSE WENT WITH THE BLOCK. `SpinOffSection` is deleted rather than
    // left uncalled, and its stylesheet went with it — four rules, including
    // the `@container (max-width: 34rem)` override that had to be ordered after
    // the rules it overrode. The sentence it carried, that the village does not
    // follow the chat, wait for it or read it back, is not lost: it is the
    // button's `title`, which is where an explanation belongs when the room it
    // is standing in is the size of a phone. The lane's own refusal now lands
    // in the drawer's one alert slot beside the drawer's own, because two
    // things can fail in that room and the player does not need two places to
    // read them. `tests/villages-homepage-layout.regression.ts` now asserts
    // that no part of the block is drawn in the drawer and that the stylesheet
    // declares no rule for one, and `tests/villages-spinoff.regression.ts`
    // asserts the button is in the verbs row, so the block cannot come back in
    // through a patch that looks tidy.
    //
    // 0.4.43: the lane into an Engine roleplay is ONE WAY. The village takes
    // itself as it stands, makes a chat out of it, plants the villager's opening
    // line, and then keeps no record of any of it — no link document, no listing,
    // no line count, no "they are away" lock, and no read-back. The player-facing
    // word is a spin-off; the code word everywhere is `spinoff`.
    //
    // WHY THE RETURN PATH HAD TO GO, since it is the whole release. 0.4.40–0.4.42
    // built a two-way lane and every part of it was a claim on a chat the Engine
    // owns: the village held a document saying which chat belonged to which
    // villager, it read that document on every roleplay turn, it drew the chat's
    // line count, it offered to read the transcript back into a villager's
    // memory, and it held the ENTIRE village shut while one villager was away.
    // The last one is the one the player felt: opening a chat froze the tab they
    // came from, with no way to say "I am only looking". A chat that is an
    // ordinary chat should not give a package the power to lock a village, and
    // the honest version of "the villager is off having their own story" is that
    // the village does not follow it at all.
    //
    // WHY A LOREBOOK AND NOT A CONTRIBUTOR. The village still has to influence the
    // roleplay, and a model has no memory between turns: every turn is assembled
    // from scratch. So "a one-time snapshot" cannot mean "sent once" — it has to
    // mean "written once into something the Engine re-carries forever". The Engine
    // has exactly three durable per-chat carriers and one package route that is
    // not durable, and only one of them is invisible, survives history trimming,
    // and needs nothing from this package afterwards: a chat-scoped lorebook entry
    // with `constant: true` and `position: 0`. `keyword-scanner` activates a
    // constant entry with no keywords, `prompt-injector` puts position 0 into
    // `worldInfoBefore`, and `applyTokenBudget` sorts constant entries first, so it
    // is the last thing the budget will ever drop. The writer is
    // `services/villages/spinoff-snapshot.ts`; the book is created with
    // `generatedBy: "import"` (the schema's agent ids are a closed set that does
    // not include this package), `hiddenFromLibrary: true`, and
    // `scope: { mode: "specific", chatIds: [chatId] }`, and its id is merged into
    // the chat's `activeLorebookIds` inside the SAME `withChatLock` metadata merge
    // that activates the chat — merge, never replace, because the player's own
    // active books live in that array.
    //
    // The marker dependency is the known ceiling. Lorebook content is only emitted
    // where the preset carries a `world_info_before`/`world_info_after`/`lorebook`
    // marker (`marker-expander.ts`), so the same block is ALSO written once as a
    // `system`-role transcript row: that carrier works under every preset that
    // could work at all, and a preset that fails to read writes both. A duplicate
    // paragraph is cheaper than a missing premise. Both writes are best-effort and
    // logged — a chat with no snapshot is still a perfectly good chat, so nothing
    // here may fail the spawn.
    //
    // WHAT IS RETIRED, AND IT IS RETAINED. `registerPromptContext` and its
    // contributor are commented out in `server-entry.ts` (the import goes with the
    // call, because an unused import is a lint error), which is why this release
    // DROPS the `prompt-context` permission: nothing in this package takes part in
    // any single turn of anything any more. Dropping a permission is not a new
    // grant, so a player updating is not asked to re-approve the rest — but the
    // manifest still changes, which is why this is a version at all. The retired
    // code stays in source under `RETIRED 0.4.43` banners: `importVillagerScene`,
    // `readSceneTranscript`, `unlinkVillagerScene`, `readVillageSceneLock` and the
    // lock's route wrapper are all still there, exported and uncalled, along with
    // the `SceneGate` component, the `-gate-*` rules and the two icons that went
    // with them. Exported-but-uncalled is deliberate: it keeps the imports those
    // functions use alive so the files still lint.
    //
    // THE THREE SCENE ROUTES ARE GONE and the four that replace them are
    // `GET /spinoffs/prompts` (the preset picker, which moved out of the tab so the
    // tab no longer needs a listing), `GET /presets/:presetId/variables` (unchanged
    // path), `POST /villagers/:characterId/spinoff`, and `GET /spinoffs/:chatId`,
    // which reads the `villagesSpinoff` stamp out of the chat's metadata for the
    // two in-chat surfaces and answers `null` — never an error — for a chat that
    // did not come out of a village.
    //
    // `tests/villages-scene.regression.ts` is `tests/villages-spinoff.regression.ts`
    // now. The old suite's scene proofs went with the lane; what replaces them is
    // the round trip that matters, because the writer of the lorebook and the
    // reader of `activeLorebookIds` are two separate coercions and nothing else in
    // the repo would notice if they disagreed.
    //
    // 0.4.42: the scene lock is pressed where the routes are registered, because
    // the object a package is handed has no `addHook` on it.
    //
    // 0.4.41 put the lock in an `onRequest` hook, and the package never
    // activated at all: a capability package is NOT given a Fastify instance. The
    // host builds a collector carrying the five route methods and
    // `addContentTypeParser` (`capability-route-registration.service`), casts it
    // to `FastifyInstance`, calls the plugin with it, and then registers the
    // collected definitions itself. So `app.addHook` was `undefined`, the call
    // threw `TypeError: e.addHook is not a function` at registration, the failure
    // escaped the server entrypoint, and the package landed in `installed.json`
    // as `status: "error"`. An agent in that state is not served at all, so
    // Villages vanished from Installed Agents AND from Home's top bar at once,
    // with nothing in the village to say why.
    //
    // The lock is now in front of the HANDLERS instead of in front of the plugin:
    // every route is registered through a small wrapper that wraps the four write
    // methods and passes `get` straight through. It occupies the same place in
    // the request, it still exempts the three exits — opening a scene, bringing
    // one home, forgetting the link — and a mutating route can no longer forget
    // it, because being locked is now a consequence of HOW a route was registered
    // rather than of somebody remembering to lock it. The Engine is still not
    // touched for any of it.
    //
    // `tests/villages-scene.regression.ts` is why this shipped broken. Its host
    // double registered the plugin as a real Fastify plugin, which handed it the
    // `addHook` the real host does not have: the double was more capable than the
    // host, and a package that could not activate passed all eight suites. The
    // double is now built from the host's own collector shape and asserts that it
    // has no `addHook`, so the suite fails with the Engine's exact error if one
    // ever comes back.
    //
    // 0.4.41: a scene is somewhere the player is TAKEN, not somewhere they have
    // to go and find, and the village cannot be played around while someone is
    // in one.
    //
    // 0.4.40 opened the door and then stood in it. Three things were missing and
    // all three are the same thing seen from three angles: the lane had no hands.
    //
    //   1. THE CHAT IS REACHABLE FROM THE VILLAGE. "Take them somewhere" made a
    //      chat and left the player on the map, with the Engine's own chat list
    //      as the only way in. The scene is now offered back as a place to GO:
    //      one button that lands the player in the chat, pressed by the player
    //      and never fired for them, plus a `touch` so Home's Continue Chatting
    //      shelf carries it as a place they were. There is no Engine route for
    //      "open a chat" — the app never creates a history entry and a package
    //      cannot call its way into one — so the button writes the same
    //      localStorage key the Engine's own chat store writes and lets the
    //      app's next load pick it up. Marked with a `ponytail:` comment at the
    //      call site, because it is a floor and not a ceiling.
    //
    //   2. THE PRESET IS CHOSEN IN THE ACT OF LEAVING. It used to be a `<select>`
    //      on the row, which asked the player to decide a chat's preset before
    //      there was a chat, with no sight of the variables that preset needs.
    //      Both steps are now one popup that dims the map: the preset list, then
    //      that preset's own questions — the Engine's own option order, its own
    //      button-versus-listbox rule, its own multi-select — and only then is
    //      the chat made. The answers land in the chat's metadata as
    //      `presetChoices` BEFORE the opening line is asked for, so the
    //      villager's first words are already written with them in view, and the
    //      Engine's own preset-variable reader finds them exactly where it looks.
    //
    //   3. A SCENE IS A PLACE THE PLAYER IS, AND THE VILLAGE KNOWS IT. While a
    //      villager is out in a scene the whole village closes: the map is
    //      replaced by the scene itself and one button that takes the player to
    //      it, and every write the tab could make is refused by the ROUTES rather
    //      than by the screen. A lock kept by a caller is a rule the next caller
    //      forgets; a refusal from the route is a rule. Bringing a scene home and
    //      forgetting the link both stay open, because those are how a scene ENDS
    //      — and until it ends the player is doing something with that villager.
    //
    // The Engine is not touched for any of it. Every piece is the package using
    // routes the Engine already has: the capability session's own chat read and
    // metadata write to switch the village on inside the chat it just made,
    // `/api/prompts/:id/variables` proxied through the package's own route so the
    // popup can draw a preset's questions, and the app's own active-chat key for
    // the hand-off.
    //
    // A scene chat is also activated for the village's two IN-CHAT surfaces, and
    // this is why neither had ever been seen. 0.4.40 declared the roleplay
    // toolbar slot and this release declares the tracker-panel slot, but the
    // Engine only mounts a package into chat chrome for a chat that has the
    // package switched on, and nothing had ever switched it on: the package made
    // the chat and left its activation to a screen it cannot reach.
    //
    // 0.4.40: a villager can be somebody the player WRITES with, in a chat the
    // Engine owns, and still be the same person who greets them in the drawer.
    //
    // Every version before this one kept a villager's conversation inside the
    // village. That was right and it is not going to change for the drawer: a
    // village of sixty cannot be sixty chats, the drawer's conversation runs on
    // the agent's own connection, and the whole point of keeping the transcript
    // is that the player can forget it without losing anything of the Engine's.
    // But it is also why a villager could never be a real character to write
    // with — no preset of their own choosing, no swipes, no editing, no history
    // the Engine keeps. So 0.4.40 adds a second channel beside the first, and it
    // is deliberately not a replacement: the drawer stays exactly as it was.
    //
    // A SCENE is an ordinary roleplay chat. The package asks the Engine to make
    // one through the same route the roleplay tab uses, with the same fields,
    // and then gets out of the way: it does not send a `connectionId`, because
    // the Engine's own default for a new roleplay chat is the model the player
    // picked for roleplay and the village's narration model is not that; it does
    // not set a group, because a scene is one villager and the player; and it
    // never renames, moves, re-connects or deletes the chat afterwards. What the
    // player gets is a chat in their own chat list, with their own Persona, that
    // behaves like every other roleplay chat they own.
    //
    // The one thing the village decides is what the villager knows, and it says
    // it as a `prompt-context` contributor rather than as a preset. That choice
    // is the whole of the design. A preset is stored text, so the moment the
    // village wrote one the villager in that chat would be frozen on the day it
    // was written and every later change to the village's voice rules, its
    // memory, or the villager's own week would be invisible precisely in the
    // channel the player spends the most time in. The contributor answers on
    // every turn with the villager's day, their wants, their standing, the people
    // around them and what the village has decided to remember — the same read
    // the drawer gets — and answers `null` for every chat that is not a scene, so
    // a village that has opened nothing costs a player nothing.
    //
    // Two permissions come with it and they are the reason this is a 0.4.x that
    // a player must re-approve. `prompt-context` is thrown for at registration,
    // so a manifest without it does not degrade the lane — it fails the entire
    // package's activation. `chat-write` is what lets the villager write the
    // opening line of their own scene and nothing else; the village still never
    // edits or deletes an Engine chat, and bringing a scene back is a READ.
    //
    // Two manifest flags change for the same release. `roleplay-tracker` gives
    // the village one button in the Engine's roleplay chrome that knows which
    // villager a chat belongs to, and `libraryHidden` goes away because the
    // Engine hides a library-hidden manifest from Chat Settings → Agents: a
    // control the player cannot switch on is not a control.
    //
    // The transcript a scene leaves behind is read back through exactly the
    // helpers the drawer's "end this conversation" uses, so the two channels feed
    // one person rather than two. A scene with no line of the player's own in it
    // is not sent to a model at all, and a scene that IS read is never deleted —
    // its lines live in the player's chat, and the village only writes down what
    // it took from them.
    //
    // 0.4.39: a villager is told their whole day, hour by hour, rather than the
    // single hour they happen to be standing in.
    //
    // 0.4.38 gave a villager the village's words for the thing they are doing
    // right now and a list of the phrases the week is made of. Both were true and
    // both were the wrong shape. "Right now you are at home" reads as a state the
    // character is IN, and a villager in a state answers a conversation from
    // outside it; a day with hours in it reads as something they are in the
    // middle of, which is what somebody who has been interrupted to talk is.
    // The list of week phrases was worse than useless next to it — it named the
    // same hour back again in different words.
    //
    // So the two things a schedule has are joined, once, at the only place that
    // holds both. The Engine's read of a week now carries the very blocks the
    // village was already searching for the current hour, which costs nothing:
    // the list was being read either way. `dayPlan` lays the stored translation
    // over that list and hands back one entry per block — the Engine's time range
    // untouched, the Engine's own sentence beside it, the village's words where
    // there are any, and the village's `at home` where there are not. Nothing is
    // merged into a morning or an evening; a card with a different activity in
    // every hour comes out the other end as twenty-four hours.
    //
    // The villager's prompt prints that day. So does the narrator's resident
    // list, for every villager in the village, which is what lets a happening
    // arise out of what somebody is actually doing at the hour it happens in —
    // a rule now spelled out for all three writers rather than left to chance.
    // The narrator also keeps a capped `On other days:` line, built from what
    // today does not account for, because a week is longer than today.
    //
    // The translation asked for a week at a time is what makes any of this
    // block-level, so a miss costs a stretch of somebody's day rather than one
    // clause: the caps on moves and on activities asked about together went from
    // forty to sixty. That is a ceiling and it is named as one — a week larger
    // than it still comes back short. The upgrade is to ask again for exactly the
    // missing keys and merge them into the same table, and it is deliberately not
    // built yet.
    //
    // The Schedules tab shows the join rather than the question: what the village
    // asked for, what it stored, and the day it reads out, block by block, with
    // the hours it has no words for marked as such.
    //
    // 0.4.38: the villager's week is translated into the village's own words,
    // and a line that has not been translated is never read out as the Engine's
    // own sentence.
    //
    // The translation of a character's schedule was keyed on the week the
    // schedule started, and nothing else. That is one fact about a schedule and
    // it is the wrong one: the player edits a block, a source the Engine reads
    // writes one, the schedule is regenerated — and the week underneath the
    // translation has moved on while the key still calls it current. It is now
    // keyed on a digest of the whole question the translation answers: the week,
    // every activity that was asked about, the village's setting, and the venues
    // the answer was pinned to. Any of those changing is a different question,
    // and a different question is asked again.
    //
    // And it leaked. When a lookup found nothing, the Engine's own sentence —
    // the activity exactly as it is written on the character's card — was handed
    // to the villager's prompt and to the drawer. A villager whose week had not
    // been translated yet still described crossing a city that this village does
    // not contain. A miss now falls back to the village's own `at home`, which
    // is the one thing that is true here whatever the card says, and the routine
    // summary is no longer printed through a fallback that was never the
    // village's to give.
    //
    // What is left is what the leak had been hiding. A translation is asked for
    // before the tick's gates rather than inside them, so a village whose clock
    // is asleep still translates the weeks of the people in it; a villager the
    // player moves in is translated on the way in rather than during their first
    // hello; and the Schedules tab says what is stored instead of promising a
    // venue the translation never named.
    //
    // The four states a villager can be in — asleep, busy, between things, out
    // and about — are now spelled once, as a phrase the card reads, and the same
    // phrase reaches the drawer, the resident list and the prompt. A card that
    // says a villager is to be left alone now says so in the villager's own
    // words rather than in the Engine's token for it.
    //
    // 0.4.37: stepping out of a chat stops freezing the tab, and what stays
    // frozen is who will talk.
    //
    // 0.4.36's debug close parked the drawer and left the whole tab held shut
    // with it, which made the one state the fixture exists for — put a chat down,
    // go and look something up, come back to it — the one state it was
    // impossible to use. The lock now has two arms and two names: `chatLocked` is
    // the conversation in hand (nobody else may be talked to) and `chatHoldsTab`
    // is the OPEN drawer (the drawer is being typed into and covers the map on a
    // phone). The Menu answers to the second, so a parked conversation leaves the
    // panels reachable, and the parked note at the foot of the map says so — a
    // lock nobody can see the edges of reads as a tab that has stopped answering.
    //
    // The villager list inside the Menu is the other way a conversation starts, so
    // it is held shut by `chatLocked` exactly as the houses on the map are: it is
    // handed no `onSelect` and draws the name as the label it becomes, the same
    // shape a pin with nowhere to go already had. And because a fixture feature is
    // the kind of thing that gets quietly relaxed a release later, all of it is
    // asserted against the source — including that the Menu is NOT back on the
    // single lock.
    //
    // 0.4.36: two debug controls in the chat header, drawn on every conversation
    // there will ever be, and the way back to a conversation that was stepped
    // out of rather than ended.
    //
    // Both controls are a fixture of the drawer: they are drawn whatever the
    // phase, whatever the card, and whether or not anybody has said a word, so
    // they sit outside the conditional the conversation's own verbs live in.
    // That is the whole of the promise and the whole of what could break — a
    // control that is only sometimes there is one that has to be hunted for —
    // so the regression reads the header and asserts they are drawn after that
    // branch rather than inside it.
    //
    // `DEBUG: Close chat` parks the drawer: nothing is sent, nothing is ended,
    // and the conversation stays in hand, which is a state the drawer's own open
    // flag cannot express. `DEBUG: Force end chat, saving nothing` is the other
    // half: it empties the room through the same route the Forget question leads
    // to, with the question skipped, because its own name is the warning. It is
    // shut while a line of the player's is in flight, since an answer already on
    // its way would land in the room a moment after it was emptied.
    //
    // The map stays locked while a conversation is parked, which is what makes
    // the `DEBUG: Resume Chat` control hanging under that villager's pin the only
    // thing on the map that answers a click. It is drawn below the pin and
    // absolutely, so a pin carrying one still marks exactly the building it
    // marked before.
    //
    // `onPark` is read from the drawer's own props, which is 0.4.34's whole
    // lesson and is now asserted for as well as `remembering`: the lint and the
    // build are both blind to a prop that is passed, typed, and left out of the
    // destructuring pattern.
    //
    // There is no 0.4.35. One was built and then withdrawn before it reached a
    // catalog, so the number is not reused and the artifact beside this release
    // has no source that can produce it.
    //
    // 0.4.34: the drawer reads the flag that shuts the way out instead of
    // reaching for a name that is not there. Ending a conversation blanked the
    // tab; this is why.
    //
    // 0.4.33 gave the drawer a second flag — the village is still writing the
    // conversation down — and named it in the drawer's props, passed it from the
    // tab, and read it in three places. It was left out of the drawer's own
    // destructuring pattern, and nothing between the source and the player said
    // so: `no-undef` is switched off for TypeScript, the package is bundled
    // without a type pass, and a name that is never declared is not a mistake
    // any of those tools is looking for. What reached the browser instead was a
    // free variable, and reading one throws. The moment a conversation ended, or
    // the way out was drawn on a room nobody had spoken in yet, the drawer threw
    // `ReferenceError: remembering is not defined` in the middle of a render,
    // React tore the tree down with nothing above it to catch, and the tab went
    // black and stopped answering anything at all.
    //
    // The fix is the one line that was missing. The regression is a source-read
    // because the bundle is minified and cannot be asked: every local is renamed
    // on the way through, so a name left behind as written is exactly the shape a
    // missing declaration makes, and the test now reads the drawer's destructured
    // pattern for it.
    //
    // Nothing about the ending itself changed. The two closing calls keep their
    // order, the map stays locked until the conversation is filed, and
    // `remembering` does what 0.4.33 said it did.
    //
    // 0.4.33: the ending is shown when the goodbye lands, the way out moved to
    // the foot of the conversation, and every visit gets its own hello.
    //
    // Three things about the end of a conversation, and only the first is a
    // change of behaviour rather than of where the player is looking.
    //
    // The drawer used to wait on BOTH closing calls before it would show the
    // conversation as over, and only the first of them is anything the player can
    // see: the second writes a memory they will never read and clears the room
    // they have just finished being in. Ending a chat therefore spent its whole
    // wait on a record nobody would ever look at. The ending is now drawn the
    // moment the goodbye is in, and the filing carries on behind it under a flag
    // that keeps the one remaining control shut until it has landed. The ORDER of
    // the calls did not change, which is what keeps this from being a race: the
    // map stays locked and the way back is closed until the village has actually
    // filed the conversation, so nothing can be said or done to a room whose
    // transcript is about to be cleared.
    //
    // The way out itself moved out of the header. It used to sit in the same row
    // as the verbs of an open conversation, where it could not be found; it is
    // now drawn at the foot of the log, centred in the run of bubbles and padded
    // like a message of its own, because the moment it is wanted is the moment
    // the log has been read to the bottom.
    //
    // And reopening a villager reads the room again. Opening somebody, ending the
    // chat and going straight back to them used to open on the room the last
    // visit had already emptied — no hello, because the drawer never asked for
    // one. The room is now read on every visit rather than on every villager, and
    // an empty room is what asks the villager to say hello, so a new chat opens
    // on a greeting the way a new chat should.
    //
    // 0.4.32: the village is told that the player chose to leave, instead of
    // having to read it out of a goodbye.
    //
    // 0.4.31 stopped the departure being a line of the player's, which is what
    // stopped the villager answering it — and it took the fact of the departure
    // out of the transcript with it. The closing call was left reading a
    // conversation that simply stops after a goodbye, while its own rules tell
    // it to leave greetings out, so the one fact the narrative needs to make
    // sense of the last exchange was the one fact nothing said. The closing
    // prompt now states it: the player ended the visit and left, the goodbye is
    // the last line, and the departure is not small talk — it may be the memory
    // when the goodbye is what the conversation came to, which is how it reaches
    // the chronicle the narrator reads rather than dying with the transcript.
    //
    // 0.4.31: leaving is something the villager is told rather than something
    // the player announces.
    //
    // 0.4.30 made End conversation say the player was leaving, in the drawer, in
    // the second person — _You get ready to leave._ — because the transcript has
    // to hold something of the player's for the village to remember the
    // conversation at all. It read as narration and it was answered as
    // narration: a villager handed a remark about themselves reacts to the
    // remark rather than to the departure, so the last exchange of every
    // conversation was the player's own stage direction coming back at them.
    // `POST .../conversation { leaving: true }` carries the departure as a flag
    // instead. The villager is handed the shape the room's greeting has always
    // used — the direction on the end of their own system prompt, and a
    // third-person cue to answer — and only their reply is written down, so what
    // the player reads back is their last real line, its answer, and the goodbye.
    //
    // And once the goodbye has been given the drawer offers one control and
    // nothing else: **End chat**, which closes the chat and hands back the
    // village.
    //
    // 0.4.30: the conversation is a room, and it is the only room open.
    //
    // The drawer used to be a column of words with a picture stapled above them:
    // the place's backdrop as a band across the top, the villager's portrait
    // floating on it at twice the size of the list's, and two bubbles that were
    // the same undifferentiated grey. What it is now is the thing the rest of
    // the app is for — especially for a player talking to somebody who is
    // standing in front of them — so it gained a room of its own.
    //
    // The room is a column beside the log rather than a band above it: the
    // place's own backdrop fills it, the villager stands at its foot, and the
    // place's name sits on a plate over the floor. A column because a band
    // spends the drawer's scarcest resource — height, on a phone held sideways —
    // on a picture, and because the shape it has to grow into is a venue with
    // its own background and a sprite standing in it, which is a column and not
    // a band. Their picture is the card's, cropped by the card's own crop: the
    // frame is square, which is the one shape a crop can be drawn into without
    // stretching a face through it, and the crop is decodable at all because the
    // Engine's `/api/characters/summaries` hands over `avatarCrop` beside the
    // URL — the older zoom-and-offset framing as well as the current
    // source-rectangle one.
    //
    // The two speakers are two washes now. The player's is a soft light blue,
    // built from a blue HUE mixed over the theme's own background rather than
    // from a hard-coded colour, which is what keeps it light in a light theme
    // and dark in a dark one; the villager's is the theme's own accent at a low
    // mix. Both keep --foreground for their words, so the one thing the mix
    // guarantees is that the text is the colour the theme has already promised
    // contrasts with the surface.
    //
    // Ending a conversation became the sequence it always was. The player's
    // departure is sent as a line of their OWN — "You get ready to leave." — so
    // the villager answers it in character and the answer is what the village
    // remembers; the room is then ended for real, the transcript is cleared, the
    // chat log is sealed and the story is re-read. That line is not decoration:
    // the server writes a conversation up only when the transcript contains a
    // line of the player's, and an End button that merely cleared the room would
    // quietly keep nothing at all. The villager's goodbye is held in the tab for
    // as long as the drawer is open on it, because after the ending it exists
    // nowhere else.
    //
    // Which makes the conversation the one thing a player can do while it is in
    // hand. The whole point of a villager being in front of them is that this is
    // what they are doing, so the map's houses stop opening and the Menu stops
    // opening until the conversation has been ended — and both say so out loud
    // in the notice at the foot of the picture, because a village that has
    // quietly stopped responding is the worst way to say "finish this first".
    // Once it has been ended, every command that could still say something to
    // somebody who has been left is hidden with the composer, and the same
    // corner holds the one named button that is left: Close chat.
    //
    // And Forget is a debug action rather than one of the player's options.
    // Nothing a player of this game is meant to be able to do leaves the village
    // with no memory of a conversation that happened — no story entry, no
    // chronicle line, no chat log, no memory of the villager's — so the button
    // wears the destructive colour, is named as debug in its own title, and
    // raises a question in the drawer, under the button that raised it, before
    // it erases anything. Answering it erases the conversation and takes the
    // drawer with it; the drawer closes only once the erase has actually
    // happened, because a drawer that slid shut over a failure would hide the
    // one line saying nothing was forgotten at all.
    //
    // 0.4.29: the village fits a phone.
    //
    // The tab answered to the window, and a phone is where that is paid for. A
    // phone held sideways is eight hundred pixels wide and four hundred tall — a
    // third of the height a laptop gives — and every size in the sheet was either
    // a fixed rem, so it held the size it had on a monitor and kept the picture's
    // share of the tab, or was not stated at all. The news was a column of the
    // row, so the map was fitted to whatever the news had left and the column was
    // held open whether or not there was anything in it. The controls were
    // twenty-six pixels tall, which is a mouse's answer to a question a thumb is
    // asking. And there was no way onto the whole screen, because the Engine's
    // capability mount has no fullscreen control and this tab had none either.
    //
    // Everything now answers to the TAB rather than to the window, which is what
    // lets a phone held sideways and a narrow desktop window be told apart: the
    // host declares itself a size container and the sheet queries it — by NAME,
    // because the sheet is injected into the document rather than shadowed, and
    // an unnamed query would match whatever container happened to be nearest.
    // Only the edge buffer and the gap scale with the room, off two numbers
    // declared once on the root. The type deliberately does not, and that is a
    // decision rather than an omission: GachaForge has to shrink its own because
    // it is a fixed 16:9 stage that cannot give up any of itself, while this tab
    // is a wrapping panel where twelve-pixel body text is still readable and the
    // thing a phone is short of is room, which is what the whole screen gives
    // back.
    //
    // The whole screen is the tab's to take now. GachaForge draws its own button
    // for the same reason, and it is asked for on the HOST rather than on the
    // map's frame: a fullscreen element that a re-render replaces takes the
    // fullscreen state with it, and the map would lose the screen the next time a
    // snapshot arrived. One button and not GachaForge's two — its header can be
    // pushed off screen and its controls do not travel with it, while this tab's
    // are drawn on the picture and go wherever it goes. A phone held upright is
    // told so rather than shown a map it cannot use, by the same portrait and
    // coarse-pointer media query GachaForge uses, and the button there asks for
    // the screen first and WAITS for it, because a rotation lock is refused
    // outright while the document is not already fullscreen. That order is
    // GachaForge's own `_wireLandscape`, and it is the one thing here that does
    // not work the other way round.
    //
    // The news left the row for the picture's own top corner, behind a button,
    // across from the clock: a gutter down one side of the map is a cost the
    // picture pays on every screen for a feed read now and then, and on a phone
    // there is no width to hold it open with. It is the same list in the same
    // order, in a card that unrolls over the picture and closes when the player
    // presses anywhere else.
    //
    // And the sheet no longer breaks a word to fit. `overflow-wrap: anywhere` is
    // what lets a narrow parent shrink a box to one character of floor —
    // GachaForge measured the result at 33px of text, "Inven/tory/scree/n" — and
    // no box this tab draws needs a floor of one letter. `break-word` breaks the
    // word that cannot fit and leaves the floor where the language put it.
    //
    // 0.4.28: the refusal now reads the way the rest of the app reads.
    //
    // 0.4.27 answered a refused secret with a sentence of the tab's own. It said
    // the right thing, but it said it in a vocabulary no other panel in Marinara
    // used, and the gate's own terse line was appended to it in the same run of
    // text, so the player read one long sentence with no brackets and had to work
    // out which half was the instruction and which half was the diagnosis.
    //
    // The sentence is now the Engine's `PRIVILEGED_ACCESS_HINT` word for word —
    // the one its own panels show for the same refusal — and the gate's line is
    // kept in brackets behind it, in the shape the Engine's own helper builds:
    // "This action needs loopback access or admin access. Open the app through
    // localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the
    // same value in Settings → Advanced → Admin Access. Marinara sends it as the
    // X-Admin-Secret header. (ADMIN_SECRET is required for privileged APIs)".
    //
    // The wording is no longer the village's to choose, so it is no longer the
    // village's to drift: the regression proof reads the Engine's own constant out
    // of the vendored client and fails when the two differ, which is the only way
    // a copied sentence can be kept honest.
    //
    // 0.4.27: the village could not be opened from another machine.
    //
    // Every route this package serves is privileged, and the Engine answers a
    // privileged call from any address but its own loopback one **only** when the
    // request presents the admin secret the owner set on the server. Every other
    // tab that talks to a privileged route sends it — Noodle, Slurp, Long-Term
    // Memory and the Engine's own panels all read the value the owner pasted into
    // Settings → Advanced → Admin Access and attach it as `X-Admin-Secret`.
    // Villages was the one asking bare, so it worked on the machine the Engine
    // runs on — loopback does not want a secret — and was refused everywhere
    // else, whatever the owner had pasted, with a message about a header the
    // package had never sent and no way for the player to tell which of their two
    // machines it meant.
    //
    // Both of the tab's fetches now build their headers in one place and attach
    // that value, which is the whole of the client half; `requestHost`, which asks
    // the Engine's own API for portraits and connections, goes through the same
    // builder so the "in the same shape the Engine's own panels ask them" the
    // comment above it claims is true again. A refusal that is really about the
    // secret also now says where the matching value goes, in a sentence of the
    // tab's own, and every other refusal is passed through untouched because the
    // tab has nothing to add to it. (0.4.28 replaced that sentence with the
    // Engine's own.)
    //
    // The server half is unchanged and is still the server's: `ADMIN_SECRET` has
    // to exist on the machine running the Engine, in its `.env` (picked up in
    // about two seconds, no restart) or as a real environment variable, and it has
    // to be the value pasted into each browser. Nothing of the village's own has
    // to be configured, and nothing changes for anyone playing on the machine the
    // Engine runs on.
    //
    // 0.4.26: three failures that all reached the player as somebody having
    // nothing to say.
    //
    // Every stored column in this package is JSON *text*, and the reader that
    // parsed it was calling `parse` on the capability runtime host — which is a
    // single `parseJsonish` helper and has no `parse` at all. The TypeError went
    // straight into the reader's own `catch`, which exists to mean "this body is
    // not JSON", so every schedule in the village read as absent while every card
    // plainly had one, and DEBUG: Villager Schedules told the player their cards
    // were empty. The global `JSON.parse` is used now, and the reader also hands
    // back whether the character library could be read at all, so the listing can
    // say "nobody looked" instead of blaming a card.
    //
    // The other two are the same shape: a call that came back with nothing was
    // reported to the player as a fact about the villager. Ending a conversation
    // answered `"<name> had nothing to say about that."` — a 500, the
    // conversation kept, no memory written and the chat log never closed — and
    // every room in a live village opened with the standing hello, because the
    // greeting was the smallest budget in the package (160 tokens) and a thinking
    // model spends all of it before writing a word. The budgets are sized for a
    // model that reasons now, a blank answer is asked again once with more room,
    // and what the player is told when it fails is what happened to the CALL
    // rather than a verdict on the person they were talking to.
    // 0.4.25: the drawer becomes a place you can see, and talking splits into
    // three verbs.
    //
    // The conversation has always known where it was happening and never shown
    // it — a villager's own lines say "I am just closing up", and the player had
    // to hold the town map in their head to know what that looked like. The
    // drawer now opens on a stage: the picture of the place the villager is
    // standing in, with their portrait and the place's name at the foot of it.
    // Every part of that is the join the package already had — the week on the
    // card, the translation Villages wrote for it, and the picture the player
    // put on the place — read out at the moment the drawer opens rather than on
    // the sixty-second poll, because only the drawer draws a place.
    //
    // The one new thing the week had to learn is WHERE a move happens, which is
    // not something a person writing out their week would naturally produce. So
    // the translation prompt now hands the model a numbered list of the village's
    // places and asks each move for the number of the one it happens in, and the
    // number is resolved to a venue id at WRITE time. A name would have to be
    // matched at read time, and a place renamed or deleted after the fact would
    // then quietly re-point every old week at whatever shared its name — an id
    // cannot. Out of range, absent, fractional, a list: all of it resolves to
    // nothing, and nothing is an ordinary answer that draws the same thing as
    // every other nothing.
    //
    // Carrying the id into storage is part of that, and it is the part that
    // fails silently. A stored record is read back through a second, independent
    // coercion before anybody sees it, so a reader that copies the key and the
    // sentence and forgets the place leaves a translation that reads as correct
    // in every way a person can check. The reader carries the id too, and does
    // not test it against the places the player has now: a place renamed or
    // deleted since the week was written is a miss, and a miss is honest.
    //
    // And the chat surface itself now offers the three things a person can do
    // with a neighbour, rather than one: Chat is shooting the breeze, Ask gets
    // an answer to what was actually asked (including advice, and including
    // being asked for something), and Fulfill is the player saying what they
    // have already done. The three are framings rather than settings — each one
    // tells the villager what kind of turn this is, so an Ask can produce the
    // advice a Chat never would, and a Fulfill does not read as an opening bid
    // in ordinary conversation.
    //
    // Fulfill is the one framing that does not reach the villager directly: the
    // claim goes to the judge first, and only what the judge made of it reaches
    // the villager. That is why the route that reads a mode off a request body
    // still answers with two of the three and never the third — anything a
    // same-origin caller could name is something the package can no longer
    // vouch for, and the whole feature rests on nobody being told what somebody
    // is waiting on.
    //
    // The village's own refusal to weigh a claim from somebody who is waiting on
    // nothing stays exactly where it was, before the judge is asked. A verdict
    // of "no" against an empty list would read as the village disbelieving the
    // player rather than as there being nothing to settle, so the drawer says so
    // in words instead of drawing a box that could never have answered.
    //
    // 0.4.24: a villager can see their own schedule again, and the schedule
    // gets its own debug tab.
    //
    // Engine 2.4.6 moved a character's weekly schedule off the chat and onto
    // the character CARD, at `data.extensions.conversationSchedule`. `chats
    // .storage.ts` reads it back with `readCharacterSchedule(row.data)` and its
    // own comments call the card the source of truth while calling the chat's
    // copy a cache that "can be stale or hold a schedule the character has
    // since replaced". That cache is also gated behind `conversationSchedules
    // Enabled`, which is off unless a chat opted in or already held one, so a
    // chat older than the schedules reads as empty.
    //
    // The village was reading only that cache, so a character whose card plainly
    // had a week was announced as having none, and the villager was told nothing
    // about their own day. The card is now read first and the cache second,
    // purely as a fallback for characters the card says nothing about — an
    // Engine that has not hoisted its old chats up yet keeps working, and a
    // cache entry can never overrule a card that has a week of its own. Both
    // reads still degrade to "no native routines" on their own, so a library
    // that cannot be read costs the village its schedules rather than its
    // snapshot.
    //
    // The second half is where that is looked at. Reading the Engine's week was
    // buried at the bottom of DEBUG: Villager Wants, in the same column as the
    // wants, and when the week came back empty there was no way to tell which of
    // the two answers had failed. It is now its own menu section, DEBUG: Villager
    // Schedules, counted by how many villagers actually have a week, and its
    // empty state names the card as the place the missing week would be rather
    // than reading as something the village lost. The two tabs draw one listing
    // from one route, so they cannot disagree about the same villager.
    //
    // 0.4.23: a place in the village can have a picture.
    //
    // Village Settings' Map tab now lists the places as well as the map, and
    // each one gets three buttons: draw a picture with the image connection,
    // choose one the player already has, or take it away again. Nothing is
    // drawn until a button is pressed — a picture costs money and a place
    // nobody has looked at yet is not a reason to spend it, so there is no
    // hook on venue creation, none on the remap and none on the tick.
    //
    // The picture is NOT kept in the village record. It is uploaded to the
    // Engine's own Global Gallery — the same road every other picture in the
    // Engine travels — and the village holds a `global-gallery:` reference to
    // it, filed in a gallery folder named after the package so all of the
    // village's art can be found and thrown away in one place. A village with
    // twenty photographed places is therefore the same size on disk as one
    // with none, which is what keeps a village small enough to back up.
    //
    // The drawing goes through the Engine's avatar route on loopback, because
    // that route already speaks to every image connection the Engine supports
    // and takes a prompt override that REPLACES the portrait prompt it would
    // otherwise compile — so the place is sent through a route named for faces
    // and arrives as a wide empty scene of the place, in the village's current
    // weather, with nobody in it.
    //
    // 0.4.22: the village stops spending every call on the same model.
    //
    // Three agent-wide pickers — System, Narration and Image — live at the top
    // of Village Settings' General tab. The work the village pays for is not
    // all worth the same money: founding it, judging a claim and writing the day
    // back out are one long call each about the whole village, a villager's
    // reply is short and frequent, and a picture is drawn only when a button is
    // pressed. A player with one good model and one cheap one can now say so.
    //
    // They are kept in a document of their OWN rather than in the village
    // record, because "Reset the village and start over" rewrites that record —
    // and the one setting nobody wants to enter twice is the one that decides
    // what everything costs.
    //
    // Nothing changes for a player who never opens the panel. An empty picker
    // falls through to the agent's own connection and then to the Engine's
    // default, which is exactly what every call did before this release.
    //
    // 0.4.21: the package is re-baselined on Engine 2.4.6 and nothing a player
    // can see changed. The declared floor moves from 2.4.4 to 2.4.6 because the
    // next two releases reach into Engine code this package has to bundle, and
    // the 2.4.6 image pipeline and Global Gallery route are not the 2.4.4 ones —
    // a package still claiming 2.4.4 while bundling 2.4.6 code advertises a
    // compatibility nobody has run. The bundle is rebuilt so every artefact
    // agrees with the claim.
    //
    // 0.4.20: wants stop being the loudest thing in the prompt. They were
    // railroading every conversation, and the wants were not the cause.
    //
    // A villager's prompt was one block about motivation and a page of facts
    // about the village, and the block about motivation was carrying the whole
    // conversation. It listed what they wanted, and it ordered those wants by how
    // much they mattered to the village — and then threw the number away. The
    // generator is told to answer 1 for most things, deliberately, so the
    // ordinary case was a want the village had made small on purpose arriving at
    // full volume, with no mechanism by which it could ever recede. Every want
    // read the same as every other want.
    //
    // The intensity now reaches the villager, said in words rather than printed
    // as a number, and the wants are read heaviest first: one that is on their
    // mind all day says so, one that sits at the back of their mind says that,
    // and the quiet middle — the default the generator is asked to reach for —
    // says nothing at all. The narrator is told the same weight in the same
    // words, because it writes the happenings the villager then reads back
    // through `{{happenings}}`, and a writer that cannot tell a faint want from a
    // loud one turns the faint one into news about them just as readily.
    //
    // The block around those wants was rewritten rather than trimmed. It used to
    // guard against a want reading as an errand by naming it over and over — not
    // a plan, not a task, not information you owe anybody, do not hand it over,
    // rather than naming it — and every one of those is a fresh instruction to
    // think about the want, which is how a block meant to be background became
    // the loudest text in the prompt. It now says what a want is, and adds the
    // one thing that was never there: permission for a reply to have nothing to
    // do with it. The mode block's closing line said it a third time, at the very
    // end of the prompt where recency gives it the most weight, and it is gone.
    //
    // `{{doing}}` finally carries a life. The Engine's schedule status — `online`,
    // `idle`, `dnd`, `offline` — was read, translated into words for the debug
    // tab, and dropped before the prompt ever saw it, even though it is the only
    // field of a schedule that is about autonomy rather than about nouns, and an
    // hour marked as not to be interrupted is the most authoritative reason to be
    // short with somebody that a villager could be handed. It reaches the prompt
    // now, in the same words the translation used. The rest of their week rides
    // along with it, so the hour has some company instead of standing alone as
    // one clause against a page of village facts. Both come out of a schedule
    // that was already being read: no extra read, no extra call, and the
    // translation's own moves are the texture, so nothing new is generated for
    // it either.
    //
    // No new macro, and that is a constraint rather than a preference.
    // `promptVoice` and `promptKnowledge` are the player's stored text, so a
    // village that has already written its own preset would never render a macro
    // added now, no matter how good it was. Everything above lives inside
    // `{{doing}}` and `{{wants}}`, which every stored preset already has.
    //
    // Needs nothing from the Engine and `engine.min` does not move: the status is
    // already in `metadata.characterSchedules`, which the village was already
    // reading and already parsing.
    //
    // 0.4.19: the Engine's week comes into the village in the village's own
    // terms, instead of the village wearing the Engine's.
    //
    // Marinara writes a character's week from the character card alone, before
    // anything knows which village that character lives in. That is the right
    // order, and it is also the whole problem: a card that says somebody flies
    // supplies produces a week that says "flying the Halcyon on a supply run",
    // and a village with no ships and no Halcyon was reading that sentence out
    // to its own residents. An all-day "at work at the office" was arriving in a
    // place that has no offices, in the Engine's verbs and the Engine's nouns,
    // with the Engine's status attached — so a villager went out to a job the
    // village has never heard of.
    //
    // Villages now keeps its own reading of the same week. Once per villager per
    // week — keyed on the Monday the Engine generated that week for — one model
    // call takes the week as a table of activities with their hours and their
    // statuses and writes back a lookup: this activity, said the way it happens
    // here, and one ordinary-day sentence for the week as a whole. "Flying the
    // Halcyon on a supply run" becomes "out on the river road with the handcart".
    // The shape survives, the status survives, the verb is translated and the
    // noun is replaced. Whatever the answer leaves out is left exactly as the
    // Engine wrote it, so a translation can be partial without being lossy.
    //
    // What it costs is one call a week per villager and nothing at read time.
    // What the village does when somebody speaks is a string comparison against
    // a table it already holds, and a miss — an activity nobody translated, a
    // week whose Monday has moved, a villager not translated at all — falls back
    // to the Engine's own words rather than to a blank line. The week comes from the
    // conversation metadata the tick already lists, on the same 30-second cache,
    // so a week nobody has touched is not re-read and a tick that finds nothing
    // new asks for nothing.
    //
    // Villages still does not write the Engine's week, and the reason is not that
    // it cannot. The `chat-write` grant exists; the week is a character-level
    // fact shared across every chat that character appears in, the Engine
    // regenerates it on its own calendar, and a second writer on one fact with no
    // tiebreak would mean a village editing a schedule every other chat is
    // reading. The translation is kept on the village's own record, beside the
    // agenda, which is the village's own business.
    //
    // The prompt is a development surface, so it is shown rather than hidden. The
    // agendas listing carries the exact messages the model is asked with — built
    // on read, never stored, because a stored copy is a copy that can disagree
    // with what was sent — and the debug panel prints them word for word beside a
    // press that throws one villager's translation away. A wording whose only
    // test is waiting for next Monday is a wording nobody tests. The invalidation
    // that actually matters is the week moving, and the key already handles it:
    // the next tick asks again, and a tick that finds the same Monday asks for
    // nothing at all.
    //
    // Needs nothing from the Engine, and `engine.min` does not move: it reads
    // `metadata.characterSchedules`, which is already there and already parsed.
    // One more field on the village's own record, a few more fields on the agenda
    // listing, and one new `DELETE /remaps/:characterId`. It does need a restart,
    // like every release that stores a new field and adds a route.
    //
    // 0.4.18: the settings panel says what it actually is. 0.4.17 made the
    // villagers sound like the people on their cards by rewriting the shipped
    // default; this one is about the box carrying it, which had stopped being
    // describable.
    //
    // One box was being asked two questions. The field labelled "Village
    // prompt" held the rules about how anyone in this village talks AND the
    // dozen tokens that fill in where the village is, who lives here, what is
    // on the noticeboard and what has happened lately. Those are not two halves
    // of one answer: one is a fact about the place and the other is a fact
    // about today. A player editing a voice rule had to scroll past a block of
    // macros to find it, and a player who wanted the noticeboard out of their
    // prompts had no way to say so short of rewriting the rules around it.
    //
    // It is two boxes now — `promptVoice` ("How everyone talks") and
    // `promptKnowledge` ("The information villagers know"). The macro row is
    // one row under the second box that writes into whichever box was last
    // focused, because the tokens are the same seventeen in both and a second
    // identical row of seventeen buttons would say exactly what the first row
    // says.
    //
    // The fallback is by the PAIR, not by the box, and that is where the safety
    // of it lives. A village that wrote nothing in either box gets the shipped
    // wording, which is what lets an improved default reach a village that
    // never opened the panel. A village that wrote ONE box gets that box alone:
    // joining the other box's default on behind the player's back would be the
    // panel telling their villagers something they did not ask them to be
    // told. A village carried over from the one-box release reads
    // byte-identically — the legacy `promptPreset` becomes `promptVoice`
    // verbatim with `promptKnowledge` empty, and the pair joins to exactly the
    // text it rendered before. No splitter and no heuristics, because a
    // heuristic would silently rewrite prompts somebody wrote.
    //
    // Two areas of the panel are switched off and left on screen. "What this
    // place is like" and "Places in the village" are one question with two
    // halves and are moving to a setup flow of their own; until that lands,
    // leaving them editable would mean two screens writing the same village and
    // a half-edited state between them that is worse than not being able to
    // touch them at all. They stay on screen rather than coming out because
    // what is in them is still real and still working: `{{setting}}` and
    // `{{venues}}` are unchanged, and both values are still read from the
    // record and written back with the rest of the panel, so nothing already
    // written is lost or has to be typed again.
    //
    // Needs nothing from the Engine, and `engine.min` does not move: one more
    // field on a record the village already keeps, one more field on a snapshot
    // it already sends, and a default string split in two. The settings body
    // gains `promptVoice` and `promptKnowledge` in place of `promptPreset` — a
    // rename of a field rather than a new route, a new permission or a new
    // Engine surface. The one cost is that the second field is stored, so this
    // release needs a restart where 0.4.17 did not.
    //
    // 0.4.17: a villager sounds like themselves, and the reason they did not is
    // that the preset never said whose voice to write in. 0.4.16 gave everything
    // the player does somewhere to show up; this gives the people doing it
    // something to sound like.
    //
    // A village runs ONE prompt preset across the whole cast, and the shipped
    // default was a list of prohibitions: do not write the player's words, do
    // not prefix your own name, no asterisks, do not invent facts, keep it
    // short. Every one of those is correct, and every one of them is about what
    // a villager may not do. Not one sentence said whose voice to write in.
    // Set against the Engine's own preset — which names the character's
    // description and personality outright as the source of the voice, forbids
    // the cast sounding interchangeable, and bars lazy stock phrasing by name —
    // the omission is the whole of the complaint. Told what to avoid and never
    // told who they are, a dozen villagers answer out of one mouth.
    //
    // The rewrite is the Engine's own ideology in the Engine's own register,
    // inside the document the player already owns. Identity first — a real
    // person going about their own day, not a narrator and not the village
    // speaking — then the voice source named outright, then the two rules that
    // do the actual work of keeping a cast apart: nobody here sounds like
    // anybody else, and how you talk follows how you feel. The prohibition list
    // is not deleted, it is moved behind them, because the same sentence reads
    // as containment where it stands alone and as character once the voice rules
    // have gone first.
    //
    // Two words were doing damage on their own. "Ordinary speech" appeared in
    // both the preset and in the greeting direction, and to a model ordinary
    // means unremarkable: a rule meant to keep replies short was flattening the
    // register as well. Both now ask for a line or two in the villager's own
    // voice and let the character decide what that sounds like.
    //
    // Two prose fields were missing from the card. Backstory and appearance are
    // where an Engine card keeps both, and the Engine sends them to the model by
    // default, so the package was quietly handing a card's owner less than the
    // Engine does — and a card whose voice lives in one of those two fields read
    // as generic here for exactly that reason. Both are read now, and appear in
    // the identity sheet only when they hold something.
    //
    // Example dialogue is still handed over, and it now says what it is for. A
    // bare block of the character's own past lines sitting in a prompt is read as
    // a template, so a villager answers by reaching for lines the card already
    // contains; the block now says those lines show the register and are not
    // lines to reuse, which is the parroting failure the Engine names outright.
    //
    // Needs nothing from the Engine, and `engine.min` does not move: a rewritten
    // default string in a document the player can still edit, two more card
    // fields read from a payload the package already receives, and a heading's
    // body. `first_mes` is still deliberately unread, and the card's own
    // `system_prompt` still goes in first and is still never rewritten.
    //
    // 0.4.16: what the player does is visibly part of the village straight away,
    // and the narrator can finally read the village's own shared story. 0.4.15
    // gave an afternoon's conversation somewhere to go and a want something to
    // come of it; both of them went somewhere the player could not see, on a
    // clock the player does not control.
    //
    // Ending a conversation wrote a memory and nothing else, and a memory is
    // read by the villager it is about and by nobody else. So the player sat
    // with someone for an hour, told them the thing, watched the answer land,
    // and then the village looked exactly as it had before — while the panel
    // that draws what has just happened, the board the villagers talk on and
    // every prompt that carries the news went on saying the same weather. The
    // only writer of any of it was the tick, and the tick runs when the part of
    // day turns over: up to four times a day, decided by the clock, not by the
    // player. Answering a want was worse, because it did not even do that. The
    // favour was filed on the chronicle and the run of days carried on as if
    // the roof were still open.
    //
    // The lever is `happenings`, and it was already the right one: it is the
    // window the player watches, it reaches every villager prompt through
    // `{{happenings}}`, and the narrator reads it back as its own recent news,
    // so one line written there is simultaneously a thing the player sees, a
    // thing the villagers know and a thing the village's story will not
    // contradict. It was simply never written by anybody except the tick.
    //
    // Nothing new was invented to write it. Ending a conversation already puts
    // the transcript in front of a model and is already the one moment the
    // package knows the conversation is over, so the village's news rides on
    // that same reply: one call, two lists, one single write to the record,
    // because two writes are two chances to keep one and lose the other. Wants
    // have no such call to ride on — the judge is asked a yes or no, not asked
    // to write — so a settled want pays for one small extra call of its own,
    // out of band, after the answer has already gone. A want that was NOT
    // settled asks nothing and costs nothing, because a refusal is not news.
    //
    // That extra call is handed the judge's own past-tense line and never the
    // player's claim, and the difference is the whole safety of the route. The
    // claim is the one sentence in the path that nothing has checked yet: it is
    // what somebody said, in a village that has no way to look. The judge has
    // already read the record and decided it was true, and the thing the judge
    // wrote is the part that was decided. A reaction call fed the claim would be
    // the one way a player's own words could be written into the village's news
    // as fact, so it is not fed the claim.
    //
    // The narrator is then handed the shared story, which it never was. It read
    // the happenings window and nothing else, so a conversation that was
    // remembered and had since fallen off the end of forty lines was a thing the
    // village knew and its own storyteller did not — and the deeper the village's
    // history got, the more of it there was. A `## What the village remembers`
    // section now carries the memory entries filed against the village as a
    // whole, oldest first and capped, and exactly two rules keep it honest:
    // memories private to one villager are not in it, because that is a
    // confidence being handed to the whole square, and anything the window above
    // already carries is deduped out, because saying a thing twice spends the
    // prompt's room on saying it again.
    //
    // Both writers describe a happening with the same words now. The rule that
    // says what a happening IS — a change somebody could see from outside, not a
    // mood and not a resume of the village's own story — was written once for the
    // tick, and a second writer with a paraphrase of it is a second writer that
    // drifts. The rules are one exported list, and the count, the framing and
    // the shape of the reply stay with the writer they belong to.
    //
    // DEBUG gets a `Write it up now`, because a feature that mostly shows its
    // work when the part of day turns over is a feature nobody can test. It
    // bypasses the two switches — the bookmark that says this part of day is
    // already written, and the part-of-day setting that says when the village
    // writes at all — and it bypasses nothing else: the window is still deduped
    // against, so forcing a part of day with nothing new in it adds nothing
    // rather than inventing something to justify the call, and the bookmark still
    // moves, because a forced write IS a write-up of that part of day and leaving
    // the key behind would make the next ordinary tick cover the same afternoon
    // twice.
    //
    // Needs nothing from the Engine, and `engine.min` does not move: one more
    // field in a prompt the village already builds, one more section in another,
    // one more meaning for a record the village already keeps, and a flag read
    // strictly as `true` on a route it already had.
    //
    // 0.4.15: a want can be answered, a villager says hello in their own words,
    // and one line of a character card stops leaking into the village. 0.4.14
    // gave every villager something they wanted and kept it carefully out of
    // reach of the player, which left the want with nowhere to go: it coloured a
    // day and then the day ended. This is the other end of it.
    //
    // The card's `first_mes` is gone from the village entirely. It was read as
    // the villager's greeting and written into the transcript when they moved
    // in, which meant the first thing anybody saw in a Villages conversation was
    // a line written for the Engine's own chat surfaces — with {{user}} and
    // {{char}} macros, staging a scene the village never staged, tuned by the
    // author's own tone settings, which the village does not use — followed a
    // moment later by an actual greeting, so an opening turn arrived twice and
    // in two registers.
    // Rather than read it and not use it, the field is off the type: the card's
    // opening line now cannot reach a transcript, a prompt or a tile by
    // accident, and the only greeting left in the package is the one a villager
    // writes for themselves, standing in the room they are actually in, in
    // answer to who is actually there. If the model cannot manage it the village
    // says something character-neutral instead, because a silence at the door is
    // worse than a plain hello. The greeting is written once, under a re-check
    // the write itself performs, so two visits seconds apart produce one hello
    // rather than two, and a room that already has something in it costs nothing
    // at all.
    //
    // Talking to a villager now has two shapes. Chat is the ordinary thing it
    // always was. Ask something says so in the prompt — go straight at what was
    // actually asked, do not change the subject, do not tack on news of your own
    // — because a villager given a question and a life will answer with the life.
    // Declining is still allowed and still has to be honest about which it is,
    // which is a different thing from never being asked. The mode is the shape
    // of the question, not a fact about anybody: it is sent with the line and
    // stored nowhere.
    //
    // A want is settled by a separate call that reads the record and decides
    // whether anything actually happened. That is not a nicety. The villager is
    // a PARTY to the claim — they were just told, by someone being kind, that
    // something was done for them — so asking them whether it was done is asking
    // the one participant who cannot be objective, and a villager who is merely
    // ASKED to be strict is lenient the first time the model returns something
    // unexpected. The judge is cold, is handed the transcript, the happenings and
    // the memories rather than a summary of them, and has to name the id of the
    // want it says was settled; a yes that does not name a want this villager
    // actually has is coerced to a no, and every unreadable answer is a no. The
    // villager is then told the verdict as a fact and told nothing of the reason,
    // because the reason is the judge's and they already have their own opinion.
    // The player gets the reason, under the reply, as a footnote.
    //
    // What a settled want leaves behind is the first thing in the chronicle with
    // a weight. Its intensity was already how much of the writing room it got;
    // it is now also how much the favour it turned into is worth remembering, so
    // the entry is filed with a favour kind at that weight. The chronicle is
    // trimmed by that weight rather than from the tail, which means a long
    // afternoon of small talk can no longer evict the one entry that is not
    // interchangeable with the others. It is the last thing the village forgets
    // about the player. A settled want is replaced rather than lost: the village
    // is asked, out of band and after the answer has already gone, what that
    // person wants next.
    //
    // Needs nothing from the Engine, and `engine.min` does not move: two more
    // routes on the village's own surface, one more field in its own stored
    // record, one more shape in a prompt it already builds, and no new
    // permission.
    //
    // 0.4.14: the people in the village want things, and the day is written by
    // somebody who knows it. 0.4.13 let a conversation end and be remembered;
    // 0.4.12 gave the village a memory to write to. Both are about what has
    // already happened. Nothing yet knew what anybody was after, so a day could
    // only ever be weather: events happened AT a village rather than because
    // somebody was up to something in it.
    //
    // So every villager now has an agenda — one to three wants, each with the
    // small ordinary thing that gives it away, plus the day they live on every
    // other day. It is worked out once, from the card and from the Engine's own
    // weekly routine when there is one, and kept on the villager's record: the
    // Engine stays the authority on a character's time, and the village writes
    // around it rather than inventing a life beside it. A villager who moves in
    // is asked about immediately, and any who has not been asked about yet is
    // asked on the next part of the day the village is written for — so a
    // village that already existed is written about as people from the very
    // first tick, rather than over the days it takes to work through a roster.
    //
    // The whole safety of it is in how a want is described, and it is said the
    // same way in both prompts. To the narrator it is motivation: the reason
    // behind a happening that was worth writing on its own, never a happening by
    // itself, never announced, never asked after, never advanced and never
    // resolved. To the villager it is theirs and private: the run of
    // "these are yours, and they are not a plan or a task" exists because the
    // alternative — a bare list of wants sitting in a chat prompt — is a person
    // who opens a conversation with their shopping list. A want carries an id
    // it is addressed by later, and the shape is deliberately the shape a want
    // somebody can eventually be given something about would need.
    //
    // The player can see it, on one read-only route and one DEBUG tab, and
    // that is all: nothing a villager decides, says or is prompted with is read
    // from it, the snapshot is untouched, and there is no surface in the village
    // itself. Nothing here is shown to the player as a quest, because nothing
    // here is one.
    //
    // Needs nothing from the Engine, and `engine.min` does not move: the
    // agenda is one more field in the village's own stored record, one more
    // macro in the preset, one more section in a prompt it already builds, and
    // the routine comes from the read-only schedule access the village already
    // had.
    //
    // 0.4.13: a conversation with a villager can be ended rather than only
    // forgotten. 0.4.12 gave the village a memory the tick could write to, but
    // the one thing that happens in a village which nothing else can see — an
    // afternoon spent talking to somebody — was still invisible to it: the lines
    // lived in a transcript that got deleted, so a conversation left no trace at
    // all. A villager could be told the whole of the village's history and still
    // not know what the player said to them yesterday.
    //
    // So the drawer offers two ways out of a conversation, and the difference
    // between them is the point. Forget throws it away and the village never
    // learns it happened, exactly as before. Ending it asks the villager what
    // they took from it, files that as memory on the same chronicle the tick
    // writes to, and only then deletes the lines. The order is not a preference:
    // a clear that ran first would leave the model nothing to read, and a clear
    // that ran after a failure would lose the conversation and remember none of
    // it. Everything a conversation leaves behind is about the villager who was
    // spoken to and is private or shared on the same terms the tick's memories
    // are, so a line that passed between two people is never handed to a third.
    //
    // Beside it is the player's own copy of what was actually said, which is the
    // one record in the package nothing in the village ever reads: written a
    // line at a time as the conversation happens, so a tab closed in the middle
    // of one is not a conversation lost, and readable back only from a DEBUG tab
    // that derives its day and part of day from the same clock the story uses.
    // Ending a conversation and forgetting one both draw the line between one
    // conversation and the next in it, and it is never a source for a prompt —
    // which is what makes it safe to keep, however odd what it holds turns out
    // to be.
    //
    // Needs nothing from the Engine, and `engine.min` does not move: the memory
    // lands on the record the village already keeps, and the player's copy is
    // one more package document.
    //
    // 0.4.12: the village has a memory. Until now the only thing it ever wrote
    // down was the news, and the news is a window — forty lines, newest first,
    // with the oldest falling off the end forever. That is the right shape for
    // "what has been happening lately" and the wrong shape for "what we know":
    // a village a month old had a month of events and nothing it could still
    // refer to. The four things that could have grounded a villager in their
    // own history — what they want, what they do, where they live, what they
    // remember — all existed except the last one, and chats with villagers were
    // invisible to the village entirely.
    //
    // So there are two records with two lifetimes now. `happenings` is
    // unchanged, and beside it the tick may write a `chronicle`: the few things
    // worth still knowing about in a month, which the news will have forgotten
    // long before. A memory is filed against the same day and part of day a
    // happening is, so the two can never disagree about when something was, and
    // it may be shared or private to the people it names. Both land in the same
    // single write, because the store replaces the row and a second write would
    // be a second chance to keep one and lose the other.
    //
    // A villager is then handed both. The new `{{memory}}` macro renders what
    // this villager remembers — the shared story plus whatever was private to
    // them, and never anybody else's private lines. The selection is a join on
    // the card id rather than on a name, so renaming somebody does not hand
    // their memories to somebody else, and the two budgets are separate, since
    // a shared story is the same for everybody while a private one is only ever
    // about one person.
    //
    // Both blocks are dated and both say how long ago in words, which fixes a
    // bug rather than adding a feature: a line of news rendered as bare text,
    // with no date on it at all. Storing a date is not enough by itself — a
    // model handed "Day 3" and "Day 5" does not reliably subtract them, and a
    // villager who says a Tuesday conversation happened this morning is wrong
    // in the direction nobody notices. The subtraction happens in code now and
    // the model is handed prose. A day that cannot be placed before or after
    // the clock is dated with no age rather than guessed at, and one that is
    // somehow in the future reads as "recently" rather than as a future.
    //
    // The player can read the whole of it: `GET /api/villages/story` and the
    // DEBUG tab that draws it are the village's own record, read-only apart
    // from forgetting a single entry by id — a way to see what the village
    // thinks it knows, and to take back a line that was never true.
    //
    // Needs nothing from the Engine, and `engine.min` does not move: the
    // chronicle is two more fields in the village's own stored record and one
    // more section in a prompt it already builds.
    //
    // 0.4.11: the homepage is a row of two columns, and the map wears a wooden
    // frame. Both are about the same thing: what the tab does when the Engine's
    // own side panels are open and there is much less tab to go around.
    //
    // The news used to be a window laid over the map, positioned a fixed
    // distance in from the corner of the tab. That only looked right while the
    // tab was wide enough for the map — a picture of a fixed shape, centred —
    // to be shorter than the tab and leave a gutter down each side; the window
    // sat in the left gutter and read like a panel beside the map. Narrow the
    // tab, which the Engine's sidebar and its settings panel both do, and the
    // map stops being height-limited and starts filling the tab edge to edge,
    // and the window that was in the gutter is now on the picture. The fix is
    // not to move the window: it is that the news and the map are two columns
    // of one row, so the news takes a gutter of its own and the map is fitted
    // to whatever is left. Whatever width the tab has, that is a smaller map
    // beside the news rather than a map underneath it.
    //
    // Three things that were assumptions in the old shape are gone with it. The
    // news no longer starts below where the readout was assumed to end, because
    // it is no longer measured from the tab's corner: it is a column. The
    // readout and the notices moved further for the same reason — they are drawn
    // inside the map's own frame. The map is centred in its column, so the
    // column's corner is the picture's corner on whichever axis is limiting it
    // and is out in the gutter on the other one, which is where the news is; the
    // frame is the one box whose corner is always the picture's corner. The news
    // no longer has a ceiling of its own either: it is capped by the row, so a
    // long list scrolls inside the tab instead of growing past it, and its width
    // is capped so the map always keeps about two thirds of the row. And the
    // homepage no longer has a minimum height, because a floor taller than the
    // visible tab is a floor the map is fitted against and then clipped by — a
    // short tab is meant to give a small map, not the bottom of a big one and
    // the pins that were on it.
    //
    // The frame is drawn around the map rather than into it: two layers grown
    // outwards from the map's own box, the wood and the mat inside it, both
    // behind the picture. Outside, because a frame inside the map's box would
    // have to come out of the picture, and a picture cropped for its own frame
    // is a map with the corner houses missing; grown outwards, the map's box is
    // exactly the map and every pin is where it was. The room the map is
    // measured against is now measured to its padding rather than to its edge,
    // so the buffer the frame lives in is defined in one place — the stylesheet
    // — and the wood cannot be clipped by the box that has to clip a pin.
    //
    // The wood is painted CSS: plank bands and grain as repeating gradients, no
    // new file and no new asset. Homepage only, so the founding wizard and the
    // town map editor keep the plain border they had.
    //
    // Needs nothing from the Engine, and `engine.min` does not move: this is a
    // stylesheet and one wrapper element in the client the package already
    // ships, and the village record, the routes and the derived clock are all
    // untouched.
    //
    // 0.4.0: the village writes about its day whether or not anyone is looking
    // at it, and the player can say when it may. 0.3.6 was built on a premise
    // that turned out to be wrong — that a capability package gets no timer, so
    // the tab had to be the only clock. The tab was never the mechanism and the
    // timer was never missing: the module-level `setTimeout` Noodle and Slurp
    // already publish on is available to any package, and Villages simply never
    // started one. The consequence was that a village left alone overnight had
    // nothing to show on being opened again until the player sat and waited on
    // it, which is the opposite of a village that carries on while you are away.
    //
    // `runVillageTick` is unchanged in what it does and unchanged in that the
    // tab still calls it. What is new is that the package calls it too:
    // `village-refresh-scheduler.ts` arms an unref'd timer for the next part of
    // the day plus a small settle, and again after every wake, so a village is
    // written up within a minute of 05:00, 12:00, 17:00 and midnight without
    // anyone opening it. The ceiling on the delay is an hour, because the
    // longest stretch between two parts of a day is five hours and waking every
    // fifteen minutes to write four times a day is ninety-six wake-ups for four
    // writes; a wake that arrives early finds the part of day unchanged and
    // costs one read. The timer is owned by the cleanup `activate` already
    // returns, so deactivating the package stops it, and `unref` keeps a pending
    // wake from holding the Engine's process open.
    //
    // Two preferences come with it, on the village record and in Menu → Village
    // settings. `backgroundRefreshesEnabled` is the master switch, and
    // `refreshClocks` is which parts of the day may be written automatically —
    // as a list rather than four booleans, because "update on its own, but never
    // in the evening" and "update in the evening only" both have to be sayable
    // and an empty list is one of them. Absent means all four, which is what a
    // record written before this release gets, and it is deliberately not the
    // same answer as empty.
    //
    // Both rules are enforced inside `runVillageTick`, not at the button and not
    // in the scheduler, because the tab and the timer are two callers and a rule
    // kept by a caller is a rule the next caller forgets: a part of the day
    // switched off costs no model call whoever asked, and the part of day is
    // left unmarked rather than marked-and-skipped so switching it back on still
    // writes it. The master switch does NOT stop the tab, on purpose — a player
    // who turns automatic updates off is asking to decide when the village
    // moves, not to open it and find it frozen. And the re-arm is decided by the
    // clock alone: a wake that wrote nothing is retried on the next wake, which
    // is what makes a provider that was down for an afternoon cost one batch and
    // not an afternoon of them.
    //
    // Needs nothing from the Engine. `engine.min` does not move: the timer, the
    // two preferences and the derived clock are all package-side, and the wake
    // calls the same no-argument `runVillageTick` the tab already called.
    // `startVillageRefreshScheduler` takes an optional delay so the regression
    // test can drive a real wake instead of waiting an hour for one — the same
    // seam `deriveVillageMoment` already exposes as its `now` argument — and
    // nothing in the package passes anything but the default.
    //
    // 0.3.7: the wizard asks who you are, and the answer can be a Persona. Step
    // one used to ask only what the village is called and what it is like — the
    // name the villagers call you was reachable afterwards and nowhere else — so
    // a village could be founded and then lived in by "the player". The same
    // step now offers the Engine's Personas beside the hand-written fields, and
    // the wizard and Menu → Village settings ask it in the same words.
    //
    // A Persona is stored as an id and read at the moment it is needed, never
    // copied into the village: a Persona edited in the Engine's own editor
    // changes what the villagers believe the next time one of them speaks, and
    // the name, description, appearance, personality and backstory that make up
    // a prompt are read whole, because a villager told a name and one line
    // invents the rest. `settings.playerName`/`playerDescription` are left
    // exactly as the player typed them and are read only while no Persona is
    // linked, so the two answers can be swapped back and forth without either
    // being thrown away. A link into a Persona that is no longer in the library
    // is kept rather than dropped and reported as missing, which is the
    // difference the panel needs between "nobody chosen" and "the person you
    // chose is not here any more".
    //
    // Reading Personas asks for no new permission and needs no Engine change:
    // the list comes off the same resource host `listCharacters` does.
    //
    // 0.3.6: the village keeps its own news, and nothing is written for the
    // player before they arrive. A new village opens on an empty noticeboard —
    // the shipped notices are gone, and so is the note-seeding half of "Suggest
    // places", which is a question about the geography and had no business
    // writing on the board. In their place the village writes its own happenings
    // as the clock turns: `POST /tick` derives which part of which day it is
    // and, when that is a part of day it has not written for, asks the model for
    // a small batch of things that have already happened and a note or two in a
    // resident's own voice. The tab drives it, because a capability package gets
    // no timer — one call when it opens and one whenever the part of day it is
    // holding turns out to have moved on, both gated on `lastHappeningKey`, a
    // single `dayIndex:clock` string. Reloading the tab, or two tabs open at
    // once, therefore costs a read and nothing else, and a village nobody looked
    // at for a week writes one batch about the week rather than pretending the
    // time did not pass. The happenings are drawn in a window down the left of
    // the map, separate from the board on purpose: the board is what the
    // villagers say to each other, and the window is what happened to the place.
    // Notices now carry who wrote them (`string[]` became `{ author, text }[]`,
    // with the player's own pins left unsigned), they reach the villager prompt
    // through a new `{{happenings}}` and a reworked `{{noticeboard}}`, and `Look
    // again` is gone — the tab has nothing left to look at twice, because the
    // village now comes to it.
    //
    // 0.3.5: the founding wizard's bar carries no Later. Later did not leave the
    // wizard, it postponed it — it put the player on a homepage for a village
    // that did not exist and the wizard was asked in full again the next time
    // the tab was opened, since nothing is written down until the last step — so
    // the bar is a title now and the end of the wizard is the only door out of
    // it. A village that already exists is not shut in by that: running setup
    // again still offers Save this village, which leaves the same way keeping
    // the answers, and Show me the village beside it, which does not keep them.
    //
    // 0.3.4: the homepage draws the frame at the largest size of the map's own
    // shape that the tab holds, rather than as wide as the tab is. A frame laid
    // out by width alone is a frame taller than the tab, and the tab clips it —
    // and what a clip takes off a map this shape is its top and bottom, which is
    // where the player's corner houses went. Every other stage still takes its
    // width from the column it sits in. Pins are drawn as the thumbtacks they
    // are named after, inline rather than from a font, in red with a grey tack
    // for a house nobody has moved into yet. The wizard's step strip is a record
    // of where the wizard is rather than a control — `data-clickable` is what
    // says a chip is one, and the wizard's chips are not — because a chip that
    // answers the cursor and then does nothing promises what it cannot keep. And
    // founding a village no longer offers to show you one that does not exist
    // yet; re-running setup on a village that does still does.
    //
    // 0.3.3: a map is now drawn in a frame of the map's own shape rather than in
    // whatever shape the tab is, so the picture is never quietly letterboxed and
    // the pins are placed against the picture instead of the frame around it.
    // The shape is the village's fact (`TOWN_MAP_EXPECTED_WIDTH`/`HEIGHT`) and
    // so is the framing — which of `cover`, `stretch` and `contain` the picture
    // is drawn with, where it is aimed and how far it is magnified — so the tab
    // restates none of it. Picking a picture no longer writes immediately: the
    // file is decoded, measured and shown in the real frame, the player chooses
    // how it sits in it and drags it around, and only then is it saved, which is
    // what tells them a picture smaller than a map may look soft or stretched
    // before it is the village's map rather than after.
    //
    // 0.3.2: the town map is the whole tab now and nothing else is drawn on it
    // except a small, always-current date and time in the corner and the Menu
    // button beside it. The four panels that used to sit in a column next to the
    // map moved into the Menu, which is grouped into Village Management and
    // General Settings, and `Look again` moved in with them. A villager's
    // conversation slides in from the right over the map instead of taking a
    // column of its own.
    //
    // 0.3.1: a home is a building out of the village's own catalogue rather than
    // a free-text label, every home is a `small home`, and a villager can only
    // live in one of them. The bundled map is declared in
    // `contributions.assets`, which is the allowlist the Engine's asset route
    // reads — 0.3.0 hash-pinned the map in `files[]` but never named it there,
    // so the route refused it and both the homepage and the setup wizard drew an
    // empty black frame where the map should be. The client measures the decoded
    // picture's own ratio rather than assuming 16:9, so pins land on the picture
    // rather than on a stretched frame around it.
    //
    // 0.5.14: client snapshots now discard malformed venue records before map
    // and settings rendering can dereference their required nested objects.
    // 0.5.15: runtime reads use adopted cards and resident-scoped native
    // schedules; old chat schedule metadata is no longer queried.
    //
    // 0.3.0: the town map became the village's homepage and a new village now
    // opens a setup wizard (name the village, place four homes, choose who
    // moves in). Homes live on the village record and reach the villager
    // prompt through the new `{{homes}}` macro, so stored preset text from
    // 0.2.x still renders.
    // 0.6.0: continuous device-local time, exact repeating agenda intervals,
    // durable restart reconciliation, bounded story pacing, and return recaps.
    version: "0.6.119",
    minEngineVersion: "2.4.6",
    maxEngineExclusive: MAX_ENGINE_EXCLUSIVE,
    name: "Villages",
    description: "A text-first slice-of-life village that reconstructs elapsed life when you return.",
    // NOT a Tracker, and the value is spelled out rather than left to the
    // builder's `?? "misc"` so nobody helpfully puts it back. `tracker` is the
    // library's word for an agent whose JOB is to keep a number the player
    // watches; the village's job is to be a village, and it keeps its own
    // documents rather than a stat sheet on a chat.
    category: "misc",
    kind: ["agent"],
    modes: ["conversation", "roleplay", "game"],
    // `chat-read` serves the spin-off flow. Native schedules come from the
    // character cards; `network` covers model calls and the Engine loopback.
    permissions: ["network", "routes", "storage", "ui", "chat-read", "chat-write"],
    serverImport: "packages/server/src/services/villages/server-entry.ts",
    serverEntry: true,
    clientImport: "packages/client/src/villages-package-entry.tsx",
    packageSourceRoot: villagesSourceRoot,
    ownedSourcePaths: villagesOwnedSourcePaths,
    agent: {
      runtimeDisabled: false,
    },
    assetPaths: [
      "villages-icon.png",
      "founding-rebuild.jpg",
      "founding-pioneer.jpg",
      "founding-prosper.jpg",
      "founding-custom.jpg",
      "founding-none.jpg",
    ],
    // 0.4.40 raises that pin to 1.14, the release that added the
    // `roleplay-tracker` slot and package-aware prompt placement. The slot is
    // the village's one control in the Engine's own roleplay chrome: a button
    // that knows which villager a chat belongs to and can bring the scene back
    // to the village. It is declared here rather than reached for, because the
    // Engine only mounts a package into that toolbar when the manifest asks for
    // it. `libraryHidden` is gone for the same release: the Engine hides a
    // library-hidden manifest from Chat Settings → Agents, and a control the
    // player cannot switch on is not a control.
    //
    // 0.4.41 adds `tracker-panel` beside it, which is the same information in the
    // chat's own tracker sidebar rather than in its toolbar. The player asked for
    // both so they could decide which one they want; both are declared so both
    // can be seen, and both are inert until a scene chat is activated, which is
    // now something the package does itself when it makes one. `tracker-panel` is
    // a 1.14 slot like `roleplay-tracker`, so this raises nothing.
    engineBoundaryPath: join(packagesDir, "villages/engine-boundary.json"),
    boundaryDisplayName: "Villages",
    capabilityApi: { major: 1, minor: 14 },
    contributions: {
      slots: ["home-browser-tab", "roleplay-tracker", "tracker-panel"],
      homeBrowserTab: {
        label: "Villages",
        ariaLabel: "Open Villages",
        iconPaths: ["villages-icon.png"],
      },
      assets: {
        paths: [
          "founding-rebuild.jpg",
          "founding-pioneer.jpg",
          "founding-prosper.jpg",
          "founding-custom.jpg",
          "founding-none.jpg",
        ],
      },
    },
  },
  {
    id: "long-term-memory",
    version: "1.2.15",
    minEngineVersion: "2.4.6",
    maxEngineExclusive: MAX_ENGINE_EXCLUSIVE,
    name: "Long-Term Memory",
    description:
      "Extracts durable memories from chat summaries, character records, and lorebooks, then recalls relevant context from a package-owned vault.",
    category: "misc",
    kind: ["agent"],
    modes: ["conversation", "roleplay", "game"],
    permissions: ["agent-runtime", "chat-read", "chat-write", "routes", "storage", "ui"],
    serverImport: "packages/server/src/services/long-term-memory/server-entry.ts",
    serverEntry: true,
    clientImport: "packages/client/src/features/long-term-memory/client-entry.tsx",
    packageSourceRoot: longTermMemorySourceRoot,
    ownedSourcePaths: longTermMemoryOwnedSourcePaths,
    engineBoundaryPath: join(packagesDir, "long-term-memory/engine-boundary.json"),
    boundaryDisplayName: "Long-Term Memory",
    capabilityApi: { major: 1, minor: 6 },
    contributions: {
      agentDetail: { agentIds: ["long-term-memory"] },
      slots: ["chat-settings"],
    },
  },
  {
    id: "memory-nag",
    version: "1.0.18",
    minEngineVersion: "2.4.6",
    maxEngineExclusive: MAX_ENGINE_EXCLUSIVE,
    name: "Memory Nag",
    description:
      "Keeps a short per-chat vault of roleplay memories and recalls only the unresolved details that matter to the current turn.",
    category: "tracker",
    kind: ["agent"],
    modes: ["roleplay"],
    permissions: ["agent-runtime", "chat-read", "prompt-context", "routes", "storage", "ui"],
    serverImport: "packages/server/src/services/memory-nag/server-entry.ts",
    serverEntry: true,
    clientImport: "packages/client/src/features/memory-nag/client-entry.tsx",
    packageSourceRoot: memoryNagSourceRoot,
    ownedSourcePaths: memoryNagOwnedSourcePaths,
    engineBoundaryPath: join(packagesDir, "memory-nag/engine-boundary.json"),
    boundaryDisplayName: "Memory Nag",
    capabilityApi: { major: 1, minor: 14 },
    agent: {
      description:
        "Keeps a short per-chat vault of roleplay memories and recalls only the unresolved details that matter to the current turn.",
      phase: "post_processing",
      runtimeDisabled: false,
      execution: "pipeline",
      defaultInjectAsSection: false,
      defaultSettings: {
        resultType: "memory_nag",
        contextSize: 5,
        maxTokens: 4096,
        temperature: 0,
        contextSources: {
          chatHistory: true,
          characters: false,
          persona: false,
          activatedLorebookEntries: false,
          chatSummary: false,
          authorNotes: false,
          trackerData: false,
          recalledMemories: false,
        },
      },
      defaultPromptTemplate: [
        "Decide whether one of the supplied vault memories should nag the roleplay characters after the latest turn.",
        "Choose only IDs listed in allowedMemoryIds inside <agent_runtime_context>. Participant IDs are character IDs, never memory IDs. Never create, rewrite, or combine a memory.",
        "A nag should fit what is happening now: an unresolved promise, past harm, relationship strain, warning, debt, or relevant admission. Quiet or unrelated moments usually need none.",
        "Do not select a memory that only repeats the immediate scene or an action happening now. Recall relevant events from earlier in the story.",
        'Return JSON only. If no nag fits: {"nags_needed":false}. If nags fit: {"nags_needed":true,"memoryIds":["exact-id"]}.',
      ].join("\n"),
    },
    contributions: {
      slots: ["chat-settings", "roleplay-tracker", "tracker-panel"],
    },
  },
  {
    id: "hierarchical-maps",
    version: "1.4.3",
    minEngineVersion: "2.4.6",
    maxEngineExclusive: MAX_ENGINE_EXCLUSIVE,
    name: "World Maps",
    description:
      "Adds persistent hierarchical locations, durable shared worlds, reusable artwork, customizable Direct Link lines, and movement to Roleplay and Game.",
    category: "tracker",
    kind: ["agent", "maps"],
    modes: ["roleplay", "game"],
    permissions: ["agent-runtime", "chat-read", "chat-write", "network", "prompt-context", "routes", "storage", "ui"],
    serverImport: "packages/server/src/routes/spatial-context.routes.ts",
    serverExport: "spatialContextRoutes",
    prefix: "/api/chats",
  },
  {
    id: "conversation-calls",
    name: "Calls",
    version: "1.0.14",
    minEngineVersion: "2.4.6",
    description: "Adds live audio and video calls with Conversation characters.",
    kind: ["agent", "conversation-calls"],
    modes: ["conversation"],
    permissions: ["agent-runtime", "chat-read", "chat-write", "network", "routes", "storage", "ui"],
    serverImport: "packages/server/src/routes/conversation-calls.routes.ts",
    serverExport: "conversationCallsRoutes",
    prefix: "/api/conversation-calls",
  },
  ...[
    ["uno", "UNO", "Play UNO with Conversation characters.", "Uno", "/uno", ["uno"], "Group card game"],
    ["chess", "Chess", "Play Chess with a Conversation character.", "Chess", "/chess", ["chess"], "1v1 strategy"],
    [
      "poker",
      "Poker",
      "Play Texas Hold’em Poker with Conversation characters.",
      "Poker",
      "/poker",
      ["poker", "hold'em", "texas hold'em"],
      "Table game",
    ],
    [
      "eightball",
      "8-Ball Pool",
      "Play 8-Ball Pool with a Conversation character.",
      "EightBall",
      "/8ball",
      ["8-ball", "8 ball", "eightball", "pool", "billiards"],
      "1v1 table sport",
    ],
    [
      "tic-tac-toe",
      "Tic-Tac-Toe",
      "Play Tic-Tac-Toe with a Conversation character.",
      "TicTacToe",
      "/tictactoe",
      ["tic-tac-toe", "tic tac toe", "noughts and crosses", "ttt"],
      "1v1 strategy",
    ],
    [
      "rock-paper-scissors",
      "Rock-Paper-Scissors",
      "Play Rock-Paper-Scissors with a Conversation character.",
      "RockPaperScissors",
      "/rps",
      ["rock paper scissors", "rock-paper-scissors", "rps"],
      "1v1 quick game",
    ],
  ].map(([id, name, description, clientName, command, aliases, playerLabel]) => ({
    id,
    name,
    version: "1.0.5",
    maxEngineExclusive: "4.0.0",
    description,
    kind: ["agent", "turn-game"],
    modes: ["conversation"],
    permissions: ["agent-runtime", "chat-read", "chat-write", "storage", "ui"],
    engineImport: `packages/shared/src/features/turn-games/${id}/engine.ts`,
    engineExport:
      id === "eightball"
        ? "eightBallEngine"
        : id === "tic-tac-toe"
          ? "ticTacToeEngine"
          : id === "rock-paper-scissors"
            ? "rockPaperScissorsEngine"
            : `${id}Engine`,
    clientName,
    command,
    aliases,
    playerLabel,
    commandType: id.replaceAll("-", "_"),
  })),
];

const requestedFeatureIds = new Set(process.argv.slice(2));
const selectedFeatures =
  requestedFeatureIds.size > 0 ? features.filter((feature) => requestedFeatureIds.has(feature.id)) : features;
if (selectedFeatures.length !== requestedFeatureIds.size && requestedFeatureIds.size > 0) {
  const knownIds = new Set(features.map((feature) => feature.id));
  const unknownIds = [...requestedFeatureIds].filter((id) => !knownIds.has(id));
  throw new Error(`Unknown feature package${unknownIds.length === 1 ? "" : "s"}: ${unknownIds.join(", ")}`);
}
const hierarchicalMapsBoundary = selectedFeatures.some((feature) => feature.id === "hierarchical-maps")
  ? await assertHierarchicalMapsPrivateImportBoundary()
  : null;
const longTermMemoryBoundary = selectedFeatures.some((feature) => feature.id === "long-term-memory")
  ? await assertPackagePrivateImportBoundary({
      sourceRoot: longTermMemorySourceRoot,
      boundaryPath: join(packagesDir, "long-term-memory/engine-boundary.json"),
      displayName: "Long-Term Memory",
      capabilityApi: { major: 1, minor: 6 },
    })
  : null;
const memoryNagBoundary = selectedFeatures.some((feature) => feature.id === "memory-nag")
  ? await assertPackagePrivateImportBoundary({
      sourceRoot: memoryNagSourceRoot,
      boundaryPath: join(packagesDir, "memory-nag/engine-boundary.json"),
      displayName: "Memory Nag",
      capabilityApi: { major: 1, minor: 14 },
    })
  : null;
const villagesBoundary = selectedFeatures.some((feature) => feature.id === "villages")
  ? await assertPackagePrivateImportBoundary({
      sourceRoot: villagesSourceRoot,
      boundaryPath: join(packagesDir, "villages/engine-boundary.json"),
      displayName: "Villages",
      capabilityApi: { major: 1, minor: 14 },
    })
  : null;
const boundariesByFeatureId = new Map([
  ["hierarchical-maps", hierarchicalMapsBoundary],
  ["long-term-memory", longTermMemoryBoundary],
  ["memory-nag", memoryNagBoundary],
  ["villages", villagesBoundary],
]);

async function bundleServer(feature, output) {
  const temporary = await mkdtemp(join(tmpdir(), `marinara-feature-entry-${feature.id}-`));
  const prepared = await prepareFeatureBuildRoot(feature);
  try {
    const target = resolve(prepared.buildRoot, feature.serverImport || feature.engineImport);
    const source = feature.serverEntry
      ? `export { activate, selfCheck } from ${JSON.stringify(target)};\n`
      : feature.id === "hierarchical-maps"
        ? `import { ${feature.serverExport} as register } from ${JSON.stringify(target)};
import * as projection from ${JSON.stringify(resolve(prepared.buildRoot, "packages/server/src/services/spatial-context/projection.ts"))};
import * as stateResolution from ${JSON.stringify(resolve(prepared.buildRoot, "packages/server/src/services/spatial-context/state-resolution.ts"))};
import * as ownerTurn from ${JSON.stringify(resolve(prepared.buildRoot, "packages/server/src/services/spatial-context/owner-turn.ts"))};
import * as gameMapBinding from ${JSON.stringify(resolve(prepared.buildRoot, "packages/server/src/services/spatial-context/game-map-binding.ts"))};
import { configurePackageRuntime } from ${JSON.stringify(resolve(prepared.buildRoot, "packages/server/src/services/spatial-context/package-runtime.ts"))};
import { createSpatialContextStorage } from ${JSON.stringify(resolve(prepared.buildRoot, "packages/server/src/services/storage/spatial-context.storage.ts"))};
let readinessStorage = null;
export async function activate({ app, api }) {
  const cleanupRuntime = configurePackageRuntime(
    api.runtime,
    async (agentType) => {
      const response = await app.inject({ method: "GET", url: "/api/agents" });
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error("Could not read global agent settings (" + response.statusCode + ")");
      }
      const configs = response.json();
      const config = Array.isArray(configs)
        ? configs.find((candidate) => candidate && typeof candidate === "object" && candidate.type === agentType)
        : null;
      return config ?? null;
    },
    async (agentType, patch) => {
      const response = await app.inject({
        method: "PATCH",
        url: "/api/agents/type/" + encodeURIComponent(agentType),
        headers: { "x-marinara-csrf": "1" },
        payload: patch,
      });
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error("Could not update global agent configuration (" + response.statusCode + ")");
      }
      return response.json();
    },
  );
  try {
    await app.register(register, { prefix: ${JSON.stringify(feature.prefix)} });
    readinessStorage = createSpatialContextStorage();
    const cleanups = [
      cleanupRuntime,
      api.registerService("hierarchical-maps:projection", projection),
      api.registerService("hierarchical-maps:state-resolution", stateResolution),
      api.registerService("hierarchical-maps:owner-turn", ownerTurn),
      api.registerService("hierarchical-maps:game-map-binding", gameMapBinding),
      api.registerService("hierarchical-maps:storage", { create: () => createSpatialContextStorage() }),
    ];
    return () => { readinessStorage = null; for (const cleanup of cleanups.reverse()) cleanup(); };
  } catch (error) {
    readinessStorage = null;
    cleanupRuntime();
    throw error;
  }
}
export async function selfCheck({ api }) {
  if (!readinessStorage) throw new Error("World Maps storage did not initialize");
  if (typeof api.runtime.resources?.listCharacters !== "function") throw new Error("World Maps character resources are unavailable");
  if (typeof api.runtime.resources?.listEligibleLorebookEntries !== "function") throw new Error("World Maps lore resources are unavailable");
  if (typeof api.runtime.languageModels?.resolve !== "function") throw new Error("World Maps language model host is unavailable");
  if (typeof api.runtime.json?.parseJsonish !== "function") throw new Error("World Maps JSON parser is unavailable");
  await readinessStorage.listForChat("__marinara_capability_self_check__");
  await api.runtime.resources.listCharacters([]);
  await api.runtime.resources.listEligibleLorebookEntries({ lorebookIds: [], entryIds: [] });
  const parsed = api.runtime.json.parseJsonish('Preface\\n{"ready":true}');
  if (!parsed || typeof parsed !== "object" || parsed.ready !== true) throw new Error("World Maps JSON parser self-check failed");
}\n`
        : feature.id === "conversation-calls"
          ? `import { ${feature.serverExport} as register } from ${JSON.stringify(target)};
import * as commandRuntime from ${JSON.stringify(resolve(sourceRoot, "packages/server/src/services/generation/conversation-call-command-runtime.ts"))};
import * as characterVideos from ${JSON.stringify(resolve(sourceRoot, "packages/server/src/services/conversation/call-character-videos.service.ts"))};
import { createConversationCallsStorage } from ${JSON.stringify(resolve(sourceRoot, "packages/server/src/services/storage/conversation-calls.storage.ts"))};
let readinessStorage = null;
export async function activate({ app, api }) {
  await app.register(register, { prefix: ${JSON.stringify(feature.prefix)} });
  readinessStorage = createConversationCallsStorage(app.db);
  const cleanups = [
    api.registerService("conversation-calls:command", commandRuntime),
    api.registerService("conversation-calls:character-videos", characterVideos),
  ];
  return () => { readinessStorage = null; for (const cleanup of cleanups.reverse()) cleanup(); };
}
export async function selfCheck() {
  if (!readinessStorage) throw new Error("Conversation Calls storage did not initialize");
  await readinessStorage.getActiveForChat("__marinara_capability_self_check__");
}\n`
          : feature.serverImport
            ? `import { ${feature.serverExport} as register } from ${JSON.stringify(target)};\nexport async function activate({ app }) { await app.register(register, { prefix: ${JSON.stringify(feature.prefix)} }); }\n`
            : `import { ${feature.engineExport} as engine } from ${JSON.stringify(target)};\nexport async function activate({ api }) { const cleanups = [api.registerTurnGameEngine(engine), api.registerConversationCommand({ commandType: ${JSON.stringify(feature.commandType)}, tags: [${JSON.stringify(feature.commandType)}] })]; return () => { for (const cleanup of cleanups.reverse()) cleanup(); }; }\n`;
    const entry = join(temporary, "entry.mjs");
    const metafile = join(temporary, "meta.json");
    await writeFile(entry, source);
    const result = spawnEsbuild(
      [
        entry,
        "--bundle",
        "--platform=node",
        "--format=esm",
        "--target=node22",
        "--minify",
        "--log-limit=0",
        "--banner:js=import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
        "--external:@huggingface/transformers",
        "--external:onnxruntime-node",
        "--external:onnxruntime-web",
        "--external:sharp",
        "--external:pino",
        "--external:pino-pretty",
        ...(feature.id === "long-term-memory" ? ["--external:zod"] : []),
        `--alias:@marinara-engine/shared=${packageSharedEntry}`,
        `--metafile=${metafile}`,
        `--outfile=${output}`,
      ],
      {
        cwd: engineRoot,
        encoding: "utf8",
        env: { ...process.env, NODE_PATH: engineNodePath },
      },
    );
    if (result.status !== 0) {
      throw new Error(result.stderr || result.stdout || result.error?.message || `esbuild failed for ${feature.id}`);
    }
    if (feature.id === "villages") {
      const built = JSON.parse(await readFile(metafile, "utf8"));
      const privateRuntime = Object.keys(built.inputs).filter((input) =>
        /packages\/server\/src\/services\/(?:decision\/|storage\/(?:connections|app-settings)\.storage\.)/u.test(
          input.split("\\").join("/"),
        ),
      );
      if (privateRuntime.length)
        throw new Error("Villages must use live Engine Decisions modules; bundling them is forbidden");
    }
    if (feature.ownedSourcePaths?.length) {
      await capturePackageSources(metafile, prepared.buildRoot, feature.ownedSourcePaths);
      if (feature.id === "slurp") {
        await removeOwnedSourceSnapshots(["packages/client/src/localization/locales"]);
      }
    } else {
      await captureEngineSources(
        metafile,
        prepared.buildRoot,
        feature.id === "hierarchical-maps" ? hierarchicalMapsOwnedSourcePaths : [],
      );
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
    await prepared.cleanup();
  }
}

async function bundleGameClient(feature, output) {
  const temporary = await mkdtemp(join(tmpdir(), `marinara-feature-client-${feature.id}-`));
  try {
    const board = resolve(sourceRoot, `packages/client/src/components/chat/${feature.clientName}Board.tsx`);
    const setup = resolve(sourceRoot, `packages/client/src/components/chat/${feature.clientName}Setup.tsx`);
    const tag = `marinara-capability-${feature.id}`;
    const source = `
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ${feature.clientName}Board as Board } from ${JSON.stringify(board)};
import { ${feature.clientName}Setup as Setup } from ${JSON.stringify(setup)};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
window.addEventListener("marinara-capability-server-event", (event) => { if (event.detail?.packageId === ${JSON.stringify(feature.id)}) void client.invalidateQueries({ queryKey: ["turn-games"] }); });

function PackageRoot({ element }) {
  const [, redraw] = useState(0);
  useEffect(() => {
    const update = () => redraw((value) => value + 1);
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);
  const props = element.capabilityProps || {};
  const chatId = typeof props.chatId === "string" ? props.chatId : "";
  if (!chatId) return null;
  if (element.getAttribute("view") === "setup") {
    return <><Setup chatId={chatId} open={props.open !== false} onClose={() => props.onClose?.()} /><Toaster richColors /></>;
  }
  return <><Board chatId={chatId} /><Toaster richColors /></>;
}

class MarinaraCapabilityElement extends HTMLElement {
  connectedCallback() {
    if (!this.__root) {
      this.__root = createRoot(this);
    }
    this.__root.render(<QueryClientProvider client={client}><PackageRoot element={this} /></QueryClientProvider>);
  }
  disconnectedCallback() {
    queueMicrotask(() => { if (!this.isConnected && this.__root) { this.__root.unmount(); this.__root = null; } });
  }
}
if (!customElements.get(${JSON.stringify(tag)})) customElements.define(${JSON.stringify(tag)}, MarinaraCapabilityElement);
`;
    const entry = join(temporary, "entry.tsx");
    const metafile = join(temporary, "meta.json");
    await writeFile(entry, source);
    const result = spawnEsbuild(
      [
        entry,
        "--bundle",
        "--platform=browser",
        "--format=esm",
        "--target=es2020",
        "--minify",
        "--log-limit=0",
        "--jsx=automatic",
        '--define:process.env.NODE_ENV="production"',
        "--define:import.meta.env.DEV=false",
        "--define:import.meta.env.PROD=true",
        '--define:import.meta.env.MODE="production"',
        `--alias:@marinara-engine/shared=${packageSharedEntry}`,
        `--metafile=${metafile}`,
        `--outfile=${output}`,
      ],
      {
        cwd: engineRoot,
        encoding: "utf8",
        env: { ...process.env, NODE_PATH: engineNodePath },
      },
    );
    if (result.status !== 0)
      throw new Error(result.stderr || result.stdout || `client esbuild failed for ${feature.id}`);
    await captureEngineSources(metafile);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

async function buildPackageStyles(buildRoot, temporary, capabilityId) {
  const input = join(temporary, `${capabilityId}.css`);
  const outputDir = join(temporary, `${capabilityId}-css`);
  const config = join(temporary, `vite.${capabilityId}.config.mjs`);
  const globals = join(engineRoot, "packages/client/src/styles/globals.css");
  const packageClientSources = join(buildRoot, "packages/client/src").split(sep).join("/");
  await writeFile(
    input,
    `@import ${JSON.stringify(globals)};\n@source ${JSON.stringify(`${packageClientSources}/**/*.{ts,tsx}`)};\n`,
  );
  const viteModule = pathToFileURL(
    realpathSync(join(engineRoot, "packages/client/node_modules/vite/dist/node/index.js")),
  ).href;
  const tailwindModule = pathToFileURL(
    realpathSync(join(engineRoot, "packages/client/node_modules/@tailwindcss/vite/dist/index.mjs")),
  ).href;
  await writeFile(
    config,
    `import { defineConfig } from ${JSON.stringify(viteModule)};
import tailwindcss from ${JSON.stringify(tailwindModule)};
export default defineConfig({
  root: ${JSON.stringify(join(engineRoot, "packages/client"))},
  plugins: [tailwindcss()],
  build: {
    emptyOutDir: true,
    outDir: ${JSON.stringify(outputDir)},
    rollupOptions: { input: ${JSON.stringify(input)} },
  },
});
`,
  );
  const result = spawnSync(
    process.execPath,
    [join(dirname(engineClientRequire.resolve("vite/package.json")), "bin/vite.js"), "build", "--config", config],
    { cwd: join(engineRoot, "packages/client"), encoding: "utf8", env: { ...process.env, SKIP_PWA: "1" } },
  );
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `${capabilityId} stylesheet build failed`);
  const assets = join(outputDir, "assets");
  const cssFiles = (await readdir(assets)).filter((filename) => filename.endsWith(".css")).sort();
  if (cssFiles.length !== 1) {
    throw new Error(`${capabilityId} stylesheet build produced ${cssFiles.length} CSS assets; expected exactly one`);
  }
  const [cssFile] = cssFiles;
  const styles = await readFile(join(assets, cssFile), "utf8");
  const scopedStyles = styles
    .replaceAll(":root", ":scope")
    .replaceAll("[data-theme=dark]", ":scope:where([data-theme=dark] *)")
    .replaceAll("[data-theme=light]", ":scope:where([data-theme=light] *)");
  return `@scope (marinara-capability-${capabilityId}, [data-marinara-capability-scope=${JSON.stringify(capabilityId)}]){${scopedStyles}}`;
}

async function bundleSpecialClient(feature, output) {
  const temporary = await mkdtemp(join(tmpdir(), `marinara-feature-client-${feature.id}-`));
  const prepared = await prepareFeatureBuildRoot(feature);
  try {
    let source = "";
    const tag = `marinara-capability-${feature.id}`;
    if (feature.id === "hierarchical-maps") {
      const settings = resolve(
        prepared.buildRoot,
        "packages/client/src/features/spatial-context/SpatialContextSettingsSection.tsx",
      );
      const home = resolve(prepared.buildRoot, "packages/client/src/features/spatial-context/SpatialMapsHome.tsx");
      const workspace = resolve(
        prepared.buildRoot,
        "packages/client/src/features/spatial-context/SpatialMapWorkspace.tsx",
      );
      const library = resolve(prepared.buildRoot, "packages/client/src/features/spatial-context/SpatialMapLibrary.tsx");
      const runtimeBar = resolve(
        prepared.buildRoot,
        "packages/client/src/features/spatial-context/components/SpatialContextRuntimeBar.tsx",
      );
      const worldMap = resolve(prepared.buildRoot, "packages/client/src/components/game/GameWorldMap.tsx");
      const spatialHooks = resolve(prepared.buildRoot, "packages/client/src/hooks/use-spatial-context.ts");
      const packageApi = resolve(prepared.buildRoot, "packages/client/src/features/spatial-context/package-api.ts");
      const localization = resolve(prepared.buildRoot, "packages/client/src/features/spatial-context/localization.tsx");
      const pendingTransitions = resolve(
        prepared.buildRoot,
        "packages/client/src/features/spatial-context/pending-spatial-transitions.ts",
      );
      const routePlans = resolve(
        prepared.buildRoot,
        "packages/client/src/features/spatial-context/spatial-route-plans.ts",
      );
      const workspaceStyles = `
[data-marinara-maps-workspace-overlay] {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  isolation: isolate;
  pointer-events: auto;
  touch-action: manipulation;
}

[data-marinara-maps-workspace-overlay] > .mari-editor-shell,
[data-marinara-maps-workspace-root] {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 0%;
  pointer-events: auto;
}

[data-marinara-maps-workspace-overlay] .mari-editor-header,
[data-marinara-maps-workspace-overlay] .mari-editor-header button {
  pointer-events: auto;
  touch-action: manipulation;
}

[data-marinara-maps-workspace-overlay] [data-marinara-maps-editor-canvas] {
  aspect-ratio: 16 / 9;
  height: auto;
  width: 100%;
}

[data-marinara-maps-workspace-overlay] .mari-editor-action,
[data-marinara-maps-workspace-overlay] .mari-chrome-control {
  min-width: 2.75rem;
  min-height: 2.75rem;
}

[data-marinara-maps-workspace-overlay] [data-marinara-map-selected-location="true"] {
  border-color: var(--marinara-chat-chrome-accent) !important;
  background: color-mix(in srgb, var(--marinara-chat-chrome-accent) 16%, var(--background) 84%) !important;
  color: var(--marinara-chat-chrome-panel-title) !important;
  box-shadow:
    0 0 0 0.125rem var(--background),
    0 0 0 0.25rem var(--marinara-chat-chrome-accent),
    0 0.5rem 1.25rem rgba(0, 0, 0, 0.32);
}

[data-marinara-maps-runtime-popover] [data-marinara-map-selected-location="true"] {
  border-color: var(--marinara-chat-chrome-accent) !important;
  background-color: Canvas !important;
  background-color: rgb(from var(--background) r g b) !important;
  background-image: linear-gradient(
    color-mix(in srgb, var(--marinara-chat-chrome-accent) 16%, transparent),
    color-mix(in srgb, var(--marinara-chat-chrome-accent) 16%, transparent)
  ) !important;
  color: var(--marinara-chat-chrome-panel-title) !important;
  box-shadow:
    0 0 0 0.125rem Canvas,
    0 0 0 0.25rem var(--marinara-chat-chrome-accent),
    0 0.5rem 1.25rem rgba(0, 0, 0, 0.32);
}

@media (max-width: 47.999rem) {
  [data-marinara-maps-workspace-overlay] [data-marinara-map-header-actions] {
    display: contents;
  }

  [data-marinara-maps-workspace-overlay] [data-marinara-map-more-control] {
    flex: 0 0 auto;
    width: auto;
  }

  [data-marinara-maps-workspace-overlay] [data-marinara-map-more-control] > button {
    position: relative;
    width: 2.75rem;
    padding-inline: 0;
  }

  [data-marinara-maps-workspace-overlay] [data-marinara-map-more-label],
  [data-marinara-maps-workspace-overlay] [data-marinara-map-more-chevron],
  [data-marinara-maps-workspace-overlay] [data-marinara-map-save-label] {
    display: none !important;
  }

  [data-marinara-maps-workspace-overlay] [data-marinara-map-notice-count] {
    position: absolute;
    top: -0.3125rem;
    right: -0.3125rem;
  }

  [data-marinara-maps-workspace-overlay] [data-marinara-map-header-status] {
    flex: 0 0 auto;
    margin-right: 0;
  }
}

@media (max-width: 21.25rem) {
  [data-marinara-maps-workspace-overlay] [data-marinara-map-header-title] {
    display: none !important;
  }
}

@media (max-width: 79.999rem) {
  [data-marinara-maps-workspace-overlay] [data-marinara-map-status-label] {
    display: none !important;
  }
}

@media (min-width: 64rem) {
  [data-marinara-maps-workspace-overlay] [data-marinara-map-compact-only],
  [data-marinara-maps-workspace-overlay] [data-marinara-map-notice-count] {
    display: none !important;
  }

  .mari-maps-workspace-grid {
    grid-template-columns: minmax(15rem, 18rem) minmax(20rem, 1fr) minmax(18rem, 22rem);
  }

  .mari-maps-ai-grid {
    grid-template-columns: minmax(20rem, 0.9fr) minmax(22rem, 1.1fr);
  }
}

@media (min-width: 64rem) and (max-width: 79.999rem) {
  [data-marinara-maps-workspace-overlay] [data-marinara-map-wide-only] {
    display: none !important;
  }
}

@media (min-width: 80rem) {
  [data-marinara-maps-workspace-overlay] [data-marinara-map-mid-overflow] {
    display: none !important;
  }
}
`;
      const worldMapStyles = `
[data-marinara-maps-world-canvas] {
  aspect-ratio: 16 / 9;
  height: auto;
  width: 100%;
}
`;
      const runtimeStyles = `
@media (max-width: 39.999rem) {
  marinara-capability-hierarchical-maps[view="runtime"] {
    display: block;
  }

  [data-marinara-maps-runtime-root][data-runtime-layout="compact"] {
    width: 2.75rem;
    height: 2.75rem;
    margin-left: auto;
    overflow: visible;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  [data-marinara-maps-runtime-root][data-runtime-layout="compact"][data-runtime-mode="game"] {
    height: 0;
    margin-bottom: 0;
    transform: translateY(-2.75rem);
    pointer-events: none;
    z-index: 110;
  }

  [data-marinara-maps-runtime-root][data-runtime-layout="compact"][data-runtime-mode="game"] [data-marinara-maps-runtime-mobile] {
    pointer-events: auto;
  }

  [data-marinara-maps-runtime-root][data-runtime-layout="compact"][data-runtime-mode="game"] [data-marinara-maps-runtime-options] {
    pointer-events: auto;
  }

  [data-marinara-maps-runtime-desktop] {
    display: none !important;
  }

  [data-marinara-maps-runtime-mobile] {
    display: flex !important;
  }

  [data-marinara-maps-runtime-popover] {
    position: absolute;
    right: 0;
    bottom: calc(100% + 0.375rem);
    z-index: 100;
    width: min(22rem, calc(100vw - 1.5rem));
    max-height: min(70dvh, 36rem);
    background-color: var(--background) !important;
    background-image: linear-gradient(
      var(--marinara-chat-chrome-highlight-bg),
      var(--marinara-chat-chrome-highlight-bg)
    );
    backdrop-filter: none;
  }

  [data-marinara-maps-runtime-options] {
    position: absolute;
    right: 0;
    bottom: calc(100% + 0.375rem);
    z-index: 100;
    width: min(22rem, calc(100vw - 1.5rem));
    max-height: min(70dvh, 36rem);
    overflow-y: auto;
    border: 1px solid var(--marinara-chat-chrome-panel-border);
    border-radius: 0.75rem;
    background-color: var(--background);
    background-image: linear-gradient(
      var(--marinara-chat-chrome-highlight-bg),
      var(--marinara-chat-chrome-highlight-bg)
    );
    backdrop-filter: none;
    box-shadow: 0 1.5rem 3rem rgb(0 0 0 / 45%);
  }
}

@media (min-width: 40rem) {
  [data-marinara-maps-runtime-mobile] {
    display: none !important;
  }
}
`;
      source = `
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { SpatialContextSettingsSection } from ${JSON.stringify(settings)};
import { SpatialMapsHome } from ${JSON.stringify(home)};
import { SpatialMapWorkspace } from ${JSON.stringify(workspace)};
import { SpatialMapLibrary } from ${JSON.stringify(library)};
import { SpatialContextRuntimeBar } from ${JSON.stringify(runtimeBar)};
import { GameWorldMap } from ${JSON.stringify(worldMap)};
import { useSpatialContext } from ${JSON.stringify(spatialHooks)};
import { packageApi } from ${JSON.stringify(packageApi)};
import { SpatialMapLocalizationProvider } from ${JSON.stringify(localization)};
import { clearPendingSpatialTransition, getPendingSpatialTransition, reconcileCommittedSpatialTravel, setPendingSpatialTransition, setPendingSpatialTransitionStatus, usePendingSpatialTransition } from ${JSON.stringify(pendingTransitions)};
import { findSpatialRoute } from ${JSON.stringify(routePlans)};
const workspaceStyles = ${JSON.stringify(workspaceStyles)};
const worldMapStyles = ${JSON.stringify(worldMapStyles)};
const runtimeStyles = ${JSON.stringify(runtimeStyles)};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
class CapabilityClientErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  componentDidCatch(error, info) {
    const message = error instanceof Error && error.message ? error.message : "Capability client runtime failed";
    this.props.element.capabilityRuntimeError = message;
    this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error", { detail: { message }, bubbles: true }));
    console.error("World Maps client capability stopped", error, info);
  }
  retry() {
    this.props.element.capabilityRuntimeError = null;
    this.setState({ error: null });
  }
  render() {
    if (!this.state.error) return this.props.children;
    return <div role="alert" className="m-3 flex items-start gap-3 rounded-lg border border-[var(--destructive)]/25 bg-[var(--destructive)]/10 p-3"><span className="min-w-0 flex-1 text-xs text-[var(--foreground)]">World Maps stopped.</span><button type="button" onClick={() => this.retry()} className="min-h-11 min-w-11 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-3 text-xs font-medium text-[var(--foreground)]">Try again</button></div>;
  }
  static getDerivedStateFromError(error) { return { error }; }
}
const spatialEventSequence = new Map();
const spatialTransitionReviewMessages = new Map([
  ["spatial_transition_stale_definition", "The world map changed. Review the available destinations."],
  ["spatial_transition_stale_location", "The current location changed. Review the available destinations."],
]);
async function reconcileSpatialCapabilityEvent(detail) {
  if (detail?.packageId !== "hierarchical-maps" || typeof detail.chatId !== "string") return;
  const chatId = detail.chatId;
  const sequence = (spatialEventSequence.get(chatId) || 0) + 1;
  spatialEventSequence.set(chatId, sequence);
  const data = detail.data && typeof detail.data === "object" ? detail.data : null;
  const commandId = typeof data?.commandId === "string" ? data.commandId : null;
  if (detail.type === "spatial_transition_rejected") {
    const pending = getPendingSpatialTransition(chatId);
    if (commandId && pending?.transition.commandId === commandId) {
      const reviewMessage =
        typeof data?.message === "string" && data.message.trim()
          ? data.message.trim()
          : typeof data?.code === "string"
            ? spatialTransitionReviewMessages.get(data.code)
            : undefined;
      setPendingSpatialTransitionStatus(chatId, "needs_review", reviewMessage);
    }
    void client.invalidateQueries({ queryKey: ["spatial-context", chatId] });
    return;
  }
  let spatial;
  try {
    spatial = await packageApi.get("/chats/" + encodeURIComponent(chatId) + "/spatial-context");
  } catch {
    void client.invalidateQueries({ queryKey: ["spatial-context", chatId] });
    return;
  }
  if (!spatial || spatialEventSequence.get(chatId) !== sequence) return;
  client.setQueryData(["spatial-context", chatId], spatial);
  if (detail.type === "spatial_transition_committed" && commandId) {
    const pending = getPendingSpatialTransition(chatId);
    let travel = data?.travel;
    if (!travel && pending?.transition.commandId === commandId && pending.transition.travelMode === "step_by_step") {
      const currentLocationId = spatial.currentLocationId;
      const targetLocationId = pending.transition.destinationId;
      const remainingRoute = spatial.definition
        ? findSpatialRoute(spatial.definition, currentLocationId, targetLocationId)
        : null;
      if (currentLocationId === targetLocationId) {
        travel = {
          mode: "step_by_step",
          fromLocationId: pending.transition.expectedCurrentLocationId,
          targetLocationId,
          routeLocationIds: [targetLocationId],
          remainingLocationIds: [],
          complete: true,
        };
      } else if (currentLocationId && remainingRoute) {
        travel = {
          mode: "step_by_step",
          fromLocationId: pending.transition.expectedCurrentLocationId,
          targetLocationId,
          routeLocationIds: remainingRoute.locationIds,
          remainingLocationIds: remainingRoute.locationIds.slice(1),
          complete: false,
        };
      } else {
        setPendingSpatialTransitionStatus(chatId, "needs_review", "The accepted route could not be reconstructed.");
        return;
      }
    }
    if (travel?.mode === "step_by_step" && travel.complete === false) {
      reconcileCommittedSpatialTravel(chatId, spatial, travel);
    } else {
      clearPendingSpatialTransition(chatId, commandId);
    }
  }
}
window.addEventListener("marinara-capability-server-event", (event) => { void reconcileSpatialCapabilityEvent(event.detail); });
function PendingBridge({ chatId, onChange }) { const pending = usePendingSpatialTransition(chatId); const onChangeRef = useRef(onChange); useEffect(() => { onChangeRef.current = onChange; }, [onChange]); useEffect(() => { if (typeof onChangeRef.current === "function") onChangeRef.current(pending); }, [pending]); return null; }
function WorldMapView({ props, chatId, onOpenEditor, useParentScroll = false }) {
  const spatial = useSpatialContext(chatId);
  if (spatial.isLoading) return <div className="h-full min-h-32 space-y-2 rounded-lg border border-[var(--marinara-chat-chrome-panel-border)] p-3" aria-label="Loading world map"><span role="status" className="sr-only">Loading world map</span><div className="h-3 w-28 animate-pulse rounded bg-[var(--muted)]" /><div className="h-24 animate-pulse rounded-lg bg-[var(--muted)]/55" /></div>;
  if (spatial.isError) return <div role="alert" className="flex min-h-32 items-center gap-3 rounded-lg border border-[var(--destructive)]/25 bg-[var(--destructive)]/10 p-3 text-xs"><span className="min-w-0 flex-1">The world map could not be loaded.</span><button type="button" onClick={() => void spatial.refetch()} className="min-h-11 rounded-lg px-3 font-semibold text-[var(--destructive)] hover:bg-[var(--destructive)]/10">Retry</button></div>;
  if (!spatial.data?.definition) return <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[var(--marinara-chat-chrome-panel-border)] px-4 text-center text-xs text-[var(--marinara-chat-chrome-accent)]">No world map yet. Create one from Agents → World Maps.</div>;
  if (!spatial.data.definition.enabled) return <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[var(--marinara-chat-chrome-panel-border)] px-4 text-center text-xs text-[var(--marinara-chat-chrome-accent)]">World map disabled. Its saved hierarchy and history are preserved.</div>;
  return <><style data-marinara-maps-world-styles>{worldMapStyles}</style><GameWorldMap chatId={chatId} spatial={spatial.data} disabled={props.disabled === true} compact={props.compact === true} useParentScroll={useParentScroll} onOpenEditor={onOpenEditor} /><PendingBridge chatId={chatId} onChange={props.onPendingTransitionChange} /></>;
}
function stopOverlayEvent(event) { event.stopPropagation(); }
function WorkspaceOverlay({ chatId, props, stagedTemplate, onClose, onOpenTemplates }) { return createPortal(<div data-chat-floating-panel data-marinara-maps-workspace-overlay className="fixed inset-0 isolate flex min-h-0 flex-col overflow-hidden bg-[var(--background)]" style={{ zIndex: 10020, backgroundColor: "var(--background)" }} onPointerDown={stopOverlayEvent} onMouseDown={stopOverlayEvent} onTouchStart={stopOverlayEvent} onClick={stopOverlayEvent}><style data-marinara-maps-workspace-styles>{workspaceStyles}</style><SpatialMapWorkspace chatId={chatId} debugMode={props.debugMode === true} stagedTemplate={stagedTemplate} pendingDraftReview={props.pendingDraftReview?.mode === "template" ? null : props.pendingDraftReview || null} onClearPendingDraftReview={() => props.onClearPendingDraftReview?.()} onDirtyChange={(dirty) => props.onDirtyChange?.(dirty)} onOpenLorebook={(lorebookId) => props.onOpenLorebook?.(lorebookId)} onLorebooksChanged={() => props.onLorebooksChanged?.()} onOpenTemplates={onOpenTemplates} onClose={onClose} /><Toaster richColors /></div>, document.body); }
function LibraryOverlay({ chatId, props, setupSelection, startOverReplacement, onClose, onAppliedToChat, onSelectForSetup, onSelectSharedWorldForSetup }) { const sharedWorldSetupSupported = Array.isArray(props.supportedSelectionKinds) && props.supportedSelectionKinds.includes("shared-world"); return createPortal(<div data-chat-floating-panel data-marinara-maps-workspace-overlay className="fixed inset-0 isolate flex min-h-0 flex-col overflow-hidden bg-[var(--background)]" style={{ zIndex: 10020, backgroundColor: "var(--background)" }} onPointerDown={stopOverlayEvent} onMouseDown={stopOverlayEvent} onTouchStart={stopOverlayEvent} onClick={stopOverlayEvent}><style data-marinara-maps-workspace-styles>{workspaceStyles}</style><SpatialMapLibrary chatId={chatId || null} chatName={typeof props.chatName === "string" ? props.chatName : null} chatMode={typeof props.chatMode === "string" ? props.chatMode : null} enabledForChat={props.enabledForChat === true} startOverReplacement={startOverReplacement} onOpenLorebook={(lorebookId) => props.onOpenLorebook?.(lorebookId)} onLorebooksChanged={() => props.onLorebooksChanged?.()} onEnabledForChatChange={typeof props.onEnabledForChatChange === "function" ? props.onEnabledForChatChange : undefined} onAppliedToChat={onAppliedToChat} onSelectForSetup={setupSelection ? onSelectForSetup : undefined} onSelectSharedWorldForSetup={setupSelection && sharedWorldSetupSupported ? onSelectSharedWorldForSetup : undefined} onClose={onClose} /><Toaster richColors /></div>, document.body); }
function SetupSharedWorldApply({ chatId, props }) {
  const attemptRef = useRef("");
  const onAppliedRef = useRef(props.onApplied);
  const onErrorRef = useRef(props.onError);
  onAppliedRef.current = props.onApplied;
  onErrorRef.current = props.onError;
  const selection = props.selection && typeof props.selection === "object" ? props.selection : null;
  const payload = selection?.payload && typeof selection.payload === "object" ? selection.payload : null;
  const worldId = typeof payload?.worldId === "string" ? payload.worldId.trim() : "";
  const worldName = typeof selection?.label === "string" ? selection.label.trim() : "";
  const expectedWorldRevision = Number.isSafeInteger(payload?.expectedWorldRevision) && payload.expectedWorldRevision > 0 ? payload.expectedWorldRevision : null;
  const valid = Boolean(payload?.kind === "shared-world" && worldId && worldName && selection?.id === worldId && expectedWorldRevision !== null);
  const attemptKey = valid ? chatId + ":" + worldId + ":" + expectedWorldRevision : chatId + ":invalid";
  useEffect(() => {
    if (attemptRef.current === attemptKey) return;
    attemptRef.current = attemptKey;
    if (!valid) {
      onErrorRef.current?.("The selected shared world could not be read. Return to the library and choose it again.");
      return;
    }
    let cancelled = false;
    void packageApi.get("/chats/" + encodeURIComponent(chatId) + "/spatial-context").then((spatial) => {
      if (cancelled) return null;
      return packageApi.post("/chats/" + encodeURIComponent(chatId) + "/spatial-context/shared-world/link", {
        worldId,
        expectedWorldRevision,
        expectedRevision: spatial?.definition?.revision ?? 0,
        expectedCurrentLocationId: spatial?.currentLocationId ?? null,
      });
    }).then((spatial) => {
      if (cancelled || !spatial) return;
      if (spatial.sharedWorld?.mode !== "linked" || spatial.sharedWorld?.worldId !== worldId) throw new Error("World Maps did not confirm the shared-world link.");
      client.setQueryData(["spatial-context", chatId], spatial);
      onAppliedRef.current?.({ worldId, worldName, worldRevision: spatial.sharedWorld.worldRevision });
    }).catch((error) => {
      if (!cancelled) onErrorRef.current?.(error instanceof Error ? error.message : "The shared world could not be linked.");
    });
    return () => { cancelled = true; };
  }, [attemptKey, chatId, expectedWorldRevision, valid, worldId, worldName]);
  return null;
}
function WorldMapOverlay({ chatId, props, onClose, onOpenEditor }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return createPortal(<div data-chat-floating-panel data-marinara-maps-world-overlay className="fixed inset-0 isolate flex min-h-0 flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]" style={{ zIndex: 10020, backgroundColor: "var(--background)" }}>
    <header className="flex min-h-16 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--background)] px-3 sm:px-5">
      <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold text-[var(--marinara-chat-chrome-accent)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]" aria-label="Back to World Maps">Back</button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold">World map</h1>
        <p className="truncate text-[0.625rem] text-[var(--marinara-chat-chrome-accent)]">{typeof props.chatName === "string" ? props.chatName : "Current story"}</p>
      </div>
      <button type="button" onClick={onOpenEditor} className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 text-xs font-semibold hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">Edit map</button>
    </header>
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-4 max-w-2xl text-xs leading-relaxed text-[var(--marinara-chat-chrome-accent)]">Browse nested places and linked routes. Choose step-by-step travel for one hop per turn, or travel now along the full route.</p>
        <WorldMapView props={props} chatId={chatId} useParentScroll />
      </div>
    </main>
    <Toaster richColors />
  </div>, document.body);
}
function Root({ element }) {
  const [, redraw] = useState(0);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryStartOver, setLibraryStartOver] = useState(false);
  const [stagedTemplate, setStagedTemplate] = useState(null);
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const previousPendingRef = useRef({ chatId: "", pending: null });
  useEffect(() => {
    const update = () => redraw((value) => value + 1);
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);
  const props = element.capabilityProps || {};
  const chatId = typeof props.chatId === "string" ? props.chatId : "";
  const view = element.getAttribute("view");
  const setupTemplatePending = props.pendingDraftReview?.mode === "template";
  const pendingSetupTemplate = setupTemplatePending && props.pendingDraftReview?.selection?.payload && typeof props.pendingDraftReview.selection.payload === "object" ? props.pendingDraftReview.selection.payload : null;
  const setupTemplateNeedsSelection = setupTemplatePending && !pendingSetupTemplate;
  useEffect(() => {
    if (!chatId || !setupTemplateNeedsSelection) return;
    setWorkspaceOpen(false);
    setLibraryOpen(true);
  }, [chatId, setupTemplateNeedsSelection]);
  useEffect(() => {
    if (!chatId) return;
    const previous = previousPendingRef.current;
    const nextPending = props.pendingTransition && typeof props.pendingTransition === "object" ? props.pendingTransition : null;
    if (nextPending) setPendingSpatialTransition(chatId, nextPending);
    else {
      const previousCommandId = previous.chatId === chatId ? previous.pending?.transition?.commandId : undefined;
      clearPendingSpatialTransition(chatId, previousCommandId);
      if (previous.chatId === chatId && previous.pending) void client.invalidateQueries({ queryKey: ["spatial-context", chatId] });
    }
    previousPendingRef.current = { chatId, pending: nextPending };
  }, [chatId, props.pendingTransition]);
  const closeWorkspace = () => {
    props.onClearPendingDraftReview?.();
    setStagedTemplate(null);
    setWorkspaceOpen(false);
    if (view !== "detail") props.onClose?.();
  };
  const editFromWorldMap = () => {
    setWorldMapOpen(false);
    setWorkspaceOpen(true);
  };
  const closeLibrary = () => {
    if (setupTemplateNeedsSelection) {
      props.onClearPendingDraftReview?.();
      props.onClose?.();
      return;
    }
    setLibraryOpen(false);
    setLibraryStartOver(false);
  };
  const selectTemplateForSetup = (template) => {
    if (view === "setup") {
      props.onSelect?.({ kind: "template", id: template.id, label: template.name, payload: template });
      props.onClose?.();
      return;
    }
    setStagedTemplate(template);
    props.onClearPendingDraftReview?.();
    setLibraryOpen(false);
    setWorkspaceOpen(true);
  };
  const selectSharedWorldForSetup = (world) => {
    props.onSelect?.({
      kind: "shared-world",
      id: world.id,
      label: world.name,
      payload: { kind: "shared-world", worldId: world.id, expectedWorldRevision: world.revision },
    });
    props.onClose?.();
  };
  let content = null;
  if (view === "setup-apply") content = chatId ? <SetupSharedWorldApply chatId={chatId} props={props} /> : null;
  else if (view === "setup") content = <LibraryOverlay chatId="" props={props} setupSelection onSelectForSetup={selectTemplateForSetup} onSelectSharedWorldForSetup={selectSharedWorldForSetup} onClose={() => props.onClose?.()} />;
  else if (libraryOpen) content = <LibraryOverlay chatId={chatId} props={props} setupSelection={setupTemplateNeedsSelection} startOverReplacement={libraryStartOver} onSelectForSetup={selectTemplateForSetup} onClose={closeLibrary} onAppliedToChat={() => { setLibraryOpen(false); setLibraryStartOver(false); setWorkspaceOpen(true); }} />;
  else if (workspaceOpen && chatId) content = <WorkspaceOverlay chatId={chatId} props={props} stagedTemplate={stagedTemplate || pendingSetupTemplate} onClose={closeWorkspace} onOpenTemplates={(options) => { setLibraryStartOver(options?.startOver === true); setLibraryOpen(true); }} />;
  else if (worldMapOpen && chatId) content = <WorldMapOverlay chatId={chatId} props={props} onClose={() => setWorldMapOpen(false)} onOpenEditor={editFromWorldMap} />;
  else if (view === "detail") content = <><SpatialMapsHome chatId={chatId || null} chatName={typeof props.chatName === "string" ? props.chatName : null} chatMode={typeof props.chatMode === "string" ? props.chatMode : null} enabledForChat={props.enabledForChat === true} packageInfo={props.package || null} agentInfo={props.agent || null} onEnabledForChatChange={typeof props.onEnabledForChatChange === "function" ? props.onEnabledForChatChange : undefined} onOpenMap={() => setWorldMapOpen(true)} onOpenEditor={() => setWorkspaceOpen(true)} onOpenLibrary={() => setLibraryOpen(true)} onManagePackage={typeof props.onManagePackage === "function" ? props.onManagePackage : undefined} confirmAction={typeof props.confirmAction === "function" ? props.confirmAction : undefined} onDirtyChange={typeof props.onDirtyChange === "function" ? props.onDirtyChange : undefined} onClose={typeof props.onClose === "function" ? props.onClose : undefined} /><Toaster richColors /></>;
  else if (chatId && view === "runtime") content = <><style data-marinara-maps-world-styles>{worldMapStyles}</style><style data-marinara-maps-runtime-styles>{runtimeStyles}</style><SpatialContextRuntimeBar chatId={chatId} disabled={props.disabled === true} onOpenEditor={() => setWorkspaceOpen(true)} /><PendingBridge chatId={chatId} onChange={props.onPendingTransitionChange} /></>;
  else if (chatId && view === "world-map") content = <WorldMapView props={props} chatId={chatId} onOpenEditor={() => setWorkspaceOpen(true)} />;
  else if (chatId && view === "workspace") content = <WorkspaceOverlay chatId={chatId} props={props} stagedTemplate={stagedTemplate || pendingSetupTemplate} onClose={closeWorkspace} onOpenTemplates={(options) => { setLibraryStartOver(options?.startOver === true); setLibraryOpen(true); }} />;
  else if (chatId) content = <><SpatialContextSettingsSection chatId={chatId} style={props.style} enabledForChat={props.enabledForChat === true} onEnabledForChatChange={typeof props.onEnabledForChatChange === "function" ? props.onEnabledForChatChange : undefined} onOpenEditor={() => setWorkspaceOpen(true)} /><Toaster richColors /></>;
  return <SpatialMapLocalizationProvider localization={props.localization}>{content}</SpatialMapLocalizationProvider>;
}
class Element extends HTMLElement { connectedCallback() { if (!this.__root) this.__root = createRoot(this); this.__root.render(<QueryClientProvider client={client}><CapabilityClientErrorBoundary element={this}><Root element={this} /></CapabilityClientErrorBoundary></QueryClientProvider>); } disconnectedCallback() { queueMicrotask(() => { if (!this.isConnected && this.__root) { this.__root.unmount(); this.__root = null; } }); } }
if (!customElements.get(${JSON.stringify(tag)})) customElements.define(${JSON.stringify(tag)}, Element);`;
    } else if (feature.id === "conversation-calls") {
      const surface = resolve(prepared.buildRoot, "packages/client/src/components/chat/ConversationCallSurface.tsx");
      const hooks = resolve(prepared.buildRoot, "packages/client/src/hooks/use-conversation-calls.ts");
      const ttsHooks = resolve(prepared.buildRoot, "packages/client/src/hooks/use-tts.ts");
      source = `
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChevronRight, Loader2, Phone, PhoneIncoming, PhoneOff } from "lucide-react";
import { Toaster, toast } from "sonner";
import { ConversationCallSurface } from ${JSON.stringify(surface)};
import { useAcceptConversationCall, useConversationCallStatus, useDeclineConversationCall, useStartConversationCall } from ${JSON.stringify(hooks)};
import { useTTSConfig, useUpdateTTSConfig } from ${JSON.stringify(ttsHooks)};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); window.addEventListener("marinara-capability-server-event", (event) => { if (event.detail?.packageId === "conversation-calls") void client.invalidateQueries({ queryKey: ["conversation-calls"] }); }); let expandedChatId = null; const listeners = new Set(); function setExpanded(chatId) { expandedChatId = chatId; for (const listener of listeners) listener(); } function useExpanded(chatId) { const [, redraw] = useState(0); useEffect(() => { const fn = () => redraw((v) => v + 1); listeners.add(fn); return () => listeners.delete(fn); }, []); return expandedChatId === chatId; }
function Toggle({ label, description, enabled, disabled, pending, compact, onClick }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={(compact ? "mari-chat-option-field " : "") + "flex w-full items-center justify-between gap-3 rounded-lg bg-[var(--background)]/35 px-2.5 py-2 text-left transition-all hover:bg-[var(--secondary)]/50" + (enabled && compact ? " mari-chat-option-field--active" : "") + (disabled ? " cursor-not-allowed opacity-60" : "")}>
    <span className="min-w-0 flex-1">
      <span className="block text-[0.6875rem] font-medium text-[var(--foreground)]">{label}</span>
      {description ? <span className="mt-0.5 block text-[0.59375rem] leading-snug text-[var(--muted-foreground)]">{description}</span> : null}
    </span>
    <span className="flex shrink-0 items-center gap-2">
      {pending ? <Loader2 size="0.75rem" className="animate-spin" /> : null}
      <span className={"mari-chat-option-switch h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors" + (enabled ? " mari-chat-option-switch--active" : "")}>
        <span className={"block h-4 w-4 rounded-full bg-white shadow-sm transition-transform" + (enabled ? " translate-x-3.5" : "")} />
      </span>
    </span>
  </button>;
}
function Settings({ props }) {
  const metadata = props.metadata && typeof props.metadata === "object" ? props.metadata : {};
  const updateMetadata = typeof props.updateMetadata === "function" ? props.updateMetadata : () => {};
  const config = useTTSConfig();
  const updateConfig = useUpdateTTSConfig();
  const value = config.data;
  const disabled = !value || updateConfig.isPending;
  const patch = (next) => {
    if (!value) return toast.error("Conversation call settings are still loading.");
    updateConfig.mutate({ ...value, callSttConnectionId: "", callSttModel: "", ...next });
  };
  const callsEnabled = metadata.conversationCallsEnabled === true;
  const connectionsKnown = Array.isArray(props.connections);
  const connections = connectionsKnown ? props.connections.filter((connection) => connection && typeof connection.id === "string") : [];
  const summaryConnectionId = typeof metadata.conversationCallSummaryConnectionId === "string" ? metadata.conversationCallSummaryConnectionId : "";
  const summaryConnectionPending = !connectionsKnown && summaryConnectionId;
  const summaryConnectionMissing = connectionsKnown && summaryConnectionId && !connections.some((connection) => connection.id === summaryConnectionId);
  const audio = value?.callAudioEnabled === true;
  const videoInput = value?.callVideoInputEnabled === true;
  const videoPresence = value?.callCharacterVideoEnabled === true;
  const automaticClips = videoPresence && value?.callAutomaticVideoClipsEnabled === true;
  const customClips = videoPresence && value?.callCustomVideoClipsEnabled === true;
  const open = props.expanded === true;
  const setOpen = typeof props.onExpandedChange === "function" ? props.onExpandedChange : () => {};
  return <section style={props.style} className="rounded-xl border border-[var(--border)] bg-[var(--secondary)]/70">
    <div className="flex items-start p-3">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="-m-1 flex min-w-0 flex-1 items-start gap-2 rounded-lg p-1 text-left transition-colors hover:bg-[var(--accent)]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]/60">
        <Phone size="0.75rem" className="mt-0.5 text-[var(--primary)]" />
        <span className="min-w-0 flex-1">
          <span className="block text-[0.6875rem] font-medium text-[var(--foreground)]">Calls</span>
          <span className="mt-1 block text-[0.625rem] text-[var(--muted-foreground)]">Per-chat call access.</span>
        </span>
        <ChevronRight size="0.75rem" className={"mt-0.5 shrink-0 text-[var(--muted-foreground)] transition-transform" + (open ? " rotate-90" : "")} />
      </button>
    </div>
    {open ? <div className="space-y-3 px-3 pb-2">
    <Toggle label="Audio/Video Calls" description="Show the call button for you in this conversation." enabled={callsEnabled} onClick={() => updateMetadata({ conversationCallsEnabled: !callsEnabled })} />
    {callsEnabled ? <>
      <div className="space-y-1.5 border-t border-[var(--border)]/60 pt-3">
        <Toggle label="Generate voice cues in [tags]" description="Ask call models for cues like [whispering], [laughing], and [sighs] for TTS/video timing." enabled={metadata.conversationCallVoiceCues !== false} onClick={() => updateMetadata({ conversationCallVoiceCues: metadata.conversationCallVoiceCues === false })} />
        <label className="flex flex-col gap-1.5 rounded-lg bg-[var(--background)]/35 px-2.5 py-2">
          <span className="text-[0.6875rem] font-medium text-[var(--foreground)]">Call summary connection</span>
          <select value={summaryConnectionId} onChange={(event) => updateMetadata({ conversationCallSummaryConnectionId: event.target.value || null })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]/50">
            <option value="">Agent default (falls back to chat connection)</option>
            {summaryConnectionPending ? <option value={summaryConnectionId}>Loading connection…</option> : null}
            {summaryConnectionMissing ? <option value={summaryConnectionId}>Missing connection</option> : null}
            {connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.name || "Connection"}{connection.model ? " · " + connection.model : ""}</option>)}
          </select>
          <span className="text-[0.55rem] leading-snug text-[var(--muted-foreground)]">Used after a call ends. Connection custom parameters and reasoning settings are preserved.</span>
        </label>
        <Toggle label="Call Audio Pipeline" description="Request microphone access, listen while unmuted, and transcribe speech into the call." enabled={audio} disabled={disabled} pending={updateConfig.isPending} onClick={() => patch({ callAudioEnabled: !audio, ...(!audio ? { callAudioInputMode: "local_whisper" } : {}) })} />
      </div>
      {audio ? <div className="space-y-2 border-t border-[var(--border)]/60 pt-3">
        <label className="flex flex-col gap-1">
          <span className="text-[0.625rem] font-medium text-[var(--foreground)]">Audio input mode</span>
          <select value={value?.callAudioInputMode || "local_whisper"} disabled={disabled} onChange={(event) => patch({ callAudioInputMode: event.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]/50 disabled:cursor-not-allowed disabled:opacity-60"><option value="local_whisper">Mic recording + Local Whisper</option><option value="transcribe">Browser speech recognition</option><option value="system">Manual system dictation</option><option value="auto">Provider-native audio/video</option></select>
          <span className="text-[0.55rem] leading-snug text-[var(--muted-foreground)]">Local Whisper records mic audio while you are unmuted and transcribes speech locally. Browser speech uses Web Speech where supported. Manual system dictation focuses the call input. Provider-native mode sends media to the selected conversation model.</span>
        </label>
        <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
          <Toggle compact label="Camera and screen input" enabled={videoInput} disabled={disabled} onClick={() => patch({ callVideoInputEnabled: !videoInput })} />
          <Toggle compact label="Character video presence" enabled={videoPresence} disabled={disabled} onClick={() => patch({ callCharacterVideoEnabled: !videoPresence, ...(!videoPresence ? {} : { callAutomaticVideoClipsEnabled: false, callCustomVideoClipsEnabled: false }) })} />
          {videoPresence ? <Toggle compact label="Automatic video clips generation" enabled={automaticClips} disabled={disabled} onClick={() => patch({ callAutomaticVideoClipsEnabled: !automaticClips })} /> : null}
          {videoPresence ? <Toggle compact label="Custom clips" enabled={customClips} disabled={disabled} onClick={() => patch({ callCustomVideoClipsEnabled: !customClips })} /> : null}
        </div>
        {videoPresence ? <p className="text-[0.55rem] leading-snug text-[var(--muted-foreground)]">Character video presence uses clips from Character Sprites. Automatic clips generate cached idle and talking clips from character avatars; Custom clips let characters sparsely create one-off requested clips.</p> : null}
      </div> : <p className="rounded-lg border border-dashed border-[var(--border)] px-2.5 py-2 text-[0.59375rem] leading-snug text-[var(--muted-foreground)]">Turn on the call audio pipeline here to use local mic transcription, browser speech recognition, manual system dictation, optional provider-native audio/video input, and call controls.</p>}
    </> : null}
    </div> : null}
  </section>;
}
function Root({ element }) {
  const [, redraw] = useState(0);
  useEffect(() => {
    const update = () => redraw((value) => value + 1);
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);
  const props = element.capabilityProps || {};
  const chatId = typeof props.chatId === "string" ? props.chatId : "";
  const callsEnabled = props.metadata?.conversationCallsEnabled === true;
  const status = useConversationCallStatus(chatId, !!chatId);
  const start = useStartConversationCall(chatId);
  const accept = useAcceptConversationCall(chatId);
  const decline = useDeclineConversationCall(chatId);
  const expanded = useExpanded(chatId);
  const active = status.data?.activeCall || null;
  const ringing = status.data?.ringingCall || null;
  const toolbarButtonClass = typeof props.toolbarButtonClass === "string" ? props.toolbarButtonClass : "mari-chrome-control flex h-8 w-8 items-center justify-center p-0 max-md:h-9 max-md:w-9";
  if (!chatId) return null;
  if (element.getAttribute("view") === "settings") return <Settings props={props} />;
  if (element.getAttribute("view") === "toolbar") {
    if (!callsEnabled && !active) return null;
    return <button type="button" className={toolbarButtonClass} title={active ? "Open call" : "Start call"} onClick={async () => {
      if (active) return setExpanded(chatId);
      try {
        await start.mutateAsync();
        setExpanded(chatId);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not start the call.");
      }
    }}>{start.isPending ? <Loader2 size="0.875rem" className="animate-spin" /> : active ? <PhoneIncoming size="0.875rem" /> : <Phone size="0.875rem" />}</button>;
  }
  if (expanded && active) return <div className="absolute inset-0 z-40 flex min-h-0 bg-[var(--background)]"><ConversationCallSurface chatId={chatId} session={active} characterMap={props.characterMap || new Map()} chatCharIds={props.chatCharIds || []} personaInfo={props.personaInfo} onEnded={() => setExpanded(null)} embedded /><Toaster richColors /></div>;
  if (ringing && !active) return <div className="px-3 pb-2"><div className="flex w-full items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--popover)] p-3 shadow-xl"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"><PhoneIncoming size="1rem" /></div><div className="min-w-0 flex-1 text-sm font-semibold">Incoming call</div><button type="button" className="mari-chrome-control h-9 w-9 p-0 text-[var(--destructive)]" onClick={() => void decline.mutateAsync(ringing.id)}><PhoneOff size="0.875rem" /></button><button type="button" className="mari-chrome-control h-9 w-9 p-0 text-emerald-400" onClick={async () => { await accept.mutateAsync(ringing.id); setExpanded(chatId); }}><Phone size="0.875rem" /></button></div><Toaster richColors /></div>;
  return null;
}
class Element extends HTMLElement { connectedCallback() { if (!this.__root) this.__root = createRoot(this); this.__root.render(<QueryClientProvider client={client}><Root element={this} /></QueryClientProvider>); } disconnectedCallback() { queueMicrotask(() => { if (!this.isConnected && this.__root) { this.__root.unmount(); this.__root = null; } }); } }
if (!customElements.get(${JSON.stringify(tag)})) customElements.define(${JSON.stringify(tag)}, Element);`;
    } else if (feature.clientImport) {
      if (feature.id === "noodle" || feature.id === "slurp") {
        const setterName = feature.id === "noodle" ? "setNoodlePackageStyles" : "setSlurpPackageStyles";
        source = `import { ${setterName} } from ${JSON.stringify(resolve(prepared.buildRoot, feature.clientImport))};`;
        const styles = await buildPackageStyles(prepared.buildRoot, temporary, feature.id);
        source += `\n${setterName}(${JSON.stringify(styles)});\n`;
      } else source = `import ${JSON.stringify(resolve(prepared.buildRoot, feature.clientImport))};`;
    } else return;
    const entry = join(temporary, "entry.tsx");
    const metafile = join(temporary, "meta.json");
    await writeFile(entry, source);
    const result = spawnEsbuild(
      [
        entry,
        "--bundle",
        "--platform=browser",
        "--format=esm",
        "--target=es2020",
        "--minify",
        "--log-limit=0",
        "--jsx=automatic",
        '--define:process.env.NODE_ENV="production"',
        "--define:import.meta.env.DEV=false",
        "--define:import.meta.env.PROD=true",
        '--define:import.meta.env.MODE="production"',
        `--alias:@marinara-engine/shared=${packageSharedEntry}`,
        `--metafile=${metafile}`,
        `--outfile=${output}`,
      ],
      {
        cwd: engineRoot,
        encoding: "utf8",
        env: { ...process.env, NODE_PATH: engineNodePath },
      },
    );
    if (result.status !== 0)
      throw new Error(result.stderr || result.stdout || `client esbuild failed for ${feature.id}`);
    if (feature.ownedSourcePaths?.length) {
      await capturePackageSources(metafile, prepared.buildRoot, feature.ownedSourcePaths);
    } else {
      await captureEngineSources(
        metafile,
        prepared.buildRoot,
        feature.id === "hierarchical-maps" ? hierarchicalMapsOwnedSourcePaths : [],
      );
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
    await prepared.cleanup();
  }
}

const { catalog } = await readCatalogFamily(repoRoot);
const featureIds = new Set(selectedFeatures.map((feature) => feature.id));
const nonDownloadableCoreFeatures = new Set(["about-me-keeper"]);
catalog.packages = catalog.packages.filter(
  (entry) => !featureIds.has(entry.manifest.id) && !nonDownloadableCoreFeatures.has(entry.manifest.id),
);

for (const feature of selectedFeatures) {
  const version = feature.version ?? "1.0.0";
  const description = withPackageActivationGuidance(feature.id, feature.description);
  const sourceDir = join(packagesDir, feature.id);
  await mkdir(sourceDir, { recursive: true });
  const agentDefinition = {
    id: feature.id,
    name: feature.name,
    description: feature.agent?.description ?? feature.description,
    author: "Pasta Devs",
    phase: feature.agent?.phase ?? "pre_generation",
    enabledByDefault: false,
    category: feature.category ?? "misc",
    runtimeDisabled: feature.agent?.runtimeDisabled ?? true,
    ...(feature.agent?.defaultInjectAsSection === undefined
      ? {}
      : { defaultInjectAsSection: feature.agent.defaultInjectAsSection }),
    ...(feature.libraryHidden ? { libraryHidden: true } : {}),
    modeAllowlist: feature.modes,
    defaultTools: [],
    defaultSettings: feature.agent?.defaultSettings ?? {},
    defaultPromptTemplate: feature.agent?.defaultPromptTemplate ?? "",
    execution: feature.agent?.execution ?? "feature",
  };
  const agentsBuffer = Buffer.from(`${JSON.stringify([agentDefinition], null, 2)}\n`);
  const serverPath = join(sourceDir, "server.mjs");
  const serverSourceRoot =
    feature.id === "hierarchical-maps" ? hierarchicalMapsSourceRoot : (feature.packageSourceRoot ?? sourceRoot);
  const serverSource = resolve(serverSourceRoot, feature.serverImport || feature.engineImport);
  if (!reuseExistingRuntime && existsSync(serverSource)) {
    await bundleServer(feature, serverPath);
  } else if (!existsSync(serverPath)) {
    throw new Error(`Missing package-owned server source for ${feature.id}`);
  }
  const serverBuffer = await readFile(serverPath);
  const hasClient = Boolean(
    feature.clientName ||
    feature.clientImport ||
    feature.id === "hierarchical-maps" ||
    feature.id === "conversation-calls",
  );
  const clientPath = hasClient ? join(sourceDir, "client.js") : null;
  if (clientPath && (!reuseExistingRuntime || rebuiltFeatureClients.has(feature.id))) {
    if (feature.clientName) await bundleGameClient(feature, clientPath);
    else await bundleSpecialClient(feature, clientPath);
  } else if (clientPath && !existsSync(clientPath)) {
    throw new Error(`Missing package-owned client source for ${feature.id}`);
  }
  const clientBuffer = clientPath ? await readFile(clientPath) : null;
  const assetPayloads = await Promise.all(
    (feature.assetPaths ?? []).map(async (assetPath) => {
      const assetFile = resolve(sourceDir, assetPath);
      if (assetFile !== sourceDir && !assetFile.startsWith(`${sourceDir}${sep}`)) {
        throw new Error(`Unsafe package asset path for ${feature.id}: ${assetPath}`);
      }
      return { path: assetPath, buffer: await readFile(assetFile) };
    }),
  );
  await writeFile(join(sourceDir, "agents.json"), agentsBuffer);
  const boundary = boundariesByFeatureId.get(feature.id) ?? null;
  const manifest = {
    schemaVersion: boundary ? 2 : 1,
    ...(boundary
      ? {
          capabilityApi: boundary.capabilityApi,
          builtAgainst: boundary.builtAgainst,
        }
      : {}),
    id: feature.id,
    name: feature.name,
    version,
    description,
    ...(feature.localizations ? { localizations: feature.localizations } : {}),
    engine: {
      min: feature.minEngineVersion ?? MIN_ENGINE_VERSION,
      maxExclusive: feature.maxEngineExclusive ?? MAX_ENGINE_EXCLUSIVE,
    },
    kind: feature.kind,
    entrypoints: {
      agents: "agents.json",
      server: "server.mjs",
      ...(clientBuffer ? { client: "client.js" } : {}),
    },
    ...(feature.clientName
      ? {
          contributions: {
            slots: ["conversation-surface"],
            conversationGame: {
              command: feature.command,
              aliases: feature.aliases,
              playerLabel: feature.playerLabel,
            },
          },
        }
      : feature.contributions
        ? {
            contributions: feature.contributions,
          }
        : feature.id === "hierarchical-maps"
          ? {
              contributions: {
                agentDetail: { agentIds: ["hierarchical-maps"] },
                slots: ["chat-settings", "spatial-workspace", "chat-runtime", "game-world-map"],
              },
            }
          : feature.id === "conversation-calls"
            ? {
                contributions: {
                  slots: ["conversation-toolbar", "conversation-surface", "chat-settings"],
                },
              }
            : {}),
    files: [
      {
        path: "agents.json",
        sha256: sha256(agentsBuffer),
        bytes: agentsBuffer.byteLength,
      },
      {
        path: "server.mjs",
        sha256: sha256(serverBuffer),
        bytes: serverBuffer.byteLength,
      },
      ...(clientBuffer
        ? [
            {
              path: "client.js",
              sha256: sha256(clientBuffer),
              bytes: clientBuffer.byteLength,
            },
          ]
        : []),
      ...assetPayloads.map((asset) => ({
        path: asset.path,
        sha256: sha256(asset.buffer),
        bytes: asset.buffer.byteLength,
      })),
    ],
    permissions: feature.permissions,
    restartRequired: true,
  };
  await writeFile(join(sourceDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeEnglishPackageLocale(sourceDir, manifest, [agentDefinition]);

  const temporary = await mkdtemp(join(tmpdir(), `marinara-feature-${feature.id}-`));
  try {
    await writeFile(join(temporary, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    await writeFile(join(temporary, "agents.json"), agentsBuffer);
    await writeFile(join(temporary, "server.mjs"), serverBuffer);
    if (clientBuffer) await writeFile(join(temporary, "client.js"), clientBuffer);
    for (const asset of assetPayloads) {
      const destination = resolve(temporary, asset.path);
      if (destination !== temporary && !destination.startsWith(`${temporary}${sep}`)) {
        throw new Error(`Unsafe package asset path for ${feature.id}: ${asset.path}`);
      }
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, asset.buffer);
    }
    const artifactFiles = [
      "manifest.json",
      "agents.json",
      "server.mjs",
      ...(clientBuffer ? ["client.js"] : []),
      ...assetPayloads.map((asset) => asset.path),
    ];
    const artifactName = `${feature.id}-${version}.zip`;
    const artifactPath = join(artifactsDir, artifactName);
    await rm(artifactPath, { force: true });
    // Deterministic store-only zip (same module the Pixelforge build uses):
    // byte-stable across machines and requires no system `zip` binary, so the
    // feature build runs on Windows dev machines too.
    const artifact = createDeterministicZip(
      await Promise.all(
        artifactFiles.map(async (artifactFile) => ({
          name: artifactFile,
          data: await readFile(join(temporary, artifactFile)),
        })),
      ),
    );
    await writeFile(artifactPath, artifact);
    catalog.packages.push({
      manifest,
      category: feature.category ?? "misc",
      iconUrl: catalogArtworkUrl(feature.id),
      artifact: {
        url: `https://raw.githubusercontent.com/Pasta-Devs/Marinara-Agents/main/artifacts/${basename(artifactPath)}`,
        sha256: sha256(artifact),
        bytes: artifact.byteLength,
      },
      documentationUrl:
        feature.id === "hierarchical-maps"
          ? "https://github.com/Pasta-Devs/Marinara-Engine/blob/main/docs/agents/hierarchical-maps.md"
          : feature.id === "noodle"
            ? "https://github.com/Pasta-Devs/Marinara-Agents/blob/main/packages/noodle/README.md"
            : feature.id === "slurp"
              ? "https://github.com/Pasta-Devs/Marinara-Agents/blob/main/packages/slurp/README.md"
              : `https://github.com/Pasta-Devs/Marinara-Agents#${feature.id}`,
    });
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

catalog.packages.sort((left, right) => left.manifest.name.localeCompare(right.manifest.name));
// generatedAt is resolved centrally in writeCatalogFamily (preserved by
// default; refreshed only when MARINARA_CATALOG_STAMP_GENERATED_AT=1).
await writeCatalogFamily(repoRoot, catalog);
