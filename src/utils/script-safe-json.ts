/**
 * Serialize JSON for an inline HTML script raw-text context.
 *
 * JSON.stringify alone preserves a literal `</script>` sequence. Browsers end
 * the script element at that sequence even inside a JSON string, which can turn
 * content metadata into executable markup. Escaping these five characters is
 * valid JSON and prevents a closing script tag from appearing in the HTML.
 */
export function serializeScriptSafeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
