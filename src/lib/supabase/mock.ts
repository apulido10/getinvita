/**
 * In-memory mock Supabase client for local development without a real database.
 * Mimics the Supabase JS client chaining API.
 */

import { nanoid } from 'nanoid';

// Use globalThis to share mock data across all module instances (API routes + server components)
const globalKey = '__mock_supabase_tables__';
const globalStorageKey = '__mock_supabase_storage__';

if (!(globalThis as Record<string, unknown>)[globalKey]) {
  (globalThis as Record<string, unknown>)[globalKey] = {
    events: [],
    event_details: [],
    event_photos: [],
    event_music: [],
    rsvps: [],
  };
}

if (!(globalThis as Record<string, unknown>)[globalStorageKey]) {
  (globalThis as Record<string, unknown>)[globalStorageKey] = {};
}

const tables = (globalThis as Record<string, unknown>)[globalKey] as Record<string, Record<string, unknown>[]>;
const storageBuckets = (globalThis as Record<string, unknown>)[globalStorageKey] as Record<string, Map<string, File>>;

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

type Row = Record<string, unknown>;

class MockQueryBuilder {
  private table: string;
  private operation: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private filters: Array<{ type: string; column: string; value: unknown }> = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private insertData: Row | Row[] | null = null;
  private updateData: Row | null = null;
  private upsertConflict: string | null = null;
  private shouldSelect = false;
  private shouldSingle = false;

  constructor(table: string) {
    this.table = table;
    if (!tables[table]) tables[table] = [];
  }

  select(_columns?: string) {
    if (this.operation === 'select') {
      this.operation = 'select';
    }
    this.shouldSelect = true;
    return this;
  }

  insert(data: Row | Row[]) {
    this.operation = 'insert';
    this.insertData = data;
    return this;
  }

  update(data: Row) {
    this.operation = 'update';
    this.updateData = data;
    return this;
  }

  upsert(data: Row | Row[], options?: { onConflict?: string }) {
    this.operation = 'upsert';
    this.insertData = data;
    this.upsertConflict = options?.onConflict || null;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push({ type: 'in', column, value: values });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  single() {
    this.shouldSingle = true;
    return this.execute();
  }

  then(resolve: (value: { data: unknown; error: null }) => void) {
    const result = this.execute();
    resolve(result);
  }

  private matchesFilters(row: Row): boolean {
    return this.filters.every((f) => {
      if (f.type === 'eq') return row[f.column] === f.value;
      if (f.type === 'in') return (f.value as unknown[]).includes(row[f.column]);
      return true;
    });
  }

  execute(): { data: unknown; error: null } {
    const rows = tables[this.table];

    switch (this.operation) {
      case 'select': {
        const results = rows.filter((r) => this.matchesFilters(r));
        if (this.orderCol) {
          const col = this.orderCol;
          const asc = this.orderAsc;
          results.sort((a, b) => {
            const av = a[col] as string;
            const bv = b[col] as string;
            return asc ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
          });
        }
        if (this.shouldSingle) {
          return { data: results.length > 0 ? deepClone(results[0]) : null, error: null };
        }
        return { data: deepClone(results), error: null };
      }

      case 'insert': {
        const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData!];
        const now = new Date().toISOString();
        const inserted = items.map((item) => ({
          id: nanoid(),
          ...item,
          created_at: now,
          updated_at: now,
        }));
        rows.push(...inserted);
        if (this.shouldSelect || this.shouldSingle) {
          const data = this.shouldSingle ? deepClone(inserted[0]) : deepClone(inserted);
          return { data, error: null };
        }
        return { data: null, error: null };
      }

      case 'update': {
        const now = new Date().toISOString();
        rows.forEach((row) => {
          if (this.matchesFilters(row)) {
            Object.assign(row, this.updateData, { updated_at: now });
          }
        });
        return { data: null, error: null };
      }

      case 'upsert': {
        const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData!];
        const conflictKeys = this.upsertConflict ? this.upsertConflict.split(',') : [];
        const now = new Date().toISOString();
        for (const item of items) {
          const existing = rows.find((row) =>
            conflictKeys.every((key) => row[key] === item[key])
          );
          if (existing) {
            Object.assign(existing, item, { updated_at: now });
          } else {
            rows.push({ id: nanoid(), ...item, created_at: now, updated_at: now });
          }
        }
        return { data: null, error: null };
      }

      case 'delete': {
        tables[this.table] = rows.filter((r) => !this.matchesFilters(r));
        return { data: null, error: null };
      }
    }

    return { data: null, error: null };
  }
}

class MockStorageBucket {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
    if (!storageBuckets[bucket]) storageBuckets[bucket] = new Map();
  }

  async upload(path: string, file: File) {
    storageBuckets[this.bucket].set(path, file);
    return { data: { path }, error: null };
  }

  async remove(paths: string[]) {
    for (const p of paths) {
      storageBuckets[this.bucket].delete(p);
    }
    return { data: null, error: null };
  }
}

export function createMockClient() {
  return {
    from(table: string) {
      return new MockQueryBuilder(table);
    },
    storage: {
      from(bucket: string) {
        return new MockStorageBucket(bucket);
      },
    },
  };
}
