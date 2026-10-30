import type { Project } from '../domain/types';
import { normalizeProject } from '../domain/validation';

export const BACKUP_APP = 'knit';
export const BACKUP_VERSION = 1;

export interface BackupFile {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: number;
  projects: Project[];
}

export interface ImportResult {
  merged: Project[];
  /** Projects that need writing to storage (new or newer than the local copy). */
  changed: Project[];
  added: number;
  updated: number;
  skipped: number;
}

export type BackupIssue = 'notJson' | 'notBackup' | 'wrongVersion';

export class BackupFormatError extends Error {
  constructor(readonly code: BackupIssue) {
    super(`Invalid backup: ${code}`);
  }
}

export function createBackup(projects: Project[], exportedAt = Date.now()): BackupFile {
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt, projects };
}

export function backupFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `knit-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

/** Parses a backup file and merges it into the current projects (newest `updatedAt` wins). */
export function importBackup(json: string, current: Project[]): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new BackupFormatError('notJson');
  }
  const file = data as Partial<BackupFile> | null;
  if (!file || file.app !== BACKUP_APP || !Array.isArray(file.projects)) {
    throw new BackupFormatError('notBackup');
  }
  if (file.version !== BACKUP_VERSION) {
    throw new BackupFormatError('wrongVersion');
  }

  const byId = new Map(current.map((p) => [p.id, p]));
  const changed: Project[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const raw of file.projects) {
    const incoming = normalizeProject(raw);
    if (!incoming) {
      skipped++;
      continue;
    }
    const existing = byId.get(incoming.id);
    if (!existing) {
      added++;
    } else if (incoming.updatedAt > existing.updatedAt) {
      updated++;
    } else {
      continue;
    }
    byId.set(incoming.id, incoming);
    changed.push(incoming);
  }

  return { merged: [...byId.values()], changed, added, updated, skipped };
}
