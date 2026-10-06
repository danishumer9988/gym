import { 
  UserMetrics, 
  Exercise, 
  Routine, 
  DailyLog, 
  WorkoutLog, 
  ThemeMode,
  StepRecord,
  PersonalRecord
} from '../types/fitness';
import { 
  DEFAULT_USER_METRICS, 
  DEFAULT_EXERCISES, 
  DEFAULT_ROUTINES, 
  DEFAULT_PERSONAL_RECORDS,
  INITIAL_DAILY_LOG,
  generateHistoryData,
  getTodayDateKey 
} from '../data/defaultData';

const STORAGE_KEYS = {
  THEME_MODE: 'pulsefit_theme_mode_v2',
  USER_METRICS: 'pulsefit_room_user_metrics_v2',
  EXERCISES: 'pulsefit_room_exercises_v2',
  ROUTINES: 'pulsefit_room_routines_v2',
  DAILY_LOGS: 'pulsefit_room_daily_logs_v2',
  WORKOUT_LOGS: 'pulsefit_room_workout_history_v2',
  STEP_HISTORY: 'pulsefit_room_step_history_v2',
  PERSONAL_RECORDS: 'pulsefit_room_personal_records_v2',
};

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
  // THEME MODE
  getThemeMode(): ThemeMode {
    try {
      const mode = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (mode === 'light' || mode === 'dark') return mode;
    } catch {
      // ignore
    }
    return 'dark'; // Dark mode by default
  },

  setThemeMode(mode: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
      notifySubscribers();
    } catch (e) {
      console.error('Error saving theme', e);
    }
  },

  // USER METRICS (UserProfileDao)
  getUserMetrics(): UserMetrics {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_METRICS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
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

  // EXERCISES (ExerciseDao)
  getExercises(): Exercise[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
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

  // ROUTINES (RoutineDao)
  getRoutines(): Routine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
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

  // DAILY LOGS (DailyNutritionAndHabitDao)
  getDailyLog(dateKey: string = getTodayDateKey()): DailyLog {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      if (raw) {
        const logs: Record<string, DailyLog> = JSON.parse(raw);
        if (logs[dateKey]) {
          return logs[dateKey];
        }
      }
    } catch {
      // ignore
    }

    if (dateKey === getTodayDateKey()) {
      return INITIAL_DAILY_LOG;
    }

    return {
      date: dateKey,
      steps: 0,
      waterIntakeMl: 0,
      foods: [],
      completedSchedules: {
        breakfast: false,
        lunch: false,
        dinner: false,
        snacks: false,
      },
      accumulatedWorkoutMinutes: 0,
      scheduledWorkoutTitle: 'Full Body Athletic Power',
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
    const newIntake = Math.max(0, (log.waterIntakeMl || 0) + deltaMl);
    log.waterIntakeMl = newIntake;
    this.saveDailyLog(log);
    return newIntake;
  },

  addFoodItem(item: any, dateKey: string = getTodayDateKey()): void {
    const log = this.getDailyLog(dateKey);
    if (!log.foods) log.foods = [];
    log.foods.unshift(item);
    this.saveDailyLog(log);
  },

  deleteFoodItem(itemId: string, dateKey: string = getTodayDateKey()): void {
    const log = this.getDailyLog(dateKey);
    if (log.foods) {
      log.foods = log.foods.filter((f: any) => f.id !== itemId);
      this.saveDailyLog(log);
    }
  },

  toggleMealSchedule(category: any, dateKey: string = getTodayDateKey()): void {
    const log = this.getDailyLog(dateKey);
    if (!log.completedSchedules) {
      log.completedSchedules = { breakfast: false, lunch: false, dinner: false, snacks: false };
    }
    log.completedSchedules[category as 'breakfast'] = !log.completedSchedules[category as 'breakfast'];
    this.saveDailyLog(log);
  },

  // STEP SENSOR & COUNTER
  getStepHistory(): StepRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STEP_HISTORY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    const initial = generateHistoryData();
    try {
      localStorage.setItem(STORAGE_KEYS.STEP_HISTORY, JSON.stringify(initial));
    } catch {
      // ignore
    }
    return initial;
  },

  incrementSteps(delta: number): StepRecord {
    const todayKey = getTodayDateKey();
    const history = this.getStepHistory();
    const metrics = this.getUserMetrics();

    let todayRecord = history.find(h => h.date === todayKey);
    if (!todayRecord) {
      todayRecord = {
        date: todayKey,
        steps: Math.max(0, delta),
        goal: metrics.dailyStepGoal || 10000,
        distanceKm: parseFloat((Math.max(0, delta) * 0.00075).toFixed(2)),
        caloriesBurned: Math.round(Math.max(0, delta) * 0.04),
      };
      history.unshift(todayRecord);
    } else {
      todayRecord.steps = Math.max(0, todayRecord.steps + delta);
      todayRecord.distanceKm = parseFloat((todayRecord.steps * 0.00075).toFixed(2));
      todayRecord.caloriesBurned = Math.round(todayRecord.steps * 0.04);
      todayRecord.goal = metrics.dailyStepGoal || 10000;
    }

    // Also sync to today's daily log
    const todayLog = this.getDailyLog();
    todayLog.steps = todayRecord.steps;
    this.saveDailyLog(todayLog);

    try {
      localStorage.setItem(STORAGE_KEYS.STEP_HISTORY, JSON.stringify(history));
      notifySubscribers();
    } catch (e) {
      console.error('Error saving steps', e);
    }

    return todayRecord;
  },

  // PERSONAL RECORDS (PRDao)
  getPersonalRecords(): PersonalRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERSONAL_RECORDS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return DEFAULT_PERSONAL_RECORDS;
  },

  savePersonalRecord(pr: PersonalRecord): void {
    const list = this.getPersonalRecords();
    const existingIdx = list.findIndex(p => p.exerciseName.toLowerCase() === pr.exerciseName.toLowerCase());
    if (existingIdx >= 0) {
      if (pr.weight >= list[existingIdx].weight) {
        list[existingIdx] = pr;
      }
    } else {
      list.push(pr);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(list));
      notifySubscribers();
    } catch (e) {
      console.error('Error saving PR', e);
    }
  },

  // WORKOUT HISTORY (WorkoutHistoryDao)
  getWorkoutLogs(): WorkoutLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [
      {
        id: 'wl_yesterday',
        routineName: 'Upper Body Hypertrophy',
        date: 'Oct 5, 2026',
        durationSeconds: 3120,
        volumeKg: 6840,
        caloriesBurned: 410,
        exercisesCompleted: 6,
      },
      {
        id: 'wl_oct3',
        routineName: 'Leg Day & Posterior Chain',
        date: 'Oct 3, 2026',
        durationSeconds: 3450,
        volumeKg: 8250,
        caloriesBurned: 470,
        exercisesCompleted: 4,
      },
      {
        id: 'wl_oct1',
        routineName: 'Full Body Athletic Power',
        date: 'Oct 1, 2026',
        durationSeconds: 2900,
        volumeKg: 6200,
        caloriesBurned: 395,
        exercisesCompleted: 5,
      },
    ];
  },

  saveWorkoutLog(log: WorkoutLog): void {
    const list = this.getWorkoutLogs();
    list.unshift(log);
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(list));
      
      const todayLog = this.getDailyLog();
      todayLog.accumulatedWorkoutMinutes += Math.round(log.durationSeconds / 60);
      todayLog.isWorkoutCompletedToday = true;
      this.saveDailyLog(todayLog);

      notifySubscribers();
    } catch (e) {
      console.error('Error saving workout log', e);
    }
  },

  // EXPORT AS JSON FILE
  exportDatabaseAsJson(): void {
    const backup = {
      version: 'PulseFit-Android-Room-Backup-v2',
      timestamp: new Date().toISOString(),
      userMetrics: this.getUserMetrics(),
      exercises: this.getExercises(),
      routines: this.getRoutines(),
      stepHistory: this.getStepHistory(),
      personalRecords: this.getPersonalRecords(),
      workoutLogs: this.getWorkoutLogs(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulsefit_room_backup_${getTodayDateKey()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // RESET / CLEAR ALL DATABASE
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    notifySubscribers();
  },

  resetToDemo(): void {
    this.setThemeMode('dark');
    this.saveUserMetrics(DEFAULT_USER_METRICS);
    try {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(DEFAULT_ROUTINES));
      localStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(DEFAULT_PERSONAL_RECORDS));
      localStorage.setItem(STORAGE_KEYS.STEP_HISTORY, JSON.stringify(generateHistoryData()));
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify({
        [getTodayDateKey()]: INITIAL_DAILY_LOG
      }));
      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify([
        {
          id: 'wl_demo_1',
          routineName: 'Upper Body Hypertrophy',
          date: 'Yesterday',
          durationSeconds: 3120,
          volumeKg: 6840,
          caloriesBurned: 410,
          exercisesCompleted: 6,
        },
        {
          id: 'wl_demo_2',
          routineName: 'Leg Day & Posterior Chain',
          date: '3 days ago',
          durationSeconds: 3450,
          volumeKg: 8250,
          caloriesBurned: 470,
          exercisesCompleted: 4,
        }
      ]));
      notifySubscribers();
    } catch (e) {
      console.error('Error resetting demo', e);
    }
  }
};
