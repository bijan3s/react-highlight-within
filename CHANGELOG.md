# Changelog

All notable changes to `react-highlight-within` are documented here.

---

## [3.0.0] — 2026-05-17

### Overview

Complete rework of the v2 DOM engine. Every known issue from v2 was addressed: performance, RTL/LTR layout corruption, and broken form-control highlighting. The public React API is a superset of v2 — existing props continue to work.

### New features

- **`asChild` mode** — Radix-style prop that clones the single React child and attaches the highlight ref directly to it, producing zero wrapper nodes in the DOM.
- **`markClassName` prop** — Opt-in CSS class applied to every `<mark>`. When set, the built-in inline color/background defaults are skipped so your stylesheet owns all styling; `highlightStyle` still overlays on top.
- **`RegExp` search** — `search` now accepts a `RegExp` in addition to a string. When a regex is passed, `caseSensitive` is ignored and the regex's own `i` flag is authoritative; the `g` flag is added automatically if missing.
- **`HighlightEngine` factory** — A `createHighlightEngine(root)` factory replaces the previous stateless `applyDomHighlights` / `clearDomHighlights` pair. Each engine instance owns a private `ControlStateMap` so multiple engines wrapping overlapping DOM (e.g. via portals) can never trample each other's per-control state.
- **`display: contents` wrapper** — The default wrapper element now uses `display: contents`, making it invisible to the layout engine and eliminating the stray block box that v2 always injected.
- **Full test suite** — Integration tests (`HighlightWithin`, control overlay, regex) and unit tests (`findTextMatches`, `textFragments`, `visibility`) added.

### Bug fixes

- **RTL / LTR layout corruption (fixed)** — v2 split text nodes directly, which caused the browser to re-evaluate text direction and could flip RTL words when the first strong character of the leftover run happened to be Latin. v3 wraps every split run in a `<span>` with `direction: inherit; unicode-bidi: isolate`, preserving the parent direction unconditionally.
- **`<input>` and `<textarea>` highlighting (fixed)** — v2 attempted to highlight inside native form controls but the implementation was incomplete and unreliable. v3 attaches an absolutely-positioned transparent-background overlay `<div>` behind each opted-in control, mirrors the control's computed typography and geometry into the overlay, and keeps them in sync via `input`, `scroll`, and `resize` event listeners. The parent's `position` is flipped to `relative` automatically if it was `static`.
- **Re-entry / infinite observer loop (fixed)** — v2 did not guard against the `MutationObserver` detecting its own DOM mutations and triggering re-application. v3 disconnects the observer before every `apply` / `clear` and reconnects after, and additionally batches concurrent callbacks through a single `queueMicrotask` so rapid successive mutations produce exactly one re-application.
- **Multiple-engine state collision (fixed)** — Per-control bookkeeping (overlay node, original styles, event listeners) is now stored in an engine-scoped `ControlStateMap` threaded explicitly through all helpers, so two `<HighlightWithin>` trees with overlapping DOM cannot corrupt each other's overlay state.

### Breaking changes

- The internal `highlightDom` module and its `applyDomHighlights` / `clearDomHighlights` exports are removed. Replace with `createHighlightEngine`.
- `HighlightOptions.search` is now `string | RegExp` instead of `string`. Existing string values are unaffected.

---

## [2.0.0] — 2026-05-13

### Overview

Full architecture rewrite. v1 operated purely at the React-parent-tree level, meaning any text that was not directly visible in the parent JSX — text passed as props, text injected by third-party libraries, text that arrived after mount, text inside children — was invisible to it. v2 moved highlighting down to the live DOM using `MutationObserver`-driven re-application, making it work on all rendered text regardless of how it got there.

### New features

- **DOM-level text-node walking** — Highlights are now applied by walking live DOM text nodes under the root element rather than by traversing the React element tree. Text from any source (direct JSX, prop drilling, portals, third-party widgets) is found and wrapped.
- **`HighlightWithin` React component** — New primary API. Renders a configurable wrapper element (`as` prop, default `"div"`) with a `useLayoutEffect` that manages highlight lifecycle.
- **`MutationObserver` sync** — After initial application, a `MutationObserver` watches the subtree for `childList` and `characterData` changes and re-applies highlights on any mutation, keeping marks accurate as children update.
- **`highlightInput` / `highlightTextarea` flags** — Opt-in props to attempt highlighting inside `<input>` and `<textarea>` elements (see known issues below).
- **`legacyHighlightWithin` export** — The v1 React-tree function is preserved under this name for incremental migration.
- **Separate core modules** — Source split into focused modules: `findTextMatches`, `textNodeHighlights`, `appearanceControl`, `lifecycleControl`, `optionsDom`, `textFragments`, `visibility`, `constants`, `types`.

### Known issues in this release (resolved in v3)

- **Performance** — The observer was not guarded against re-entry: its own DOM mutations triggered additional callbacks, causing redundant and potentially unbounded re-application passes.
- **RTL / LTR layout** — Splitting text nodes without direction isolation corrupted bidirectional text; RTL words adjacent to a highlighted Latin match could be re-ordered by the browser.
- **`<input>` / `<textarea>` overlay** — The opt-in control highlighting was present but incomplete; overlays did not reliably track geometry or scroll position.

---

## [1.0.1] — 2025-11-13

### Bug fixes

- Improved text-processing logic and element-wrapping strategy for edge cases where split text nodes were not correctly reassembled.
- Switched the highlighted-match wrapper from a generic `<span>` to a `<mark>` element for better semantic meaning and default browser styling.

---

## [1.0.0] — 2025-11-11

### Initial release

A lightweight React utility for wrapping search matches in `<mark>` elements by traversing the React element tree at render time.

- **`highlightWithin(element, options)`** — Recursive function that walks a `ReactNode` tree and replaces text string matches with arrays of plain-text segments and `<mark>` nodes. Works by calling `React.cloneElement` on intermediate nodes to swap in processed children.
- **`HighlightOptions`** — `search`, `textColor`, `bgColor`, `caseSensitive`, `highlightStyle`.
- **Zero DOM side effects** — All work is done in the React render cycle; no imperative DOM mutations.

### Limitations (addressed in v2)

- Only text directly visible in the JSX tree is reached. Text passed as opaque props, injected by refs, or coming from third-party libraries that write to the DOM directly is not highlighted.
- Highlights are not kept in sync after mount; any post-render DOM change (dynamic children, lazy-loaded content) goes unnoticed.
