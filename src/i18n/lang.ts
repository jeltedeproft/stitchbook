export type Lang = 'en' | 'fr';
export const LANGS: Lang[] = ['en', 'fr'];

const STORAGE_KEY = 'stitchbook.lang';

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'fr';
}

/** The remembered choice, else the browser's preferred language, else English. */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // Storage can be blocked (private mode); fall back to the browser language.
  }
  const preferred = typeof navigator !== 'undefined' ? (navigator.languages ?? [navigator.language]) : [];
  return preferred.some((l) => l?.toLowerCase().startsWith('fr')) ? 'fr' : 'en';
}

export function rememberLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not fatal: the language just won't be remembered next time.
  }
}

/** CLDR plural category for the two forms we use. French treats 0 and 1 as singular. */
export function pluralCategory(lang: Lang, count: number): 'one' | 'other' {
  if (lang === 'fr') return count >= 0 && count < 2 ? 'one' : 'other';
  return count === 1 ? 'one' : 'other';
}
