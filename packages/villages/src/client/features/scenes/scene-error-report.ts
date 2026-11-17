import { sceneErrorCategory, sceneErrorCause, sceneErrorMessage } from "./scene-error-message.js";

export type SceneErrorDiagnostic = { id: string; details: string };
export type SceneErrorReportItem = {
  id: string;
  title: string;
  message: string;
  diagnosticId?: string;
  fields?: { label: string; value: string }[];
};

const shareableStages = new Set([
  "admission",
  "scene-layout",
  "scene-response",
  "writing-request",
  "writing-completion",
  "greeting-reply",
  "turn-reply",
  "greet",
  "turn",
  "move",
  "close",
  "running",
  "interrupted",
  "complete",
]);
const reportAreas: Readonly<Record<string, string>> = {
  room: "Scene request",
  request: "Scene request",
  operation: "Saved request",
  greeting: "Opening",
  "opening-notice": "Opening",
  "reply-recovery": "Reply recovery",
  reading: "Playback",
  narration: "Saving a reply",
  diagnostics: "Saved changes",
};

export function anonymousSceneErrorReport(items: SceneErrorReportItem[]) {
  return [
    "Villages Scene error report",
    ...items.slice(0, 8).map((item) => {
      const id = item.id.split(":")[0]!;
      const area = Object.hasOwn(reportAreas, id) ? reportAreas[id] : "Scene controls";
      const category = sceneErrorCategory(sceneErrorCause(item.message)) ?? "The action did not finish.";
      const context = (item.fields ?? [])
        .filter((field) => field.label === "Stage" || field.label === "Status")
        .map(({ label, value }) => ({ label, value: value.split(":")[0]! }))
        .filter(({ value }) => shareableStages.has(value))
        .map(({ label, value }) => `${label}: ${value}`);
      return [`${area}: ${category}`, ...context].join("\n");
    }),
    "\nWhat I was trying to do:",
  ].join("\n");
}

/** Keep exact errors and request identities in the copied report, outside the player message. */
export function sceneErrorReport(
  items: SceneErrorReportItem[],
  diagnostics: SceneErrorDiagnostic[] = [],
  unavailable = "",
) {
  const shared =
    items[0]?.fields?.filter((field) =>
      items.every((item) => item.fields?.some((other) => other.label === field.label && other.value === field.value)),
    ) ?? [];
  return [
    "Villages Scene errors",
    ...shared.map((field) => `${field.label}: ${field.value}`),
    ...items.map((item, index) =>
      [
        `\n${index + 1}. ${sceneErrorMessage(item.message)}`,
        `Source: ${item.title}`,
        `Original error: ${item.message}`,
        ...(item.fields ?? [])
          .filter((field) => !shared.some((common) => common.label === field.label && common.value === field.value))
          .map((field) => `${field.label}: ${field.value}`),
        ...(item.diagnosticId
          ? [
              diagnostics.find((row) => row.id === item.diagnosticId)?.details ??
                `Saved details unavailable: ${unavailable || "the saved error no longer matches this request or attempt"}`,
            ]
          : []),
      ].join("\n"),
    ),
  ].join("\n");
}
