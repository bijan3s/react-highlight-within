import type { CSSProperties } from "react";

export interface HighlightOptions {
  /** The text/pattern to highlight */
  search?: string;
  /** Text color for highlighted matches (default: '#1C252E') */
  textColor?: string;
  /** Background color for highlighted matches (default: '#FFD666') */
  bgColor?: string;
  /** Whether search should be case-sensitive (default: false) */
  caseSensitive?: boolean;
  /** Custom styles for highlight mark element */
  highlightStyle?: CSSProperties;
}
