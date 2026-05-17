/**
 * Pure text-matching primitives. No DOM, no React — just string in,
 * ranges out. Used by both the rendered-text path and the form-control
 * overlay path so they always agree on what counts as a match.
 *
 * Two entry points:
 *   - `findTextMatches(text, search, caseSensitive)` — one-shot, compiles
 *     a fresh regex internally. Convenient for one-off use.
 *   - `compileSearchRegex(...)` + `findTextMatchesWithRegex(text, regex)`
 *     — pre-compile once, run against many strings. Used by the engine to
 *     avoid re-building the same regex for every text node in a subtree.
 */

/** A single occurrence of the search term inside a larger string. */
export interface TextMatchRange {
  /** Index of the first character of the match. */
  start: number;
  /** Index *after* the last character (exclusive — matches `String.slice`). */
  end: number;
  /** The matched substring, exactly as it appeared in the source. */
  text: string;
}

const SPECIAL_REGEX_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

/**
 * Type guard — true when `search` is a non-empty string or any `RegExp`.
 * Used everywhere we'd otherwise no-op on an empty term.
 */
export const hasSearchTerm = (
  search?: string | RegExp,
): search is string | RegExp => {
  if (search instanceof RegExp) {
    return true;
  }

  return Boolean(search && search.trim());
};

/** Escapes regex metacharacters so a string term is matched literally. */
export const escapeSearchPattern = (search: string): string =>
  search.replace(SPECIAL_REGEX_CHARACTERS, "\\$&");

/**
 * Builds a stateful global regex from a user-provided string or `RegExp`.
 *
 * - String: escaped to literal, wrapped in a capture group, `g` flag
 *   always set, `i` set when `caseSensitive` is false.
 * - RegExp: returned as-is when it already has the `g` flag, otherwise
 *   cloned with `g` appended. `caseSensitive` is ignored — the regex's own
 *   `i` flag is authoritative.
 *
 * Callers must reset `regex.lastIndex` between unrelated strings (or use
 * `findTextMatchesWithRegex`, which does it for them).
 */
export const compileSearchRegex = (
  search: string | RegExp,
  caseSensitive = false,
): RegExp => {
  if (search instanceof RegExp) {
    if (search.flags.includes("g")) {
      return search;
    }

    return new RegExp(search.source, `${search.flags}g`);
  }

  const flags = caseSensitive ? "g" : "gi";

  return new RegExp(`(${escapeSearchPattern(search)})`, flags);
};

/**
 * Runs a pre-compiled regex against `text` and returns every match as a
 * range. Resets `regex.lastIndex` first so callers can reuse the same
 * regex across many strings without worrying about leftover state.
 */
export const findTextMatchesWithRegex = (
  text: string,
  regex: RegExp,
): TextMatchRange[] => {
  if (!text) {
    return [];
  }

  regex.lastIndex = 0;

  const matches: TextMatchRange[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
    });

    if (match.index === regex.lastIndex) {
      regex.lastIndex += 1;
    }
  }

  return matches;
};

/**
 * Convenience wrapper — compiles a fresh regex and runs it once. For
 * many-string workloads prefer `compileSearchRegex` + `findTextMatchesWithRegex`.
 */
export const findTextMatches = (
  text: string,
  search: string | RegExp,
  caseSensitive = false,
): TextMatchRange[] => {
  if (!hasSearchTerm(search)) {
    return [];
  }

  return findTextMatchesWithRegex(text, compileSearchRegex(search, caseSensitive));
};
