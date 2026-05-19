"use client";

import { useState } from "react";
import { useDoctors } from "@/hooks";
import { Search, Filter, Star, Clock, DollarSign, Stethoscope, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { SPECIALIZATIONS } from "@/constants";
import Link from "next/link";

interface DoctorWithProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  doctorProfile: {
    specialization: string;
    experience: number;
    consultationFee: number;
    rating: number;
    totalReviews: number;
    isAvailable: boolean;
    availableDays: string[];
  };
}

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");

  const { doctors, isLoading } = useDoctors({
    ...(search && { search }),
    ...(specialization && { specialization }),
  });

  return (
    <div className="space-y-10 animate-fade-in-up pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row mt-10 md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight pl-10">Expert Specialists</h1>
          <p className="text-gray-500 font-medium mt-1 pl-10">Book elite care with our globally recognized medical professionals</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100/50">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Top Rated Network</span>
        </div>
      </div>

      {/* Modern Search & Filter */}
      <div className="glass-card rounded-[2.5rem] p-6 border-white/40 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search specialists by name or expertise..."
              className="w-full pl-16 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="relative min-w-[240px] group">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full pl-16 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Doctor Cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 pl-10">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-[420px] w-full rounded-[2.5rem]" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="glass-card rounded-[3rem] p-24 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <Stethoscope className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No Specialists Found</h3>
          <p className="text-gray-500 font-medium">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {(doctors as DoctorWithProfile[]).map((doctor) => (
            <div key={doctor._id}
              className="stat-card p-0 overflow-hidden flex flex-col h-full border-none shadow-2xl shadow-gray-100/50 hover:shadow-indigo-100/50">
              {/* Card Header with availability */}
              <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-violet-700 p-8">
                <div className="absolute -bottom-10 left-8">
                  <div className="w-20 h-20 bg-white rounded-3xl p-1 shadow-xl">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-white rounded-2xl flex items-center justify-center">
                      <span className="text-2xl font-black text-indigo-600">{doctor.name.charAt(0)}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-8 right-8">
                  {doctor.doctorProfile?.isAvailable ? (
                    <span className="badge bg-emerald-500 text-white border-none py-1.5 px-4 shadow-lg shadow-emerald-200">Active</span>
                  ) : (
                    <span className="badge bg-white/20 text-white border-white/20 py-1.5 px-4">Inactive</span>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="px-8 pt-14 pb-8 flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">Dr. {doctor.name}</h3>
                  <p className="text-indigo-600 text-[11px] font-black uppercase tracking-widest mt-1">{doctor.doctorProfile?.specialization}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Clinical Exp</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-sm font-bold text-gray-700">{doctor.doctorProfile?.experience || 0} Years</span>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Consult Fee</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-sm font-bold text-gray-700">${doctor.doctorProfile?.consultationFee || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-gray-900">
                      {doctor.doctorProfile?.rating?.toFixed(1) || "New"}
                    </span>
                    <span className="text-xs font-bold text-gray-400">({doctor.doctorProfile?.totalReviews || 0})</span>
                  </div>
                  <div className="flex -space-x-2">
                    {doctor.doctorProfile?.availableDays?.slice(0, 3).map((day) => (
                      <div key={day} className="w-8 h-8 rounded-full bg-white border-2 border-gray-50 flex items-center justify-center shadow-sm">
                        <span className="text-[9px] font-black text-gray-500 uppercase">{day.slice(0, 1)}</span>
                      </div>
                    ))}
                    {doctor.doctorProfile?.availableDays?.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center shadow-sm">
                        <span className="text-[9px] font-black text-indigo-600">+{doctor.doctorProfile.availableDays.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link href={`/doctors/${doctor._id}`}
                  className="btn-premium py-4 flex items-center justify-center gap-3 text-sm group">
                  Book Clinical Visit
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
