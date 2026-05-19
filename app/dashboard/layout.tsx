"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, LayoutDashboard, Calendar, Users, UserRound, Bell,
  Settings, LogOut, Menu, X, ChevronDown, Stethoscope, Bot,
  Search, FileText, Brain,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotifications } from "@/hooks";
import { getInitials } from "@/utils";
import toast from "react-hot-toast";

const navConfig = {
  patient: [
    { href: "/dashboard/patient", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/appointments", icon: Calendar, label: "Appointments" },
    { href: "/doctors", icon: Stethoscope, label: "Find Doctors" },
    { href: "/ai/chatbot", icon: Bot, label: "AI Assistant" },
    { href: "/ai/symptoms", icon: Search, label: "Symptom Checker" },
    { href: "/ai/report", icon: FileText, label: "Report Analyzer" },
    { href: "/profile", icon: UserRound, label: "My Profile" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ],
  doctor: [
    { href: "/dashboard/doctor", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/appointments", icon: Calendar, label: "Appointments" },
    { href: "/patients", icon: Users, label: "Patients" },
    { href: "/ai/diagnosis", icon: Brain, label: "AI Diagnosis" },
    { href: "/ai/report", icon: FileText, label: "Report Analyzer" },
    { href: "/profile", icon: UserRound, label: "My Profile" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ],
  admin: [
    { href: "/dashboard/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/appointments", icon: Calendar, label: "Appointments" },
    { href: "/doctors", icon: Stethoscope, label: "Doctors" },
    { href: "/patients", icon: Users, label: "Patients" },
    { href: "/ai/diagnosis", icon: Brain, label: "AI Diagnosis" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = navConfig[user?.role ?? "patient"];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-4.5 h-4.5 text-white w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">MedixAI</span>
            <p className="text-xs text-gray-400 capitalize">{user?.role} Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? "active" : ""}`}>
                <item.icon className="w-4.5 h-4.5 w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {item.href === "/notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="w-9 h-9 object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">{getInitials(user?.name ?? "U")}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/notifications" className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Link>
            <Link href="/profile" className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name} className="w-8 h-8 object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">{getInitials(user?.name ?? "U")}</span>
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name?.split(" ")[0]}</span>
              <ChevronDown className="hidden sm:block w-3 h-3 text-gray-400" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
