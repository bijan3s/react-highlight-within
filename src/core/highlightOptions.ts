/**
 * Shared option shape consumed by both the React layer and the
 * framework-agnostic core. Anything that controls *what* or *how* matches
 * are visually rendered lives here; per-control flags live in
 * `DomHighlightOptions` so the core engine can stay UI-framework agnostic.
 */

import type { CSSProperties } from "react";

export interface HighlightOptions {
  /**
   * Literal text or a `RegExp` to find. When a string is passed, regex
   * specials are escaped automatically. When a `RegExp` is passed, the
   * `caseSensitive` option is ignored — the regex's own `i` flag is
   * authoritative — and the global `g` flag is added if missing.
   */
  search?: string | RegExp;
  /** Text color for highlighted marks. Defaults to `DEFAULT_TEXT_COLOR`. */
  textColor?: string;
  /** Background color for highlighted marks. Defaults to `DEFAULT_BG_COLOR`. */
  bgColor?: string;
  /** Match case-exactly when `true`. Ignored if `search` is a `RegExp`. */
  caseSensitive?: boolean;
  /** Extra CSS applied to each `<mark>` — overlays atop the defaults / className. */
  highlightStyle?: CSSProperties;
  /**
   * When set, each mark gets this `className` AND the built-in inline color/
   * background/padding defaults are skipped — your CSS owns the styling.
   * `highlightStyle` still overlays on top.
   */
  markClassName?: string;
}
