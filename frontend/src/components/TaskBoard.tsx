"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import BoardColumn from "./BoardColumn";
import TaskList from "./TaskList";
import { useRouter } from "next/navigation";

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
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFields, setShowFields] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<TaskStatus>("To Do");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "All">("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterMember, setFilterMember] = useState("All");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterLabel, setFilterLabel] = useState("All");
  
  const router = useRouter();

  const openTask = (taskId: string) => {
  router.push(`/tasks/${taskId}`);
};


  useEffect(() => {
    fetchTasks();
  }, []);

  const getGuest = (): Guest | null => {
    const storedGuest = localStorage.getItem("guest");

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
    setSelectedStatus("To Do");
    setPriority("Medium");
    setDueDate("");
    setLabels("");
    setEditingTaskId(null);
    setShowTaskModal(false);
  };

  const fetchTasks = async () => {
    try {
      const guest = getGuest();

      if (!guest) {
        console.error("Guest not found");
        return;
      }

      const response = await fetch(
      `http://localhost:5000/tasks?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`
    );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Fetch Tasks Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddTask = (status: TaskStatus) => {
    setEditingTaskId(null);
    setTitle("");
    setSelectedStatus(status);
    setPriority("Medium");
    setDueDate("");
    setLabels("");
    setShowTaskModal(true);
  };

  const openEditTask = (taskId: string) => {
    const task = tasks.find((task) => task._id === taskId);

    if (!task) {
      return;
    }

    setEditingTaskId(task._id);
    setTitle(task.title);
    setSelectedStatus(task.status);
    setPriority(task.priority || "Medium");

    setDueDate(
      task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : ""
    );

    setLabels((task.labels || []).join(", "));
    setShowTaskModal(true);
  };

  const handleAddTask = async () => {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      const guest = getGuest();

      if (!guest) {
        return;
      }

      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        title: title.trim(),
        description: "",
        type: "main",
        parentTaskId: null,
        priority,
        members: [guest.guestId],
        createdBy: guest.guestId,
        workspaceId: guest.workspaceId,
        labels: parseLabels(),
        resources: [],
      }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();

      setTasks((previousTasks) => [
        newTask,
        ...previousTasks,
      ]);

      resetTaskForm();
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Add Task Error:", error);
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTaskId || !title.trim()) {
      return;
    }

    try {
      const guest = getGuest();

      if (!guest) {
        return;
      }

      const response = await fetch(
        `http://localhost:5000/tasks/${editingTaskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            status: selectedStatus,
            priority,
            dueDate: dueDate || undefined,
            labels: parseLabels(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === editingTaskId
            ? updatedTask
            : task
        )
      );

      resetTaskForm();
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Update Task Error:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const guest = getGuest();

      if (!guest) {
        return;
      }

      const response = await fetch(
        `http://localhost:5000/tasks/${taskId}?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task._id !== taskId
        )
      );

      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Delete Task Error:", error);
      toast.error("Failed to delete task");
    }
  };

 const filteredTasks = tasks.filter((task) => {
  const matchesSearch = task.title
    .toLowerCase()
    .includes(searchQuery.trim().toLowerCase());

  const matchesStatus =
    filterStatus === "All" || task.status === filterStatus;

  const matchesPriority =
    filterPriority === "All" || task.priority === filterPriority;

  const matchesMember =
    filterMember === "All" || task.assignee === filterMember;

  const matchesDueDate =
    !filterDueDate ||
    (task.dueDate &&
      new Date(task.dueDate).toISOString().split("T")[0] ===
        filterDueDate);

  const matchesLabel =
    filterLabel === "All" ||
    task.labels?.includes(filterLabel);

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[16px] font-semibold text-[var(--accent)]">
          Tasks
        </h1>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex h-9 w-[240px] items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3" >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                autoFocus
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search tasks..."
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--hover)] text-[var(--accent)]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          )}

          <div className="flex h-9 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex cursor-pointer items-center gap-2 px-3 text-[12px] font-medium ${
                viewMode === "list"
                  ? "bg-[var(--active-bg)] text-[var(--accent)]"
                  : "bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)]"
              }`}
            >
              <span>☰</span>
              List
            </button>

            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`flex cursor-pointer items-center  text-[var(--accent)]gap-2 border-l border-[var(--border)] px-3 text-[12px] font-medium ${
                viewMode === "board"
                  ? "bg-[var(--active-bg)] text-[var(--accent)]"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--hover)]"
              }`}
            >
              <span>▦</span>
              Board
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFields((previous) => !previous);
                setShowFilter(false);
              }}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[12px] font-medium hover:bg-[var(--hover)] text-[var(--accent)]"
            >
              <span className="text-[14px]">▥</span>
              Fields
            </button>

            {showFields && (
              <div className="absolute right-0 top-[42px] z-30 w-[220px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                <div className="space-y-1">
                  {fieldOptions.map((field) => (
                    <div
                      key={field}
                      className="flex h-7 items-center justify-between px-2 text-[11px] text-[var(--text)]"
                    >
                      <span>{field}</span>

                      <div className="h-3.5 w-3.5 rounded-[4px] bg-[var(--border)]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
  <button
    type="button"
    onClick={() => {
      setShowFilter((previous) => !previous);
      setShowFields(false);
    }}
    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)] ${
      filterStatus !== "All" ||
      filterPriority !== "All" ||
      filterMember !== "All" ||
      filterDueDate ||
      filterLabel !== "All"
        ? "border-[var(--accent)]"
        : "border-[var(--border)]"
    }`}
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
    <div className="absolute right-0 top-[42px] z-40 w-[250px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg">
      <p className="mb-3 text-[12px] font-semibold text-[var(--text)]">
        Filter Tasks
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-[11px] text-[var(--muted)]">Status</label>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as TaskStatus | "All")
            }
            className="mt-1 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px]"
          >
            <option value="All">All</option>
            <option value="To Do">To Do</option>
            <option value="Doing">Doing</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-[var(--muted)]">Priority</label>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="mt-1 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px]"
          >
            <option value="All">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-[var(--muted)]">Member</label>

          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="mt-1 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px]"
          >
            <option value="All">All</option>

            {[...new Set(tasks.map((task) => task.assignee).filter(Boolean))].map(
              (member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-[var(--muted)]">Due Date</label>

          <input
            type="date"
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value)}
            className="mt-1 h-8 w-full rounded-md border border-[var(--border)] px-2 text-[11px]"
          />
        </div>

        <div>
          <label className="text-[11px] text-[var(--muted)]">Label</label>

          <select
            value={filterLabel}
            onChange={(e) => setFilterLabel(e.target.value)}
            className="mt-1 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px]"
          >
            <option value="All">All</option>

            {[
              ...new Set(
                tasks.flatMap((task) => task.labels || [])
              ),
            ].map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setFilterStatus("All");
          setFilterPriority("All");
          setFilterMember("All");
          setFilterDueDate("");
          setFilterLabel("All");
        }}
        className="mt-4 h-8 w-full cursor-pointer rounded-md border border-[var(--border)] text-[11px] font-medium hover:bg-[var(--hover)]"
      >
        Clear Filters
      </button>
    </div>
  )}
</div>
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="grid w-full grid-cols-4 items-start gap-3">
          {statuses.map((status) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.status === status
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
                tasks={columnTasks.map((task) => ({
                  _id: task._id,
                  title: task.title,
                  assignee: task.assignee || "Guest",
                  dueDate: task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })
                    : "No date",
                  labels: task.labels || [],
                }))}
                onAddTask={() => openAddTask(status)}
                onOpenTask={openTask}
                onEditTask={openEditTask}
                onDeleteTask={handleDeleteTask}
              />
            );
          })}
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onAddTask={openAddTask}
          onEditTask={openEditTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {showTaskModal && (
        <div
          onClick={resetTaskForm}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-[400px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[var(--text)]">
                {editingTaskId ? "Edit Task" : "Add Task"}
              </h2>

              <button
                type="button"
                onClick={resetTaskForm}
                className="cursor-pointer text-[20px] text-[var(--muted)]"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[var(--text)]">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter task title"
                  className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-[13px] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--text)]">
                  Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target.value as TaskStatus
                    )
                  }
                  className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none"
                >
                  <option value="To Do">To Do</option>
                  <option value="Doing">Doing</option>
                  <option value="Completed">
                    Completed
                  </option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--text)]">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value)
                  }
                  className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--text)]">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-[13px] outline-none"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--text)]">
                  Labels
                </label>

                <input
                  value={labels}
                  onChange={(event) =>
                    setLabels(event.target.value)
                  }
                  placeholder="Design, Frontend"
                  className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-[13px] outline-none"
                />

                <p className="mt-1 text-[10px] text-[var(--muted)]">
                  Separate multiple labels with commas.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetTaskForm}
                className="h-9 cursor-pointer rounded-lg border border-[var(--border)] px-4 text-[12px] font-medium text-[var(--text)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  editingTaskId
                    ? handleUpdateTask
                    : handleAddTask
                }
                className="h-9 cursor-pointer rounded-lg bg-[var(--accent)] px-4 text-[12px] font-medium text-white"
              >
                {editingTaskId
                  ? "Save Changes"
                  : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}