import type { HighlightOptions } from "../highlightOptions";
import { findTextMatches, hasSearchTerm } from "../findTextMatches";

import { HIGHLIGHT_ATTRIBUTE } from "./constants";
import { createHighlightMark, unwrapMark } from "./textFragments";
import { collectTextNodes } from "./visibility";

const highlightTextNode = (
  textNode: Text,
  options: HighlightOptions,
  search: string,
): number => {
  const matches = findTextMatches(textNode.data, search, options.caseSensitive);

  if (matches.length === 0) {
    return 0;
  }

  let matchCount = 0;

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const match = matches[index];
    const matchingNode = textNode.splitText(match.start);

    matchingNode.splitText(match.end - match.start);
    matchingNode.parentNode?.replaceChild(
      createHighlightMark(textNode.ownerDocument, matchingNode.data, options),
      matchingNode,
    );

    matchCount += 1;
  }

  return matchCount;
};

export const clearTextNodeHighlights = (root: HTMLElement): void => {
  const marks = Array.from(
    root.querySelectorAll<HTMLElement>(`mark[${HIGHLIGHT_ATTRIBUTE}='true']`),
  );

  marks.forEach(unwrapMark);
  root.normalize();
};

export const applyTextNodeHighlights = (
  root: HTMLElement,
  options: HighlightOptions,
): number => {
  if (!hasSearchTerm(options.search)) {
    return 0;
  }

  return collectTextNodes(root).reduce(
    (matchCount, textNode) =>
      matchCount + highlightTextNode(textNode, options, options.search ?? ""),
    0,
  );
};
