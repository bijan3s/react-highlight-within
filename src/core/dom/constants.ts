export const HIGHLIGHT_ATTRIBUTE = "data-highlight-within";
export const CONTROL_ATTRIBUTE = "data-highlight-within-control";
export const CONTROL_OVERLAY_ATTRIBUTE =
  "data-highlight-within-control-overlay";

export const SUPPORTED_INPUT_TYPES = new Set([
  "",
  "text",
  "search",
  "email",
  "url",
  "tel",
]);

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
  "[contenteditable='']",
  "[contenteditable='true']",
].join(",");
