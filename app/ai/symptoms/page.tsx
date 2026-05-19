"use client";

import { useState } from "react";
import {
  Plus, X, Search, AlertTriangle, AlertCircle,
  CheckCircle, ChevronRight, Stethoscope, Loader2, RotateCcw,
  Activity, Shield, Heart, Zap, Sparkles, ArrowRight
} from "lucide-react";
import axios from "axios";
import { SymptomCheckerResult } from "@/services/ai/symptomChecker";
import Link from "next/link";

const COMMON_SYMPTOMS = [
  "Headache", "Fever", "Cough", "Fatigue", "Shortness of breath",
  "Chest pain", "Nausea", "Vomiting", "Dizziness", "Muscle pain",
];

const URGENCY_CONFIG = {
  emergency: { color: "border-red-200 bg-red-50/50", icon: AlertTriangle, iconColor: "text-red-600", label: "Emergency Action Required", labelColor: "bg-red-100 text-red-700" },
  urgent: { color: "border-amber-200 bg-amber-50/50", icon: AlertCircle, iconColor: "text-amber-600", label: "Urgent Care Recommended", labelColor: "bg-amber-100 text-amber-700" },
  routine: { color: "border-emerald-200 bg-emerald-50/50", icon: CheckCircle, iconColor: "text-emerald-600", label: "Routine Follow-up", labelColor: "bg-emerald-100 text-emerald-700" },
};

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SymptomCheckerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addSymptom = (symptom: string) => {
    const s = symptom.trim();
    if (s && !symptoms.includes(s)) setSymptoms([...symptoms, s]);
    setCustomSymptom("");
  };

  const removeSymptom = (s: string) => setSymptoms(symptoms.filter((x) => x !== s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.length === 0 || !age || !gender) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const { data } = await axios.post("/api/ai/symptoms", {
        symptoms, age: Number(age), gender,
        duration: duration || undefined,
        severity: severity || undefined,
      });
      setResult(data.data);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Analysis engine error. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    const urgency = URGENCY_CONFIG[result.urgency];
    const UrgencyIcon = urgency.icon;
    return (
      <div className="space-y-8 animate-fade-in-up max-w-5xl mx-auto pb-20">
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analysis Complete</h1>
            <p className="text-gray-500 font-medium mt-1">Symptom evaluation based on provided clinical data</p>
          </div>
          <button onClick={() => { setResult(null); setSymptoms([]); }}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-all">
            <RotateCcw className="w-4 h-4" /> New Screening
          </button>
        </div>

        {/* Urgency Glass Banner */}
        <div className={`relative overflow-hidden border rounded-[2.5rem] p-8 ${urgency.color} backdrop-blur-xl`}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <UrgencyIcon className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-xl ${urgency.iconColor}`}>
              <UrgencyIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-3 inline-block ${urgency.labelColor}`}>
                {urgency.label}
              </span>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{result.urgencyReason}</h2>
              {result.urgency === "emergency" && (
                <p className="text-red-700 mt-3 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 animate-pulse" /> Seek emergency care immediately.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Possible conditions */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-gray-900 px-2 tracking-tight">Differential Diagnosis</h3>
            <div className="space-y-4">
              {result.possibleConditions.map((condition, i) => (
                <div key={i} className="stat-card border-none bg-white/50 backdrop-blur-sm p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h4 className="text-2xl font-black text-gray-900">{condition.name}</h4>
                      <div className="flex gap-3 mt-3">
                        <span className={`badge ${
                          condition.probability === "high" ? "bg-red-50 text-red-700 border-red-100" :
                          condition.probability === "moderate" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          "bg-blue-50 text-blue-700 border-blue-100"
                        }`}>
                          {condition.probability} probability
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                          condition.severity === "high" ? "text-red-600" : "text-emerald-600"
                        }`}>
                          <Activity className="w-3.5 h-3.5" /> {condition.severity} severity
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium mb-6 leading-relaxed">{condition.description}</p>
                  <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-indigo-900 font-bold leading-relaxed">{condition.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar results */}
          <div className="space-y-6">
            <div className="stat-card bg-gradient-to-br from-gray-900 to-indigo-900 border-none p-8">
              <Stethoscope className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-white text-xl font-black mb-2">Recommended Specialist</h3>
              <p className="text-indigo-200 font-medium text-sm mb-6 leading-relaxed">Based on your neural symptom profile, we recommend consulting a specialist in:</p>
              <div className="text-3xl font-black text-white mb-8">{result.suggestedSpecialty}</div>
              <Link href="/doctors" className="w-full btn-premium py-4 flex items-center justify-center gap-2">
                Book Specialist <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="stat-card border-none bg-white p-8 shadow-2xl shadow-indigo-100/50">
              <h3 className="text-gray-900 text-xl font-black mb-4">General Advice</h3>
              <p className="text-gray-500 font-medium text-[15px] leading-relaxed">{result.generalAdvice}</p>
            </div>

            {result.redFlags.length > 0 && (
              <div className="stat-card border-none bg-red-50 p-8">
                <h3 className="text-red-900 text-xl font-black mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Warning Signs
                </h3>
                <ul className="space-y-3">
                  {result.redFlags.map((flag, i) => (
                    <li key={i} className="text-sm font-bold text-red-700 flex items-start gap-2 leading-relaxed">
                      <span className="text-red-400 mt-1 flex-shrink-0">•</span> {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in-up max-w-5xl mx-auto pb-20">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100">
          <Sparkles className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Symptom Screening</h1>
        <p className="text-lg text-gray-500 font-medium">Describe your clinical presentation for advanced AI-powered diagnostic insights.</p>
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

        {/* Symptom Intelligence Module */}
        <div className="glass-card rounded-[3rem] p-10 border-white/40 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Neural Symptom Input</h2>
          </div>

          <div className="space-y-10">
            {/* Tag Selection */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Select Primary Indicators</p>
              <div className="flex flex-wrap gap-3">
                {COMMON_SYMPTOMS.map((s) => (
                  <button key={s} type="button" onClick={() => addSymptom(s)}
                    disabled={symptoms.includes(s)}
                    className={`px-5 py-3 rounded-2xl text-sm font-bold border transition-all duration-300 ${
                      symptoms.includes(s)
                        ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 scale-105"
                        : "bg-white text-gray-600 border-gray-100 hover:border-blue-300 hover:text-blue-600"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input type="text" value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSymptom(customSymptom); } }}
                className="w-full pl-16 pr-24 py-6 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                placeholder="Type additional symptoms and press enter..." />
              <button type="button" onClick={() => addSymptom(customSymptom)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-blue-600 font-black text-xs px-5 py-2.5 rounded-xl border border-gray-100 hover:border-blue-600 transition-all shadow-sm">
                ADD
              </button>
            </div>

            {/* Active Tags */}
            {symptoms.length > 0 && (
              <div className="pt-4 flex flex-wrap gap-3 animate-fade-in">
                {symptoms.map((s) => (
                  <span key={s} className="flex items-center gap-3 bg-indigo-50 text-indigo-700 text-sm font-black px-5 py-3 rounded-2xl border border-indigo-100/50 shadow-sm">
                    {s}
                    <button type="button" onClick={() => removeSymptom(s)} className="text-indigo-300 hover:text-indigo-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clinical Profile Module */}
        <div className="glass-card rounded-[3rem] p-10 border-white/40 shadow-2xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Clinical Profile</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Age Segment</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required min={1} max={120}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                placeholder="Age" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Gender Identity</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white appearance-none transition-all">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Duration</label>
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                placeholder="e.g. 48 hours" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Intensity Scale</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white appearance-none transition-all">
                <option value="">Not Scaled</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={symptoms.length === 0 || !age || !gender || isLoading}
          className="w-full btn-premium py-6 flex items-center justify-center gap-4 group">
          {isLoading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Sequencing Symptom Data...</>
          ) : (
            <>
              <Search className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
              Execute Clinical Analysis
            </>
          )}
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5" /> HIPAA Compliant Neural Processing • Research Grade Only
        </p>
      </form>
    </div>
  );
}
