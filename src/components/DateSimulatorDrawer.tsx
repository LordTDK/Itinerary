import React from 'react';
import { 
  X, 
  RotateCcw, 
  Calendar, 
  ChevronRight, 
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { DaySchedule } from '../types';
import { formatFriendlyDate, formatShortDate } from '../utils/dateUtils';

interface DateSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  realDate: string;
  isSimulated: boolean;
  days: DaySchedule[];
  onSelectDate: (date: string) => void;
  onResetToRealDate: () => void;
}

export const DateSimulatorDrawer: React.FC<DateSimulatorDrawerProps> = ({
  isOpen,
  onClose,
  currentDate,
  realDate,
  isSimulated,
  days,
  onSelectDate,
  onResetToRealDate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Surface */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Drag handle */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto -mt-1 mb-1" />

        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Date Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Simulate any date of the holiday to see how the interface populates active locations and schedule items automatically.
        </p>

        {/* Quick presets */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={() => {
              onResetToRealDate();
              onClose();
            }}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 ${
              !isSimulated
                ? 'bg-teal-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Today</span>
          </button>

          {days[0] && (
            <button
              onClick={() => {
                onSelectDate(days[0].date);
                onClose();
              }}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-98 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Day 1 ({formatShortDate(days[0].date)})</span>
            </button>
          )}
        </div>

        {/* Days List Scroll */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[160px] max-h-[340px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            All Holiday Dates
          </span>
          {days.map((day) => {
            const isSelected = day.date === currentDate;
            const isRealToday = day.date === realDate;

            return (
              <button
                key={day.date}
                onClick={() => {
                  onSelectDate(day.date);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition min-h-[44px] ${
                  isSelected
                    ? 'bg-teal-500/20 border border-teal-500/60 text-white'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {day.dayNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-snug truncate">
                      {day.formattedDate}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {day.primaryLocation} • {day.items.length} activities
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isRealToday && (
                    <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                      Real Today
                    </span>
                  )}
                  {isSelected ? (
                    <Check className="w-4 h-4 text-teal-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
