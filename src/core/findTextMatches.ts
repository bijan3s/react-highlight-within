export interface TextMatchRange {
  start: number;
  end: number;
  text: string;
}

const SPECIAL_REGEX_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

export const hasSearchTerm = (search?: string): search is string =>
  Boolean(search && search.trim());

export const escapeSearchPattern = (search: string): string =>
  search.replace(SPECIAL_REGEX_CHARACTERS, "\\$&");

export const findTextMatches = (
  text: string,
  search: string,
  caseSensitive = false,
): TextMatchRange[] => {
  if (!text || !hasSearchTerm(search)) {
    return [];
  }

  const flags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(`(${escapeSearchPattern(search)})`, flags);
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
