import React, { useState, useRef } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Download, 
  FileDown,
  Check, 
  Sparkles, 
  Trophy, 
  Flame, 
  Clock, 
  Dumbbell, 
  Footprints,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { WorkoutLog, StepRecord, PersonalRecord, UserMetrics, ThemeMode } from '../types/fitness';
import { triggerHaptic } from '../utils/audio';
import { FitnessAppLogo } from './VisualAssets';
import { exportPerformanceReportPdf } from '../utils/pdfExport';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMetrics: UserMetrics;
  workoutLogs: WorkoutLog[];
  stepHistory: StepRecord[];
  personalRecords: PersonalRecord[];
  themeMode: ThemeMode;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  userMetrics,
  workoutLogs,
  stepHistory,
  personalRecords,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState<'card' | 'text'>('card');
  const [copiedText, setCopiedText] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute 7-day stats
  const last7Steps = stepHistory.slice(0, 7);
  const totalSteps7d = last7Steps.reduce((acc, s) => acc + s.steps, 0);
  const avgSteps7d = Math.round(totalSteps7d / (last7Steps.length || 1));
  const totalVolume7d = workoutLogs.slice(0, 4).reduce((acc, w) => acc + w.volumeKg, 0);
  const totalDuration7d = workoutLogs.slice(0, 4).reduce((acc, w) => acc + Math.round(w.durationSeconds / 60), 0);
  const workoutsCount7d = Math.min(workoutLogs.length, 4);

  const topPrs = personalRecords.slice(0, 4);

  const today = new Date();
  const dateRangeStr = `Week of ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Generate plain text report
  const generateTextSummary = () => {
    let text = `⚡ PulseFit Weekly Performance Report ⚡\n`;
    text += `👤 Athlete: ${userMetrics.name}\n`;
    text += `📅 ${dateRangeStr}\n\n`;
    text += `📊 Weekly Highlights:\n`;
    text += `• Workouts: ${workoutsCount7d} sessions completed\n`;
    text += `• Total Volume: ${totalVolume7d.toLocaleString()} ${userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'} lifted\n`;
    text += `• Active Duration: ${totalDuration7d} mins\n`;
    text += `• Total Steps: ${totalSteps7d.toLocaleString()} steps (~${avgSteps7d.toLocaleString()}/day)\n\n`;

    if (topPrs.length > 0) {
      text += `🏆 Personal Records (PRs):\n`;
      topPrs.forEach((pr) => {
        text += `• ${pr.exerciseName}: ${pr.weight} ${userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'} (${pr.reps} reps)\n`;
      });
      text += `\n`;
    }

    text += `🔥 Consistency is key! Tracked offline on PulseFit.`;
    return text;
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleCopyText = async () => {
    triggerHaptic('success');
    const text = generateTextSummary();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      showToast('Text summary copied to clipboard!');
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      showToast('Clipboard access unavailable');
    }
  };

  const handleNativeShare = async () => {
    triggerHaptic('light');
    const text = generateTextSummary();
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `PulseFit Weekly Report - ${userMetrics.name}`,
          text,
        });
        showToast('Shared successfully!');
      } catch (e) {
        // User canceled or failed
      }
    } else {
      handleCopyText();
    }
  };

  // Generate high-resolution graphic card via Canvas
  const handleDownloadScreenshot = () => {
    setDownloadingImage(true);
    triggerHaptic('medium');

    try {
      const canvas = document.createElement('canvas');
      const width = 800;
      const height = 1000;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setDownloadingImage(false);
        return;
      }

      // Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#090D13');
      bgGrad.addColorStop(0.5, '#0E1520');
      bgGrad.addColorStop(1, '#070A0F');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial neon glow
      const radialGlow = ctx.createRadialGradient(width - 100, 100, 10, width - 100, 100, 300);
      radialGlow.addColorStop(0, 'rgba(0, 230, 118, 0.18)');
      radialGlow.addColorStop(1, 'rgba(0, 230, 118, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Outer Card Border
      ctx.strokeStyle = '#1E2C3D';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Top Accent Line
      ctx.strokeStyle = '#00E676';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(30, 20);
      ctx.lineTo(180, 20);
      ctx.stroke();

      // Brand Logo & Title
      ctx.fillStyle = '#00E676';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillText('⚡ PULSEFIT ATHLETIC REPORT', 50, 75);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(userMetrics.name, 50, 125);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${dateRangeStr} · Offline Room SQLite Verified`, 50, 160);

      // Divider
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 185);
      ctx.lineTo(width - 50, 185);
      ctx.stroke();

      // Section 1: Weekly Performance Highlights (2x2 Grid)
      const renderStatBox = (x: number, y: number, w: number, h: number, title: string, value: string, sub: string, accentColor: string) => {
        ctx.fillStyle = '#121A24';
        ctx.strokeStyle = '#1E2B3C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '600 14px system-ui, -apple-system, sans-serif';
        ctx.fillText(title.toUpperCase(), x + 20, y + 36);

        ctx.fillStyle = accentColor;
        ctx.font = '900 32px monospace, system-ui';
        ctx.fillText(value, x + 20, y + 78);

        ctx.fillStyle = '#64748B';
        ctx.font = '13px system-ui, -apple-system, sans-serif';
        ctx.fillText(sub, x + 20, y + 104);
      };

      const boxW = 335;
      const boxH = 120;
      renderStatBox(50, 215, boxW, boxH, 'Total Volume Lifted', `${totalVolume7d.toLocaleString()} ${userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'}`, 'Across resistance training sets', '#00E676');
      renderStatBox(415, 215, boxW, boxH, 'Workouts Completed', `${workoutsCount7d} Sessions`, 'Progressive overload targets met', '#38BDF8');
      renderStatBox(50, 355, boxW, boxH, 'Active Workout Time', `${totalDuration7d} Minutes`, 'Time under tension & conditioning', '#F59E0B');
      renderStatBox(415, 355, boxW, boxH, 'Total Step Volume', `${totalSteps7d.toLocaleString()}`, `Avg ${avgSteps7d.toLocaleString()} steps/day`, '#00E676');

      // Section 2: Personal Records (PRs)
      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('🏆 PERSONAL RECORDS (PRS)', 50, 525);

      let prY = 550;
      topPrs.forEach((pr) => {
        ctx.fillStyle = '#121A24';
        ctx.strokeStyle = '#1E2B3C';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(50, prY, width - 100, 68, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
        ctx.fillText(pr.exerciseName, 75, prY + 40);

        ctx.fillStyle = '#00E676';
        ctx.font = '900 22px monospace, system-ui';
        const weightStr = `${pr.weight} ${userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'} × ${pr.reps} reps`;
        ctx.fillText(weightStr, width - 290, prY + 41);

        prY += 80;
      });

      // Footer
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, height - 90);
      ctx.lineTo(width - 50, height - 90);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '500 14px system-ui, -apple-system, sans-serif';
      ctx.fillText('PulseFit · Android Material Design 3 · Built For Consistency', 50, height - 55);

      ctx.fillStyle = '#00E676';
      ctx.font = 'bold 14px monospace, system-ui';
      ctx.fillText('VERIFIED ATHLETE', width - 200, height - 55);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `PulseFit_Performance_${userMetrics.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast('Screenshot card exported to PNG!');
    } catch (e) {
      console.error(e);
      showToast('Failed to export screenshot');
    } finally {
      setDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border flex flex-col max-h-[92vh] ${
        isDark ? 'bg-[#0F141C] border-[#1C2735] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00E676]/15 text-[#00E676] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Share Weekly Report</h3>
              <p className="text-[11px] text-slate-400">Generate image card or text summary</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Graphic Card vs Text Message */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl border my-3 ${
          isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('card');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'card'
                ? 'bg-[#00E676] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Screenshot Card</span>
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('text');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'text'
                ? 'bg-[#00E676] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text Summary</span>
          </button>
        </div>

        {/* TAB 1: GRAPHIC SHARE CARD PREVIEW */}
        {activeTab === 'card' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* The Visual Social Share Card */}
            <div className="rounded-2xl p-4 bg-gradient-to-b from-[#0D131B] via-[#101722] to-[#0A0E14] border border-[#1E2D3D] shadow-xl relative overflow-hidden text-left">
              {/* Top ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E676]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <FitnessAppLogo size={24} />
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#00E676] uppercase">
                      PULSEFIT ATHLETE
                    </span>
                    <h4 className="font-extrabold text-sm text-white leading-tight">
                      {userMetrics.name}
                    </h4>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-[#16202C] px-2 py-0.5 rounded-full border border-slate-700/60">
                  {dateRangeStr}
                </span>
              </div>

              {/* Weekly Highlights Grid */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="p-2.5 rounded-xl bg-[#141C26] border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Volume Lifted</span>
                  <p className="text-base font-black font-mono text-[#00E676] mt-0.5">
                    {totalVolume7d.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#141C26] border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Workouts Done</span>
                  <p className="text-base font-black font-mono text-sky-400 mt-0.5">
                    {workoutsCount7d} <span className="text-[10px] text-slate-400 font-normal">sessions</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#141C26] border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Active Time</span>
                  <p className="text-base font-black font-mono text-amber-400 mt-0.5">
                    {totalDuration7d} <span className="text-[10px] text-slate-400 font-normal">mins</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#141C26] border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">Weekly Steps</span>
                  <p className="text-base font-black font-mono text-white mt-0.5">
                    {totalSteps7d.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Top PRs Preview */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 mb-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Personal Records
                  </span>
                </div>

                <div className="space-y-1">
                  {topPrs.map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#141C26]/70 border border-slate-800/60"
                    >
                      <span className="text-slate-300 font-medium truncate max-w-[170px] text-[11px]">
                        {pr.exerciseName}
                      </span>
                      <span className="font-mono font-bold text-[#00E676] text-[11px]">
                        {pr.weight} {userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs'} × {pr.reps}r
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Footer */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span>Verified Offline Training</span>
                <span className="text-[#00E676]">PULSEFIT PRO</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  exportPerformanceReportPdf(userMetrics, workoutLogs, stepHistory, personalRecords);
                  showToast('PDF report generated & downloading!');
                }}
                className="w-full py-3 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:bg-[#00c853] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <FileDown className="w-4 h-4 stroke-[2.5]" />
                <span>Download PDF Report</span>
              </button>

              <button
                onClick={handleDownloadScreenshot}
                disabled={downloadingImage}
                className={`w-full py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 disabled:opacity-50 ${
                  isDark
                    ? 'bg-[#151D28] text-slate-200 border-slate-800 hover:bg-[#1E2938]'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{downloadingImage ? 'Generating...' : 'Download Image Card (PNG)'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className={`w-full py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-[#151D28] text-slate-200 border-slate-800 hover:bg-[#1E2938]'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Share With Friends</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TEXT MESSAGE SUMMARY */}
        {activeTab === 'text' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Formatted Text for WhatsApp, Messages, or Discord:
              </span>

              <div className={`p-3.5 rounded-2xl border font-mono text-[11px] leading-relaxed select-all whitespace-pre-wrap ${
                isDark ? 'bg-[#0A0D12] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {generateTextSummary()}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyText}
                className="w-full py-3 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:bg-[#00c853] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied To Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Text Summary</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNativeShare}
                className={`w-full py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-[#151D28] text-slate-200 border-slate-800 hover:bg-[#1E2938]'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Share via Apps</span>
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div className="mt-2 py-1.5 px-3 rounded-xl bg-[#00E676] text-black text-center text-xs font-bold animate-fade-in">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};
