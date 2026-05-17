/**
 * Rendered-text highlight path. Walks the live DOM under `root`, splits
 * each eligible text node around its matches, and wraps every match in a
 * `<mark>` (the parent text node sits inside a neutral bidi wrapper to keep
 * mixed-direction text rendering correctly).
 *
 * Cleanup is the inverse: unwrap every `<mark>` and bidi wrapper we added,
 * then `normalize()` to merge the freshly-adjacent text nodes back into
 * one — leaving the DOM byte-identical to its pre-highlight state.
 */

import type { HighlightOptions } from "../highlightOptions";
import {
  compileSearchRegex,
  findTextMatchesWithRegex,
  hasSearchTerm,
} from "../findTextMatches";

import { BIDI_WRAPPER_ATTRIBUTE, HIGHLIGHT_ATTRIBUTE } from "./constants";
import {
  createBidiWrapper,
  createHighlightMark,
  unwrapElement,
} from "./textFragments";
import { collectTextNodes } from "./visibility";

/**
 * Splits a single text node around its matches and wraps each match in a
 * `<mark>`. Iterates matches in *reverse* — earlier indices stay valid
 * even after later ones are removed by `splitText`. Returns the number of
 * matches replaced.
 */
const highlightTextNode = (
  textNode: Text,
  options: HighlightOptions,
  regex: RegExp,
): number => {
  const matches = findTextMatchesWithRegex(textNode.data, regex);

  if (matches.length === 0) {
    return 0;
  }

  const originalParent = textNode.parentNode;

  if (!originalParent) {
    return 0;
  }

  const wrapper = createBidiWrapper(textNode.ownerDocument);

  originalParent.replaceChild(wrapper, textNode);
  wrapper.appendChild(textNode);

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

/**
 * Removes every `<mark data-highlight-within="true">` and
 * `[data-highlight-within-bidi="true"]` under `root`, then calls
 * `root.normalize()` so adjacent text nodes (left behind by unwrap)
 * collapse back into single nodes.
 */
export const clearTextNodeHighlights = (root: HTMLElement): void => {
  const marks = Array.from(
    root.querySelectorAll<HTMLElement>(`mark[${HIGHLIGHT_ATTRIBUTE}='true']`),
  );

  marks.forEach(unwrapElement);

  const wrappers = Array.from(
    root.querySelectorAll<HTMLElement>(`[${BIDI_WRAPPER_ATTRIBUTE}='true']`),
  );

  wrappers.forEach(unwrapElement);

  root.normalize();
};

/**
 * Entry point for the rendered-text path. Compiles the search regex once,
 * then walks every eligible text node under `root` (see
 * `visibility.collectTextNodes`) and applies `highlightTextNode` to each.
 * Returns the total count of matches.
 */
export const applyTextNodeHighlights = (
  root: HTMLElement,
  options: HighlightOptions,
): number => {
  if (!hasSearchTerm(options.search)) {
    return 0;
  }

  const regex = compileSearchRegex(options.search, options.caseSensitive);

  return collectTextNodes(root).reduce(
    (matchCount, textNode) =>
      matchCount + highlightTextNode(textNode, options, regex),
    0,
  );
};
