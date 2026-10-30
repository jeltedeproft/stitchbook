import type { Craft, Project, ProjectStatus } from './types';

export interface ProjectFilter {
  query: string;
  status: ProjectStatus | 'all';
  craft: Craft | 'all';
  archived: boolean;
}

export const DEFAULT_FILTER: ProjectFilter = { query: '', status: 'all', craft: 'all', archived: false };

function haystack(p: Project): string {
  return [
    p.name,
    p.notes,
    ...p.materials.flatMap((m) => [m.name, m.brand, m.fiber, m.colorName]),
    ...p.components.flatMap((c) => [c.name, ...(c.rowNotes ?? []).map((n) => n.text)]),
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
}

export function filterProjects(projects: Project[], filter: ProjectFilter): Project[] {
  const terms = filter.query.toLowerCase().split(/\s+/).filter(Boolean);
  return projects.filter((p) => {
    if (p.archived !== filter.archived) return false;
    if (filter.status !== 'all' && p.status !== filter.status) return false;
    if (filter.craft !== 'all' && p.craft !== filter.craft) return false;
    if (terms.length === 0) return true;
    const text = haystack(p);
    return terms.every((t) => text.includes(t));
  });
}
