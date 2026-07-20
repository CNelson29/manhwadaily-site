import { readFileSync } from 'node:fs';

type Manhwa = { title: string; cover: string; url: string; tags?: string[] };
type Indexed = Manhwa & { key: string };

const norm = (s: string) =>
  (s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

let INDEX: Indexed[] | null = null;
function load(): Indexed[] {
  if (INDEX) return INDEX;
  try {
    const raw = readFileSync(new URL('../../public/manhwa-data.json', import.meta.url), 'utf8');
    const data = JSON.parse(raw) as Manhwa[];
    INDEX = data
      .filter((m) => m.cover && m.title)
      .map((m) => ({ ...m, key: norm(m.title) }))
      .sort((a, b) => b.key.length - a.key.length);
  } catch {
    INDEX = [];
  }
  return INDEX;
}

/** First real manhwa cover named in a post body (raw markdown), or null. */
export function coverForBody(body: string | undefined): Manhwa | null {
  if (!body) return null;
  const index = load();
  const hay = norm(body);
  for (const m of index) {
    if (m.key.length >= 5 && hay.includes(m.key)) return m;
  }
  return null;
}

/** Match a cover by an arbitrary string (e.g. title), or null. */
export function coverForText(text: string | undefined): Manhwa | null {
  if (!text) return null;
  const key = norm(text);
  const index = load();
  return index.find((m) => m.key === key || key.includes(m.key) || (m.key.length > 6 && m.key.includes(key))) ?? null;
}
