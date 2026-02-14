'use client';

import { useState, useEffect } from 'react';

interface Props {
  targetDate: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown({ targetDate, className = '' }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    function calculate() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className={className}>
        <p className="text-xl font-semibold">The celebration is here!</p>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className={`flex justify-center gap-4 sm:gap-6 ${className}`}>
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="text-3xl sm:text-5xl font-bold tabular-nums">
            {String(unit.value).padStart(2, '0')}
          </div>
          <div className="text-xs sm:text-sm mt-1 opacity-80 uppercase tracking-wider">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
