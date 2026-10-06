import React from 'react';
import { 
  Droplet, 
  Plus, 
  Minus, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles,
  CupSoda,
  GlassWater
} from 'lucide-react';
import { DailyLog, ThemeMode, UserMetrics } from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { triggerHaptic } from '../utils/audio';

interface WaterIntakeWidgetProps {
  dailyLog: DailyLog;
  userMetrics: UserMetrics;
  themeMode: ThemeMode;
}

const CUP_SIZE_ML = 250; // Standard 250ml glass / cup

export const WaterIntakeWidget: React.FC<WaterIntakeWidgetProps> = ({
  dailyLog,
  userMetrics,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';

  const currentWaterMl = dailyLog.waterIntakeMl || 0;
  const targetWaterMl = userMetrics.targetWaterMl || 3000;

  const currentCups = parseFloat((currentWaterMl / CUP_SIZE_ML).toFixed(1));
  const targetCups = Math.round(targetWaterMl / CUP_SIZE_ML);
  const remainingMl = Math.max(0, targetWaterMl - currentWaterMl);
  const remainingCups = Math.max(0, Math.ceil(remainingMl / CUP_SIZE_ML));

  const percent = Math.min(100, Math.round((currentWaterMl / (targetWaterMl || 1)) * 100));
  const isGoalReached = currentWaterMl >= targetWaterMl;

  const handleAddCups = (cups: number) => {
    triggerHaptic('light');
    const deltaMl = cups * CUP_SIZE_ML;
    StorageRepository.updateWaterIntake(deltaMl);
  };

  const handleReset = () => {
    triggerHaptic('medium');
    const deltaMl = -currentWaterMl;
    StorageRepository.updateWaterIntake(deltaMl);
  };

  // Generate visual cup grid (up to target cups, max 12 displayed directly)
  const displayCupsCount = Math.min(12, targetCups);
  const filledCupsCount = Math.floor(currentWaterMl / CUP_SIZE_ML);

  return (
    <div 
      className={`rounded-3xl p-5 border shadow-xl relative overflow-hidden transition-colors ${
        isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
      }`}
    >
      {/* Ambient Radial Cyan Glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
            <Droplet className="w-4 h-4 fill-cyan-400/25 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Daily Water Intake
              </h3>
              {isGoalReached ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Goal Met</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30">
                  {percent}% Reached
                </span>
              )}
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Optimal cellular hydration & metabolic performance
            </p>
          </div>
        </div>

        {/* Readout */}
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-black font-mono tracking-tight tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {currentWaterMl.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400 font-mono">
            / {targetWaterMl.toLocaleString()} ml
          </span>
          <span className="text-xs font-bold text-cyan-400 font-mono ml-1">
            ({currentCups} / {targetCups} cups)
          </span>
        </div>
      </div>

      {/* 2. PROGRESS WAVE BAR */}
      <div className="py-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span>{percent}% of daily hydration target</span>
          <span className="font-mono text-cyan-400">
            {remainingMl > 0 ? `${remainingMl.toLocaleString()} ml (${remainingCups} cups) remaining` : 'Optimal daily hydration achieved!'}
          </span>
        </div>

        {/* Animated Fill Bar */}
        <div className={`relative w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-[#141C26]' : 'bg-slate-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.4)] relative"
            style={{ width: `${percent}%` }}
          >
            {/* Shimmer light sweep */}
            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. VISUAL CUP MATRIX */}
      <div className="py-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
          <span className="uppercase tracking-wider text-[10px]">Cup Tracker (250 ml each)</span>
          <span>{filledCupsCount} of {targetCups} cups consumed</span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {Array.from({ length: displayCupsCount }).map((_, idx) => {
            const isFilled = idx < filledCupsCount;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddCups(isFilled ? -1 : 1)}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all group ${
                  isFilled
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                    : isDark
                      ? 'bg-[#141C26] text-slate-600 border-slate-800 hover:border-slate-700 hover:text-slate-400'
                      : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
                title={`Cup ${idx + 1} (250ml) - Click to toggle`}
              >
                <Droplet className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                  isFilled ? 'fill-cyan-400' : 'fill-transparent'
                }`} />
                <span className="text-[9px] font-mono mt-0.5">#{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. QUICK ADD CUPS ACTION CONTROLS */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* -1 Cup */}
          <button
            type="button"
            onClick={() => handleAddCups(-1)}
            disabled={currentWaterMl <= 0}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none active:scale-95 ${
              isDark 
                ? 'bg-[#141C26] hover:bg-[#1E2938] text-slate-300 border-slate-800' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Subtract 1 cup (250ml)"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>-1 Cup</span>
          </button>

          {/* +1 Cup (250ml) */}
          <button
            type="button"
            onClick={() => handleAddCups(1)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 text-xs font-bold transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] active:scale-95 flex items-center gap-1.5"
            title="Add 1 cup of water (250ml)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+1 Cup (250 ml)</span>
          </button>

          {/* +2 Cups (500ml - Shaker bottle) */}
          <button
            type="button"
            onClick={() => handleAddCups(2)}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95 flex items-center gap-1.5"
            title="Add 2 cups of water (500ml shaker bottle)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+2 Cups (Bottle 500 ml)</span>
          </button>

          {/* +3 Cups (750ml - Large flask) */}
          <button
            type="button"
            onClick={() => handleAddCups(3)}
            className={`hidden md:flex px-3 py-2 rounded-xl border text-xs font-bold transition-all items-center gap-1 active:scale-95 ${
              isDark 
                ? 'bg-[#141C26] hover:bg-[#1E2938] text-slate-300 border-slate-800' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Add 3 cups of water (750ml flask)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+3 Cups (750 ml)</span>
          </button>
        </div>

        {/* Reset Button */}
        {currentWaterMl > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className={`p-2 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-[#141C26] text-slate-400 hover:text-white border-slate-800' 
                : 'bg-slate-100 text-slate-600 hover:text-black border-slate-200'
            }`}
            title="Reset water intake to 0 ml"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
