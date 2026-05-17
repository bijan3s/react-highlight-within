/**
 * Lifecycle management for the form-control overlay path. You can't put a
 * `<mark>` inside an `<input>` — inputs render plain strings, not HTML —
 * so this module attaches an absolutely-positioned `<div>` highlight layer
 * behind each input/textarea, makes the input's own background transparent, and
 * keeps the layer in sync with input/scroll/resize events.
 *
 * Per-control bookkeeping (overlay node, listeners, original styles) lives
 * in the `ControlStateMap` owned by the engine that called these helpers,
 * threaded through every function as an explicit parameter.
 *
 * Sync of the overlay's visible content lives in `appearanceControl`.
 */

import type {
  ControlHighlightState,
  ControlStateMap,
  HighlightableControl,
} from "./types";
import { CONTROL_ATTRIBUTE, CONTROL_OVERLAY_ATTRIBUTE } from "./constants";
import type { DomHighlightOptions } from "./optionsDom";
import {
  syncControlOverlay,
  restoreControlAppearance,
} from "./appearanceControl";
import { shouldHighlightControl } from "./visibility";

/**
 * Builds the empty overlay `<div>` and its inner content `<div>`. Geometry
 * and typography are applied later by `syncControlOverlay` once we have
 * the control's computed style.
 */
const createOverlayElements = (
  control: HighlightableControl,
): Pick<ControlHighlightState, "overlay" | "content"> => {
  const overlay = control.ownerDocument.createElement("div");
  const content = control.ownerDocument.createElement("div");

  overlay.setAttribute(CONTROL_OVERLAY_ATTRIBUTE, "true");
  overlay.style.position = "absolute";
  overlay.style.pointerEvents = "none";
  overlay.style.overflow = "hidden";
  overlay.style.boxSizing = "border-box";
  overlay.style.background = "transparent";
  overlay.style.zIndex = "0";

  content.style.position = "relative";
  content.style.boxSizing = "border-box";

  overlay.append(content);

  return { overlay, content };
};

/**
 * Attaches an overlay to a single control. Idempotent — if the control
 * already has state in `states`, just re-syncs instead of re-attaching.
 * Also flips the parent's `position` to `relative` if it was `static`,
 * so the absolute overlay anchors correctly.
 */
export const attachControlHighlight = (
  control: HighlightableControl,
  options: DomHighlightOptions,
  states: ControlStateMap,
): void => {
  if (states.has(control)) {
    syncControlOverlay(control, options, states);
    return;
  }

  const parent = control.parentElement;

  if (!parent) {
    return;
  }

  const { overlay, content } = createOverlayElements(control);
  const restoreInlinePosition = parent.style.position;

  const parentPosition =
    control.ownerDocument.defaultView?.getComputedStyle(parent).position;

  if (!parentPosition || parentPosition === "static") {
    parent.style.position = "relative";
  }

  parent.append(overlay);

  const state: ControlHighlightState = {
    overlay,
    content,
    parent,
    syncOverlay: () => syncControlOverlay(control, options, states),
    handleInput: () => syncControlOverlay(control, options, states),
    handleScroll: () => syncControlOverlay(control, options, states),
    restoreInlineColor: control.style.color,
    restoreInlineCaretColor: control.style.caretColor,
    restoreInlineBackground: control.style.background,
    restoreInlineControlPosition: control.style.position,
    restoreInlineControlZIndex: control.style.zIndex,
    restoreInlinePosition,
    restoreInlineTextFillColor: control.style.getPropertyValue(
      "-webkit-text-fill-color",
    ),
  };

  states.set(control, state);
  control.setAttribute(CONTROL_ATTRIBUTE, "true");
  control.addEventListener("input", state.handleInput);
  control.addEventListener("scroll", state.handleScroll);

  if (typeof ResizeObserver !== "undefined") {
    state.resizeObserver = new ResizeObserver(() => {
      const view = control.ownerDocument.defaultView;

      if (!view?.requestAnimationFrame) {
        state.syncOverlay();
        return;
      }

      if (state.resizeAnimationFrame !== undefined) {
        return;
      }

      state.resizeAnimationFrame = view.requestAnimationFrame(() => {
        state.resizeAnimationFrame = undefined;
        state.syncOverlay();
      });
    });
    state.resizeObserver.observe(control);
  }

  syncControlOverlay(control, options, states);
};

/**
 * Detaches every overlay under `root`. For each tracked control: removes
 * listeners, disconnects the ResizeObserver, restores original inline
 * styles (color, caret-color, parent position, -webkit-text-fill-color),
 * removes the overlay node, and clears the state entry. Also sweeps any
 * orphaned overlay nodes that lost their state record.
 */
export const clearControlHighlights = (
  root: HTMLElement,
  states: ControlStateMap,
): void => {
  const controls = Array.from(
    root.querySelectorAll<HighlightableControl>(
      `[${CONTROL_ATTRIBUTE}='true']`,
    ),
  );

  controls.forEach((control) => {
    const state = states.get(control);

    if (!state) {
      control.removeAttribute(CONTROL_ATTRIBUTE);
      return;
    }

    control.removeEventListener("input", state.handleInput);
    control.removeEventListener("scroll", state.handleScroll);
    state.resizeObserver?.disconnect();
    if (state.resizeAnimationFrame !== undefined) {
      control.ownerDocument.defaultView?.cancelAnimationFrame(
        state.resizeAnimationFrame,
      );
    }
    restoreControlAppearance(control, states);

    if (state.overlay.parentNode) {
      state.overlay.parentNode.removeChild(state.overlay);
    }

    state.parent.style.position = state.restoreInlinePosition;
    control.removeAttribute(CONTROL_ATTRIBUTE);
    states.delete(control);
  });

  Array.from(
    root.querySelectorAll<HTMLElement>(`[${CONTROL_OVERLAY_ATTRIBUTE}='true']`),
  ).forEach((overlay) => {
    overlay.remove();
  });
};

/**
 * Entry point for the form-control path. Finds every `<input>` and
 * `<textarea>` under `root`, filters them through `shouldHighlightControl`
 * (respecting the `highlightInput` / `highlightTextarea` opt-ins and
 * supported input types), and attaches an overlay to each.
 */
export const applyControlHighlights = (
  root: HTMLElement,
  options: DomHighlightOptions,
  states: ControlStateMap,
): void => {
  const controls = Array.from(
    root.querySelectorAll<HighlightableControl>("input, textarea"),
  );

  controls.forEach((control) => {
    if (!shouldHighlightControl(control, options, root)) {
      return;
    }

    attachControlHighlight(control, options, states);
  });
};
