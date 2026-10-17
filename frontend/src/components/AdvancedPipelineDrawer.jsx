import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Sliders, Layers, Activity } from 'lucide-react';

export default function AdvancedPipelineDrawer({
  result,
  gamma,
  setGamma,
  contrast,
  setContrast,
  filterType,
  setFilterType,
  onApplyChanges
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!result) return null;

  const { glcm = {}, metadata = {}, urls = {} } = result;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
      {/* Accordion Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              Advanced DIP Pipeline & GLCM Texture Inspector
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Checklist Items: CLAHE, Median Filter, HSV/Lab Decomposition & Gray-Level Co-occurrence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <span>{isOpen ? 'Hide Inspector' : 'Show 8 Stages & GLCM'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Technical Details */}
      {isOpen && (
        <div className="p-6 space-y-6 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/70 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Gamma Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold text-slate-700 dark:text-slate-300">
                <span>Power-law Gamma (γ)</span>
                <span className="font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                  {gamma}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.5 (Darker)</span>
                <span>Default: 1.2</span>
                <span>2.5 (Brighter)</span>
              </div>
            </div>

            {/* CLAHE Clip Limit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold text-slate-700 dark:text-slate-300">
                <span>CLAHE Clip Limit</span>
                <span className="font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                  {contrast}x
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.2"
                value={contrast}
                onChange={(e) => setContrast(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1.0x (Low)</span>
                <span>Standard: 2.0x</span>
                <span>4.0x (High)</span>
              </div>
            </div>

            {/* Modern Segmented Noise Filter Selector (No Star Mark) */}
            <div className="space-y-2">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Noise Suppression Filter
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-inner">
                {[
                  { id: 'Median Filter', label: 'Median 5×5' },
                  { id: 'Gaussian Blur', label: 'Gaussian' },
                  { id: 'Bilateral Filter', label: 'Bilateral' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilterType(opt.id)}
                    className={`py-2 px-1 text-center text-[11px] font-bold rounded-lg transition-all ${
                      filterType === opt.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 block text-right">Edge-preserving smoothing</span>
            </div>
          </div>

          {/* Color Space Gallery */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Multi-Color Space Decomposition (OpenCV)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">HSV Color Space</span>
                <img src={urls.hsv || urls.original} alt="HSV" className="h-28 w-full object-contain rounded-lg bg-black" />
              </div>
              <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">CIE-Lab (L*a*b*)</span>
                <img src={urls.lab || urls.original} alt="CIE-Lab" className="h-28 w-full object-contain rounded-lg bg-black" />
              </div>
              <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Grayscale Intensity</span>
                <img src={urls.grayscale || urls.original} alt="Grayscale" className="h-28 w-full object-contain rounded-lg bg-black" />
              </div>
              <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Binary Threshold (Otsu)</span>
                <img src={urls.binary || urls.canopyMask} alt="Binary Otsu" className="h-28 w-full object-contain rounded-lg bg-black" />
              </div>
            </div>
          </div>

          {/* GLCM Texture Matrix & Image Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GLCM Table */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Technique 3: GLCM Texture Features (Scikit-Image)
              </h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">Contrast</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{glcm.contrast || '0.00'}</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">Dissimilarity</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{glcm.dissimilarity || '0.00'}</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">Homogeneity</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{glcm.homogeneity || '0.00'}</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">Energy (ASM)</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{glcm.energy || '0.00'}</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">Correlation</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{glcm.correlation || '0.00'}</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400">Offsets</div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">[1, 3 px]</div>
                </div>
              </div>
            </div>

            {/* Properties */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Checklist Item 3: Core Image Properties
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Dimensions</div>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {metadata['Dimensions'] || `${result.dimensions?.width} x ${result.dimensions?.height} px`}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Bit Depth</div>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {metadata['Bit Depth'] || '8-bit (uint8)'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Memory Footprint</div>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {metadata['Memory Footprint'] || '2.9 MB'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400">Total Pixels</div>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {metadata['Total Pixels'] || `${((result.dimensions?.totalPixels || 1) / 1000).toFixed(0)}k px`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
