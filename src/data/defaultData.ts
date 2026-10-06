import { Exercise, Routine, UserMetrics, DailyLog, StepRecord, PersonalRecord } from '../types/fitness';

export const DEFAULT_USER_METRICS: UserMetrics = {
  name: 'Alex Hunter',
  age: 26,
  gender: 'male',
  weightKg: 76,
  heightCm: 180,
  targetWeightKg: 72,
  fitnessGoal: 'muscle_gain',
  activityLevel: 'moderate',
  unitSystem: 'metric',
  dailyStepGoal: 10000,
  weeklyWorkoutTarget: 4,
  activeWorkoutDays: ['Mon', 'Tue', 'Thu', 'Fri'],
  preferredWorkoutTime: '18:00',
  targetCalories: 2500,
  targetProteinG: 165,
  targetCarbsG: 280,
  targetFatsG: 65,
  targetWaterMl: 3000,
};

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex_1', name: 'Barbell Bench Press', category: 'chest', primaryMuscle: 'Chest (Pectorals)', equipment: 'Barbell & Flat Bench', defaultSets: 4, defaultReps: 8, stanceType: 'bench', notes: 'Keep shoulder blades retracted and feet planted.' },
  { id: 'ex_2', name: 'Incline Dumbbell Press', category: 'chest', primaryMuscle: 'Upper Chest', equipment: 'Dumbbells & 30° Bench', defaultSets: 3, defaultReps: 10, stanceType: 'bench', notes: 'Squeeze upper pectorals at the peak.' },
  { id: 'ex_3', name: 'Weighted Chest Dips', category: 'chest', primaryMuscle: 'Lower Chest & Triceps', equipment: 'Dip Station / Belt', defaultSets: 3, defaultReps: 10, stanceType: 'pull', notes: 'Lean forward slightly to prioritize chest fibers.' },

  // Back
  { id: 'ex_4', name: 'Conventional Deadlift', category: 'back', primaryMuscle: 'Full Posterior Chain', equipment: 'Barbell & Olympic Plates', defaultSets: 4, defaultReps: 5, stanceType: 'squat', notes: 'Maintain neutral spine, push the floor away.' },
  { id: 'ex_5', name: 'Barbell Bent-Over Row', category: 'back', primaryMuscle: 'Lats & Rhomboids', equipment: 'Barbell', defaultSets: 4, defaultReps: 8, stanceType: 'pull', notes: 'Pull barbell into lower abdomen with elbows tucked.' },
  { id: 'ex_6', name: 'Weighted Pull-ups', category: 'back', primaryMuscle: 'Latissimus Dorsi', equipment: 'Pull-up Bar', defaultSets: 3, defaultReps: 8, stanceType: 'pull', notes: 'Full dead hang to chin clearly over bar.' },

  // Legs
  { id: 'ex_7', name: 'Barbell Back Squat', category: 'legs', primaryMuscle: 'Quadriceps & Glutes', equipment: 'Squat Rack & Barbell', defaultSets: 4, defaultReps: 8, stanceType: 'squat', notes: 'Hit parallel depth with knees tracking toes.' },
  { id: 'ex_8', name: 'Romanian Deadlift (RDL)', category: 'legs', primaryMuscle: 'Hamstrings & Glutes', equipment: 'Barbell / Dumbbells', defaultSets: 3, defaultReps: 10, stanceType: 'squat', notes: 'Hinge deeply at hips with soft knees.' },
  { id: 'ex_9', name: 'Bulgarian Split Squat', category: 'legs', primaryMuscle: 'Quads & Glute Medius', equipment: 'Dumbbells & Flat Bench', defaultSets: 3, defaultReps: 10, stanceType: 'squat', notes: 'Unilateral leg drive and balance stability.' },

  // Shoulders
  { id: 'ex_10', name: 'Overhead Barbell Press', category: 'shoulders', primaryMuscle: 'Anterior & Lateral Delts', equipment: 'Barbell', defaultSets: 4, defaultReps: 6, stanceType: 'overhead', notes: 'Tighten glutes and core, press directly overhead.' },
  { id: 'ex_11', name: 'Dumbbell Lateral Raises', category: 'shoulders', primaryMuscle: 'Lateral Deltoids', equipment: 'Dumbbells', defaultSets: 4, defaultReps: 15, stanceType: 'overhead', notes: 'Lead with elbows for optimal side-delt isolation.' },
  { id: 'ex_12', name: 'Rear Delt Face Pulls', category: 'shoulders', primaryMuscle: 'Rear Delts & Rotator Cuff', equipment: 'Cable & Rope Attachment', defaultSets: 3, defaultReps: 15, stanceType: 'pull', notes: 'External rotation at the end of pull.' },

  // Arms
  { id: 'ex_13', name: 'Barbell Bicep Curl', category: 'arms', primaryMuscle: 'Biceps Brachii', equipment: 'Barbell / EZ Bar', defaultSets: 3, defaultReps: 10, stanceType: 'curl', notes: 'Strict elbows pinned to torso, no body swing.' },
  { id: 'ex_14', name: 'Overhead Tricep Extension', category: 'arms', primaryMuscle: 'Long Head Triceps', equipment: 'Cable / Dumbbell', defaultSets: 3, defaultReps: 12, stanceType: 'overhead', notes: 'Deep stretch at bottom for tricep long head.' },
  { id: 'ex_15', name: 'Hammer Curls', category: 'arms', primaryMuscle: 'Brachialis & Forearms', equipment: 'Dumbbells', defaultSets: 3, defaultReps: 12, stanceType: 'curl', notes: 'Neutral grip for arm thickness.' },

  // Core
  { id: 'ex_16', name: 'Hanging Leg Raises', category: 'core', primaryMuscle: 'Lower Rectus Abdominis', equipment: 'Pull-up Bar', defaultSets: 3, defaultReps: 12, stanceType: 'plank', notes: 'Curl pelvis up at peak, avoid swinging.' },
  { id: 'ex_17', name: 'Weighted Plank Hold', category: 'core', primaryMuscle: 'Transverse Abdominis', equipment: 'Weight Plate & Floor Mat', defaultSets: 3, defaultReps: 60, stanceType: 'plank', notes: 'Maintain pelvic tilt and brace like taking a punch.' },
  { id: 'ex_18', name: 'Cable Woodchoppers', category: 'core', primaryMuscle: 'Internal/External Obliques', equipment: 'Cable Machine', defaultSets: 3, defaultReps: 12, stanceType: 'overhead', notes: 'Rotate through core, not merely arms.' },

  // Cardio
  { id: 'ex_19', name: 'Treadmill Incline Intervals', category: 'cardio', primaryMuscle: 'Cardio System & Calves', equipment: 'Treadmill', defaultSets: 6, defaultReps: 60, stanceType: 'run', notes: '12% incline, 1 min on / 1 min walk intervals.' },
  { id: 'ex_20', name: 'Rowing Machine Sprints', category: 'cardio', primaryMuscle: 'Full Body Aerobic Power', equipment: 'Concept2 Rower', defaultSets: 5, defaultReps: 120, stanceType: 'pull', notes: 'Drive with legs first, finish with back and arms.' },
];

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'rt_full_body',
    name: 'Full Body Athletic Power',
    category: 'full_body',
    estimatedDurationMins: 55,
    estimatedCalories: 420,
    exerciseIds: ['ex_7', 'ex_1', 'ex_5', 'ex_10', 'ex_16'],
    description: 'High-yield compound circuit training every major muscle group.',
  },
  {
    id: 'rt_upper',
    name: 'Upper Body Hypertrophy',
    category: 'upper',
    estimatedDurationMins: 50,
    estimatedCalories: 380,
    exerciseIds: ['ex_1', 'ex_2', 'ex_6', 'ex_10', 'ex_11', 'ex_13'],
    description: 'Thick chest, broad lats, 3D deltoids, and bicep peaks.',
  },
  {
    id: 'rt_legs',
    name: 'Leg Day & Posterior Chain',
    category: 'legs',
    estimatedDurationMins: 55,
    estimatedCalories: 450,
    exerciseIds: ['ex_7', 'ex_8', 'ex_9', 'ex_17'],
    description: 'Heavy quad loading, hamstring hinging, and solid core bracing.',
  },
  {
    id: 'rt_core',
    name: 'Core Burn & Steel Abs',
    category: 'core',
    estimatedDurationMins: 25,
    estimatedCalories: 210,
    exerciseIds: ['ex_16', 'ex_17', 'ex_18'],
    description: 'Target lower abs, obliques, and isometric spinal stability.',
  },
  {
    id: 'rt_cardio',
    name: 'Cardio Blast & Conditioning',
    category: 'cardio',
    estimatedDurationMins: 30,
    estimatedCalories: 350,
    exerciseIds: ['ex_19', 'ex_20'],
    description: 'High-intensity anaerobic intervals for heart rate conditioning.',
  },
];

export const DEFAULT_PERSONAL_RECORDS: PersonalRecord[] = [
  { id: 'pr_1', exerciseName: 'Barbell Bench Press', weight: 105, reps: 3, date: 'Oct 2, 2026', isRecent: true },
  { id: 'pr_2', exerciseName: 'Barbell Back Squat', weight: 140, reps: 5, date: 'Sep 28, 2026' },
  { id: 'pr_3', exerciseName: 'Conventional Deadlift', weight: 180, reps: 3, date: 'Sep 24, 2026' },
  { id: 'pr_4', exerciseName: 'Overhead Barbell Press', weight: 70, reps: 5, date: 'Sep 19, 2026' },
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
  steps: 7420,
  waterIntakeMl: 2250,
  foods: [],
  completedSchedules: {
    breakfast: true,
    lunch: true,
    snacks: true,
    dinner: false,
  },
  accumulatedWorkoutMinutes: 48,
  scheduledWorkoutTitle: 'Full Body Athletic Power',
  isWorkoutCompletedToday: false,
};

// Generates 30 days of synthetic historical data for realistic charts and calendar heat-map
export const generateHistoryData = () => {
  const steps: StepRecord[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // Realistic step curve fluctuating around 8,000 - 12,500
    const variance = Math.sin(i * 0.8) * 2200 + (Math.random() * 1400);
    const count = i === 0 ? 7420 : Math.max(4500, Math.round(9200 + variance));
    const distKm = parseFloat((count * 0.00075).toFixed(2));
    const cal = Math.round(count * 0.04);

    steps.push({
      date: dateStr,
      steps: count,
      goal: 10000,
      distanceKm: distKm,
      caloriesBurned: cal,
    });
  }

  return steps;
};
