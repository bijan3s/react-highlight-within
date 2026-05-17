/**
 * Visual sync helpers for the form-control overlay path. Given a control
 * that's already been wired up by `lifecycleControl.attachControlHighlight`,
 * these helpers:
 *   1. Position and size the overlay over the control (geometry)
 *   2. Copy typography (font, alignment, direction, white-space, …) so
 *      the overlay text aligns pixel-perfectly with the control's text
 *   3. Render transparent mirrored text with visible match backgrounds
 *   4. Put the control above the highlight layer so caret/selection remain native
 *
 * `restoreControlAppearance` is the inverse for cleanup.
 *
 * Both exported functions take the engine's `ControlStateMap` as an
 * explicit parameter — no module-level singleton.
 */

import type { ControlStateMap, HighlightableControl } from "./types";
import type { DomHighlightOptions } from "./optionsDom";
import { buildHighlightedFragment } from "./textFragments";

const CONTROL_HIGHLIGHT_Y_OFFSET = 2;
const CONTROL_HIGHLIGHT_X_OFFSET = 1;
const CONTROL_DEFAULT_BG_COLOR = "#8a5306";

/**
 * Positions the highlight layer so it covers the control exactly —
 * accounting for the parent's scroll position and border. Padding,
 * border-radius, and background are mirrored so the layer looks like the
 * control's own paint underneath a transparent control background.
 */
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
  overlay.style.background = computedStyle.background || "transparent";
};

/**
 * Copies the control's typography onto the overlay content so glyphs align.
 * `<textarea>` wraps (`pre-wrap` + word-break) while `<input>` is single-
 * line (`pre` + no break). The CSS transform offsets the inner content by
 * the control's scroll position so highlights track as the user scrolls.
 */
const applyOverlayContentStyles = (
  control: HighlightableControl,
  content: HTMLDivElement,
  computedStyle: CSSStyleDeclaration,
): void => {
  Object.assign(content.style, {
    color: "transparent",
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
    transform: `translate(${CONTROL_HIGHLIGHT_X_OFFSET - control.scrollLeft}px, ${
      CONTROL_HIGHLIGHT_Y_OFFSET - control.scrollTop
    }px)`,
  });
};

/** Keeps only match backgrounds visible in the mirror layer. */
const tuneControlHighlightMarks = (
  content: HTMLDivElement,
  options: DomHighlightOptions,
): void => {
  const useControlDefaultBackground =
    !options.markClassName &&
    options.bgColor === undefined &&
    options.highlightStyle?.backgroundColor === undefined;

  Array.from(content.querySelectorAll<HTMLElement>("mark")).forEach((mark) => {
    mark.style.color = "transparent";
    mark.style.webkitTextFillColor = "transparent";
    mark.style.verticalAlign = "baseline";

    if (useControlDefaultBackground) {
      mark.style.backgroundColor = CONTROL_DEFAULT_BG_COLOR;
    }
  });
};

/**
 * Restores the control's own paint — sets background, positioning, z-index,
 * and legacy text-hiding styles back to the values captured at attach time.
 * Called by cleanup, and at the top of every `syncControlOverlay` so the
 * "no matches" branch can short-circuit cleanly.
 */
export const restoreControlAppearance = (
  control: HighlightableControl,
  states: ControlStateMap,
): void => {
  const state = states.get(control);

  if (!state) {
    return;
  }

  control.style.color = state.restoreInlineColor;
  control.style.caretColor = state.restoreInlineCaretColor;
  control.style.background = state.restoreInlineBackground;
  control.style.position = state.restoreInlineControlPosition;
  control.style.zIndex = state.restoreInlineControlZIndex;

  if (state.restoreInlineTextFillColor) {
    control.style.setProperty(
      "-webkit-text-fill-color",
      state.restoreInlineTextFillColor,
    );
    return;
  }

  control.style.removeProperty("-webkit-text-fill-color");
};

/**
 * Re-renders the overlay for one control. The hot path called from the
 * `input`, `scroll`, and `ResizeObserver` listeners — must be cheap.
 *
 * Flow:
 *   1. Restore the control's text (cheap idempotent reset)
 *   2. Build the highlighted fragment from `control.value`
 *   3. If there are no matches, hide the overlay and bail
 *   4. Otherwise: re-sync geometry + typography, swap in the fragment,
 *      then make only the control background transparent while lifting the
 *      native text, caret, and selection above the highlight layer.
 */
export const syncControlOverlay = (
  control: HighlightableControl,
  options: DomHighlightOptions,
  states: ControlStateMap,
): void => {
  const state = states.get(control);

  if (!state) {
    return;
  }

  restoreControlAppearance(control, states);

  const computedStyle =
    control.ownerDocument.defaultView?.getComputedStyle(control);

  if (!computedStyle) {
    return;
  }

  const fragment = buildHighlightedFragment(
    control.ownerDocument,
    control.value,
    options,
    undefined,
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
  tuneControlHighlightMarks(state.content, options);

  if (!computedStyle.position || computedStyle.position === "static") {
    control.style.position = "relative";
  }

  control.style.zIndex = "1";
  control.style.background = "transparent";
};
