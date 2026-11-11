import { sceneErrorMessage } from "./scene-error-message.js";

export type SceneErrorDiagnostic = { id: string; details: string };
export type SceneErrorReportItem = {
  id: string;
  title: string;
  message: string;
  diagnosticId?: string;
  fields?: { label: string; value: string }[];
};

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
