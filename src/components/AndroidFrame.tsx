import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Smartphone, 
  Monitor, 
  Database, 
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { StorageRepository } from '../services/storage';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('09:14');
  const [showRoomInspector, setShowRoomInspector] = useState(false);
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
    <div className="min-h-screen bg-[#07090C] text-slate-100 flex flex-col items-center justify-start p-0 sm:py-6 selection:bg-[#00FF66] selection:text-black">
      {/* Top Development & Architecture Bar */}
      <div className="w-full max-w-4xl px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b sm:border border-slate-800/80 sm:rounded-2xl bg-[#0D1117]/80 backdrop-blur-md mb-0 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
          <span className="font-semibold text-slate-200">PulseFit Android App</span>
          <span className="hidden sm:inline text-slate-500">·</span>
          <span className="hidden sm:inline text-slate-400">Jetpack Compose UI & Room Database</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Room DB Inspector Button */}
          <button
            onClick={() => setShowRoomInspector(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161D26] hover:bg-[#1E2734] text-slate-300 hover:text-[#00FF66] border border-slate-700/60 transition-colors"
            title="Inspect Android Room Database Architecture"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Room DB Architecture</span>
            <span className="sm:hidden">Room DB</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161D26] hover:bg-[#1E2734] text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Reset to fresh demo dataset"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Toggle Device Frame Button */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161D26] hover:bg-[#1E2734] text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#00FF66]" />
                <span className="hidden sm:inline">Expand View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#00FF66]" />
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
            ? 'max-w-[430px] rounded-none sm:rounded-[48px] border-0 sm:border-[8px] border-[#1C2532] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_30px_rgba(0,255,102,0.08)] overflow-hidden flex flex-col bg-[#0B0E13] min-h-screen sm:min-h-[880px] sm:max-h-[920px] relative'
            : 'max-w-2xl rounded-2xl border border-slate-800 bg-[#0B0E13] shadow-2xl flex flex-col min-h-screen'
        }`}
      >
        {/* Android Status Bar */}
        <div className="shrink-0 h-10 px-6 bg-[#0B0E13] flex items-center justify-between text-xs text-slate-400 select-none z-30 pt-1">
          <span className="font-semibold text-slate-300 tracking-tight text-[13px]">{currentTime}</span>

          {/* Front camera hole punch (only in phone frame mode) */}
          {isPhoneFrame && (
            <div className="w-4 h-4 rounded-full bg-black ring-1 ring-slate-800/80 mx-auto" />
          )}

          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[10px] font-bold text-slate-300">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-slate-400 font-mono">98%</span>
              <BatteryMedium className="w-4 h-4 text-[#00FF66]" />
            </div>
          </div>
        </div>

        {/* App Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col relative bg-[#0B0E13]">
          {children}
        </div>

        {/* Android Navigation Gesture Pill Bar (in Phone Frame Mode) */}
        {isPhoneFrame && (
          <div className="shrink-0 h-4 bg-[#0E1217] flex items-center justify-center pb-1">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#161D26] border border-[#00FF66]/50 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Room DB Architecture Inspector Modal */}
      {showRoomInspector && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F141C] border border-[#1E2938] rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00FF66]/15 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Android Room Database Architecture</h3>
                  <p className="text-xs text-slate-400">Offline-first local SQLite schema & DAOs</p>
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
                <div className="text-[#00FF66] font-bold mb-1">// Room Entity: DailyNutritionLog</div>
                <pre className="text-slate-300 overflow-x-auto whitespace-pre">
{`@Entity(tableName = "daily_logs")
data class DailyLogEntity(
    @PrimaryKey val date: String, // "YYYY-MM-DD"
    val waterIntakeMl: Int,
    val accumulatedWorkoutMinutes: Int,
    val scheduledWorkoutTitle: String,
    val isWorkoutCompletedToday: Boolean
)

@Dao
interface DailyLogDao {
    @Query("SELECT * FROM daily_logs WHERE date = :dateKey LIMIT 1")
    fun getLogByDate(dateKey: String): Flow<DailyLogEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(log: DailyLogEntity)
}`}
                </pre>
              </div>

              <div className="bg-[#07090C] p-4 rounded-xl border border-slate-800">
                <div className="text-[#00FF66] font-bold mb-1">// Room Entity: WorkoutSession & Sets</div>
                <pre className="text-slate-300 overflow-x-auto whitespace-pre">
{`@Entity(tableName = "workout_history")
data class WorkoutLogEntity(
    @PrimaryKey val id: String,
    val routineName: String,
    val date: String,
    val durationSeconds: Long,
    val volumeKg: Double,
    val caloriesBurned: Int,
    val exercisesCompleted: Int
)

@Dao
interface WorkoutDao {
    @Query("SELECT * FROM workout_history ORDER BY id DESC")
    fun getAllWorkoutLogs(): Flow<List<WorkoutLogEntity>>

    @Insert
    suspend fun insertWorkoutLog(log: WorkoutLogEntity)
}`}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Status: Offline Indexed Storage Active</span>
              <button
                onClick={() => setShowRoomInspector(false)}
                className="px-4 py-2 rounded-xl bg-[#00FF66] text-black font-semibold hover:bg-[#00e65c]"
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
