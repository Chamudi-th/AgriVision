/**
 * API service communicating with the Python FastAPI OpenCV backend
 */

const API_BASE = ''; // Uses Vite proxy in development or direct host in production

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === 'healthy';
  } catch (err) {
    return false;
  }
}

export async function fetchDatasetSummary() {
  const res = await fetch(`${API_BASE}/api/dataset/summary`);
  if (!res.ok) throw new Error('Failed to fetch dataset summary');
  return await res.json();
}

export async function processLeafImageApi({
  file,
  samplePath,
  gamma = 1.2,
  contrastMethod = 'CLAHE',
  clipLimit = 2.0,
  illuminationMethod = 'Gamma Correction',
  filterType = 'Median Filter',
  filterKsize = 5,
  rotationAngle = 0,
  flipMode = 'None',
  scalePct = 100,
  hsvMin = 10,
  hsvMax = 35,
  minContourArea = 50,
}) {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  } else if (samplePath) {
    formData.append('sample_path', samplePath);
  } else {
    throw new Error('Either file or samplePath must be provided');
  }

  formData.append('gamma', gamma.toString());
  formData.append('contrast_method', contrastMethod);
  formData.append('clip_limit', clipLimit.toString());
  formData.append('illumination_method', illuminationMethod);
  formData.append('filter_type', filterType);
  formData.append('filter_ksize', filterKsize.toString());
  formData.append('rotation_angle', rotationAngle.toString());
  formData.append('flip_mode', flipMode);
  formData.append('scale_pct', scalePct.toString());
  formData.append('hsv_h_min', hsvMin.toString());
  formData.append('hsv_h_max', hsvMax.toString());
  formData.append('min_contour_area', minContourArea.toString());

  const response = await fetch(`${API_BASE}/api/process`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.detail || `Server error (${response.status})`);
  }

  return await response.json();
}
