/**
 * @deprecated Legacy v1 helper. Kept for backwards compatibility — new
 * code should use `<HighlightWithin>` directly. This wrapper just renders
 * the modern component, so behavior is identical aside from the JSX shape.
 */

import type { ReactNode } from "react";

import { hasSearchTerm } from "../core/findTextMatches";
import {
  HighlightWithin,
  type HighlightWithinOptions,
} from "./HighlightWithin";

/**
 * @deprecated Use `<HighlightWithin>` instead.
 *
 * Wraps `element` in `<HighlightWithin>` when a search term is present;
 * returns the element untouched otherwise (avoids a needless re-render
 * cycle for the no-op case).
 */
export const highlightWithin = (
  element: ReactNode,
  options: HighlightWithinOptions = {},
): ReactNode => {
  if (!hasSearchTerm(options.search)) {
    return element;
  }

  return <HighlightWithin {...options}>{element}</HighlightWithin>;
};

export default highlightWithin;
