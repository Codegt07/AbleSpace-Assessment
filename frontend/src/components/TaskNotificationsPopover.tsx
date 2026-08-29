"use client";

import type { Notification } from "@/hooks/useTaskNotifications";

type TaskNotificationsPopoverProps = {
  notifications: Notification[];
  showNotifications: boolean;
  notificationsLoading: boolean;
  unreadNotificationCount: number;
  markNotificationAsRead: (notification: Notification) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  formatNotificationTime: (createdAt: string) => string;
  getNotificationIcon: (type: Notification["type"]) => string;
};

export default function TaskNotificationsPopover({
  notifications,
  showNotifications,
  notificationsLoading,
  unreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  formatNotificationTime,
  getNotificationIcon,
}: TaskNotificationsPopoverProps) {
  if (!showNotifications) {
    return null;
  }

  return (
    <div className="absolute right-0 top-[44px] z-50 w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <h3 className="text-[14px] font-semibold">Notifications</h3>
          <p className="text-[11px] text-[var(--muted)]">
            {unreadNotificationCount} unread
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllNotificationsAsRead()}
            className="text-[11px] font-medium text-[var(--accent)]"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {notificationsLoading ? (
          <div className="px-4 py-8 text-center text-[12px] text-[var(--muted)]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center text-[12px] text-[var(--muted)]">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => void markNotificationAsRead(notification)}
              className="flex w-full gap-3 border-b border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--hover)]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--accent)]">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] leading-5 text-[var(--text)]">
                  {notification.message}
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted)]">
                  {formatNotificationTime(notification.createdAt)}
                </p>
              </div>

              {!notification.isRead && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}