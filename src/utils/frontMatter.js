// Minimal front-matter parser for the blog's markdown files. Supports flat `key: value` pairs between
// two `---` lines (values may contain colons). Booleans and integers are converted. No dependencies.

const WORDS_PER_MINUTE = 220;

const coerce = (value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
};

export const parseFrontMatter = (raw) => {
  const match = raw.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("Missing front matter: file must start with a --- block");

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) throw new Error(`Invalid front matter line: "${line}"`);
    data[line.slice(0, idx).trim()] = coerce(line.slice(idx + 1).trim());
  }
  return { data, body: match[2].trim() };
};

export const readTimeFor = (markdown) => {
  const words = markdown.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
};

// Turns one markdown file into an Article document. The slug comes from the file name.
export const postToArticle = (raw, slug) => {
  const { data, body } = parseFrontMatter(raw);
  for (const key of ["title", "description", "category", "date"]) {
    if (!data[key]) throw new Error(`${slug}: front matter is missing "${key}"`);
  }
  return {
    article: {
      slug,
      title: data.title,
      description: data.description,
      image: data.image || "",
      date: data.date,
      category: data.category,
      readTime: data.readTime || readTimeFor(body),
      published: data.published !== false,
      content: body,
    },
    order: Number.isInteger(data.order) ? data.order : 99,
  };
};
