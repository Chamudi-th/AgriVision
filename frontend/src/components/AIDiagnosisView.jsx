import React, { useState } from 'react';
import { Eye, Split, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle, ZoomIn } from 'lucide-react';

export default function AIDiagnosisView({ result, isProcessing }) {
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay', 'split', 'original', 'lesionMask', 'canopyMask'

  // Only show full loading screen on initial analysis when no result exists
  if (isProcessing && !result) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[460px] shadow-sm space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <Sparkles className="w-6 h-6 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Analyzing Foliar Disease Spots...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Executing OpenCV contour segmentation & morphological filtering</p>
        </div>
      </div>
    );
  }

  if (!result || !result.urls) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
        Select a leaf sample or upload an image to begin diagnosis.
      </div>
    );
  }

  const { urls, lesionClusterCount, severityIndex, gradeLabel, gradeColor } = result;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* View Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Visual Disease Identification
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Clear bounding boxes and necrotic lesion contour localization
            </p>
          </div>
        </div>

        {/* View mode toggle buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'overlay'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎯 AI Overlay
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'split'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ↔️ Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'original'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setViewMode('lesionMask')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'lesionMask'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Lesion Mask
          </button>
        </div>
      </div>

      {/* Main Image Display Box */}
      <div className="bg-slate-900/90 rounded-2xl p-3 sm:p-4 flex items-center justify-center min-h-[420px] relative overflow-hidden group">
        {/* Floating smooth update pill */}
        {isProcessing && (
          <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/40 shadow-xl flex items-center gap-2 z-20 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Updating OpenCV live...</span>
          </div>
        )}

        {/* Single Overlay View */}
        {viewMode === 'overlay' && (
          <div className="relative max-w-full flex items-center justify-center">
            <img
              src={urls.diagnosticOverlay || urls.original}
              alt="AI Disease Localization Overlay"
              className="max-h-[460px] w-auto object-contain rounded-xl shadow-2xl transition-all duration-300"
            />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-2 border border-white/10 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>Red Box: Detected Disease Lesions ({lesionClusterCount || 0} spots)</span>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-emerald-400 text-[11px] font-mono border border-emerald-500/20">
              Severity: {severityIndex}%
            </div>
          </div>
        )}

        {/* Side by Side Split View */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-300 mb-2">1. Original Input Leaf</span>
              <img
                src={urls.original}
                alt="Original Leaf"
                className="max-h-[380px] w-auto object-contain rounded-xl border border-slate-700/80 shadow-md"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-emerald-400 mb-2">
                2. AI Disease Detection ({lesionClusterCount || 0} Lesions)
              </span>
              <img
                src={urls.diagnosticOverlay || urls.original}
                alt="AI Detected Overlay"
                className="max-h-[380px] w-auto object-contain rounded-xl border border-emerald-500/50 shadow-md"
              />
            </div>
          </div>
        )}

        {/* Original Only */}
        {viewMode === 'original' && (
          <div className="flex items-center justify-center">
            <img
              src={urls.original}
              alt="Original Leaf"
              className="max-h-[460px] w-auto object-contain rounded-xl shadow-xl"
            />
          </div>
        )}

        {/* Lesion Mask Only */}
        {viewMode === 'lesionMask' && (
          <div className="flex flex-col items-center">
            <img
              src={urls.lesionMask}
              alt="Binary Lesion Mask"
              className="max-h-[420px] w-auto object-contain rounded-xl border border-rose-500/40 shadow-xl"
            />
            <span className="text-xs text-rose-300 font-mono mt-2">
              Extracted Necrotic Pixel Mask (Lesion Area: {result.lesionPixels?.toLocaleString()} px)
            </span>
          </div>
        )}
      </div>

      {/* Quick Visual Identification Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-red-500 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Red Bounding Boxes:</strong> Necrotic Lesion Spots
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-yellow-400 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Yellow Outlines:</strong> Morphological Contours
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 flex-shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Leaf Canopy:</strong> Segmented Vegetation Mask
          </span>
        </div>
      </div>
    </div>
  );
}
