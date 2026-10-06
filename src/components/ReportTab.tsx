import React, { useState } from 'react';
import { 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Flame, 
  Clock, 
  Dumbbell, 
  Footprints, 
  Plus, 
  Award,
  ChevronRight,
  Sparkles,
  BarChart2,
  Share2
} from 'lucide-react';
import { 
  WorkoutLog, 
  StepRecord, 
  PersonalRecord, 
  ThemeMode,
  UserMetrics 
} from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { triggerHaptic } from '../utils/audio';
import { ShareReportModal } from './ShareReportModal';

interface ReportTabProps {
  workoutLogs: WorkoutLog[];
  stepHistory: StepRecord[];
  personalRecords: PersonalRecord[];
  userMetrics: UserMetrics;
  themeMode: ThemeMode;
}

export const ReportTab: React.FC<ReportTabProps> = ({
  workoutLogs,
  stepHistory,
  personalRecords,
  userMetrics,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';

  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'time' | 'steps'>('volume');
  const [showAddPrModal, setShowAddPrModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // New PR form
  const [prExercise, setPrExercise] = useState('Barbell Bench Press');
  const [prWeight, setPrWeight] = useState(110);
  const [prReps, setPrReps] = useState(1);

  // Filtered dataset for chart
  const daysCount = timeRange === '7d' ? 7 : 30;
  const recentSteps = stepHistory.slice(0, daysCount).reverse();

  // Aggregate stats
  const totalVolume = workoutLogs.reduce((acc, w) => acc + w.volumeKg, 0);
  const totalDurationMins = workoutLogs.reduce((acc, w) => acc + Math.round(w.durationSeconds / 60), 0);
  const averageSteps = Math.round(
    recentSteps.reduce((acc, s) => acc + s.steps, 0) / (recentSteps.length || 1)
  );

  // Synthesize chart data points
  const chartPoints = recentSteps.map((step, idx) => {
    let value = 0;
    if (selectedMetric === 'steps') {
      value = step.steps;
    } else if (selectedMetric === 'volume') {
      // correlate or use workout logs
      const matched = workoutLogs[idx % workoutLogs.length];
      value = matched ? matched.volumeKg : Math.round(4000 + (step.steps * 0.3));
    } else {
      // time
      const matched = workoutLogs[idx % workoutLogs.length];
      value = matched ? Math.round(matched.durationSeconds / 60) : 45;
    }
    return {
      date: step.date.slice(5), // MM-DD
      value,
    };
  });

  const maxValue = Math.max(...chartPoints.map((p) => p.value), 1);

  // Generate 28-day consistency calendar heat-map (4 weeks x 7 days)
  const heatmapDays = Array.from({ length: 28 }).map((_, idx) => {
    // Determine activity level (0: None, 1: Low, 2: Active, 3: Completed Workout)
    const stepEntry = stepHistory[idx % stepHistory.length];
    const hasWorkout = idx % 2 === 0 || idx % 3 === 0;
    const intensity = hasWorkout ? (stepEntry && stepEntry.steps >= 10000 ? 3 : 2) : 1;
    return {
      day: idx + 1,
      intensity,
      hasWorkout,
      steps: stepEntry ? stepEntry.steps : 8000,
    };
  });

  const handleSavePr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prExercise.trim()) return;

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newPr: PersonalRecord = {
      id: `pr_${Date.now()}`,
      exerciseName: prExercise.trim(),
      weight: prWeight,
      reps: prReps,
      date: todayStr,
      isRecent: true,
    };

    StorageRepository.savePersonalRecord(newPr);
    triggerHaptic('success');
    setShowAddPrModal(false);
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Analytics & History
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Consistency heatmap, volume telemetry & Personal Records
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            setShowShareModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E676] text-black font-bold text-xs hover:bg-[#00c853] transition-all shadow-[0_0_12px_rgba(0,230,118,0.25)] active:scale-95"
          title="Share weekly performance report and PRs with friends"
        >
          <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Share Report</span>
        </button>
      </div>

      {/* 1. CONSISTENCY CALENDAR HEAT-MAP */}
      <div className={`p-4 rounded-3xl border shadow-lg space-y-3 ${
        isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00E676]" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Workout Consistency Heat-Map
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full">
            Past 4 Weeks
          </span>
        </div>

        {/* Day of week labels */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-slate-400 font-semibold uppercase">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {heatmapDays.map((cell, idx) => {
            let bgClass = isDark ? 'bg-slate-800/40 text-slate-600' : 'bg-slate-100 text-slate-400';

            if (cell.intensity === 1) {
              bgClass = isDark ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-emerald-100 text-emerald-800';
            } else if (cell.intensity === 2) {
              bgClass = isDark ? 'bg-[#00E676]/50 text-black font-bold' : 'bg-emerald-300 text-emerald-950 font-bold';
            } else if (cell.intensity === 3) {
              bgClass = 'bg-[#00E676] text-black font-extrabold shadow-[0_0_8px_rgba(0,230,118,0.4)]';
            }

            return (
              <div
                key={idx}
                className={`h-8 rounded-xl flex items-center justify-center text-[11px] font-mono transition-transform hover:scale-105 cursor-pointer ${bgClass}`}
                title={`Day ${cell.day}: ${cell.hasWorkout ? 'Workout completed' : 'Rest day'} · ${cell.steps} steps`}
              >
                {cell.day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
          <span>Less Active</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <span className="w-3 h-3 rounded bg-[#00E676]/25" />
            <span className="w-3 h-3 rounded bg-[#00E676]/60" />
            <span className="w-3 h-3 rounded bg-[#00E676]" />
          </div>
          <span>Goal Smashed</span>
        </div>
      </div>

      {/* 2. INTERACTIVE PROGRESS CHARTS */}
      <div className={`p-4 rounded-3xl border shadow-lg space-y-3 ${
        isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#00E676]" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Performance Metrics
            </h3>
          </div>

          {/* Time range toggle */}
          <div className={`flex items-center gap-1 p-0.5 rounded-xl border ${
            isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                timeRange === '7d' ? 'bg-[#00E676] text-black' : 'text-slate-400'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                timeRange === '30d' ? 'bg-[#00E676] text-black' : 'text-slate-400'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Metric Switcher Pills */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'volume', label: 'Weight Volume' },
            { id: 'time', label: 'Workout Time' },
            { id: 'steps', label: 'Step History' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                triggerHaptic('light');
                setSelectedMetric(m.id as typeof selectedMetric);
              }}
              className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                selectedMetric === m.id
                  ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                  : isDark
                    ? 'bg-[#141C26] border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* SVG Bar Chart Visualization */}
        <div className="pt-2">
          <div className="h-36 flex items-end gap-1.5 px-1 py-2">
            {chartPoints.map((point, idx) => {
              const heightPercent = Math.max(12, Math.round((point.value / maxValue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-black text-white text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-20">
                    {point.value.toLocaleString()} {selectedMetric === 'volume' ? 'kg' : selectedMetric === 'time' ? 'm' : ''}
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full bg-[#00E676] rounded-t-lg transition-all duration-300 group-hover:bg-[#00c853] opacity-85 group-hover:opacity-100"
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Date label */}
                  {timeRange === '7d' && (
                    <span className="text-[9px] text-slate-400 font-mono mt-1">
                      {point.date}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 font-mono text-slate-400">
            <span>Peak: {maxValue.toLocaleString()} {selectedMetric === 'volume' ? 'kg' : selectedMetric === 'time' ? 'm' : 'steps'}</span>
            <span className="text-[#00E676] font-bold">
              Avg: {Math.round(chartPoints.reduce((a, b) => a + b.value, 0) / chartPoints.length).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. PERSONAL RECORD (PR) BADGES */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Personal Records (PRs)
            </h3>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setShowAddPrModal(true);
            }}
            className="flex items-center gap-1 text-xs font-bold text-[#00E676] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log PR</span>
          </button>
        </div>

        {/* PR Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {personalRecords.map((pr) => (
            <div
              key={pr.id}
              className={`p-3.5 rounded-3xl border transition-all relative overflow-hidden ${
                isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
              }`}
            >
              {pr.isRecent && (
                <div className="absolute top-0 right-0 bg-[#00E676] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-xl shadow-sm">
                  New PR
                </div>
              )}

              <div className="w-7 h-7 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center mb-2">
                <Award className="w-4 h-4" />
              </div>

              <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {pr.exerciseName}
              </h4>

              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-lg font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {pr.weight}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'} × {pr.reps}r
                </span>
              </div>

              <span className="block text-[10px] text-slate-400 mt-1">
                Set on {pr.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Log PR Modal */}
      {showAddPrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePr}
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border space-y-3.5 ${
              isDark ? 'bg-[#121820] border-[#1E2938]' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between pb-2.5 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Log Personal Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPrModal(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Movement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barbell Bench Press"
                  value={prExercise}
                  onChange={(e) => setPrExercise(e.target.value)}
                  className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-[#00E676] ${
                    isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Weight ({userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'})</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={prWeight}
                    onChange={(e) => setPrWeight(parseFloat(e.target.value) || 0)}
                    className={`w-full rounded-xl p-2.5 border font-mono font-bold focus:outline-none focus:border-[#00E676] ${
                      isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={prReps}
                    onChange={(e) => setPrReps(parseInt(e.target.value, 10) || 1)}
                    className={`w-full rounded-xl p-2.5 border font-mono font-bold focus:outline-none focus:border-[#00E676] ${
                      isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00c853] transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] mt-2"
            >
              Record New PR
            </button>
          </form>
        </div>
      )}

      {/* Share Weekly Performance & PRs Modal */}
      <ShareReportModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        userMetrics={userMetrics}
        workoutLogs={workoutLogs}
        stepHistory={stepHistory}
        personalRecords={personalRecords}
        themeMode={themeMode}
      />
    </div>
  );
};
