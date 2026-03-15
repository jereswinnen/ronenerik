/**
 * Converts a string to a URL-friendly slug.
 * Lowercase, replace spaces with hyphens, strip non-alphanumeric (except hyphens).
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
}
