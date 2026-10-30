import { sampleProjects } from '../domain/sampleData';
import type { Lang } from '../i18n/lang';
import type { Project } from '../domain/types';
import { IndexedDbProjectRepository } from '../storage/indexedDbRepository';
import { MemoryProjectRepository } from '../storage/memoryRepository';
import type { ProjectRepository } from '../storage/repository';

export const SEEDED_KEY = 'seeded';

/**
 * Loads projects, creating sample projects exactly once: on the very first launch with an empty
 * store. The "seeded" flag is set either way, so samples never reappear after being removed and
 * are never mixed into an existing collection.
 */
export async function loadInitialProjects(repo: ProjectRepository, lang: Lang = 'en'): Promise<Project[]> {
  const projects = await repo.loadAll();
  const seeded = await repo.getMeta<boolean>(SEEDED_KEY);
  if (seeded) return projects;

  if (projects.length > 0) {
    await repo.setMeta(SEEDED_KEY, true);
    return projects;
  }

  // Save samples before setting the flag: if the app closes in between, the next launch sees
  // projects and just sets the flag, rather than ending up flagged with no samples.
  const samples = sampleProjects(lang);
  for (const s of samples) await repo.save(s);
  await repo.setMeta(SEEDED_KEY, true);
  return samples;
}

/** Opens on-device storage, falling back to tab-only memory when the browser blocks it. */
export async function openDefaultRepository(): Promise<ProjectRepository> {
  try {
    return await IndexedDbProjectRepository.open();
  } catch {
    return new MemoryProjectRepository();
  }
}
