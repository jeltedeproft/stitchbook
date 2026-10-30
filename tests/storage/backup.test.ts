import { describe, expect, it } from 'vitest';
import { setCount } from '../../src/domain/counters';
import { loadInitialProjects, SEEDED_KEY } from '../../src/state/bootstrap';
import { BackupFormatError, backupFileName, createBackup, importBackup } from '../../src/storage/backup';
import { MemoryProjectRepository } from '../../src/storage/memoryRepository';
import { makeProject } from '../helpers';

describe('first-launch sample data', () => {
  it('seeds labelled samples into an empty store, once', async () => {
    const repo = new MemoryProjectRepository();
    const first = await loadInitialProjects(repo);
    expect(first).toHaveLength(3);
    expect(first.every((p) => p.isSample)).toBe(true);
    expect(await repo.getMeta(SEEDED_KEY)).toBe(true);

    // User removes the samples; they must not come back.
    for (const p of first) await repo.remove(p.id);
    expect(await loadInitialProjects(repo)).toEqual([]);
  });

  it('never adds samples to a store that already holds real projects', async () => {
    const repo = new MemoryProjectRepository();
    const mine = makeProject('My real project');
    await repo.save(mine);
    const loaded = await loadInitialProjects(repo);
    expect(loaded).toEqual([mine]);
    expect(await repo.getMeta(SEEDED_KEY)).toBe(true);
  });
});

describe('backup import/export', () => {
  it('names files by date', () => {
    expect(backupFileName(new Date(2026, 9, 3))).toBe('knit-backup-2026-10-03.json');
  });

  it('adds new projects and keeps the newest version of shared ones', () => {
    const shared = makeProject('Shared blanket', ['Squares']);
    const squares = shared.components[0].id;
    const mineNewer = setCount(shared, squares, 'rows', 20);
    const theirsOlder = { ...setCount(shared, squares, 'rows', 5), updatedAt: mineNewer.updatedAt - 1000 };
    const theirsOnly = makeProject('Friend hat');

    const file = JSON.stringify(createBackup([theirsOlder, theirsOnly]));
    const r = importBackup(file, [mineNewer]);
    expect(r).toMatchObject({ added: 1, updated: 0, skipped: 0 });
    expect(r.merged.find((p) => p.id === shared.id)?.components[0].rows).toBe(20);
    expect(r.changed.map((p) => p.name)).toEqual(['Friend hat']);

    // Now their copy is newer.
    const theirsNewer = { ...setCount(shared, squares, 'rows', 31), updatedAt: mineNewer.updatedAt + 1000 };
    const r2 = importBackup(JSON.stringify(createBackup([theirsNewer])), [mineNewer]);
    expect(r2).toMatchObject({ added: 0, updated: 1 });
    expect(r2.merged[0].components[0].rows).toBe(31);
  });

  it('re-importing your own export changes nothing', () => {
    const projects = [makeProject('A', ['x']), makeProject('B')];
    const r = importBackup(JSON.stringify(createBackup(projects)), projects);
    expect(r).toMatchObject({ added: 0, updated: 0, skipped: 0, changed: [] });
  });

  it('skips invalid projects but imports the rest', () => {
    const file = JSON.stringify({ app: 'knit', version: 1, exportedAt: 0, projects: [{ id: 'x' }, makeProject('Good')] });
    const r = importBackup(file, []);
    expect(r).toMatchObject({ added: 1, skipped: 1 });
  });

  it('rejects files that are not Knit backups', () => {
    expect(() => importBackup('not json', [])).toThrow(BackupFormatError);
    expect(() => importBackup('{"app":"other","projects":[]}', [])).toThrow(BackupFormatError);
    expect(() => importBackup('{"app":"knit","version":99,"projects":[]}', [])).toThrow(BackupFormatError);
    expect(() => importBackup('null', [])).toThrow(BackupFormatError);
  });
});
