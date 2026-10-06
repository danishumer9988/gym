import React from 'react';
import { Dumbbell, BookOpen, BarChart3, User } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';
import { ThemeMode, MainTabType } from '../types/fitness';

export type { MainTabType };

interface BottomNavBarProps {
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  activeWorkoutCount?: number;
  themeMode?: ThemeMode;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  activeWorkoutCount = 0,
  themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';

  const tabs: { id: MainTabType; label: string; icon: typeof Dumbbell; badge?: number }[] = [
    { id: 'training', label: 'Training', icon: Dumbbell, badge: activeWorkoutCount },
    { id: 'exercises', label: 'Exercises', icon: BookOpen },
    { id: 'report', label: 'Report', icon: BarChart3 },
    { id: 'me', label: 'Me', icon: User },
  ];

  return (
    <nav 
      aria-label="Bottom Navigation"
      className={`shrink-0 border-t px-3 pt-2 pb-3 transition-colors duration-200 ${
        isDark
          ? 'bg-[#0E131A]/95 backdrop-blur-md border-[#1E2938]'
          : 'bg-white/95 backdrop-blur-md border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]'
      }`}
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
              className="flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-150 group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E676]"
            >
              {/* Material 3 Active Pill Container */}
              <div
                className={`relative px-5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-[#00E676]/15 text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.25)]'
                    : isDark
                      ? 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/40'
                      : 'text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00E676] ring-2 ring-[#0E131A] animate-pulse" />
                ) : null}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors duration-150 ${
                  isActive 
                    ? 'text-[#00E676] font-bold' 
                    : isDark 
                      ? 'text-slate-400 group-hover:text-slate-300' 
                      : 'text-slate-500 group-hover:text-slate-700'
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
