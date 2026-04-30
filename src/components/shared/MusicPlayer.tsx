'use client';

import { useState, useRef, useEffect } from 'react';
import { EventMusic } from '@/types';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';
import { musicUrl } from '@/lib/mediaUrl';

interface Props {
  tracks: EventMusic[];
  supabaseUrl: string;
}

function getTrackUrl(track: EventMusic, supabaseUrl: string): string | null {
  if (track.source === 'spotify') {
    // storage_path holds the Spotify preview URL for spotify tracks
    return track.storage_path;
  }
  if (track.storage_path) {
    return musicUrl(track.storage_path, supabaseUrl);
  }
  return null;
}

export default function MusicPlayer({ tracks, supabaseUrl }: Props) {
  // Include uploaded tracks + spotify tracks that have a preview URL
  const playableTracks = tracks.filter((t) => {
    if (t.source === 'spotify') return !!t.storage_path; // has preview URL
    return true; // uploaded tracks always playable
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = playableTracks[currentIndex];

  // Set audio source when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const url = getTrackUrl(currentTrack, supabaseUrl);
    if (!url) return;
    audioRef.current.src = url;
    audioRef.current.load();
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex, currentTrack, supabaseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Autoplay: keep retrying on every plausible user-activation signal until a
  // play() call actually succeeds. Browsers block audio without activation, so
  // a single failed attempt isn't fatal — we just wait for the next gesture.
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;
    let played = false;

    function tryPlay() {
      if (played) return;
      if (!audio.src || audio.src === window.location.href) {
        const url = getTrackUrl(currentTrack, supabaseUrl);
        if (url) {
          audio.src = url;
          audio.load();
        }
      }
      const attempt = () => {
        if (played) return;
        audio
          .play()
          .then(() => {
            played = true;
            setIsPlaying(true);
          })
          .catch(() => {});
      };
      if (audio.readyState >= 2) {
        attempt();
      } else {
        audio.addEventListener('canplay', function onCanPlay() {
          audio.removeEventListener('canplay', onCanPlay);
          attempt();
        });
      }
    }

    document.addEventListener('invitation-opened', tryPlay);
    document.addEventListener('click', tryPlay);
    document.addEventListener('touchstart', tryPlay);
    document.addEventListener('keydown', tryPlay);

    return () => {
      document.removeEventListener('invitation-opened', tryPlay);
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('keydown', tryPlay);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (playableTracks.length === 0) return null;

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }

  function nextTrack() {
    setCurrentIndex((i) => (i + 1) % playableTracks.length);
  }

  function toggleMute() {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/80 backdrop-blur-xl text-white rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 shadow-2xl max-w-[calc(100vw-2rem)] sm:max-w-sm">
      <audio
        ref={audioRef}
        onEnded={nextTrack}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <Music className="h-4 w-4 text-purple-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {currentTrack?.song_title || 'Untitled'}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={togglePlay} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
        {playableTracks.length > 1 && (
          <button onClick={nextTrack} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <SkipForward className="h-4 w-4" />
          </button>
        )}
        <button onClick={toggleMute} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
