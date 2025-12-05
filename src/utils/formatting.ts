/**
 * Formats an array of line numbers into a readable range string.
 * Examples: [10] -> "10", [10,11,12] -> "10-12", [10,15,20] -> "10, 15, 20"
 */
export function formatLineRange(lineRange: number[]): string {
  if (lineRange.length === 0) return "";
  if (lineRange.length === 1) return `${lineRange[0]}`;

  const first = lineRange[0];
  const last = lineRange[lineRange.length - 1];

  // If consecutive range, show as "10-12"
  if (last - first + 1 === lineRange.length) {
    return `${first}-${last}`;
  }

  // Otherwise show all lines
  return lineRange.join(", ");
}

/**
 * Pluralizes a word based on count.
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}
