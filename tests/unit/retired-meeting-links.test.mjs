import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const deployableRoots = ['src', 'public', 'scripts'];
const retiredDestinations = [
  'https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call',
  'https://meetings.hubspot.com/ankit98/mybcat-discovery-call',
];

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  });
}

test('deployable sources and generators do not emit retired meeting destinations', () => {
  const hits = [];
  for (const root of deployableRoots) {
    for (const file of filesUnder(path.join(repoRoot, root))) {
      const content = fs.readFileSync(file, 'utf8');
      for (const destination of retiredDestinations) {
        if (content.includes(destination)) hits.push(path.relative(repoRoot, file));
      }
    }
  }
  assert.deepEqual(hits, []);
});

test('service CTA validation requires the native contact route', () => {
  const config = JSON.parse(fs.readFileSync(path.join(repoRoot, 'scripts/config/content-quality-rules.json'), 'utf8'));
  assert.deepEqual(config.ctaPatternsByFunnel.service, ['/contact/']);
  assert.deepEqual(config.ctaPatternsByFunnel.acquisition, ['/optometry-practice-transitions/']);
});

test('agent metadata exposes the native contact route as an absolute same-host HTTPS URL', () => {
  const agents = JSON.parse(fs.readFileSync(path.join(repoRoot, 'public/.well-known/agents.json'), 'utf8'));
  const meetingUrl = new URL(agents.contact.meeting_url);
  assert.equal(meetingUrl.href, 'https://mybcat.com/contact/');
  assert.equal(meetingUrl.protocol, 'https:');
  assert.equal(meetingUrl.hostname, 'mybcat.com');
});

test('obsolete meeting component is absent', () => {
  assert.equal(fs.existsSync(path.join(repoRoot, 'src/components/HubSpotMeeting.astro')), false);
});
