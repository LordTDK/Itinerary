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
  Ticket,
  Copy,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ActivityCategory, DaySchedule, ItineraryItem, TripStatus } from '../types';
import { formatFriendlyDate, formatShortDate } from '../utils/dateUtils';

interface CurrentDayHeroProps {
  currentDate: string;
  tripStatus: TripStatus;
  todaySchedule?: DaySchedule;
  onToggleItemComplete: (itemId: string) => void;
  onSetSimulatedDate: (date: string) => void;
  firstDayDate?: string;
  totalDays: number;
}

export const CurrentDayHero: React.FC<CurrentDayHeroProps> = ({
  currentDate,
  tripStatus,
  todaySchedule,
  onToggleItemComplete,
  onSetSimulatedDate,
  firstDayDate,
  totalDays,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'Flight':
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'Transport':
        return <Train className="w-4 h-4 text-emerald-600" />;
      case 'Hotel':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'Food':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'Sightseeing':
        return <Landmark className="w-4 h-4 text-rose-600" />;
      case 'Activity':
      case 'Leisure':
      default:
        return <Compass className="w-4 h-4 text-teal-600" />;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getGoogleMapsUrl = (query: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getWeatherUrl = (location: string) => {
    return `https://www.google.com/search?q=weather+${encodeURIComponent(location)}`;
  };

  // 1. UPCOMING PHASE (Current Date is before trip)
  if (tripStatus.phase === 'upcoming') {
    return (
      <section className="bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Calendar className="w-3.5 h-3.5" />
              Upcoming Trip
            </span>
            <span className="text-xs text-slate-300">
              Current Date: <strong className="text-white">{formatFriendlyDate(currentDate)}</strong>
            </span>
          </div>

          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">
              Trip starts in {tripStatus.daysUntilTrip} {tripStatus.daysUntilTrip === 1 ? 'day' : 'days'}!
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
              Your holiday itinerary is ready. When the calendar reaches your departure date, this interface will automatically activate your live daily locations and schedules.
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-medium text-teal-300 uppercase tracking-wider">
                    First Destination Stop
                  </div>
                  <div className="text-lg font-bold text-white">
                    {tripStatus.currentLocation || 'Day 1 Location'}
                  </div>
                  {tripStatus.currentHotel && (
                    <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Stay: {tripStatus.currentHotel}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {firstDayDate && (
              <button
                onClick={() => onSetSimulatedDate(firstDayDate)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/25 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Fast-forward to Day 1 ({formatShortDate(firstDayDate)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 2. COMPLETED PHASE
  if (tripStatus.phase === 'completed') {
    return (
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Trip Completed
          </span>
          <span className="text-xs text-slate-400">
            Current Date: {formatFriendlyDate(currentDate)}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Welcome back from your holiday!
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          All {totalDays} scheduled days of your holiday itinerary have concluded. You can review the complete timeline below or simulate any date during your trip.
        </p>
        {firstDayDate && (
          <button
            onClick={() => onSetSimulatedDate(firstDayDate)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition"
          >
            <span>Rewind to Day 1</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </section>
    );
  }

  // 3. ACTIVE TRIP PHASE (Populated based on Current Date!)
  const activeLocation = todaySchedule?.primaryLocation || tripStatus.currentLocation || 'Today\'s Destination';
  const activeHotel = todaySchedule?.hotel || tripStatus.currentHotel;
  const items = todaySchedule?.items || [];
  const completedCount = items.filter(i => i.completed).length;

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      
      {/* Dynamic Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 relative">
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-400 text-slate-950 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-ping" />
                DAY {tripStatus.currentDayNumber || 1} OF {totalDays}
              </span>
              <span className="text-xs text-teal-200 font-medium">
                {formatFriendlyDate(currentDate)}
              </span>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1">
              Active Location Today
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {activeLocation}
            </h2>

            {/* Tonight's accommodation */}
            {activeHotel && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-teal-100">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-900/60 border border-teal-600/40">
                  <Building2 className="w-4 h-4 text-amber-300" />
                  <span>Stay: <strong className="text-white">{activeHotel}</strong></span>
                </span>
                <a
                  href={getGoogleMapsUrl(activeHotel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-300 hover:text-white underline inline-flex items-center gap-1"
                >
                  <span>Hotel Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={getGoogleMapsUrl(activeLocation)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20 transition shadow-sm"
            >
              <Navigation className="w-4 h-4 text-teal-300" />
              <span>Explore Map</span>
            </a>
            <a
              href={getWeatherUrl(activeLocation)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur border border-white/20 transition shadow-sm"
            >
              <CloudSun className="w-4 h-4 text-amber-300" />
              <span>Weather</span>
            </a>
          </div>
        </div>

        {/* Progress bar for today's activities */}
        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t border-teal-600/30 flex items-center justify-between text-xs text-teal-200">
            <span>Today's Progress: {completedCount} of {items.length} completed</span>
            <div className="w-32 bg-teal-950/50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-teal-300 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(completedCount / items.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Today's Activities List */}
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Today's Schedule & Activities</span>
          </h3>
          <span className="text-xs text-slate-500">
            {items.length} {items.length === 1 ? 'event scheduled' : 'events scheduled'}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Open Exploration Day</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No specific CSV events scheduled for today. Enjoy relaxing or exploring {activeLocation}!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const isCompleted = !!item.completed;
              return (
                <div
                  key={item.id || idx}
                  className={`group relative rounded-2xl border p-4 transition-all ${
                    isCompleted
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200/90 hover:border-teal-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleItemComplete(item.id)}
                      className="mt-1 text-slate-400 hover:text-teal-600 focus:outline-none transition shrink-0"
                      title={isCompleted ? 'Mark as pending' : 'Mark as done'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-600" />
                      ) : (
                        <Circle className="w-5 h-5 hover:stroke-teal-600" />
                      )}
                    </button>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Time tag */}
                        {item.time && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {item.time}
                          </span>
                        )}

                        {/* Category badge */}
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </span>

                        {/* Cost */}
                        {item.cost && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {item.cost}
                          </span>
                        )}
                      </div>

                      {/* Activity Title */}
                      <h4 className={`text-sm sm:text-base font-bold text-slate-900 ${
                        isCompleted ? 'line-through text-slate-500' : ''
                      }`}>
                        {item.activity}
                      </h4>

                      {/* Location details */}
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{item.location}</span>
                        </span>

                        <a
                          href={getGoogleMapsUrl(item.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-0.5"
                        >
                          <span>Directions</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      {/* Notes / Booking Ref / Details */}
                      {item.notes && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 flex items-start justify-between gap-2">
                          <span className="leading-relaxed">{item.notes}</span>
                          <button
                            onClick={() => copyToClipboard(item.notes!, item.id)}
                            className="text-slate-400 hover:text-slate-700 p-1 shrink-0 rounded"
                            title="Copy details"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
