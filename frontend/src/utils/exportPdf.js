import { jsPDF } from 'jspdf';

const TEAL  = [13, 148, 136];
const BLUE  = [37, 99, 235];
const RED   = [239, 68, 68];
const GREEN = [16, 185, 129];
const AMBER = [245, 158, 11];
const DARK  = [8, 15, 30];
const GRAY  = [100, 116, 139];

function riskColor(risk) {
  if (risk === 'High')   return RED;
  if (risk === 'Medium') return AMBER;
  return GREEN;
}

function fraudColor(score) {
  if (score >= 0.55) return RED;
  if (score >= 0.3)  return AMBER;
  return GREEN;
}

export function exportAnalysisPdf({ healthRisk, fraudResult, docResult, patientData, userEmail }) {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
  const W     = doc.internal.pageSize.getWidth();
  let   y     = 0;

  // ── Header banner ────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 36, 'F');

  doc.setFillColor(...TEAL);
  doc.roundedRect(14, 8, 10, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('✓', 19, 14.5, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MedGuard-X', 27, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('AI Medical Risk & Fraud Detection Report', 27, 21);

  const now = new Date();
  doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, W - 14, 15, { align: 'right' });
  if (userEmail) doc.text(`Account: ${userEmail}`, W - 14, 21, { align: 'right' });

  y = 44;

  // ── Section helper ────────────────────────────────────────────────
  const section = (title, color = TEAL) => {
    doc.setFillColor(...color, 0.12);
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(14, y, W - 14, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(title, 14, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
  };

  const row = (label, value, valueColor = [50, 50, 50]) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(label, 14, y);
    doc.setTextColor(...valueColor);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), 80, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
  };

  const bar = (label, pct, color) => {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(label, 14, y);
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(60, y - 3.5, 100, 4, 1, 1, 'F');
    doc.setFillColor(...color);
    doc.roundedRect(60, y - 3.5, pct, 4, 1, 1, 'F');
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.text(`${Math.round((pct / 100) * 100)}%`, 164, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
  };

  // ── Health Risk ───────────────────────────────────────────────────
  if (healthRisk) {
    section('HEALTH RISK ASSESSMENT');
    const rc = riskColor(healthRisk);
    row('Risk Classification', `${healthRisk} Risk`, rc);

    if (patientData) {
      y += 2;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GRAY);
      doc.text('Patient Vitals', 14, y);
      y += 5;

      const VITALS = [
        ['Patient ID',        patientData.patient_id],
        ['Age',               patientData.age ? `${patientData.age} yrs` : '—'],
        ['Gender',            patientData.gender || '—'],
        ['Systolic BP',       patientData.blood_pressure_systolic ? `${patientData.blood_pressure_systolic} mmHg` : '—'],
        ['Diastolic BP',      patientData.blood_pressure_diastolic ? `${patientData.blood_pressure_diastolic} mmHg` : '—'],
        ['Heart Rate',        patientData.heart_rate ? `${patientData.heart_rate} bpm` : '—'],
        ['Temperature',       patientData.temperature ? `${patientData.temperature} °C` : '—'],
        ['SpO₂',              patientData.oxygen_saturation ? `${patientData.oxygen_saturation}%` : '—'],
        ['Glucose',           patientData.glucose_level ? `${patientData.glucose_level} mg/dL` : '—'],
        ['Medical Condition', patientData.medical_condition || '—'],
        ['Symptoms',          patientData.symptoms || '—'],
      ];

      VITALS.forEach(([lbl, val]) => {
        if (val && val !== '—') row(lbl, val);
      });
    }
    y += 3;
  }

  // ── Fraud Detection ───────────────────────────────────────────────
  if (fraudResult) {
    section('FRAUD DETECTION ANALYSIS', BLUE);
    const fs  = fraudResult.fraud_score ?? 0;
    const fc  = fraudColor(fs);
    const pct = Math.round(fs * 100);

    row('Fraud Probability', `${pct}%`, fc);
    row('Verdict', fraudResult.is_fraud ? 'FRAUD DETECTED' : 'RECORD VERIFIED', fraudResult.is_fraud ? RED : GREEN);
    row('Confidence', `${(Math.max(fs, 1 - fs) * 100).toFixed(1)}%`, GRAY);
    y += 2;
    bar('Fraud Score', pct, fc);
    y += 3;
  }

  // ── Document Analysis ─────────────────────────────────────────────
  if (docResult) {
    section('DOCUMENT ANALYSIS', [168, 85, 247]);
    const ds  = docResult.document_fraud_score ?? 0;
    const dc  = fraudColor(ds);

    row('Document Verdict', docResult.suspected_fraud ? 'SUSPICIOUS' : 'VERIFIED', docResult.suspected_fraud ? RED : GREEN);
    row('Document Fraud Score', `${Math.round(ds * 100)}%`, dc);
    if (docResult.word_count !== undefined) row('Words Extracted (OCR)', docResult.word_count);
    if (docResult.cnn_medical_score !== undefined)
      row('CNN Medical Score', `${(docResult.cnn_medical_score * 100).toFixed(0)}%`);
    y += 2;

    if (docResult.medical_keywords_found?.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text('Medical Keywords:', 14, y);
      doc.setTextColor(...TEAL);
      doc.text(docResult.medical_keywords_found.join(', '), 50, y, { maxWidth: W - 64 });
      y += 8;
    }
    if (docResult.suspicious_terms?.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text('Suspicious Terms:', 14, y);
      doc.setTextColor(...RED);
      doc.text(docResult.suspicious_terms.join(', '), 50, y, { maxWidth: W - 64 });
      y += 8;
    }
    y += 3;
  }

  // ── Footer ────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...DARK);
  doc.rect(0, pageH - 14, W, 14, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text('MedGuard-X · For research & educational use only · Not intended for clinical diagnosis', W / 2, pageH - 6, { align: 'center' });

  doc.save(`MedGuard-Report-${Date.now()}.pdf`);
}
