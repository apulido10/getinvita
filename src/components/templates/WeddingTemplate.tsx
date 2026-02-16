'use client';

import { FullEventData, ThemeVariant } from '@/types';
import { getThemeById, getDefaultTheme } from '@/lib/themes';
import { Lang, t, formatDateLocalized } from '@/lib/translations';
import Countdown from '@/components/shared/Countdown';
import PhotoGallery from '@/components/shared/PhotoGallery';
import MusicPlayer from '@/components/shared/MusicPlayer';
import SpotifyEmbed from '@/components/shared/SpotifyEmbed';
import RSVPForm from '@/components/shared/RSVPForm';
import AddressLink from '@/components/shared/AddressLink';
import { Heart, MapPin, Clock, ExternalLink, Sparkles } from 'lucide-react';

interface Props {
  data: FullEventData;
  supabaseUrl: string;
  theme?: ThemeVariant;
  lang?: Lang;
}

function getDetail(details: FullEventData['details'], key: string): string {
  return details.find((d) => d.detail_key === key)?.detail_value || '';
}

function formatDate(dateStr: string, locale: Lang = 'en'): string {
  return formatDateLocalized(dateStr, locale);
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function WeddingTemplate({ data, supabaseUrl, theme: themeProp, lang = 'en' }: Props) {
  const { event, details, photos, music } = data;
  const theme = themeProp ?? (event.theme_id ? getThemeById(event.theme_id) : undefined) ?? getDefaultTheme('wedding');
  const { colors, layout } = theme;

  const heroPhoto = photos.find((p) => p.is_hero);
  const heroUrl = heroPhoto
    ? `${supabaseUrl}/storage/v1/object/public/event-photos/${heroPhoto.storage_path}`
    : null;

  const partner1 = getDetail(details, 'partner1_name');
  const partner2 = getDetail(details, 'partner2_name');
  const churchName = getDetail(details, 'church_name');
  const churchAddress = getDetail(details, 'church_address');
  const churchTime = getDetail(details, 'church_time');
  const venueName = getDetail(details, 'venue_name');
  const venueAddress = getDetail(details, 'venue_address');
  const ceremonyTime = getDetail(details, 'ceremony_time');
  const receptionStart = getDetail(details, 'reception_start');
  const receptionEnd = getDetail(details, 'reception_end');
  const dinnerStart = getDetail(details, 'dinner_start');
  const dinnerEnd = getDetail(details, 'dinner_end');
  const ourStory = getDetail(details, 'our_story');
  const registryUrl = getDetail(details, 'registry_url');
  const dressCode = getDetail(details, 'dress_code');
  const accommodations = getDetail(details, 'accommodations');
  const godparents = getDetail(details, 'godparents');
  const specialMessage = getDetail(details, 'special_message');

  const hasChurch = churchName || churchAddress || churchTime;
  const hasTimes = ceremonyTime || receptionStart || dinnerStart;

  const title = partner1 && partner2 ? `${partner1} & ${partner2}` : event.event_name;

  // ── Split Layout ──
  if (layout === 'split') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
        {/* Split Hero */}
        <section className="relative md:grid md:grid-cols-2 md:min-h-screen">
          <div
            className="split-hero-clip relative z-10 min-h-[55vh] md:min-h-0 flex items-center justify-center p-8 md:p-16 pb-20 md:pb-16"
            style={{ backgroundColor: colors.hero }}
          >
            <div className="text-center" style={{ color: colors.heroText }}>
              <p className="uppercase tracking-[0.3em] text-xs sm:text-sm mb-4 opacity-80">{t('wedding.gettingMarried', lang)}</p>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif italic leading-tight">{title}</h1>
              {event.event_date && (
                <p className="mt-8 text-lg opacity-90">
                  {formatDate(event.event_date, lang)}
                </p>
              )}
              <Heart className="h-6 w-6 mx-auto mt-6 opacity-70" />
            </div>
          </div>
          <div
            className="min-h-[50vh] md:min-h-0 -mt-12 md:mt-0"
            style={heroUrl ? { backgroundImage: `url(${heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : { backgroundColor: colors.accent }}
          />
        </section>

        {/* Countdown */}
        {event.event_date && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.accent, color: colors.accentText }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <p className="uppercase tracking-widest text-sm mb-6 opacity-80">{t('wedding.daysUntilIDo', lang)}</p>
              <Countdown targetDate={event.event_date} lang={lang} />
            </div>
          </section>
        )}

        {ourStory && (
          <section className="py-12 sm:py-20" style={{ backgroundColor: colors.background }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-serif italic mb-6" style={{ color: colors.text }}>{t('wedding.ourStory', lang)}</h2>
              <div className="w-12 h-0.5 mx-auto mb-8" style={{ backgroundColor: colors.accent }} />
              <p className="leading-relaxed whitespace-pre-line" style={{ color: colors.textSecondary }}>{ourStory}</p>
            </div>
          </section>
        )}

        {hasChurch && (
          <section className="py-12 sm:py-20" style={{ backgroundColor: colors.background }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-serif italic mb-6" style={{ color: colors.text }}>{t('wedding.churchCeremony', lang)}</h2>
              <div className="w-12 h-0.5 mx-auto mb-8" style={{ backgroundColor: colors.accent }} />
              {churchName && <h3 className="font-semibold text-lg">{churchName}</h3>}
              {churchAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={churchAddress} style={{ color: colors.textSecondary }} /></p>}
              {churchTime && <p className="text-sm mt-2"><strong>{t('time.label', lang)}</strong> {formatTime(churchTime)}</p>}
            </div>
          </section>
        )}

        <section className="py-12 sm:py-20" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-serif italic text-center mb-8 sm:mb-10" style={{ color: colors.text }}>{t('wedding.weddingDetails', lang)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {venueName && (
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-3" style={{ color: colors.accent }} />
                  <h3 className="font-semibold text-lg">{venueName}</h3>
                  {venueAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={venueAddress} style={{ color: colors.textSecondary }} /></p>}
                </div>
              )}
              {hasTimes && (
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-3" style={{ color: colors.accent }} />
                  {ceremonyTime && <p className="text-sm"><strong>{t('time.ceremony', lang)}</strong> {formatTime(ceremonyTime)}</p>}
                  {receptionStart && (
                    <p className="text-sm mt-1"><strong>{t('time.reception', lang)}</strong> {formatTime(receptionStart)}{receptionEnd ? ` – ${formatTime(receptionEnd)}` : ''}</p>
                  )}
                  {dinnerStart && (
                    <p className="text-sm mt-1"><strong>{t('time.dinner', lang)}</strong> {formatTime(dinnerStart)}{dinnerEnd ? ` – ${formatTime(dinnerEnd)}` : ''}</p>
                  )}
                </div>
              )}
              {dressCode && (
                <div className="text-center">
                  <h3 className="font-semibold">{t('wedding.dressCode', lang)}</h3>
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{dressCode}</p>
                </div>
              )}
              {accommodations && (
                <div className="text-center">
                  <h3 className="font-semibold">{t('wedding.accommodations', lang)}</h3>
                  <p className="text-sm mt-1 whitespace-pre-line" style={{ color: colors.textSecondary }}>{accommodations}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {registryUrl && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
            <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl font-serif italic mb-4" style={{ color: colors.text }}>{t('wedding.giftRegistry', lang)}</h2>
              <a href={registryUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.accent, color: colors.accentText }}>
                {t('wedding.viewRegistry', lang)} <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </section>
        )}

        {godparents && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-serif italic mb-6" style={{ color: colors.text }}>{t('wedding.padrinos', lang)}</h2>
              <p className="whitespace-pre-line leading-relaxed" style={{ color: colors.textSecondary }}>{godparents}</p>
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section className="py-12 sm:py-20" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-serif italic text-center mb-8 sm:mb-10">{t('wedding.ourMoments', lang)}</h2>
              <PhotoGallery photos={photos} supabaseUrl={supabaseUrl} />
            </div>
          </section>
        )}

        <section className="py-12 sm:py-20" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
          <div className="max-w-lg mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-serif italic text-center mb-2">{t('wedding.rsvp', lang)}</h2>
            <p className="text-center mb-8 opacity-70">{t('wedding.kindlyRespond', lang)}</p>
            <RSVPForm eventId={event.id} accentColor="emerald" lang={lang} />
          </div>
        </section>

        {(() => { const spotifyTrack = music.find((t) => t.source === 'spotify'); return (
          <>
            {music.length > 0 && <MusicPlayer tracks={music} supabaseUrl={supabaseUrl} />}
            {spotifyTrack?.spotify_track_id && <SpotifyEmbed trackId={spotifyTrack.spotify_track_id} accentColor={colors.accent} accentText={colors.accentText} />}
          </>
        ); })()}
      </div>
    );
  }

  // ── Minimal Layout ──
  if (layout === 'minimal') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
        {/* Minimal Hero */}
        <section className="py-24 sm:py-40 text-center px-6">
          <div className="max-w-xl mx-auto">
            <p className="uppercase tracking-[0.3em] text-xs mb-6" style={{ color: colors.textSecondary }}>{t('wedding.gettingMarried', lang)}</p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif italic leading-tight" style={{ color: colors.text }}>{title}</h1>
            {event.event_date && (
              <p className="mt-8 text-lg" style={{ color: colors.textSecondary }}>
                {formatDate(event.event_date, lang)}
              </p>
            )}
            <div className="w-12 h-0.5 mx-auto mt-8" style={{ backgroundColor: colors.accent }} />
          </div>
        </section>

        {heroUrl && (
          <section className="max-w-4xl mx-auto px-6 pb-16">
            <img src={heroUrl} alt="" className="max-w-full h-auto rounded-lg max-h-[70vh] mx-auto block" />
          </section>
        )}

        {event.event_date && (
          <section className="py-12 sm:py-16" style={{ backgroundColor: colors.surface }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <p className="uppercase tracking-widest text-sm mb-6" style={{ color: colors.textSecondary }}>{t('wedding.daysUntilIDo', lang)}</p>
              <Countdown targetDate={event.event_date} lang={lang} />
            </div>
          </section>
        )}

        {ourStory && (
          <section className="py-16 sm:py-24">
            <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-serif italic mb-8" style={{ color: colors.text }}>{t('wedding.ourStory', lang)}</h2>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: colors.textSecondary }}>{ourStory}</p>
            </div>
          </section>
        )}

        {hasChurch && (
          <section className="py-16 sm:py-24">
            <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-serif italic mb-8" style={{ color: colors.text }}>{t('wedding.churchCeremony', lang)}</h2>
              {churchName && <h3 className="font-semibold text-lg">{churchName}</h3>}
              {churchAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={churchAddress} style={{ color: colors.textSecondary }} /></p>}
              {churchTime && <p className="text-sm mt-2"><strong>{t('time.label', lang)}</strong> {formatTime(churchTime)}</p>}
            </div>
          </section>
        )}

        <section className="py-16 sm:py-24" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-serif italic text-center mb-10" style={{ color: colors.text }}>{t('wedding.details', lang)}</h2>
            <div className="space-y-8 text-center">
              {venueName && (
                <div>
                  <h3 className="font-semibold text-lg">{venueName}</h3>
                  {venueAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={venueAddress} style={{ color: colors.textSecondary }} /></p>}
                </div>
              )}
              {hasTimes && (
                <div>
                  {ceremonyTime && <p className="text-sm"><strong>{t('time.ceremony', lang)}</strong> {formatTime(ceremonyTime)}</p>}
                  {receptionStart && (
                    <p className="text-sm mt-1"><strong>{t('time.reception', lang)}</strong> {formatTime(receptionStart)}{receptionEnd ? ` – ${formatTime(receptionEnd)}` : ''}</p>
                  )}
                  {dinnerStart && (
                    <p className="text-sm mt-1"><strong>{t('time.dinner', lang)}</strong> {formatTime(dinnerStart)}{dinnerEnd ? ` – ${formatTime(dinnerEnd)}` : ''}</p>
                  )}
                </div>
              )}
              {dressCode && (
                <div>
                  <h3 className="font-semibold">{t('wedding.dressCode', lang)}</h3>
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{dressCode}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {registryUrl && (
          <section className="py-12 sm:py-16 text-center">
            <h2 className="text-xl font-serif italic mb-4">{t('wedding.giftRegistry', lang)}</h2>
            <a href={registryUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: colors.accent, color: colors.accentText }}>
              {t('wedding.viewRegistry', lang)} <ExternalLink className="h-4 w-4" />
            </a>
          </section>
        )}

        {godparents && (
          <section className="py-12 sm:py-16" style={{ backgroundColor: colors.surface }}>
            <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl font-serif italic mb-6" style={{ color: colors.text }}>{t('wedding.padrinos', lang)}</h2>
              <p className="whitespace-pre-line leading-relaxed" style={{ color: colors.textSecondary }}>{godparents}</p>
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section className="py-16 sm:py-24" style={{ backgroundColor: colors.surface }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-serif italic text-center mb-10">{t('wedding.ourMoments', lang)}</h2>
              <PhotoGallery photos={photos} supabaseUrl={supabaseUrl} />
            </div>
          </section>
        )}

        <section className="py-16 sm:py-24" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
          <div className="max-w-lg mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-serif italic text-center mb-2">{t('wedding.rsvp', lang)}</h2>
            <p className="text-center mb-8 opacity-70">{t('wedding.kindlyRespond', lang)}</p>
            <RSVPForm eventId={event.id} accentColor="emerald" lang={lang} />
          </div>
        </section>

        {(() => { const spotifyTrack = music.find((t) => t.source === 'spotify'); return (
          <>
            {music.length > 0 && <MusicPlayer tracks={music} supabaseUrl={supabaseUrl} />}
            {spotifyTrack?.spotify_track_id && <SpotifyEmbed trackId={spotifyTrack.spotify_track_id} accentColor={colors.accent} accentText={colors.accentText} />}
          </>
        ); })()}
      </div>
    );
  }

  // ── Classic Layout (default) ──
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Hero */}
      <section
        className="relative min-h-[60vh] sm:min-h-screen flex items-center justify-center text-center px-6 py-20"
        style={heroUrl ? { backgroundImage: `url(${heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : { background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.accent} 50%, ${colors.background} 100%)` }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-2xl" style={{ color: colors.heroText }}>
          <p className="uppercase tracking-[0.2em] sm:tracking-[0.4em] text-xs sm:text-sm mb-4 sm:mb-6 opacity-80">{t('wedding.gettingMarried', lang)}</p>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif italic leading-tight">{title}</h1>
          {event.event_date && (
            <p className="mt-8 text-lg opacity-90">
              {formatDate(event.event_date, lang)}
            </p>
          )}
          <Heart className="h-6 w-6 mx-auto mt-6 opacity-70" />
        </div>
      </section>

      {/* Countdown */}
      {event.event_date && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.accent, color: colors.accentText }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="uppercase tracking-widest text-sm mb-6 opacity-80">{t('wedding.daysUntilIDo', lang)}</p>
            <Countdown targetDate={event.event_date} lang={lang} />
          </div>
        </section>
      )}

      {/* Our Story */}
      {ourStory && (
        <section className="py-12 sm:py-20" style={{ backgroundColor: colors.background }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif italic mb-6" style={{ color: colors.text }}>{t('wedding.ourStory', lang)}</h2>
            <div className="w-12 h-0.5 mx-auto mb-8" style={{ backgroundColor: colors.accent }} />
            <p className="leading-relaxed whitespace-pre-line" style={{ color: colors.textSecondary }}>{ourStory}</p>
          </div>
        </section>
      )}

      {/* Church */}
      {hasChurch && (
        <section className="py-12 sm:py-20" style={{ backgroundColor: colors.background }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif italic mb-6" style={{ color: colors.text }}>{t('wedding.churchCeremony', lang)}</h2>
            <div className="w-12 h-0.5 mx-auto mb-8" style={{ backgroundColor: colors.accent }} />
            {churchName && <h3 className="font-semibold text-lg">{churchName}</h3>}
            {churchAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={churchAddress} style={{ color: colors.textSecondary }} /></p>}
            {churchTime && <p className="text-sm mt-2"><strong>{t('time.label', lang)}</strong> {formatTime(churchTime)}</p>}
          </div>
        </section>
      )}

      {/* Details */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: colors.surface }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif italic text-center mb-8 sm:mb-10" style={{ color: colors.text }}>{t('wedding.weddingDetails', lang)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {venueName && (
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3 className="font-semibold text-lg">{venueName}</h3>
                {venueAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={venueAddress} style={{ color: colors.textSecondary }} /></p>}
              </div>
            )}
            {hasTimes && (
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-3" style={{ color: colors.accent }} />
                {ceremonyTime && <p className="text-sm"><strong>{t('time.ceremony', lang)}</strong> {formatTime(ceremonyTime)}</p>}
                {receptionStart && (
                  <p className="text-sm mt-1"><strong>{t('time.reception', lang)}</strong> {formatTime(receptionStart)}{receptionEnd ? ` – ${formatTime(receptionEnd)}` : ''}</p>
                )}
                {dinnerStart && (
                  <p className="text-sm mt-1"><strong>{t('time.dinner', lang)}</strong> {formatTime(dinnerStart)}{dinnerEnd ? ` – ${formatTime(dinnerEnd)}` : ''}</p>
                )}
              </div>
            )}
            {dressCode && (
              <div className="text-center">
                <h3 className="font-semibold">{t('wedding.dressCode', lang)}</h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{dressCode}</p>
              </div>
            )}
            {accommodations && (
              <div className="text-center">
                <h3 className="font-semibold">{t('wedding.accommodations', lang)}</h3>
                <p className="text-sm mt-1 whitespace-pre-line" style={{ color: colors.textSecondary }}>{accommodations}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Registry */}
      {registryUrl && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
          <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-serif italic mb-4" style={{ color: colors.text }}>{t('wedding.giftRegistry', lang)}</h2>
            <a href={registryUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.accent, color: colors.accentText }}>
              {t('wedding.viewRegistry', lang)} <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>
      )}

      {/* Godparents */}
      {godparents && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif italic mb-6" style={{ color: colors.text }}>{t('wedding.padrinos', lang)}</h2>
            <p className="whitespace-pre-line leading-relaxed" style={{ color: colors.textSecondary }}>{godparents}</p>
          </div>
        </section>
      )}

      {/* Special Message */}
      {specialMessage && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-4" style={{ color: colors.accent }} />
            <p className="text-lg leading-relaxed italic" style={{ color: colors.textSecondary }}>&ldquo;{specialMessage}&rdquo;</p>
          </div>
        </section>
      )}

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <section className="py-12 sm:py-20" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-serif italic text-center mb-8 sm:mb-10">{t('wedding.ourMoments', lang)}</h2>
            <PhotoGallery photos={photos} supabaseUrl={supabaseUrl} />
          </div>
        </section>
      )}

      {/* RSVP */}
      <section className="py-12 sm:py-20" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif italic text-center mb-2">{t('wedding.rsvp', lang)}</h2>
          <p className="text-center mb-8 opacity-70">{t('wedding.kindlyRespond', lang)}</p>
          <RSVPForm eventId={event.id} accentColor="emerald" lang={lang} />
        </div>
      </section>

      {/* Music Player */}
      {(() => { const spotifyTrack = music.find((t) => t.source === 'spotify'); return (
          <>
            {music.length > 0 && <MusicPlayer tracks={music} supabaseUrl={supabaseUrl} />}
            {spotifyTrack?.spotify_track_id && <SpotifyEmbed trackId={spotifyTrack.spotify_track_id} accentColor={colors.accent} accentText={colors.accentText} />}
          </>
        ); })()}
    </div>
  );
}
