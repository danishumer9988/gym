import { FitnessGoal, ActivityLevel } from '../types/fitness';

export interface NutritionTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  waterMl: number;
}

export function calculateMacros(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  activityLevel: ActivityLevel,
  goal: FitnessGoal
): NutritionTargets {
  // Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (gender === 'female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
  }

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  let targetCalories: number;
  let proteinG: number;
  let fatsG: number;

  if (goal === 'weight_loss') {
    targetCalories = Math.round(tdee - 450);
    proteinG = Math.round(weightKg * 2.2); // high protein to preserve lean muscle
    fatsG = Math.round(weightKg * 0.8);
  } else if (goal === 'muscle_gain') {
    targetCalories = Math.round(tdee + 350);
    proteinG = Math.round(weightKg * 2.0);
    fatsG = Math.round(weightKg * 0.9);
  } else {
    // maintenance
    targetCalories = Math.round(tdee);
    proteinG = Math.round(weightKg * 1.8);
    fatsG = Math.round(weightKg * 0.85);
  }

  // Ensure minimum floor
  targetCalories = Math.max(1200, targetCalories);

  // Remaining calories to carbs: 4 kcal per gram of carb & protein, 9 kcal per gram of fat
  const caloriesFromProtein = proteinG * 4;
  const caloriesFromFats = fatsG * 9;
  const remainingCalories = Math.max(200, targetCalories - caloriesFromProtein - caloriesFromFats);
  const carbsG = Math.round(remainingCalories / 4);

  // Recommended baseline water: 35ml per kg + 500ml active workout allowance
  const waterMl = Math.round((weightKg * 35 + 500) / 250) * 250;

  return {
    calories: targetCalories,
    proteinG,
    carbsG,
    fatsG,
    waterMl,
  };
}
