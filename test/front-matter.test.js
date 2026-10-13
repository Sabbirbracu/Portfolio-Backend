import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter, postToArticle, readTimeFor } from '../src/utils/frontMatter.js';

const blogDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/blog');

test('parseFrontMatter splits on the first colon only and converts types', () => {
  const { data, body } = parseFrontMatter('---\ntitle: A: B and C\norder: 2\npublished: false\n---\n\n# Hi\n');
  assert.equal(data.title, 'A: B and C');
  assert.equal(data.order, 2);
  assert.equal(data.published, false);
  assert.equal(body, '# Hi');
});

test('parseFrontMatter rejects a file without front matter', () => {
  assert.throws(() => parseFrontMatter('# no front matter'), /Missing front matter/);
});

test('readTimeFor ignores code blocks and never returns less than 1 minute', () => {
  assert.equal(readTimeFor('short'), '1 min read');
  const prose = 'word '.repeat(440);
  assert.equal(readTimeFor(prose + '\n```\n' + 'code '.repeat(5000) + '\n```'), '2 min read');
});

test('postToArticle requires the essential fields', () => {
  assert.throws(() => postToArticle('---\ntitle: T\n---\nbody', 'x'), /missing "description"/);
});

test('every published blog post is valid and every image it references exists', () => {
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  assert.ok(files.length >= 10, 'expected the ten launch posts');

  const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../PortfolioSite-main/public');
  const haveFrontend = fs.existsSync(publicDir);

  const orders = new Set();
  for (const f of files) {
    const slug = f.replace(/\.md$/, '');
    const { article, order } = postToArticle(fs.readFileSync(path.join(blogDir, f), 'utf8'), slug);

    assert.match(article.slug, /^[a-z0-9-]+$/);
    assert.ok(article.category, `${slug} needs a category`);
    assert.ok(!orders.has(order), `${slug}: duplicate order ${order}`);
    orders.add(order);
    assert.ok(article.content.length > 3000, `${slug} should be a substantial post`);
    assert.ok(!/^# /m.test(article.content.replace(/```[\s\S]*?```/g, '')), `${slug}: do not repeat the title as an H1 in the body`);

    const images = [...article.content.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]);
    assert.ok(images.length >= 2, `${slug} should include at least 2 inline images`);
    for (const img of [article.image, ...images]) {
      assert.ok(img.startsWith('/blog/'), `${slug}: unexpected image path ${img}`);
      if (haveFrontend) assert.ok(fs.existsSync(path.join(publicDir, img)), `${slug}: missing file ${img}`);
    }
    for (const m of article.content.matchAll(/!\[([^\]]*)\]/g)) assert.ok(m[1].length > 20, `${slug}: image alt text too short`);
  }
});
