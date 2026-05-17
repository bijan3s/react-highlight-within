import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import { HighlightWithin } from "../../src/react/HighlightWithin";

afterEach(() => {
  cleanup();
});

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe("<HighlightWithin>", () => {
  it("renders its children unchanged when search is empty", () => {
    const { container } = render(
      <HighlightWithin>
        <p>hello world</p>
      </HighlightWithin>,
    );
    expect(container.querySelectorAll("mark").length).toBe(0);
    expect(container.textContent).toBe("hello world");
  });

  it("wraps matches in <mark> when a search term is provided", () => {
    const { container } = render(
      <HighlightWithin search="hello">
        <p>hello world hello</p>
      </HighlightWithin>,
    );
    expect(container.querySelectorAll("mark").length).toBe(2);
  });

  it("updates highlights when the search prop changes", () => {
    const { container, rerender } = render(
      <HighlightWithin search="hello">
        <p>hello world</p>
      </HighlightWithin>,
    );
    expect(container.querySelectorAll("mark").length).toBe(1);

    rerender(
      <HighlightWithin search="world">
        <p>hello world</p>
      </HighlightWithin>,
    );
    expect(container.querySelectorAll("mark").length).toBe(1);
    expect(container.querySelector("mark")!.textContent).toBe("world");
  });

  it("cleans up highlights on unmount", () => {
    const { container, unmount } = render(
      <HighlightWithin search="hello">
        <p>hello world</p>
      </HighlightWithin>,
    );
    expect(container.querySelectorAll("mark").length).toBe(1);
    unmount();
  });

  it("picks up DOM mutations made outside React (MutationObserver)", async () => {
    const { container } = render(
      <HighlightWithin search="injected">
        <p id="target">original text</p>
      </HighlightWithin>,
    );
    expect(container.querySelectorAll("mark").length).toBe(0);

    const target = container.querySelector("#target")!;
    target.appendChild(document.createTextNode(" injected here"));

    await waitFor(() => {
      expect(container.querySelectorAll("mark").length).toBeGreaterThan(0);
    });
    expect(container.querySelector("mark")!.textContent).toBe("injected");
  });

  it("re-highlights when children change via React state", async () => {
    const NotesDemo = () => {
      const [notes, setNotes] = useState(["alpha"]);
      return (
        <div>
          <button onClick={() => setNotes((current) => [...current, "alpha"])}>
            add
          </button>
          <HighlightWithin search="alpha">
            <ul>
              {notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </HighlightWithin>
        </div>
      );
    };

    const { container } = render(<NotesDemo />);
    expect(container.querySelectorAll("mark").length).toBe(1);

    screen.getByText("add").click();

    await waitFor(() => {
      expect(container.querySelectorAll("mark").length).toBe(2);
    });
  });
});

describe("<HighlightWithin asChild>", () => {
  it("clones the single child element instead of rendering a wrapper", async () => {
    const { container } = render(
      <HighlightWithin search="foo" asChild>
        <article data-testid="root">
          <p>foo bar</p>
        </article>
      </HighlightWithin>,
    );
    await flushMicrotasks();

    expect(container.firstChild).toBe(container.querySelector("[data-testid='root']"));
    expect(container.querySelector("article")!.tagName).toBe("ARTICLE");
    expect(container.querySelectorAll("mark").length).toBe(1);
  });

  it("preserves a consumer ref on the child", () => {
    let receivedRef: HTMLElement | null = null;
    const refCallback = (el: HTMLElement | null) => {
      receivedRef = el;
    };

    render(
      <HighlightWithin search="x" asChild>
        <section ref={refCallback}>
          <p>x</p>
        </section>
      </HighlightWithin>,
    );

    expect(receivedRef).not.toBeNull();
    expect((receivedRef as unknown as HTMLElement).tagName).toBe("SECTION");
  });

  it("throws when given more than one child element", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(
        <HighlightWithin search="x" asChild>
          <p>one</p>
          <p>two</p>
        </HighlightWithin>,
      ),
    ).toThrow();

    consoleError.mockRestore();
  });
});
