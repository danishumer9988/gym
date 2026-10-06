import React from 'react';
import { 
  Flame, 
  Dumbbell, 
  Droplet, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ArrowRight, 
  Calendar,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import { DailyLog, UserMetrics } from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { triggerHaptic } from '../utils/audio';

interface DashboardTabProps {
  userMetrics: UserMetrics;
  dailyLog: DailyLog;
  onNavigateTab: (tab: 'dashboard' | 'workout' | 'nutrition' | 'profile') => void;
  onStartScheduledWorkout: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  userMetrics,
  dailyLog,
  onNavigateTab,
  onStartScheduledWorkout,
}) => {
  // Calculate Totals from logged foods
  const totalCalories = dailyLog.foods.reduce((acc, f) => acc + f.calories, 0);
  const totalProtein = dailyLog.foods.reduce((acc, f) => acc + f.proteinG, 0);
  const totalCarbs = dailyLog.foods.reduce((acc, f) => acc + f.carbsG, 0);
  const totalFats = dailyLog.foods.reduce((acc, f) => acc + f.fatsG, 0);

  const calorieTarget = userMetrics.targetCalories;
  const calPercent = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));
  const proteinPercent = Math.min(100, Math.round((totalProtein / userMetrics.targetProteinG) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / userMetrics.targetCarbsG) * 100));
  const fatsPercent = Math.min(100, Math.round((totalFats / userMetrics.targetFatsG) * 100));

  // Water calculations
  const waterTarget = userMetrics.targetWaterMl;
  const waterPercent = Math.min(100, Math.round((dailyLog.waterIntakeMl / waterTarget) * 100));

  const handleWaterAdd = (amount: number) => {
    triggerHaptic('light');
    StorageRepository.updateWaterIntake(amount, dailyLog.date);
  };

  // Date formatting
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const getGreeting = () => {
    const hr = today.getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getGoalDisplay = (goal: string) => {
    switch (goal) {
      case 'muscle_gain':
        return 'Muscle Gain';
      case 'weight_loss':
        return 'Weight Loss';
      default:
        return 'Maintenance';
    }
  };

  // SVG Concentric Macro Ring Math
  const center = 100;
  // Outer ring: Calories (Radius 82)
  const rCal = 82;
  const circCal = 2 * Math.PI * rCal;
  const offsetCal = circCal - (calPercent / 100) * circCal;

  // Middle ring: Protein (Radius 66)
  const rProtein = 66;
  const circProtein = 2 * Math.PI * rProtein;
  const offsetProtein = circProtein - (proteinPercent / 100) * circProtein;

  // Inner ring: Carbs (Radius 50)
  const rCarbs = 50;
  const circCarbs = 2 * Math.PI * rCarbs;
  const offsetCarbs = circCarbs - (carbsPercent / 100) * circCarbs;

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-8 space-y-5">
      {/* 1. TOP BAR */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>{dateFormatted}</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
            {getGreeting()}, <span className="text-[#00FF66]">{userMetrics.name}</span>
          </h1>
        </div>

        {/* Goal Badge (Clickable to switch to profile) */}
        <button
          onClick={() => onNavigateTab('profile')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141C24] border border-[#00FF66]/30 text-xs font-semibold text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.15)] hover:border-[#00FF66] transition-all"
        >
          <TrendingUp className="w-3 h-3" />
          <span>{getGoalDisplay(userMetrics.fitnessGoal)}</span>
        </button>
      </div>

      {/* 2. MACRO & CALORIE RING CARD */}
      <div className="bg-[#10161F] border border-[#1C2735] rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#00FF66]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00FF66]/15 flex items-center justify-center text-[#00FF66]">
              <Flame className="w-4 h-4 fill-[#00FF66]/20" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Today's Nutrition</h2>
              <p className="text-[11px] text-slate-400">Target vs Consumed</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('nutrition')}
            className="text-[11px] font-semibold text-[#00FF66] hover:underline flex items-center gap-1"
          >
            <span>Log Food</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Circular Concentric Rings & Center Stats */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
              {/* Outer Ring: Calories Track */}
              <circle
                cx={center}
                cy={center}
                r={rCal}
                stroke="#1B2533"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx={center}
                cy={center}
                r={rCal}
                stroke="#00FF66"
                strokeWidth="10"
                strokeDasharray={circCal}
                strokeDashoffset={offsetCal}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />

              {/* Middle Ring: Protein Track */}
              <circle
                cx={center}
                cy={center}
                r={rProtein}
                stroke="#1B2533"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx={center}
                cy={center}
                r={rProtein}
                stroke="#38BDF8" // Cyan Sky for Protein
                strokeWidth="8"
                strokeDasharray={circProtein}
                strokeDashoffset={offsetProtein}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />

              {/* Inner Ring: Carbs Track */}
              <circle
                cx={center}
                cy={center}
                r={rCarbs}
                stroke="#1B2533"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx={center}
                cy={center}
                r={rCarbs}
                stroke="#F59E0B" // Amber for Carbs
                strokeWidth="8"
                strokeDasharray={circCarbs}
                strokeDashoffset={offsetCarbs}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Concentric Rings Center Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Consumed
              </span>
              <span className="text-3xl font-black text-white font-mono tracking-tight tabular-nums">
                {totalCalories}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <span>/ {calorieTarget} kcal</span>
              </div>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-[#00FF66]/15 text-[#00FF66] text-[10px] font-bold">
                {calPercent}% Met
              </div>
            </div>
          </div>
        </div>

        {/* Macro Pill breakdown cards */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80">
          {/* Protein */}
          <div className="bg-[#141C26] rounded-2xl p-2.5 flex flex-col border border-sky-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Protein</span>
              <span className="text-[10px] text-slate-400 font-mono">{proteinPercent}%</span>
            </div>
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {totalProtein}<span className="text-[10px] text-slate-400 font-normal"> / {userMetrics.targetProteinG}g</span>
            </span>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-[#141C26] rounded-2xl p-2.5 flex flex-col border border-amber-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Carbs</span>
              <span className="text-[10px] text-slate-400 font-mono">{carbsPercent}%</span>
            </div>
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {totalCarbs}<span className="text-[10px] text-slate-400 font-normal"> / {userMetrics.targetCarbsG}g</span>
            </span>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="bg-[#141C26] rounded-2xl p-2.5 flex flex-col border border-rose-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Fats</span>
              <span className="text-[10px] text-slate-400 font-mono">{fatsPercent}%</span>
            </div>
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {totalFats}<span className="text-[10px] text-slate-400 font-normal"> / {userMetrics.targetFatsG}g</span>
            </span>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${fatsPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. TODAY'S SUMMARY CARDS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Today's Fitness & Hydration
        </h3>

        {/* WORKOUT STATUS CARD */}
        <div className="bg-[#10161F] border border-[#1C2735] hover:border-[#27374A] rounded-3xl p-4 shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                dailyLog.isWorkoutCompletedToday 
                  ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40' 
                  : 'bg-[#18212D] text-slate-200 border border-slate-700/60'
              }`}>
                {dailyLog.isWorkoutCompletedToday ? (
                  <CheckCircle2 className="w-6 h-6 text-[#00FF66]" />
                ) : (
                  <Dumbbell className="w-6 h-6 text-[#00FF66]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">
                    {dailyLog.scheduledWorkoutTitle || 'Leg Day Blast'}
                  </h4>
                  {dailyLog.isWorkoutCompletedToday ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00FF66]/15 text-[#00FF66] font-bold">
                      Completed
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{userMetrics.preferredWorkoutTime || '18:00'}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-0.5">
                  {dailyLog.isWorkoutCompletedToday 
                    ? `Great job! ${dailyLog.accumulatedWorkoutMinutes} mins logged today.`
                    : 'Target: 5 exercises · Estimated 50 mins'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#00FF66]" />
              <span className="font-mono font-bold text-white">{dailyLog.accumulatedWorkoutMinutes}m</span>
              <span className="text-slate-400">active today</span>
            </div>

            <button
              onClick={() => {
                triggerHaptic('medium');
                onStartScheduledWorkout();
              }}
              className="px-4 py-2 rounded-xl bg-[#00FF66] text-black font-bold text-xs hover:bg-[#00e65c] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.25)] active:scale-95"
            >
              <span>{dailyLog.isWorkoutCompletedToday ? 'Log Another Workout' : 'Start Workout'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* WATER INTAKE COUNTER CARD */}
        <div className="bg-[#10161F] border border-[#1C2735] rounded-3xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Droplet className="w-5 h-5 fill-cyan-400/20" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Water Intake</h4>
                <p className="text-[11px] text-slate-400">
                  Daily target: {waterTarget} ml
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base font-extrabold text-cyan-400 font-mono tabular-nums">
                {dailyLog.waterIntakeMl}
              </span>
              <span className="text-xs text-slate-400"> / {waterTarget} ml</span>
            </div>
          </div>

          {/* Visual Bottle Bar */}
          <div className="relative w-full h-4 bg-[#141C26] rounded-full overflow-hidden border border-cyan-900/40 my-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500 relative"
              style={{ width: `${waterPercent}%` }}
            >
              {/* Animated wave effect line */}
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          {/* Quick-add buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-semibold text-slate-400">
              {waterPercent}% of target reached
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWaterAdd(-250)}
                disabled={dailyLog.waterIntakeMl <= 0}
                className="p-1.5 rounded-lg bg-[#161F2A] hover:bg-[#1E2938] text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-800"
                title="Subtract 250ml"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleWaterAdd(250)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+250 ml</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
