import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Check, ExternalLink, Shield } from 'lucide-react';

export const TravelNotesWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem('holiday_itinerary_quick_notes') || 
      '• Travel Insurance Policy: Allianz Global Ref #98124\n• Emergency local number: 110 (Police), 119 (Medical)\n• Hotel Check-in requirement: Passport required for all guests\n• Universal travel power adapter packed in carry-on';
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    localStorage.setItem('holiday_itinerary_quick_notes', val);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Trip Notes & Essential Reference
            </h4>
            <p className="text-[11px] text-slate-500">
              Emergency contacts, booking numbers & offline reminders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg transition"
          >
            {isOpen ? 'Collapse' : 'Open Notes'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Type any emergency numbers, reservation codes, passport reminders or travel notes..."
            className="w-full text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono leading-relaxed"
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Stored locally in your browser (works 100% offline during travel).</span>
          </div>
        </div>
      )}
    </section>
  );
};
