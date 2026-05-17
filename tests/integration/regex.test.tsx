import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { HighlightWithin } from "../../src/react/HighlightWithin";

afterEach(() => {
  cleanup();
});

describe("RegExp search", () => {
  it("highlights every match of the provided pattern", () => {
    const { container } = render(
      <HighlightWithin search={/a\d/}>
        <p>a1 a2 b3 a4</p>
      </HighlightWithin>,
    );
    const marks = Array.from(container.querySelectorAll("mark")).map(
      (m) => m.textContent,
    );
    expect(marks).toEqual(["a1", "a2", "a4"]);
  });

  it("respects the regex's own i flag (caseSensitive prop is ignored)", () => {
    const { container } = render(
      <HighlightWithin search={/foo/} caseSensitive>
        <p>Foo foo FOO</p>
      </HighlightWithin>,
    );
    expect(container.querySelectorAll("mark").length).toBe(1);
    expect(container.querySelector("mark")!.textContent).toBe("foo");
  });

  it("accepts an i-flagged regex even when caseSensitive is true on the prop", () => {
    const { container } = render(
      <HighlightWithin search={/foo/i} caseSensitive>
        <p>Foo foo FOO</p>
      </HighlightWithin>,
    );
    expect(container.querySelectorAll("mark").length).toBe(3);
  });

  it("auto-adds the global flag when missing", () => {
    const { container } = render(
      <HighlightWithin search={/ab/}>
        <p>ab ab ab</p>
      </HighlightWithin>,
    );
    expect(container.querySelectorAll("mark").length).toBe(3);
  });
});
