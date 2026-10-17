import os
import cv2
import pandas as pd
import numpy as np

def generate_dataset_metadata(dataset_root="dataset", output_csv="dataset/dataset_metadata.csv", force_refresh=True):
    """
    Scans the dataset directory and generates a fresh metadata CSV cataloging:
    - Image Name
    - Relative Path
    - Fruit Type
    - Category / Split (healthy, diseased, test)
    - Source (Self-captured / Open Field / Benchmark)
    - Dimensions (Height, Width, Channels)
    - Bit Depth
    - File Size (KB)
    - Test Purpose (Development vs Unseen Test Evaluation)
    """
    if not os.path.exists(dataset_root):
        return None

    records = []
    supported_exts = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp')

    for root, dirs, files in os.walk(dataset_root):
        for file in sorted(files):
            if file.startswith('.'):
                continue
            if file.lower().endswith(supported_exts):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, dataset_root)
                parts = rel_path.split(os.sep)

                fruit_type = parts[0] if len(parts) > 1 else "Unknown"
                category = parts[1] if len(parts) > 2 else "General"
                
                # Determine source & purpose
                is_test = category.lower() == "test"
                fname_lower = file.lower()
                is_captured = ("_c." in fname_lower or "_c_" in fname_lower or 
                               "custom" in fname_lower or "flipped" in fname_lower or 
                               "shifted" in fname_lower or "brightened" in fname_lower or 
                               "img_202" in fname_lower or "2021" in fname_lower)
                
                source = "Captured / Pre-augmented Field Sample" if is_captured else "Standardized Domain Dataset"
                purpose = "Unseen Test Evaluation (Stage 6 Ground Truth)" if is_test else f"Development & Tuning ({category.capitalize()})"

                # Read image properties
                try:
                    file_size_kb = round(os.path.getsize(file_path) / 1024, 2)
                    img = cv2.imread(file_path)
                    if img is not None:
                        h, w, c = img.shape
                        dtype = str(img.dtype)
                        bit_depth = f"{img.itemsize * 8}-bit ({dtype})"
                    else:
                        h, w, c, bit_depth = 0, 0, 0, "Corrupt"
                except Exception:
                    h, w, c, bit_depth = 0, 0, 0, "Error"
                    file_size_kb = 0

                records.append({
                    "Image ID": len(records) + 1,
                    "Filename": file,
                    "Fruit Domain": fruit_type,
                    "Class / Subset": category.capitalize(),
                    "Resolution": f"{w}x{h}" if w > 0 else "N/A",
                    "Channels": c,
                    "Bit Depth": bit_depth,
                    "Size (KB)": file_size_kb,
                    "Source Category": source,
                    "Evaluation Purpose": purpose,
                    "Relative Path": rel_path
                })

    df = pd.DataFrame(records)
    if not df.empty and output_csv:
        df.to_csv(output_csv, index=False)
    return df

def get_dataset_summary(dataset_root="dataset", force_refresh=False):
    """
    Returns summary metrics of the dataset and auto-validates existing files.
    """
    metadata_path = os.path.join(dataset_root, "dataset_metadata.csv")
    
    # Check if existing CSV has stale paths
    need_refresh = force_refresh or not os.path.exists(metadata_path)
    if not need_refresh:
        try:
            df = pd.read_csv(metadata_path)
            # Check if sample files in CSV actually exist on disk
            sample_paths = df["Relative Path"].dropna().head(5).tolist()
            for sp in sample_paths:
                if not os.path.exists(os.path.join(dataset_root, sp)):
                    need_refresh = True
                    break
        except Exception:
            need_refresh = True

    if need_refresh:
        df = generate_dataset_metadata(dataset_root, metadata_path, force_refresh=True)
    else:
        df = pd.read_csv(metadata_path)
        
    if df is None or df.empty:
        return {
            "total_images": 0,
            "captured_images": 0,
            "unseen_test_images": 0,
            "categories": {},
            "df": pd.DataFrame()
        }

    total_images = len(df)
    captured_images = len(df[df["Source Category"].str.contains("Captured", case=False, na=False)])
    unseen_test_images = len(df[df["Class / Subset"].str.lower() == "test"])
    by_fruit = df["Fruit Domain"].value_counts().to_dict()
    by_class = df["Class / Subset"].value_counts().to_dict()

    return {
        "total_images": total_images,
        "captured_images": captured_images,
        "unseen_test_images": unseen_test_images,
        "by_fruit": by_fruit,
        "by_class": by_class,
        "df": df
    }
