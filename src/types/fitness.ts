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
  | 'biceps' 
  | 'triceps' 
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
}

export type RoutineCategory = 'push' | 'pull' | 'legs' | 'upper' | 'cardio' | 'custom';

export interface Routine {
  id: string;
  name: string;
  category: RoutineCategory;
  estimatedDurationMins: number;
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

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodItem {
  id: string;
  name: string;
  mealCategory: MealCategory;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  loggedAt: string; // HH:MM
}

export interface MealScheduleItem {
  mealCategory: MealCategory;
  title: string;
  recommendedTime: string; // "08:00 AM"
  isCompleted: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterIntakeMl: number;
  foods: FoodItem[];
  completedSchedules: Record<MealCategory, boolean>;
  accumulatedWorkoutMinutes: number;
  scheduledWorkoutTitle: string;
  isWorkoutCompletedToday: boolean;
}
