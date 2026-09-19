import React, { useRef, useEffect } from 'react';
import { DaySchedule } from '../types';
import { formatShortDate } from '../utils/dateUtils';
import { Sparkles, Calendar } from 'lucide-react';

interface MobileDayStripProps {
  days: DaySchedule[];
  activeDate: string;
  selectedDayNumber: number | null; // null means 'all'
  onSelectDay: (dayNumber: number | null, date?: string) => void;
}

export const MobileDayStrip: React.FC<MobileDayStripProps> = ({
  days,
  activeDate,
  selectedDayNumber,
  onSelectDay,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active/selected day into view
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDayNumber, activeDate]);

  return (
    <div className="bg-slate-900 border-b border-slate-800/80 px-3 py-2 sticky top-[102px] z-30 shadow-sm">
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
      >
        {/* 'All Days' Chip */}
        <button
          onClick={() => onSelectDay(null)}
          data-selected={selectedDayNumber === null}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1 min-h-[38px] ${
            selectedDayNumber === null
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>All Days</span>
        </button>

        {/* Individual Days */}
        {days.map((day) => {
          const isSelected = selectedDayNumber === day.dayNumber;
          const isCurrentActive = day.date === activeDate;

          return (
            <button
              key={day.date}
              onClick={() => onSelectDay(day.dayNumber, day.date)}
              data-selected={isSelected}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition active:scale-95 flex flex-col items-center justify-center min-h-[38px] min-w-[72px] relative ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20 ring-2 ring-teal-400/50'
                  : isCurrentActive
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-500/60 font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-1 leading-none">
                <span>Day {day.dayNumber}</span>
                {isCurrentActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-teal-400'}`} />
                )}
              </div>
              <span className={`text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                {day.shortDate.split(',')[1]?.trim() || day.shortDate}
              </span>

              {/* Today indicator dot on top */}
              {day.isToday && !isSelected && (
                <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-emerald-500 text-[8px] font-bold text-slate-950 rounded-full shadow">
                  NOW
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
