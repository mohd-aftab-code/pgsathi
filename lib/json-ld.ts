/**
 * lib/json-ld.ts
 * Safe serialisation for JSON-LD injected via dangerouslySetInnerHTML.
 *
 * `JSON.stringify` escapes JSON syntax, not HTML. Inside a <script> block the
 * browser ends the element at the first literal `</script>`, so a PG title or
 * description containing one closes the tag early and everything after it is
 * parsed as HTML — a stored XSS reachable by anyone who can name their own PG.
 *
 * Escaping `<`, `>` and `&` as unicode escapes leaves the JSON identical to any
 * parser while making it impossible to break out of the element.
 *
 * U+2028 / U+2029 are deliberately NOT handled: they only matter where the
 * payload is evaluated as JavaScript, and `application/ld+json` is parsed as
 * JSON, never executed.
 */
const REPLACEMENTS: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
};

/** Serialise a value for embedding in a <script type="application/ld+json">. */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&]/g, (c) => REPLACEMENTS[c]);
}
