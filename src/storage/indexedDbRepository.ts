import type { Project } from '../domain/types';
import { normalizeProject } from '../domain/validation';
import { StorageError, type ProjectRepository } from './repository';

const DB_VERSION = 1;
const PROJECTS = 'projects';
const META = 'meta';

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDb(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new StorageError('This browser does not offer local storage (IndexedDB).'));
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(name, DB_VERSION);
    } catch (e) {
      reject(new StorageError('Local storage is blocked in this browser.', e));
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECTS)) db.createObjectStore(PROJECTS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new StorageError('Could not open local storage.', request.error));
    request.onblocked = () => reject(new StorageError('Local storage is busy in another tab.'));
  });
}

/**
 * Stores each project as one record in IndexedDB. Writes are chained so they land in the order
 * they were issued, even when a counter is tapped quickly.
 */
export class IndexedDbProjectRepository implements ProjectRepository {
  readonly kind = 'device' as const;
  private queue: Promise<unknown> = Promise.resolve();

  private constructor(private readonly db: IDBDatabase) {}

  static async open(name = 'knit'): Promise<IndexedDbProjectRepository> {
    return new IndexedDbProjectRepository(await openDb(name));
  }

  close(): void {
    this.db.close();
  }

  private write(store: string, run: (s: IDBObjectStore) => void): Promise<void> {
    const op = this.queue.then(
      () =>
        new Promise<void>((resolve, reject) => {
          let tx: IDBTransaction;
          try {
            tx = this.db.transaction(store, 'readwrite');
            run(tx.objectStore(store));
          } catch (e) {
            reject(new StorageError('Could not save your changes.', e));
            return;
          }
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(new StorageError('Could not save your changes.', tx.error));
          tx.onabort = () => reject(new StorageError('Saving was interrupted (storage may be full).', tx.error));
        }),
    );
    // Keep the chain alive after a failure so later writes still run.
    this.queue = op.catch(() => undefined);
    return op;
  }

  async loadAll(): Promise<Project[]> {
    await this.queue;
    try {
      const tx = this.db.transaction(PROJECTS, 'readonly');
      const raw = await promisify(tx.objectStore(PROJECTS).getAll());
      return raw.map(normalizeProject).filter((p): p is Project => !!p);
    } catch (e) {
      throw new StorageError('Could not read your projects.', e);
    }
  }

  save(project: Project): Promise<void> {
    return this.write(PROJECTS, (s) => s.put(project));
  }

  remove(id: string): Promise<void> {
    return this.write(PROJECTS, (s) => s.delete(id));
  }

  async getMeta<T>(key: string): Promise<T | undefined> {
    await this.queue;
    try {
      const tx = this.db.transaction(META, 'readonly');
      return (await promisify(tx.objectStore(META).get(key))) as T | undefined;
    } catch (e) {
      throw new StorageError('Could not read app settings.', e);
    }
  }

  setMeta<T>(key: string, value: T): Promise<void> {
    return this.write(META, (s) => s.put(value, key));
  }
}
