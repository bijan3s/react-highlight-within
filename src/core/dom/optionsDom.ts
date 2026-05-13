import type { HighlightOptions } from "../highlightOptions";

export interface DomHighlightOptions extends HighlightOptions {
  highlightInput?: boolean;
  highlightTextarea?: boolean;
}
