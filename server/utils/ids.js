import { randomUUID } from 'crypto';

export function createId(prefix) {
  return `${prefix}-${randomUUID()}`;
}
