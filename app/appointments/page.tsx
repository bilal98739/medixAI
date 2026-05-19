"use client";

import { useState } from "react";
import { useAppointments, useUpdateAppointment } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import {
  Calendar, Search, Filter, Check, X, Eye,
  Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Plus, Sparkles
} from "lucide-react";
import { formatDate } from "@/utils";
import { STATUS_COLORS, APPOINTMENT_STATUS } from "@/constants";
import { IAppointment } from "@/types";
import Link from "next/link";

const STATUS_ICONS = {
  pending: AlertCircle,
  confirmed: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
  rejected: XCircle,
};

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const { appointments, isLoading, pagination, refetch } = useAppointments(
    statusFilter ? { status: statusFilter } : {}
  );
  const { updateAppointment, isLoading: updating } = useUpdateAppointment();

  const filtered = appointments.filter((a: IAppointment) => {
    if (!search) return true;
    const patient = a.patientId as { name?: string };
    const doctor = a.doctorId as { name?: string };
    const name = user?.role === "patient"
      ? (typeof doctor === "object" ? doctor.name : "")
      : (typeof patient === "object" ? patient.name : "");
    return name?.toLowerCase().includes(search.toLowerCase()) ||
      a.reason?.toLowerCase().includes(search.toLowerCase());
  });

  const handleAction = async (id: string, status: "confirmed" | "rejected" | "cancelled" | "completed") => {
    await updateAppointment(id, { status });
    refetch();
  };

  return (
    <div className="space-y-10 animate-fade-in-up pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mt-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight pl-10">Clinical Scheduler</h1>
          <p className="text-gray-500 font-medium mt-1 pl-10">Real-time management of your upcoming clinical interactions</p>
        </div>
        {user?.role === "patient" && (
          <Link href="/doctors"
            className="btn-premium flex items-center gap-3 py-4 shadow-blue-200">
            <Plus className="w-5 h-5" /> Schedule New Visit
          </Link>
        )}
      </div>

      {/* Modern Filters */}
      <div className="glass-card rounded-[2.5rem] p-6 border-white/40 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={user?.role === "patient" ? "Filter by doctor or clinical reason..." : "Filter by patient or reason..."}
              className="w-full pl-16 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="relative min-w-[240px] group">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-16 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none cursor-pointer bg-white"
            >
              <option value="">All Status Protocols</option>
              {Object.values(APPOINTMENT_STATUS).map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table Container */}
      <div className="glass-card rounded-[3rem] border-white/40 shadow-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-10 space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-20 w-full rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-float">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No Active Appointments</h3>
            <p className="text-gray-500 font-medium">Your clinical schedule is currently clear.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100/50">
                  <th className="px-10 py-6 font-black">{user?.role === "patient" ? "Specialist" : "Patient Case"}</th>
                  <th className="px-6 py-6 font-black">Schedule</th>
                  <th className="px-6 py-6 font-black">Primary Concern</th>
                  <th className="px-6 py-6 font-black">Status</th>
                  <th className="px-10 py-6 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((apt: IAppointment) => {
                  const patient = apt.patientId as { name?: string; email?: string };
                  const doctor = apt.doctorId as { name?: string };
                  const displayName = user?.role === "patient"
                    ? `Dr. ${typeof doctor === "object" ? doctor.name : doctor}`
                    : (typeof patient === "object" ? patient.name : patient);
                  const StatusIcon = STATUS_ICONS[apt.status] || AlertCircle;

                  return (
                    <tr key={apt._id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                            <span className="text-indigo-600 text-sm font-black uppercase">
                              {(displayName as string)?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-[15px] font-black text-gray-900 leading-tight">{displayName as string}</p>
                            {user?.role !== "patient" && (
                              <p className="text-[11px] font-bold text-gray-400 mt-1">{typeof patient === "object" ? patient.email : ""}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-sm font-black text-gray-900">{formatDate(apt.date)}</p>
                        <p className="text-[11px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">{apt.timeSlot}</p>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-sm font-bold text-gray-600 max-w-xs truncate">{apt.reason}</p>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`badge border-none px-4 py-2 flex items-center gap-2 w-fit ${STATUS_COLORS[apt.status]}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="font-black uppercase tracking-wider text-[9px]">{apt.status}</span>
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/appointments/${apt._id}`}
                            className="w-10 h-10 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-xl flex items-center justify-center transition-all shadow-sm">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {user?.role === "doctor" && apt.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(apt._id, "confirmed")}
                                disabled={updating}
                                className="w-10 h-10 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-60">
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(apt._id, "rejected")}
                                disabled={updating}
                                className="w-10 h-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-60">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {user?.role === "doctor" && apt.status === "confirmed" && (
                            <button
                              onClick={() => handleAction(apt._id, "completed")}
                              disabled={updating}
                              className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all disabled:opacity-60">
                              Archive
                            </button>
                          )}
                          {user?.role === "patient" && (apt.status === "pending" || apt.status === "confirmed") && (
                            <button
                              onClick={() => handleAction(apt._id, "cancelled")}
                              disabled={updating}
                              className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all disabled:opacity-60">
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Metadata */}
        <div className="px-10 py-6 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            System Sequence {pagination.page} of {pagination.totalPages} • Total Entries {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Neural Log Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
