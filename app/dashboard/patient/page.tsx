"use client";

import { useAuthStore } from "@/store/authStore";
import { useAppointments } from "@/hooks";
import { Calendar, Clock, CheckCircle, Stethoscope, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils";
import { STATUS_COLORS } from "@/constants";
import { IAppointment } from "@/types";

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const { appointments, isLoading } = useAppointments();

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter((a) => a.status === "confirmed" || a.status === "pending").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  const recent = appointments.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s your health overview</p>
        </div>
        <Link href="/appointments/book"
          className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:block">Book Appointment</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Appointments" value={stats.total} color="blue" />
        <StatCard icon={Clock} label="Upcoming" value={stats.upcoming} color="amber" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="emerald" />
        <StatCard icon={Stethoscope} label="Doctors Visited" value={new Set(appointments.map((a: IAppointment) => a.doctorId)).size} color="indigo" />
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
          <Link href="/appointments" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No appointments yet</p>
            <p className="text-gray-400 text-sm mt-1">Book your first appointment with a doctor</p>
            <Link href="/doctors" className="inline-flex items-center gap-2 mt-4 text-blue-600 font-medium hover:text-blue-700">
              <Plus className="w-4 h-4" /> Find a Doctor
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((apt: IAppointment) => {
              const doctor = apt.doctorId as { name?: string };
              return (
                <div key={apt._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      Dr. {typeof doctor === 'object' ? doctor.name : doctor}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(apt.date)} · {apt.timeSlot}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[apt.status]}`}>
                    {apt.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
