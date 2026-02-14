'use client';

import { FullEventData, ThemeVariant } from '@/types';
import { getThemeById, getDefaultTheme } from '@/lib/themes';
import Countdown from '@/components/shared/Countdown';
import PhotoGallery from '@/components/shared/PhotoGallery';
import MusicPlayer from '@/components/shared/MusicPlayer';
import RSVPForm from '@/components/shared/RSVPForm';
import { Cake, MapPin, Clock, PartyPopper } from 'lucide-react';

interface Props {
  data: FullEventData;
  supabaseUrl: string;
  theme?: ThemeVariant;
}

function getDetail(details: FullEventData['details'], key: string): string {
  return details.find((d) => d.detail_key === key)?.detail_value || '';
}

export default function BirthdayTemplate({ data, supabaseUrl, theme: themeProp }: Props) {
  const { event, details, photos, music } = data;
  const theme = themeProp ?? (event.theme_id ? getThemeById(event.theme_id) : undefined) ?? getDefaultTheme('birthday');
  const { colors, layout } = theme;

  const heroPhoto = photos.find((p) => p.is_hero);
  const heroUrl = heroPhoto
    ? `${supabaseUrl}/storage/v1/object/public/event-photos/${heroPhoto.storage_path}`
    : null;

  const birthdayPerson = getDetail(details, 'birthday_person') || event.event_name;
  const turningAge = getDetail(details, 'turning_age');
  const churchName = getDetail(details, 'church_name');
  const churchAddress = getDetail(details, 'church_address');
  const churchTime = getDetail(details, 'church_time');
  const venueName = getDetail(details, 'venue_name');
  const venueAddress = getDetail(details, 'venue_address');
  const partyTime = getDetail(details, 'party_time');
  const receptionStart = getDetail(details, 'reception_start');
  const receptionEnd = getDetail(details, 'reception_end');
  const dinnerStart = getDetail(details, 'dinner_start');
  const dinnerEnd = getDetail(details, 'dinner_end');
  const partyTheme = getDetail(details, 'theme');
  const specialMessage = getDetail(details, 'special_message');
  const dressCode = getDetail(details, 'dress_code');

  const hasChurch = churchName || churchAddress || churchTime;
  const hasTimes = partyTime || receptionStart || dinnerStart;

  // ── Split Layout ──
  if (layout === 'split') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
        <section className="relative md:grid md:grid-cols-2 md:min-h-screen">
          <div
            className="split-hero-clip relative z-10 min-h-[55vh] md:min-h-0 flex items-center justify-center p-8 md:p-16 pb-20 md:pb-16"
            style={{ backgroundColor: colors.hero }}
          >
            <div className="text-center" style={{ color: colors.heroText }}>
              <PartyPopper className="h-12 w-12 mx-auto mb-6" style={{ color: colors.accent }} />
              {turningAge && (
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-6" style={{ borderColor: colors.accent }}>
                  <span className="text-4xl font-bold" style={{ color: colors.accent }}>{turningAge}</span>
                </div>
              )}
              <p className="uppercase tracking-[0.2em] text-xs sm:text-sm mb-4 opacity-80">
                {turningAge ? `Turning ${turningAge}!` : 'Birthday Celebration'}
              </p>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">{birthdayPerson}</h1>
              {event.event_date && (
                <p className="mt-6 text-lg opacity-90">
                  {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
              <p className="uppercase tracking-widest text-sm mb-6" style={{ color: colors.textSecondary }}>Party Starts In</p>
              <Countdown targetDate={event.event_date} />
            </div>
          </section>
        )}

        {specialMessage && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <Cake className="h-8 w-8 mx-auto mb-4" style={{ color: colors.accent }} />
              <p className="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>{specialMessage}</p>
            </div>
          </section>
        )}

        {hasChurch && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Church Ceremony</h2>
              {churchName && <h3 className="font-semibold text-lg">{churchName}</h3>}
              {churchAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{churchAddress}</p>}
              {churchTime && <p className="text-sm mt-2"><strong>Time:</strong> {churchTime}</p>}
            </div>
          </section>
        )}

        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Party Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {venueName && (
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.background }}>
                  <MapPin className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                  <h3 className="font-bold text-lg">{venueName}</h3>
                  {venueAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{venueAddress}</p>}
                </div>
              )}
              {hasTimes && (
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.background }}>
                  <Clock className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                  <h3 className="font-bold">Times</h3>
                  {partyTime && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Party:</strong> {partyTime}</p>}
                  {receptionStart && (
                    <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Reception:</strong> {receptionStart}{receptionEnd ? ` – ${receptionEnd}` : ''}</p>
                  )}
                  {dinnerStart && (
                    <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Dinner:</strong> {dinnerStart}{dinnerEnd ? ` – ${dinnerEnd}` : ''}</p>
                  )}
                </div>
              )}
              {partyTheme && (
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.background }}>
                  <PartyPopper className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                  <h3 className="font-bold">Theme</h3>
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{partyTheme}</p>
                </div>
              )}
              {dressCode && (
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: colors.background }}>
                  <Cake className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                  <h3 className="font-bold">Dress Code</h3>
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{dressCode}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {photos.length > 0 && (
          <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Photo Gallery</h2>
              <PhotoGallery photos={photos} supabaseUrl={supabaseUrl} />
            </div>
          </section>
        )}

        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
          <div className="max-w-lg mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">RSVP</h2>
            <p className="text-center mb-8 opacity-70">Let us know if you can make it!</p>
            <RSVPForm eventId={event.id} accentColor="violet" />
          </div>
        </section>

        {music.length > 0 && <MusicPlayer tracks={music} supabaseUrl={supabaseUrl} />}
      </div>
    );
  }

  // ── Minimal Layout ──
  if (layout === 'minimal') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
        <section className="py-24 sm:py-40 text-center px-6">
          <div className="max-w-xl mx-auto">
            <PartyPopper className="h-10 w-10 mx-auto mb-6" style={{ color: colors.accent }} />
            {turningAge && <p className="text-6xl font-bold mb-4" style={{ color: colors.accent }}>{turningAge}</p>}
            <p className="uppercase tracking-[0.2em] text-xs mb-4" style={{ color: colors.textSecondary }}>
              {turningAge ? `Turning ${turningAge}!` : 'Birthday Celebration'}
            </p>
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight">{birthdayPerson}</h1>
            {event.event_date && (
              <p className="mt-6 text-lg" style={{ color: colors.textSecondary }}>
                {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
              <p className="uppercase tracking-widest text-sm mb-6" style={{ color: colors.textSecondary }}>Party Starts In</p>
              <Countdown targetDate={event.event_date} />
            </div>
          </section>
        )}

        {specialMessage && (
          <section className="py-12 sm:py-16">
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
              {churchAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{churchAddress}</p>}
              {churchTime && <p className="text-sm mt-2"><strong>Time:</strong> {churchTime}</p>}
            </div>
          </section>
        )}

        <section className="py-16 sm:py-24" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-xl mx-auto px-4 sm:px-6 text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10">Party Details</h2>
            {venueName && (
              <div>
                <h3 className="font-bold text-lg">{venueName}</h3>
                {venueAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{venueAddress}</p>}
              </div>
            )}
            {hasTimes && (
              <div>
                {partyTime && <p className="text-sm"><strong>Party:</strong> {partyTime}</p>}
                {receptionStart && (
                  <p className="text-sm mt-1"><strong>Reception:</strong> {receptionStart}{receptionEnd ? ` – ${receptionEnd}` : ''}</p>
                )}
                {dinnerStart && (
                  <p className="text-sm mt-1"><strong>Dinner:</strong> {dinnerStart}{dinnerEnd ? ` – ${dinnerEnd}` : ''}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {photos.length > 0 && (
          <section className="py-16 sm:py-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Photos</h2>
              <PhotoGallery photos={photos} supabaseUrl={supabaseUrl} />
            </div>
          </section>
        )}

        <section className="py-16 sm:py-24" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
          <div className="max-w-lg mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">RSVP</h2>
            <p className="text-center mb-8 opacity-70">Let us know if you can make it!</p>
            <RSVPForm eventId={event.id} accentColor="violet" />
          </div>
        </section>

        {music.length > 0 && <MusicPlayer tracks={music} supabaseUrl={supabaseUrl} />}
      </div>
    );
  }

  // ── Classic Layout (default) ──
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Hero */}
      <section
        className="relative min-h-[60vh] sm:min-h-screen flex items-center justify-center text-center px-6 py-20"
        style={heroUrl ? { backgroundImage: `url(${heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${colors.background}4D, ${colors.surface}33, ${colors.background}66)` }} />
        <div className="relative z-10 max-w-2xl" style={{ color: heroUrl ? '#ffffff' : colors.heroText }}>
          <PartyPopper className="h-12 w-12 mx-auto mb-6" style={{ color: colors.accent }} />
          {turningAge && (
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-6" style={{ borderColor: colors.accent }}>
              <span className="text-4xl font-bold" style={{ color: colors.accent }}>{turningAge}</span>
            </div>
          )}
          <p className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm mb-4" style={{ color: colors.textSecondary }}>
            {turningAge ? `Turning ${turningAge}!` : 'Birthday Celebration'}
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight">{birthdayPerson}</h1>
          {event.event_date && (
            <p className="mt-6 text-lg opacity-90">
              {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </section>

      {/* Countdown */}
      {event.event_date && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="uppercase tracking-widest text-sm mb-6" style={{ color: colors.textSecondary }}>Party Starts In</p>
            <Countdown targetDate={event.event_date} />
          </div>
        </section>
      )}

      {/* Special Message */}
      {specialMessage && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <Cake className="h-8 w-8 mx-auto mb-4" style={{ color: colors.accent }} />
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
            {churchAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{churchAddress}</p>}
            {churchTime && <p className="text-sm mt-2"><strong>Time:</strong> {churchTime}</p>}
          </div>
        </section>
      )}

      {/* Party Details */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: colors.surface }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Party Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {venueName && (
              <div className="backdrop-blur-sm rounded-2xl p-6 text-center" style={{ backgroundColor: `${colors.background}` }}>
                <MapPin className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3 className="font-bold text-lg">{venueName}</h3>
                {venueAddress && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{venueAddress}</p>}
              </div>
            )}
            {hasTimes && (
              <div className="backdrop-blur-sm rounded-2xl p-6 text-center" style={{ backgroundColor: `${colors.background}` }}>
                <Clock className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3 className="font-bold">Times</h3>
                {partyTime && <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Party:</strong> {partyTime}</p>}
                {receptionStart && (
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Reception:</strong> {receptionStart}{receptionEnd ? ` – ${receptionEnd}` : ''}</p>
                )}
                {dinnerStart && (
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}><strong>Dinner:</strong> {dinnerStart}{dinnerEnd ? ` – ${dinnerEnd}` : ''}</p>
                )}
              </div>
            )}
            {partyTheme && (
              <div className="backdrop-blur-sm rounded-2xl p-6 text-center" style={{ backgroundColor: `${colors.background}` }}>
                <PartyPopper className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3 className="font-bold">Theme</h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{partyTheme}</p>
              </div>
            )}
            {dressCode && (
              <div className="backdrop-blur-sm rounded-2xl p-6 text-center" style={{ backgroundColor: `${colors.background}` }}>
                <Cake className="h-6 w-6 mx-auto mb-3" style={{ color: colors.accent }} />
                <h3 className="font-bold">Dress Code</h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{dressCode}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: colors.background }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">Photo Gallery</h2>
            <PhotoGallery photos={photos} supabaseUrl={supabaseUrl} />
          </div>
        </section>
      )}

      {/* RSVP */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: colors.hero, color: colors.heroText }}>
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">RSVP</h2>
          <p className="text-center mb-8 opacity-70">Let us know if you can make it!</p>
          <RSVPForm eventId={event.id} accentColor="violet" />
        </div>
      </section>

      {/* Music Player */}
      {music.length > 0 && <MusicPlayer tracks={music} supabaseUrl={supabaseUrl} />}
    </div>
  );
}
