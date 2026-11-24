/**
 * Markdown formatting for a plain <textarea>. Uses `insertText` so the browser's
 * native undo/redo keeps working after toolbar actions.
 */

export type Format =
  | "h2"
  | "h3"
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "link"
  | "quote"
  | "ul"
  | "ol"
  | "task"
  | "codeblock"
  | "table"
  | "hr";

export function insertText(el: HTMLTextAreaElement, text: string, selectStart?: number, selectEnd?: number) {
  el.focus();
  const start = el.selectionStart;
  // execCommand is deprecated but is still the only way to keep the native undo stack.
  const ok = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
  if (!ok) {
    el.setRangeText(text, el.selectionStart, el.selectionEnd, "end");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  if (selectStart !== undefined) {
    el.setSelectionRange(start + selectStart, start + (selectEnd ?? selectStart));
  }
}

function wrap(el: HTMLTextAreaElement, before: string, after: string, placeholder: string) {
  const { selectionStart: s, selectionEnd: e, value } = el;
  const selected = value.slice(s, e) || placeholder;
  insertText(el, `${before}${selected}${after}`, before.length, before.length + selected.length);
}

/** Prefix every selected line (or the current line). */
function prefixLines(el: HTMLTextAreaElement, prefix: (i: number) => string) {
  const { value } = el;
  const lineStart = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
  const nextNl = value.indexOf("\n", el.selectionEnd);
  const lineEnd = nextNl === -1 ? value.length : nextNl;
  el.setSelectionRange(lineStart, lineEnd);
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const text = lines.map((l, i) => prefix(i) + l.replace(/^(#{1,6} |> |- \[ \] |- |\d+\. )/, "")).join("\n");
  insertText(el, text);
}

/** Insert a block on its own lines. */
function block(el: HTMLTextAreaElement, text: string, cursorOffset?: number) {
  const { value, selectionStart: s } = el;
  const needsBefore = s > 0 && value[s - 1] !== "\n" ? "\n\n" : s > 1 && value[s - 2] !== "\n" ? "\n" : "";
  insertText(el, `${needsBefore}${text}\n`, needsBefore.length + (cursorOffset ?? text.length));
}

export function applyFormat(el: HTMLTextAreaElement, f: Format) {
  switch (f) {
    case "h2":
      return prefixLines(el, () => "## ");
    case "h3":
      return prefixLines(el, () => "### ");
    case "bold":
      return wrap(el, "**", "**", "bold text");
    case "italic":
      return wrap(el, "_", "_", "italic text");
    case "strike":
      return wrap(el, "~~", "~~", "struck text");
    case "code":
      return wrap(el, "`", "`", "code");
    case "link": {
      const { selectionStart: s, selectionEnd: e, value } = el;
      const label = value.slice(s, e) || "link text";
      const text = `[${label}](https://)`;
      return insertText(el, text, label.length + 3, label.length + 11);
    }
    case "quote":
      return prefixLines(el, () => "> ");
    case "ul":
      return prefixLines(el, () => "- ");
    case "ol":
      return prefixLines(el, (i) => `${i + 1}. `);
    case "task":
      return prefixLines(el, () => "- [ ] ");
    case "codeblock": {
      const sel = el.value.slice(el.selectionStart, el.selectionEnd);
      return block(el, "```ts\n" + (sel || "") + "\n```", 6);
    }
    case "table":
      return block(el, "| Column | Column |\n| --- | --- |\n| Cell | Cell |", 2);
    case "hr":
      return block(el, "---");
  }
}

export const shortcuts: Record<string, Format> = { b: "bold", i: "italic", k: "link", e: "code" };
