import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  Dumbbell, 
  Flame, 
  Award, 
  ChevronDown,
  Volume2,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  ActiveWorkoutSession, 
  ActiveWorkoutExercise, 
  WorkoutSet, 
  Exercise, 
  WorkoutLog, 
  UserMetrics 
} from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { sound, triggerHaptic } from '../utils/audio';
import { RestTimerModal } from './RestTimerModal';

interface ActiveWorkoutOverlayProps {
  session: ActiveWorkoutSession;
  allExercises: Exercise[];
  userMetrics: UserMetrics;
  onUpdateSession: (updated: ActiveWorkoutSession) => void;
  onFinishWorkout: (log: WorkoutLog) => void;
  onCancelWorkout: () => void;
}

export const ActiveWorkoutOverlay: React.FC<ActiveWorkoutOverlayProps> = ({
  session,
  allExercises,
  userMetrics,
  onUpdateSession,
  onFinishWorkout,
  onCancelWorkout,
}) => {
  // Elapsed time state
  const [elapsed, setElapsed] = useState(session.elapsedSeconds);
  const [restTimerOpen, setRestTimerOpen] = useState(false);
  const [restTimerDuration, setRestTimerDuration] = useState(60);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<WorkoutLog | null>(null);

  // Stopwatch ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        // Keep session updated every 5 seconds
        if (next % 5 === 0) {
          onUpdateSession({ ...session, elapsedSeconds: next });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, onUpdateSession]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toggle Set Complete
  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...session.exercises];
    const targetSet = updatedExercises[exerciseIndex].sets[setIndex];
    const nextCompleted = !targetSet.isCompleted;
    targetSet.isCompleted = nextCompleted;

    if (nextCompleted) {
      sound.playSetChecked();
      triggerHaptic('success');
      // Automatically launch Rest Timer
      setRestTimerDuration(60);
      setRestTimerOpen(true);
    } else {
      triggerHaptic('light');
    }

    onUpdateSession({
      ...session,
      elapsedSeconds: elapsed,
      exercises: updatedExercises,
    });
  };

  // Modify Set Value
  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    val: number
  ) => {
    const safeVal = Math.max(0, isNaN(val) ? 0 : val);
    const updatedExercises = [...session.exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = safeVal;

    onUpdateSession({
      ...session,
      elapsedSeconds: elapsed,
      exercises: updatedExercises,
    });
  };

  // Add Set to Exercise
  const handleAddSet = (exerciseIndex: number) => {
    triggerHaptic('light');
    const updatedExercises = [...session.exercises];
    const currentSets = updatedExercises[exerciseIndex].sets;
    const lastSet = currentSets[currentSets.length - 1];

    const newSet: WorkoutSet = {
      id: `set_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      setNumber: currentSets.length + 1,
      weight: lastSet ? lastSet.weight : 40,
      reps: lastSet ? lastSet.reps : 10,
      isCompleted: false,
    };

    updatedExercises[exerciseIndex].sets.push(newSet);
    onUpdateSession({ ...session, elapsedSeconds: elapsed, exercises: updatedExercises });
  };

  // Delete Set
  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    triggerHaptic('light');
    const updatedExercises = [...session.exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    // Renumber sets
    updatedExercises[exerciseIndex].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    onUpdateSession({ ...session, elapsedSeconds: elapsed, exercises: updatedExercises });
  };

  // Add new exercise to session
  const handleAddExerciseToSession = (ex: Exercise) => {
    triggerHaptic('medium');
    const newActiveExercise: ActiveWorkoutExercise = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      sets: Array.from({ length: ex.defaultSets || 3 }).map((_, idx) => ({
        id: `set_${Date.now()}_${idx}`,
        setNumber: idx + 1,
        weight: 40,
        reps: ex.defaultReps || 10,
        isCompleted: false,
      })),
    };

    const updated = [...session.exercises, newActiveExercise];
    onUpdateSession({ ...session, elapsedSeconds: elapsed, exercises: updated });
    setShowAddExerciseModal(false);
  };

  // Remove whole exercise
  const handleRemoveExercise = (exerciseIndex: number) => {
    triggerHaptic('medium');
    const updated = [...session.exercises];
    updated.splice(exerciseIndex, 1);
    onUpdateSession({ ...session, elapsedSeconds: elapsed, exercises: updated });
  };

  // Calculate workout metrics and trigger finish dialog
  const handlePreFinish = () => {
    triggerHaptic('heavy');
    let totalVolume = 0;
    let completedSetsCount = 0;
    let exercisesCompletedCount = 0;

    session.exercises.forEach((ex) => {
      let exHadCompleted = false;
      ex.sets.forEach((s) => {
        if (s.isCompleted) {
          totalVolume += s.weight * s.reps;
          completedSetsCount++;
          exHadCompleted = true;
        }
      });
      if (exHadCompleted) exercisesCompletedCount++;
    });

    // Estimate calorie burn based on duration and volume (approx 6.5 - 8.5 kcal/min)
    const minutes = Math.max(1, Math.round(elapsed / 60));
    const baseCal = minutes * 7;
    const volumeBonus = Math.round(totalVolume * 0.015);
    const caloriesBurned = Math.round(baseCal + volumeBonus);

    const log: WorkoutLog = {
      id: `wl_${Date.now()}`,
      routineName: session.routineName,
      date: 'Today',
      durationSeconds: elapsed,
      volumeKg: Math.round(totalVolume),
      caloriesBurned,
      exercisesCompleted: exercisesCompletedCount || session.exercises.length,
    };

    setSummaryData(log);
    setShowSummaryModal(true);
  };

  const handleConfirmFinish = () => {
    if (summaryData) {
      sound.playTimerFinishedChime();
      triggerHaptic('success');
      onFinishWorkout(summaryData);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0B0E13] flex flex-col overflow-hidden text-slate-100">
      {/* Sticky Header with Elapsed Stopwatch */}
      <div className="shrink-0 bg-[#0E131A] border-b border-[#1E2938] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00FF66]/20 border border-[#00FF66]/40 flex items-center justify-center text-[#00FF66]">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight leading-tight truncate max-w-[160px]">
              {session.routineName}
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">Active Session</span>
          </div>
        </div>

        {/* Stopwatch & Rest Timer trigger */}
        <div className="flex items-center gap-2">
          {/* Rest Timer manual trigger */}
          <button
            onClick={() => setRestTimerOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#16202C] hover:bg-[#1E2B3B] text-slate-300 hover:text-[#00FF66] border border-slate-700/60 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
            title="Open Rest Timer"
          >
            <Clock className="w-3 h-3 text-[#00FF66]" />
            <span>Rest</span>
          </button>

          {/* Stopwatch badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141C24] border border-[#00FF66]/30 text-[#00FF66] font-mono text-xs font-bold shadow-[0_0_12px_rgba(0,255,102,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
            <span>{formatTimer(elapsed)}</span>
          </div>

          {/* Cancel Workout button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to discard this workout?')) {
                onCancelWorkout();
              }
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Cancel Workout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Exercise Log Sheet */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {session.exercises.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#10161F] rounded-3xl border border-dashed border-slate-800">
            <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm">No exercises added yet</h3>
            <p className="text-xs text-slate-400 mt-1">Tap below to add an exercise from your library.</p>
          </div>
        ) : (
          session.exercises.map((exercise, exIndex) => (
            <div
              key={exercise.exerciseId + '_' + exIndex}
              className="bg-[#10161F] border border-[#1C2735] rounded-3xl p-4 shadow-md space-y-3"
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#18222E] flex items-center justify-center text-[#00FF66] text-xs font-bold">
                    {exIndex + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{exercise.exerciseName}</h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {exercise.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveExercise(exIndex)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Remove exercise"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Set Table Headers */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <span className="col-span-2 text-center">Set</span>
                <span className="col-span-4 text-center">Weight ({userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'})</span>
                <span className="col-span-3 text-center">Reps</span>
                <span className="col-span-3 text-center">Done</span>
              </div>

              {/* Sets Rows */}
              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl transition-all ${
                      set.isCompleted
                        ? 'bg-[#00FF66]/10 border border-[#00FF66]/30'
                        : 'bg-[#151D28] border border-slate-800/60'
                    }`}
                  >
                    {/* Set Number */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="font-mono text-xs font-bold text-slate-300">
                        #{set.setNumber}
                      </span>
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-4 flex items-center justify-center">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) =>
                          handleSetChange(exIndex, setIndex, 'weight', parseFloat(e.target.value))
                        }
                        className="w-full text-center bg-[#0C1017] border border-slate-700 rounded-xl py-1 px-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-3 flex items-center justify-center">
                      <input
                        type="number"
                        min="0"
                        value={set.reps}
                        onChange={(e) =>
                          handleSetChange(exIndex, setIndex, 'reps', parseInt(e.target.value, 10))
                        }
                        className="w-full text-center bg-[#0C1017] border border-slate-700 rounded-xl py-1 px-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>

                    {/* Complete Checkbox & Delete */}
                    <div className="col-span-3 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleToggleSet(exIndex, setIndex)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                          set.isCompleted
                            ? 'bg-[#00FF66] text-black shadow-[0_0_10px_rgba(0,255,102,0.4)]'
                            : 'bg-[#1E2734] text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {exercise.sets.length > 1 && (
                        <button
                          onClick={() => handleDeleteSet(exIndex, setIndex)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => handleAddSet(exIndex)}
                className="w-full py-2 rounded-xl bg-[#141C26] hover:bg-[#1B2533] text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3 text-[#00FF66]" />
                <span>Add Set</span>
              </button>
            </div>
          ))
        )}

        {/* Add Exercise Button */}
        <button
          onClick={() => setShowAddExerciseModal(true)}
          className="w-full py-3.5 rounded-2xl bg-[#141C26] hover:bg-[#1C2735] border border-dashed border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4 text-[#00FF66]" />
          <span>Add Exercise to Session</span>
        </button>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="shrink-0 bg-[#0E131A] border-t border-[#1E2938] p-4 flex items-center gap-3">
        <button
          onClick={handlePreFinish}
          className="flex-1 py-3.5 rounded-2xl bg-[#00FF66] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.35)] hover:bg-[#00e65c] active:scale-[0.98] transition-all"
        >
          <Award className="w-4 h-4 stroke-[2.5]" />
          <span>Finish Workout</span>
        </button>
      </div>

      {/* Rest Timer Modal */}
      <RestTimerModal
        isOpen={restTimerOpen}
        initialSeconds={restTimerDuration}
        onClose={() => setRestTimerOpen(false)}
      />

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121820] border border-[#1E2938] rounded-3xl p-5 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Add Exercise</h3>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-2 space-y-1.5 flex-1">
              {allExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAddExerciseToSession(ex)}
                  className="w-full text-left p-3 rounded-2xl bg-[#161D26] hover:bg-[#1E2836] border border-slate-800/80 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#00FF66]">
                      {ex.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {ex.category} · {ex.primaryMuscle}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-[#00FF66]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Finish Workout Summary Dialog */}
      {showSummaryModal && summaryData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#10161F] border border-[#1C2735] rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
            {/* Glow background */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00FF66]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-[#00FF66]/15 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66] mx-auto mb-3 shadow-[0_0_20px_rgba(0,255,102,0.25)]">
              <Award className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-white tracking-tight">Workout Completed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Awesome work! Your session has been calculated and ready to sync to Room DB.
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 my-5 text-left">
              <div className="bg-[#151D28] rounded-2xl p-3 border border-slate-800">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                  <Clock className="w-3 h-3 text-[#00FF66]" />
                  <span>Duration</span>
                </div>
                <div className="text-base font-extrabold text-white font-mono mt-1">
                  {Math.round(summaryData.durationSeconds / 60)}m
                </div>
              </div>

              <div className="bg-[#151D28] rounded-2xl p-3 border border-slate-800">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                  <Dumbbell className="w-3 h-3 text-sky-400" />
                  <span>Volume</span>
                </div>
                <div className="text-base font-extrabold text-white font-mono mt-1">
                  {summaryData.volumeKg} <span className="text-[10px] text-slate-400">{userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                </div>
              </div>

              <div className="bg-[#151D28] rounded-2xl p-3 border border-slate-800">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Burned</span>
                </div>
                <div className="text-base font-extrabold text-white font-mono mt-1">
                  {summaryData.caloriesBurned} <span className="text-[10px] text-slate-400">kcal</span>
                </div>
              </div>
            </div>

            {/* Confirmation actions */}
            <div className="space-y-2">
              <button
                onClick={handleConfirmFinish}
                className="w-full py-3.5 rounded-2xl bg-[#00FF66] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,102,0.35)] hover:bg-[#00e65c] transition-all"
              >
                Save Workout & Record
              </button>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="w-full py-2.5 rounded-2xl bg-transparent text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back to Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
