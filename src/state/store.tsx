import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Project } from '../domain/types';
import { useI18n } from '../i18n/I18nProvider';
import { importBackup, type ImportResult } from '../storage/backup';
import type { ProjectRepository } from '../storage/repository';
import { loadInitialProjects, openDefaultRepository } from './bootstrap';

type LoadStatus = 'loading' | 'ready' | 'error';

export interface Store {
  status: LoadStatus;
  loadError?: string;
  saveError?: string;
  storageKind?: ProjectRepository['kind'];
  projects: Project[];
  getProject(id: string): Project | undefined;
  /** Applies a change to one project, updates the UI immediately and persists it. */
  update(id: string, change: (p: Project) => Project): Project | undefined;
  add(project: Project): void;
  remove(id: string): Promise<void>;
  removeSamples(): Promise<number>;
  importJson(json: string): Promise<ImportResult>;
  retry(): void;
}

const StoreContext = createContext<Store | null>(null);

interface ProviderProps {
  children: ReactNode;
  /** Injected in tests; defaults to on-device IndexedDB storage. */
  openRepository?: () => Promise<ProjectRepository>;
}

export function StoreProvider({ children, openRepository = openDefaultRepository }: ProviderProps) {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [loadError, setLoadError] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [attempt, setAttempt] = useState(0);
  const repoRef = useRef<ProjectRepository | null>(null);
  // Samples are created in the language active at first launch; switching later doesn't reload.
  const { lang } = useI18n();
  const langRef = useRef(lang);
  // Mirror of `projects` so rapid taps always build on the latest value, not a stale render.
  const projectsRef = useRef<Project[]>([]);

  const setAll = useCallback((next: Project[]) => {
    projectsRef.current = next;
    setProjects(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const repo = repoRef.current ?? (await openRepository());
        repoRef.current = repo;
        const loaded = await loadInitialProjects(repo, langRef.current);
        if (cancelled) return;
        setAll(loaded);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : 'Something went wrong while loading.');
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, openRepository, setAll]);

  const persist = useCallback((p: Project) => {
    repoRef.current
      ?.save(p)
      .then(() => setSaveError(undefined))
      .catch((e: unknown) =>
        setSaveError(e instanceof Error ? e.message : 'Your latest change could not be saved.'),
      );
  }, []);

  const update = useCallback<Store['update']>(
    (id, change) => {
      const current = projectsRef.current.find((p) => p.id === id);
      if (!current) return undefined;
      const next = change(current);
      if (next === current) return current;
      setAll(projectsRef.current.map((p) => (p.id === id ? next : p)));
      persist(next);
      return next;
    },
    [persist, setAll],
  );

  const add = useCallback<Store['add']>(
    (project) => {
      setAll([project, ...projectsRef.current]);
      persist(project);
    },
    [persist, setAll],
  );

  const remove = useCallback<Store['remove']>(
    async (id) => {
      setAll(projectsRef.current.filter((p) => p.id !== id));
      try {
        await repoRef.current?.remove(id);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : 'The project could not be deleted from storage.');
      }
    },
    [setAll],
  );

  const removeSamples = useCallback<Store['removeSamples']>(async () => {
    const samples = projectsRef.current.filter((p) => p.isSample);
    for (const s of samples) await remove(s.id);
    return samples.length;
  }, [remove]);

  const importJson = useCallback<Store['importJson']>(
    async (json) => {
      const result = importBackup(json, projectsRef.current);
      setAll(result.merged);
      for (const p of result.changed) persist(p);
      return result;
    },
    [persist, setAll],
  );

  const value = useMemo<Store>(
    () => ({
      status,
      loadError,
      saveError,
      storageKind: repoRef.current?.kind,
      projects,
      getProject: (id) => projects.find((p) => p.id === id),
      update,
      add,
      remove,
      removeSamples,
      importJson,
      retry: () => {
        setSaveError(undefined);
        if (status === 'error') {
          repoRef.current = null;
          setAttempt((a) => a + 1);
        } else {
          projectsRef.current.forEach(persist);
        }
      },
    }),
    [status, loadError, saveError, projects, update, add, remove, removeSamples, importJson, persist],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}
