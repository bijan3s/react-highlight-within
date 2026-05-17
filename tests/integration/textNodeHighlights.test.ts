import { afterEach, describe, expect, it } from "vitest";

import {
  applyTextNodeHighlights,
  clearTextNodeHighlights,
} from "../../src/core/dom/textNodeHighlights";

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

describe("applyTextNodeHighlights", () => {
  it("wraps each match in a <mark>", () => {
    const root = setupRoot("<p>foo bar foo</p>");
    const count = applyTextNodeHighlights(root, { search: "foo" });
    expect(count).toBe(2);
    expect(root.querySelectorAll("mark").length).toBe(2);
    expect(
      Array.from(root.querySelectorAll("mark")).map((m) => m.textContent),
    ).toEqual(["foo", "foo"]);
  });

  it("wraps the parent text node in a neutral bidi wrapper", () => {
    const root = setupRoot("<p>match here</p>");
    applyTextNodeHighlights(root, { search: "match" });
    const wrapper = root.querySelector<HTMLElement>(
      "[data-highlight-within-bidi='true']",
    );
    expect(wrapper).not.toBeNull();
    expect(wrapper!.tagName).toBe("SPAN");
    expect(wrapper!.style.direction).toBe("inherit");
  });

  it("keeps highlighted mixed-direction text inside the parent direction", () => {
    const root = setupRoot("<p dir=\"rtl\">signal-سیگنال-1</p>");
    applyTextNodeHighlights(root, { search: "سیگنال" });
    const wrapper = root.querySelector<HTMLElement>(
      "[data-highlight-within-bidi='true']",
    );
    expect(wrapper).not.toBeNull();
    expect(wrapper!.style.direction).toBe("inherit");
    expect(wrapper!.style.unicodeBidi).toBe("isolate");
    expect(root.textContent).toBe("signal-سیگنال-1");
  });

  it("returns 0 and does not mutate when there is no match", () => {
    const root = setupRoot("<p>nothing relevant</p>");
    const before = root.innerHTML;
    const count = applyTextNodeHighlights(root, { search: "xyz" });
    expect(count).toBe(0);
    expect(root.innerHTML).toBe(before);
  });

  it("returns 0 and does not mutate when search is empty", () => {
    const root = setupRoot("<p>hello</p>");
    const before = root.innerHTML;
    applyTextNodeHighlights(root, { search: "" });
    expect(root.innerHTML).toBe(before);
  });

  it("does not descend into <script> or <style>", () => {
    const root = setupRoot(
      "<p>foo</p><script>foo</script><style>.foo {}</style>",
    );
    applyTextNodeHighlights(root, { search: "foo" });
    expect(root.querySelector("p")!.querySelectorAll("mark").length).toBe(1);
    expect(root.querySelector("script")!.innerHTML).toBe("foo");
    expect(root.querySelector("style")!.innerHTML).toBe(".foo {}");
  });

  it("highlights nested children at any depth", () => {
    const root = setupRoot(
      "<section><article><p>foo</p><div><p><span>foo</span></p></div></article></section>",
    );
    applyTextNodeHighlights(root, { search: "foo" });
    expect(root.querySelectorAll("mark").length).toBe(2);
  });
});

describe("clearTextNodeHighlights", () => {
  it("restores the DOM byte-identical after apply + clear", () => {
    const root = setupRoot(
      "<section><p>one foo two</p><p>and foo again</p></section>",
    );
    const before = root.innerHTML;
    applyTextNodeHighlights(root, { search: "foo" });
    expect(root.querySelectorAll("mark").length).toBeGreaterThan(0);
    clearTextNodeHighlights(root);
    expect(root.innerHTML).toBe(before);
  });
});
