/**
 * Strip HTML tags from a string to prevent XSS.
 * Allows no HTML — converts to plain text.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, "") // strip angle brackets
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars
    .trim();
}

/**
 * Sanitize HTML by stripping all tags.
 * For user-generated content that should be plain text only.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip all HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/[<>]/g, "") // re-strip any decoded angle brackets
    .trim();
}
