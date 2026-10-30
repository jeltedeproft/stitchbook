import type { ComponentStatus, CountUnit, Craft, ProjectStatus } from './types';

export const CRAFTS: Craft[] = ['knitting', 'crochet', 'sewing', 'other'];
export const PROJECT_STATUSES: ProjectStatus[] = ['planned', 'in_progress', 'paused', 'completed'];
export const COMPONENT_STATUSES: ComponentStatus[] = ['not_started', 'in_progress', 'complete'];

export const CRAFT_LABEL: Record<Craft, string> = {
  knitting: 'Knitting',
  crochet: 'Crochet',
  sewing: 'Sewing',
  other: 'Other craft',
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  paused: 'Paused',
  completed: 'Completed',
};

export const COMPONENT_STATUS_LABEL: Record<ComponentStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  complete: 'Complete',
};

export function toolLabel(craft: Craft): string {
  switch (craft) {
    case 'knitting':
      return 'Needle size';
    case 'crochet':
      return 'Hook size';
    default:
      return 'Needle / tool';
  }
}

export function unitLabel(unit: CountUnit, plural = false): string {
  if (unit === 'round') return plural ? 'Rounds' : 'Round';
  return plural ? 'Rows' : 'Row';
}

/** Whether row/stitch counters make sense by default for a craft. */
export function countersByDefault(craft: Craft): boolean {
  return craft !== 'sewing';
}

const KNITTING_SIZES = [
  '2.0 mm (US 0)', '2.25 mm (US 1)', '2.75 mm (US 2)', '3.0 mm', '3.25 mm (US 3)',
  '3.5 mm (US 4)', '3.75 mm (US 5)', '4.0 mm (US 6)', '4.5 mm (US 7)', '5.0 mm (US 8)',
  '5.5 mm (US 9)', '6.0 mm (US 10)', '6.5 mm (US 10½)', '8.0 mm (US 11)', '9.0 mm (US 13)',
  '10 mm (US 15)', '12 mm (US 17)',
];

const CROCHET_SIZES = [
  '2.25 mm (B-1)', '2.75 mm (C-2)', '3.25 mm (D-3)', '3.5 mm (E-4)', '3.75 mm (F-5)',
  '4.0 mm (G-6)', '4.5 mm (7)', '5.0 mm (H-8)', '5.5 mm (I-9)', '6.0 mm (J-10)',
  '6.5 mm (K-10½)', '8.0 mm (L-11)', '9.0 mm (M/N-13)', '10 mm (N/P-15)',
];

const SEWING_SIZES = [
  'Machine 70/10', 'Machine 80/12', 'Machine 90/14', 'Machine 100/16', 'Machine 110/18',
  'Jersey 80/12', 'Denim 100/16', 'Hand needle', 'Twin needle 4.0',
];

export function toolSizeSuggestions(craft: Craft): string[] {
  switch (craft) {
    case 'knitting':
      return KNITTING_SIZES;
    case 'crochet':
      return CROCHET_SIZES;
    case 'sewing':
      return SEWING_SIZES;
    default:
      return [...KNITTING_SIZES, ...CROCHET_SIZES];
  }
}

/** Warm swatches used as a project's visual identifier when it has no photo. */
export const SWATCHES = [
  '#c2643c', '#8a9a5b', '#b5838d', '#d4a35a', '#5c7c8a', '#7d5a7a', '#a0522d', '#6b8f71',
];
