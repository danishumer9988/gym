import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  RotateCcw, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Scale, 
  Target, 
  Activity,
  Database,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  UserMetrics, 
  FitnessGoal, 
  ActivityLevel, 
  UnitSystem 
} from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { calculateMacros } from '../utils/nutritionCalculator';
import { triggerHaptic } from '../utils/audio';

interface ProfileTabProps {
  userMetrics: UserMetrics;
  onUpdateMetrics: (updated: UserMetrics) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userMetrics,
  onUpdateMetrics,
}) => {
  const [formData, setFormData] = useState<UserMetrics>({ ...userMetrics });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleToggleDay = (day: string) => {
    triggerHaptic('light');
    const exists = formData.activeWorkoutDays.includes(day);
    const updatedDays = exists
      ? formData.activeWorkoutDays.filter((d) => d !== day)
      : [...formData.activeWorkoutDays, day];

    setFormData({ ...formData, activeWorkoutDays: updatedDays });
  };

  const handleGoalChange = (goal: FitnessGoal) => {
    triggerHaptic('light');
    // Also auto-recalculate recommended macros
    const newMacros = calculateMacros(
      formData.weightKg,
      formData.heightCm,
      formData.age,
      formData.gender,
      formData.activityLevel,
      goal
    );

    setFormData({
      ...formData,
      fitnessGoal: goal,
      targetCalories: newMacros.calories,
      targetProteinG: newMacros.proteinG,
      targetCarbsG: newMacros.carbsG,
      targetFatsG: newMacros.fatsG,
      targetWaterMl: newMacros.waterMl,
    });
  };

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    StorageRepository.saveUserMetrics(formData);
    onUpdateMetrics(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearAll = () => {
    triggerHaptic('heavy');
    StorageRepository.clearAllData();
    setShowClearConfirm(false);
    window.location.reload();
  };

  const handleResetDemo = () => {
    triggerHaptic('medium');
    StorageRepository.resetToDemo();
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-8 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Profile & Settings</h1>
        <p className="text-xs text-slate-400">User metrics, schedule & Room SQLite storage</p>
      </div>

      <form onSubmit={handleSaveMetrics} className="space-y-4">
        {/* User Card */}
        <div className="bg-[#10161F] border border-[#1C2735] rounded-3xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00FF66]/15 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-base font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-[#00FF66] focus:outline-none"
              />
              <p className="text-xs text-slate-400">Offline Room User Profile</p>
            </div>
          </div>

          {/* Unit Toggle & Gender */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Unit System</label>
              <div className="flex items-center gap-1 p-1 bg-[#141C26] rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, unitSystem: 'metric' })}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors ${
                    formData.unitSystem === 'metric'
                      ? 'bg-[#00FF66] text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, unitSystem: 'imperial' })}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors ${
                    formData.unitSystem === 'imperial'
                      ? 'bg-[#00FF66] text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Imperial (lbs/in)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })
                }
                className="w-full bg-[#141C26] border border-slate-800 rounded-xl p-2 text-white focus:outline-none focus:border-[#00FF66]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Current Weight</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={formData.weightKg}
                  onChange={(e) =>
                    setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-[#141C26] border border-slate-800 rounded-xl p-2 text-white font-mono font-bold focus:outline-none focus:border-[#00FF66]"
                />
                <span className="absolute right-2 top-2 text-[10px] text-slate-400">kg</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Height</label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={formData.heightCm}
                  onChange={(e) =>
                    setFormData({ ...formData, heightCm: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full bg-[#141C26] border border-slate-800 rounded-xl p-2 text-white font-mono font-bold focus:outline-none focus:border-[#00FF66]"
                />
                <span className="absolute right-2 top-2 text-[10px] text-slate-400">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target Weight</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={formData.targetWeightKg}
                  onChange={(e) =>
                    setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-[#141C26] border border-slate-800 rounded-xl p-2 text-white font-mono font-bold focus:outline-none focus:border-[#00FF66]"
                />
                <span className="absolute right-2 top-2 text-[10px] text-slate-400">kg</span>
              </div>
            </div>
          </div>

          {/* Fitness Goal Selector */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Fitness Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'weight_loss', label: 'Weight Loss' },
                { id: 'muscle_gain', label: 'Muscle Gain' },
                { id: 'maintenance', label: 'Maintenance' },
              ].map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => handleGoalChange(goal.id as FitnessGoal)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    formData.fitnessGoal === goal.id
                      ? 'bg-[#00FF66]/20 text-[#00FF66] border-[#00FF66]'
                      : 'bg-[#141C26] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level Selector */}
          <div className="text-xs">
            <label className="block text-slate-400 mb-1">Activity Level</label>
            <select
              value={formData.activityLevel}
              onChange={(e) =>
                setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })
              }
              className="w-full bg-[#141C26] border border-slate-800 rounded-xl p-2 text-white focus:outline-none focus:border-[#00FF66]"
            >
              <option value="sedentary">Sedentary (Desk job, little exercise)</option>
              <option value="light">Lightly Active (1-3 gym days/week)</option>
              <option value="moderate">Moderately Active (3-5 workouts/week)</option>
              <option value="very_active">Very Active (6-7 intense workouts/week)</option>
              <option value="extra_active">Extra Active (Athlete / Physical job)</option>
            </select>
          </div>
        </div>

        {/* WORKOUT SCHEDULE SETTINGS */}
        <div className="bg-[#10161F] border border-[#1C2735] rounded-3xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00FF66]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Weekly Workout Schedule
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            Select your regular training days to configure routine alerts and dashboard summaries:
          </p>

          {/* Day Chips */}
          <div className="flex items-center justify-between gap-1">
            {daysOfWeek.map((day) => {
              const isSelected = formData.activeWorkoutDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#00FF66] text-black border-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                      : 'bg-[#141C26] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {day.slice(0, 1)}
                </button>
              );
            })}
          </div>

          {/* Preferred Workout Time */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Preferred Daily Workout Time</span>
            </div>

            <input
              type="time"
              value={formData.preferredWorkoutTime}
              onChange={(e) => setFormData({ ...formData, preferredWorkoutTime: e.target.value })}
              className="bg-[#141C26] border border-slate-800 rounded-xl px-2.5 py-1 text-white font-mono focus:outline-none focus:border-[#00FF66]"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-[#00FF66] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00e65c] transition-all shadow-[0_0_20px_rgba(0,255,102,0.35)] flex items-center justify-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Settings Saved Successfully</span>
            </>
          ) : (
            <span>Save Profile & Schedule</span>
          )}
        </button>
      </form>

      {/* OFFLINE DATABASE / ROOM ARCHITECTURE SETTINGS */}
      <div className="bg-[#10161F] border border-[#1C2735] rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Room Local Database (Offline-First)
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-bold">
            SQLite Active
          </span>
        </div>

        <p className="text-xs text-slate-400">
          All your exercises, workouts, and macro logs are securely persisted locally on your device with zero cloud latency.
        </p>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleResetDemo}
            className="flex-1 py-2.5 rounded-xl bg-[#16202C] hover:bg-[#1E2B3B] text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex-1 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Database</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#121820] border border-rose-500/40 rounded-3xl p-5 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Clear All Local Data?</h3>
            <p className="text-xs text-slate-400">
              This will erase all workout logs, custom foods, and personalized metric profiles from local SQLite.
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
