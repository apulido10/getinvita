'use client';

import { useState, useEffect } from 'react';
import { Lang, t } from '@/lib/translations';

interface Props {
  targetDate: string;
  className?: string;
  lang?: Lang;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown({ targetDate, className = '', lang = 'en' }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    function calculate() {
      const datePart = targetDate.substring(0, 10);
      const diff = new Date(`${datePart}T12:00:00`).getTime() - Date.now();
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
        <p className="text-xl font-semibold">{t('countdown.celebrationIsHere', lang)}</p>
      </div>
    );
  }

  const units = [
    { label: t('countdown.days', lang), value: timeLeft.days },
    { label: t('countdown.hours', lang), value: timeLeft.hours },
    { label: t('countdown.minutes', lang), value: timeLeft.minutes },
    { label: t('countdown.seconds', lang), value: timeLeft.seconds },
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
