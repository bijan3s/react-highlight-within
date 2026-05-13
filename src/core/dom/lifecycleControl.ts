import type { ControlHighlightState, HighlightableControl } from "./types";
import { controlHighlightStates } from "./types";
import { CONTROL_ATTRIBUTE, CONTROL_OVERLAY_ATTRIBUTE } from "./constants";
import type { DomHighlightOptions } from "./optionsDom";
import {
  syncControlOverlay,
  restoreControlAppearance,
} from "./appearanceControl";
import { shouldHighlightControl } from "./visibility";

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
  overlay.style.zIndex = "1";

  content.style.position = "relative";
  content.style.boxSizing = "border-box";

  overlay.append(content);

  return { overlay, content };
};

export const attachControlHighlight = (
  control: HighlightableControl,
  options: DomHighlightOptions,
): void => {
  if (controlHighlightStates.has(control)) {
    syncControlOverlay(control, options);
    return;
  }

  const parent = control.parentElement;

  if (!parent) {
    return;
  }

  const { overlay, content } = createOverlayElements(control);
  const restoreInlinePosition = parent.style.position;

  if (
    control.ownerDocument.defaultView?.getComputedStyle(parent).position ===
    "static"
  ) {
    parent.style.position = "relative";
  }

  parent.append(overlay);

  const state: ControlHighlightState = {
    overlay,
    content,
    parent,
    syncOverlay: () => syncControlOverlay(control, options),
    handleInput: () => syncControlOverlay(control, options),
    handleScroll: () => syncControlOverlay(control, options),
    restoreInlineColor: control.style.color,
    restoreInlineCaretColor: control.style.caretColor,
    restoreInlinePosition,
    restoreInlineTextFillColor: control.style.getPropertyValue(
      "-webkit-text-fill-color",
    ),
  };

  controlHighlightStates.set(control, state);
  control.setAttribute(CONTROL_ATTRIBUTE, "true");
  control.addEventListener("input", state.handleInput);
  control.addEventListener("scroll", state.handleScroll);

  if (typeof ResizeObserver !== "undefined") {
    state.resizeObserver = new ResizeObserver(state.syncOverlay);
    state.resizeObserver.observe(control);
  }

  syncControlOverlay(control, options);
};

export const clearControlHighlights = (root: HTMLElement): void => {
  const controls = Array.from(
    root.querySelectorAll<HighlightableControl>(
      `[${CONTROL_ATTRIBUTE}='true']`,
    ),
  );

  controls.forEach((control) => {
    const state = controlHighlightStates.get(control);

    if (!state) {
      control.removeAttribute(CONTROL_ATTRIBUTE);
      return;
    }

    control.removeEventListener("input", state.handleInput);
    control.removeEventListener("scroll", state.handleScroll);
    state.resizeObserver?.disconnect();
    restoreControlAppearance(control);

    if (state.overlay.parentNode) {
      state.overlay.parentNode.removeChild(state.overlay);
    }

    state.parent.style.position = state.restoreInlinePosition;
    control.removeAttribute(CONTROL_ATTRIBUTE);
    controlHighlightStates.delete(control);
  });

  Array.from(
    root.querySelectorAll<HTMLElement>(`[${CONTROL_OVERLAY_ATTRIBUTE}='true']`),
  ).forEach((overlay) => {
    overlay.remove();
  });
};

export const applyControlHighlights = (
  root: HTMLElement,
  options: DomHighlightOptions,
): void => {
  const controls = Array.from(
    root.querySelectorAll<HighlightableControl>("input, textarea"),
  );

  controls.forEach((control) => {
    if (!shouldHighlightControl(control, options, root)) {
      return;
    }

    attachControlHighlight(control, options);
  });
};
