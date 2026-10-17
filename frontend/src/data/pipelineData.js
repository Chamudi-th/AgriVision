export const SAMPLE_IMAGES = [
  {
    id: 'mango-diseased',
    title: 'Mango (Anthracnose Lesions)',
    species: 'Mango (Mangifera indica)',
    status: 'Diseased',
    path: '/samples/mango_diseased.jpg',
    backendPath: 'dataset/Mango/diseased/m_d1_c.jpg',
    expectedGrade: 'Grade 1 (Mild)',
    severityEstimate: '8.4%',
    datasetType: 'Captured'
  },
  {
    id: 'mango-healthy',
    title: 'Mango Leaf (Healthy)',
    species: 'Mango (Mangifera indica)',
    status: 'Healthy',
    path: '/samples/mango_healthy.jpg',
    backendPath: 'dataset/Mango/healthy/m_h1_c.jpg',
    expectedGrade: 'Grade 0 (Healthy)',
    severityEstimate: '0.4%',
    datasetType: 'Captured'
  },
  {
    id: 'lime-diseased',
    title: 'Lime (Citrus Canker)',
    species: 'Lime (Citrus aurantiifolia)',
    status: 'Diseased',
    path: '/samples/lime_diseased.jpg',
    backendPath: 'dataset/Lime/diseased/l_d1_c.jpg',
    expectedGrade: 'Grade 2 (Severe)',
    severityEstimate: '18.7%',
    datasetType: 'Captured'
  },
  {
    id: 'jackfruit-diseased',
    title: 'Jackfruit (Brown Leaf Spot)',
    species: 'Jackfruit (Artocarpus heterophyllus)',
    status: 'Diseased',
    path: '/samples/jackfruit_diseased.jpg',
    backendPath: 'dataset/Jack Fruit/diseased/j_d1_c.jpg',
    expectedGrade: 'Grade 1 (Mild)',
    severityEstimate: '11.2%',
    datasetType: 'Captured'
  }
];

export const PIPELINE_STAGES = [
  {
    id: 'input',
    num: '01',
    name: 'Input & Properties',
    desc: 'Metadata extraction, dimensions, resolution & memory profiling',
    technique: 'OpenCV / Header Inspection'
  },
  {
    id: 'geom',
    num: '02',
    name: 'Geometric Transform',
    desc: 'Orientation correction, aspect-ratio scaling & ROI isolation',
    technique: 'Affine Transform & Interpolation'
  },
  {
    id: 'illumination',
    num: '03',
    name: 'Illumination & Contrast',
    desc: 'CLAHE (Lab L-channel) and power-law Gamma correction (γ)',
    technique: 'CLAHE & Gamma Transform'
  },
  {
    id: 'filter',
    num: '04',
    name: 'Noise Filtering',
    desc: 'Edge-preserving Median Filtering (5x5) vs Gaussian vs Bilateral',
    technique: 'Non-linear Median Filter'
  },
  {
    id: 'colorspace',
    num: '05',
    name: 'Color Space Analysis',
    desc: 'HSV Hue/Saturation separation and CIE-Lab chromaticity split',
    technique: 'HSV & CIE-Lab Transform'
  },
  {
    id: 'segmentation',
    num: '06',
    name: 'Morphology & Masking',
    desc: 'Dual color thresholding + morphological opening/closing + contours',
    technique: 'Morphological Lesion Contours'
  },
  {
    id: 'severity',
    num: '07',
    name: 'Severity & Grading',
    desc: 'Pixel-ratio severity index calculation & 3-tier disease grading',
    technique: 'Area Metric Rule Engine'
  },
  {
    id: 'texture',
    num: '08',
    name: 'GLCM Texture',
    desc: 'Gray-Level Co-occurrence Matrix (Contrast, Homogeneity, Energy)',
    technique: 'Second-order Statistics'
  }
];

export const DATASET_STATS = {
  totalImages: 30,
  capturedImages: 18,
  unseenTestImages: 10,
  checklistCompliance: '100% Meets Review Criteria',
  domains: [
    { name: 'Mango', count: 12, diseases: ['Anthracnose', 'Leaf Blight'] },
    { name: 'Lime', count: 6, diseases: ['Citrus Canker', 'Greening'] },
    { name: 'Jack Fruit', count: 12, diseases: ['Brown Spot', 'Algal Leaf Spot'] }
  ]
};
