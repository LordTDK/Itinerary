import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  Calendar, 
  StickyNote, 
  ShieldAlert, 
  Sparkles, 
  Smartphone, 
  Check, 
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Plus,
  Github,
  PiggyBank,
  Trash2,
  FolderHeart,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ItineraryData, TripStatus, SavedTrip } from '../types';
import { formatShortDate, formatFriendlyDate, getTodayString } from '../utils/dateUtils';

interface HubMobileViewProps {
  itinerary: ItineraryData;
  tripStatus: TripStatus;
  currentDate: string;
  isSimulatedDate: boolean;
  savedTrips: SavedTrip[];
  activeTripId: string | null;
  onSelectTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onResetDate: () => void;
  onSelectDate: (date: string) => void;
  onOpenUploadModal: () => void;
  onOpenGithubGuide: () => void;
  onExportCsv: () => void;
}

export const HubMobileView: React.FC<HubMobileViewProps> = ({
  itinerary,
  tripStatus,
  currentDate,
  isSimulatedDate,
  savedTrips,
  activeTripId,
  onSelectTrip,
  onDeleteTrip,
  onResetDate,
  onSelectDate,
  onOpenUploadModal,
  onOpenGithubGuide,
  onExportCsv,
}) => {
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem('holiday_itinerary_quick_notes') || 
      '• Travel Insurance: Policy active\n• Booking Confirmation ref: In email\n• Hotel check-in: Photo ID required for all guests\n• Car charger & route maps ready';
  });
  const [isSaved, setIsSaved] = useState(false);
  const [showPwaTip, setShowPwaTip] = useState(false);
  const [tripIdPendingDelete, setTripIdPendingDelete] = useState<string | null>(null);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    localStorage.setItem('holiday_itinerary_quick_notes', val);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Date Simulator / Time Machine Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Date Simulator (Time Machine)
            </h3>
          </div>
          {isSimulatedDate && (
            <button
              onClick={onResetDate}
              className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Real Date</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mb-3">
          Currently simulating: <strong className="text-white">{formatFriendlyDate(currentDate)}</strong>. Switch dates to test itinerary transitions.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectDate(itinerary.startDate)}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700/60 active:scale-98 transition"
          >
            <span>Jump to Day 1</span>
          </button>
          <button
            onClick={onResetDate}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 active:scale-98 transition"
          >
            <span>Reset to Today</span>
          </button>
        </div>

        {/* Custom date picker input */}
        <div className="mt-3 flex items-center gap-2 bg-slate-800/80 rounded-xl p-1.5 border border-slate-700/60">
          <span className="text-[11px] text-slate-400 pl-2">Select Date:</span>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => e.target.value && onSelectDate(e.target.value)}
            className="flex-1 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Saved Trips on this Device (Local Storage) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Saved Trips on this Device
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
            {savedTrips.length} {savedTrips.length === 1 ? 'Trip' : 'Trips'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          All uploaded itineraries are stored locally in your browser so you can access and navigate them offline. You can delete them at any time.
        </p>

        {/* List of saved trips */}
        <div className="space-y-2 pt-1">
          {savedTrips.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">No saved trips stored on this device.</p>
              <button
                onClick={onOpenUploadModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload a Trip CSV</span>
              </button>
            </div>
          ) : (
            savedTrips.map((trip) => {
              const isActive = trip.id === activeTripId || (activeTripId === null && trip.title === itinerary.title);
              const isConfirmingDelete = tripIdPendingDelete === trip.id;

              return (
                <div
                  key={trip.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    isActive
                      ? 'bg-slate-800/90 border-teal-500/60 shadow-sm'
                      : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">
                          {trip.title}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>{trip.itemCount} stops</span>
                        <span>•</span>
                        <span>{formatShortDate(trip.startDate)} – {formatShortDate(trip.endDate)}</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isActive && !isConfirmingDelete && (
                        <button
                          onClick={() => onSelectTrip(trip.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 text-xs font-semibold active:scale-95 transition"
                        >
                          Open
                        </button>
                      )}

                      {!isConfirmingDelete && (
                        <button
                          onClick={() => setTripIdPendingDelete(trip.id)}
                          title="Delete trip from device"
                          aria-label={`Delete ${trip.title}`}
                          className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 flex items-center justify-center border border-slate-700/60 active:scale-95 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Delete Confirmation */}
                  {isConfirmingDelete && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Delete "{trip.title}" from this device?</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onDeleteTrip(trip.id);
                            setTripIdPendingDelete(null);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs active:scale-95 transition"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setTripIdPendingDelete(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Upload Button */}
        <div className="pt-2">
          <button
            onClick={onOpenUploadModal}
            className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow active:scale-98 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Itinerary CSV</span>
          </button>
        </div>
      </div>

      {/* CSV Export & Backup Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
          <Download className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Export Current Itinerary
          </h3>
        </div>

        <p className="text-[11px] text-slate-400">
          Download the active itinerary as a CSV file to save as a file on your phone or share with travel companions.
        </p>

        <button
          onClick={onExportCsv}
          className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 active:scale-98 transition"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export "{itinerary.title}" as CSV</span>
        </button>
      </div>

      {/* Offline Travel Notes & Emergency Contacts */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Offline Travel Notes
            </h3>
          </div>
          {isSaved && (
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> Auto-saved
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-400">
          Saved locally on your device for offline reference (flight refs, policies, local contacts).
        </p>

        <textarea
          rows={5}
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Enter emergency contacts, insurance numbers, luggage codes..."
          className="w-full text-xs text-slate-200 bg-slate-800/80 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
        />
      </div>

      {/* GitHub Free Hosting & Mobile Access */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Free GitHub Storage & Hosting
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
            <PiggyBank className="w-3 h-3" /> 100% Free
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          GitHub Pages provides free static web hosting and code backup with <strong>zero server or maintenance costs</strong>.
        </p>

        <div className="flex flex-col gap-2">
          <button
            id="btn-github-deploy-guide"
            onClick={onOpenGithubGuide}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-semibold flex items-center justify-between border border-teal-500/40 active:scale-98 transition"
          >
            <span className="flex items-center gap-2.5">
              <Github className="w-4 h-4 text-teal-400" />
              <span>How to Host for Free on GitHub Pages</span>
            </span>
            <ChevronRight className="w-4 h-4 text-teal-400" />
          </button>

          <button
            onClick={() => setShowPwaTip(!showPwaTip)}
            className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-between border border-slate-700 active:scale-98 transition"
          >
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span>How to Add to Phone Home Screen</span>
            </span>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showPwaTip ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {showPwaTip && (
          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-2 mt-2">
            <div className="space-y-1">
              <p className="font-semibold text-teal-300">iPhone / Safari:</p>
              <p className="text-[11px] text-slate-400">
                Tap the <strong className="text-white">Share</strong> button (box with upward arrow) in the bottom bar, then tap <strong className="text-white">"Add to Home Screen"</strong>.
              </p>
            </div>
            <div className="space-y-1 pt-1 border-t border-slate-700/60">
              <p className="font-semibold text-teal-300">Android / Chrome:</p>
              <p className="text-[11px] text-slate-400">
                Tap the <strong className="text-white">Three Dots</strong> menu in the top-right corner, then select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home Screen"</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

