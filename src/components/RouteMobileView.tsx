import React, { useRef, useEffect, useMemo, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Hotel, 
  Calendar, 
  Check, 
  Compass, 
  Clock, 
  ArrowRight, 
  Car,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ItineraryData, ItineraryItem, TripStatus } from '../types';
import { formatShortDate, formatFriendlyDate } from '../utils/dateUtils';
import { buildNavigationUrl } from '../utils/geoUtils';
import { GeolocationState } from '../hooks/useGeolocation';

interface RouteMobileViewProps {
  itinerary: ItineraryData;
  tripStatus?: TripStatus;
  currentDate?: string;
  geo?: GeolocationState;
  onToggleItemComplete?: (itemId: string) => void;
}

interface FlattenedRouteStop {
  globalIndex: number;
  item: ItineraryItem;
  dayNumber: number;
  dayDate: string;
  dayTitle: string;
  isFirstOfDay: boolean;
  destinationName: string;
  originName: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

export const RouteMobileView: React.FC<RouteMobileViewProps> = ({
  itinerary,
  tripStatus,
  currentDate,
  geo,
  onToggleItemComplete,
}) => {
  const currentStopRef = useRef<HTMLDivElement | null>(null);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);

  // Flatten every stop on each day into a chronological timeline maintaining continuous numbering
  const allStops: FlattenedRouteStop[] = useMemo(() => {
    const list: FlattenedRouteStop[] = [];
    let counter = 1;

    itinerary.days.forEach((day) => {
      day.items.forEach((item, itemIdx) => {
        const destination = item.to || item.location || item.activity;
        const origin = item.from || (itemIdx > 0 ? (day.items[itemIdx - 1].to || day.items[itemIdx - 1].location) : 'Start');
        
        list.push({
          globalIndex: counter++,
          item,
          dayNumber: day.dayNumber,
          dayDate: day.date,
          dayTitle: `Day ${day.dayNumber} • ${formatShortDate(day.date)}`,
          isFirstOfDay: itemIdx === 0,
          destinationName: destination,
          originName: origin,
          isCompleted: !!item.completed,
          isCurrent: false, // will calculate below
          isFuture: false,  // will calculate below
        });
      });
    });

    // Identify current stop:
    // First uncompleted item, or tripStatus.nextItem, or the very last item if all completed
    let activeIdx = list.findIndex(s => !s.isCompleted);
    if (activeIdx === -1) {
      // All completed
      activeIdx = Math.max(0, list.length - 1);
    }

    return list.map((stop, idx) => ({
      ...stop,
      isCurrent: idx === activeIdx,
      isFuture: idx > activeIdx,
      isCompleted: idx < activeIdx || (stop.isCompleted && idx !== activeIdx),
    }));
  }, [itinerary, tripStatus]);

  const currentStop = useMemo(() => {
    return allStops.find(s => s.isCurrent) || allStops[0];
  }, [allStops]);

  // Always make the current stop the focused item at the top of the screen on mount or when current changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStopRef.current) {
        currentStopRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        setHasAutoScrolled(true);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [currentStop?.item.id]);

  const scrollToCurrentStop = () => {
    if (currentStopRef.current) {
      currentStopRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleQuickNavigate = (item: ItineraryItem) => {
    const destName = item.to || item.location || item.activity;
    const url = buildNavigationUrl(
      item.toLat,
      item.toLong,
      destName,
      geo?.coords,
      item.fromLat,
      item.fromLong
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const totalStops = allStops.length;
  const completedCount = allStops.filter(s => s.isCompleted).length;
  const progressPercent = totalStops > 0 ? Math.round((completedCount / totalStops) * 100) : 0;

  return (
    <div className="space-y-4 pb-12">
      {/* Route Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Holiday Route Timeline
            </h2>
          </div>
          <span className="text-[11px] font-bold text-teal-300 bg-teal-950/80 border border-teal-800/60 px-2.5 py-0.5 rounded-full">
            {completedCount} of {totalStops} Done ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>{itinerary.totalDays} Days • All Stops</span>
          {currentStop && (
            <button
              onClick={scrollToCurrentStop}
              className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 active:scale-95 transition"
            >
              <span>Scroll to Current Stop #{currentStop.globalIndex}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sticky Quick-Navigate Action for Next Destination */}
      {currentStop && (
        <div className="sticky top-2 z-20 bg-slate-900/95 backdrop-blur-md border-2 border-teal-500/70 rounded-2xl p-3 shadow-xl shadow-slate-950/60 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                  Next Destination • Stop #{currentStop.globalIndex}
                </span>
              </div>
              <h3 className="text-sm font-black text-white truncate leading-snug">
                {currentStop.destinationName}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {currentStop.dayTitle}
                {currentStop.item.arrivalTime && ` • Arrive ${currentStop.item.arrivalTime}`}
                {currentStop.item.duration && ` (${currentStop.item.duration})`}
              </p>
            </div>

            <button
              id="btn-quick-navigate-top"
              onClick={() => handleQuickNavigate(currentStop.item)}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-teal-500/30 active:scale-95 transition"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>Quick Navigate</span>
            </button>
          </div>
        </div>
      )}

      {/* Vertical Continuous Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm relative">
        {/* Continuous Connecting Line down all stops */}
        <div className="absolute left-[31px] sm:left-[35px] top-8 bottom-8 w-0.5 bg-slate-800 pointer-events-none" />

        <div className="space-y-4 relative">
          {allStops.map((stop) => {
            const { item, globalIndex, isCurrent, isCompleted, isFirstOfDay, dayTitle } = stop;

            return (
              <React.Fragment key={item.id || `${item.date}-${globalIndex}`}>
                {/* Day Header Divider when day changes */}
                {isFirstOfDay && (
                  <div className="pt-2 pb-1 first:pt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-slate-300 shadow-sm ml-10">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      <span>{dayTitle}</span>
                    </div>
                  </div>
                )}

                {/* Stop Item Card */}
                <div
                  ref={isCurrent ? currentStopRef : null}
                  className={`scroll-mt-24 flex items-start gap-3 relative transition-all duration-300 ${
                    isCompleted 
                      ? 'opacity-45 hover:opacity-85' 
                      : isCurrent 
                        ? 'opacity-100 scale-[1.01]' 
                        : 'opacity-90'
                  }`}
                >
                  {/* Number Badge Column */}
                  <div className="shrink-0 z-10 pt-1">
                    {isCurrent ? (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-lg shadow-teal-500/40 ring-4 ring-teal-500/25">
                        {globalIndex}
                      </div>
                    ) : isCompleted ? (
                      <button
                        onClick={() => onToggleItemComplete && onToggleItemComplete(item.id)}
                        title="Click to toggle completion"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 border-2 border-slate-700 text-slate-400 font-semibold flex items-center justify-center text-xs hover:border-slate-500 transition"
                      >
                        <span className="text-[10px] line-through">{globalIndex}</span>
                      </button>
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 border-2 border-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs">
                        {globalIndex}
                      </div>
                    )}
                  </div>

                  {/* Stop Details Card */}
                  <div className={`flex-1 rounded-2xl border p-3.5 sm:p-4 transition-all ${
                    isCurrent
                      ? 'bg-slate-850 border-teal-500 ring-2 ring-teal-500/30 shadow-lg shadow-teal-950/50'
                      : isCompleted
                        ? 'bg-slate-900/50 border-slate-800/80 text-slate-400'
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                  }`}>
                    {/* Top Row: Location & Status */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-base font-bold leading-snug ${
                            isCurrent ? 'text-white' : isCompleted ? 'text-slate-400 line-through' : 'text-slate-100'
                          }`}>
                            {stop.destinationName}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-sm">
                              Focused Stop
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" /> Done
                            </span>
                          )}
                          {item.isFinalDestinationOfDay && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium flex items-center gap-1">
                              <Hotel className="w-3 h-3" /> Accommodation
                            </span>
                          )}
                        </div>

                        {/* Origin -> Destination leg info */}
                        {stop.originName && stop.originName !== stop.destinationName && (
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Car className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">From {stop.originName}</span>
                          </p>
                        )}
                      </div>

                      {/* Day Pill */}
                      <span className="shrink-0 text-[10px] font-bold text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700/50">
                        Day {stop.dayNumber}
                      </span>
                    </div>

                    {/* Middle Row: Times, Drive Duration, Stay */}
                    <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap mt-2 pt-2 border-t border-slate-800/80">
                      {(item.departureTime || item.arrivalTime) && (
                        <div className="flex items-center gap-1 font-mono text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          <span>
                            {item.departureTime || '--:--'} <ArrowRight className="w-2.5 h-2.5 inline mx-0.5 text-slate-500" /> {item.arrivalTime || '--:--'}
                          </span>
                        </div>
                      )}

                      {item.duration && (
                        <span className="text-[11px] text-slate-400">
                          Drive: <strong className="text-slate-200">{item.duration}</strong>
                        </span>
                      )}

                      {item.stayDuration && item.stayDuration !== 'N/A' && (
                        <span className="text-[11px] text-amber-300/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Stay: {item.stayDuration}
                        </span>
                      )}
                    </div>

                    {/* Notes if available */}
                    {item.notes && (
                      <p className="text-xs text-slate-300/80 bg-slate-900/60 p-2 rounded-xl mt-2 border border-slate-800 font-sans leading-relaxed">
                        {item.notes}
                      </p>
                    )}

                    {/* Action Row: Quick Navigate + Mark Complete */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/90 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        id={`btn-navigate-stop-${globalIndex}`}
                        onClick={() => handleQuickNavigate(item)}
                        className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 active:scale-95 transition ${
                          isCurrent
                            ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
                            : 'bg-slate-800 hover:bg-slate-750 text-teal-300 border border-slate-700'
                        }`}
                      >
                        <Navigation className="w-3.5 h-3.5 fill-current" />
                        <span>Quick Navigate</span>
                      </button>

                      {/* Complete / Toggle Done button */}
                      {onToggleItemComplete && (
                        <button
                          onClick={() => onToggleItemComplete(item.id)}
                          className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 active:scale-95 transition ${
                            isCompleted
                              ? 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                              : isCurrent
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                              <span>Mark Undone</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Done</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
