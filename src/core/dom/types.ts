export type HighlightableControl = HTMLInputElement | HTMLTextAreaElement;

export interface ControlHighlightState {
  overlay: HTMLDivElement;
  content: HTMLDivElement;
  parent: HTMLElement;
  syncOverlay: () => void;
  handleInput: () => void;
  handleScroll: () => void;
  resizeObserver?: ResizeObserver;
  restoreInlineColor: string;
  restoreInlineCaretColor: string;
  restoreInlinePosition: string;
  restoreInlineTextFillColor: string;
}

export const controlHighlightStates = new WeakMap<
  HighlightableControl,
  ControlHighlightState
>();
