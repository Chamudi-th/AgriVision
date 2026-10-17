import React, { useRef } from 'react';
import { SAMPLE_IMAGES } from '../data/pipelineData';
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

export default function SampleSelector({ selectedSample, onSelectSample, onCustomUpload }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCustomUpload({
          id: 'custom-upload',
          title: file.name.substring(0, 24),
          species: 'User Uploaded Leaf',
          status: 'Custom Evaluation',
          path: event.target?.result,
          rawFile: file,
          expectedGrade: 'Calculated Realtime',
          severityEstimate: '--',
          datasetType: 'Uploaded'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Leaf Sample Selection
          </h3>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Leaf Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Preset Samples Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SAMPLE_IMAGES.map((sample) => {
          const isSelected = selectedSample?.id === sample.id;
          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={sample.path}
                  alt={sample.title}
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {sample.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {sample.species}
                  </div>
                  <span
                    className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      sample.status === 'Healthy'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {sample.status}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
