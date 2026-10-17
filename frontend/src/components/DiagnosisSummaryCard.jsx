import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck, Activity, Sparkles, Clock, Zap } from 'lucide-react';

export default function DiagnosisSummaryCard({ result }) {
  if (!result) return null;

  const {
    severityIndex = 0,
    gradeLabel = 'Grade 0 (Healthy)',
    gradeColor = 'emerald',
    actionAdvice = 'Leaf is in prime physiological health.',
    leafPixels = 0,
    lesionPixels = 0,
    lesionClusterCount = 0,
    latency,
    isBackend
  } = result;

  // Visual grade badges
  const badgeTheme = {
    emerald: {
      bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      bar: 'bg-emerald-500',
      icon: CheckCircle2,
      title: 'Healthy Canopy'
    },
    amber: {
      bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      bar: 'bg-amber-500',
      icon: AlertTriangle,
      title: 'Mild Infection'
    },
    rose: {
      bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      bar: 'bg-rose-500',
      icon: AlertCircle,
      title: 'Severe Infestation'
    }
  }[gradeColor] || {
    bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    bar: 'bg-slate-500',
    icon: CheckCircle2,
    title: 'Evaluated'
  };

  const IconComponent = badgeTheme.icon;

  // Clean output status string (e.g., Severe, Mild, Healthy)
  const outputStatus = severityIndex >= 15
    ? 'Severe'
    : severityIndex >= 2
    ? 'Mild'
    : 'Healthy';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Top Title & Output Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Result</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Infection Severity & Detection Output</p>
          </div>
        </div>

        <div className={`px-3.5 py-1.5 rounded-2xl border font-bold text-xs flex items-center gap-1.5 shadow-sm ${badgeTheme.bg}`}>
          <IconComponent className="w-4 h-4" />
          <span>Output: {outputStatus}</span>
        </div>
      </div>

      {/* Hero Severity Percentage Meter */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/70 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {severityIndex}%
            </span>
            <span className="ml-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Severity Index
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Formula: <code className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">(A_lesion / A_leaf) × 100</code>
          </span>
        </div>

        {/* Linear Spectrum Bar with exact thresholds */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${badgeTheme.bar}`}
              style={{ width: `${Math.min(100, Math.max(3, severityIndex))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
            <span className="text-emerald-600 dark:text-emerald-400">0% (Healthy)</span>
            <span className="text-amber-600 dark:text-amber-400">2% (Mild)</span>
            <span className="text-rose-600 dark:text-rose-400">15% (Severe)</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
        <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/20">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Detected Spots
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
            {lesionClusterCount}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">Necrotic clusters</div>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/20">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Lesion Area
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {lesionPixels.toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">pixels ({severityIndex}%)</div>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/20">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Total Leaf Area
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {leafPixels.toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">pixels canopy</div>
        </div>
      </div>

      {/* Agronomic Treatment Recommendation */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 space-y-1.5">
        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Recommended Treatment & Action:</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {actionAdvice}
        </p>
      </div>

      {/* Performance Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-500" />
          <span>Engine: {isBackend ? 'FastAPI + OpenCV Python' : 'Client Canvas'}</span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>{latency?.total_ms ? `${latency.total_ms} ms` : '~45 ms'}</span>
        </div>
      </div>
    </div>
  );
}
