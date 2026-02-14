'use client';

import { useState, useEffect, ReactNode } from 'react';
import { EventType, ThemeColors } from '@/types';

interface InvitationIntroProps {
  eventName: string;
  eventType: EventType;
  colors: ThemeColors;
  eventId: string;
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
  }
}

export default function InvitationIntro({
  eventName,
  eventType,
  colors,
  eventId,
  children,
}: InvitationIntroProps) {
  const storageKey = `intro-seen-${eventId}`;
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (!sessionStorage.getItem(storageKey)) {
        setShowIntro(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [storageKey]);

  const handleOpen = () => {
    if (envelopeOpened) return;
    setEnvelopeOpened(true);
    // Signal MusicPlayer to start playing (user gesture context)
    document.dispatchEvent(new CustomEvent('invitation-opened'));
    setTimeout(() => {
      setFadingOut(true);
    }, 500);
    setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch {}
      setShowIntro(false);
    }, 1100);
  };

  // Always render children first (same tree position) to prevent unmount/remount.
  // The overlay is a sibling that sits on top with z-index.
  return (
    <>
      {children}

      {mounted && showIntro && (
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
            <div className="intro-label">You are invited to</div>
            <div className="intro-event-name">{eventName}</div>

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

            <div className="intro-hint">Tap to open</div>
          </div>
        </>
      )}
    </>
  );
}
