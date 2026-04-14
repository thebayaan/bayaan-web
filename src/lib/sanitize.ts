import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "sup", "sub", "br", "span", "p"],
    ALLOWED_ATTR: ["class"],
  });
}
