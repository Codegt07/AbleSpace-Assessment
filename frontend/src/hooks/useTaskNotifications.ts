"use client";

import { useCallback, useEffect, useState } from "react";
export type Notification = {
  _id: string;
  userId: string;
  type: "welcome" | "task_added" | "task_removed" | "tip";
  message: string;
  taskId?: string | null;
  isRead: boolean;
  createdAt: string;
};

type Guest = {
  guestId: string;
  workspaceId: string;
};

type UseTaskNotificationsOptions = {
  onOpenTask: (taskId: string) => void;
};

export default function useTaskNotifications({
  onOpenTask,
}: UseTaskNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const getGuest = useCallback((): Guest | null => {
    const storedGuest = localStorage.getItem("guest");

    if (!storedGuest) {
      return null;
    }

    try {
      return JSON.parse(storedGuest) as Guest;
    } catch {
      return null;
    }
  }, []);

  const fetchNotifications = useCallback(
    async (silent = false) => {
      try {
        const guest = getGuest();

        if (!guest) {
          return;
        }

        if (!silent) {
          setNotificationsLoading(true);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications?userId=${guest.guestId}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch Notifications Error:", error);
      } finally {
        if (!silent) {
          setNotificationsLoading(false);
        }
      }
    },
    [getGuest],
  );

  useEffect(() => {
    void fetchNotifications();

    const interval = window.setInterval(() => {
      void fetchNotifications(true);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [fetchNotifications]);

  const markNotificationAsRead = useCallback(
    async (notification: Notification) => {
      try {
        const guest = getGuest();

        if (!guest) {
          return;
        }

        if (!notification.isRead) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notification._id}/read?userId=${guest.guestId}`,
            { method: "PATCH" },
          );

          if (!response.ok) {
            throw new Error("Failed to mark notification as read");
          }

          setNotifications((previousNotifications) =>
            previousNotifications.map((item) =>
              item._id === notification._id
                ? { ...item, isRead: true }
                : item,
            ),
          );
        }

        if (notification.taskId) {
          setShowNotifications(false);
          onOpenTask(notification.taskId);
        }
      } catch (error) {
        console.error("Mark Notification Read Error:", error);
      }
    },
    [getGuest, onOpenTask],
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      const guest = getGuest();

      if (!guest) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all?userId=${guest.guestId}`,
        { method: "PATCH" },
      );

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("Mark All Notifications Error:", error);
    }
  }, [getGuest]);

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    if (type === "welcome") return "👋";
    if (type === "task_added") return "✓";
    if (type === "task_removed") return "−";
    return "💡";
  };

  return {
    notifications,
    showNotifications,
    setShowNotifications,
    notificationsLoading,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationCount,
    formatNotificationTime,
    getNotificationIcon,
  };
}
