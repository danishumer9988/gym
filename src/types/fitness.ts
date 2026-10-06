export type ThemeMode = 'dark' | 'light';
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintenance';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
export type UnitSystem = 'metric' | 'imperial';

export interface UserMetrics {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weightKg: number;
  heightCm: number;
  targetWeightKg: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
  dailyStepGoal: number; // e.g. 10000
  weeklyWorkoutTarget: number; // e.g. 4 or 5
  activeWorkoutDays: string[]; // e.g. ['Mon', 'Tue', 'Thu', 'Fri']
  preferredWorkoutTime: string; // e.g. "18:00"
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
  targetWaterMl: number;
}

export type ExerciseCategory = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'arms' 
  | 'legs' 
  | 'core' 
  | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscle: string;
  equipment: string;
  defaultSets: number;
  defaultReps: number;
  isCustom?: boolean;
  notes?: string;
  stanceType?: 'bench' | 'squat' | 'pull' | 'overhead' | 'plank' | 'run' | 'curl';
}

export type RoutineCategory = 'full_body' | 'upper' | 'legs' | 'core' | 'cardio' | 'custom';

export interface Routine {
  id: string;
  name: string;
  category: RoutineCategory;
  estimatedDurationMins: number;
  estimatedCalories: number;
  exerciseIds: string[];
  description: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
}

export interface ActiveWorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  sets: WorkoutSet[];
}

export interface ActiveWorkoutSession {
  id: string;
  routineName: string;
  startTime: number;
  elapsedSeconds: number;
  exercises: ActiveWorkoutExercise[];
  isFinished: boolean;
}

export interface WorkoutLog {
  id: string;
  routineName: string;
  date: string;
  durationSeconds: number;
  volumeKg: number;
  caloriesBurned: number;
  exercisesCompleted: number;
}

export interface StepRecord {
  date: string; // YYYY-MM-DD
  steps: number;
  goal: number;
  distanceKm: number;
  caloriesBurned: number;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  isRecent?: boolean;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodItem {
  id: string;
  name: string;
  mealCategory: MealCategory;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  loggedAt: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  steps: number;
  waterIntakeMl: number;
  foods: FoodItem[];
  completedSchedules: Record<MealCategory, boolean>;
  accumulatedWorkoutMinutes: number;
  scheduledWorkoutTitle: string;
  isWorkoutCompletedToday: boolean;
}
