import { describe, expect, it } from 'vitest';
import { changeCount, resetCount, setCount } from '../../src/domain/counters';
import { MAX_COUNT, parseCount } from '../../src/domain/validation';
import { makeProject } from '../helpers';

describe('counters', () => {
  const base = () => {
    const p = makeProject('Socks', ['Cuff', 'Leg']);
    return { p, cuff: p.components[0].id, leg: p.components[1].id };
  };

  it('increments and decrements one component only', () => {
    const { p, cuff, leg } = base();
    let next = changeCount(p, cuff, 'rows', 1);
    next = changeCount(next, cuff, 'rows', 1);
    next = changeCount(next, cuff, 'stitches', 1);
    next = changeCount(next, cuff, 'rows', -1);
    expect(next.components[0]).toMatchObject({ rows: 1, stitches: 1 });
    expect(next.components[1]).toMatchObject({ rows: 0, stitches: 0 });
    expect(next.components.find((c) => c.id === leg)?.rows).toBe(0);
  });

  it('never goes below zero', () => {
    const { p, cuff } = base();
    const next = changeCount(p, cuff, 'rows', -1);
    expect(next.components[0].rows).toBe(0);
    expect(next).toBe(p); // nothing changed, so no write
    expect(setCount(p, cuff, 'stitches', -20).components[0].stitches).toBe(0);
  });

  it('caps at the maximum and truncates fractions', () => {
    const { p, cuff } = base();
    expect(setCount(p, cuff, 'rows', MAX_COUNT + 50).components[0].rows).toBe(MAX_COUNT);
    expect(setCount(p, cuff, 'rows', 12.7).components[0].rows).toBe(12);
    expect(setCount(p, cuff, 'rows', Number.NaN)).toBe(p);
  });

  it('marks a not-started component and a planned project as in progress on first count up', () => {
    const { p, cuff } = base();
    expect(p.status).toBe('planned');
    const next = changeCount(p, cuff, 'rows', 1);
    expect(next.components[0].status).toBe('in_progress');
    expect(next.status).toBe('in_progress');
    expect(next.lastComponentId).toBe(cuff);
    expect(next.updatedAt).toBeGreaterThan(p.updatedAt);
  });

  it('does not change status when counting down or for paused projects', () => {
    const { p, cuff } = base();
    const paused = { ...setCount(p, cuff, 'rows', 5), status: 'paused' as const };
    const next = changeCount(paused, cuff, 'rows', 1);
    expect(next.status).toBe('paused');
  });

  it('resets to zero', () => {
    const { p, cuff } = base();
    const counted = setCount(p, cuff, 'rows', 40);
    expect(resetCount(counted, cuff, 'rows').components[0].rows).toBe(0);
  });

  it('parses typed counts strictly', () => {
    expect(parseCount(' 42 ')).toEqual({ value: 42 });
    expect(parseCount('0')).toEqual({ value: 0 });
    expect(parseCount('-3')).toHaveProperty('error');
    expect(parseCount('4.5')).toHaveProperty('error');
    expect(parseCount('abc')).toHaveProperty('error');
    expect(parseCount('')).toHaveProperty('error');
    expect(parseCount('100000')).toHaveProperty('error');
  });
});
