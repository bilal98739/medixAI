"use client";

import { useState } from "react";
import {
  Stethoscope, Send, AlertTriangle, CheckCircle,
  Brain, Clipboard, Activity, Shield, Zap, Sparkles,
  Loader2, RotateCcw, ArrowRight, User, Pill, Thermometer
} from "lucide-react";
import axios from "axios";
import { DiagnosisAssistantResult } from "@/services/ai/diagnosisAssistant";

export default function DiagnosisAssistantPage() {
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisAssistantResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const { data } = await axios.post("/api/ai/diagnosis", {
        chiefComplaint,
        symptoms: symptoms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        patientAge: patientAge ? Number(patientAge) : undefined,
        patientGender: patientGender || undefined,
        clinicalNotes: clinicalNotes || undefined,
      });
      setResult(data.data);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Diagnostic engine timed out. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-8 animate-fade-in-up max-w-5xl mx-auto pb-20">
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Clinical Assessment</h1>
            <p className="text-gray-500 font-medium mt-1">Evidence-based diagnostic hypothesis and logic</p>
          </div>
          <button onClick={() => { setResult(null); setChiefComplaint(""); setSymptoms(""); setClinicalNotes(""); }}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-all">
            <RotateCcw className="w-4 h-4" /> New Case
          </button>
        </div>

        {/* Executive Summary */}
        <div className="glass-card rounded-[3rem] p-10 border-white/40 shadow-2xl bg-gradient-to-br from-white/80 to-indigo-50/30">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Clinical Impression</p>
              <h2 className="text-2xl font-black text-gray-900">Diagnosis Overview</h2>
            </div>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed font-medium">{result.clinicalSummary}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Differential Diagnosis */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-gray-900 px-2 tracking-tight flex items-center gap-3">
                <Activity className="w-6 h-6 text-indigo-500" /> Differential Diagnosis
              </h3>
              <div className="space-y-4">
                {result.differentialDiagnoses.map((d, i) => (
                  <div key={i} className="stat-card border-none bg-white p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-2xl font-black text-gray-900">{d.condition}</h4>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${
                          d.likelihood === "high" ? "bg-red-50 text-red-700 border-red-100" :
                          d.likelihood === "moderate" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {d.likelihood} Likelihood
                        </span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-3">Supporting Findings</p>
                        <ul className="space-y-2">
                          {d.supportingEvidence.map((f, idx) => (
                            <li key={idx} className="text-sm font-bold text-gray-600 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-500" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-3">Opposing Findings</p>
                        <ul className="space-y-2">
                          {d.againstEvidence.map((f, idx) => (
                            <li key={idx} className="text-sm font-bold text-gray-600 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clinical Workup & Recommendations */}
          <div className="space-y-8">
            <div className="stat-card bg-gray-900 border-none p-8 text-white">
              <Zap className="w-10 h-10 text-amber-400 mb-6" />
              <h3 className="text-xl font-black mb-6">Diagnostic Workup</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Recommended Protocol</p>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedWorkup.map((lab, i) => (
                      <span key={i} className="text-xs font-bold bg-white/10 px-3 py-2 rounded-xl text-indigo-100">
                        {lab}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card border-none bg-white p-8">
              <h3 className="text-xl font-black text-gray-900 mb-6">Treatment Considerations</h3>
              <ul className="space-y-4">
                {result.treatmentConsiderations.map((tc, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-gray-900">{tc.approach}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">{tc.rationale}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="stat-card border-none bg-emerald-50 p-8">
              <Shield className="w-8 h-8 text-emerald-600 mb-4" />
              <p className="text-[11px] font-bold text-emerald-800 leading-relaxed italic">{result.disclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in-up max-w-5xl mx-auto pb-20">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100">
          <Stethoscope className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Clinical Assistant</h1>
        <p className="text-lg text-gray-500 font-medium">Augment clinical decision-making with AI-powered differential diagnosis and case analysis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="glass-card rounded-[2rem] p-6 border-red-200/50 bg-red-50/50 shadow-lg flex items-start gap-4 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Analysis Failed</h3>
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="glass-card rounded-[3rem] p-10 border-white/40 shadow-2xl relative">
          <div className="absolute top-8 right-10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical Logic Engine Active</span>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Clipboard className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Case Presentation</h2>
          </div>

          {/* Structured Input Fields */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Patient Age</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                min={1}
                max={120}
                placeholder="e.g. 45"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Patient Gender</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full px-6 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white appearance-none transition-all"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Chief Complaint *</label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              required
              placeholder="e.g. Progressive shortness of breath over 3 days"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="mb-8">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Symptoms (comma-separated)</label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. dyspnea, chest tightness, wheezing, fatigue"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Clinical Notes &amp; History</label>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={8}
              placeholder="[ Present detailed history: HPI, relevant medical history, physical exam findings, vitals, medications, allergies, lab results... ]"
              className="w-full bg-white border border-gray-100 rounded-3xl p-8 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-inner"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {[
              { icon: User, label: "History" },
              { icon: Pill, label: "Meds" },
              { icon: Thermometer, label: "Vitals" },
              { icon: Activity, label: "Labs" }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={!chiefComplaint.trim() || isLoading}
          className="w-full btn-premium py-6 flex items-center justify-center gap-4 group">
          {isLoading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Performing Differential Analysis...</>
          ) : (
            <>
              <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
              Execute Diagnostic Assessment
            </>
          )}
        </button>
      </form>
    </div>
  );
}
