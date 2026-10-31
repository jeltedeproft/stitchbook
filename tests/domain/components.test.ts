import { describe, expect, it } from 'vitest';
import {
  addColor,
  addComponent,
  moveComponent,
  removeColor,
  removeComponent,
  renameComponent,
  restoreComponent,
  updateComponent,
} from '../../src/domain/components';
import { setCount } from '../../src/domain/counters';
import { ValidationError } from '../../src/domain/projects';
import { makeProject } from '../helpers';

const names = (p: { components: { name: string }[] }) => p.components.map((c) => c.name);

describe('components', () => {
  it('adds components at the end with sensible defaults', () => {
    const p = addComponent(makeProject('Sweater', ['Body']), '  Left sleeve ');
    expect(names(p)).toEqual(['Body', 'Left sleeve']);
    expect(p.components[1]).toMatchObject({ status: 'not_started', rows: 0, stitches: 0, countUnit: 'row', colors: [] });
  });

  it('rejects empty and too-long names', () => {
    const p = makeProject();
    expect(() => addComponent(p, '   ')).toThrow(ValidationError);
    expect(() => addComponent(p, 'x'.repeat(61))).toThrow(ValidationError);
    const withOne = addComponent(p, 'Body');
    expect(() => renameComponent(withOne, withOne.components[0].id, '')).toThrow(ValidationError);
  });

  it('allows duplicate names (two sleeves)', () => {
    const p = makeProject('Sweater', ['Sleeve', 'Sleeve']);
    expect(names(p)).toEqual(['Sleeve', 'Sleeve']);
    expect(p.components[0].id).not.toBe(p.components[1].id);
  });

  it('renames and edits without touching other components', () => {
    const p = makeProject('Sweater', ['Body', 'Collar']);
    const [body, collar] = p.components;
    const next = updateComponent(renameComponent(p, body.id, 'Front'), body.id, {
      toolSize: ' 4.5 mm ',
      targetRows: 120,
      countUnit: 'round',
      notes: 'Waist shaping',
      status: 'in_progress',
    });
    expect(next.components[0]).toMatchObject({ name: 'Front', toolSize: '4.5 mm', targetRows: 120, countUnit: 'round', notes: 'Waist shaping', status: 'in_progress' });
    expect(next.components[1]).toEqual(collar);
  });

  it('keeps per-component tool sizes independent', () => {
    let p = makeProject('Sweater', ['Body', 'Rib']);
    p = updateComponent(p, p.components[0].id, { toolSize: '4.5 mm' });
    p = updateComponent(p, p.components[1].id, { toolSize: '3.5 mm' });
    expect(p.components.map((c) => c.toolSize)).toEqual(['4.5 mm', '3.5 mm']);
  });

  it('clears an emptied target and clamps counts in patches', () => {
    let p = makeProject('Sweater', ['Body']);
    const id = p.components[0].id;
    p = updateComponent(p, id, { targetRows: 50 });
    p = updateComponent(p, id, { targetRows: undefined, rows: -4 });
    expect(p.components[0].targetRows).toBeUndefined();
    expect(p.components[0].rows).toBe(0);
  });

  it('reorders up and down and ignores moves past the ends', () => {
    const p = makeProject('Sweater', ['A', 'B', 'C']);
    const [a, , c] = p.components;
    expect(names(moveComponent(p, c.id, -1))).toEqual(['A', 'C', 'B']);
    expect(names(moveComponent(p, a.id, 1))).toEqual(['B', 'A', 'C']);
    expect(moveComponent(p, a.id, -1)).toBe(p);
    expect(moveComponent(p, c.id, 1)).toBe(p);
  });

  it('removes and restores a component at its original position with its counts', () => {
    let p = makeProject('Sweater', ['A', 'B', 'C']);
    const b = p.components[1];
    p = setCount(p, b.id, 'rows', 17);
    const removed = removeComponent(p, b.id)!;
    expect(names(removed.project)).toEqual(['A', 'C']);
    expect(removed.project.lastComponentId).toBeUndefined();
    const restored = restoreComponent(removed.project, removed.component, removed.index);
    expect(names(restored)).toEqual(['A', 'B', 'C']);
    expect(restored.components[1].rows).toBe(17);
    // Restoring twice does not duplicate.
    expect(restoreComponent(restored, removed.component, removed.index).components).toHaveLength(3);
  });

  it('manages colour assignments linked to materials', () => {
    let p = makeProject('Sweater', ['Body']);
    const id = p.components[0].id;
    p = addColor(p, id, { materialId: 'mat-1', note: ' stripes every 4 rows ' });
    p = addColor(p, id, { customName: 'Gold', customHex: '#d4a35a' });
    expect(p.components[0].colors).toHaveLength(2);
    expect(p.components[0].colors[0]).toMatchObject({ materialId: 'mat-1', note: 'stripes every 4 rows' });
    p = removeColor(p, id, p.components[0].colors[0].id);
    expect(p.components[0].colors.map((c) => c.customName)).toEqual(['Gold']);
  });
});
