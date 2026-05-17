/**
 * Thin React adapter around the framework-agnostic core in `src/core`.
 *
 * Two render modes:
 *   - Default — renders an `as`-tagged wrapper with `display: contents`
 *     (zero layout impact) and observes that wrapper.
 *   - `asChild` (Radix-style) — clones the single child element and
 *     injects our ref; no wrapper at all.
 *
 * On mount we create a `HighlightEngine` bound to the root and a
 * `MutationObserver` watching it. Either:
 *   (a) options change — the effect re-runs and we re-apply, or
 *   (b) something else mutates the DOM (React re-render, third-party
 *       script, devtools) — the observer wakes us and we re-apply.
 *
 * Re-entry from our own mutations is handled by disconnecting the
 * observer before each apply/clear and reconnecting after.
 *
 * `children` is intentionally *not* in the effect's deps array — the
 * observer covers content updates, so we don't pay for a full DOM walk on
 * every parent render.
 */

import type {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
} from "react";
import {
  Children,
  cloneElement,
  createElement,
  useLayoutEffect,
  useRef,
} from "react";

import {
  createHighlightEngine,
  type HighlightEngine,
} from "../core/highlightEngine";
import type { HighlightOptions } from "../core/highlightOptions";

/**
 * Props for `HighlightWithin`. Extends the standard HTML attributes of the
 * wrapper element (minus `children`, which is required here) plus the
 * shared `HighlightOptions` and two opt-in flags for native form controls.
 */
export interface HighlightWithinProps
  extends Omit<HTMLAttributes<HTMLElement>, "children">, HighlightOptions {
  /** Tag name to render as the wrapper. Defaults to `"div"`. Ignored when `asChild` is set. */
  as?: keyof HTMLElementTagNameMap;
  /** Subtree to highlight inside. With `asChild`, must be a single React element. */
  children: ReactNode;
  /** When `true`, also paints a synced overlay over text-bearing `<input>`s. */
  highlightInput?: boolean;
  /** When `true`, also paints a synced overlay over `<textarea>`s. */
  highlightTextarea?: boolean;
  /**
   * Radix-style — clone the single React element child and attach the
   * highlight ref to it directly, with no wrapper in the layout. Throws
   * if `children` is not exactly one React element.
   */
  asChild?: boolean;
}

/** All `HighlightWithinProps` except `children` — used by the legacy helper. */
export type HighlightWithinOptions = Omit<HighlightWithinProps, "children">;

const assignRef = <T,>(ref: Ref<T> | undefined, value: T | null): void => {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    (ref as RefObject<T | null>).current = value;
  }
};

/** Merges multiple refs into one callback. Used by `asChild` to keep a
 *  consumer's ref on the child working while we attach ours too. */
const mergeRefs = <T,>(...refs: Array<Ref<T> | undefined>) =>
  (value: T | null): void => {
    refs.forEach((ref) => assignRef(ref, value));
  };

/**
 * Component-first search highlighting. Walks the rendered subtree on
 * mount, on option changes, and on any post-mount DOM mutation via
 * `MutationObserver`. Wraps matches in `<mark>` tags; for opted-in form
 * controls it paints a synchronized transparent-text overlay instead.
 *
 * Tip: memoize `highlightStyle` if you pass it — passing a fresh object
 * literal each render will defeat the MutationObserver-based change
 * detection and re-trigger the effect every render.
 */
export const HighlightWithin = ({
  as = "div",
  children,
  search,
  textColor,
  bgColor,
  caseSensitive,
  highlightStyle,
  markClassName,
  highlightInput,
  highlightTextarea,
  asChild,
  style,
  ...restProps
}: HighlightWithinProps) => {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const engine: HighlightEngine = createHighlightEngine(root);
    let scheduled = false;

    const applyNow = () => {
      observer.disconnect();
      engine.clear();
      engine.apply({
        search,
        textColor,
        bgColor,
        caseSensitive,
        highlightStyle,
        markClassName,
        highlightInput,
        highlightTextarea,
      });
      observer.observe(root, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    };

    const schedule = () => {
      if (scheduled) {
        return;
      }

      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        applyNow();
      });
    };

    const observer = new MutationObserver(schedule);

    applyNow();

    return () => {
      observer.disconnect();
      engine.dispose();
    };
  }, [
    bgColor,
    caseSensitive,
    highlightInput,
    highlightStyle,
    highlightTextarea,
    markClassName,
    search,
    textColor,
  ]);

  if (asChild) {
    const child = Children.only(children) as ReactElement<{
      ref?: Ref<HTMLElement>;
    }>;
    const childRef = (child as unknown as { ref?: Ref<HTMLElement> }).ref;

    return cloneElement(child, {
      ref: mergeRefs<HTMLElement>(rootRef, childRef),
    });
  }

  return createElement(
    as,
    {
      ...restProps,
      ref: rootRef,
      style: {
        display: "contents",
        ...style,
      },
    },
    children,
  );
};

export default HighlightWithin;
