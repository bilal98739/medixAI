import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { IAppointment, INotification, PaginatedResponse } from "@/types";
import toast from "react-hot-toast";

// ─── Appointments ─────────────────────────────────────────────────────────────

export function useAppointments(params?: Record<string, string>) {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const { data } = await axios.get(`/api/appointments?${query}`);
      setAppointments(data.data.appointments);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  return { appointments, isLoading, pagination, refetch: fetchAppointments };
}

export function useUpdateAppointment() {
  const [isLoading, setIsLoading] = useState(false);

  const updateAppointment = async (
    id: string,
    payload: { status: string; notes?: string; prescription?: string }
  ) => {
    setIsLoading(true);
    try {
      const { data } = await axios.patch(`/api/appointments/${id}`, payload);
      toast.success(`Appointment ${payload.status} successfully`);
      return data.data;
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to update appointment";
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateAppointment, isLoading };
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useNotifications() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/notifications");
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllRead = async () => {
    await axios.patch("/api/notifications");
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return { notifications, unreadCount, isLoading, markAllRead, refetch: fetchNotifications };
}

// ─── Doctors ──────────────────────────────────────────────────────────────────

export function useDoctors(params?: Record<string, string>) {
  const [doctors, setDoctors] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams(params).toString();
        const { data } = await axios.get(`/api/doctors?${query}`);
        setDoctors(data.data.doctors);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, [JSON.stringify(params)]);

  return { doctors, isLoading };
}
