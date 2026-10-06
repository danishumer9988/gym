import React, { useState } from 'react';
import { 
  Footprints, 
  Flame, 
  MapPin, 
  Play, 
  Clock, 
  Dumbbell, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Award,
  X,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  DailyLog, 
  Routine, 
  Exercise, 
  UserMetrics, 
  ThemeMode,
  StepRecord 
} from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { triggerHaptic } from '../utils/audio';
import { WorkoutStanceFigure } from './VisualAssets';

interface TrainingTabProps {
  dailyLog: DailyLog;
  routines: Routine[];
  exercises: Exercise[];
  userMetrics: UserMetrics;
  stepRecord: StepRecord;
  themeMode: ThemeMode;
  onStartRoutine: (routine: Routine) => void;
  onStartQuickWorkout: () => void;
}

export const TrainingTab: React.FC<TrainingTabProps> = ({
  dailyLog,
  routines,
  exercises,
  userMetrics,
  stepRecord,
  themeMode,
  onStartRoutine,
  onStartQuickWorkout,
}) => {
  const isDark = themeMode === 'dark';
  const [selectedRoutinePreview, setSelectedRoutinePreview] = useState<Routine | null>(null);

  // Step calculations
  const stepGoal = userMetrics.dailyStepGoal || 10000;
  const currentSteps = stepRecord.steps || dailyLog.steps || 7420;
  const stepPercent = Math.min(100, Math.round((currentSteps / stepGoal) * 100));
  const distanceKm = stepRecord.distanceKm || parseFloat((currentSteps * 0.00075).toFixed(2));
  const walkingCalories = stepRecord.caloriesBurned || Math.round(currentSteps * 0.04);

  // SVG Circular Step Ring Math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stepPercent / 100) * circumference;

  const handleSimulateSteps = (amount: number) => {
    triggerHaptic('light');
    StorageRepository.incrementSteps(amount);
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-8 space-y-4">
      {/* 1. STEP COUNTER HEADER CARD */}
      <div 
        className={`rounded-3xl p-5 border shadow-xl relative overflow-hidden transition-colors ${
          isDark 
            ? 'bg-[#10161F] border-[#1C2735]' 
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00E676]/15 flex items-center justify-center text-[#00E676]">
              <Footprints className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Daily Step Counter
              </h2>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Hardware Sensor · Target: {stepGoal.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSimulateSteps(500)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                isDark 
                  ? 'bg-[#16202C] hover:bg-[#1E2B3A] text-[#00E676] border-[#00E676]/30' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
              title="Simulate step sensor increment"
            >
              +500 Steps
            </button>
            <button
              onClick={() => handleSimulateSteps(1000)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                isDark 
                  ? 'bg-[#16202C] hover:bg-[#1E2B3A] text-[#00E676] border-[#00E676]/30' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
              title="Simulate step sensor increment"
            >
              +1k
            </button>
          </div>
        </div>

        {/* Central Display: Progress Ring + Stats */}
        <div className="flex items-center justify-between py-1">
          {/* Circular Progress Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={isDark ? '#1C2735' : '#E2E8F0'}
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#00E676"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* In-Ring Step Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black font-mono tracking-tight tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentSteps.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-[#00E676] mt-0.5">
                {stepPercent}% Goal
              </span>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex-1 pl-4 space-y-2.5">
            <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                <MapPin className="w-3 h-3 text-sky-400" />
                <span>Distance</span>
              </div>
              <p className={`text-sm font-extrabold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {distanceKm} <span className="text-xs font-normal text-slate-400">km</span>
              </p>
            </div>

            <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Walking Burn</span>
              </div>
              <p className={`text-sm font-extrabold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {walkingCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DAILY ROUTINE SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Quick-Start Workout Plans
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Designed for optimal progressive overload & conditioning
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              onStartQuickWorkout();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00E676] text-black font-bold text-xs hover:bg-[#00c853] transition-all shadow-[0_0_12px_rgba(0,230,118,0.25)] active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Freestyle</span>
          </button>
        </div>

        {/* Routine Cards */}
        <div className="space-y-2.5">
          {routines.map((routine) => {
            // Find representative stance
            const firstEx = exercises.find((e) => e.id === routine.exerciseIds[0]);
            const stance = firstEx?.stanceType || 'bench';

            return (
              <div
                key={routine.id}
                className={`p-4 rounded-3xl border transition-all shadow-md group ${
                  isDark
                    ? 'bg-[#10161F] border-[#1C2735] hover:border-[#28384C]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {/* Stance illustration vector */}
                    <div className="shrink-0">
                      <WorkoutStanceFigure stance={stance} size={44} />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider">
                        {routine.category.replace('_', ' ')}
                      </span>
                      <h4 className={`text-sm font-bold mt-0.5 group-hover:text-[#00E676] transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {routine.name}
                      </h4>
                      <p className={`text-xs line-clamp-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {routine.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
                  isDark ? 'border-slate-800/80' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{routine.estimatedDurationMins}m</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>~{routine.estimatedCalories} kcal</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{routine.exerciseIds.length} exs</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedRoutinePreview(routine);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        isDark
                          ? 'bg-[#151D28] text-slate-300 hover:text-white border-slate-800'
                          : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      Details
                    </button>

                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        onStartRoutine(routine);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00E676] text-black font-bold text-xs hover:bg-[#00c853] transition-all shadow-[0_0_12px_rgba(0,230,118,0.2)] active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Routine Detail Preview Sheet Modal */}
      {selectedRoutinePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border max-h-[85vh] flex flex-col ${
            isDark ? 'bg-[#121820] border-[#1E2938]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider">
                  Plan Details
                </span>
                <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedRoutinePreview.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoutinePreview(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 overflow-y-auto space-y-2 flex-1">
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {selectedRoutinePreview.description}
              </p>

              <div className="grid grid-cols-2 gap-2 my-2">
                <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-[#16202C] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 uppercase">Duration</span>
                  <p className={`font-mono font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedRoutinePreview.estimatedDurationMins} minutes
                  </p>
                </div>
                <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-[#16202C] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 uppercase">Estimated Burn</span>
                  <p className="font-mono font-bold text-sm text-[#00E676]">
                    {selectedRoutinePreview.estimatedCalories} kcal
                  </p>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
                Included Exercises ({selectedRoutinePreview.exerciseIds.length})
              </h4>

              <div className="space-y-1.5">
                {selectedRoutinePreview.exerciseIds.map((exId, idx) => {
                  const ex = exercises.find((e) => e.id === exId);
                  if (!ex) return null;
                  return (
                    <div
                      key={exId}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between ${
                        isDark ? 'bg-[#151D28] border-slate-800/80' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <WorkoutStanceFigure stance={ex.stanceType || 'bench'} size={32} />
                        <div>
                          <h5 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {idx + 1}. {ex.name}
                          </h5>
                          <span className="text-[10px] text-slate-400">
                            {ex.primaryMuscle} · {ex.equipment}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {ex.defaultSets} × {ex.defaultReps}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  const r = selectedRoutinePreview;
                  setSelectedRoutinePreview(null);
                  onStartRoutine(r);
                }}
                className="w-full py-3.5 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:bg-[#00c853] transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Workout Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
