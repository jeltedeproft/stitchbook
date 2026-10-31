import type { Craft } from '../domain/types';
import { formatNumber } from './I18nProvider';
import type { Lang, SizeSystem } from './lang';

/** A needle or hook size: its metric diameter and, where one exists, the US name. */
interface Size {
  mm: number;
  us?: string;
}

const KNITTING: Size[] = [
  { mm: 2, us: '0' }, { mm: 2.25, us: '1' }, { mm: 2.5 }, { mm: 2.75, us: '2' }, { mm: 3 },
  { mm: 3.25, us: '3' }, { mm: 3.5, us: '4' }, { mm: 3.75, us: '5' }, { mm: 4, us: '6' },
  { mm: 4.5, us: '7' }, { mm: 5, us: '8' }, { mm: 5.5, us: '9' }, { mm: 6, us: '10' },
  { mm: 6.5, us: '10½' }, { mm: 7 }, { mm: 8, us: '11' }, { mm: 9, us: '13' }, { mm: 10, us: '15' },
  { mm: 12, us: '17' }, { mm: 15, us: '19' },
];

const CROCHET: Size[] = [
  { mm: 2 }, { mm: 2.25, us: 'B-1' }, { mm: 2.5 }, { mm: 2.75, us: 'C-2' }, { mm: 3 },
  { mm: 3.25, us: 'D-3' }, { mm: 3.5, us: 'E-4' }, { mm: 3.75, us: 'F-5' }, { mm: 4, us: 'G-6' },
  { mm: 4.5, us: '7' }, { mm: 5, us: 'H-8' }, { mm: 5.5, us: 'I-9' }, { mm: 6, us: 'J-10' },
  { mm: 6.5, us: 'K-10½' }, { mm: 7 }, { mm: 8, us: 'L-11' }, { mm: 9, us: 'M/N-13' }, { mm: 10, us: 'N/P-15' },
  { mm: 12 },
];

// Machine needles carry both systems in their name already, so sewing has one list per language.
const SEWING: Record<Lang, string[]> = {
  en: [
    'Machine 70/10', 'Machine 80/12', 'Machine 90/14', 'Machine 100/16', 'Machine 110/18',
    'Jersey 80/12', 'Denim 100/16', 'Hand needle', 'Twin needle 4.0',
  ],
  fr: [
    'Machine 70/10', 'Machine 80/12', 'Machine 90/14', 'Machine 100/16', 'Machine 110/18',
    'Jersey 80/12', 'Jean 100/16', 'Aiguille à main', 'Aiguille double 4,0',
  ],
};

export interface ToolOption {
  value: string;
  label: string;
}

function sizesFor(craft: Craft): Size[] | undefined {
  if (craft === 'sewing') return undefined;
  return craft === 'crochet' ? CROCHET : KNITTING;
}

/** The diameter in "4.5 mm", "4,5 mm" or "4.5 mm (US 7)", if the text starts with one. */
function parseMm(value: string): number | undefined {
  const m = /^\s*(\d+(?:[.,]\d+)?)\s*mm\b/i.exec(value);
  return m ? Number(m[1].replace(',', '.')) : undefined;
}

/**
 * Sizes are stored as "4.5 mm" whatever the display system or language, so switching to US sizes
 * or to French relabels them instead of leaving old text behind. Other text is kept as typed.
 */
export function canonicalToolSize(value: string, craft: Craft): string {
  const mm = sizesFor(craft) ? parseMm(value) : undefined;
  return mm === undefined ? value.trim() : `${mm} mm`;
}

export function formatToolSize(value: string, craft: Craft, lang: Lang, system: SizeSystem): string {
  const sizes = sizesFor(craft);
  const mm = sizes ? parseMm(value) : undefined;
  if (mm === undefined) return value;
  const metric = `${formatNumber(lang, mm)} mm`;
  const us = system === 'us' ? sizes!.find((s) => s.mm === mm)?.us : undefined;
  return us ? `US ${us} (${metric})` : metric;
}

/** Choices for the size dropdown, in the chosen system. */
export function toolSizeOptions(craft: Craft, lang: Lang, system: SizeSystem): ToolOption[] {
  const sizes = sizesFor(craft);
  if (!sizes) return SEWING[lang].map((s) => ({ value: s, label: s }));
  return sizes.map(({ mm }) => {
    const value = `${mm} mm`;
    return { value, label: formatToolSize(value, craft, lang, system) };
  });
}

const PRESETS: Record<Lang, Record<Craft, string[]>> = {
  en: {
    knitting: ['Body', 'Front', 'Back', 'Left sleeve', 'Right sleeve', 'Collar', 'Cuff', 'Heel', 'Toe'],
    crochet: ['Squares', 'Body', 'Border', 'Sleeve', 'Brim', 'Strap'],
    sewing: ['Bodice', 'Skirt', 'Sleeves', 'Collar', 'Pockets', 'Lining', 'Hem'],
    other: ['Part 1', 'Part 2'],
  },
  fr: {
    knitting: ['Corps', 'Devant', 'Dos', 'Manche gauche', 'Manche droite', 'Col', 'Côtes', 'Talon', 'Pointe'],
    crochet: ['Carrés', 'Corps', 'Bordure', 'Manche', 'Bord', 'Bretelle'],
    sewing: ['Corsage', 'Jupe', 'Manches', 'Col', 'Poches', 'Doublure', 'Ourlet'],
    other: ['Partie 1', 'Partie 2'],
  },
};

/** Quick-add part names for the add-part form. */
export function partPresets(craft: Craft, lang: Lang): string[] {
  return PRESETS[lang][craft];
}
