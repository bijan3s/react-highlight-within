import { describe, expect, it } from "vitest";

import {
  BIDI_WRAPPER_ATTRIBUTE,
  HIGHLIGHT_ATTRIBUTE,
} from "../../src/core/dom/constants";
import {
  buildHighlightedFragment,
  createBidiWrapper,
  createHighlightMark,
  unwrapElement,
} from "../../src/core/dom/textFragments";

describe("createBidiWrapper", () => {
  it("creates a neutral inline wrapper with the namespaced data attribute", () => {
    const wrapper = createBidiWrapper(document);
    expect(wrapper.tagName).toBe("SPAN");
    expect(wrapper.getAttribute(BIDI_WRAPPER_ATTRIBUTE)).toBe("true");
    expect(wrapper.style.direction).toBe("inherit");
    expect(wrapper.style.display).toBe("inline");
    expect(wrapper.style.unicodeBidi).toBe("isolate");
  });
});

describe("createHighlightMark", () => {
  it("produces a <mark> with the highlight attribute and inline default styles", () => {
    const mark = createHighlightMark(document, "hello", {});
    expect(mark.tagName).toBe("MARK");
    expect(mark.getAttribute(HIGHLIGHT_ATTRIBUTE)).toBe("true");
    expect(mark.textContent).toBe("hello");
    expect(mark.style.backgroundColor).toBeTruthy();
    expect(mark.style.color).toBeTruthy();
    expect(mark.style.paddingLeft).toBe("4px");
  });

  it("uses provided bgColor and textColor over defaults", () => {
    const mark = createHighlightMark(document, "hi", {
      bgColor: "rgb(0, 0, 255)",
      textColor: "rgb(255, 255, 0)",
    });
    expect(mark.style.backgroundColor).toBe("rgb(0, 0, 255)");
    expect(mark.style.color).toBe("rgb(255, 255, 0)");
  });

  it("skips inline color/background when markClassName is set", () => {
    const mark = createHighlightMark(document, "hi", {
      markClassName: "my-mark",
    });
    expect(mark.className).toBe("my-mark");
    expect(mark.style.backgroundColor).toBe("");
    expect(mark.style.color).toBe("");
  });

  it("overlays highlightStyle on top of the defaults", () => {
    const mark = createHighlightMark(document, "hi", {
      highlightStyle: { backgroundColor: "rgb(1, 2, 3)", fontWeight: "700" },
    });
    expect(mark.style.backgroundColor).toBe("rgb(1, 2, 3)");
    expect(mark.style.fontWeight).toBe("700");
  });

  it("forces padding to 0 when preserveLayout is true (overrides any className padding)", () => {
    const mark = createHighlightMark(
      document,
      "hi",
      { markClassName: "padded" },
      undefined,
      true,
    );
    expect(mark.style.padding).toBe("0px");
  });
});

describe("buildHighlightedFragment", () => {
  it("returns null when search is empty", () => {
    expect(buildHighlightedFragment(document, "hello", {})).toBeNull();
    expect(
      buildHighlightedFragment(document, "hello", { search: "" }),
    ).toBeNull();
  });

  it("returns null when nothing matches", () => {
    expect(
      buildHighlightedFragment(document, "hello", { search: "xyz" }),
    ).toBeNull();
  });

  it("returns a fragment whose only child is the bidi wrapper", () => {
    const fragment = buildHighlightedFragment(document, "hello", {
      search: "ell",
    });
    expect(fragment).not.toBeNull();
    const wrapper = fragment!.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe("SPAN");
    expect(wrapper.getAttribute(BIDI_WRAPPER_ATTRIBUTE)).toBe("true");
  });

  it("interleaves text and mark nodes around matches", () => {
    const fragment = buildHighlightedFragment(document, "a foo b foo c", {
      search: "foo",
    });
    const wrapper = fragment!.firstChild as HTMLElement;
    const children = Array.from(wrapper.childNodes);
    expect(children.map((c) => c.nodeType)).toEqual([3, 1, 3, 1, 3]);
    expect((children[1] as HTMLElement).textContent).toBe("foo");
    expect((children[3] as HTMLElement).textContent).toBe("foo");
    expect(children[0].textContent).toBe("a ");
    expect(children[2].textContent).toBe(" b ");
    expect(children[4].textContent).toBe(" c");
  });
});

describe("unwrapElement", () => {
  it("moves an element's children up to its parent and removes the element", () => {
    const parent = document.createElement("div");
    parent.innerHTML = "<span>before</span><b><i>inside</i> child</b><span>after</span>";
    const inner = parent.querySelector("b")!;

    unwrapElement(inner);

    expect(parent.querySelector("b")).toBeNull();
    expect(parent.textContent).toBe("beforeinside childafter");
  });

  it("is a no-op when the element has no parent", () => {
    const orphan = document.createElement("div");
    expect(() => unwrapElement(orphan)).not.toThrow();
  });
});
