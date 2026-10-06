import { Exercise, Routine, UserMetrics, DailyLog } from '../types/fitness';

export const DEFAULT_USER_METRICS: UserMetrics = {
  name: 'Danish',
  age: 26,
  gender: 'male',
  weightKg: 74,
  heightCm: 178,
  targetWeightKg: 70,
  fitnessGoal: 'muscle_gain',
  activityLevel: 'moderate',
  unitSystem: 'metric',
  activeWorkoutDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
  preferredWorkoutTime: '18:00',
  targetCalories: 2450,
  targetProteinG: 165,
  targetCarbsG: 275,
  targetFatsG: 65,
  targetWaterMl: 3000,
};

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex_1', name: 'Barbell Bench Press', category: 'chest', primaryMuscle: 'Chest (Mid/Lower)', equipment: 'Barbell & Bench', defaultSets: 4, defaultReps: 8 },
  { id: 'ex_2', name: 'Incline Dumbbell Press', category: 'chest', primaryMuscle: 'Upper Chest', equipment: 'Dumbbells & Bench', defaultSets: 3, defaultReps: 10 },
  { id: 'ex_3', name: 'Cable Chest Flyes', category: 'chest', primaryMuscle: 'Inner / Overall Chest', equipment: 'Cable Machine', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_4', name: 'Dips (Chest Focus)', category: 'chest', primaryMuscle: 'Lower Chest & Triceps', equipment: 'Parallel Bars', defaultSets: 3, defaultReps: 12 },

  // Back
  { id: 'ex_5', name: 'Barbell Deadlift', category: 'back', primaryMuscle: 'Erectors & Posterior Chain', equipment: 'Barbell & Plates', defaultSets: 4, defaultReps: 5 },
  { id: 'ex_6', name: 'Barbell Bent-Over Row', category: 'back', primaryMuscle: 'Lats & Rhomboids', equipment: 'Barbell', defaultSets: 4, defaultReps: 8 },
  { id: 'ex_7', name: 'Lat Pulldown', category: 'back', primaryMuscle: 'Latissimus Dorsi', equipment: 'Cable Pulldown', defaultSets: 3, defaultReps: 10 },
  { id: 'ex_8', name: 'Seated Cable Row', category: 'back', primaryMuscle: 'Mid-Back & Traps', equipment: 'Cable Machine', defaultSets: 3, defaultReps: 12 },

  // Shoulders
  { id: 'ex_9', name: 'Overhead Barbell Press', category: 'shoulders', primaryMuscle: 'Anterior Deltoids', equipment: 'Barbell', defaultSets: 4, defaultReps: 8 },
  { id: 'ex_10', name: 'Dumbbell Lateral Raises', category: 'shoulders', primaryMuscle: 'Lateral Deltoids', equipment: 'Dumbbells', defaultSets: 4, defaultReps: 15 },
  { id: 'ex_11', name: 'Face Pulls', category: 'shoulders', primaryMuscle: 'Rear Delts & Rotator Cuff', equipment: 'Cable & Rope', defaultSets: 3, defaultReps: 15 },

  // Biceps
  { id: 'ex_12', name: 'Barbell Bicep Curl', category: 'biceps', primaryMuscle: 'Biceps Brachii', equipment: 'Barbell / EZ Bar', defaultSets: 3, defaultReps: 10 },
  { id: 'ex_13', name: 'Dumbbell Hammer Curls', category: 'biceps', primaryMuscle: 'Brachialis & Forearms', equipment: 'Dumbbells', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_14', name: 'Incline Dumbbell Curl', category: 'biceps', primaryMuscle: 'Biceps Long Head', equipment: 'Dumbbells & Bench', defaultSets: 3, defaultReps: 10 },

  // Triceps
  { id: 'ex_15', name: 'Cable Rope Pushdown', category: 'triceps', primaryMuscle: 'Lateral Triceps', equipment: 'Cable & Rope', defaultSets: 4, defaultReps: 12 },
  { id: 'ex_16', name: 'Skull Crushers', category: 'triceps', primaryMuscle: 'Long Head Triceps', equipment: 'EZ Bar & Bench', defaultSets: 3, defaultReps: 10 },

  // Legs
  { id: 'ex_17', name: 'Barbell Back Squat', category: 'legs', primaryMuscle: 'Quadriceps & Glutes', equipment: 'Barbell & Squat Rack', defaultSets: 4, defaultReps: 8 },
  { id: 'ex_18', name: 'Romanian Deadlift (RDL)', category: 'legs', primaryMuscle: 'Hamstrings & Glutes', equipment: 'Barbell / Dumbbells', defaultSets: 3, defaultReps: 10 },
  { id: 'ex_19', name: 'Leg Press', category: 'legs', primaryMuscle: 'Quadriceps & Adductors', equipment: 'Leg Press Machine', defaultSets: 4, defaultReps: 10 },
  { id: 'ex_20', name: 'Standing Calf Raises', category: 'legs', primaryMuscle: 'Gastrocnemius', equipment: 'Calf Machine / Platform', defaultSets: 4, defaultReps: 15 },

  // Core
  { id: 'ex_21', name: 'Hanging Leg Raises', category: 'core', primaryMuscle: 'Lower Rectus Abdominis', equipment: 'Pull-up Bar', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_22', name: 'Cable Woodchoppers', category: 'core', primaryMuscle: 'Obliques & Core Rotation', equipment: 'Cable Machine', defaultSets: 3, defaultReps: 12 },
  { id: 'ex_23', name: 'Weighted Plank', category: 'core', primaryMuscle: 'Transverse Abdominis', equipment: 'Weight Plate / Mat', defaultSets: 3, defaultReps: 60 },

  // Cardio
  { id: 'ex_24', name: 'Treadmill Incline Sprints', category: 'cardio', primaryMuscle: 'Cardiovascular & Legs', equipment: 'Treadmill', defaultSets: 5, defaultReps: 60 },
  { id: 'ex_25', name: 'Rowing Machine HIIT', category: 'cardio', primaryMuscle: 'Full Body Endurance', equipment: 'Concept2 Rower', defaultSets: 4, defaultReps: 120 },
];

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'rt_push',
    name: 'Push Day (Hypertrophy)',
    category: 'push',
    estimatedDurationMins: 50,
    exerciseIds: ['ex_1', 'ex_2', 'ex_10', 'ex_15', 'ex_16'],
    description: 'Focused on chest thickness, 3D deltoids, and tricep lockouts.',
  },
  {
    id: 'rt_pull',
    name: 'Pull Day (Thickness & Width)',
    category: 'pull',
    estimatedDurationMins: 55,
    exerciseIds: ['ex_5', 'ex_6', 'ex_7', 'ex_11', 'ex_12'],
    description: 'Back builders, rear delt balance, and heavy bicep isolation.',
  },
  {
    id: 'rt_legs',
    name: 'Leg Day Blast',
    category: 'legs',
    estimatedDurationMins: 60,
    exerciseIds: ['ex_17', 'ex_18', 'ex_19', 'ex_20', 'ex_21'],
    description: 'Heavy squats, hamstring loading, calves, and core bracing.',
  },
  {
    id: 'rt_upper',
    name: 'Upper Body Power',
    category: 'upper',
    estimatedDurationMins: 50,
    exerciseIds: ['ex_1', 'ex_6', 'ex_9', 'ex_12', 'ex_15'],
    description: 'Compound synergy for upper body athletic performance.',
  },
  {
    id: 'rt_cardio',
    name: 'Cardio & Core Ignition',
    category: 'cardio',
    estimatedDurationMins: 35,
    exerciseIds: ['ex_24', 'ex_25', 'ex_21', 'ex_23'],
    description: 'High-intensity interval conditioning with core stabilization.',
  },
];

export const COMMON_FOOD_SUGGESTIONS = [
  { name: 'Grilled Chicken Breast (200g)', calories: 330, proteinG: 62, carbsG: 0, fatsG: 7 },
  { name: 'Brown Rice with Steamed Broccoli', calories: 280, proteinG: 7, carbsG: 58, fatsG: 2 },
  { name: 'Oatmeal with Whey & Berries', calories: 420, proteinG: 34, carbsG: 54, fatsG: 8 },
  { name: 'Whole Eggs & Avocado Toast (2 slices)', calories: 450, proteinG: 18, carbsG: 32, fatsG: 26 },
  { name: 'Greek Yogurt with Almonds & Honey', calories: 290, proteinG: 22, carbsG: 24, fatsG: 12 },
  { name: 'Whey Isolate Protein Shake (1 scoop)', calories: 130, proteinG: 27, carbsG: 2, fatsG: 1 },
  { name: 'Salmon Fillet with Sweet Potato', calories: 510, proteinG: 42, carbsG: 38, fatsG: 18 },
  { name: 'Apple with Natural Peanut Butter', calories: 210, proteinG: 6, carbsG: 25, fatsG: 11 },
];

export const getTodayDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_DAILY_LOG: DailyLog = {
  date: getTodayDateKey(),
  waterIntakeMl: 1750,
  foods: [
    {
      id: 'f_1',
      name: 'Oatmeal with Whey & Blueberries',
      mealCategory: 'breakfast',
      calories: 420,
      proteinG: 34,
      carbsG: 54,
      fatsG: 8,
      loggedAt: '08:15',
    },
    {
      id: 'f_2',
      name: 'Grilled Chicken Breast & Quinoa',
      mealCategory: 'lunch',
      calories: 550,
      proteinG: 55,
      carbsG: 50,
      fatsG: 12,
      loggedAt: '13:10',
    },
    {
      id: 'f_3',
      name: 'Protein Shake & Banana',
      mealCategory: 'snacks',
      calories: 235,
      proteinG: 28,
      carbsG: 27,
      fatsG: 2,
      loggedAt: '16:45',
    },
  ],
  completedSchedules: {
    breakfast: true,
    lunch: true,
    snacks: true,
    dinner: false,
  },
  accumulatedWorkoutMinutes: 45,
  scheduledWorkoutTitle: 'Leg Day Blast',
  isWorkoutCompletedToday: false,
};
