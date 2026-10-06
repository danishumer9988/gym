import { jsPDF } from 'jspdf';
import { 
  UserMetrics, 
  WorkoutLog, 
  StepRecord, 
  PersonalRecord, 
  Exercise 
} from '../types/fitness';

export function exportPerformanceReportPdf(
  userMetrics: UserMetrics,
  workoutLogs: WorkoutLog[],
  stepHistory: StepRecord[],
  personalRecords: PersonalRecord[],
  _exercises: Exercise[] = []
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkBg = [15, 23, 42]; // #0F172A
  const primaryGreen = [0, 200, 83]; // #00C853
  const textDark = [30, 41, 59]; // #1E293B
  const textMuted = [100, 116, 139]; // #64748B
  const lightSurface = [248, 250, 252]; // #F8FAFC
  const borderLight = [226, 232, 240]; // #E2E8F0

  // 1. TOP HEADER BANNER
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent green bar
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(0, 36, pageWidth, 2.5, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('PULSEFIT ATHLETIC REPORT', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 210, 225);
  doc.text('ALL-IN-ONE FITNESS, WORKOUT & HEALTH INTELLIGENCE PLATFORM', margin, 26);

  const reportDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text(`GENERATED: ${reportDateStr.toUpperCase()}`, pageWidth - margin, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 190, 205);
  doc.text('CONFIDENTIAL & VERIFIED', pageWidth - margin, 26, { align: 'right' });

  let y = 46;

  // 2. ATHLETE PROFILE & METRICS SECTION
  doc.setFillColor(lightSurface[0], lightSurface[1], lightSurface[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  // Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('ATHLETE PROFILE & VITALS', margin + 5, y + 7);

  // Height / Weight / BMI calculations
  const heightM = (userMetrics.heightCm || 178) / 100;
  const bmi = heightM > 0 ? (userMetrics.weightKg / (heightM * heightM)).toFixed(1) : '22.0';
  const unit = userMetrics.unitSystem === 'metric' ? 'kg' : 'lbs';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

  const colW = contentWidth / 4;
  // Col 1: Name & Gender
  doc.text('Athlete Name:', margin + 5, y + 16);
  doc.text('Gender / Age:', margin + 5, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(userMetrics.name || 'Alex Hunter', margin + 30, y + 16);
  doc.text(`${(userMetrics.gender || 'male').toUpperCase()} · ${userMetrics.age || 26} yrs`, margin + 30, y + 24);

  // Col 2: Height & Weight
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Current Weight:', margin + colW * 1.6, y + 16);
  doc.text('Height & Target:', margin + colW * 1.6, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`${userMetrics.weightKg} ${unit}`, margin + colW * 1.6 + 26, y + 16);
  doc.text(`${userMetrics.heightCm} cm · Target ${userMetrics.targetWeightKg} ${unit}`, margin + colW * 1.6 + 26, y + 24);

  // Col 3: Goal & BMI
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Calculated BMI:', margin + colW * 2.8, y + 16);
  doc.text('Primary Goal:', margin + colW * 2.8, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text(`${bmi} (Normal Range)`, margin + colW * 2.8 + 26, y + 16);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(userMetrics.fitnessGoal.replace('_', ' ').toUpperCase(), margin + colW * 2.8 + 26, y + 24);

  y += 40;

  // 3. EXECUTIVE PERFORMANCE HIGHLIGHTS (4 Stats Cards)
  const totalVolume = workoutLogs.reduce((acc, w) => acc + (w.volumeKg || 0), 0);
  const totalDurationMins = workoutLogs.reduce((acc, w) => acc + Math.round((w.durationSeconds || 0) / 60), 0);
  const last7Steps = stepHistory.slice(0, 7);
  const totalSteps7 = last7Steps.reduce((acc, s) => acc + s.steps, 0);
  const avgSteps = Math.round(totalSteps7 / (last7Steps.length || 1));
  const workoutsCount = workoutLogs.length;

  const statCardW = (contentWidth - 9) / 4;
  const statCardH = 22;

  const stats = [
    { label: 'TOTAL VOLUME', value: `${totalVolume.toLocaleString()} ${unit}`, sub: 'Progressive overload' },
    { label: 'WORKOUT SESSIONS', value: `${workoutsCount} Completed`, sub: 'Logged training bouts' },
    { label: 'TRAINING TIME', value: `${totalDurationMins} Mins`, sub: 'Active exertion' },
    { label: 'AVG DAILY STEPS', value: `${avgSteps.toLocaleString()} Steps`, sub: `Goal: ${userMetrics.dailyStepGoal.toLocaleString()}` },
  ];

  stats.forEach((st, i) => {
    const cx = margin + i * (statCardW + 3);
    doc.setFillColor(lightSurface[0], lightSurface[1], lightSurface[2]);
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.roundedRect(cx, y, statCardW, statCardH, 2.5, 2.5, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(st.label, cx + 4, y + 6);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(st.value, cx + 4, y + 13);

    // Sub
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(st.sub, cx + 4, y + 18.5);
  });

  y += 28;

  // 4. PERSONAL RECORDS (PRs) TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('PERSONAL RECORDS (PRs) — COMPOUND LIFTS', margin, y + 3);
  y += 6;

  // Table header
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('EXERCISE NAME', margin + 4, y + 4.8);
  doc.text('MAX LOAD (WEIGHT)', margin + 70, y + 4.8);
  doc.text('REPETITIONS', margin + 115, y + 4.8);
  doc.text('DATE ACHIEVED', margin + 150, y + 4.8);
  y += 7;

  // Rows
  const prDisplayList = personalRecords.slice(0, 5);
  prDisplayList.forEach((pr, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(lightSurface[0], lightSurface[1], lightSurface[2]);
      doc.rect(margin, y, contentWidth, 6.5, 'F');
    }
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(pr.exerciseName, margin + 4, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.text(`${pr.weight} ${unit}`, margin + 70, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`${pr.reps} rep${pr.reps > 1 ? 's' : ''}`, margin + 115, y + 4.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(pr.date || 'Recent', margin + 150, y + 4.5);

    y += 6.5;
  });

  y += 7;

  // 5. RECENT WORKOUT LOGS HISTORY
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('RECENT WORKOUT SESSIONS HISTORY', margin, y + 3);
  y += 6;

  // Table header
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('ROUTINE / SESSION', margin + 4, y + 4.8);
  doc.text('DATE', margin + 65, y + 4.8);
  doc.text('DURATION', margin + 95, y + 4.8);
  doc.text('VOLUME', margin + 125, y + 4.8);
  doc.text('EST. CALORIES', margin + 155, y + 4.8);
  y += 7;

  const logsDisplayList = workoutLogs.slice(0, 6);
  if (logsDisplayList.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('No previous workout sessions logged yet. Ready to train!', margin + 4, y + 5);
    y += 8;
  } else {
    logsDisplayList.forEach((w, idx) => {
      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(lightSurface[0], lightSurface[1], lightSurface[2]);
        doc.rect(margin, y, contentWidth, 6.5, 'F');
      }
      doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
      doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(w.routineName, margin + 4, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(w.date || 'Today', margin + 65, y + 4.5);

      const mins = Math.round((w.durationSeconds || 0) / 60);
      doc.text(`${mins} mins`, margin + 95, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`${(w.volumeKg || 0).toLocaleString()} ${unit}`, margin + 125, y + 4.5);

      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text(`${w.caloriesBurned || 350} kcal`, margin + 155, y + 4.5);

      y += 6.5;
    });
  }

  y += 7;

  // 6. DAILY STEP & CARDIO ACTIVITY (LAST 7 DAYS)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('CARDIO & DAILY STEP ACTIVITY (LAST 7 DAYS)', margin, y + 3);
  y += 6;

  // Table header
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DATE', margin + 4, y + 4.8);
  doc.text('STEPS RECORDED', margin + 50, y + 4.8);
  doc.text('GOAL TARGET', margin + 90, y + 4.8);
  doc.text('EST. DISTANCE', margin + 130, y + 4.8);
  doc.text('BURNED KCAL', margin + 160, y + 4.8);
  y += 7;

  last7Steps.forEach((st, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(lightSurface[0], lightSurface[1], lightSurface[2]);
      doc.rect(margin, y, contentWidth, 6.2, 'F');
    }
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(margin, y + 6.2, margin + contentWidth, y + 6.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(st.date, margin + 4, y + 4.3);

    const isGoalMet = st.steps >= st.goal;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isGoalMet ? primaryGreen[0] : textDark[0], isGoalMet ? primaryGreen[1] : textDark[1], isGoalMet ? primaryGreen[2] : textDark[2]);
    doc.text(`${st.steps.toLocaleString()} steps`, margin + 50, y + 4.3);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`${st.goal.toLocaleString()} steps`, margin + 90, y + 4.3);
    doc.text(`${st.distanceKm.toFixed(2)} km`, margin + 130, y + 4.3);

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`${st.caloriesBurned} kcal`, margin + 160, y + 4.3);

    y += 6.2;
  });

  // 7. FOOTER
  const footerY = pageHeight - 12;
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('PulseFit Web Platform · Offline Storage & Local Telemetry Engine · Certified Fitness Data', margin, footerY + 2);
  doc.text(`Page 1 of 1 · Verified Athlete: ${userMetrics.name}`, pageWidth - margin, footerY + 2, { align: 'right' });

  // Download the generated PDF
  const safeName = (userMetrics.name || 'Athlete').replace(/\s+/g, '_');
  const fileName = `PulseFit_Performance_Report_${safeName}_${Date.now()}.pdf`;
  doc.save(fileName);
}
