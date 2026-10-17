import React from 'react';
import { X, GitBranch, ArrowRight, Layers, Sliders, Eye, Activity, CheckSquare } from 'lucide-react';

const STEPS = [
  { step: '01', title: 'Leaf Image Acquisition', desc: 'Single file upload or batch scan. Resolution & metadata profiling.', icon: Layers },
  { step: '02', title: 'Geometric Transformation', desc: 'Orientation correction (rotations 90/180/270), flipping & ROI cropping.', icon: Sliders },
  { step: '03', title: 'Illumination & Contrast Enhancement', desc: 'CLAHE (Lab L-channel clip: 2.0) & Gamma correction (γ = 1.2).', icon: Eye },
  { step: '04', title: 'Noise Filtering', desc: '5x5 Median Filter to suppress salt-and-pepper while retaining lesion contours.', icon: Activity },
  { step: '05', title: 'Color Space Decomposition', desc: 'HSV color space separation: Hue/Saturation masks for green canopy & necrotic spots.', icon: Layers },
  { step: '06', title: 'Morphological Lesion Segmentation', desc: 'Dual thresholding + Morphological Opening (remove noise) & Closing (fill holes).', icon: CheckSquare },
  { step: '07', title: 'Severity Index & Grading Engine', desc: 'Severity Index (%) = (Lesion Area / Leaf Canopy Area) × 100. Grades 0, 1, 2.', icon: Activity },
  { step: '08', title: 'GLCM Texture & Diagnostic Overlay', desc: 'Gray-Level Co-occurrence Matrix (Contrast, Homogeneity, Energy, Dissimilarity).', icon: Eye },
];

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/10 text-teal-600 rounded-lg">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Pipeline Architecture</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Integrated Digital Image Processing Pipeline Flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Diagram Flow */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Pipeline Objective: </span>
            Automated detection, localization, and severity grading of foliar diseases in tropical fruit trees (Mango, Lime, and Jackfruit) using traditional digital image processing and morphological contour analysis.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 hover:border-emerald-500/40 transition-colors flex gap-3 items-start"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {s.step}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
