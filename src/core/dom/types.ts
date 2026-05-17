/**
 * Shared types for the form-control overlay path. Exports the
 * `ControlStateMap` shape plus a `createControlStateMap()` factory so each
 * `HighlightEngine` instance can own its own bookkeeping — no module-level
 * singleton, no chance of two instances fighting over the same controls.
 */

/** The two element types the overlay path knows how to mirror. */
export type HighlightableControl = HTMLInputElement | HTMLTextAreaElement;

/**
 * Per-control bookkeeping captured at attach time and consumed at detach.
 * Stored in the engine's `ControlStateMap` keyed by the control itself.
 *
 * The `restoreInline*` fields snapshot the pre-existing inline styles we
 * mutate (color, caret-color, background, position, z-index,
 * -webkit-text-fill-color) so cleanup can put them back exactly —
 * preserving any explicit styles the consumer set on their input.
 */
export interface ControlHighlightState {
  /** Absolutely-positioned `<div>` that floats over the control. */
  overlay: HTMLDivElement;
  /** Inner `<div>` that holds the highlighted text fragment. */
  content: HTMLDivElement;
  /** Direct parent of the control — overlay is appended here, and its `position` may be flipped to `relative`. */
  parent: HTMLElement;
  /** Re-runs the geometry/content sync (also fires from ResizeObserver). */
  syncOverlay: () => void;
  /** Bound `input` listener — wakes the overlay on user typing. */
  handleInput: () => void;
  /** Bound `scroll` listener — keeps the overlay aligned when the control scrolls. */
  handleScroll: () => void;
  /** Observer that re-syncs when the control's box changes size. */
  resizeObserver?: ResizeObserver;
  /** Pending rAF id used to keep ResizeObserver callbacks out of the resize loop. */
  resizeAnimationFrame?: number;
  /** Original inline `color` to restore on detach. */
  restoreInlineColor: string;
  /** Original inline `caret-color` to restore on detach. */
  restoreInlineCaretColor: string;
  /** Original inline `background` to restore on detach. */
  restoreInlineBackground: string;
  /** Original inline `position` of the control — we may set it to `relative`. */
  restoreInlineControlPosition: string;
  /** Original inline `z-index` of the control — we lift it above the overlay. */
  restoreInlineControlZIndex: string;
  /** Original inline `position` of the *parent* — we may have set it to `relative`. */
  restoreInlinePosition: string;
  /** Original inline `-webkit-text-fill-color` to restore on detach. */
  restoreInlineTextFillColor: string;
}

/** Per-engine map of `HighlightableControl` → its overlay state. */
export type ControlStateMap = WeakMap<HighlightableControl, ControlHighlightState>;

/** Factory — each `HighlightEngine` instance calls this once for its own map. */
export const createControlStateMap = (): ControlStateMap => new WeakMap();
