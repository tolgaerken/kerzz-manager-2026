const SCRIPT_TAG_REGEX = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const INLINE_EVENT_REGEX = /\son\w+="[^"]*"/gi;
const JAVASCRIPT_URL_REGEX = /javascript:/gi;
const STYLE_TAG_REGEX = /<style[\s\S]*?>[\s\S]*?<\/style>/gi;
const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const HTML_SPACE_REGEX = /&nbsp;/gi;

export function sanitizeHtmlContent(html: string): string {
  if (!html) {
    return "";
  }

  return html
    .replace(SCRIPT_TAG_REGEX, "")
    .replace(STYLE_TAG_REGEX, "")
    .replace(INLINE_EVENT_REGEX, "")
    .replace(JAVASCRIPT_URL_REGEX, "");
}

export function stripHtmlToText(html: string): string {
  if (!html) {
    return "";
  }

  return html
    .replace(HTML_TAG_REGEX, " ")
    .replace(HTML_SPACE_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasMeaningfulHtmlContent(html: string): boolean {
  const plainText = stripHtmlToText(html);
  return plainText.length > 0;
}
