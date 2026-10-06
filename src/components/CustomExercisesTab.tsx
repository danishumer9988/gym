import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Dumbbell, 
  Layers, 
  Filter, 
  X, 
  Sparkles, 
  BookOpen, 
  FileText,
  Tag
} from 'lucide-react';
import { Exercise, ExerciseCategory, ThemeMode } from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { triggerHaptic } from '../utils/audio';
import { WorkoutStanceFigure } from './VisualAssets';

interface CustomExercisesTabProps {
  exercises: Exercise[];
  themeMode: ThemeMode;
}

export const CustomExercisesTab: React.FC<CustomExercisesTabProps> = ({
  exercises,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ExerciseCategory>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('chest');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [equipment, setEquipment] = useState('Dumbbells');
  const [defaultSets, setDefaultSets] = useState(3);
  const [defaultReps, setDefaultReps] = useState(10);
  const [stanceType, setStanceType] = useState<'bench' | 'squat' | 'pull' | 'overhead' | 'plank' | 'run' | 'curl'>('bench');
  const [notes, setNotes] = useState('');

  const categories: { id: 'all' | ExerciseCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'legs', label: 'Legs' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'arms', label: 'Arms' },
    { id: 'core', label: 'Core' },
    { id: 'cardio', label: 'Cardio' },
  ];

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesSearch = 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newExercise: Exercise = {
      id: `ex_custom_${Date.now()}`,
      name: name.trim(),
      category,
      primaryMuscle: primaryMuscle.trim() || category.toUpperCase(),
      equipment: equipment.trim() || 'Free Weights',
      defaultSets: Math.max(1, defaultSets || 3),
      defaultReps: Math.max(1, defaultReps || 10),
      isCustom: true,
      stanceType,
      notes: notes.trim(),
    };

    StorageRepository.saveExercise(newExercise);
    triggerHaptic('success');
    setShowAddModal(false);

    // Reset form
    setName('');
    setPrimaryMuscle('');
    setNotes('');
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Exercise Library
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Categorized database & custom movement builder
          </p>
        </div>

        {/* Add Custom Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E676] text-black font-bold text-xs hover:bg-[#00c853] transition-all shadow-[0_0_12px_rgba(0,230,118,0.25)] active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Custom</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by exercise name, muscle, equipment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full rounded-2xl pl-10 pr-9 py-2.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#00E676] border ${
            isDark
              ? 'bg-[#10161F] border-[#1C2735] text-white placeholder-slate-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Muscle Group Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/50 shadow-[0_0_10px_rgba(0,230,118,0.15)] font-bold'
                  : isDark
                    ? 'bg-[#131923] text-slate-400 hover:text-white border-slate-800'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Exercise Count Readout */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {filteredExercises.length} movements</span>
        {selectedCategory !== 'all' && (
          <span className="capitalize font-semibold text-[#00E676]">{selectedCategory} Group</span>
        )}
      </div>

      {/* Exercise Library List */}
      <div className="space-y-2.5">
        {filteredExercises.length === 0 ? (
          <div className={`text-center py-12 rounded-3xl border border-dashed ${
            isDark ? 'bg-[#10161F] border-slate-800' : 'bg-slate-50 border-slate-300'
          }`}>
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No exercises found
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms or create a new custom exercise.
            </p>
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className={`p-3.5 rounded-3xl border transition-all flex items-start gap-3 shadow-sm ${
                isDark
                  ? 'bg-[#10161F] border-[#1C2735] hover:border-[#263547]'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Stance illustration vector thumbnail */}
              <div className="shrink-0 mt-0.5">
                <WorkoutStanceFigure stance={exercise.stanceType || 'bench'} size={46} />
              </div>

              {/* Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {exercise.name}
                  </h4>
                  {exercise.isCustom && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold">
                      Custom
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-0.5">
                  <span className="text-[#00E676] font-semibold">{exercise.primaryMuscle}</span> · {exercise.equipment}
                </p>

                {exercise.notes && (
                  <p className={`text-[10px] mt-1.5 italic line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    "{exercise.notes}"
                  </p>
                )}
              </div>

              {/* Default Sets x Reps Target */}
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {exercise.defaultSets} × {exercise.defaultReps}
                </span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">
                  Target
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE CUSTOM EXERCISE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateExercise}
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border space-y-3.5 max-h-[88vh] flex flex-col ${
              isDark ? 'bg-[#121820] border-[#1E2938]' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between pb-2.5 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00E676]" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Add Custom Exercise
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Exercise Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bulgarian Split Squat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-[#00E676] ${
                    isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Muscle Group</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-[#00E676] ${
                      isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="chest">Chest</option>
                    <option value="back">Back</option>
                    <option value="legs">Legs</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="arms">Arms</option>
                    <option value="core">Core</option>
                    <option value="cardio">Cardio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Primary Muscle</label>
                  <input
                    type="text"
                    placeholder="e.g. Quads / Glutes"
                    value={primaryMuscle}
                    onChange={(e) => setPrimaryMuscle(e.target.value)}
                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-[#00E676] ${
                      isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Equipment</label>
                  <input
                    type="text"
                    placeholder="e.g. Dumbbells, Barbell"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-[#00E676] ${
                      isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Illustration Stance</label>
                  <select
                    value={stanceType}
                    onChange={(e) => setStanceType(e.target.value as typeof stanceType)}
                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-[#00E676] ${
                      isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="bench">Bench Pressing</option>
                    <option value="squat">Squat / Hinge</option>
                    <option value="pull">Pull / Row</option>
                    <option value="overhead">Overhead Press</option>
                    <option value="curl">Bicep Curl</option>
                    <option value="plank">Plank / Core</option>
                    <option value="run">Running / Cardio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Default Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={defaultSets}
                    onChange={(e) => setDefaultSets(parseInt(e.target.value, 10))}
                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-[#00E676] ${
                      isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Default Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={defaultReps}
                    onChange={(e) => setDefaultReps(parseInt(e.target.value, 10))}
                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-[#00E676] ${
                      isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Execution Cue / Form Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Elevate rear foot, maintain upright torso..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-[#00E676] ${
                    isDark ? 'bg-[#0D1219] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00c853] transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] mt-2"
            >
              Save Exercise to Room DB
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
