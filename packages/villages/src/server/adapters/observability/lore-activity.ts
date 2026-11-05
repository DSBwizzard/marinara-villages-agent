import { randomUUID } from "node:crypto";
import type {
  LoreActivityList,
  LoreInspection,
  LoreTrigger,
  LoreTriggerDetail,
  LoreUse,
} from "../../../shared/contracts/lore.js";
import { readLoreUse } from "../../../shared/helpers/lore.js";
import { badRequest } from "../../domain/rules/errors.js";
import type { RuntimeDebugPorts } from "./runtime-debug-service.js";

const PACKAGE = "villages",
  DOCUMENT = "villages-lore-activity",
  LIMIT = 200;
type Report = {
  id: string;
  scope: string;
  worldSeed: string;
  at: string;
  requestContext: string;
  purpose: string;
  revision: number;
  uses: { target: string; purpose: string; at: string; revision: number }[];
  entries: { id: string; bookId: string; name: string; bookName?: string; targets: string[]; trigger: LoreTrigger }[];
};
type History = {
  version: 1;
  scope: string;
  worldSeed: string;
  revision: number;
  cursors: Record<string, number>;
  reports: Report[];
};

/** Private creator evidence. Ordinary snapshots carry only opaque references. */
export function createLoreActivity(ports: Pick<RuntimeDebugPorts, "villagesDocuments" | "mutateDocument">) {
  async function access(change?: (history: History) => void | false) {
    const world = await ports.villagesDocuments().getById(PACKAGE, "villages-village");
    const worldSeed = (world?.data as { seed?: string } | undefined)?.seed ?? "";
    let result!: History;
    let fresh = false;
    await ports.mutateDocument<History>(
      DOCUMENT,
      {
        kind: "lore-activity",
        name: "Lore activity",
        description: "Private recent Lorebook request evidence.",
        label: () => "Lore activity",
        coerce(raw) {
          fresh = !raw;
          if (!raw) return { version: 1, scope: randomUUID(), worldSeed, revision: 0, cursors: {}, reports: [] };
          const history = raw as History;
          if (
            history.version !== 1 ||
            !Array.isArray(history.reports) ||
            history.reports.length > LIMIT ||
            !Number.isSafeInteger(history.revision)
          )
            throw new Error("Lore activity could not be read.");
          return structuredClone(history);
        },
      },
      (history) => {
        let changed = fresh;
        if (history.worldSeed !== worldSeed) {
          // The first founding binds its existing evidence; later worlds get their own scope.
          const prior = worldSeed ? history.reports.find((row) => row.worldSeed === worldSeed) : undefined;
          if (prior) history.scope = prior.scope;
          else if (history.worldSeed) history.scope = randomUUID();
          else for (const row of history.reports) if (row.scope === history.scope) row.worldSeed = worldSeed;
          history.worldSeed = worldSeed;
          changed = true;
        }
        if (change && change(history) !== false) changed = true;
        result = structuredClone(history);
        if (!changed) return false;
      },
    );
    return result;
  }

  async function rememberLoreInspection(report: LoreInspection): Promise<string | undefined> {
    const entries = report.entries
      .filter((entry) => entry.status === "included" && entry.trigger)
      .slice(0, 24)
      .map((entry) => {
        const reason = entry.trigger!;
        return {
          id: entry.id.slice(0, 160),
          bookId: entry.bookId.slice(0, 160),
          name: entry.name.slice(0, 160),
          ...(entry.bookName ? { bookName: entry.bookName.slice(0, 160) } : {}),
          targets: [],
          trigger: {
            constant: reason.constant,
            match: reason.match,
            ...(reason.key ? { key: reason.key.slice(0, 160) } : {}),
            caseSensitive: reason.caseSensitive,
            matchWholeWords: reason.matchWholeWords,
            ...(reason.context
              ? {
                  context: {
                    text: reason.context.text.slice(0, 500),
                    start: reason.context.start,
                    end: reason.context.end,
                    source: reason.context.source.slice(0, 100),
                  },
                }
              : {}),
            ...(reason.secondary
              ? {
                  secondary: {
                    logic: reason.secondary.logic,
                    matched: reason.secondary.matched,
                    total: reason.secondary.total,
                  },
                }
              : {}),
            ...(reason.secondaryMatches?.length
              ? {
                  secondaryMatches: reason.secondaryMatches.slice(0, 3).map((match) => ({
                    key: match.key.slice(0, 160),
                    text: match.text.slice(0, 500),
                    source: match.source.slice(0, 100),
                  })),
                }
              : {}),
          },
        };
      });
    if (!entries.length) return undefined;
    const id = report.inspectionId ?? randomUUID();
    await access((history) => {
      if (report.scope && report.scope !== history.scope) return false;
      if (history.reports.some((row) => row.id === id)) return false;
      history.reports.push({
        id,
        scope: history.scope,
        worldSeed: history.worldSeed,
        at: report.at ?? new Date().toISOString(),
        requestContext: report.requestContext?.slice(0, 1200) ?? "",
        purpose: report.purpose.slice(0, 160),
        revision: 0,
        uses: [],
        entries,
      });
      history.reports = history.reports.slice(-LIMIT);
    });
    const saved = await access();
    return saved.reports.some((row) => row.id === id && row.scope === saved.scope) ? id : undefined;
  }

  async function recordLoreUse(lore: readonly LoreUse[], purpose: string) {
    const entries = readLoreUse(lore);
    if (!entries.some((entry) => entry.inspections?.length)) return;
    await access((history) => {
      let changed = false;
      const groups = new Map<string, { id: string; target: string; entries: LoreUse[] }>();
      for (const entry of entries)
        for (const ref of entry.inspections ?? []) {
          const key = JSON.stringify([ref.id, ref.target]);
          if (!groups.has(key)) groups.set(key, { id: ref.id, target: ref.target, entries: [] });
          groups.get(key)!.entries.push(entry);
        }
      for (const ref of groups.values()) {
        const report = history.reports.find((row) => row.id === ref.id && row.scope === history.scope);
        if (!report || report.uses.some((use) => use.target === ref.target)) continue;
        const selected = report.entries.filter((row) =>
          ref.entries.some((entry) => row.id === entry.id && row.bookId === entry.bookId),
        );
        if (!selected.length) continue;
        for (const found of selected) found.targets.push(ref.target);
        report.revision = ++history.revision;
        history.cursors[history.scope] = report.revision;
        history.cursors = Object.fromEntries(Object.entries(history.cursors).slice(-LIMIT));
        report.uses.push({
          target: ref.target,
          purpose: purpose.slice(0, 160),
          at: new Date().toISOString(),
          revision: report.revision,
        });
        changed = true;
      }
      if (!changed) return false;
    });
  }

  async function readLoreActivity(summary = false): Promise<LoreActivityList> {
    const history = await access();
    return {
      scope: history.scope,
      revision: history.cursors[history.scope] ?? 0,
      records: summary
        ? []
        : history.reports
            .filter((row) => row.scope === history.scope && row.revision > 0)
            .flatMap((row) =>
              row.uses.map((use) => ({
                id: JSON.stringify([row.id, use.target]),
                at: use.at,
                purpose: use.purpose,
                revision: use.revision,
                entries: readLoreUse(
                  row.entries
                    .filter((entry) => entry.targets.includes(use.target))
                    .map((entry) => ({
                      ...entry,
                      targets: [use.target],
                      inspections: [{ target: use.target, id: row.id }],
                    })),
                ),
              })),
            )
            .sort((a, b) => b.revision - a.revision),
    };
  }

  async function readLoreTrigger(
    inspectionId: unknown,
    bookId: unknown,
    entryId: unknown,
    target?: unknown,
  ): Promise<LoreTriggerDetail> {
    if (
      typeof inspectionId !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/u.test(inspectionId) ||
      typeof bookId !== "string" ||
      !bookId ||
      bookId.length > 160 ||
      typeof entryId !== "string" ||
      !entryId ||
      entryId.length > 160
    )
      throw badRequest("Choose a recorded Lorebook entry.");
    if (target !== undefined && (typeof target !== "string" || target.length > 80))
      throw badRequest("Choose a recorded receiving request.");
    const history = await access();
    const report = history.reports.find((row) => row.id === inspectionId && row.scope === history.scope);
    const entry = report?.entries.find((row) => row.id === entryId && row.bookId === bookId);
    const use = report?.uses.find((use) => target === undefined || use.target === target);
    return entry && report
      ? {
          trigger: entry.trigger,
          at: use?.at ?? report.at,
          capturedAt: report.at,
          purpose: use?.purpose ?? report.purpose,
          requestContext: report.requestContext,
        }
      : { trigger: null };
  }
  return { rememberLoreInspection, recordLoreUse, readLoreActivity, readLoreTrigger };
}
