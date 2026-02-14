'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SpotifyTrackResult {
  id: string;
  name: string;
  artist: string;
  albumArt: string | null;
}

interface Props {
  onSelect: (track: SpotifyTrackResult) => void;
}

export default function SpotifySearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrackResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length === 0) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.tracks || []);
          setOpen(true);
        }
      } catch {
        // Silently fail — user can retry
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(track: SpotifyTrackResult) {
    onSelect(track);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a song on Spotify..."
          className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg border shadow-lg max-h-80 overflow-y-auto">
          {results.map((track) => (
            <button
              key={track.id}
              onClick={() => handleSelect(track)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
            >
              {track.albumArt ? (
                <img
                  src={track.albumArt}
                  alt=""
                  className="w-10 h-10 rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-200 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{track.name}</p>
                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
