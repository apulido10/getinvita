import { EventType } from '@/types';

const META_KEY = 'guest_event_meta';
const DB_NAME = 'guest-event-db';
const DB_VERSION = 1;

export interface GuestMeta {
  eventType: EventType;
  eventName: string;
  eventDate: string;
  details: Record<string, string>;
  themeId: string | null;
}

export interface GuestPhotoRecord {
  id: string;
  fileName: string;
  contentType: string;
  data: ArrayBuffer;
  isHero: boolean;
  displayOrder: number;
}

export interface GuestMusicRecord {
  id: string;
  source: 'upload' | 'spotify';
  fileName?: string;
  contentType?: string;
  data?: ArrayBuffer;
  songTitle: string;
  artist?: string;
  spotifyTrackId?: string;
  previewUrl?: string | null;
}

// ─── localStorage ─────────────────────────────────────────────────────────────

export function saveMeta(meta: GuestMeta): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function loadMeta(): GuestMeta | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearMeta(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(META_KEY);
}

// ─── IndexedDB ────────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('music')) {
        db.createObjectStore('music', { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

function dbOp<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export async function savePhoto(photo: GuestPhotoRecord): Promise<void> {
  const db = await openDB();
  await dbOp(db.transaction('photos', 'readwrite').objectStore('photos').put(photo));
}

export async function loadPhotos(): Promise<GuestPhotoRecord[]> {
  const db = await openDB();
  const result = await dbOp<GuestPhotoRecord[]>(
    db.transaction('photos', 'readonly').objectStore('photos').getAll()
  );
  return result.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB();
  await dbOp(db.transaction('photos', 'readwrite').objectStore('photos').delete(id));
}

// ─── Music ────────────────────────────────────────────────────────────────────

export async function saveMusic(track: GuestMusicRecord): Promise<void> {
  const db = await openDB();
  await dbOp(db.transaction('music', 'readwrite').objectStore('music').put(track));
}

export async function loadMusic(): Promise<GuestMusicRecord[]> {
  const db = await openDB();
  return dbOp<GuestMusicRecord[]>(
    db.transaction('music', 'readonly').objectStore('music').getAll()
  );
}

export async function deleteMusic(id: string): Promise<void> {
  const db = await openDB();
  await dbOp(db.transaction('music', 'readwrite').objectStore('music').delete(id));
}

// ─── Clear all ────────────────────────────────────────────────────────────────

export async function clearAll(): Promise<void> {
  clearMeta();
  try {
    const db = await openDB();
    await dbOp(db.transaction('photos', 'readwrite').objectStore('photos').clear());
    await dbOp(db.transaction('music', 'readwrite').objectStore('music').clear());
  } catch {
    // ignore
  }
}
