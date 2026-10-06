import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  FileCode, 
  Copy, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  Code2,
  Terminal,
  Layers,
  ArrowRight
} from 'lucide-react';
import JSZip from 'jszip';
import { ThemeMode } from '../types/fitness';
import { triggerHaptic } from '../utils/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ANDROID_PROJECT_FILES } from '../native/androidFiles';
import { FitnessAppLogo } from './VisualAssets';

interface NativeAndroidModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
}

export const NativeAndroidModal: React.FC<NativeAndroidModalProps> = ({
  isOpen,
  onClose,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'install' | 'export_zip' | 'kotlin_code'>('install');
  const [selectedFileIdx, setSelectedFileIdx] = useState(4); // default to MainActivity.kt or Entities
  const [isZipping, setIsZipping] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleInstallClick = async () => {
    triggerHaptic('medium');
    const success = await install();
    if (success) {
      showToast('PulseFit is being installed on your device!');
    } else {
      showToast('Open in Chrome on Android and tap "Install App" or "Add to Home screen"');
    }
  };

  const handleDownloadAndroidZip = async () => {
    setIsZipping(true);
    triggerHaptic('success');

    try {
      const zip = new JSZip();

      // Add all project files into zip structure
      ANDROID_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Generate zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PulseFit_Native_Android_Project_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Android Studio Kotlin Project ZIP downloaded!');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate ZIP');
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCode = async () => {
    triggerHaptic('light');
    const file = ANDROID_PROJECT_FILES[selectedFileIdx];
    if (!file) return;

    try {
      await navigator.clipboard.writeText(file.content);
      setCopiedFile(true);
      showToast(`Copied ${file.path.split('/').pop()} to clipboard!`);
      setTimeout(() => setCopiedFile(false), 2000);
    } catch {
      showToast('Unable to access clipboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className={`w-full max-w-xl rounded-3xl p-5 shadow-2xl border flex flex-col max-h-[92vh] ${
        isDark ? 'bg-[#0F141C] border-[#1C2735] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <FitnessAppLogo size={28} />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm tracking-tight">Native Android Application</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                  Kotlin & Compose
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Install directly on phone, export Android Studio project, or build APK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl border my-3 ${
          isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('install');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'install'
                ? 'bg-[#00E676] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install on Android</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('export_zip');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'export_zip'
                ? 'bg-[#00E676] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Project ZIP</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('kotlin_code');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'kotlin_code'
                ? 'bg-[#00E676] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Kotlin Sources</span>
          </button>
        </div>

        {/* TAB 1: INSTALL ON ANDROID PHONE (PWA / WebAPK) */}
        {activeTab === 'install' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-[#00E676]" />
                <h4 className="font-extrabold text-sm text-white">
                  Direct Phone Installation (WebAPK / Standalone)
                </h4>
              </div>

              <p className="text-slate-300 leading-relaxed mb-3">
                PulseFit is configured with a native Android Web App Manifest, offline Service Worker, and adaptive maskable launcher icons. When installed on an Android device, it behaves exactly like a native app:
              </p>

              <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Runs in standalone full-screen window with zero browser URL bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Places custom neon PulseFit app icon on your phone home screen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Full offline local SQLite / Room cache with zero cloud latency</span>
                </div>
              </div>

              {/* Install Button */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                {isInstalled ? (
                  <div className="p-2.5 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>PulseFit is already installed on this device!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:bg-[#00c853] transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Install PulseFit to Home Screen</span>
                  </button>
                )}
              </div>
            </div>

            {/* Manual Instructions Card for Android Chrome */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#10161F] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h5 className="font-bold text-xs text-white">On Android Phone Browser:</h5>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
                <li>Open this app URL in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong>.</li>
                <li>Tap the <strong>three dots menu (⋮)</strong> in the top right.</li>
                <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>Tap <strong>Install</strong> — Android will create a native APK on your launcher!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: EXPORT NATIVE ANDROID STUDIO PROJECT (.ZIP) */}
        {activeTab === 'export_zip' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#141C26] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-5 h-5 text-[#00E676]" />
                <h4 className="font-extrabold text-sm text-white">
                  Download Full Android Studio Project
                </h4>
              </div>

              <p className="text-slate-300 leading-relaxed mb-3">
                Download the complete, compilable Gradle & Kotlin project structure ready to open in <strong>Android Studio</strong> (Hedgehog, Iguana, or Koala).
              </p>

              <div className="bg-[#0A0D12] p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 mb-4">
                <div className="text-[#00E676] font-bold">// Included in PulseFit_Native_Android_Project.zip:</div>
                <div>📁 settings.gradle.kts & build.gradle.kts</div>
                <div>📁 app/build.gradle.kts (Compose, Room, Material 3)</div>
                <div>📁 app/src/main/AndroidManifest.xml</div>
                <div>📁 com/pulsefit/app/MainActivity.kt</div>
                <div>📁 com/pulsefit/app/data/model/Entities.kt (Room)</div>
                <div>📁 com/pulsefit/app/data/db/PulseFitDatabase.kt</div>
                <div>📁 com/pulsefit/app/ui/theme/Theme.kt & Color.kt</div>
                <div>📄 README.md with build & APK instructions</div>
              </div>

              <button
                onClick={handleDownloadAndroidZip}
                disabled={isZipping}
                className="w-full py-3.5 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.35)] hover:bg-[#00c853] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isZipping ? 'Creating Project ZIP...' : 'Download Android Studio Project (.ZIP)'}</span>
              </button>
            </div>

            {/* Google Play Store / Bubblewrap Guide */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-[#10161F] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <h5 className="font-bold text-xs text-white">Build APK for Google Play in 2 commands:</h5>
              </div>
              <p className="text-[11px] text-slate-400">
                You can generate a signed Google Play Store APK using Google's official Bubblewrap CLI:
              </p>
              <pre className="bg-[#0A0D12] p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
{`npm i -g @bubblewrap/cli
bubblewrap init --manifest="https://your-app-url.run.app/manifest.json"
bubblewrap build`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: KOTLIN SOURCE CODE EXPLORER */}
        {activeTab === 'kotlin_code' && (
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 flex flex-col text-xs">
            {/* File Selector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
              {ANDROID_PROJECT_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedFileIdx(idx);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono whitespace-nowrap transition-all border ${
                    selectedFileIdx === idx
                      ? 'bg-[#00E676] text-black border-[#00E676] font-bold shadow-sm'
                      : isDark
                        ? 'bg-[#141C26] text-slate-400 border-slate-800 hover:text-white'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {file.path.split('/').pop()}
                </button>
              ))}
            </div>

            {/* Current File Header & Copy Button */}
            {(() => {
              const file = ANDROID_PROJECT_FILES[selectedFileIdx];
              if (!file) return null;

              return (
                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#00E676]">{file.path}</span>
                      <p className="text-[10px] text-slate-400">{file.description}</p>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isDark ? 'bg-[#16202C] text-slate-300 border-slate-800 hover:text-white' : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {copiedFile ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Code Viewer */}
                  <div className="flex-1 bg-[#090D13] p-3 rounded-2xl border border-slate-800 overflow-y-auto font-mono text-[11px] text-slate-200 whitespace-pre">
                    {file.content}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div className="mt-2 py-1.5 px-3 rounded-xl bg-[#00E676] text-black text-center text-xs font-bold animate-fade-in shrink-0">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};
