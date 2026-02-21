'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Event, EventDetail } from '@/types';
import { getEventTypeConfig } from '@/lib/constants';
import { Save, Loader2, Plus, X, UtensilsCrossed } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';
import DatePicker from './DatePicker';
import { t, type Lang } from '@/lib/translations';

export interface EventDetailsFormRef {
  save: () => Promise<void>;
}

interface Props {
  event: Event;
  details: EventDetail[];
  lang: Lang;
  onUpdate: (details: EventDetail[]) => void;
  onEventNameChange?: (name: string) => void;
}

const EventDetailsForm = forwardRef<EventDetailsFormRef, Props>(function EventDetailsForm({ event, details, lang, onUpdate, onEventNameChange }, ref) {
  const config = getEventTypeConfig(event.event_type);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [eventName, setEventName] = useState(event.event_name);

  const initialValues: Record<string, string> = {};
  details.forEach((d) => {
    initialValues[d.detail_key] = d.detail_value || '';
  });
  const [values, setValues] = useState(initialValues);

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleSection(id: 'reception' | 'dinner') {
    const key = `has_${id}`;
    const current = values[key] === 'true';
    handleChange(key, current ? 'false' : 'true');
  }

  function toggleMealType() {
    const current = values['meal_type'] || 'dinner';
    handleChange('meal_type', current === 'dinner' ? 'lunch' : 'dinner');
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details: values, event_name: eventName }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.details);
        onEventNameChange?.(eventName);
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  useImperativeHandle(ref, () => ({
    save: handleSave,
  }));

  if (!config) return null;

  const mealType = values['meal_type'] || 'dinner';

  function renderField(field: { key: string; label: string; type: string; placeholder?: string; required?: boolean }) {
    if (field.type === 'textarea') {
      return (
        <textarea
          value={values[field.key] || ''}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
        />
      );
    }
    if (field.type === 'address') {
      return (
        <AddressAutocomplete
          value={values[field.key] || ''}
          onChange={(val) => handleChange(field.key, val)}
          placeholder={field.placeholder}
        />
      );
    }
    if (field.type === 'date') {
      return (
        <DatePicker
          value={values[field.key] || ''}
          onChange={(val) => handleChange(field.key, val)}
          placeholder={field.placeholder}
        />
      );
    }
    return (
      <input
        type={field.type}
        value={values[field.key] || ''}
        onChange={(e) => handleChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">{t('dash.eventDetails', lang)}</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? t('dash.saved', lang) : t('dash.saveDetails', lang)}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Event name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dash.eventName', lang)} <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => { setEventName(e.target.value); setSaved(false); }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">{t('dash.eventNameHelper', lang)}</p>
        </div>

        {/* Base fields */}
        {config.fields.map((field) => (
          <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Optional sections */}
      {config.optionalSections && config.optionalSections.length > 0 && (
        <div className="mt-6 space-y-4">
          {config.optionalSections.map((section) => {
            const isEnabled = values[`has_${section.id}`] === 'true';
            const isDinner = section.id === 'dinner';
            const sectionLabel = isDinner
              ? (mealType === 'lunch' ? section.label.replace('Dinner', 'Lunch') : section.label)
              : section.label;

            return (
              <div key={section.id} className="border border-dashed border-gray-200 rounded-xl overflow-hidden">
                {/* Toggle header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
                    isEnabled ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isDinner && <UtensilsCrossed className="h-4 w-4" />}
{isEnabled ? sectionLabel : `+ Add ${sectionLabel}`}
                    {section.addOnPrice > 0 && (
                      <span className="text-xs font-normal text-gray-400">+$10</span>
                    )}
                  </span>
                  {isEnabled && <X className="h-4 w-4 text-purple-400" />}
                  {!isEnabled && <Plus className="h-4 w-4 text-gray-400" />}
                </button>

                {/* Expanded fields */}
                {isEnabled && (
                  <div className="px-4 pb-4 pt-3 grid sm:grid-cols-2 gap-4 bg-white">
                    {/* Meal type toggle for dinner section */}
                    {isDinner && (
                      <div className="sm:col-span-2 flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-500">Meal type:</span>
                        <button
                          type="button"
                          onClick={toggleMealType}
                          className="flex items-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 overflow-hidden"
                        >
                          <span className={`px-3 py-1.5 transition-colors ${mealType === 'dinner' ? 'bg-purple-600 text-white' : ''}`}>
                            Dinner
                          </span>
                          <span className={`px-3 py-1.5 transition-colors ${mealType === 'lunch' ? 'bg-purple-600 text-white' : ''}`}>
                            Lunch
                          </span>
                        </button>
                      </div>
                    )}
                    {section.fields.map((field) => (
                      <div key={field.key} className={field.type === 'textarea' || field.type === 'address' ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default EventDetailsForm;
