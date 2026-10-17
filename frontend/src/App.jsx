import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SampleSelector from './components/SampleSelector';
import AIDiagnosisView from './components/AIDiagnosisView';
import DiagnosisSummaryCard from './components/DiagnosisSummaryCard';
import AdvancedPipelineDrawer from './components/AdvancedPipelineDrawer';
import DatasetModal from './components/DatasetModal';
import ArchitectureModal from './components/ArchitectureModal';
import { SAMPLE_IMAGES } from './data/pipelineData';
import { checkBackendHealth, processLeafImageApi } from './services/api';
import { analyzeLeafImage } from './utils/imageProcessing';
import { Sparkles, Activity, FileCheck, Layers, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedSample, setSelectedSample] = useState(SAMPLE_IMAGES[0]);

  // DIP parameters
  const [gamma, setGamma] = useState(1.2);
  const [contrast, setContrast] = useState(2.0);
  const [filterType, setFilterType] = useState('Median Filter');

  const [isDatasetOpen, setIsDatasetOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  const [backendOnline, setBackendOnline] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Periodic health check
  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      const isHealthy = await checkBackendHealth();
      if (isMounted) setBackendOnline(isHealthy);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Pipeline execution dispatcher
  const executePipeline = useCallback(async () => {
    if (!selectedSample) return;
    
    // Smooth update: only show full loading if no result exists yet
    if (!result) {
      setLoading(true);
    } else {
      setIsUpdating(true);
    }
    setErrorMessage(null);

    // 1. Backend Request for accurate OpenCV output
    try {
      const requestPayload = {
        gamma,
        clipLimit: contrast,
        contrastMethod: 'CLAHE',
        illuminationMethod: 'Gamma Correction',
        filterType,
        filterKsize: 5,
        rotationAngle: 0,
        flipMode: 'None',
        scalePct: 100,
        hsvMin: 10,
        hsvMax: 35,
        minContourArea: 50,
      };

      if (selectedSample.rawFile) {
        requestPayload.file = selectedSample.rawFile;
      } else if (selectedSample.backendPath) {
        requestPayload.samplePath = selectedSample.backendPath;
      }

      const backendData = await processLeafImageApi(requestPayload);

      if (backendData?.success) {
        setBackendOnline(true);
        const metrics = backendData.metrics || {};
        const glcm = backendData.glcm || {};
        const images = backendData.images || {};

        setResult({
          isBackend: true,
          filename: backendData.filename,
          dimensions: {
            width: backendData.metadata?.Width || 640,
            height: backendData.metadata?.Height || 480,
            totalPixels: (backendData.metadata?.Width || 640) * (backendData.metadata?.Height || 480),
          },
          metadata: backendData.metadata,
          leafPixels: metrics['Leaf Area (px)'] || 0,
          lesionPixels: metrics['Lesion Area (px)'] || 0,
          severityIndex: metrics['Infection Severity (%)'] || 0,
          gradeLabel: metrics['Severity Grade'] || 'Grade 0 (Healthy)',
          gradeColor:
            metrics['Status Color'] === 'green'
              ? 'emerald'
              : metrics['Status Color'] === 'orange'
              ? 'amber'
              : 'rose',
          actionAdvice: metrics['Health Decision'] || 'Healthy condition.',
          lesionClusterCount: metrics['Lesion Spot Count'] || 0,
          glcm: {
            contrast: glcm['Contrast']?.toFixed(4) || '0.0000',
            dissimilarity: glcm['Dissimilarity']?.toFixed(4) || '0.0000',
            homogeneity: glcm['Homogeneity']?.toFixed(4) || '0.0000',
            energy: glcm['Energy']?.toFixed(4) || '0.0000',
            correlation: glcm['Correlation']?.toFixed(4) || '0.0000',
          },
          latency: backendData.latency_ms,
          urls: {
            original: images.original,
            geometric: images.geometric,
            illumination: images.illumination,
            contrast: images.contrast,
            filtered: images.filtered,
            grayscale: images.grayscale,
            hsv: images.hsv,
            lab: images.lab,
            ycrcb: images.ycrcb,
            binary: images.binary_otsu,
            canopyMask: images.leaf_mask,
            lesionMask: images.lesion_mask,
            diagnosticOverlay: images.diagnostic_overlay,
          },
        });
        setLoading(false);
        setIsUpdating(false);
        return;
      }
    } catch (err) {
      console.warn('Backend request failed or offline. Falling back to local canvas:', err.message);
      setBackendOnline(false);
    }

    // 2. Client-side fallback if backend server is not running
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedSample.path;

    img.onload = () => {
      try {
        const analysis = analyzeLeafImage(img, {
          gamma,
          contrast,
        });
        setResult({
          isBackend: false,
          ...analysis,
        });
      } catch (clientErr) {
        setErrorMessage('Failed to process image locally: ' + clientErr.message);
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    };

    img.onerror = () => {
      setErrorMessage('Could not load leaf image: ' + selectedSample.path);
      setLoading(false);
      setIsUpdating(false);
    };
  }, [selectedSample, gamma, contrast, filterType, result]);

  // Debounced pipeline execution when parameters change (prevents aggressive refreshing)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      executePipeline();
    }, 220);

    return () => clearTimeout(debounceTimer);
  }, [selectedSample, gamma, contrast, filterType]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenDataset={() => setIsDatasetOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        backendOnline={backendOnline}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Clean, Simple Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl shadow-emerald-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                AgriVision AI
              </span>
              <span className="text-emerald-100 text-xs font-semibold">
                Tropical Fruit Foliar Analysis
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight">
              Automated Leaf Disease Detection & Severity Grading
            </h1>
            <p className="text-xs text-emerald-100 max-w-3xl leading-relaxed">
              Detects and localizes necrotic lesion spots, extracts morphological contours, and computes infection severity on Mango, Lime, and Jackfruit leaves.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={executePipeline}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Re-analyze Leaf'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Leaf Sample Picker & Custom Upload */}
        <SampleSelector
          selectedSample={selectedSample}
          onSelectSample={(sample) => {
            setSelectedSample(sample);
          }}
          onCustomUpload={(customSample) => {
            setSelectedSample(customSample);
          }}
        />

        {/* 2. Visual AI Output & Diagnostic Summary (Side by Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Visual Identification Viewer */}
          <div className="lg:col-span-7">
            <AIDiagnosisView
              result={result}
              isProcessing={loading || isUpdating}
            />
          </div>

          {/* Diagnostic Summary & Health Grade */}
          <div className="lg:col-span-5">
            <DiagnosisSummaryCard
              result={result}
            />
          </div>
        </div>

        {/* 3. Collapsible Advanced Technical Pipeline & GLCM Table */}
        <AdvancedPipelineDrawer
          result={result}
          gamma={gamma}
          setGamma={setGamma}
          contrast={contrast}
          setContrast={setContrast}
          filterType={filterType}
          setFilterType={setFilterType}
          onApplyChanges={executePipeline}
        />
      </main>

      {/* Dataset Specification Modal */}
      <DatasetModal
        isOpen={isDatasetOpen}
        onClose={() => setIsDatasetOpen(false)}
      />

      {/* Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
