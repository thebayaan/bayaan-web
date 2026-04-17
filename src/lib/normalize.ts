/** Strip non-alphanumeric characters and lowercase for fuzzy matching. */
export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
