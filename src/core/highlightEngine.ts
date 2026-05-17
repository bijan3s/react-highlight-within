/**
 * The framework-agnostic engine. One engine instance is created per
 * `HighlightWithin` mount and owns its own `ControlStateMap`, so two
 * engines wrapping overlapping DOM (e.g. via portals) can never trample
 * each other's per-control state.
 *
 * The engine exposes three calls:
 *   - `apply(options)` — paint matches under the root (text + controls).
 *   - `clear()` — undo everything previously painted; the DOM goes back
 *     to its pre-highlight byte-identical state.
 *   - `dispose()` — same as `clear()`, named for symmetry with mount/unmount.
 *
 * Re-entry (the engine mutates the DOM, which a parent `MutationObserver`
 * would otherwise re-detect) is *not* handled here — that's the React
 * adapter's job, by disconnecting its observer around `apply`/`clear` calls.
 */

import { hasSearchTerm } from "./findTextMatches";

import {
  applyControlHighlights,
  clearControlHighlights,
} from "./dom/lifecycleControl";
import { createControlStateMap } from "./dom/types";
import type { DomHighlightOptions } from "./dom/optionsDom";
import {
  applyTextNodeHighlights,
  clearTextNodeHighlights,
} from "./dom/textNodeHighlights";

export type { DomHighlightOptions } from "./dom/optionsDom";

export interface HighlightEngine {
  /** Paints matches under the engine's root. Returns the text-match count. */
  apply: (options: DomHighlightOptions) => number;
  /** Undoes every artifact previously painted. */
  clear: () => void;
  /** Tear down — currently identical to `clear`, named for lifecycle symmetry. */
  dispose: () => void;
}

/**
 * Builds a fresh engine bound to `root`. Each engine owns its own per-
 * control state map; multiple engines never share state.
 */
export const createHighlightEngine = (root: HTMLElement): HighlightEngine => {
  const states = createControlStateMap();

  const clear: HighlightEngine["clear"] = () => {
    clearControlHighlights(root, states);
    clearTextNodeHighlights(root);
  };

  const apply: HighlightEngine["apply"] = (options) => {
    if (!hasSearchTerm(options.search)) {
      return 0;
    }

    applyControlHighlights(root, options, states);

    return applyTextNodeHighlights(root, options);
  };

  return {
    apply,
    clear,
    dispose: clear,
  };
};
