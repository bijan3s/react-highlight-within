import type { HighlightOptions } from "../highlightOptions";
import { findTextMatches, hasSearchTerm } from "../findTextMatches";

import { HIGHLIGHT_ATTRIBUTE } from "./constants";

const applyMarkStyles = (
  element: HTMLElement,
  options: HighlightOptions,
  fallbackTextColor = "#1C252E",
  preserveLayout = false,
): void => {
  const {
    textColor = fallbackTextColor,
    bgColor = "#FFD666",
    highlightStyle = {},
  } = options;

  Object.assign(element.style, {
    display: "inline",
    backgroundColor: bgColor,
    color: textColor,
    paddingLeft: preserveLayout ? "0" : "4px",
    paddingRight: preserveLayout ? "0" : "4px",
    borderRadius: "2px",
    border: "none",
    fontWeight: "inherit",
    fontStyle: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
  });

  Object.assign(element.style, highlightStyle);

  if (preserveLayout) {
    element.style.padding = "0";
  }
};

export const createHighlightMark = (
  document: Document,
  text: string,
  options: HighlightOptions,
  fallbackTextColor = "#1C252E",
  preserveLayout = false,
): HTMLElement => {
  const mark = document.createElement("mark");

  mark.setAttribute(HIGHLIGHT_ATTRIBUTE, "true");
  mark.textContent = text;
  applyMarkStyles(mark, options, fallbackTextColor, preserveLayout);

  return mark;
};

export const buildHighlightedFragment = (
  document: Document,
  text: string,
  options: HighlightOptions,
  fallbackTextColor = "#1C252E",
  preserveLayout = false,
): DocumentFragment | null => {
  const search = options.search;

  if (!hasSearchTerm(search)) {
    return null;
  }

  const matches = findTextMatches(text, search, options.caseSensitive);

  if (matches.length === 0) {
    return null;
  }

  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  matches.forEach((match) => {
    if (match.start > lastIndex) {
      fragment.append(
        document.createTextNode(text.slice(lastIndex, match.start)),
      );
    }

    fragment.append(
      createHighlightMark(
        document,
        match.text,
        options,
        fallbackTextColor,
        preserveLayout,
      ),
    );

    lastIndex = match.end;
  });

  if (lastIndex < text.length) {
    fragment.append(document.createTextNode(text.slice(lastIndex)));
  }

  return fragment;
};

export const unwrapMark = (mark: HTMLElement): void => {
  const parent = mark.parentNode;

  if (!parent) {
    return;
  }

  while (mark.firstChild) {
    parent.insertBefore(mark.firstChild, mark);
  }

  parent.removeChild(mark);
};
