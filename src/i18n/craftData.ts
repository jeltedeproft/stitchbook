import type { Craft } from '../domain/types';
import type { Lang } from './lang';

const KNITTING_EN = [
  '2.0 mm (US 0)', '2.25 mm (US 1)', '2.75 mm (US 2)', '3.0 mm', '3.25 mm (US 3)',
  '3.5 mm (US 4)', '3.75 mm (US 5)', '4.0 mm (US 6)', '4.5 mm (US 7)', '5.0 mm (US 8)',
  '5.5 mm (US 9)', '6.0 mm (US 10)', '6.5 mm (US 10½)', '8.0 mm (US 11)', '9.0 mm (US 13)',
  '10 mm (US 15)', '12 mm (US 17)',
];

const CROCHET_EN = [
  '2.25 mm (B-1)', '2.75 mm (C-2)', '3.25 mm (D-3)', '3.5 mm (E-4)', '3.75 mm (F-5)',
  '4.0 mm (G-6)', '4.5 mm (7)', '5.0 mm (H-8)', '5.5 mm (I-9)', '6.0 mm (J-10)',
  '6.5 mm (K-10½)', '8.0 mm (L-11)', '9.0 mm (M/N-13)', '10 mm (N/P-15)',
];

const SEWING_EN = [
  'Machine 70/10', 'Machine 80/12', 'Machine 90/14', 'Machine 100/16', 'Machine 110/18',
  'Jersey 80/12', 'Denim 100/16', 'Hand needle', 'Twin needle 4.0',
];

// French patterns use metric sizes with a decimal comma.
const METRIC_FR = [
  '2 mm', '2,5 mm', '3 mm', '3,25 mm', '3,5 mm', '3,75 mm', '4 mm', '4,5 mm', '5 mm', '5,5 mm',
  '6 mm', '6,5 mm', '7 mm', '8 mm', '9 mm', '10 mm', '12 mm',
];

const SEWING_FR = [
  'Machine 70/10', 'Machine 80/12', 'Machine 90/14', 'Machine 100/16', 'Machine 110/18',
  'Jersey 80/12', 'Jean 100/16', 'Aiguille à main', 'Aiguille double 4,0',
];

export function toolSizeSuggestions(craft: Craft, lang: Lang): string[] {
  if (lang === 'fr') return craft === 'sewing' ? SEWING_FR : METRIC_FR;
  switch (craft) {
    case 'knitting':
      return KNITTING_EN;
    case 'crochet':
      return CROCHET_EN;
    case 'sewing':
      return SEWING_EN;
    default:
      return [...KNITTING_EN, ...CROCHET_EN];
  }
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
