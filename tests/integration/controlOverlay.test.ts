import { afterEach, describe, expect, it } from "vitest";

import {
  CONTROL_ATTRIBUTE,
  CONTROL_OVERLAY_ATTRIBUTE,
} from "../../src/core/dom/constants";
import {
  applyControlHighlights,
  clearControlHighlights,
} from "../../src/core/dom/lifecycleControl";
import { createControlStateMap } from "../../src/core/dom/types";

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

describe("applyControlHighlights", () => {
  it("attaches an overlay to an <input> when highlightInput is true", () => {
    const root = setupRoot('<input type="text" value="hello world" />');
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "hello", highlightInput: true }, states);

    const input = root.querySelector("input")!;
    expect(input.getAttribute(CONTROL_ATTRIBUTE)).toBe("true");
    expect(root.querySelectorAll(`[${CONTROL_OVERLAY_ATTRIBUTE}='true']`).length).toBe(1);
  });

  it("does not attach when highlightInput is false", () => {
    const root = setupRoot('<input type="text" value="hello" />');
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "hello", highlightInput: false }, states);

    expect(root.querySelectorAll(`[${CONTROL_OVERLAY_ATTRIBUTE}='true']`).length).toBe(0);
  });

  it("skips unsupported input types (password)", () => {
    const root = setupRoot('<input type="password" value="hello" />');
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "hello", highlightInput: true }, states);

    expect(root.querySelectorAll(`[${CONTROL_OVERLAY_ATTRIBUTE}='true']`).length).toBe(0);
  });

  it("attaches to <textarea> when highlightTextarea is true", () => {
    const root = setupRoot("<textarea>hello world</textarea>");
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "world", highlightTextarea: true }, states);

    const textarea = root.querySelector("textarea")!;
    expect(textarea.getAttribute(CONTROL_ATTRIBUTE)).toBe("true");
  });

  it("keeps the control's native text visible when there is a match", () => {
    const root = setupRoot('<input type="text" value="hello world" />');
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "hello", highlightInput: true }, states);

    const input = root.querySelector("input")!;
    expect(input.style.color).toBe("");
    expect(input.style.getPropertyValue("-webkit-text-fill-color")).toBe("");
  });

  it("keeps the native caret and selection above the highlight layer", () => {
    const root = setupRoot('<input type="text" value="hello world" />');
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "hello", highlightInput: true }, states);

    const input = root.querySelector("input")!;
    const overlay = root.querySelector<HTMLElement>(
      `[${CONTROL_OVERLAY_ATTRIBUTE}='true']`,
    )!;

    expect(overlay.style.zIndex).toBe("0");
    expect(input.style.position).toBe("relative");
    expect(input.style.zIndex).toBe("1");
    expect(input.style.background).toBe("transparent");
  });

  it("renders only highlight backgrounds in the mirror layer", () => {
    const root = setupRoot('<input type="text" value="hello world" />');
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "hello", highlightInput: true }, states);

    const overlay = root.querySelector<HTMLElement>(
      `[${CONTROL_OVERLAY_ATTRIBUTE}='true']`,
    )!;
    const mark = root.querySelector("mark")!;
    const content = overlay.firstElementChild as HTMLElement;
    expect(content.style.color).toBe("transparent");
    expect(mark.style.backgroundColor).toBeTruthy();
    expect(mark.style.color).toBe("transparent");
    expect(mark.style.getPropertyValue("-webkit-text-fill-color")).toBe(
      "transparent",
    );
  });

  it("uses the control-specific default background and vertical offset", () => {
    const root = setupRoot('<input type="text" value="hello world" />');
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "hello", highlightInput: true }, states);

    const overlay = root.querySelector<HTMLElement>(
      `[${CONTROL_OVERLAY_ATTRIBUTE}='true']`,
    )!;
    const content = overlay.firstElementChild as HTMLElement;
    const mark = root.querySelector("mark")!;

    expect(content.style.transform).toContain("1px");
    expect(mark.style.backgroundColor).toBeTruthy();
    expect(mark.style.verticalAlign).toBe("baseline");
  });

  it("re-syncs the overlay on input events (user typing)", () => {
    const root = setupRoot('<input type="text" value="hello world" />');
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "world", highlightInput: true }, states);

    const input = root.querySelector("input")! as HTMLInputElement;
    const overlay = root.querySelector(`[${CONTROL_OVERLAY_ATTRIBUTE}='true']`)!;
    const initialContent = overlay.textContent;

    input.value = "another world entirely";
    input.dispatchEvent(new Event("input"));

    expect(overlay.textContent).not.toBe(initialContent);
    expect(overlay.querySelector("mark")?.textContent).toBe("world");
  });
});

describe("clearControlHighlights", () => {
  it("removes the overlay and restores control paint styles", () => {
    const root = setupRoot('<input type="text" value="hello" />');
    const states = createControlStateMap();

    applyControlHighlights(root, { search: "hello", highlightInput: true }, states);
    const input = root.querySelector("input")! as HTMLInputElement;
    expect(input.style.background).toBe("transparent");

    clearControlHighlights(root, states);

    expect(root.querySelectorAll(`[${CONTROL_OVERLAY_ATTRIBUTE}='true']`).length).toBe(0);
    expect(input.style.color).toBe("");
    expect(input.style.background).toBe("");
    expect(input.style.position).toBe("");
    expect(input.style.zIndex).toBe("");
    expect(input.style.getPropertyValue("-webkit-text-fill-color")).toBe("");
    expect(input.hasAttribute(CONTROL_ATTRIBUTE)).toBe(false);
  });
});
