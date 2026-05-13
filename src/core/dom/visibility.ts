import type { HighlightableControl } from "./types";
import type { DomHighlightOptions } from "./optionsDom";
import { SKIPPED_SELECTOR, SUPPORTED_INPUT_TYPES } from "./constants";

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

    if (
      computedStyle &&
      (computedStyle.display === "none" ||
        computedStyle.visibility === "hidden")
    ) {
      return false;
    }

    if (current === root) {
      return true;
    }

    current = current.parentElement;
  }

  return true;
};

export const shouldProcessTextNode = (
  node: Text,
  root: HTMLElement,
): boolean => {
  if (!node.data.trim()) {
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

export const collectTextNodes = (root: HTMLElement): Text[] => {
  const walker = root.ownerDocument.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) =>
        shouldProcessTextNode(node as Text, root)
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

const isSupportedInput = (element: HTMLInputElement): boolean =>
  SUPPORTED_INPUT_TYPES.has(element.type.toLowerCase());

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
