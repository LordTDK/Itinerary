/**
 * Holiday Itinerary Access Interface - Mobile-First Edition
 * Designed specifically for mobile devices with live navigation and offline persistence.
 * Automatically identifies starting points, triggers navigation, and manages visited stops.
 */

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  getTodayString, 
  formatShortDate, 
  formatFriendlyDate, 
  daysBetween 
} from './utils/dateUtils';
import { 
  buildItineraryData, 
  exportToCSV 
} from './utils/csvParser';
import { calculateTripStatus } from './utils/tripCalculator';
import { 
  getSavedTrips, 
  saveTrip, 
  updateActiveTripData, 
  deleteTrip, 
  getActiveTripId, 
  setActiveTripId 
} from './utils/tripsStorage';
import { ItineraryData, MobileTab, SavedTrip } from './types';
import { useGeolocation } from './hooks/useGeolocation';

import { MobileHeader } from './components/MobileHeader';
import { MobileDayStrip } from './components/MobileDayStrip';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TodayMobileView } from './components/TodayMobileView';
import { ScheduleMobileView } from './components/ScheduleMobileView';
import { RouteMobileView } from './components/RouteMobileView';
import { HubMobileView } from './components/HubMobileView';
import { DateSimulatorDrawer } from './components/DateSimulatorDrawer';
import { CsvUploadModal } from './components/CsvUploadModal';
import { GithubDeployGuideModal } from './components/GithubDeployGuideModal';
import { Smartphone, Maximize2, Github } from 'lucide-react';

export default function App() {
  const realToday = useMemo(() => getTodayString(), []);
  const geo = useGeolocation();

  // Saved trips stored on this device in localStorage
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(() => getSavedTrips());
  const [activeTripId, setActiveTripIdState] = useState<string | null>(() => {
    const activeId = getActiveTripId();
    const trips = getSavedTrips();
    if (activeId && trips.some(t => t.id === activeId)) {
      return activeId;
    }
    return trips[0]?.id || null;
  });

  // Active itinerary data
  const [itinerary, setItinerary] = useState<ItineraryData>(() => {
    const trips = getSavedTrips();
    const activeId = getActiveTripId();
    const found = trips.find(t => t.id === activeId) || trips[0];
    if (found) {
      return found.data;
    }
    return buildItineraryData([], 'Holiday Itinerary');
  });

  // Default currentDate: if realToday is outside trip range, start on Day 1
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const diffStart = daysBetween(realToday, itinerary.startDate);
    const diffEnd = daysBetween(realToday, itinerary.endDate);
    if (diffStart > 0 || diffEnd < 0) {
      return itinerary.startDate; // Day 1
    }
    return realToday;
  });

  const isSimulatedDate = currentDate !== realToday;

  // Active mobile tab: 'today' | 'schedule' | 'route' | 'hub'
  const [activeTab, setActiveTab] = useState<MobileTab>('today');

  // Selected single day filter in schedule view (null = show all days)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  // Desktop simulator frame mode: 'mobile' (iPhone 390px frame) vs 'fluid' (expanded)
  const [frameMode, setFrameMode] = useState<'mobile' | 'fluid'>('mobile');

  // Modal / Drawer state
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGithubGuideOpen, setIsGithubGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute dynamic trip status whenever itinerary or currentDate changes
  const tripStatus = useMemo(() => {
    return calculateTripStatus(itinerary, currentDate);
  }, [itinerary, currentDate]);

  // Toggle item completion with confetti and persist to active saved trip
  // Notice: final destinations of the day (accommodation) cannot be toggled
  const handleToggleItemComplete = (itemId: string) => {
    setItinerary(prev => {
      const targetItem = prev.items.find(i => i.id === itemId);
      if (targetItem?.isFinalDestinationOfDay) {
        showToast("Tonight's accommodation remains active as your overnight shelter.");
        return prev;
      }

      const updatedItems = prev.items.map(item => {
        if (item.id === itemId) {
          const nextState = !item.completed;
          if (nextState) {
            try {
              confetti({
                particleCount: 25,
                spread: 50,
                origin: { y: 0.7 }
              });
            } catch {
              // ignore
            }
          }
          return { ...item, completed: nextState };
        }
        return item;
      });
      const updated = buildItineraryData(updatedItems, prev.title);
      if (activeTripId) {
        updateActiveTripData(activeTripId, updated);
        setSavedTrips(prevList => 
          prevList.map(t => t.id === activeTripId ? { ...t, data: updated } : t)
        );
      }
      return updated;
    });
  };

  // Handle uploading and saving a new CSV itinerary locally
  const handleLoadItinerary = (newItinerary: ItineraryData) => {
    const { trip, trips } = saveTrip(newItinerary);
    setSavedTrips(trips);
    setActiveTripIdState(trip.id);
    setActiveTripId(trip.id);
    setItinerary(newItinerary);
    setSelectedDayNumber(null);
    showToast(`Saved "${trip.title}" locally with ${newItinerary.items.length} stops!`);

    // Check if today is outside range
    const diffStart = daysBetween(realToday, newItinerary.startDate);
    const diffEnd = daysBetween(realToday, newItinerary.endDate);
    if (diffStart > 0 || diffEnd < 0) {
      setCurrentDate(newItinerary.startDate);
      showToast(`Itinerary set to Day 1 (${formatShortDate(newItinerary.startDate)})`);
    } else {
      setCurrentDate(realToday);
    }
  };

  // Switch to a different saved trip
  const handleSelectTrip = (tripId: string) => {
    const target = savedTrips.find(t => t.id === tripId);
    if (!target) return;

    setActiveTripIdState(tripId);
    setActiveTripId(tripId);
    setItinerary(target.data);
    setSelectedDayNumber(null);

    const diffStart = daysBetween(realToday, target.data.startDate);
    const diffEnd = daysBetween(realToday, target.data.endDate);
    if (diffStart > 0 || diffEnd < 0) {
      setCurrentDate(target.data.startDate);
    } else {
      setCurrentDate(realToday);
    }
    showToast(`Switched to "${target.title}"`);
  };

  // Delete a saved trip from local storage
  const handleDeleteTrip = (tripId: string) => {
    const deletedTrip = savedTrips.find(t => t.id === tripId);
    const updated = deleteTrip(tripId);
    setSavedTrips(updated);

    if (activeTripId === tripId) {
      if (updated.length > 0) {
        const next = updated[0];
        setActiveTripIdState(next.id);
        setActiveTripId(next.id);
        setItinerary(next.data);
        const diffStart = daysBetween(realToday, next.data.startDate);
        const diffEnd = daysBetween(realToday, next.data.endDate);
        if (diffStart > 0 || diffEnd < 0) {
          setCurrentDate(next.data.startDate);
        } else {
          setCurrentDate(realToday);
        }
        showToast(`Deleted "${deletedTrip?.title || 'Trip'}". Switched to "${next.title}".`);
      } else {
        setActiveTripIdState(null);
        showToast(`Deleted "${deletedTrip?.title || 'Trip'}".`);
      }
    } else {
      showToast(`Deleted "${deletedTrip?.title || 'Trip'}".`);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    try {
      const csvStr = exportToCSV(itinerary);
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${itinerary.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_itinerary.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Itinerary exported as CSV!');
    } catch {
      showToast('Failed to export CSV');
    }
  };

  // Handle tap on day from horizontal strip
  const handleSelectDay = (dayNumber: number | null, date?: string) => {
    setSelectedDayNumber(dayNumber);
    if (date) {
      if (activeTab === 'today') {
        setCurrentDate(date);
      } else {
        setActiveTab('schedule');
        const element = document.getElementById(`day-${date}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  // Count uncompleted activities for today
  const todayUncompleted = tripStatus.todaySchedule?.items.filter(i => !i.completed && !i.isFinalDestinationOfDay).length ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 z-50 left-1/2 -translate-x-1/2 max-w-xs w-full px-4">
          <div className="bg-teal-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-teal-400 text-center animate-in fade-in slide-in-from-top-4 duration-200">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Desktop Companion Bar (visible on desktop/tablet screens >= 640px) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-2xl px-4 py-2 text-xs text-slate-400 border-b border-slate-900 bg-slate-950/90 z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span className="font-semibold text-slate-200">Cotswolds Itinerary Mobile Navigator</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setFrameMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                frameMode === 'mobile' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="View as iPhone Device Frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone (390px)</span>
            </button>
            <button
              onClick={() => setFrameMode('fluid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                frameMode === 'fluid' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Expand fluid width"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fluid Width</span>
            </button>
          </div>

          <button
            onClick={() => setIsGithubGuideOpen(true)}
            className="hover:text-teal-200 flex items-center gap-1.5 text-[11px] text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded-md border border-teal-500/20 transition"
            title="How to host for free on GitHub Pages"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Free GitHub Hosting</span>
          </button>
        </div>
      </div>

      {/* Mobile Device Container Frame */}
      <div 
        className={`w-full flex-1 flex flex-col bg-slate-950 text-slate-100 transition-all duration-300 relative ${
          frameMode === 'mobile' 
            ? 'sm:max-w-[420px] sm:my-4 sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] sm:overflow-hidden'
            : 'max-w-xl sm:border-x sm:border-slate-900'
        }`}
      >
        {/* Mock Mobile Status Bar (Visible in desktop phone frame) */}
        {frameMode === 'mobile' && (
          <div className="hidden sm:flex h-7 bg-slate-900 px-7 pt-1.5 items-center justify-between text-[11px] font-semibold text-slate-400 select-none border-b border-slate-800/40">
            <span>9:41</span>
            <div className="w-24 h-4 bg-slate-950 rounded-full" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-4 h-2.5 border border-slate-400 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-300 rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* Top App Header */}
        <MobileHeader
          itinerary={itinerary}
          tripStatus={tripStatus}
          currentDate={currentDate}
          isSimulatedDate={isSimulatedDate}
          onResetDate={() => setCurrentDate(realToday)}
          onOpenDateDrawer={() => setIsDateDrawerOpen(true)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onShareOrExport={handleExportCsv}
        />

        {/* Horizontal Quick Day Strip */}
        <MobileDayStrip
          days={itinerary.days}
          activeDate={currentDate}
          selectedDayNumber={selectedDayNumber}
          onSelectDay={handleSelectDay}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4">
          
          {/* TAB 1: TODAY / LIVE GPS DASHBOARD */}
          {activeTab === 'today' && (
            <TodayMobileView
              currentDate={currentDate}
              tripStatus={tripStatus}
              todaySchedule={tripStatus.todaySchedule}
              totalDays={itinerary.totalDays}
              startDate={itinerary.startDate}
              endDate={itinerary.endDate}
              geo={geo}
              onToggleItemComplete={handleToggleItemComplete}
              onSetSimulatedDate={(d) => setCurrentDate(d)}
              onGoToSchedule={() => setActiveTab('schedule')}
            />
          )}

          {/* TAB 2: FULL SCHEDULE FEED */}
          {activeTab === 'schedule' && (
            <ScheduleMobileView
              days={itinerary.days}
              currentDate={currentDate}
              selectedDayNumber={selectedDayNumber}
              geo={geo}
              onToggleItemComplete={handleToggleItemComplete}
              onClearDayFilter={() => setSelectedDayNumber(null)}
            />
          )}

          {/* TAB 3: ROUTE & DESTINATIONS PROGRESSION */}
          {activeTab === 'route' && (
            <RouteMobileView
              itinerary={itinerary}
              tripStatus={tripStatus}
              currentDate={currentDate}
              geo={geo}
              onToggleItemComplete={handleToggleItemComplete}
            />
          )}

          {/* TAB 4: TRIP HUB & TOOLS */}
          {activeTab === 'hub' && (
            <HubMobileView
              itinerary={itinerary}
              tripStatus={tripStatus}
              currentDate={currentDate}
              isSimulatedDate={isSimulatedDate}
              savedTrips={savedTrips}
              activeTripId={activeTripId}
              onSelectTrip={handleSelectTrip}
              onDeleteTrip={handleDeleteTrip}
              onResetDate={() => setCurrentDate(realToday)}
              onSelectDate={(d) => setCurrentDate(d)}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenGithubGuide={() => setIsGithubGuideOpen(true)}
              onExportCsv={handleExportCsv}
            />
          )}

        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isTripActive={tripStatus.phase === 'active'}
          todayUncompletedCount={todayUncompleted}
        />

        {/* Date Simulator Bottom Drawer */}
        <DateSimulatorDrawer
          isOpen={isDateDrawerOpen}
          onClose={() => setIsDateDrawerOpen(false)}
          currentDate={currentDate}
          realDate={realToday}
          isSimulated={isSimulatedDate}
          days={itinerary.days}
          onSelectDate={(d) => setCurrentDate(d)}
          onResetToRealDate={() => setCurrentDate(realToday)}
        />

        {/* CSV Upload Bottom Sheet */}
        <CsvUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onLoadItinerary={handleLoadItinerary}
        />

        {/* GitHub Deploy Guide Bottom Sheet */}
        <GithubDeployGuideModal
          isOpen={isGithubGuideOpen}
          onClose={() => setIsGithubGuideOpen(false)}
        />

      </div>
    </div>
  );
}
