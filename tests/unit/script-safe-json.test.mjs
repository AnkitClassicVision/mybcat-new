import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeScriptSafeJson } from '../../src/utils/script-safe-json.ts';

test('inline JSON serialization cannot close its script element', () => {
  const serialized = serializeScriptSafeJson({
    title: '</script><script>globalThis.pwned=1</script>',
    separators: '\u2028\u2029',
    ampersand: '&',
  });

  assert.equal(serialized.includes('<'), false);
  assert.equal(serialized.includes('>'), false);
  assert.equal(serialized.includes('&'), false);
  assert.equal(serialized.includes('\u2028'), false);
  assert.equal(serialized.includes('\u2029'), false);
  assert.match(serialized, /\\u003c\/script\\u003e/);
  assert.deepEqual(JSON.parse(serialized), {
    title: '</script><script>globalThis.pwned=1</script>',
    separators: '\u2028\u2029',
    ampersand: '&',
  });
});
