# Contract: ProjectRepository

The only boundary between app state and storage. A future shared backend implements the same
interface.

```ts
interface ProjectRepository {
  /** All projects, archived included. Rejects with StorageError when storage is unreadable. */
  loadAll(): Promise<Project[]>;
  /** Insert or replace by id. */
  save(project: Project): Promise<void>;
  /** Remove permanently; no-op if missing. */
  remove(id: string): Promise<void>;
  /** Small key/value metadata (e.g. "seeded"). */
  getMeta<T>(key: string): Promise<T | undefined>;
  setMeta<T>(key: string, value: T): Promise<void>;
}
```

Guarantees:

- `save` followed by `loadAll` (in a new repository instance on the same database) returns a
  deep-equal project.
- Writes for a single repository instance are applied in call order.
- Implementations: `IndexedDbProjectRepository` (database `knit`, stores `projects`, `meta`),
  `MemoryProjectRepository` (fallback when IndexedDB is unavailable; tests).

Future sync implementation notes: use `updatedAt` for last-write-wins per project; `remove` should
leave a tombstone so deletions propagate.
