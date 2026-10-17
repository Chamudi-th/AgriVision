import React from 'react';
import { Sun, Moon, Leaf, Database, GitBranch, Layers, ShieldCheck } from 'lucide-react';

export default function Header({ darkMode, setDarkMode, onOpenDataset, onOpenArchitecture, backendOnline }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                AgriVision
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Plant Leaf Disease Detection & Severity Grading Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
            backendOnline
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{backendOnline ? 'FastAPI + OpenCV Active' : 'Connecting Backend...'}</span>
          </div>

          <button
            onClick={onOpenDataset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            title="View Dataset Specification & 50% Review Metrics"
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Dataset (30 imgs)</span>
          </button>

          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            title="View Pipeline Architecture Diagram"
          >
            <GitBranch className="w-3.5 h-3.5 text-teal-500" />
            <span className="hidden md:inline">Pipeline Architecture</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
