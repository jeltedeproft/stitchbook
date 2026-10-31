import { describe, expect, it } from 'vitest';
import { sampleProjects } from '../../src/domain/sampleData';
import { canonicalToolSize, formatToolSize, partPresets, toolSizeOptions } from '../../src/i18n/craftData';
import { translate, translatePlural } from '../../src/i18n/I18nProvider';
import { detectLang, pluralCategory, rememberLang } from '../../src/i18n/lang';
import { en, fr, type MessageKey } from '../../src/i18n/messages';
import { updateComponent } from '../../src/domain/components';
import { progressSummary } from '../../src/ui/ProjectCard';
import { makeProject } from '../helpers';

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

// French counter labels start with the capitalised label ("Rangs : moins 1") where English uses
// the lower-case form ("Decrease rows"); both params are always passed.
const COUNTER_LABEL_KEYS = new Set<MessageKey>(['counter.decrease', 'counter.increase', 'counter.set', 'counter.resetLabel']);

describe('catalogues', () => {
  it('French has every English key and nothing extra', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
  });

  it('no translation is empty or left identical to a long English sentence', () => {
    for (const key of Object.keys(en) as MessageKey[]) {
      expect(fr[key].trim(), key).not.toBe('');
      if (en[key].length > 20) expect(fr[key], key).not.toBe(en[key]);
    }
  });

  it('translations use the same placeholders', () => {
    for (const key of Object.keys(en) as MessageKey[]) {
      if (COUNTER_LABEL_KEYS.has(key)) {
        for (const p of placeholders(fr[key])) expect(['label', 'lower'], key).toContain(p);
        continue;
      }
      expect(placeholders(fr[key]), key).toEqual(placeholders(en[key]));
    }
  });

  it('every plural key has both forms', () => {
    for (const key of Object.keys(en)) {
      if (key.endsWith('_one')) expect(en, key).toHaveProperty(key.replace(/_one$/, '_other'));
    }
  });
});

describe('translate', () => {
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(translate('en', 'common.edit', { name: 'Sleeve' })).toBe('Edit Sleeve');
    expect(translate('en', 'common.edit')).toBe('Edit {name}');
  });

  it('applies French typography without touching user text', () => {
    expect(translate('fr', 'app.details', { detail: 'a : b' })).toBe('Détails : a : b');
    expect(translate('fr', 'samples.confirmTitle')).toMatch(/exemple \?$/);
    expect(translate('fr', 'project.archived', { name: 'Pull' })).toBe('« Pull » archivé.');
  });

  it('uses each language’s plural rules', () => {
    expect(pluralCategory('en', 0)).toBe('other');
    expect(pluralCategory('fr', 0)).toBe('one');
    expect(pluralCategory('fr', 1)).toBe('one');
    expect(pluralCategory('fr', 2)).toBe('other');
    expect(translatePlural('en', 'part.colours', 1)).toBe('Colour');
    expect(translatePlural('en', 'part.colours', 3)).toBe('Colours');
    expect(translatePlural('fr', 'part.colours', 1)).toBe('Couleur');
    expect(translatePlural('fr', 'part.colours', 3)).toBe('Couleurs');
  });

  it('agrees part progress with the right number in each language', () => {
    const p = (done: number, total: number) => {
      let project = makeProject('P', Array.from({ length: total }, (_, i) => `Part ${i}`));
      for (const c of project.components.slice(0, done)) project = updateComponent(project, c.id, { status: 'complete' });
      return project;
    };
    const i18n = (lang: 'en' | 'fr') => ({
      lang,
      t: (k: MessageKey) => translate(lang, k),
      tp: (b: Parameters<typeof translatePlural>[1], n: number, params?: Record<string, string | number>) => translatePlural(lang, b, n, params),
    });
    expect(progressSummary(i18n('en'), p(1, 4))).toBe('1 of 4 parts done');
    expect(progressSummary(i18n('en'), p(0, 1))).toBe('0 of 1 part done');
    expect(progressSummary(i18n('fr'), p(1, 4))).toBe('1 partie terminée sur 4');
    expect(progressSummary(i18n('fr'), p(2, 4))).toBe('2 parties terminées sur 4');
    expect(progressSummary(i18n('fr'), p(0, 3))).toBe('0 partie terminée sur 3');
  });
});

describe('language detection', () => {
  it('follows the browser, then the remembered choice', () => {
    const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'languages')!;
    Object.defineProperty(navigator, 'languages', { configurable: true, get: () => ['fr-BE', 'en'] });
    try {
      expect(detectLang()).toBe('fr');
      rememberLang('en');
      expect(detectLang()).toBe('en');
    } finally {
      Object.defineProperty(navigator, 'languages', original);
    }
    localStorage.clear();
    expect(detectLang()).toBe('en'); // jsdom default is en-US
  });
});

describe('localised craft data', () => {
  it('shows sizes in metric or US, with a decimal comma in French', () => {
    const labels = (lang: 'en' | 'fr', system: 'metric' | 'us', craft: 'knitting' | 'crochet' = 'knitting') =>
      toolSizeOptions(craft, lang, system).map((o) => o.label);
    expect(labels('fr', 'metric')).toContain('4,5 mm');
    expect(labels('en', 'metric')).toContain('4.5 mm');
    expect(labels('en', 'us')).toContain('US 7 (4.5 mm)');
    expect(labels('en', 'us')).toContain('3 mm');
    expect(labels('en', 'us', 'crochet')).toContain('US G-6 (4 mm)');
    expect(toolSizeOptions('knitting', 'fr', 'us').find((o) => o.label === 'US 7 (4,5 mm)')?.value).toBe('4.5 mm');
    // Older free text is understood; anything else is kept as typed.
    expect(canonicalToolSize('4,5 mm (US 7)', 'knitting')).toBe('4.5 mm');
    expect(canonicalToolSize('Machine 80/12', 'sewing')).toBe('Machine 80/12');
    expect(formatToolSize('bamboo circulars', 'knitting', 'en', 'us')).toBe('bamboo circulars');
    expect(toolSizeOptions('sewing', 'fr', 'us').map((o) => o.label)).toContain('Jean 100/16');
    expect(partPresets('knitting', 'fr')).toContain('Manche gauche');
  });

  it('creates French sample projects', () => {
    const [sweater] = sampleProjects('fr');
    expect(sweater.name).toBe("Pull d'automne");
    expect(sweater.components.map((c) => c.name)).toEqual(['Corps', 'Manche gauche', 'Manche droite', 'Col']);
    // Structure is identical across languages.
    expect(sampleProjects('fr').map((p) => p.id)).toEqual(sampleProjects('en').map((p) => p.id));
  });
});
