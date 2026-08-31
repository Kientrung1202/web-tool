export function createSequentialBatches<T>(items: T[], canAppend: (batch: T[], next: T) => boolean): T[][] {
  const batches: T[][] = [];
  let current: T[] = [];

  for (const item of items) {
    if (current.length === 0) {
      current = [item];
      continue;
    }

    if (canAppend(current, item)) {
      current = [...current, item];
      continue;
    }

    batches.push(current);
    current = [item];
  }

  if (current.length > 0) {
    batches.push(current);
  }

  return batches;
}
