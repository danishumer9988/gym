import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Utensils, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calculator, 
  Flame, 
  Sparkles,
  ChevronDown,
  X,
  Search
} from 'lucide-react';
import { 
  DailyLog, 
  FoodItem, 
  MealCategory, 
  UserMetrics 
} from '../types/fitness';
import { COMMON_FOOD_SUGGESTIONS } from '../data/defaultData';
import { StorageRepository } from '../services/storage';
import { calculateMacros } from '../utils/nutritionCalculator';
import { triggerHaptic } from '../utils/audio';

interface NutritionTabProps {
  dailyLog: DailyLog;
  userMetrics: UserMetrics;
  onUpdateMetrics: (updated: UserMetrics) => void;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({
  dailyLog,
  userMetrics,
  onUpdateMetrics,
}) => {
  const [selectedMealCategory, setSelectedMealCategory] = useState<MealCategory>('breakfast');
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);

  // Add Food Form State
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState<number | ''>('');
  const [foodProtein, setFoodProtein] = useState<number | ''>('');
  const [foodCarbs, setFoodCarbs] = useState<number | ''>('');
  const [foodFats, setFoodFats] = useState<number | ''>('');

  // Recommended eat times schedule
  const mealScheduleData: { category: MealCategory; label: string; time: string }[] = [
    { category: 'breakfast', label: 'Breakfast Fuel', time: '08:00 AM' },
    { category: 'lunch', label: 'Power Lunch', time: '01:00 PM' },
    { category: 'snacks', label: 'Post-Workout Snack', time: '05:00 PM' },
    { category: 'dinner', label: 'Recovery Dinner', time: '08:00 PM' },
  ];

  // Calculate totals
  const totalCalories = dailyLog.foods.reduce((acc, f) => acc + f.calories, 0);
  const totalProtein = dailyLog.foods.reduce((acc, f) => acc + f.proteinG, 0);
  const totalCarbs = dailyLog.foods.reduce((acc, f) => acc + f.carbsG, 0);
  const totalFats = dailyLog.foods.reduce((acc, f) => acc + f.fatsG, 0);

  // Group foods by category
  const foodsByCategory: Record<MealCategory, FoodItem[]> = {
    breakfast: dailyLog.foods.filter((f) => f.mealCategory === 'breakfast'),
    lunch: dailyLog.foods.filter((f) => f.mealCategory === 'lunch'),
    dinner: dailyLog.foods.filter((f) => f.mealCategory === 'dinner'),
    snacks: dailyLog.foods.filter((f) => f.mealCategory === 'snacks'),
  };

  const handleOpenAddFood = (category: MealCategory) => {
    triggerHaptic('light');
    setSelectedMealCategory(category);
    setShowAddFoodModal(true);
  };

  const handleQuickAddCalories = (calories: number) => {
    triggerHaptic('medium');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const item: FoodItem = {
      id: `f_quick_${Date.now()}`,
      name: `Quick Add (+${calories} kcal)`,
      mealCategory: selectedMealCategory,
      calories,
      proteinG: Math.round(calories * 0.05), // rough breakdown
      carbsG: Math.round(calories * 0.12),
      fatsG: Math.round(calories * 0.03),
      loggedAt: timeStr,
    };
    StorageRepository.addFoodItem(item, dailyLog.date);
  };

  const handleSelectPresetFood = (preset: typeof COMMON_FOOD_SUGGESTIONS[0]) => {
    triggerHaptic('light');
    setFoodName(preset.name);
    setFoodCalories(preset.calories);
    setFoodProtein(preset.proteinG);
    setFoodCarbs(preset.carbsG);
    setFoodFats(preset.fatsG);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || foodCalories === '') return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newFood: FoodItem = {
      id: `f_${Date.now()}`,
      name: foodName.trim(),
      mealCategory: selectedMealCategory,
      calories: Number(foodCalories),
      proteinG: Number(foodProtein) || 0,
      carbsG: Number(foodCarbs) || 0,
      fatsG: Number(foodFats) || 0,
      loggedAt: timeStr,
    };

    StorageRepository.addFoodItem(newFood, dailyLog.date);
    triggerHaptic('success');
    setShowAddFoodModal(false);
    setFoodName('');
    setFoodCalories('');
    setFoodProtein('');
    setFoodCarbs('');
    setFoodFats('');
  };

  const handleDeleteFood = (id: string) => {
    triggerHaptic('light');
    StorageRepository.deleteFoodItem(id, dailyLog.date);
  };

  const handleToggleSchedule = (cat: MealCategory) => {
    triggerHaptic('medium');
    StorageRepository.toggleMealSchedule(cat, dailyLog.date);
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Diet & Nutrition</h1>
          <p className="text-xs text-slate-400">Meal routines, macro targets & food log</p>
        </div>

        {/* Macro Target Calculator Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setShowCalculatorModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#141C26] hover:bg-[#1C2634] border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          title="Recalculate Daily Macro Targets"
        >
          <Calculator className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>Macro Calc</span>
        </button>
      </div>

      {/* Daily Target Progress Strip */}
      <div className="bg-[#10161F] border border-[#1C2735] rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#00FF66]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Daily Target Status
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {totalCalories} / {userMetrics.targetCalories} kcal
          </span>
        </div>

        {/* Multi-segmented Macro progress bar */}
        <div className="w-full h-2.5 bg-[#17202B] rounded-full overflow-hidden flex">
          <div
            className="bg-sky-400 transition-all duration-500"
            style={{ width: `${Math.min(33, (totalProtein / userMetrics.targetProteinG) * 33)}%` }}
            title="Protein"
          />
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${Math.min(34, (totalCarbs / userMetrics.targetCarbsG) * 34)}%` }}
            title="Carbs"
          />
          <div
            className="bg-rose-400 transition-all duration-500"
            style={{ width: `${Math.min(33, (totalFats / userMetrics.targetFatsG) * 33)}%` }}
            title="Fats"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <span className="text-sky-400">P: {totalProtein}g ({userMetrics.targetProteinG}g)</span>
          <span className="text-amber-400">C: {totalCarbs}g ({userMetrics.targetCarbsG}g)</span>
          <span className="text-rose-400">F: {totalFats}g ({userMetrics.targetFatsG}g)</span>
        </div>
      </div>

      {/* RECOMMENDED DAILY MEAL SCHEDULE (Eat Times with Completion Toggles) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Daily Meal Schedule
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {mealScheduleData.map((item) => {
            const isDone = dailyLog.completedSchedules[item.category];
            return (
              <button
                key={item.category}
                onClick={() => handleToggleSchedule(item.category)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                  isDone
                    ? 'bg-[#00FF66]/10 border-[#00FF66]/40'
                    : 'bg-[#10161F] border-[#1C2735] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-mono font-medium text-slate-400">
                      {item.time}
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold mt-0.5 ${isDone ? 'text-[#00FF66]' : 'text-white'}`}>
                    {item.label}
                  </h4>
                </div>

                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-[#00FF66] shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUICK ADD CALORIES ROW */}
      <div className="bg-[#10161F] border border-[#1C2735] rounded-2xl p-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">Quick Calorie Boost</span>
        <div className="flex items-center gap-1.5">
          {[100, 250, 500].map((amt) => (
            <button
              key={amt}
              onClick={() => handleQuickAddCalories(amt)}
              className="px-2.5 py-1 rounded-xl bg-[#16202C] hover:bg-[#202C3D] text-[#00FF66] border border-[#00FF66]/30 text-xs font-mono font-bold transition-all active:scale-95"
            >
              +{amt}
            </button>
          ))}
        </div>
      </div>

      {/* 4 STRUCTURED MEAL SLOTS */}
      <div className="space-y-3">
        {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealCategory[]).map((cat) => {
          const foods = foodsByCategory[cat];
          const catCalories = foods.reduce((acc, f) => acc + f.calories, 0);
          const catProtein = foods.reduce((acc, f) => acc + f.proteinG, 0);

          const titles: Record<MealCategory, string> = {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snacks: 'Snacks & Extras',
          };

          return (
            <div
              key={cat}
              className="bg-[#10161F] border border-[#1C2735] rounded-3xl p-4 shadow-md space-y-3"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-white capitalize">{titles[cat]}</h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {catCalories} kcal · {catProtein}g Protein
                  </span>
                </div>

                <button
                  onClick={() => handleOpenAddFood(cat)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#16202C] hover:bg-[#1F2C3D] text-[#00FF66] border border-[#00FF66]/30 text-xs font-semibold transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Food</span>
                </button>
              </div>

              {/* Logged Foods List */}
              {foods.length === 0 ? (
                <p className="text-xs text-slate-500 py-1 italic">
                  No food logged in this slot yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      className="bg-[#141C26] rounded-2xl p-2.5 flex items-center justify-between border border-slate-800/60"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{food.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{food.loggedAt}</span>
                          <span>·</span>
                          <span className="text-sky-400">{food.proteinG}g P</span>
                          <span>·</span>
                          <span className="text-amber-400">{food.carbsG}g C</span>
                          <span>·</span>
                          <span className="text-rose-400">{food.fatsG}g F</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          {food.calories} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteFood(food.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Delete Food"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD CUSTOM FOOD MODAL */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121820] border border-[#1E2938] rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm capitalize">
                Log Food to {selectedMealCategory}
              </h3>
              <button
                onClick={() => setShowAddFoodModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions Carousel */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Suggestions (Tap to Autofill)
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {COMMON_FOOD_SUGGESTIONS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPresetFood(preset)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#16202C] hover:bg-[#1E2B3B] text-[11px] text-slate-200 border border-slate-700/80 whitespace-nowrap transition-colors"
                  >
                    {preset.name} ({preset.calories}k)
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSaveFood} className="space-y-3 text-xs overflow-y-auto">
              <div>
                <label className="block text-slate-400 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Chicken & Sweet Potato"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF66]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 450"
                  value={foodCalories}
                  onChange={(e) =>
                    setFoodCalories(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00FF66]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sky-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 35"
                    value={foodProtein}
                    onChange={(e) =>
                      setFoodProtein(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-amber-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 45"
                    value={foodCarbs}
                    onChange={(e) =>
                      setFoodCarbs(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-rose-400 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 12"
                    value={foodFats}
                    onChange={(e) =>
                      setFoodFats(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full bg-[#0D1219] border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#00FF66] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#00e65c] transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] mt-2"
              >
                Log Meal Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MACRO TARGET CALCULATOR MODAL */}
      {showCalculatorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121820] border border-[#1E2938] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#00FF66]" />
                <h3 className="font-bold text-white text-sm">Macro Target Calculator</h3>
              </div>
              <button
                onClick={() => setShowCalculatorModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Calculates BMR & TDEE using the clinical Mifflin-St Jeor equation adjusted for your activity level and fitness goal.
            </p>

            {/* Calculated Values Preview */}
            {(() => {
              const calc = calculateMacros(
                userMetrics.weightKg,
                userMetrics.heightCm,
                userMetrics.age,
                userMetrics.gender,
                userMetrics.activityLevel,
                userMetrics.fitnessGoal
              );

              return (
                <div className="space-y-3">
                  <div className="bg-[#0C1017] p-3 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Target Calories:</span>
                      <span className="font-mono font-bold text-[#00FF66] text-base">
                        {calc.calories} kcal/day
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-sky-400 font-semibold">Protein</span>
                        <p className="font-mono font-bold text-white">{calc.proteinG}g</p>
                      </div>
                      <div>
                        <span className="text-amber-400 font-semibold">Carbs</span>
                        <p className="font-mono font-bold text-white">{calc.carbsG}g</p>
                      </div>
                      <div>
                        <span className="text-rose-400 font-semibold">Fats</span>
                        <p className="font-mono font-bold text-white">{calc.fatsG}g</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('success');
                      const updated: UserMetrics = {
                        ...userMetrics,
                        targetCalories: calc.calories,
                        targetProteinG: calc.proteinG,
                        targetCarbsG: calc.carbsG,
                        targetFatsG: calc.fatsG,
                        targetWaterMl: calc.waterMl,
                      };
                      StorageRepository.saveUserMetrics(updated);
                      onUpdateMetrics(updated);
                      setShowCalculatorModal(false);
                    }}
                    className="w-full py-3 rounded-2xl bg-[#00FF66] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#00e65c] transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                  >
                    Apply Targets to Profile
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
