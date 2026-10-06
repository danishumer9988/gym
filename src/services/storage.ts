import { 
  UserMetrics, 
  Exercise, 
  Routine, 
  DailyLog, 
  WorkoutLog, 
  FoodItem, 
  MealCategory 
} from '../types/fitness';
import { 
  DEFAULT_USER_METRICS, 
  DEFAULT_EXERCISES, 
  DEFAULT_ROUTINES, 
  INITIAL_DAILY_LOG,
  getTodayDateKey 
} from '../data/defaultData';

const STORAGE_KEYS = {
  USER_METRICS: 'pulsefit_room_user_metrics_v1',
  EXERCISES: 'pulsefit_room_exercises_v1',
  ROUTINES: 'pulsefit_room_routines_v1',
  DAILY_LOGS: 'pulsefit_room_daily_logs_v1',
  WORKOUT_LOGS: 'pulsefit_room_workout_history_v1',
};

// Event listener mechanism to notify components of DB changes (simulating Room Flow/LiveData)
type StorageEventListener = () => void;
const listeners: Set<StorageEventListener> = new Set();

export const subscribeToDatabase = (listener: StorageEventListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifySubscribers = () => {
  listeners.forEach(cb => cb());
};

export const StorageRepository = {
  // USER METRICS (Room: UserProfileDao)
  getUserMetrics(): UserMetrics {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_METRICS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading user metrics', e);
    }
    return DEFAULT_USER_METRICS;
  },

  saveUserMetrics(metrics: UserMetrics): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_METRICS, JSON.stringify(metrics));
      notifySubscribers();
    } catch (e) {
      console.error('Error saving user metrics', e);
    }
  },

  // EXERCISES (Room: ExerciseDao)
  getExercises(): Exercise[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading exercises', e);
    }
    return DEFAULT_EXERCISES;
  },

  saveExercise(exercise: Exercise): void {
    const list = this.getExercises();
    const existingIndex = list.findIndex(e => e.id === exercise.id);
    if (existingIndex >= 0) {
      list[existingIndex] = exercise;
    } else {
      list.unshift(exercise);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(list));
      notifySubscribers();
    } catch (e) {
      console.error('Error saving exercise', e);
    }
  },

  // ROUTINES (Room: RoutineDao)
  getRoutines(): Routine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading routines', e);
    }
    return DEFAULT_ROUTINES;
  },

  saveRoutine(routine: Routine): void {
    const list = this.getRoutines();
    const existingIdx = list.findIndex(r => r.id === routine.id);
    if (existingIdx >= 0) {
      list[existingIdx] = routine;
    } else {
      list.push(routine);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(list));
      notifySubscribers();
    } catch (e) {
      console.error('Error saving routine', e);
    }
  },

  // DAILY LOGS (Room: DailyNutritionAndHabitDao)
  getDailyLog(dateKey: string = getTodayDateKey()): DailyLog {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      if (raw) {
        const logs: Record<string, DailyLog> = JSON.parse(raw);
        if (logs[dateKey]) {
          return logs[dateKey];
        }
      }
    } catch (e) {
      console.warn('Error reading daily log', e);
    }

    // Default entry for today
    if (dateKey === getTodayDateKey()) {
      return INITIAL_DAILY_LOG;
    }

    return {
      date: dateKey,
      waterIntakeMl: 0,
      foods: [],
      completedSchedules: {
        breakfast: false,
        lunch: false,
        dinner: false,
        snacks: false,
      },
      accumulatedWorkoutMinutes: 0,
      scheduledWorkoutTitle: 'Push Day (Hypertrophy)',
      isWorkoutCompletedToday: false,
    };
  },

  saveDailyLog(log: DailyLog): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      const logs: Record<string, DailyLog> = raw ? JSON.parse(raw) : {};
      logs[log.date] = log;
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
      notifySubscribers();
    } catch (e) {
      console.error('Error saving daily log', e);
    }
  },

  updateWaterIntake(deltaMl: number, dateKey: string = getTodayDateKey()): number {
    const log = this.getDailyLog(dateKey);
    const newIntake = Math.max(0, log.waterIntakeMl + deltaMl);
    log.waterIntakeMl = newIntake;
    this.saveDailyLog(log);
    return newIntake;
  },

  addFoodItem(item: FoodItem, dateKey: string = getTodayDateKey()): void {
    const log = this.getDailyLog(dateKey);
    log.foods.unshift(item);
    this.saveDailyLog(log);
  },

  deleteFoodItem(itemId: string, dateKey: string = getTodayDateKey()): void {
    const log = this.getDailyLog(dateKey);
    log.foods = log.foods.filter(f => f.id !== itemId);
    this.saveDailyLog(log);
  },

  toggleMealSchedule(category: MealCategory, dateKey: string = getTodayDateKey()): void {
    const log = this.getDailyLog(dateKey);
    log.completedSchedules[category] = !log.completedSchedules[category];
    this.saveDailyLog(log);
  },

  // WORKOUT HISTORY (Room: WorkoutHistoryDao)
  getWorkoutLogs(): WorkoutLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading workout logs', e);
    }
    return [
      {
        id: 'wl_yesterday',
        routineName: 'Push Day (Hypertrophy)',
        date: 'Yesterday',
        durationSeconds: 2700,
        volumeKg: 6420,
        caloriesBurned: 380,
        exercisesCompleted: 5,
      },
    ];
  },

  saveWorkoutLog(log: WorkoutLog): void {
    const list = this.getWorkoutLogs();
    list.unshift(log);
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(list));
      
      // Also update today's accumulated workout minutes & mark completed
      const todayLog = this.getDailyLog();
      todayLog.accumulatedWorkoutMinutes += Math.round(log.durationSeconds / 60);
      todayLog.isWorkoutCompletedToday = true;
      this.saveDailyLog(todayLog);

      notifySubscribers();
    } catch (e) {
      console.error('Error saving workout log', e);
    }
  },

  // RESET / CLEAR ALL DATABASE
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_METRICS);
    localStorage.removeItem(STORAGE_KEYS.EXERCISES);
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.DAILY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_LOGS);
    notifySubscribers();
  },

  resetToDemo(): void {
    this.saveUserMetrics(DEFAULT_USER_METRICS);
    try {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(DEFAULT_ROUTINES));
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify({
        [getTodayDateKey()]: INITIAL_DAILY_LOG
      }));
      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify([
        {
          id: 'wl_demo_1',
          routineName: 'Push Day (Hypertrophy)',
          date: 'Yesterday',
          durationSeconds: 2700,
          volumeKg: 6420,
          caloriesBurned: 380,
          exercisesCompleted: 5,
        }
      ]));
      notifySubscribers();
    } catch (e) {
      console.error('Error resetting demo', e);
    }
  }
};
