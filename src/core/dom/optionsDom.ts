/**
 * Extends the shared `HighlightOptions` with flags only the DOM layer
 * cares about — the per-control opt-ins for native form elements.
 */

import type { HighlightOptions } from "../highlightOptions";

export interface DomHighlightOptions extends HighlightOptions {
  /** Opt in to overlay highlighting for text-bearing `<input>` elements. */
  highlightInput?: boolean;
  /** Opt in to overlay highlighting for `<textarea>` elements. */
  highlightTextarea?: boolean;
}
