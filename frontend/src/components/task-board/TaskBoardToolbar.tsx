"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { TaskStatus } from "@/hooks/useTaskBoard";
import {
  fieldOptions,
  type ViewMode,
} from "@/hooks/useTaskFilters";
import type { Notification } from "@/hooks/useTaskNotifications";

const statuses: TaskStatus[] = [
  "To Do",
  "Doing",
  "Completed",
  "On Hold",
];

type FilterType =
  | "Status"
  | "Priority"
  | "Members"
  | "Due Date"
  | "Labels"
  | null;

const FilterIcon = ({
  type,
}: {
  type: "status" | "priority" | "members" | "date" | "labels";
}) => {
  const paths = {
    status: ["M5 7h14", "M5 12h14", "M5 17h14"],
    priority: ["M6 17v1", "M10 14v4", "M14 10v8", "M18 6v12"],
    members: [
      "M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
      "M3.5 19c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5",
      "M16 5.5a3 3 0 0 1 0 5.5",
    ],
    date: [
      "M3.5 5h17v16h-17z",
      "M7 3v4",
      "M17 3v4",
      "M3.5 10h17",
    ],
    labels: ["m12 3 8 9-8 9-8-9 8-9Z"],
  };

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[type].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
};

const PriorityBars = ({ value }: { value: string }) => {
  const level: Record<string, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const color: Record<string, string> = {
    Urgent: "bg-red-500",
    High: "bg-orange-500",
    Medium: "bg-yellow-500",
    Low: "bg-gray-300",
  };

  return (
    <span className="flex h-4 w-[15px] items-end gap-[2px]">
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={`w-[2px] rounded-full ${
            bar <= (level[value] || 0)
              ? color[value]
              : "bg-[var(--border)]"
          }`}
          style={{ height: `${bar * 3 + 2}px` }}
        />
      ))}
    </span>
  );
};

type TaskBoardToolbarProps = {
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterStatus: TaskStatus | "All";
  setFilterStatus: (value: TaskStatus | "All") => void;
  filterPriority: string;
  setFilterPriority: (value: string) => void;
  filterMember: string;
  setFilterMember: (value: string) => void;
  filterDueDate: string;
  setFilterDueDate: (value: string) => void;
  filterLabel: string;
  setFilterLabel: (value: string) => void;
  visibleFields: string[];
  setVisibleFields: Dispatch<SetStateAction<string[]>>;
  memberOptions: string[];
  labelOptions: string[];
  clearFilters: () => void;
  openAddTask: (status: TaskStatus) => void;

  pageTitle?: string;
  addLabel?: string;
  searchPlaceholder?: string;
  showViewToggle?: boolean;
  showNotificationButton?: boolean;
  fieldOptionsOverride?: string[];

  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: Dispatch<SetStateAction<boolean>>;
  notificationsLoading: boolean;
  unreadNotificationCount: number;
  markNotificationAsRead: (notification: Notification) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  formatNotificationTime: (createdAt: string) => string;
  getNotificationIcon: (type: Notification["type"]) => string;
};

export default function TaskBoardToolbar({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  filterMember,
  setFilterMember,
  filterDueDate,
  setFilterDueDate,
  filterLabel,
  setFilterLabel,
  visibleFields,
  setVisibleFields,
  memberOptions,
  labelOptions,
  clearFilters,
  openAddTask,
  pageTitle = "Tasks",
  addLabel = "Add Task",
  searchPlaceholder = "Search tasks...",
  showViewToggle = true,
  showNotificationButton = true,
  fieldOptionsOverride,
  notifications,
  showNotifications,
  setShowNotifications,
  notificationsLoading,
  unreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  formatNotificationTime,
  getNotificationIcon,
}: TaskBoardToolbarProps) {
  
  const [searchOpen, setSearchOpen] = useState(() => {
  if (typeof window === "undefined") return false;

  return window.innerWidth < 640;
});

  const [showFields, setShowFields] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] =
  useState<FilterType>(null);

  const toggleFields = () => {
    setShowFields((previous) => !previous);
    setShowFilter(false);
    setShowNotifications(false);
  };

  const toggleFilter = () => {
    setShowFilter((previous) => !previous);
    setShowFields(false);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications((previous) => !previous);
    setShowFilter(false);
    setShowFields(false);
  };

  const availableFields = fieldOptionsOverride || fieldOptions;

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full items-center justify-between lg:w-auto">
        <h1 className="px-1 text-[20px] font-semibold text-[var(--accent)] sm:px-0">
          {pageTitle}
        </h1>

        <button
          type="button"
          onClick={() => openAddTask("To Do")}
          className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--hover)] lg:hidden"
        >
          + {addLabel}
        </button>
      </div>

      <div className="flex w-full items-center sm:w-auto sm:justify-end">
        <div className="flex items-center gap-2.5">
          {searchOpen ? (
            <div className="order-first flex h-10 w-full max-w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 sm:order-none sm:h-9 sm:w-[240px] sm:rounded-md">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-[14px] outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)] sm:h-9 sm:w-9 sm:rounded-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={toggleFields}
              className="flex h-9 w-[58px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--hover)] sm:w-auto sm:rounded-md sm:px-2.5 sm:text-[13px]"
            >
              <span className="text-[15px]">▥</span>
              Fields
            </button>

            {showFields && (
              <div className="absolute right-0 top-[42px] z-50 w-[220px] max-w-[calc(100vw-24px)] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                {showViewToggle && (
                  <div className="mb-2 flex h-8 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--hover)]">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 text-[12px] font-medium transition ${
                      viewMode === "list"
                        ? "bg-[var(--active-bg)] text-[var(--accent)] shadow-sm"
                        : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--accent)]"
                    }`}
                  >
                    <span>☰</span>
                    List
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("board")}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 border-l border-[var(--border)] text-[12px] font-medium transition ${
                      viewMode === "board"
                        ? "bg-[var(--active-bg)] text-[var(--accent)] shadow-sm"
                        : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--accent)]"
                    }`}
                  >
                    <span>▦</span>
                    Board
                  </button>
                  </div>
                )}

                <div className="space-y-1">
                  {availableFields.map((field) => {
                    const checked = visibleFields.includes(field);

                    return (
                      <button
                        key={field}
                        type="button"
                        onClick={() => {
                          setVisibleFields((previous) =>
                            checked
                              ? previous.filter((item) => item !== field)
                              : [...previous, field],
                          );
                        }}
                        className="flex h-8 w-full cursor-pointer items-center justify-between rounded-md px-2.5 text-left text-[12px] text-[var(--text)] hover:bg-[var(--hover)]"
                      >
                        <span>{field}</span>
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${
                            checked
                              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                              : "border-[var(--border)] bg-[var(--surface)]"
                          }`}
                        >
                          {checked && "✓"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={toggleFilter}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[var(--accent)] hover:bg-[var(--hover)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" />
              </svg>
            </button>
            {showFilter && (
              <>
                <div className="absolute right-0 top-[42px] z-50 w-[220px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                  <p className="px-2.5 pb-2 pt-1 text-[13px] font-semibold text-[var(--text)]">
                    Filter
                  </p>

                  {[
                    ["Status", "status"],
                    ["Priority", "priority"],
                    ["Members", "members"],
                    ["Due Date", "date"],
                    ["Labels", "labels"],
                  ].map(([label, icon]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setActiveFilter(label as FilterType)
                      }
                      className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md px-2.5 text-[12px] text-[var(--text)] hover:bg-[var(--hover)]"
                    >
                      <span className="flex items-center gap-2.5">
                        <FilterIcon
                          type={
                            icon as
                              "status" | "priority" | "members" | "date" | "labels"
                          }
                        />
                        {label}
                      </span>
                      <span className="text-[var(--muted)]">›</span>
                    </button>
                  ))}

                  <div className="mt-2 border-t border-[var(--border)] pt-2">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="h-9 w-full rounded-md px-2.5 text-left text-[12px] font-medium text-[var(--text)] hover:bg-[var(--hover)]"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {activeFilter && (
                  <div className="fixed left-1/2 top-1/2 z-50 w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl sm:absolute sm:left-auto sm:top-[42px] sm:right-[228px] sm:translate-x-0 sm:translate-y-0">
                    <div className="mb-1 flex items-center gap-1 border-b border-[var(--border)] pb-2">
                      <button
                        type="button"
                        onClick={() => setActiveFilter(null)}
                        className="h-7 w-7 rounded-md text-[var(--muted)] hover:bg-[var(--hover)]"
                      >
                        ‹
                      </button>
                      <span className="text-[13px] font-semibold text-[var(--text)]">
                        {activeFilter}
                      </span>
                    </div>

                    {activeFilter === "Status" && (
                      <div>
                        {["All", ...statuses].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setFilterStatus(
                                value as TaskStatus | "All",
                              )
                            }
                            className="flex min-h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-[12px] hover:bg-[var(--hover)]"
                          >
                            {value}
                            {filterStatus === value && "✓"}
                          </button>
                        ))}
                      </div>
                    )}

                    {activeFilter === "Priority" && (
                      <div>
                        {[
                          ["All", "No Priority"],
                          ["Urgent", "Urgent"],
                          ["High", "High"],
                          ["Medium", "Medium"],
                          ["Low", "Low"],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFilterPriority(value)}
                            className="flex min-h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-[12px] hover:bg-[var(--hover)]"
                          >
                            <span className="flex items-center gap-2.5">
                              {value === "All" ? (
                                <span className="w-[15px]" />
                              ) : (
                                <PriorityBars value={value} />
                              )}
                              <span
                                className={
                                  value === "Urgent"
                                    ? "text-red-500"
                                    : value === "High"
                                      ? "text-orange-500"
                                      : value === "Medium"
                                        ? "text-yellow-500"
                                        : value === "Low"
                                          ? "text-gray-400"
                                          : ""
                                }
                              >
                                {label}
                              </span>
                            </span>
                            {filterPriority === value && "✓"}
                          </button>
                        ))}
                      </div>
                    )}

                    {activeFilter === "Members" && (
                      <div className="max-h-[250px] overflow-y-auto">
                        {["All", ...memberOptions].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFilterMember(value)}
                            className="flex min-h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-[12px] hover:bg-[var(--hover)]"
                          >
                            <span className="truncate">{value}</span>
                            {filterMember === value && "✓"}
                          </button>
                        ))}
                      </div>
                    )}

                    {activeFilter === "Due Date" && (
                      <div className="space-y-2 p-1">
                        <button
                          type="button"
                          onClick={() => setFilterDueDate("")}
                          className="flex min-h-9 w-full items-center justify-between rounded-md px-2 text-left text-[12px] hover:bg-[var(--hover)]"
                        >
                          Any date
                          {!filterDueDate && "✓"}
                        </button>

                        <input
                          type="date"
                          value={filterDueDate}
                          onChange={(event) =>
                            setFilterDueDate(event.target.value)
                          }
                          className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[12px]"
                        />
                      </div>
                    )}

                    {activeFilter === "Labels" && (
                      <div className="max-h-[250px] overflow-y-auto">
                        {["All", ...labelOptions].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFilterLabel(value)}
                            className="flex min-h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-[12px] hover:bg-[var(--hover)]"
                          >
                            <span className="truncate">{value}</span>
                            {filterLabel === value && "✓"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
                      </div>

          <button
            type="button"
            onClick={() => openAddTask("To Do")}
            className="ml-8 hidden h-9 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-[12px] font-medium text-[var(--accent)] hover:bg-[var(--hover)] lg:flex"
          >
            + {addLabel}
          </button>

          {showNotificationButton && (
            <div className="relative ml-6">
              <button
              type="button"
              onClick={toggleNotifications}
              className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)]"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>

              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
                  {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-[44px] z-50 w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[var(--text)]">
                      Notifications
                    </h3>
                    <p className="text-[11px] text-[var(--muted)]">
                      {unreadNotificationCount} unread
                    </p>
                  </div>

                  {unreadNotificationCount > 0 && (
                    <button
                      type="button"
                      onClick={() => void markAllNotificationsAsRead()}
                      className="cursor-pointer text-[11px] font-medium text-[var(--accent)] hover:underline"
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
                    <div className="px-4 py-10 text-center">
                      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--active-bg)] text-[var(--accent)]">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                          <path d="M10 21h4" />
                        </svg>
                      </div>
                      <p className="text-[13px] font-medium text-[var(--text)]">
                        No notifications
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--muted)]">
                        You&apos;re all caught up.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => void markNotificationAsRead(notification)}
                        className={`flex w-full cursor-pointer gap-3 border-b border-[var(--border)] px-4 py-3 text-left transition hover:bg-[var(--hover)] ${
                          notification.isRead
                            ? "font-normal text-[var(--text)]"
                            : "font-semibold text-[var(--accent)]"
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[13px] text-[var(--accent)]">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex w-full items-center gap-2 sm:w-auto">
                            <p className="text-[12px] leading-5 text-[var(--text)]">
                              {notification.message}
                            </p>
                            {!notification.isRead && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                            )}
                          </div>
                          <p className="mt-1 text-[10px] text-[var(--text)]">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}