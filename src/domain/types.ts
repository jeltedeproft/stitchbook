export type Craft = 'knitting' | 'crochet' | 'sewing' | 'other';
export type ProjectStatus = 'planned' | 'in_progress' | 'paused' | 'completed';
export type ComponentStatus = 'not_started' | 'in_progress' | 'complete';
export type CountUnit = 'row' | 'round';

export interface Material {
  id: string;
  name: string;
  brand?: string;
  fiber?: string;
  colorName?: string;
  colorHex?: string;
  weight?: string;
  notes?: string;
}

/** A colour used by a component: linked to a project material, or a free-standing colour. */
export interface ColorAssignment {
  id: string;
  materialId?: string;
  customName?: string;
  customHex?: string;
  note?: string;
}

/** A note pinned to one row or round of a part, e.g. "start decreases". Rows are numbered from 1. */
export interface RowNote {
  row: number;
  text: string;
}

export interface ProjectComponent {
  id: string;
  name: string;
  status: ComponentStatus;
  countUnit: CountUnit;
  rows: number;
  targetRows?: number;
  stitches: number;
  toolSize?: string;
  colors: ColorAssignment[];
  notes?: string;
  /** Sorted by row, at most one note per row. */
  rowNotes?: RowNote[];
  countersEnabled: boolean;
}

export interface Project {
  id: string;
  name: string;
  craft: Craft;
  status: ProjectStatus;
  notes?: string;
  photo?: string;
  swatch: string;
  archived: boolean;
  isSample: boolean;
  materials: Material[];
  components: ProjectComponent[];
  lastComponentId?: string;
  createdAt: number;
  updatedAt: number;
}

export type CounterField = 'rows' | 'stitches';
