-- Add Spotify support to event_music table
-- source: 'upload' for MP3 files, 'spotify' for Spotify tracks
ALTER TABLE event_music
  ADD COLUMN source TEXT NOT NULL DEFAULT 'upload',
  ADD COLUMN spotify_track_id TEXT;

-- Make storage_path nullable (Spotify tracks have no file)
ALTER TABLE event_music
  ALTER COLUMN storage_path DROP NOT NULL;

-- Ensure data integrity: uploads must have storage_path, Spotify tracks must have spotify_track_id
ALTER TABLE event_music
  ADD CONSTRAINT event_music_source_check CHECK (
    (source = 'upload' AND storage_path IS NOT NULL) OR
    (source = 'spotify' AND spotify_track_id IS NOT NULL)
  );
