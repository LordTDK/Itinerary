import React from 'react';
import { Clock, RotateCcw, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { DaySchedule } from '../types';
import { formatFriendlyDate, formatShortDate } from '../utils/dateUtils';

interface TimeMachineBarProps {
  currentDate: string;
  realDate: string;
  isSimulated: boolean;
  days: DaySchedule[];
  onSelectDate: (date: string) => void;
  onResetToRealDate: () => void;
}

export const TimeMachineBar: React.FC<TimeMachineBarProps> = ({
  currentDate,
  realDate,
  isSimulated,
  days,
  onSelectDate,
  onResetToRealDate,
}) => {
  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        
        {/* Left Status */}
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-semibold text-slate-200">Date Simulator: </span>
            <span className="text-teal-300 font-bold">{formatFriendlyDate(currentDate)}</span>
            {isSimulated ? (
              <span className="ml-2 text-slate-400">
                (Real today: {formatShortDate(realDate)})
              </span>
            ) : (
              <span className="ml-2 text-emerald-400 font-medium">
                (Real current date)
              </span>
            )}
          </div>
        </div>

        {/* Right Date Selector & Quick Jump */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-slate-400 text-[11px] whitespace-nowrap hidden sm:inline">
            Quick jump:
          </span>

          {days.slice(0, 7).map((d) => {
            const isSelected = d.date === currentDate;
            return (
              <button
                key={d.date}
                onClick={() => onSelectDate(d.date)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={`Jump to Day ${d.dayNumber}: ${d.primaryLocation}`}
              >
                Day {d.dayNumber}
              </button>
            );
          })}

          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-700 ml-1">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectDate(e.target.value);
                }
              }}
              className="bg-slate-800 text-slate-200 text-[11px] px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />

            {isSimulated && (
              <button
                onClick={onResetToRealDate}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-[11px] font-medium transition"
                title="Reset to real device date"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Today</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
