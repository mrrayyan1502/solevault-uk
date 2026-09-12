import React, { useState, useEffect } from 'react';
import { Clock, Zap, Flame } from 'lucide-react';

interface PromoTimerBarProps {
  discountPercent?: number;
  promoTitle?: string;
}

export const PromoTimerBar: React.FC<PromoTimerBarProps> = ({
  discountPercent = 10,
  promoTitle = 'LIMITED TIME PROMO',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({ hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    // Calculates countdown to midnight UK time (or a continuous rolling cycle)
    const calculateTimeRemaining = () => {
      const now = new Date();
      // Target tonight 23:59:59
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      let diff = endOfDay.getTime() - now.getTime();
      // If diff is <= 0 (right at midnight), roll to next cycle
      if (diff <= 0) {
        diff = 24 * 60 * 60 * 1000;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside aria-label="Limited Time Offer" className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-sans border-b border-amber-500/40 shadow-sm select-none relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs font-bold">
        {/* Left Side: Offer Announcement */}
        <div className="flex items-center gap-2 tracking-tight text-center sm:text-left">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-stone-950 text-amber-400 shrink-0 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
          </span>
          <span className="uppercase tracking-wider font-extrabold text-[11px] bg-stone-950/15 px-2 py-0.5 rounded text-stone-950">
            {promoTitle}
          </span>
          <span className="text-stone-900 font-extrabold text-xs sm:text-sm">
            {discountPercent}% OFF Flash Deal Ending Soon!
          </span>
        </div>

        {/* Right Side: Digital Clock Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-900 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-stone-950" />
            <span>Ends In:</span>
          </span>

          <div className="flex items-center gap-1 font-mono text-xs font-black">
            <div className="bg-stone-950 text-amber-300 px-1.5 py-0.5 rounded shadow-sm">
              {timeLeft.hours}
              <span className="text-[9px] font-sans font-medium text-stone-400 ml-0.5">h</span>
            </div>
            <span className="text-stone-950 font-black animate-pulse">:</span>
            <div className="bg-stone-950 text-amber-300 px-1.5 py-0.5 rounded shadow-sm">
              {timeLeft.minutes}
              <span className="text-[9px] font-sans font-medium text-stone-400 ml-0.5">m</span>
            </div>
            <span className="text-stone-950 font-black animate-pulse">:</span>
            <div className="bg-stone-950 text-amber-300 px-1.5 py-0.5 rounded shadow-sm">
              {timeLeft.seconds}
              <span className="text-[9px] font-sans font-medium text-stone-400 ml-0.5">s</span>
            </div>
          </div>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-stone-900 bg-stone-950/10 px-2 py-0.5 rounded-full font-medium ml-1">
            <Zap className="w-3 h-3 text-stone-950" />
            <span>Auto-Applied</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
