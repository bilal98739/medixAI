"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft, Star, Clock, DollarSign, Calendar,
  CheckCircle, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { TIME_SLOTS } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface DoctorWithProfile {
  _id: string;
  name: string;
  email: string;
  doctorProfile: {
    _id: string;
    specialization: string;
    qualifications: string[];
    experience: number;
    bio: string;
    consultationFee: number;
    rating: number;
    totalReviews: number;
    availableDays: string[];
    workingHours: { start: string; end: string };
    isAvailable: boolean;
  };
}

export default function DoctorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [doctor, setDoctor] = useState<DoctorWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate 7-day week starting from today + offset
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfDay(new Date()), weekOffset * 7 + i)
  );

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await axios.get(`/api/doctors/${id}`);
        setDoctor(data.data);
      } catch {
        toast.error("Doctor not found");
        router.push("/doctors");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDoctor();
  }, [id]);

  const isDayAvailable = (date: Date) => {
    if (!doctor?.doctorProfile?.availableDays) return false;
    const dayName = format(date, "EEEE");
    return doctor.doctorProfile.availableDays.includes(dayName);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !reason.trim()) {
      toast.error("Please select a date, time slot, and provide a reason");
      return;
    }
    if (!user) { router.push("/login"); return; }

    setBooking(true);
    try {
      await axios.post("/api/appointments", {
        doctorId: doctor!._id,
        doctorProfileId: doctor!.doctorProfile._id,
        date: selectedDate.toISOString(),
        timeSlot: selectedSlot,
        reason,
        fee: doctor!.doctorProfile.consultationFee,
      });
      toast.success("Appointment booked successfully!");
      router.push("/appointments");
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to book appointment";
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!doctor) return null;
  const profile = doctor.doctorProfile || {
    specialization: "Not specified",
    consultationFee: 0,
    experience: 0,
    rating: 0,
    totalReviews: 0,
    bio: "",
    qualifications: [],
    availableDays: [],
    workingHours: { start: "09:00", end: "17:00" },
    isAvailable: false,
    _id: "dummy",
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/doctors"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Doctor info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-white text-2xl font-bold">{doctor.name.charAt(0)}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Dr. {doctor.name}</h2>
              <p className="text-blue-600 font-medium mt-0.5">{profile.specialization}</p>
              <div className="flex items-center gap-1 mt-2">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s}
                    className={`w-4 h-4 ${s <= Math.round(profile.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                ))}
                <span className="text-sm text-gray-500 ml-1">({profile.totalReviews})</span>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Experience</span>
                <span className="font-semibold text-gray-900">{profile.experience} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Consultation Fee</span>
                <span className="font-semibold text-gray-900">${profile.consultationFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Working Hours</span>
                <span className="font-semibold text-gray-900">
                  {profile.workingHours?.start} – {profile.workingHours?.end}
                </span>
              </div>
            </div>

            {profile.qualifications?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Qualifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.qualifications.map((q) => (
                    <span key={q} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{q}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.bio && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</p>
                <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Date picker */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Select Date</h3>
              <div className="flex gap-1">
                <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                  disabled={weekOffset === 0}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-500 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setWeekOffset(weekOffset + 1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((date) => {
                const available = isDayAvailable(date);
                const selected = selectedDate && isSameDay(date, selectedDate);
                const isPast = date < startOfDay(new Date());
                return (
                  <button
                    key={date.toISOString()}
                    disabled={!available || isPast}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(""); }}
                    className={`flex flex-col items-center py-2.5 rounded-xl transition-all text-center ${
                      selected
                        ? "bg-blue-600 text-white shadow-md"
                        : available && !isPast
                        ? "hover:bg-blue-50 text-gray-700 border border-gray-100"
                        : "opacity-30 cursor-not-allowed text-gray-400"
                    }`}
                  >
                    <span className="text-xs font-medium">{format(date, "EEE")}</span>
                    <span className="text-lg font-bold mt-0.5">{format(date, "d")}</span>
                    <span className="text-xs">{format(date, "MMM")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Select Time — {format(selectedDate, "EEEE, MMMM d")}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      selectedSlot === slot
                        ? "bg-blue-600 text-white shadow-md"
                        : "border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          {selectedSlot && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Reason for Visit</h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Describe your symptoms or reason for this appointment (min. 10 characters)..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Summary + Book */}
          {selectedDate && selectedSlot && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor</span>
                  <span className="font-semibold">Dr. {doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold">{selectedSlot}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                  <span className="text-gray-700 font-semibold">Consultation Fee</span>
                  <span className="font-bold text-blue-600">${profile.consultationFee}</span>
                </div>
              </div>
              <button
                onClick={handleBooking}
                disabled={booking || reason.length < 10 || profile._id === "dummy"}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200">
                {profile._id === "dummy" ? (
                  "Doctor Profile Incomplete"
                ) : booking ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Confirm Booking</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
