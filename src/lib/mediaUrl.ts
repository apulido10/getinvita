export function photoUrl(storagePath: string, supabaseUrl: string): string {
  if (
    storagePath.startsWith('blob:') ||
    storagePath.startsWith('data:') ||
    storagePath.startsWith('http')
  ) {
    return storagePath;
  }
  return `${supabaseUrl}/storage/v1/object/public/event-photos/${storagePath}`;
}

export function musicUrl(storagePath: string, supabaseUrl: string): string {
  if (
    storagePath.startsWith('blob:') ||
    storagePath.startsWith('data:') ||
    storagePath.startsWith('http')
  ) {
    return storagePath;
  }
  return `${supabaseUrl}/storage/v1/object/public/event-music/${storagePath}`;
}
