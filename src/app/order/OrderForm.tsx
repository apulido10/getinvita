'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EVENT_TYPES } from '@/lib/constants';
import { EventType } from '@/types';
import { Crown, Heart, Cake, Baby, Gift } from 'lucide-react';
import DatePicker from '@/components/dashboard/DatePicker';

const iconMap: Record<string, React.ElementType> = {
  Crown,
  Heart,
  Cake,
  Baby,
  Gift,
};

export default function OrderForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselected = searchParams.get('type') as EventType | null;

  const [selectedType, setSelectedType] = useState<EventType | ''>(preselected || '');
  const [eventName, setEventName] = useState(searchParams.get('name') || '');
  const [eventDate, setEventDate] = useState(searchParams.get('date') || '');
  const [error, setError] = useState('');

  const selectedConfig = EVENT_TYPES.find((et) => et.type === selectedType);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedType || !eventName || !eventDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    const params = new URLSearchParams({
      type: selectedType,
      name: eventName,
      date: eventDate,
    });
    router.push(`/order/customize?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Event Site</h1>
          <p className="mt-2 text-gray-600">Choose your event type and fill in the basics to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-6">
          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Event Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPES.map((et) => {
                const Icon = iconMap[et.icon];
                const isSelected = selectedType === et.type;
                return (
                  <button
                    key={et.type}
                    type="button"
                    onClick={() => setSelectedType(et.type)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                        {et.label}
                      </p>
                      <p className="text-xs text-gray-500">{et.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Name */}
          <div>
            <label htmlFor="eventName" className="block text-sm font-semibold text-gray-900 mb-1">
              Event Name *
            </label>
            <input
              id="eventName"
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              placeholder={
                selectedType === 'wedding'
                  ? "Sarah & Mike's Wedding"
                  : selectedType === 'sweet15'
                  ? "Isabella's Quinceañera"
                  : 'My Special Event'
              }
            />
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Event Date *
            </label>
            <DatePicker
              value={eventDate}
              onChange={setEventDate}
              placeholder="Select your event date"
            />
          </div>

          {selectedConfig && (
            <div className="rounded-lg bg-purple-50 border border-purple-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-purple-800 font-medium">
                {selectedConfig.label} — one-time payment
              </span>
              <span className="text-lg font-bold text-purple-900">
                ${(selectedConfig.price / 100).toFixed(0)}
              </span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!selectedType}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 text-white py-3 text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedConfig ? 'Start Customizing →' : 'Select an event type'}
          </button>
        </form>
      </div>
    </main>
  );
}
