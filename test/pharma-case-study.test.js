
import test from 'node:test';
import assert from 'node:assert/strict';
import Project from '../src/models/Project.js';
import { pharmaErp } from '../src/data/pharmaErpCaseStudy.js';
import { mergeScreenImages } from '../src/services/caseStudyPublisher.js';

const everyString = (value, out = []) => {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => everyString(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => everyString(v, out));
  return out;
};

test('the case study is valid against the Project schema', async () => {
  await new Project(pharmaErp).validate();
});

test('it is created as a private draft until reviewed, and is set to appear on the homepage', () => {
  assert.equal(pharmaErp.visibility, 'private');
  assert.equal(pharmaErp.meta.featured, true);
});

test('it contains no contact details or secrets (the source document is confidential)', () => {
  const text = everyString(pharmaErp).join('\n');
  assert.ok(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(text), 'email address found');
  assert.ok(!/\+?\d[\d\s-]{9,}\d/.test(text), 'phone-like number found');
  assert.ok(!/(api[_-]?key|secret|token)\s*[:=]/i.test(text), 'credential-like assignment found');
  assert.ok(!/https?:\/\//.test(text), 'unexpected URL found');
});

test('the in-depth blocks the project page renders are all filled in', () => {
  const cs = pharmaErp.caseStudy;
  for (const key of ['executiveSummary', 'keyMetrics', 'context', 'workflow', 'screens', 'challengePoints', 'approachSteps', 'architectureComponents', 'architectureNotes', 'deepDives', 'tradeoffs', 'security', 'deployment', 'results', 'improvements', 'reflection']) {
    assert.ok(cs[key] && (Array.isArray(cs[key]) ? cs[key].length : Object.keys(cs[key]).length), `${key} is empty`);
  }
  assert.ok(cs.deepDives.length >= 4);
});

test('the lifecycle covers both tracks and marks where a person decides', () => {
  const { stages } = pharmaErp.caseStudy.workflow;
  assert.ok(stages.length >= 8);
  assert.ok(stages.some((s) => s.track === 'sourcing') && stages.some((s) => s.track === 'finance'));
  assert.ok(stages.every((s) => s.title && s.detail));
  assert.ok(stages.some((s) => s.ai) && stages.some((s) => s.human));
  // sourcing stages come before finance stages, so the page can draw them as two tracks in order
  const firstFinance = stages.findIndex((s) => s.track === 'finance');
  assert.ok(stages.slice(firstFinance).every((s) => s.track === 'finance'));
});

test('the product tour ships with captions and no images (screenshots are added in the admin)', () => {
  const { screens } = pharmaErp.caseStudy;
  assert.ok(screens.length >= 6);
  assert.ok(screens.every((s) => s.title && s.caption && !s.image));
  assert.equal(new Set(screens.map((s) => s.title)).size, screens.length, 'screen titles must be unique');
});

test('refreshing the text keeps screenshots attached in the admin', () => {
  const fromFile = [
    { title: 'A', caption: 'new a', image: '' },
    { title: 'B', caption: 'new b', image: '' },
    { title: 'C', caption: 'new c', image: '' },
  ];
  const inDb = [
    { title: 'B', caption: 'old b', image: 'https://cdn/b.webp' },
    { title: 'Custom', caption: 'added by hand', image: 'https://cdn/custom.webp' },
    { title: 'A', caption: 'old a', image: '' },
  ];
  const merged = mergeScreenImages(fromFile, inDb);
  assert.deepEqual(
    merged.map((s) => [s.title, s.caption, s.image]),
    [
      ['A', 'new a', ''],
      ['B', 'new b', 'https://cdn/b.webp'],
      ['C', 'new c', ''],
      ['Custom', 'added by hand', 'https://cdn/custom.webp'],
    ]
  );
});

test('a renamed screen still inherits the image at its position', () => {
  const merged = mergeScreenImages([{ title: 'New name', caption: 'x', image: '' }], [{ title: 'Old name', caption: 'y', image: 'https://cdn/1.webp' }]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].image, 'https://cdn/1.webp');
});
