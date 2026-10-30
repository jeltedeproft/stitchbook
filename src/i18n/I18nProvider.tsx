import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { detectLang, pluralCategory, rememberLang, type Lang } from './lang';
import { catalogues, type MessageKey } from './messages';

export type Params = Record<string, string | number>;

/** Base names of keys that have `_one` / `_other` forms, e.g. 'overview.active'. */
export type PluralKey = {
  [K in MessageKey]: K extends `${infer Base}_one` ? Base : never;
}[MessageKey];

/** French typography: no-break space before ":" and inside « », narrow one before ; ? ! */
function frenchSpacing(s: string): string {
  return s
    .replace(/ :/g, ' :')
    .replace(/ ([;?!])/g, ' $1')
    .replace(/« /g, '« ')
    .replace(/ »/g, ' »');
}

export function translate(lang: Lang, key: MessageKey, params?: Params): string {
  let template: string = catalogues[lang][key] ?? catalogues.en[key] ?? key;
  if (lang === 'fr') template = frenchSpacing(template);
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function translatePlural(lang: Lang, base: PluralKey, count: number, params?: Params): string {
  const key = `${base}_${pluralCategory(lang, count)}` as MessageKey;
  return translate(lang, key, { count: formatNumber(lang, count), ...params });
}

export function formatNumber(lang: Lang, n: number): string {
  return n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US');
}

export interface I18n {
  lang: Lang;
  setLang(lang: Lang): void;
  t(key: MessageKey, params?: Params): string;
  tp(base: PluralKey, count: number, params?: Params): string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(() => initialLang ?? detectLang());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    rememberLang(next);
    setLangState(next);
  }, []);

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
      tp: (base, count, params) => translatePlural(lang, base, count, params),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
