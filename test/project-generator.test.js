import test from 'node:test';
import assert from 'node:assert/strict';
import { extractJson, normalizeDraft } from '../src/services/projectGenerator.js';

test('extractJson tolerates prose and code fences around the object', () => {
  const reply = 'Here you go:\n```json\n{"title":"A","nested":{"x":1}}\n```';
  assert.deepEqual(extractJson(reply), { title: 'A', nested: { x: 1 } });
});

test('extractJson rejects replies with no JSON object', () => {
  assert.throws(() => extractJson('sorry, no'), /did not contain a project/);
});

test('normalizeDraft fixes enums, slug, and drops media + unknown keys', () => {
  const draft = normalizeDraft({
    title: 'My Cool App!',
    description: 'Does things.',
    type: 'not-a-type',
    status: 'weird',
    year: '2025',
    media: { banner: 'https://evil.example/x.png' },
    bogus: 'dropped',
    techStack: { primary: ['Next.js'] },
    meta: { featured: true, order: 5, tags: ['a'] },
  });

  assert.equal(draft.slug, 'my-cool-app');
  assert.equal(draft.type, 'fullstack');
  assert.equal(draft.status, 'in-progress');
  assert.equal(draft.visibility, 'public');
  assert.equal(draft.year, 2025);
  assert.equal(draft.media.banner, '');
  assert.equal(draft.bogus, undefined);
  assert.equal(draft.id, undefined);
  assert.equal(draft.meta.featured, false); // AI drafts never auto-publish to the homepage
  assert.deepEqual(draft.techStack.primary, ['Next.js']);
});
