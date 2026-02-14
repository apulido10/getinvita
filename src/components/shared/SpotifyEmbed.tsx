'use client';

import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    function initController(IFrameAPI: SpotifyIFrameAPI) {
      // Clear any previous content
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

    // If API is already loaded, use it directly
    if (window.__spotifyIFrameAPI) {
      initController(window.__spotifyIFrameAPI);
    } else {
      // Set up the callback for when the script loads
      const existingCallback = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.__spotifyIFrameAPI = IFrameAPI;
        if (existingCallback) existingCallback(IFrameAPI);
        initController(IFrameAPI);
      };

      // Load the script if not already present
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
      // togglePlay starts playback — called during user gesture context
      controllerRef.current?.togglePlay();
    }

    // Listen for envelope open event
    document.addEventListener('invitation-opened', handleInvitationOpened);

    // Also try to play on next user click (fallback for pages without envelope)
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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-[280px] opacity-70 hover:opacity-100 transition-opacity scale-90">
      <div
        ref={containerRef}
        className="rounded-xl shadow-2xl overflow-hidden"
      />
    </div>
  );
}
