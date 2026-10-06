import React, { useEffect, useState, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Plus, Minus, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';

interface RestTimerProps {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

export const RestTimerModal: React.FC<RestTimerProps> = ({
  initialSeconds = 60,
  isOpen,
  onClose,
  onFinish,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const prevSecondsRef = useRef(remainingSeconds);

  useEffect(() => {
    if (isOpen) {
      setTotalSeconds(initialSeconds);
      setRemainingSeconds(initialSeconds);
      setIsRunning(true);
    }
  }, [isOpen, initialSeconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isOpen && isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (soundEnabled) {
              sound.playTimerFinishedChime();
            }
            triggerHaptic('success');
            setIsRunning(false);
            if (onFinish) onFinish();
            return 0;
          }
          if (prev <= 4 && prev > 1 && soundEnabled) {
            sound.playCountdownTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isRunning, remainingSeconds, soundEnabled, onFinish]);

  if (!isOpen) return null;

  const progress = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAdjust = (delta: number) => {
    triggerHaptic('light');
    setRemainingSeconds((prev) => {
      const next = Math.max(5, prev + delta);
      if (next > totalSeconds) {
        setTotalSeconds(next);
      }
      return next;
    });
  };

  const setPreset = (secs: number) => {
    triggerHaptic('medium');
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setIsRunning(true);
  };

  // Minimized Floating Pill View
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 bg-[#161D26] border border-[#00FF66]/40 rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-3 animate-bounce-short">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
        <span className="font-mono font-bold text-white text-sm tabular-nums">
          Rest: {formatTime(remainingSeconds)}
        </span>
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsRunning(!isRunning);
          }}
          className="text-slate-300 hover:text-white"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#00FF66]" />}
        </button>
        <button
          onClick={() => setIsMinimized(false)}
          className="text-slate-400 hover:text-white"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-rose-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-[#121820] border border-[#1E2938] rounded-3xl p-5 shadow-2xl relative flex flex-col items-center">
        {/* Header Controls */}
        <div className="w-full flex items-center justify-between mb-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              setSoundEnabled(!soundEnabled);
            }}
            className="p-2 text-slate-400 hover:text-[#00FF66] transition-colors"
            title={soundEnabled ? 'Mute' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00FF66]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Rest Interval
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-44 h-44 flex items-center justify-center my-3">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#1E2734"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Neon Green Fill */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#00FF66"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-linear"
            />
          </svg>

          {/* Time in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-white tracking-tight font-mono tabular-nums">
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-[11px] text-[#00FF66] font-medium tracking-wide mt-1">
              {remainingSeconds === 0 ? 'READY FOR NEXT SET!' : isRunning ? 'RECOVERING...' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Quick Add / Minus Adjustment */}
        <div className="flex items-center gap-3 my-2">
          <button
            onClick={() => handleAdjust(-15)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#18202C] hover:bg-[#202B3B] text-slate-300 text-xs font-medium transition-colors border border-slate-700/60"
          >
            <Minus className="w-3 h-3 text-rose-400" />
            <span>15s</span>
          </button>
          <button
            onClick={() => handleAdjust(15)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#18202C] hover:bg-[#202B3B] text-slate-300 text-xs font-medium transition-colors border border-slate-700/60"
          >
            <Plus className="w-3 h-3 text-[#00FF66]" />
            <span>15s</span>
          </button>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-1.5 w-full mt-2">
          {[30, 60, 90, 120].map((preset) => (
            <button
              key={preset}
              onClick={() => setPreset(preset)}
              className={`py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                totalSeconds === preset
                  ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]'
                  : 'bg-[#161D26] border-[#222E3D] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {preset}s
            </button>
          ))}
        </div>

        {/* Main Action Buttons */}
        <div className="flex items-center gap-2 w-full mt-4">
          <button
            onClick={() => {
              triggerHaptic('medium');
              setIsRunning(!isRunning);
            }}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-[#00FF66] text-black hover:bg-[#00e65c] shadow-[0_0_15px_rgba(0,255,102,0.3)]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Resume
              </>
            )}
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl font-medium text-xs text-slate-300 bg-[#1A232E] hover:bg-[#222E3D] border border-[#273547] transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
