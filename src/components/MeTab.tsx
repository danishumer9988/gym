import React, { useState } from 'react';
import { 
  User, 
  Sun, 
  Moon, 
  Footprints, 
  Calendar, 
  FileDown, 
  RotateCcw, 
  Trash2, 
  Check, 
  Database,
  Sparkles,
  Scale,
  Award,
  ShieldCheck
} from 'lucide-react';
import { UserMetrics, ThemeMode, FitnessGoal } from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { triggerHaptic } from '../utils/audio';
import { ProfileAvatarVector } from './VisualAssets';
import { BmiCalculatorCard } from './BmiCalculatorCard';

interface MeTabProps {
  userMetrics: UserMetrics;
  themeMode: ThemeMode;
  onToggleTheme: (mode: ThemeMode) => void;
  onUpdateMetrics: (updated: UserMetrics) => void;
  onOpenRoomInspector?: () => void;
  onOpenNativeAndroidModal?: () => void;
}

export const MeTab: React.FC<MeTabProps> = ({
  userMetrics,
  themeMode,
  onToggleTheme,
  onUpdateMetrics,
}) => {
  const isDark = themeMode === 'dark';

  const [formData, setFormData] = useState<UserMetrics>({ ...userMetrics });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    StorageRepository.saveUserMetrics(formData);
    onUpdateMetrics(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleStepGoalChange = (goal: number) => {
    triggerHaptic('light');
    setFormData({ ...formData, dailyStepGoal: goal });
  };

  const handleWeeklyTargetChange = (target: number) => {
    triggerHaptic('light');
    setFormData({ ...formData, weeklyWorkoutTarget: target });
  };

  const handleExportData = () => {
    triggerHaptic('medium');
    StorageRepository.exportDatabaseAsPdf();
  };

  const handleResetDemo = () => {
    triggerHaptic('medium');
    StorageRepository.resetToDemo();
    window.location.reload();
  };

  const handleClearAll = () => {
    triggerHaptic('heavy');
    StorageRepository.clearAllData();
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-2 sm:px-4 pt-1 pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Me & Settings
        </h1>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Personal profile, theme system & offline data
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* 1. USER PROFILE CARD WITH ILLUSTRATED AVATAR */}
        <div className={`p-4 rounded-3xl border shadow-lg space-y-4 ${
          isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3.5">
            {/* Illustrated avatar vector */}
            <div className="shrink-0">
              <ProfileAvatarVector size={64} />
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`text-base font-extrabold bg-transparent border-b border-transparent hover:border-slate-600 focus:border-[#00E676] focus:outline-none w-full ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
                placeholder="Athlete Name"
              />
              <p className="text-xs text-slate-400 mt-0.5">
                {formData.age} yrs · {formData.gender.toUpperCase()} · Goal: {formData.fitnessGoal.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className={`grid grid-cols-3 gap-2 pt-3 border-t text-xs ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Weight</span>
              <div className="relative mt-1">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                  className={`w-full bg-transparent font-mono font-bold text-sm focus:outline-none ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                />
                <span className="absolute right-0 top-0 text-[10px] text-slate-400">kg</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Height</span>
              <div className="relative mt-1">
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: parseInt(e.target.value, 10) || 0 })}
                  className={`w-full bg-transparent font-mono font-bold text-sm focus:outline-none ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                />
                <span className="absolute right-0 top-0 text-[10px] text-slate-400">cm</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Target</span>
              <div className="relative mt-1">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={formData.targetWeightKg}
                  onChange={(e) => setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) || 0 })}
                  className={`w-full bg-transparent font-mono font-bold text-sm focus:outline-none ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                />
                <span className="absolute right-0 top-0 text-[10px] text-slate-400">kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AUTOMATIC BMI CALCULATOR TOOL */}
        <BmiCalculatorCard
          weightKg={formData.weightKg}
          heightCm={formData.heightCm}
          targetWeightKg={formData.targetWeightKg}
          unitSystem={formData.unitSystem}
          themeMode={themeMode}
        />

        {/* 3. DYNAMIC THEME TOGGLE SWITCH */}
        <div className={`p-4 rounded-3xl border shadow-lg flex items-center justify-between ${
          isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/15 text-[#00E676] flex items-center justify-center">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Theme Mode
              </h3>
              <p className="text-xs text-slate-400">
                {isDark ? 'Pitch-black Dark Mode (#0A0D12)' : 'High-contrast Clean Light Mode'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onToggleTheme(isDark ? 'light' : 'dark');
            }}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              isDark
                ? 'bg-[#182330] text-[#00E676] border border-[#00E676]/30 hover:bg-[#1E2B3C]'
                : 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
            }`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
          </button>
        </div>

        {/* 3. GOAL SETTINGS: STEP GOAL & WORKOUT TARGET */}
        <div className={`p-4 rounded-3xl border shadow-lg space-y-3.5 ${
          isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
        }`}>
          {/* Step Goal Setter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-[#00E676]" />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Daily Step Goal
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#00E676]">
                {formData.dailyStepGoal.toLocaleString()} steps/day
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[8000, 10000, 12000, 15000].map((steps) => (
                <button
                  key={steps}
                  type="button"
                  onClick={() => handleStepGoalChange(steps)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    formData.dailyStepGoal === steps
                      ? 'bg-[#00E676] text-black border-[#00E676] shadow-[0_0_10px_rgba(0,230,118,0.3)]'
                      : isDark
                        ? 'bg-[#141C26] text-slate-400 border-slate-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {(steps / 1000)}k
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Workout Target Manager */}
          <div className={`pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#00E676]" />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Weekly Workout Target
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#00E676]">
                {formData.weeklyWorkoutTarget} days / week
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[3, 4, 5, 6].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleWeeklyTargetChange(days)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    formData.weeklyWorkoutTarget === days
                      ? 'bg-[#00E676] text-black border-[#00E676] shadow-[0_0_10px_rgba(0,230,118,0.3)]'
                      : isDark
                        ? 'bg-[#141C26] text-slate-400 border-slate-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00c853] transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] flex items-center justify-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Saved to Room Database</span>
            </>
          ) : (
            <span>Save Profile & Goals</span>
          )}
        </button>
      </form>

      {/* 4. PERFORMANCE REPORT & PDF EXPORT */}
      <div className={`p-4 rounded-3xl border shadow-lg space-y-3 ${
        isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileDown className="w-4 h-4 text-[#00E676]" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Performance Report & PDF Exporter
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] font-bold border border-[#00E676]/30">
            A4 Certified PDF
          </span>
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Generate and download a comprehensive, professional athletic performance report including athlete profile, compound PRs, recent workout history, and 30-day cardio telemetry.
        </p>

        <button
          type="button"
          onClick={handleExportData}
          className="w-full py-3 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:bg-[#00c853] transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <FileDown className="w-4 h-4 stroke-[2.5]" />
          <span>Export Performance PDF Report</span>
        </button>
      </div>

      {/* 5. LOCAL DATA MANAGEMENT & BACKUP */}
      <div className={`p-4 rounded-3xl border shadow-lg space-y-3 ${
        isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Local Storage & Database Management
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Offline-Ready</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportData}
            className={`py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              isDark 
                ? 'bg-[#141C26] hover:bg-[#1E2938] text-slate-200 border-slate-800' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <FileDown className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Export to PDF</span>
          </button>

          <button
            type="button"
            onClick={handleResetDemo}
            className={`py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              isDark 
                ? 'bg-[#141C26] hover:bg-[#1E2938] text-slate-200 border-slate-800' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Reset Demo</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="w-full py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors mt-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Local Data</span>
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-xs rounded-3xl p-5 shadow-2xl border text-center space-y-3 ${
            isDark ? 'bg-[#121820] border-rose-500/40' : 'bg-white border-rose-300'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Erase Local Database?
            </h3>
            <p className="text-xs text-slate-400">
              This resets all custom exercises, step logs, personal records, and workouts from Room storage.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
