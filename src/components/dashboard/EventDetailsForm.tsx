'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Event, EventDetail } from '@/types';
import { getEventTypeConfig } from '@/lib/constants';
import { Save, Loader2 } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

export interface EventDetailsFormRef {
  save: () => Promise<void>;
}

interface Props {
  event: Event;
  details: EventDetail[];
  onUpdate: (details: EventDetail[]) => void;
  onEventNameChange?: (name: string) => void;
}

const EventDetailsForm = forwardRef<EventDetailsFormRef, Props>(function EventDetailsForm({ event, details, onUpdate, onEventNameChange }, ref) {
  const config = getEventTypeConfig(event.event_type);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [eventName, setEventName] = useState(event.event_name);

  // Build form values from existing details
  const initialValues: Record<string, string> = {};
  details.forEach((d) => {
    initialValues[d.detail_key] = d.detail_value || '';
  });
  const [values, setValues] = useState(initialValues);

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
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

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Event Details</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? 'Saved!' : 'Save Details'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Name <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => { setEventName(e.target.value); setSaved(false); }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">This name appears on the invitation when guests open your event.</p>
        </div>

        {config.fields.map((field) => (
          <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
              />
            ) : field.type === 'address' ? (
              <AddressAutocomplete
                value={values[field.key] || ''}
                onChange={(val) => handleChange(field.key, val)}
                placeholder={field.placeholder}
              />
            ) : (
              <input
                type={field.type}
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default EventDetailsForm;
