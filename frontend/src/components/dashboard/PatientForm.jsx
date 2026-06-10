import { useState } from 'react';
import { motion } from 'framer-motion';
import GradientButton from '../ui/GradientButton';
import LoadingSpinner from '../ui/LoadingSpinner';

const CONDITIONS = ['None', 'Asthma', 'Diabetes', 'Heart Disease', 'Hypertension'];
const SYMPTOM_CHIPS = ['Fever', 'Cough', 'Fatigue', 'Shortness of Breath', 'Chest Pain'];

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-white/50 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-teal-400 focus:shadow-[0_0_0_2px_rgba(45,212,191,0.15)] transition-all duration-200 placeholder:text-white/20";
const selectCls = `${inputCls} cursor-pointer`;

export default function PatientForm({ onSubmit, loading }) {
  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState({
    patient_name: '',
    patient_id: 101,
    age: 45,
    gender: 'M',
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    heart_rate: 75,
    temperature: 37.0,
    oxygen_saturation: 98,
    glucose_level: 100,
    medical_condition: 'None',
    symptoms: '',
    visit_date: today,
  });

  const [activeSymptoms, setActiveSymptoms] = useState([]);

  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  const toggleSymptom = (s) => {
    const next = activeSymptoms.includes(s)
      ? activeSymptoms.filter((x) => x !== s)
      : [...activeSymptoms, s];
    setActiveSymptoms(next);
    setData((d) => ({ ...d, symptoms: next.join(', ') }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...data,
      patient_id: parseInt(data.patient_id),
      age: parseInt(data.age),
      blood_pressure_systolic: parseFloat(data.blood_pressure_systolic),
      blood_pressure_diastolic: parseFloat(data.blood_pressure_diastolic),
      heart_rate: parseFloat(data.heart_rate),
      temperature: parseFloat(data.temperature),
      oxygen_saturation: parseFloat(data.oxygen_saturation),
      glucose_level: parseFloat(data.glucose_level),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Patient Name — full width, prominent */}
      <Field label="Patient Name">
        <input
          type="text"
          className={inputCls}
          value={data.patient_name}
          onChange={set('patient_name')}
          placeholder="e.g. John Doe"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Patient ID">
          <input type="number" className={inputCls} value={data.patient_id} onChange={set('patient_id')} required />
        </Field>
        <Field label="Age">
          <input type="number" className={inputCls} value={data.age} onChange={set('age')} min="0" max="120" required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Gender">
          <select className={selectCls} value={data.gender} onChange={set('gender')}>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </Field>
        <Field label="Visit Date">
          <input type="date" className={inputCls} value={data.visit_date} onChange={set('visit_date')} required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Systolic BP (mmHg)">
          <input type="number" className={inputCls} value={data.blood_pressure_systolic} onChange={set('blood_pressure_systolic')} />
        </Field>
        <Field label="Diastolic BP (mmHg)">
          <input type="number" className={inputCls} value={data.blood_pressure_diastolic} onChange={set('blood_pressure_diastolic')} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Heart Rate (bpm)">
          <input type="number" className={inputCls} value={data.heart_rate} onChange={set('heart_rate')} />
        </Field>
        <Field label="Temperature (°C)">
          <input type="number" step="0.1" className={inputCls} value={data.temperature} onChange={set('temperature')} />
        </Field>
        <Field label="SpO₂ (%)">
          <input type="number" className={inputCls} value={data.oxygen_saturation} onChange={set('oxygen_saturation')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Glucose Level (mg/dL)">
          <input type="number" className={inputCls} value={data.glucose_level} onChange={set('glucose_level')} />
        </Field>
        <Field label="Medical Condition">
          <select className={selectCls} value={data.medical_condition} onChange={set('medical_condition')}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Symptoms (select all that apply)">
        <div className="flex flex-wrap gap-2 pt-1">
          {SYMPTOM_CHIPS.map((s) => (
            <motion.button
              key={s}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSymptom(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                activeSymptoms.includes(s)
                  ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </Field>

      <GradientButton type="submit" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" /> Analyzing...
          </span>
        ) : 'Run Analysis'}
      </GradientButton>
    </form>
  );
}
