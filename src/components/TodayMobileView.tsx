import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Compass, 
  Building2, 
  Navigation, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  CloudSun, 
  Plane, 
  Train, 
  Utensils, 
  Landmark, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck,
  Hotel,
  Car,
  DollarSign
} from 'lucide-react';
import { ActivityCategory, DaySchedule, ItineraryItem, TripStatus } from '../types';
import { formatFriendlyDate, formatShortDate } from '../utils/dateUtils';
import { GeolocationState } from '../hooks/useGeolocation';
import { GpsNavigatorBanner } from './GpsNavigatorBanner';
import { buildNavigationUrl } from '../utils/geoUtils';

interface TodayMobileViewProps {
  currentDate: string;
  tripStatus: TripStatus;
  todaySchedule?: DaySchedule;
  totalDays: number;
  startDate: string;
  endDate: string;
  geo: GeolocationState;
  onToggleItemComplete: (itemId: string) => void;
  onSetSimulatedDate: (date: string) => void;
  onGoToSchedule: () => void;
}

export const TodayMobileView: React.FC<TodayMobileViewProps> = ({
  currentDate,
  tripStatus,
  todaySchedule,
  totalDays,
  startDate,
  endDate,
  geo,
  onToggleItemComplete,
  onSetSimulatedDate,
  onGoToSchedule,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCompletedSection, setShowCompletedSection] = useState(true);

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'Flight':
        return <Plane className="w-4 h-4 text-sky-400" />;
      case 'Transport':
        return <Car className="w-4 h-4 text-emerald-400" />;
      case 'Hotel':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'Food':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'Sightseeing':
        return <Landmark className="w-4 h-4 text-rose-400" />;
      default:
        return <Compass className="w-4 h-4 text-teal-400" />;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getWeatherUrl = (location: string) => {
    return `https://www.google.com/search?q=weather+${encodeURIComponent(location)}`;
  };

  // If trip hasn't started yet according to real date
  if (tripStatus.phase === 'upcoming') {
    return (
      <div className="space-y-4">
        {/* Countdown Hero */}
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 border border-teal-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Calendar className="w-3.5 h-3.5" /> Cotswolds Tour
            </span>
            <span className="text-[11px] text-slate-400">
              Starts {formatShortDate(startDate)}
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-1 text-white">
            Trip starts in {tripStatus.daysUntilTrip} {tripStatus.daysUntilTrip === 1 ? 'day' : 'days'}!
          </h2>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Your Cotswolds itinerary with coordinate tracking and GPS starting point navigation is ready.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onSetSimulatedDate(startDate)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 active:scale-98 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Preview & Start Day 1 (Poole ➔ Castle Combe)</span>
            </button>
            <button
              onClick={onGoToSchedule}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700/60 active:scale-98 transition"
            >
              <span>View Full Vacation Schedule</span>
            </button>
          </div>
        </div>

        {/* GPS Navigator Banner for testing right away */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Test GPS Starting Point Detection
          </span>
          <GpsNavigatorBanner
            dayItems={[]}
            geo={geo}
          />
        </div>
      </div>
    );
  }

  // If trip is past
  if (tripStatus.phase === 'completed') {
    return (
      <div className="space-y-4">
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <Check className="w-3.5 h-3.5" /> Trip Completed
          </div>
          <h2 className="text-xl font-bold mb-1">Cotswolds Tour Concluded</h2>
          <p className="text-xs text-slate-400 mb-4">
            Hope you had a wonderful holiday! You can simulate any past trip day using the Date Simulator.
          </p>
          <button
            onClick={() => onSetSimulatedDate(startDate)}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Review Day 1 from Poole</span>
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE TRIP PHASE
  const day = todaySchedule;
  const items = day?.items || [];

  // Partition items into:
  // 1. activeItems: not completed AND not the final accommodation
  // 2. accommodationItem: final destination of the day (CANNOT be marked off per user requirement)
  // 3. completedItems: checked off places with re-enable capability
  const activeItems = items.filter(i => !i.completed && !i.isFinalDestinationOfDay);
  const accommodationItem = items.find(i => i.isFinalDestinationOfDay);
  const completedItems = items.filter(i => i.completed && !i.isFinalDestinationOfDay);

  const totalCheckable = items.filter(i => !i.isFinalDestinationOfDay).length;
  const completedCount = completedItems.length;
  const progressPercent = totalCheckable > 0 ? Math.round((completedCount / totalCheckable) * 100) : 0;

  // Next active item to visit
  const nextItem = activeItems[0] || accommodationItem;

  return (
    <div className="space-y-4">
      
      {/* 1. GPS NAVIGATOR & STARTING POINT IDENTIFICATION */}
      <GpsNavigatorBanner
        dayItems={items}
        geo={geo}
      />

      {/* 2. LIVE TODAY STATUS CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 rounded-3xl p-5 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Sparkles className="w-3 h-3" /> Day {tripStatus.currentDayNumber} of {totalDays}
            </span>
            <span className="text-xs text-slate-400">
              {formatShortDate(currentDate)}
            </span>
          </div>

          <a
            href={getWeatherUrl(tripStatus.currentLocation || 'Cotswolds')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60"
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>Weather</span>
          </a>
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight">
          {tripStatus.currentLocation || day?.primaryLocation}
        </h2>

        {/* Daily progress bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">
              Places Visited Today
            </span>
            <span className="font-bold text-teal-300">
              {completedCount} of {totalCheckable} stops ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. NEXT STOP CALLOUT */}
      {nextItem && (
        <div className="bg-teal-950/40 border border-teal-500/30 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-2 text-[10px] font-bold tracking-widest text-teal-400 uppercase mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Next Destination
            </span>
            {nextItem.departureTime && (
              <span className="font-semibold text-white">
                Dep {nextItem.departureTime} • Arr {nextItem.arrivalTime}
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-white leading-snug">
            {nextItem.from ? `${nextItem.from} ➔ ${nextItem.to}` : nextItem.activity}
          </p>
          {nextItem.notes && (
            <p className="text-xs text-slate-300 mt-1">
              💡 {nextItem.notes}
            </p>
          )}
        </div>
      )}

      {/* 4. ACTIVE PLACES TO VISIT (Check-off list) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Places To Visit ({activeItems.length})</span>
          </h3>
          <span className="text-[10px] text-slate-400">
            Check off as you go
          </span>
        </div>

        {activeItems.length === 0 ? (
          <div className="py-5 text-center text-slate-400">
            <p className="text-xs font-medium text-emerald-400">All scheduled stops for today have been visited!</p>
            <p className="text-[11px] text-slate-400 mt-1">Head to tonight's accommodation or re-enable items below.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeItems.map((item) => {
              const navUrl = buildNavigationUrl(
                item.toLat,
                item.toLong,
                item.to || item.location,
                geo.coords,
                item.fromLat,
                item.fromLong
              );

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border bg-slate-800/60 border-slate-700/60 hover:border-teal-500/40 p-3.5 transition-all duration-150 space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Checkbox button (44px hit-box) */}
                    <button
                      onClick={() => onToggleItemComplete(item.id)}
                      aria-label={`Check off ${item.to || item.activity}`}
                      className="w-10 h-10 -ml-1 -mt-1 flex items-center justify-center shrink-0 active:scale-90 text-slate-400 hover:text-teal-400 transition"
                      title="Tap to check off place as visited"
                    >
                      <Circle className="w-5 h-5 text-slate-500 hover:text-teal-400" />
                    </button>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      {/* From -> To header */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-white">
                          {item.from ? `${item.from} ➔ ${item.to}` : item.activity}
                        </span>
                      </div>

                      {/* Timing & Durations */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                        {item.departureTime && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-700/80 text-teal-300 font-semibold">
                            <Clock className="w-3 h-3" />
                            {item.departureTime} - {item.arrivalTime}
                          </span>
                        )}
                        {item.duration && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 font-medium">
                            Drive: {item.duration}
                          </span>
                        )}
                        {item.stayDuration && item.stayDuration !== 'N/A' && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-900/40 text-indigo-300 border border-indigo-500/20 font-medium">
                            Stay: {item.stayDuration}
                          </span>
                        )}
                        {item.costs && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-900/30 text-amber-300 font-medium flex items-center gap-0.5">
                            <DollarSign className="w-2.5 h-2.5" />
                            {item.costs}
                          </span>
                        )}
                      </div>

                      {/* Notes (e.g. SN14 7HH, Tesco's for supper) */}
                      {item.notes && (
                        <p className="text-[11px] text-slate-300 mt-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                          💡 {item.notes}
                        </p>
                      )}

                      {/* Coordinates */}
                      {item.toLat !== undefined && item.toLong !== undefined && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          📍 Destination: {item.toLat.toFixed(4)}, {item.toLong.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onToggleItemComplete(item.id)}
                      className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 py-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Check Off Place</span>
                    </button>

                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[34px] px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Navigate Here</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. TONIGHT'S ACCOMMODATION (PERMANENT FINAL DESTINATION - CANNOT BE MARKED OFF) */}
      {accommodationItem && (
        <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-indigo-500/20">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <Hotel className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tonight's Accommodation (End of Day)
              </h3>
            </div>
            <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              Permanent Base
            </span>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-extrabold text-white">
              {accommodationItem.to || accommodationItem.location}
            </p>
            <p className="text-xs text-slate-300">
              {accommodationItem.from ? `Final leg from ${accommodationItem.from}` : 'Overnight base'}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              {accommodationItem.arrivalTime && (
                <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md text-slate-200">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  Arrive by {accommodationItem.arrivalTime}
                </span>
              )}
              {accommodationItem.toLat !== undefined && accommodationItem.toLong !== undefined && (
                <span className="bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">
                  📍 {accommodationItem.toLat.toFixed(4)}, {accommodationItem.toLong.toFixed(4)}
                </span>
              )}
            </div>

            {accommodationItem.notes && (
              <p className="text-[11px] text-indigo-200 bg-indigo-950/40 px-2.5 py-1.5 rounded-xl border border-indigo-500/20">
                🏡 {accommodationItem.notes}
              </p>
            )}

            <p className="text-[10px] text-slate-400 italic">
              * Accommodation remains permanently active as your overnight shelter and cannot be checked off.
            </p>
          </div>

          {/* Action to navigate to Accommodation */}
          <a
            href={buildNavigationUrl(
              accommodationItem.toLat,
              accommodationItem.toLong,
              accommodationItem.to,
              geo.coords,
              accommodationItem.fromLat,
              accommodationItem.fromLong
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Navigate to Accommodation</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      )}

      {/* 6. COMPLETED PLACES SECTION WITH RE-ENABLE CAPABILITY */}
      {completedItems.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
          <button
            onClick={() => setShowCompletedSection(!showCompletedSection)}
            className="w-full flex items-center justify-between pb-1 border-b border-slate-800 text-left"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Completed Places ({completedItems.length})
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{showCompletedSection ? 'Collapse' : 'Show'}</span>
              {showCompletedSection ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {showCompletedSection && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] text-slate-400">
                Visited places are archived here. Tap <strong>Re-enable</strong> on any stop to move it back to your active list.
              </p>

              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between gap-2.5 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400 line-through truncate">
                        {item.from ? `${item.from} ➔ ${item.to}` : item.activity}
                      </p>
                      {item.departureTime && (
                        <p className="text-[10px] text-slate-400">
                          {item.departureTime} - {item.arrivalTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Re-enable Button */}
                  <button
                    onClick={() => onToggleItemComplete(item.id)}
                    className="min-h-[34px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0 transition active:scale-95"
                    title="Move back to active places"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-enable</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
