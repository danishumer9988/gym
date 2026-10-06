import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Smartphone, 
  Monitor, 
  Database, 
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { StorageRepository } from '../services/storage';
import { ThemeMode } from '../types/fitness';
import { FitnessAppLogo } from './VisualAssets';
import { triggerHaptic } from '../utils/audio';

interface AndroidFrameProps {
  children: React.ReactNode;
  themeMode: ThemeMode;
  onToggleTheme: (mode: ThemeMode) => void;
  showRoomInspector: boolean;
  setShowRoomInspector: (show: boolean) => void;
  onOpenNativeAndroidModal?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ 
  children,
  themeMode,
  onToggleTheme,
  showRoomInspector,
  setShowRoomInspector,
  onOpenNativeAndroidModal,
}) => {
  const isDark = themeMode === 'dark';
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('09:30');
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  const handleResetDemo = () => {
    StorageRepository.resetToDemo();
    triggerToast('Room SQLite Database reset to Demo state');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start p-0 sm:py-6 transition-colors duration-200 selection:bg-[#00E676] selection:text-black ${
      isDark ? 'bg-[#07090C] text-slate-100' : 'bg-[#E5E9EE] text-slate-900'
    }`}>
      {/* Top Development & Architecture Bar */}
      <div className={`w-full max-w-4xl px-4 py-2 flex items-center justify-between text-xs border-b sm:border sm:rounded-2xl backdrop-blur-md mb-0 sm:mb-6 transition-colors ${
        isDark 
          ? 'bg-[#0D1117]/85 border-slate-800/80 text-slate-400' 
          : 'bg-white/85 border-slate-300 text-slate-600 shadow-sm'
      }`}>
        <div className="flex items-center gap-2.5">
          <FitnessAppLogo size={28} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm">
              <span className={isDark ? 'text-white' : 'text-slate-900'}>PulseFit</span>
              <span className="text-[#00E676]">Android</span>
            </div>
            <span className="hidden sm:inline text-[10px] text-slate-400">
              Jetpack Compose UI & Room Database
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Theme Toggle (Sun / Moon) */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleTheme(isDark ? 'light' : 'dark');
            }}
            className={`p-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
              isDark 
                ? 'bg-[#161D26] hover:bg-[#1E2734] text-amber-400 border-slate-700/60' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Toggle Light / Dark Mode"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Native Android / Install App Button */}
          {onOpenNativeAndroidModal && (
            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenNativeAndroidModal();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00E676]/15 hover:bg-[#00E676]/25 text-[#00E676] border border-[#00E676]/40 text-xs font-bold transition-all"
              title="Native Android App, Install to Phone or Export Kotlin Project"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Native Android</span>
            </button>
          )}

          {/* Room DB Inspector Button */}
          <button
            onClick={() => setShowRoomInspector(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-[#161D26] hover:bg-[#1E2734] text-slate-300 hover:text-[#00E676] border-slate-700/60' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black border-slate-300'
            }`}
            title="Inspect Android Room Database Architecture"
          >
            <Database className="w-3.5 h-3.5 text-[#00E676]" />
            <span className="hidden sm:inline">Room DB</span>
          </button>

          {/* Toggle Device Frame Button */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-[#161D26] hover:bg-[#1E2734] text-slate-300 hover:text-white border-slate-700/60' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black border-slate-300'
            }`}
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#00E676]" />
                <span className="hidden sm:inline">Wide View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#00E676]" />
                <span className="hidden sm:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? `max-w-[430px] rounded-none sm:rounded-[48px] border-0 sm:border-[8px] ${
                isDark 
                  ? 'border-[#1C2532] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(0,230,118,0.1)] bg-[#0B0E13]' 
                  : 'border-[#CAD3DE] shadow-[0_25px_60px_rgba(0,0,0,0.15)] bg-[#F8FAFC]'
              } overflow-hidden flex flex-col min-h-screen sm:min-h-[890px] sm:max-h-[925px] relative`
            : `max-w-2xl rounded-2xl border ${
                isDark ? 'border-slate-800 bg-[#0B0E13]' : 'border-slate-300 bg-[#F8FAFC]'
              } shadow-2xl flex flex-col min-h-screen`
        }`}
      >
        {/* Android Status Bar */}
        <div className={`shrink-0 h-10 px-6 flex items-center justify-between text-xs select-none z-30 pt-1 transition-colors ${
          isDark ? 'bg-[#0B0E13] text-slate-400' : 'bg-[#F8FAFC] text-slate-600'
        }`}>
          <span className={`font-semibold tracking-tight text-[13px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {currentTime}
          </span>

          {/* Front camera hole punch (only in phone frame mode) */}
          {isPhoneFrame && (
            <div className="w-4 h-4 rounded-full bg-black ring-1 ring-slate-700/60 mx-auto" />
          )}

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono">98%</span>
              <BatteryMedium className="w-4 h-4 text-[#00E676]" />
            </div>
          </div>
        </div>

        {/* Top App Header with Geometric Dumbbell + Lightning Logo */}
        <div className={`shrink-0 px-4 py-2 border-b flex items-center justify-between transition-colors ${
          isDark ? 'bg-[#0E131A] border-[#1C2735]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <FitnessAppLogo size={26} />
            <div>
              <span className={`font-extrabold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                PulseFit
              </span>
              <span className="ml-1 text-[10px] font-bold text-[#00E676]">PRO</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('light');
                onToggleTheme(isDark ? 'light' : 'dark');
              }}
              className={`p-1.5 rounded-xl border transition-colors ${
                isDark 
                  ? 'bg-[#151D28] text-amber-400 border-slate-800 hover:bg-[#1E2938]' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* App Content Body */}
        <div className={`flex-1 overflow-y-auto flex flex-col relative transition-colors ${
          isDark ? 'bg-[#0B0E13]' : 'bg-[#F8FAFC]'
        }`}>
          {children}
        </div>

        {/* Android Navigation Gesture Pill Bar (in Phone Frame Mode) */}
        {isPhoneFrame && (
          <div className={`shrink-0 h-4 flex items-center justify-center pb-1 ${
            isDark ? 'bg-[#0E131A]' : 'bg-white'
          }`}>
            <div className="w-32 h-1 bg-slate-500 rounded-full" />
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#161D26] border border-[#00E676]/60 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Room DB Architecture Inspector Modal */}
      {showRoomInspector && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F141C] border border-[#1E2938] rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Android Room Database Architecture</h3>
                  <p className="text-xs text-slate-400">Offline SQLite Schemas, Steps & Workout DAOs</p>
                </div>
              </div>
              <button
                onClick={() => setShowRoomInspector(false)}
                className="px-3 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 text-xs font-mono">
              <div className="bg-[#07090C] p-4 rounded-xl border border-slate-800">
                <div className="text-[#00E676] font-bold mb-1">// Room Entity: StepSensorEntity</div>
                <pre className="text-slate-300 overflow-x-auto whitespace-pre">
{`@Entity(tableName = "step_records")
data class StepRecordEntity(
    @PrimaryKey val date: String, // "YYYY-MM-DD"
    val steps: Int,
    val goal: Int,
    val distanceKm: Double,
    val caloriesBurned: Int
)

@Dao
interface StepDao {
    @Query("SELECT * FROM step_records WHERE date = :dateKey LIMIT 1")
    fun getStepsByDate(dateKey: String): Flow<StepRecordEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(record: StepRecordEntity)
}`}
                </pre>
              </div>

              <div className="bg-[#07090C] p-4 rounded-xl border border-slate-800">
                <div className="text-[#00E676] font-bold mb-1">// Room Entity: PersonalRecordEntity</div>
                <pre className="text-slate-300 overflow-x-auto whitespace-pre">
{`@Entity(tableName = "personal_records")
data class PersonalRecordEntity(
    @PrimaryKey val id: String,
    val exerciseName: String,
    val weight: Double,
    val reps: Int,
    val date: String
)

@Dao
interface PersonalRecordDao {
    @Query("SELECT * FROM personal_records ORDER BY weight DESC")
    fun getAllPRs(): Flow<List<PersonalRecordEntity>>
}`}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Status: SQLite Offline Layer Verified</span>
              <button
                onClick={() => setShowRoomInspector(false)}
                className="px-4 py-2 rounded-xl bg-[#00E676] text-black font-semibold hover:bg-[#00c853]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
