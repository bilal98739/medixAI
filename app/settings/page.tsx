"use client";

import { useState } from "react";
import { Shield, Bell, Palette, Lock, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailReminders: true,
    browserNotifications: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    setSavingPassword(true);
    try {
      await axios.patch("/api/users/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error) ? error.response?.data?.message : "Failed to change password";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl m-auto">
      <div className="mt-10">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Settings</h1>
        <p className="text-gray-500 mt-1 text-center">Manage your account preferences and security</p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-500">Update your account password</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { label: "Current Password", key: "currentPassword" },
            { label: "New Password", key: "newPassword" },
            { label: "Confirm New Password", key: "confirmPassword" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type="password"
                value={(passwordForm as Record<string, string>)[key]}
                onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          ))}
          <button type="submit" disabled={savingPassword}
            className="flex items-center gap-2 bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all text-sm">
            {savingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Update Password"}
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
            <p className="text-sm text-gray-500">Choose what you get notified about</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { key: "emailAppointments", label: "Appointment updates", desc: "Receive emails for booking confirmations and changes" },
            { key: "emailReminders", label: "Appointment reminders", desc: "Get reminded 24 hours before your appointment" },
            { key: "browserNotifications", label: "Browser notifications", desc: "Show desktop notifications in your browser" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !(notifications as Record<string, boolean>)[key] })}
                className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors flex-shrink-0 ${
                  (notifications as Record<string, boolean>)[key] ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  (notifications as Record<string, boolean>)[key] ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Account Security</h3>
            <p className="text-sm text-gray-500">Your account security overview</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: "Two-factor authentication", status: "Not enabled", statusColor: "text-amber-600 bg-amber-50" },
            { label: "Active sessions", status: "1 device", statusColor: "text-emerald-600 bg-emerald-50" },
            { label: "Last login", status: "Just now", statusColor: "text-gray-500 bg-gray-50" },
          ].map(({ label, status, statusColor }) => (
            <div key={label} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">{label}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
