import os
import io
import time
import base64
import cv2
import numpy as np
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from utils.dataset_manager import get_dataset_summary, generate_dataset_metadata
from utils.image_info import extract_image_metadata
from utils.pipeline import (
    convert_color_space,
    enhance_contrast,
    correct_illumination,
    apply_noise_filter,
    apply_geometric_transformations,
    segment_leaf_and_lesions,
    extract_glcm_texture_features,
)

app = FastAPI(
    title="Plant Leaf Disease DIP Backend API",
    description="Automated detection, localization, and severity grading using OpenCV & DIP algorithms",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount dataset folder for direct static asset serving
if os.path.exists("dataset"):
    app.mount("/dataset", StaticFiles(directory="dataset"), name="dataset")


def cv2_to_base64_data_url(img: np.ndarray, quality: int = 85) -> Optional[str]:
    """Encodes an OpenCV image to a base64 JPEG Data URL."""
    if img is None:
        return None
    success, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not success:
        return None
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64_str}"


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Plant Leaf DIP Backend",
        "timestamp": time.time()
    }


@app.get("/api/dataset/summary")
def get_dataset_info():
    """Returns dataset summary statistics and checklist compliance."""
    try:
        summary = get_dataset_summary("dataset")
        return {"success": True, "data": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/samples")
def get_sample_list():
    """Returns preset tropical fruit leaf images with metadata."""
    samples = [
        {
            "id": "mango_diseased",
            "title": "Mango (Anthracnose Lesions)",
            "species": "Mango (Mangifera indica)",
            "category": "diseased",
            "path": "dataset/Mango/diseased/m_d1_c.jpg",
            "expected_grade": "Grade 1 (Mild)"
        },
        {
            "id": "mango_healthy",
            "title": "Mango Leaf (Healthy)",
            "species": "Mango (Mangifera indica)",
            "category": "healthy",
            "path": "dataset/Mango/healthy/m_h1_c.jpg",
            "expected_grade": "Grade 0 (Healthy)"
        },
        {
            "id": "lime_diseased",
            "title": "Lime (Citrus Canker)",
            "species": "Lime (Citrus aurantiifolia)",
            "category": "diseased",
            "path": "dataset/Lime/diseased/l_d1_c.jpg",
            "expected_grade": "Grade 2 (Severe)"
        },
        {
            "id": "jackfruit_diseased",
            "title": "Jackfruit (Brown Leaf Spot)",
            "species": "Jackfruit (Artocarpus heterophyllus)",
            "category": "diseased",
            "path": "dataset/Jack Fruit/diseased/j_d1_c.jpg",
            "expected_grade": "Grade 1 (Mild)"
        }
    ]
    return {"success": True, "samples": samples}


@app.post("/api/process")
async def process_leaf_image(
    file: Optional[UploadFile] = File(None),
    sample_path: Optional[str] = Form(None),
    gamma: float = Form(1.2),
    illumination_method: str = Form("Gamma Correction"),
    contrast_method: str = Form("CLAHE"),
    clip_limit: float = Form(2.0),
    filter_type: str = Form("Median Filter"),
    filter_ksize: int = Form(5),
    rotation_angle: int = Form(0),
    flip_mode: str = Form("None"),
    scale_pct: int = Form(100),
    hsv_h_min: int = Form(10),
    hsv_h_max: int = Form(35),
    min_contour_area: int = Form(50)
):
    """
    Unified Digital Image Processing Pipeline Execution Endpoint:
    Processes the image across all 8 stages using OpenCV, NumPy, and Scikit-Image,
    returning accurate segmentation masks, severity metrics, and GLCM statistics.
    """
    start_total_time = time.perf_counter()
    img_bgr = None
    # Cast parameters to native primitives
    try:
        gamma = float(gamma)
    except Exception:
        gamma = 1.2
    try:
        clip_limit = float(clip_limit)
    except Exception:
        clip_limit = 2.0
    try:
        filter_ksize = int(filter_ksize)
    except Exception:
        filter_ksize = 5
    try:
        rotation_angle = int(rotation_angle)
    except Exception:
        rotation_angle = 0
    try:
        scale_pct = int(scale_pct)
    except Exception:
        scale_pct = 100
    try:
        hsv_h_min = int(hsv_h_min)
        hsv_h_max = int(hsv_h_max)
    except Exception:
        hsv_h_min, hsv_h_max = 10, 35
    try:
        min_contour_area = int(min_contour_area)
    except Exception:
        min_contour_area = 50

    # 1. Read input image (file upload or sample path)
    if file is not None and hasattr(file, 'filename') and file.filename:
        filename = file.filename
        content = await file.read()
        file_bytes_len = len(content)
        np_arr = np.frombuffer(content, np.uint8)
        img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    elif sample_path:
        filename = os.path.basename(sample_path)
        if not os.path.exists(sample_path):
            raise HTTPException(status_code=404, detail=f"Sample path not found: {sample_path}")
        file_bytes_len = os.path.getsize(sample_path)
        img_bgr = cv2.imread(sample_path, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image file or sample path could not be loaded.")

    # Stage 1: Metadata extraction
    metadata = extract_image_metadata(img_bgr, filename=filename, file_bytes_len=file_bytes_len)

    # Stage 2: Geometric transformations & ROI
    transformed_img = apply_geometric_transformations(
        img_bgr,
        rotation_angle=rotation_angle,
        flip_mode=flip_mode,
        scale_pct=scale_pct,
        crop_box=None
    )

    # Stage 3: Illumination correction & Contrast enhancement
    illum_corrected = correct_illumination(
        transformed_img,
        method=illumination_method,
        gamma=gamma
    )
    contrast_enhanced = enhance_contrast(
        illum_corrected,
        method=contrast_method,
        clip_limit=clip_limit
    )

    # Stage 4: Noise Filtering
    filtered_img, filter_ms = apply_noise_filter(
        contrast_enhanced,
        filter_type=filter_type,
        ksize=filter_ksize
    )

    # Stage 5: Color Space Representations
    gray_img = convert_color_space(filtered_img, target_space="Grayscale")
    hsv_img = convert_color_space(filtered_img, target_space="HSV")
    lab_img = convert_color_space(filtered_img, target_space="Lab")
    ycrcb_img = convert_color_space(filtered_img, target_space="YCrCb")
    binary_otsu = convert_color_space(filtered_img, target_space="Binary (Otsu)")

    # Stage 6 & 7: Dual Color & Morphological Lesion Segmentation & Severity Grading
    hsv_lower = np.array([hsv_h_min, 40, 40])
    hsv_upper = np.array([hsv_h_max, 255, 255])

    leaf_mask, lesion_mask, diagnostic_overlay, metrics = segment_leaf_and_lesions(
        filtered_img,
        hsv_lower_disease=hsv_lower,
        hsv_upper_disease=hsv_upper,
        min_contour_area=min_contour_area
    )

    # Stage 8: GLCM Texture Feature Extraction
    glcm_features = extract_glcm_texture_features(filtered_img)

    total_latency_ms = round((time.perf_counter() - start_total_time) * 1000, 2)

    # Encode images to Base64 URLs for real-time frontend rendering
    urls = {
        "original": cv2_to_base64_data_url(img_bgr),
        "geometric": cv2_to_base64_data_url(transformed_img),
        "illumination": cv2_to_base64_data_url(illum_corrected),
        "contrast": cv2_to_base64_data_url(contrast_enhanced),
        "filtered": cv2_to_base64_data_url(filtered_img),
        "grayscale": cv2_to_base64_data_url(gray_img),
        "hsv": cv2_to_base64_data_url(hsv_img),
        "lab": cv2_to_base64_data_url(lab_img),
        "ycrcb": cv2_to_base64_data_url(ycrcb_img),
        "binary_otsu": cv2_to_base64_data_url(binary_otsu),
        "leaf_mask": cv2_to_base64_data_url(leaf_mask),
        "lesion_mask": cv2_to_base64_data_url(lesion_mask),
        "diagnostic_overlay": cv2_to_base64_data_url(diagnostic_overlay),
    }

    return {
        "success": True,
        "filename": filename,
        "metadata": metadata,
        "metrics": metrics,
        "glcm": glcm_features,
        "latency_ms": {
            "total_ms": total_latency_ms,
            "filter_ms": filter_ms
        },
        "images": urls
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
