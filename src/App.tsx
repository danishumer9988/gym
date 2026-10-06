/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MainTabType, 
  BottomNavBar 
} from './components/BottomNavBar';
import { AndroidFrame } from './components/AndroidFrame';
import { TrainingTab } from './components/TrainingTab';
import { CustomExercisesTab } from './components/CustomExercisesTab';
import { ReportTab } from './components/ReportTab';
import { MeTab } from './components/MeTab';
import { ActiveWorkoutOverlay } from './components/ActiveWorkoutOverlay';
import { 
  UserMetrics, 
  DailyLog, 
  Exercise, 
  Routine, 
  WorkoutLog, 
  ThemeMode,
  StepRecord,
  PersonalRecord,
  ActiveWorkoutSession,
  ActiveWorkoutExercise 
} from './types/fitness';
import { 
  StorageRepository, 
  subscribeToDatabase 
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('training');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => StorageRepository.getThemeMode());
  const [showRoomInspector, setShowRoomInspector] = useState(false);
  
  // Database States
  const [userMetrics, setUserMetrics] = useState<UserMetrics>(() => StorageRepository.getUserMetrics());
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => StorageRepository.getDailyLog());
  const [exercises, setExercises] = useState<Exercise[]>(() => StorageRepository.getExercises());
  const [routines, setRoutines] = useState<Routine[]>(() => StorageRepository.getRoutines());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => StorageRepository.getWorkoutLogs());
  const [stepHistory, setStepHistory] = useState<StepRecord[]>(() => StorageRepository.getStepHistory());
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => StorageRepository.getPersonalRecords());

  // Active Workout Session State
  const [activeSession, setActiveSession] = useState<ActiveWorkoutSession | null>(null);

  // Sync with Room storage updates
  useEffect(() => {
    const unsubscribe = subscribeToDatabase(() => {
      setUserMetrics(StorageRepository.getUserMetrics());
      setDailyLog(StorageRepository.getDailyLog());
      setExercises(StorageRepository.getExercises());
      setRoutines(StorageRepository.getRoutines());
      setWorkoutLogs(StorageRepository.getWorkoutLogs());
      setStepHistory(StorageRepository.getStepHistory());
      setPersonalRecords(StorageRepository.getPersonalRecords());
      setThemeMode(StorageRepository.getThemeMode());
    });
    return () => unsubscribe();
  }, []);

  const handleToggleTheme = (mode: ThemeMode) => {
    StorageRepository.setThemeMode(mode);
    setThemeMode(mode);
  };

  // Handler: Start a specific routine
  const handleStartRoutine = (routine: Routine) => {
    const routineExercises: ActiveWorkoutExercise[] = routine.exerciseIds
      .map((exId) => {
        const found = exercises.find((e) => e.id === exId);
        if (!found) return null;
        return {
          exerciseId: found.id,
          exerciseName: found.name,
          category: found.category,
          sets: Array.from({ length: found.defaultSets || 3 }).map((_, idx) => ({
            id: `set_${Date.now()}_${idx}`,
            setNumber: idx + 1,
            weight: 45,
            reps: found.defaultReps || 10,
            isCompleted: false,
          })),
        };
      })
      .filter(Boolean) as ActiveWorkoutExercise[];

    setActiveSession({
      id: `session_${Date.now()}`,
      routineName: routine.name,
      startTime: Date.now(),
      elapsedSeconds: 0,
      exercises: routineExercises,
      isFinished: false,
    });
  };

  // Handler: Start Quick Workout
  const handleStartQuickWorkout = () => {
    const starterExs = exercises.slice(0, 3);
    const activeExs: ActiveWorkoutExercise[] = starterExs.map((ex) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      sets: [
        { id: `set_1_${Date.now()}`, setNumber: 1, weight: 40, reps: 10, isCompleted: false },
        { id: `set_2_${Date.now()}`, setNumber: 2, weight: 40, reps: 10, isCompleted: false },
        { id: `set_3_${Date.now()}`, setNumber: 3, weight: 40, reps: 10, isCompleted: false },
      ],
    }));

    setActiveSession({
      id: `session_${Date.now()}`,
      routineName: 'Freestyle Workout',
      startTime: Date.now(),
      elapsedSeconds: 0,
      exercises: activeExs,
      isFinished: false,
    });
  };

  // Handler: Finish Workout
  const handleFinishWorkout = (log: WorkoutLog) => {
    StorageRepository.saveWorkoutLog(log);
    setActiveSession(null);
    setActiveTab('report');
  };

  // Handler: Cancel Workout
  const handleCancelWorkout = () => {
    setActiveSession(null);
  };

  const todayStepRecord = stepHistory[0] || {
    date: dailyLog.date,
    steps: dailyLog.steps,
    goal: userMetrics.dailyStepGoal,
    distanceKm: parseFloat((dailyLog.steps * 0.00075).toFixed(2)),
    caloriesBurned: Math.round(dailyLog.steps * 0.04),
  };

  return (
    <AndroidFrame
      themeMode={themeMode}
      onToggleTheme={handleToggleTheme}
      showRoomInspector={showRoomInspector}
      setShowRoomInspector={setShowRoomInspector}
    >
      {/* Active Workout Overlay (Full-screen native experience) */}
      {activeSession && (
        <ActiveWorkoutOverlay
          session={activeSession}
          allExercises={exercises}
          userMetrics={userMetrics}
          onUpdateSession={setActiveSession}
          onFinishWorkout={handleFinishWorkout}
          onCancelWorkout={handleCancelWorkout}
        />
      )}

      {/* Main Tab Screen Switcher */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {activeTab === 'training' && (
          <TrainingTab
            dailyLog={dailyLog}
            routines={routines}
            exercises={exercises}
            userMetrics={userMetrics}
            stepRecord={todayStepRecord}
            themeMode={themeMode}
            onStartRoutine={handleStartRoutine}
            onStartQuickWorkout={handleStartQuickWorkout}
          />
        )}

        {activeTab === 'exercises' && (
          <CustomExercisesTab
            exercises={exercises}
            themeMode={themeMode}
          />
        )}

        {activeTab === 'report' && (
          <ReportTab
            workoutLogs={workoutLogs}
            stepHistory={stepHistory}
            personalRecords={personalRecords}
            userMetrics={userMetrics}
            themeMode={themeMode}
          />
        )}

        {activeTab === 'me' && (
          <MeTab
            userMetrics={userMetrics}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
            onUpdateMetrics={setUserMetrics}
            onOpenRoomInspector={() => setShowRoomInspector(true)}
          />
        )}
      </div>

      {/* Material 3 Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeWorkoutCount={activeSession ? 1 : 0}
        themeMode={themeMode}
      />
    </AndroidFrame>
  );
}
