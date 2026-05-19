"use client";

import { useAuthStore } from "@/store/authStore";
import { useAppointments, useUpdateAppointment } from "@/hooks";
import {
  Calendar, Users, CheckCircle, Clock, DollarSign, Star,
  ArrowRight, Check, X,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils";
import { STATUS_COLORS } from "@/constants";
import { IAppointment } from "@/types";
import toast from "react-hot-toast";

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const { appointments, isLoading, refetch } = useAppointments();
  const { updateAppointment, isLoading: updating } = useUpdateAppointment();

  const pending = appointments.filter((a) => a.status === "pending");
  const today = appointments.filter((a) => {
    const d = new Date(a.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const handleStatus = async (id: string, status: "confirmed" | "rejected") => {
    await updateAppointment(id, { status });
    refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Dr. {user?.name?.split(" ")[0]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: "Today's Appointments", value: today.length, color: "blue" },
          { icon: Clock, label: "Pending Requests", value: pending.length, color: "amber" },
          { icon: CheckCircle, label: "Completed", value: appointments.filter(a => a.status === "completed").length, color: "emerald" },
          { icon: Users, label: "Total Patients", value: new Set(appointments.map((a: IAppointment) => a.patientId)).size, color: "indigo" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm">
          <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 rounded-t-2xl">
            <h2 className="text-lg font-semibold text-amber-800">
              Pending Requests ({pending.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pending.map((apt: IAppointment) => {
              const patient = apt.patientId as { name?: string };
              return (
                <div key={apt._id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {typeof patient === 'object' ? patient.name : patient}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(apt.date)} · {apt.timeSlot}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{apt.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStatus(apt._id, "confirmed")}
                      disabled={updating}
                      className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-60"
                      title="Confirm">
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatus(apt._id, "rejected")}
                      disabled={updating}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-60"
                      title="Reject">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">All Appointments</h2>
          <Link href="/appointments" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-16 w-full" />)}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {appointments.slice(0, 8).map((apt: IAppointment) => {
              const patient = apt.patientId as { name?: string };
              return (
                <div key={apt._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {typeof patient === 'object' ? patient.name : patient}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(apt.date)} · {apt.timeSlot}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[apt.status]}`}>{apt.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
