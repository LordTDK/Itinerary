import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  CheckCircle2,
  Circle,
  Compass,
  Plane,
  Car,
  Utensils,
  Landmark,
  Building2,
  Navigation,
  RotateCcw,
  Check,
  X,
  Hotel,
  DollarSign
} from 'lucide-react';
import { ActivityCategory, DaySchedule, ItineraryItem } from '../types';
import { GeolocationState } from '../hooks/useGeolocation';
import { buildNavigationUrl } from '../utils/geoUtils';

interface ScheduleMobileViewProps {
  days: DaySchedule[];
  currentDate: string;
  selectedDayNumber: number | null;
  geo?: GeolocationState;
  onToggleItemComplete: (itemId: string) => void;
  onClearDayFilter: () => void;
}

export const ScheduleMobileView: React.FC<ScheduleMobileViewProps> = ({
  days,
  currentDate,
  selectedDayNumber,
  geo,
  onToggleItemComplete,
  onClearDayFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});
  const [collapsedCompleted, setCollapsedCompleted] = useState<Record<string, boolean>>({});

  const categories: string[] = ['All', 'Transport', 'Sightseeing', 'Food', 'Hotel', 'Activity'];

  const toggleDayCollapse = (date: string) => {
    setCollapsedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const toggleCompletedCollapse = (date: string) => {
    setCollapsedCompleted(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'Flight':
        return <Plane className="w-3.5 h-3.5 text-sky-400" />;
      case 'Transport':
        return <Car className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Hotel':
        return <Building2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Food':
        return <Utensils className="w-3.5 h-3.5 text-amber-400" />;
      case 'Sightseeing':
        return <Landmark className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  // Filter days
  const filteredDays = days.filter(day => {
    if (selectedDayNumber !== null && day.dayNumber !== selectedDayNumber) {
      return false;
    }

    if (!searchQuery && selectedCategory === 'All') {
      return true;
    }

    const q = searchQuery.toLowerCase();
    return day.items.some(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchText = !q || 
        item.activity.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.from && item.from.toLowerCase().includes(q)) ||
        (item.to && item.to.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      return matchCat && matchText;
    });
  });

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stops, towns, notes (e.g. Castle Combe, Tesco)..."
            className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Filter Indicator */}
        {selectedDayNumber !== null && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs text-teal-400">
            <span>Filtered to Day {selectedDayNumber}</span>
            <button
              onClick={onClearDayFilter}
              className="text-[11px] font-bold underline hover:text-teal-300"
            >
              Show All {days.length} Days
            </button>
          </div>
        )}
      </div>

      {/* Days List Feed */}
      {filteredDays.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
          <p className="text-sm font-semibold">No itinerary stops found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filter category</p>
        </div>
      ) : (
        filteredDays.map((day) => {
          const isToday = day.date === currentDate;
          const isCollapsed = Boolean(collapsedDays[day.date]);
          const isCompletedCollapsed = Boolean(collapsedCompleted[day.date]);

          // Partition items
          const activeItems = day.items.filter(i => !i.completed && !i.isFinalDestinationOfDay);
          const accommodationItem = day.items.find(i => i.isFinalDestinationOfDay);
          const completedItems = day.items.filter(i => i.completed && !i.isFinalDestinationOfDay);

          return (
            <div
              key={day.date}
              id={`day-${day.date}`}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm ${
                isToday
                  ? 'bg-slate-900 border-teal-500/50 shadow-teal-500/5'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {/* Day Sticky Header */}
              <div 
                onClick={() => toggleDayCollapse(day.date)}
                className="p-4 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-850/60 hover:bg-slate-850 select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isToday ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    D{day.dayNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-white truncate">
                        {day.formattedDate}
                      </h3>
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {day.primaryLocation} • {activeItems.length} active • {completedItems.length} visited
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>

              {/* Day Items Body */}
              {!isCollapsed && (
                <div className="p-3.5 space-y-3">
                  
                  {/* Active stops */}
                  <div className="space-y-2.5">
                    {activeItems.map((item) => {
                      const navUrl = buildNavigationUrl(
                        item.toLat,
                        item.toLong,
                        item.to || item.location,
                        geo?.coords,
                        item.fromLat,
                        item.fromLong
                      );

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border bg-slate-800/40 border-slate-700/60 hover:border-slate-600 p-3 space-y-2"
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Checkbox */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleItemComplete(item.id);
                              }}
                              className="w-9 h-9 -ml-1 -mt-1 flex items-center justify-center shrink-0 active:scale-90 text-slate-400 hover:text-teal-400 transition"
                              title="Check off place as visited"
                            >
                              <Circle className="w-5 h-5 text-slate-500 hover:text-teal-400" />
                            </button>

                            <div className="min-w-0 flex-1">
                              {/* From -> To */}
                              <h4 className="text-xs font-bold text-white">
                                {item.from ? `${item.from} ➔ ${item.to}` : item.activity}
                              </h4>

                              {/* Timings */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                                {item.departureTime && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-700/80 text-teal-300 font-semibold">
                                    <Clock className="w-3 h-3" />
                                    {item.departureTime} - {item.arrivalTime}
                                  </span>
                                )}
                                {item.duration && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-700/40 text-slate-300">
                                    Drive: {item.duration}
                                  </span>
                                )}
                                {item.stayDuration && item.stayDuration !== 'N/A' && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-500/20 font-medium">
                                    Stay: {item.stayDuration}
                                  </span>
                                )}
                                {item.costs && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-amber-900/40 text-amber-300 font-medium">
                                    {item.costs}
                                  </span>
                                )}
                              </div>

                              {item.notes && (
                                <p className="text-[11px] text-slate-300 mt-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                                  💡 {item.notes}
                                </p>
                              )}

                              {item.toLat !== undefined && item.toLong !== undefined && (
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  📍 Coords: {item.toLat.toFixed(4)}, {item.toLong.toFixed(4)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Navigation row */}
                          <div className="pt-1.5 border-t border-slate-700/40 flex items-center justify-between">
                            <button
                              onClick={() => onToggleItemComplete(item.id)}
                              className="text-[10px] font-semibold text-teal-400 hover:underline flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Mark Visited
                            </button>
                            <a
                              href={navUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-bold text-[11px] flex items-center gap-1 active:scale-95"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>Navigate</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Accommodation Card (Protected - cannot be marked off) */}
                  {accommodationItem && (
                    <div className="rounded-2xl border-2 border-indigo-500/40 bg-indigo-950/30 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Hotel className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                            Tonight's Accommodation: {accommodationItem.to}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                          Day {day.dayNumber} Base
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        {accommodationItem.from && (
                          <span>From {accommodationItem.from}</span>
                        )}
                        {accommodationItem.arrivalTime && (
                          <span className="text-slate-300 font-medium">
                            Arrive by {accommodationItem.arrivalTime}
                          </span>
                        )}
                      </div>

                      {accommodationItem.notes && (
                        <p className="text-[11px] text-indigo-200 bg-indigo-950/40 px-2 py-1 rounded-lg border border-indigo-500/20">
                          🏡 {accommodationItem.notes}
                        </p>
                      )}

                      <a
                        href={buildNavigationUrl(
                          accommodationItem.toLat,
                          accommodationItem.toLong,
                          accommodationItem.to,
                          geo?.coords,
                          accommodationItem.fromLat,
                          accommodationItem.fromLong
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full min-h-[36px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Navigate to Accommodation</span>
                      </a>
                    </div>
                  )}

                  {/* Completed Places Section with Re-enable */}
                  {completedItems.length > 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
                      <button
                        onClick={() => toggleCompletedCollapse(day.date)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            Completed Places ({completedItems.length})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span>{isCompletedCollapsed ? 'Show' : 'Hide'}</span>
                          {isCompletedCollapsed ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronUp className="w-3 h-3" />
                          )}
                        </div>
                      </button>

                      {!isCompletedCollapsed && (
                        <div className="space-y-2 pt-1 border-t border-slate-800/80">
                          {completedItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-400 line-through truncate">
                                  {item.from ? `${item.from} ➔ ${item.to}` : item.activity}
                                </p>
                                {item.departureTime && (
                                  <p className="text-[10px] text-slate-500">
                                    {item.departureTime} - {item.arrivalTime}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => onToggleItemComplete(item.id)}
                                className="min-h-[30px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 shrink-0 transition active:scale-95"
                                title="Move back to active list"
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
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
