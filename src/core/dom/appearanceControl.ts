import type { HighlightableControl } from "./types";
import { controlHighlightStates } from "./types";
import type { DomHighlightOptions } from "./optionsDom";
import { buildHighlightedFragment } from "./textFragments";

const applyOverlayGeometry = (
  control: HighlightableControl,
  parent: HTMLElement,
  overlay: HTMLDivElement,
  computedStyle: CSSStyleDeclaration,
): void => {
  const controlRect = control.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  overlay.style.display = "block";
  overlay.style.top = `${
    controlRect.top - parentRect.top + parent.scrollTop - parent.clientTop
  }px`;
  overlay.style.left = `${
    controlRect.left - parentRect.left + parent.scrollLeft - parent.clientLeft
  }px`;
  overlay.style.width = `${controlRect.width}px`;
  overlay.style.height = `${controlRect.height}px`;
  overlay.style.paddingTop = computedStyle.paddingTop;
  overlay.style.paddingRight = computedStyle.paddingRight;
  overlay.style.paddingBottom = computedStyle.paddingBottom;
  overlay.style.paddingLeft = computedStyle.paddingLeft;
  overlay.style.borderRadius = computedStyle.borderRadius;
};

const applyOverlayContentStyles = (
  control: HighlightableControl,
  content: HTMLDivElement,
  computedStyle: CSSStyleDeclaration,
): void => {
  Object.assign(content.style, {
    color: computedStyle.color,
    fontFamily: computedStyle.fontFamily,
    fontSize: computedStyle.fontSize,
    fontStyle: computedStyle.fontStyle,
    fontWeight: computedStyle.fontWeight,
    letterSpacing: computedStyle.letterSpacing,
    lineHeight: computedStyle.lineHeight,
    textAlign: computedStyle.textAlign,
    textIndent: computedStyle.textIndent,
    textTransform: computedStyle.textTransform,
    unicodeBidi: computedStyle.unicodeBidi,
    direction: computedStyle.direction,
    whiteSpace: control instanceof HTMLTextAreaElement ? "pre-wrap" : "pre",
    wordBreak:
      control instanceof HTMLTextAreaElement
        ? computedStyle.wordBreak
        : "normal",
    overflowWrap:
      control instanceof HTMLTextAreaElement
        ? computedStyle.overflowWrap
        : "normal",
    width: control instanceof HTMLTextAreaElement ? "100%" : "max-content",
    minHeight: control instanceof HTMLTextAreaElement ? "100%" : "auto",
    transform: `translate(${-control.scrollLeft}px, ${-control.scrollTop}px)`,
  });
};

export const restoreControlAppearance = (
  control: HighlightableControl,
): void => {
  const state = controlHighlightStates.get(control);

  if (!state) {
    return;
  }

  control.style.color = state.restoreInlineColor;
  control.style.caretColor = state.restoreInlineCaretColor;

  if (state.restoreInlineTextFillColor) {
    control.style.setProperty(
      "-webkit-text-fill-color",
      state.restoreInlineTextFillColor,
    );
    return;
  }

  control.style.removeProperty("-webkit-text-fill-color");
};

export const syncControlOverlay = (
  control: HighlightableControl,
  options: DomHighlightOptions,
): void => {
  const state = controlHighlightStates.get(control);

  if (!state) {
    return;
  }

  restoreControlAppearance(control);

  const computedStyle =
    control.ownerDocument.defaultView?.getComputedStyle(control);

  if (!computedStyle) {
    return;
  }

  const fragment = buildHighlightedFragment(
    control.ownerDocument,
    control.value,
    options,
    computedStyle.color,
    true,
  );

  if (!fragment) {
    state.overlay.style.display = "none";
    state.content.replaceChildren();
    return;
  }

  applyOverlayGeometry(control, state.parent, state.overlay, computedStyle);
  applyOverlayContentStyles(control, state.content, computedStyle);
  state.content.replaceChildren(fragment);

  control.style.color = "transparent";
  control.style.caretColor = computedStyle.color;
  control.style.setProperty("-webkit-text-fill-color", "transparent");
};
