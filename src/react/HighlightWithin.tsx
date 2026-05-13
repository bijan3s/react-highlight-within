import type { HTMLAttributes, ReactNode } from "react";
import React, { createElement, useLayoutEffect, useRef } from "react";

import { applyDomHighlights, clearDomHighlights } from "../core/highlightDom";
import type { HighlightOptions } from "../core/highlightOptions";
import { hasSearchTerm } from "../core/findTextMatches";

export interface HighlightWithinProps
  extends Omit<HTMLAttributes<HTMLElement>, "children">, HighlightOptions {
  as?: keyof HTMLElementTagNameMap;
  children: ReactNode;
  highlightInput?: boolean;
  highlightTextarea?: boolean;
}

export type HighlightWithinOptions = Omit<HighlightWithinProps, "children">;

export const HighlightWithin = ({
  as = "div",
  children,
  search,
  textColor,
  bgColor,
  caseSensitive,
  highlightStyle,
  highlightInput,
  highlightTextarea,
  style,
  ...restProps
}: HighlightWithinProps) => {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    clearDomHighlights(root);

    if (!hasSearchTerm(search)) {
      return () => {
        clearDomHighlights(root);
      };
    }

    applyDomHighlights(root, {
      search,
      textColor,
      bgColor,
      caseSensitive,
      highlightStyle,
      highlightInput,
      highlightTextarea,
    });

    return () => {
      clearDomHighlights(root);
    };
  }, [
    bgColor,
    caseSensitive,
    children,
    highlightInput,
    highlightTextarea,
    highlightStyle,
    search,
    textColor,
  ]);

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
