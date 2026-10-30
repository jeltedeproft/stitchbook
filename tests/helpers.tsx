import { render } from '@testing-library/react';
import { App } from '../src/App';
import { addComponent } from '../src/domain/components';
import { createProject } from '../src/domain/projects';
import type { Craft, Project } from '../src/domain/types';
import { SEEDED_KEY } from '../src/state/bootstrap';
import { StoreProvider } from '../src/state/store';
import { ToastProvider } from '../src/state/toast';
import { MemoryProjectRepository } from '../src/storage/memoryRepository';
import type { ProjectRepository } from '../src/storage/repository';

export function makeProject(name = 'Test sweater', parts: string[] = [], craft: Craft = 'knitting'): Project {
  let p = createProject({ name, craft });
  for (const part of parts) p = addComponent(p, part);
  return p;
}

/** A repository that already holds the given projects and has passed first launch. */
export async function seededRepo(projects: Project[], repo: ProjectRepository = new MemoryProjectRepository()) {
  await repo.setMeta(SEEDED_KEY, true);
  for (const p of projects) await repo.save(p);
  return repo;
}

export function renderApp(repo: ProjectRepository) {
  const open = () => Promise.resolve(repo);
  return render(
    <ToastProvider>
      <StoreProvider openRepository={open}>
        <App />
      </StoreProvider>
    </ToastProvider>,
  );
}

export function goTo(hash: string) {
  window.location.hash = hash;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
