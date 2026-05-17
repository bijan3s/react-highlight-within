import { describe, expect, it } from "vitest";

import {
  compileSearchRegex,
  escapeSearchPattern,
  findTextMatches,
  findTextMatchesWithRegex,
  hasSearchTerm,
} from "../../src/core/findTextMatches";

describe("hasSearchTerm", () => {
  it("rejects undefined, empty string, and whitespace-only string", () => {
    expect(hasSearchTerm(undefined)).toBe(false);
    expect(hasSearchTerm("")).toBe(false);
    expect(hasSearchTerm("   ")).toBe(false);
  });

  it("accepts any non-empty string", () => {
    expect(hasSearchTerm("a")).toBe(true);
    expect(hasSearchTerm("multi word")).toBe(true);
  });

  it("accepts any RegExp", () => {
    expect(hasSearchTerm(/anything/)).toBe(true);
    expect(hasSearchTerm(new RegExp(""))).toBe(true);
  });
});

describe("escapeSearchPattern", () => {
  it("leaves plain text alone", () => {
    expect(escapeSearchPattern("hello world")).toBe("hello world");
  });

  it("escapes every regex metacharacter", () => {
    expect(escapeSearchPattern(".*+?^${}()|[]\\")).toBe(
      "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\",
    );
  });
});

describe("compileSearchRegex", () => {
  it("builds a global, case-insensitive regex from a string by default", () => {
    const regex = compileSearchRegex("foo");
    expect(regex.flags).toContain("g");
    expect(regex.flags).toContain("i");
  });

  it("omits the i flag when caseSensitive is true", () => {
    const regex = compileSearchRegex("foo", true);
    expect(regex.flags).toContain("g");
    expect(regex.flags).not.toContain("i");
  });

  it("returns a RegExp input unchanged when it already has the g flag", () => {
    const input = /foo/gi;
    expect(compileSearchRegex(input)).toBe(input);
  });

  it("clones a RegExp input to add the g flag if missing", () => {
    const input = /foo/i;
    const compiled = compileSearchRegex(input);
    expect(compiled).not.toBe(input);
    expect(compiled.source).toBe("foo");
    expect(compiled.flags).toContain("g");
    expect(compiled.flags).toContain("i");
  });

  it("ignores caseSensitive when a RegExp is provided", () => {
    const input = /Foo/g;
    const compiled = compileSearchRegex(input, true);
    expect(compiled.flags).not.toContain("i");
    expect(compiled).toBe(input);
  });
});

describe("findTextMatchesWithRegex", () => {
  it("returns [] for empty text", () => {
    expect(findTextMatchesWithRegex("", /a/g)).toEqual([]);
  });

  it("returns [] when there are no matches", () => {
    expect(findTextMatchesWithRegex("hello", /xyz/g)).toEqual([]);
  });

  it("finds a single match", () => {
    expect(findTextMatchesWithRegex("hello", /ell/g)).toEqual([
      { start: 1, end: 4, text: "ell" },
    ]);
  });

  it("finds multiple matches", () => {
    expect(findTextMatchesWithRegex("ababa", /a/g)).toEqual([
      { start: 0, end: 1, text: "a" },
      { start: 2, end: 3, text: "a" },
      { start: 4, end: 5, text: "a" },
    ]);
  });

  it("resets lastIndex so the same regex is reusable across calls", () => {
    const regex = /a/g;
    const first = findTextMatchesWithRegex("abc", regex);
    const second = findTextMatchesWithRegex("abc", regex);
    expect(first).toEqual(second);
  });
});

describe("findTextMatches", () => {
  it("escapes regex special chars when search is a string", () => {
    expect(findTextMatches("price: $5.00", "$5.00")).toEqual([
      { start: 7, end: 12, text: "$5.00" },
    ]);
  });

  it("is case-insensitive by default", () => {
    expect(findTextMatches("Hello", "hello").length).toBe(1);
  });

  it("respects caseSensitive=true", () => {
    expect(findTextMatches("Hello", "hello", true)).toEqual([]);
    expect(findTextMatches("hello", "hello", true).length).toBe(1);
  });

  it("accepts a RegExp directly", () => {
    expect(findTextMatches("a1 a2 b3", /a\d/)).toEqual([
      { start: 0, end: 2, text: "a1" },
      { start: 3, end: 5, text: "a2" },
    ]);
  });

  it("returns [] for an empty search term", () => {
    expect(findTextMatches("hello", "")).toEqual([]);
    expect(findTextMatches("hello", "   ")).toEqual([]);
  });
});
