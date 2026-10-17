import cv2
import numpy as np
import time
from skimage.feature import graycomatrix, graycoprops

def convert_color_space(img_bgr, target_space="HSV"):
    """
    Converts input BGR image to the chosen color space:
    - Grayscale
    - HSV (Hue, Saturation, Value)
    - CIE-Lab (Luminance, a*, b*)
    - YCrCb (Luma, Chroma Red, Chroma Blue)
    - Binary (Otsu / Adaptive thresholding)
    """
    if img_bgr is None:
        return None

    if target_space == "Grayscale":
        return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    elif target_space == "HSV":
        return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    elif target_space == "Lab":
        return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2Lab)
    elif target_space == "YCrCb":
        return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
    elif target_space == "Binary (Otsu)":
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh
    elif target_space == "Binary (Adaptive)":
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        return cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    return img_bgr

def enhance_contrast(img_bgr, method="CLAHE", clip_limit=2.0, tile_grid_size=(8, 8)):
    """
    Contrast improvement requirement:
    - CLAHE (Contrast Limited Adaptive Histogram Equalization) on L-channel of Lab space (prevents color distortion and over-amplification of noise).
    - Global Histogram Equalization on Y-channel of YCrCb space.
    """
    if img_bgr is None:
        return None

    if method == "CLAHE":
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2Lab)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_Lab2BGR)
    elif method == "Histogram Equalization":
        ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
        y, cr, cb = cv2.split(ycrcb)
        y_eq = cv2.equalizeHist(y)
        eq_img = cv2.merge((y_eq, cr, cb))
        return cv2.cvtColor(eq_img, cv2.COLOR_YCrCb2BGR)
    return img_bgr

def correct_illumination(img_bgr, method="Gamma Correction", gamma=1.2, bg_kernel_size=31):
    """
    Illumination correction requirement (separate from contrast enhancement):
    - Gamma Correction: Non-linear luminance scaling (I_out = I_in ^ (1/gamma)).
    - Background Illumination Subtraction: Estimates uneven lighting using large morphological closing / Gaussian background model and normalizes.
    """
    if img_bgr is None:
        return None

    if method == "Gamma Correction":
        inv_gamma = 1.0 / max(gamma, 0.01)
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        return cv2.LUT(img_bgr, table)
    elif method == "Background Subtraction (Illumination Normalization)":
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2Lab)
        l, a, b = cv2.split(lab)
        # Estimate background illumination with large Gaussian kernel
        k = bg_kernel_size if bg_kernel_size % 2 == 1 else bg_kernel_size + 1
        bg = cv2.GaussianBlur(l, (k, k), 0)
        # Difference + mean luminance offset
        l_norm = cv2.addWeighted(l, 1.0, bg, -1.0, 128)
        norm_lab = cv2.merge((l_norm, a, b))
        return cv2.cvtColor(norm_lab, cv2.COLOR_Lab2BGR)
    return img_bgr

def apply_noise_filter(img_bgr, filter_type="Median Filter", ksize=5, sigma=1.5, d=9, sigma_color=75, sigma_space=75):
    """
    Noise filtering comparison:
    - Gaussian Blur: Linear smoothing, blurs sharp edges of lesion spots.
    - Median Filter: Non-linear, highly effective for impulse/salt-and-pepper noise while preserving lesion edge boundaries.
    - Bilateral Filter: Non-linear, edge-preserving smoothing based on both spatial distance and radiometric intensity distance.
    """
    if img_bgr is None:
        return None, 0.0

    k = ksize if ksize % 2 == 1 else ksize + 1
    start_t = time.perf_counter()

    if filter_type == "Gaussian Blur":
        filtered = cv2.GaussianBlur(img_bgr, (k, k), sigma)
    elif filter_type == "Median Filter":
        filtered = cv2.medianBlur(img_bgr, k)
    elif filter_type == "Bilateral Filter":
        filtered = cv2.bilateralFilter(img_bgr, d=d, sigmaColor=sigma_color, sigmaSpace=sigma_space)
    else:
        filtered = img_bgr

    elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
    return filtered, elapsed_ms

def apply_geometric_transformations(img_bgr, rotation_angle=0, flip_mode="None", scale_pct=100, crop_box=None):
    """
    Geometric transformation & ROI cropping:
    - Rotation: 0, 90, 180, 270 or arbitrary angle.
    - Flip: Horizontal, Vertical, Both.
    - Scaling: Resize by factor.
    - Cropping: Bounding box [ymin, ymax, xmin, xmax] as % or px.
    """
    if img_bgr is None:
        return None

    res = img_bgr.copy()
    h, w = res.shape[:2]

    # Cropping
    if crop_box is not None:
        ymin, ymax, xmin, xmax = crop_box
        ymin, ymax = max(0, int(ymin * h / 100)), min(h, int(ymax * h / 100))
        xmin, xmax = max(0, int(xmin * w / 100)), min(w, int(xmax * w / 100))
        if ymax > ymin and xmax > xmin:
            res = res[ymin:ymax, xmin:xmax]
            h, w = res.shape[:2]

    # Rotation
    if rotation_angle == 90:
        res = cv2.rotate(res, cv2.ROTATE_90_CLOCKWISE)
    elif rotation_angle == 180:
        res = cv2.rotate(res, cv2.ROTATE_180)
    elif rotation_angle == 270:
        res = cv2.rotate(res, cv2.ROTATE_90_COUNTERCLOCKWISE)
    elif rotation_angle != 0:
        center = (w // 2, h // 2)
        rot_mat = cv2.getRotationMatrix2D(center, rotation_angle, 1.0)
        res = cv2.warpAffine(res, rot_mat, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    # Flip
    if flip_mode == "Horizontal":
        res = cv2.flip(res, 1)
    elif flip_mode == "Vertical":
        res = cv2.flip(res, 0)
    elif flip_mode == "Both":
        res = cv2.flip(res, -1)

    # Scale
    if scale_pct != 100 and scale_pct > 10:
        new_w = max(10, int(res.shape[1] * scale_pct / 100))
        new_h = max(10, int(res.shape[0] * scale_pct / 100))
        res = cv2.resize(res, (new_w, new_h), interpolation=cv2.INTER_AREA if scale_pct < 100 else cv2.INTER_CUBIC)

    return res

# ----------------- DOMAIN ANALYSIS TECHNIQUES (Checklist 4 & 5) -----------------

def segment_leaf_and_lesions(img_bgr, hsv_lower_disease=np.array([10, 40, 40]), hsv_upper_disease=np.array([35, 255, 255]), min_contour_area=50):
    """
    Domain Analysis Technique 1 & 2:
    - Technique 1: Color Space Segmentation (HSV/Lab thresholding to isolate leaf canopy and disease spots).
    - Technique 2: Morphological Operations & Contour Analysis (Area calculation, lesion contour extraction, Infection Severity Index).
    """
    if img_bgr is None:
        return None, None, None, {}

    # Convert to HSV & Lab
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2Lab)

    # 1. Segment Total Leaf Mask (Background separation: Green and brownish vegetation)
    lower_green = np.array([25, 30, 30])
    upper_green = np.array([90, 255, 255])
    green_mask = cv2.inRange(hsv, lower_green, upper_green)

    # Also detect diseased leaf tissue in HSV
    disease_mask_raw = cv2.inRange(hsv, hsv_lower_disease, hsv_upper_disease)
    
    # Combined leaf canopy
    leaf_mask_combined = cv2.bitwise_or(green_mask, disease_mask_raw)
    
    # Morphological refinement for leaf canopy (Closing to fill internal holes, Opening to remove background specks)
    kernel_leaf = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    leaf_mask = cv2.morphologyEx(leaf_mask_combined, cv2.MORPH_CLOSE, kernel_leaf, iterations=2)
    leaf_mask = cv2.morphologyEx(leaf_mask, cv2.MORPH_OPEN, kernel_leaf, iterations=1)

    # 2. Refine Disease Lesions within the detected leaf mask
    disease_mask_in_leaf = cv2.bitwise_and(disease_mask_raw, disease_mask_raw, mask=leaf_mask)
    
    # Morphological cleaning of lesion spots
    kernel_lesion = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    lesion_mask = cv2.morphologyEx(disease_mask_in_leaf, cv2.MORPH_OPEN, kernel_lesion, iterations=1)
    lesion_mask = cv2.morphologyEx(lesion_mask, cv2.MORPH_CLOSE, kernel_lesion, iterations=1)

    # 3. Contour Analysis for Lesion Localization & Area Calculation
    contours, _ = cv2.findContours(lesion_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    sorted_contours = sorted(contours, key=cv2.contourArea, reverse=True)
    
    overlay = img_bgr.copy()
    # Semi-transparent red highlight on lesion spots for crisp AI visibility
    tint = overlay.copy()
    tint[lesion_mask > 0] = [0, 0, 240] # Vibrant red
    overlay = cv2.addWeighted(overlay, 0.70, tint, 0.30, 0)

    valid_lesions_count = 0
    total_lesion_area = 0

    for idx, cnt in enumerate(sorted_contours):
        area = cv2.contourArea(cnt)
        if area >= min_contour_area:
            valid_lesions_count += 1
            total_lesion_area += area
            x, y, w, h = cv2.boundingRect(cnt)
            # Draw bounding box and contour
            cv2.rectangle(overlay, (x, y), (x + w, y + h), (0, 0, 255), 2)
            cv2.drawContours(overlay, [cnt], -1, (0, 255, 255), 2)
            
            # Add small label badge for top spots
            if valid_lesions_count <= 6:
                label = f"#{valid_lesions_count}"
                cv2.rectangle(overlay, (x, max(0, y - 18)), (x + 28, max(0, y)), (0, 0, 255), -1)
                cv2.putText(overlay, label, (x + 3, max(12, y - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv2.LINE_AA)

    total_leaf_area = max(1, int(np.count_nonzero(leaf_mask)))
    
    # OUTPUT RULE (Checklist 5):
    # Infection Severity % = (Total Lesion Area / Total Leaf Area) * 100
    severity_pct = round((total_lesion_area / total_leaf_area) * 100, 2)

    # Decision Rule
    if severity_pct < 2.0:
        health_status = "Healthy / Negligible Symptoms"
        severity_grade = "Grade 0 (Healthy)"
        status_color = "green"
    elif severity_pct <= 15.0:
        health_status = "Mild Infection / Early Stage"
        severity_grade = "Grade 1 (Mild)"
        status_color = "orange"
    else:
        health_status = "Severe Disease Infestation"
        severity_grade = "Grade 2 (Severe)"
        status_color = "red"

    metrics = {
        "Leaf Area (px)": total_leaf_area,
        "Lesion Area (px)": int(total_lesion_area),
        "Lesion Spot Count": valid_lesions_count,
        "Infection Severity (%)": severity_pct,
        "Health Decision": health_status,
        "Severity Grade": severity_grade,
        "Status Color": status_color
    }

    return leaf_mask, lesion_mask, overlay, metrics

def extract_glcm_texture_features(img_bgr):
    """
    Domain Analysis Technique 3:
    - GLCM (Gray-Level Co-occurrence Matrix) Texture Feature Extraction
    Computes Contrast, Dissimilarity, Homogeneity, Energy, and Correlation.
    """
    if img_bgr is None:
        return {}

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    # Downscale intensity levels to 32 bins for fast GLCM computation
    gray_quantized = (gray // 8).astype(np.uint8)

    glcm = graycomatrix(gray_quantized, distances=[1, 3], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4], levels=32, symmetric=True, normed=True)

    features = {
        "Contrast": round(float(graycoprops(glcm, 'contrast').mean()), 4),
        "Dissimilarity": round(float(graycoprops(glcm, 'dissimilarity').mean()), 4),
        "Homogeneity": round(float(graycoprops(glcm, 'homogeneity').mean()), 4),
        "Energy": round(float(graycoprops(glcm, 'energy').mean()), 4),
        "Correlation": round(float(graycoprops(glcm, 'correlation').mean()), 4)
    }
    return features
