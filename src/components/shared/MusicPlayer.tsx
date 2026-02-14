'use client';

import { useState, useRef, useEffect } from 'react';
import { EventMusic } from '@/types';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';

interface Props {
  tracks: EventMusic[];
  supabaseUrl: string;
}

export default function MusicPlayer({ tracks, supabaseUrl }: Props) {
  // Only play uploaded tracks — Spotify tracks are handled by SpotifyEmbed
  const uploadTracks = tracks.filter((t) => t.source !== 'spotify');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = uploadTracks[currentIndex];

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = `${supabaseUrl}/storage/v1/object/public/event-music/${currentTrack.storage_path}`;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex, currentTrack, supabaseUrl]);

  // Autoplay on first user interaction (browsers block autoplay without interaction)
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;

    // Try autoplay immediately
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      // Browser blocked autoplay — play on first user interaction
      function playOnInteraction() {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
      }
      document.addEventListener('click', playOnInteraction, { once: true });
      document.addEventListener('touchstart', playOnInteraction, { once: true });
      document.addEventListener('scroll', playOnInteraction, { once: true });

      return () => {
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (uploadTracks.length === 0) return null;

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
    setCurrentIndex((i) => (i + 1) % uploadTracks.length);
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
        {uploadTracks.length > 1 && (
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
