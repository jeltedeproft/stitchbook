import type { Project } from '../domain/types';
import type { ProjectRepository } from './repository';

/** Keeps data for the current tab only. Used when IndexedDB is unavailable, and in tests. */
export class MemoryProjectRepository implements ProjectRepository {
  readonly kind = 'memory' as const;
  private projects = new Map<string, Project>();
  private meta = new Map<string, unknown>();

  async loadAll(): Promise<Project[]> {
    return [...this.projects.values()].map((p) => structuredClone(p));
  }

  async save(project: Project): Promise<void> {
    this.projects.set(project.id, structuredClone(project));
  }

  async remove(id: string): Promise<void> {
    this.projects.delete(id);
  }

  async getMeta<T>(key: string): Promise<T | undefined> {
    return this.meta.get(key) as T | undefined;
  }

  async setMeta<T>(key: string, value: T): Promise<void> {
    this.meta.set(key, value);
  }
}
