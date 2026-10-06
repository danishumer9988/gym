import React from 'react';
import { 
  Sun, 
  Moon, 
  FileDown, 
  RotateCcw, 
  Dumbbell, 
  BookOpen, 
  BarChart3, 
  User, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ThemeMode, MainTabType } from '../types/fitness';
import { FitnessAppLogo } from './VisualAssets';
import { triggerHaptic } from '../utils/audio';

interface WebLayoutProps {
  children: React.ReactNode;
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  themeMode: ThemeMode;
  onToggleTheme: (mode: ThemeMode) => void;
  onExportPdf: () => void;
  onResetDemo: () => void;
}

export const WebLayout: React.FC<WebLayoutProps> = ({
  children,
  activeTab,
  onSelectTab,
  themeMode,
  onToggleTheme,
  onExportPdf,
  onResetDemo,
}) => {
  const isDark = themeMode === 'dark';

  const navLinks: { id: MainTabType; label: string; icon: typeof Dumbbell }[] = [
    { id: 'training', label: 'Training', icon: Dumbbell },
    { id: 'exercises', label: 'Exercises', icon: BookOpen },
    { id: 'report', label: 'Analytics', icon: BarChart3 },
    { id: 'me', label: 'Profile', icon: User },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 selection:bg-[#00E676] selection:text-black ${
      isDark ? 'bg-[#0A0D12] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* 1. TOP BAR (Strict 3-Zone Web Navigation Bar) */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
        isDark 
          ? 'bg-[#0E131A]/90 border-[#1C2735]' 
          : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Brand Title & Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSelectTab('training')}
              className="flex items-center gap-2.5 focus:outline-none group"
            >
              <FitnessAppLogo size={32} />
              <div className="flex items-baseline gap-1.5">
                <span className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  PulseFit
                </span>
                <span className="text-[10px] font-extrabold tracking-widest text-[#00E676] uppercase">
                  PRO
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#00E676]/15 text-[#00E676] font-bold shadow-sm'
                      : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Theme Switcher & Export PDF Report) */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onToggleTheme(isDark ? 'light' : 'dark');
              }}
              className={`p-2 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-[#151D28] text-amber-400 border-slate-800 hover:bg-[#1E2938]'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onResetDemo();
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                isDark
                  ? 'bg-[#151D28] text-slate-300 border-slate-800 hover:text-white hover:bg-[#1E2938]'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Reset Demo Dataset"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Reset</span>
            </button>

            {/* Primary Action: Export PDF Report */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                onExportPdf();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.25)] hover:bg-[#00c853] transition-all active:scale-95 whitespace-nowrap"
            >
              <FileDown className="w-4 h-4 stroke-[2.5]" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WEBSITE CONTENT CONTAINER (Spacious 1440px Grid Baseline) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* 3. MOBILE RESPONSIVE BOTTOM NAVIGATION (Hidden on Desktop) */}
      <div className={`md:hidden sticky bottom-0 z-40 border-t backdrop-blur-md px-3 py-2 transition-colors ${
        isDark ? 'bg-[#0E131A]/95 border-[#1C2735]' : 'bg-white/95 border-slate-200 shadow-md'
      }`}>
        <div className="grid grid-cols-4 gap-1">
          {navLinks.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectTab(tab.id);
                }}
                className="flex flex-col items-center justify-center py-1 rounded-2xl transition-all"
              >
                <div className={`px-4 py-1 rounded-full transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-[#00E676]/15 text-[#00E676]'
                    : isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                </div>
                <span className={`text-[11px] font-medium mt-0.5 ${
                  isActive ? 'text-[#00E676] font-bold' : isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. WEBSITE FOOTER */}
      <footer className={`border-t py-6 transition-colors ${
        isDark ? 'bg-[#080B0F] border-[#1C2735] text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676]" />
            <span className="font-semibold text-slate-300">PulseFit Web Platform</span>
            <span>·</span>
            <span>All-in-One Fitness & Gym Tracker</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Offline-Ready Local Storage</span>
            <span>·</span>
            <span>PDF Performance Exporter</span>
            <span>·</span>
            <span>© {new Date().getFullYear()} PulseFit</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
