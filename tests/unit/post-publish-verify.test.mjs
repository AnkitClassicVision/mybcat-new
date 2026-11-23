import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPageContent } from '../../scripts/post-publish-verify.mjs';

function page({ h1 = '<h1>Title</h1>', cta = '<a href="/contact/">Contact us</a>', extra = '' } = {}) {
  return `<!doctype html><html><head><title>Post</title></head><body>${h1}<p>Body text.</p>${cta}${extra}</body></html>`;
}

test('a good page passes', () => {
  assert.deepEqual(checkPageContent(page()), []);
});

test('a page with no h1 fails', () => {
  const failures = checkPageContent(page({ h1: '<h2>Not a title</h2>' }));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /exactly 1 <h1>.*found 0/);
});

test('a page with two h1 elements fails', () => {
  const failures = checkPageContent(page({ h1: '<h1>One</h1><h1 class="x">Two</h1>' }));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /exactly 1 <h1>.*found 2/);
});

test('an h1 inside a script or comment is not counted', () => {
  const extra = '<script type="application/ld+json">{"x":"<h1>fake</h1>"}</script><!-- <h1>old</h1> -->';
  assert.deepEqual(checkPageContent(page({ extra })), []);
});

test('a page with no contact or transition link fails', () => {
  const failures = checkPageContent(page({ cta: '<a href="/blog/">More posts</a><a href="#contact">Jump</a>' }));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /no <a href> to \/contact\/ or \/optometry-practice-transitions\//);
});

test('a link to the transitions page passes, with or without a trailing slash', () => {
  assert.deepEqual(checkPageContent(page({ cta: '<a href="/optometry-practice-transitions/">Sell</a>' })), []);
  assert.deepEqual(checkPageContent(page({ cta: '<a href="/optometry-practice-transitions">Sell</a>' })), []);
});

test('an absolute contact URL passes', () => {
  assert.deepEqual(checkPageContent(page({ cta: '<a class="btn" href="https://mybcat.com/contact/">Contact</a>' })), []);
  assert.deepEqual(checkPageContent(page({ cta: "<a href='https://mybcat.com/contact'>Contact</a>" })), []);
  assert.deepEqual(
    checkPageContent(page({ cta: '<a href="https://mybcat.com/optometry-practice-transitions/">Sell</a>' })),
    [],
  );
});

test('a contact URL on another host does not count as a CTA', () => {
  const failures = checkPageContent(page({ cta: '<a href="https://example.com/contact/">Contact</a>' }));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /no <a href>/);
});

test('any occurrence of the retired hubspot host fails', () => {
  const inLink = checkPageContent(page({ extra: '<a href="https://hubspot.mybcat.com/meetings/x">Book</a>' }));
  assert.equal(inLink.length, 1);
  assert.match(inLink[0], /retired host hubspot\.mybcat\.com appears 1 time/);

  const inScript = checkPageContent(page({ extra: '<script>var u = "https://HubSpot.MyBCAT.com/x";</script>' }));
  assert.equal(inScript.length, 1);
  assert.match(inScript[0], /retired host/);
});

test('every problem on a bad page is reported', () => {
  const failures = checkPageContent('<html><body><p>hubspot.mybcat.com</p></body></html>');
  assert.equal(failures.length, 3);
});
