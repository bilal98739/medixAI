"use client";

import { useNotifications } from "@/hooks";
import { Bell, CheckCheck, Calendar, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { timeAgo } from "@/utils";
import { INotification } from "@/types";

const NOTIF_ICONS: Record<string, React.ElementType> = {
  appointment_booked: Calendar,
  appointment_confirmed: CheckCircle,
  appointment_cancelled: AlertCircle,
  appointment_completed: CheckCircle,
  appointment_rejected: AlertCircle,
  system_alert: AlertCircle,
  reminder: Clock,
};

const NOTIF_COLORS: Record<string, string> = {
  appointment_booked: "bg-blue-100 text-blue-600",
  appointment_confirmed: "bg-emerald-100 text-emerald-600",
  appointment_cancelled: "bg-red-100 text-red-600",
  appointment_completed: "bg-emerald-100 text-emerald-600",
  appointment_rejected: "bg-red-100 text-red-600",
  system_alert: "bg-amber-100 text-amber-600",
  reminder: "bg-indigo-100 text-indigo-600",
};

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAllRead } = useNotifications();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 w-full" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">We&apos;ll notify you about your appointments</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif: INotification) => {
              const Icon = NOTIF_ICONS[notif.type] || Bell;
              const iconColor = NOTIF_COLORS[notif.type] || "bg-gray-100 text-gray-500";
              return (
                <div key={notif._id}
                  className={`flex gap-4 px-6 py-4 transition-colors ${!notif.isRead ? "bg-blue-50/30" : "hover:bg-gray-50"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
