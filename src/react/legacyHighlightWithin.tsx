import type { ReactNode } from "react";
import React from "react";

import { hasSearchTerm } from "../core/findTextMatches";
import {
  HighlightWithin,
  type HighlightWithinOptions,
} from "./HighlightWithin";

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
