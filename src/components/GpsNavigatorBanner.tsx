import React, { useState, useMemo } from 'react';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  ExternalLink, 
  ChevronDown, 
  Clock, 
  AlertCircle,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ItineraryItem } from '../types';
import { GeolocationState } from '../hooks/useGeolocation';
import { 
  findMatchingStartingPoint, 
  formatDistance, 
  COTSWOLDS_PRESET_LOCATIONS 
} from '../utils/geoUtils';

interface GpsNavigatorBannerProps {
  dayItems: ItineraryItem[];
  geo: GeolocationState;
  onNavigate?: (url: string) => void;
}

export const GpsNavigatorBanner: React.FC<GpsNavigatorBannerProps> = ({
  dayItems,
  geo,
  onNavigate,
}) => {
  const [showSimPicker, setShowSimPicker] = useState(false);

  // Find if user is currently at any starting point
  const matchedStartingPoint = useMemo(() => {
    if (!geo.coords) return null;
    return findMatchingStartingPoint(geo.coords, dayItems, 3000);
  }, [geo.coords, dayItems]);

  const handleLaunchNavigation = (url: string) => {
    if (onNavigate) {
      onNavigate(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
      {/* Top row: Status and Locate Me button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            geo.status === 'located' || geo.status === 'simulated'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : geo.status === 'locating'
              ? 'bg-amber-500/20 text-amber-400 animate-pulse'
              : 'bg-slate-800 text-slate-400'
          }`}>
            <Compass className={`w-4 h-4 ${geo.status === 'locating' ? 'animate-spin' : ''}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">
                {geo.status === 'located' && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    GPS Live
                  </span>
                )}
                {geo.status === 'simulated' && (
                  <span className="text-teal-400">
                    Simulated: {geo.locationName}
                  </span>
                )}
                {geo.status === 'locating' && 'Detecting your GPS position...'}
                {geo.status === 'idle' && 'GPS Navigation Assistant'}
                {geo.status === 'error' && 'Location Unavailable'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 truncate">
              {geo.coords 
                ? `${geo.coords.latitude.toFixed(4)}, ${geo.coords.longitude.toFixed(4)}`
                : 'Identify starting point & auto-navigate'
              }
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => geo.detectLocation()}
            disabled={geo.status === 'locating'}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md disabled:opacity-50"
            title="Use device GPS"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{geo.coords ? 'Refresh GPS' : 'Locate Me'}</span>
          </button>

          <button
            onClick={() => setShowSimPicker(!showSimPicker)}
            className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition active:scale-95"
            title="Simulate / Test starting points"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showSimPicker ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* GPS Simulation / Test Drawer dropdown */}
      {showSimPicker && (
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Test starting points (GPS Simulator)
            </span>
            {geo.coords && (
              <button
                onClick={() => {
                  geo.clearLocation();
                  setShowSimPicker(false);
                }}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
            {COTSWOLDS_PRESET_LOCATIONS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  geo.setSimulatedLocation(preset.lat, preset.long, preset.name);
                  setShowSimPicker(false);
                }}
                className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-left border border-slate-800 hover:border-teal-500/50 transition group"
              >
                <p className="text-[11px] font-semibold text-slate-200 group-hover:text-teal-300 truncate">
                  {preset.name}
                </p>
                <p className="text-[9px] text-slate-400">
                  Day {preset.day} • {preset.lat.toFixed(3)}, {preset.long.toFixed(3)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MATCHED STARTING POINT & NAVIGATION CTA */}
      {matchedStartingPoint ? (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-950/60 to-emerald-950/40 border border-teal-500/40 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  {matchedStartingPoint.isExactStart 
                    ? `You are at starting point: ${matchedStartingPoint.fromName}` 
                    : `Near ${matchedStartingPoint.fromName} (${formatDistance(matchedStartingPoint.distanceMeters)})`}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Expected destination: <strong className="text-white font-bold">{matchedStartingPoint.toName}</strong>
              </p>
            </div>

            {matchedStartingPoint.item.departureTime && (
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">Dep - Arr</span>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-400" />
                  {matchedStartingPoint.item.departureTime} - {matchedStartingPoint.item.arrivalTime}
                </span>
              </div>
            )}
          </div>

          {matchedStartingPoint.item.notes && (
            <p className="text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
              💡 {matchedStartingPoint.item.notes}
            </p>
          )}

          {/* Big Primary Initiate Navigation Button */}
          <button
            onClick={() => handleLaunchNavigation(matchedStartingPoint.navigationUrl)}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50 transition active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4 fill-slate-950" />
            <span>Initiate Navigation to {matchedStartingPoint.toName}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
          </button>
        </div>
      ) : geo.coords ? (
        <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Position detected. Move to a day's starting point to auto-trigger navigation.
            </span>
          </div>
          <button
            onClick={() => setShowSimPicker(true)}
            className="text-[11px] font-semibold text-teal-400 hover:underline shrink-0"
          >
            Test Cotswolds Point
          </button>
        </div>
      ) : null}

      {/* Error display */}
      {geo.errorMessage && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{geo.errorMessage}</span>
        </div>
      )}
    </div>
  );
};
