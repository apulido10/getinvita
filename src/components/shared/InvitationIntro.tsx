'use client';

import { useState, useEffect, ReactNode } from 'react';
import { EventType, ThemeColors } from '@/types';
import { CARD_EVENT_TYPES } from '@/lib/constants';
import { Lang, t } from '@/lib/translations';

const cardEventGreetingKeys: Partial<Record<EventType, string>> = {
  valentines: 'intro.happyValentines',
  mothers_day: 'intro.happyMothersDay',
  fathers_day: 'intro.happyFathersDay',
};

interface InvitationIntroProps {
  eventName: string;
  eventType: EventType;
  colors: ThemeColors;
  eventId: string;
  lang?: Lang;
  imageUrls?: string[];
  children: ReactNode;
}

function AccentIcon({ eventType, color }: { eventType: EventType; color: string }) {
  switch (eventType) {
    case 'wedding':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'sweet15':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C10.34 2 9 3.34 9 5c0 .72.26 1.38.68 1.9L12 10l2.32-3.1c.42-.52.68-1.18.68-1.9 0-1.66-1.34-3-3-3zm-5.5 6C5.01 8 4 9.01 4 10.5c0 .65.23 1.24.62 1.7L12 22l7.38-9.8c.39-.46.62-1.05.62-1.7C20 9.01 18.99 8 17.5 8c-.65 0-1.24.23-1.7.62L12 12.5 8.2 8.62C7.74 8.23 7.15 8 6.5 8z" />
        </svg>
      );
    case 'birthday':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.1 17.29 4.55 17.7 3.2 17.23V20c0 1.1.9 2 2 2h13.6c1.1 0 2-.9 2-2v-2.77c-1.35.47-2.9.06-4.2-1.24zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12c.01-1.66-1.33-3-2.99-3z" />
        </svg>
      );
    case 'baby_shower':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M11 3c-1.1 0-2 .9-2 2v3.17c0 .53.21 1.04.59 1.41L12 12l2.41-2.41c.38-.38.59-.89.59-1.42V5c0-1.1-.9-2-2-2h-2zm-4 8.5c0-.28.22-.5.5-.5s.5.22.5.5v5c0 2.21 1.79 4 4 4s4-1.79 4-4v-5c0-.28.22-.5.5-.5s.5.22.5.5v5c0 2.76-2.24 5-5 5s-5-2.24-5-5v-5z" />
        </svg>
      );
    case 'valentines':
    case 'mothers_day':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'fathers_day':
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
        </svg>
      );
  }
}

export default function InvitationIntro({
  eventName,
  eventType,
  colors,
  eventId,
  lang = 'en',
  imageUrls,
  children,
}: InvitationIntroProps) {
  const storageKey = `intro-seen-${eventId}`;
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setMounted(true), 0));
    let shouldShowIntro = false;
    const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true';
    setIsDemoMode(isDemo);
    if (isDemo) {
      shouldShowIntro = true;
    } else {
      try {
        shouldShowIntro = !sessionStorage.getItem(storageKey);
      } catch {
        // sessionStorage unavailable
      }
    }

    if (shouldShowIntro) {
      timers.push(window.setTimeout(() => setShowIntro(true), 0));
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [storageKey]);

  // Preload images in background while envelope is showing
  useEffect(() => {
    if (!showIntro || !imageUrls?.length) return;
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [showIntro, imageUrls]);

  const handleOpen = () => {
    if (envelopeOpened) return;
    setEnvelopeOpened(true);
    window.scrollTo(0, 0);
    // Signal MusicPlayer to start playing (user gesture context)
    document.dispatchEvent(new CustomEvent('invitation-opened'));
    setTimeout(() => {
      setFadingOut(true);
    }, 500);
    setTimeout(() => {
      const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true';
      if (!isDemo) {
        try {
          sessionStorage.setItem(storageKey, '1');
        } catch {}
      }
      setShowIntro(false);
    }, 1100);
  };

  // Parent-page activation bridge: when the host page (landing hero) signals
  // that the user has interacted, use that user-activation window to re-trigger
  // the music player. In demo mode we deliberately do NOT auto-open the
  // envelope from this signal — on mobile, scroll fires touchstart on the
  // parent and would flip the envelope open before the visitor sees the CTA.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!e.data || e.data.type !== 'getinvita-activate') return;
      if (showIntro && !envelopeOpened) {
        if (isDemoMode) return;
        handleOpen();
      } else {
        document.dispatchEvent(new CustomEvent('invitation-opened'));
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIntro, envelopeOpened, isDemoMode]);

  // Autoplay: slowly auto-scroll the page after the intro dismisses, looping at the bottom.
  // Pauses when the user interacts; resumes after a few seconds of idle.
  useEffect(() => {
    if (!mounted || showIntro) return;
    const isAutoplay = new URLSearchParams(window.location.search).get('autoplay') === '1';
    if (!isAutoplay) return;

    const SPEED = 55; // px/sec
    const PAUSE_AFTER_INTERACT_MS = 3500;
    const PAUSE_AT_END_MS = 1200;
    const RETURN_GUARD_MS = 4000; // covers the smooth-scroll back to top
    const START_DELAY_MS = 600;

    let lastUserInteraction = 0;
    let pauseUntil = 0;
    let lastTime = performance.now();
    let rafId = 0;
    let startId = 0;

    const onUserInteract = () => {
      lastUserInteraction = Date.now();
    };

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const nowMs = Date.now();
      if (nowMs - lastUserInteraction < PAUSE_AFTER_INTERACT_MS || nowMs < pauseUntil) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const nextY = window.scrollY + SPEED * dt;
      if (nextY >= max - 1) {
        pauseUntil = nowMs + PAUSE_AT_END_MS + RETURN_GUARD_MS;
        window.setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, PAUSE_AT_END_MS);
      } else {
        window.scrollTo(0, nextY);
      }

      rafId = requestAnimationFrame(tick);
    };

    startId = window.setTimeout(() => {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }, START_DELAY_MS);

    window.addEventListener('wheel', onUserInteract, { passive: true });
    window.addEventListener('touchstart', onUserInteract, { passive: true });
    window.addEventListener('touchmove', onUserInteract, { passive: true });
    window.addEventListener('keydown', onUserInteract);
    window.addEventListener('mousedown', onUserInteract);

    return () => {
      window.clearTimeout(startId);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onUserInteract);
      window.removeEventListener('touchstart', onUserInteract);
      window.removeEventListener('touchmove', onUserInteract);
      window.removeEventListener('keydown', onUserInteract);
      window.removeEventListener('mousedown', onUserInteract);
    };
  }, [mounted, showIntro]);

  // Don't render anything until we've determined whether to show the intro.
  // This prevents the flash of content before the envelope overlay appears.
  if (!mounted) {
    return <div style={{ minHeight: '100vh', backgroundColor: colors.hero }} />;
  }

  return (
    <>
      {children}

      {showIntro && (
        <>
          <style>{`
            @keyframes intro-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-12px); }
            }
            @keyframes intro-glow {
              0%, 100% { filter: drop-shadow(0 0 8px ${colors.accent}66); }
              50% { filter: drop-shadow(0 0 20px ${colors.accent}aa); }
            }
            @keyframes intro-envelope-open {
              0% { transform: rotateX(0deg); }
              100% { transform: rotateX(180deg); }
            }
            @keyframes intro-fade-up {
              0% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-60px); }
            }
            .intro-overlay {
              position: fixed;
              inset: 0;
              z-index: 9999;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              background-color: ${colors.hero};
              color: ${colors.heroText};
            }
            .intro-overlay.fading-out {
              animation: intro-fade-up 0.6s ease-in forwards;
            }
            .intro-label {
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.2em;
              margin-bottom: 0.75rem;
              opacity: 0.85;
            }
            .intro-event-name {
              font-size: clamp(1.75rem, 5vw, 3rem);
              font-weight: 700;
              font-family: Georgia, 'Times New Roman', serif;
              text-align: center;
              max-width: 80%;
              line-height: 1.2;
              margin-bottom: 2.5rem;
            }
            .intro-envelope-wrapper {
              animation: intro-float 3s ease-in-out infinite, intro-glow 3s ease-in-out infinite;
            }
            .intro-envelope {
              position: relative;
              width: 120px;
              height: 80px;
            }
            .intro-envelope-body {
              width: 120px;
              height: 80px;
              border-radius: 4px;
              position: absolute;
              bottom: 0;
            }
            .intro-flap {
              transform-origin: top center;
              transition: transform 0.4s ease-in;
            }
            .intro-flap.opened {
              animation: intro-envelope-open 0.4s ease-in forwards;
            }
            .intro-hint {
              margin-top: 2.5rem;
              font-size: 0.8rem;
              opacity: 0.6;
              letter-spacing: 0.1em;
            }
            .intro-cta {
              margin-top: 2rem;
              font-size: 1.05rem;
              font-weight: 600;
              letter-spacing: 0.01em;
              padding: 0.875rem 1.6rem;
              border: 2px solid currentColor;
              border-radius: 999px;
              text-align: center;
              animation: intro-cta-pulse 1.8s ease-in-out infinite;
            }
            @keyframes intro-cta-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.06); }
            }
            .intro-accent-icon {
              margin-bottom: 1rem;
              opacity: 0.8;
            }
          `}</style>

          <div
            className={`intro-overlay${fadingOut ? ' fading-out' : ''}`}
            onClick={handleOpen}
          >
            <div className="intro-accent-icon">
              <AccentIcon eventType={eventType} color={colors.heroText} />
            </div>
            {CARD_EVENT_TYPES.includes(eventType) ? (
              <div className="intro-event-name">{t(cardEventGreetingKeys[eventType]!, lang)}</div>
            ) : (
              <>
                <div className="intro-label">{t('intro.youAreInvitedTo', lang)}</div>
                <div className="intro-event-name">{eventName}</div>
              </>
            )}

            <div className="intro-envelope-wrapper">
              <div className="intro-envelope">
                {/* Envelope body */}
                <svg
                  className="intro-envelope-body"
                  viewBox="0 0 120 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="120" height="80" rx="4" fill={colors.heroText} opacity="0.15" />
                  <path d="M0 0L60 45L120 0" stroke={colors.heroText} strokeWidth="1.5" opacity="0.3" />
                </svg>
                {/* Envelope flap */}
                <svg
                  className={`intro-flap${envelopeOpened ? ' opened' : ''}`}
                  viewBox="0 0 120 45"
                  width="120"
                  height="45"
                  style={{ position: 'absolute', top: 0, left: 0 }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 0L60 45L120 0Z" fill={colors.heroText} opacity="0.2" />
                </svg>
              </div>
            </div>

            <div className={isDemoMode ? 'intro-cta' : 'intro-hint'}>
              {isDemoMode ? t('intro.demoTapToOpen', lang) : t('intro.tapToOpen', lang)}
            </div>
          </div>
        </>
      )}
    </>
  );
}
