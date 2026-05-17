/**
 * Data-attributes and selectors that mark up the DOM artifacts this library
 * injects. Every attribute is namespaced to `data-highlight-within-*` so
 * (a) consumers can target them in CSS/queries and (b) the cleanup pass
 * can find and remove exactly what we added.
 */

/** Stamped on every injected `<mark>`. */
export const HIGHLIGHT_ATTRIBUTE = "data-highlight-within";

/** Stamped on the underlying `<input>`/`<textarea>` while an overlay is attached. */
export const CONTROL_ATTRIBUTE = "data-highlight-within-control";

/** Stamped on the absolutely-positioned overlay `<div>` paired with a control. */
export const CONTROL_OVERLAY_ATTRIBUTE =
  "data-highlight-within-control-overlay";

/** Stamped on the inline wrapper we use for bidirectional isolation around text nodes. */
export const BIDI_WRAPPER_ATTRIBUTE = "data-highlight-within-bidi";

/**
 * `<input type="...">` values we'll paint an overlay over. Excludes types
 * that don't render free-form text (e.g. `password`, `number`, `checkbox`,
 * `file`, `date`) — overlaying those would either leak secrets or misalign.
 */
export const SUPPORTED_INPUT_TYPES = new Set([
  "",
  "text",
  "search",
  "email",
  "url",
  "tel",
]);

/**
 * Selector for elements whose subtree we never walk. Combines three groups:
 *   1. Inert / non-text content (`script`, `style`, `noscript`, `template`,
 *      `svg`, `canvas`, `iframe`)
 *   2. Controls with their own text rendering we shouldn't touch
 *      (`select`/`option`, `contenteditable`)
 *   3. Artifacts we've already injected — prevents double-wrapping on the
 *      next pass and lets idempotent re-renders stay fast.
 */
export const SKIPPED_SELECTOR = [
  "select",
  "option",
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "canvas",
  "iframe",
  `[${HIGHLIGHT_ATTRIBUTE}='true']`,
  `[${CONTROL_OVERLAY_ATTRIBUTE}='true']`,
  `[${BIDI_WRAPPER_ATTRIBUTE}='true']`,
  "[contenteditable='']",
  "[contenteditable='true']",
].join(",");
