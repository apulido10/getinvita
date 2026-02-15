'use client';

import { useEffect, useRef, useState } from 'react';
import { Music, X } from 'lucide-react';

interface Props {
  trackId: string;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void;
    __spotifyIframeApiReady?: boolean;
    __spotifyIFrameAPI?: SpotifyIFrameAPI;
  }
}

interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string | number; height: string | number },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
}

interface SpotifyEmbedController {
  togglePlay: () => void;
  loadUri: (uri: string) => void;
  destroy: () => void;
}

export default function SpotifyEmbed({ trackId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    function initController(IFrameAPI: SpotifyIFrameAPI) {
      container.innerHTML = '';
      const el = document.createElement('div');
      container.appendChild(el);

      IFrameAPI.createController(
        el,
        {
          uri: `spotify:track:${trackId}`,
          width: '100%',
          height: 80,
        },
        (controller) => {
          controllerRef.current = controller;
          setReady(true);
        }
      );
    }

    if (window.__spotifyIFrameAPI) {
      initController(window.__spotifyIFrameAPI);
    } else {
      const existingCallback = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.__spotifyIFrameAPI = IFrameAPI;
        if (existingCallback) existingCallback(IFrameAPI);
        initController(IFrameAPI);
      };

      if (!document.querySelector('script[src*="spotify.com/embed/iframe-api"]')) {
        const script = document.createElement('script');
        script.src = 'https://open.spotify.com/embed/iframe-api/v1';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      controllerRef.current = null;
    };
  }, [trackId]);

  // Listen for envelope open and auto-play
  useEffect(() => {
    if (!ready || !controllerRef.current) return;

    function handleInvitationOpened() {
      controllerRef.current?.togglePlay();
    }

    document.addEventListener('invitation-opened', handleInvitationOpened);

    function handleClick() {
      controllerRef.current?.togglePlay();
      document.removeEventListener('click', handleClick);
    }
    document.addEventListener('click', handleClick, { once: true });

    return () => {
      document.removeEventListener('invitation-opened', handleInvitationOpened);
      document.removeEventListener('click', handleClick);
    };
  }, [ready]);

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded player */}
      <div
        className="overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ease-in-out origin-bottom-right"
        style={{
          width: expanded ? 300 : 0,
          height: expanded ? 80 : 0,
          opacity: expanded ? 1 : 0,
        }}
      >
        <div ref={containerRef} className="w-[300px] h-[80px]" />
      </div>

      {/* Floating bubble */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="h-12 w-12 rounded-full bg-[#1DB954] text-white shadow-lg flex items-center justify-center transition-transform duration-200 active:scale-90 hover:scale-105"
        aria-label={expanded ? 'Close Spotify player' : 'Open Spotify player'}
      >
        {expanded ? <X className="h-5 w-5" /> : <Music className="h-5 w-5" />}
      </button>
    </div>
  );
}
