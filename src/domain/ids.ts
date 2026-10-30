export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Strictly increasing clock so two edits in the same millisecond still order correctly. */
let lastNow = 0;
export function now(): number {
  const t = Date.now();
  lastNow = t > lastNow ? t : lastNow + 1;
  return lastNow;
}
