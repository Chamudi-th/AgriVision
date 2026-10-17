import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck, PieChart, Activity, Sparkles } from 'lucide-react';

export default function SeverityGradingCard({ result }) {
  if (!result) return null;

  const { severityIndex, grade, gradeLabel, gradeColor, actionAdvice, leafPixels, lesionPixels, lesionClusterCount } = result;

  // Grade color configs
  const badgeColors = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  }[gradeColor] || 'bg-slate-500/10 text-slate-600 border-slate-500/30';

  const progressColor = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }[gradeColor] || 'bg-slate-500';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Severity Index & Classification</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Morphological pixel-ratio computation</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeColors}`}>
          {gradeLabel}
        </span>
      </div>

      {/* Main Metric Hero */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {severityIndex}%
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              Severity
            </span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Infection Ratio Spectrum</span>
            <span className="text-slate-900 dark:text-white font-mono">{severityIndex}%</span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(2, severityIndex))}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0% (Healthy)</span>
            <span>2% (Mild)</span>
            <span>15% (Severe)</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Pixel Area Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Leaf Canopy Area</div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
            {leafPixels.toLocaleString()} <span className="text-xs font-normal text-slate-400">px</span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Lesion Necrotic Area</div>
          <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
            {lesionPixels.toLocaleString()} <span className="text-xs font-normal text-slate-400">px</span>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Lesion Spots / Clusters</div>
          <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {lesionClusterCount} <span className="text-xs font-normal text-slate-400">clusters</span>
          </div>
        </div>
      </div>

      {/* Formula Note */}
      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">Formula Rule: </span>
          <code className="bg-emerald-500/10 px-1 py-0.5 rounded text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
            Severity (%) = (Lesion Area / Leaf Canopy Area) × 100
          </code>
        </div>
      </div>

      {/* Action / Agronomic Advice */}
      <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Agronomic Action Recommendation
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {actionAdvice}
        </p>
      </div>
    </div>
  );
}
