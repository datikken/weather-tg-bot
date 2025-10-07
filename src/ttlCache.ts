import { LogMethod } from './decorators';

type CacheEntry<T> = { value: T; expiresAt: number };

export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor({ ttlMs }: { ttlMs: number }) {
    this.ttlMs = ttlMs;
  }

  @LogMethod
  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  @LogMethod
  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.store.clear();
  }
}

// For backward compatibility, perhaps export a factory
export function createTtlCache<T>({ ttlMs }: { ttlMs: number }) {
  return new TtlCache<T>({ ttlMs });
}
