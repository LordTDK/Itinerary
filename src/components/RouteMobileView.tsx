import React from 'react';
import { 
  MapPin, 
  Navigation, 
  ChevronRight, 
  Hotel, 
  Calendar, 
  Sparkles,
  ExternalLink,
  Compass
} from 'lucide-react';
import { ItineraryData } from '../types';
import { formatShortDate } from '../utils/dateUtils';

interface RouteMobileViewProps {
  itinerary: ItineraryData;
  activeLocation?: string;
  onSelectCityFilter: (city: string) => void;
  onJumpToDate: (date: string) => void;
}

export const RouteMobileView: React.FC<RouteMobileViewProps> = ({
  itinerary,
  activeLocation,
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
      const isCurrent = activeLocation 
        ? activeLocation.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(activeLocation.toLowerCase()) 
        : false;
      
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

  const getGoogleMapsUrl = (query: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  return (
    <div className="space-y-4">
      {/* Route Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Holiday Route & Stops ({stops.length})
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Chronological destination progression for your {itinerary.totalDays}-day holiday.
        </p>
      </div>

      {/* Vertical Stops Journey (Mobile Boarding Pass / Train Style) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm relative">
        {/* Connecting line */}
        <div className="absolute left-[29px] top-7 bottom-7 w-0.5 bg-slate-800" />

        <div className="space-y-4 relative">
          {stops.map((stop, index) => {
            return (
              <div key={stop.city} className="flex items-start gap-3 relative group">
                
                {/* Node indicator */}
                <div className="shrink-0 z-10">
                  {stop.isCurrent ? (
                    <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-lg shadow-teal-500/40 ring-4 ring-teal-500/20">
                      {index + 1}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                  )}
                </div>

                {/* Stop Card */}
                <div className={`flex-1 rounded-2xl border p-3 transition ${
                  stop.isCurrent
                    ? 'bg-slate-850 border-teal-500/60 shadow-md ring-1 ring-teal-500/30'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {stop.city}
                      </h3>
                      {stop.isCurrent && (
                        <span className="px-1.5 py-0.2 rounded-md bg-teal-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                          Current Stop
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-teal-300 font-semibold bg-slate-700/60 px-2 py-0.5 rounded-md">
                      Day {stop.dayNumber}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>From {formatShortDate(stop.firstDate)} • {stop.itemCount} activities</span>
                  </p>

                  {stop.hotel && (
                    <p className="text-[11px] text-indigo-300 mt-1 flex items-center gap-1 truncate">
                      <Hotel className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate">Hotel: {stop.hotel}</span>
                    </p>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectCityFilter(stop.city)}
                      className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 py-1 active:scale-95"
                    >
                      <span>View Activities</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>

                    <a
                      href={getGoogleMapsUrl(`${stop.city}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-700/40 px-2 py-1 rounded-md"
                    >
                      <Navigation className="w-3 h-3 text-teal-400" />
                      <span>Explore</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
