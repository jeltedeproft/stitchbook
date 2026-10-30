import { describe, expect, it } from 'vitest';
import { changeCount } from '../../src/domain/counters';
import { updateComponent } from '../../src/domain/components';
import { addMaterial } from '../../src/domain/materials';
import { IndexedDbProjectRepository } from '../../src/storage/indexedDbRepository';
import { MemoryProjectRepository } from '../../src/storage/memoryRepository';
import { makeProject } from '../helpers';

let dbCounter = 0;
const freshName = () => `knit-test-${++dbCounter}-${Math.random()}`;

describe('IndexedDbProjectRepository', () => {
  it('round-trips a full project across repository instances', async () => {
    const name = freshName();
    let p = makeProject('Harvest sweater', ['Body', 'Left sleeve']);
    p = addMaterial(p, { name: 'Highland', colorName: 'Rust', colorHex: '#a0522d' });
    p = updateComponent(p, p.components[1].id, {
      toolSize: '4.5 mm',
      targetRows: 96,
      countUnit: 'round',
      colors: [{ id: 'c1', materialId: p.materials[0].id, note: 'stripes' }],
    });
    p = changeCount(p, p.components[1].id, 'rows', 34);

    const repo = await IndexedDbProjectRepository.open(name);
    await repo.save(p);
    repo.close();

    const reopened = await IndexedDbProjectRepository.open(name);
    const loaded = await reopened.loadAll();
    reopened.close();
    expect(loaded).toEqual([p]);
  });

  it('applies rapid writes in order so the last counter value wins', async () => {
    const repo = await IndexedDbProjectRepository.open(freshName());
    let p = makeProject('Socks', ['Cuff']);
    const id = p.components[0].id;
    const writes: Promise<void>[] = [];
    for (let i = 0; i < 25; i++) {
      p = changeCount(p, id, 'rows', 1);
      writes.push(repo.save(p));
    }
    await Promise.all(writes);
    const [loaded] = await repo.loadAll();
    expect(loaded.components[0].rows).toBe(25);
    repo.close();
  });

  it('removes projects and stores metadata', async () => {
    const repo = await IndexedDbProjectRepository.open(freshName());
    const a = makeProject('A');
    const b = makeProject('B');
    await repo.save(a);
    await repo.save(b);
    await repo.remove(a.id);
    await repo.remove('missing-id');
    expect((await repo.loadAll()).map((p) => p.name)).toEqual(['B']);
    expect(await repo.getMeta('seeded')).toBeUndefined();
    await repo.setMeta('seeded', true);
    expect(await repo.getMeta('seeded')).toBe(true);
    repo.close();
  });
});

describe('MemoryProjectRepository', () => {
  it('stores copies, not live references', async () => {
    const repo = new MemoryProjectRepository();
    const p = makeProject('A', ['x']);
    await repo.save(p);
    p.components[0].rows = 99;
    const [loaded] = await repo.loadAll();
    expect(loaded.components[0].rows).toBe(0);
  });
});
