import { build as bundle, transform as convert, formatMessages } from "esbuild";

/** A completed bundle is usable only when esbuild has no unresolved diagnostics. */
export async function build(options) {
  return rejectWarnings(await bundle({ ...options, logLevel: "silent" }));
}

export async function transform(source, options) {
  return rejectWarnings(await convert(source, { ...options, logLevel: "silent" }));
}

async function rejectWarnings(result) {
  if (result.warnings.length)
    throw new Error((await formatMessages(result.warnings, { kind: "warning", color: false })).join("\n"));
  return result;
}
