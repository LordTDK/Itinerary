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
  PiggyBank
} from 'lucide-react';
import { ItineraryData, TripStatus } from '../types';
import { formatShortDate, formatFriendlyDate, getTodayString } from '../utils/dateUtils';

interface HubMobileViewProps {
  itinerary: ItineraryData;
  tripStatus: TripStatus;
  currentDate: string;
  isSimulatedDate: boolean;
  onResetDate: () => void;
  onSelectDate: (date: string) => void;
  onOpenUploadModal: () => void;
  onOpenGithubGuide: () => void;
  onExportCsv: () => void;
  onSelectSample: (key: 'cotswolds' | 'japan' | 'europe') => void;
}

export const HubMobileView: React.FC<HubMobileViewProps> = ({
  itinerary,
  tripStatus,
  currentDate,
  isSimulatedDate,
  onResetDate,
  onSelectDate,
  onOpenUploadModal,
  onOpenGithubGuide,
  onExportCsv,
  onSelectSample,
}) => {
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem('holiday_itinerary_quick_notes') || 
      '• Travel Insurance: Allianz Policy #98124\n• Local Police: 110 | Medical: 119\n• Hotel check-in: Passport required for all guests\n• Universal travel power adapter packed in day bag';
  });
  const [isSaved, setIsSaved] = useState(false);
  const [showPwaTip, setShowPwaTip] = useState(false);

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

      {/* CSV Management Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
          <Upload className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Itinerary CSV Data
          </h3>
        </div>

        <p className="text-[11px] text-slate-400">
          Load your customized holiday schedule or export the current itinerary for offline backup.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenUploadModal}
            className="min-h-[44px] px-3 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-98 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={onExportCsv}
            className="min-h-[44px] px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 active:scale-98 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Sample Trips Switcher */}
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Load Pre-Configured Sample Trips
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => onSelectSample('cotswolds')}
              className="py-2.5 px-3 rounded-xl bg-teal-950/40 hover:bg-teal-900/50 text-slate-300 text-xs font-medium border border-teal-500/40 text-left active:scale-98 transition"
            >
              <span className="font-bold text-teal-300 block">🇬🇧 Cotswolds Tour</span>
              <span className="text-[10px] text-slate-400">4 Days (Poole, Broadway, Stow)</span>
            </button>
            <button
              onClick={() => onSelectSample('japan')}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700/50 text-left active:scale-98 transition"
            >
              <span className="font-bold text-slate-200 block">🇯🇵 Japan Autumn</span>
              <span className="text-[10px] text-slate-400">12 Days (Tokyo, Kyoto)</span>
            </button>
            <button
              onClick={() => onSelectSample('europe')}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700/50 text-left active:scale-98 transition"
            >
              <span className="font-bold text-slate-200 block">🇪🇺 Europe Tour</span>
              <span className="text-[10px] text-slate-400">10 Days (Paris, Rome)</span>
            </button>
          </div>
        </div>
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
            <div>
              <strong className="text-teal-300 block mb-0.5">iPhone / Safari:</strong>
              <p className="text-[11px] text-slate-400">Tap the Share icon (<span className="text-white">□↑</span>) at the bottom of Safari, then select <strong>"Add to Home Screen"</strong>.</p>
            </div>
            <div>
              <strong className="text-teal-300 block mb-0.5">Android / Chrome:</strong>
              <p className="text-[11px] text-slate-400">Tap the three-dots menu (⋮) in the top right, then select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
