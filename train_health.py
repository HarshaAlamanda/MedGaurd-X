#!/usr/bin/env python3
"""
train_health.py — Train health risk classifier (XGBoost + GridSearchCV).

Outputs:
 - health_risk_model.joblib
 - health_risk_scaler.joblib
 - health_risk_imputer.joblib
 - health_risk_label_encoder.joblib
 - health_metrics.json
 - health_features.json

Usage:
    python train_health.py
    python train_health.py path/to/data.csv
"""

import json
import sys
import warnings
from collections import Counter
from typing import Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")


def create_health_risk_label(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    def get_text_series(col_name, default="None"):
        if col_name in df.columns:
            return df[col_name].fillna(default).astype(str)
        return pd.Series([default] * len(df), index=df.index, dtype=object)

    def numeric_series(col_name, fill_value=np.nan):
        if col_name in df.columns:
            return pd.to_numeric(df[col_name], errors="coerce").astype(float)
        return pd.Series([fill_value] * len(df), index=df.index, dtype=float)

    df["medical_condition"] = get_text_series("medical_condition", "None")
    df["symptoms"] = get_text_series("symptoms", "None")

    sbp = numeric_series("blood_pressure_systolic")
    dbp = numeric_series("blood_pressure_diastolic")
    hr = numeric_series("heart_rate")
    temp = numeric_series("temperature")
    oxy = numeric_series("oxygen_saturation")
    glu = numeric_series("glucose_level")

    df["health_risk"] = "Low"

    high_risk = (
        (sbp >= 140) | (dbp >= 90) | (hr >= 120) | (temp >= 39.0)
        | (oxy <= 90) | (glu >= 200)
        | (df["medical_condition"].str.contains("Heart", case=False, na=False))
    )
    medium_risk = (
        sbp.between(130, 139) | dbp.between(85, 89)
        | hr.between(100, 119) | temp.between(37.5, 38.9)
        | oxy.between(91, 93) | glu.between(140, 199)
        | df["medical_condition"].str.contains("Hypertension|Diabetes|Asthma", case=False, na=False)
    )

    df.loc[high_risk, "health_risk"] = "High"
    df.loc[~high_risk & medium_risk, "health_risk"] = "Medium"

    return df


def preprocess_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, LabelEncoder]:
    df = df.copy()

    if "visit_date" in df.columns:
        df["visit_date"] = pd.to_datetime(df["visit_date"], errors="coerce")
    else:
        df["visit_date"] = pd.NaT

    df["medical_condition"] = df.get("medical_condition", pd.Series(["None"] * len(df), index=df.index)).fillna("None").astype(str)
    df["symptoms"] = df.get("symptoms", pd.Series(["None"] * len(df), index=df.index)).fillna("None").astype(str)
    df["gender"] = df.get("gender", pd.Series(["F"] * len(df), index=df.index)).fillna("F").astype(str)

    df = create_health_risk_label(df)

    df["visit_month"] = df["visit_date"].dt.month
    df["visit_day"] = df["visit_date"].dt.day
    df["visit_dayofweek"] = df["visit_date"].dt.dayofweek

    df["gender"] = df["gender"].map({"F": 0, "M": 1}).fillna(0).astype(int)

    cond_map = {"Asthma": 0, "Diabetes": 1, "Heart Disease": 2, "Hypertension": 3, "None": 4}
    df["medical_condition"] = df["medical_condition"].map(cond_map).fillna(cond_map["None"]).astype(int)

    symptom_vocab = ["Fever", "Cough", "Fatigue", "Shortness of Breath", "Chest Pain"]
    for symptom in symptom_vocab:
        col = f"symptom_{symptom.replace(' ', '_')}"
        df[col] = df["symptoms"].str.contains(symptom, case=False, regex=False, na=False).astype(int)

    # Derived features — must match preprocess() in api.py
    sbp = pd.to_numeric(df.get("blood_pressure_systolic", 0), errors="coerce").fillna(0)
    dbp = pd.to_numeric(df.get("blood_pressure_diastolic", 0), errors="coerce").fillna(0)
    age = pd.to_numeric(df.get("age", 0), errors="coerce").fillna(0)
    glu = pd.to_numeric(df.get("glucose_level", 0), errors="coerce").fillna(0)

    df["pulse_pressure"] = sbp - dbp
    df["bmi_proxy"] = glu / (age + 1)

    symptom_cols = [c for c in df.columns if c.startswith("symptom_")]
    df["symptom_count"] = df[symptom_cols].sum(axis=1)
    df["is_weekend"] = (df["visit_dayofweek"] >= 5).astype(int)

    drop_cols = [c for c in ["patient_id", "symptoms", "visit_date"] if c in df.columns]
    df = df.drop(columns=drop_cols)

    label_enc = LabelEncoder()
    df["health_risk_encoded"] = pd.Series(label_enc.fit_transform(df["health_risk"]), index=df.index)

    y = df["health_risk_encoded"]
    X = df.drop(columns=["health_risk", "health_risk_encoded"])
    X = X.apply(pd.to_numeric, errors="coerce")

    return X, y, label_enc


def train_health_model(csv_path: str = "medical_data.csv"):
    print("Loading data from:", csv_path)
    df = pd.read_csv(csv_path)

    print("Preprocessing and labeling...")
    X, y, label_enc = preprocess_features(df)

    print("Dataset shape:", X.shape, "Class counts:", dict(Counter(y)))

    strat_arg = None
    class_counts = Counter(y)
    if len(class_counts) > 1 and min(class_counts.values()) >= 2:
        strat_arg = y

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=strat_arg
    )

    imputer = SimpleImputer(strategy="median")
    X_train_imp = imputer.fit_transform(X_train)
    X_test_imp = imputer.transform(X_test)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_imp)
    X_test_scaled = scaler.transform(X_test_imp)

    print("Running GridSearchCV with XGBoostClassifier...")
    param_grid = {
        "n_estimators": [100, 200, 300],
        "max_depth": [3, 4, 6],
        "learning_rate": [0.05, 0.1, 0.2],
        "subsample": [0.8, 1.0],
        "colsample_bytree": [0.8, 1.0],
    }

    base_model = XGBClassifier(
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    grid_search = GridSearchCV(
        base_model, param_grid, cv=cv, scoring="accuracy", n_jobs=-1, verbose=1
    )
    grid_search.fit(X_train_scaled, y_train)
    model = grid_search.best_estimator_

    print("Best params:", grid_search.best_params_)

    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=cv, scoring="accuracy")
    print(f"CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)

    print("Test Accuracy:", acc)
    print(classification_report(y_test, y_pred, target_names=list(label_enc.classes_)))
    print(confusion_matrix(y_test, y_pred))

    joblib.dump(model, "health_risk_model.joblib")
    joblib.dump(scaler, "health_risk_scaler.joblib")
    joblib.dump(imputer, "health_risk_imputer.joblib")
    joblib.dump(label_enc, "health_risk_label_encoder.joblib")

    metrics = {
        "accuracy": float(acc),
        "cv_mean": float(cv_scores.mean()),
        "cv_std": float(cv_scores.std()),
        "best_params": grid_search.best_params_,
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "class_names": list(map(str, label_enc.classes_)),
    }
    with open("health_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    with open("health_features.json", "w") as f:
        json.dump({"feature_names": list(X.columns)}, f, indent=2)

    print("Saved: health_risk_model.joblib, health_risk_scaler.joblib, health_risk_imputer.joblib, health_risk_label_encoder.joblib, health_metrics.json, health_features.json")
    return model, scaler, imputer, label_enc


if __name__ == "__main__":
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "medical_data.csv"
    try:
        train_health_model(csv_path)
    except FileNotFoundError:
        print("CSV not found:", csv_path)
    except Exception:
        import traceback
        traceback.print_exc()
        raise
