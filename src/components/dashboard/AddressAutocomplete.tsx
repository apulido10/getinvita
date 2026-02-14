'use client';

import { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

let optionsSet = false;

export default function AddressAutocomplete({ value, onChange, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey || !inputRef.current) return;

    if (!optionsSet) {
      setOptions({ key: apiKey });
      optionsSet = true;
    }

    importLibrary('places').then(() => {
      if (!inputRef.current || autocompleteRef.current) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['formatted_address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          onChange(place.formatted_address);
        }
      });

      autocompleteRef.current = autocomplete;
    }).catch(() => {
      // API key missing or invalid — fall back to plain input
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
    />
  );
}
