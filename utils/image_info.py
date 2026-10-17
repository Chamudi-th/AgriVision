import numpy as np

def extract_image_metadata(img_bgr, filename="Uploaded Image", file_bytes_len=None):
    """
    Extracts core DIP properties required by Checklist Item 3:
    - Dimensions (Height, Width)
    - Channels
    - Bit Depth & Data Type
    - File Size (KB)
    - Value Range (Min, Max, Mean, Std)
    """
    if img_bgr is None:
        return {}

    h, w = img_bgr.shape[:2]
    c = img_bgr.shape[2] if len(img_bgr.shape) == 3 else 1
    dtype = str(img_bgr.dtype)
    itemsize = img_bgr.itemsize
    bit_depth = f"{itemsize * 8}-bit ({dtype})"
    
    total_pixels = h * w
    memory_size_kb = round(img_bgr.nbytes / 1024, 2)
    file_size_kb = round(file_bytes_len / 1024, 2) if file_bytes_len else memory_size_kb

    channel_stats = {
        "min": int(np.min(img_bgr)),
        "max": int(np.max(img_bgr)),
        "mean": round(float(np.mean(img_bgr)), 2),
        "std": round(float(np.std(img_bgr)), 2)
    }

    return {
        "Filename": filename,
        "Dimensions": f"{w} x {h} px",
        "Width": w,
        "Height": h,
        "Channels": c,
        "Total Pixels": f"{total_pixels:,}",
        "Bit Depth": bit_depth,
        "Memory Footprint": f"{memory_size_kb} KB",
        "File Size": f"{file_size_kb} KB",
        "Pixel Stats (Min/Max/Mean)": f"{channel_stats['min']} / {channel_stats['max']} / {channel_stats['mean']}"
    }

def calculate_roi_stats(img_bgr, x, y, w, h):
    """
    Calculates statistical information for a selected Region of Interest (ROI).
    """
    img_h, img_w = img_bgr.shape[:2]
    x = max(0, min(x, img_w - 1))
    y = max(0, min(y, img_h - 1))
    w = max(1, min(w, img_w - x))
    h = max(1, min(h, img_h - y))

    roi = img_bgr[y:y+h, x:x+w]
    roi_pixels = w * h
    total_pixels = img_h * img_w
    coverage_pct = round((roi_pixels / total_pixels) * 100, 2)

    return {
        "ROI Bounding Box": f"(x={x}, y={y}, w={w}, h={h})",
        "ROI Area": f"{roi_pixels:,} px ({coverage_pct}% of leaf)",
        "ROI Mean Intensity (BGR)": [round(float(np.mean(roi[:, :, i])), 2) for i in range(roi.shape[2])] if len(roi.shape) == 3 else round(float(np.mean(roi)), 2),
        "ROI Std Deviation": round(float(np.std(roi)), 2)
    }, roi
