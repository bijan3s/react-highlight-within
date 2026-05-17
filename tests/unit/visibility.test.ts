import { afterEach, describe, expect, it } from "vitest";

import {
  collectTextNodes,
  isVisibleNode,
  shouldHighlightControl,
  shouldProcessTextNode,
} from "../../src/core/dom/visibility";

const setupRoot = (markup: string): HTMLElement => {
  document.body.innerHTML = "";
  const root = document.createElement("div");
  root.innerHTML = markup;
  document.body.appendChild(root);
  return root;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("isVisibleNode", () => {
  it("is true for a plain visible element under root", () => {
    const root = setupRoot("<p><span>hi</span></p>");
    const span = root.querySelector("span")!;
    expect(isVisibleNode(span, root)).toBe(true);
  });

  it("is false when the element itself has the hidden attribute", () => {
    const root = setupRoot('<p><span hidden>hi</span></p>');
    const span = root.querySelector("span")!;
    expect(isVisibleNode(span, root)).toBe(false);
  });

  it("is false when an ancestor has aria-hidden=true", () => {
    const root = setupRoot('<div aria-hidden="true"><p><span>hi</span></p></div>');
    const span = root.querySelector("span")!;
    expect(isVisibleNode(span, root)).toBe(false);
  });

  it("is false when an ancestor has display:none", () => {
    const root = setupRoot('<div style="display: none"><p><span>hi</span></p></div>');
    const span = root.querySelector("span")!;
    expect(isVisibleNode(span, root)).toBe(false);
  });

  it("is false when an ancestor has visibility:hidden", () => {
    const root = setupRoot('<div style="visibility: hidden"><p><span>hi</span></p></div>');
    const span = root.querySelector("span")!;
    expect(isVisibleNode(span, root)).toBe(false);
  });

  it("is false when an ancestor has opacity:0", () => {
    const root = setupRoot('<div style="opacity: 0"><p><span>hi</span></p></div>');
    const span = root.querySelector("span")!;
    expect(isVisibleNode(span, root)).toBe(false);
  });

  it("stops at root — visibility of ancestors above root is ignored", () => {
    document.body.innerHTML = '<div style="display: none"><div id="root"><span>hi</span></div></div>';
    const root = document.getElementById("root") as HTMLElement;
    const span = root.querySelector("span")!;
    expect(isVisibleNode(span, root)).toBe(true);
  });
});

describe("shouldProcessTextNode", () => {
  it("rejects non-Text nodes", () => {
    const root = setupRoot("<p>hi</p>");
    const p = root.querySelector("p")!;
    expect(shouldProcessTextNode(p, root)).toBe(false);
  });

  it("rejects whitespace-only text nodes", () => {
    const root = setupRoot("<p>   </p>");
    const text = root.querySelector("p")!.firstChild as Text;
    expect(shouldProcessTextNode(text, root)).toBe(false);
  });

  it("rejects text inside a <script>", () => {
    const root = setupRoot("<script>alert('x')</script>");
    const text = root.querySelector("script")!.firstChild as Text;
    expect(shouldProcessTextNode(text, root)).toBe(false);
  });

  it("rejects text inside a contenteditable", () => {
    const root = setupRoot('<div contenteditable="true">editable</div>');
    const text = root.querySelector("div")!.firstChild as Text;
    expect(shouldProcessTextNode(text, root)).toBe(false);
  });

  it("accepts ordinary visible text", () => {
    const root = setupRoot("<p>hello</p>");
    const text = root.querySelector("p")!.firstChild as Text;
    expect(shouldProcessTextNode(text, root)).toBe(true);
  });
});

describe("collectTextNodes", () => {
  it("returns text nodes in document order, skipping whitespace and skipped tags", () => {
    const root = setupRoot(
      "<p>first</p>  \n  <p>second</p><style>.x {}</style><p>third</p>",
    );
    const collected = collectTextNodes(root).map((node) => node.data);
    expect(collected).toEqual(["first", "second", "third"]);
  });
});

describe("shouldHighlightControl", () => {
  it("requires highlightInput=true for inputs", () => {
    const root = setupRoot('<input type="text" />');
    const input = root.querySelector("input")!;
    expect(shouldHighlightControl(input, { highlightInput: false }, root)).toBe(false);
    expect(shouldHighlightControl(input, { highlightInput: true }, root)).toBe(true);
  });

  it("rejects unsupported input types even when highlightInput is true", () => {
    const root = setupRoot('<input type="password" />');
    const input = root.querySelector("input")!;
    expect(shouldHighlightControl(input, { highlightInput: true }, root)).toBe(false);
  });

  it("requires highlightTextarea=true for textareas", () => {
    const root = setupRoot("<textarea></textarea>");
    const textarea = root.querySelector("textarea")!;
    expect(shouldHighlightControl(textarea, { highlightTextarea: false }, root)).toBe(false);
    expect(shouldHighlightControl(textarea, { highlightTextarea: true }, root)).toBe(true);
  });

  it("rejects controls that are not visible", () => {
    const root = setupRoot('<div style="display: none"><input type="text" /></div>');
    const input = root.querySelector("input")!;
    expect(shouldHighlightControl(input, { highlightInput: true }, root)).toBe(false);
  });
});
