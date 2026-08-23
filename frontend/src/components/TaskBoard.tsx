"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import BoardColumn from "./BoardColumn";
import TaskList from "./TaskList";
import { useRouter } from "next/navigation";
import TaskFormModal from "./TaskFormModal";


type TaskStatus = "To Do" | "Doing" | "Completed" | "On Hold";
type ViewMode = "board" | "list";

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: string;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
};

type Guest = {
  guestId: string;
  workspaceId: string;
  name?: string;
};

type Notification = {
  _id: string;
  userId: string;
  type: "welcome" | "task_added" | "task_removed" | "tip";
  message: string;
  taskId?: string | null;
  isRead: boolean;
  createdAt: string;
};

const statuses: TaskStatus[] = [
  "To Do",
  "Doing",
  "Completed",
  "On Hold",
];

const fieldOptions = [
  "Priority",
  "Members",
  "Due Date",
  "Labels",
  "Status",
  "Reporter",
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] =
    useState<ViewMode>("board");

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [showFields, setShowFields] =
    useState(false);

   const [visibleFields, setVisibleFields] = useState<string[]>([
      "Priority",
      "Members",
      "Due Date",
      "Labels",
    ]);

  const [showFilter, setShowFilter] =
    useState(false);

  const [showTaskModal, setShowTaskModal] =
    useState(false);

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);

  // Notification
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  // Task form
  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<TaskStatus>("To Do");

  const [priority, setPriority] =
    useState("Medium");

  const [dueDate, setDueDate] =
    useState("");

  const [labels, setLabels] =
    useState("");

  // Filters
  const [filterStatus, setFilterStatus] =
    useState<TaskStatus | "All">("All");

  const [filterPriority, setFilterPriority] =
    useState("All");

  const [filterMember, setFilterMember] =
    useState("All");

  const [filterDueDate, setFilterDueDate] =
    useState("");

  const [filterLabel, setFilterLabel] =
    useState("All");

  const [addingTask, setAddingTask] = useState(false);
  const [showAddTaskWaitMessage, setShowAddTaskWaitMessage] =
  useState(false);
    

  const router = useRouter();

  const openTask = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  useEffect(() => {
    fetchTasks();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getGuest = (): Guest | null => {
    const storedGuest =
      localStorage.getItem("guest");

    if (!storedGuest) {
      return null;
    }

    try {
      return JSON.parse(storedGuest);
    } catch {
      return null;
    }
  };

  const parseLabels = () =>
    labels
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);

  const resetTaskForm = () => {
    setTitle("");
    setDescription("");
    setSelectedStatus("To Do");
    setPriority("Medium");
    setDueDate("");
    setLabels("");
    setEditingTaskId(null);
    setShowTaskModal(false);
  };

  // =========================
  // TASKS
  // =========================

  const fetchTasks = async () => {
    try {
      const guest = getGuest();

      if (!guest) {
        console.error("Guest not found");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      setTasks(data);
    } catch (error) {
      console.error(
        "Fetch Tasks Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // NOTIFICATIONS
  // =========================

  const fetchNotifications = async (
    silent = false
  ) => {
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
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch notifications"
        );
      }

      const data = await response.json();

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Fetch Notifications Error:",
        error
      );
    } finally {
      if (!silent) {
        setNotificationsLoading(false);
      }
    }
  };

  const unreadNotificationCount =
    notifications.filter(
      (notification) => !notification.isRead
    ).length;

  const markNotificationAsRead = async (
    notification: Notification
  ) => {
    try {
      const guest = getGuest();

      if (!guest) {
        return;
      }

      if (!notification.isRead) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notification._id}/read?userId=${guest.guestId}`,
          {
            method: "PATCH",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to mark notification as read"
          );
        }

        setNotifications(
          (previousNotifications) =>
            previousNotifications.map(
              (item) =>
                item._id === notification._id
                  ? {
                      ...item,
                      isRead: true,
                    }
                  : item
            )
        );
      }

      if (notification.taskId) {
        setShowNotifications(false);
        router.push(
          `/tasks/${notification.taskId}`
        );
      }
    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error
      );
    }
  };

  const markAllNotificationsAsRead =
    async () => {
      try {
        const guest = getGuest();

        if (!guest) {
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all?userId=${guest.guestId}`,
          {
            method: "PATCH",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to mark all notifications as read"
          );
        }

        setNotifications(
          (previousNotifications) =>
            previousNotifications.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );
      } catch (error) {
        console.error(
          "Mark All Notifications Error:",
          error
        );
      }
    };

  const formatNotificationTime = (
    createdAt: string
  ) => {
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

  const getNotificationIcon = (
    type: Notification["type"]
  ) => {
    if (type === "welcome") {
      return "👋";
    }

    if (type === "task_added") {
      return "✓";
    }

    if (type === "task_removed") {
      return "−";
    }

    return "💡";
  };

  // =========================
  // ADD TASK
  // =========================

  const openAddTask = (
    status: TaskStatus
  ) => {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setSelectedStatus(status);
    setPriority("Medium");
    setDueDate("");
    setLabels("");
    setShowTaskModal(true);
  };

  // =========================
  // EDIT TASK
  // =========================

  const openEditTask = (
    taskId: string
  ) => {
    const task = tasks.find(
      (task) => task._id === taskId
    );

    if (!task) {
      return;
    }

    setEditingTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description || "");
    setSelectedStatus(task.status);
    setPriority(
      task.priority || "Medium"
    );

    setDueDate(
      task.dueDate
        ? new Date(task.dueDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setLabels(
      (task.labels || []).join(", ")
    );

    setShowTaskModal(true);
  };

const handleDropTask = async (
  taskId: string,
  newStatus: TaskStatus
) => {
  try {
    const guest = getGuest();

    if (!guest) {
      return;
    }

    const task = tasks.find(
      (task) => task._id === taskId
    );

    if (!task) {
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: task.title,
          status: newStatus,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update task status");
    }

    const updatedTask = await response.json();

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task._id === taskId ? updatedTask : task
      )
    );
  } catch (error) {
    console.error(
      "Drag and Drop Status Error:",
      error
    );

    toast.error("Failed to move task");
  }
};

const handleAddTask = async () => {
  if (!title.trim()) {
    toast.error("Task title is required");
    return;
  }

  if (addingTask) return;

  setAddingTask(true);
  setShowAddTaskWaitMessage(false);

  const waitMessageTimer = setTimeout(() => {
    setShowAddTaskWaitMessage(true);
  }, 3000);

  try {
    const guest = getGuest();

      if (!guest) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type: "main",
          parentTaskId: null,
          status: selectedStatus,
          priority,
          members: [guest.guestId],
          createdBy: guest.guestId,
          workspaceId: guest.workspaceId,
          dueDate: dueDate || undefined,
          labels: parseLabels(),
          resources: [],
        })
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create task"
        );
      }

      const newTask =
        await response.json();

      setTasks(
        (previousTasks) => [
          newTask,
          ...previousTasks,
        ]
      );

      resetTaskForm();

      toast.success(
        "Task created successfully"
      );

      await fetchNotifications(true);
    } catch (error) {
      console.error(
        "Add Task Error:",
        error
      );

      toast.error(
        "Failed to create task"
      );
    } finally {
      clearTimeout(waitMessageTimer);
      setAddingTask(false);
      setShowAddTaskWaitMessage(false);
    }
  };

  // =========================
  // UPDATE TASK
  // =========================

  const handleUpdateTask = async () => {
    if (
      !editingTaskId ||
      !title.trim()
    ) {
      return;
    }

    try {
      const guest = getGuest();

      if (!guest) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${editingTaskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            status: selectedStatus,
            description: description.trim(),
            priority,
            dueDate:
              dueDate || undefined,
            labels: parseLabels(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update task"
        );
      }

      const updatedTask =
        await response.json();

      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (task) =>
              task._id ===
              editingTaskId
                ? updatedTask
                : task
          )
      );

      resetTaskForm();

      toast.success(
        "Task updated successfully"
      );

      await fetchNotifications(true);
    } catch (error) {
      console.error(
        "Update Task Error:",
        error
      );

      toast.error(
        "Failed to update task"
      );
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const handleDeleteTask = async (
    taskId: string
  ) => {
    try {
      const guest = getGuest();

      if (!guest) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete task"
        );
      }

      setTasks(
        (previousTasks) =>
          previousTasks.filter(
            (task) =>
              task._id !== taskId
          )
      );

      toast.success(
        "Task deleted successfully"
      );

      await fetchNotifications(true);
    } catch (error) {
      console.error(
        "Delete Task Error:",
        error
      );

      toast.error(
        "Failed to delete task"
      );
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredTasks =
    tasks.filter((task) => {
      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(
            searchQuery
              .trim()
              .toLowerCase()
          );

      const matchesStatus =
        filterStatus === "All" ||
        task.status === filterStatus;

      const matchesPriority =
        filterPriority === "All" ||
        task.priority ===
          filterPriority;

      const matchesMember =
        filterMember === "All" ||
        task.assignee ===
          filterMember;

      const matchesDueDate =
        !filterDueDate ||
        (task.dueDate &&
          new Date(task.dueDate)
            .toISOString()
            .split("T")[0] ===
            filterDueDate);

      const matchesLabel =
        filterLabel === "All" ||
        task.labels?.includes(
          filterLabel
        );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesMember &&
        matchesDueDate &&
        matchesLabel
      );
    });

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-between lg:w-auto">
        <h1 className="px-1 text-[20px] font-semibold text-[var(--accent)] sm:px-0">
          Tasks
        </h1>

        {/* MOBILE ADD TASK */}
        <button
          type="button"
          onClick={() => openAddTask("To Do")}
          className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--hover)] lg:hidden"
        >
          + Add Task
        </button>
      </div>

        <div className="flex w-full items-center sm:w-auto sm:justify-end">
          {/* SEARCH */}
          <div className="flex items-center gap-2.5">
           {searchOpen ? (
            <div className="order-first flex h-10 w-full max-w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 sm:order-none sm:h-9 sm:w-[240px] sm:rounded-md">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                autoFocus
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search tasks..."
                className="w-full bg-transparent text-[14px] outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                setSearchOpen(true)
              }
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)] sm:h-9 sm:w-9 sm:rounded-md"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          )}

          {/* FIELDS */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowFields((previous) => !previous);
            setShowFilter(false);
            setShowNotifications(false);
          }}
        className="flex h-9 w-[58px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--hover)] sm:h-9 sm:w-auto sm:rounded-md sm:px-2.5 sm:text-[13px]"
        >
          <span className="text-[15px]">▥</span>
          Fields
        </button>

        {showFields && (
          <div className="absolute right-0 top-[42px] z-50 w-[220px] max-w-[calc(100vw-24px)] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">

            {/* LIST / BOARD */}
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

      {/* FIELD OPTIONS */}
      <div className="space-y-1">
        {fieldOptions.map((field) => {
          const checked = visibleFields.includes(field);

          return (
            <button
              key={field}
              type="button"
              onClick={() => {
                setVisibleFields((previous) =>
                  checked
                    ? previous.filter((item) => item !== field)
                    : [...previous, field]
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

          {/* FILTER */}
       <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFilter(
                  (previous) =>
                    !previous
                );
                setShowFields(false);
                setShowNotifications(
                  false
                );
              }}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[var(--accent)] hover:bg-[var(--hover)]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" />
              </svg>
            </button>
            

            {showFilter && (
              <div className="absolute right-0 top-[42px] z-50 w-[250px] max-w-[calc(100vw-24px)] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg">
                <p className="mb-3 text-[13px] font-semibold text-[var(--text)]">
                  Filter Tasks
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[12px] text-[var(--muted)]">
                      Status
                    </label>

                    <select
                      value={
                        filterStatus
                      }
                      onChange={(e) =>
                        setFilterStatus(
                          e.target
                            .value as
                            | TaskStatus
                            | "All"
                        )
                      }
                      className="mt-1 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[12px]"
                    >
                      <option value="All">
                        All
                      </option>
                      <option value="To Do">
                        To Do
                      </option>
                      <option value="Doing">
                        Doing
                      </option>
                      <option value="Completed">
                        Completed
                      </option>
                      <option value="On Hold">
                        On Hold
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[12px] text-[var(--muted)]">
                      Priority
                    </label>

                    <select
                      value={
                        filterPriority
                      }
                      onChange={(e) =>
                        setFilterPriority(
                          e.target.value
                        )
                      }
                      className="mt-1 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[12px]"
                    >
                      <option value="All">
                        All
                      </option>
                      <option value="Low">
                        Low
                      </option>
                      <option value="Medium">
                        Medium
                      </option>
                      <option value="High">
                        High
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[12px] text-[var(--muted)]">
                      Member
                    </label>

                    <select
                      value={
                        filterMember
                      }
                      onChange={(e) =>
                        setFilterMember(
                          e.target.value
                        )
                      }
                      className="mt-1 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[12px]"
                    >
                      <option value="All">
                        All
                      </option>

                      {[
                        ...new Set(
                          tasks
                            .map(
                              (
                                task
                              ) =>
                                task.assignee
                            )
                            .filter(
                              Boolean
                            )
                        ),
                      ].map(
                        (member) => (
                          <option
                            key={
                              member
                            }
                            value={
                              member
                            }
                          >
                            {member}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[12px] text-[var(--muted)]">
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={
                        filterDueDate
                      }
                      onChange={(e) =>
                        setFilterDueDate(
                          e.target.value
                        )
                      }
                      className="mt-1 h-8 w-full rounded-md border border-[var(--border)] px-2 text-[12px]"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] text-[var(--muted)]">
                      Label
                    </label>

                    <select
                      value={
                        filterLabel
                      }
                      onChange={(e) =>
                        setFilterLabel(
                          e.target.value
                        )
                      }
                      className="mt-1 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[12px]"
                    >
                      <option value="All">
                        All
                      </option>

                      {[
                        ...new Set(
                          tasks.flatMap(
                            (task) =>
                              task.labels ||
                              []
                          )
                        ),
                      ].map(
                        (label) => (
                          <option
                            key={
                              label
                            }
                            value={
                              label
                            }
                          >
                            {label}
                          </option>
                        )
                      )}
                    </select>
                    
                  </div>
                  
                  
                </div>
                

                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus(
                      "All"
                    );
                    setFilterPriority(
                      "All"
                    );
                    setFilterMember(
                      "All"
                    );
                    setFilterDueDate(
                      ""
                    );
                    setFilterLabel(
                      "All"
                    );
                  }}
                  className="mt-4 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] text-[12px] font-medium hover:bg-[var(--hover)]"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          </div>

          {/* ADD TASK */}
            <button
              type="button"
              onClick={() => openAddTask("To Do")}
              className="ml-8 hidden h-9 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 text-[12px] font-medium text-[var(--accent)] hover:bg-[var(--hover)] lg:flex"
            >
              + Add Task
</button>

          {/* NOTIFICATIONS */}
          <div className="relative ml-6">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(
                  (previous) =>
                    !previous
                );

                setShowFilter(false);
                setShowFields(false);

                if (!showNotifications) {
                  fetchNotifications();
                }
              }}
              className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)]"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>

              {unreadNotificationCount >
                0 && (
                <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
                  {unreadNotificationCount >
                  99
                    ? "99+"
                    : unreadNotificationCount}
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
                      {unreadNotificationCount}{" "}
                      unread
                    </p>
                  </div>

                  {unreadNotificationCount >
                    0 && (
                    <button
                      type="button"
                      onClick={
                        markAllNotificationsAsRead
                      }
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
                  ) : notifications.length ===
                    0 ? (
                    <div className="px-4 py-10 text-center">
                      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--active-bg)] text-[var(--accent)]">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
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
                    notifications.map(
                      (notification) => (
                        <button
                          key={
                            notification._id
                          }
                          type="button"
                          onClick={() =>
                            markNotificationAsRead(
                              notification
                            )
                          }
                         className={`flex w-full cursor-pointer gap-3 border-b border-[var(--border)] px-4 py-3 text-left transition hover:bg-[var(--hover)] ${
                          notification.isRead
                        ? "font-normal text-[var(--text)]"
                        : "font-semibold text-[var(--accent)]"
                        }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[13px] text-[var(--accent)]">
                            {getNotificationIcon(
                              notification.type
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex w-full items-center gap-2 sm:w-auto">
                              <p
                              className={`text-[12px] leading-5 ${
                                notification.isRead
                                  ? "font-normal text-[var(--text)]"
                                  : "font-semibold text-[var(--text)]"
                              }`}
                            >
                              {notification.message}
                            </p>

                              {!notification.isRead && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                              )}
                            </div>

                            <p className="mt-1 text-[10px] text-[var(--text)]" >
                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </p>
                          </div>
                        </button>
                      )
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOARD / LIST */}
      
        {viewMode === "board" ? (
          <div className="mt-4 w-full pb-2 sm:mt-5 lg:mt-8">
            <div className="grid w-full grid-cols-1 items-start gap-3 lg:grid-cols-4">
            {statuses.map(
              (status) => {
                const columnTasks =
                  filteredTasks.filter(
                    (task) =>
                      task.status ===
                      status
                  );

                if (
                  searchQuery.trim() &&
                  columnTasks.length === 0
                ) {
                  return null;
                }

                return (
                  <BoardColumn
                    key={status}
                    title={status}
                    tasks={columnTasks.map(
                      (task) => ({
                        _id: task._id,
                        title: task.title,
                        assignee:
                          task.assignee ||
                          "Guest",
                        dueDate:
                          task.dueDate
                            ? new Date(
                                task.dueDate
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month:
                                    "short",
                                }
                              )
                            : "No date",
                        labels:
                          task.labels ||
                          [],
                          priority:
                          task.priority || "Medium",
                      })
                    )}
                    onAddTask={() =>
                      openAddTask(
                        status
                      )
                    }
                    onOpenTask={
                      openTask
                    }
                    onEditTask={
                      openEditTask
                    }
                    onDeleteTask={
                      handleDeleteTask
                    }
                    
                    onDropTask={handleDropTask}
                    visibleFields={visibleFields}
                  />
                );
              }
            )}
            </div>
          </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onAddTask={openAddTask}
          onOpenTask={openTask}
          onEditTask={openEditTask}
          onDeleteTask={handleDeleteTask}
          isSearching={searchQuery.trim().length > 0}
          visibleFields={visibleFields}
        />
      )}

      <TaskFormModal
        open={showTaskModal}
        editingTaskId={editingTaskId}
        mode="task"
        description={description}
        title={title}
        selectedStatus={selectedStatus}
        priority={priority}
        dueDate={dueDate}
        labels={labels}
        setTitle={setTitle}
        setDescription={setDescription}
        setSelectedStatus={setSelectedStatus}
        setPriority={setPriority}
        setDueDate={setDueDate}
        setLabels={setLabels}
        onClose={resetTaskForm}
        onSubmit={
          editingTaskId
            ? handleUpdateTask
            : handleAddTask
        }
        addingTask={addingTask}
        showAddTaskWaitMessage={showAddTaskWaitMessage}
      />
    </>
  );
}