import React from 'react';
import { X, CheckCircle, Database, Folder, FileText } from 'lucide-react';
import { DATASET_STATS } from '../data/pipelineData';

export default function DatasetModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Dataset Specification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Validation & Foliar Disease Dataset Catalog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-center">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {DATASET_STATS.totalImages}
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Total Images</div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-500 mt-0.5">Req: ≥ 30 images</div>
            </div>
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/40 text-center">
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                {DATASET_STATS.capturedImages}
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Self Captured</div>
              <div className="text-[10px] text-teal-700 dark:text-teal-500 mt-0.5">Req: ≥ 10 images</div>
            </div>
            <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200/50 dark:border-cyan-800/40 text-center">
              <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                {DATASET_STATS.unseenTestImages}
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Unseen Test Set</div>
              <div className="text-[10px] text-cyan-700 dark:text-cyan-500 mt-0.5">Req: ≥ 10 images</div>
            </div>
          </div>

          {/* Compliance Checklist Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">Project Value</th>
                  <th className="py-2.5 px-3">Checklist Req</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Total Images</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">30 images</td>
                  <td className="py-2.5 px-3">≥ 30</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Met
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Captured / Created</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">18 images</td>
                  <td className="py-2.5 px-3">≥ 10</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Exceeded
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Unseen Test Set</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">10 images</td>
                  <td className="py-2.5 px-3">≥ 10</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Met
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">Metadata CSV Record</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">dataset_metadata.csv</td>
                  <td className="py-2.5 px-3">Source & Res record</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Complete
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tropical Fruit Domains */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Fruit Domains & Diseased Classes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DATASET_STATS.domains.map((dom) => (
                <div key={dom.name} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{dom.name}</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{dom.count} images</div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {dom.diseases.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
