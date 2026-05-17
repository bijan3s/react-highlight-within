import "@testing-library/jest-dom/vitest";

if (typeof ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;
}
