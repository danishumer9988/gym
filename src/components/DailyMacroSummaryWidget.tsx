import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  Utensils, 
  Trash2, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Layers, 
  Zap, 
  Droplet, 
  Dumbbell, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { DailyLog, FoodItem, MealCategory, ThemeMode, UserMetrics } from '../types/fitness';
import { StorageRepository } from '../services/storage';
import { COMMON_FOOD_SUGGESTIONS } from '../data/defaultData';
import { triggerHaptic } from '../utils/audio';

interface DailyMacroSummaryWidgetProps {
  dailyLog: DailyLog;
  userMetrics: UserMetrics;
  themeMode: ThemeMode;
}

export const DailyMacroSummaryWidget: React.FC<DailyMacroSummaryWidgetProps> = ({
  dailyLog,
  userMetrics,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';

  const [showLogModal, setShowLogModal] = useState(false);
  const [showMealList, setShowMealList] = useState(false);

  // Form State for manual entry
  const [foodName, setFoodName] = useState('');
  const [mealCategory, setMealCategory] = useState<MealCategory>('breakfast');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fats, setFats] = useState<number | ''>('');
  const [showToast, setShowToast] = useState<string | null>(null);

  // Ensure safe foods list
  const foods = dailyLog.foods || [];

  // Core calculations
  const totalCalories = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const totalProtein = foods.reduce((acc, f) => acc + (f.proteinG || 0), 0);
  const totalCarbs = foods.reduce((acc, f) => acc + (f.carbsG || 0), 0);
  const totalFats = foods.reduce((acc, f) => acc + (f.fatsG || 0), 0);

  // User Targets
  const targetCalories = userMetrics.targetCalories || 2400;
  const targetProtein = userMetrics.targetProteinG || 160;
  const targetCarbs = userMetrics.targetCarbsG || 230;
  const targetFats = userMetrics.targetFatsG || 65;

  // Percentage of goals
  const calPercent = Math.min(100, Math.round((totalCalories / (targetCalories || 1)) * 100));
  const proteinPercent = Math.min(100, Math.round((totalProtein / (targetProtein || 1)) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / (targetCarbs || 1)) * 100));
  const fatsPercent = Math.min(100, Math.round((totalFats / (targetFats || 1)) * 100));

  // Energy distribution (kcal from each macro)
  const proteinKcal = totalProtein * 4;
  const carbsKcal = totalCarbs * 4;
  const fatsKcal = totalFats * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatsKcal || 1;

  const proteinEnergyPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const carbsEnergyPct = Math.round((carbsKcal / totalMacroKcal) * 100);
  const fatsEnergyPct = Math.round((fatsKcal / totalMacroKcal) * 100);

  const remainingCalories = Math.max(0, targetCalories - totalCalories);

  const triggerNotification = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || calories === '') return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newFood: FoodItem = {
      id: `food_${Date.now()}`,
      name: foodName.trim(),
      mealCategory,
      calories: Number(calories) || 0,
      proteinG: Number(protein) || 0,
      carbsG: Number(carbs) || 0,
      fatsG: Number(fats) || 0,
      loggedAt: timeStr,
    };

    StorageRepository.addFoodItem(newFood);
    triggerHaptic('success');
    triggerNotification(`Logged "${newFood.name}"`);

    // Reset Form
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setShowLogModal(false);
  };

  const handleQuickAddPreset = (suggestion: typeof COMMON_FOOD_SUGGESTIONS[0]) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newFood: FoodItem = {
      id: `food_preset_${Date.now()}`,
      name: suggestion.name,
      mealCategory,
      calories: suggestion.calories,
      proteinG: suggestion.proteinG,
      carbsG: suggestion.carbsG,
      fatsG: suggestion.fatsG,
      loggedAt: timeStr,
    };

    StorageRepository.addFoodItem(newFood);
    triggerHaptic('success');
    triggerNotification(`Added ${suggestion.name}`);
  };

  const handleDeleteFood = (id: string, name: string) => {
    StorageRepository.deleteFoodItem(id);
    triggerHaptic('light');
    triggerNotification(`Removed ${name}`);
  };

  return (
    <div 
      className={`rounded-3xl p-5 border shadow-xl relative overflow-hidden transition-colors ${
        isDark ? 'bg-[#10161F] border-[#1C2735]' : 'bg-white border-slate-200'
      }`}
    >
      {/* Top Ambient Glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. WIDGET HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#00E676]/15 flex items-center justify-center text-[#00E676] shrink-0">
            <Utensils className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Daily Macro-Nutrient Summary
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] font-bold border border-[#00E676]/30">
                {foods.length} Logged
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Real-time daily protein, carbs, and fats calculation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {foods.length > 0 && (
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowMealList(!showMealList);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isDark 
                  ? 'bg-[#151D28] text-slate-300 border-slate-800 hover:text-white' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:text-black'
              }`}
              title="Toggle list of logged meals today"
            >
              <span>{showMealList ? 'Hide Meals' : 'View Meals'}</span>
              {showMealList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={() => {
              triggerHaptic('light');
              setShowLogModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00c853] transition-all shadow-[0_0_12px_rgba(0,230,118,0.25)] active:scale-95"
            title="Log new meal or snack"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Log Nutrition</span>
          </button>
        </div>
      </div>

      {/* 2. CALORIE BUDGET BAR */}
      <div className="py-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono tracking-tight tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalCalories.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              / {targetCalories.toLocaleString()} kcal
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#00E676]">
              {calPercent}% Target Met
            </span>
            <span className="text-[11px] text-slate-400 block">
              {remainingCalories > 0 ? `${remainingCalories.toLocaleString()} kcal remaining` : 'Target reached!'}
            </span>
          </div>
        </div>

        {/* Calorie Fill Progress */}
        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#16202C]' : 'bg-slate-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-[#00E676] to-[#00b0ff] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, (totalCalories / targetCalories) * 100)}%` }}
          />
        </div>
      </div>

      {/* 3. CORE MACRO-NUTRIENT COLUMNS (PROTEIN, CARBS, FATS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* PROTEIN CARD */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#141C26] border-slate-800/80 hover:border-[#00E676]/40' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">
                Protein
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {proteinPercent}% Goal
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {totalProtein}g
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {targetProtein}g
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {proteinKcal} kcal
            </span>
          </div>

          {/* Progress Bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#0E131A]' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-[#00E676] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,230,118,0.4)]"
              style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>Muscle synthesis</span>
            <span className="font-mono">{targetProtein > totalProtein ? `${targetProtein - totalProtein}g left` : 'Completed'}</span>
          </div>
        </div>

        {/* CARBOHYDRATES CARD */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#141C26] border-slate-800/80 hover:border-sky-500/40' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Carbohydrates
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {carbsPercent}% Goal
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {totalCarbs}g
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {targetCarbs}g
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {carbsKcal} kcal
            </span>
          </div>

          {/* Progress Bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#0E131A]' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-[#38BDF8] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
              style={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>Glycogen energy</span>
            <span className="font-mono">{targetCarbs > totalCarbs ? `${targetCarbs - totalCarbs}g left` : 'Completed'}</span>
          </div>
        </div>

        {/* HEALTHY FATS CARD */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#141C26] border-slate-800/80 hover:border-amber-500/40' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Fats
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {fatsPercent}% Goal
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {totalFats}g
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {targetFats}g
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {fatsKcal} kcal
            </span>
          </div>

          {/* Progress Bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#0E131A]' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-[#F59E0B] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              style={{ width: `${Math.min(100, (totalFats / targetFats) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>Hormonal support</span>
            <span className="font-mono">{targetFats > totalFats ? `${targetFats - totalFats}g left` : 'Completed'}</span>
          </div>
        </div>
      </div>

      {/* 4. MACRO ENERGY RATIO DISTRIBUTION BAR */}
      <div className={`mt-4 p-3 rounded-2xl border ${
        isDark ? 'bg-[#0E131A] border-slate-800' : 'bg-slate-100/70 border-slate-200'
      }`}>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
          <span>Macro Caloric Ratio</span>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="text-[#00E676]">{proteinEnergyPct}% Protein</span>
            <span className="text-sky-400">{carbsEnergyPct}% Carbs</span>
            <span className="text-amber-400">{fatsEnergyPct}% Fats</span>
          </div>
        </div>

        {/* Multi-segmented ratio bar */}
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800">
          <div 
            style={{ width: `${proteinEnergyPct}%` }}
            className="bg-[#00E676] transition-all duration-300"
            title={`Protein: ${proteinEnergyPct}%`}
          />
          <div 
            style={{ width: `${carbsEnergyPct}%` }}
            className="bg-[#38BDF8] transition-all duration-300"
            title={`Carbs: ${carbsEnergyPct}%`}
          />
          <div 
            style={{ width: `${fatsEnergyPct}%` }}
            className="bg-[#F59E0B] transition-all duration-300"
            title={`Fats: ${fatsEnergyPct}%`}
          />
        </div>
      </div>

      {/* 5. EXPANDABLE LOGGED MEALS LIST */}
      {showMealList && foods.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Today's Logged Foods</span>
            <span>{foods.length} items recorded</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {foods.map((food) => (
              <div
                key={food.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                  isDark ? 'bg-[#141C26] border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold truncate text-xs">
                      {food.name}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 shrink-0">
                      {food.mealCategory}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span className="text-[#00E676]">{food.proteinG}g P</span>
                    <span className="text-sky-400">{food.carbsG}g C</span>
                    <span className="text-amber-400">{food.fatsG}g F</span>
                    <span>·</span>
                    <span>{food.loggedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-xs text-slate-300">
                    {food.calories} kcal
                  </span>
                  <button
                    onClick={() => handleDeleteFood(food.id, food.name)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. MODAL: LOG FOOD & QUICK PRESETS */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className={`w-full max-w-lg rounded-3xl p-5 shadow-2xl border flex flex-col max-h-[92vh] ${
            isDark ? 'bg-[#0F141C] border-[#1C2735] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00E676]/15 text-[#00E676] flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">Log Daily Nutrition</h3>
                  <p className="text-[11px] text-slate-400">Calculate Protein, Carbs, and Fats</p>
                </div>
              </div>

              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
              {/* Quick Add Presets */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  1-Click Athlete Staples:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_FOOD_SUGGESTIONS.slice(0, 4).map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickAddPreset(sug)}
                      className={`p-2.5 rounded-xl border text-left transition-all group flex flex-col justify-between ${
                        isDark 
                          ? 'bg-[#141C26] border-slate-800 hover:border-[#00E676]/50 hover:bg-[#1A2432]' 
                          : 'bg-slate-50 border-slate-200 hover:border-[#00E676]'
                      }`}
                    >
                      <span className="text-xs font-bold truncate group-hover:text-[#00E676] transition-colors">
                        {sug.name}
                      </span>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                        <span>{sug.calories} kcal</span>
                        <span className="text-[#00E676] font-bold">{sug.proteinG}g P</span>
                        <span className="text-sky-400">{sug.carbsG}g C</span>
                        <span className="text-amber-400">{sug.fatsG}g F</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Food Form */}
              <form onSubmit={handleAddCustomFood} className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Or Enter Custom Food Item:
                </span>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Food Name / Meal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salmon Bowl with Quinoa"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00E676] border ${
                      isDark ? 'bg-[#141C26] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Meal Slot
                    </label>
                    <select
                      value={mealCategory}
                      onChange={(e) => setMealCategory(e.target.value as MealCategory)}
                      className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00E676] border capitalize ${
                        isDark ? 'bg-[#141C26] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snacks">Snacks</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 450"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#00E676] border ${
                        isDark ? 'bg-[#141C26] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Macros 3-Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[#00E676] block mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 35"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full rounded-xl px-2.5 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#00E676] border ${
                        isDark ? 'bg-[#141C26] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-sky-400 block mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 50"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full rounded-xl px-2.5 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-400 border ${
                        isDark ? 'bg-[#141C26] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-amber-400 block mb-1">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 12"
                      value={fats}
                      onChange={(e) => setFats(e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full rounded-xl px-2.5 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 border ${
                        isDark ? 'bg-[#141C26] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:bg-[#00c853] transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Save Food & Calculate Macros</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Feedback */}
      {showToast && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 py-1.5 px-3 rounded-xl bg-[#00E676] text-black text-xs font-bold shadow-lg animate-fade-in pointer-events-none z-30">
          {showToast}
        </div>
      )}
    </div>
  );
};
