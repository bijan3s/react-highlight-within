import { hasSearchTerm } from "./findTextMatches";

import {
  applyControlHighlights,
  clearControlHighlights,
} from "./dom/lifecycleControl";
import { HIGHLIGHT_ATTRIBUTE } from "./dom/constants";
import type { DomHighlightOptions } from "./dom/optionsDom";
import {
  applyTextNodeHighlights,
  clearTextNodeHighlights,
} from "./dom/textNodeHighlights";

export type { DomHighlightOptions } from "./dom/optionsDom";

export const clearDomHighlights = (root: HTMLElement): void => {
  clearControlHighlights(root);
  clearTextNodeHighlights(root);
};

export const applyDomHighlights = (
  root: HTMLElement,
  options: DomHighlightOptions,
): number => {
  if (!hasSearchTerm(options.search)) {
    return 0;
  }

  applyControlHighlights(root, options);

  return applyTextNodeHighlights(root, options);
};

export const highlightAttribute = HIGHLIGHT_ATTRIBUTE;
