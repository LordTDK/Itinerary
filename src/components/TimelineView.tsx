import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  CheckCircle2,
  Circle,
  Compass,
  Plane,
  Train,
  Utensils,
  Landmark,
  Sparkles,
  Navigation
} from 'lucide-react';
import { ActivityCategory, DaySchedule, ItineraryItem } from '../types';

interface TimelineViewProps {
  days: DaySchedule[];
  currentDate: string;
  selectedCityFilter: string | null;
  onToggleItemComplete: (itemId: string) => void;
  onJumpToDate?: (date: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  days,
  currentDate,
  selectedCityFilter,
  onToggleItemComplete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewFilter, setViewFilter] = useState<'all' | 'upcoming' | 'today'>('all');
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});

  const toggleDayCollapse = (date: string) => {
    setCollapsedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'Flight':
        return <Plane className="w-3.5 h-3.5 text-sky-600" />;
      case 'Transport':
        return <Train className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Hotel':
        return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Food':
        return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case 'Sightseeing':
        return <Landmark className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  const getGoogleMapsUrl = (query: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  // Filter days and items
  const filteredDays = days.filter(day => {
    // City filter
    if (selectedCityFilter) {
      const matchesCity = day.locations.some(l => l.toLowerCase().includes(selectedCityFilter.toLowerCase())) ||
        day.primaryLocation.toLowerCase().includes(selectedCityFilter.toLowerCase());
      if (!matchesCity) return false;
    }

    // View filter
    if (viewFilter === 'today' && !day.isToday) {
      return false;
    }
    if (viewFilter === 'upcoming' && day.isPast && !day.isToday) {
      return false;
    }

    // Search query or category filter matching
    if (!searchQuery && selectedCategory === 'All') {
      return true;
    }

    const query = searchQuery.toLowerCase();
    const hasMatchingItem = day.items.some(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchText = !query || 
        item.activity.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query)) ||
        (item.hotel && item.hotel.toLowerCase().includes(query));
      return matchCat && matchText;
    });

    return hasMatchingItem;
  });

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
      
      {/* Controls & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Full Holiday Schedule</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological breakdown with live day tracking
          </p>
        </div>

        {/* View Mode Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Days ({days.length})
            </button>
            <button
              onClick={() => setViewFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewFilter === 'upcoming'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today & Ahead
            </button>
            <button
              onClick={() => setViewFilter('today')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewFilter === 'today'
                  ? 'bg-white text-teal-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today Only
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities, places, booking codes, hotels..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Sightseeing', 'Transport', 'Food', 'Hotel', 'Activity'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Days List */}
      {filteredDays.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No matching days found</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or category filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDays.map(day => {
            const isCollapsed = !!collapsedDays[day.date];
            const isToday = day.isToday;

            return (
              <div
                key={day.date}
                id={`day-${day.date}`}
                className={`rounded-2xl border transition-all ${
                  isToday
                    ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20 shadow-md'
                    : day.isPast
                    ? 'border-slate-200 bg-slate-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Day Header */}
                <div
                  onClick={() => toggleDayCollapse(day.date)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Day Pill */}
                    <div className={`w-14 sm:w-16 h-14 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 transition ${
                      isToday
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-700/30'
                        : day.isPast
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                        {isToday ? 'TODAY' : `DAY ${day.dayNumber}`}
                      </span>
                      <span className="text-lg leading-tight">
                        {day.date.split('-')[2]}
                      </span>
                    </div>

                    {/* Day Details */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {day.formattedDate}
                        </h4>
                        {isToday && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-500 text-white animate-pulse">
                            Active Date
                          </span>
                        )}
                        {day.isPast && !isToday && (
                          <span className="text-[11px] font-medium text-slate-400">
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Primary location and hotel */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 font-semibold text-teal-800">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          <span>{day.primaryLocation}</span>
                        </span>

                        {day.hotel && (
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Stay: {day.hotel}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Header Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {day.items.length} {day.items.length === 1 ? 'item' : 'items'}
                    </span>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Day Items List */}
                {!isCollapsed && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-100 space-y-2.5">
                    {day.items.map((item, idx) => {
                      const isCompleted = !!item.completed;
                      return (
                        <div
                          key={item.id || idx}
                          className={`rounded-xl p-3 border text-xs sm:text-sm transition-all flex items-start gap-3 ${
                            isCompleted
                              ? 'bg-slate-100/50 border-slate-200 text-slate-400'
                              : 'bg-white border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onToggleItemComplete(item.id)}
                            className="mt-0.5 text-slate-400 hover:text-teal-600 focus:outline-none transition shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5">
                                {item.time && (
                                  <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                    {item.time}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                                  {getCategoryIcon(item.category)}
                                  <span>{item.category}</span>
                                </span>
                              </div>
                              {item.cost && (
                                <span className="font-semibold text-emerald-700 text-xs">
                                  {item.cost}
                                </span>
                              )}
                            </div>

                            <div className={`font-semibold text-slate-900 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                              {item.activity}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{item.location}</span>
                              </span>
                              <a
                                href={getGoogleMapsUrl(item.location)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-0.5 text-[11px]"
                              >
                                <span>Map</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>

                            {item.notes && (
                              <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
