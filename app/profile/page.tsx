"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { User, Mail, Phone, Camera, Loader2, Save } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { getInitials } from "@/utils";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.avatar || null);
  const [form, setForm] = useState<any>({
    name: user?.name || "",
    phone: user?.phone || "",
    doctorProfile: (user as any)?.doctorProfile || {},
    avatar: user?.avatar || "",
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewAvatar(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ ...form, avatar: data.data.url });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload image");
      setPreviewAvatar(user?.avatar || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await axios.patch("/api/users/me", form);
      setUser(data.data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="m-auto mt-6 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl text-center font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-center mt-1">Manage your account information</p>
      </div>

      {/* Avatar & Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              {previewAvatar ? (
                <img src={previewAvatar} alt={user?.name} className="w-24 h-24 rounded-2xl object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">{getInitials(user?.name || "U")}</span>
              )}
            </div>
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
              title="Upload profile picture">
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-blue-600 font-medium capitalize mt-0.5">{user?.role}</p>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
            <div className="flex gap-2 mt-3">
              <span className={`badge ${user?.isActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                {user?.isActive ? "Active" : "Inactive"}
              </span>
              <span className={`badge ${user?.isVerified ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                {user?.isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all">
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 text-sm bg-blue-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {[
            { icon: User, label: "Full Name", key: "name", type: "text", placeholder: "Your full name" },
            { icon: Mail, label: "Email Address", key: "email", type: "email", placeholder: "", disabled: true },
            { icon: Phone, label: "Phone Number", key: "phone", type: "tel", placeholder: "+1 234 567 8900" },
          ].map(({ icon: Icon, label, key, type, placeholder, disabled }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={type}
                  value={key === "email" ? (user?.email || "") : (form as Record<string, any>)[key] || ""}
                  onChange={(e) => isEditing && setForm({ ...form, [key]: e.target.value })}
                  disabled={disabled || !isEditing}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor Profile Section */}
      {user?.role === "doctor" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Doctor Profile Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization</label>
              <input
                type="text"
                value={form.doctorProfile?.specialization || ""}
                onChange={(e) => isEditing && setForm({
                  ...form, doctorProfile: { ...form.doctorProfile, specialization: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="e.g. Cardiologist"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Fee ($)</label>
                <input
                  type="number"
                  value={form.doctorProfile?.consultationFee || 0}
                  onChange={(e) => isEditing && setForm({
                    ...form, doctorProfile: { ...form.doctorProfile, consultationFee: Number(e.target.value) }
                  })}
                  disabled={!isEditing}
                  min={0}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (Years)</label>
                <input
                  type="number"
                  value={form.doctorProfile?.experience || 0}
                  onChange={(e) => isEditing && setForm({
                    ...form, doctorProfile: { ...form.doctorProfile, experience: Number(e.target.value) }
                  })}
                  disabled={!isEditing}
                  min={0}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                  <label key={day} className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm ${!isEditing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${form.doctorProfile?.availableDays?.includes(day) ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600"}`}>
                    <input
                      type="checkbox"
                      checked={form.doctorProfile?.availableDays?.includes(day) || false}
                      onChange={(e) => {
                        if (!isEditing) return;
                        const currentDays = form.doctorProfile?.availableDays || [];
                        const newDays = e.target.checked
                          ? [...currentDays, day]
                          : currentDays.filter((d: string) => d !== day);
                        setForm({
                          ...form,
                          doctorProfile: { ...form.doctorProfile, availableDays: newDays }
                        });
                      }}
                      disabled={!isEditing}
                      className="hidden"
                    />
                    {day.substring(0, 3)}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={form.doctorProfile?.workingHours?.start || "09:00"}
                  onChange={(e) => isEditing && setForm({
                    ...form, doctorProfile: { 
                      ...form.doctorProfile, 
                      workingHours: { ...form.doctorProfile?.workingHours, start: e.target.value } 
                    }
                  })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                <input
                  type="time"
                  value={form.doctorProfile?.workingHours?.end || "17:00"}
                  onChange={(e) => isEditing && setForm({
                    ...form, doctorProfile: { 
                      ...form.doctorProfile, 
                      workingHours: { ...form.doctorProfile?.workingHours, end: e.target.value } 
                    }
                  })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea
                value={form.doctorProfile?.bio || ""}
                onChange={(e) => isEditing && setForm({
                  ...form, doctorProfile: { ...form.doctorProfile, bio: e.target.value }
                })}
                disabled={!isEditing}
                rows={3}
                placeholder="A short biography..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
