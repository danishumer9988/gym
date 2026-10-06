import React from 'react';

// Geometric Dumbbell + Lightning combination vector logo
export const FitnessAppLogo: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 32 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hexagonal Outer Shield / Badge */}
      <rect 
        x="4" 
        y="4" 
        width="40" 
        height="40" 
        rx="12" 
        fill="#00E676" 
        fillOpacity="0.12" 
        stroke="#00E676" 
        strokeWidth="2" 
      />

      {/* Dumbbell Left Weight Plate */}
      <rect x="9" y="16" width="5" height="16" rx="2" fill="#00E676" />
      <rect x="15" y="19" width="3" height="10" rx="1.5" fill="#00E676" fillOpacity="0.8" />

      {/* Dumbbell Right Weight Plate */}
      <rect x="34" y="16" width="5" height="16" rx="2" fill="#00E676" />
      <rect x="30" y="19" width="3" height="10" rx="1.5" fill="#00E676" fillOpacity="0.8" />

      {/* Dumbbell Central Bar */}
      <rect x="17" y="22.5" width="14" height="3" rx="1" fill="#FFFFFF" />

      {/* Central High-Voltage Lightning Bolt */}
      <path 
        d="M26.5 10L19.5 24H25L21.5 38L30 22H24.5L26.5 10Z" 
        fill="#00E676" 
        stroke="#0A0D12" 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

// Illustrated Profile Avatar Vector
export const ProfileAvatarVector: React.FC<{ size?: number; className?: string }> = ({ 
  size = 64, 
  className = '' 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="50" cy="50" r="48" fill="#131B26" stroke="#00E676" strokeWidth="2.5" />
      
      {/* Background glow circle */}
      <circle cx="50" cy="50" r="42" fill="#00E676" fillOpacity="0.08" />

      {/* Athletic Torso / Tank Top */}
      <path 
        d="M26 88C26 71 35 62 50 62C65 62 74 71 74 88" 
        fill="#1A2534" 
        stroke="#00E676" 
        strokeWidth="2.5" 
      />
      {/* Tank top straps */}
      <path d="M38 64L43 88" stroke="#00E676" strokeWidth="2" strokeLinecap="round" />
      <path d="M62 64L57 88" stroke="#00E676" strokeWidth="2" strokeLinecap="round" />

      {/* Athletic Neck */}
      <path d="M43 50V62H57V50" fill="#F4B892" />

      {/* Head */}
      <ellipse cx="50" cy="40" rx="15" ry="17" fill="#F4B892" />

      {/* Modern Haircut */}
      <path 
        d="M35 37C35 27 42 21 50 21C58 21 65 26 65 37C63 35 59 34 50 34C41 34 37 35 35 37Z" 
        fill="#1E293B" 
      />

      {/* Neon Athletic Sweatband */}
      <rect x="34.5" y="32" width="31" height="4.5" rx="2" fill="#00E676" />

      {/* Minimalist Facial Features */}
      <circle cx="45" cy="41" r="1.5" fill="#1E293B" />
      <circle cx="55" cy="41" r="1.5" fill="#1E293B" />
      <path d="M48 48C49.5 49 50.5 49 52 48" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

// Workout Stance Figures
export const WorkoutStanceFigure: React.FC<{ 
  stance: 'bench' | 'squat' | 'pull' | 'overhead' | 'plank' | 'run' | 'curl' | string;
  size?: number;
  className?: string;
}> = ({ stance, size = 48, className = '' }) => {
  switch (stance) {
    case 'bench':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <rect width="64" height="64" rx="14" fill="#00E676" fillOpacity="0.1" />
          {/* Bench */}
          <line x1="12" y1="46" x2="52" y2="46" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <line x1="20" y1="46" x2="20" y2="54" stroke="#94A3B8" strokeWidth="2.5" />
          <line x1="44" y1="46" x2="44" y2="54" stroke="#94A3B8" strokeWidth="2.5" />
          {/* Torso on bench */}
          <ellipse cx="26" cy="42" rx="9" ry="3.5" fill="#00E676" />
          <circle cx="16" cy="41" r="3" fill="#F4B892" />
          {/* Legs planted */}
          <path d="M35 43L42 54" stroke="#00E676" strokeWidth="3" strokeLinecap="round" />
          {/* Arms pressing up */}
          <path d="M26 40L28 26L34 22" stroke="#F4B892" strokeWidth="2.5" strokeLinecap="round" />
          {/* Barbell */}
          <line x1="18" y1="21" x2="42" y2="21" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <rect x="18" y="17" width="2" height="8" rx="1" fill="#00E676" />
          <rect x="40" y="17" width="2" height="8" rx="1" fill="#00E676" />
        </svg>
      );

    case 'squat':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <rect width="64" height="64" rx="14" fill="#00E676" fillOpacity="0.1" />
          {/* Floor */}
          <line x1="12" y1="56" x2="52" y2="56" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          {/* Head */}
          <circle cx="32" cy="18" r="4" fill="#F4B892" />
          {/* Barbell on upper back */}
          <line x1="14" y1="22" x2="50" y2="22" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="14" y="17" width="3" height="10" rx="1" fill="#00E676" />
          <rect x="47" y="17" width="3" height="10" rx="1" fill="#00E676" />
          {/* Torso & hips back */}
          <path d="M32 23L30 36L22 44L24 55" stroke="#00E676" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 36L38 45L36 55" stroke="#00E676" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'overhead':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <rect width="64" height="64" rx="14" fill="#00E676" fillOpacity="0.1" />
          {/* Barbell pressed high */}
          <line x1="14" y1="12" x2="50" y2="12" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="14" y="8" width="3" height="9" rx="1" fill="#00E676" />
          <rect x="47" y="8" width="3" height="9" rx="1" fill="#00E676" />
          {/* Arms lock up */}
          <path d="M23 13L29 25" stroke="#F4B892" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M41 13L35 25" stroke="#F4B892" strokeWidth="2.5" strokeLinecap="round" />
          {/* Head */}
          <circle cx="32" cy="24" r="4" fill="#F4B892" />
          {/* Standing Torso & Legs */}
          <path d="M32 28V42L27 56" stroke="#00E676" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M32 42L37 56" stroke="#00E676" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'plank':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <rect width="64" height="64" rx="14" fill="#00E676" fillOpacity="0.1" />
          {/* Floor */}
          <line x1="10" y1="50" x2="54" y2="50" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          {/* Head */}
          <circle cx="18" cy="32" r="3.5" fill="#F4B892" />
          {/* Forearm down */}
          <path d="M22 36L22 49L26 49" stroke="#F4B892" strokeWidth="2.5" strokeLinecap="round" />
          {/* Rigid Body Line */}
          <path d="M22 36L48 44L50 49" stroke="#00E676" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Core Brace Pulse Indicator */}
          <circle cx="35" cy="40" r="3" fill="#00E676" fillOpacity="0.5" />
        </svg>
      );

    case 'curl':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <rect width="64" height="64" rx="14" fill="#00E676" fillOpacity="0.1" />
          {/* Head */}
          <circle cx="28" cy="20" r="4" fill="#F4B892" />
          {/* Torso */}
          <path d="M28 25V42L24 55" stroke="#00E676" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M28 42L32 55" stroke="#00E676" strokeWidth="3.5" strokeLinecap="round" />
          {/* Arm Curled */}
          <path d="M28 28L32 38L38 29" stroke="#F4B892" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dumbbell in hand */}
          <line x1="34" y1="28" x2="42" y2="28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="34" cy="28" r="3" fill="#00E676" />
          <circle cx="42" cy="28" r="3" fill="#00E676" />
        </svg>
      );

    case 'run':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
          <rect width="64" height="64" rx="14" fill="#00E676" fillOpacity="0.1" />
          {/* Runner Head */}
          <circle cx="35" cy="18" r="4" fill="#F4B892" />
          {/* Running Body */}
          <path d="M33 22L30 35L20 44" stroke="#00E676" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M30 35L38 43L46 45" stroke="#00E676" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Running Arms */}
          <path d="M31 25L23 30" stroke="#F4B892" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M31 25L39 31L43 27" stroke="#F4B892" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
};
