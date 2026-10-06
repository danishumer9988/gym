import React, { useState } from 'react';
import { 
  Play, 
  Dumbbell, 
  Clock, 
  Plus, 
  Search, 
  Layers, 
  ChevronRight, 
  Flame, 
  Award, 
  Check,
  Filter
} from 'lucide-react';
import { 
  Routine, 
  Exercise, 
  RoutineCategory, 
  ExerciseCategory, 
  WorkoutLog,
  UserMetrics 
} from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { triggerHaptic } from '../utils/audio';

interface WorkoutTabProps {
  routines: Routine[];
  exercises: Exercise[];
  recentWorkoutLogs: WorkoutLog[];
  userMetrics: UserMetrics;
  onStartRoutine: (routine: Routine) => void;
  onStartQuickWorkout: () => void;
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  routines,
  exercises,
  recentWorkoutLogs,
  userMetrics,
  onStartRoutine,
  onStartQuickWorkout,
}) => {
  // Tabs: 'routines' | 'exercises' | 'history'
  const [activeSection, setActiveSection] = useState<'routines' | 'exercises' | 'history'>('routines');
  
  // Routine filters
  const [routineCategoryFilter, setRoutineCategoryFilter] = useState<'all' | RoutineCategory>('all');

  // Exercise filters & search
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState<'all' | ExerciseCategory>('all');
  const [exerciseSearch, setExerciseSearch] = useState('');
  
  // Add Custom Exercise modal
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<ExerciseCategory>('chest');
  const [customMuscle, setCustomMuscle] = useState('');
  const [customEquipment, setCustomEquipment] = useState('Dumbbells');
  const [customSets, setCustomSets] = useState(3);
  const [customReps, setCustomReps] = useState(10);

  const filteredRoutines = routines.filter((r) => {
    if (routineCategoryFilter === 'all') return true;
    return r.category === routineCategoryFilter;
  });

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory = exerciseCategoryFilter === 'all' || ex.category === exerciseCategoryFilter;
    const matchesSearch = 
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(exerciseSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newEx: Exercise = {
      id: `ex_custom_${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      primaryMuscle: customMuscle.trim() || customCategory.toUpperCase(),
      equipment: customEquipment.trim() || 'Free Weights',
      defaultSets: customSets || 3,
      defaultReps: customReps || 10,
      isCustom: true,
    };

    StorageRepository.saveExercise(newEx);
    triggerHaptic('success');
    setShowAddCustomModal(false);
    setCustomName('');
    setCustomMuscle('');
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-8 space-y-4">
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Workouts</h1>
          <p className="text-xs text-slate-400">Routines, library & active tracker</p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('medium');
            onStartQuickWorkout();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#00FF66] text-black font-bold text-xs shadow-[0_0_15px_rgba(0,255,102,0.25)] hover:bg-[#00e65c] active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Quick Start</span>
        </button>
      </div>

      {/* Main Section Navigation Switcher */}
      <div className="flex items-center gap-1 p-1 bg-[#10161F] border border-[#1C2735] rounded-2xl">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSection('routines');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'routines'
              ? 'bg-[#182330] text-[#00FF66] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Routines ({routines.length})
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSection('exercises');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'exercises'
              ? 'bg-[#182330] text-[#00FF66] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Exercises ({exercises.length})
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSection('history');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'history'
              ? 'bg-[#182330] text-[#00FF66] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          History ({recentWorkoutLogs.length})
        </button>
      </div>

      {/* ---------------- SECTION 1: ROUTINES ---------------- */}
      {activeSection === 'routines' && (
        <div className="space-y-3">
          {/* Routine Categories Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'push', label: 'Push' },
              { id: 'pull', label: 'Pull' },
              { id: 'legs', label: 'Legs' },
              { id: 'upper', label: 'Upper Body' },
              { id: 'cardio', label: 'Cardio' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic('light');
                  setRoutineCategoryFilter(cat.id as 'all' | RoutineCategory);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  routineCategoryFilter === cat.id
                    ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/50 shadow-[0_0_10px_rgba(0,255,102,0.15)]'
                    : 'bg-[#131923] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Routine Cards Grid */}
          <div className="space-y-3">
            {filteredRoutines.map((routine) => (
              <div
                key={routine.id}
                className="bg-[#10161F] border border-[#1C2735] hover:border-[#28384C] rounded-3xl p-4 shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#00FF66] uppercase tracking-wider">
                      {routine.category} ROUTINE
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-0.5 group-hover:text-[#00FF66] transition-colors">
                      {routine.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {routine.description}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-[#16202C] flex items-center justify-center text-slate-300 group-hover:bg-[#00FF66]/20 group-hover:text-[#00FF66] transition-colors shrink-0">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{routine.estimatedDurationMins} mins</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{routine.exerciseIds.length} exercises</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      onStartRoutine(routine);
                    }}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#00FF66] text-black font-bold text-xs hover:bg-[#00e65c] transition-all shadow-[0_0_12px_rgba(0,255,102,0.2)] active:scale-95"
                  >
                    <span>Start</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- SECTION 2: EXERCISES ---------------- */}
      {activeSection === 'exercises' && (
        <div className="space-y-3">
          {/* Search bar & Add Custom button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search exercises or muscle..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="w-full bg-[#10161F] border border-[#1C2735] rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]"
              />
            </div>

            <button
              onClick={() => setShowAddCustomModal(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-[#141C26] hover:bg-[#1E2938] border border-slate-700 text-slate-200 text-xs font-semibold whitespace-nowrap transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Add Custom</span>
            </button>
          </div>

          {/* Muscle Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'chest', label: 'Chest' },
              { id: 'back', label: 'Back' },
              { id: 'shoulders', label: 'Shoulders' },
              { id: 'biceps', label: 'Biceps' },
              { id: 'triceps', label: 'Triceps' },
              { id: 'legs', label: 'Legs' },
              { id: 'core', label: 'Core' },
              { id: 'cardio', label: 'Cardio' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic('light');
                  setExerciseCategoryFilter(cat.id as 'all' | ExerciseCategory);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  exerciseCategoryFilter === cat.id
                    ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/50'
                    : 'bg-[#131923] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Exercise Items List */}
          <div className="space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No exercises matched your query.
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-[#10161F] border border-[#1C2735] rounded-2xl p-3 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#16202C] text-[#00FF66] flex items-center justify-center font-bold text-xs uppercase">
                      {ex.category.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {ex.primaryMuscle} · {ex.equipment}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-slate-400">
                    <span>{ex.defaultSets} × {ex.defaultReps} reps</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- SECTION 3: WORKOUT HISTORY ---------------- */}
      {activeSection === 'history' && (
        <div className="space-y-3">
          {recentWorkoutLogs.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[#10161F] rounded-3xl border border-dashed border-slate-800">
              <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h3 className="font-bold text-white text-sm">No workouts logged yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Complete a workout to view total volume, duration, and calories burned!
              </p>
            </div>
          ) : (
            recentWorkoutLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#10161F] border border-[#1C2735] rounded-3xl p-4 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {log.date}
                    </span>
                    <h3 className="text-sm font-bold text-white">{log.routineName}</h3>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#00FF66]/15 text-[#00FF66] flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">Duration</span>
                    <p className="font-mono font-bold text-white">
                      {Math.round(log.durationSeconds / 60)} mins
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Volume</span>
                    <p className="font-mono font-bold text-white">
                      {log.volumeKg} {userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Calories</span>
                    <p className="font-mono font-bold text-white text-[#00FF66]">
                      {log.caloriesBurned} kcal
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Custom Exercise Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomExercise}
            className="w-full max-w-sm bg-[#121820] border border-[#1E2938] rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Create Custom Exercise</h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bulgarian Split Squat"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF66]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Muscle Group</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as ExerciseCategory)}
                    className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF66]"
                  >
                    <option value="chest">Chest</option>
                    <option value="back">Back</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="biceps">Biceps</option>
                    <option value="triceps">Triceps</option>
                    <option value="legs">Legs</option>
                    <option value="core">Core</option>
                    <option value="cardio">Cardio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Primary Muscle</label>
                  <input
                    type="text"
                    placeholder="e.g. Quads / Glutes"
                    value={customMuscle}
                    onChange={(e) => setCustomMuscle(e.target.value)}
                    className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF66]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Default Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={customSets}
                    onChange={(e) => setCustomSets(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF66]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Default Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customReps}
                    onChange={(e) => setCustomReps(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF66]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#00FF66] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#00e65c] transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]"
            >
              Save Exercise
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
