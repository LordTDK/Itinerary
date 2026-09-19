import React from 'react';
import { 
  Compass, 
  Calendar, 
  Upload, 
  RotateCcw, 
  Clock, 
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Share2
} from 'lucide-react';
import { ItineraryData, TripStatus } from '../types';
import { formatShortDate, formatFriendlyDate } from '../utils/dateUtils';

interface MobileHeaderProps {
  itinerary: ItineraryData;
  tripStatus: TripStatus;
  currentDate: string;
  isSimulatedDate: boolean;
  onResetDate: () => void;
  onOpenDateDrawer: () => void;
  onOpenUploadModal: () => void;
  onShareOrExport: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  itinerary,
  tripStatus,
  currentDate,
  isSimulatedDate,
  onResetDate,
  onOpenDateDrawer,
  onOpenUploadModal,
  onShareOrExport,
}) => {
  return (
    <header 
      className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800/80 shadow-md"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Mobile Top Status / Trip Identity Bar */}
      <div className="px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Brand & Active Trip Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Compass className="w-4 h-4 animate-[spin_20s_linear_infinite]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-teal-400">
                  Merlins Travel App
                </span>
                {tripStatus.phase === 'active' && tripStatus.currentDayNumber && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    • Day {tripStatus.currentDayNumber}/{itinerary.totalDays}
                  </span>
                )}
              </div>
              <h1 className="text-sm font-bold text-white truncate leading-tight">
                {itinerary.title || 'My Holiday Trip'}
              </h1>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onOpenUploadModal}
              aria-label="Upload CSV"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
              title="Load Itinerary CSV"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onShareOrExport}
              aria-label="Export CSV"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
              title="Export Itinerary CSV"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Selector & Status Sub-Bar */}
        <div className="mt-2.5 flex items-center justify-between gap-2 bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-700/60 text-xs">
          <button
            onClick={onOpenDateDrawer}
            className="flex items-center gap-2 min-w-0 text-left hover:text-teal-300 transition active:scale-[0.98]"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${isSimulatedDate ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <div className="min-w-0 truncate">
              <span className="text-slate-400 text-[11px] mr-1.5">
                {isSimulatedDate ? 'Simulated Date:' : 'Today:'}
              </span>
              <span className="font-semibold text-white">
                {formatFriendlyDate(currentDate)}
              </span>
            </div>
            <SlidersHorizontal className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
          </button>

          {isSimulatedDate ? (
            <button
              onClick={onResetDate}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 text-[11px] font-medium shrink-0 transition"
              title="Return to real current date"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Real Date</span>
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-medium uppercase tracking-wider shrink-0 border border-emerald-500/30">
              Live
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
