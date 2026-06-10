"""
Medical Document CNN Classifier
Uses MobileNetV2 (pre-trained ImageNet) + OpenCV structural analysis
to determine if an image is a genuine medical document.

No training data needed — combines:
  1. CNN deep features (MobileNetV2 conv activations)
  2. OpenCV structural features (edges, tables, text density, whitespace)
"""

import cv2
import numpy as np
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

# ── Load MobileNetV2 once at module import ──────────────────────────────────
_model = None
_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def _get_model():
    global _model
    if _model is None:
        _model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
        _model.eval()
    return _model


def _cnn_features(img: Image.Image) -> dict:
    """
    Run MobileNetV2 and extract:
    - Top-1 ImageNet class probability
    - Probability mass on document-like ImageNet classes
    - Mean activation of the final conv feature map (texture richness)
    """
    model = _get_model()
    tensor = _transform(img.convert("RGB")).unsqueeze(0)

    with torch.no_grad():
        # Hook into the last conv layer for feature map stats
        features = model.features(tensor)            # (1, 1280, 7, 7)
        pooled = features.mean(dim=[2, 3])[0]        # (1280,)
        logits = model.classifier(features.mean(dim=[2, 3]))
        probs = torch.softmax(logits, dim=1)[0]

    # ImageNet classes that fire for document / form-like images
    # 463=book_jacket, 549=envelope, 700=paper_towel, 760=quill,
    # 809=space_bar(keyboard), 887=typewriter, 916=web_site, 921=book_jacket
    DOC_CLASSES = [463, 549, 700, 760, 809, 887, 916, 921]
    doc_activation = float(probs[DOC_CLASSES].sum().item())

    # Texture richness: high std in feature map = rich texture (text, tables)
    feature_std = float(pooled.std().item())

    return {
        "doc_class_activation": doc_activation,
        "feature_texture": min(feature_std / 0.5, 1.0),   # normalize ~0-1
    }


def _opencv_features(img: Image.Image) -> dict:
    """
    Extract structural features that distinguish medical documents from
    random images.

    Key design rule: every feature is conditioned on having a LIGHT background.
    Dark-background images (photos, banners, logos) return near-zero on all
    features so they cannot masquerade as documents.
    """
    img_np = np.array(img.convert("RGB"))
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    h, w = gray.shape

    # 1. Light background ratio — documents are printed on white/light paper
    light_ratio = float(np.sum(gray > 200) / gray.size)

    # 2. Edge density from text — only meaningful on light-background images
    #    Threshold to light areas first so dark images don't get credit for edges
    light_mask = (gray > 180).astype(np.uint8) * 255
    gray_masked = cv2.bitwise_and(gray, light_mask)
    edges = cv2.Canny(gray_masked, 50, 150)
    edge_density = float(np.sum(edges > 0) / edges.size)

    # 3. Horizontal line / table detection
    #    Only apply on images with a light background (light_ratio > 0.3).
    #    Use adaptive threshold on the original gray so it works for scanned docs.
    if light_ratio > 0.30:
        adapt = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 15, 5
        )
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (max(w // 20, 20), 1))
        h_lines = cv2.morphologyEx(adapt, cv2.MORPH_OPEN, h_kernel)
        table_score = float(np.sum(h_lines > 128) / h_lines.size)
    else:
        table_score = 0.0

    # 4. Text-block contour count on light-background only
    if light_ratio > 0.30:
        adapt2 = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 11, 3
        )
        contours, _ = cv2.findContours(adapt2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        text_regions = sum(1 for c in contours if 30 < cv2.contourArea(c) < 8000)
    else:
        text_regions = 0

    # 5. Local contrast only on light areas
    if light_ratio > 0.20:
        block = 16
        blocks = [
            gray[y:y+block, x:x+block].std()
            for y in range(0, h - block, block)
            for x in range(0, w - block, block)
            if float(gray[y:y+block, x:x+block].mean()) > 180
        ]
        mean_local_contrast = (float(np.mean(blocks)) / 128.0) if blocks else 0.0
    else:
        mean_local_contrast = 0.0

    return {
        "edge_density": round(edge_density, 4),
        "light_ratio": round(light_ratio, 4),
        "table_score": round(table_score, 5),
        "text_blocks": round(min(text_regions / 80, 1.0), 4),
        "local_contrast": round(mean_local_contrast, 4),
    }


def classify_medical_document(img: Image.Image) -> dict:
    """
    Main entry point. Returns:
      cnn_medical_score  : 0.0 (not medical doc) → 1.0 (strong medical doc signal)
      details            : breakdown of each sub-score

    Strategy:
      Structural OpenCV features dominate (80%) — they are robust and
      interpretable. MobileNetV2 doc-class activation contributes 20%.
      feature_texture is intentionally excluded: uniform-colour images
      cause out-of-distribution MobileNetV2 activations with high std,
      making the metric unreliable without domain fine-tuning.
    """
    cv = _opencv_features(img)
    cnn = _cnn_features(img)

    # ── Structural score (primary, 0–1) ────────────────────────────────────
    # Medical documents: white background, text edges, tables, many text blocks
    structural_raw = (
        cv["light_ratio"]    * 3.5 +   # white paper background (most reliable)
        cv["table_score"]    * 8.0 +   # horizontal rules / table lines
        cv["edge_density"]   * 3.0 +   # dense text → many edges
        cv["text_blocks"]    * 2.5 +   # many small text-sized contours
        cv["local_contrast"] * 1.5     # text areas have high local contrast
    )
    structural_score = min(structural_raw / 6.0, 1.0)

    # ── CNN doc-class activation (secondary, 0–1) ──────────────────────────
    # Normalise: max expected activation from doc-class subset is ~0.15
    cnn_support = min(cnn["doc_class_activation"] / 0.15, 1.0)

    # ── Blend: structural 80 %, CNN 20 % ──────────────────────────────────
    cnn_medical_score = round(structural_score * 0.80 + cnn_support * 0.20, 3)

    return {
        "cnn_medical_score": cnn_medical_score,
        "details": {
            **cv,
            "doc_class_activation": cnn["doc_class_activation"],
            "structural_score": round(structural_score, 3),
            "cnn_support": round(cnn_support, 3),
        },
    }
