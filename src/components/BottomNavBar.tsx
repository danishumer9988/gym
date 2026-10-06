import React from 'react';
import { Home, Dumbbell, Utensils, User } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

export type TabType = 'dashboard' | 'workout' | 'nutrition' | 'profile';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeWorkoutCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  activeWorkoutCount = 0,
}) => {
  const tabs: { id: TabType; label: string; icon: typeof Home; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell, badge: activeWorkoutCount },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav 
      aria-label="Bottom Navigation"
      className="shrink-0 bg-[#0E1217]/95 backdrop-blur-md border-t border-[#1C2530] px-3 pt-2 pb-3"
    >
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                onSelectTab(tab.id);
              }}
              className="flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-150 group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF66]"
            >
              {/* Material 3 Active Pill Container */}
              <div
                className={`relative px-5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-[#00FF66]/15 text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.2)]'
                    : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00FF66] ring-2 ring-[#0E1217] animate-pulse" />
                ) : null}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors duration-150 ${
                  isActive ? 'text-[#00FF66] font-semibold' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
