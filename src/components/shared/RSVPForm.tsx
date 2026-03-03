'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { Lang, t } from '@/lib/translations';

interface Props {
  eventId: string;
  accentColor?: string;
  lang?: Lang;
}

export default function RSVPForm({ eventId, accentColor = 'purple', lang = 'en' }: Props) {
  const [guestName, setGuestName] = useState('');
  const [attending, setAttending] = useState(true);
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDemo(params.get('demo') === 'true');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) return;

    setLoading(true);
    setError('');

    // Demo mode: fake the submission
    if (isDemo) {
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          guest_name: guestName,
          attending,
          guest_count: attending ? guestCount : 0,
          message: message || null,
          song_request: songRequest || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(t('rsvp.error', lang));
      }
    } catch {
      setError(t('rsvp.error', lang));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
        <p className="text-lg font-semibold">{t('rsvp.thankYou', lang, { name: guestName })}</p>
        <p className="text-sm mt-1 opacity-80">
          {attending ? t('rsvp.lookForward', lang) : t('rsvp.missYou', lang)}
        </p>
      </div>
    );
  }

  const btnClass = {
    purple: 'bg-purple-600 hover:bg-purple-700',
    rose: 'bg-rose-600 hover:bg-rose-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    violet: 'bg-violet-600 hover:bg-violet-700',
    sky: 'bg-sky-600 hover:bg-sky-700',
  }[accentColor] || 'bg-purple-600 hover:bg-purple-700';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <input
          type="text"
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder={t('rsvp.yourName', lang)}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm placeholder:text-white/50 focus:border-white/40 focus:ring-1 focus:ring-white/40 outline-none backdrop-blur-sm"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setAttending(true)}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold border transition-colors ${
            attending ? 'bg-white text-gray-900 border-white' : 'border-white/30 hover:border-white/50'
          }`}
        >
          {t('rsvp.attending', lang)}
        </button>
        <button
          type="button"
          onClick={() => setAttending(false)}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold border transition-colors ${
            !attending ? 'bg-white text-gray-900 border-white' : 'border-white/30 hover:border-white/50'
          }`}
        >
          {t('rsvp.notAttending', lang)}
        </button>
      </div>

      {attending && (
        <div>
          <label className="block text-sm mb-1 opacity-80">{t('rsvp.numberOfGuests', lang)}</label>
          <select
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm focus:border-white/40 outline-none backdrop-blur-sm"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n} className="text-gray-900">{n}</option>
            ))}
          </select>
        </div>
      )}

      {attending && (
        <div>
          <input
            type="text"
            value={songRequest}
            onChange={(e) => setSongRequest(e.target.value)}
            placeholder={t('rsvp.songRequest', lang)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm placeholder:text-white/50 focus:border-white/40 focus:ring-1 focus:ring-white/40 outline-none backdrop-blur-sm"
          />
        </div>
      )}

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('rsvp.leaveMessage', lang)}
          rows={3}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm placeholder:text-white/50 focus:border-white/40 outline-none backdrop-blur-sm resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 rounded-lg ${btnClass} text-white py-3 text-sm font-semibold transition-colors disabled:opacity-50`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {loading ? t('rsvp.sending', lang) : t('rsvp.sendRsvp', lang)}
      </button>
    </form>
  );
}
