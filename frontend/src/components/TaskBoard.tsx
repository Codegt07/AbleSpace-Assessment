"use client";

import { useEffect, useState } from "react";
import BoardColumn from "./BoardColumn";

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: "To Do" | "Doing" | "Completed" | "On Hold";
  priority?: string;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
};

const statuses = ["To Do", "Doing", "Completed", "On Hold"] as const;

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<Task["status"]>("To Do");

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const getGuest = () => {
    const storedGuest = localStorage.getItem("guest");

    if (!storedGuest) {
      return null;
    }

    return JSON.parse(storedGuest);
  };

  const fetchTasks = async () => {
    try {
      const guest = getGuest();

      if (!guest) {
        console.error("Guest not found");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/tasks?guestId=${guest.guestId}`
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

  const openAddTask = (status: Task["status"]) => {
  setEditingTaskId(null);
  setTitle("");
  setPriority("Medium");
  setDueDate("");
  setLabels("");
  setSelectedStatus(status);
  setShowAddTask(true);
};

  const handleAddTask = async () => {
    if (!title.trim()) {
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
          status: selectedStatus,
          priority,
          assignee: "Guest",
          dueDate: dueDate || undefined,
          labels: labels
            .split(",")
            .map((label) => label.trim())
            .filter(Boolean),
          guestId: guest.guestId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();

      setTasks((previousTasks) => [newTask, ...previousTasks]);

      resetTaskForm();
    } catch (error) {
      console.error("Add Task Error:", error);
    }
  };

  const handleUpdateTask = async () => {
  if (!editingTaskId || !title.trim()) return;

  try {
    const guest = getGuest();

    if (!guest) return;

    const response = await fetch(
      `http://localhost:5000/tasks/${editingTaskId}?guestId=${guest.guestId}`,
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
          labels: labels
            .split(",")
            .map((label) => label.trim())
            .filter(Boolean),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update task");
    }

    const updatedTask = await response.json();

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task._id === editingTaskId ? updatedTask : task
      )
    );

    resetTaskForm();
  } catch (error) {
    console.error("Update Task Error:", error);
  }
};

const resetTaskForm = () => {
  setTitle("");
  setPriority("Medium");
  setDueDate("");
  setLabels("");
  setEditingTaskId(null);
  setShowAddTask(false);
};

  const openEditTask = (taskId: string) => {
  const task = tasks.find((task) => task._id === taskId);

  if (!task) return;

  setEditingTaskId(task._id);
  setSelectedStatus(task.status);
  setTitle(task.title);
  setPriority(task.priority || "Medium");

  setDueDate(
    task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : ""
  );

  setLabels((task.labels || []).join(", "));

  setShowAddTask(true);
};

  const handleDeleteTask = async (taskId: string) => {
  try {
    const guest = getGuest();

    if (!guest) return;

    const response = await fetch(
      `http://localhost:5000/tasks/${taskId}?guestId=${guest.guestId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }

    setTasks((previousTasks) =>
      previousTasks.filter((task) => task._id !== taskId)
    );
  } catch (error) {
    console.error("Delete Task Error:", error);
  }
};

  if (loading) {
    return <p className="text-[13px] text-[#777]">Loading tasks...</p>;
  }


  return (
    <>
      <div className="grid w-full grid-cols-4 items-start gap-3">
        {statuses.map((status) => {
          const columnTasks = tasks.filter(
            (task) => task.status === status
          );

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
            onEditTask={openEditTask}
            onDeleteTask={handleDeleteTask}
            />
          );
        })}
      </div>

      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-[400px] rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#171717]">
                {editingTaskId ? "Edit Task" : "Add Task"}
              </h2>

              <button
                type="button"
                onClick={resetTaskForm}
                className="text-[20px] text-[#777] cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#333]">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="mt-1 h-10 w-full rounded-lg border border-[#dedede] px-3 text-[13px] outline-none focus:border-[#999]"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#333]">
                  Status
                </label>

                <div className="mt-1 flex h-10 items-center rounded-lg border border-[#dedede] bg-[#f8f8f8] px-3 text-[13px]">
                  {selectedStatus}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#333]">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-[#dedede] bg-white px-3 text-[13px] outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#333]">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-[#dedede] px-3 text-[13px] outline-none"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#333]">
                  Labels
                </label>

                <input
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  placeholder="Design, Frontend"
                  className="mt-1 h-10 w-full rounded-lg border border-[#dedede] px-3 text-[13px] outline-none"
                />

                <p className="mt-1 text-[10px] text-[#888]">
                  Separate multiple labels with commas.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetTaskForm}
                className="h-9 rounded-lg border border-[#dedede] px-4 text-[12px] font-medium text-[#333] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={editingTaskId ? handleUpdateTask : handleAddTask}
                className="h-9 cursor-pointer rounded-lg bg-[#171717] px-4 text-[12px] font-medium text-white"
              >
                {editingTaskId ? "Save Changes" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}