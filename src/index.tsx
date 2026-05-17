/**
 * Public API entry — re-exports the modern component, the deprecated
 * function wrapper, and the shared option types.
 *
 * New code should prefer `HighlightWithin`. `highlightWithin` and the
 * default export are kept only for compatibility with v1 consumers.
 */

export type { HighlightOptions } from "./core/highlightOptions";
export {
  HighlightWithin,
  type HighlightWithinProps,
  type HighlightWithinOptions,
} from "./react/HighlightWithin";
export { highlightWithin } from "./react/legacyHighlightWithin";
export { default } from "./react/legacyHighlightWithin";
