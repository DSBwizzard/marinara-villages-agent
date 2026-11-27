// Villages — the Engine's own inline markdown, read into nodes.
//
// A villager writes the way the Engine's roleplay characters write: *what they
// do* in one asterisk, **what they insist on** in two. The tab drew those
// characters literally, so an action arrived with its asterisks still on it —
// and the answer is not a dialect invented here but the Engine's own reader
// (`packages/client/src/lib/markdown.tsx`, `applyInlineMarkdown`, and the
// `INLINE_MD_RE` in `packages/client/src/lib/inline-markdown-regex.ts` that
// drives it), because the whole point of it is that a village reads like a
// roleplay and not like a chat about one.
//
// It is a copy rather than an import for the reason `villages-chat-paragraphs.ts`
// is a copy of the Engine's paragraph splitter: a capability package cannot reach
// into the Engine's own `src` — `engine-boundary.json`'s `privateEngineImports`
// is empty and stays empty — so agreement between the two is a fact to be proven
// by `tests/villages-markdown.regression.ts` rather than assumed.
//
// It hands back NODES rather than React elements on purpose. A module with no
// JSX in it can be executed by a regression, and the rule set is the half of this
// that goes wrong quietly: an italic rule that eats the asterisks of a footnote,
// an underscore rule that breaks `snake_case_name` in half, or a link rule that
// accepts a `javascript:` target are all mistakes that look like nothing at all
// in a screenshot. The translation from nodes to elements lives in the entry,
// where the tab's own class names are.
//
// What is deliberately not here, and what it costs: the Engine's reader also
// resolves `card://` asset URLs, converts LaTeX symbols to their typographic
// forms, decodes encoded HTML entities, and lifts block-level markdown —
// headings, lists, tables, fenced code, blockquotes — out of the text before the
// inline reader ever sees it. A village has no card assets and none of the Engine
// settings those paths read, and the reading card shows one paragraph at a time
// inside a height-capped box, so a table drawn there would be the one thing in
// the card that cannot be read. This is the inline half; a villager who writes a
// bullet list gets the bullets they typed.
//
// ponytail: the ceiling is "inline emphasis, and nothing that needs a line of its
// own". The upgrade path is the Engine's `renderMarkdownBlocks` plus the
// `.mari-md-*` block rules, ported whole — and it should be ported whole rather
// than in pieces, because the block rules are what the Engine's own stylesheet
// scopes to `.mari-message-content`, which this tab is not.

/** The inline syntax a villager may rely on. Every value is one tag in the entry. */
export type VillagesMarkdownStyle = "italic" | "bold" | "bold-italic" | "underline" | "strikethrough" | "highlight";

/**
 * One piece of a villager's line.
 *
 * `code` and `link` are leaves rather than styled runs because the Engine
 * refuses to read markdown inside either: a backtick span is literal by
 * definition, and the text of a link is a label rather than prose.
 */
export type VillagesMarkdownNode =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "link"; text: string; href: string }
  | { kind: "styled"; style: VillagesMarkdownStyle; children: VillagesMarkdownNode[] };

/**
 * The Engine's own alternation, in its own order, with two deliberate changes.
 *
 * The order is the whole trick and is not cosmetic: bold-italic has to be tested
 * before bold, or `***three***` is read as `**` around `*three*`; and the two
 * italic rules carry lookarounds so `*three*` is not read out of `**three**` and
 * so `snake_case_name` is left alone.
 *
 * 1  Backslash escape   `\X`
 * 2  Link               `[text](url)`
 * 3  Inline code        `` `code` ``
 * 4  Highlight          `==text==`
 * 5  Strikethrough      `~~text~~`
 * 6  Bold-italic        `***text***`
 * 7  Bold               `**text**`
 * 8  Underline          `__text__`
 * 9  Italic             `*text*`
 * 10 Italic             `_text_`
 *
 * What changed: the image branch is gone (a village has no card assets, and an
 * `<img>` the model asked for is a request to the open internet from the player's
 * machine), and link targets are narrowed from the Engine's `https?://`,
 * `card://` and `/api/` to the web alone. Both omissions make a piece of syntax
 * render as the characters that were typed, which is what this file exists to
 * stop — so the trade is stated here rather than discovered later.
 */
const INLINE_MD_SOURCE =
  "\\\\([-\\\\*_~`#|>!=\\[\\]{}])" +
  "|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)" +
  "|`([^`\\n]+)`" +
  "|==(.+?)==" +
  "|~~(.+?)~~" +
  "|\\*\\*\\*(.+?)\\*\\*\\*" +
  "|\\*\\*(.+?)\\*\\*" +
  "|__(.+?)__" +
  "|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)" +
  "|(?<![_\\w])_([^_]+?)_(?![_\\w])";

/**
 * How deep nesting is read before the rest is left as text.
 *
 * The Engine's own ceiling. A model can emit a line of nothing but asterisks and
 * the reader recurses once per pair, so this is the thing that keeps a malformed
 * line from being a hang rather than a paragraph.
 */
const MAX_INLINE_DEPTH = 6;

/** One pass of the reader. Regexes carry `lastIndex`, so each pass gets its own. */
function readInline(source: string, depth: number): VillagesMarkdownNode[] {
  if (depth > MAX_INLINE_DEPTH) return [{ kind: "text", text: source }];

  const nodes: VillagesMarkdownNode[] = [];
  // A fresh regex per pass, because a `g` regex carries `lastIndex` across
  // calls and a nested pass would otherwise resume where its parent stopped.
  const regex = new RegExp(INLINE_MD_SOURCE, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Text is appended to the run already open rather than pushed beside it, so
  // that a line broken up by escapes reads back as the words it is — `\*a\*`
  // is one piece of text, not three, and the drawn line has no seams in it.
  const pushText = (value: string) => {
    const open = nodes[nodes.length - 1];
    if (open?.kind === "text") {
      nodes[nodes.length - 1] = { kind: "text", text: open.text + value };
      return;
    }
    nodes.push({ kind: "text", text: value });
  };

  while ((match = regex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      pushText(source.slice(lastIndex, match.index));
    }

    if (match[1] != null) {
      // An escaped character is the character. This is what lets a villager
      // write about `*` at all.
      pushText(match[1]);
    } else if (match[2] != null && match[3] != null) {
      nodes.push({ kind: "link", text: match[2], href: match[3] });
    } else if (match[4] != null) {
      nodes.push({ kind: "code", text: match[4] });
    } else if (match[5] != null) {
      nodes.push({ kind: "styled", style: "highlight", children: readInline(match[5], depth + 1) });
    } else if (match[6] != null) {
      nodes.push({ kind: "styled", style: "strikethrough", children: readInline(match[6], depth + 1) });
    } else if (match[7] != null) {
      nodes.push({ kind: "styled", style: "bold-italic", children: readInline(match[7], depth + 1) });
    } else if (match[8] != null) {
      nodes.push({ kind: "styled", style: "bold", children: readInline(match[8], depth + 1) });
    } else if (match[9] != null) {
      nodes.push({ kind: "styled", style: "underline", children: readInline(match[9], depth + 1) });
    } else if (match[10] != null || match[11] != null) {
      // The two italic spellings differ only in which character opens them.
      nodes.push({
        kind: "styled",
        style: "italic",
        children: readInline((match[10] ?? match[11])!, depth + 1),
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    pushText(source.slice(lastIndex));
  }

  return nodes;
}

/**
 * Read one villager's line into the pieces the tab draws it from.
 *
 * The result is never empty for non-empty input: text that carries no markdown
 * comes back as one `text` node, which is the case this is called in by far the
 * most often and the case that must stay free of surprises.
 */
export function parseVillagesInlineMarkdown(text: string): VillagesMarkdownNode[] {
  return readInline(text, 0);
}
