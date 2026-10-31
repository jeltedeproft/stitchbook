import { describe, expect, it } from 'vitest';
import { setCount } from '../../src/domain/counters';
import { updateComponent } from '../../src/domain/components';
import { componentProgress } from '../../src/domain/progress';
import { isFinished, pieceRows, rowNote, setRowNote, topRow, upcomingNotes, workingRow } from '../../src/domain/rowNotes';
import { normalizeProject } from '../../src/domain/validation';
import { makeProject } from '../helpers';

const setup = () => {
  const p = makeProject('Sweater', ['Sleeve']);
  return { p, id: p.components[0].id };
};

describe('row notes', () => {
  it('adds, replaces and removes notes, kept sorted with one per row', () => {
    const { p, id } = setup();
    let next = setRowNote(p, id, 40, '  Decrease round  ');
    next = setRowNote(next, id, 12, 'Stripe');
    next = setRowNote(next, id, 40, 'Decrease both ends');
    expect(next.components[0].rowNotes).toEqual([
      { row: 12, text: 'Stripe' },
      { row: 40, text: 'Decrease both ends' },
    ]);
    next = setRowNote(next, id, 12, '   ');
    next = setRowNote(next, id, 40, '');
    expect(next.components[0].rowNotes).toBeUndefined();
  });

  it('ignores row 0, unknown parts and no-op changes', () => {
    const { p, id } = setup();
    expect(setRowNote(p, id, 0, 'x')).toBe(p);
    expect(setRowNote(p, 'nope', 3, 'x')).toBe(p);
    expect(setRowNote(p, id, 3, '')).toBe(p);
    const once = setRowNote(p, id, 3, 'x');
    expect(setRowNote(once, id, 3, 'x')).toBe(once);
  });

  it('caps note length', () => {
    const { p, id } = setup();
    expect(rowNote(setRowNote(p, id, 1, 'x'.repeat(600)).components[0], 1)).toHaveLength(500);
  });

  it('knows the working row and what comes next', () => {
    const { p, id } = setup();
    let next = setCount(p, id, 'rows', 34);
    next = setRowNote(next, id, 35, 'Stripe');
    next = setRowNote(next, id, 40, 'Decrease');
    next = setRowNote(next, id, 84, 'Cuff');
    next = setRowNote(next, id, 10, 'Done already');
    const c = next.components[0];
    expect(workingRow(c)).toBe(35);
    expect(rowNote(c, 35)).toBe('Stripe');
    expect(upcomingNotes(c).map((n) => n.row)).toEqual([40, 84]);
    expect(upcomingNotes(c, Infinity).map((n) => n.row)).toEqual([40, 84]);
    expect(isFinished(updateComponent(next, id, { targetRows: 34 }).components[0])).toBe(true);
  });

  it('tracks two pieces worked at once', () => {
    const { p, id } = setup();
    let next = updateComponent(p, id, { targetRows: 10, pairRows: 0 });
    next = setCount(next, id, 'rows', 4);
    next = setCount(next, id, 'pairRows', 3);
    next = setRowNote(next, id, 5, 'Heel');
    next = setRowNote(next, id, 6, 'Gusset');
    let c = next.components[0];
    expect(pieceRows(c)).toEqual([4, 3]);
    expect(topRow(c)).toBe(5);
    expect(upcomingNotes(c).map((n) => n.row)).toEqual([6]);
    expect(componentProgress(c)).toBeCloseTo(0.35);

    c = setCount(next, id, 'rows', 10).components[0];
    expect(isFinished(c)).toBe(false);
    expect(topRow(c)).toBe(10);
    expect(isFinished(setCount({ ...next, components: [c] }, id, 'pairRows', 10).components[0])).toBe(true);

    const single = updateComponent(next, id, { pairRows: undefined }).components[0];
    expect(pieceRows(single)).toEqual([4]);
    expect(normalizeProject(JSON.parse(JSON.stringify(next)))!.components[0].pairRows).toBe(3);
    expect(normalizeProject(JSON.parse(JSON.stringify(p)))!.components[0].pairRows).toBeUndefined();
  });

  it('survives storage and import, dropping junk', () => {
    const { p, id } = setup();
    const raw = JSON.parse(JSON.stringify(setRowNote(p, id, 5, 'Keep')));
    raw.components[0].rowNotes.push({ row: -2, text: 'bad' }, { row: 7, text: '' }, { row: 3, text: 'Early' }, 'junk');
    expect(normalizeProject(raw)!.components[0].rowNotes).toEqual([
      { row: 3, text: 'Early' },
      { row: 5, text: 'Keep' },
    ]);
    delete raw.components[0].rowNotes;
    expect(normalizeProject(raw)!.components[0].rowNotes).toBeUndefined();
  });

});
