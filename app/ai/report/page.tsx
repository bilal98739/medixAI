"use client";

import { useState } from "react";
import {
  FileText, Upload, AlertTriangle, CheckCircle,
  Clock, ChevronDown, ChevronUp, Loader2, RotateCcw,
  Activity, Shield, Zap, Sparkles, ArrowRight
} from "lucide-react";
import axios from "axios";
import { ReportAnalysisResult } from "@/services/ai/reportAnalyzer";

const REPORT_TYPES = [
  { value: "blood_test", label: "Blood Analysis" },
  { value: "xray", label: "Radiology (X-Ray)" },
  { value: "mri", label: "Neural Imaging (MRI)" },
  { value: "prescription", label: "Pharmacology" },
  { value: "pathology", label: "Histopathology" },
  { value: "general", label: "Clinical Report" },
];

const STATUS_COLORS = {
  normal: "bg-emerald-50 text-emerald-700 border-emerald-100",
  low: "bg-blue-50 text-blue-700 border-blue-100",
  high: "bg-red-50 text-red-700 border-red-100",
  critical: "bg-red-100 text-red-900 border-red-200 font-bold",
  unknown: "bg-gray-50 text-gray-600 border-gray-100",
};

const URGENCY_CONFIG = {
  routine: { label: "Standard Follow-up", color: "text-emerald-700 bg-emerald-50/50 border-emerald-100", icon: CheckCircle },
  soon: { label: "Expedited Review", color: "text-amber-700 bg-amber-50/50 border-amber-100", icon: Clock },
  urgent: { label: "Immediate Attention", color: "text-red-700 bg-red-50/50 border-red-100", icon: AlertTriangle },
};

export default function ReportAnalyzerPage() {
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState("blood_test");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReportAnalysisResult | null>(null);
  const [showAllValues, setShowAllValues] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const { data } = await axios.post("/api/ai/report", { reportText, reportType });
      setResult(data.data);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Analysis failed. Please verify report data and try again.";
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
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Intelligence Report</h1>
            <p className="text-gray-500 font-medium mt-1">AI-synthesized medical insights and findings</p>
          </div>
          <button onClick={() => { setResult(null); setReportText(""); }}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-all">
            <RotateCcw className="w-4 h-4" /> New Analysis
          </button>
        </div>

        {/* Global Summary Card */}
        <div className="glass-card rounded-[2.5rem] p-10 border-white/40 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
                <FileText className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Detected Domain</p>
                <p className="text-xl font-black text-gray-900 capitalize">{result.reportType}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border h-fit ${urgency.color}`}>
              <UrgencyIcon className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-wider">{urgency.label}</span>
            </div>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed font-medium">{result.summary}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Abnormal values section */}
            {result.abnormalValues.length > 0 && (
              <div className="stat-card border-none bg-red-50/30 p-8">
                <h2 className="text-xl font-black text-red-900 mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  Clinical Deviations ({result.abnormalValues.length})
                </h2>
                <div className="space-y-4">
                  {result.abnormalValues.map((v, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] p-6 border border-red-100/50 shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-black text-gray-900">{v.parameter}</h4>
                          <p className="text-sm text-gray-600 font-medium mt-2">{v.interpretation}</p>
                          {v.referenceRange && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3">Reference: {v.referenceRange}</p>
                          )}
                        </div>
                        <div className="md:text-right flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end gap-2">
                          <p className="text-2xl font-black text-gray-900">{v.value} <span className="text-xs text-gray-400">{v.unit}</span></p>
                          <span className={`badge border-none ${STATUS_COLORS[v.status]}`}>{v.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key findings */}
            <div className="stat-card border-none bg-white p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-amber-500" /> Primary Findings
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.keyFindings.map((f, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                    <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-gray-700 leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* All values toggle */}
            {result.values.length > 0 && (
              <div className="stat-card border-none bg-white p-8 overflow-hidden">
                <button onClick={() => setShowAllValues(!showAllValues)}
                  className="flex items-center justify-between w-full group">
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-500" /> Complete Analysis Metadata
                  </h2>
                  <div className="p-2 rounded-xl group-hover:bg-gray-50 transition-colors">
                    {showAllValues ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {showAllValues && (
                  <div className="mt-8 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                          <th className="pb-4 px-2">Biomarker</th>
                          <th className="pb-4 px-2 text-right">Result</th>
                          <th className="pb-4 px-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {result.values.map((v, i) => (
                          <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-2 font-bold text-gray-700">{v.parameter}</td>
                            <td className="py-4 px-2 text-right font-black text-gray-900">{v.value} <span className="text-[10px] text-gray-400 font-medium">{v.unit}</span></td>
                            <td className="py-4 px-2 text-right">
                              <span className={`badge border-none ${STATUS_COLORS[v.status]}`}>{v.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Recommendations sidebar */}
            <div className="stat-card bg-indigo-600 border-none p-8 text-white">
              <Sparkles className="w-10 h-10 text-indigo-200 mb-6" />
              <h2 className="text-2xl font-black mb-6">Medical Strategy</h2>
              <ul className="space-y-4">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-white group-hover:text-indigo-600 transition-colors text-xs font-black">
                      {i + 1}
                    </div>
                    <p className="text-sm font-bold text-indigo-50 leading-relaxed">{r}</p>
                  </li>
                ))}
              </ul>
              {result.followUpRequired && result.followUpReason && (
                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-2">Required Protocol</p>
                  <p className="text-sm font-black leading-relaxed">{result.followUpReason}</p>
                </div>
              )}
            </div>

            <div className="stat-card border-none bg-white p-8">
              <Shield className="w-8 h-8 text-emerald-500 mb-4" />
              <p className="text-[11px] font-bold text-gray-400 leading-relaxed italic">{result.disclaimer}</p>
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
          <FileText className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Neural Report Analysis</h1>
        <p className="text-lg text-gray-500 font-medium">Extract actionable intelligence from complex medical documentation using deep learning.</p>
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

        <div className="glass-card rounded-[3rem] p-10 border-white/40 shadow-2xl">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 text-center">Select Intelligence Domain</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {REPORT_TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => setReportType(t.value)}
                className={`py-4 px-4 text-xs font-black uppercase tracking-wider rounded-2xl border transition-all duration-300 ${
                  reportType === t.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200 scale-105"
                    : "bg-white text-gray-500 border-gray-100 hover:border-indigo-300 hover:text-indigo-600"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[3rem] p-10 border-white/40 shadow-2xl relative">
          <div className="absolute top-8 right-10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting Data Buffer</span>
          </div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Report Payload Source</label>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            required
            rows={12}
            placeholder="[ Paste the text from your medical report or laboratory results here... ]"
            className="w-full bg-gray-900 text-indigo-300 border border-gray-800 rounded-3xl p-8 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all resize-none shadow-inner"
          />
          <div className="flex items-center justify-between mt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{reportText.length} Bytes Sequence</p>
            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
              <Upload className="w-3 h-3" /> External Import Disabled
            </div>
          </div>
        </div>

        <button type="submit" disabled={!reportText.trim() || isLoading}
          className="w-full btn-premium py-6 flex items-center justify-center gap-4 group">
          {isLoading ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Processing Neural Weights...</>
          ) : (
            <>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /> 
              Generate Intelligence Report
            </>
          )}
        </button>
      </form>
    </div>
  );
}
