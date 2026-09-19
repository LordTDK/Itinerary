import React from 'react';
import { 
  Compass, 
  CalendarDays, 
  Map, 
  Settings2, 
  Sparkles,
  SunMedium
} from 'lucide-react';
import { MobileTab } from '../types';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  isTripActive: boolean;
  todayUncompletedCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  isTripActive,
  todayUncompletedCount = 0,
}) => {
  const navItems: { id: MobileTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string }[] = [
    {
      id: 'today',
      label: 'Today',
      icon: SunMedium,
      badge: todayUncompletedCount > 0 ? todayUncompletedCount : undefined,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: CalendarDays,
    },
    {
      id: 'route',
      label: 'Route',
      icon: Map,
    },
    {
      id: 'hub',
      label: 'Trip Hub',
      icon: Settings2,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 shadow-2xl safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all duration-150 active:scale-90 relative ${
                isActive
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Highlight Pill */}
              {isActive && (
                <div className="absolute top-1.5 w-10 h-1 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
              )}

              <div className="relative mt-1">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-teal-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
