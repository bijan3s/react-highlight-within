/**
 * Shared factory for the actual `<mark>` / bidi wrapper DOM bits both paths
 * inject. The rendered-text path calls `createHighlightMark` while
 * splitting live text nodes; the control-overlay path calls
 * `buildHighlightedFragment` to render the input's `value` from scratch.
 *
 * `unwrapElement` is the inverse used by cleanup: move a wrapper's
 * children up to its parent and remove the wrapper itself.
 */

import type { HighlightOptions } from "../highlightOptions";
import {
  compileSearchRegex,
  findTextMatchesWithRegex,
  hasSearchTerm,
} from "../findTextMatches";
import { DEFAULT_BG_COLOR, DEFAULT_TEXT_COLOR } from "../defaults";

import { BIDI_WRAPPER_ATTRIBUTE, HIGHLIGHT_ATTRIBUTE } from "./constants";

/**
 * Creates a neutral inline wrapper around a split text run. It isolates the
 * run from surrounding content, but inherits the parent direction; using
 * `<bdi>` would default to `dir=auto` and can flip explicitly-RTL content
 * when the first strong character in the run is Latin.
 */
export const createBidiWrapper = (document: Document): HTMLElement => {
  const wrapper = document.createElement("span");

  wrapper.setAttribute(BIDI_WRAPPER_ATTRIBUTE, "true");
  Object.assign(wrapper.style, {
    direction: "inherit",
    display: "inline",
    unicodeBidi: "isolate",
  });

  return wrapper;
};

/**
 * Applies the visual style for a highlight `<mark>`.
 *
 * - When `options.markClassName` is set: assigns the className and skips
 *   the built-in color/background/padding inline defaults. Consumer's CSS
 *   fully owns the styling. `highlightStyle` still overlays inline.
 * - Otherwise: applies the standard inline defaults (text/bg color,
 *   padding, radius, font inheritance) — those win over external CSS.
 *
 * `preserveLayout` is set by the overlay path so the mark's side-padding
 * doesn't push text out of alignment with the input underneath; that's
 * forced inline last so it overrides any className-driven padding too.
 */
const applyMarkStyles = (
  element: HTMLElement,
  options: HighlightOptions,
  fallbackTextColor = DEFAULT_TEXT_COLOR,
  preserveLayout = false,
): void => {
  if (options.markClassName) {
    element.className = options.markClassName;
  } else {
    const {
      textColor = fallbackTextColor,
      bgColor = DEFAULT_BG_COLOR,
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
  }

  if (options.highlightStyle) {
    Object.assign(element.style, options.highlightStyle);
  }

  if (preserveLayout) {
    element.style.padding = "0";
  }
};

/**
 * Creates a single styled `<mark data-highlight-within="true">` containing
 * the matched substring. `fallbackTextColor` lets the overlay path inherit
 * the control's computed color when the consumer didn't set `textColor`.
 */
export const createHighlightMark = (
  document: Document,
  text: string,
  options: HighlightOptions,
  fallbackTextColor = DEFAULT_TEXT_COLOR,
  preserveLayout = false,
): HTMLElement => {
  const mark = document.createElement("mark");

  mark.setAttribute(HIGHLIGHT_ATTRIBUTE, "true");
  mark.textContent = text;
  applyMarkStyles(mark, options, fallbackTextColor, preserveLayout);

  return mark;
};

/**
 * Builds a `DocumentFragment` of the form
 *   `<span>text<mark>match</mark>text<mark>match</mark>text</span>`
 * for the given `text` string. Returns `null` when there's nothing to
 * highlight, so callers can branch cheaply on a falsy result. Used by the
 * overlay path; the text-node path mutates live nodes instead.
 */
export const buildHighlightedFragment = (
  document: Document,
  text: string,
  options: HighlightOptions,
  fallbackTextColor = DEFAULT_TEXT_COLOR,
  preserveLayout = false,
): DocumentFragment | null => {
  const search = options.search;

  if (!hasSearchTerm(search)) {
    return null;
  }

  const regex = compileSearchRegex(search, options.caseSensitive);
  const matches = findTextMatchesWithRegex(text, regex);

  if (matches.length === 0) {
    return null;
  }

  const fragment = document.createDocumentFragment();
  const wrapper = createBidiWrapper(document);
  let lastIndex = 0;

  matches.forEach((match) => {
    if (match.start > lastIndex) {
      wrapper.append(
        document.createTextNode(text.slice(lastIndex, match.start)),
      );
    }

    wrapper.append(
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
    wrapper.append(document.createTextNode(text.slice(lastIndex)));
  }

  fragment.append(wrapper);

  return fragment;
};

/**
 * Inverse of any wrap operation — moves an element's children up to its
 * parent in place, then removes the (now-empty) element. Used by cleanup
 * to undo both `<mark>` wraps and bidi wrapper spans.
 */
export const unwrapElement = (element: HTMLElement): void => {
  const parent = element.parentNode;

  if (!parent) {
    return;
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
};

/** @deprecated Alias for `unwrapElement`. Kept for symmetry/back-compat. */
export const unwrapMark = unwrapElement;
