'use client';

import { useState } from 'react';
import { Event, FullEventData, ThemeVariant } from '@/types';
import { getThemesForEventType, getThemeById } from '@/lib/themes';
import { Crown, Check, Eye, X, Lock, ShoppingCart } from 'lucide-react';
import { t, type Lang } from '@/lib/translations';

interface Props {
  event: Event;
  data: FullEventData;
  supabaseUrl: string;
  lang: Lang;
  onThemeChange: (themeId: string) => void;
  isGuest?: boolean;
}

function MiniPreview({ theme }: { theme: ThemeVariant }) {
  const { colors, layout } = theme;

  if (layout === 'split') {
    return (
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 flex">
        <div className="w-1/2 flex flex-col items-center justify-center p-2" style={{ backgroundColor: colors.hero }}>
          <div className="h-1 w-8 rounded mb-1" style={{ backgroundColor: colors.heroText, opacity: 0.5 }} />
          <div className="h-2 w-16 rounded mb-1" style={{ backgroundColor: colors.heroText }} />
          <div className="h-1 w-10 rounded" style={{ backgroundColor: colors.heroText, opacity: 0.7 }} />
        </div>
        <div className="w-1/2" style={{ backgroundColor: colors.accent }} />
      </div>
    );
  }

  if (layout === 'minimal') {
    return (
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 flex flex-col" style={{ backgroundColor: colors.background }}>
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <div className="h-1 w-6 rounded mb-1" style={{ backgroundColor: colors.textSecondary }} />
          <div className="h-2 w-20 rounded mb-1" style={{ backgroundColor: colors.text }} />
          <div className="h-1 w-12 rounded" style={{ backgroundColor: colors.textSecondary }} />
        </div>
        <div className="h-1/3 mx-3 mb-2 rounded" style={{ backgroundColor: colors.accent, opacity: 0.3 }} />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 flex flex-col" style={{ backgroundColor: colors.background }}>
      <div className="h-1/2 flex items-center justify-center" style={{ backgroundColor: colors.hero }}>
        <div className="text-center">
          <div className="h-1 w-6 rounded mx-auto mb-1" style={{ backgroundColor: colors.heroText, opacity: 0.5 }} />
          <div className="h-2 w-14 rounded mx-auto" style={{ backgroundColor: colors.heroText }} />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-2 gap-1">
        <div className="h-1 w-16 rounded" style={{ backgroundColor: colors.text }} />
        <div className="h-1 w-10 rounded" style={{ backgroundColor: colors.textSecondary }} />
        <div className="h-3 w-12 rounded mt-1" style={{ backgroundColor: colors.accent }} />
      </div>
    </div>
  );
}

function PreviewModal({ theme, eventId, lang, onClose }: {
  theme: ThemeVariant;
  eventId: string;
  lang: Lang;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
      <div
        className="absolute inset-x-0 top-0 bottom-0 mx-auto max-w-[390px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 shrink-0">
          <h3 className="font-semibold text-white text-sm">{theme.name} {t('dash.previewTitle', lang)}</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* iframe loads the actual template page — identical to the real site */}
        <div className="flex-1 rounded-t-xl overflow-hidden">
          <iframe
            src={`/dashboard/${eventId}/preview?theme_id=${encodeURIComponent(theme.id)}`}
            className="w-full h-full border-0"
            title={`${theme.name} preview`}
          />
        </div>
      </div>
    </div>
  );
}

export default function ThemePicker({ event, data, supabaseUrl, lang, onThemeChange, isGuest }: Props) {
  const themes = getThemesForEventType(event.event_type);
  const [selectedId, setSelectedId] = useState(event.theme_id || themes[0]?.id);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeVariant | null>(null);

  const selectedTheme = selectedId ? getThemeById(selectedId) : null;
  const isPublished = event.status === 'published';

  function isPremiumLocked(theme: ThemeVariant) {
    if (!theme.isPremium) return false;
    // Once premium is paid, all premium themes are unlocked
    if (event.theme_premium_paid) return false;
    // If published without premium, lock until they upgrade
    if (isPublished) return true;
    // Pre-publish: allow selecting (adds +$50 to checkout)
    return false;
  }

  // Can upgrade = published, no premium paid yet
  const canUpgrade = isPublished && !event.theme_premium_paid;
  const hasPremiumSelected = selectedTheme?.isPremium && !event.theme_premium_paid && !isPublished;

  async function handleSelect(theme: ThemeVariant) {
    if (isPremiumLocked(theme)) return;

    if (isGuest) {
      setSelectedId(theme.id);
      onThemeChange(theme.id);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_id: theme.id }),
      });
      if (res.ok) {
        setSelectedId(theme.id);
        onThemeChange(theme.id);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleUpgrade(theme: ThemeVariant) {
    setUpgrading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/theme-upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_id: theme.id }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
      }
    } finally {
      setUpgrading(false);
    }
  }

  const freeThemes = themes.filter((t) => !t.isPremium);
  const premiumThemes = themes.filter((t) => t.isPremium);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">{t('dash.chooseTheme', lang)}</h2>
        <p className="text-sm text-gray-500 mb-6">
          {t('dash.themeSubtext', lang)}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {freeThemes.map((theme) => {
            const isSelected = selectedId === theme.id;
            return (
              <div key={theme.id} className="relative">
                <button
                  onClick={() => handleSelect(theme)}
                  disabled={saving}
                  className={`relative w-full text-left rounded-xl border-2 p-3 transition-all hover:shadow-md disabled:opacity-60 ${
                    isSelected
                      ? 'border-purple-600 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <MiniPreview theme={theme} />
                  <h3 className="text-sm font-semibold text-gray-900 mt-2">{theme.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{theme.description}</p>
                </button>
                {!isGuest && (
                  <button
                    onClick={() => setPreviewTheme(theme)}
                    className="absolute bottom-3 right-3 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center gap-1 px-2.5 py-1.5 transition-colors"
                    title={t('dash.preview', lang)}
                  >
                    <Eye className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">{t('dash.preview', lang)}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium themes section */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900">{t('dash.premiumLayouts', lang)}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {event.theme_premium_paid
            ? t('dash.premiumUnlocked', lang)
            : canUpgrade
            ? t('dash.upgradePrompt', lang)
            : t('dash.premiumDescription', lang)}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {premiumThemes.map((theme) => {
            const isSelected = selectedId === theme.id;
            const locked = isPremiumLocked(theme);

            return (
              <div key={theme.id} className="relative">
                <button
                  onClick={() => !locked && handleSelect(theme)}
                  disabled={saving || locked}
                  className={`relative w-full text-left rounded-xl border-2 p-3 transition-all disabled:opacity-60 ${
                    locked
                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'border-purple-600 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {isSelected && !locked && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {locked && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center">
                      <Lock className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {!locked && !isSelected && !event.theme_premium_paid && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">+$50</span>
                    </div>
                  )}
                  <MiniPreview theme={theme} />
                  <h3 className="text-sm font-semibold text-gray-900 mt-2">{theme.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{theme.description}</p>
                  <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    {theme.layout} {t('dash.layout', lang)}
                  </span>
                </button>

                {/* Upgrade button for locked premium themes on published events */}
                {locked && canUpgrade && (
                  <button
                    onClick={() => handleUpgrade(theme)}
                    disabled={upgrading}
                    className="absolute bottom-3 left-3 right-10 flex items-center justify-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-1.5 transition-colors disabled:opacity-50 z-10"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    {upgrading ? t('dash.redirecting', lang) : t('dash.upgrade50', lang)}
                  </button>
                )}

                <button
                  onClick={() => setPreviewTheme(theme)}
                  className="absolute bottom-3 right-3 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center gap-1 px-2.5 py-1.5 transition-colors z-10"
                  title={t('dash.preview', lang)}
                >
                  <Eye className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-xs font-medium text-gray-600">{t('dash.preview', lang)}</span>
                </button>
              </div>
            );
          })}
        </div>

        {hasPremiumSelected && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm text-amber-800">
              {t('dash.premiumAddonNote', lang)}
            </p>
          </div>
        )}
      </div>

      {/* Preview modal — loads actual template page in iframe */}
      {previewTheme && (
        <PreviewModal
          theme={previewTheme}
          eventId={event.id}
          lang={lang}
          onClose={() => setPreviewTheme(null)}
        />
      )}
    </div>
  );
}
