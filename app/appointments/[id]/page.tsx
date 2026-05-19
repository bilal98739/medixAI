"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft, Calendar, Clock, User, Stethoscope,
  DollarSign, FileText, CheckCircle, XCircle, Loader2,
} from "lucide-react";
import { IAppointment } from "@/types";
import { formatDateTime, formatCurrency } from "@/utils";
import { STATUS_COLORS } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { useUpdateAppointment } from "@/hooks";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { updateAppointment, isLoading: updating } = useUpdateAppointment();
  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await axios.get(`/api/appointments/${id}`);
        setAppointment(data.data);
        setNotes(data.data.notes || "");
        setPrescription(data.data.prescription || "");
      } catch {
        toast.error("Failed to load appointment");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchAppointment();
  }, [id]);

  const handleAction = async (status: "confirmed" | "rejected" | "cancelled" | "completed") => {
    if (!appointment) return;
    const updated = await updateAppointment(appointment._id, { status, notes, prescription });
    if (updated) {
      setAppointment({ ...appointment, ...updated });
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Appointment not found</p>
        <Link href="/appointments" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to appointments
        </Link>
      </div>
    );
  }

  const patient = appointment.patientId as { name?: string; email?: string; phone?: string };
  const doctor = appointment.doctorId as { name?: string; email?: string };
  const profile = appointment.doctorProfileId as { specialization?: string; consultationFee?: number };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/appointments"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
          <p className="text-gray-500 text-sm mt-0.5">#{appointment._id.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`badge ${STATUS_COLORS[appointment.status]} ml-auto`}>
          {appointment.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient / Doctor info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {user?.role === "patient" ? "Doctor Information" : "Patient Information"}
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">
                  {user?.role === "patient"
                    ? (typeof doctor === "object" ? doctor.name?.charAt(0) : "D")
                    : (typeof patient === "object" ? patient.name?.charAt(0) : "P")}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">
                  {user?.role === "patient"
                    ? `Dr. ${typeof doctor === "object" ? doctor.name : doctor}`
                    : (typeof patient === "object" ? patient.name : patient)}
                </p>
                {user?.role === "patient" && profile && (
                  <p className="text-blue-600 text-sm font-medium">
                    {typeof profile === "object" ? profile.specialization : ""}
                  </p>
                )}
                <p className="text-gray-400 text-sm mt-1">
                  {user?.role === "patient"
                    ? (typeof doctor === "object" ? doctor.email : "")
                    : (typeof patient === "object" ? patient.email : "")}
                </p>
                {user?.role !== "patient" && typeof patient === "object" && patient.phone && (
                  <p className="text-gray-400 text-sm">{patient.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Appointment info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Appointment Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Calendar, label: "Date", value: formatDateTime(appointment.date) },
                { icon: Clock, label: "Time Slot", value: appointment.timeSlot },
                { icon: DollarSign, label: "Consultation Fee", value: formatCurrency(appointment.fee) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Reason for Visit</p>
              <p className="text-sm text-gray-700">{appointment.reason}</p>
            </div>
          </div>

          {/* Notes / Prescription (doctor only) */}
          {user?.role === "doctor" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                <FileText className="w-4 h-4 inline mr-1" />
                Clinical Notes & Prescription
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">Doctor Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={appointment.status === "completed" || appointment.status === "cancelled"}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
                    placeholder="Add clinical notes..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">Prescription</label>
                  <textarea
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    disabled={appointment.status === "completed" || appointment.status === "cancelled"}
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
                    placeholder="Add prescription details..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Show notes/prescription for patient */}
          {user?.role === "patient" && (appointment.notes || appointment.prescription) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              {appointment.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Doctor Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{appointment.notes}</p>
                </div>
              )}
              {appointment.prescription && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prescription</p>
                  <p className="text-sm text-gray-700 bg-blue-50 rounded-xl p-3 whitespace-pre-wrap">{appointment.prescription}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</h2>
            <div className="space-y-3">
              {user?.role === "doctor" && appointment.status === "pending" && (
                <>
                  <button
                    onClick={() => handleAction("confirmed")}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all">
                    <CheckCircle className="w-4 h-4" />
                    Confirm Appointment
                  </button>
                  <button
                    onClick={() => handleAction("rejected")}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 font-medium py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-60 transition-all">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              {user?.role === "doctor" && appointment.status === "confirmed" && (
                <button
                  onClick={() => handleAction("completed")}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all">
                  <CheckCircle className="w-4 h-4" />
                  Mark as Completed
                </button>
              )}
              {user?.role === "patient" && (appointment.status === "pending" || appointment.status === "confirmed") && (
                <button
                  onClick={() => handleAction("cancelled")}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 font-medium py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-60 transition-all">
                  <XCircle className="w-4 h-4" />
                  Cancel Appointment
                </button>
              )}
              {(appointment.status === "completed" || appointment.status === "cancelled" || appointment.status === "rejected") && (
                <div className="text-center py-4 text-gray-400 text-sm">No actions available</div>
              )}
            </div>
          </div>

          {/* Created at */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Created</p>
            <p className="text-sm text-gray-700 font-medium">{formatDateTime(appointment.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
