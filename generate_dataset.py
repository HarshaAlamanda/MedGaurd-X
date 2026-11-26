import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

# Number of records to generate
n_records = 1000

# Generate synthetic data
data = {
    'patient_id': range(1, n_records + 1),
    'age': np.random.randint(18, 90, n_records),
    'gender': np.random.choice(['M', 'F'], n_records),
    'blood_pressure_systolic': np.random.normal(120, 15, n_records).astype(int),
    'blood_pressure_diastolic': np.random.normal(80, 10, n_records).astype(int),
    'heart_rate': np.random.normal(75, 12, n_records).astype(int),
    'temperature': np.random.normal(37, 0.5, n_records).round(1),
    'oxygen_saturation': np.random.normal(97, 2, n_records).round(1),
    'glucose_level': np.random.normal(100, 20, n_records).round(1),
}

# Generate medical conditions
conditions = ['Hypertension', 'Diabetes', 'Heart Disease', 'Asthma', 'None']
data['medical_condition'] = np.random.choice(conditions, n_records, p=[0.2, 0.15, 0.1, 0.05, 0.5])

# Generate symptoms
symptoms = ['Fever', 'Cough', 'Fatigue', 'Shortness of Breath', 'Chest Pain', 'None']
data['symptoms'] = [np.random.choice(symptoms, np.random.randint(0, 3)) for _ in range(n_records)]
data['symptoms'] = [','.join(s) if len(s) > 0 else 'None' for s in data['symptoms']]

# Generate dates within the last year
end_date = datetime.now()
start_date = end_date - timedelta(days=365)
data['visit_date'] = [start_date + timedelta(days=np.random.randint(0, 365)) for _ in range(n_records)]

# Create DataFrame
df = pd.DataFrame(data)

# Sort by visit date
df = df.sort_values('visit_date')

# Save to CSV
df.to_csv('medical_data.csv', index=False)
print("Dataset generated successfully and saved as 'medical_data.csv'")
print(f"Total records generated: {n_records}")