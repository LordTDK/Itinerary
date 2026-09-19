import React from 'react';
import { MapPin, Navigation, Check, ChevronRight, Compass } from 'lucide-react';
import { DaySchedule, ItineraryData } from '../types';

interface RouteMapProps {
  itinerary: ItineraryData;
  activeLocation?: string;
  selectedCityFilter: string | null;
  onSelectCityFilter: (city: string | null) => void;
  onJumpToDate: (date: string) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  itinerary,
  activeLocation,
  selectedCityFilter,
  onSelectCityFilter,
  onJumpToDate,
}) => {
  // Aggregate unique stops chronologically
  const stops: {
    city: string;
    firstDate: string;
    dayNumber: number;
    hotel?: string;
    itemCount: number;
    isCurrent: boolean;
    isPast: boolean;
    isFuture: boolean;
  }[] = [];

  const seenCities = new Set<string>();

  for (const day of itinerary.days) {
    const city = day.items[0]?.city || day.primaryLocation.split(/[,/•-]/)[0]?.trim() || day.primaryLocation;
    if (!seenCities.has(city)) {
      seenCities.add(city);
      const isCurrent = activeLocation ? activeLocation.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(activeLocation.toLowerCase()) : false;
      stops.push({
        city,
        firstDate: day.date,
        dayNumber: day.dayNumber,
        hotel: day.hotel,
        itemCount: itinerary.items.filter(i => (i.city === city || i.location.includes(city))).length,
        isCurrent,
        isPast: day.isPast,
        isFuture: day.isFuture,
      });
    }
  }

  if (stops.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Holiday Route & Destinations
          </h3>
        </div>
        {selectedCityFilter && (
          <button
            onClick={() => onSelectCityFilter(null)}
            className="text-xs text-teal-700 hover:text-teal-800 underline font-medium"
          >
            Show All Cities
          </button>
        )}
      </div>

      {/* Horizontal Route Progression */}
      <div className="relative">
        <div className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200">
          {stops.map((stop, idx) => {
            const isSelected = selectedCityFilter === stop.city;
            return (
              <div
                key={stop.city}
                onClick={() => {
                  onSelectCityFilter(isSelected ? null : stop.city);
                  onJumpToDate(stop.firstDate);
                }}
                className={`group cursor-pointer shrink-0 w-44 sm:w-48 rounded-2xl p-3.5 border transition-all relative ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 shadow-sm'
                    : stop.isCurrent
                    ? 'bg-gradient-to-b from-teal-50 to-white border-teal-400 shadow-sm'
                    : 'bg-slate-50/70 hover:bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Active Indicator Pin */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Stop {idx + 1} • Day {stop.dayNumber}
                  </span>
                  {stop.isCurrent ? (
                    <span className="flex h-2.5 w-2.5 relative" title="Active stop today">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600" />
                    </span>
                  ) : stop.isPast ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]" title="Completed stop">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>

                <div className="font-bold text-slate-900 text-sm group-hover:text-teal-700 truncate">
                  {stop.city}
                </div>

                {stop.hotel && (
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    🏨 {stop.hotel}
                  </div>
                )}

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{stop.itemCount} {stop.itemCount === 1 ? 'activity' : 'activities'}</span>
                  <span className="text-teal-600 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                    View
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
