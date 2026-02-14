'use client';

import { FullEventData, ThemeVariant } from '@/types';
import { getThemeById, getDefaultTheme } from '@/lib/themes';
import Countdown from '@/components/shared/Countdown';
import PhotoGallery from '@/components/shared/PhotoGallery';
import MusicPlayer from '@/components/shared/MusicPlayer';
import SpotifyEmbed from '@/components/shared/SpotifyEmbed';
import RSVPForm from '@/components/shared/RSVPForm';
import AddressLink from '@/components/shared/AddressLink';
import { Baby, MapPin, Clock, Gift, ExternalLink, Heart } from 'lucide-react';

interface Props {
  data: FullEventData;
  supabaseUrl: string;
  theme?: ThemeVariant;
}

function getDetail(details: FullEventData['details'], key: string): string {
  return details.find((d) => d.detail_key === key)?.detail_value || '';
}

function formatDate(dateStr: string): string {
  const datePart = dateStr.substring(0, 10);
  return new Date(`${datePart}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function BabyShowerTemplate({ data, supabaseUrl, theme: themeProp }: Props) {
  const { event, details, photos, music } = data;
  const theme = themeProp ?? (event.theme_id ? getThemeById(event.theme_id) : undefined) ?? getDefaultTheme('baby_shower');
  const { colors, layout } = theme;

  const heroPhoto = photos.find((p) => p.is_hero);
  const heroUrl = heroPhoto
    ? `${supabaseUrl}/storage/v1/object/public/event-photos/${heroPhoto.storage_path}`
    : null;

  const parentNames = getDetail(details, 'parent_names') || event.event_name;
  const babyName = getDetail(details, 'baby_name');
  const dueDate = getDetail(details, 'due_date');
  const churchName = getDetail(details, 'church_name');
  const churchAddress = getDetail(details, 'church_address');
  const churchTime = getDetail(details, 'church_time');
  const venueName = getDetail(details, 'venue_name');
  const venueAddress = getDetail(details, 'venue_address');
  const showerTime = getDetail(details, 'shower_time');
  const receptionStart = getDetail(details, 'reception_start');
  const receptionEnd = getDetail(details, 'reception_end');
  const dinnerStart = getDetail(details, 'dinner_start');
  const dinnerEnd = getDetail(details, 'dinner_end');
  const showerTheme = getDetail(details, 'theme');
  const registryUrl = getDetail(details, 'registry_url');
  const specialMessage = getDetail(details, 'special_message');

  const hasChurch = churchName || churchAddress || churchTime;
  const hasTimes = showerTime || receptionStart || dinnerStart;

  // ── Split Layout ──
  if (layout === 'split') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
        <section className="relative md:grid md:grid-cols-2 md:min-h-screen">
          <div className="split-hero-clip relative z-10 min-h-[55vh] md:min-h-0 flex items-center justify-center p-8 md:p-16 pb-20 md:pb-16" style={{ backgroundColor: colors.hero }}>
            <div className="text-center" style={{ color: colors.heroText }}>
              <Baby className="h-14 w-14 mx-auto mb-6" style={{ color: colors.accent }} />
              <p className="uppercase tracking-[0.2em] text-xs sm:text-sm mb-4 opacity-80">Baby Shower</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                {babyName ? (
                  <>Welcome Baby <span style={{ color: colors.accent }}>{babyName}</span></>
                ) : event.event_name}
              </h1>
              <p className="mt-4 text-lg opacity-90">Celebrating {parentNames}</p>
              {event.event_date && (
                <p className="mt-4 opacity-80">
                  {formatDate(event.event_date)}
                </p>
              )}
            </div>
          </div>
          <div
            className="min-h-[50vh] md:min-h-0 -mt-12 md:mt-0"
            style={heroUrl ? { backgroundImage: `url(${heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: colors.accent }}
          />
        </section>

        {event.event_date && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <p className="uppercase tracking-widest text-sm mb-6" style={{ color: colors.textSecondary }}>
                {dueDate ? 'Baby Arrives In' : 'Shower Day In'}
              </p>
              <Countdown targetDate={dueDate || event.event_date} />
            </div>
          </section>
        )}

        {specialMessage && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-4" style={{ color: colors.accent }} />
              <p className="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>{specialMessage}</p>
            </div>
          </section>
        )}

        {hasChurch && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Church Ceremony</h2>
              {churchName && <h3 className="font-semibold text-lg">{churchName}</h3>}
              {churchAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={churchAddress} style={{ color: colors.textSecondary }} /></p>}
              {churchTime && <p className="text-sm mt-2"><strong>Time:</strong> {formatTime(churchTime)}</p>}
            </div>
          </section>
        )}

        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Shower Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {venueName && (
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.background }}>
                  <MapPin className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                  <h3 className="font-bold text-lg">{venueName}</h3>
                  {venueAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={venueAddress} style={{ color: colors.textSecondary }} /></p>}
                </div>
              )}
              {hasTimes && (
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.background }}>
                  <Clock className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                  <h3 className="font-bold">Times</h3>
                  {showerTime && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Shower:</strong> {formatTime(showerTime)}</p>}
                  {receptionStart && (
                    <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Reception:</strong> {formatTime(receptionStart)}{receptionEnd ? ` – ${formatTime(receptionEnd)}` : ''}</p>
                  )}
                  {dinnerStart && (
                    <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Dinner:</strong> {formatTime(dinnerStart)}{dinnerEnd ? ` – ${formatTime(dinnerEnd)}` : ''}</p>
                  )}
                </div>
              )}
              {showerTheme && (
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.background }}>
                  <Baby className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                  <h3 className="font-bold">Theme</h3>
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{showerTheme}</p>
                </div>
              )}
              {dueDate && (
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.background }}>
                  <Heart className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                  <h3 className="font-bold">Due Date</h3>
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    {formatDate(dueDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {registryUrl && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
            <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
              <Gift className="h-10 w-10 mx-auto mb-4" style={{ color: colors.accent }} />
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Gift Registry</h2>
              <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>Help welcome the little one with something special!</p>
              <a href={registryUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold hover:opacity-90"
                style={{ backgroundColor: colors.accent, color: colors.accentText }}>
                View Registry <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Photos</h2>
              <PhotoGallery photos={photos} supabaseUrl={supabaseUrl} />
            </div>
          </section>
        )}

        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
          <div className="max-w-lg mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">RSVP</h2>
            <p className="text-center mb-8 opacity-70">Please let us know if you can join us!</p>
            <RSVPForm eventId={event.id} accentColor="sky" />
          </div>
        </section>

        {(() => { const spotifyTrack = music.find((t) => t.source === 'spotify'); return (
          <>
            {music.length > 0 && <MusicPlayer tracks={music} supabaseUrl={supabaseUrl} hasSpotify={!!spotifyTrack} />}
            {spotifyTrack?.spotify_track_id && <SpotifyEmbed trackId={spotifyTrack.spotify_track_id} />}
          </>
        ); })()}
      </div>
    );
  }

  // ── Minimal Layout ──
  if (layout === 'minimal') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
        <section className="py-24 sm:py-40 text-center px-6">
          <div className="max-w-xl mx-auto">
            <Baby className="h-12 w-12 mx-auto mb-6" style={{ color: colors.accent }} />
            <p className="uppercase tracking-[0.3em] text-xs mb-6" style={{ color: colors.textSecondary }}>Baby Shower</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              {babyName ? (
                <>Welcome Baby <span style={{ color: colors.accent }}>{babyName}</span></>
              ) : event.event_name}
            </h1>
            <p className="mt-4 text-lg" style={{ color: colors.textSecondary }}>Celebrating {parentNames}</p>
            {event.event_date && (
              <p className="mt-4" style={{ color: colors.textSecondary }}>
                {formatDate(event.event_date)}
              </p>
            )}
            <div className="w-12 h-0.5 mx-auto mt-8" style={{ backgroundColor: colors.accent }} />
          </div>
        </section>

        {heroUrl && (
          <section className="max-w-4xl mx-auto px-6 pb-16">
            <img src={heroUrl} alt="" className="w-full h-auto rounded-lg object-cover max-h-[60vh]" />
          </section>
        )}

        {event.event_date && (
          <section className="py-12 sm:py-16" style={{ backgroundColor: colors.surface }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <p className="uppercase tracking-widest text-sm mb-6" style={{ color: colors.textSecondary }}>
                {dueDate ? 'Baby Arrives In' : 'Shower Day In'}
              </p>
              <Countdown targetDate={dueDate || event.event_date} />
            </div>
          </section>
        )}

        {specialMessage && (
          <section className="py-16 sm:py-20">
            <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
              <p className="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>{specialMessage}</p>
            </div>
          </section>
        )}

        {hasChurch && (
          <section className="py-16 sm:py-24">
            <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8">Church Ceremony</h2>
              {churchName && <h3 className="font-semibold text-lg">{churchName}</h3>}
              {churchAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={churchAddress} style={{ color: colors.textSecondary }} /></p>}
              {churchTime && <p className="text-sm mt-2"><strong>Time:</strong> {formatTime(churchTime)}</p>}
            </div>
          </section>
        )}

        <section className="py-16 sm:py-24" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-xl mx-auto px-4 sm:px-6 text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10">Details</h2>
            {venueName && (
              <div>
                <h3 className="font-bold text-lg">{venueName}</h3>
                {venueAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={venueAddress} style={{ color: colors.textSecondary }} /></p>}
              </div>
            )}
            {hasTimes && (
              <div>
                {showerTime && <p className="text-sm"><strong>Shower:</strong> {formatTime(showerTime)}</p>}
                {receptionStart && (
                  <p className="text-sm mt-1"><strong>Reception:</strong> {formatTime(receptionStart)}{receptionEnd ? ` – ${formatTime(receptionEnd)}` : ''}</p>
                )}
                {dinnerStart && (
                  <p className="text-sm mt-1"><strong>Dinner:</strong> {formatTime(dinnerStart)}{dinnerEnd ? ` – ${formatTime(dinnerEnd)}` : ''}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {registryUrl && (
          <section className="py-12 sm:py-16 text-center">
            <Gift className="h-10 w-10 mx-auto mb-4" style={{ color: colors.accent }} />
            <h2 className="text-xl font-bold mb-4">Gift Registry</h2>
            <a href={registryUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: colors.accent, color: colors.accentText }}>
              View Registry <ExternalLink className="h-4 w-4" />
            </a>
          </section>
        )}

        {photos.length > 0 && (
          <section className="py-16 sm:py-24" style={{ backgroundColor: colors.surface }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Photos</h2>
              <PhotoGallery photos={photos} supabaseUrl={supabaseUrl} />
            </div>
          </section>
        )}

        <section className="py-16 sm:py-24" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
          <div className="max-w-lg mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">RSVP</h2>
            <p className="text-center mb-8 opacity-70">Please let us know if you can join us!</p>
            <RSVPForm eventId={event.id} accentColor="sky" />
          </div>
        </section>

        {(() => { const spotifyTrack = music.find((t) => t.source === 'spotify'); return (
          <>
            {music.length > 0 && <MusicPlayer tracks={music} supabaseUrl={supabaseUrl} hasSpotify={!!spotifyTrack} />}
            {spotifyTrack?.spotify_track_id && <SpotifyEmbed trackId={spotifyTrack.spotify_track_id} />}
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
        style={heroUrl ? { backgroundImage: `url(${heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 30%, ${colors.accent}33 70%, ${colors.background} 100%)` }}
      >
        {heroUrl && <div className="absolute inset-0 bg-white/20" />}
        <div className="relative z-10 max-w-2xl">
          <Baby className="h-14 w-14 mx-auto mb-6" style={{ color: colors.accent }} />
          <p className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm mb-4" style={{ color: colors.textSecondary }}>Baby Shower</p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
            {babyName ? (
              <>
                Welcome Baby
                <br />
                <span style={{ color: colors.accent }}>{babyName}</span>
              </>
            ) : (
              event.event_name
            )}
          </h1>
          <p className="mt-4 text-lg" style={{ color: colors.textSecondary }}>Celebrating {parentNames}</p>
          {event.event_date && (
            <p className="mt-4" style={{ color: colors.textSecondary }}>
              {formatDate(event.event_date)}
            </p>
          )}
        </div>
      </section>

      {/* Countdown */}
      {event.event_date && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="uppercase tracking-widest text-sm mb-6" style={{ color: colors.textSecondary }}>
              {dueDate ? 'Baby Arrives In' : 'Shower Day In'}
            </p>
            <Countdown targetDate={dueDate || event.event_date} />
          </div>
        </section>
      )}

      {/* Special Message */}
      {specialMessage && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <Heart className="h-8 w-8 mx-auto mb-4" style={{ color: colors.accent }} />
            <p className="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>{specialMessage}</p>
          </div>
        </section>
      )}

      {/* Church */}
      {hasChurch && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Church Ceremony</h2>
            {churchName && <h3 className="font-semibold text-lg">{churchName}</h3>}
            {churchAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={churchAddress} style={{ color: colors.textSecondary }} /></p>}
            {churchTime && <p className="text-sm mt-2"><strong>Time:</strong> {formatTime(churchTime)}</p>}
          </div>
        </section>
      )}

      {/* Details */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Shower Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {venueName && (
              <div className="rounded-2xl shadow-sm p-6 text-center border" style={{ backgroundColor: colors.background, borderColor: `${colors.accent}22` }}>
                <MapPin className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3 className="font-bold text-lg">{venueName}</h3>
                {venueAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><AddressLink address={venueAddress} style={{ color: colors.textSecondary }} /></p>}
              </div>
            )}
            {hasTimes && (
              <div className="rounded-2xl shadow-sm p-6 text-center border" style={{ backgroundColor: colors.background, borderColor: `${colors.accent}22` }}>
                <Clock className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3 className="font-bold">Times</h3>
                {showerTime && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Shower:</strong> {formatTime(showerTime)}</p>}
                {receptionStart && (
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Reception:</strong> {formatTime(receptionStart)}{receptionEnd ? ` – ${formatTime(receptionEnd)}` : ''}</p>
                )}
                {dinnerStart && (
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Dinner:</strong> {formatTime(dinnerStart)}{dinnerEnd ? ` – ${formatTime(dinnerEnd)}` : ''}</p>
                )}
              </div>
            )}
            {showerTheme && (
              <div className="rounded-2xl shadow-sm p-6 text-center border" style={{ backgroundColor: colors.background, borderColor: `${colors.accent}22` }}>
                <Baby className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3 className="font-bold">Theme</h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{showerTheme}</p>
              </div>
            )}
            {dueDate && (
              <div className="rounded-2xl shadow-sm p-6 text-center border" style={{ backgroundColor: colors.background, borderColor: `${colors.accent}22` }}>
                <Heart className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3 className="font-bold">Due Date</h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  {formatDate(dueDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Registry */}
      {registryUrl && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
          <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
            <Gift className="h-10 w-10 mx-auto mb-4" style={{ color: colors.accent }} />
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Gift Registry</h2>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>Help welcome the little one with something special!</p>
            <a href={registryUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.accent, color: colors.accentText }}>
              View Registry <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>
      )}

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Photos</h2>
            <PhotoGallery photos={photos} supabaseUrl={supabaseUrl} />
          </div>
        </section>
      )}

      {/* RSVP */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">RSVP</h2>
          <p className="text-center mb-8 opacity-70">Please let us know if you can join us!</p>
          <RSVPForm eventId={event.id} accentColor="sky" />
        </div>
      </section>

      {/* Music Player */}
      {(() => { const spotifyTrack = music.find((t) => t.source === 'spotify'); return (
          <>
            {music.length > 0 && <MusicPlayer tracks={music} supabaseUrl={supabaseUrl} hasSpotify={!!spotifyTrack} />}
            {spotifyTrack?.spotify_track_id && <SpotifyEmbed trackId={spotifyTrack.spotify_track_id} />}
          </>
        ); })()}
    </div>
  );
}
