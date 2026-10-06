import React, { useState } from 'react';
import { 
  Scale, 
  Activity, 
  Info, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ThemeMode } from '../types/fitness';
import { triggerHaptic } from '../utils/audio';

interface BmiCalculatorCardProps {
  weightKg: number;
  heightCm: number;
  targetWeightKg?: number;
  unitSystem?: 'metric' | 'imperial';
  themeMode: ThemeMode;
}

export const BmiCalculatorCard: React.FC<BmiCalculatorCardProps> = ({
  weightKg,
  heightCm,
  targetWeightKg,
  unitSystem = 'metric',
  themeMode,
}) => {
  const isDark = themeMode === 'dark';
  const [showTargetCompare, setShowTargetCompare] = useState(false);

  // Validate inputs
  const safeWeight = Math.max(20, isNaN(weightKg) ? 70 : weightKg);
  const safeHeight = Math.max(80, isNaN(heightCm) ? 175 : heightCm);
  const heightM = safeHeight / 100;

  // Current BMI
  const bmi = heightM > 0 ? parseFloat((safeWeight / (heightM * heightM)).toFixed(1)) : 0;

  // Target BMI
  const targetBmi = targetWeightKg && targetWeightKg > 0 && heightM > 0
    ? parseFloat((targetWeightKg / (heightM * heightM)).toFixed(1))
    : null;

  // WHO Ideal Weight Range for this height (BMI 18.5 to 24.9)
  const minHealthyWeight = heightM > 0 ? parseFloat((18.5 * heightM * heightM).toFixed(1)) : 0;
  const maxHealthyWeight = heightM > 0 ? parseFloat((24.9 * heightM * heightM).toFixed(1)) : 0;

  // Category determination
  let category = 'Normal Weight';
  let categoryColor = '#00E676';
  let badgeStyle = isDark ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let advice = 'You are within the optimal healthy weight range for your height. Focus on strength & performance!';

  if (bmi < 18.5) {
    category = 'Underweight';
    categoryColor = '#38BDF8';
    badgeStyle = isDark ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200';
    advice = 'Consider a caloric surplus with progressive resistance training to build lean muscle mass.';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    categoryColor = '#F59E0B';
    badgeStyle = isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
    advice = 'A moderate caloric deficit and consistent daily activity will help optimize body composition.';
  } else if (bmi >= 30) {
    category = 'Obesity Range';
    categoryColor = '#F43F5E';
    badgeStyle = isDark ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200';
    advice = 'Focus on sustainable nutrition habits, low-impact cardio intervals, and daily step volume.';
  }

  // Calculate needle position on a 15 to 35 BMI spectrum
  const minScale = 15;
  const maxScale = 35;
  const clampedBmi = Math.max(minScale, Math.min(maxScale, bmi));
  const needlePercentage = Math.round(((clampedBmi - minScale) / (maxScale - minScale)) * 100);

  return (
    <div className={`p-4 rounded-3xl border shadow-lg space-y-3.5 transition-colors ${
      isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#00E676]/15 text-[#00E676] flex items-center justify-center">
            <Scale className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Body Mass Index (BMI)
            </h3>
            <p className="text-[11px] text-slate-400">
              Synced with {safeHeight} cm / {safeWeight} kg
            </p>
          </div>
        </div>

        {/* Category Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeStyle}`}>
          {category}
        </div>
      </div>

      {/* Numerical Readout & Gauge Card */}
      <div className={`p-3.5 rounded-2xl border ${
        isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Current BMI Score</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-3xl font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {bmi}
              </span>
              <span className="text-xs font-bold font-mono" style={{ color: categoryColor }}>
                kg/m²
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Healthy Range</span>
            <p className={`text-xs font-mono font-bold mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {minHealthyWeight} – {maxHealthyWeight} kg
            </p>
          </div>
        </div>

        {/* Visual Multi-Segmented BMI Spectrum Bar */}
        <div className="relative pt-3 pb-1">
          {/* Segmented Gradient Bar */}
          <div className="h-3 w-full rounded-full overflow-hidden flex shadow-inner">
            <div className="h-full bg-sky-400" style={{ width: '17.5%' }} title="Underweight (< 18.5)" />
            <div className="h-full bg-[#00E676]" style={{ width: '32%' }} title="Normal (18.5 - 24.9)" />
            <div className="h-full bg-amber-400" style={{ width: '25%' }} title="Overweight (25 - 29.9)" />
            <div className="h-full bg-rose-500" style={{ width: '25.5%' }} title="Obese (≥ 30)" />
          </div>

          {/* Needle / Pointer Indicator */}
          <div 
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ease-out"
            style={{ left: `${needlePercentage}%` }}
          >
            <div 
              className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.5)]" 
              style={{ backgroundColor: categoryColor }}
            />
            <div className="w-0.5 h-3 bg-white shadow-sm" />
          </div>

          {/* Spectrum Scale Labels */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1.5 select-none">
            <span>15</span>
            <span className="text-sky-400">18.5</span>
            <span className="text-[#00E676]">25</span>
            <span className="text-amber-400">30</span>
            <span>35+</span>
          </div>
        </div>
      </div>

      {/* Target Weight Simulation / Comparison */}
      {targetBmi && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Target Weight: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{targetWeightKg} kg</strong></span>
          </div>

          <div className="flex items-center gap-1 font-mono font-bold">
            <span className="text-slate-400">Projected BMI:</span>
            <span className="text-[#00E676]">{targetBmi}</span>
          </div>
        </div>
      )}

      {/* Clinical Context Advice */}
      <div className={`p-2.5 rounded-2xl flex items-start gap-2 text-[11px] leading-relaxed border ${
        isDark ? 'bg-[#0E131A] border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <Info className="w-3.5 h-3.5 text-[#00E676] shrink-0 mt-0.5" />
        <p>{advice}</p>
      </div>
    </div>
  );
};
