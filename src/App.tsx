/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  BottomNavBar 
} from './components/BottomNavBar';
import { AndroidFrame } from './components/AndroidFrame';
import { DashboardTab } from './components/DashboardTab';
import { WorkoutTab } from './components/WorkoutTab';
import { NutritionTab } from './components/NutritionTab';
import { ProfileTab } from './components/ProfileTab';
import { ActiveWorkoutOverlay } from './components/ActiveWorkoutOverlay';
import { 
  UserMetrics, 
  DailyLog, 
  Exercise, 
  Routine, 
  WorkoutLog, 
  ActiveWorkoutSession,
  ActiveWorkoutExercise 
} from './types/fitness';
import { 
  StorageRepository, 
  subscribeToDatabase 
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Database States
  const [userMetrics, setUserMetrics] = useState<UserMetrics>(() => StorageRepository.getUserMetrics());
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => StorageRepository.getDailyLog());
  const [exercises, setExercises] = useState<Exercise[]>(() => StorageRepository.getExercises());
  const [routines, setRoutines] = useState<Routine[]>(() => StorageRepository.getRoutines());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => StorageRepository.getWorkoutLogs());

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
    });
    return () => unsubscribe();
  }, []);

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

  // Handler: Start Scheduled Workout from Dashboard
  const handleStartScheduledWorkout = () => {
    // Look for matching routine or default to first
    const scheduledTitle = dailyLog.scheduledWorkoutTitle || 'Push Day (Hypertrophy)';
    const foundRoutine = routines.find((r) => r.name.toLowerCase().includes(scheduledTitle.toLowerCase())) || routines[0];
    if (foundRoutine) {
      handleStartRoutine(foundRoutine);
    } else {
      handleStartQuickWorkout();
    }
  };

  // Handler: Start Quick Workout
  const handleStartQuickWorkout = () => {
    // Start with 2 default exercises
    const starterExs = exercises.slice(0, 2);
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
      routineName: 'Quick Workout',
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
    setActiveTab('dashboard');
  };

  // Handler: Cancel Workout
  const handleCancelWorkout = () => {
    setActiveSession(null);
  };

  return (
    <AndroidFrame>
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
        {activeTab === 'dashboard' && (
          <DashboardTab
            userMetrics={userMetrics}
            dailyLog={dailyLog}
            onNavigateTab={setActiveTab}
            onStartScheduledWorkout={handleStartScheduledWorkout}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutTab
            routines={routines}
            exercises={exercises}
            recentWorkoutLogs={workoutLogs}
            userMetrics={userMetrics}
            onStartRoutine={handleStartRoutine}
            onStartQuickWorkout={handleStartQuickWorkout}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab
            dailyLog={dailyLog}
            userMetrics={userMetrics}
            onUpdateMetrics={setUserMetrics}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            userMetrics={userMetrics}
            onUpdateMetrics={setUserMetrics}
          />
        )}
      </div>

      {/* Material 3 Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeWorkoutCount={activeSession ? 1 : 0}
      />
    </AndroidFrame>
  );
}
