import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Calendar, 
  Sparkles, 
  Check, 
  Target, 
  X,
  Activity
} from 'lucide-react';
import { ThemeMode, UserMetrics, WeightLogEntry } from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { triggerHaptic } from '../utils/audio';

interface WeightFluctuationChartProps {
  userMetrics: UserMetrics;
  themeMode: ThemeMode;
}

export const WeightFluctuationChart: React.FC<WeightFluctuationChartProps> = ({
  userMetrics,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [showLogModal, setShowLogModal] = useState(false);
  const [inputWeight, setInputWeight] = useState<number | ''>(userMetrics.weightKg || 75);
  const [inputNotes, setInputNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const unit = userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs';
  const targetWeight = userMetrics.targetWeightKg || 72;

  // Raw weight history from userMetrics
  const rawHistory = useMemo(() => {
    const list = userMetrics.weightHistory || [];
    // Sort chronologically ascending for the line chart
    return [...list].sort((a, b) => a.date.localeCompare(b.date));
  }, [userMetrics.weightHistory]);

  // Filter based on selected time range
  const filteredData = useMemo(() => {
    if (rawHistory.length === 0) return [];

    let sliceDays = 30;
    if (timeRange === '7d') sliceDays = 7;
    else if (timeRange === '30d') sliceDays = 30;
    else sliceDays = rawHistory.length;

    const sliced = rawHistory.slice(-sliceDays);

    return sliced.map((entry) => {
      // Format date for XAxis (e.g. "Oct 02" or "MM/DD")
      const parts = entry.date.split('-');
      let dateLabel = entry.date;
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      // Convert if imperial
      const displayWeight = userMetrics.unitSystem === 'metric' 
        ? entry.weightKg 
        : parseFloat((entry.weightKg * 2.20462).toFixed(1));

      return {
        date: entry.date,
        dateLabel,
        weight: displayWeight,
        notes: entry.notes,
      };
    });
  }, [rawHistory, timeRange, userMetrics.unitSystem]);

  // Calculations for summary pills
  const currentEntry = filteredData[filteredData.length - 1];
  const startEntry = filteredData[0];

  const currentWeight = currentEntry ? currentEntry.weight : userMetrics.weightKg;
  const startWeight = startEntry ? startEntry.weight : currentWeight;
  const weightChange = parseFloat((currentWeight - startWeight).toFixed(1));

  const allWeights = filteredData.map((d) => d.weight);
  const minWeight = allWeights.length > 0 ? Math.min(...allWeights) : currentWeight;
  const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : currentWeight;

  // Y-Axis domain bounds with comfortable padding
  const yMin = Math.floor(Math.min(minWeight, targetWeight) - 2);
  const yMax = Math.ceil(Math.max(maxWeight, targetWeight) + 2);

  const handleSaveWeighIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputWeight === '' || isNaN(Number(inputWeight))) return;

    triggerHaptic('success');
    const today = new Date().toISOString().split('T')[0];
    
    // Convert to kg if user is in imperial
    const weightInKg = userMetrics.unitSystem === 'metric'
      ? Number(inputWeight)
      : parseFloat((Number(inputWeight) / 2.20462).toFixed(2));

    StorageRepository.addWeightLogEntry(weightInKg, inputNotes.trim() || undefined, today);

    setShowLogModal(false);
    setInputNotes('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const diffTarget = parseFloat((dataPoint.weight - targetWeight).toFixed(1));

      return (
        <div className={`p-3 rounded-2xl shadow-2xl border text-xs ${
          isDark 
            ? 'bg-[#0E131A]/95 border-slate-700 text-white backdrop-blur-md' 
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-md backdrop-blur-md'
        }`}>
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-700/60 mb-1.5">
            <span className="font-bold text-slate-400">{dataPoint.dateLabel}</span>
            <span className="text-[10px] font-mono text-slate-400">{dataPoint.date}</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black font-mono text-[#00E676] tabular-nums">
              {dataPoint.weight} {unit}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ({diffTarget > 0 ? `+${diffTarget}` : diffTarget} {unit} from target)
            </span>
          </div>

          {dataPoint.notes && (
            <p className="text-[10px] text-slate-400 mt-1 italic">
              "{dataPoint.notes}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-colors ${
      isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
    }`}>
      {/* Top Ambient Glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#00E676]/15 flex items-center justify-center text-[#00E676] shrink-0">
            <Scale className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Weight Trend & Fluctuations
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] font-bold border border-[#00E676]/30">
                Recharts Live
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Historical weigh-in curve tracked against target goal
            </p>
          </div>
        </div>

        {/* Action Zone: Filter tabs + Log Weigh-in button */}
        <div className="flex items-center gap-2">
          {/* Timeframe Segmented Control */}
          <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
            isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {(['7d', '30d', 'all'] as const).map((range) => {
              const isActive = timeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => {
                    triggerHaptic('light');
                    setTimeRange(range);
                  }}
                  className={`px-2.5 py-1 rounded-lg uppercase text-[11px] font-bold transition-all ${
                    isActive
                      ? 'bg-[#00E676] text-black shadow-sm'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>

          {/* Quick Log Weigh-in Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setInputWeight(userMetrics.weightKg || 75);
              setShowLogModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00c853] transition-all shadow-[0_0_12px_rgba(0,230,118,0.25)] active:scale-95"
            title="Log new weigh-in"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Log Weigh-In</span>
          </button>
        </div>
      </div>

      {/* 2. STATS SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
        {/* Current Weight */}
        <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#141C26] border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            Current Weight
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-lg font-black font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentWeight}
            </span>
            <span className="text-xs font-semibold text-slate-400">{unit}</span>
          </div>
        </div>

        {/* Target Weight */}
        <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#141C26] border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block">
            Target Goal
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-lg font-black font-mono tabular-nums text-sky-400`}>
              {targetWeight}
            </span>
            <span className="text-xs font-semibold text-slate-400">{unit}</span>
          </div>
        </div>

        {/* Net Change */}
        <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#141C26] border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            {timeRange === '7d' ? '7-Day' : timeRange === '30d' ? '30-Day' : 'Overall'} Change
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {weightChange < 0 ? (
              <TrendingDown className="w-4 h-4 text-[#00E676]" />
            ) : weightChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-amber-400" />
            ) : null}
            <span className={`text-lg font-black font-mono tabular-nums ${
              weightChange <= 0 ? 'text-[#00E676]' : 'text-amber-400'
            }`}>
              {weightChange > 0 ? `+${weightChange}` : weightChange} {unit}
            </span>
          </div>
        </div>

        {/* Fluctuation Band */}
        <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#141C26] border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
            Range (Min / Max)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5 text-xs font-mono font-bold text-slate-300">
            <span className="text-[#00E676]">{minWeight}</span>
            <span>–</span>
            <span className="text-slate-400">{maxWeight}</span>
            <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
          </div>
        </div>
      </div>

      {/* 3. RECHARTS LINE CHART VIEWPORT */}
      <div className="w-full h-64 sm:h-72 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 12, right: 16, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="weightLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00E676" />
                <stop offset="100%" stopColor="#00b0ff" />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#1C2735' : '#E2E8F0'} 
              vertical={false} 
            />

            <XAxis 
              dataKey="dateLabel" 
              stroke={isDark ? '#64748B' : '#94A3B8'} 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: isDark ? '#1C2735' : '#CBD5E1' }}
            />

            <YAxis 
              domain={[yMin, yMax]} 
              stroke={isDark ? '#64748B' : '#94A3B8'} 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: isDark ? '#1C2735' : '#CBD5E1' }}
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Target Weight Goal Reference Line */}
            <ReferenceLine 
              y={targetWeight} 
              stroke="#38BDF8" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ 
                value: `Goal: ${targetWeight} ${unit}`, 
                position: 'top', 
                fill: '#38BDF8', 
                fontSize: 10,
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }} 
            />

            {/* The Weight Line */}
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="url(#weightLineGradient)" 
              strokeWidth={3} 
              dot={{ r: 3.5, fill: '#00E676', stroke: isDark ? '#10161F' : '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#00E676', stroke: '#FFFFFF', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 4. FOOTER NOTE */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 mt-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#00E676]" />
          <span>Fasted morning weigh-ins provide the highest data consistency.</span>
        </div>
        <span className="font-mono text-slate-400">
          {filteredData.length} entries tracked
        </span>
      </div>

      {/* 5. MODAL: LOG NEW WEIGH-IN */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border ${
            isDark ? 'bg-[#0F141C] border-[#1C2735] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#00E676]/15 text-[#00E676] flex items-center justify-center">
                  <Scale className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-extrabold text-sm">Log Weigh-In</h3>
              </div>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWeighIn} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Recorded Weight ({unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="30"
                  max="350"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className={`w-full rounded-xl px-3 py-2.5 text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#00E676] border ${
                    isDark ? 'bg-[#141C26] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  placeholder="e.g. 75.8"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Optional Note / Context
                </label>
                <input
                  type="text"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="e.g. Morning fasted, post-workout, carb refeed"
                  className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00E676] border ${
                    isDark ? 'bg-[#141C26] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:bg-[#00c853] transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Weigh-In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessToast && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 py-1.5 px-3 rounded-xl bg-[#00E676] text-black text-xs font-bold shadow-lg animate-fade-in pointer-events-none z-30">
          Weigh-in recorded successfully!
        </div>
      )}
    </div>
  );
};
