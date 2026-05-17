import type { HighlightableControl } from "./types";
import type { DomHighlightOptions } from "./optionsDom";
import { SKIPPED_SELECTOR, SUPPORTED_INPUT_TYPES } from "./constants";

/**
 * Returns whether `element` is visually rendered, by walking up the ancestor
 * chain to (and including) `root`. An ancestor counts as hiding if it sets
 * `hidden`, `aria-hidden="true"`, `display: none`, `visibility: hidden`,
 * or `opacity: 0`. Anything above `root` is out of scope and ignored.
 *
 * Used to skip text inside collapsed accordions, off-screen tabs, etc.
 * — highlighting invisible nodes would still mutate them, just for no benefit.
 */
export const isVisibleNode = (
  element: HTMLElement,
  root: HTMLElement,
): boolean => {
  let current: HTMLElement | null = element;

  while (current) {
    if (current.hidden || current.getAttribute("aria-hidden") === "true") {
      return false;
    }

    const computedStyle =
      current.ownerDocument.defaultView?.getComputedStyle(current);

    if (computedStyle) {
      if (
        computedStyle.display === "none" ||
        computedStyle.visibility === "hidden" ||
        parseFloat(computedStyle.opacity) === 0
      ) {
        return false;
      }
    }

    if (current === root) {
      return true;
    }

    current = current.parentElement;
  }

  return true;
};

/**
 * TreeWalker predicate — true when this node is a non-empty text node that
 * lives in a highlight-eligible position. Rejects:
 *   - non-Text nodes and whitespace-only text
 *   - text inside `SKIPPED_SELECTOR` ancestors (script/style/svg/canvas/
 *     iframe/contenteditable/already-highlighted nodes — see constants.ts)
 *   - text inside hidden ancestors (see `isVisibleNode`)
 */
export const shouldProcessTextNode = (
  node: Node,
  root: HTMLElement,
): boolean => {
  if (!(node instanceof Text) || !node.data.trim()) {
    return false;
  }

  const parent = node.parentElement;

  if (!parent) {
    return false;
  }

  if (parent.closest(SKIPPED_SELECTOR)) {
    return false;
  }

  return isVisibleNode(parent, root);
};

/**
 * Flattens every highlight-eligible text node under `root` into an array,
 * via a `TreeWalker` with `shouldProcessTextNode` as its filter. Returned
 * in document order so callers can split text nodes in reverse without
 * invalidating earlier indices.
 */
export const collectTextNodes = (root: HTMLElement): Text[] => {
  const walker = root.ownerDocument.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) =>
        shouldProcessTextNode(node, root)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    },
  );
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  return textNodes;
};

/** Limits `<input>` highlighting to text-bearing types — see `SUPPORTED_INPUT_TYPES`. */
const isSupportedInput = (element: HTMLInputElement): boolean =>
  SUPPORTED_INPUT_TYPES.has(element.type.toLowerCase());

/**
 * Whether an `<input>` or `<textarea>` should get the overlay treatment.
 * Requires the matching opt-in prop (`highlightInput` / `highlightTextarea`),
 * a visible position in the tree, and — for inputs — a supported `type`.
 */
export const shouldHighlightControl = (
  element: HighlightableControl,
  options: DomHighlightOptions,
  root: HTMLElement,
): boolean => {
  if (!isVisibleNode(element, root)) {
    return false;
  }

  if (element instanceof HTMLTextAreaElement) {
    return Boolean(options.highlightTextarea);
  }

  return Boolean(options.highlightInput) && isSupportedInput(element);
};
