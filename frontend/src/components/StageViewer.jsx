import React, { useState } from 'react';
import { PIPELINE_STAGES } from '../data/pipelineData';
import { Eye, Sliders, Maximize2, Layers, RotateCw, FlipHorizontal, ShieldAlert, Sparkles, Cpu, Clock } from 'lucide-react';

export default function StageViewer({
  currentStage,
  setCurrentStage,
  result,
  gamma,
  setGamma,
  contrast,
  setContrast,
  rotation,
  setRotation,
  flipH,
  setFlipH,
  flipV,
  setFlipV,
  filterType,
  setFilterType,
  filterKsize,
  setFilterKsize,
  isProcessing,
  onApplyChanges
}) {
  const [activeColorSpace, setActiveColorSpace] = useState('hsv');

  if (!result) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Stage Tabs Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pipeline Execution Stages</h3>
                {result.isBackend && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                    OpenCV Engine
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time DIP Stage Transformations & Contours</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
            Stage {PIPELINE_STAGES.find(s => s.id === currentStage)?.num || '01'} / 08
          </span>
        </div>

        {/* Scrollable Stage Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {PIPELINE_STAGES.map((stg) => {
            const isSelected = stg.id === currentStage;
            return (
              <button
                key={stg.id}
                onClick={() => setCurrentStage(stg.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {stg.num}
                </span>
                <span>{stg.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls Bar based on current stage */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800/70">
        {currentStage === 'geom' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
              Orientation & Affine Transforms:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:border-emerald-500"
              >
                Rotate 90° (Current: {rotation}°)
              </button>
              <button
                onClick={() => setFlipH(!flipH)}
                className={`px-2.5 py-1 rounded-lg border text-slate-700 dark:text-slate-200 font-medium ${
                  flipH ? 'bg-emerald-100 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                Flip Horizontal
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`px-2.5 py-1 rounded-lg border text-slate-700 dark:text-slate-200 font-medium ${
                  flipV ? 'bg-emerald-100 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                Flip Vertical
              </button>
            </div>
          </div>
        )}

        {currentStage === 'illumination' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Power-law Gamma (γ Correction)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{gamma}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Selected standard: γ = 1.2</span>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>CLAHE Clip Limit (L-Channel)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{contrast}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.2"
                value={contrast}
                onChange={(e) => setContrast(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Clip Limit: 2.0 on Lab L-Channel</span>
            </div>
          </div>
        )}

        {currentStage === 'filter' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Noise Suppression Algorithm:
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'Median Filter', label: 'Median Filter 5x5 (Selected ⭐)' },
                { id: 'Gaussian Blur', label: 'Gaussian Blur' },
                { id: 'Bilateral Filter', label: 'Bilateral Filter' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterType === f.id
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStage === 'colorspace' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Target Color Space Representation:
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'hsv', label: 'HSV Color Space' },
                { id: 'lab', label: 'CIE-Lab L*a*b*' },
                { id: 'ycrcb', label: 'YCrCb' },
                { id: 'grayscale', label: 'Grayscale' },
                { id: 'binary', label: 'Binary (Otsu)' }
              ].map((cs) => (
                <button
                  key={cs.id}
                  onClick={() => setActiveColorSpace(cs.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeColorSpace === cs.id
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cs.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {(currentStage === 'input' || currentStage === 'segmentation' || currentStage === 'severity' || currentStage === 'texture') && (
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span className="font-medium">
              Technique: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{PIPELINE_STAGES.find(s => s.id === currentStage)?.technique}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {PIPELINE_STAGES.find(s => s.id === currentStage)?.desc}
            </span>
          </div>
        )}
      </div>

      {/* Main Image Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Side: Stage Canvas / Image Result */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-2 flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden group">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-2">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Processing through OpenCV Pipeline...</span>
            </div>
          ) : (
            <div
              className="w-full flex items-center justify-center transition-transform duration-300"
              style={{
                transform: result.isBackend
                  ? 'none' // Backend already rotates and flips
                  : `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
              }}
            >
              {/* Stage Specific Image View */}
              {currentStage === 'input' && (
                <img
                  src={result.urls.original}
                  alt="Original Leaf"
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
                />
              )}
              {currentStage === 'geom' && (
                <img
                  src={result.urls.geometric || result.urls.original}
                  alt="Transformed Leaf"
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
                />
              )}
              {currentStage === 'illumination' && (
                <img
                  src={result.urls.illumination || result.urls.enhanced}
                  alt="Enhanced Contrast & Gamma"
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
                />
              )}
              {currentStage === 'filter' && (
                <img
                  src={result.urls.filtered || result.urls.enhanced}
                  alt="Filtered Leaf"
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
                />
              )}
              {currentStage === 'colorspace' && (
                <img
                  src={result.urls[activeColorSpace] || result.urls.enhanced || result.urls.original}
                  alt="Color Space"
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
                />
              )}
              {currentStage === 'segmentation' && (
                <div className="flex gap-2">
                  <div className="text-center">
                    <span className="text-[10px] text-emerald-400 font-mono block mb-1">Leaf Canopy Mask</span>
                    <img
                      src={result.urls.canopyMask}
                      alt="Leaf Canopy Mask"
                      className="max-h-[340px] w-auto object-contain rounded-lg border border-emerald-500/40"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-rose-400 font-mono block mb-1">Lesion Mask</span>
                    <img
                      src={result.urls.lesionMask}
                      alt="Lesion Necrotic Mask"
                      className="max-h-[340px] w-auto object-contain rounded-lg border border-rose-500/40"
                    />
                  </div>
                </div>
              )}
              {(currentStage === 'severity' || currentStage === 'texture') && (
                <img
                  src={result.urls.diagnosticOverlay}
                  alt="Diagnostic Overlay"
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          )}

          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-slate-300 border border-slate-700/80 flex items-center gap-2">
            <span>
              {currentStage === 'input' && 'Original Input Feed'}
              {currentStage === 'geom' && `Affine Transform: ${rotation}° / Flip H:${flipH ? 'Y' : 'N'}`}
              {currentStage === 'illumination' && `Gamma γ=${gamma} • CLAHE ${contrast}x`}
              {currentStage === 'filter' && `Filtered Output: ${filterType}`}
              {currentStage === 'colorspace' && `Decomposition: ${activeColorSpace.toUpperCase()}`}
              {currentStage === 'segmentation' && 'Dual Color & Morphological Masks'}
              {currentStage === 'severity' && `Overlay Contours (${result.lesionClusterCount || 0} clusters)`}
              {currentStage === 'texture' && 'Contour & Texture Region Overlay'}
            </span>
          </div>
        </div>

        {/* Right Side: Detailed Metrics Panel for Active Stage */}
        <div className="space-y-4">
          {/* Metadata & Technical Specs */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Stage Properties & Metadata</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
                {result.dimensions?.width}×{result.dimensions?.height} px
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Color Space & Depth</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {result.metadata?.['Bit Depth'] || '8-bit RGB'}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Total Resolution</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {((result.dimensions?.totalPixels || 1) / 1000).toFixed(1)}k pixels
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Memory Footprint</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {result.metadata?.['Memory Footprint'] || `${(((result.dimensions?.totalPixels || 1) * 3) / 1024).toFixed(1)} KB`}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Pipeline Latency</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {result.latency?.total_ms ? `${result.latency.total_ms} ms` : '~14.2 ms'}
                </div>
              </div>
            </div>
          </div>

          {/* GLCM Texture Features Card (Stage 8) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Technique 3: GLCM Texture Features</span>
              <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">Gray-Level Co-occurrence</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400">Contrast</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{result.glcm?.contrast || '0.00'}</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400">Dissimilarity</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{result.glcm?.dissimilarity || '0.00'}</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400">Homogeneity</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{result.glcm?.homogeneity || '0.00'}</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400">Energy (ASM)</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{result.glcm?.energy || '0.00'}</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400">Correlation</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{result.glcm?.correlation || '0.00'}</div>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400">Matrix Offsets</div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">[1, 0°, 45°, 90°]</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
