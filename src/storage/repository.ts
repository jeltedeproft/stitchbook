import type { Project } from '../domain/types';

/**
 * The single boundary between app state and storage. A shared/synced backend can be added by
 * implementing this interface; nothing above it knows where data lives.
 */
export interface ProjectRepository {
  /** Human-readable description shown in Settings. */
  readonly kind: 'device' | 'memory';
  loadAll(): Promise<Project[]>;
  save(project: Project): Promise<void>;
  remove(id: string): Promise<void>;
  getMeta<T>(key: string): Promise<T | undefined>;
  setMeta<T>(key: string, value: T): Promise<void>;
}

export class StorageError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}
